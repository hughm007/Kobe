#!/usr/bin/env python3
# TripNerd ROAR reel: a kinetic word column over the real V24 roar. 1080x1920, 30 fps, 8.0 s, silent master.
# film 0.0 = source 11.4 s of V24. QUIET holds until the hit at 2.1 s (source 13.5), ROAR snaps in and
# pulses with the real crowd level, the lockup rises at 6.4 s, the last frame loops into the first.
# usage: python3 render_roar.py --src src/up.mp4 --t0 <offset of film 0 inside src> [--stills t1,t2,...] [--out out/roar_silent.mp4]
import sys, subprocess, argparse, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS,DUR=1080,1920,30,8.0; N=int(DUR*FPS)
HIT=2.1; END=6.0
ap=argparse.ArgumentParser(); ap.add_argument('--src',required=True); ap.add_argument('--t0',type=float,default=0.0)
ap.add_argument('--out',default='out/roar_silent.mp4'); ap.add_argument('--stills',default=''); ap.add_argument('--env',default='src/env.npy')
A=ap.parse_args()
FB=ImageFont.truetype('fonts/Montserrat-ExtraBold.ttf',60); FS=ImageFont.truetype('fonts/Montserrat-SemiBold.ttf',40)
try: ENV=np.load(A.env)            # per-frame crowd level 0..1 from audio_roar.py
except Exception: ENV=np.zeros(N); print('no envelope; pulse off')
PITCH=290; ROWS=9; BASE=1.25       # 9 identical rows bleed past the top and bottom; layers are pre-rendered at 1.25x

def column(word):
    """RGBA layer of the stacked word at BASE scale with a soft shadow baked in."""
    s=BASE; w,h=int(W*s),int((H+2*PITCH)*s); f=ImageFont.truetype('fonts/Anton-Regular.ttf',int(300*s))
    txt=Image.new('L',(w,h),0); d=ImageDraw.Draw(txt); bb=d.textbbox((0,0),word,font=f); tw=bb[2]-bb[0]
    for r in range(ROWS): d.text(((w-tw)//2-bb[0], int(r*PITCH*s)-bb[1]+int(8*s)), word, font=f, fill=255)
    sh=txt.filter(ImageFilter.GaussianBlur(int(14*s))).point(lambda v:int(v*0.5))
    L=Image.new('RGBA',(w,h),(0,0,0,0)); L.paste((0,0,0,255),(0,0),sh); L.paste((255,255,255,255),(0,0),txt); return L

def blit(fr,layer,x,y,alpha=1.0):
    """Alpha-composite an RGBA PIL layer onto the uint8 frame in place, clipped to the frame."""
    lw,lh=layer.size; x0,y0=max(x,0),max(y,0); x1,y1=min(x+lw,W),min(y+lh,H)
    if x1<=x0 or y1<=y0: return
    la=np.asarray(layer)[y0-y:y1-y, x0-x:x1-x].astype(np.float32); a=la[...,3:4]*(alpha/255.0)
    fr[y0:y1,x0:x1]=(fr[y0:y1,x0:x1].astype(np.float32)*(1-a)+la[...,:3]*a).astype(np.uint8)

COLQ=column('QUIET'); COLR=column('ROAR')
LOGO=Image.open('src/logo.png').convert('RGBA'); LOGO=LOGO.resize((560,int(560*LOGO.height/LOGO.width)),Image.LANCZOS)
PILL=(82,142,224,242); INK=(255,255,255)   # the approved camera-roll end-card blue (its gradient runs (90,152,234) to (72,132,214)); the wordmark is white
FH=ImageFont.truetype('fonts/Montserrat-SemiBold.ttf',34)
def lockup():
    """A pill with the real logo, the approved line and the handle, sized to its content; sits above the UI zone."""
    pw,ph=700,LOGO.height+160; L=Image.new('RGBA',(W,ph),(0,0,0,0)); d=ImageDraw.Draw(L)
    d.rounded_rectangle(((W-pw)//2,0,(W+pw)//2,ph-1),radius=36,fill=PILL)
    L.paste(LOGO,((W-LOGO.width)//2,28),LOGO)
    t='Hospitality. Handled.'; bb=d.textbbox((0,0),t,font=FB); d.text(((W-(bb[2]-bb[0]))//2-bb[0], LOGO.height+44), t, font=FB, fill=INK+(255,))
    h='@tripnerd'; bb=d.textbbox((0,0),h,font=FH); d.text(((W-(bb[2]-bb[0]))//2-bb[0], LOGO.height+112), h, font=FH, fill=INK+(210,))
    return L
LOCK=lockup()
HANDLE=Image.new('RGBA',(320,60),(0,0,0,0)); ImageDraw.Draw(HANDLE).text((0,0),'@tripnerd',font=FS,fill=(255,255,255,255))
def ease_out(t): return 1-(1-t)**3

def compose(i,img):
    t=i/FPS; fr=np.asarray(img).copy()
    if HIT<=t<HIT+0.5:                                   # 4 % punch-in on the hit, settling over 0.5 s
        z=1+0.04*(1-ease_out((t-HIT)/0.5)); cw,ch=int(W/z),int(H/z); x0,y0=(W-cw)//2,(H-ch)//2
        fr=np.asarray(Image.fromarray(fr[y0:y0+ch,x0:x0+cw]).resize((W,H),Image.BILINEAR)).copy()
    if t<HIT:                                            # QUIET: calm, 55 %, breathing; contracts in the last 0.25 s
        k=0.92+0.01*np.sin(t*2.0); al=0.55; word=COLQ; off=t*10
        if t>HIT-0.25: p=(t-(HIT-0.25))/0.25; k=0.92-0.07*ease_out(p); al=0.55+0.45*p
    else:                                                # ROAR: snaps in big, pulses with the crowd, scrolls up
        p=min((t-HIT)/0.18,1.0); k=1.18-0.18*ease_out(p); e=float(ENV[min(i,N-1)]); k*=1+0.07*e
        al=1.0; word=COLR; off=HIT*10+(t-HIT)*60
        if t>=END: al=max(0.2,1-(t-END)/0.4*0.8)
    sc=k/BASE; L=word.resize((int(word.width*sc),int(word.height*sc)),Image.BILINEAR)
    pk=PITCH*k; y=int(-pk-(off%pk)); x=(W-L.width)//2
    if HIT<=t<HIT+0.2: r=np.random.default_rng(i); x+=int(r.integers(-5,6)); y+=int(r.integers(-5,6))
    blit(fr,L,x,y,al)
    if HIT<=t<HIT+2/FPS: fr=np.clip(fr.astype(np.int16)+70,0,255).astype(np.uint8)   # two-frame flash on the hit
    if t>=END: blit(fr,LOCK,0,1115,min(1.0,(t-END)/0.4))
    return fr

def frames():
    cmd=['ffmpeg','-v','error','-ss','%.4f'%A.t0,'-t','%.4f'%(DUR+0.1),'-i',A.src,'-vf','fps=%d,scale=%d:%d'%(FPS,W,H),'-f','rawvideo','-pix_fmt','rgb24','-']
    p=subprocess.Popen(cmd,stdout=subprocess.PIPE,bufsize=10**8); n=W*H*3
    for i in range(N):
        b=p.stdout.read(n)
        if len(b)<n: break
        yield i,Image.frombuffer('RGB',(W,H),b,'raw','RGB',0,1)
    p.stdout.close(); p.wait()

if A.stills:
    ts=[float(x) for x in A.stills.split(',')]; tiles=[]
    for t in ts:
        b=subprocess.run(['ffmpeg','-v','error','-ss','%.4f'%(A.t0+t),'-i',A.src,'-frames:v','1','-vf','scale=%d:%d'%(W,H),'-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True,check=True).stdout
        img=Image.frombuffer('RGB',(W,H),b[:W*H*3],'raw','RGB',0,1); tiles.append(Image.fromarray(compose(int(round(t*FPS)),img)).resize((270,480),Image.LANCZOS))
    cols=4; rows=(len(tiles)+cols-1)//cols; sheet=Image.new('RGB',(cols*270,rows*480),(20,20,20))
    for j,tl in enumerate(tiles): sheet.paste(tl,((j%cols)*270,(j//cols)*480))
    sheet.save('out/stills.jpg',quality=85); print('stills', ts); sys.exit()

enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r',str(FPS),'-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',A.out],stdin=subprocess.PIPE)
cnt=0
for i,img in frames(): enc.stdin.write(compose(i,img).tobytes()); cnt+=1
enc.stdin.close(); enc.wait(); print('frames',cnt,'->',A.out)
