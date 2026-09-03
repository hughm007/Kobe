#!/bin/bash
set -e
A=build/assets; O=build/out
# 1. trim each generated shot to its beat length (hard cuts, no dissolves)
ffmpeg -y -v error -i $A/S1.mp4 -t 2.5 -an -c:v libx264 -pix_fmt yuv420p $O/c1.mp4
ffmpeg -y -v error -i $A/S2.mp4 -t 3.5 -an -c:v libx264 -pix_fmt yuv420p $O/c2.mp4
ffmpeg -y -v error -i $A/S3.mp4 -t 3.0 -an -c:v libx264 -pix_fmt yuv420p $O/c3.mp4
ffmpeg -y -v error -i $A/S4.mp4 -t 2.5 -an -c:v libx264 -pix_fmt yuv420p $O/c4.mp4
ffmpeg -y -v error -i $A/S5.mp4 -t 2.5 -an -c:v libx264 -pix_fmt yuv420p $O/c5.mp4
ffmpeg -y -v error -i $A/S6.mp4 -t 3.0 -an -c:v libx264 -pix_fmt yuv420p $O/c6.mp4
# 2. concat -> silent visual master
printf "file 'c1.mp4'\nfile 'c2.mp4'\nfile 'c3.mp4'\nfile 'c4.mp4'\nfile 'c5.mp4'\nfile 'c6.mp4'\n" > $O/list.txt
ffmpeg -y -v error -f concat -safe 0 -i $O/list.txt -c copy $O/silent.mp4
# 3. composite controlled text (real glyphs, never generated)
ffmpeg -y -v error -i $O/silent.mp4 \
 -i $A/txt-caption.png -i $A/txt-strap.png -i $A/txt-s4.png -i $A/txt-s5.png \
 -filter_complex "[0:v][1:v]overlay=0:0:enable='between(t,3.0,7.0)'[a];\
[a][2:v]overlay=0:0:enable='between(t,5.5,14.0)'[b];\
[b][3:v]overlay=0:0:enable='between(t,9.0,11.5)'[c];\
[c][4:v]overlay=0:0:enable='between(t,11.5,14.0)'" \
 -c:v libx264 -crf 19 -pix_fmt yuv420p -r 30 $O/visual-master.mp4
# 4. audio bed: place VO at scripted marks, mix to one track
ffmpeg -y -v error -f lavfi -i anullsrc=r=48000:cl=stereo -t 17.0 -c:a pcm_s16le $O/bed.wav
ffmpeg -y -v error -i $O/bed.wav \
 -i build/audio/vo1.aiff -i build/audio/vo2.aiff -i build/audio/vo4.aiff \
 -i build/audio/vo5.aiff -i build/audio/vo6.aiff \
 -filter_complex "[1:a]adelay=300|300[v1];[2:a]adelay=3000|3000[v2];[3:a]adelay=9200|9200[v4];\
[4:a]adelay=11600|11600[v5];[5:a]adelay=13300|13300[v6];\
[0:a][v1][v2][v4][v5][v6]amix=inputs=6:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[out]" \
 -map "[out]" -c:a pcm_s16le $O/vo-mix.wav
# 5. mux
ffmpeg -y -v error -i $O/visual-master.mp4 -i $O/vo-mix.wav -c:v copy -c:a aac -b:a 192k -shortest $O/911drain-lookusup-v1.mp4
echo "BUILT: $O/911drain-lookusup-v1.mp4"
ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_name:format=duration -of default=nw=1 $O/911drain-lookusup-v1.mp4
