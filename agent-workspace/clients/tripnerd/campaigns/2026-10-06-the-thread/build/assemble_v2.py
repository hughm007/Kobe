#!/usr/bin/env python3
# TripNerd "The thread" v2 — Augusta week. Picture: the thread (0-8.0) + the real house (push) + the owner's Higgsfield clips
# (porch, gallery POV, the ball through the pines, the landing beside the pin with the gallery, the man in the chair) + lockup.
# 24 fps throughout (the Kling clips are native 24). Sound: thread tones, real gallery murmur (TripNerd's own recording),
# a real crowd swell on the landing (V24, shaped), no music. AI disclosure line at the first generated shot.
import subprocess, json, numpy as np
from PIL import Image, ImageDraw, ImageFont
W,H,FPS,SR=1080,1920,24,48000; DUR=16.0; NAME='TN-R02-the-thread-v2'; BGHEX='0x1c1c1e'
AI='/home/user/aiset/'
# (label, seq in, seq out, source, src in)  — AI clips are cut to length from src in
CUTS=[('house',8.0,9.2,'out/house.png',0.0),('porch',9.2,10.5,AI+'porch_448b8e8f.mp4',0.4),('pov',10.5,11.8,AI+'gallerypov_57eb5c7e.mp4',1.0),
      ('sky',11.8,12.5,AI+'ballsky_288abcb7.mp4',0.4),('land',12.5,14.6,AI+'land_379c3ae7.mp4',0.8),('chair',14.6,16.0,AI+'chairman_36068f8b.mp4',0.5)]
# the real house: a full-height 9:16 crop, oversampled 2x for the push
im=Image.open('src/house_up.png').convert('RGB'); w,h=im.size; cw=int(h*9/16); x0=int(0.33*w); im.crop((x0,0,x0+cw,h)).resize((2160,3840),Image.LANCZOS).save('out/house.png')
# lockup, raised: pill bottom at 1240 (the Reels clear zone ends at 65 % = 1248)
LOGO=Image.open('src/logo.png').convert('RGBA'); LOGO=LOGO.resize((560,int(560*LOGO.height/LOGO.width)),Image.LANCZOS)
PILL=(82,142,224,242); FB=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',58); FHh=ImageFont.truetype('fonts/Montserrat-Medium.ttf',40); FD=ImageFont.truetype('fonts/Montserrat-Medium.ttf',36)
def lockup():
    L=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(L); pw=760; ph=LOGO.height+200; top=1240-ph
    d.rounded_rectangle(((W-pw)//2,top,(W+pw)//2,top+ph),radius=36,fill=PILL); L.alpha_composite(LOGO,((W-LOGO.width)//2,top+36))
    t='Hospitality. Handled.'; bb=d.textbbox((0,0),t,font=FB); d.text(((W-(bb[2]-bb[0]))//2-bb[0],top+LOGO.height+58),t,font=FB,fill=(255,255,255,255))
    h='@tripnerd'; bb=d.textbbox((0,0),h,font=FHh); d.text(((W-(bb[2]-bb[0]))//2-bb[0],top+LOGO.height+128),h,font=FHh,fill=(255,255,255,210)); return L
lockup().save('out/lockup_v2.png')
D=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(D); t='Course scenes dramatised'; bb=d.textbbox((0,0),t,font=FD)
d.rounded_rectangle((60,1140,60+(bb[2]-bb[0])+44,1140+64),radius=16,fill=(0,0,0,120)); d.text((82-bb[0],1140+12),t,font=FD,fill=(255,255,255,235)); D.save('out/disclose.png')
# ---------- picture ----------
ins=['-i','out/thread_v2_silent.mp4']; fc=['[0:v]trim=0:8.0,setpts=PTS-STARTPTS,fps=%d,setsar=1[t]'%FPS]; labels=['[t]']
for k,(lab,a,b,src,si) in enumerate(CUTS):
    n=k+1; L=b-a
    if lab=='house':
        ins+=['-loop','1','-i',src]; fc.append("[%d:v]zoompan=z='1+0.06*on/%d':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=%d,trim=0:%.3f,setpts=PTS-STARTPTS,setsar=1[%s]"%(n,int(L*FPS),FPS,L,lab))
    elif lab=='chair':   # 1.28x, anchored to the top: the man's face sits in the upper third, the lockup lands on his torso, never his face
        ins+=['-i',src]; fc.append('[%d:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1382:2467:flags=lanczos,crop=1080:1920:151:540,setsar=1[%s]'%(n,si,si+L,FPS,lab))
    else:
        ins+=['-i',src]; fc.append('[%d:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1080:1927:flags=lanczos,crop=1080:1920:0:3,setsar=1[%s]'%(n,si,si+L,FPS,lab))
    labels.append('[%s]'%lab)
fc.append(''.join(labels)+'concat=n=%d:v=1:a=0[v0]'%len(labels))
n=len(CUTS)+1; ins+=['-loop','1','-i','out/lockup_v2.png','-loop','1','-i','out/disclose.png']
fc.append("[%d:v]format=rgba,fade=in:st=14.6:d=0.3:alpha=1,setpts=PTS-STARTPTS[lk]"%n)
fc.append("[%d:v]format=rgba,fade=in:st=9.2:d=0.2:alpha=1,fade=out:st=11.5:d=0.2:alpha=1,setpts=PTS-STARTPTS[dc]"%(n+1))
fc.append("[v0][dc]overlay=0:0:enable='between(t,9.2,11.7)'[v1]"); fc.append("[v1][lk]overlay=0:0:enable='gte(t,14.6)',fade=t=out:st=15.75:d=0.25:color=%s[v]"%BGHEX)
subprocess.run(['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fc),'-map','[v]','-t','%.2f'%DUR,'-r',str(FPS),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart','out/%s_silent.mp4'%NAME],check=True)
print('silent master written')
# ---------- sound ----------
mix=np.zeros((int(DUR*SR)+SR,2),np.float32)
def place(sig,at,gain_db,fi=0.0,fo=0.0):
    g=10**(gain_db/20); n=len(sig); env=np.ones(n,np.float32)
    if fi: k=int(fi*SR); env[:k]=np.linspace(0,1,k)
    if fo: k=int(fo*SR); env[-k:]=np.linspace(1,0,k)
    s=int(at*SR); e=min(len(mix),s+n); mix[s:e]+=sig[:e-s]*(g*env[:e-s])[:,None]
def tone(f1,f2,dur=0.22,amp=0.5):
    t=np.arange(int(dur*SR))/SR; env=np.minimum(t/0.004,1)*np.exp(-t/0.06)
    s=(np.sin(2*np.pi*f1*t)*0.6+np.sin(2*np.pi*f2*t)*0.4)*env*amp; return np.stack([s,s],1).astype(np.float32)
def swoosh(dur=0.28,amp=0.4):
    rng=np.random.default_rng(7); n=int(dur*SR); x=rng.standard_normal(n).astype(np.float32); y=np.zeros(n,np.float32); a=0.0
    for i in range(n):
        c=0.02+0.3*(i/n); a=a+c*(x[i]-a); y[i]=a
    env=np.sin(np.pi*np.arange(n)/n)**2; y=y/np.abs(y).max()*env*amp
    th=np.sin(2*np.pi*70*np.arange(int(0.18*SR))/SR)*np.exp(-np.arange(int(0.18*SR))/SR/0.05)*0.5; out=y.copy(); out[:len(th)]+=th.astype(np.float32); return np.stack([out,out],1)
rng=np.random.default_rng(3)
for e in json.load(open('out/arrivals_v2.json')):
    if e['kind']=='sep': continue
    if e['text'].startswith('Booked'): place(swoosh(),e['t'],-6.0); continue
    f=rng.uniform(0.96,1.04); place(tone(1318*f,1760*f),e['t'],-12.0)
def aread(p,ss,dur,af=None):
    cmd=['ffmpeg','-v','error','-ss','%.4f'%ss,'-i',p,'-t','%.4f'%dur,'-vn']+(['-af',af] if af else [])+['-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True,check=True).stdout,np.float32).reshape(-1,2).copy()
place(aread('src/gal1.mp4',2.0,6.6,af='highpass=f=120,lowpass=f=6000'),8.0,-14.0,fi=1.2,fo=0.6)             # the real gallery murmur (TripNerd's own walk-in recording), distant under the house and porch, present under the gallery
place(aread('src/v24.mp4',13.3,2.4,af='lowpass=f=3200'),14.15,-7.0,fi=0.08,fo=0.5)                            # the real crowd swell as the ball stops (V24, shaped to applause); carries under the chair and the lockup
mix=mix[:int(DUR*SR)]; pk=np.abs(mix).max(); mix=np.clip(mix/max(pk,1e-6)*0.9,-1,1)
open('out/pre2.f32','wb').write(mix.astype(np.float32).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','out/pre2.f32','out/pre2.wav'],check=True)
def measure(p):
    m=subprocess.run(['ffmpeg','-i',p,'-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rfind('{'):m.rfind('}')+1]); return float(j['input_i']),float(j['input_tp'])
gain=0.0
for _ in range(3):
    I,TP=measure('out/pre2.wav' if gain==0 else 'out/mix2.wav'); gain+=(-14.0-I)
    subprocess.run(['ffmpeg','-v','error','-y','-i','out/pre2.wav','-af','volume=%.2fdB,aresample=192000,alimiter=limit=0.891:attack=1:release=60:level=false,aresample=%d'%(gain,SR),'out/mix2.wav'],check=True)
I,TP=measure('out/mix2.wav'); print('mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)'%(I,TP,gain))
subprocess.run(['ffmpeg','-v','error','-y','-i','out/%s_silent.mp4'%NAME,'-i','out/mix2.wav','-c:v','copy','-c:a','aac','-b:a','192k','-ar',str(SR),'-shortest','-movflags','+faststart','out/%s.mp4'%NAME],check=True)
print('master: out/%s.mp4'%NAME)
