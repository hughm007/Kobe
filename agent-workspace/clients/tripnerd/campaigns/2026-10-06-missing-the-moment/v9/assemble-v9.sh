#!/bin/bash
# v9 assembly (19.0 s): chat 6.7 -> whip -> golf (putt drops, tracked 9:16 crop) -> whip -> celebration orbit -> end card
# Usage: bash a9.sh <orbit.mp4> <orbit_in_seconds>
# Master build: bash assemble-v9.sh r1.mp4 0.44   (r1 = Seedance 1c7b4e71; window 0.44-7.04s ends on the golfer bending at the cup)
set -euo pipefail
cd /home/user/v8
ORB=$1; ORB_IN=$2
E="-an -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p"
DA=6.7; GOLF_IN=1.0; GOLF_LEN=4.0; ORB_LEN=6.6; CARD=2.3; XF=0.3
T_B=$(awk "BEGIN{print $DA-$XF}")                     # 6.4
T_C=$(awk "BEGIN{print $DA+$GOLF_LEN-2*$XF}")         # 10.1
T_D=$(awk "BEGIN{print $T_C+$ORB_LEN}")               # 16.7
TOT=$(awk "BEGIN{print $T_D+$CARD}")                  # 19.0
DROP=$(awk "BEGIN{print $T_B+102/24-$GOLF_IN}")       # putt drops (frame 102 of the source)
echo "T_B=$T_B T_C=$T_C T_D=$T_D TOT=$TOT DROP=$DROP"
# --- A: chat ---
ffmpeg -v error -y -framerate 30 -i cf9/%04d.png -vf "setsar=1,format=yuv420p" $E sA.mp4
# --- B: golf with the putt dropping, 9:16 window following flag + ball ---
python3 - <<'EOF'
import json, numpy as np
P = json.load(open('putt.json'))
flag = np.array([f if f is not None else np.nan for f in P['flag']], float)
i = np.arange(len(flag)); g = ~np.isnan(flag); flag = np.interp(i, i[g], flag[g])
c = []
for k, b in enumerate(P['ball_new']):
    c.append((flag[k] + b[0]) / 2 if b is not None else flag[k] - 30)
c = np.array(c); K = 12
cs = np.convolve(np.pad(c, K, mode='edge'), np.ones(2 * K + 1) / (2 * K + 1), 'valid')
W = 608
with open('crop9.cmd', 'w') as f:
    for k, x in enumerate(cs):
        x0 = int(min(1920 - W, max(0, x - W / 2)))
        f.write(f"{k / 24.0:.4f} crop x {x0};\n")
EOF
ffmpeg -v error -y -framerate 24 -i pf/%04d.png -filter_complex "[0]sendcmd=f=crop9.cmd,crop=608:1080:0:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,fps=30,setsar=1,format=yuv420p" $E golf9_v.mp4
ffmpeg -v error -y -ss $GOLF_IN -t $GOLF_LEN -i golf9_v.mp4 $E sB.mp4
# --- C: celebration orbit (ends on the golfer bending at the cup) ---
ffmpeg -v error -y -ss $ORB_IN -t $ORB_LEN -i $ORB -vf "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1,format=yuv420p" $E sC.mp4
# --- D: end card (real logo file) ---
F=$(fc-match -f '%{file}' 'Montserrat:extrabold')
convert -size 1080x1920 xc:'#07283d' bg.png
convert logo_fe.png -resize 720x logo.png
convert -background none -fill '#5cc0ff' -font "$F" -pointsize 38 -kerning 4 label:'THE AUGUSTA EXPERIENCE' eyebrow.png
convert -background none -fill white -font "$F" -pointsize 70 label:'Be there for the moment.' head.png
convert -background none -fill '#dbe6ee' -font "$F" -pointsize 36 label:'Course passes · Private home · Daily hospitality' sub.png
convert -size 520x132 xc:none -fill '#2ea3f2' -draw 'roundrectangle 0,0 519,131 66,66' -fill white -font "$F" -pointsize 52 -gravity center -annotate +0+0 'Book now' cta.png
convert -background none -fill '#e6eef4' -font "$F" -pointsize 40 label:'tripnerd.com' url.png
ffmpeg -v error -y -loop 1 -t $CARD -i bg.png -loop 1 -t $CARD -i logo.png -loop 1 -t $CARD -i eyebrow.png -loop 1 -t $CARD -i head.png -loop 1 -t $CARD -i sub.png -loop 1 -t $CARD -i cta.png -loop 1 -t $CARD -i url.png -filter_complex "[1]format=rgba,fade=in:st=0:d=0.15:alpha=1[l];[2]format=rgba,fade=in:st=0.05:d=0.15:alpha=1[e];[3]format=rgba,fade=in:st=0.1:d=0.15:alpha=1[h];[4]format=rgba,fade=in:st=0.15:d=0.15:alpha=1[s];[5]format=rgba,fade=in:st=0.2:d=0.15:alpha=1[c];[6]format=rgba,fade=in:st=0.25:d=0.15:alpha=1[u];[0][l]overlay=(W-w)/2:390:shortest=1[a];[a][e]overlay=(W-w)/2:720[b];[b][h]overlay=(W-w)/2:792[d];[d][s]overlay=(W-w)/2:902[f];[f][c]overlay=(W-w)/2:1000[g];[g][u]overlay=(W-w)/2:1170,fps=30,scale=2160:3840,zoompan=z='1+0.025*on/69':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,format=yuv420p" $E sD.mp4
# --- picture: whip-pan transitions (slide + motion blur), hard cut into the end card ---
ffmpeg -v error -y -i sA.mp4 -i sB.mp4 -i sC.mp4 -i sD.mp4 -filter_complex "[0][1]xfade=transition=slideleft:duration=$XF:offset=$T_B[ab];[ab][2]xfade=transition=slideleft:duration=$XF:offset=$T_C[abc];[abc][3]concat=n=2:v=1:a=0,format=yuv420p[v]" -map "[v]" $E pic_raw.mp4
ffmpeg -v error -y -i pic_raw.mp4 -vf "split[a][b];[b]tmix=frames=5:weights='1 1 1 1 1'[m];[a][m]overlay=enable='between(t,$T_B,$T_B+$XF)+between(t,$T_C,$T_C+$XF)'" $E pic.mp4
# --- audio ---
python3 music.py music9.wav $(awk "BEGIN{print $TOT-5.9}") $(awk "BEGIN{print $T_C-5.9}") $(awk "BEGIN{print $T_D-5.9}")
python3 - <<'EOF'
import json
cues = json.load(open('cf9/cues.json'))
open('chat9_sfx.txt', 'w').write(' '.join(str(int(c['t'] * 1000)) + (':o' if c['me'] else ':i') for c in cues))
EOF
sox -n -r 48000 -c 2 blip_i.wav synth 0.09 sine 1180 sine 1580 fade q 0.003 0.09 0.06 gain -14
sox -n -r 48000 -c 2 blip_o.wav synth 0.16 pinknoise lowpass 3000 highpass 600 fade q 0.01 0.16 0.12 gain -16
sox -n -r 48000 -c 2 whip.wav synth 0.35 pinknoise highpass 900 lowpass 6000 fade q 0.12 0.35 0.2 gain -10
sox -n -r 48000 -c 2 room9.wav synth 7 brownnoise lowpass 300 gain -44
sox -n -r 48000 -c 2 r1.wav synth 0.05 pinknoise lowpass 2600 highpass 350 fade q 0.002 0.05 0.04 gain -9
sox -n -r 48000 -c 2 r2.wav synth 0.09 sine 190 fade q 0.003 0.09 0.08 gain -8
sox r1.wav r2.wav r1.wav rattle.wav pad 0 0.03
A(){ ffmpeg -v error -y -ss $2 -t $3 -i $1 -vn -ac 2 -ar 48000 -af "afade=in:d=0.05,afade=out:st=$(awk "BEGIN{print $3-0.12}"):d=0.12" $4.wav; }
A golf.mp4 $GOLF_IN $GOLF_LEN ag9; A long.mp4 4.3 4.6 al9; A $ORB $ORB_IN $ORB_LEN ao9
INP=""; FC=""; k=0
for c in $(cat chat9_sfx.txt); do ms=${c%%:*}; ty=${c##*:}; INP="$INP -i blip_$ty.wav"; FC="$FC[$((k+8))]volume=0.5,adelay=$ms|$ms[s$k];"; k=$((k+1)); done
MS=""; for i in $(seq 0 $((k-1))); do MS="$MS[s$i]"; done
ms(){ awk "BEGIN{print int(($1)*1000)}"; }
tb=$(ms $T_B); tc=$(ms $T_C); tdrop=$(ms $DROP); tl=$(ms "$DROP-0.7"); w1=$(ms "$T_B-0.05"); w2=$(ms "$T_C-0.05")
mb=$(awk "BEGIN{print $T_B-5.9}"); mc=$(awk "BEGIN{print $T_C-5.9}")
ffmpeg -v error -y -i room9.wav -i music9.wav -i ag9.wav -i al9.wav -i ao9.wav -i whip.wav -i whip.wav -i rattle.wav $INP -filter_complex "\
[0]volume=1.0[r];\
[1]volume='if(between(t,$mb,$mc),0.42+0.2*(t-$mb)/($mc-$mb),0.62)':eval=frame,adelay=5900|5900[m];\
[2]volume='0.6+1.6*t/$GOLF_LEN':eval=frame,adelay=$tb|$tb[g];\
[3]volume=1.4,afade=in:d=0.5,adelay=$tl|$tl[l];\
[4]volume=1.1,afade=in:d=0.2,afade=out:st=$(awk "BEGIN{print $ORB_LEN-1.0}"):d=1.0,adelay=$tc|$tc[o];\
[5]adelay=$w1|$w1[w1];[6]adelay=$w2|$w2[w2];[7]volume=0.9,adelay=$tdrop|$tdrop[rt];$FC\
[r][m][g][l][o][w1][w2][rt]${MS}amix=inputs=$((8+k)):normalize=0,atrim=0:$TOT[out]" -map "[out]" -ar 48000 -c:a pcm_f32le mix9_raw.wav
I=$(ffmpeg -hide_banner -nostats -i mix9_raw.wav -af ebur128 -f null - 2>&1 | grep -E '^ +I:' | tail -1 | awk '{print $2}')
G=$(awk "BEGIN{print -14.3-($I)}"); echo "raw I=$I gain=$G"
ffmpeg -v error -y -i mix9_raw.wav -af "volume=${G}dB,alimiter=limit=0.87:attack=3:release=60:level=disabled" -ar 48000 -c:a pcm_s16le mix9.wav
ffmpeg -v error -y -i pic.mp4 -i mix9.wav -map 0:v -map 1:a -c:v libx264 -crf 17 -preset medium -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t $TOT final_v9.mp4
md5sum final_v9.mp4; ffprobe -v error -show_entries format=duration -of csv=p=0 final_v9.mp4
ffmpeg -hide_banner -nostats -i final_v9.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
echo DONE
