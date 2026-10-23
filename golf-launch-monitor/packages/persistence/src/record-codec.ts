/**
 * Validation on both sides of the storage boundary. Saves are validated so that invalid
 * data never reaches disk; loads are validated because disk contents are untrusted (older
 * software, manual edits, partial writes, bit rot). Nothing here repairs data.
 */
import type { z } from "zod";
import {
  deepFreeze,
  PlayerSchema,
  SessionSchema,
  ShotRecordSchema,
  type Player,
  type Session,
  type ShotRecord,
} from "@glm/shared-types";
import { InvalidRecordIdError, RecordValidationError, type StoreName } from "./errors";
import { assertPortableId } from "./file-names";

export type StoredRecord = {
  readonly players: Player;
  readonly sessions: Session;
  readonly shots: ShotRecord;
};

const SCHEMAS: { readonly [S in StoreName]: z.ZodType } = {
  players: PlayerSchema,
  sessions: SessionSchema,
  shots: ShotRecordSchema,
};

export const STORE_NAMES: readonly StoreName[] = ["players", "sessions", "shots"];

/** Primary-key field of each store. */
export const ID_FIELD = { players: "id", sessions: "id", shots: "shotId" } as const satisfies {
  readonly [S in StoreName]: string;
};

/** The portable-id policy is defined with the file-name mapping, its most restrictive medium. */
export { assertPortableId, MAX_ID_LENGTH } from "./file-names";

/** Formats a zod issue path as `a.b[0].c`; the empty path is the record root. */
export function formatIssuePath(path: readonly PropertyKey[]): string {
  if (path.length === 0) return "(root)";
  let out = "";
  for (const part of path) {
    if (typeof part === "number") out += `[${part}]`;
    else out += out === "" ? String(part) : `.${String(part)}`;
  }
  return out;
}

function bestEffortId(store: StoreName, input: unknown): string {
  if (input !== null && typeof input === "object") {
    const id = (input as Record<string, unknown>)[ID_FIELD[store]];
    if (typeof id === "string" && id.length > 0) return id;
  }
  return "<missing id>";
}

/**
 * Validates a record offered for saving and returns a detached plain copy safe to store.
 * Throws RecordValidationError naming the record id and the first issue path.
 */
export function validateForSave<S extends StoreName>(store: S, input: unknown): { id: string; value: StoredRecord[S] } {
  const parsed = SCHEMAS[store].safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new RecordValidationError(
      store,
      bestEffortId(store, input),
      formatIssuePath(first?.path ?? []),
      first?.message ?? "invalid",
      parsed.error.issues.length,
    );
  }
  const value = structuredClone(parsed.data) as StoredRecord[S];
  const id = (value as Record<string, unknown>)[ID_FIELD[store]] as string;
  assertPortableId(id);
  if (store === "shots") {
    // The links cascade deletes match on must be ids that deleteSession / deletePlayer
    // accept; otherwise the shot could be saved but never removed by a cascade.
    const shot = value as ShotRecord;
    assertPortableLink(id, "sessionId", shot.sessionId);
    if (shot.launch.playerId !== null) assertPortableLink(id, "launch.playerId", shot.launch.playerId);
  }
  return { id, value };
}

function assertPortableLink(shotId: string, field: string, linkedId: string): void {
  try {
    assertPortableId(linkedId);
  } catch (error) {
    if (!(error instanceof InvalidRecordIdError)) throw error;
    throw new InvalidRecordIdError(linkedId, `${field} of shot ${JSON.stringify(shotId)}: ${error.reason}`);
  }
}

export type DecodeResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly reason: string };

/**
 * Validates a raw stored value. `decodeError` is set by backends that could not even
 * deserialize the bytes (e.g. malformed JSON). The stored key must equal the record's id:
 * a record filed under the wrong key is treated as corrupt rather than silently re-keyed.
 * Returns a deep-frozen copy that shares nothing with backend state.
 */
export function decodeStored<S extends StoreName>(
  store: S,
  key: string,
  raw: unknown,
  decodeError: string | null,
): DecodeResult<StoredRecord[S]> {
  if (decodeError !== null) return { ok: false, reason: decodeError };
  const parsed = SCHEMAS[store].safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const more = parsed.error.issues.length > 1 ? ` (and ${parsed.error.issues.length - 1} more)` : "";
    return {
      ok: false,
      reason: `schema validation failed at ${formatIssuePath(first?.path ?? [])}: ${first?.message ?? "invalid"}${more}`,
    };
  }
  const id = (parsed.data as Record<string, unknown>)[ID_FIELD[store]];
  if (id !== key) {
    return { ok: false, reason: `stored under key "${key}" but its ${ID_FIELD[store]} is ${JSON.stringify(id)}` };
  }
  return { ok: true, value: deepFreeze(structuredClone(parsed.data)) as StoredRecord[S] };
}

/** Field of a raw (possibly corrupt) shot that cascade deletes match on. */
export type ShotLinkField = "sessionId" | "playerId";

/**
 * Reads the session/player link from a raw stored shot without trusting the rest of it.
 * Cascade deletes match on this so that a user's delete request also removes shots that
 * fail validation but still clearly belong to the deleted session/player.
 */
export function rawShotLink(raw: unknown, field: ShotLinkField): string | null {
  if (raw === null || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (field === "sessionId") return typeof record.sessionId === "string" ? record.sessionId : null;
  const launch = record.launch;
  if (launch === null || typeof launch !== "object") return null;
  const playerId = (launch as Record<string, unknown>).playerId;
  return typeof playerId === "string" ? playerId : null;
}
