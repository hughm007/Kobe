#!/usr/bin/env python3
# TripNerd "Two ways to see the 17th" v2 (owner's redirect, 2026-10-06): the same putt, two people.
# WITHOUT TripNerd: the back of the crowd, the roar goes up ahead, the camera hops to see over heads and sees
# nothing, then looks up at the suites. WITH TripNerd: two guests already at the rail, the putt drops, the roar,
# "Who are you bringing?". Real footage and real sound only (the roar is V24's, heard muffled from the gallery,
# then clear from the suite). 1080x1920, 30 fps, 9.8 s.
# usage: python3 build_twoways_v2.py  (expects src/g2up.mp4 src/g2.mp4 src/v24up.mp4 src/v24.mp4, fonts/)
import subprocess, json, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS,SR=1080,1920,30,48000
NAME='TN-R01-two-ways-17th-v2'
# (name, seq in, seq out, source, source in, source out)
SEQ=[('s1',0.0,3.6,'src/g2up.mp4',1.0,4.6),    # back of the crowd; the roar hits at seq 1.4; hops from 1.4
     ('s2',3.6,5.0,'src/g2up.mp4',14.8,16.2),  # the fan looks up at the suites
     ('s3',5.0,6.4,'src/v24up.mp4',0.2,1.6),   # two guests already at the rail, backs, 17 below
     ('s4',6.4,8.6,'src/v24up.mp4',13.4,15.6), # the putt drops; the roar; arms up below
     ('s5',8.6,9.8,'src/v24up.mp4',15.6,16.8)] # the roar settles, 103 % push
DUR=9.8; HOP=1.4
TEXT=[('Two ways to see the 17th.',0.1,1.3),('Without TripNerd.',1.5,3.5),('With TripNerd.',5.2,7.0),('Who are you bringing?',8.4,9.8)]
F=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',76)

def card(text,path):
    L=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(L); lines=[]; cur=''
    for w in text.split():
        t=(cur+' '+w).strip()
        if d.textbbox((0,0),t,font=F)[2]>900: lines.append(cur); cur=w
        else: cur=t
    lines.append(cur); y=330; sh=Image.new('L',(W,H),0); ds=ImageDraw.Draw(sh)
    for ln in lines:
        bb=d.textbbox((0,0),ln,font=F); x=(W-(bb[2]-bb[0]))//2-bb[0]
        ds.text((x,y),ln,font=F,fill=255); d.text((x,y),ln,font=F,fill=(255,255,255,255)); y+=96
    sh=sh.filter(ImageFilter.GaussianBlur(10)).point(lambda v:int(v*0.6))
    S=Image.new('RGBA',(W,H),(0,0,0,0)); S.paste((0,0,0,255),(0,0),sh); S.alpha_composite(L); S.save(path)
for i,(t,a,b) in enumerate(TEXT): card(t,'out/v2card%d.png'%i)

# ---------- picture ----------
# s1: a 1.3x crop low in the frame (heads and hats fill it), then three hops up from HOP: the crop window rises
# 70 px on a half-sine and settles, with a 2 % zoom pulse, so the viewer is the fan on tiptoe
hop="(90*abs(sin(PI*1.7*(t-%.2f)))*gte(t,%.2f)*lt(t,%.2f))"%(HOP,HOP,HOP+1.77)
s1x=",crop=745:1324:167:'576-%s',scale=1080:1920:flags=lanczos,setsar=1"%hop   # 1.45x, bottom-anchored: heads and shoulders fill the frame; only y moves (crop sizes are fixed at init in ffmpeg)
s2x=",crop=900:1600:90:160,scale=1080:1920:flags=lanczos,setsar=1"                                  # a gentle 1.2x on the look-up
s5x=",zoompan=z='1+0.03*on/36':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30"
fc=[]; ins=[]
for k,(nm,a,b,src,si,so) in enumerate(SEQ):
    ins+=['-i',src]; extra={'s1':s1x,'s2':s2x,'s5':s5x}.get(nm,'')
    fc.append('[%d:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=%d:%d:flags=lanczos,setsar=1%s[%s]'%(k,si,so,FPS,W,H,extra,nm))
fc.append(''.join('[%s]'%s[0] for s in SEQ)+'concat=n=%d:v=1:a=0[v0]'%len(SEQ))
n=len(SEQ); last='v0'
for i,(t,a,b) in enumerate(TEXT):
    ins+=['-loop','1','-i','out/v2card%d.png'%i]
    fc.append("[%d:v]format=rgba,fade=in:st=%.2f:d=0.25:alpha=1,fade=out:st=%.2f:d=0.25:alpha=1,setpts=PTS-STARTPTS[c%d]"%(n+i,a,b-0.25,i))
    fc.append("[%s][c%d]overlay=0:0:enable='between(t,%.2f,%.2f)'[v%d]"%(last,i,a,b,i+1)); last='v%d'%(i+1)
subprocess.run(['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fc),'-map','[%s]'%last,'-t','%.2f'%DUR,'-r',str(FPS),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart','out/%s_silent.mp4'%NAME],check=True)
print('silent master written')

# ---------- sound (real only) ----------
def aread(p,ss,dur,af=None):
    cmd=['ffmpeg','-v','error','-ss','%.4f'%ss,'-i',p,'-t','%.4f'%dur,'-vn']+(['-af',af] if af else [])+['-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True,check=True).stdout,np.float32).reshape(-1,2).copy()
mix=np.zeros((int(DUR*SR)+SR,2),np.float32)
def place(sig,at,gain_db,fi=0.0,fo=0.0):
    g=10**(gain_db/20); n=len(sig); env=np.ones(n,np.float32)
    if fi: k=int(fi*SR); env[:k]=np.linspace(0,1,k)
    if fo: k=int(fo*SR); env[-k:]=np.linspace(1,0,k)
    s=int(at*SR); e=min(len(mix),s+n); mix[s:e]+=sig[:e-s]*(g*env[:e-s])[:,None]
place(aread('src/g2.mp4',1.0,5.2),0.0,0.0,fi=0.05,fo=0.3)                                   # the crowd around the fan (g2's own walla), through the look-up
place(aread('src/v24.mp4',13.1,3.9,af='lowpass=f=2200,lowpass=f=2200'),1.3,-6.0,fi=0.15,fo=0.4)  # the same roar, heard from the back: muffled, ahead of us
place(aread('src/v24.mp4',0.2,1.6),5.0,-3.0,fi=0.1,fo=0.2)                                   # the rail: calm murmur
place(aread('src/v24.mp4',13.2,3.6),6.2,0.0,fi=0.05,fo=0.25)                                 # the roar, clear, leading the picture cut by 0.2 s
mix=mix[:int(DUR*SR)]; pk=np.abs(mix).max(); mix=np.clip(mix/max(pk,1e-6)*0.9,-1,1)
open('out/v2pre.f32','wb').write(mix.astype(np.float32).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','out/v2pre.f32','out/v2pre.wav'],check=True)
def measure(p):
    m=subprocess.run(['ffmpeg','-i',p,'-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rfind('{'):m.rfind('}')+1]); return float(j['input_i']),float(j['input_tp'])
gain=0.0
for _ in range(3):
    I,TP=measure('out/v2pre.wav' if gain==0 else 'out/v2mix.wav'); gain+=(-14.0-I)
    subprocess.run(['ffmpeg','-v','error','-y','-i','out/v2pre.wav','-af','volume=%.2fdB,aresample=192000,alimiter=limit=0.891:attack=1:release=60:level=false,aresample=%d'%(gain,SR),'out/v2mix.wav'],check=True)
I,TP=measure('out/v2mix.wav'); print('mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)'%(I,TP,gain))
subprocess.run(['ffmpeg','-v','error','-y','-i','out/%s_silent.mp4'%NAME,'-i','out/v2mix.wav','-c:v','copy','-c:a','aac','-b:a','192k','-ar',str(SR),'-shortest','-movflags','+faststart','out/%s.mp4'%NAME],check=True)
print('master: out/%s.mp4'%NAME)
