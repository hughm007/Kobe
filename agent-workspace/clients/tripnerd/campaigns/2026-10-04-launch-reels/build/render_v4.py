import subprocess, sys
sys.path.insert(0,"reel03")
from marks_v4 import scrub
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter, ImageEnhance
W,H,FPS=1080,1920,30
F800="fonts/inter_2.ttf"; F600="fonts/inter_1.ttf"; P="tn_assets/"; MAXW=W-160
def load(f): return scrub(f, ImageOps.exif_transpose(Image.open(P+f)).convert("RGB"))  # non-TripNerd marks removed
def region(im,x0,y0,w): return im.crop((x0,y0,x0+w,y0+round(w*16/9)))
def center(im):
    w,h=im.size; cw=round(h*9/16); x0=(w-cw)//2; return im.crop((x0,0,x0+cw,h))
SCRIM=Image.new("RGBA",(W,H),(0,0,0,0)); _g=ImageDraw.Draw(SCRIM)
for yy in range(0,820): _g.line([(0,yy),(W,yy)],fill=(0,0,0,int(110*(1-yy/820)**1.6)))
FT=["tnum"]
def ft(t): return FT if t[:1].isdigit() else None   # tabular figures on timestamps only
def overlay(lines):
    o=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(o); sh=Image.new("RGBA",(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sh)
    fonts=[ImageFont.truetype(fp,sz) for _,fp,sz in lines]
    for (t,_,_),f in zip(lines,fonts): assert f.getlength(t,features=ft(t))<=MAXW,(t,f.getlength(t,features=ft(t)))
    y=300
    for (t,_,_),f in zip(lines,fonts): sd.text((83,y+5),t,font=f,fill=(0,0,0,170),features=ft(t)); y+=f.size+20
    sh=sh.filter(ImageFilter.GaussianBlur(6)); y=300
    for (t,_,_),f in zip(lines,fonts): d.text((80,y),t,font=f,fill=(255,255,255,255),features=ft(t)); y+=f.size+20
    return Image.alpha_composite(Image.alpha_composite(SCRIM,sh),o)
T=lambda t:(t,F800,118); S=lambda t:(t,F600,74); K=lambda t:(t,F600,56); M=lambda t:(t,F800,96)
B=lambda n:round(n*FPS*60/92.3)   # beats -> frames at 92.3 BPM
lawn=center(load("IMG_2004.JPG"))
dark=ImageEnhance.Brightness(center(load("IMG_1933.JPG")).filter(ImageFilter.GaussianBlur(12))).enhance(0.24)
SHOTS=[ # base, frames, move, zoom, lines
 (lawn,B(3),"panL",1.12,[M("Thursday"),M("in Augusta."),K("with TripNerd")]),
 (region(load("IMG_1901.JPG"),40,341,960),B(2),"panL",1.10,[T("9:03 AM"),S("Check-in.")]),
 (center(load("IMG_1933.JPG")),B(2),"panR",1.10,[T("9:15 AM")]),
 (dark,B(3),"card",1.10,None),   # the clock races 9:16 AM -> 5:43 PM; lands on the 5:44 PM shot
 (center(load("IMG_1995.JPG")),B(2),"panR",1.10,[T("5:44 PM")]),
 (center(load("IMG_1998.JPG")),B(2),"panUp",1.10,[T("5:46 PM")]),
 (lawn,B(4),"panR",1.15,[T("5:48 PM"),S("Who would you bring?")]),
]
def clock(u):
    e=u*u*(3-2*u); mins=round(9*60+16+e*((17*60+43)-(9*60+16)))   # smoothstep ease
    h,mm=divmod(mins,60); return f"{(h-1)%12+1}:{mm:02d} {'AM' if h<12 else 'PM'}"
def frame_from(b,u,move,z):
    bw,bh=b.size; zz=z
    ww,wh=bw/zz,bh/zz; cx,cy=bw/2,bh/2
    if move in ("panR","card"): cx=ww/2+(bw-ww)*u
    if move=="panL": cx=bw-ww/2-(bw-ww)*u
    if move=="panUp": cy=bh-wh/2-(bh-wh)*u
    s=ww/W
    return b.transform((W,H),Image.AFFINE,(s,0,cx-ww/2,0,s,cy-wh/2),resample=Image.BICUBIC)
out=sys.argv[1] if len(sys.argv)>1 else "reel03/TN-R03-augusta-by-the-clock-H3-v4-silent.mp4"
pr=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
  "-c:v","libx264","-preset","slow","-b:v","18M","-maxrate","20M","-bufsize","40M","-pix_fmt","yuv420p","-profile:v","high","-movflags","+faststart",out],stdin=subprocess.PIPE)
cuts=[];total=0
for i,(b,n,move,z,lines) in enumerate(SHOTS):
    ov=overlay(lines) if lines else None; cuts.append(total)
    for k in range(n):
        u=k/(n-1); fr=frame_from(b,u,move,z)
        if move=="card":
            noise=Image.effect_noise((W//4,H//4),40).resize((W,H),Image.BILINEAR); fr=Image.blend(fr,Image.merge("RGB",(noise,)*3),0.06)
        if i==6:
            r,g,bb=fr.split(); r=r.point(lambda v:min(255,int(v*(1+0.04*u)))); bb=bb.point(lambda v:int(v*(1-0.03*u))); fr=Image.merge("RGB",(r,g,bb))
        comp=fr.convert("RGBA")
        if move=="card": comp=Image.alpha_composite(comp,overlay([T(clock(u))]))
        else: comp=Image.alpha_composite(comp,ov)
        pr.stdin.write(comp.convert("RGB").tobytes()); total+=1
pr.stdin.close(); pr.wait()
print("frames",total,"seconds",round(total/FPS,3),"cuts",cuts)
