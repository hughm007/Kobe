# TripNerd Phoenix Open 2027 FINAL Reel (Explore cut): shared pieces for preview + render.
import numpy as np, cv2, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
import render2 as r
sys.argv = sys.argv_saved
from ticket7 import F, logo_w, TNBLUE, NAVY, INK, MUTE, PAPER, CHECKF, spaced
from ticket9 import stamp_k
W, H = 1080, 1920
SP = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/'
PK = SP + 'final_in/'
CAP_SIZE, CAP_Y, CAP_CX, CAP_MAXW = 70, 340, 500, 860      # same font/size everywhere; top safe zone; clear of right-side UI

def grade(f):                                               # warm, bright, even midday + slight feed punch
    x = f.astype(np.float32) / 255
    x = x ** 0.94; x = x * np.float32([1.04, 1.01, 0.96])
    g = x.mean(2, keepdims=True); x = g + (x - g) * 1.12
    x = 0.5 + (x - 0.5) * 1.07
    return (x.clip(0, 1) * 255).astype(np.uint8)

def caption(text, y=CAP_Y):
    f = ImageFont.truetype(SP + 'thumb/Montserrat.ttf', CAP_SIZE); words = text.split(); lines = [text]
    if f.getlength(text) > CAP_MAXW:
        best = min(range(1, len(words)), key=lambda k: max(f.getlength(' '.join(words[:k])), f.getlength(' '.join(words[k:]))))
        lines = [' '.join(words[:best]), ' '.join(words[best:])]
    lh = int(CAP_SIZE * 1.18); L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    top = y - lh * len(lines) / 2; wmax = max(f.getlength(t) for t in lines)
    bar = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(bar).rounded_rectangle(
        (CAP_CX - wmax / 2 - 30, top - 16, CAP_CX + wmax / 2 + 30, top + lh * len(lines) + 12), 22, fill=(0, 0, 0, 85))   # light translucent bar
    for j, t in enumerate(lines):
        d.text((CAP_CX, top + j * lh + lh / 2), t, font=f, fill=(255, 255, 255, 255), anchor='mm')
    sh = L.split()[3].filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * 0.55))                          # subtle shadow
    out = bar.copy(); s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s.paste((0, 0, 0, 255), (0, 0), sh)
    out.alpha_composite(s, (2, 3)); out.alpha_composite(L); return out

def with_cap(f, L):
    img = Image.fromarray(f).convert('RGBA'); img.alpha_composite(L); return np.asarray(img.convert('RGB'))

def crop916(path, cx, cy=0.5, zoom=1.0, x_px=None):
    """9:16 crop from full resolution; zoom>=1 narrows the window. Asserts the window is >= 1080x1920 (never upscaled)."""
    im = Image.open(path).convert('RGB'); w, h = im.size
    ch = min(h, w * 16 / 9) / zoom; cw = ch * 9 / 16
    assert cw >= W - 0.5 and ch >= H - 0.5, ('would upscale', path, cw, ch)
    x0 = (cx * w - cw / 2) if x_px is None else x_px - cw / 2; x0 = float(np.clip(x0, 0, w - cw))
    y0 = float(np.clip(cy * h - ch / 2, 0, h - ch))
    return np.asarray(im.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + cw, y0 + ch)))

class SuiteTicket:
    """portrait TripNerd ticket for 9:16: header band with the ORIGINAL logo file, event line, three INCLUDED rows,
    perforation, and a stub that holds the stamp (stamp never overlaps any text). Drawn at k x, only ever downscaled."""
    def __init__(self, k=4):
        K = k; self.k = k; tw, th = 880 * K, 1180 * K; self.tw, self.th = tw, th; stub_y = 860 * K
        m = Image.new('L', (tw, th), 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 0, tw - 1, th - 1), 26 * K, fill=255)
        for x in (0, tw): md.ellipse((x - 26 * K, stub_y - 26 * K, x + 26 * K, stub_y + 26 * K), fill=0)        # perforation notches
        teeth = 11; rr = tw / teeth / 2
        for j in range(teeth): md.ellipse(((2 * j + 1) * rr - rr, th - rr, (2 * j + 1) * rr + rr, th + rr), fill=0)  # torn bottom edge
        b = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(b)
        d.rectangle((0, 0, tw, 200 * K), fill=(*TNBLUE, 255))
        lg = logo_w(520 * K); b.alpha_composite(lg, ((tw - lg.size[0]) // 2, (200 * K - lg.size[1]) // 2))
        fe = F(30 * K); ev = 'PHOENIX OPEN · SCOTTSDALE, AZ · FEB 2027'
        spaced(d, ((tw - fe.getlength(ev) - 1.5 * K * len(ev)) / 2, 236 * K), ev, fe, INK, 1.5 * K)
        d.line((48 * K, 300 * K, tw - 48 * K, 300 * K), fill=(*MUTE, 255), width=2 * K)
        fl = F(46 * K); fi = F(40 * K)
        rows = ['HOLE 16 LOGE SUITE', 'FOOD + DRINK', 'HOTEL']
        for j, lab in enumerate(rows):
            y = (350 + j * 150) * K
            d.text((48 * K, y), lab, font=fl, fill=NAVY)
            iw = fi.getlength('INCLUDED'); d.text((tw - 48 * K - iw, y + 64 * K), 'INCLUDED', font=fi, fill=(*TNBLUE, 255))
            ck = ImageFont.truetype(CHECKF, 44 * K); d.text((48 * K, y + 58 * K), '✓', font=ck, fill=(*TNBLUE, 255))
            xe = 48 * K + ck.getlength('✓') + 18 * K
            for x in np.arange(xe, tw - 48 * K - iw - 16 * K, 18 * K): d.ellipse((x, y + 92 * K, x + 5 * K, y + 97 * K), fill=(*MUTE, 255))
        for x in np.arange(40 * K, tw - 40 * K, 28 * K): d.line((x, stub_y, x + 14 * K, stub_y), fill=(*MUTE, 255), width=3 * K)
        g = np.random.default_rng(3).normal(0, 3.0, (th, tw, 1)).astype(np.float32); g[:200 * K] = 0
        a = np.asarray(b).astype(np.float32); a[..., :3] = np.clip(a[..., :3] + g, 0, 255)
        out = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); out.paste(Image.fromarray(a.astype(np.uint8)), (0, 0), m)
        self.body = out; self.stamp = stamp_k(270 * K)                    # square raster: uniform scale = perfect circle
        self.stamp_c = (tw / 2, (stub_y + th) / 2 - 10 * K)               # centred in the stub, clear of all text
    def frame(self, phi=0.0):
        b = self.body.copy(); st = self.stamp if phi % 360 == 0 else self.stamp.rotate(-phi, resample=Image.BICUBIC)
        b.alpha_composite(st, (int(self.stamp_c[0] - st.size[0] / 2), int(self.stamp_c[1] - st.size[1] / 2))); return b

class HotelMini:
    """small horizontal ticket: header with the original logo + one real-text line; stamp lands BESIDE the text"""
    def __init__(self, k=4):
        K = k; self.k = k; tw, th = 1100 * K, 300 * K; self.tw, self.th = tw, th
        m = Image.new('L', (tw, th), 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 0, tw - 1, th - 1), 18 * K, fill=255)
        rr = th / 7 / 2
        for j in range(7): md.ellipse((tw - rr, (2 * j + 1) * rr - rr, tw + rr, (2 * j + 1) * rr + rr), fill=0)
        b = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(b)
        d.rectangle((0, 0, tw, 100 * K), fill=(*TNBLUE, 255)); lg = logo_w(250 * K); b.alpha_composite(lg, (30 * K, (100 * K - lg.size[1]) // 2))
        f = F(38 * K); self.text_end = 36 * K + f.getlength('HOTEL: Fairmont Scottsdale Princess')
        d.text((36 * K, 175 * K), 'HOTEL: Fairmont Scottsdale Princess', font=f, fill=NAVY)
        out = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); out.paste(b, (0, 0), m); self.body = out
        self.stamp = stamp_k(170 * K); self.stamp_c = (self.text_end + 30 * K + 85 * K, 190 * K)
        assert self.stamp_c[0] + 85 * K < tw - rr, 'stamp must sit fully on the ticket'

def place(canvas, raster, k, cx, cy, s, shadow=True):
    t = raster.resize((max(1, round(raster.size[0] * s / k)), max(1, round(raster.size[1] * s / k))), Image.LANCZOS)
    if shadow:
        sh = Image.new('RGBA', (t.size[0] + 120, t.size[1] + 120), (0, 0, 0, 0)); sh.paste((0, 0, 0, 130), (60 + int(8 * s), 60 + int(18 * s)), t.split()[3])
        canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14 * s)), (int(cx - t.size[0] / 2 - 60), int(cy - t.size[1] / 2 - 60)))
    canvas.alpha_composite(t, (int(round(cx - t.size[0] / 2)), int(round(cy - t.size[1] / 2))))
