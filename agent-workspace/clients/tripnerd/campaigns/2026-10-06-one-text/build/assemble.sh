#!/usr/bin/env bash
# One Text — assemble the 15.0 s 9:16 master from the four locked clips + composited overlays + SFX bed.
# Runs in the Higgsfield sandbox (ffmpeg, sox). Expects in the cwd:
#   s1.mp4 s2.mp4 s3.mp4 s4.mp4 (locked clips) and ov_b1.png ov_dots.png ov_b2.png ov_scrim.png ov_end.png
# Usage: bash assemble.sh <out.mp4>
# Uniform timebase: every clip -> fps=24 (all Kling sources are 24 fps), settb=AVTB, concat FILTER (never stream copy).
set -euo pipefail
OUT=${1:-onetext_master.mp4}
FPS=24
# shot windows in source seconds (in/out) — the edit decision list
S1_IN=${S1_IN:-0.0};  S1_OUT=${S1_OUT:-3.0}
S2_IN=${S2_IN:-0.6};  S2_OUT=${S2_OUT:-3.4}
S3_IN=${S3_IN:-0.1};  S3_OUT=${S3_OUT:-2.4}
S4_IN=${S4_IN:-0.0};  S4_OUT=${S4_OUT:-6.9}
# shot 1 phone screen: blur_screen.py tracks and blurs it upstream (BC-21/BC-42). Optional fixed box
# fallback (output pixels) when BW>0.
BX=${BX:-120}; BY=${BY:-380}; BW=${BW:-0}; BH=${BH:-1060}
S1BOX=""; [ "$BW" -gt 0 ] && S1BOX=",split[s1a][s1b];[s1b]crop=$BW:$BH:$BX:$BY,boxblur=22:3[s1bl];[s1a][s1bl]overlay=$BX:$BY"
D1=$(python3 -c "print(round($S1_OUT-$S1_IN,3))"); D4=$(python3 -c "print(round($S4_OUT-$S4_IN,3))")
TOTAL=$(python3 -c "print(round(($S1_OUT-$S1_IN)+($S2_OUT-$S2_IN)+($S3_OUT-$S3_IN)+($S4_OUT-$S4_IN),3))")
END_AT=${END_AT:-3.6}   # end card in, seconds into shot 4
echo "duration $TOTAL s (shot1 $D1, shot4 $D4)"

# ---- SFX bed (sox, generated from scratch; no third-party audio, no speech) ----
R=48000
sox -n -r $R -c 2 send.wav synth 0.20 sine 700:1900 fade h 0.01 0.20 0.14 gain -16
sox -n -r $R -c 2 r1.wav synth 0.07 sine 1568 fade h 0.004 0.07 0.05 gain -15
sox -n -r $R -c 2 r2.wav synth 0.13 sine 2093 fade h 0.004 0.13 0.10 gain -15
sox r1.wav r2.wav recv.wav
sox -n -r $R -c 2 whoosh.wav synth 0.45 pinknoise fade h 0.12 0.45 0.30 sinc 400-3500 gain -24
sox -n -r $R -c 2 room.wav synth "$TOTAL" brownnoise lowpass 450 gain -36
sox -n -r $R -c 2 air.wav synth "$TOTAL" pinknoise highpass 300 lowpass 2500 gain -42
T2=$D1; T4=$(python3 -c "print(round($TOTAL-$D4,3))")
ffmpeg -v error -y -i send.wav -i recv.wav -i whoosh.wav -i room.wav -i air.wav -filter_complex "\
[0]adelay=50|50[a0];\
[1]adelay=1750|1750[a1];\
[2]adelay=$(python3 -c "print(int(($T2-0.25)*1000))")|$(python3 -c "print(int(($T2-0.25)*1000))")[a2];\
[3]afade=t=in:st=$T2:d=0.6,afade=t=out:st=$(python3 -c "print($T4-0.3)"):d=0.6,volume='if(lt(t,$T2),0,1)':eval=frame[a3];\
[4]volume='if(lt(t,$T4),0,1)':eval=frame,afade=t=in:st=$T4:d=0.5[a4];\
[a0][a1][a2][a3][a4]amix=inputs=5:normalize=0:duration=longest,atrim=0:$TOTAL,alimiter=limit=0.84,aresample=48000[aout]" \
  -map "[aout]" -ac 2 -ar 48000 bed.wav

# ---- picture ----
ffmpeg -v error -y \
  -i s1.mp4 -i s2.mp4 -i s3.mp4 -i s4.mp4 \
  -loop 1 -framerate $FPS -t "$D1" -i ov_b1.png \
  -loop 1 -framerate $FPS -t "$D1" -i ov_dots.png \
  -loop 1 -framerate $FPS -t "$D1" -i ov_b2.png \
  -loop 1 -framerate $FPS -t "$D4" -i ov_scrim.png \
  -loop 1 -framerate $FPS -t "$D4" -i ov_end.png \
  -i bed.wav \
  -filter_complex "\
[0:v]trim=$S1_IN:$S1_OUT,setpts=PTS-STARTPTS,fps=$FPS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,format=rgba$S1BOX[s1];\
[4:v]format=rgba,fade=t=in:st=0:d=0.22:alpha=1[o1];\
[5:v]format=rgba,fade=t=in:st=0.95:d=0.15:alpha=1[o2];\
[6:v]format=rgba,fade=t=in:st=1.75:d=0.15:alpha=1[o3];\
[s1][o1]overlay=x=0:y='if(lt(t,0.25),60*(1-t/0.25),0)':eval=frame[s1o1];\
[s1o1][o2]overlay=0:0:enable='between(t,0.95,1.749)'[s1o2];\
[s1o2][o3]overlay=x=0:y='if(lt(t,1.75),40,if(lt(t,1.95),40*(1-(t-1.75)/0.2),0))':eval=frame:enable='gte(t,1.75)'[v1];\
[1:v]trim=$S2_IN:$S2_OUT,setpts=PTS-STARTPTS,fps=$FPS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,format=rgba[v2];\
[2:v]trim=$S3_IN:$S3_OUT,setpts=PTS-STARTPTS,fps=$FPS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,format=rgba[v3];\
[3:v]trim=$S4_IN:$S4_OUT,setpts=PTS-STARTPTS,fps=$FPS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,format=rgba[s4];\
[7:v]format=rgba,fade=t=in:st=$END_AT:d=0.45:alpha=1[sc];\
[8:v]format=rgba,fade=t=in:st=$(python3 -c "print($END_AT+0.2)"):d=0.4:alpha=1[en];\
[s4][sc]overlay=0:0:enable='gte(t,$END_AT)'[s4a];\
[s4a][en]overlay=x=0:y='if(lt(t,$END_AT+0.2),40,if(lt(t,$END_AT+0.6),40*(1-(t-$END_AT-0.2)/0.4),0))':eval=frame:enable='gte(t,$END_AT+0.2)'[v4];\
[v1][v2][v3][v4]concat=n=4:v=1:a=0,settb=AVTB,format=yuv420p[v]" \
  -map "[v]" -map 9:a -c:v libx264 -preset medium -crf 17 -profile:v high -r $FPS -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -t "$TOTAL" "$OUT"
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,pix_fmt,sample_rate,channels -show_entries format=duration -of compact "$OUT"
sha256sum "$OUT"
