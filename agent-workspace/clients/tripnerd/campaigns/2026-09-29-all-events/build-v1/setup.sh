#!/bin/bash
# stage all inputs for the camera-roll build into /home/user/cr (idempotent)
mkdir -p /home/user/cr/src /home/user/cr/gal /home/user/cr/fonts && cd /home/user/cr
(python3 -c "import cv2" 2>/dev/null || pip install -q opencv-python-headless >/dev/null 2>&1; echo PIP $?) &
M=https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
G=https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
while read n id; do [ -s src/${n}_at.png ] || curl -sSf -o src/${n}_at.png $M/$id.png & done <<'EOF'
p098 8a79dae1-a1ad-47cb-be73-84463ccd0313
p078 d52a1353-ed27-4368-a2ec-ff5346639742
p020 24869dac-5435-48df-bba7-975028bfe2af
p026 2bd1add7-6d7c-415c-91e7-d860d27f068e
p030 dd5d0466-e4a4-433c-80e3-24b2de2525f3
p001 5aa5c4b3-6659-4ec1-b8ba-032b75538f84
p062 f5bd27b6-002c-4ac4-9e2a-9fd03220d4cb
p022 0ce6b1fe-aa40-4c92-bf5d-31990b67494b
p085 a83c3264-22c7-476f-b40a-1befd3a62e8d
p084 04269d5c-28df-44ac-ab4b-3741dad752a7
EOF
[ -s src/v23up.mp4 ] || curl -sSf -o src/v23up.mp4 $G/hf_20260929_201916_e2f6c3dd-5916-464f-8765-5d147e198464.mp4 &
[ -s src/v24up.mp4 ] || curl -sSf -o src/v24up.mp4 $G/hf_20260929_201917_805549e6-9267-4060-91a7-314b1fc3266b.mp4 &
[ -s src/v23.mp4 ] || curl -sSf -o src/v23.mp4 $M/d925d5be-f787-4d64-b9fb-e084c07c709b.mp4 &
[ -s src/v24.mp4 ] || curl -sSf -o src/v24.mp4 $M/2911d9d6-b5c8-4b80-b158-6139277672e1.mp4 &
[ -s src/logo.png ] || curl -sSf -o src/logo.png $M/46ae277a-7897-4574-b995-38097233d77c.png &
[ -s fonts/extras/ttf/Inter-Bold.ttf ] || (curl -sSfL -o fonts/Inter.zip https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip && cd fonts && unzip -o -q Inter.zip) &
for f in Bold SemiBold ExtraBold; do [ -s fonts/Montserrat-$f.ttf ] || curl -sSfL -o fonts/Montserrat-$f.ttf https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-$f.ttf & done
if [ ! -s galmap.txt ]; then
  curl -sSfL -A 'Mozilla/5.0' -o nerds.html https://www.tripnerd.com/nerds
  grep -oE 'https://cdn\.prod\.website-files\.com/[^"'"'"' )]*tripnerd_gallery_[0-9]+\.(jpg|jpeg|png|webp)' nerds.html | awk '!s[$0]++' > gal.txt
  i=0; while read u; do i=$((i+1)); n=$(printf 'g%03d' $i); echo "$n $u" >> galmap.txt; curl -sSf -o gal/$n.jpg "$u" & if [ $((i%12)) = 0 ]; then wait; fi; done < gal.txt
fi
wait
echo "SETUP src=$(ls src | wc -l) gal=$(ls gal | wc -l) map=$(wc -l < galmap.txt) fonts=$(ls fonts/*.ttf fonts/extras/ttf 2>/dev/null | wc -l)"
