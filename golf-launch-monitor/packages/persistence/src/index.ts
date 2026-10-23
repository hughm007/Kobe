/**
 * @glm/persistence — local-first storage of players, sessions and shot records, plus
 * CSV/JSON export. Browser-safe: nothing here imports Node APIs (the JSON-directory
 * repository lives in "@glm/persistence/node"). Nothing in this package uploads data.
 */
export { CorruptRecordError, InvalidRecordIdError, RecordValidationError, type StoreName } from "./errors";
export { MAX_ID_LENGTH } from "./record-codec";
export type { IntegrityReport, LocalRepository, ShotFilter } from "./repository";
export { createInMemoryStore, InMemoryRepository, type InMemoryStore } from "./memory";
export {
  INDEXED_DB_VERSION,
  IndexedDbRepository,
  SHOT_INDEXES,
  type IndexedDbRepositoryOptions,
} from "./indexeddb";
export * from "./export";
