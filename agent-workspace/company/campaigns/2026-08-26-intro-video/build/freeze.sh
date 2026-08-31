#!/usr/bin/env bash
# Freeze gate artifacts (rule P1, adopted after the boil re-render mutated files
# under Kobe's review). Copies masters + a frame manifest into gates/<round>/
# and records SHA-256 for everything, so a gate always runs on an immutable set.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROUND="${1:?usage: freeze.sh <round-name> <file...>}"; shift
DEST="$HERE/gates/$ROUND"; mkdir -p "$DEST"
for f in "$@"; do cp "$f" "$DEST/"; done
( cd "$DEST" && sha256sum * > SHA256SUMS )
echo "frozen -> $DEST"; cat "$DEST/SHA256SUMS"
