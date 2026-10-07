#!/bin/bash
# TripNerd ROAR reel: stage inputs (idempotent). Durable sources on Higgsfield storage; fonts from GitHub (OFL).
M=https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
G=https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
mkdir -p src fonts out
[ -s src/v24.mp4 ] || curl -sSf -o src/v24.mp4 $M/2911d9d6-b5c8-4b80-b158-6139277672e1.mp4 &            # V24 original (720x1280, 24 fps): the audio source
[ -s src/up.mp4 ] || curl -sSf -o src/up.mp4 $G/hf_20261006_203459_da1caa66-da93-4beb-9987-188ac87e660e.mp4 &   # V24 upscaled 1080x1920/30 (bytedance ugc, 2026-10-06)
[ -s src/logo.png ] || curl -sSf -o src/logo.png $M/46ae277a-7897-4574-b995-38097233d77c.png &
[ -s fonts/Anton-Regular.ttf ] || curl -sSfL -o fonts/Anton-Regular.ttf https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf &
for f in ExtraBold SemiBold; do [ -s fonts/Montserrat-$f.ttf ] || curl -sSfL -o fonts/Montserrat-$f.ttf https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-$f.ttf & done
wait
[ -s src/a_win.wav ] || ffmpeg -v error -y -ss 11.4 -t 8.0 -i src/v24.mp4 -vn -ac 2 -ar 48000 -c:a pcm_s16le src/a_win.wav   # film 0 = source 11.4 s
ls -la src fonts | grep -v '^total\|^d'
