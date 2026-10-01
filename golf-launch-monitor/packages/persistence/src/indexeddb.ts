/**
 * Browser-local durable storage on IndexedDB. Object stores `players`, `sessions` and
 * `shots` (in-line keys `id` / `id` / `shotId`); `shots` has indexes on `sessionId` and
 * `launch.playerId`. Cascade deletes run in a single readwrite transaction, so they are
 * atomic: either the session/player and its shots are gone, or nothing changed.
 */
import type { StoreName } from "./errors";
import { ID_FIELD, STORE_NAMES, type ShotLinkField } from "./record-codec";
import { BackendRepository, type CascadeSpec, type RawEntry, type RecordBackend } from "./repository";

export const INDEXED_DB_VERSION = 1;

/** Index names on the `shots` object store. */
export const SHOT_INDEXES = { sessionId: "sessionId", playerId: "playerId" } as const satisfies Record<
  ShotLinkField,
  string
>;

export type IndexedDbRepositoryOptions = {
  readonly dbName: string;
  /** Defaults to `globalThis.indexedDB`; tests pass `new IDBFactory()` from fake-indexeddb. */
  readonly indexedDB?: IDBFactory;
};

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function zipEntries(keys: readonly IDBValidKey[], values: readonly unknown[]): RawEntry[] {
  return keys.map((key, i) => ({ key: String(key), value: values[i], decodeError: null }));
}

class IndexedDbBackend implements RecordBackend {
  private readonly factory: IDBFactory;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(private readonly options: IndexedDbRepositoryOptions) {
    const factory = options.indexedDB ?? (globalThis as { indexedDB?: IDBFactory }).indexedDB;
    if (factory === undefined) {
      throw new Error("IndexedDbRepository: no IndexedDB available; pass options.indexedDB explicitly");
    }
    if (options.dbName.length === 0) throw new Error("IndexedDbRepository: dbName must be non-empty");
    this.factory = factory;
  }

  private db(): Promise<IDBDatabase> {
    this.dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.factory.open(this.options.dbName, INDEXED_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const store of STORE_NAMES) {
          if (!db.objectStoreNames.contains(store)) {
            const os = db.createObjectStore(store, { keyPath: ID_FIELD[store] });
            if (store === "shots") {
              os.createIndex(SHOT_INDEXES.sessionId, "sessionId", { unique: false });
              os.createIndex(SHOT_INDEXES.playerId, "launch.playerId", { unique: false });
            }
          }
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        // Let a newer schema version (another tab) upgrade instead of blocking forever.
        db.onversionchange = () => {
          db.close();
          this.dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => reject(request.error ?? new Error(`cannot open IndexedDB "${this.options.dbName}"`));
      request.onblocked = () =>
        reject(new Error(`IndexedDB "${this.options.dbName}" upgrade blocked by another open connection`));
    });
    return this.dbPromise;
  }

  async close(): Promise<void> {
    if (this.dbPromise === null) return;
    const db = await this.dbPromise;
    db.close();
    this.dbPromise = null;
  }

  async get(store: StoreName, key: string): Promise<RawEntry | null> {
    const tx = (await this.db()).transaction(store, "readonly");
    const value = await requestResult(tx.objectStore(store).get(key));
    return value === undefined ? null : { key, value, decodeError: null };
  }

  async getAll(store: StoreName): Promise<RawEntry[]> {
    const tx = (await this.db()).transaction(store, "readonly");
    const os = tx.objectStore(store);
    // Both requests run in one transaction and return primary-key order, so they zip.
    const keysRequest = os.getAllKeys();
    const valuesRequest = os.getAll();
    await transactionDone(tx);
    return zipEntries(keysRequest.result, valuesRequest.result);
  }

  async getShotsByLink(field: ShotLinkField, value: string): Promise<RawEntry[]> {
    const tx = (await this.db()).transaction("shots", "readonly");
    const index = tx.objectStore("shots").index(SHOT_INDEXES[field]);
    // A plain key is treated as a single-key range; IDBKeyRange is not a Node global.
    const keysRequest = index.getAllKeys(value);
    const valuesRequest = index.getAll(value);
    await transactionDone(tx);
    return zipEntries(keysRequest.result, valuesRequest.result);
  }

  async put(store: StoreName, _key: string, value: object): Promise<void> {
    const tx = (await this.db()).transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    await transactionDone(tx);
  }

  async deleteWithCascade(
    store: StoreName,
    key: string,
    cascade: CascadeSpec | null,
  ): Promise<{ existed: boolean; cascaded: number }> {
    const names: StoreName[] = cascade !== null && store !== "shots" ? [store, "shots"] : [store];
    const tx = (await this.db()).transaction(names, "readwrite");
    let existed = false;
    let cascaded = 0;
    const os = tx.objectStore(store);
    const countRequest = os.count(key);
    countRequest.onsuccess = () => {
      existed = countRequest.result > 0;
    };
    os.delete(key);
    if (cascade !== null) {
      const shots = tx.objectStore("shots");
      const keysRequest = shots.index(SHOT_INDEXES[cascade.field]).getAllKeys(cascade.value);
      keysRequest.onsuccess = () => {
        // Issued inside the success callback, while the transaction is still active.
        for (const shotKey of keysRequest.result) shots.delete(shotKey);
        cascaded = keysRequest.result.length;
      };
    }
    await transactionDone(tx);
    return { existed, cascaded };
  }

  async clear(): Promise<void> {
    const tx = (await this.db()).transaction([...STORE_NAMES], "readwrite");
    for (const store of STORE_NAMES) tx.objectStore(store).clear();
    await transactionDone(tx);
  }
}

export class IndexedDbRepository extends BackendRepository {
  private readonly idb: IndexedDbBackend;

  constructor(options: IndexedDbRepositoryOptions) {
    const backend = new IndexedDbBackend(options);
    super(backend);
    this.idb = backend;
  }

  /** Closes the database connection; the next call reopens it. */
  async close(): Promise<void> {
    await this.idb.close();
  }
}
