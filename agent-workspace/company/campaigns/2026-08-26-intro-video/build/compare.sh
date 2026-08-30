#!/usr/bin/env bash
# Side-by-side control vs challenger, from the two rendered frame sets.
# Usage: ./compare.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
A="$HERE/frames/full"; B="$HERE/frames/challenger"; OUT="$HERE/out"; mkdir -p "$OUT"
[ -d "$A" ] || { echo "missing $A — render the control first"; exit 1; }
[ -d "$B" ] || { echo "missing $B — render the challenger first"; exit 1; }

ffmpeg -y -hide_banner -loglevel warning \
  -framerate 30 -start_number 0 -i "$A/%05d.png" \
  -framerate 30 -start_number 0 -i "$B/%05d.png" \
  -filter_complex "\
[0:v]scale=940:-1,pad=960:552:10:6:color=0xF7F5F0,\
drawtext=text='CONTROL':x=20:y=520:fontsize=22:fontcolor=0x555555[a];\
[1:v]scale=940:-1,pad=960:552:10:6:color=0xF7F5F0,\
drawtext=text='CHALLENGER':x=20:y=520:fontsize=22:fontcolor=0x555555[b];\
[a][b]hstack=inputs=2[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -r 30 \
  "$OUT/compare-control-vs-challenger.mp4"

echo "--- ffprobe evidence ---"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames \
  -show_entries format=duration,size -of default=noprint_wrappers=1 \
  "$OUT/compare-control-vs-challenger.mp4"
