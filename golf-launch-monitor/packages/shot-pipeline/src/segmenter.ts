import type {
  BallAddressObservation,
  FrameBufferConfiguration,
  RawSensorObservation,
  SensorHealth,
  TriggerObservation,
} from "@glm/shared-types";
import { TRIGGER_CLUSTER_WINDOW_S } from "./triggers";

/** All observations belonging to one shot, plus the latest context seen before it. */
export type ShotObservationGroup = {
  /** Triggers fused as the impact event (within TRIGGER_CLUSTER_WINDOW_S of the first). */
  readonly triggers: readonly TriggerObservation[];
  /**
   * Later triggers inside the same shot window (e.g. the ball hitting the screen or net).
   * Retained as evidence, excluded from impact-time fusion, never opening a new shot.
   */
  readonly lateTriggers: readonly TriggerObservation[];
  /** Every observation inside the shot's frame-buffer window, in arrival order. */
  readonly observations: readonly RawSensorObservation[];
  /** Latest ball-address observation inside the pre-trigger window, if any. */
  readonly address: BallAddressObservation | null;
  /** Latest sensor health report received before the shot closed, if any. */
  readonly health: SensorHealth | null;
  readonly windowStartS: number;
  readonly windowEndS: number;
};

type OpenShot = {
  triggers: TriggerObservation[];
  lateTriggers: TriggerObservation[];
  observations: RawSensorObservation[];
  firstTriggerS: number;
  windowStartS: number;
  windowEndS: number;
};

/**
 * Groups a time-ordered observation stream into shots. A shot opens on a trigger and collects
 * observations inside [trigger - preTriggerS, trigger + postTriggerS] (the rolling frame
 * buffer, docs/sensor-specification.md). Triggers within TRIGGER_CLUSTER_WINDOW_S of the first
 * one are fused as the same impact; later triggers inside the window are kept as lateTriggers
 * and never open a new shot. A shot closes when an observation arrives after its window, or on
 * flush().
 */
export class ShotSegmenter {
  private readonly buffer: RawSensorObservation[] = [];
  private open: OpenShot | null = null;
  private latestHealth: SensorHealth | null = null;

  constructor(private readonly frameBuffer: FrameBufferConfiguration) {
    if (!(frameBuffer.preTriggerS >= 0) || !(frameBuffer.postTriggerS > 0)) {
      throw new Error("ShotSegmenter: frame buffer windows must be non-negative (post-trigger > 0).");
    }
  }

  /** Adds one observation; returns any shots that this observation closed. */
  push(observation: RawSensorObservation): ShotObservationGroup[] {
    const closed: ShotObservationGroup[] = [];
    if (observation.kind === "health") this.latestHealth = observation.health;

    if (this.open && observation.timestampS > this.open.windowEndS) {
      closed.push(this.close(this.open));
      this.open = null;
    }

    if (observation.kind === "trigger") {
      if (this.open && observation.timestampS - this.open.firstTriggerS <= TRIGGER_CLUSTER_WINDOW_S) {
        this.open.triggers.push(observation);
        this.open.observations.push(observation);
        return closed;
      }
      if (this.open) {
        // Still inside this shot's post-trigger window: a secondary event of the same shot
        // (screen/net impact), not a new swing. Keep it as evidence only.
        this.open.lateTriggers.push(observation);
        this.open.observations.push(observation);
        return closed;
      }
      const windowStartS = observation.timestampS - this.frameBuffer.preTriggerS;
      const pre = this.buffer.filter((o) => o.timestampS >= windowStartS);
      this.open = {
        triggers: [observation],
        lateTriggers: [],
        observations: [...pre, observation],
        firstTriggerS: observation.timestampS,
        windowStartS,
        windowEndS: observation.timestampS + this.frameBuffer.postTriggerS,
      };
      this.buffer.length = 0;
      return closed;
    }

    if (this.open) {
      this.open.observations.push(observation);
    } else {
      this.buffer.push(observation);
      // Keep the pre-trigger ring bounded to the configured window.
      const cutoff = observation.timestampS - this.frameBuffer.preTriggerS;
      while (this.buffer.length > 0 && (this.buffer[0] as RawSensorObservation).timestampS < cutoff) {
        this.buffer.shift();
      }
    }
    return closed;
  }

  /** Closes and returns the open shot, if any (call when capture stops). */
  flush(): ShotObservationGroup[] {
    if (!this.open) return [];
    const group = this.close(this.open);
    this.open = null;
    return [group];
  }

  private close(shot: OpenShot): ShotObservationGroup {
    let address: BallAddressObservation | null = null;
    for (const o of shot.observations) {
      if (o.kind === "ball-address" && o.timestampS <= shot.firstTriggerS) {
        if (!address || o.timestampS >= address.timestampS) address = o;
      }
      if (o.kind === "health") this.latestHealth = o.health;
    }
    return {
      triggers: shot.triggers,
      lateTriggers: shot.lateTriggers,
      observations: shot.observations,
      address,
      health: this.latestHealth,
      windowStartS: shot.windowStartS,
      windowEndS: shot.windowEndS,
    };
  }
}
