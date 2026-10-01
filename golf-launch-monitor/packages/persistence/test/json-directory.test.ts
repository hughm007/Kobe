import { mkdtemp, readdir, readFile, rm, writeFile, mkdir, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CorruptRecordError } from "../src/index";
import { decodeFileName, encodeIdToFileName, JsonDirectoryRepository } from "../src/node";
import { makeShot } from "./fixtures";
import { describeRepositoryContract } from "./repository-contract";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describeRepositoryContract("JsonDirectoryRepository (temp dir)", async () => {
  const root = await mkdtemp(join(tmpdir(), "glm-persistence-"));
  return {
    repo: new JsonDirectoryRepository(join(root, "data")),
    writeRaw: async (store, key, raw) => {
      await mkdir(join(root, "data", store), { recursive: true });
      await writeFile(join(root, "data", store, encodeIdToFileName(key)), JSON.stringify(raw));
    },
    canStoreUnderForeignKey: true,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
});

describe("JsonDirectoryRepository specifics", () => {
  let root: string;
  let dataDir: string;
  let repo: JsonDirectoryRepository;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "glm-persistence-"));
    dataDir = join(root, "data");
    repo = new JsonDirectoryRepository(dataDir);
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("writes one pretty-printed JSON file per record and leaves no temp files", async () => {
    const shot = makeShot({ shotId: "shot-1", sessionId: "s" });
    await repo.saveShot(shot);
    await repo.saveShot(shot); // overwrite via rename
    expect(await readdir(join(dataDir, "shots"))).toEqual(["shot-1.json"]);
    const text = await readFile(join(dataDir, "shots", "shot-1.json"), "utf8");
    expect(text.startsWith('{\n  "schemaVersion"')).toBe(true);
    expect(text.endsWith("}\n")).toBe(true);
    expect(JSON.parse(text)).toEqual(shot);
  });

  it("reports malformed JSON as corrupt and throws CorruptRecordError on direct read", async () => {
    await repo.saveShot(makeShot({ shotId: "good", sessionId: "s" }));
    await writeFile(join(dataDir, "shots", "torn.json"), '{"shotId": "torn", "sessi');
    expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["good"]);
    expect((await repo.integrityReport()).corruptKeys).toEqual(["shots/torn"]);
    await expect(repo.getShot("torn")).rejects.toBeInstanceOf(CorruptRecordError);
    await expect(repo.getShot("torn")).rejects.toThrow(/not valid JSON/);
  });

  it("reports invalid UTF-8 as corrupt instead of loading replacement characters", async () => {
    await repo.saveShot(makeShot({ shotId: "good", sessionId: "s" }));
    await repo.saveShot(makeShot({ shotId: "rot", sessionId: "s", launchOverrides: { warnings: ["AAAA"] } }));
    const file = join(dataDir, "shots", "rot.json");
    const bytes = await readFile(file);
    bytes[bytes.indexOf("AAAA") + 1] = 0xff; // one bad byte inside a JSON string
    await writeFile(file, bytes);
    expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["good"]);
    expect((await repo.integrityReport()).corruptKeys).toEqual(["shots/rot"]);
    await expect(repo.getShot("rot")).rejects.toBeInstanceOf(CorruptRecordError);
    await expect(repo.getShot("rot")).rejects.toThrow(/not valid UTF-8/);
  });

  it("reports an unreadable entry as corrupt instead of failing the whole listing", async () => {
    await repo.saveShot(makeShot({ shotId: "good", sessionId: "s" }));
    await mkdir(join(dataDir, "shots", "dir.json")); // reading it fails with EISDIR
    expect((await repo.listShots()).map((s) => s.shotId)).toEqual(["good"]);
    expect((await repo.integrityReport()).corruptKeys).toEqual(["shots/dir"]);
    await expect(repo.getShot("dir")).rejects.toThrow(/could not be read/);
  });

  it("reports non-canonical file names as corrupt and ignores temp/foreign files", async () => {
    await mkdir(join(dataDir, "players"), { recursive: true });
    await writeFile(join(dataDir, "players", "Upper.json"), "{}");
    await writeFile(join(dataDir, "players", ".tmp-123-1.json.partial"), "{");
    await writeFile(join(dataDir, "players", "notes.txt"), "hello");
    expect((await repo.integrityReport()).corruptKeys).toEqual(["players/Upper.json"]);
    expect(await repo.listPlayers()).toEqual([]);
  });

  it("never writes outside its root for hostile ids", async () => {
    await expect(repo.saveShot(makeShot({ shotId: "../../escape", sessionId: "s" }))).rejects.toThrow(
      /path separators/,
    );
    expect(await exists(join(root, "escape.json"))).toBe(false);
    expect(await exists(join(dataDir, "shots"))).toBe(false);
  });

  it("clearAll removes only the repository's own directories", async () => {
    await writeFile(join(root, "unrelated.txt"), "keep me");
    await repo.saveShot(makeShot({ shotId: "x", sessionId: "s" }));
    await repo.clearAll();
    expect(await exists(join(dataDir, "shots"))).toBe(false);
    expect(await readFile(join(root, "unrelated.txt"), "utf8")).toBe("keep me");
  });
});

describe("record file names", () => {
  it("keeps safe ids readable and percent-encodes everything else with uppercase hex", () => {
    expect(encodeIdToFileName("shot-2026_10.01")).toBe("shot-2026_10.01.json");
    expect(encodeIdToFileName("Shot A")).toBe("%53hot%20%41.json");
    expect(encodeIdToFileName("ä")).toBe("%C3%A4.json");
    expect(encodeIdToFileName("50%")).toBe("50%25.json");
  });

  it("encodes leading dots and Windows device names", () => {
    expect(encodeIdToFileName(".hidden")).toBe("%2Ehidden.json");
    expect(encodeIdToFileName("con")).toBe("%63on.json");
    expect(encodeIdToFileName("lpt1.x")).toBe("%6Cpt1.x.json");
  });

  it("is injective even under case folding, and decodes back exactly", () => {
    const ids = ["a", "A", "Ab", "aB", "ab", "%41", "%", " ", "con", "Con", "ä", "Ä", "a..b", ".x"];
    const names = ids.map(encodeIdToFileName);
    expect(new Set(names.map((n) => n.toLowerCase())).size).toBe(ids.length);
    for (const id of ids) expect(decodeFileName(encodeIdToFileName(id))).toBe(id);
  });

  it("rejects traversal and overlong ids; decodes only canonical names", () => {
    expect(() => encodeIdToFileName("..")).toThrow(/path traversal/);
    expect(() => encodeIdToFileName("a/b")).toThrow(/path separators/);
    expect(() => encodeIdToFileName("Ä".repeat(41))).toThrow(/encoded file name/); // 41 x 6 = 246 chars
    expect(encodeIdToFileName("a".repeat(200))).toBe(`${"a".repeat(200)}.json`);
    expect(() => encodeIdToFileName("a".repeat(201))).toThrow(/longer than 200/);
    expect(decodeFileName("Upper.json")).toBeNull();
    expect(decodeFileName("%ZZ.json")).toBeNull();
    expect(decodeFileName("%2E%2E.json")).toBeNull();
    expect(decodeFileName("plain.txt")).toBeNull();
  });

  it("rejects unpaired surrogates, which would share U+FFFD's file name", () => {
    expect(encodeIdToFileName("\uFFFD")).toBe("%EF%BF%BD.json");
    expect(() => encodeIdToFileName("\uD800")).toThrow(/unpaired UTF-16 surrogates/);
    expect(() => encodeIdToFileName("x\uDFFF")).toThrow(/unpaired/);
    expect(encodeIdToFileName("\u{1F3CC}")).toBe("%F0%9F%8F%8C.json");
    expect(decodeFileName("%ED%A0%80.json")).toBeNull(); // CESU-style encoding of "\uD800"
  });
});
