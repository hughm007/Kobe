#!/usr/bin/env python3
# TripNerd "The thread" v3 — the owner's two clips after the thread: A = the ball lands and stops by the pin (16:9),
# B = the group in the TripNerd suite watching it on the TV and erupting (16:9). Both are 16:9, so each gets a 9:16 window
# that moves like a camera: A holds on the flag and the ball; B starts on the TV and pans left to the men as they erupt
# (the AI-rendered wall mark at the right of B stays out of the window; the real logo file carries the brand in the lockup).
# Joins are short crossfades. 24 fps. Sound: the thread's tones, the clips' own sound (disclosed as generated), the real
# gallery murmur under A and the real crowd swell on the eruption; -14 LUFS. AI disclosure line at the first generated shot.
import subprocess, json, numpy as np, os, sys
from PIL import Image, ImageDraw, ImageFont
W,H,FPS,SR=1080,1920,24,48000; NAME='TN-R02-the-thread-v3'; BGHEX='0x1c1c1e'
A=sys.argv[1] if len(sys.argv)>1 else '/home/user/owner/A_adac6b4d.mp4'; B=sys.argv[2] if len(sys.argv)>2 else '/home/user/owner/B_0c1646c7.mp4'
T_THREAD=8.0; XF=0.3                      # crossfade length at each join
A_IN,A_LEN=0.70,4.20; B_IN,B_LEN=0.00,5.00
DUR=T_THREAD+A_LEN+B_LEN-2*XF             # 16.6 s
tA=T_THREAD-XF; tB=tA+A_LEN-XF            # start of A and B in the piece (7.7, 11.6)
# window positions as fractions of source width (9:16 window = 0.3164 of width at full height)
A_X0=0.38                                 # A: the flag sits at ~0.54 of the source width; the window holds it and the ball centre-frame
B_X0,B_X1=0.15,0.05                        # B: start on the TV (the AI-rendered wall mark at x>0.55 stays out), pan left to the men over 1.2-2.8 s of the clip
def probe(p):
    o=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',p],capture_output=True,text=True).stdout.strip().split(','); return int(o[0]),int(o[1])
aw,ah=probe(A); bw,bh=probe(B); cwA=int(ah*9/16)//2*2; cwB=int(bh*9/16)//2*2
# lockup: pill in the upper band (y 300-706) over B's ceiling and TV, so the men's faces stay clear
LOGO=Image.open('src/logo.png').convert('RGBA'); LOGO=LOGO.resize((560,int(560*LOGO.height/LOGO.width)),Image.LANCZOS)
PILL=(82,142,224,242); FB=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',58); FHh=ImageFont.truetype('fonts/Montserrat-Medium.ttf',40); FD=ImageFont.truetype('fonts/Montserrat-Medium.ttf',40)
def lockup(top):
    L=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(L); pw=760; ph=LOGO.height+200
    d.rounded_rectangle(((W-pw)//2,top,(W+pw)//2,top+ph),radius=36,fill=PILL); L.alpha_composite(LOGO,((W-LOGO.width)//2,top+36))
    t='Hospitality. Handled.'; bb=d.textbbox((0,0),t,font=FB); d.text(((W-(bb[2]-bb[0]))//2-bb[0],top+LOGO.height+58),t,font=FB,fill=(255,255,255,255))
    h='@tripnerd'; bb=d.textbbox((0,0),h,font=FHh); d.text(((W-(bb[2]-bb[0]))//2-bb[0],top+LOGO.height+128),h,font=FHh,fill=(255,255,255,210)); return L
lockup(300).save('out/lockup_v3.png')
D=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(D); t='Scenes dramatized'; bb=d.textbbox((0,0),t,font=FD)
d.rounded_rectangle((60,1140,60+(bb[2]-bb[0])+44,1140+64),radius=16,fill=(0,0,0,150)); d.text((82-bb[0],1140+12),t,font=FD,fill=(255,255,255,235)); D.save('out/disclose.png')
# ---------- picture ----------
panB="'(%d*(%.4f+(%.4f-%.4f)*(1-pow(1-clip((t-1.2)/1.6,0,1),2))))'"%(bw,B_X0,B_X1,B_X0)   # eased pan, 1.2-2.8 s of the clip
fc=['[0:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,setsar=1[t]'%(T_THREAD,FPS),
    "[1:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,crop=%d:%d:%d:0,scale=1080:1920:flags=lanczos,setsar=1[a]"%(A_IN,A_IN+A_LEN,FPS,cwA,ah,int(A_X0*aw),),
    "[2:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,crop=%d:%d:x=%s:y=0,scale=1080:1920:flags=lanczos,setsar=1[b]"%(B_IN,B_IN+B_LEN,FPS,cwB,bh,panB),
    "[t][a]xfade=transition=fade:duration=%.2f:offset=%.3f[ta]"%(XF,T_THREAD-XF),
    "[ta][b]xfade=transition=fade:duration=%.2f:offset=%.3f[v0]"%(XF,tA+A_LEN-XF),
    "[4:v]format=rgba,fade=in:st=%.2f:d=0.2:alpha=1,fade=out:st=%.2f:d=0.2:alpha=1,setpts=PTS-STARTPTS[dc]"%(tA+0.3,tA+2.6),
    "[3:v]format=rgba,fade=in:st=%.2f:d=0.3:alpha=1,setpts=PTS-STARTPTS[lk]"%(tB+3.4),
    "[v0][dc]overlay=0:0:enable='between(t,%.2f,%.2f)'[v1]"%(tA+0.3,tA+2.8),
    "[v1][lk]overlay=0:0:enable='gte(t,%.2f)',fade=t=out:st=%.3f:d=0.25:color=%s[v]"%(tB+3.4,DUR-0.25,BGHEX)]
subprocess.run(['ffmpeg','-v','error','-y','-i','out/thread_v3_silent.mp4','-i',A,'-i',B,'-loop','1','-i','out/lockup_v3.png','-loop','1','-i','out/disclose.png','-filter_complex',';'.join(fc),'-map','[v]','-t','%.3f'%DUR,'-r',str(FPS),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart','out/%s_silent.mp4'%NAME],check=True)
print('silent master written, DUR %.2f, A at %.2f, B at %.2f'%(DUR,tA,tB))
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
for e in json.load(open('out/arrivals_v3.json')):
    if e['kind']=='sep': continue
    if e['text'].startswith('Booked'): place(swoosh(),e['t'],-6.0); continue
    f=rng.uniform(0.96,1.04); place(tone(1318*f,1760*f),e['t'],-12.0)
def aread(p,ss,dur,af=None):
    cmd=['ffmpeg','-v','error','-ss','%.4f'%ss,'-i',p,'-t','%.4f'%dur,'-vn']+(['-af',af] if af else [])+['-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True,check=True).stdout,np.float32).reshape(-1,2).copy()
place(aread('src/gal1.mp4',2.0,4.8,af='highpass=f=120,lowpass=f=6000'),tA-0.4,-16.0,fi=0.8,fo=0.5)      # real gallery murmur under the landing
place(aread(A,A_IN,A_LEN,af='highpass=f=80'),tA,-9.0,fi=0.3,fo=0.3)                                     # the clip's own sound (generated, disclosed): the hit and the gallery
place(aread(B,B_IN,B_LEN,af='highpass=f=80'),tB,-4.0,fi=0.3,fo=0.4)                                     # the clip's own sound: the room, then the cheer
place(aread('src/v24.mp4',13.3,2.6,af='lowpass=f=3200'),tB+1.45,-10.0,fi=0.1,fo=0.6)                    # the real crowd swell under the eruption (V24, shaped)
mix=mix[:int(DUR*SR)]; pk=np.abs(mix).max(); mix=np.clip(mix/max(pk,1e-6)*0.9,-1,1)
open('out/pre3.f32','wb').write(mix.astype(np.float32).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','out/pre3.f32','out/pre3.wav'],check=True)
def measure(p):
    m=subprocess.run(['ffmpeg','-i',p,'-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rfind('{'):m.rfind('}')+1]); return float(j['input_i']),float(j['input_tp'])
gain=0.0
for _ in range(3):
    I,TP=measure('out/pre3.wav' if gain==0 else 'out/mix3.wav'); gain+=(-14.0-I)
    subprocess.run(['ffmpeg','-v','error','-y','-i','out/pre3.wav','-af','volume=%.2fdB,aresample=192000,alimiter=limit=0.891:attack=1:release=60:level=false,aresample=%d'%(gain,SR),'out/mix3.wav'],check=True)
I,TP=measure('out/mix3.wav'); print('mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)'%(I,TP,gain))
subprocess.run(['ffmpeg','-v','error','-y','-i','out/%s_silent.mp4'%NAME,'-i','out/mix3.wav','-c:v','copy','-c:a','aac','-b:a','192k','-ar',str(SR),'-shortest','-movflags','+faststart','out/%s.mp4'%NAME],check=True)
print('master: out/%s.mp4'%NAME)
