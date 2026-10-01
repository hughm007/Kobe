/**
 * Portable record ids, and the record id <-> file name mapping of the JSON-directory
 * backend. Pure string logic (no Node APIs) so it can be used and unit-tested anywhere.
 *
 * The portable-id policy lives next to the file-name mapping because file names are the
 * most restrictive storage medium: every backend applies assertPortableId, so an id that
 * one backend accepts is accepted by all of them and records can always be moved between
 * backends.
 *
 * File-name design:
 * - Path traversal is rejected outright (no separators, no "." / "..").
 * - Every character outside [a-z0-9_.-] is UTF-8 percent-encoded with UPPERCASE hex,
 *   including upper-case letters. The output therefore never contains two names that differ
 *   only by letter case, so distinct ids cannot collide on case-insensitive file systems
 *   (macOS, Windows).
 * - A leading "." is encoded so records are never hidden files and never collide with the
 *   backend's ".tmp-*" files; Windows device names (CON, NUL, COM1, ...) get their first
 *   character encoded.
 * - Ids with unpaired UTF-16 surrogates are rejected: UTF-8 cannot represent them
 *   (TextEncoder would silently turn "\uD800" into the bytes of U+FFFD), so they would
 *   collide with real characters. On the remaining, well-formed ids the mapping is
 *   injective and decodeFileName(encodeIdToFileName(id)) === id.
 */
import { InvalidRecordIdError } from "./errors";

export const RECORD_FILE_EXTENSION = ".json";

/** Ids longer than this (UTF-16 code units) are rejected by every backend. */
export const MAX_ID_LENGTH = 200;

/** Keeps "<encoded>.json" within the 255-byte file-name limit of common file systems. */
export const MAX_ENCODED_ID_LENGTH = 240;

const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/;

/** A high surrogate not followed by a low one, or a low surrogate not preceded by a high one. */
const UNPAIRED_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

function percentEncodeChar(ch: string): string {
  let out = "";
  for (const byte of new TextEncoder().encode(ch)) out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
  return out;
}

/** File-name stem of an id that already passed the character checks of assertPortableId. */
function encodeStem(id: string): string {
  let encoded = "";
  for (const ch of id) encoded += /^[a-z0-9_.-]$/.test(ch) ? ch : percentEncodeChar(ch);
  if (encoded.startsWith(".")) encoded = `%2E${encoded.slice(1)}`;
  if (WINDOWS_RESERVED.test(encoded)) encoded = `${percentEncodeChar(encoded[0] as string)}${encoded.slice(1)}`;
  return encoded;
}

/**
 * Portable-id policy shared by every backend. Rejects path separators, "." / "..",
 * control characters, unpaired surrogates, and ids too long for a file name once
 * percent-encoded (a character outside [a-z0-9_.-] costs 3 characters per UTF-8 byte).
 */
export function assertPortableId(id: string): void {
  if (typeof id !== "string" || id.length === 0) throw new InvalidRecordIdError(String(id), "id must be a non-empty string");
  if (id.length > MAX_ID_LENGTH) throw new InvalidRecordIdError(id, `id longer than ${MAX_ID_LENGTH} characters`);
  if (id === "." || id === "..") throw new InvalidRecordIdError(id, "path traversal ('.' / '..') is not allowed");
  if (id.includes("/") || id.includes("\\")) {
    throw new InvalidRecordIdError(id, "path separators ('/' or '\\') are not allowed");
  }
  if (/[\u0000-\u001f\u007f]/.test(id)) throw new InvalidRecordIdError(id, "control characters are not allowed");
  if (UNPAIRED_SURROGATE.test(id)) {
    throw new InvalidRecordIdError(id, "unpaired UTF-16 surrogates are not allowed (the id is not valid Unicode text)");
  }
  const encodedLength = encodeStem(id).length;
  if (encodedLength > MAX_ENCODED_ID_LENGTH) {
    throw new InvalidRecordIdError(
      id,
      `encoded file name would be ${encodedLength} characters (limit ${MAX_ENCODED_ID_LENGTH}); ` +
        "characters outside [a-z0-9_.-] take 3 per UTF-8 byte",
    );
  }
}

export function encodeIdToFileName(id: string): string {
  assertPortableId(id);
  return `${encodeStem(id)}${RECORD_FILE_EXTENSION}`;
}

/**
 * Inverse of encodeIdToFileName. Returns null for names this backend would never have
 * written (bad escapes, non-canonical spellings such as "Shot.json"), which the
 * repository then reports as corrupt rather than guessing.
 */
export function decodeFileName(fileName: string): string | null {
  if (!fileName.endsWith(RECORD_FILE_EXTENSION)) return null;
  const encoded = fileName.slice(0, -RECORD_FILE_EXTENSION.length);
  let id: string;
  try {
    id = decodeURIComponent(encoded);
  } catch {
    return null;
  }
  try {
    return encodeIdToFileName(id) === fileName ? id : null;
  } catch {
    return null;
  }
}
