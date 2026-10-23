import { DATA_ORIGIN_BANNERS, METRIC_DEFINITIONS, presentShotMetrics, validityBanner } from "@glm/presentation";
import type { ShotRecord } from "@glm/shared-types";
import { IMPERIAL_GOLF_UNITS, METRIC_UNITS } from "@glm/units";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { ShotView } from "../src/components/ShotView";
import { manualRecord, measuredClaims, replayRecord, syntheticRecord } from "./helpers";

const replayText = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../datasets/synthetic/range-fixtures.jsonl"), "utf8");

let clean: ShotRecord;
let noSpin: ShotRecord;
let estimated: ShotRecord;

beforeAll(async () => {
  [clean, noSpin, estimated] = await Promise.all([
    syntheticRecord("standard-7-iron", "clean", 11),
    syntheticRecord("straight-driver", "no-spin-observed", 12),
    // Spin not observed + a club selected => club-model ESTIMATED spin with a wide interval.
    syntheticRecord("straight-driver", "no-spin-observed", 13, { clubCategory: "driver" }),
  ]);
});

function renderShot(record: ShotRecord, units = IMPERIAL_GOLF_UNITS) {
  return render(<ShotView record={record} unitSystem={units} precision="golfer" shotNumber={1} />);
}

const tileText = (id: string): string => screen.getByTestId(`metric-${id}`).textContent ?? "";

describe("shot card honesty rules", () => {
  it("a synthetic record shows the SYNTHETIC banner and never a MEASURED badge", () => {
    expect(clean.dataOrigin).toBe("synthetic");
    const { container } = renderShot(clean);
    expect(screen.getByText(DATA_ORIGIN_BANNERS.synthetic as string)).toBeInTheDocument();
    expect(screen.getByText("SYNTHETIC DATA — generated for testing, not measured.")).toBeInTheDocument();
    expect(screen.queryByText("MEASURED")).not.toBeInTheDocument();
    expect(container.querySelector(".badge-measured")).toBeNull();
    // Launch values carry SYNTHETIC; calculated flight values carry CALCULATED + SYNTHETIC.
    const speedTile = screen.getByTestId("metric-ballSpeed").closest("button")!;
    expect(within(speedTile).getByText("SYNTHETIC")).toBeInTheDocument();
    const carryTile = screen.getByTestId("metric-carry").closest("button")!;
    expect(within(carryTile).getByText("CALCULATED")).toBeInTheDocument();
    expect(within(carryTile).getByText("SYNTHETIC")).toBeInTheDocument();
    // Card structure: every listed metric is present, with display units.
    for (const id of ["ballSpeed", "verticalLaunch", "horizontalLaunch", "totalSpin", "spinAxis", "carry", "total", "apexHeight",
      "descentAngle", "carryLateral", "totalLateral", "curve", "bounceDistance", "rollDistance"]) {
      expect(screen.getByTestId(`metric-${id}`)).toBeInTheDocument();
    }
    expect(tileText("ballSpeed")).toMatch(/mph$/);
    expect(tileText("carry")).toMatch(/ yd$/);
    expect(tileText("apexHeight")).toMatch(/ ft$/);
    expect(tileText("totalSpin")).toMatch(/rpm$/);
    // Launch-data confidence and flight-model confidence are shown separately: a high launch
    // score must never read as confidence in the provisional carry/total models.
    expect(screen.getByText(/Launch data: High · \d+%/)).toBeInTheDocument();
    const flight = screen.getByText(/Flight model: \w+ · (\d+)%/);
    const flightPct = Number(/(\d+)%/.exec(flight.textContent ?? "")?.[1]);
    expect(flightPct).toBeLessThanOrEqual(Math.round(clean.result!.physics ? clean.result!.simulationConfidence * 100 : 0));
    expect(flightPct).toBeLessThan(90);
    expect(screen.getByText("Validity: valid")).toBeInTheDocument();
    expect(screen.getByText("Straight (right-handed)")).toBeInTheDocument();
  });

  it("metric units follow the unit system", () => {
    renderShot(clean, METRIC_UNITS);
    expect(tileText("carry")).toMatch(/ m$/);
    expect(tileText("ballSpeed")).toMatch(/km\/h$/);
  });

  it("unavailable spin shows — for spin and axis and the skipped-simulation reason instead of carry; no 0 placeholders", () => {
    expect(noSpin.result).toBeNull();
    renderShot(noSpin);
    expect(tileText("totalSpin")).toBe("—");
    expect(tileText("spinAxis")).toBe("—");
    for (const id of ["totalSpin", "spinAxis"]) {
      const tile = screen.getByTestId(`metric-${id}`).closest("button")!;
      expect(within(tile).getByText("UNAVAILABLE")).toBeInTheDocument();
    }
    // No carry/total/flight tiles at all; the pipeline's reason is shown verbatim.
    for (const id of ["carry", "total", "apexHeight", "descentAngle", "carryLateral", "totalLateral", "curve", "bounceDistance", "rollDistance"]) {
      expect(screen.queryByTestId(`metric-${id}`)).not.toBeInTheDocument();
    }
    expect(screen.getAllByText(noSpin.simulationSkippedReason as string, { exact: false }).length).toBeGreaterThan(0);
    // Nothing renders a zero stand-in for a missing value.
    for (const el of screen.getAllByTestId(/^metric-/)) {
      expect(el.textContent).not.toMatch(/^0( |$)/);
      expect(el.textContent).not.toMatch(/^0 (yd|rpm|ft)/);
    }
    expect(screen.queryByText(/^0 yd$/)).not.toBeInTheDocument();
    // Ball speed is still a real (synthetic) value: unavailable spin does not erase it.
    expect(tileText("ballSpeed")).toMatch(/^\d+\.\d mph$/);
    expect(screen.getByText("Shape unknown (spin axis unavailable)")).toBeInTheDocument();
  });

  it("estimated spin shows ESTIMATED badges and the provisional banner text verbatim", () => {
    expect(estimated.launch.spinMode).toBe("estimated");
    expect(estimated.launch.validity).toBe("provisional");
    renderShot(estimated);
    const banner = validityBanner(estimated.launch);
    expect(screen.getByText(banner.title)).toBeInTheDocument();
    expect(banner.title).toMatch(/^Provisional shot/);
    for (const message of banner.messages) expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText("Spin estimated from club model; shot-shape accuracy reduced.")).toBeInTheDocument();
    const spinTile = screen.getByTestId("metric-totalSpin").closest("button")!;
    expect(within(spinTile).getByText("ESTIMATED")).toBeInTheDocument();
    // Calculated values that depend on the estimate say so.
    const carryTile = screen.getByTestId("metric-carry").closest("button")!;
    expect(within(carryTile).getByText("CALCULATED")).toBeInTheDocument();
    expect(within(carryTile).getByText("ESTIMATED")).toBeInTheDocument();
    expect(screen.queryByText("MEASURED")).not.toBeInTheDocument();
    expect(screen.getByText("Validity: provisional")).toBeInTheDocument();
  });

  it("a wide carry interval renders as a range, not a single number", () => {
    const carry = presentShotMetrics(estimated.result!.metrics, IMPERIAL_GOLF_UNITS, "golfer", estimated.dataOrigin).carry!;
    expect(carry.rangeText).not.toBeNull();
    renderShot(estimated);
    const text = tileText("carry");
    expect(text).toBe(carry.rangeText);
    expect(text).toMatch(/^\d+–\d+ yd$/);
    const [lo, hi] = text.replace(" yd", "").split("–").map(Number);
    expect(hi!).toBeGreaterThan(lo!);
    expect(screen.getAllByText("90% range").length).toBeGreaterThan(0);
  });

  it("clicking a metric opens the detail panel with definition, dependencies and limitations", () => {
    renderShot(estimated);
    fireEvent.click(screen.getByTestId("metric-carry").closest("button")!);
    const panel = screen.getByRole("dialog", { name: "Carry" });
    const def = METRIC_DEFINITIONS.carry;
    expect(within(panel).getByText(def.definition)).toBeInTheDocument();
    for (const dep of def.dependsOn) expect(within(panel).getByText(dep)).toBeInTheDocument();
    for (const limitation of def.limitations) expect(within(panel).getByText(limitation)).toBeInTheDocument();
    expect(within(panel).getByText(/^Calculated; depends on .*estimated spin/)).toBeInTheDocument();
    expect(within(panel).getByText(/Monte Carlo, n=12/)).toBeInTheDocument();
    expect(within(panel).getByText(/Shown in yd/)).toBeInTheDocument();
    // Point value is still available in the panel next to the range.
    expect(within(panel).getByText(/^model value \d+ yd$/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("the detail panel explains an unavailable launch value", () => {
    renderShot(noSpin);
    fireEvent.click(screen.getByTestId("metric-totalSpin").closest("button")!);
    const panel = screen.getByRole("dialog", { name: "Spin rate" });
    expect(within(panel).getByText(METRIC_DEFINITIONS.totalSpin.definition)).toBeInTheDocument();
    expect(within(panel).getByText("Unavailable; not measured or estimated for this shot")).toBeInTheDocument();
    fireEvent.click(within(panel).getByRole("button", { name: "Close metric details" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("the tracer draws carry, bounce/roll, landing/rest markers and the Monte Carlo band", () => {
    const { container } = renderShot(clean);
    expect(container.querySelector(".trace-carry")).not.toBeNull();
    if (clean.result!.groundMotion.samples.some((s) => s.phase !== "air")) {
      expect(container.querySelectorAll(".trace-bounce, .trace-roll").length).toBeGreaterThan(0);
    }
    expect(container.querySelectorAll(".marker-landing")).toHaveLength(2);
    expect(container.querySelectorAll(".marker-rest")).toHaveLength(2);
    expect(container.querySelector(".mc-band")).not.toBeNull();
    expect(screen.getAllByText("Downrange (yd)")).toHaveLength(2);
    expect(screen.getByText("Height (ft)")).toBeInTheDocument();
    expect(screen.getByText("Left / right (yd)")).toBeInTheDocument();
  });

  it("the tracer explains why there is no trajectory when simulation was skipped", () => {
    const { container } = renderShot(noSpin);
    expect(container.querySelector(".trace-carry")).toBeNull();
    expect(screen.getByText(/No trajectory to draw/)).toBeInTheDocument();
  });
});

describe("no synthetic, replayed, manual or estimated value is ever called measured", () => {
  let manual: ShotRecord;
  let replay: ShotRecord;
  beforeAll(async () => {
    [manual, replay] = await Promise.all([manualRecord(), replayRecord(replayText)]);
  });

  /** Header pills/meta and the whole card text, with honest negations ("not measured") allowed. */
  function expectNoMeasuredClaims(container: HTMLElement) {
    for (const el of container.querySelectorAll(".pill, .shot-status, .shot-meta, .tile")) {
      expect(measuredClaims(el.textContent ?? "")).toEqual([]);
    }
    expect(measuredClaims(container.textContent ?? "")).toEqual([]);
    expect(container.querySelector(".badge-measured")).toBeNull();
  }

  it("the scanner itself catches lowercase and badge wording but allows disclaimers", () => {
    expect(measuredClaims("Spin: measured")).toHaveLength(1);
    expect(measuredClaims("MEASURED")).toHaveLength(1);
    expect(measuredClaims("Synthetic, generated for testing; not measured")).toEqual([]);
    expect(measuredClaims("never measured; unmeasured")).toEqual([]);
  });

  it("synthetic, estimated and no-spin cards state the spin provenance badge, not the raw spin mode", () => {
    // The pipeline's SpinMode for a synthetic stream's own spin observation is "measured".
    expect(clean.launch.spinMode).toBe("measured");
    const cases: readonly (readonly [ShotRecord, string])[] = [
      [clean, "SYNTHETIC"],
      [estimated, "ESTIMATED"],
      [noSpin, "UNAVAILABLE"],
    ];
    for (const [record, badge] of cases) {
      const { container, unmount } = renderShot(record);
      const pill = container.querySelector(".pill-spin");
      expect(pill?.textContent).toBe(`Spin source: ${badge}`);
      expect(pill?.getAttribute("title")).toMatch(/not measured|^Unavailable/);
      expectNoMeasuredClaims(container);
      unmount();
    }
  });

  it("a developer manual shot is MANUAL everywhere, including typed spin and axis", () => {
    expect(manual.dataOrigin).toBe("manual");
    const { container } = renderShot(manual);
    expect(screen.getByText(DATA_ORIGIN_BANNERS.manual as string)).toBeInTheDocument();
    expect(screen.queryByText(DATA_ORIGIN_BANNERS.synthetic as string)).not.toBeInTheDocument();
    for (const id of ["ballSpeed", "verticalLaunch", "horizontalLaunch", "totalSpin", "spinAxis"]) {
      const tile = screen.getByTestId(`metric-${id}`).closest("button")!;
      expect(within(tile).getByText("MANUAL")).toBeInTheDocument();
      expect(within(tile).queryByText("SYNTHETIC")).not.toBeInTheDocument();
    }
    expect(container.querySelector(".pill-spin")?.textContent).toBe("Spin source: MANUAL");
    expect(screen.queryByText(/relabelled as synthetic/)).not.toBeInTheDocument();
    expectNoMeasuredClaims(container);
  });

  it("a replayed synthetic recording keeps its SYNTHETIC origin and says where player and club came from", () => {
    expect(replay.dataOrigin).toBe("synthetic");
    const note = "player, handedness and club from current Setup, not from the replay file";
    const { container } = render(
      <ShotView record={replay} unitSystem={IMPERIAL_GOLF_UNITS} precision="golfer" shotNumber={1} attributionNote={note} />,
    );
    expect(screen.getByText(DATA_ORIGIN_BANNERS.synthetic as string)).toBeInTheDocument();
    expect(screen.getByText(`(${note})`)).toBeInTheDocument();
    expect(container.querySelector(".pill-spin")?.textContent).toBe("Spin source: SYNTHETIC");
    expectNoMeasuredClaims(container);
  });

  it("a range keeps its text but may only wrap after the en dash", () => {
    renderShot(estimated);
    const value = screen.getByTestId("metric-carry");
    const parts = [...value.querySelectorAll(".value-part")].map((p) => p.textContent);
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/–$/);
    expect(parts.join("")).toBe(value.textContent);
    expect(value.querySelectorAll("wbr")).toHaveLength(1);
  });
});
