# Reel 3 v3 ticket: same design/words as ticket7, drawn at k x resolution, with the stamp kept as its own layer so it can
# turn flat (2D) on the ticket. ticket_at(0) is the ticket7 composite at k x size.
import math, numpy as np
from PIL import Image, ImageDraw, ImageFont
from ticket7 import F, logo_w, MASCOT, TNBLUE, NAVY, INK, MUTE, PAPER, CHECKF, spaced
def stamp_k(d):
    s = Image.new('RGBA', (d, d), (0, 0, 0, 0)); dr = ImageDraw.Draw(s)
    dr.ellipse((3 * d / 200, 3 * d / 200, d - 3 * d / 200, d - 3 * d / 200), outline=(*TNBLUE, 255), width=max(1, round(6 * d / 200)))
    dr.ellipse((d * 0.2, d * 0.2, d * 0.8, d * 0.8), fill=(*TNBLUE, 255))
    m = MASCOT.resize((int(d * 0.46), round(d * 0.46 * MASCOT.size[1] / MASCOT.size[0])), Image.LANCZOS)
    s.alpha_composite(m, ((d - m.size[0]) // 2, (d - m.size[1]) // 2 + round(2 * d / 200)))
    txt = 'TRIPNERD  ·  FAN EXPERIENCES  ·  '; f = F(int(d * 0.085)); n = len(txt); R = d / 2 - d * 0.115; g_ = int(d * 0.2)
    for i, ch in enumerate(txt):
        a = -math.pi / 2 + 2 * math.pi * i / n
        g = Image.new('RGBA', (g_, g_), (0, 0, 0, 0)); ImageDraw.Draw(g).text((g_ / 2, g_ / 2), ch, font=f, fill=(*TNBLUE, 255), anchor='mm')
        g = g.rotate(-math.degrees(a) - 90, resample=Image.BICUBIC)
        s.alpha_composite(g, (int(d / 2 + R * math.cos(a) - g_ / 2), int(d / 2 + R * math.sin(a) - g_ / 2)))
    a = np.asarray(s).astype(np.float32); n_ = np.random.default_rng(7).random(a.shape[:2])
    a[..., 3] *= np.where(n_ < 0.07, 0.35, 1.0) * 0.92
    return Image.fromarray(a.astype(np.uint8)).rotate(-14, resample=Image.BICUBIC)
class Ticket:
    def __init__(self, k=4):
        self.k = k; K = k; tw, th = 1000 * K, 470 * K; teeth = 9
        m = Image.new('L', (tw, th), 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 0, tw - 1, th - 1), 18 * K, fill=255)
        r = th / teeth / 2
        for j in range(teeth): md.ellipse((tw - r, (2 * j + 1) * r - r, tw + r, (2 * j + 1) * r + r), fill=0)
        body = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(body)
        d.rectangle((0, 0, tw, 120 * K), fill=(*TNBLUE, 255))
        lg = logo_w(290 * K); body.alpha_composite(lg, (34 * K, (120 * K - lg.size[1]) // 2))
        spaced(d, (36 * K, 140 * K), 'PHOENIX OPEN · SCOTTSDALE, AZ · FEB 2027', F(27 * K), INK, 1.5 * K)
        d.line((36 * K, 190 * K, tw - 70 * K, 190 * K), fill=(*MUTE, 255), width=2 * K)
        for j, (kk, v) in enumerate([('HOLE 16', '✓'), ('FOOD + DRINK', 'INCLUDED'), ('HOTEL', '✓')]):
            y = (210 + j * 58) * K; f = F(34 * K)
            xe = spaced(d, (36 * K, y), kk, f, NAVY, K)
            vf = ImageFont.truetype(CHECKF, 40 * K) if v == '✓' else f; vw = vf.getlength(v); xr = 610 * K
            if v == '✓': d.text((xr - vw, y - 4 * K), v, font=vf, fill=(*TNBLUE, 255))
            else: d.text((xr - vw, y), v, font=vf, fill=NAVY)
            for x in np.arange(xe + 14 * K, xr - vw - 12 * K, 14 * K): d.ellipse((x, y + 26 * K, x + 4 * K, y + 30 * K), fill=(*MUTE, 255))
        d.line((36 * K, 392 * K, tw - 70 * K, 392 * K), fill=(*MUTE, 255), width=2 * K)
        spaced(d, (36 * K, 410 * K), 'TALK TO A NERD · TRIPNERD.COM', F(28 * K), (*TNBLUE, 255), 1.5 * K)
        g = np.random.default_rng(3).normal(0, 3.0, (th, tw, 1)).astype(np.float32); g[:120 * K] = 0
        a = np.asarray(body).astype(np.float32); a[..., :3] = np.clip(a[..., :3] + g, 0, 255)
        self.body = Image.fromarray(a.astype(np.uint8)); self.mask = m
        self.stamp = stamp_k(250 * K); self.spos = (690 * K, 175 * K)
        self.center1 = (690 + 125, 175 + 125)                         # stamp centre in 1x ticket coords
        self._cache = {}
    def at(self, phi=0.0):
        """ticket raster (k x) with the stamp turned phi degrees CLOCKWISE about its own centre; phi=0 is the original"""
        key = round(phi, 4)
        if key in self._cache: return self._cache[key]
        b = self.body.copy()
        st = self.stamp if key % 360 == 0 else self.stamp.rotate(-phi, resample=Image.BICUBIC)   # rigid: no squish/stretch
        b.alpha_composite(st, self.spos)
        out = Image.new('RGBA', b.size, (0, 0, 0, 0)); out.paste(b, (0, 0), self.mask)
        if key % 360 == 0: self._cache[key] = out
        return out
