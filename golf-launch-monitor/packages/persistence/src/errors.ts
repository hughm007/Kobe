/**
 * Errors raised by the persistence layer. Every error names the record it concerns so that
 * a user (or a bug report) can locate the offending data without a debugger.
 */

/** Kinds of record the repository stores; also the object-store / directory names. */
export type StoreName = "players" | "sessions" | "shots";

/** A record offered for saving failed schema validation. Nothing was written. */
export class RecordValidationError extends Error {
  override readonly name = "RecordValidationError";
  constructor(
    readonly store: StoreName,
    /** Best-effort id read from the rejected input ("<missing id>" if absent). */
    readonly recordId: string,
    /** Dotted path of the first schema issue, e.g. "launch.ballSpeedMps.confidence". */
    readonly issuePath: string,
    readonly issueMessage: string,
    readonly issueCount: number,
  ) {
    const more = issueCount > 1 ? ` (and ${issueCount - 1} more issue${issueCount > 2 ? "s" : ""})` : "";
    super(
      `Refusing to save ${singular(store)} "${recordId}": schema validation failed at ` +
        `${issuePath}: ${issueMessage}${more}. Nothing was written.`,
    );
  }
}

/**
 * A stored record could not be decoded or no longer satisfies its schema. The repository
 * never repairs such a record; it is excluded from list results, reported by
 * `integrityReport()`, and direct reads of it throw this error.
 */
export class CorruptRecordError extends Error {
  override readonly name = "CorruptRecordError";
  constructor(
    readonly store: StoreName,
    readonly key: string,
    readonly reason: string,
  ) {
    super(`Stored ${singular(store)} "${key}" is corrupt and was not loaded: ${reason}`);
  }
}

/** An id that is unsafe or unportable as a storage key (path traversal, separators, ...). */
export class InvalidRecordIdError extends Error {
  override readonly name = "InvalidRecordIdError";
  constructor(
    readonly recordId: string,
    readonly reason: string,
  ) {
    super(`Invalid record id ${JSON.stringify(recordId)}: ${reason}`);
  }
}

function singular(store: StoreName): string {
  return store === "players" ? "player" : store === "sessions" ? "session" : "shot";
}
