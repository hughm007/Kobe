#!/usr/bin/env python3
# A4 end card: TripNerd's client-approved camera-roll card ("Their camera roll", 2026-09-29-all-events/build-v1/render.py,
# the 'card' segment), ported unchanged in layout, type, colour and motion: the blue gradient slides up over the picture
# (0.45 s), the real logo file (46ae277a, 780 px) settles in, "Now booking 2027", the white "Talk to a Nerd" pill pops and
# breathes, a finger taps it, tripnerd.com; film grain as in the original. Here the card slides up over the end shot's
# continuing frames (out/endclip.mp4 from the cut point) instead of the camera-roll grid.
# Writes out/card.mp4 (1080x1920, 30 fps, DUR s). Usage: python3 card.py <cut_s_in_endclip> [dur]
import sys, math, subprocess, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H, FPS = 1080, 1920, 30; CUT = float(sys.argv[1]); DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 2.5
def MF(n, s): return ImageFont.truetype('fonts/Montserrat-%s.ttf' % n, s)
def cl(x, a=0., b=1.): return a if x < a else (b if x > b else x)
def eo3(u): u = cl(u); return 1-(1-u)**3
def eob(u, s=1.4): u = cl(u); return 1+(s+1)*(u-1)**3+s*(u-1)**2
def lerp(a, b, u): return a+(b-a)*u
def ramp(t, a, b): return cl((t-a)/(b-a)) if b > a else float(t >= a)
def L_text(txt, f, fill=(255, 255, 255), sh=.55, shr=6, pad=26):
    x0, y0, x1, y1 = ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), txt, font=f)
    m = Image.new('L', (x1-x0+2*pad, y1-y0+2*pad), 0); ImageDraw.Draw(m).text((pad-x0, pad-y0), txt, font=f, fill=255)
    A = np.asarray(m, np.float32)[..., None]/255
    S = np.asarray(m.filter(ImageFilter.GaussianBlur(shr)), np.float32)[..., None]/255*sh
    return (A*(np.array(fill[::-1], np.float32)/255), A+S*(1-A))
def L_rgba(im):
    a = np.asarray(im.convert('RGBA'), np.float32)/255; al = a[..., 3:4]
    return (a[..., 2::-1]*al, al)
def Lw(L): return L[1].shape[1]
def Lh(L): return L[1].shape[0]
def scaleL(L, s):
    if abs(s-1) < 2e-3: return L
    P, A = L; h, w = A.shape[:2]; nw, nh = max(1, round(w*s)), max(1, round(h*s))
    return (cv2.resize(P, (nw, nh), interpolation=cv2.INTER_LINEAR), cv2.resize(A, (nw, nh), interpolation=cv2.INTER_LINEAR)[..., None])
def blit(cv, L, x, y, op=1.):
    if op <= .004: return
    P, A = L; h, w = A.shape[:2]; x = int(round(x)); y = int(round(y))
    X0, Y0, X1, Y1 = max(x, 0), max(y, 0), min(x+w, W), min(y+h, H)
    if X1 <= X0 or Y1 <= Y0: return
    p = P[Y0-y:Y1-y, X0-x:X1-x]; a = A[Y0-y:Y1-y, X0-x:X1-x]*op
    r = cv[Y0:Y1, X0:X1].astype(np.float32)
    cv[Y0:Y1, X0:X1] = np.clip(r*(1-a)+p*(255*op), 0, 255).astype(np.uint8)
def blitc(cv, L, cx, cy, op=1., s=1.):
    L = scaleL(L, s); blit(cv, L, cx-Lw(L)/2, cy-Lh(L)/2, op)
# ---- the card's layers, as in the approved renderer (BGR canvas) ----
cb = np.zeros((H, W, 3), np.float32); yy = np.linspace(0, 1, H)[:, None]
for c, (a, b) in enumerate([(234, 214), (152, 132), (90, 72)]): cb[..., c] = a+(b-a)*yy
xx = np.linspace(-1, 1, W)[None, :]; rr = np.sqrt(xx**2+((yy-.42)*2)**2); cb *= (1.06-.10*np.clip(rr, 0, 1.4)/1.4)[..., None]
CARD = np.clip(cb, 0, 255).astype(np.uint8)
lg = Image.open('src/logo46.png').convert('RGBA'); lg = lg.crop(lg.getbbox()); lw = 780
lg = lg.resize((lw, round(lw*lg.size[1]/lg.size[0])), Image.LANCZOS); LOGO = L_rgba(lg)
EYE = L_text('Now booking 2027', MF('SemiBold', 48), sh=.25, shr=6)
pw_, ph_ = 560, 128; pi = Image.new('RGBA', (pw_+40, ph_+40), (0, 0, 0, 0)); pdd = ImageDraw.Draw(pi)
pdd.rounded_rectangle((20, 24, 20+pw_-1, 24+ph_-1), 64, fill=(0, 0, 0, 60)); pi = pi.filter(ImageFilter.GaussianBlur(8)); pdd = ImageDraw.Draw(pi)
pdd.rounded_rectangle((20, 20, 20+pw_-1, 20+ph_-1), 64, fill=(255, 255, 255, 255)); pff = MF('Bold', 54); tb = pdd.textbbox((0, 0), 'Talk to a Nerd', font=pff)
pdd.text((20+(pw_-(tb[2]-tb[0]))/2-tb[0], 20+(ph_-(tb[3]-tb[1]))/2-tb[1]), 'Talk to a Nerd', font=pff, fill=(72, 136, 222, 255)); PILL = L_rgba(pi)
URL = L_text('tripnerd.com', MF('Bold', 58), sh=.25, shr=6)
td = Image.new('RGBA', (120, 120), (0, 0, 0, 0)); ImageDraw.Draw(td).ellipse((14, 14, 106, 106), fill=(255, 255, 255, 70), outline=(255, 255, 255, 150), width=4)
TOUCH = L_rgba(td.filter(ImageFilter.GaussianBlur(1.2)))
rng = np.random.default_rng(5); GR = [rng.normal(0, 2.0, (H, W, 1)).astype(np.float32) for _ in range(6)]
# ---- background: the end shot carrying on under the slide ----
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', '%.4f' % CUT, '-i', 'out/endclip.mp4', '-t', '0.6', '-vf', 'fps=%d' % FPS, '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True, check=True).stdout
BG = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', '%dx%d' % (W, H), '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', 'out/card.mp4'], stdin=subprocess.PIPE)
NF = int(round(DUR*FPS))
for i in range(NF):
    tc = i/FPS; cv = BG[min(i, len(BG)-1)].copy() if i < len(BG) else CARD.copy()
    py = int(round(H*(1-eo3(tc/.45))))
    if py < H: cv[py:] = CARD[:H-py]
    base = py
    lo = ramp(tc, .25, .6); blitc(cv, LOGO, 540, base+700, lo, lerp(.92, 1, eo3(ramp(tc, .25, .7))))
    blitc(cv, EYE, 540, base+935, ramp(tc, .5, .8))
    pu = ramp(tc, .6, .95); ps = lerp(.82, 1, eob(pu))*(1+.025*math.sin(max(0, tc-1.1)*2*math.pi*1.1))
    if 1.55 <= tc < 1.95: ps *= 1-.04*math.sin((tc-1.55)/.4*math.pi)
    blitc(cv, PILL, 540, base+1080, cl(pu*1.5), ps)
    blitc(cv, URL, 540, base+1250, ramp(tc, .75, 1.05))
    if 1.45 <= tc < 2.1: blitc(cv, TOUCH, 640, base+1085, ramp(tc, 1.45, 1.55)*(1-ramp(tc, 1.85, 2.05)), 1-.12*ramp(tc, 1.5, 1.62))
    enc.stdin.write(np.clip(cv.astype(np.float32)+GR[i % 6], 0, 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait(); print('card', NF, 'frames; tap at +1.50 s')
