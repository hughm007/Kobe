#!/bin/bash
set -e
IN=src.mp4; OUT=TN-Augusta-Reel-22s.mp4
FC="
[0:v]trim=start_frame=0:end_frame=418,setpts=PTS-STARTPTS[v1];
[0:v]trim=start_frame=418:end_frame=448,setpts=2*(PTS-STARTPTS),fps=30[v2];
[0:v]trim=start_frame=448:end_frame=494,setpts=PTS-STARTPTS[v3];
[0:v]trim=start_frame=494:end_frame=524,setpts=2*(PTS-STARTPTS),fps=30[v4];
[0:v]trim=start_frame=524,setpts=PTS-STARTPTS[v5];
[v1][v2][v3][v4][v5]concat=n=5:v=1:a=0,fps=30[v];
[0:a]atrim=0:14.58,asetpts=PTS-STARTPTS[a1];
[0:a]atrim=14.58:14.85,asetpts=PTS-STARTPTS,atempo=0.5,atempo=0.5,atempo=0.775,apad,atrim=0:1.27,afade=t=in:d=0.02,afade=t=out:st=1.24:d=0.03[a2];
[0:a]atrim=14.85:17.49,asetpts=PTS-STARTPTS[a3];
[0:a]atrim=17.49:17.64,asetpts=PTS-STARTPTS,atempo=0.5,atempo=0.5,atempo=0.5,atempo=0.845,apad,atrim=0:1.15,afade=t=in:d=0.02,afade=t=out:st=1.12:d=0.03[a4];
[0:a]atrim=17.64,asetpts=PTS-STARTPTS[a5];
[a1][a2][a3][a4][a5]concat=n=5:v=0:a=1[a]"
ffmpeg -y -v error -i $IN -filter_complex "$FC" -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart $OUT
