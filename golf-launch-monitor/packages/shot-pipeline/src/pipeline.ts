import type { RawSensorObservation, SensorAdapter, ShotRecord, Unsubscribe } from "@glm/shared-types";
import { type PipelineConfig, processShot } from "./process";
import { ShotSegmenter } from "./segmenter";

export type ShotListener = (record: ShotRecord) => void;
export type PipelineErrorListener = (error: Error) => void;

/**
 * Connects a SensorAdapter to the shot pipeline. Observations are segmented into shots and
 * each completed shot is turned into a ShotRecord and delivered to listeners. The UI only
 * ever talks to this class and the SensorAdapter contract, never to a specific device.
 */
export class ShotPipeline {
  private readonly segmenter: ShotSegmenter;
  private readonly shotListeners = new Set<ShotListener>();
  private readonly errorListeners = new Set<PipelineErrorListener>();
  private unsubscribe: Unsubscribe | null = null;

  constructor(
    private readonly adapter: SensorAdapter,
    private config: PipelineConfig,
  ) {
    this.segmenter = new ShotSegmenter(adapter.getConfiguration().frameBuffer);
  }

  /** Replace per-shot settings (player, club, ball, environment) between shots. */
  updateConfig(patch: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...patch };
  }

  onShot(listener: ShotListener): Unsubscribe {
    this.shotListeners.add(listener);
    return () => this.shotListeners.delete(listener);
  }

  onError(listener: PipelineErrorListener): Unsubscribe {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /** Subscribe to the adapter. Call adapter.connect()/startCapture() separately. */
  attach(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = this.adapter.subscribeToObservations((o) => this.ingest(o));
  }

  detach(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Feed one observation (also usable without an adapter subscription, e.g. in tests). */
  ingest(observation: RawSensorObservation): void {
    for (const group of this.segmenter.push(observation)) this.emit(group);
  }

  /** Close the open shot, if any (e.g. when capture stops or a replay ends). */
  flush(): void {
    for (const group of this.segmenter.flush()) this.emit(group);
  }

  private emit(group: Parameters<typeof processShot>[0]): void {
    let record: ShotRecord;
    try {
      record = processShot(group, this.config).record;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.errorListeners.size === 0) throw err;
      for (const listener of this.errorListeners) listener(err);
      return;
    }
    for (const listener of this.shotListeners) listener(record);
  }
}
