#!/usr/bin/env bash
# Replace the picture of the opening clip (source frames 0-96 at 24 fps) with a new shot; keep the source audio untouched.
# advert.mov = owner's 720p cut, drone.mp4 = new opening (>= 97 frames from frame 23), title2.png from title_overlay.py.
# Body starts at source frame 97 because the owner's title layer overruns the cut by one frame; opening is 97 frames to hold sync.
set -e
ffmpeg -y -i advert.mov -i drone.mp4 -loop 1 -t 4.0417 -i title2.png -filter_complex "\
[1:v]trim=start_frame=23:end_frame=120,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,format=yuv420p,setsar=1[dr];\
[2:v]format=rgba,fade=t=in:st=0.04:d=0.17:alpha=1,fps=24[tt];\
[dr][tt]overlay=0:0:shortest=1:format=auto,format=yuv420p[open];\
[0:v]trim=start=4.03,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,format=yuv420p,setsar=1[body];\
[open][body]concat=n=2:v=1:a=0,format=yuv420p[v]" \
-map "[v]" -map 0:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -r 24 -c:a copy -movflags +faststart out2.mp4
