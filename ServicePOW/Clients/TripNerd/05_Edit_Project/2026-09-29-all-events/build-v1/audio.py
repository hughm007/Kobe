# TripNerd THEIR CAMERA ROLL - sound design + mix (runs in the Higgsfield sandbox)
# usage: python3 audio.py master|cut15   -> mix_<cut>.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP)
import numpy as np, subprocess, json, sys
SR=48000; CUT=sys.argv[1]; rng=np.random.default_rng(3)
def log(*a): print(*a,flush=True)
def aread(p,ss=None,dur=None):
    cmd=['ffmpeg','-v','error']+(['-ss','%.4f'%ss] if ss is not None else [])+['-i',p]+(['-t','%.4f'%dur] if dur else [])+['-vn','-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True,check=True).stdout,np.float32).reshape(-1,2).copy()
def align(orig,up,exp):
    o=aread(orig,exp-1.0,7.0)[:,0]; u=aread(up)[:,0]
    if np.abs(u).max()<1e-4: return exp,0.0
    N=1<<int(np.ceil(np.log2(len(o)+len(u))))
    c=np.fft.irfft(np.fft.rfft(o,N)*np.conj(np.fft.rfft(u,N)),N)[:len(o)-len(u)]
    k=int(np.argmax(c)); r=c[k]/(np.linalg.norm(o[k:k+len(u)])*np.linalg.norm(u)+1e-9)
    return exp-1.0+k/SR, float(r)
V23S,r23=align('src/v23.mp4','src/v23up.mp4',29.8); V24S,r24=align('src/v24.mp4','src/v24up.mp4',12.8)
log('align v23 %.3f (r=%.2f) v24 %.3f (r=%.2f)'%(V23S,r23,V24S,r24))
if r23<.5: V23S=29.8
if r24<.5: V24S=12.8
# ---------- synth ----------
def noise(n): return rng.standard_normal(n).astype(np.float32)
def filt(x,lo=None,hi=None,o=2):
    N=len(x); X=np.fft.rfft(x); f=np.fft.rfftfreq(N,1/SR)+1e-3; m=np.ones_like(f)
    if lo: m*=1/np.sqrt(1+(lo/f)**(2*o))
    if hi: m*=1/np.sqrt(1+(f/hi)**(2*o))
    return np.fft.irfft(X*m,N).astype(np.float32)
def pk(x,p=1.): m=np.abs(x).max(); return x*(p/m) if m>0 else x
def ex(n,tau): return np.exp(-np.arange(n)/(tau*SR)).astype(np.float32)
def sweep(dur,f0,f1,q=.55,curve=1.):
    n=int(dur*SR); x=noise(n+2048); hop=256; L=2048; win=np.hanning(L).astype(np.float32)
    out=np.zeros(n+L,np.float32); nm=np.zeros(n+L,np.float32); f=np.fft.rfftfreq(L,1/SR)+1e-3
    for i in range(0,n,hop):
        u=(i/max(n,1))**curve; fc=f0*(f1/f0)**u; m=np.exp(-.5*(np.log(f/fc)/q)**2)
        y=np.fft.irfft(np.fft.rfft(x[i:i+L]*win)*m,L).astype(np.float32)
        out[i:i+L]+=y*win; nm[i:i+L]+=win**2
    return pk(out[:n]/np.maximum(nm[:n],1e-3))
def kick():
    n=int(.42*SR); t=np.arange(n)/SR; f=46+120*np.exp(-t/.032); x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.26)
    c=int(.004*SR); x[:c]+=filt(noise(c),lo=1500)*.35*np.linspace(1,0,c); return pk(x.astype(np.float32),.95)
def clap():
    n=int(.22*SR); x=np.zeros(n,np.float32)
    for d,a in [(0,.8),(.011,.7),(.022,1.)]:
        i=int(d*SR); m=n-i; x[i:]+=noise(m)*ex(m,.012 if d<.02 else .07)*a
    return pk(filt(x,900,5200),.8)
def hat(op=False):
    n=int((.2 if op else .05)*SR); return pk(filt(noise(n),7000)*ex(n,.07 if op else .012),.6)
def tap():
    n=int(.06*SR); t=np.arange(n)/SR
    x=np.sin(2*np.pi*1700*t)*np.exp(-t/.006)+.7*np.sin(2*np.pi*820*t)*np.exp(-t/.014)
    x[:96]+=filt(noise(96),lo=3000)*.4; return pk(x.astype(np.float32),.7)
def shutter():
    n=int(.16*SR); x=np.zeros(n,np.float32)
    a=int(.004*SR); x[:a]+=filt(noise(a),lo=2500)*np.linspace(1,0,a)
    i=int(.052*SR); b=int(.03*SR); t=np.arange(b)/SR
    x[i:i+b]+=filt(noise(b),1200,7000)*ex(b,.006)*1.2+(np.sin(2*np.pi*3100*t)*np.exp(-t/.012)*.35).astype(np.float32)
    return pk(x,.8)
def pop(f0=880):
    n=int(.09*SR); t=np.arange(n)/SR; f=f0*(1-.22*t/.09)
    return pk((np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.025)).astype(np.float32),.5)
def pluck(freqs,dur=1.6,bright=1.):
    n=int(dur*SR); t=np.arange(n)/SR; x=np.zeros(n,np.float32)
    for f in freqs:
        for h in range(1,6): x+=(np.sin(2*np.pi*f*h*t)*np.exp(-t*(2.2+1.6*h/bright))/h**1.3).astype(np.float32)
    a=int(.004*SR); x[:a]*=np.linspace(0,1,a); return pk(x,.8)
def shimmer():
    out=np.zeros(int(.7*SR),np.float32)
    for k,f in enumerate([880,1108.73,1318.51,1760]):
        p=pluck([f],.5,2.)*.5; i=int(k*.055*SR); out[i:i+len(p)]+=p[:len(out)-i]
    return pk(out,.6)
def impact():
    n=int(1.2*SR); t=np.arange(n)/SR; f=72*np.exp(-t/.35)+28
    x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.5)
    m=int(.4*SR); x[:m]+=filt(noise(m),hi=2500)*ex(m,.07)*.5
    return pk(x.astype(np.float32),.95)
def crash():
    n=int(1.4*SR); return pk(filt(noise(n),3500)*ex(n,.45),.5)
def whoosh(dur,f0,f1,pan0=.6,pan1=-.6):
    x=sweep(dur,f0,f1); u=np.linspace(0,1,len(x)); e=np.sin(np.pi*np.clip(u,0,1))**1.6
    y=x*e; p=pan0+(pan1-pan0)*u; th=(p+1)*np.pi/4
    return np.stack([y*np.cos(th),y*np.sin(th)],1).astype(np.float32)
def riser(dur):
    x=sweep(dur,300,6000,.5,1.3); u=np.linspace(0,1,len(x)); t=np.arange(len(x))/SR
    tone=np.sin(2*np.pi*np.cumsum(220*4**u)/SR)*.25
    return pk(((x*.8+tone)*u**2.2).astype(np.float32),.9)
# ---------- bus ----------
EV={'master':dict(T=25.0,gA=(0,9.3),gB=(15.0,20.5,15.0),bed=(1.3,9.3),tap=[1.15,24.05],exp=(1.25,.4),swipes=[3.5,5.0,7.0,9.0],
      shim=9.6,ris=(9.35,12.95),v23=(9.3,13.05,9.6),roar=(12.7,16.3,13.0),flicks=[15.0,15.5,16.0,16.5,17.0],col=17.5,shut2=17.95,
      pops=[18.15+.3*i for i in range(7)],pay=(20.62,21.25),card=22.5),
    'cut15':dict(T=15.0,gA=(0,6.3),gB=(9.8,11.8,9.8),bed=(1.1,6.3),tap=[.97,14.55],exp=(1.05,.35),swipes=[3.0,4.5,6.0],
      shim=6.45,ris=(6.5,8.25),v23=(6.3,8.35,6.45),roar=(8.0,10.8,8.3),flicks=[9.8,10.3,10.8],col=11.3,shut2=11.7,
      pops=[],pay=(11.8,12.25),card=13.0)}[CUT]
T=EV['T']; N=int(round(T*SR)); bus=np.zeros((N,2),np.float32)
def place(x,t,g=1.,pan=0.):
    if x.ndim==1:
        th=(pan+1)*np.pi/4; x=np.stack([x*np.cos(th),x*np.sin(th)],1)
    i=int(round(t*SR))
    if i>=N: return
    j=min(N,i+len(x)); bus[max(i,0):j]+=x[max(0,-i):j-i]*g
def env(pts,n0,n1):
    t=np.arange(n0,n1)/SR; return (10**(np.interp(t,[a for a,b in pts],[b for a,b in pts])/20)).astype(np.float32)[:,None]
def groove(t0,t1,org,style,lvl=1.):
    K,C=kick(),clap(); s16=.125; k=int(np.ceil((t0-org)/s16-1e-6)); t=org+k*s16
    while t<t1-1e-6:
        pos=int(round((t-org)/s16))%16
        if pos%4==0: place(K,t,.9*lvl)
        if pos in (4,12): place(C,t,.42*lvl,.05)
        if style=='A':
            if pos%2==0: place(hat(),t,(.07 if pos%4==0 else .13)*lvl,.25)
        else:
            place(hat(),t,(.1 if pos%2 else .15)*lvl,.25)
            if pos in (6,14): place(hat(True),t,.09*lvl,-.25)
        t+=s16
def subline(t0,t1,org,notes=(55.,43.65,65.41,49.),lvl=.28):
    n0,n1=int(t0*SR),min(N,int(t1*SR)); tt=np.arange(n0,n1)/SR
    f=np.array(notes)[(((tt-org)//2.0).astype(int))%4]; ph=2*np.pi*np.cumsum(f)/SR
    x=np.sin(ph)+.22*np.sin(2*ph); g=1-.75*np.exp(-((tt-org)%.5)/.09)
    e=np.clip(np.minimum((tt-t0)/.03,(t1-tt)/.12),0,1)
    bus[n0:n1]+=(x*g*e*lvl).astype(np.float32)[:,None]
# music
groove(EV['gA'][0],EV['gA'][1],0,'A'); subline(EV['gA'][0],EV['gA'][1]+.1,0)
b0,b1,bo=EV['gB']; groove(b0,b1,bo,'B'); subline(b0,b1,bo)
place(riser(EV['ris'][1]-EV['ris'][0]),EV['ris'][0],.5)
# real audio: V24 murmur bed, V23 suite ambience, V24 roar
a0,a1=EV['bed']; m=aread('src/v24.mp4',19.0,a1-a0+.2)[:int((a1-a0)*SR)]
n0=int(a0*SR); bus[n0:n0+len(m)]+=m*env([(a0,-60),(a0+.4,-17),(a1-.4,-17),(a1,-60)],n0,n0+len(m))
s0,s1,play=EV['v23']; src=V23S+(s0-play); a=aread('src/v23.mp4',src,s1-s0)
n0=int(s0*SR); bus[n0:n0+len(a)]+=a*env([(s0,-30),(play+.5,4),(s1-.35,4),(s1,-60)],n0,n0+len(a))
r0,r1,rc=EV['roar']; src=V24S+.8+(r0-rc); a=aread('src/v24.mp4',src,r1-r0)
n0=int(r0*SR); bus[n0:n0+len(a)]+=a*env([(r0,-24),(rc-.02,-10),(rc,1.5),(rc+2.0 if CUT=='master' else rc+1.5,1.5),(r1,-60)],n0,n0+len(a))
place(impact(),rc,.8); place(crash(),rc,.25)
# UI + camera sound design
place(shutter(),0.0,.55); place(whoosh(.28,700,2600,.2,.2)[:,0],0.0,.18)
for t in EV['tap']: place(tap(),t,.5)
e0,ed=EV['exp']; place(whoosh(ed,400,2400,0,0),e0,.3)
for t in EV['swipes']: place(whoosh(.32,600,2800),t-.02,.34)
place(shimmer(),EV['shim'],.3)
for t in EV['flicks']: place(whoosh(.22,800,3200),t-.01,.3)
place(whoosh(.45,2600,500,-.3,.3),EV['col'],.3); place(shutter(),EV['shut2'],.5)
for t in EV['pops']: place(pop(),t,.35)
p1,p2=EV['pay']; place(kick(),p1,.9); place(impact(),p1,.35); place(crash(),p1,.3)
subline(p1,EV['card']+.2,p1,notes=(55.,55.,55.,55.),lvl=.2)
place(pluck([440,554.37,659.25],1.2),p2,.22)
c=EV['card']; place(whoosh(.45,300,1800,0,0),c,.3); place(kick(),c+.25,.8)
place(pluck([220,277.18,329.63,440,554.37],2.4),c+.25,.42); place(pluck([880,1108.73,1318.51],2.0,2.),c+.3,.14)
# ---------- master: limiter + loudness to -14 LUFS, <= -1 dBTP ----------
bus[-int(.03*SR):]*=np.linspace(1,0,int(.03*SR))[:,None]
bus.astype(np.float32).tofile('mix_%s.f32'%CUT)
def meas(p):
    r=subprocess.run(['ffmpeg','-v','info','-i',p,'-af','loudnorm=I=-14:TP=-1:LRA=20:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    m=json.loads(r[r.rfind('{'):r.rfind('}')+1]); return float(m['input_i']),float(m['input_tp']),float(m['input_lra'])
out='mix_%s.wav'%CUT; g=0.; lim=.85
for it in range(8):
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','mix_%s.f32'%CUT,'-af',
        'volume=%.2fdB,aresample=192000,alimiter=limit=%.3f:attack=1:release=60:level=false,aresample=48000'%(g,lim),'-c:a','pcm_s24le',out],check=True)
    I,TP,LRA=meas(out); log('iter',it,'gain',round(g,2),'I',I,'TP',TP,'LRA',LRA)
    if TP>-1.0: lim*=10**((-1.15-TP)/20)
    if abs(I+14)<=.15 and TP<=-1.0: break
    g+=-14-I
log('MIX',CUT,'I',I,'TP',TP,'LRA',LRA)
