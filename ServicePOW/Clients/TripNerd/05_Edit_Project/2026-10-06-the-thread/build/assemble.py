#!/usr/bin/env python3
# TripNerd "The thread" — assembly and sound. Picture: thread (0-8.0) + photo A (8.0-9.8, push) + photo B (9.8-11.4, push)
# + V24 roar (11.4-13.6) + V24 tail with the lockup (13.6-15.0). Sound: synthesised notification tones on each arrival
# (UI sound design), a 'sent' swoosh on Booked, then V24's real murmur and roar. Static gain + true-peak limiter to -14 LUFS.
import subprocess, json, numpy as np, sys
from PIL import Image, ImageDraw, ImageFont
W,H,FPS,SR=1080,1920,30,48000; DUR=15.0; NAME='TN-R02-the-thread-v1'
A,B='src/A_up.png','src/B_up.png'
def strip(path,x0,x1):
    """photo A: a full-height 9:16 window that pans from x0 to x1 (fractions of width); saved as the wide strip, scaled to 1920 high."""
    im=Image.open(path).convert('RGB'); w,h=im.size; cw=int(h*9/16); s=im.crop((int(x0*w),0,int(x1*w)+cw,h)); return s.resize((int(s.width*1920/h),1920),Image.LANCZOS)
def tall(path,x0):
    """photo B: a full-height 9:16 crop, oversampled 2x for the push."""
    im=Image.open(path).convert('RGB'); w,h=im.size; cw=int(h*9/16); return im.crop((int(x0*w),0,int(x0*w)+cw,h)).resize((2160,3840),Image.LANCZOS)
strip(A,0.17,0.305).save('out/A_strip.png'); tall(B,0.36).save('out/B.png'); print('A strip',Image.open('out/A_strip.png').size)
# lockup (ported from the ROAR build): brand-blue pill, the real logo, the approved line, the handle
LOGO=Image.open('src/logo.png').convert('RGBA'); LOGO=LOGO.resize((560,int(560*LOGO.height/LOGO.width)),Image.LANCZOS)
PILL=(82,142,224,242); FB=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',58); FHh=ImageFont.truetype('fonts/Montserrat-Medium.ttf',40)
def lockup():
    L=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(L); pw=760; ph=LOGO.height+200; top=1481-ph
    d.rounded_rectangle(((W-pw)//2,top,(W+pw)//2,top+ph),radius=36,fill=PILL)
    L.alpha_composite(LOGO,((W-LOGO.width)//2,top+36))
    t='Hospitality. Handled.'; bb=d.textbbox((0,0),t,font=FB); d.text(((W-(bb[2]-bb[0]))//2-bb[0],top+LOGO.height+58),t,font=FB,fill=(255,255,255,255))
    h='@tripnerd'; bb=d.textbbox((0,0),h,font=FHh); d.text(((W-(bb[2]-bb[0]))//2-bb[0],top+LOGO.height+128),h,font=FHh,fill=(255,255,255,210))
    return L
lockup().save('out/lockup.png')
push=lambda secs: "zoompan=z='1+0.06*on/%d':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30"%int(secs*FPS)
fc=['[0:v]trim=0:8.0,setpts=PTS-STARTPTS,fps=30,setsar=1[t]',
    "[1:v]crop=1080:1920:x='(iw-1080)*(1-pow(1-min(t/2.0\\,1)\\,2))':y=0,trim=0:2.0,setpts=PTS-STARTPTS,fps=30,setsar=1[a]",
    "[2:v]%s,trim=0:1.4,setpts=PTS-STARTPTS,setsar=1[b]"%push(1.4),
    '[3:v]trim=13.3:15.5,setpts=PTS-STARTPTS,fps=30,scale=1080:1920:flags=lanczos,setsar=1[r]',
    '[3:v]trim=15.5:16.9,setpts=PTS-STARTPTS,fps=30,scale=1080:1920:flags=lanczos,setsar=1[r2]',
    '[t][a][b][r][r2]concat=n=5:v=1:a=0[v0]',
    "[4:v]format=rgba,fade=in:st=13.6:d=0.35:alpha=1,setpts=PTS-STARTPTS[lk]",
    "[v0][lk]overlay=0:0:enable='gte(t,13.6)'[v]"]
subprocess.run(['ffmpeg','-v','error','-y','-i','out/thread_silent.mp4','-loop','1','-i','out/A_strip.png','-loop','1','-i','out/B.png','-i','src/v24up.mp4','-loop','1','-i','out/lockup.png','-filter_complex',';'.join(fc),'-map','[v]','-t','%.2f'%DUR,'-r',str(FPS),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart','out/%s_silent.mp4'%NAME],check=True)
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
    rng=np.random.default_rng(7); n=int(dur*SR); x=rng.standard_normal(n).astype(np.float32)
    # simple one-pole band sweep: low-pass whose cutoff rises, then a fade
    y=np.zeros(n,np.float32); a=0.0
    for i in range(n):
        c=0.02+0.3*(i/n); a=a+c*(x[i]-a); y[i]=a
    env=np.sin(np.pi*np.arange(n)/n)**2; y=y/np.abs(y).max()*env*amp
    thump=np.sin(2*np.pi*70*np.arange(int(0.18*SR))/SR)*np.exp(-np.arange(int(0.18*SR))/SR/0.05)*0.5
    out=np.zeros(n,np.float32); out+=y; out[:len(thump)]+=thump.astype(np.float32)
    return np.stack([out,out],1)
rng=np.random.default_rng(3)
for e in json.load(open('out/arrivals.json')):
    if e['kind']=='sep': continue
    if e['text'].startswith('Booked'): place(swoosh(),e['t'],-6.0); continue
    f=rng.uniform(0.96,1.04); place(tone(1318*f,1760*f),e['t'],-12.0)
def aread(p,ss,dur):
    b=subprocess.run(['ffmpeg','-v','error','-ss','%.4f'%ss,'-i',p,'-t','%.4f'%dur,'-vn','-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(b,np.float32).reshape(-1,2).copy()
place(aread('src/v24.mp4',8.0,3.6),8.0,-8.0,fi=0.6,fo=0.3)      # the real murmur under the two photos (V24's own pre-hit bed)
place(aread('src/v24.mp4',13.1,4.0),11.2,0.0,fi=0.05,fo=0.3)     # the real roar leads the picture cut by 0.2 s and carries to the end
mix=mix[:int(DUR*SR)]; pk=np.abs(mix).max(); mix=np.clip(mix/max(pk,1e-6)*0.9,-1,1)
open('out/pre.f32','wb').write(mix.astype(np.float32).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','out/pre.f32','out/pre.wav'],check=True)
def measure(p):
    m=subprocess.run(['ffmpeg','-i',p,'-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rfind('{'):m.rfind('}')+1]); return float(j['input_i']),float(j['input_tp'])
gain=0.0
for _ in range(3):
    I,TP=measure('out/pre.wav' if gain==0 else 'out/mix.wav'); gain+=(-14.0-I)
    subprocess.run(['ffmpeg','-v','error','-y','-i','out/pre.wav','-af','volume=%.2fdB,aresample=192000,alimiter=limit=0.891:attack=1:release=60:level=false,aresample=%d'%(gain,SR),'out/mix.wav'],check=True)
I,TP=measure('out/mix.wav'); print('mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)'%(I,TP,gain))
subprocess.run(['ffmpeg','-v','error','-y','-i','out/%s_silent.mp4'%NAME,'-i','out/mix.wav','-c:v','copy','-c:a','aac','-b:a','192k','-ar',str(SR),'-shortest','-movflags','+faststart','out/%s.mp4'%NAME],check=True)
print('master: out/%s.mp4'%NAME)
