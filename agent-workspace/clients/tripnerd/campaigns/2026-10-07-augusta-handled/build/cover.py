#!/usr/bin/env python3
# Reel cover for 'Augusta, handled' (owner, 2026-10-07): rebuilt from source instead of sharpening the flattened draft.
# Background = the ad's first frame (V19 2.4 s, the hook's left-anchored 1.22x punch-in) from the Topaz 2160p upscale, graded at 2x;
# type set at 2x in Montserrat and downsampled (supersampled edges); the real logo file (46ae277a) composited on a brand-blue pill.
# All text and the logo sit inside the centred 1080x1350 block that survives every Instagram crop (9:16 Reel, 4:5 feed, 3:4 grid).
# usage: cover.py bg2x.png logo46.png "<subline>" <subline_style: pill|plain> out.png
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
bgp, logop, SUB, STYLE, OUT = sys.argv[1:6]
S = 2; W, H = 1080*S, 1920*S
BLUE = (82, 142, 224); EB = 'Montserrat-ExtraBold.ttf'; BD = 'Montserrat-Bold.ttf'
# ---------- grade ----------
im = Image.open(bgp).convert('RGB'); assert im.size == (W, H)
a = np.asarray(im, np.float32)/255
blur = np.asarray(im.filter(ImageFilter.GaussianBlur(60)), np.float32)/255
a = a + 0.22*(a - blur)                                   # clarity (local contrast)
a = np.clip(a, 0, 1); s = a*a*(3 - 2*a); a = 0.78*a + 0.22*s   # gentle S-curve
L = (0.2126*a[..., 0] + 0.7152*a[..., 1] + 0.0722*a[..., 2])[..., None]
sat = (a.max(-1) - a.min(-1))[..., None]
a = L + (a - L)*(1 + 0.38*(1 - sat))                      # vibrance: lift the muted colours most
hl = np.clip((L - 0.55)/0.45, 0, 1)**2
a[..., 0:1] += 0.035*hl; a[..., 2:3] -= 0.03*hl           # warm the sunset highlights
y = np.linspace(0, 1, H)[:, None, None]
top = np.clip(y/0.40, 0, 1); a *= 0.70 + 0.30*(top*top*(3 - 2*top))   # deepen the sky behind the headline
xx = np.linspace(-1, 1, W)[None, :, None]; yy = np.linspace(-1, 1, H)[:, None, None]
a *= 1 - 0.16*np.clip((xx**2*0.9 + yy**2*0.6) - 0.15, 0, 1)            # soft vignette
im = Image.fromarray((np.clip(a, 0, 1)*255 + 0.5).astype(np.uint8)).convert('RGBA')
# ---------- type ----------
def layer(): return Image.new('RGBA', (W, H), (0, 0, 0, 0))
def shadow(L, blur, alpha, dy):
    al = L.split()[3].point(lambda v: v*alpha/255.0)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(al); sh = sh.filter(ImageFilter.GaussianBlur(blur))
    out = layer(); out.alpha_composite(sh, (0, dy)); return out
d0 = ImageDraw.Draw(layer())
def fit(text, font_path, width):
    lo, hi = 20, 600
    while hi - lo > 1:
        m = (lo + hi)//2; bb = d0.textbbox((0, 0), text, font=ImageFont.truetype(font_path, m))
        lo, hi = (m, hi) if bb[2] - bb[0] <= width else (lo, m)
    return ImageFont.truetype(font_path, lo)
T = layer(); d = ImageDraw.Draw(T)
fh = fit('Augusta,', EB, 900*S)                            # headline ~900 px wide at 1x
def centred(text, font, ytop):
    bb = d.textbbox((0, 0), text, font=font); x = (W - (bb[2] - bb[0]))//2 - bb[0]
    d.text((x, ytop - bb[1]), text, font=font, fill=(255, 255, 255, 255)); return ytop + (bb[3] - bb[1])
y1 = centred('Augusta,', fh, 360*S)
bbh = d.textbbox((0, 0), 'handled.', font=fh)
y2 = centred('handled.', fh, y1 + 34*S)
im.alpha_composite(shadow(T, 26*S, 150, 6*S)); im.alpha_composite(shadow(T, 6*S, 110, 3*S)); im.alpha_composite(T)
# subline
fs = fit(SUB, BD, 640*S); bb = d0.textbbox((0, 0), SUB, font=fs); tw, th = bb[2] - bb[0], bb[3] - bb[1]
ys = y2 + 56*S
P = layer(); dp = ImageDraw.Draw(P)
if STYLE == 'pill':
    px, py = 34*S, 22*S; x0 = (W - tw)//2 - px; box = (x0, ys, x0 + tw + 2*px, ys + th + 2*py)
    dp.rounded_rectangle(box, radius=(th + 2*py)//2, fill=BLUE + (240,))
    im.alpha_composite(shadow(P, 14*S, 120, 5*S)); im.alpha_composite(P)
    P = layer(); dp = ImageDraw.Draw(P); dp.text(((W - tw)//2 - bb[0], ys + py - bb[1]), SUB, font=fs, fill=(255, 255, 255, 255))
    im.alpha_composite(P)
else:
    dp.text(((W - tw)//2 - bb[0], ys - bb[1]), SUB, font=fs, fill=(255, 255, 255, 255))
    im.alpha_composite(shadow(P, 12*S, 170, 3*S)); im.alpha_composite(P)
# ---------- logo on the brand-blue pill (real file, composited) ----------
lg = Image.open(logop).convert('RGBA'); lg = lg.crop(lg.getbbox())
lw = 440*S; lg = lg.resize((lw, round(lg.size[1]*lw/lg.size[0])), Image.LANCZOS)
pw, ph = lw + 2*36*S, lg.size[1] + 2*24*S; x0 = (W - pw)//2; y0 = 1585*S - ph
Pl = layer(); ImageDraw.Draw(Pl).rounded_rectangle((x0, y0, x0 + pw, y0 + ph), radius=28*S, fill=BLUE + (255,))
im.alpha_composite(shadow(Pl, 22*S, 140, 8*S)); im.alpha_composite(Pl); im.alpha_composite(lg, (x0 + 36*S, y0 + 24*S))
# ---------- downsample + finish ----------
out = im.convert('RGB').resize((1080, 1920), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.0, percent=35, threshold=2))
out.save(OUT); print('written', OUT, 'headline', fh.size//S, 'px; sub', fs.size//S, 'px; text block', 360, '-', (ys + th)//S, '; logo', y0//S, '-', 1585)
