#!/bin/bash
# v8 assembly: chat -> whip -> golf (vertical tracked crop) -> whip -> celebration orbit -> end card
set -euo pipefail
cd /home/user/v8
B=https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
[ -f long.mp4 ] || curl -sf -o long.mp4 $B/hf_20261006_224852_f9d556b4-32e3-4239-bbad-d0b53e7d8b8c.mp4
[ -f logo_fe.png ] || curl -sfL -o logo_fe.png "https://cdn.prod.website-files.com/697ae7a00afa01083b5681df/697ccdde03e1c807ff42ea30_tripnerd-fan-experiences_logo%403x.png"
E="-an -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p"
GOLF_IN=0.8; GOLF_LEN=4.24; ORB_IN=0.0; ORB_LEN=8.0; XF=0.3
# --- A: chat (rendered frames) ---
ffmpeg -v error -y -framerate 30 -i cf/%04d.png -vf "setsar=1,format=yuv420p" $E sA.mp4
# --- B: golf, 9:16 window following flag+ball ---
python3 - <<'EOF'
import json
d = json.load(open('track.json')); c = d['centre']
fps = 24.0; W = 608
lines = []
for i, x in enumerate(c):
    x0 = int(min(1920 - W, max(0, x - W / 2)))
    lines.append(f"{i / fps:.4f} crop x {x0};")
open('crop.cmd', 'w').write('\n'.join(lines) + '\n')
EOF
ffmpeg -v error -y -i golf.mp4 -filter_complex "[0]sendcmd=f=crop.cmd,crop=608:1080:0:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,fps=30,setsar=1,format=yuv420p" $E golf_v.mp4
ffmpeg -v error -y -ss $GOLF_IN -t $GOLF_LEN -i golf_v.mp4 $E sB.mp4
# --- C: celebration orbit ---
ffmpeg -v error -y -ss $ORB_IN -t $ORB_LEN -i orbs.mp4 -vf "scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p" $E sC.mp4
# --- D: end card (real logo file) ---
F=$(fc-match -f '%{file}' 'Montserrat:extrabold')
convert -size 1080x1920 xc:'#07283d' bg.png
convert logo_fe.png -resize 720x logo.png
convert -background none -fill '#5cc0ff' -font "$F" -pointsize 38 -kerning 4 label:'THE AUGUSTA EXPERIENCE' eyebrow.png
convert -background none -fill white -font "$F" -pointsize 70 label:'Be there for the moment.' head.png
convert -background none -fill '#dbe6ee' -font "$F" -pointsize 36 label:'Course passes · Private home · Daily hospitality' sub.png
convert -size 520x132 xc:none -fill '#2ea3f2' -draw 'roundrectangle 0,0 519,131 66,66' -fill white -font "$F" -pointsize 52 -gravity center -annotate +0+0 'Book now' cta.png
convert -background none -fill '#e6eef4' -font "$F" -pointsize 40 label:'tripnerd.com' url.png
ffmpeg -v error -y -loop 1 -t 2.5 -i bg.png -loop 1 -t 2.5 -i logo.png -loop 1 -t 2.5 -i eyebrow.png -loop 1 -t 2.5 -i head.png -loop 1 -t 2.5 -i sub.png -loop 1 -t 2.5 -i cta.png -loop 1 -t 2.5 -i url.png -filter_complex "[1]format=rgba,fade=in:st=0:d=0.15:alpha=1[l];[2]format=rgba,fade=in:st=0.05:d=0.15:alpha=1[e];[3]format=rgba,fade=in:st=0.1:d=0.15:alpha=1[h];[4]format=rgba,fade=in:st=0.15:d=0.15:alpha=1[s];[5]format=rgba,fade=in:st=0.2:d=0.15:alpha=1[c];[6]format=rgba,fade=in:st=0.25:d=0.15:alpha=1[u];[0][l]overlay=(W-w)/2:390:shortest=1[a];[a][e]overlay=(W-w)/2:720[b];[b][h]overlay=(W-w)/2:792[d];[d][s]overlay=(W-w)/2:902[f];[f][c]overlay=(W-w)/2:1000[g];[g][u]overlay=(W-w)/2:1170,fps=30,scale=2160:3840,zoompan=z='1+0.025*on/75':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,format=yuv420p" $E sD.mp4
# --- picture: whip-pan transitions (slide + motion blur), hard cut into end card ---
dA=5.6; dB=$GOLF_LEN; dC=$ORB_LEN
oB=$(awk "BEGIN{print $dA-$XF}"); oC=$(awk "BEGIN{print $dA+$dB-2*$XF-0}")
ffmpeg -v error -y -i sA.mp4 -i sB.mp4 -i sC.mp4 -i sD.mp4 -filter_complex "[0][1]xfade=transition=slideleft:duration=$XF:offset=$oB[ab];[ab][2]xfade=transition=slideleft:duration=$XF:offset=$oC[abc];[abc][3]concat=n=2:v=1:a=0,format=yuv420p[v]" -map "[v]" $E pic_raw.mp4
T_B=$oB; T_C=$oC; T_D=$(awk "BEGIN{print $oC+$dC}"); TOT=$(awk "BEGIN{print $T_D+2.5}")
# motion blur only inside the two whip windows
ffmpeg -v error -y -i pic_raw.mp4 -vf "split[a][b];[b]tmix=frames=5:weights='1 1 1 1 1'[m];[a][m]overlay=enable='between(t,$T_B,$T_B+$XF)+between(t,$T_C,$T_C+$XF)'" $E pic.mp4
echo "T_B=$T_B T_C=$T_C T_D=$T_D TOT=$TOT"
# --- audio ---
python3 /home/user/v8/music.py music.wav $(awk "BEGIN{print $TOT-4.55}") $(awk "BEGIN{print $T_C-4.55}") $(awk "BEGIN{print $T_D-4.55}")
python3 - <<'EOF'
import json, subprocess
cues = json.load(open('cf/cues.json'))
with open('chat_sfx.txt', 'w') as f:
    f.write(' '.join(str(int(c['t'] * 1000)) + (':o' if c['me'] else ':i') for c in cues))
EOF
sox -n -r 48000 -c 2 blip_i.wav synth 0.09 sine 1180 sine 1580 fade q 0.003 0.09 0.06 gain -14
sox -n -r 48000 -c 2 blip_o.wav synth 0.16 pinknoise lowpass 3000 highpass 600 fade q 0.01 0.16 0.12 gain -16
sox -n -r 48000 -c 2 whip.wav synth 0.35 pinknoise highpass 900 lowpass 6000 fade q 0.12 0.35 0.2 gain -10
sox -n -r 48000 -c 2 room.wav synth 6 brownnoise lowpass 300 gain -44
A(){ ffmpeg -v error -y -ss $2 -t $3 -i $1 -vn -ac 2 -ar 48000 -af "afade=in:d=0.05,afade=out:st=$(awk "BEGIN{print $3-0.12}"):d=0.12" $4.wav; }
A golf.mp4 $GOLF_IN $GOLF_LEN ag; A long.mp4 4.3 4.6 al; A orbs.mp4 $ORB_IN $ORB_LEN ao
INP=""; FC=""; k=0
for c in $(cat chat_sfx.txt); do ms=${c%%:*}; ty=${c##*:}; INP="$INP -i blip_$ty.wav"; FC="$FC[$((k+8))]adelay=$ms|$ms[s$k];"; k=$((k+1)); done
MS=""; for i in $(seq 0 $((k-1))); do MS="$MS[s$i]"; done
tb=$(awk "BEGIN{print int($T_B*1000)}"); tc=$(awk "BEGIN{print int($T_C*1000)}"); tl=$(awk "BEGIN{print int(($T_B+$GOLF_LEN-1.65)*1000)}")
ffmpeg -v error -y -i room.wav -i music.wav -i ag.wav -i al.wav -i ao.wav -i whip.wav -i whip.wav -i blip_o.wav $INP -filter_complex "\
[0]volume=1.0[r];\
[1]adelay=4550|4550,volume=0.62[m];\
[2]volume='0.5+1.3*t/$GOLF_LEN':eval=frame,adelay=$tb|$tb[g];\
[3]volume=1.1,afade=in:d=0.6,adelay=$tl|$tl[l];\
[4]volume=1.0,afade=in:d=0.2,afade=out:st=$(awk "BEGIN{print $ORB_LEN-1.2}"):d=1.2,adelay=$tc|$tc[o];\
[5]adelay=$(awk "BEGIN{print int(($T_B-0.05)*1000)}")|$(awk "BEGIN{print int(($T_B-0.05)*1000)}")[w1];\
[6]adelay=$(awk "BEGIN{print int(($T_C-0.05)*1000)}")|$(awk "BEGIN{print int(($T_C-0.05)*1000)}")[w2];\
[7]volume=0[z];$FC\
[r][m][g][l][o][w1][w2][z]${MS}amix=inputs=$((8+k)):normalize=0,atrim=0:$TOT,loudnorm=I=-14:TP=-1.0:LRA=11[out]" -map "[out]" -ar 48000 -c:a pcm_s16le mix.wav
ffmpeg -v error -y -i pic.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx264 -crf 17 -preset medium -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t $TOT final_v8.mp4
md5sum final_v8.mp4; ffprobe -v error -show_entries format=duration -of csv=p=0 final_v8.mp4
ffmpeg -hide_banner -nostats -i final_v8.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | grep -E 'I:|Peak:' | tail -2
echo DONE
