#!/usr/bin/env python3
"""TripNerd THE PLAYERS 2027, 17th hole suite static, 4:5, versions A/B/C (owner brief 2026-10-23).
Real photo P085 only (crop + global grade, no pixel of a person/green/crowd altered). The TripNerd logo is the original file
(MD5 66c112d8...), scaled proportionally only: never cropped, recoloured or rotated except as part of the tilted ticket in C.
usage: build.py P085.jpg logo.png FONT_DIR OUT_DIR"""
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from PIL import ImageCms
SRGB = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
SRC, LOGO, FD, OUT = sys.argv[1:5]
W, H, S = 1080, 1350, 2
X0 = 560                     # 4:5 window x 560-1760 of the 2000x1500 photo, full height -> island green centre-right
BLUE = (82, 142, 224); NAVY = (21, 34, 64); CREAM = (247, 242, 230); WHITE = (255, 255, 255)
EB, BD, SB, MD = [os.path.join(FD, f) for f in ('m4.ttf', 'm3.ttf', 'm2.ttf', 'm1.ttf')]
F = lambda p, s: ImageFont.truetype(p, int(s*S))
HEAD = ["The island green,", "from the suite."]; SUB = "Bring your group to the 17th."
CTA = "Talk to a Nerd · Link in bio"; STRIP = "THE PLAYERS · MARCH 2027"
ITEMS = ["17th Hole Suite", "Food & drink included", "Hotel included"]
ISLAND = (500, 500, 775, 545)             # output px, island green incl. bunker (protected)
PROTECT = [(0, 480, 1080, 915)]           # green, lake, hill crowd and every seated guest's face (protected band)

def base(vignette):
    im = Image.open(SRC).convert('RGB').crop((X0, 0, X0 + 1200, 1500)).resize((W, H), Image.LANCZOS)
    a = np.asarray(im, np.float32) / 255
    a = np.clip(a * 1.05 + 0.01, 0, 1)                                  # slightly brighter
    a[..., 0] *= 1.025; a[..., 2] *= 0.975                              # a touch warmer
    hsv = np.asarray(Image.fromarray((np.clip(a, 0, 1)*255).astype(np.uint8)).convert('HSV'), np.float32)
    h = hsv[..., 0] / 255 * 360
    sel = (((h > 60) & (h < 160)) * 0.16 + ((h >= 160) & (h < 220)) * 0.12)   # greens and water a little richer
    hsv[..., 1] = np.clip(hsv[..., 1] * (1.03 + sel), 0, 255)
    im = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')
    if vignette:
        a = np.asarray(im, np.float32)
        yy, xx = np.mgrid[0:H, 0:W]; d = ((xx - W/2)/(W*0.62))**2 + ((yy - H/2)/(H*0.62))**2
        a *= (1 - 0.22*np.clip(d - 0.35, 0, 1))[..., None]
        im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return im.convert('RGBA')

def layer(): return Image.new('RGBA', (W*S, H*S), (0, 0, 0, 0))
def down(L): return L.resize((W, H), Image.LANCZOS)
def shadow(L, blur, alpha, dy):
    al = L.split()[3].point(lambda v: v*alpha/255); sh = Image.new('RGBA', L.size, (0, 0, 0, 0)); sh.putalpha(al)
    sh = sh.filter(ImageFilter.GaussianBlur(blur*S)); o = Image.new('RGBA', L.size, (0, 0, 0, 0)); o.alpha_composite(sh, (0, int(dy*S))); return o
boxes = {}

def text_block(L, x, y, head_size=64, sub_size=31, name='headline'):
    d = ImageDraw.Draw(L); fh = F(EB, head_size); fs = F(SB, sub_size); yy = y*S; x0 = x*S; maxx = 0
    for ln in HEAD:
        bb = d.textbbox((x0, yy), ln, font=fh); d.text((x0, yy - (bb[1] - yy)), ln, font=fh, fill=WHITE); yy += int(head_size*1.12*S); maxx = max(maxx, bb[2])
    yy += int(10*S); bb = d.textbbox((x0, yy), SUB, font=fs); d.text((x0, yy - (bb[1]-yy)), SUB, font=fs, fill=WHITE); maxx = max(maxx, bb[2])
    boxes[name] = (x, y, maxx//S, (yy + (bb[3]-bb[1]))//S)

def ticket(w, h, logo):
    """Phoenix-Reel ticket language: blue logo strip, cream body, ticked boxes, dashed perforation, scalloped stub, round stamp."""
    w, h = int(w*S), int(h*S); T = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(T)
    r = int(18*S); d.rounded_rectangle((0, 0, w - 1, h - 1), r, fill=CREAM + (255,))
    hh = int(h*0.25); d.rounded_rectangle((0, 0, w - 1, hh), r, fill=BLUE + (255,)); d.rectangle((0, r, w - 1, hh), fill=BLUE + (255,))
    lh = int(hh*0.66); lg = logo.resize((round(logo.width*lh/logo.height), lh), Image.LANCZOS)   # proportional only
    T.alpha_composite(lg, (int(14*S), (hh - lh)//2))
    fs = F(BD, h/S*0.062); tw = d.textlength(STRIP, font=fs); bb = d.textbbox((0, 0), STRIP, font=fs)
    d.text((w - tw - int(16*S), (hh - (bb[3]-bb[1]))//2 - bb[1]), STRIP, font=fs, fill=WHITE)
    px = int(w*0.765)                                                    # perforation x
    y = hh + int((h - hh)*0.13); step = int((h - hh)*0.27); bs = int((h - hh)*0.16); fi = F(BD, h/S*0.078)
    for it in ITEMS:
        d.rounded_rectangle((int(18*S), y, int(18*S) + bs, y + bs), int(5*S), outline=BLUE + (255,), width=int(2.6*S), fill=WHITE + (255,))
        cx, cy = int(18*S), y; d.line([(cx + bs*0.22, cy + bs*0.52), (cx + bs*0.43, cy + bs*0.74), (cx + bs*0.80, cy + bs*0.26)], fill=BLUE + (255,), width=int(3.4*S), joint='curve')
        bb = d.textbbox((0, 0), it, font=fi); d.text((int(18*S) + bs + int(14*S), y + (bs - (bb[3]-bb[1]))//2 - bb[1]), it, font=fi, fill=NAVY + (255,))
        assert int(18*S) + bs + int(14*S) + d.textlength(it, font=fi) < px - int(8*S), 'checklist line runs into the perforation'
        y += step
    yy = hh + int(8*S)
    while yy < h - int(10*S): d.line([(px, yy), (px, yy + int(6*S))], fill=(150, 150, 160, 255), width=int(2*S)); yy += int(12*S)
    for cy in (0, h):                                                    # notches at the perforation
        d.ellipse((px - int(9*S), cy - int(9*S), px + int(9*S), cy + int(9*S)), fill=(0, 0, 0, 0))
    sr = int(10*S); n = max(4, int((h - hh)/(2.6*sr)))
    for k in range(n):                                                   # scalloped stub edge
        cy = hh + int((k + 0.5)*(h - hh)/n); d.ellipse((w - sr, cy - sr, w + sr, cy + sr), fill=(0, 0, 0, 0))
    # stamp: blue disc, ring text, the full original logo inside (scaled only)
    sx = (px + w - sr)//2; sy = hh + (h - hh)//2; R = int(min(w - px - 2*sr, h - hh)*0.42)
    d.ellipse((sx - R, sy - R, sx + R, sy + R), fill=BLUE + (235,), outline=WHITE + (255,), width=int(2*S))
    d.ellipse((sx - R*0.78, sy - R*0.78, sx + R*0.78, sy + R*0.78), outline=WHITE + (200,), width=max(1, int(1*S)))
    lw = int(R*1.3); lg2 = logo.resize((lw, round(logo.height*lw/logo.width)), Image.LANCZOS); T.alpha_composite(lg2, (sx - lw//2, sy - lg2.height//2))
    ring = "• TRIPNERD • THE 17TH "; fr = F(BD, R/S*0.17); ang = -90.0; tot = sum(d.textlength(c, font=fr) for c in ring); stp = 360/tot
    for ch in ring:
        cw = d.textlength(ch, font=fr); a = ang + stp*cw/2; g = Image.new('RGBA', (int(R*0.4), int(R*0.4)), (0, 0, 0, 0))
        ImageDraw.Draw(g).text((g.width/2, g.height/2), ch, font=fr, fill=WHITE + (255,), anchor='mm'); g = g.rotate(-(a + 90), resample=Image.BICUBIC)
        T.alpha_composite(g, (int(sx + R*0.89*math.cos(math.radians(a)) - g.width/2), int(sy + R*0.89*math.sin(math.radians(a)) - g.height/2))); ang += stp*cw
    return T

def place(L, T, x, y, deg=0.0, name='ticket'):
    if deg: T = T.rotate(deg, resample=Image.BICUBIC, expand=True)
    L.alpha_composite(shadow(T, 9, 120, 6), (0, 0)) if False else None
    sh = Image.new('RGBA', L.size, (0, 0, 0, 0)); sh.alpha_composite(T, (int(x*S), int(y*S)))
    L.alpha_composite(shadow(sh, 12, 115, 7)); L.alpha_composite(shadow(sh, 3, 90, 2)); L.alpha_composite(sh)
    boxes[name] = (x, y, x + T.width//S, y + T.height//S)

def cta(L, cx=None, x=None, y=1222):
    d = ImageDraw.Draw(L); f = F(BD, 27); tw = d.textlength(CTA, font=f); bb = d.textbbox((0, 0), CTA, font=f)
    pw, ph = tw + 56*S, (bb[3]-bb[1]) + 30*S
    x0 = (cx*S - pw/2) if cx is not None else x*S; y0 = y*S
    P = layer(); dp = ImageDraw.Draw(P); dp.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), ph/2, fill=BLUE + (255,), outline=WHITE + (230,), width=int(2*S))
    dp.text((x0 + 28*S, y0 + 15*S - bb[1]), CTA, font=f, fill=WHITE)
    L.alpha_composite(shadow(P, 8, 110, 4)); L.alpha_composite(P)
    boxes['cta'] = (int(x0/S), int(y0/S), int((x0 + pw)/S), int((y0 + ph)/S))

def top_scrim(img, h, alpha):
    a = np.asarray(img, np.float32); y = np.linspace(0, 1, H)[:, None, None]; m = np.clip(1 - y*H/h, 0, 1)**1.6
    a[..., :3] *= (1 - alpha*m); return Image.fromarray(a.astype(np.uint8), 'RGBA')

def build(v):
    boxes.clear(); logo = Image.open(LOGO).convert('RGBA')
    im = base(vignette=v in 'AB')
    L = layer()
    if v in 'AB':
        im = top_scrim(im, 470, 0.42)                                   # keeps white type readable on the light roof
        T = layer(); text_block(T, 64, 74); L.alpha_composite(shadow(T, 10, 150, 3)); L.alpha_composite(shadow(T, 2, 90, 1)); L.alpha_composite(T)
        tk = ticket(452, 262, logo)
        place(L, tk, 1080 - 64 - 452, 940) if v == 'A' else place(L, tk, 64, 940)
        cta(L, cx=540)
    if v == 'B':
        G = layer(); dg = ImageDraw.Draw(G); cx, cy = 638*S, 523*S; rx, ry = 168*S, 44*S
        dg.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), outline=WHITE + (255,), width=int(3*S))
        glow = G.filter(ImageFilter.GaussianBlur(6*S)); L.alpha_composite(glow); L.alpha_composite(glow); L.alpha_composite(G)
        lab = "The 17th"; f = F(BD, 28); lx, ly = 846*S, 404*S
        P = layer(); dp = ImageDraw.Draw(P); dp.text((lx, ly), lab, font=f, fill=WHITE)
        tb = dp.textbbox((lx, ly), lab, font=f)
        ex, ey = cx + rx*math.cos(math.radians(-32)), cy + ry*math.sin(math.radians(-32))
        dp.line([(tb[0] - 6*S, tb[3] + 2*S), (ex + 4*S, ey - 3*S)], fill=WHITE + (255,), width=int(2.4*S))
        L.alpha_composite(shadow(P, 4, 160, 1)); L.alpha_composite(P); boxes['label'] = (tb[0]//S, tb[1]//S, tb[2]//S, tb[3]//S)
    if v == 'C':
        a = np.asarray(im, np.float32); bh = int(H*0.22); y = np.arange(H)[:, None]
        al = np.where(y < bh - 40, 0.80 - 0.18*y/bh, np.clip((bh - y)/40, 0, 1)*0.66)
        a[..., :3] = a[..., :3]*(1 - al[..., None]) + np.array((48, 108, 206), np.float32)*al[..., None]
        im = Image.fromarray(a.astype(np.uint8), 'RGBA')
        T = layer(); text_block(T, 64, 62, head_size=58, sub_size=29); L.alpha_composite(shadow(T, 6, 110, 2)); L.alpha_composite(T)
        tk = ticket(510, 296, logo); place(L, tk, 1080 - 62 - 523, 924, deg=2.5)
        cta(L, x=64)
    out = Image.alpha_composite(im, down(L)).convert('RGB')
    out.save(os.path.join(OUT, f'TN-PLAYERS-17-suite-{v}.png'), optimize=True, icc_profile=SRGB)
    out.save(os.path.join(OUT, f'TN-PLAYERS-17-suite-{v}.jpg'), quality=95, subsampling=0, optimize=True, icc_profile=SRGB)
    return dict(boxes)

if __name__ == '__main__':
    import json
    res = {v: build(v) for v in 'ABC'}
    json.dump(res, open(os.path.join(OUT, 'boxes.json'), 'w'), indent=1); print(json.dumps(res))
