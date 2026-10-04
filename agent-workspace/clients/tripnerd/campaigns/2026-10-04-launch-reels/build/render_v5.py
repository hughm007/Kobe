"""Augusta, by the clock — v5. 4 shots, 12 beats at 92.3 BPM (7.83 s), 1080x1920 30 fps, silent (music muxed after).
S1 9:03 check-in (brand + clock from frame 0) | S2 clock 9:04 AM -> 5:43 PM over blurred pines | S3 5:44 porch | S4 5:48 lawn close."""
import subprocess, sys
sys.path.insert(0, "reel03")
from marks import scrub
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter, ImageEnhance
W,H,FPS = 1080,1920,30
F800 = "fonts/inter_2.ttf"; F600 = "fonts/inter_1.ttf"; P = "tn_assets/"; MAXW = W-160
def load(f): return scrub(f, ImageOps.exif_transpose(Image.open(P+f)).convert("RGB"))  # non-TripNerd marks removed
SCRIM = Image.new("RGBA",(W,H),(0,0,0,0)); _g = ImageDraw.Draw(SCRIM)
for yy in range(0,820): _g.line([(0,yy),(W,yy)], fill=(0,0,0,int(110*(1-yy/820)**1.6)))
SCRIM_STRONG = Image.new("RGBA",(W,H),(0,0,0,0)); _g = ImageDraw.Draw(SCRIM_STRONG)   # S1 text sits over bright blinds
for yy in range(0,950): _g.line([(0,yy),(W,yy)], fill=(0,0,0,int(175*(1-yy/950)**1.1)))
def ft(t): return ["tnum"] if t[:1].isdigit() else None   # tabular figures on timestamps only
def overlay(lines, scrim=None, sh_a=170):
    o = Image.new("RGBA",(W,H),(0,0,0,0)); d = ImageDraw.Draw(o); sh = Image.new("RGBA",(W,H),(0,0,0,0)); sd = ImageDraw.Draw(sh)
    fonts = [ImageFont.truetype(fp,sz) for _,fp,sz in lines]
    for (t,_,_),f in zip(lines,fonts): assert f.getlength(t,features=ft(t)) <= MAXW, (t, f.getlength(t,features=ft(t)))
    y = 300
    for (t,_,_),f in zip(lines,fonts): sd.text((83,y+5),t,font=f,fill=(0,0,0,sh_a),features=ft(t)); y += f.size+20
    sh = sh.filter(ImageFilter.GaussianBlur(6)); y = 300
    for (t,_,_),f in zip(lines,fonts): d.text((80,y),t,font=f,fill=(255,255,255,255),features=ft(t)); y += f.size+20
    return Image.alpha_composite(Image.alpha_composite(scrim or SCRIM,sh),o)
T = lambda t:(t,F800,118); S = lambda t:(t,F600,74)
B = lambda n: round(n*FPS*60/92.3)   # beats -> frames
def clock(u):
    e = u*u*(3-2*u); mins = round(9*60+4 + e*((17*60+43)-(9*60+4)))
    h,mm = divmod(mins,60); return f"{(h-1)%12+1}:{mm:02d} {'AM' if h<12 else 'PM'}"

checkin = load("IMG_1901.JPG"); porch = load("IMG_1995.JPG"); lawn = load("IMG_2004.JPG")
pines = ImageOps.exif_transpose(Image.open(P+"IMG_2030.JPG")).convert("RGB").crop((330,0,892,1000)).resize((1152,2048), Image.BICUBIC)
pines = ImageEnhance.Brightness(pines.filter(ImageFilter.GaussianBlur(14))).enhance(0.34)
# each shot: base, frames, window width (base px), start centre, end centre, text
SHOTS = [
 (checkin, B(3), 1000/1.08, (547,1225), (547,1091), [T("9:03 AM"), S("Thursday in Augusta,"), S("hosted by TripNerd.")]),  # tilt up from the logo's highest position; full logo in frame throughout
 (pines,   B(3), 1152/1.10, (524,1024), (628,1024), "clock"),
 (porch,   B(2), 1152/1.10, (192+524,1024), (192+628,1024), [T("5:44 PM")]),
 (lawn,    B(4), 1152/1.08, (750,1100), (750,948), [T("5:48 PM"), S("Who would you bring?")]),  # tilt up toward the pines
]
def frame(b, w, c0, c1, u):
    h = w*16/9; cx = c0[0]+(c1[0]-c0[0])*u; cy = c0[1]+(c1[1]-c0[1])*u
    assert cx-w/2 >= -0.5 and cx+w/2 <= b.size[0]+0.5 and cy-h/2 >= -0.5 and cy+h/2 <= b.size[1]+0.5, (cx,cy,w,h,b.size)
    s = w/W; return b.transform((W,H), Image.AFFINE, (s,0,cx-w/2,0,s,cy-h/2), resample=Image.BICUBIC)
out = sys.argv[1] if len(sys.argv) > 1 else "reel03/TN-R03-augusta-by-the-clock-H3-v5-silent.mp4"
pr = subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
  "-c:v","libx264","-preset","slow","-b:v","18M","-maxrate","20M","-bufsize","40M","-pix_fmt","yuv420p","-profile:v","high","-movflags","+faststart",out], stdin=subprocess.PIPE)
cuts = []; total = 0
for i,(b,n,w,c0,c1,lines) in enumerate(SHOTS):
    ov = (overlay(lines, SCRIM_STRONG, 230) if i == 0 else overlay(lines)) if lines != "clock" else None; cuts.append(total)
    for k in range(n):
        u = k/(n-1); fr = frame(b,w,c0,c1,u)
        if lines == "clock":
            noise = Image.effect_noise((W//4,H//4),40).resize((W,H),Image.BILINEAR); fr = Image.blend(fr, Image.merge("RGB",(noise,)*3), 0.05)
            comp = Image.alpha_composite(fr.convert("RGBA"), overlay([T(clock(u))]))
        else:
            if i == len(SHOTS)-1:   # warm lift on the close
                r,g,bb = fr.split(); r = r.point(lambda v: min(255,int(v*(1+0.04*u)))); bb = bb.point(lambda v: int(v*(1-0.03*u))); fr = Image.merge("RGB",(r,g,bb))
            comp = Image.alpha_composite(fr.convert("RGBA"), ov)
        pr.stdin.write(comp.convert("RGB").tobytes()); total += 1
pr.stdin.close(); pr.wait()
print("frames", total, "seconds", round(total/FPS,3), "cuts", cuts)
