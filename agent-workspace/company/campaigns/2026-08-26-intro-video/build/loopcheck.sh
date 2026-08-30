#!/usr/bin/env bash
# Measures the autoplay-loop handoff: how close is the last frame to the first?
# video-production.md step 4b: "a hard cut back to frame 1 reads broken".
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
for SET in "$@"; do
  D="$HERE/frames/$SET"
  [ -d "$D" ] || { echo "$SET: no frames"; continue; }
  V=$(ffmpeg -v info -i "$D/01799.png" -i "$D/00000.png" -filter_complex psnr -f null - 2>&1 \
      | grep -oP 'average:\K(inf|[0-9.]+)' | tail -1)
  if [ "$V" = "inf" ]; then
    printf "%-12s PSNR(1799 -> 0) = inf  (frames identical - seamless loop)\n" "$SET"
  else
    printf "%-12s PSNR(1799 -> 0) = %s dB\n" "$SET" "$V"
  fi
done
