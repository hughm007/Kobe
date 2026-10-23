/**
 * The local-first repository contract and a backend-agnostic implementation of it.
 *
 * All validation, freezing, sorting, filtering and corruption policy lives here, once; a
 * backend only moves raw values in and out of its storage medium. Nothing in this package
 * uploads data anywhere.
 */
import type { Player, Session, ShotRecord } from "@glm/shared-types";
import { CorruptRecordError, type StoreName } from "./errors";
import {
  assertPortableId,
  decodeStored,
  STORE_NAMES,
  validateForSave,
  type ShotLinkField,
  type StoredRecord,
} from "./record-codec";

export type ShotFilter = {
  readonly sessionId?: string;
  /** Matches `record.launch.playerId`. */
  readonly playerId?: string;
};

export type IntegrityReport = {
  /** `"<store>/<key>"` of every stored record that failed to decode or validate, sorted. */
  readonly corruptKeys: string[];
};

/**
 * Local storage of players, sessions and shot records.
 *
 * - Every save validates against the shared zod schema and rejects invalid input.
 * - Every load validates too; corrupt records are excluded from lists, reported by
 *   `integrityReport()`, and direct reads of them throw `CorruptRecordError`.
 * - Returned records are deep-frozen copies; callers can never mutate stored state.
 */
export interface LocalRepository {
  savePlayer(p: Player): Promise<void>;
  /** Sorted by createdUtc, then id. */
  listPlayers(): Promise<Player[]>;
  /**
   * Deletes the player. With `deleteShots`, also deletes every shot whose
   * `launch.playerId` is this player; otherwise those shots are kept unchanged (shot
   * records are immutable evidence and are never rewritten to drop the reference).
   */
  deletePlayer(id: string, opts: { deleteShots: boolean }): Promise<{ deletedShots: number }>;

  saveSession(s: Session): Promise<void>;
  getSession(id: string): Promise<Session | null>;
  /** Sorted by startedUtc, then id. */
  listSessions(): Promise<Session[]>;
  /** Deletes the session and cascades to every shot whose sessionId is this session. */
  deleteSession(id: string): Promise<{ deletedShots: number }>;

  saveShot(r: ShotRecord): Promise<void>;
  getShot(id: string): Promise<ShotRecord | null>;
  /** Sorted by createdUtc, then shotId. */
  listShots(filter?: ShotFilter): Promise<ShotRecord[]>;
  deleteShot(id: string): Promise<boolean>;

  clearAll(): Promise<void>;
  integrityReport(): Promise<IntegrityReport>;
}

// ---------------------------------------------------------------------------
// Backend contract (internal)
// ---------------------------------------------------------------------------

/** A raw stored value, before validation. */
export type RawEntry = {
  readonly key: string;
  readonly value: unknown;
  /** Set when the stored bytes could not be deserialized at all (e.g. malformed JSON). */
  readonly decodeError: string | null;
};

export type CascadeSpec = { readonly field: ShotLinkField; readonly value: string };

/** Storage medium behind a BackendRepository. Never validates; never interprets records. */
export interface RecordBackend {
  get(store: StoreName, key: string): Promise<RawEntry | null>;
  getAll(store: StoreName): Promise<RawEntry[]>;
  /** Raw shots whose link field (see rawShotLink) may equal `value`; a superset is fine. */
  getShotsByLink(field: ShotLinkField, value: string): Promise<RawEntry[]>;
  put(store: StoreName, key: string, value: object): Promise<void>;
  /**
   * Deletes `key` from `store` and, if `cascade` is given, every raw shot whose link field
   * equals `cascade.value` (atomically where the medium supports it).
   */
  deleteWithCascade(
    store: StoreName,
    key: string,
    cascade: CascadeSpec | null,
  ): Promise<{ existed: boolean; cascaded: number }>;
  clear(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Shared implementation
// ---------------------------------------------------------------------------

/** Fractional-second digits of an ISO timestamp, right-padded with zeros to `width`. */
function fractionDigits(utc: string, width: number): string {
  return (/\.(\d+)/.exec(utc)?.[1] ?? "").padEnd(width, "0");
}

function compareUtcThenId(aUtc: string, aId: string, bUtc: string, bId: string): number {
  // Compare instants, not strings: "…:00Z" and "…:00.500Z" do not sort correctly as text.
  // (Stored timestamps are schema-validated "Z" ISO strings; the NaN guard keeps the
  // comparator consistent even if an engine cannot parse an unusually long fraction.)
  const dt = Date.parse(aUtc) - Date.parse(bUtc);
  if (Number.isNaN(dt)) {
    if (aUtc !== bUtc) return aUtc < bUtc ? -1 : 1;
  } else if (dt !== 0) {
    return dt;
  } else {
    // Date.parse resolves only milliseconds and the schema allows any number of fractional
    // digits: break the tie on the full fraction, compared as a number (equal-width digit
    // strings order like their values). "…:00.5Z" and "…:00.500Z" are the same instant.
    const width = Math.max(aUtc.length, bUtc.length);
    const fa = fractionDigits(aUtc, width);
    const fb = fractionDigits(bUtc, width);
    if (fa !== fb) return fa < fb ? -1 : 1;
  }
  return aId < bId ? -1 : aId > bId ? 1 : 0;
}

export class BackendRepository implements LocalRepository {
  constructor(private readonly backend: RecordBackend) {}

  // -- players --------------------------------------------------------------

  async savePlayer(p: Player): Promise<void> {
    await this.save("players", p);
  }

  async listPlayers(): Promise<Player[]> {
    const players = await this.listValid("players");
    return players.sort((a, b) => compareUtcThenId(a.createdUtc, a.id, b.createdUtc, b.id));
  }

  async deletePlayer(id: string, opts: { deleteShots: boolean }): Promise<{ deletedShots: number }> {
    assertPortableId(id);
    const result = await this.backend.deleteWithCascade(
      "players",
      id,
      opts.deleteShots ? { field: "playerId", value: id } : null,
    );
    return { deletedShots: result.cascaded };
  }

  // -- sessions -------------------------------------------------------------

  async saveSession(s: Session): Promise<void> {
    await this.save("sessions", s);
  }

  async getSession(id: string): Promise<Session | null> {
    return this.getOne("sessions", id);
  }

  async listSessions(): Promise<Session[]> {
    const sessions = await this.listValid("sessions");
    return sessions.sort((a, b) => compareUtcThenId(a.startedUtc, a.id, b.startedUtc, b.id));
  }

  async deleteSession(id: string): Promise<{ deletedShots: number }> {
    assertPortableId(id);
    const result = await this.backend.deleteWithCascade("sessions", id, { field: "sessionId", value: id });
    return { deletedShots: result.cascaded };
  }

  // -- shots ----------------------------------------------------------------

  async saveShot(r: ShotRecord): Promise<void> {
    await this.save("shots", r);
  }

  async getShot(id: string): Promise<ShotRecord | null> {
    return this.getOne("shots", id);
  }

  async listShots(filter: ShotFilter = {}): Promise<ShotRecord[]> {
    const { sessionId, playerId } = filter;
    let entries: RawEntry[];
    if (sessionId !== undefined) entries = await this.backend.getShotsByLink("sessionId", sessionId);
    else if (playerId !== undefined) entries = await this.backend.getShotsByLink("playerId", playerId);
    else entries = await this.backend.getAll("shots");

    const shots: ShotRecord[] = [];
    for (const entry of entries) {
      const decoded = decodeStored("shots", entry.key, entry.value, entry.decodeError);
      if (!decoded.ok) continue; // reported by integrityReport(); never repaired
      const shot = decoded.value;
      // The backend prefilter is only a superset; the decision is made on the validated record.
      if (sessionId !== undefined && shot.sessionId !== sessionId) continue;
      if (playerId !== undefined && shot.launch.playerId !== playerId) continue;
      shots.push(shot);
    }
    return shots.sort((a, b) => compareUtcThenId(a.createdUtc, a.shotId, b.createdUtc, b.shotId));
  }

  async deleteShot(id: string): Promise<boolean> {
    assertPortableId(id);
    const result = await this.backend.deleteWithCascade("shots", id, null);
    return result.existed;
  }

  // -- maintenance ----------------------------------------------------------

  async clearAll(): Promise<void> {
    await this.backend.clear();
  }

  async integrityReport(): Promise<IntegrityReport> {
    const corruptKeys: string[] = [];
    for (const store of STORE_NAMES) {
      for (const entry of await this.backend.getAll(store)) {
        if (!decodeStored(store, entry.key, entry.value, entry.decodeError).ok) corruptKeys.push(`${store}/${entry.key}`);
      }
    }
    return { corruptKeys: corruptKeys.sort() };
  }

  // -- helpers --------------------------------------------------------------

  private async save<S extends StoreName>(store: S, input: StoredRecord[S]): Promise<void> {
    const { id, value } = validateForSave(store, input);
    await this.backend.put(store, id, value as object);
  }

  private async getOne<S extends StoreName>(store: S, id: string): Promise<StoredRecord[S] | null> {
    assertPortableId(id);
    const entry = await this.backend.get(store, id);
    if (entry === null) return null;
    const decoded = decodeStored(store, entry.key, entry.value, entry.decodeError);
    if (!decoded.ok) throw new CorruptRecordError(store, entry.key, decoded.reason);
    return decoded.value;
  }

  private async listValid<S extends StoreName>(store: S): Promise<StoredRecord[S][]> {
    const out: StoredRecord[S][] = [];
    for (const entry of await this.backend.getAll(store)) {
      const decoded = decodeStored(store, entry.key, entry.value, entry.decodeError);
      if (decoded.ok) out.push(decoded.value);
    }
    return out;
  }
}
