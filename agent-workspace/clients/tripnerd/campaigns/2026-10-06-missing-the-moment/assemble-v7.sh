#!/bin/bash
set -euo pipefail
LONG_IN=1.4; HUG_IN=0.7; M6_IN=0.5; PLATE_IN=0.5; HX=413; HY=1425; RH=8
W=/home/user/b7; rm -rf $W; mkdir -p $W; cd $W
B=https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
get(){ curl -sf -o "$1" "$B/$2"; }
get long.mp4 hf_20261006_224852_f9d556b4-32e3-4239-bbad-d0b53e7d8b8c.mp4
get mb.mp4 hf_20261006_215915_379c3ae7-5a09-47a4-b037-6837e1a0a57c.mp4
get vo.wav hf_20261006_211034_7ad4c88f-d7f2-49ac-a97d-70af54afa7a2.wav
get n1.wav hf_20261006_230648_5fea5b67-6a16-48d6-b499-b199a82a1a9f.wav
get n2.wav hf_20261006_230650_d5dabaf1-7017-4565-a1c2-bae8e00f1e71.wav
curl -sf -o hug.mp4 "https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/hf_20261006_231416_c282a54b-a49f-4d55-a5b5-4426aa32513a.mp4"; curl -sf -o m6.mp4 "https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/hf_20261006_231419_f80eac85-a390-4af9-9003-35710aa72f9b.mp4"; curl -sf -o plate.mp4 "https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/hf_20261006_232357_872af706-3580-4465-9e52-6dcccbdcd120.mp4"
curl -sfL -o logo_fe.png "https://cdn.prod.website-files.com/697ae7a00afa01083b5681df/697ccdde03e1c807ff42ea30_tripnerd-fan-experiences_logo%403x.png"
V="scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
E="-an -c:v libx264 -crf 14 -preset fast"
seg(){ ffmpeg -v error -y -ss $3 -t $4 -i $2 -vf "$V" $E $1.mp4; }
seg v01 long.mp4 $LONG_IN 8.6
mkdir -p pf po; ffmpeg -v error -y -ss $PLATE_IN -t 2.4 -i plate.mp4 -vf "$V" pf/%04d.png
python3 /home/user/ball_comp2.py pf po $HX $HY $RH
ffmpeg -v error -y -framerate 30 -i po/%04d.png -vf "format=yuv420p" $E v02.mp4
seg v03 hug.mp4 $HUG_IN 2.0
ffmpeg -v error -y -sseof -0.05 -i v03.mp4 -frames:v 1 hug.png
convert hug.png -resize 940x1670 -bordercolor white -border 22 \( +clone -background black -shadow 60x14+0+10 \) +swap -background none -layers merge +repage photo.png
convert hug.png -blur 0x18 -modulate 80 bgblur.png
ffmpeg -v error -y -loop 1 -t 0.8 -i bgblur.png -loop 1 -t 0.8 -i photo.png -filter_complex "[0][1]overlay=(W-w)/2:(H-h)/2,fps=30,scale=2160:3840,zoompan=z='1+0.03*on/24':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,eq=brightness='if(lt(t,0.12),0.6-t*5,0)':eval=frame,format=yuv420p" $E v04.mp4
mkdir -p mf mo; ffmpeg -v error -y -ss $M6_IN -t 1.8 -i m6.mp4 -vf "$V" mf/%04d.png
cp logo_fe.png logo_raw.png; python3 /home/user/card_fix.py mf mo logo_raw.png 672 1420
ffmpeg -v error -y -framerate 30 -i mo/%04d.png -vf "format=yuv420p" $E v05.mp4
F=$(fc-list | grep -i 'Montserrat-ExtraBold' | head -1 | cut -d: -f1)
convert -size 1080x1920 xc:'#07283d' bg.png
convert logo_fe.png -resize 720x logo.png
convert -background none -fill '#2ea3f2' -font "$F" -pointsize 36 -kerning 4 label:'THE AUGUSTA EXPERIENCE' eyebrow.png
convert -background none -fill white -font "$F" -pointsize 68 label:'Be there for the moment.' head.png
convert -background none -fill '#c9d6e0' -font "$F" -pointsize 36 label:'Course passes · Private home · Daily hospitality' sub.png
convert -size 640x128 xc:none -fill '#2ea3f2' -draw 'roundrectangle 0,0 639,127 64,64' -fill white -font "$F" -pointsize 44 -gravity center -annotate +0+0 'Explore your next event' cta.png
convert -background none -fill '#9fb3c2' -font "$F" -pointsize 36 label:'tripnerd.com' url.png
ffmpeg -v error -y -loop 1 -t 2.2 -i bg.png -loop 1 -t 2.2 -i logo.png -loop 1 -t 2.2 -i eyebrow.png -loop 1 -t 2.2 -i head.png -loop 1 -t 2.2 -i sub.png -loop 1 -t 2.2 -i cta.png -loop 1 -t 2.2 -i url.png -filter_complex "[1]format=rgba,fade=in:st=0.05:d=0.25:alpha=1[l];[2]format=rgba,fade=in:st=0.2:d=0.25:alpha=1[e];[3]format=rgba,fade=in:st=0.35:d=0.25:alpha=1[h];[4]format=rgba,fade=in:st=0.5:d=0.25:alpha=1[s];[5]format=rgba,fade=in:st=0.7:d=0.25:alpha=1[c];[6]format=rgba,fade=in:st=0.8:d=0.25:alpha=1[u];[0][l]overlay=(W-w)/2:390:shortest=1[a];[a][e]overlay=(W-w)/2:720[b];[b][h]overlay=(W-w)/2:792[d];[d][s]overlay=(W-w)/2:902[f];[f][c]overlay=(W-w)/2:1000[g];[g][u]overlay=(W-w)/2:1165,fps=30,scale=2160:3840,zoompan=z='1+0.025*on/66':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,format=yuv420p" $E v06.mp4
printf "file '%s'\n" v01.mp4 v02.mp4 v03.mp4 v04.mp4 v05.mp4 v06.mp4 > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy pic_clean.mp4
cap(){ convert -background none -fill white -font "$F" -pointsize 56 -gravity center -size 960x caption:"$1" t.png; convert t.png \( +clone -background black -shadow 85x5+0+3 \) +swap -background none -layers merge +repage c$2.png; }
cap "You made it to the event." 1; cap "But does it feel like you're actually there?" 2; cap "The biggest moment of the day..." 3; cap "and you can't even see it." 4; cap "With TripNerd, you're not just at the event." 5; cap "You're in it." 6
ffmpeg -v error -y -i pic_clean.mp4 -i c1.png -i c2.png -i c3.png -i c4.png -i c5.png -i c6.png -filter_complex "[0][1]overlay=50:1190:enable='between(t,0.3,2.0)'[a];[a][2]overlay=50:1190:enable='between(t,2.0,4.7)'[b];[b][3]overlay=50:1190:enable='between(t,4.85,6.55)'[c];[c][4]overlay=50:1190:enable='between(t,6.55,8.6)'[d];[d][5]overlay=50:1190:enable='between(t,11.3,14.3)'[e];[e][6]overlay=50:1190:enable='between(t,14.3,15.6)'" $E pic_cap.mp4
A(){ ffmpeg -v error -y -ss $2 -t $3 -i $1 -vn -ac 2 -ar 48000 -af "afade=in:d=0.05,afade=out:st=$(awk "BEGIN{print $3-0.1}"):d=0.1" $4.wav; }
A long.mp4 $LONG_IN 8.6 al; A plate.mp4 $PLATE_IN 2.4 ap; A mb.mp4 3.85 1.15 roar
A hug.mp4 $HUG_IN 2.0 a3; A m6.mp4 $M6_IN 1.8 a5
for f in vo n1 n2; do ffmpeg -v error -y -i $f.wav -ac 2 -ar 48000 ${f}48.wav; done
L(){ ffmpeg -v error -y -ss $1 -t $2 -i $4 -af "afade=in:d=0.03,afade=out:st=$(awk "BEGIN{print $2-0.06}"):d=0.06" $3.wav; }
L 0.40 4.40 l1 vo48.wav; L 0.0 1.66 l2a n148.wav; L 2.26 2.0 l2b n148.wav; L 0.0 4.3 l3 n248.wav
ffmpeg -v error -y -i l2a.wav -i l2b.wav -filter_complex "[0]apad=pad_dur=0.32[x];[x][1]concat=n=2:v=0:a=1,atempo=1.04" l2.wav
sox -n -r 48000 -c 2 thump.wav synth 0.7 sine 55 fade q 0.005 0.7 0.65 gain -9
sox -n -r 48000 -c 2 shutter.wav synth 0.06 whitenoise fade 0 0.06 0.05 gain -14
sox -n -r 48000 -c 2 thud.wav synth 0.09 brownnoise lowpass 480 fade q 0.002 0.09 0.08 gain -6
sox -n -r 48000 -c 2 tap.wav synth 0.06 brownnoise lowpass 600 fade q 0.002 0.06 0.05 gain -13
ffmpeg -v error -y -i al.wav -i ap.wav -i roar.wav -i a3.wav -i shutter.wav -i a5.wav -i l1.wav -i l2.wav -i l3.wav -i thump.wav -i thud.wav -i tap.wav -filter_complex "[0]volume=0.85,afade=out:st=8.15:d=0.45[x0];[1]volume=0.5,afade=in:d=0.2,adelay=8600|8600[x1];[2]volume=0.95,afade=in:d=0.08,afade=out:st=0.7:d=0.45,adelay=9650|9650[x2];[3]volume=0.7,afade=in:d=0.15,adelay=11000|11000[x3];[4]adelay=13000|13000[x4];[5]volume=0.6,afade=out:st=1.4:d=0.4,adelay=13800|13800[x5];[x0][x1][x2][x3][x4][x5]amix=inputs=6:normalize=0,apad=whole_dur=17.8[bed];[6]adelay=300|300[v1];[7]adelay=4850|4850[v2];[8]adelay=11300|11300[v3];[v1][v2][v3]amix=inputs=3:normalize=0,apad=whole_dur=17.8,volume=1.6,asplit=2[vo][sc];[bed][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=250[duck];[9]adelay=15650|15650[th];[10]adelay=9220|9220[td];[11]adelay=9400|9400[tp];[duck][vo][th][td][tp]amix=inputs=5:normalize=0,atrim=0:17.8,loudnorm=I=-14:TP=-1.0:LRA=9[out]" -map "[out]" -ar 48000 -c:a pcm_s16le mix.wav
for k in clean cap; do ffmpeg -v error -y -i pic_$k.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx264 -crf 17 -preset medium -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t 17.8 final_$k.mp4; done
md5sum final_cap.mp4 final_clean.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 final_cap.mp4
ffmpeg -hide_banner -nostats -i final_cap.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | grep -E 'I:|Peak:' | tail -2
i=10; for t in 1.0 3.0 5.0 7.5 8.9 9.3 9.9 10.8 12.0 13.4 14.6 16.5; do i=$((i+1)); ffmpeg -v error -y -ss $t -i final_cap.mp4 -frames:v 1 -vf scale=150:-1 -q:v 5 qa_$i.jpg; done
convert qa_1[1-6].jpg +append /home/user/v7qa1.jpg; convert qa_1[7-9].jpg qa_2[0-2].jpg +append /home/user/v7qa2.jpg
echo DONE
