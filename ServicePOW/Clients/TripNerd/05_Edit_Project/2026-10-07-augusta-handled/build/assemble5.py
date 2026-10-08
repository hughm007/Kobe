#!/usr/bin/env python3
# TripNerd "Augusta, handled" A5 (owner: slower voice, voice on every line, 20 s): 20.0 s, 9:16, 30 fps. The real-footage version with the owner's notes of 2026-10-07:
# hook (V19, real) | the Private Executive Home | the veranda + checklist, read by the hosting-spot host's voice | V25 (real) |
# HARD CUT on the music's drop to the owner's ball-landing clip, reframed to follow the stick and ball and settle on the cup
# (out/endclip.mp4, endclip.py), with "Let TripNerd handle the details." | HARD CUT on the beat to TripNerd's approved
# camera-roll end card (out/card.mp4, card.py). First three joins are 0.25 s crossfades centred on the beat times.
# Needs out/mix.wav and out/ticks.json (mix4.py), out/endclip.mp4, out/card.mp4. Text is composited (Pillow, Montserrat).
import subprocess, os, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS=1080,1920,30; XF=0.25; NAME='TN-AUG-A5'
CUT=[3.0,5.3,12.3,14.9,17.51]; DUR=20.0
TK=json.load(open('out/ticks.json')); T0=TK['T0']; VEND=T0+TK['voice_dur']; TICKS=TK['ticks']
assert None not in TICKS, 'a checklist word was not found in the voice transcript'
EB='fonts/Montserrat-ExtraBold.ttf'; SB='fonts/Montserrat-SemiBold.ttf'
F=lambda p,s: ImageFont.truetype(p,s)
BLUE=(82,142,224); NAVY=(7,40,61); WHITE=(255,255,255)
def layer(): return Image.new('RGBA',(W,H),(0,0,0,0))
def shadowed(L,draws):
    S=layer(); ds=ImageDraw.Draw(S)
    for (x,y),t,f,_ in draws: ds.text((x+3,y+4),t,font=f,fill=(0,0,0,170))
    S=S.filter(ImageFilter.GaussianBlur(7)); L.alpha_composite(S); d=ImageDraw.Draw(L)
    for (x,y),t,f,fill in draws: d.text((x,y),t,font=f,fill=fill)
    return L
def centred(lines,font,y0,lh):
    d=ImageDraw.Draw(layer()); out=[]
    for i,t in enumerate(lines):
        bb=d.textbbox((0,0),t,font=font); out.append((((W-(bb[2]-bb[0]))//2-bb[0],y0+i*lh),t,font,WHITE+(255,)))
    return out
def scrim(L,y0,y1,peak=0.36):
    S=layer(); d=ImageDraw.Draw(S); n=y1-y0
    for i in range(n): a=int(255*peak*min(1.0,min(i,n-i)/(0.3*n))); d.line([(0,y0+i),(W,y0+i)],fill=(0,0,0,a))
    L.alpha_composite(S); return L
def card(lines,path,y0=470,size=84,lh=104,band=None,peak=0.36):
    L=layer()
    if band: L=scrim(L,*band,peak=peak)
    shadowed(L,centred(lines,F(EB,size),y0,lh)).save(path)
card(['Augusta is the','bucket-list moment.'],'out/c1.png',band=(360,760))
card(['Planning it shouldn’t','be the hard part.'],'out/c2.png',band=(360,760))
card(['Bring your people.'],'out/c4a.png',y0=470,band=(380,760))
card(['Enjoy the moment.'],'out/c4b.png',y0=590)
card(['Let TripNerd handle','the details.'],'out/c5.png',y0=470,band=(360,760),peak=0.42)
P=layer(); d=ImageDraw.Draw(P); d.rounded_rectangle((70,340,1010,1060),radius=36,fill=NAVY+(214,))
fh=F(EB,66); bb=d.textbbox((0,0),'With TripNerd:',font=fh); d.text((130-bb[0],392),'With TripNerd:',font=fh,fill=WHITE+(255,)); P.save('out/panel.png')
ITEMS=[(['Course access'],540),(['Private executive','accommodations'],660),(['Daily hospitality'],850),(['Concierge support'],960)]
fi=F(SB,56)
for k,(lines,y) in enumerate(ITEMS):
    L=layer(); d=ImageDraw.Draw(L); cx,cy,r=160,y+34,30
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=BLUE+(255,)); d.line([(cx-14,cy+1),(cx-4,cy+12),(cx+15,cy-11)],fill=WHITE+(255,),width=7,joint='curve')
    for i,t in enumerate(lines): bb=d.textbbox((0,0),t,font=fi); d.text((212-bb[0],y+i*70+4),t,font=fi,fill=WHITE+(255,))
    L.save('out/i%d.png'%k)
# ---------- picture ----------
SEG=[CUT[0]+XF/2,CUT[1]-CUT[0]+XF,CUT[2]-CUT[1]+XF,CUT[3]-CUT[2]+XF/2]
real='scale=1080:1924:flags=lanczos,crop=1080:1920,unsharp=5:5:0.5,setsar=1'
fc=["[0:v]trim=2.4:%.3f,setpts=PTS-STARTPTS,fps=%d,%s,scale=1318:2343:flags=lanczos,crop=1080:1920:0:200,eq=saturation=1.06,format=yuv420p[s1]"%(2.4+SEG[0],FPS,real),
    "[1:v]trim=0.3:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1080:1920:flags=lanczos,setsar=1,format=yuv420p[s2]"%(0.3+SEG[1],FPS),
    "[2:v]trim=0:5.0,setpts=%.4f*(PTS-STARTPTS),fps=%d,scale=1080:1920:flags=lanczos,setsar=1,trim=0:%.3f,format=yuv420p[s3]"%(SEG[2]/5.0+0.002,FPS,SEG[2]),
    "[3:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,%s,format=yuv420p[s4]"%(SEG[3],FPS,real),
    "[4:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,setsar=1,format=yuv420p[s5]"%(CUT[4]-CUT[3],FPS),
    "[5:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,setsar=1,format=yuv420p[s6]"%(DUR-CUT[4],FPS)]
prev='s1'; off=0.0
for i,s in enumerate(['s2','s3','s4']):
    off+=SEG[i]-XF; fc.append("[%s][%s]xfade=transition=fade:duration=%.2f:offset=%.3f[x%d]"%(prev,s,XF,off,i)); prev='x%d'%i
fc.append("[%s]setsar=1[xs];[xs][s5][s6]concat=n=3:v=1:a=0[base]"%prev); prev='base'   # the hook's punch-in leaves SAR 21087:21088; concat needs 1:1
def ov(idx,a,b,y='0',x='0',fin=0.25,fout=0.2):
    global prev
    tag='o%d'%idx; fade="fade=in:st=%.2f:d=%.2f:alpha=1"%(a,fin)+(",fade=out:st=%.2f:d=%.2f:alpha=1"%(b-fout,fout) if fout else '')
    fc.append("[%d:v]format=rgba,%s[l%d]"%(idx,fade,idx)); fc.append("[%s][l%d]overlay=x='%s':y='%s':enable='between(t,%.2f,%.2f)'[%s]"%(prev,idx,x,y,a,b,tag)); prev=tag
LAY=['c1','c2','panel','i0','i1','i2','i3','c4a','c4b','c5']; base=6
ov(base+0,0.25,2.85,y='-18*(t-0.25)')
ov(base+1,3.15,5.1,y='-18*(t-3.15)')
PEND=min(CUT[2]-0.1,VEND+0.12); ov(base+2,5.3,PEND)
for k,ti in enumerate(TICKS): ov(base+3+k,ti,PEND,x='-44*max(0,1-(t-%.2f)/0.3)'%ti)
ov(base+7,12.45,14.8,y='-16*(t-12.45)'); ov(base+8,13.45,14.8,y='-16*(t-12.45)')
ov(base+9,15.1,CUT[4]-0.04,y='-16*(t-15.1)',fin=0.22,fout=0.12)
srcs=['src/v19.mp4','src/house.mp4','src/veranda2.mp4','src/v25.mp4','out/endclip.mp4','out/card.mp4']
cmd=['ffmpeg','-v','error','-y']
for s in srcs: cmd+=['-i',s]
for l in LAY: cmd+=['-loop','1','-t','%.2f'%(DUR+0.2),'-i','out/%s.png'%l]
cmd+=['-i','out/mix.wav','-filter_complex',';'.join(fc),'-map','[%s]'%prev,'-map','%d:a'%(len(srcs)+len(LAY)),
      '-t','%.3f'%DUR,'-r',str(FPS),'-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
      '-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart','out/%s.mp4'%NAME]
subprocess.run(cmd,check=True); print('written out/%s.mp4'%NAME)
