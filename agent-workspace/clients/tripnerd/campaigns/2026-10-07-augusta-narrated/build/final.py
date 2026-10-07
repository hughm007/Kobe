#!/usr/bin/env python3
# TripNerd_Augusta_Narrated edit (owner notes 2026-10-07):
#  - "Bring your people." and "Enjoy the moment." re-voiced from the supplied fictional-voice clip (the clip's own recording)
#  - the roar shot: new line + caption (variant main: "And hear the roar." voiced in that voice by a local zero-shot model;
#    variant safe: the clip's own recorded "And feel the roar."), an Augusta-style gallery roar (cheering + applause)
#  - the closing line over the card, no caption (main: "All done with TripNerd!" voiced locally; safe: the clip's own
#    "All handled by TripNerd.")
#  - the roar shot rebuilt from its source with the camera push locked at the opening framing (roar_base.mp4)
# The old narrator's words from 15.3 s on are removed by switching to the separated accompaniment stem.
# Usage: python3 final.py main|safe
import subprocess, numpy as np, cv2, sys, wave, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy.signal import butter, sosfilt, fftconvolve
VAR=sys.argv[1]
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
U='/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/'
AD=U+'bdd077d2-TripNerd_Augusta_Narrated.mp4'; VOICE=U+'322c0697-One-static-shot-of-a-fictional-adult-mal.mp4'
D='/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/'; A=D+'asr/'; G=D+'aug/'
W,H,FPS,SR=1080,1920,30,48000
N0,N1=545,683; PREV=544; CARD=690; DIN=10; DOUT=(673,683)
CAP={'main':'And hear the roar.','safe':'And feel the roar.'}[VAR]
OUT=G+'TripNerd_Augusta_Narrated_%s.mp4'%('edit' if VAR=='main' else 'edit_alt')
# ---------------- picture ----------------
def ad_frames():
    p=subprocess.Popen([FF,'-v','error','-i',AD,'-pix_fmt','rgb24','-f','rawvideo','-'],stdout=subprocess.PIPE,bufsize=10**8)
    while True:
        b=p.stdout.read(W*H*3)
        if len(b)<W*H*3: break
        yield np.frombuffer(b,np.uint8).reshape(H,W,3)
roar=np.frombuffer(subprocess.run([FF,'-v','error','-i',G+'roar_base.mp4','-pix_fmt','rgb24','-f','rawvideo','-'],capture_output=True).stdout,np.uint8).reshape(-1,H,W,3)
assert len(roar)==N1-N0, len(roar)
# caption in the edit's own style: DejaVu Sans Bold 64 px, white, centred on x 536, top of the ink at y 334, soft drop shadow
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',64)
L=Image.new('RGBA',(W,H),(0,0,0,0)); bb=font.getbbox(CAP); x=int(round(536.5-(bb[2]-bb[0])/2-bb[0])); y=334-bb[1]
Sh=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(Sh).text((x+3,y+4),CAP,font=font,fill=(0,0,0,150)); Sh=Sh.filter(ImageFilter.GaussianBlur(5))
L.alpha_composite(Sh); ImageDraw.Draw(L).text((x,y),CAP,font=font,fill=(255,255,255,255))
Lc=np.asarray(L).astype(np.float32); la=Lc[...,3:4]/255.0; lrgb=Lc[...,:3]
enc=subprocess.Popen([FF,'-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r',str(FPS),'-i','-','-c:v','libx264','-preset','slow','-crf','15','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',G+'video_%s.mp4'%VAR],stdin=subprocess.PIPE)
raw=subprocess.run([FF,'-v','error','-i',AD,'-pix_fmt','rgb24','-f','rawvideo','-'],capture_output=True).stdout
ALL=np.frombuffer(raw,np.uint8).reshape(-1,H,W,3); print('original frames',len(ALL))
prev=ALL[PREV].astype(np.float32); card=ALL[CARD].astype(np.float32)
for n in range(len(ALL)):
    if N0<=n<N1:
        r=roar[n-N0].astype(np.float32); r=r*(1-la)+lrgb*la          # shot + caption
        a=min(1.0,(n-PREV)/DIN)                                          # dissolve in from the previous shot (its last clean frame)
        f=prev*(1-a)+r*a
        if n>=DOUT[0]:
            b=(n-DOUT[0]+1)/(DOUT[1]-DOUT[0]); f=f*(1-b)+card*b          # dissolve out to the card
        enc.stdin.write(f.clip(0,255).astype(np.uint8).tobytes())
    else: enc.stdin.write(ALL[n].tobytes())
enc.stdin.close(); enc.wait(); del ALL
# ---------------- sound ----------------
def load(path,ss=None,t=None,sr=SR,af=None):
    cmd=[FF,'-v','error']+(['-ss',str(ss)] if ss is not None else [])+(['-t',str(t)] if t is not None else [])+['-i',path,'-vn','-ac','2','-ar',str(sr)]+(['-af',af] if af else [])+['-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,np.float32).reshape(-1,2).copy()
orig=load(AD); NT=len(orig)
acc=load(A+'ad_stem1.wav'); voc_old=load(A+'ad_stem0.wav')
acc=np.pad(acc,((0,max(0,NT-len(acc))),(0,0)))[:NT]; voc_old=np.pad(voc_old,((0,max(0,NT-len(voc_old))),(0,0)))[:NT]
mix=orig.copy()
c0,c1=int(15.20*SR),int(15.40*SR); ramp=np.linspace(0,1,c1-c0)[:,None]
mix[c0:c1]=orig[c0:c1]*(1-ramp)+acc[c0:c1]*ramp; mix[c1:]=acc[c1:]        # the old narrator's words are gone from 15.3 s
def rms(x): return float(np.sqrt((x**2).mean()+1e-12))
def place(sig,at,gain=1.0,fi=0.012,fo=0.03):
    s=sig.copy(); k=int(fi*SR); s[:k]*=np.linspace(0,1,k)[:,None]; k=int(fo*SR); s[-k:]*=np.linspace(1,0,k)[:,None]
    i=int(at*SR); e=min(NT,i+len(s)); mix[i:e]+=s[:e-i]*gain; return i,e
def onset(sig,thr_db=-35):
    e=np.array([rms(sig[i:i+480]) for i in range(0,len(sig)-480,240)]); db=20*np.log10(e+1e-9); j=int(np.argmax(db>db.max()+thr_db+20)); return j*240/SR
lines=[]   # (name, signal, old-line window for level match, target onset)
vclip=lambda a,b: load(VOICE,a,b-a,af='highpass=f=80')
lines.append(('Bring your people.',vclip(7.60,8.50),(15.90,16.65),15.90))
lines.append(('Enjoy the moment.',vclip(9.15,10.25),(17.62,18.39),17.62))
if VAR=='main':
    lines.append(('And hear the roar.',load(A+'tts_hear.wav',af='highpass=f=80'),(19.45,20.33),19.45))
    lines.append(('All done with TripNerd!',load(A+'tts_done.wav',af='highpass=f=80'),(23.22,25.10),23.15))
else:
    lines.append(('And feel the roar.',vclip(11.40,12.95),(19.45,20.33),19.45))
    lines.append(('All handled by TripNerd.',vclip(13.90,15.75),(23.22,25.10),23.15))
vo_spans=[]
for name,sig,(a,b),at in lines:
    old=voc_old[int(a*SR):int(b*SR)]; g=rms(old)/max(rms(sig[int(0.05*SR):]),1e-6)*1.0
    o=onset(sig); i,e=place(sig,at-o,g); vo_spans.append((i/SR,e/SR)); print('%-26s at %.2f-%.2f s, gain %.2f'%(name,i/SR,e/SR,g))
# ---- the roar: the gallery's own cheers from the two golf clips + synthesised applause, reverbed into one space ----
rng=np.random.default_rng(7)
def applause(dur,rate_env):
    n=int(dur*SR); y=np.zeros((n,2),np.float32); t=0.0
    while t<dur:
        r=max(1.0,rate_env(t)); t+=rng.exponential(1.0/r)
        if t>=dur: break
        L_=int(rng.uniform(0.006,0.014)*SR); burst=rng.standard_normal(L_)*np.exp(-np.arange(L_)/(rng.uniform(0.002,0.004)*SR))
        f0=rng.uniform(900,3200); sos=butter(2,[f0*0.6,min(f0*1.6,9000)],btype='band',fs=SR,output='sos'); burst=sosfilt(sos,burst)
        pan=rng.uniform(0.15,0.85); gn=rng.uniform(0.3,1.0); i=int(t*SR); e=min(n,i+L_)
        y[i:e,0]+=burst[:e-i]*gn*(1-pan); y[i:e,1]+=burst[:e-i]*gn*pan
    return y
RS,RE=19.10,25.73
ap=applause(RE-RS,lambda t: 8+90*min(1,max(0,(t-0.9)/1.2)))
ir=(rng.standard_normal(int(0.45*SR))*np.exp(-np.arange(int(0.45*SR))/(0.09*SR))).astype(np.float32); ir/=np.abs(ir).sum()**0.5*8
ap=np.stack([fftconvolve(ap[:,c],ir)[:len(ap)]*0.7+ap[:,c]*0.6 for c in (0,1)],1)
crowd=np.zeros((int((RE-RS)*SR),2),np.float32)
def put(sig,at,g):
    i=int(at*SR); e=min(len(crowd),i+len(sig)); crowd[i:e]+=sig[:e-i]*g
ch1=load(U+'49f52dc1-hf_20261006_223701_adac6b4d-bc48-41d3-b00b-b8bc0a89a4c7.mp4',1.40,3.60,af='highpass=f=150')
ch2=load(U+'c5bc1d64-hf_20261006_231505_0c1646c7-5620-4d58-8a19-b2e36a778d70.mp4',1.20,3.30,af='highpass=f=150')
for s in (ch1,ch2):
    k=int(0.25*SR); s[:k]*=np.linspace(0,1,k)[:,None]; s[-k:]*=np.linspace(1,0,k)[:,None]
put(ch1/rms(ch1),0.0,1.0); put(ch2/rms(ch2),1.00,0.9); put(ch1/rms(ch1),2.80,0.8); put(ch2/rms(ch2),3.70,0.6)
crowd=crowd/rms(crowd[int(1.0*SR):int(3.0*SR)])+ap/rms(ap[int(1.5*SR):int(3.0*SR)])*0.8
# envelope: rises as the ball lands, sits under the line, opens up after it, carries under the card and fades out
t=np.arange(len(crowd))/SR+RS
env=np.interp(t,[RS,19.6,20.45,20.75,22.6,23.0,25.2,25.7],[0.0,0.35,0.40,1.0,1.0,0.55,0.35,0.0])
for a,b in vo_spans:   # duck the roar under every new line after 19 s so the words stay clear
    if b>RS: env*=1-0.45*np.clip(np.minimum((t-(a-0.15))/0.15,((b+0.15)-t)/0.15),0,1)
crowd*=env[:,None]
voice_ref=rms(voc_old[int(15.9*SR):int(16.65*SR)])
crowd=crowd*voice_ref*0.95
act=crowd[int(1.8*SR):int(3.4*SR)]; th=3.0*rms(act)                     # tame the clap transients: soft-limit the crowd bed on its own
crowd=th*np.tanh(crowd/th)
i=int(RS*SR); e=min(NT,i+len(crowd)); mix[i:e]+=crowd[:e-i]
# the music dips 3 dB while the roar is at full
mt=np.arange(NT)/SR; mdip=1-0.29*np.clip(np.interp(mt,[RS,20.5,22.6,23.4],[0,1,1,0]),0,1)
mix[c1:]=mix[c1:]-acc[c1:]*(1-mdip[c1:,None])
# pad to the picture's exact length (772 frames at 30 fps) so the mux never trims the video
need=int(np.ceil(772/30*SR))+SR//100
if len(mix)<need: mix=np.pad(mix,((0,need-len(mix)),(0,0)))
# loudness back to the original's integrated level
open(G+'pre_%s.f32'%VAR,'wb').write(mix.astype(np.float32).tobytes())
def lufs(args):
    m=subprocess.run([FF,'-hide_banner']+args+['-af','loudnorm=I=-16.8:TP=-1.5:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rfind('{'):m.rfind('}')+1]); return float(j['input_i']),float(j['input_tp'])
I0,_=lufs(['-i',AD]); I1,TP=lufs(['-f','f32le','-ar',str(SR),'-ac','2','-i',G+'pre_%s.f32'%VAR])
gain=I0-I1; print('original %.2f LUFS, new mix %.2f LUFS (TP %.2f) -> gain %.2f dB'%(I0,I1,TP,gain))
for it in range(3):   # the limiter shaves a little: re-measure the limited result and correct
    subprocess.run([FF,'-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i',G+'pre_%s.f32'%VAR,'-af','volume=%.2fdB,aresample=192000,alimiter=limit=0.87:attack=1:release=60:level=false,aresample=%d'%(gain,SR),G+'lim_%s.wav'%VAR],check=True)
    I2,TP2=lufs(['-i',G+'lim_%s.wav'%VAR]); print('  pass %d: %.2f LUFS, TP %.2f'%(it,I2,TP2)); gain+=I0-I2
    if abs(I0-I2)<0.1: break
subprocess.run([FF,'-v','error','-y','-i',G+'lim_%s.wav'%VAR,'-c:a','aac','-b:a','192k',G+'mix_%s.m4a'%VAR],check=True)
subprocess.run([FF,'-v','error','-y','-i',G+'video_%s.mp4'%VAR,'-i',G+'mix_%s.m4a'%VAR,'-map','0:v','-map','1:a','-c','copy','-t','%.4f'%(772/30),'-movflags','+faststart',OUT],check=True)
print('written',OUT)
