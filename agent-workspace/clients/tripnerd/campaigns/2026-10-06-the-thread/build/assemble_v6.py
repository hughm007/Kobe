#!/usr/bin/env python3
# TripNerd "The thread" v4 - the thread; the landing cut at the ball's closest approach (punch-in, then a half-speed lip beat);
# a whip pan into the owner's gallery leaping out of their lawn chairs (Kling 3.0 from his own still, outpainted to 9:16);
# a composited headline; a hard cut to a TripNerd end card built from the real logo file. Sound: the thread's tones, the clips'
# own generated sound (disclosed), TripNerd's real gallery murmur, and the real V24 roar heard across the green first (low-passed),
# opening up on the whip and carrying under the card; -14 LUFS. AI disclosure label from the first generated frame to the card.
import subprocess, json, numpy as np, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS,SR=1080,1920,24,48000; NAME='TN-R02-the-thread-v6'; BGHEX='0xffffff'
A=sys.argv[1]; C=sys.argv[2]
P=dict(T_THREAD=8.0, XF=0.3, A_IN=0.70, A_SLOW=3.10, A_OUT=3.30, PUNCH_T0=2.75, PUNCH_Z=1.32, CUP=(0.50,0.655), A_X0=0.38,
       WHIP_FRAMES=7, C_IN=0.40, C_LEN=3.30, C_SETTLE=1.10, JUMP_AT=None, JUMP_Z=1.16, E_LEN=2.30, HEAD_IN=0.8, HEAD_TOP=330,
       HEAD=['GET FIRST','SIGHT OF IT.'], SUB='With TripNerd.', LABEL='Scenes dramatized', C_SOUND=True, C_GAIN=-8.0, BOUNCE=2.58, ROAR1_DB=-5.0, ROAR2_DB=-4.0, WHOOSH_DB=-9.0, THUMP_DB=-6.0, THREAD='out/thread_v3_silent.mp4', ARRIVALS='out/arrivals_v3.json')
if len(sys.argv)>3: P.update(json.load(open(sys.argv[3])))
T_THREAD=P['T_THREAD']; XF=P['XF']; A_IN=P['A_IN']; A_SLOW=P['A_SLOW']; A_OUT=P['A_OUT']; tA=T_THREAD-XF
A_PIECE=(A_SLOW-A_IN)+2*(A_OUT-A_SLOW)                 # the lip beat runs at half speed
tWHIP=tA+A_PIECE; WHIP=P['WHIP_FRAMES']/FPS; tC=tWHIP+WHIP; C_IN=P['C_IN']; C_LEN=P['C_LEN']; E_LEN=P['E_LEN']; tE=tC+C_LEN
tCLOSE=tA+(A_SLOW-A_IN)                                  # the ball's closest approach to the cup (the lip beat starts there)
def probe(p):
    o=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',p],capture_output=True,text=True).stdout.strip().split(','); return int(o[0]),int(o[1])
aw,ah=probe(A); cw,ch=probe(C); cwA=int(ah*9/16)//2*2
FB=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',58); FHh=ImageFont.truetype('fonts/Montserrat-Medium.ttf',40); FD=ImageFont.truetype('fonts/Montserrat-Medium.ttf',40)
FX=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',96); FS=ImageFont.truetype('fonts/Montserrat-SemiBold.ttf',54)
LOGO=Image.open('src/logo.png').convert('RGBA'); LOGO=LOGO.resize((700,int(700*LOGO.height/LOGO.width)),Image.LANCZOS)
def shadow_text(L,xy,t,font,fill=(255,255,255,255),blur=14,alpha=170):
    S=Image.new('RGBA',L.size,(0,0,0,0)); d=ImageDraw.Draw(S); d.text((xy[0]+4,xy[1]+6),t,font=font,fill=(0,0,0,alpha)); S=S.filter(ImageFilter.GaussianBlur(blur)); L.alpha_composite(S); ImageDraw.Draw(L).text(xy,t,font=font,fill=fill)
def headline():
    L=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(L); y=P['HEAD_TOP']
    S=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(S).rounded_rectangle((70,y-80,W-70,y+112*len(P['HEAD'])+130),radius=70,fill=(0,0,0,int(255*P.get('SCRIM',0.32)))); S=S.filter(ImageFilter.GaussianBlur(48)); L.alpha_composite(S)   # a soft scrim so the type reads over sky and arms
    for line in P['HEAD']:
        bb=d.textbbox((0,0),line,font=FX); shadow_text(L,((W-(bb[2]-bb[0]))//2-bb[0],y),line,FX); y+=112
    bb=d.textbbox((0,0),P['SUB'],font=FS); shadow_text(L,((W-(bb[2]-bb[0]))//2-bb[0],y+18),P['SUB'],FS,fill=(255,255,255,235),blur=10,alpha=150); return L
headline().save('out/headline_v4.png')
def endcard():
    E=Image.new('RGBA',(W,H),(0x58,0x96,0xE9,255)); d=ImageDraw.Draw(E)
    g=np.linspace(0,1,H,dtype=np.float32)[:,None,None]*np.array([0x58,0x96,0xE9],np.float32)*0.07; arr=np.asarray(E).astype(np.float32); arr[...,:3]-=g; E=Image.fromarray(arr.clip(0,255).astype(np.uint8))
    top=620; E.alpha_composite(LOGO,((W-LOGO.width)//2,top)); y=top+LOGO.height+44
    t='Hospitality. Handled.'; bb=d.textbbox((0,0),t,font=FB); ImageDraw.Draw(E).text(((W-(bb[2]-bb[0]))//2-bb[0],y),t,font=FB,fill=(255,255,255,255)); y+=92
    t='tripnerd.com'; bb=d.textbbox((0,0),t,font=FHh); ImageDraw.Draw(E).text(((W-(bb[2]-bb[0]))//2-bb[0],y),t,font=FHh,fill=(255,255,255,225)); y+=62
    t='@tripnerd'; bb=d.textbbox((0,0),t,font=FHh); ImageDraw.Draw(E).text(((W-(bb[2]-bb[0]))//2-bb[0],y),t,font=FHh,fill=(255,255,255,180)); return E.convert('RGB')
endcard().save('out/endcard_v4.png')
D=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(D); t=P['LABEL']; bb=d.textbbox((0,0),t,font=FD)
d.rounded_rectangle((60,1140,60+(bb[2]-bb[0])+44,1140+64),radius=16,fill=(0,0,0,150)); d.text((82-bb[0],1140+12),t,font=FD,fill=(255,255,255,235)); D.save('out/disclose.png')
def run(args): subprocess.run(['ffmpeg','-v','error','-y']+args,check=True)
ENC=['-r',str(FPS),'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709']
# ---------- segment 1: thread -> landing: window held on the flag, punch-in on the cup, the last 0.2 s of source at half speed ----------
N0=int((P['PUNCH_T0']-A_IN)*FPS); N1=int(round(A_PIECE*FPS)); CX,CY=P['CUP']
zp="zoompan=z='1+(%.3f-1)*pow(clip((on-%d)/%d,0,1),2)':x='(iw-iw/zoom)*%.3f':y='(ih-ih/zoom)*%.3f':d=1:s=1080x1920:fps=%d"%(P['PUNCH_Z'],N0,max(1,N1-N0),CX,CY,FPS)
fc=['[0:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,setsar=1[t]'%(T_THREAD,FPS),
    '[1:v]split=2[s1][s2]',
    '[s1]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d[a1]'%(A_IN,A_SLOW,FPS),
    '[s2]trim=%.3f:%.3f,setpts=2*(PTS-STARTPTS),fps=%d[a2]'%(A_SLOW,A_OUT,FPS),
    "[a1][a2]concat=n=2:v=1:a=0,crop=%d:%d:%d:0,%s,setsar=1[a]"%(cwA,ah,int(P['A_X0']*aw),zp),
    "[t][a]xfade=transition=fade:duration=%.2f:offset=%.3f[v]"%(XF,T_THREAD-XF)]
run(['-i',P['THREAD'],'-i',A,'-filter_complex',';'.join(fc),'-map','[v]','-t','%.4f'%tWHIP]+ENC+['out/seg1_v4.mp4'])
# ---------- segment 3: the gallery erupts (settle from a slight zoom after the whip; optional jump-cut punch-in) + headline ----------
NS=int(P['C_SETTLE']*FPS); SZ=1.10
settle="zoompan=z='1+(%.3f-1)*pow(1-clip(on/%d,0,1),2)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*0.45':d=1:s=1080x1920:fps=%d"%(SZ,max(1,NS),FPS)
if P['JUMP_AT']:
    J=P['JUMP_AT']; NJ=int(round((C_LEN-J)*FPS)); JZ=P['JUMP_Z']
    jump="zoompan=z='%.3f+0.06*clip(on/%d,0,1)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*0.55':d=1:s=1080x1920:fps=%d"%(JZ,max(1,NJ),FPS)
    fc=["[0:v]split=2[c1s][c2s]","[c1s]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1080:1920:flags=lanczos,%s[c1]"%(C_IN,C_IN+J,FPS,settle),
        "[c2s]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1080:1920:flags=lanczos,%s[c2]"%(C_IN+J,C_IN+C_LEN,FPS,jump),"[c1][c2]concat=n=2:v=1:a=0,setsar=1[c]"]
else:
    fc=["[0:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1080:1920:flags=lanczos,%s,setsar=1[c]"%(C_IN,C_IN+C_LEN,FPS,settle)]
fc+=["[1:v]format=rgba,fade=in:st=%.2f:d=0.3:alpha=1,setpts=PTS-STARTPTS[hd]"%(P['HEAD_IN']),"[c][hd]overlay=0:0:enable='gte(t,%.2f)'[v]"%(P['HEAD_IN'])]
run(['-i',C,'-loop','1','-i','out/headline_v4.png','-filter_complex',';'.join(fc),'-map','[v]','-t','%.4f'%C_LEN]+ENC+['out/seg3_v4.mp4'])
# ---------- segment 4: the end card, hard cut, then the loop seam (fade to the chat grey) ----------
run(['-loop','1','-i','out/endcard_v4.png','-t','%.3f'%E_LEN,'-vf','fps=%d,fade=t=out:st=%.3f:d=0.25:color=%s,setsar=1'%(FPS,E_LEN-0.25,BGHEX)]+ENC+['out/seg4_v4.mp4'])
# ---------- segment 2: the whip pan (camera turns left: content streaks right), frame-rendered slide + horizontal motion blur ----------
run(['-sseof','-0.05','-i','out/seg1_v4.mp4','-frames:v','1','-update','1','out/whip_a.png'])
run(['-i','out/seg3_v4.mp4','-frames:v','1','-update','1','out/whip_c.png'])
fa=np.asarray(Image.open('out/whip_a.png').convert('RGB')).astype(np.float32); fcx=np.asarray(Image.open('out/whip_c.png').convert('RGB')).astype(np.float32)
strip=np.concatenate([fcx,fa],axis=1)   # C on the left, A on the right: the window travels from A (right) to C (left)
def hblur(img,r):
    if r<1: return img
    r=int(r); pad=np.pad(img,((0,0),(r,r),(0,0)),mode='edge'); cs=np.cumsum(pad,axis=1); out=(cs[:,2*r:]-cs[:,:-2*r])/(2*r); return out[:, :img.shape[1]]
NW=P['WHIP_FRAMES']; frames=[]
for i in range(NW):
    p=(i+1)/(NW+1); e=p*p*(3-2*p)
    off=int((1-e)*W); win=strip[:,off:off+W]; r=np.sin(np.pi*p)*150; gain=1+0.12*np.sin(np.pi*p)   # a touch of exposure flare mid-whip
    frames.append((hblur(win,r)*gain).clip(0,255).astype(np.uint8))
pr=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r',str(FPS),'-i','-']+ENC+['out/seg2_v4.mp4'],stdin=subprocess.PIPE)
for f in frames: pr.stdin.write(f.tobytes())
pr.stdin.close(); pr.wait()
# ---------- concat + the disclosure label over both generated shots (through the whip) ----------
LBL_IN=tA; LBL_OUT=tE-0.1
TOTAL=tE+E_LEN   # the looped label PNG never ends on its own: cap the output at the sum of the segments
run(['-i','out/seg1_v4.mp4','-i','out/seg2_v4.mp4','-i','out/seg3_v4.mp4','-i','out/seg4_v4.mp4','-loop','1','-i','out/disclose.png','-filter_complex',"[0:v]fps=24,settb=AVTB[a];[1:v]fps=24,settb=AVTB[b];[2:v]fps=24,settb=AVTB[c];[3:v]fps=24,settb=AVTB[e];[a][b][c][e]concat=n=4:v=1:a=0[v0];[4:v]format=rgba,fade=in:st=%.2f:d=0.2:alpha=1,fade=out:st=%.2f:d=0.2:alpha=1,setpts=PTS-STARTPTS[dc];[v0][dc]overlay=0:0:shortest=1:enable='between(t,%.2f,%.2f)'[v]"%(LBL_IN,LBL_OUT-0.2,LBL_IN,LBL_OUT),'-map','[v]','-t','%.4f'%TOTAL]+ENC+['-movflags','+faststart','out/%s_silent.mp4'%NAME])
DUR=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','out/%s_silent.mp4'%NAME],capture_output=True,text=True).stdout.strip())
print('silent master written: DUR %.3f | A %.2f-%.2f (closest %.2f, lip beat from %.2f) | whip %.2f-%.2f | C %.2f-%.2f | card %.2f-%.2f'%(DUR,tA,tWHIP,tCLOSE,tCLOSE,tWHIP,tC,tC,tE,tE,DUR))
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
def noise_sweep(dur,amp,seed=7,c0=0.02,c1=0.35):
    rng=np.random.default_rng(seed); n=int(dur*SR); x=rng.standard_normal(n).astype(np.float32); y=np.zeros(n,np.float32); a=0.0
    for i in range(n):
        c=c0+(c1-c0)*(i/n); a=a+c*(x[i]-a); y[i]=a
    env=np.sin(np.pi*np.arange(n)/n)**2; y=y/np.abs(y).max()*env*amp; return np.stack([y,y],1)
def thump(f0,f1,glide=0.12,decay=0.22,amp=0.9,extra=None):
    n=int((glide+decay*3)*SR); t=np.arange(n)/SR; f=f1+(f0-f1)*np.exp(-t/glide); ph=2*np.pi*np.cumsum(f)/SR; y=np.sin(ph)*np.exp(-t/decay)*amp
    if extra: y+=np.sin(2*np.pi*extra*t)*np.exp(-t/(decay*0.7))*amp*0.5
    y+=np.sin(2*np.pi*1600*t)*np.exp(-t/0.004)*0.25; return np.stack([y,y],1).astype(np.float32)
rng=np.random.default_rng(3)
for e in json.load(open(P['ARRIVALS'])):
    if e['kind']=='sep': continue
    if e['text'].startswith('Booked'):
        sw=noise_sweep(0.28,0.4); th=thump(70,70,glide=0.01,decay=0.05,amp=0.5); n=min(len(sw),len(th)); sw[:n]+=th[:n]; place(sw,e['t'],-6.0); continue
    f=rng.uniform(0.96,1.04); place(tone(1318*f,1760*f),e['t'],-12.0)
def aread(p,ss,dur,af=None):
    cmd=['ffmpeg','-v','error','-ss','%.4f'%ss,'-i',p,'-t','%.4f'%dur,'-vn']+(['-af',af] if af else [])+['-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True,check=True).stdout,np.float32).reshape(-1,2).copy()
place(aread('src/gal1.mp4',2.0,A_PIECE+0.8,af='highpass=f=120,lowpass=f=6000'),tA-0.4,-16.0,fi=0.8,fo=0.3)                   # real gallery murmur, the bed under the landing
place(aread('src/gal1.mp4',7.0,DUR-tWHIP+0.5,af='highpass=f=2500'),tWHIP-0.3,-14.0,fi=0.3,fo=1.0)                            # real outdoor 'air' layer under the eruption and the card
place(aread(A,A_IN,A_SLOW-A_IN,af='highpass=f=80'),tA,-9.0,fi=0.3,fo=0.2)                                                    # the landing clip's own sound (generated, disclosed)
place(thump(120,70,glide=0.06,decay=0.11,amp=0.6),tA+(P['BOUNCE']-A_IN),-10.0)                                                       # the bounce (source 2.58 s)
tROAR=tCLOSE-0.12                                                                                                              # the roar leads the ball's closest approach by three frames
place(aread('src/v24.mp4',12.6,(tWHIP+0.25)-(tROAR-0.7),af='highpass=f=80,lowpass=f=1500'),tROAR-0.7,P['ROAR1_DB'],fi=0.25,fo=0.25)   # the real roar heard across the green: distant, low-passed, rising
place(aread('src/v24.mp4',13.55,DUR-tWHIP+0.1,af='highpass=f=80,lowpass=f=5000'),tWHIP,P['ROAR2_DB'],fi=0.2,fo=1.2)                   # the same roar opens up on the whip and carries to the end
place(noise_sweep(0.40,0.5,seed=11,c0=0.01,c1=0.5),tWHIP-0.05,P['WHOOSH_DB'])                                                            # whip whoosh
place(thump(55,38,glide=0.12,decay=0.22,amp=0.9,extra=110),tWHIP+0.02,P['THUMP_DB'])                                                   # whip thump (110 Hz component so phone speakers hear it)
has_c_audio=subprocess.run(['ffprobe','-v','error','-select_streams','a','-show_entries','stream=codec_type','-of','csv=p=0',C],capture_output=True,text=True).stdout.strip()!=''
if has_c_audio and P['C_SOUND']: place(aread(C,C_IN,C_LEN,af='highpass=f=120'),tC,P['C_GAIN'],fi=0.15,fo=0.3)                 # the gallery clip's own cheer (generated, disclosed), near-field texture
# the hard cut to the card: duck the roar 8 dB over 120 ms and low-pass it (the door closes), then let it settle
k0=int(tE*SR); k1=int((tE+0.12)*SR); duck=np.ones(len(mix),np.float32); duck[k0:k1]=np.linspace(1,10**(-8/20),k1-k0); duck[k1:]=10**(-8/20); mix*=duck[:,None]
tail=mix[k0:].copy(); open('out/tail4.f32','wb').write(tail.astype(np.float32).tobytes())
run(['-f','f32le','-ar',str(SR),'-ac','2','-i','out/tail4.f32','-af','lowpass=f=1400','-f','f32le','out/tail4lp.f32'])
mix[k0:]=np.frombuffer(open('out/tail4lp.f32','rb').read(),np.float32).reshape(-1,2)[:len(mix)-k0]
f=1.04; place(tone(880*f,1174*f,dur=0.3,amp=0.5),tE+0.08,-12.0)                                                               # the brand's reply: the chat tone, a fifth down, as the card lands
mix=mix[:int(DUR*SR)]; n_end=int(0.1*SR); mix[-n_end:]*=np.linspace(1,0,n_end)[:,None]; pk=np.abs(mix).max(); mix=np.clip(mix/max(pk,1e-6)*0.9,-1,1)
open('out/pre4.f32','wb').write(mix.astype(np.float32).tobytes())
run(['-f','f32le','-ar',str(SR),'-ac','2','-i','out/pre4.f32','out/pre4.wav'])
def measure(p):
    m=subprocess.run(['ffmpeg','-i',p,'-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rfind('{'):m.rfind('}')+1]); return float(j['input_i']),float(j['input_tp'])
gain=0.0
for _ in range(3):
    I,TP=measure('out/pre4.wav' if gain==0 else 'out/mix4.wav'); gain+=(-14.0-I)
    run(['-i','out/pre4.wav','-af','volume=%.2fdB,aresample=192000,alimiter=limit=0.891:attack=1:release=60:level=false,aresample=%d'%(gain,SR),'out/mix4.wav'])
I,TP=measure('out/mix4.wav'); print('mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)'%(I,TP,gain))
run(['-i','out/%s_silent.mp4'%NAME,'-i','out/mix4.wav','-c:v','copy','-c:a','aac','-b:a','192k','-ar',str(SR),'-shortest','-movflags','+faststart','out/%s.mp4'%NAME])
print('master: out/%s.mp4'%NAME)
