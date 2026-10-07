# TripNerd THEIR CAMERA ROLL - camera-roll motion renderer (runs in the Higgsfield sandbox)
# usage: python3 render.py master|cut15 [full|stills]
import cv2, numpy as np, math, sys, glob, random, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS=1080,1920,30
CUT=sys.argv[1]; MODE=sys.argv[2] if len(sys.argv)>2 else 'full'
def log(*a): print(*a,flush=True)
FD='fonts/extras/ttf/'
def IF(n,s): return ImageFont.truetype(FD+n+'.ttf',s)
def MF(n,s):
    g=glob.glob('fonts/Montserrat-%s.ttf'%n)
    return ImageFont.truetype(g[0],s) if g else IF('Inter-'+n,s)
def cl(x,a=0.,b=1.): return a if x<a else (b if x>b else x)
def eo3(u): u=cl(u); return 1-(1-u)**3
def eio3(u): u=cl(u); return 4*u**3 if u<.5 else 1-(-2*u+2)**3/2
def eob(u,s=1.4): u=cl(u); return 1+(s+1)*(u-1)**3+s*(u-1)**2
def flk(u): u=cl(u); return 1-(1-u)**4*(1+4*u)
def lerp(a,b,u): return a+(b-a)*u
def ramp(t,a,b): return cl((t-a)/(b-a)) if b>a else float(t>=a)
def lrect(a,b,u): return tuple(lerp(x,y,u) for x,y in zip(a,b))
# ---------- layers (premultiplied BGR float, alpha float) ----------
def L_text(txt,f,fill=(255,255,255),sh=.55,shr=6,pad=26):
    x0,y0,x1,y1=ImageDraw.Draw(Image.new('L',(1,1))).textbbox((0,0),txt,font=f)
    m=Image.new('L',(x1-x0+2*pad,y1-y0+2*pad),0); ImageDraw.Draw(m).text((pad-x0,pad-y0),txt,font=f,fill=255)
    A=np.asarray(m,np.float32)[...,None]/255
    S=np.asarray(m.filter(ImageFilter.GaussianBlur(shr)),np.float32)[...,None]/255*sh
    return (A*(np.array(fill[::-1],np.float32)/255), A+S*(1-A))
def L_rgba(im):
    a=np.asarray(im.convert('RGBA'),np.float32)/255; al=a[...,3:4]
    return (a[...,2::-1]*al, al)
def Lw(L): return L[1].shape[1]
def Lh(L): return L[1].shape[0]
def scaleL(L,s):
    if abs(s-1)<2e-3: return L
    P,A=L; h,w=A.shape[:2]; nw,nh=max(1,round(w*s)),max(1,round(h*s))
    return (cv2.resize(P,(nw,nh),interpolation=cv2.INTER_LINEAR),cv2.resize(A,(nw,nh),interpolation=cv2.INTER_LINEAR)[...,None])
def blit(cv,L,x,y,op=1.):
    if op<=.004: return
    P,A=L; h,w=A.shape[:2]; x=int(round(x)); y=int(round(y))
    X0,Y0,X1,Y1=max(x,0),max(y,0),min(x+w,W),min(y+h,H)
    if X1<=X0 or Y1<=Y0: return
    p=P[Y0-y:Y1-y,X0-x:X1-x]; a=A[Y0-y:Y1-y,X0-x:X1-x]*op
    r=cv[Y0:Y1,X0:X1].astype(np.float32)
    cv[Y0:Y1,X0:X1]=np.clip(r*(1-a)+p*(255*op),0,255).astype(np.uint8)
def blitc(cv,L,cx,cy,op=1.,s=1.):
    L=scaleL(L,s); blit(cv,L,cx-Lw(L)/2,cy-Lh(L)/2,op)
# ---------- images ----------
def draw(cv,src,crop,dst,op=1.,bx=0):
    sh,sw=src.shape[:2]; x,y,w,h=dst
    if w<1 or h<1: return
    X0,Y0=max(int(math.floor(x)),0),max(int(math.floor(y)),0)
    X1,Y1=min(int(math.ceil(x+w)),W),min(int(math.ceil(y+h)),H)
    if X1<=X0 or Y1<=Y0: return
    sx=(crop[2]-crop[0])*sw/w; sy=(crop[3]-crop[1])*sh/h
    M=np.float32([[sx,0,crop[0]*sw+(X0-x+.5)*sx-.5],[0,sy,crop[1]*sh+(Y0-y+.5)*sy-.5]])
    o=cv2.warpAffine(src,M,(X1-X0,Y1-Y0),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_REPLICATE)
    if bx>2: o=cv2.blur(o,(int(bx),1))
    if op>=.999: cv[Y0:Y1,X0:X1]=o
    else: cv[Y0:Y1,X0:X1]=cv2.addWeighted(o,op,cv[Y0:Y1,X0:X1],1-op,0)
def pyr(img):
    L=[img]
    while min(L[-1].shape[:2])>160: L.append(cv2.resize(L[-1],(L[-1].shape[1]//2,L[-1].shape[0]//2),interpolation=cv2.INTER_AREA))
    return L
def drawp(cv,P,crop,dst,op=1.,bx=0):
    need=(crop[2]-crop[0])*P[0].shape[1]/max(dst[2],1); k=0
    while k+1<len(P) and need/2**(k+1)>=1.0: k+=1
    draw(cv,P[k],crop,dst,op,bx)
def glow(img,st=.2,thr=185):
    f=img.astype(np.float32); hi=np.clip(f-thr,0,None)*(255/(255-thr))
    b=cv2.GaussianBlur(hi,(0,0),max(img.shape[:2])*.012)
    return np.clip(255-(255-f)*(1-st*b/255),0,255).astype(np.uint8)
def ambient(img):
    h,w=img.shape[:2]; s=max(135/w,240/h)
    sm=cv2.resize(img,(max(135,round(w*s)),max(240,round(h*s))),interpolation=cv2.INTER_AREA)
    y0=(sm.shape[0]-240)//2; x0=(sm.shape[1]-135)//2
    sm=cv2.GaussianBlur(sm[y0:y0+240,x0:x0+135],(0,0),5)
    return cv2.convertScaleAbs(cv2.resize(sm,(W,H),interpolation=cv2.INTER_CUBIC),alpha=.46)
def sqcrop(w,h):
    if w>=h: a=(1-h/w)/2; return (a,0.,1-a,1.)
    a=(1-w/h)/2; return (0.,a,1.,1-a)
def sqtile(img,n):
    h,w=img.shape[:2]; s=min(w,h)
    return cv2.resize(img[(h-s)//2:(h-s)//2+s,(w-s)//2:(w-s)//2+s],(n,n),interpolation=cv2.INTER_AREA)
def fit(w,h):
    s=min(1080/w,1440/h); dw,dh=w*s,h*s; return ((W-dw)/2,960-dh/2,dw,dh)
LUT=np.clip((np.arange(256)/255-.5)*1.07+.5+.012,0,1)
LUT=(255*LUT).astype(np.uint8)
def grade(fr):
    g=cv2.cvtColor(cv2.cvtColor(fr,cv2.COLOR_BGR2GRAY),cv2.COLOR_GRAY2BGR)
    f=cv2.LUT(cv2.addWeighted(fr,1.08,g,-.08,0),LUT)
    sm=cv2.resize(f,(270,480),interpolation=cv2.INTER_AREA).astype(np.float32)
    hi=cv2.GaussianBlur(np.clip(sm-185,0,None)*(255/70),(0,0),6)
    hi=cv2.resize(hi,(W,H),interpolation=cv2.INTER_LINEAR)
    return np.clip(255-(255-f.astype(np.float32))*(1-.16*hi/255),0,255).astype(np.uint8)
class VR:
    def __init__(s,p): s.c=cv2.VideoCapture(p); s.i=-1; s.f=None
    def get(s,i):
        while s.i<i:
            ok,f=s.c.read()
            if not ok: break
            s.i+=1; s.f=f
        return s.f
# ---------- cut configuration ----------
EXCL={'077','076','074','072','071','070','063','040','039','037','023','017','013','05'}
HERO={'09':'p098','078':'p078','020':'p020','026':'p026','030':'p030','01':'p001','062':'p062','022':'p022','085':'p085','084':'p084'}
FOC={'p098':(.5,.62),'p078':(.5,.5),'p020':(.62,.58),'p026':(.5,.55),'p030':(.36,.6),'p001':(.5,.5),'p062':(.45,.52),'p022':(.5,.5),'p085':(.5,.68),'p084':(.4,.55),'v23':(.5,.5)}
HDR={'p098':('Derby Day','May · Louisville, KY'),'p078':('Derby Day','May · Louisville, KY'),
     'p020':('Race Day','February · Daytona Beach, FL'),'p026':('The 16th','February · Scottsdale, AZ'),
     'v23':('17 at Sawgrass','March · Ponte Vedra Beach, FL')}
if CUT=='master':
    T=25.0; SEQ=['p098','p078','p020','p026','v23','p030','p001','p062','p085','p084']
    SEGS=[('hook',0,1.25,dict(Ts=1.05,tap=1.15)),('expand',1.25,1.65,dict(i=0)),('view',1.65,3.5,dict(i=0)),
      ('swipe',3.5,3.8,dict(a=0,b=1)),('view',3.8,5.0,dict(i=1)),('swipe',5.0,5.3,dict(a=1,b=2)),('view',5.3,7.0,dict(i=2)),
      ('swipe',7.0,7.3,dict(a=2,b=3)),('view',7.3,9.0,dict(i=3)),('swipe',9.0,9.3,dict(a=3,b=4)),
      ('live',9.3,13.0,dict(i=4,play=9.6,g0=9.6,g1=10.1,hout=12.0)),('roar',13.0,15.0,dict(src0=.8)),
      ('swipe',15.0,15.2,dict(a='roar',b=5)),('view',15.2,15.5,dict(i=5)),('swipe',15.5,15.7,dict(a=5,b=6)),('view',15.7,16.0,dict(i=6)),
      ('swipe',16.0,16.2,dict(a=6,b=7)),('view',16.2,16.5,dict(i=7)),('swipe',16.5,16.7,dict(a=7,b=8)),('view',16.7,17.0,dict(i=8)),
      ('swipe',17.0,17.2,dict(a=8,b=9)),('view',17.2,17.5,dict(i=9)),('collapse',17.5,17.95,dict(i=9)),
      ('zoom',17.95,18.55,{}),('grid6',18.55,22.5,{}),('card',22.5,25.0,{})]
    CAP=(3.9,4.95); LIST0=18.15; PAY=(20.62,21.25); ROAR0=13.0
else:
    T=15.0; SEQ=['p098','p020','p026','v23','p078','p030','p084']
    SEGS=[('hook',0,1.05,dict(Ts=.9,tap=.97)),('expand',1.05,1.4,dict(i=0)),('view',1.4,3.0,dict(i=0)),
      ('swipe',3.0,3.3,dict(a=0,b=1)),('view',3.3,4.5,dict(i=1)),('swipe',4.5,4.8,dict(a=1,b=2)),('view',4.8,6.0,dict(i=2)),
      ('swipe',6.0,6.3,dict(a=2,b=3)),('live',6.3,8.3,dict(i=3,play=6.45,g0=6.45,g1=6.9,hout=7.95)),('roar',8.3,9.8,dict(src0=.8)),
      ('swipe',9.8,10.0,dict(a='roar',b=4)),('view',10.0,10.3,dict(i=4)),('swipe',10.3,10.5,dict(a=4,b=5)),('view',10.5,10.8,dict(i=5)),
      ('swipe',10.8,11.0,dict(a=5,b=6)),('view',11.0,11.3,dict(i=6)),('collapse',11.3,11.7,dict(i=6)),
      ('zoom',11.7,12.2,{}),('grid6',12.2,13.0,{}),('card',13.0,15.0,{})]
    CAP=None; LIST0=None; PAY=(11.8,12.25); ROAR0=8.3
NF=int(round(T*FPS))
TIN={}
for k,t0,t1,p in SEGS:
    if k=='expand': TIN.setdefault(SEQ[p['i']],t0)
    if k=='swipe': TIN.setdefault(SEQ[p['b']],t0)
# ---------- assets ----------
log('loading')
GAL=[l.split() for l in open('galmap.txt')]
others=[];
for g,u in GAL:
    num=u.split('tripnerd_gallery_')[1].split('.')[0]
    if num in EXCL or num in HERO: continue
    others.append('gal/%s.jpg'%g)
random.Random(11).shuffle(others)
ITEMS={}
for key in set(SEQ)|{'p022','p001','p062','p085'}:
    if key=='v23': continue
    im=cv2.imread('src/%s_at.png'%key); h,w=im.shape[:2]; r=fit(w,h)
    pre=glow(cv2.resize(im,(round(r[2]*1.16),round(r[3]*1.16)),interpolation=cv2.INTER_AREA))
    ITEMS[key]=dict(P=pyr(pre),rect=r,sq=sqcrop(w,h),amb=ambient(pre),tile=pre)
V23=VR('src/v23up.mp4'); V24=VR('src/v24up.mp4')
f0=grade(VR('src/v23up.mp4').get(0))
ITEMS['v23']=dict(P=pyr(f0),rect=fit(1080,1920),sq=sqcrop(1080,1920),amb=ambient(f0),tile=f0)
extra=[k for k in ['p022','p001','p062','p085'] if k not in SEQ]
ORDER=others[:41]+SEQ+extra+others[41:]
while len(ORDER)<72: ORDER.append(others[len(ORDER)%len(others)])
ORDER=ORDER[:72]; ORDER6=ORDER+others[:18]
HI=41
def timg(k): return ITEMS[k]['tile'] if k in ITEMS else cv2.imread(k)
TCACHE={}
def tiles(k):
    if k not in TCACHE:
        im=timg(k); TCACHE[k]=(sqtile(im,268),sqtile(im,178),sqtile(im,58),sqtile(im,86))
    return TCACHE[k]
G4=np.zeros((18*270,W,3),np.uint8)
for j,k in enumerate(ORDER): r,c=divmod(j,4); G4[r*270:r*270+268,1+c*270:1+c*270+268]=tiles(k)[0]
G6=np.zeros((15*180,W,3),np.uint8)
for j,k in enumerate(ORDER6): r,c=divmod(j,6); G6[r*180:r*180+178,1+c*180:1+c*180+178]=tiles(k)[1]
# video badge on the V23 tile
bd=Image.new('RGBA',(268,268),(0,0,0,0)); dd=ImageDraw.Draw(bd)
dd.text((196,232),'0:05',font=IF('Inter-SemiBold',24),fill=(255,255,255,255))
dd.polygon([(12,238),(12,256),(27,247)],fill=(255,255,255,255))
BT=L_rgba(bd); vj=HI+SEQ.index('v23'); vr,vc=divmod(vj,4)
tmp=G4[vr*270:vr*270+268,1+vc*270:1+vc*270+268].copy()
def blit_local(arr,L):
    P,A=L; arr[:]=np.clip(arr.astype(np.float32)*(1-A)+P*255,0,255).astype(np.uint8)
blit_local(tmp,BT); G4[vr*270:vr*270+268,1+vc*270:1+vc*270+268]=tmp
SC_END=(HI//4)*270-820
def trect(j,scroll): r,c=divmod(j,4); return (1+c*270, r*270-scroll, 268, 268)
def grid4(scroll,by=0):
    M=np.float32([[1,0,0],[0,1,scroll]])
    fr=cv2.warpAffine(G4,M,(W,H),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_CONSTANT)
    return cv2.blur(fr,(1,int(by))) if by>2 else fr
# text layers
def fitfont(name,txt,size,maxw):
    while True:
        f=IF(name,size); x0,_,x1,_=ImageDraw.Draw(Image.new('L',(1,1))).textbbox((0,0),txt,font=f)
        if x1-x0<=maxw or size<30: return f
        size-=2
HOOK=[L_text(s,fitfont('InterDisplay-ExtraBold',s,116,972),sh=.6,shr=8) for s in ['Their camera roll','this year.']]
HL={k:(L_text(a,IF('InterDisplay-Bold',66),sh=.5),L_text(b,IF('Inter-Medium',40),fill=(232,232,238),sh=.5)) for k,(a,b) in HDR.items()}
pl=Image.new('RGBA',(470,92),(0,0,0,0)); pd=ImageDraw.Draw(pl); pd.rounded_rectangle((0,0,469,91),46,fill=(0,0,0,150))
pf=IF('Inter-SemiBoldItalic',44); tb=pd.textbbox((0,0),'(they dressed up)',font=pf)
pd.text(((470-(tb[2]-tb[0]))/2-tb[0],(92-(tb[3]-tb[1]))/2-tb[1]),'(they dressed up)',font=pf,fill=(255,255,255,255)); CAPL=L_rgba(pl)
bg=Image.new('RGBA',(150,56),(0,0,0,0)); bdr=ImageDraw.Draw(bg); bdr.rounded_rectangle((0,0,149,55),28,fill=(0,0,0,140))
bdr.polygon([(22,16),(22,40),(42,28)],fill=(255,255,255,255)); bdr.text((54,11),'0:05',font=IF('Inter-SemiBold',28),fill=(255,255,255,255)); BADGE=L_rgba(bg)
ic=Image.new('RGBA',(W,90),(0,0,0,0)); idr=ImageDraw.Draw(ic)
idr.line([(64,22),(44,45),(64,68)],fill=(255,255,255,210),width=6,joint='curve')
for k in range(3): idr.ellipse((990+k*20-5,40,990+k*20+5,50),fill=(255,255,255,210))
ICONS=L_rgba(ic)
td=Image.new('RGBA',(120,120),(0,0,0,0)); tdd=ImageDraw.Draw(td)
tdd.ellipse((14,14,106,106),fill=(255,255,255,70),outline=(255,255,255,150),width=4); TOUCH=L_rgba(td.filter(ImageFilter.GaussianBlur(1.2)))
sb=Image.new('RGBA',(10,150),(0,0,0,0)); ImageDraw.Draw(sb).rounded_rectangle((0,0,9,149),5,fill=(255,255,255,150)); SBAR=L_rgba(sb)
LISTW=['Derby Day.','Daytona.','The 16th in Phoenix.','17 at Sawgrass.','The big game.','Nashville.','+ more.']
lf=IF('InterDisplay-ExtraBold',84)
while max(ImageDraw.Draw(Image.new('L',(1,1))).textbbox((0,0),s,font=lf)[2] for s in LISTW)>930: lf=IF('InterDisplay-ExtraBold',lf.size-2)
LISTL=[L_text(s,lf,fill=((92,178,250) if s.startswith('+') else (255,255,255)),sh=.6,shr=8) for s in LISTW]
PAY1=L_text('We have everything.',fitfont('InterDisplay-ExtraBold','We have everything.',104,960),sh=.6,shr=9)
PAY2=L_text("Which one's yours?",fitfont('InterDisplay-SemiBold',"Which one's yours?",66,900),fill=(120,196,255),sh=.6,shr=8)
# end card
cb=np.zeros((H,W,3),np.float32); yy=np.linspace(0,1,H)[:,None]
for c,(a,b) in enumerate([(234,214),(152,132),(90,72)]): cb[...,c]=a+(b-a)*yy
xx=np.linspace(-1,1,W)[None,:]; rr=np.sqrt(xx**2+((yy-.42)*2)**2); cb*=(1.06-.10*np.clip(rr,0,1.4)/1.4)[...,None]
CARD=np.clip(cb,0,255).astype(np.uint8)
lg=Image.open('src/logo.png').convert('RGBA'); lg=lg.crop(lg.getbbox()); lw=780; lg=lg.resize((lw,round(lw*lg.size[1]/lg.size[0])),Image.LANCZOS); LOGO=L_rgba(lg)
EYE=L_text('Now booking 2027',MF('SemiBold',48),sh=.25,shr=6)
pw_,ph_=560,128; pi=Image.new('RGBA',(pw_+40,ph_+40),(0,0,0,0)); pdd=ImageDraw.Draw(pi)
pdd.rounded_rectangle((20,24,20+pw_-1,24+ph_-1),64,fill=(0,0,0,60)); pi=pi.filter(ImageFilter.GaussianBlur(8)); pdd=ImageDraw.Draw(pi)
pdd.rounded_rectangle((20,20,20+pw_-1,20+ph_-1),64,fill=(255,255,255,255)); pff=MF('Bold',54); tb=pdd.textbbox((0,0),'Talk to a Nerd',font=pff)
pdd.text((20+(pw_-(tb[2]-tb[0]))/2-tb[0],20+(ph_-(tb[3]-tb[1]))/2-tb[1]),'Talk to a Nerd',font=pff,fill=(72,136,222,255)); PILL=L_rgba(pi)
URL=L_text('tripnerd.com',MF('Bold',58),sh=.25,shr=6)
rng=np.random.default_rng(5); GR=[rng.normal(0,2.0,(H,W,1)).astype(np.float32) for _ in range(6)]
scr=np.zeros((620,1,1),np.float32); scr[:,0,0]=.9*(1-np.linspace(0,1,620))**1.6
log('assets ready', len(others),'others')
# ---------- helpers ----------
def zc(key,z):
    fx,fy=FOC[key]; return (fx-fx/z,fy-fy/z,fx+(1-fx)/z,fy+(1-fy)/z)
def zs(key,t): return 1. if key=='v23' else 1+.05*max(0.,t-TIN.get(key,t))
def amb(key,t):
    z=1+.03*max(0.,t-TIN.get(key,t)); a=ITEMS[key]['amb']
    M=np.float32([[1/z,0,(W-W/z)/2],[0,1/z,(H-H/z)/2]])
    return cv2.warpAffine(a,M,(W,H),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_REPLICATE)
def draw_key(cv,key,t,rect,crop,bx=0,op=1.): drawp(cv,ITEMS[key]['P'],crop,rect,op,bx)
def filmstrip(cv,gidx,op):
    if op<=.01: return
    y=1800; base=cv[y-48:y+48].copy() if op<.999 else None
    c=int(round(gidx))
    for j in range(c-9,c+10):
        if j<0 or j>=len(ORDER) or j==c: continue
        d=j-gidx; x=540+d*64+math.copysign(18,d)*min(1,abs(d))
        xi=int(round(x-29))
        if xi<0 or xi+58>W: continue
        cv[y-29:y+29,xi:xi+58]=tiles(ORDER[j])[2]
    cv[y-46:y+46,540-46:540+46]=255; cv[y-43:y+43,540-43:540+43]=tiles(ORDER[c])[3]
    if base is not None: cv[y-48:y+48]=cv2.addWeighted(cv[y-48:y+48],op,base,1-op,0)
def header(cv,key,op,dy=0):
    if key not in HL or op<=.01: return
    a,b=HL[key]; blit(cv,a,540-Lw(a)/2,84-26+dy,op); blit(cv,b,540-Lw(b)/2,168-26+dy,op*.92)
def chrome(cv,op): blit(cv,ICONS,0,72,op*.9)
def touch(cv,x,y,op,s=1.): blitc(cv,TOUCH,x,y,op,s)
def dim(cv,d):
    if d<.999: cv[:]=cv2.convertScaleAbs(cv,alpha=d)
def scrim(cv,op):
    if op<=.01: return
    r=cv[:620].astype(np.float32); cv[:620]=(r*(1-scr*op)).astype(np.uint8)
def grid6(t,t0,scroll0=None):
    focus=HI+len(SEQ)-1; r6,c6=divmod(focus,6); fy6=r6*180+89
    s=fy6-(trect(focus,SC_END)[1]+134)+ max(0.,t-t0)*70
    M=np.float32([[1,0,0],[0,1,s]])
    return cv2.warpAffine(G6,M,(W,H),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_CONSTANT)
# ---------- frame ----------
def seg_at(t):
    for s in SEGS:
        if s[1]<=t<s[2]: return s
    return SEGS[-1]
def frame(t):
    k,t0,t1,p=seg_at(t); u=(t-t0)/(t1-t0); cv=np.zeros((H,W,3),np.uint8)
    fs_op=0; fs_idx=HI; hdr=None; hop=0; chr_op=0
    if k=='hook':
        Ts=p['Ts']; s=SC_END*flk(t/Ts); v=SC_END*(flk((t+1/FPS)/Ts)-flk(t/Ts))
        cv[:]=grid4(s,min(v*.45,55))
        j=HI; tr=trect(j,SC_END)
        if t>=p['tap']-.03: cv[int(tr[1]):int(tr[1]+268),tr[0]:tr[0]+268]=cv2.convertScaleAbs(cv[int(tr[1]):int(tr[1]+268),tr[0]:tr[0]+268],alpha=.8)
        blit(cv,SBAR,1062,260+1400*s/max(SC_END,1),.8*(1-ramp(t,Ts,Ts+.3)))
        if t<.3: touch(cv,560,1480-1500*min(t,.2),1-ramp(t,.2,.3))
        tp=p['tap']
        if t>=tp-.05: touch(cv,tr[0]+134,tr[1]+134,ramp(t,tp-.05,tp)*(1-ramp(t,tp+.12,t1+.05)),1-.12*ramp(t,tp-.05,tp+.04))
    elif k=='expand':
        key=SEQ[p['i']]; e=eio3(u); g=grid4(SC_END)
        cv[:]=cv2.addWeighted(g,1-e,amb(key,t),e,0)
        it=ITEMS[key]; r=lrect(trect(HI,SC_END),it['rect'],e); cr=lrect(it['sq'],zc(key,zs(key,t)),e)
        draw_key(cv,key,-1,r,cr); hdr=key; hop=ramp(u,.5,1); fs_op=ramp(u,.4,1); fs_idx=HI; chr_op=ramp(u,.5,1)
    elif k=='view':
        key=SEQ[p['i']]; cv[:]=amb(key,t)
        it=ITEMS[key]; draw_key(cv,key,-1,it['rect'],zc(key,zs(key,t)))
        hdr=key; hop=1; fs_op=1; fs_idx=HI+p['i']; chr_op=1
        if CAP and key=='p078':
            o=ramp(t,CAP[0],CAP[0]+.15)*(1-ramp(t,CAP[1],CAP[1]+.1)); blitc(cv,CAPL,540,1560+14*(1-eo3(ramp(t,CAP[0],CAP[0]+.25))),o)
    elif k=='swipe':
        e=eio3(u); D=W+40; off=-e*D; v=abs(eio3(u+1/FPS/(t1-t0))-e)*D; bl=min(v*.55,70)
        b=SEQ[p['b']]
        if p['a']=='roar':
            fr=grade(V24.get(int(round((p_src0+(t-ROAR0))*FPS))))
            cv[:]=cv2.convertScaleAbs(amb(b,t),alpha=e)
            draw(cv,fr,(0,0,1,1),(off,0,W,H),1,bl)
            fs_op=e; fs_idx=HI+p['b']-1+e; chr_op=e; hdr=None
        else:
            a=SEQ[p['a']]; cv[:]=cv2.addWeighted(amb(a,t),1-e,amb(b,t),e,0)
            ra=ITEMS[a]['rect']; rb=ITEMS[b]['rect']
            draw_key(cv,a,-1,(ra[0]+off,ra[1],ra[2],ra[3]),zc(a,zs(a,t)),bl)
            draw_key(cv,b,-1,(rb[0]+off+D,rb[1],rb[2],rb[3]),zc(b,zs(b,t)),bl)
            fs_op=1; fs_idx=HI+p['a']+e; chr_op=1
            ha,hb=HDR.get(a),HDR.get(b)
            if ha==hb: hdr=a; hop=1 if ha else 0
            else:
                if u<.5: hdr=a; hop=1-ramp(u,0,.45)
                else: hdr=b; hop=ramp(u,.55,1)
            if u<.6: touch(cv,840-640*ramp(u,0,.6),1150,.8*(1-ramp(u,.4,.6)))
    elif k=='live':
        key='v23'; it=ITEMS[key]; st=max(0.,t-p['play']); fr=grade(V23.get(int(st*FPS)))
        g=eio3(ramp(t,p['g0'],p['g1'])); r=lrect(it['rect'],(0,0,W,H),g)
        cv[:]=amb(key,t) if g<1 else 0
        draw(cv,fr,(0,0,1,1),r)
        blit(cv,BADGE,r[0]+24,r[1]+24,1-ramp(t,p['play'],p['play']+.2))
        scrim(cv,g*.8)
        hdr=key; hop=1-ramp(t,p['hout'],p['hout']+.3); fs_op=1-g; fs_idx=HI+p['i']; chr_op=1-g
    elif k=='roar':
        i=int(round((p['src0']+(t-t0))*FPS)); fr=grade(V24.get(i)); z=1+.07*(1-eo3((t-t0)/.35))
        draw(cv,fr,(.5-.5/z,.45-.45/z,.5+.5/z,.45+.55/z),(0,0,W,H))
        fo=.35*(1-ramp(t,t0,t0+.12))
        if fo>0: cv[:]=cv2.addWeighted(cv,1-fo,np.full_like(cv,255),fo,0)
    elif k=='collapse':
        key=SEQ[p['i']]; e=eio3(u); g=grid4(SC_END)
        cv[:]=cv2.addWeighted(amb(key,t),1-e,g,e,0)
        it=ITEMS[key]; j=HI+p['i']; r=lrect(it['rect'],trect(j,SC_END),e); cr=lrect(zc(key,zs(key,t)),it['sq'],e)
        draw_key(cv,key,-1,r,cr); fs_op=1-ramp(u,0,.5); fs_idx=j; chr_op=1-ramp(u,0,.5)
    elif k=='zoom':
        e=eio3(u); j=HI+len(SEQ)-1; tr=trect(j,SC_END); F0=(tr[0]+134,tr[1]+134)
        r6,c6=divmod(j,6); F1=(1+c6*180+89,F0[1]); Fx,Fy=lerp(F0[0],F1[0],e),F0[1]
        s4=lerp(1,180/270,e); g=grid4(SC_END)
        M=np.float32([[1/s4,0,F0[0]-Fx/s4],[0,1/s4,F0[1]-Fy/s4]])
        a4=cv2.warpAffine(g,M,(W,H),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_CONSTANT)
        g6=grid6(t1,t1); s6=lerp(270/180,1,e)
        M6=np.float32([[1/s6,0,F1[0]-Fx/s6],[0,1/s6,F1[1]-Fy/s6]])
        a6=cv2.warpAffine(g6,M6,(W,H),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_CONSTANT)
        m=ramp(u,.2,.8); cv[:]=cv2.addWeighted(a4,1-m,a6,m,0); dim(cv,lerp(1,.40,e))
    elif k=='grid6':
        cv[:]=grid6(t,t0); dim(cv,.40)
    elif k=='card':
        cv[:]=grid6(t,[s for s in SEGS if s[0]=='grid6'][0][1]); dim(cv,.40)
        py=int(round(H*(1-eo3((t-t0)/.45))))
        if py<H: cv[py:]=CARD[:H-py]
        base=py; tc=t-t0
        lo=ramp(tc,.25,.6); blitc(cv,LOGO,540,base+700,lo,lerp(.92,1,eo3(ramp(tc,.25,.7))))
        blitc(cv,EYE,540,base+935,ramp(tc,.5,.8))
        pu=ramp(tc,.6,.95); ps=lerp(.82,1,eob(pu))*(1+.025*math.sin(max(0,tc-1.1)*2*math.pi*1.1))
        if 1.55<=tc<1.95: ps*=1-.04*math.sin((tc-1.55)/.4*math.pi)
        blitc(cv,PILL,540,base+1080,cl(pu*1.5),ps)
        blitc(cv,URL,540,base+1250,ramp(tc,.75,1.05))
        if 1.45<=tc<2.1: touch(cv,640,base+1085,ramp(tc,1.45,1.55)*(1-ramp(tc,1.85,2.05)),1-.12*ramp(tc,1.5,1.62))
    # chrome / header / filmstrip
    if chr_op>0: chrome(cv,chr_op)
    if hdr and hop>0: header(cv,hdr,hop)
    if fs_op>0: filmstrip(cv,fs_idx,fs_op)
    # overlays
    if True:
        ho=1-ramp(t,SEGS[1][1],SEGS[1][1]+.2)
        if ho>0:
            scrim(cv,ho)
            blit(cv,HOOK[0],54-26,110-26,ho); blit(cv,HOOK[1],54-26,238-26,ho)
    if LIST0 is not None:
        for i,L in enumerate(LISTL):
            ti=LIST0+.3*i; te=PAY[0]-.17+.02*i
            o=ramp(t,ti,ti+.16)*(1-ramp(t,te,te+.17))
            if o>0: blit(cv,L,70-26,480+112*i-26+30*(1-eo3(ramp(t,ti,ti+.22)))-70*eio3(ramp(t,te,te+.2)),o)
    tcard=SEGS[-1][1]
    o1=ramp(t,PAY[0],PAY[0]+.22)*(1-ramp(t,tcard,tcard+.3))
    if o1>0: blitc(cv,PAY1,540,880,o1,lerp(1.06,1,eo3(ramp(t,PAY[0],PAY[0]+.3))))
    o2=ramp(t,PAY[1],PAY[1]+.2)*(1-ramp(t,tcard,tcard+.3))
    if o2>0: blitc(cv,PAY2,540,1010+18*(1-eo3(ramp(t,PAY[1],PAY[1]+.25))),o2)
    return cv
p_src0=[s for s in SEGS if s[0]=='roar'][0][3]['src0']
def finish(cv,i):
    return np.clip(cv.astype(np.float32)+GR[i%6],0,255).astype(np.uint8)
if MODE=='stills':
    ts=[float(x) for x in sys.argv[3].split(',')]
    th=[]
    for t in ts:
        th.append(cv2.resize(finish(frame(t),int(t*FPS)),(270,480),interpolation=cv2.INTER_AREA))
        cv2.putText(th[-1],'%.2f'%t,(6,24),0,.7,(0,255,255),2)
    while len(th)%8: th.append(np.zeros_like(th[0]))
    cv2.imwrite('stills_%s.jpg'%CUT,np.vstack([np.hstack(th[i:i+8]) for i in range(0,len(th),8)]),[cv2.IMWRITE_JPEG_QUALITY,86]); log('stills done')
    sys.exit(0)
out='%s_silent.mp4'%CUT
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s','%dx%d'%(W,H),'-r',str(FPS),'-i','-',
 '-vf','scale=out_color_matrix=bt709:out_range=tv,format=yuv420p','-c:v','libx264','-preset','medium','-crf','16',
 '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',out],stdin=subprocess.PIPE)
th=[]
for i in range(NF):
    t=i/FPS; fr=finish(frame(t),i); enc.stdin.write(fr.tobytes())
    if i%15==0: th.append(cv2.resize(fr,(216,384),interpolation=cv2.INTER_AREA)); cv2.putText(th[-1],'%.1f'%t,(6,22),0,.6,(0,255,255),2)
    if i%150==0: log('frame',i)
enc.stdin.close(); enc.wait()
while len(th)%10: th.append(np.zeros_like(th[0]))
cv2.imwrite('sheet_%s.jpg'%CUT,np.vstack([np.hstack(th[i:i+10]) for i in range(0,len(th),10)]),[cv2.IMWRITE_JPEG_QUALITY,84])
log('done',out,NF)
