#!/bin/bash
# A4 end-to-end build in one sandbox lease: stage -> track -> flag fix v3 -> gallery fix -> persist clean clip -> end shot ->
# end card -> mix -> assemble -> QC -> frame sheets -> persist master and build kit. Logs to pipe.log; prints PIPEDONE.
cd /home/user/tnx6 && mkdir -p src fonts out voice mus clip qc
M=https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
G=https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
DR='https://drive.usercontent.google.com/download?export=download&confirm=t&id='
get(){ [ -s "$1" ] || curl -sSfL -o "$1" "$2"; }
put(){ [ -s "$1.put" ] || curl -sS --http1.1 -o /dev/null -w '%{http_code}' -X PUT -H "Content-Type: $3" -H 'If-None-Match: *' --upload-file "$1" "$(cat $2)" > "$1.put"; echo "PUT $1 $(cat $1.put)"; }
T0=$(date +%s); st(){ echo "== $1 ($(( $(date +%s)-T0 )) s)"; }
st stage
get src/v19.mp4 "${DR}1ELgj5cDrF9wuvTblkdsqTZ2BQJS1BhTz" &
get src/v25.mp4 "${DR}1o5qgIWsBSFuujQ4eZOCJPyCt07ekZ3-a" &
get src/house.mp4 $G/hf_20261007_005738_ddb843fe-31cf-4c82-a6a8-d9840237c90b.mp4 &
get src/veranda2.mp4 $G/hf_20261007_010436_f2a20ca1-f10b-489a-ad95-6ac958f1e5c4.mp4 &
get src/logo46.png $M/46ae277a-7897-4574-b995-38097233d77c.png &
get clip/A4k.mp4 $G/hf_20261007_115627_a852db04-d836-43aa-9c23-44d80e0842da.mp4 &
get voice/take2.wav $G/hf_20261007_123330_505d1f23-146e-4b4c-ab50-e1a9f7e34bad.wav &
get mus/m470.mp3 https://assets.mixkit.co/music/470/470.mp3 &
for f in Bold SemiBold ExtraBold; do get fonts/Montserrat-$f.ttf https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-$f.ttf & done
(python3 -c "import cv2" 2>/dev/null || python3 -m pip install --user -q opencv-python-headless >/dev/null 2>&1; echo CV2 $?) &
wait
md5sum src/* clip/A4k.mp4 voice/take2.wav mus/m470.mp3 fonts/* *.py *.sh
st track;    (cd clip && python3 ../track.py A4k.mp4 > track.log 2>&1; tail -1 track.log)
st flagfix3; (cd clip && python3 ../flagfix3.py A4k.mp4 track.json A4k_ff3.mp4 81 2>&1 | tail -1 | cut -c1-400)
st gallfix;  (cd clip && python3 ../gallfix_a4.py 2>&1 | tail -1; md5sum A4k_clean3.mp4)
put clip/A4k_clean3.mp4 url_clean3.txt video/mp4
st kit;      tar czf a4_build.tar.gz *.py *.sh && md5sum a4_build.tar.gz && put a4_build.tar.gz url_kit.txt application/octet-stream
st endclip;  python3 endclip.py clip/A4k_clean3.mp4 clip/track.json 3.08 2>&1 | tail -4
st card;     python3 card.py 2.62 2.5 2>&1 | tail -1
st mix;      python3 mix4.py mus/m470.mp3 voice/take2.wav 2>&1 | grep -v -i warn | tail -3
st assemble; python3 assemble4.py 2>&1 | tail -2
st qc;       python3 servicepow_qc.py out/TN-AUG-A4.mp4 --master --aspect 9:16 --duration 18.12 --endcard 2.5 > qc/harness.txt 2>&1; tail -22 qc/harness.txt
ffmpeg -i out/TN-AUG-A4.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|LRA:|Peak:)" | tail -3
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of compact out/TN-AUG-A4.mp4
md5sum out/TN-AUG-A4.mp4 out/endclip.mp4 out/card.mp4 out/mix.wav out/music4.wav out/vo_edit.wav; cat out/ticks.json
st sheets
ffmpeg -v error -y -i out/TN-AUG-A4.mp4 -vf "fps=2,scale=216:384,tile=9x4" -frames:v 1 -q:v 4 qc/A4-contact.jpg
ffmpeg -v error -y -i out/TN-AUG-A4.mp4 -vf "select='eq(n\,393)+eq(n\,405)+eq(n\,420)+eq(n\,435)+eq(n\,450)+eq(n\,462)+eq(n\,470)+eq(n\,477)',scale=360:640,tile=8x1" -frames:v 1 -q:v 3 qc/A4-end.jpg
ffmpeg -v error -y -i out/TN-AUG-A4.mp4 -vf "select='eq(n\,472)+eq(n\,480)+eq(n\,490)+eq(n\,500)+eq(n\,512)+eq(n\,520)+eq(n\,530)+eq(n\,540)',scale=360:640,tile=8x1" -frames:v 1 -q:v 3 qc/A4-card.jpg
(cd clip && python3 ../flagsheet.py A4k_clean3.mp4 f3 2>&1 | tail -1)
put out/TN-AUG-A4.mp4 url_master.txt video/mp4
st done; echo PIPEDONE
