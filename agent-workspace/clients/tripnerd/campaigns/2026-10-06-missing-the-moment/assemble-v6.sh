#!/bin/bash
set -euo pipefail
LONG_URL="https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/hf_20261006_224852_f9d556b4-32e3-4239-bbad-d0b53e7d8b8c.mp4"; LONG_IN=1.5
W=/home/user/b6; rm -rf $W; mkdir -p $W; cd $W
B=https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
M=https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93
get(){ curl -sf -o "$1" "$B/$2"; }
get pov.mp4 hf_20261006_222712_1b749e4b-b54e-4f2e-b056-dfcbdae2dd4d.mp4
get mb.mp4 hf_20261006_215915_379c3ae7-5a09-47a4-b037-6837e1a0a57c.mp4
get m5.mp4 hf_20261006_215416_773b8b04-4d6b-46b6-b0de-eb07a49b1833.mp4
get m6.mp4 hf_20261006_215525_36068f8b-8466-48b1-b483-ef7c3e884180.mp4
get m7.mp4 hf_20261006_215510_448b8e8f-b877-4fe7-aa77-12a877b3fa2a.mp4
get vo.wav hf_20261006_211034_7ad4c88f-d7f2-49ac-a97d-70af54afa7a2.wav
get vo2.wav hf_20261006_215303_8b6168cb-b67c-41bf-b670-1af6a0f672b3.wav
curl -sf -o long.mp4 "$LONG_URL"
curl -sf -o ball.mp4 "$M/7b633df5-e73c-4e19-9869-169188f74974.mp4"
curl -sfL -o logo_fe.png "https://cdn.prod.website-files.com/697ae7a00afa01083b5681df/697ccdde03e1c807ff42ea30_tripnerd-fan-experiences_logo%403x.png"
V="scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
E="-an -c:v libx264 -crf 14 -preset fast"
seg(){ ffmpeg -v error -y -ss $3 -t $4 -i $2 -vf "$V" $E $1.mp4; }
seg v01 long.mp4 $LONG_IN 8.0
seg v02 pov.mp4 0.5 2.2
ffmpeg -v error -y -i ball.mp4 -t 2.8 -vf "fps=30,setsar=1,format=yuv420p" $E v03.mp4
seg v04 m5.mp4 1.6 2.0
ffmpeg -v error -y -sseof -0.05 -i v04.mp4 -frames:v 1 hug.png
convert hug.png -resize 940x1670 -bordercolor white -border 22 \( +clone -background black -shadow 60x14+0+10 \) +swap -background none -layers merge +repage photo.png
convert hug.png -blur 0x18 -modulate 80 bgblur.png
ffmpeg -v error -y -loop 1 -t 0.8 -i bgblur.png -loop 1 -t 0.8 -i photo.png -filter_complex "[0][1]overlay=(W-w)/2:(H-h)/2,fps=30,scale=2160:3840,zoompan=z='1+0.03*on/24':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,eq=brightness='if(lt(t,0.12),0.6-t*5,0)':eval=frame,format=yuv420p" $E v05.mp4
seg v06 m6.mp4 0.6 2.2
seg v07 m7.mp4 0.5 1.6
F=$(fc-list | grep -i 'Montserrat-ExtraBold' | head -1 | cut -d: -f1)
convert -size 1080x1920 xc:'#07283d' bg.png
convert logo_fe.png -resize 720x logo.png
convert -background none -fill '#2ea3f2' -font "$F" -pointsize 36 -kerning 4 label:'THE AUGUSTA EXPERIENCE' eyebrow.png
convert -background none -fill white -font "$F" -pointsize 68 label:'Be there for the moment.' head.png
convert -background none -fill '#c9d6e0' -font "$F" -pointsize 36 label:'Course passes · Private home · Daily hospitality' sub.png
convert -size 640x128 xc:none -fill '#2ea3f2' -draw 'roundrectangle 0,0 639,127 64,64' -fill white -font "$F" -pointsize 44 -gravity center -annotate +0+0 'Explore your next event' cta.png
convert -background none -fill '#9fb3c2' -font "$F" -pointsize 36 label:'tripnerd.com' url.png
ffmpeg -v error -y -loop 1 -t 2.3 -i bg.png -loop 1 -t 2.3 -i logo.png -loop 1 -t 2.3 -i eyebrow.png -loop 1 -t 2.3 -i head.png -loop 1 -t 2.3 -i sub.png -loop 1 -t 2.3 -i cta.png -loop 1 -t 2.3 -i url.png -filter_complex "[1]format=rgba,fade=in:st=0.05:d=0.25:alpha=1[l];[2]format=rgba,fade=in:st=0.2:d=0.25:alpha=1[e];[3]format=rgba,fade=in:st=0.35:d=0.25:alpha=1[h];[4]format=rgba,fade=in:st=0.5:d=0.25:alpha=1[s];[5]format=rgba,fade=in:st=0.7:d=0.25:alpha=1[c];[6]format=rgba,fade=in:st=0.8:d=0.25:alpha=1[u];[0][l]overlay=(W-w)/2:390:shortest=1[a];[a][e]overlay=(W-w)/2:720[b];[b][h]overlay=(W-w)/2:792[d];[d][s]overlay=(W-w)/2:902[f];[f][c]overlay=(W-w)/2:1000[g];[g][u]overlay=(W-w)/2:1165,fps=30,scale=2160:3840,zoompan=z='1+0.025*on/69':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,format=yuv420p" $E v08.mp4
printf "file '%s'\n" v01.mp4 v02.mp4 v03.mp4 v04.mp4 v05.mp4 v06.mp4 v07.mp4 v08.mp4 > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy pic_clean.mp4
cap(){ convert -background none -fill white -font "$F" -pointsize 56 -gravity center -size 960x caption:"$1" t.png; convert t.png \( +clone -background black -shadow 85x5+0+3 \) +swap -background none -layers merge +repage c$2.png; }
cap "You made it to the event." 1; cap "But does it feel like you're actually there?" 2; cap "The biggest moment of the day..." 3; cap "and all you can see is the back of someone's hat." 4; cap "Experience it differently, with TripNerd." 5; cap "Don't just attend." 6
ffmpeg -v error -y -i pic_clean.mp4 -i c1.png -i c2.png -i c3.png -i c4.png -i c5.png -i c6.png -filter_complex "[0][1]overlay=50:1190:enable='between(t,0.3,2.0)'[a];[a][2]overlay=50:1190:enable='between(t,2.0,4.7)'[b];[b][3]overlay=50:1190:enable='between(t,5.0,7.2)'[c];[c][4]overlay=50:1190:enable='between(t,7.2,10.0)'[d];[d][5]overlay=50:1190:enable='between(t,13.1,16.0)'[e];[e][6]overlay=50:1190:enable='between(t,17.2,19.55)'" $E pic_cap.mp4
A(){ ffmpeg -v error -y -ss $2 -t $3 -i $1 -vn -ac 2 -ar 48000 -af "afade=in:d=0.05,afade=out:st=$(awk "BEGIN{print $3-0.1}"):d=0.1" $4.wav; }
A long.mp4 $LONG_IN 8.0 al; A pov.mp4 0.5 2.2 ap
A mb.mp4 1.4 2.4 hush; A mb.mp4 3.85 1.15 roar
A m5.mp4 1.6 2.0 a5; A m6.mp4 0.6 2.2 a6; A m7.mp4 0.5 3.9 a7
ffmpeg -v error -y -i vo.wav -ac 2 -ar 48000 vo48.wav; ffmpeg -v error -y -i vo2.wav -ac 2 -ar 48000 vo2_48.wav
L(){ ffmpeg -v error -y -ss $1 -t $2 -i $5 -af "afade=in:d=0.03,afade=out:st=$(awk "BEGIN{print $2-0.06}"):d=0.06$3" $4.wav; }
L 0.40 4.40 "" l1 vo48.wav; L 11.35 2.90 "" l3 vo48.wav; L 15.20 4.50 "" l4 vo48.wav
L 0.0 2.10 "" l2a vo2_48.wav; L 3.12 2.90 "" l2b vo2_48.wav
ffmpeg -v error -y -i l2a.wav -i l2b.wav -filter_complex "[0]apad=pad_dur=0.35[x];[x][1]concat=n=2:v=0:a=1,atempo=1.05" l2.wav
sox -n -r 48000 -c 2 thump.wav synth 0.7 sine 55 fade q 0.005 0.7 0.65 gain -9
sox -n -r 48000 -c 2 shutter.wav synth 0.06 whitenoise fade 0 0.06 0.05 gain -14
sox -n -r 48000 -c 2 thud.wav synth 0.11 brownnoise lowpass 520 fade q 0.002 0.11 0.10 gain -3
sox -n -r 48000 -c 2 tap.wav synth 0.07 brownnoise lowpass 650 fade q 0.002 0.07 0.06 gain -11
ffmpeg -v error -y -i al.wav -i ap.wav -i hush.wav -i roar.wav -i a5.wav -i shutter.wav -i a6.wav -i a7.wav -i l1.wav -i l2.wav -i l3.wav -i l4.wav -i thump.wav -i thud.wav -i tap.wav -filter_complex "[0]volume=0.85,afade=out:st=7.3:d=0.7[x0];[1]volume=0.9,afade=in:d=0.3,adelay=8000|8000[x1];[2]volume=0.45,adelay=10200|10200[x2];[3]volume=0.95,afade=in:d=0.08,afade=out:st=0.7:d=0.45,adelay=11850|11850[x3];[4]volume=0.7,adelay=13000|13000[x4];[5]adelay=15000|15000[x5];[6]volume=0.7,adelay=15800|15800[x6];[7]volume=0.8,afade=in:d=0.3,afade=out:st=2.9:d=1.0,adelay=18000|18000[x7];[x0][x1][x2][x3][x4][x5][x6][x7]amix=inputs=8:normalize=0,apad=whole_dur=21.9[bed];[8]adelay=300|300[v1];[9]adelay=5000|5000[v2];[10]adelay=13100|13100[v3];[11]adelay=17200|17200[v4];[v1][v2][v3][v4]amix=inputs=4:normalize=0,apad=whole_dur=21.9,volume=1.6,asplit=2[vo][sc];[bed][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=250[duck];[12]adelay=19650|19650[th];[13]adelay=10800|10800[td];[14]adelay=11060|11060[tp];[duck][vo][th][td][tp]amix=inputs=5:normalize=0,atrim=0:21.9,loudnorm=I=-14:TP=-1.0:LRA=9[out]" -map "[out]" -ar 48000 -c:a pcm_s16le mix.wav
for k in clean cap; do ffmpeg -v error -y -i pic_$k.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx264 -crf 17 -preset medium -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t 21.9 final_$k.mp4; done
md5sum final_cap.mp4 final_clean.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 final_cap.mp4
ffmpeg -hide_banner -nostats -i final_cap.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | grep -E 'I:|Peak:' | tail -2
i=10; for t in 1.0 3.0 5.0 6.5 7.6 9.0 10.9 11.6 13.8 15.3 16.8 18.8 20.8; do i=$((i+1)); ffmpeg -v error -y -ss $t -i final_cap.mp4 -frames:v 1 -vf scale=130:-1 -q:v 5 qa_$i.jpg; done
convert qa_1[1-7].jpg +append /home/user/v6qa1.jpg; convert qa_1[8-9].jpg qa_2[0-3].jpg +append /home/user/v6qa2.jpg
echo DONE
