/**
 * Node-only persistence ("@glm/persistence/node"). Never import this from browser code.
 *
 * JsonDirectoryRepository stores one pretty-printed JSON file per record:
 *
 *   <rootDir>/players/<id>.json
 *   <rootDir>/sessions/<id>.json
 *   <rootDir>/shots/<shotId>.json
 *
 * File names come from encodeIdToFileName (path traversal rejected, everything else
 * percent-encoded). Writes are atomic: the JSON is written and fsynced to a temporary
 * ".tmp-*" file in the same directory and then renamed over the target, so a crash leaves
 * either the old or the new file, never a torn one. Leftover temp files are ignored.
 */
import { mkdir, open, readdir, readFile, rename, rm, unlink } from "node:fs/promises";
import { join } from "node:path";
import type { StoreName } from "./errors";
import { decodeFileName, encodeIdToFileName, RECORD_FILE_EXTENSION } from "./file-names";
import { rawShotLink, STORE_NAMES, type ShotLinkField } from "./record-codec";
import { BackendRepository, type CascadeSpec, type RawEntry, type RecordBackend } from "./repository";

export { decodeFileName, encodeIdToFileName } from "./file-names";

const TEMP_PREFIX = ".tmp-";

/** Per-process counter for unique temp names (no clocks or randomness in library logic). */
let tempCounter = 0;

function isNodeError(error: unknown, code: string): boolean {
  return error instanceof Error && (error as NodeJS.ErrnoException).code === code;
}

/**
 * Strict UTF-8: a corrupt byte must make the record corrupt, not silently become U+FFFD
 * inside an otherwise schema-valid string. ignoreBOM keeps a BOM in the text, so a file
 * this backend did not write that way is reported (as invalid JSON) rather than accepted.
 */
const UTF8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

/** Text of a record file; null if it does not exist; `error` if it cannot be read or decoded. */
async function readRecordFile(path: string): Promise<{ text: string } | { error: string } | null> {
  let bytes: Uint8Array;
  try {
    bytes = await readFile(path);
  } catch (error) {
    if (isNodeError(error, "ENOENT")) return null;
    return { error: `file could not be read: ${(error as Error).message}` };
  }
  try {
    return { text: UTF8.decode(bytes) };
  } catch {
    return { error: "file is not valid UTF-8" };
  }
}

function toEntry(key: string, read: { text: string } | { error: string }): RawEntry {
  return "error" in read ? { key, value: undefined, decodeError: read.error } : parseJson(key, read.text);
}

function parseJson(key: string, text: string): RawEntry {
  try {
    return { key, value: JSON.parse(text) as unknown, decodeError: null };
  } catch (error) {
    return { key, value: undefined, decodeError: `file is not valid JSON: ${(error as Error).message}` };
  }
}

class JsonDirectoryBackend implements RecordBackend {
  constructor(private readonly rootDir: string) {
    if (rootDir.length === 0) throw new Error("JsonDirectoryRepository: rootDir must be non-empty");
  }

  private dir(store: StoreName): string {
    return join(this.rootDir, store);
  }

  private file(store: StoreName, key: string): string {
    return join(this.dir(store), encodeIdToFileName(key));
  }

  async get(store: StoreName, key: string): Promise<RawEntry | null> {
    const read = await readRecordFile(this.file(store, key));
    return read === null ? null : toEntry(key, read);
  }

  async getAll(store: StoreName): Promise<RawEntry[]> {
    let names: string[];
    try {
      names = await readdir(this.dir(store));
    } catch (error) {
      if (isNodeError(error, "ENOENT")) return [];
      throw error;
    }
    const entries: RawEntry[] = [];
    for (const name of names.sort()) {
      if (name.startsWith(".") || !name.endsWith(RECORD_FILE_EXTENSION)) continue; // temp/foreign files
      const key = decodeFileName(name);
      if (key === null) {
        entries.push({ key: name, value: undefined, decodeError: `file name "${name}" is not a canonical record file name` });
        continue;
      }
      // One unreadable entry (a directory, no permission) is reported as corrupt instead of
      // failing the whole listing; a file deleted since readdir is simply gone.
      const read = await readRecordFile(join(this.dir(store), name));
      if (read !== null) entries.push(toEntry(key, read));
    }
    return entries;
  }

  async getShotsByLink(field: ShotLinkField, value: string): Promise<RawEntry[]> {
    return (await this.getAll("shots")).filter((e) => rawShotLink(e.value, field) === value);
  }

  async put(store: StoreName, key: string, value: object): Promise<void> {
    const target = this.file(store, key);
    await mkdir(this.dir(store), { recursive: true });
    tempCounter += 1;
    const temp = join(this.dir(store), `${TEMP_PREFIX}${process.pid}-${tempCounter}${RECORD_FILE_EXTENSION}.partial`);
    try {
      const handle = await open(temp, "wx");
      try {
        await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
        await handle.sync();
      } finally {
        await handle.close();
      }
      await rename(temp, target);
    } catch (error) {
      await unlink(temp).catch(() => undefined);
      throw error;
    }
  }

  private async unlinkIfExists(path: string): Promise<boolean> {
    try {
      await unlink(path);
      return true;
    } catch (error) {
      if (isNodeError(error, "ENOENT")) return false;
      throw error;
    }
  }

  async deleteWithCascade(
    store: StoreName,
    key: string,
    cascade: CascadeSpec | null,
  ): Promise<{ existed: boolean; cascaded: number }> {
    const target = this.file(store, key);
    // Not atomic on a file system: children go first, so an interrupted delete leaves the
    // parent in place (and visible) for a retry instead of leaving orphaned shots behind.
    let cascaded = 0;
    if (cascade !== null) {
      for (const name of await this.shotFileNamesLinkedTo(cascade)) {
        if (await this.unlinkIfExists(join(this.dir("shots"), name))) cascaded += 1;
      }
    }
    const existed = await this.unlinkIfExists(target);
    return { existed, cascaded };
  }

  private async shotFileNamesLinkedTo(cascade: CascadeSpec): Promise<string[]> {
    const names: string[] = [];
    for (const entry of await this.getAll("shots")) {
      if (entry.decodeError !== null) continue;
      if (rawShotLink(entry.value, cascade.field) === cascade.value) names.push(encodeIdToFileName(entry.key));
    }
    return names;
  }

  async clear(): Promise<void> {
    // Remove only the directories this repository owns; never the root itself.
    for (const store of STORE_NAMES) await rm(this.dir(store), { recursive: true, force: true });
  }
}

export class JsonDirectoryRepository extends BackendRepository {
  readonly rootDir: string;

  constructor(rootDir: string) {
    super(new JsonDirectoryBackend(rootDir));
    this.rootDir = rootDir;
  }
}
