/**
 * Data sources offered on the Setup screen. Phase 1 has no hardware drivers: camera, radar and
 * hybrid are listed so the user can see what is planned, but they are never selectable, and the
 * explanation comes from the hardware stub itself (HardwareNotAvailableError).
 */
import {
  CameraLaunchMonitorAdapter,
  HardwareNotAvailableError,
  HybridFusionAdapter,
  RadarLaunchMonitorAdapter,
  SENSOR_SPECIFICATION_DOC,
} from "@glm/sensor-adapters";
import type { SensorAdapter } from "@glm/shared-types";

export type SoftwareSourceId = "synthetic" | "replay" | "manual";
export type HardwareSourceId = "camera" | "radar" | "hybrid";
export type DataSourceId = SoftwareSourceId | HardwareSourceId;

export type DataSourceInfo = {
  readonly id: DataSourceId;
  readonly label: string;
  readonly description: string;
  readonly hardware: boolean;
};

export const DATA_SOURCES: readonly DataSourceInfo[] = Object.freeze([
  {
    id: "synthetic",
    label: "Synthetic",
    description: "Deterministic generated shots for testing. Every value is labelled SYNTHETIC; nothing is measured.",
    hardware: false,
  },
  {
    id: "replay",
    label: "Replay file",
    description: "Plays back a recorded JSON Lines replay file. Shots keep the file's origin and are never shown as live.",
    hardware: false,
  },
  {
    id: "manual",
    label: "Manual entry (developer)",
    description: "Typed-in launch conditions for developer testing. Labelled MANUAL; never a measurement.",
    hardware: false,
  },
  { id: "camera", label: "Camera launch monitor", description: "High-speed stereo cameras (planned).", hardware: true },
  { id: "radar", label: "Radar launch monitor", description: "Doppler radar (planned).", hardware: true },
  { id: "hybrid", label: "Camera + radar (hybrid)", description: "Camera/radar fusion (planned).", hardware: true },
]);

export type SourceAvailability = { readonly enabled: boolean; readonly reason: string | null };

export function sourceAvailability(id: DataSourceId, developerMode: boolean): SourceAvailability {
  switch (id) {
    case "synthetic":
    case "replay":
      return { enabled: true, reason: null };
    case "manual":
      return developerMode
        ? { enabled: true, reason: null }
        : { enabled: false, reason: "Manual entry is a developer tool. Turn on developer mode in Settings to use it." };
    case "camera":
    case "radar":
    case "hybrid":
      return {
        enabled: false,
        reason: `No hardware driver exists yet (Phase 1). See ${SENSOR_SPECIFICATION_DOC}.`,
      };
  }
}

export function isSoftwareSource(id: DataSourceId): id is SoftwareSourceId {
  return id === "synthetic" || id === "replay" || id === "manual";
}

/**
 * Asks each hardware stub to connect and reports the error it gives. The stubs always refuse
 * (no driver exists), so this returns their honest explanation for display.
 */
export async function probeHardwareSources(): Promise<Record<HardwareSourceId, string>> {
  const stubs: readonly [HardwareSourceId, SensorAdapter][] = [
    ["camera", new CameraLaunchMonitorAdapter()],
    ["radar", new RadarLaunchMonitorAdapter()],
    ["hybrid", new HybridFusionAdapter()],
  ];
  const entries = await Promise.all(
    stubs.map(async ([id, adapter]): Promise<[HardwareSourceId, string]> => {
      try {
        await adapter.connect();
        // A future driver may connect; Phase 1 still offers no hardware path in the UI.
        await adapter.disconnect();
        return [id, "A driver responded, but hardware capture is not enabled in this Phase 1 build."];
      } catch (error) {
        if (error instanceof HardwareNotAvailableError) return [id, error.message];
        return [id, `Not available: ${error instanceof Error ? error.message : String(error)}`];
      }
    }),
  );
  return Object.fromEntries(entries) as Record<HardwareSourceId, string>;
}
