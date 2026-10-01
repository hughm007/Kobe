/**
 * One behavioural contract, run against every LocalRepository implementation.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Player, ShotRecord } from "@glm/shared-types";
import {
  CorruptRecordError,
  InvalidRecordIdError,
  RecordValidationError,
  type LocalRepository,
  type StoreName,
} from "../src/index";
import { makePlayer, makeSession, makeShot } from "./fixtures";

export type RepositoryHarness = {
  readonly repo: LocalRepository;
  /** Writes a raw value straight into the storage medium, bypassing all validation. */
  writeRaw(store: StoreName, key: string, raw: unknown): Promise<void>;
  /** Whether the medium can file a record under a key different from its id. */
  readonly canStoreUnderForeignKey: boolean;
  cleanup(): Promise<void>;
};

function mutable<T>(value: T): T {
  return structuredClone(value);
}

export function describeRepositoryContract(name: string, createHarness: () => Promise<RepositoryHarness>): void {
  describe(`${name}: LocalRepository contract`, () => {
    let h: RepositoryHarness;
    let repo: LocalRepository;

    beforeEach(async () => {
      h = await createHarness();
      repo = h.repo;
    });
    afterEach(async () => {
      await h.cleanup();
    });

    describe("players", () => {
      it("saves, lists sorted by createdUtc then id, and upserts by id", async () => {
        await repo.savePlayer(makePlayer("p-b", "2026-10-01T10:00:00.000Z"));
        await repo.savePlayer(makePlayer("p-a", "2026-10-01T10:00:00.000Z"));
        await repo.savePlayer(makePlayer("p-0", "2026-10-02T10:00:00.000Z"));
        await repo.savePlayer(makePlayer("p-early", "2026-09-30T10:00:00.000Z"));
        expect((await repo.listPlayers()).map((p) => p.id)).toEqual(["p-early", "p-a", "p-b", "p-0"]);

        await repo.savePlayer({ ...makePlayer("p-a"), displayName: "Renamed" });
        const players = await repo.listPlayers();
        expect(players).toHaveLength(4);
        expect(players.find((p) => p.id === "p-a")?.displayName).toBe("Renamed");
      });

      it("deletes a player but keeps their shots when deleteShots is false", async () => {
        await repo.savePlayer(makePlayer("p1"));
        await repo.saveShot(makeShot({ shotId: "s1", sessionId: "sess", playerId: "p1" }));
        expect(await repo.deletePlayer("p1", { deleteShots: false })).toEqual({ deletedShots: 0 });
        expect(await repo.listPlayers()).toEqual([]);
        const kept = await repo.listShots({ playerId: "p1" });
        expect(kept.map((s) => s.shotId)).toEqual(["s1"]);
        expect(kept[0]?.launch.playerId).toBe("p1"); // shot records are never rewritten
      });

      it("deletes a player and exactly their shots when deleteShots is true", async () => {
        await repo.savePlayer(makePlayer("p1"));
        await repo.savePlayer(makePlayer("p2"));
        await repo.saveShot(makeShot({ shotId: "a", sessionId: "sess", playerId: "p1" }));
        await repo.saveShot(makeShot({ shotId: "b", sessionId: "sess", playerId: "p1" }));
        await repo.saveShot(makeShot({ shotId: "c", sessionId: "sess", playerId: "p2" }));
        await repo.saveShot(makeShot({ shotId: "d", sessionId: "sess", playerId: null }));
        expect(await repo.deletePlayer("p1", { deleteShots: true })).toEqual({ deletedShots: 2 });
        expect((await repo.listPlayers()).map((p) => p.id)).toEqual(["p2"]);
        expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["c", "d"]);
      });
    });

    describe("sessions", () => {
      it("saves, gets, lists sorted by startedUtc then id; missing id -> null", async () => {
        await repo.saveSession(makeSession("s-late", "2026-10-03T00:00:00.000Z"));
        await repo.saveSession(makeSession("s-early", "2026-10-01T00:00:00.000Z"));
        await repo.saveSession(makeSession("s-mid", "2026-10-02T00:00:00.000Z"));
        expect((await repo.listSessions()).map((s) => s.id)).toEqual(["s-early", "s-mid", "s-late"]);
        expect((await repo.getSession("s-mid"))?.startedUtc).toBe("2026-10-02T00:00:00.000Z");
        expect(await repo.getSession("nope")).toBeNull();
      });

      it("deleteSession cascades to that session's shots only", async () => {
        await repo.saveSession(makeSession("s1"));
        await repo.saveSession(makeSession("s2"));
        await repo.saveShot(makeShot({ shotId: "x1", sessionId: "s1" }));
        await repo.saveShot(makeShot({ shotId: "x2", sessionId: "s1" }));
        await repo.saveShot(makeShot({ shotId: "x3", sessionId: "s1" }));
        await repo.saveShot(makeShot({ shotId: "y1", sessionId: "s2" }));
        expect(await repo.deleteSession("s1")).toEqual({ deletedShots: 3 });
        expect(await repo.getSession("s1")).toBeNull();
        expect((await repo.listSessions()).map((s) => s.id)).toEqual(["s2"]);
        expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["y1"]);
        expect(await repo.deleteSession("s1")).toEqual({ deletedShots: 0 });
      });
    });

    describe("shots", () => {
      it("round-trips a shot exactly", async () => {
        const shot = makeShot({ shotId: "rt", sessionId: "s", playerId: "p" });
        await repo.saveShot(shot);
        expect(await repo.getShot("rt")).toEqual(shot);
        expect(await repo.getShot("missing")).toBeNull();
      });

      it("lists sorted by createdUtc instant, then shotId (mixed timestamp precision)", async () => {
        await repo.saveShot(makeShot({ shotId: "c", sessionId: "s", createdUtc: "2026-10-01T10:00:00.500Z" }));
        await repo.saveShot(makeShot({ shotId: "b", sessionId: "s", createdUtc: "2026-10-01T10:00:00Z" }));
        await repo.saveShot(makeShot({ shotId: "a", sessionId: "s", createdUtc: "2026-10-01T10:00:00.000Z" }));
        await repo.saveShot(makeShot({ shotId: "z", sessionId: "s", createdUtc: "2026-10-01T09:59:59.999Z" }));
        // As text, "…00.500Z" < "…00Z" would wrongly put c first; instants order it last.
        expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["z", "a", "b", "c"]);
      });

      it("orders timestamps within one millisecond by their full fractional seconds", async () => {
        await repo.saveShot(makeShot({ shotId: "b", sessionId: "s", createdUtc: "2026-10-01T10:00:00.0005Z" }));
        await repo.saveShot(makeShot({ shotId: "c", sessionId: "s", createdUtc: "2026-10-01T10:00:00.000500Z" }));
        await repo.saveShot(makeShot({ shotId: "d", sessionId: "s", createdUtc: "2026-10-01T10:00:00.0001Z" }));
        await repo.saveShot(makeShot({ shotId: "e", sessionId: "s", createdUtc: "2026-10-01T10:00:00Z" }));
        // All four fall in one millisecond; b and c are the same instant, so the id decides.
        expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["e", "d", "b", "c"]);
      });

      it("filters by sessionId, by launch.playerId, and by both", async () => {
        await repo.saveShot(makeShot({ shotId: "1", sessionId: "s1", playerId: "p1" }));
        await repo.saveShot(makeShot({ shotId: "2", sessionId: "s1", playerId: "p2" }));
        await repo.saveShot(makeShot({ shotId: "3", sessionId: "s2", playerId: "p1" }));
        await repo.saveShot(makeShot({ shotId: "4", sessionId: "s2", playerId: null }));
        expect((await repo.listShots({ sessionId: "s1" })).map((s) => s.shotId)).toEqual(["1", "2"]);
        expect((await repo.listShots({ playerId: "p1" })).map((s) => s.shotId)).toEqual(["1", "3"]);
        expect((await repo.listShots({ sessionId: "s2", playerId: "p1" })).map((s) => s.shotId)).toEqual(["3"]);
        expect(await repo.listShots({ sessionId: "none" })).toEqual([]);
        expect((await repo.listShots({})).length).toBe(4);
      });

      it("deleteShot reports whether the shot existed", async () => {
        await repo.saveShot(makeShot({ shotId: "d1", sessionId: "s" }));
        expect(await repo.deleteShot("d1")).toBe(true);
        expect(await repo.deleteShot("d1")).toBe(false);
        expect(await repo.getShot("d1")).toBeNull();
      });

      it("stores ids with spaces, colons, case and non-ASCII characters", async () => {
        const ids = ["Shot:Ä 1?", "shot:ä 1?", "con", ".hidden", "a..b", "100%"];
        for (const id of ids) await repo.saveShot(makeShot({ shotId: id, sessionId: "s" }));
        for (const id of ids) expect((await repo.getShot(id))?.shotId).toBe(id);
        expect((await repo.listShots()).map((s) => s.shotId).sort()).toEqual([...ids].sort());
        expect((await repo.integrityReport()).corruptKeys).toEqual([]);
      });
    });

    describe("clearAll", () => {
      it("removes every player, session and shot", async () => {
        await repo.savePlayer(makePlayer("p"));
        await repo.saveSession(makeSession("s"));
        await repo.saveShot(makeShot({ shotId: "x", sessionId: "s" }));
        await repo.clearAll();
        expect(await repo.listPlayers()).toEqual([]);
        expect(await repo.listSessions()).toEqual([]);
        expect(await repo.listShots()).toEqual([]);
        // Still usable afterwards.
        await repo.saveShot(makeShot({ shotId: "y", sessionId: "s" }));
        expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["y"]);
      });
    });

    describe("schema validation on save", () => {
      it("rejects an invalid shot, naming the id and the first issue path, and writes nothing", async () => {
        const bad = mutable(makeShot({ shotId: "bad-shot", sessionId: "s" }));
        (bad.launch.ballSpeedMps as { confidence: number }).confidence = 1.5;
        const attempt = repo.saveShot(bad);
        await expect(attempt).rejects.toBeInstanceOf(RecordValidationError);
        await expect(attempt).rejects.toThrow(/shot "bad-shot".*launch\.ballSpeedMps\.confidence/);
        expect(await repo.getShot("bad-shot")).toBeNull();
      });

      it("rejects a measurement that violates provenance invariants (null value labelled measured)", async () => {
        const bad = mutable(makeShot({ shotId: "prov", sessionId: "s" }));
        (bad.launch.totalSpinRpm as { value: number | null }).value = null;
        await expect(repo.saveShot(bad)).rejects.toThrow(/launch\.totalSpinRpm\.source/);
      });

      it("rejects unknown fields and wrong enums on players and sessions", async () => {
        await expect(repo.savePlayer({ ...makePlayer("p1"), sneaky: 1 } as unknown as Player)).rejects.toThrow(
          /player "p1"/,
        );
        await expect(
          repo.savePlayer({ ...makePlayer("p2"), handedness: "both" } as unknown as Player),
        ).rejects.toThrow(/player "p2".*handedness/);
        await expect(
          repo.saveSession({ ...makeSession("s1"), startedUtc: "yesterday" }),
        ).rejects.toThrow(/session "s1".*startedUtc/);
        await expect(repo.savePlayer({} as Player)).rejects.toThrow(/player "<missing id>"/);
        expect(await repo.listPlayers()).toEqual([]);
        expect(await repo.listSessions()).toEqual([]);
      });
    });

    describe("immutability", () => {
      it("returns deep-frozen records that cannot be mutated", async () => {
        await repo.saveShot(makeShot({ shotId: "f", sessionId: "s", playerId: "p" }));
        await repo.savePlayer(makePlayer("p"));
        const shot = (await repo.getShot("f")) as ShotRecord;
        expect(Object.isFrozen(shot)).toBe(true);
        expect(Object.isFrozen(shot.launch.ballSpeedMps)).toBe(true);
        expect(Object.isFrozen(shot.result?.metrics.carryM.inputs)).toBe(true);
        expect(() => {
          (shot.launch.ballSpeedMps as { value: number }).value = 99;
        }).toThrow(TypeError);
        const [listed] = await repo.listShots();
        expect(Object.isFrozen(listed?.launch.velocityMps.value)).toBe(true);
        const [player] = await repo.listPlayers();
        expect(Object.isFrozen(player)).toBe(true);
        expect((await repo.getShot("f"))?.launch.ballSpeedMps.value).toBe(52.21);
      });

      it("is unaffected by later mutation of the object that was saved", async () => {
        const input = mutable(makeShot({ shotId: "m", sessionId: "s" }));
        await repo.saveShot(input);
        (input.launch.warnings as string[]).push("mutated after save");
        expect((await repo.getShot("m"))?.launch.warnings).toEqual([]);
      });
    });

    describe("corrupt stored records", () => {
      it("starts with a clean integrity report", async () => {
        expect(await repo.integrityReport()).toEqual({ corruptKeys: [] });
      });

      it("excludes a schema-invalid shot from lists, reports it, and throws on direct read", async () => {
        await repo.saveShot(makeShot({ shotId: "good", sessionId: "s1" }));
        const bad = mutable(makeShot({ shotId: "bad", sessionId: "s1" })) as unknown as {
          launch: { overallConfidence: unknown };
        };
        bad.launch.overallConfidence = "very";
        await h.writeRaw("shots", "bad", bad);

        expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["good"]);
        expect((await repo.listShots({ sessionId: "s1" })).map((s) => s.shotId)).toEqual(["good"]);
        expect(await repo.integrityReport()).toEqual({ corruptKeys: ["shots/bad"] });
        const read = repo.getShot("bad");
        await expect(read).rejects.toBeInstanceOf(CorruptRecordError);
        await expect(read).rejects.toThrow(/launch\.overallConfidence/);
      });

      it("never repairs: the corrupt record stays corrupt across reads", async () => {
        await h.writeRaw("players", "p-bad", { id: "p-bad", displayName: 7, handedness: "right", createdUtc: "x" });
        await repo.savePlayer(makePlayer("p-ok"));
        expect((await repo.listPlayers()).map((p) => p.id)).toEqual(["p-ok"]);
        expect((await repo.integrityReport()).corruptKeys).toEqual(["players/p-bad"]);
        expect((await repo.integrityReport()).corruptKeys).toEqual(["players/p-bad"]);
      });

      it("throws CorruptRecordError for a corrupt session and lists the rest", async () => {
        await repo.saveSession(makeSession("ok"));
        await h.writeRaw("sessions", "broken", { ...makeSession("broken"), dataOrigin: "telepathy" });
        await expect(repo.getSession("broken")).rejects.toBeInstanceOf(CorruptRecordError);
        expect((await repo.listSessions()).map((s) => s.id)).toEqual(["ok"]);
      });

      it("deleteSession also removes corrupt shots that still name the session", async () => {
        await repo.saveSession(makeSession("s1"));
        await repo.saveShot(makeShot({ shotId: "ok", sessionId: "s1" }));
        const bad = mutable(makeShot({ shotId: "bad", sessionId: "s1" })) as unknown as { result: unknown };
        bad.result = "garbage";
        await h.writeRaw("shots", "bad", bad);
        expect(await repo.deleteSession("s1")).toEqual({ deletedShots: 2 });
        expect(await repo.integrityReport()).toEqual({ corruptKeys: [] });
      });

      it("treats a record filed under a key different from its id as corrupt", async () => {
        if (!h.canStoreUnderForeignKey) return;
        await h.writeRaw("shots", "key-a", makeShot({ shotId: "id-b", sessionId: "s" }));
        expect(await repo.listShots()).toEqual([]);
        expect((await repo.integrityReport()).corruptKeys).toEqual(["shots/key-a"]);
        await expect(repo.getShot("key-a")).rejects.toThrow(/stored under key "key-a"/);
      });
    });

    describe("id safety", () => {
      it("rejects path traversal and separators on every operation", async () => {
        const traversal = mutable(makeShot({ shotId: "../../evil", sessionId: "s" }));
        await expect(repo.saveShot(traversal)).rejects.toBeInstanceOf(InvalidRecordIdError);
        await expect(repo.saveShot(mutable(makeShot({ shotId: "..", sessionId: "s" })))).rejects.toBeInstanceOf(
          InvalidRecordIdError,
        );
        await expect(repo.savePlayer(makePlayer("a\\b"))).rejects.toBeInstanceOf(InvalidRecordIdError);
        await expect(repo.getShot("../etc/passwd")).rejects.toBeInstanceOf(InvalidRecordIdError);
        await expect(repo.getSession("a/b")).rejects.toBeInstanceOf(InvalidRecordIdError);
        await expect(repo.deleteShot("..")).rejects.toBeInstanceOf(InvalidRecordIdError);
        await expect(repo.deleteSession("x/../../y")).rejects.toBeInstanceOf(InvalidRecordIdError);
        await expect(repo.deletePlayer(".", { deleteShots: true })).rejects.toBeInstanceOf(InvalidRecordIdError);
        await expect(repo.saveShot(mutable(makeShot({ shotId: "a\u0000b", sessionId: "s" })))).rejects.toBeInstanceOf(
          InvalidRecordIdError,
        );
        expect(await repo.listShots()).toEqual([]);
      });

      it("applies one portable-id policy in every backend (unpaired surrogates, encoded length)", async () => {
        // "\uD800" has no UTF-8 form; a file name would collide with U+FFFD's.
        await expect(repo.saveShot(mutable(makeShot({ shotId: "a\uD800", sessionId: "s" })))).rejects.toThrow(
          /unpaired UTF-16 surrogates/,
        );
        await expect(repo.saveShot(mutable(makeShot({ shotId: "\uDC00x", sessionId: "s" })))).rejects.toBeInstanceOf(
          InvalidRecordIdError,
        );
        await expect(repo.getShot("\uD800")).rejects.toBeInstanceOf(InvalidRecordIdError);
        // 81 UTF-16 units, but 243 characters as a file name (each upper-case letter -> "%41").
        await expect(repo.saveShot(mutable(makeShot({ shotId: "A".repeat(81), sessionId: "s" })))).rejects.toThrow(
          /encoded file name would be 243 characters/,
        );
        await expect(repo.savePlayer(makePlayer("\u8a9e".repeat(27)))).rejects.toThrow(/would be 243 characters/);
        // The boundary and well-formed astral characters are accepted everywhere.
        const accepted = ["A".repeat(80), "\u{1F3CC}golf", "\uFFFD"];
        for (const id of accepted) await repo.saveShot(makeShot({ shotId: id, sessionId: "s" }));
        expect((await repo.listShots()).map((s) => s.shotId).sort()).toEqual([...accepted].sort());
        expect((await repo.integrityReport()).corruptKeys).toEqual([]);
      });

      it("rejects shots whose sessionId or launch.playerId a cascade delete could never match", async () => {
        await expect(repo.saveShot(mutable(makeShot({ shotId: "q", sessionId: "a/b" })))).rejects.toThrow(
          /sessionId of shot "q": path separators/,
        );
        await expect(
          repo.saveShot(mutable(makeShot({ shotId: "r", sessionId: "s", playerId: ".." }))),
        ).rejects.toThrow(/launch\.playerId of shot "r": path traversal/);
        expect(await repo.listShots()).toEqual([]);
      });
    });
  });
}
