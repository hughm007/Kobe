#!/bin/bash
# Replace the last N seconds of a finished advert with a new static card, keeping the original audio untouched.
# usage: endcard_swap.sh <src.mp4> <card.png> <cut_at_seconds> <total_seconds> <out.mp4>   (crossfade 0.4 s; card runs cut_at..total)
SRC=$1; CARD=$2; CUT=$3; TOTAL=$4; OUT=$5; FPS=30
CARD_DUR=$(python3 -c "print(round($TOTAL-$CUT+0.4,3))"); OFF=$(python3 -c "print(round($CUT-0.4,3))")
ffmpeg -y -v error -loop 1 -t $CARD_DUR -i "$CARD" -vf "fps=$FPS,format=yuv420p" -c:v libx264 -preset fast -crf 14 -r $FPS card_tmp.mp4
ffmpeg -y -v error -i "$SRC" -i card_tmp.mp4 -filter_complex "[0:v]trim=0:$CUT,setpts=PTS-STARTPTS,fps=$FPS,format=yuv420p[a];[1:v]fps=$FPS,format=yuv420p[b];[a][b]xfade=transition=fade:duration=0.4:offset=$OFF,format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -r $FPS -c:a copy -t $TOTAL -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate,pix_fmt -of csv=p=0 "$OUT"
