#!/usr/bin/env python3
"""TripNerd THE PLAYERS 2027 static — final client-ready pass (owner brief 2026-10-23).
Version A with three changes only:
  1. ticket scaled to 80% (proportional) and moved to the bottom-right, above the CTA line;
  2. the island green highlighted: a soft white glow drawn ONLY on lake pixels around the island (never on the
     green, the bulkhead or the crowd) plus a small "The 17th" label with a thin pointer line;
  3. bottom edge cleaned by cropping higher (source rows 0-1440, was 0-1500): the guest's hand/arm and the cut chair
     stub in the bottom-right corner fall outside the frame. No pixel of the photo is retouched for this.
Grade, headline, subline, ticket design/text, CTA, fonts and logo are build.py's, imported unchanged.
usage: final.py P085_novape.png logo.png FONT_DIR OUT_DIR"""
import sys, os, math, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B                       # reads the same argv: SRC LOGO FONT_DIR OUT_DIR
W, H, S = B.W, B.H, B.S
Y1 = 1440; WW = Y1*4/5; X0 = 1160 - WW/2            # window x 584-1736, y 0-1440; same centre as before
K = H / Y1                                          # source px -> output px
def o(x, y): return ((x - X0)*K, y*K)

def base_crop():
    src = Image.open(B.SRC).convert('RGB')
    orig = B.Image.open
    B.Image.open = lambda p, *a, **k: src.crop((round(X0), 0, round(X0 + WW), Y1)).resize((1200, 1500), Image.LANCZOS) if p == B.SRC else orig(p, *a, **k)
    x0, B.X0 = B.X0, 0                              # the pre-cropped window is handed in at 1200x1500
    try: im = B.base(vignette=True)                 # identical grade + vignette code path
    finally: B.Image.open = orig; B.X0 = x0
    return im

def island_glow(im):
    a = np.asarray(im.convert('RGB')).astype(int); hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(int)
    h = hsv[..., 0]*360/255; s = hsv[..., 1]; v = hsv[..., 2]
    import cv2
    # island green + its bulkhead, traced on a 3x zoom of this window (output px)
    ISL = [(560, 539), (600, 535), (680, 536), (777, 542), (784, 550), (782, 557), (757, 563), (680, 563), (620, 556), (560, 551)]
    isl = np.zeros((H, W), np.uint8); cv2.fillPoly(isl, [np.array(ISL, np.int32)], 1)
    water = (h > 185) & (h < 235) & (s > 45) & (v > 90)
    band = cv2.dilate(isl, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (37, 37))).astype(bool) & ~isl.astype(bool)
    m = (band & water).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 4) * water * (1 - isl)          # soft, but clipped back to water only
    alpha = np.clip(m*1.0, 0, 0.62)[..., None]
    out = a*(1 - alpha) + 255*alpha
    ys, xs = np.nonzero(isl); bbox = (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))
    return Image.fromarray(out.astype(np.uint8)).convert('RGBA'), bbox, isl.astype(bool), m > 0.02

def main():
    B.boxes.clear(); logo = Image.open(B.LOGO).convert('RGBA')
    im = base_crop()
    im, ib, isl, glow = island_glow(im)
    im = B.top_scrim(im, 470, 0.42)
    L = B.layer()
    T = B.layer(); B.text_block(T, 64, 74); L.alpha_composite(B.shadow(T, 10, 150, 3)); L.alpha_composite(B.shadow(T, 2, 90, 1)); L.alpha_composite(T)
    tw, th = 452*0.8, 262*0.8
    tk = B.ticket(tw, th, logo); B.place(L, tk, W - 60 - round(tw), 1206 - round(th))
    B.cta(L, cx=540)
    # label + pointer: label up-right of the island over the trees, line ends on the glow (water) right of the island
    lab = "The 17th"; f = B.F(B.BD, 34); P = B.layer(); dp = ImageDraw.Draw(P)
    lx, ly = (ib[2] + 62)*S, (ib[1] - 98)*S
    dp.text((lx, ly), lab, font=f, fill=B.WHITE); tb = dp.textbbox((lx, ly), lab, font=f)
    ex, ey = (ib[2] + 14)*S, (ib[1] + (ib[3] - ib[1])*0.45)*S
    dp.line([(tb[0] - 4*S, tb[3] + 6*S), (ex, ey)], fill=B.WHITE + (255,), width=int(2.8*S))
    dp.ellipse((ex - 3.2*S, ey - 3.2*S, ex + 3.2*S, ey + 3.2*S), fill=B.WHITE + (255,))
    L.alpha_composite(B.shadow(P, 7, 200, 1)); L.alpha_composite(B.shadow(P, 2, 170, 1)); L.alpha_composite(P)
    B.boxes['label'] = (tb[0]//S, tb[1]//S, tb[2]//S, tb[3]//S); B.boxes['pointer_end'] = (int(ex/S), int(ey/S))
    B.boxes['island'] = ib
    out = Image.alpha_composite(im, B.down(L)).convert('RGB')
    nm = 'TN-PLAYERS-17-suite-FINAL'
    out.save(os.path.join(B.OUT, nm + '.png'), optimize=True, icc_profile=B.SRGB)
    out.save(os.path.join(B.OUT, nm + '.jpg'), quality=95, subsampling=0, optimize=True, icc_profile=B.SRGB)
    lay = np.asarray(B.down(L))[..., 3] > 8
    B.boxes['overlay_on_island_px'] = int((lay & isl).sum()); B.boxes['glow_on_island_px'] = int((glow & isl).sum())
    json.dump(B.boxes, open(os.path.join(B.OUT, 'final_boxes.json'), 'w'), indent=1); print(json.dumps(B.boxes))

if __name__ == '__main__': main()
