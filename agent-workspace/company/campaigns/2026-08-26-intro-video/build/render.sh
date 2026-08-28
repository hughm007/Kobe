#!/usr/bin/env bash
# Frames -> MP4. Usage: ./render.sh <frames-subdir> <start-frame> <output-name>
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SUB="${1:?frames subdir, e.g. proof}"
START="${2:?first frame number, e.g. 450}"
NAME="${3:?output basename}"
IN="$HERE/frames/$SUB"
OUT="$HERE/out"; mkdir -p "$OUT"

ffmpeg -y -hide_banner -loglevel warning \
  -framerate 30 -start_number "$START" -i "$IN/%05d.png" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -movflags +faststart -r 30 \
  "$OUT/$NAME.mp4"

echo "--- ffprobe evidence ---"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames,pix_fmt \
  -show_entries format=duration,size -of default=noprint_wrappers=1 "$OUT/$NAME.mp4"
