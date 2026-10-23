#!/bin/bash
# v9.1 assembly (19.0 s): chat 6.7 (safe-band layout) -> whip -> golf 3.75 (putt drops 9.4) -> whip -> celebration 6.35 -> end card 2.8
# Usage: bash a10.sh <orbit.mp4> <orbit_in_seconds> <out.mp4>
# Master build: bash a10.sh s1.mp4 0.69 final_v91.mp4   (s1 = Seedance 87f7ea86; window 0.69-7.04 s ends on the golfer bending at the cup)
set -euo pipefail
cd /home/user/v8
ORB=$1; ORB_IN=$2; OUT=$3
E="-an -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p"
DA=6.7; GOLF_IN=1.25; GOLF_LEN=3.75; ORB_LEN=6.35; CARD=2.8; XF=0.3
T_B=$(awk "BEGIN{print $DA-$XF}")                     # 6.4
T_C=$(awk "BEGIN{print $DA+$GOLF_LEN-2*$XF}")         # 9.85
T_D=$(awk "BEGIN{print $T_C+$ORB_LEN}")               # 16.2
TOT=$(awk "BEGIN{print $T_D+$CARD}")                  # 19.0
DROP=$(awk "BEGIN{print $T_B+102/24-$GOLF_IN}")       # 9.4 (putt drops at source frame 102)
CF=$(awk "BEGIN{print int($CARD*30)}")
echo "T_B=$T_B T_C=$T_C T_D=$T_D TOT=$TOT DROP=$DROP"
# --- A: chat ---
ffmpeg -v error -y -framerate 30 -i cf10/%04d.png -vf "setsar=1,format=yuv420p" $E sA.mp4
# --- B: golf, putt drops, 9:16 window following flag + ball, graded toward the warm celebration light ---
python3 - <<'PY'
import json, numpy as np
P = json.load(open('putt2.json'))
flag = np.array([f if f is not None else np.nan for f in P['flag']], float)
i = np.arange(len(flag)); g = ~np.isnan(flag); flag = np.interp(i, i[g], flag[g])
c = np.array([(flag[k] + b[0]) / 2 if b is not None else flag[k] - 30 for k, b in enumerate(P['ball_new'])])
K = 12; cs = np.convolve(np.pad(c, K, mode='edge'), np.ones(2 * K + 1) / (2 * K + 1), 'valid')
W = 608
with open('crop10.cmd', 'w') as f:
    for k, x in enumerate(cs):
        f.write(f"{k / 24.0:.4f} crop x {int(min(1920 - W, max(0, x - W / 2)))};\n")
PY
ffmpeg -v error -y -framerate 24 -i pf2/%04d.png -filter_complex "[0]sendcmd=f=crop10.cmd,crop=608:1080:0:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.5,colorbalance=rs=0.03:bs=-0.04:rm=0.04:bm=-0.04:rh=0.02:bh=-0.03,eq=saturation=1.06:gamma=1.02,fps=30,setsar=1,format=yuv420p" $E golf10_v.mp4
ffmpeg -v error -y -ss $GOLF_IN -t $GOLF_LEN -i golf10_v.mp4 $E sB.mp4
# --- C: celebration camera move (ends on the golfer bending at the cup) ---
ffmpeg -v error -y -ss $ORB_IN -t $ORB_LEN -i $ORB -vf "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1,format=yuv420p" $E sC.mp4
# --- D: end card (real logo file), held 2.8 s ---
ffmpeg -v error -y -loop 1 -t $CARD -i bg.png -loop 1 -t $CARD -i logo.png -loop 1 -t $CARD -i eyebrow.png -loop 1 -t $CARD -i head.png -loop 1 -t $CARD -i sub.png -loop 1 -t $CARD -i cta.png -loop 1 -t $CARD -i url.png -filter_complex "[1]format=rgba,fade=in:st=0:d=0.15:alpha=1[l];[2]format=rgba,fade=in:st=0.05:d=0.15:alpha=1[e];[3]format=rgba,fade=in:st=0.1:d=0.15:alpha=1[h];[4]format=rgba,fade=in:st=0.15:d=0.15:alpha=1[s];[5]format=rgba,fade=in:st=0.2:d=0.15:alpha=1[c];[6]format=rgba,fade=in:st=0.25:d=0.15:alpha=1[u];[0][l]overlay=(W-w)/2:390:shortest=1[a];[a][e]overlay=(W-w)/2:720[b];[b][h]overlay=(W-w)/2:792[d];[d][s]overlay=(W-w)/2:902[f];[f][c]overlay=(W-w)/2:1000[g];[g][u]overlay=(W-w)/2:1170,fps=30,scale=2160:3840,zoompan=z='1+0.03*on/$CF':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,format=yuv420p" $E sD.mp4
# --- picture: whip-pans (slide + directional motion blur), hard cut into the end card ---
ffmpeg -v error -y -i sA.mp4 -i sB.mp4 -i sC.mp4 -i sD.mp4 -filter_complex "[0][1]xfade=transition=slideleft:duration=$XF:offset=$T_B[ab];[ab][2]xfade=transition=slideleft:duration=$XF:offset=$T_C[abc];[abc][3]concat=n=2:v=1:a=0,format=yuv420p[v]" -map "[v]" $E pic_raw10.mp4
ffmpeg -v error -y -i pic_raw10.mp4 -vf "split[a][b];[b]avgblur=sizeX=56:sizeY=1[m];[a][m]overlay=enable='between(t,$T_B+0.03,$T_B+$XF-0.03)+between(t,$T_C+0.03,$T_C+$XF-0.03)'" $E pic10.mp4
# --- audio ---
python3 music.py music10.wav $(awk "BEGIN{print $TOT-5.9}") $(awk "BEGIN{print $T_C-5.9}") $(awk "BEGIN{print $T_D-5.9}")
python3 - <<'PY'
import json
cues = json.load(open('cf10/cues.json'))
open('chat10_sfx.txt', 'w').write(' '.join(str(int(c['t'] * 1000)) + (':o' if c['me'] else ':i') for c in cues))
PY
A(){ ffmpeg -v error -y -ss $2 -t $3 -i $1 -vn -ac 2 -ar 48000 -af "afade=in:d=0.05,afade=out:st=$(awk "BEGIN{print $3-0.12}"):d=0.12" $4.wav; }
A golf.mp4 $GOLF_IN $GOLF_LEN ag10; A long.mp4 4.3 4.6 al10; A $ORB $ORB_IN $ORB_LEN ao10
INP=""; FC=""; k=0
for c in $(cat chat10_sfx.txt); do ms=${c%%:*}; ty=${c##*:}; INP="$INP -i blip_$ty.wav"; FC="$FC[$((k+8))]volume=0.5,adelay=$ms|$ms[s$k];"; k=$((k+1)); done
MS=""; for i in $(seq 0 $((k-1))); do MS="$MS[s$i]"; done
ms(){ awk "BEGIN{print int(($1)*1000)}"; }
tb=$(ms $T_B); tc=$(ms $T_C); tdrop=$(ms $DROP); tl=$(ms "$DROP-0.7"); w1=$(ms "$T_B-0.05"); w2=$(ms "$T_C-0.05")
mb=$(awk "BEGIN{print $T_B-5.9}"); mc=$(awk "BEGIN{print $T_C-5.9}")
ffmpeg -v error -y -i room9.wav -i music10.wav -i ag10.wav -i al10.wav -i ao10.wav -i whip.wav -i whip.wav -i rattle.wav $INP -filter_complex "\
[0]volume=1.0[r];\
[1]volume='if(between(t,$mb,$mc),0.42+0.2*(t-$mb)/($mc-$mb),0.62)':eval=frame,adelay=5900|5900[m];\
[2]volume='0.6+1.6*t/$GOLF_LEN':eval=frame,adelay=$tb|$tb[g];\
[3]volume=1.4,afade=in:d=0.5,adelay=$tl|$tl[l];\
[4]volume=1.1,afade=in:d=0.2,afade=out:st=$(awk "BEGIN{print $ORB_LEN-1.0}"):d=1.0,adelay=$tc|$tc[o];\
[5]adelay=$w1|$w1[w1];[6]adelay=$w2|$w2[w2];[7]volume=0.9,adelay=$tdrop|$tdrop[rt];$FC\
[r][m][g][l][o][w1][w2][rt]${MS}amix=inputs=$((8+k)):normalize=0,atrim=0:$TOT[out]" -map "[out]" -ar 48000 -c:a pcm_f32le mix10_raw.wav
I=$(ffmpeg -hide_banner -nostats -i mix10_raw.wav -af ebur128 -f null - 2>&1 | grep -E '^ +I:' | tail -1 | awk '{print $2}')
G=$(awk "BEGIN{print -14.3-($I)}"); echo "raw I=$I gain=$G"
ffmpeg -v error -y -i mix10_raw.wav -af "volume=${G}dB,alimiter=limit=0.83:attack=3:release=60:level=disabled" -ar 48000 -c:a pcm_s16le mix10.wav
ffmpeg -v error -y -i pic10.mp4 -i mix10.wav -map 0:v -map 1:a -c:v libx264 -crf 17 -preset medium -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t $TOT $OUT
md5sum $OUT; ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT
ffmpeg -hide_banner -nostats -i $OUT -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
echo DONE
