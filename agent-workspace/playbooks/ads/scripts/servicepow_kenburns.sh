#!/bin/bash
# Illustrated-lane motion: still PNG -> 1080x1920 clip with slow push/pan.
# usage: servicepow_kenburns.sh in.png out.mp4 dur zoom_from zoom_to [pan: c|up|down]
IN=$1; OUT=$2; D=$3; Z0=${4:-1.0}; Z1=${5:-1.12}; PAN=${6:-c}; FR=30; N=$(echo "$D*$FR" | bc | cut -d. -f1)
case $PAN in
 up)   Y="ih/2-(ih/zoom/2)-(on/$N)*ih*0.06";;
 down) Y="ih/2-(ih/zoom/2)+(on/$N)*ih*0.06";;
 *)    Y="ih/2-(ih/zoom/2)";;
esac
ffmpeg -y -v error -loop 1 -i "$IN" -t "$D" -filter_complex \
"[0:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,\
zoompan=z='$Z0+($Z1-$Z0)*on/$N':x='iw/2-(iw/zoom/2)':y='$Y':d=$N:s=1080x1920:fps=$FR,format=yuv420p" \
-c:v libx264 -crf 19 "$OUT"
