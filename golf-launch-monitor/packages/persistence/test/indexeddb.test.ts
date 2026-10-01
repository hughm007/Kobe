import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { INDEXED_DB_VERSION, IndexedDbRepository, SHOT_INDEXES, type StoreName } from "../src/index";
import { makeShot } from "./fixtures";
import { describeRepositoryContract } from "./repository-contract";

function openRaw(factory: IDBFactory, dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(dbName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putRaw(factory: IDBFactory, dbName: string, store: StoreName, value: unknown): Promise<void> {
  const db = await openRaw(factory, dbName);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

let dbCounter = 0;

describeRepositoryContract("IndexedDbRepository (fake-indexeddb)", async () => {
  const factory = new IDBFactory();
  dbCounter += 1;
  const dbName = `glm-test-${dbCounter}`;
  const repo = new IndexedDbRepository({ dbName, indexedDB: factory });
  await repo.listPlayers(); // creates the database and object stores
  return {
    repo,
    // In-line keys: the stored key is always the record's own id field.
    writeRaw: (store, _key, raw) => putRaw(factory, dbName, store, raw),
    canStoreUnderForeignKey: false,
    cleanup: () => repo.close(),
  };
});

describe("IndexedDbRepository specifics", () => {
  it("creates the players/sessions/shots stores and the shot indexes", async () => {
    const factory = new IDBFactory();
    const repo = new IndexedDbRepository({ dbName: "schema-check", indexedDB: factory });
    await repo.saveShot(makeShot({ shotId: "a", sessionId: "s", playerId: "p" }));
    await repo.close();
    const db = await openRaw(factory, "schema-check");
    expect(db.version).toBe(INDEXED_DB_VERSION);
    expect([...db.objectStoreNames].sort()).toEqual(["players", "sessions", "shots"]);
    const shots = db.transaction("shots", "readonly").objectStore("shots");
    expect(shots.keyPath).toBe("shotId");
    expect([...shots.indexNames].sort()).toEqual([SHOT_INDEXES.playerId, SHOT_INDEXES.sessionId].sort());
    expect(shots.index(SHOT_INDEXES.playerId).keyPath).toBe("launch.playerId");
    expect(shots.index(SHOT_INDEXES.sessionId).keyPath).toBe("sessionId");
    db.close();
  });

  it("persists across repository instances on the same database", async () => {
    const factory = new IDBFactory();
    const first = new IndexedDbRepository({ dbName: "durable", indexedDB: factory });
    await first.saveShot(makeShot({ shotId: "kept", sessionId: "s" }));
    await first.close();
    const second = new IndexedDbRepository({ dbName: "durable", indexedDB: factory });
    expect((await second.listShots()).map((s) => s.shotId)).toEqual(["kept"]);
    await second.close();
  });

  it("requires an IndexedDB factory when none is global", () => {
    expect(() => new IndexedDbRepository({ dbName: "x" })).toThrow(/no IndexedDB available/);
  });
});
