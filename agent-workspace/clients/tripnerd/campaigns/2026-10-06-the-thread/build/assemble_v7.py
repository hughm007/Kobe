#!/usr/bin/env python3
# TripNerd "The thread" v7. The thread (8.0 s, app-accurate) crossfades into the landing: the 9:16 window on the flag, a punch-in
# on the cup, the last of the roll at half speed, the ball at rest. Hard cut on the crowd to the drone: down from above and in toward
# the three guests, arriving behind them as they applaud (headline in the sky band). Then the man turns, lifts his cup and says one
# line. Hard cut to the TripNerd card (real logo file). No on-screen disclosure label: the platform AI toggle carries disclosure.
# Usage: python3 assemble_v7.py <landing_clean.mp4> <aerial.mp4> <turn.mp4> params_v7.json
import subprocess, json, numpy as np, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS,SR=1080,1920,24,48000
A,AER,TURN=sys.argv[1],sys.argv[2],sys.argv[3]; P=json.load(open(sys.argv[4])); NAME=P['NAME']; BGHEX='0xffffff'
T_THREAD=P['T_THREAD']; XF=P['XF']; tA=T_THREAD-XF
A_IN,A_SLOW,A_OUT,A_END=P['A_IN'],P['A_SLOW'],P['A_OUT'],P['A_END']
A_PIECE=(A_SLOW-A_IN)+2*(A_OUT-A_SLOW)+(A_END-A_OUT)
tAER=tA+A_PIECE; AER_LEN=P['AER_OUT']-P['AER_IN']; tTURN=tAER+AER_LEN; TURN_LEN=P['TURN_OUT']-P['TURN_IN']; tE=tTURN+TURN_LEN; E_LEN=P['E_LEN']
def mt(c):            # landing-clip time -> master time
    if c<=A_SLOW: return tA+(c-A_IN)
    if c<=A_OUT: return tA+(A_SLOW-A_IN)+2*(c-A_SLOW)
    return tA+(A_SLOW-A_IN)+2*(A_OUT-A_SLOW)+(c-A_OUT)
def probe(p):
    o=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',p],capture_output=True,text=True).stdout.strip().split(','); return int(o[0]),int(o[1])
aw,ah=probe(A); cwA=int(ah*9/16)//2*2
FB=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',58); FHh=ImageFont.truetype('fonts/Montserrat-Medium.ttf',40)
FX=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',96); FS=ImageFont.truetype('fonts/Montserrat-SemiBold.ttf',54)
LOGO=Image.open('src/logo.png').convert('RGBA'); LOGO=LOGO.resize((700,int(700*LOGO.height/LOGO.width)),Image.LANCZOS)
def shadow_text(L,xy,t,font,fill=(255,255,255,255),blur=14,alpha=170):
    S=Image.new('RGBA',L.size,(0,0,0,0)); d=ImageDraw.Draw(S); d.text((xy[0]+4,xy[1]+6),t,font=font,fill=(0,0,0,alpha)); S=S.filter(ImageFilter.GaussianBlur(blur)); L.alpha_composite(S); ImageDraw.Draw(L).text(xy,t,font=font,fill=fill)
def headline():
    L=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(L); y=P['HEAD_TOP']
    S=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(S).rounded_rectangle((70,y-80,W-70,y+112*len(P['HEAD'])+130),radius=70,fill=(0,0,0,int(255*P.get('SCRIM',0.30)))); S=S.filter(ImageFilter.GaussianBlur(48)); L.alpha_composite(S)
    for line in P['HEAD']:
        bb=d.textbbox((0,0),line,font=FX); shadow_text(L,((W-(bb[2]-bb[0]))//2-bb[0],y),line,FX); y+=112
    bb=d.textbbox((0,0),P['SUB'],font=FS); shadow_text(L,((W-(bb[2]-bb[0]))//2-bb[0],y+18),P['SUB'],FS,fill=(255,255,255,235),blur=10,alpha=150); return L
headline().save('out/headline_v7.png')
def endcard():
    E=Image.new('RGBA',(W,H),(0x58,0x96,0xE9,255)); d=ImageDraw.Draw(E)
    g=np.linspace(0,1,H,dtype=np.float32)[:,None,None]*np.array([0x58,0x96,0xE9],np.float32)*0.07; arr=np.asarray(E).astype(np.float32); arr[...,:3]-=g; E=Image.fromarray(arr.clip(0,255).astype(np.uint8))
    top=620; E.alpha_composite(LOGO,((W-LOGO.width)//2,top)); y=top+LOGO.height+44
    for t,f,a,step in (('Hospitality. Handled.',FB,255,92),('tripnerd.com',FHh,225,62),('@tripnerd',FHh,180,0)):
        bb=d.textbbox((0,0),t,font=f); ImageDraw.Draw(E).text(((W-(bb[2]-bb[0]))//2-bb[0],y),t,font=f,fill=(255,255,255,a)); y+=step
    return E.convert('RGB')
endcard().save('out/endcard_v7.png')
def run(args): subprocess.run(['ffmpeg','-v','error','-y']+args,check=True)
ENC=['-r',str(FPS),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709']
# segment 1: thread -> landing (window on the flag, punch-in on the cup, the last of the roll at half speed, the ball at rest)
N0=int(round((mt(P['PUNCH_T0'])-tA)*FPS)); N1=int(round((mt(A_OUT)-tA)*FPS)); CX,CY=P['CUP']
zp="zoompan=z='1+(%.3f-1)*pow(clip((on-%d)/%d,0,1),2)':x='(iw-iw/zoom)*%.3f':y='(ih-ih/zoom)*%.3f':d=1:s=1080x1920:fps=%d"%(P['PUNCH_Z'],N0,max(1,N1-N0),CX,CY,FPS)
fc=['[0:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,setsar=1[t]'%(T_THREAD,FPS),'[1:v]split=3[s1][s2][s3]',
    '[s1]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d[a1]'%(A_IN,A_SLOW,FPS),
    '[s2]trim=%.3f:%.3f,setpts=2*(PTS-STARTPTS),fps=%d[a2]'%(A_SLOW,A_OUT,FPS),
    '[s3]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d[a3]'%(A_OUT,A_END,FPS),
    "[a1][a2][a3]concat=n=3:v=1:a=0,crop=%d:%d:%d:0,%s,setsar=1[a]"%(cwA,ah,int(P['A_X0']*aw),zp),
    "[t][a]xfade=transition=fade:duration=%.2f:offset=%.3f[v]"%(XF,T_THREAD-XF)]
run(['-i',P['THREAD'],'-i',A,'-filter_complex',';'.join(fc),'-map','[v]','-t','%.4f'%tAER]+ENC+['out/seg1_v7.mp4'])
# segment 2: the drone, headline in the sky band
fc=["[0:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1080:1920:flags=lanczos,setsar=1[c]"%(P['AER_IN'],P['AER_OUT'],FPS),
    "[1:v]format=rgba,fade=in:st=%.2f:d=0.3:alpha=1,fade=out:st=%.2f:d=0.25:alpha=1,setpts=PTS-STARTPTS[hd]"%(P['HEAD_IN'],AER_LEN-0.30),
    "[c][hd]overlay=0:0:enable='gte(t,%.2f)'[v]"%(P['HEAD_IN'])]
run(['-i',AER,'-loop','1','-i','out/headline_v7.png','-filter_complex',';'.join(fc),'-map','[v]','-t','%.4f'%AER_LEN]+ENC+['out/seg2_v7.mp4'])
# segment 3: the turn and the line
run(['-i',TURN,'-vf','trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1080:1920:flags=lanczos,setsar=1'%(P['TURN_IN'],P['TURN_OUT'],FPS),'-t','%.4f'%TURN_LEN,'-an']+ENC+['out/seg3_v7.mp4'])
# segment 4: the card, then the loop seam to the thread's white
run(['-loop','1','-i','out/endcard_v7.png','-t','%.3f'%E_LEN,'-vf','fps=%d,fade=t=out:st=%.3f:d=0.40:color=%s,setsar=1'%(FPS,E_LEN-0.45,BGHEX)]+ENC+['out/seg4_v7.mp4'])
TOTAL=tE+E_LEN
run(['-i','out/seg1_v7.mp4','-i','out/seg2_v7.mp4','-i','out/seg3_v7.mp4','-i','out/seg4_v7.mp4','-filter_complex',"[0:v]fps=24,settb=AVTB[a];[1:v]fps=24,settb=AVTB[b];[2:v]fps=24,settb=AVTB[c];[3:v]fps=24,settb=AVTB[e];[a][b][c][e]concat=n=4:v=1:a=0[v]",'-map','[v]','-t','%.4f'%TOTAL]+ENC+['-movflags','+faststart','out/%s_silent.mp4'%NAME])
DUR=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','out/%s_silent.mp4'%NAME],capture_output=True,text=True).stdout.strip())
print('silent master: DUR %.3f | landing %.2f-%.2f (ball stops %.2f) | drone %.2f-%.2f | turn %.2f-%.2f | card %.2f-%.2f'%(DUR,tA,tAER,mt(P['BALL_STOP']),tAER,tTURN,tTURN,tE,tE,DUR))
# ---------- sound ----------
mix=np.zeros((int(DUR*SR)+SR,2),np.float32)
def place(sig,at,gain_db,fi=0.0,fo=0.0):
    g=10**(gain_db/20); n=len(sig); env=np.ones(n,np.float32)
    if fi: k=int(fi*SR); env[:k]=np.linspace(0,1,k)
    if fo: k=int(fo*SR); env[-k:]=np.linspace(1,0,k)
    s=int(at*SR); e=min(len(mix),s+n)
    if e>s: mix[s:e]+=sig[:e-s]*(g*env[:e-s])[:,None]
def tone(f1,f2,dur=0.22,amp=0.5):
    t=np.arange(int(dur*SR))/SR; env=np.minimum(t/0.004,1)*np.exp(-t/0.06)
    s=(np.sin(2*np.pi*f1*t)*0.6+np.sin(2*np.pi*f2*t)*0.4)*env*amp; return np.stack([s,s],1).astype(np.float32)
def noise_sweep(dur,amp,seed=7,c0=0.02,c1=0.35):
    rng=np.random.default_rng(seed); n=int(dur*SR); x=rng.standard_normal(n).astype(np.float32); y=np.zeros(n,np.float32); a=0.0
    for i in range(n):
        c=c0+(c1-c0)*(i/n); a=a+c*(x[i]-a); y[i]=a
    env=np.sin(np.pi*np.arange(n)/n)**2; y=y/np.abs(y).max()*env*amp; return np.stack([y,y],1)
def click(seed):
    rng=np.random.default_rng(seed); n=int(0.03*SR); t=np.arange(n)/SR
    y=rng.standard_normal(n)*np.exp(-t/0.004)*0.5+np.sin(2*np.pi*2400*t)*np.exp(-t/0.003)*0.3; return np.stack([y,y],1).astype(np.float32)
def thump(f0,f1,glide=0.12,decay=0.22,amp=0.9,extra=None):
    n=int((glide+decay*3)*SR); t=np.arange(n)/SR; f=f1+(f0-f1)*np.exp(-t/glide); ph=2*np.pi*np.cumsum(f)/SR; y=np.sin(ph)*np.exp(-t/decay)*amp
    if extra: y+=np.sin(2*np.pi*extra*t)*np.exp(-t/(decay*0.7))*amp*0.5
    y+=np.sin(2*np.pi*1600*t)*np.exp(-t/0.004)*0.25; return np.stack([y,y],1).astype(np.float32)
def aread(p,ss,dur,af=None):
    cmd=['ffmpeg','-v','error','-ss','%.4f'%ss,'-i',p,'-t','%.4f'%dur,'-vn']+(['-af',af] if af else [])+['-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True,check=True).stdout,np.float32).reshape(-1,2).copy()
rng=np.random.default_rng(3)
for e in json.load(open(P['ARRIVALS'])):
    if e['kind']=='in': f=rng.uniform(0.97,1.03); place(tone(1318*f,1760*f),e['t'],-12.0)
    elif e['kind']=='keys':
        t=e['t']; k=0
        while t<e['t1']: place(click(k),t,-22.0); t+=rng.uniform(0.035,0.06); k+=1
    elif e['kind']=='out':
        sw=noise_sweep(0.26,0.4); th=thump(70,70,glide=0.01,decay=0.05,amp=0.5); n=min(len(sw),len(th)); sw[:n]+=th[:n]; place(sw,e['t'],-8.0)
place(aread('src/gal1.mp4',2.0,A_PIECE+0.8,af='highpass=f=120,lowpass=f=6000'),tA-0.4,-16.0,fi=0.8,fo=0.3)          # real gallery murmur under the landing
place(aread(A,A_IN,A_SLOW-A_IN,af='highpass=f=80'),tA,-9.0,fi=0.3,fo=0.2)                                            # the landing clip's own sound
place(thump(120,70,glide=0.06,decay=0.11,amp=0.6),mt(P['BOUNCE']),P['THUMP_DB'])                                      # the bounce
tROAR=mt(P['BALL_STOP'])-0.35
place(aread('src/v24.mp4',12.6,tAER+0.25-(tROAR-0.7),af='highpass=f=80,lowpass=f=1500'),tROAR-0.7,P['ROAR1_DB'],fi=0.25,fo=0.25)   # the real crowd across the green, rising
place(aread('src/v24.mp4',13.55,tE-tAER+0.4,af='highpass=f=80,lowpass=f=5000'),tAER,P['ROAR2_DB'],fi=0.15,fo=0.4)              # opens up on the cut to the drone
place(aread('src/gal1.mp4',7.0,DUR-tAER+0.5,af='highpass=f=2500'),tAER-0.2,-16.0,fi=0.3,fo=1.0)                                  # outdoor air
place(noise_sweep(0.5,0.4,seed=11,c0=0.01,c1=0.3),tAER-0.12,P['WHOOSH_DB'])                                                       # the drone move's air
# the turn shot's own sound (his line and the near applause); the bed dips 6 dB under the line
l0=tTURN+P['LINE_IN']-P['TURN_IN']; l1=tTURN+P['LINE_OUT']-P['TURN_IN']
env=np.ones(len(mix),np.float32); dip=10**(-6/20)
a0,a1,b0,b1=[int(x*SR) for x in (l0-0.25,l0,l1,l1+0.35)]
env[a0:a1]=np.linspace(1,dip,a1-a0); env[a1:b0]=dip; env[b0:b1]=np.linspace(dip,1,b1-b0); mix*=env[:,None]
place(aread(TURN,P['TURN_IN'],TURN_LEN,af='highpass=f=90'),tTURN,P['TURN_DB'],fi=0.08,fo=0.15)
# the hard cut to the card: the crowd ducks 8 dB over 120 ms and low-passes (the door closes)
k0=int(tE*SR); k1=int((tE+0.12)*SR); duck=np.ones(len(mix),np.float32); duck[k0:k1]=np.linspace(1,10**(-8/20),k1-k0); duck[k1:]=10**(-8/20); mix*=duck[:,None]
open('out/tail7.f32','wb').write(mix[k0:].astype(np.float32).tobytes())
run(['-f','f32le','-ar',str(SR),'-ac','2','-i','out/tail7.f32','-af','lowpass=f=1400','-f','f32le','out/tail7lp.f32'])
mix[k0:]=np.frombuffer(open('out/tail7lp.f32','rb').read(),np.float32).reshape(-1,2)[:len(mix)-k0]
place(tone(880*1.04,1174*1.04,dur=0.3,amp=0.5),tE+0.08,-12.0)                                                    # the chat tone, a fifth down, as the card lands
mix=mix[:int(DUR*SR)]; n_end=int(0.1*SR); mix[-n_end:]*=np.linspace(1,0,n_end)[:,None]; pk=np.abs(mix).max(); mix=np.clip(mix/max(pk,1e-6)*0.9,-1,1)
open('out/pre7.f32','wb').write(mix.astype(np.float32).tobytes())
run(['-f','f32le','-ar',str(SR),'-ac','2','-i','out/pre7.f32','out/pre7.wav'])
def measure(p):
    m=subprocess.run(['ffmpeg','-i',p,'-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rfind('{'):m.rfind('}')+1]); return float(j['input_i']),float(j['input_tp'])
gain=0.0
for _ in range(3):
    I,TP=measure('out/pre7.wav' if gain==0 else 'out/mix7.wav'); gain+=(-14.0-I)
    run(['-i','out/pre7.wav','-af','volume=%.2fdB,aresample=192000,alimiter=limit=0.891:attack=1:release=60:level=false,aresample=%d'%(gain,SR),'out/mix7.wav'])
I,TP=measure('out/mix7.wav'); print('mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)'%(I,TP,gain))
run(['-i','out/%s_silent.mp4'%NAME,'-i','out/mix7.wav','-c:v','copy','-c:a','aac','-b:a','192k','-ar',str(SR),'-shortest','-movflags','+faststart','out/%s.mp4'%NAME])
print('master: out/%s.mp4'%NAME)
