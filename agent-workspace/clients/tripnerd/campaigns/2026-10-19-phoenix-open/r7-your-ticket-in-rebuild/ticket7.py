# Reel 3 rebuild ticket: cream stub, torn perforated right edge, soft shadow (added at placement), round TripNerd stamp.
# Words exactly per BRIEF.md; the header line "TRIPNERD FAN EXPERIENCES" is the ORIGINAL logo file (it carries those words).
import math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
SP = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/'
B = SP + 'r3build_in/TripNerd_PHX_Reel3/'
FONT = SP + 'thumb/Montserrat.ttf'
CHECKF = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
LOGO = Image.open(B + 'TripNerd_logo_ORIGINAL.png').convert('RGBA')
EC = Image.open(SP + 'endcards/TripNerd_endcard_CameraRoll_9x16.jpg').convert('RGB')
TNBLUE = tuple(int(v) for v in np.median(np.asarray(EC)[60:200, 40:1040].reshape(-1, 3), 0))   # the approved end card's own blue
NAVY = (20, 34, 64); INK = (28, 38, 60); MUTE = (118, 126, 142); PAPER = (246, 241, 228)
def F(sz): return ImageFont.truetype(FONT, sz)
def logo_w(w):                                    # uniform scale only: never stretched, recoloured or redrawn
    return LOGO.resize((w, round(w * LOGO.size[1] / LOGO.size[0])), Image.LANCZOS)
MASCOT = LOGO.crop((0, 0, 560, 601))              # the face from the original file, untouched pixels
def spaced(d, xy, text, font, fill, track=0, anchor_right=False):
    x, y = xy
    if anchor_right:
        w = sum(font.getlength(c) + track for c in text) - track; x -= w
    for c in text:
        d.text((x, y), c, font=font, fill=fill); x += font.getlength(c) + track
    return x
def stamp(d=200):
    s = Image.new('RGBA', (d, d), (0, 0, 0, 0)); dr = ImageDraw.Draw(s)
    dr.ellipse((3, 3, d - 3, d - 3), outline=(*TNBLUE, 255), width=6)
    dr.ellipse((d * 0.2, d * 0.2, d * 0.8, d * 0.8), fill=(*TNBLUE, 255))
    m = MASCOT.resize((int(d * 0.46), round(d * 0.46 * MASCOT.size[1] / MASCOT.size[0])), Image.LANCZOS)
    s.alpha_composite(m, ((d - m.size[0]) // 2, (d - m.size[1]) // 2 + 2))
    txt = 'TRIPNERD  ·  FAN EXPERIENCES  ·  '; f = F(int(d * 0.085)); n = len(txt); R = d / 2 - d * 0.115
    for i, ch in enumerate(txt):
        a = -math.pi / 2 + 2 * math.pi * i / n
        g = Image.new('RGBA', (40, 40), (0, 0, 0, 0)); ImageDraw.Draw(g).text((20, 20), ch, font=f, fill=(*TNBLUE, 255), anchor='mm')
        g = g.rotate(-math.degrees(a) - 90, resample=Image.BICUBIC)
        s.alpha_composite(g, (int(d / 2 + R * math.cos(a) - 20), int(d / 2 + R * math.sin(a) - 20)))
    # worn-ink texture so it reads as a rubber stamp
    a = np.asarray(s).astype(np.float32); n_ = np.random.default_rng(7).random(a.shape[:2])
    a[..., 3] *= np.where(n_ < 0.07, 0.35, 1.0) * 0.92
    return Image.fromarray(a.astype(np.uint8)).rotate(-14, resample=Image.BICUBIC)
def ticket():
    tw, th = 1000, 470; teeth = 9
    m = Image.new('L', (tw, th), 0); md = ImageDraw.Draw(m)
    md.rounded_rectangle((0, 0, tw - 1, th - 1), 18, fill=255)
    r = th / teeth / 2                            # torn perforated edge: semicircle bites along the right side
    for k in range(teeth): md.ellipse((tw - r, (2 * k + 1) * r - r, tw + r, (2 * k + 1) * r + r), fill=0)
    body = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(body)
    d.rectangle((0, 0, tw, 120), fill=(*TNBLUE, 255))
    lg = logo_w(290); body.alpha_composite(lg, (34, (120 - lg.size[1]) // 2))
    spaced(d, (36, 140), 'PHOENIX OPEN · SCOTTSDALE, AZ · FEB 2027', F(27), INK, 1.5)
    d.line((36, 190, tw - 70, 190), fill=(*MUTE, 255), width=2)
    rows = [('HOLE 16', '✓'), ('FOOD + DRINK', 'INCLUDED'), ('HOTEL', '✓')]
    for j, (k, v) in enumerate(rows):
        y = 210 + j * 58; f = F(34)
        xe = spaced(d, (36, y), k, f, NAVY, 1)
        vf = ImageFont.truetype(CHECKF, 40) if v == '✓' else f
        vw = vf.getlength(v); xr = 610
        if v == '✓': d.text((xr - vw, y - 4), v, font=vf, fill=(*TNBLUE, 255))
        else: d.text((xr - vw, y), v, font=vf, fill=NAVY)
        for x in np.arange(xe + 14, xr - vw - 12, 14): d.ellipse((x, y + 26, x + 4, y + 30), fill=(*MUTE, 255))
    d.line((36, 392, tw - 70, 392), fill=(*MUTE, 255), width=2)
    spaced(d, (36, 410), 'TALK TO A NERD · TRIPNERD.COM', F(28), (*TNBLUE, 255), 1.5)
    g = np.random.default_rng(3).normal(0, 3.0, (th, tw, 1)).astype(np.float32); g[:120] = 0
    a = np.asarray(body).astype(np.float32); a[..., :3] = np.clip(a[..., :3] + g, 0, 255); body = Image.fromarray(a.astype(np.uint8))
    st = stamp(250); sx, sy = 690, 175
    body.alpha_composite(st, (sx, sy))
    out = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); out.paste(body, (0, 0), m)
    return out, (sx + st.size[0] / 2, sy + st.size[1] / 2)
if __name__ == '__main__':
    t, c = ticket(); bg = Image.new('RGBA', (1200, 700), (40, 40, 44, 255)); bg.alpha_composite(t, (100, 115)); bg.convert('RGB').save(SP + 'r7/ticket_preview.png'); print(c, TNBLUE)
