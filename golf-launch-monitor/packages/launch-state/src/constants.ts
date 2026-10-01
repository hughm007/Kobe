/**
 * Display-unit factors used only where the LaunchState contract mandates degrees / rpm
 * (docs/coordinate-system.md §2, contract exception). Duplicated from @glm/units on purpose:
 * this package depends only on @glm/shared-types and @glm/core-math. Values are exact.
 */
export const DEG_PER_RAD = 180 / Math.PI;
export const RAD_PER_DEG = Math.PI / 180;
/** 1 rpm = 2*pi/60 rad/s. */
export const RAD_PER_SEC_PER_RPM = (2 * Math.PI) / 60;
export const RPM_PER_RAD_PER_SEC = 60 / (2 * Math.PI);

export function uniqueStrings(values: Iterable<string>): string[] {
  return [...new Set(values)];
}
