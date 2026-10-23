import { describe, expect, it } from "vitest";
import { createInMemoryStore, InMemoryRepository } from "../src/index";
import { makeShot } from "./fixtures";
import { describeRepositoryContract } from "./repository-contract";

describeRepositoryContract("InMemoryRepository", async () => {
  const store = createInMemoryStore();
  return {
    repo: new InMemoryRepository({ store }),
    writeRaw: async (name, key, raw) => {
      store[name].set(key, raw);
    },
    canStoreUnderForeignKey: true,
    cleanup: async () => undefined,
  };
});

describe("InMemoryRepository specifics", () => {
  it("stores detached plain copies (never the caller's object, never frozen state)", async () => {
    const store = createInMemoryStore();
    const repo = new InMemoryRepository({ store });
    const shot = makeShot({ shotId: "a", sessionId: "s" });
    await repo.saveShot(shot);
    const stored = store.shots.get("a");
    expect(stored).not.toBe(shot);
    expect(stored).toEqual(shot);
    expect(Object.isFrozen(stored)).toBe(false);
    const read = await repo.getShot("a");
    expect(read).not.toBe(stored);
  });

  it("reports a non-cloneable stored value as corrupt instead of crashing", async () => {
    const store = createInMemoryStore();
    store.players.set("fn", { id: "fn", f: () => 1 });
    const repo = new InMemoryRepository({ store });
    expect(await repo.listPlayers()).toEqual([]);
    expect((await repo.integrityReport()).corruptKeys).toEqual(["players/fn"]);
  });
});
