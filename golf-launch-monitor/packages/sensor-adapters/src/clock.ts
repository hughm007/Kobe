import type { IsoUtcTimestamp } from "@glm/shared-types";

/**
 * Wall-clock access is injected, never read: library logic must be deterministic and never
 * consults the host clock. Applications pass a function returning the current ISO-8601 UTC time.
 */
export type UtcClock = () => IsoUtcTimestamp;

/**
 * Timestamp reported by adapters that were given no clock. The Unix epoch is used on
 * purpose: it is obviously not a real capture time.
 */
export const UNSET_CLOCK_UTC: IsoUtcTimestamp = "1970-01-01T00:00:00.000Z";

export const unsetClock: UtcClock = () => UNSET_CLOCK_UTC;

const MS_PER_DAY = 86_400_000;

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

/**
 * Format Unix-epoch milliseconds as "YYYY-MM-DDTHH:MM:SS.sssZ" without using Date, so the
 * output can never depend on the host clock or time zone. The civil-date conversion is
 * H. Hinnant's civil_from_days (proleptic Gregorian calendar). Years 0000-9999 only.
 */
export function formatIsoUtc(unixMs: number): IsoUtcTimestamp {
  if (!Number.isFinite(unixMs)) throw new RangeError(`formatIsoUtc: expected a finite number, got ${unixMs}`);
  const ms = Math.round(unixMs);
  const days = Math.floor(ms / MS_PER_DAY);
  let rem = ms - days * MS_PER_DAY;
  const hours = Math.floor(rem / 3_600_000);
  rem -= hours * 3_600_000;
  const minutes = Math.floor(rem / 60_000);
  rem -= minutes * 60_000;
  const seconds = Math.floor(rem / 1000);
  const millis = rem - seconds * 1000;

  const z = days + 719_468;
  const era = Math.floor(z / 146_097);
  const doe = z - era * 146_097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  if (year < 0 || year > 9999) throw new RangeError(`formatIsoUtc: year ${year} is outside 0000-9999`);

  return (
    `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` +
    `T${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}Z`
  );
}
