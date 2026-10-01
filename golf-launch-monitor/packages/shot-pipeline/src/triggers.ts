import { median } from "@glm/core-math";
import type { TriggerObservation, TriggerSource } from "@glm/shared-types";

/** Trigger observations closer together than this belong to the same impact event, s. */
export const TRIGGER_CLUSTER_WINDOW_S = 0.05;

/** Fused trigger sources that disagree by more than this raise a warning, s. */
export const TRIGGER_AGREEMENT_TOLERANCE_S = 0.003;

export type FusedTrigger = {
  /** Latency-corrected impact time on the session clock, s. */
  readonly timeS: number;
  /** Combined confidence 0..1 (independent-evidence combination, reduced on disagreement). */
  readonly confidence: number;
  readonly sources: readonly TriggerSource[];
  /** Max - min of the latency-corrected source times, s. */
  readonly spreadS: number;
  readonly warnings: readonly string[];
};

/**
 * Fuses trigger observations from one impact. Each source's known latency (e.g. sound
 * travel time to the microphone) is subtracted, the corrected times are combined with a
 * median (robust to one bad source), and the confidence is 1 - prod(1 - c_i), reduced when
 * sources disagree by more than TRIGGER_AGREEMENT_TOLERANCE_S.
 */
export function fuseTriggers(
  triggers: readonly TriggerObservation[],
  latencyBySourceS: Partial<Record<TriggerSource, number>> = {},
): FusedTrigger | null {
  if (triggers.length === 0) return null;
  const corrected = triggers.map((t) => t.timestampS - (latencyBySourceS[t.triggerSource] ?? 0));
  const timeS = median(corrected);
  const spreadS = Math.max(...corrected) - Math.min(...corrected);
  let missProbability = 1;
  for (const t of triggers) missProbability *= 1 - Math.min(1, Math.max(0, t.confidence));
  let confidence = 1 - missProbability;
  const warnings: string[] = [];
  if (spreadS > TRIGGER_AGREEMENT_TOLERANCE_S) {
    confidence *= 0.5;
    warnings.push(
      `Trigger sources disagree by ${(spreadS * 1000).toFixed(1)} ms; impact timing may be unreliable.`,
    );
  }
  const sources = Array.from(new Set(triggers.map((t) => t.triggerSource)));
  return { timeS, confidence, sources, spreadS, warnings };
}
