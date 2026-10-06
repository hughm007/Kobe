#!/usr/bin/env python3
# TripNerd Reel 01 "Two ways to see the 17th" (H1), built to the storyboard Karl approved 2026-10-04
# (campaigns/2026-10-04-launch-reels/edit-plan-01-two-ways-17th.md): 10.6 s, five shots, real sound only, no music.
# 1080x1920, 30 fps. Picture: ffmpeg trims + the S2 crop (keeps TRIPNERD, drops the tournament half of the
# banner) + a 103 % push on S5 + PIL text cards. Sound: numpy placement of the real clips, then loudnorm.
# usage: python3 build_twoways.py [--variant H1|H10] [--stills]   (expects src/g1up.mp4 src/v23up.mp4 src/v24up.mp4 src/g1.mp4 src/v23.mp4 src/v24.mp4)
import subprocess, json, argparse, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ap=argparse.ArgumentParser(); ap.add_argument('--variant',default='H1'); ap.add_argument('--stills',action='store_true'); A=ap.parse_args()
W,H,FPS,SR=1080,1920,30,48000
# sequence (seq in, seq out, source file, source in, source out)
SEQ=[('s1',0.0,4.5,'src/g1up.mp4',2.0,6.5), ('s2',4.5,5.5,'src/v23up.mp4',4.2,5.2), ('s3',5.5,7.9,'src/v24up.mp4',8.4,10.8),
     ('s4',7.9,9.4,'src/v24up.mp4',13.4,14.9), ('s5',9.4,10.6,'src/v24up.mp4',14.9,16.1)]
DUR=10.6
TEXT={'H1':[('Two ways to see the 17th.',0.1,2.0),('1. The path.',2.0,4.5),('2. The rail.',6.0,7.9),('Who are you bringing?',9.2,10.6)],
      'H10':[('The path or the rail?',0.1,2.0),('The path.',2.0,4.5),('The rail.',6.0,7.9),('Which one are you?',9.2,10.6)]}[A.variant]
NAME='TN-R01-two-ways-17th-%s-v1'%A.variant
F=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',76)

def card(text,path):
    """One text card, white bold sans with a soft shadow, upper third (below the 250 px UI zone), <= 2 lines."""
    L=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(L); lines=[]; cur=''
    for w in text.split():
        t=(cur+' '+w).strip()
        if d.textbbox((0,0),t,font=F)[2]>900: lines.append(cur); cur=w
        else: cur=t
    lines.append(cur); y=330
    sh=Image.new('L',(W,H),0); ds=ImageDraw.Draw(sh)
    for ln in lines:
        bb=d.textbbox((0,0),ln,font=F); x=(W-(bb[2]-bb[0]))//2-bb[0]
        ds.text((x,y),ln,font=F,fill=255); d.text((x,y),ln,font=F,fill=(255,255,255,255)); y+=96
    sh=sh.filter(ImageFilter.GaussianBlur(10)).point(lambda v:int(v*0.6))
    S=Image.new('RGBA',(W,H),(0,0,0,0)); S.paste((0,0,0,255),(0,0),sh); S.alpha_composite(L); S.save(path)

for i,(t,a,b) in enumerate(TEXT): card(t,'out/card%d.png'%i)

# ---------- picture ----------
fc=[]; ins=[]
for k,(nm,a,b,src,si,so) in enumerate(SEQ):
    ins+=['-i',src]
    extra=''
    if nm=='s2': extra=',crop=720:1280:360:320,scale=1080:1920:flags=lanczos'            # 1.5x, anchored right: TRIPNERD stays, the tournament name goes
    if nm=='s5': extra=",scale=1080:1920,zoompan=z='1+0.03*on/36':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30"   # the 103 % push
    fc.append('[%d:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=%d:%d:flags=lanczos,setsar=1%s[%s]'%(k,si,so,FPS,W,H,extra,nm))
fc.append(''.join('[%s]'%s[0] for s in SEQ)+'concat=n=%d:v=1:a=0[v0]'%len(SEQ))
n=len(SEQ); last='v0'
for i,(t,a,b) in enumerate(TEXT):
    ins+=['-loop','1','-i','out/card%d.png'%i]
    fc.append("[%d:v]format=rgba,fade=in:st=%.2f:d=0.25:alpha=1,fade=out:st=%.2f:d=0.25:alpha=1,setpts=PTS-STARTPTS[c%d]"%(n+i,a,b-0.25,i))
    fc.append("[%s][c%d]overlay=0:0:enable='between(t,%.2f,%.2f)'[v%d]"%(last,i,a,b,i+1)); last='v%d'%(i+1)
vid=['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fc),'-map','[%s]'%last,'-t','%.2f'%DUR,'-r',str(FPS),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart','out/%s_silent.mp4'%NAME]
subprocess.run(vid,check=True); print('silent master written')

# ---------- sound (real only) ----------
def aread(p,ss,dur):
    b=subprocess.run(['ffmpeg','-v','error','-ss','%.4f'%ss,'-i',p,'-t','%.4f'%dur,'-vn','-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(b,np.float32).reshape(-1,2).copy()
mix=np.zeros((int(DUR*SR)+SR,2),np.float32)
def place(sig,at,gain_db,fi=0.0,fo=0.0):
    g=10**(gain_db/20); n=len(sig); env=np.ones(n,np.float32)
    if fi: k=int(fi*SR); env[:k]=np.linspace(0,1,k)
    if fo: k=int(fo*SR); env[-k:]=np.linspace(1,0,k)
    s=int(at*SR); mix[s:s+n]+=sig*(g*env)[:,None]
walla=aread('src/g1.mp4',2.0,4.8);  place(walla,0.0,0.0,fi=0.05,fo=0.6)            # S1: the path, real crowd walla; fades under the J-cut
suite=aread('src/v23.mp4',4.2,3.9); place(suite,4.2,-4.0,fi=0.4,fo=0.5)            # S2-S3: suite ambience from the banner walk-in; the hush is left quiet
roar=aread('src/v24.mp4',13.2,3.4);  place(roar,7.8,0.0,fi=0.05,fo=0.25)           # S4-S5: V24's own roar leads the picture cut by 0.1 s, tail decays under the hold
mix=mix[:int(DUR*SR)]; pk=np.abs(mix).max(); mix=np.clip(mix/max(pk,1e-6)*0.9,-1,1)
open('out/pre.f32','wb').write(mix.astype(np.float32).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','out/pre.f32','out/pre.wav'],check=True)
def measure(p):
    m=subprocess.run(['ffmpeg','-i',p,'-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rfind('{'):m.rfind('}')+1]); return float(j['input_i']),float(j['input_tp'])
# The piece has a wide loudness range by design (walla, hush, roar), so loudnorm's linear mode would fall back to its
# dynamic mode and flatten it. Instead: one static gain to -14 LUFS, a true-peak limiter at -1 dBTP, iterate twice.
gain=0.0
for _ in range(3):
    I,TP=measure('out/pre.wav' if gain==0 else 'out/mix.wav'); gain+=(-14.0-I)
    subprocess.run(['ffmpeg','-v','error','-y','-i','out/pre.wav','-af','volume=%.2fdB,aresample=192000,alimiter=limit=0.891:attack=1:release=60:level=false,aresample=%d'%(gain,SR),'out/mix.wav'],check=True)
I,TP=measure('out/mix.wav'); print('mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)'%(I,TP,gain))
subprocess.run(['ffmpeg','-v','error','-y','-i','out/%s_silent.mp4'%NAME,'-i','out/mix.wav','-c:v','copy','-c:a','aac','-b:a','192k','-ar',str(SR),'-shortest','-movflags','+faststart','out/%s.mp4'%NAME],check=True)
print('master: out/%s.mp4'%NAME)
