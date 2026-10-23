/**
 * Node-only replay file IO ("@glm/sensor-adapters/node"). Kept out of the main entry point
 * so browser bundles never pull in node:fs.
 */
import { readFile, rename, writeFile } from "node:fs/promises";
import { parseReplay, ReplayFormatError, serializeReplay } from "./replay-format";
import type { ParsedReplay, ReplayContent } from "./replay-format";

/** Read and validate a replay file. Format errors are re-thrown with the file path prefixed. */
export async function readReplayFile(path: string): Promise<ParsedReplay> {
  const text = await readFile(path, "utf8");
  try {
    return parseReplay(text);
  } catch (error) {
    if (error instanceof ReplayFormatError) {
      throw new ReplayFormatError(error.detail, error.lineNumber, error.issues, path);
    }
    throw error;
  }
}

/**
 * Validate, serialize and write a replay. The text is written to a sibling ".partial" file
 * and renamed into place, so a crash never leaves a truncated replay at `path`.
 */
export async function writeReplayFile(path: string, replay: ReplayContent): Promise<void> {
  const text = serializeReplay(replay);
  const partial = `${path}.partial`;
  await writeFile(partial, text, "utf8");
  await rename(partial, path);
}
