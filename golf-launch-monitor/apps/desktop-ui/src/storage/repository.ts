/**
 * Local-only storage. IndexedDB (database "glm-local") when the browser provides it; otherwise
 * an in-memory repository, and the UI says that nothing will survive a reload.
 */
import { IndexedDbRepository, InMemoryRepository, type LocalRepository } from "@glm/persistence";
import { SCHEMA_VERSION, type Session, type ShotRecord } from "@glm/shared-types";

export const LOCAL_DB_NAME = "glm-local";

export type LocalStorageBackend = {
  readonly repository: LocalRepository;
  /** True when shots survive a reload (IndexedDB). */
  readonly persistent: boolean;
  readonly description: string;
};

export function createLocalRepository(): LocalStorageBackend {
  try {
    const factory = (globalThis as { indexedDB?: IDBFactory }).indexedDB;
    if (factory !== undefined) {
      return {
        repository: new IndexedDbRepository({ dbName: LOCAL_DB_NAME, indexedDB: factory }),
        persistent: true,
        description: `IndexedDB database "${LOCAL_DB_NAME}" in this browser profile (local only, never uploaded).`,
      };
    }
  } catch {
    // Fall through: some privacy modes throw on access.
  }
  return {
    repository: new InMemoryRepository(),
    persistent: false,
    description: "In-memory only: IndexedDB is unavailable, so shots are lost when this page is closed.",
  };
}

/** Session record for a range session, derived from its shots (one data stream per session). */
export function sessionRecordFor(
  sessionId: string,
  startedUtc: string,
  shots: readonly ShotRecord[],
): Session | null {
  const first = shots[0];
  if (first === undefined) return null;
  const playerIds = [...new Set(shots.map((s) => s.launch.playerId).filter((id): id is string => id !== null))];
  return {
    schemaVersion: SCHEMA_VERSION,
    id: sessionId,
    startedUtc,
    endedUtc: null,
    dataOrigin: first.dataOrigin,
    sensorConfigurationVersion: first.sensorConfiguration.version,
    calibrationVersion: first.launch.calibrationVersion,
    playerIds,
    label: `${first.dataOrigin} range session`,
  };
}
