import cv2, numpy as np, subprocess, json, glob, itertools
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FPS=24; W,H=1920,1080; SR=48000; T=30.0; IW,IH=2112,1188; Q=IW/W
def log(*a): print(*a, flush=True)
# ---------- audio ----------
def aread(p, af=None):
    cmd=['ffmpeg','-v','error','-i',p,'-vn']+(['-af',af] if af else [])+['-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True,check=True).stdout,np.float32).reshape(-1,2).copy()
v24=aread('v24.mp4'); v24lp=aread('v24.mp4','lowpass=f=2200,lowpass=f=2200')
N=int(T*SR); bed=np.zeros((N,2),np.float32)
def env(pts,n0,n1):
    t=np.arange(n0,n1)/SR
    return (10**(np.interp(t,[a for a,b in pts],[b for a,b in pts])/20)).astype(np.float32)[:,None]
def place(src,s0,f0,f1,fin=0.2,fout=0.2,pts=None):
    n0=int(f0*SR); seg=src[int(s0*SR):int(s0*SR)+int(f1*SR)-n0].copy(); n1=n0+len(seg)
    g=np.ones((len(seg),1),np.float32); a=int(fin*SR); b=int(fout*SR)
    if a: g[:a,0]*=np.sin(np.linspace(0,np.pi/2,a))
    if b: g[-b:,0]*=np.cos(np.linspace(0,np.pi/2,b))
    if pts: g*=env(pts,n0,n1)
    bed[n0:n1]+=seg*g
place(v24,19.0,0.0,9.0,0.05,0.2)                      # murmur (V24 clean 19-28)
place(v24,0.0,8.8,12.6)                                # murmur (V24 clean 0-3.8)
place(v24lp,21.5,12.4,17.95,pts=[(12.4,-2),(12.75,-4),(17.75,-14),(17.95,-14)])  # drops, loses top end
OFF=7.65  # V24 roar break 13.35 s -> film 21.00 (cut to F7)
place(v24,17.80-OFF,17.80,30.0,0.2,0.05,pts=[(17.8,-12),(19.4,-12),(20.95,0),(24.8,0),(26.2,-26),(29.4,-26),(30,-60)])
def vo(p,maxgap,target,tdb):
    x=aread(p,'highpass=f=80')[:,0]; fr=int(0.01*SR); n=len(x)//fr
    db=20*np.log10(np.sqrt((x[:n*fr].reshape(n,fr)**2).mean(1))+1e-9); thr=max(db.max()-32,-55); act=db>thr
    regs=[]; i=0
    while i<n:
        if act[i]:
            j=i
            while j<n and act[j]: j+=1
            if regs and i-regs[-1][1]<12: regs[-1][1]=j
            else: regs.append([i,j])
            i=j
        else: i+=1
    regs=[r for r in regs if r[1]-r[0]>=5]
    out=[]; gaps=[]; pb=None
    for a,b in regs:
        a=max(0,a-4); b=min(n,b+4)
        if pb is not None:
            g=(a-pb)/100; ng=target if g>maxgap else max(g,0)
            gaps.append((round(g,2),round(ng,2))); out.append(np.zeros(int(ng*SR),np.float32))
        c=x[a*fr:b*fr].copy(); f=int(0.01*SR); c[:f]*=np.linspace(0,1,f); c[-f:]*=np.linspace(1,0,f); out.append(c); pb=b
    y=np.concatenate(out); fa=int(0.01*SR)
    yd=20*np.log10(np.sqrt((y[:len(y)//fa*fa].reshape(-1,fa)**2).mean(1))+1e-9)
    rms=np.sqrt((y[:len(y)//fa*fa].reshape(-1,fa)[yd>yd.max()-25]**2).mean())
    y*=10**(tdb/20)/rms
    return y,gaps
LINES=[('d97fcc8a.wav',0.40,0.3,0.5,-19,"The client you've been chasing… for a year."),
       ('47a503ac.wav',4.60,0.3,0.3,-19,"The two who hit the number."),
       ('b6eaf7c7.wav',8.60,0.3,0.4,-19,"Your brother-in-law… who has not shut up about this place."),
       ('bfb140cc.wav',13.10,0.3,0.3,-21,"Your dad."),
       ('3fadb631.wav',23.05,0.3,0.3,-17,"Bring your people."),
       ('4c7bce28.wav',26.40,1.5,0.3,-19,None)]
vob=np.zeros(N,np.float32); duck=[(0,0),(T,0)]; caps=[]; report=[]
for f,t0,mg,tg,tdb,cap in LINES:
    y,gaps=vo(f,mg,tg,tdb); n0=int(t0*SR); vob[n0:n0+len(y)]+=y[:N-n0]; t1=t0+len(y)/SR
    report.append((f,t0,round(t1,2),gaps)); d=-6 if f.startswith('3fad') else -3
    duck+= [(t0-0.15,0),(t0,d),(t1,d),(t1+0.2,0)]
    if cap: caps.append((t0,t1+0.3,cap))
log('VO',report)
duck=sorted(duck); dk=10**(np.interp(np.arange(N)/SR,[a for a,b in duck],[b for a,b in duck])/20)
mix=bed*dk[:,None].astype(np.float32)+vob[:,None]
mix.astype(np.float32).tofile('mix.f32')
r=subprocess.run(['ffmpeg','-v','info','-f','f32le','-ar',str(SR),'-ac','2','-i','mix.f32','-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
m=json.loads(r[r.rfind('{'):r.rfind('}')+1]); log('pass1',m)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','mix.f32','-af',
 'loudnorm=I=-14:TP=-1:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true'%(m['input_i'],m['input_tp'],m['input_lra'],m['input_thresh'],m['target_offset']),
 '-ar','48000','-c:a','pcm_s16le','mix.wav'],check=True)
# ---------- captions ----------
fp=None
for pat in ['Montserrat-SemiBold','Metropolis-SemiBold','Montserrat-Medium','Metropolis-Medium','Montserrat-Bold','Metropolis-Bold','Montserrat-ExtraBold']:
    g=glob.glob('/usr/share/fonts/**/%s.ttf'%pat,recursive=True)
    if g: fp=g[0]; break
log('font',fp)
font=ImageFont.truetype(fp,46)
def capimg(txt):
    lines=[txt]
    if ImageDraw.Draw(Image.new('L',(1,1))).textlength(txt,font=font)>1450 and '… ' in txt:
        a,b=txt.split('… ',1); lines=[a+'…',b]
    im=Image.new('RGBA',(W,H),(0,0,0,0)); sh=Image.new('L',(W,H),0)
    y=H-108-58*len(lines)
    for i,l in enumerate(lines):
        ImageDraw.Draw(sh).text((192,y+58*i+2),l,font=font,fill=255); ImageDraw.Draw(im).text((192,y+58*i),l,font=font,fill=(255,255,255,255))
    sh=np.array(sh.filter(ImageFilter.GaussianBlur(5))).astype(np.float32)/255*0.6
    t=np.array(im).astype(np.float32)/255; a=t[...,3]
    A=a+sh*(1-a); col=t[...,:3]*a[...,None]  # premultiplied white over black shadow
    ys,xs=np.where(A>0.002); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    return (y0,y1,x0,x1,col[y0:y1,x0:x1,::-1].copy(),A[y0:y1,x0:x1,None].copy())
caps=[(a,min(b,caps[i+1][0]-0.05) if i+1<len(caps) else b,c) for i,(a,b,c) in enumerate(caps)]; log('captions',[(round(a,2),round(b,2)) for a,b,c in caps])
CAP=[(a,b,capimg(c)) for a,b,c in caps]
# ---------- video ----------
def rd(p,start,count):
    c=cv2.VideoCapture(p); i=0
    while i<start+count:
        ok,f=c.read()
        if not ok: raise SystemExit('short read %s %d'%(p,i))
        if i>=start: yield f
        i+=1
def inter(f):
    h,w=f.shape[:2]; k=max(IW/w,IH/h)
    return cv2.resize(f,(round(w*k),round(h*k)),interpolation=cv2.INTER_AREA if k<1 else cv2.INTER_LANCZOS4)
def ease(u): u=min(max(u,0),1); return 0.5-0.5*np.cos(np.pi*u)
def warp(fi,s,ax=960,ay=540):
    hi,wi=fi.shape[:2]; sc=Q/s
    M=np.float32([[sc,0,wi/2+(ax-960)*Q-ax*sc],[0,sc,hi/2+(ay-540)*Q-ay*sc]])
    return cv2.warpAffine(fi,M,(W,H),flags=cv2.INTER_CUBIC|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_REFLECT)
G='https://d8j0ntlcm91z4.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/'
f4=inter(cv2.imread('f4.png')); card=inter(cv2.imread('card.png'))
def still(img,n,s1,blur=None):
    for i in range(n):
        u=ease(i/(n-1)); x=img
        if blur:
            sg=blur*(1-ease((i/FPS-0.15)/1.0))
            if sg>0.05: x=cv2.GaussianBlur(img,(0,0),sg)
        yield warp(x,1+(s1-1)*u)
def clip(gen,n,s1=1.0,ax=960,ay=540):
    for i,f in enumerate(gen): yield warp(inter(f),1+(s1-1)*ease(i/(n-1)),ax,ay)
SEGS=[('F1',clip(rd('f1.mp4',0,102),102)),('F2',clip(rd('f2.mp4',0,96),96)),('F3',clip(rd('f3.mp4',0,108),108)),
      ('F4',still(f4,54,1.03,blur=3.3)),('F5',clip(rd('f5.mp4',0,72),72,1.05)),
      ('F6',clip(itertools.chain(rd('b.mp4',48,18),rd('c2.mp4',1,54)),72)),
      ('F7',clip(rd('c.mp4',24,96),96,1.08,1280,360)),('F9',still(card,120,1.02))]
rng=np.random.default_rng(7); GR=[rng.normal(0,1.6,(H,W,1)).astype(np.float32) for _ in range(24)]
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s','%dx%d'%(W,H),'-r','24','-i','-','-i','mix.wav',
 '-vf','scale=out_color_matrix=bt709:out_range=tv,format=yuv420p','-c:v','libx264','-preset','medium','-crf','16',
 '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','320k','-movflags','+faststart','-shortest','final.mp4'],stdin=subprocess.PIPE)
fi=0; thumbs=[]
for name,gen in SEGS:
    k=0
    for fr in gen:
        t=fi/FPS; x=fr.astype(np.float32)+GR[(fi*7)%24]
        for a,b,(y0,y1,x0,x1,col,A) in CAP:
            if a<=t<b:
                o=min(1,(t-a)*8,(b-t)*8)
                x[y0:y1,x0:x1]=x[y0:y1,x0:x1]*(1-A*o)+col*255*o
        x=np.clip(x,0,255).astype(np.uint8); enc.stdin.write(x.tobytes())
        if fi%12==0 or 447<=fi<=452: thumbs.append((fi,cv2.resize(x,(240,135),interpolation=cv2.INTER_AREA)))
        fi+=1; k+=1
    log(name,k,'frames, total',fi)
enc.stdin.close(); enc.wait(); log('encoded',fi)
th=[cv2.putText(im.copy(),'%.2f'%(i/FPS),(4,16),0,0.45,(0,255,255),1) for i,im in thumbs]
while len(th)%11: th.append(np.zeros_like(th[0]))
cv2.imwrite('sheet.jpg',np.vstack([np.hstack(th[i:i+11]) for i in range(0,len(th),11)]),[cv2.IMWRITE_JPEG_QUALITY,85])
log('done')
