/**
 * Shot-level banners: validity of the launch state and where the data stream came from.
 * Warning and rejection texts are passed through verbatim; this layer never rewrites them.
 */
import type { DataOrigin, LaunchState, Validity } from "@glm/shared-types";

export type ValidityBanner = {
  readonly level: Validity;
  readonly title: string;
  readonly messages: readonly string[];
};

const VALIDITY_TITLES: Readonly<Record<Validity, string>> = {
  valid: "Valid shot",
  provisional: "Provisional shot: review the warnings before relying on these numbers",
  invalid: "Invalid shot: rejected",
};

/** Rejection reasons first, then warnings, each verbatim and in their original order. */
export function validityBanner(launch: LaunchState): ValidityBanner {
  const level = launch.validity;
  // Own keys only: `in` / indexing would accept prototype keys such as "constructor".
  if (!Object.hasOwn(VALIDITY_TITLES, level)) throw new RangeError(`validityBanner: unknown validity "${String(level)}"`);
  const title = VALIDITY_TITLES[level];
  return Object.freeze({
    level,
    title,
    messages: Object.freeze([...launch.rejectionReasons, ...launch.warnings]),
  });
}

export const DATA_ORIGIN_BANNERS: Readonly<Record<DataOrigin, string | null>> = Object.freeze({
  live: null,
  replay: "Replay of recorded data; not a live shot.",
  synthetic: "SYNTHETIC DATA — generated for testing, not measured.",
  manual: "MANUAL DATA — developer manual entry, not measured by a sensor.",
});

/** Banner text for non-live data streams; null for live data. */
export function dataOriginBanner(origin: DataOrigin): string | null {
  if (!Object.hasOwn(DATA_ORIGIN_BANNERS, origin)) throw new RangeError(`dataOriginBanner: unknown data origin "${String(origin)}"`);
  return DATA_ORIGIN_BANNERS[origin];
}
