import type { BallAddressObservation, HealthObservation, RawSensorObservation, TriggerObservation } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import { fuseTriggers, ShotSegmenter, TRIGGER_AGREEMENT_TOLERANCE_S, TRIGGER_CLUSTER_WINDOW_S } from "../src/index";

let seq = 0;
const trigger = (t: number, source: TriggerObservation["triggerSource"] = "microphone", confidence = 0.9): TriggerObservation => ({
  kind: "trigger",
  sensorId: "s",
  sequence: seq++,
  timestampS: t,
  triggerSource: source,
  confidence,
});
const ball = (t: number): RawSensorObservation => ({
  kind: "ball-position-3d",
  sensorId: "s",
  sequence: seq++,
  timestampS: t,
  frameIndex: seq,
  positionM: { x: t, y: 0, z: 0 },
  covarianceM2: [
    [1e-6, 0, 0],
    [0, 1e-6, 0],
    [0, 0, 1e-6],
  ],
  reprojectionErrorPx: null,
  detectionConfidence: 1,
  cameraIds: [],
});
const address = (t: number): BallAddressObservation => ({
  kind: "ball-address",
  sensorId: "s",
  sequence: seq++,
  timestampS: t,
  positionM: { x: 0, y: 0, z: 0 },
  stationary: true,
  inHittingZone: true,
  ballCount: 1,
  confidence: 1,
});
const health = (t: number, status: HealthObservation["health"]["status"]): HealthObservation => ({
  kind: "health",
  sensorId: "s",
  sequence: seq++,
  timestampS: t,
  health: {
    sensorId: "s",
    status,
    checkedUtc: `2026-01-01T00:00:${String(Math.round(t)).padStart(2, "0")}.000Z`,
    metrics: [],
    messages: [],
    calibrationStatus: "green",
  },
});
const frameBuffer = { preTriggerS: 0.25, postTriggerS: 0.5 };

function feed(observations: readonly RawSensorObservation[]) {
  const seg = new ShotSegmenter(frameBuffer);
  const groups = observations.flatMap((o) => seg.push(o));
  return [...groups, ...seg.flush()];
}

describe("fuseTriggers", () => {
  it("returns null without triggers", () => {
    expect(fuseTriggers([])).toBeNull();
  });

  it("subtracts known per-source latency and combines confidence as independent evidence", () => {
    const fused = fuseTriggers([trigger(1.0058, "microphone", 0.8), trigger(1.0, "beam-break", 0.9)], { microphone: 0.0058 });
    expect(fused!.timeS).toBeCloseTo(1.0, 9);
    expect(fused!.spreadS).toBeCloseTo(0, 9);
    expect(fused!.confidence).toBeCloseTo(1 - 0.2 * 0.1, 12);
    expect(fused!.warnings).toEqual([]);
    expect(fused!.sources).toEqual(["microphone", "beam-break"]);
  });

  it("halves confidence and warns when sources disagree beyond tolerance", () => {
    const fused = fuseTriggers([trigger(2.0, "microphone", 0.9), trigger(2.0 + 2 * TRIGGER_AGREEMENT_TOLERANCE_S, "ball-motion", 0.9)]);
    expect(fused!.confidence).toBeCloseTo(0.5 * (1 - 0.01), 12);
    expect(fused!.warnings.join(" ")).toMatch(/disagree by 6\.0 ms/);
  });

  it("uses the median so one bad source cannot drag the impact time", () => {
    const fused = fuseTriggers([trigger(3.0), trigger(3.0005), trigger(3.009)]);
    expect(fused!.timeS).toBeCloseTo(3.0005, 9);
  });
});

describe("ShotSegmenter", () => {
  it("collects the pre-trigger address and post-trigger frames into one shot", () => {
    const groups = feed([address(0.9), trigger(1.0), ball(1.001), ball(1.002), ball(1.6)]);
    expect(groups).toHaveLength(1);
    const g = groups[0]!;
    expect(g.address?.timestampS).toBe(0.9);
    expect(g.observations.filter((o) => o.kind === "ball-position-3d")).toHaveLength(2); // 1.6 s is outside the 0.5 s window
    expect(g.windowStartS).toBeCloseTo(0.75, 12);
    expect(g.windowEndS).toBeCloseTo(1.5, 12);
  });

  it("drops pre-trigger observations older than the frame buffer", () => {
    const [g] = feed([address(0.5), trigger(1.0), ball(1.001)]);
    expect(g!.address).toBeNull();
  });

  it("fuses triggers inside the cluster window as one impact", () => {
    const [g] = feed([trigger(1.0, "microphone"), trigger(1.0 + TRIGGER_CLUSTER_WINDOW_S / 2, "beam-break"), ball(1.002)]);
    expect(g!.triggers).toHaveLength(2);
    expect(g!.lateTriggers).toHaveLength(0);
  });

  it("regression: a screen-impact trigger 40 ms later neither shifts the impact time nor opens a phantom shot", () => {
    const groups = feed([trigger(1.0, "microphone"), ball(1.001), ball(1.002), trigger(1.04, "microphone"), ball(1.003)]);
    expect(groups).toHaveLength(1);
    const g = groups[0]!;
    expect(g.triggers.map((t) => t.timestampS)).toEqual([1.0]);
    expect(g.lateTriggers.map((t) => t.timestampS)).toEqual([1.04]);
    expect(fuseTriggers(g.triggers)!.timeS).toBe(1.0);
  });

  it("a trigger after the shot window opens the next shot", () => {
    const groups = feed([trigger(1.0), ball(1.001), trigger(6.0), ball(6.001)]);
    expect(groups).toHaveLength(2);
    expect(groups[1]!.triggers[0]!.timestampS).toBe(6.0);
  });

  it("regression: each shot gets the health report that precedes it, never the next shot's (streaming and flush agree)", () => {
    // A device emits health before every shot (docs/sensor-specification.md section 4); here
    // only the report before shot 2 is failed. It arrives after shot 1's window has ended.
    const stream = [
      health(0.5, "ok"),
      trigger(1.0),
      ball(1.001),
      ball(1.002),
      health(5.5, "failed"),
      trigger(6.0),
      ball(6.001),
      ball(6.002),
    ];
    // Streaming: one segmenter, shot 1 closed by the arrival of the 5.5 s report.
    const streamed = feed(stream);
    // Step/flush mode (UI replay-next-shot): flush after each shot's observations.
    const seg = new ShotSegmenter(frameBuffer);
    const stepped = [
      ...stream.slice(0, 4).flatMap((o) => seg.push(o)),
      ...seg.flush(),
      ...stream.slice(4).flatMap((o) => seg.push(o)),
      ...seg.flush(),
    ];
    for (const groups of [streamed, stepped]) {
      expect(groups).toHaveLength(2);
      expect(groups[0]!.health?.status).toBe("ok");
      expect(groups[0]!.health?.checkedUtc).toBe("2026-01-01T00:00:01.000Z");
      expect(groups[1]!.health?.status).toBe("failed");
    }
  });

  it("a health report inside the shot window applies to that shot", () => {
    const [g] = feed([health(0.5, "ok"), trigger(1.0), ball(1.001), health(1.2, "degraded"), ball(1.3)]);
    expect(g!.health?.status).toBe("degraded");
  });

  it("rejects invalid frame-buffer windows", () => {
    expect(() => new ShotSegmenter({ preTriggerS: -1, postTriggerS: 0.5 })).toThrow();
    expect(() => new ShotSegmenter({ preTriggerS: 0.25, postTriggerS: 0 })).toThrow();
  });
});
