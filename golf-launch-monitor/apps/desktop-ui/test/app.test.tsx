import { HardwareNotAvailableError, SENSOR_SPECIFICATION_DOC } from "@glm/sensor-adapters";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/App";
import { SAFETY_CHECKLIST } from "../src/screens/SafetyScreen";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "../src/state/settings";
import { measuredClaims, memoryStorage, TEST_MC_SAMPLES, testRuntime } from "./helpers";

const runtimes: ReturnType<typeof testRuntime>[] = [];

function renderApp(storedSettings: Record<string, unknown> | null = null) {
  const storage = memoryStorage(
    storedSettings === null ? {} : { [SETTINGS_STORAGE_KEY]: JSON.stringify({ ...DEFAULT_SETTINGS, ...storedSettings }) },
  );
  const runtime = testRuntime({ settingsStorage: storage });
  runtimes.push(runtime);
  render(<App runtime={runtime} />);
  return { runtime, storage };
}

const acknowledged = { safetyAcknowledgedUtc: "2026-10-01T12:00:00.000Z", monteCarloSamples: TEST_MC_SAMPLES };

/**
 * Visible text of the Shot review screen, without the raw JSON record (enum values verbatim) and
 * without the estimator's verbatim factor details, which must each carry an origin note instead.
 */
function reviewText(): string {
  const screenEl = screen.getByRole("heading", { level: 1, name: "Shot review" }).closest(".screen")!.cloneNode(true) as HTMLElement;
  for (const json of screenEl.querySelectorAll(".json-view")) json.remove();
  for (const detail of screenEl.querySelectorAll(".factor-detail")) {
    if (/\bmeasured\b/i.test(detail.textContent ?? "")) {
      expect(detail.parentElement!.querySelector(".factor-note")?.textContent).toMatch(/not measured by a sensor/);
    }
    detail.remove();
  }
  return screenEl.textContent ?? "";
}

function nav(name: string) {
  fireEvent.click(within(screen.getByRole("navigation", { name: "Main" })).getByRole("button", { name: new RegExp(`^${name}`) }));
}

afterEach(() => {
  for (const r of runtimes.splice(0)) r.runner.dispose();
});

describe("safety gate", () => {
  it("blocks the range screen until the checklist is acknowledged, then unlocks it and stores the acknowledgement", async () => {
    const { storage } = renderApp();
    // First run opens on the safety screen.
    expect(screen.getByRole("heading", { level: 1, name: "Safety" })).toBeInTheDocument();
    expect(screen.getByText(/not for betting, certified competition/i)).toBeInTheDocument();

    nav("Range");
    expect(screen.getByText("Range locked: safety checklist not acknowledged")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hit synthetic shot" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open the safety checklist" }));
    const ack = screen.getByRole("button", { name: /acknowledge/ });
    expect(ack).toBeDisabled();
    for (const item of SAFETY_CHECKLIST) fireEvent.click(screen.getByLabelText(item.text));
    expect(ack).toBeEnabled();
    fireEvent.click(ack);

    // Acknowledging goes straight to the unlocked range.
    expect(screen.getByRole("button", { name: "Hit synthetic shot" })).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(storage.data.get(SETTINGS_STORAGE_KEY) ?? "{}") as { safetyAcknowledgedUtc?: string | null };
      expect(typeof saved.safetyAcknowledgedUtc).toBe("string");
    });
    // The safety screen stays reachable from the nav.
    nav("Safety");
    expect(screen.getByText(/^Acknowledged on/)).toBeInTheDocument();
  });

  it("remembers an earlier acknowledgement and opens on the range", () => {
    renderApp(acknowledged);
    expect(screen.getByRole("button", { name: "Hit synthetic shot" })).toBeInTheDocument();
  });

  it("renders with defaults when local storage is unavailable or throws", () => {
    const throwing = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    const runtime = testRuntime({ settingsStorage: throwing });
    runtimes.push(runtime);
    render(<App runtime={runtime} />);
    expect(screen.getByRole("heading", { level: 1, name: "Safety" })).toBeInTheDocument();
  });
});

describe("setup screen data sources", () => {
  it("lists camera, radar and hybrid as disabled with the honest no-driver message", async () => {
    renderApp(acknowledged);
    nav("Setup");
    for (const [id, label] of [
      ["camera", "Camera launch monitor"],
      ["radar", "Radar launch monitor"],
      ["hybrid", "Camera + radar (hybrid)"],
    ] as const) {
      const radio = screen.getByRole("radio", { name: new RegExp(`^${label.replace(/[+()]/g, "\\$&")}`) });
      expect(radio).toBeDisabled();
      await waitFor(() => expect(screen.getByTestId(`hardware-message-${id}`).textContent).toMatch(/no .* driver is implemented yet/));
    }
    const camera = screen.getByTestId("hardware-message-camera").textContent ?? "";
    expect(camera).toBe(new HardwareNotAvailableError("camera", "camera launch monitor", "connect()").message);
    expect(camera).toContain(SENSOR_SPECIFICATION_DOC);
    expect(screen.getAllByText(/No hardware driver exists yet \(Phase 1\)/)).toHaveLength(3);
    // Synthetic is the default and selectable; manual needs developer mode.
    expect(screen.getByRole("radio", { name: /^Synthetic/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /^Manual entry/ })).toBeDisabled();
    expect(screen.getByText(/Turn on developer mode in Settings/)).toBeInTheDocument();
  });

  it("shows the derived air density and which environment fields are defaults", () => {
    renderApp(acknowledged);
    nav("Setup");
    expect(screen.getByTestId("air-density").textContent).toMatch(/^1\.\d{3} kg\/m³$/);
    expect(screen.getAllByText("DEFAULT — not entered").length).toBeGreaterThanOrEqual(4);
    fireEvent.change(screen.getByLabelText("Temperature"), { target: { value: "50" } });
    // 50 °F entered: temperature is now user-entered and density changes.
    expect(screen.getByText("entered")).toBeInTheDocument();
    // Wind fields only appear outdoors.
    expect(screen.queryByLabelText("Wind speed")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Indoor (no wind)"));
    expect(screen.getByLabelText("Wind speed")).toBeInTheDocument();
  });

  it("blocks shots and explains an invalid environment", () => {
    renderApp(acknowledged);
    nav("Setup");
    fireEvent.change(screen.getByLabelText("Temperature"), { target: { value: "500" } });
    expect(screen.getByText(/Invalid environment — shots are blocked/)).toBeInTheDocument();
    nav("Range");
    expect(screen.getByRole("button", { name: "Hit synthetic shot" })).toBeDisabled();
  });
});

describe("range workflow (in-process runner, real pipeline)", () => {
  it("hits a synthetic shot, shows the card, advances the seed and saves the shot locally", async () => {
    const { runtime } = renderApp(acknowledged);
    expect(screen.getByLabelText("Seed (auto-increments)")).toHaveValue(1);
    fireEvent.change(screen.getByLabelText("Fixture"), { target: { value: "standard-7-iron" } });
    fireEvent.click(screen.getByRole("button", { name: "Hit synthetic shot" }));
    await waitFor(() => expect(screen.getByTestId("metric-carry")).toBeInTheDocument(), { timeout: 20000 });
    expect(screen.getByLabelText("Seed (auto-increments)")).toHaveValue(2);
    expect(screen.getAllByText("SYNTHETIC DATA — generated for testing, not measured.").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("MEASURED")).not.toBeInTheDocument();
    await waitFor(async () => expect(await runtime.repository.listShots()).toHaveLength(1));
    const sessions = await runtime.repository.listSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]!.dataOrigin).toBe("synthetic");

    // Shot review shows versions, fit diagnostics, factors and the consent-aware raw count.
    fireEvent.click(screen.getByRole("button", { name: "Open full shot review" }));
    expect(screen.getByRole("heading", { level: 1, name: "Shot review" })).toBeInTheDocument();
    expect(screen.getByTestId("raw-observations").textContent).toBe("not retained (diagnostic consent is off)");
    expect(screen.getByText("glm-world-1.0")).toBeInTheDocument();
    expect(screen.getByText(/Confidence factors — overall/)).toBeInTheDocument();
    expect(screen.getByText("Inliers")).toBeInTheDocument();
    expect(screen.getByText("Full shot record (JSON)")).toBeInTheDocument();
    // The review states spin provenance (never the raw spin mode "measured").
    expect(screen.getByTestId("review-spin-source").textContent).toBe("SYNTHETIC");
    expect(measuredClaims(reviewText())).toEqual([]);

    // History lists it and exports CSV/JSON through the injected download.
    nav("Session history");
    expect(screen.getByRole("columnheader", { name: /Carry/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    fireEvent.click(screen.getByRole("button", { name: "Export JSON" }));
    const download = runtime.download as unknown as { mock: { calls: [string, string, string][] } };
    expect(download.mock.calls).toHaveLength(2);
    const [csvName, csv, csvType] = download.mock.calls[0]!;
    expect(csvName).toMatch(/\.csv$/);
    expect(csvType).toBe("text/csv");
    expect(csv.split("\r\n")[0]).toContain("carry_yd");
    const [, json] = download.mock.calls[1]!;
    expect(JSON.parse(json).records).toHaveLength(1);
  });

  it("shows the skipped reason for a no-spin shot and never a carry number", async () => {
    renderApp({ ...acknowledged, noisePreset: "no-spin-observed", fixtureId: "straight-driver" });
    fireEvent.click(screen.getByRole("button", { name: "Hit synthetic shot" }));
    await waitFor(() => expect(screen.getByText(/No carry, total or flight numbers/)).toBeInTheDocument(), { timeout: 20000 });
    expect(screen.queryByTestId("metric-carry")).not.toBeInTheDocument();
    expect(screen.getByTestId("metric-totalSpin").textContent).toBe("—");
  });
});

describe("settings, players and equipment", () => {
  it("developer mode enables manual entry (MANUAL everywhere); turning it off starts a new synthetic session", async () => {
    const { runtime } = renderApp(acknowledged);
    nav("Settings");
    fireEvent.click(screen.getByLabelText("Developer mode"));
    nav("Setup");
    const manual = screen.getByRole("radio", { name: /^Manual entry/ });
    expect(manual).toBeEnabled();
    fireEvent.click(manual);
    nav("Range");
    expect(screen.getByText("MANUAL DATA — developer manual entry, not measured by a sensor.")).toBeInTheDocument();
    const typed: readonly [string, string][] = [
      ["Ball speed (mph)", "150"],
      ["Launch angle (° up)", "12"],
      ["Launch direction (°, + = LEFT of target)", "-3"],
      ["Total spin (rpm, blank = not provided)", "2500"],
      ["Spin axis (°, + = curves RIGHT, blank = not provided)", "4"],
    ];
    for (const [label, value] of typed) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Submit manual launch" }));
    await waitFor(() => expect(screen.getByTestId("metric-carry")).toBeInTheDocument(), { timeout: 20000 });
    for (const id of ["ballSpeed", "totalSpin", "spinAxis"]) {
      expect(within(screen.getByTestId(`metric-${id}`).closest("button")!).getByText("MANUAL")).toBeInTheDocument();
    }
    expect(screen.getByText("Spin source: MANUAL")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open full shot review" }));
    expect(screen.getByTestId("review-spin-source").textContent).toBe("MANUAL");
    expect(measuredClaims(reviewText())).toEqual([]);
    await waitFor(async () => expect(await runtime.repository.listShots()).toHaveLength(1));

    // Developer mode off: back to synthetic in a NEW session, so no session mixes streams.
    nav("Settings");
    fireEvent.click(screen.getByLabelText("Developer mode"));
    nav("Range");
    expect(screen.getByText("No shot yet")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hit synthetic shot" }));
    await waitFor(() => expect(screen.getByTestId("metric-carry")).toBeInTheDocument(), { timeout: 20000 });
    nav("Session history");
    expect(screen.getByRole("option", { name: "Current session (1 shots)" })).toBeInTheDocument();
    expect(screen.queryByText("MANUAL DATA — developer manual entry, not measured by a sensor.")).not.toBeInTheDocument();
    await waitFor(async () => expect(await runtime.repository.listSessions()).toHaveLength(2));
    const sessions = await runtime.repository.listSessions();
    expect(sessions.map((x) => x.dataOrigin).sort()).toEqual(["manual", "synthetic"]);
    for (const session of sessions) {
      const shots = await runtime.repository.listShots({ sessionId: session.id });
      expect(shots).toHaveLength(1);
      expect(shots[0]!.dataOrigin).toBe(session.dataOrigin);
    }
  });

  it("the Monte Carlo field commits on blur, and clearing it never sends 0", () => {
    renderApp(acknowledged);
    nav("Settings");
    const field = screen.getByLabelText("Monte Carlo samples");
    fireEvent.change(field, { target: { value: "" } });
    nav("Range");
    expect(screen.getByText(`${TEST_MC_SAMPLES} samples`)).toBeInTheDocument();
    nav("Settings");
    const again = screen.getByLabelText("Monte Carlo samples");
    fireEvent.change(again, { target: { value: "" } });
    fireEvent.blur(again);
    expect(again).toHaveValue(TEST_MC_SAMPLES);
    fireEvent.change(again, { target: { value: "40" } });
    fireEvent.keyDown(again, { key: "Enter" });
    nav("Range");
    expect(screen.getByText("40 samples")).toBeInTheDocument();
  });

  it("generic spin fallback and raw-observation consent default OFF with explanations", () => {
    renderApp(acknowledged);
    nav("Settings");
    expect(screen.getByLabelText("Allow generic spin fallback")).not.toBeChecked();
    expect(screen.getByLabelText("Retain raw observations (diagnostic consent)")).not.toBeChecked();
    expect(screen.getByLabelText("Allow provisional shots in casual scoring")).not.toBeChecked();
    expect(screen.getByText(/no effect yet: course play and scoring arrive in Phase 5/)).toBeInTheDocument();
    expect(screen.getByLabelText("Monte Carlo samples")).toHaveValue(TEST_MC_SAMPLES);
    expect(screen.getByText(/badged ASSUMED/)).toBeInTheDocument();
  });

  it("adds, edits and deletes a player (with the option to delete their shots)", async () => {
    const { runtime } = renderApp(acknowledged);
    nav("Players");
    const add = screen.getByRole("form", { name: "Add player" });
    fireEvent.change(within(add).getByLabelText("Name"), { target: { value: "Alex" } });
    fireEvent.click(within(add).getByLabelText("Left-handed"));
    fireEvent.click(within(add).getByRole("button", { name: "Add player" }));
    await waitFor(() => expect(screen.getByText("Alex")).toBeInTheDocument());
    expect(screen.getByText("left-handed")).toBeInTheDocument();
    expect(await runtime.repository.listPlayers()).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const edit = screen.getByRole("form", { name: "Save player" });
    fireEvent.change(within(edit).getByLabelText("Name"), { target: { value: "Alex B" } });
    fireEvent.click(within(edit).getByRole("button", { name: "Save player" }));
    await waitFor(() => expect(screen.getByText("Alex B")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Delete player" }));
    expect(screen.getByLabelText("Also delete every stored shot by this player")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete player" }));
    await waitFor(() => expect(screen.getByText("No players yet.")).toBeInTheDocument());
    expect(await runtime.repository.listPlayers()).toHaveLength(0);
  });

  it("equipment shows the bag without distances and every ball profile's warnings", () => {
    renderApp(acknowledged);
    nav("Equipment");
    expect(screen.getByText(/Clubs never carry a distance/)).toBeInTheDocument();
    expect(screen.queryByText(/carry distance:/i)).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Club label").length).toBe(DEFAULT_SETTINGS.bag.length);
    expect(screen.getByText("Range / practice ball (same provisional aerodynamics as baseline; low confidence)")).toBeInTheDocument();
    expect(screen.getAllByText(/Provisional aerodynamic model: not fit to data/).length).toBeGreaterThanOrEqual(4);
  });

  it("course play and putting are visible but disabled", () => {
    renderApp(acknowledged);
    expect(screen.getByRole("button", { name: /Course play/ })).toBeDisabled();
    expect(screen.getByText("Phase 5 — not built yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Putting/ })).toBeDisabled();
    expect(screen.getByText("Phase 6 — not built yet")).toBeInTheDocument();
  });

  it("calibration shows the Phase 1 status and disabled wizard with an explanation", () => {
    renderApp(acknowledged);
    nav("Calibration");
    expect(screen.getByText("No calibration: synthetic/replay mode")).toBeInTheDocument();
    expect(screen.getByText(/ChArUco/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start intrinsic calibration" })).toBeDisabled();
    expect(screen.getByText(/no camera driver exists yet/)).toBeInTheDocument();
  });

  it("diagnostics shows versions and runs the storage integrity check", async () => {
    renderApp(acknowledged);
    nav("Diagnostics");
    expect(screen.getByText("glm-schema-0.1.0")).toBeInTheDocument();
    expect(screen.getByText(/UI thread \(fallback/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Run integrity check" }));
    await waitFor(() => expect(screen.getByTestId("integrity-report").textContent).toMatch(/No corrupt records/));
  });
});
