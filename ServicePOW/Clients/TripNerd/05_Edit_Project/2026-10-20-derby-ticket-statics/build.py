#!/usr/bin/env python3
"""TripNerd Kentucky Derby ticket-stub statics, 4:5 1080x1350 (owner brief 2026-10-20).
Real photos only (global light grade, no blur, no face edits). The TripNerd logo is the real file
(46ae277a, MD5 66c112d8...), only scaled proportionally. The stamp uses the mascot cropped from that same file,
original colours, with a distressed alpha (ink-fade) mask; nothing is redrawn or recoloured.
usage: build.py SRC_DIR FONT_DIR OUT_DIR"""
import sys, os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance
SRC, FD, OUT = sys.argv[1:4]
S = 2                                   # supersample for crisp type and edges
W, H = 1080, 1350
INK = (28, 30, 36); PAPER = (244, 240, 230); STAMP = (32, 72, 150)
CB = os.path.join(FD, 'f2.ttf'); CR = os.path.join(FD, 'f1.ttf'); HAND = os.path.join(FD, 'f4.ttf')
F = lambda p, s: ImageFont.truetype(p, int(s))
rng = np.random.default_rng(7)

def load(name):
    return ImageOps.exif_transpose(Image.open(os.path.join(SRC, name))).convert('RGB')

def grade(im, sat=1.10, con=1.06, bri=1.02):
    im = ImageEnhance.Color(im).enhance(sat); im = ImageEnhance.Contrast(im).enhance(con)
    return ImageEnhance.Brightness(im).enhance(bri)

def cover(im, box):            # crop box (x0,y0,x1,y1) in source px, then scale to the 4:5 frame
    return im.crop(box).resize((W*S, H*S), Image.LANCZOS)

def shadow_of(rgba, blur, alpha, off):
    a = rgba.split()[3].point(lambda v: v*alpha/255)
    sh = Image.new('RGBA', rgba.size, (0, 0, 0, 0)); sh.putalpha(a)
    pad = blur*3
    big = Image.new('RGBA', (rgba.width+2*pad, rgba.height+2*pad), (0, 0, 0, 0)); big.alpha_composite(sh, (pad+off[0], pad+off[1]))
    return big.filter(ImageFilter.GaussianBlur(blur)), pad

def paste_rot(base, rgba, cx, cy, deg, shadow=(14, 120, (6, 10))):
    r = rgba.rotate(deg, resample=Image.BICUBIC, expand=True)
    sh, pad = shadow_of(r, shadow[0]*S, shadow[1], (shadow[2][0]*S, shadow[2][1]*S))
    base.alpha_composite(sh, (int(cx - r.width/2 - pad), int(cy - r.height/2 - pad)))
    base.alpha_composite(r, (int(cx - r.width/2), int(cy - r.height/2)))
    return (int(cx - r.width/2), int(cy - r.height/2), int(cx + r.width/2), int(cy + r.height/2))

def paper_texture(w, h):
    n = rng.normal(0, 1, (h//4+1, w//4+1)).astype(np.float32)
    n = np.asarray(Image.fromarray(((n*20)+128).clip(0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) - 128
    fine = rng.normal(0, 5, (h, w)).astype(np.float32)
    base = np.array(PAPER, np.float32)[None, None, :] + (n*0.35 + fine)[..., None]
    y = np.linspace(-1, 1, h)[:, None]; x = np.linspace(-1, 1, w)[None, :]
    base *= (1 - 0.035*(x**2 + y**2))[..., None]               # faint edge darkening, like worn card stock
    return Image.fromarray(base.clip(0, 255).astype(np.uint8))

def torn_mask(w, h, tooth):
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
    top = []; bot = []
    n = w // tooth
    for i in range(n+1):
        x = i*w/n; j = rng.uniform(-0.18, 0.18)*tooth
        top += [(x, tooth*0.9 + j if i % 2 else 0.0 + abs(j)*0.3)]
        bot += [(x, h - (tooth*0.9 + j if i % 2 else 0.0 + abs(j)*0.3))]
    d.polygon(top + [(w, h)] + list(reversed(bot))[0:0] + [(w, bot[-1][1])] + list(reversed(bot)) + [(0, top[0][1])], fill=255)
    return m

def checkmark(d, x, y, s, w):
    d.line([(x, y + s*0.55), (x + s*0.38, y + s*0.92), (x + s, y + s*0.05)], fill=INK, width=w, joint='curve')

def stamp(logo, diam):
    """Round ink stamp: ring + curved text in ink, centred mascot cropped from the real logo file (true colours),
    the whole stamp faded through a distressed alpha mask (opacity only, no recolour)."""
    D = diam; st = Image.new('RGBA', (D, D), (0, 0, 0, 0)); d = ImageDraw.Draw(st)
    c = D/2; ring = max(3, D//60)
    d.ellipse((ring, ring, D-ring, D-ring), outline=STAMP+(255,), width=ring)
    d.ellipse((D*0.17, D*0.17, D*0.83, D*0.83), outline=STAMP+(255,), width=max(2, ring//2))
    txt = '  TRIPNERD  •  FAN EXPERIENCES  •  LOUISVILLE  •'
    ft = F(CB, D*0.075); r = D*0.415
    ang = -90.0
    total = sum(d.textlength(ch, font=ft) for ch in txt)
    step = 360.0 / total
    for ch in txt:
        cw = d.textlength(ch, font=ft); a = ang + step*cw/2
        g = Image.new('RGBA', (int(D*0.12), int(D*0.12)), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
        gd.text((g.width/2, g.height/2), ch, font=ft, fill=STAMP+(255,), anchor='mm')
        g = g.rotate(-(a+90), resample=Image.BICUBIC)
        x = c + r*math.cos(math.radians(a)); y = c + r*math.sin(math.radians(a))
        st.alpha_composite(g, (int(x - g.width/2), int(y - g.height/2)))
        ang += step*cw
    # mascot: left part of the real logo file, original pixels, proportional scale only
    a = np.asarray(logo)[..., 3]; cols = np.where(a[:, :int(logo.width*0.36)].max(0) > 0)[0]; rows = np.where(a[:, :int(logo.width*0.36)].max(1) > 0)[0]
    m = logo.crop((cols[0], rows[0], cols[-1]+1, rows[-1]+1))
    mh = int(D*0.50); m = m.resize((round(m.width*mh/m.height), mh), Image.LANCZOS)
    st.alpha_composite(m, (int(c - m.width/2), int(c - m.height/2 - D*0.01)))
    # ink fade: blotchy low-frequency + speckle mask, multiplied into alpha
    lo = rng.uniform(0.55, 1.0, (8, 8)).astype(np.float32)
    lo = np.asarray(Image.fromarray((lo*255).astype(np.uint8)).resize((D, D), Image.BICUBIC), np.float32)/255
    sp = (rng.random((D, D)) > 0.10).astype(np.float32)
    sp = np.asarray(Image.fromarray((sp*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)), np.float32)/255
    al = np.asarray(st.split()[3], np.float32) * lo * (0.35 + 0.65*sp) * 0.86
    st.putalpha(Image.fromarray(al.clip(0, 255).astype(np.uint8)))
    return st

def ticket(headline, logo):
    w, h = 470*S, 760*S; pad = 34*S
    t = paper_texture(w, h).convert('RGBA'); d = ImageDraw.Draw(t)
    y = 30*S
    hdr = F(CB, 17*S); sm = F(CR, 16*S)
    d.text((pad, y), 'TRIPNERD  FAN EXPERIENCES', font=hdr, fill=INK); y += 27*S
    d.text((pad, y), 'LOUISVILLE · SAT MAY 1 2027', font=sm, fill=INK); y += 25*S
    d.text((pad, y), 'SECTION: TRIPNERD', font=hdr, fill=INK); y += 34*S
    def dash(yy):
        x = pad
        while x < w - pad: d.line([(x, yy), (min(x+9*S, w-pad), yy)], fill=INK, width=2*S); x += 15*S
    dash(y); y += 22*S
    hf = F(CB, 36*S)
    for line in headline:
        while d.textlength(line, font=hf) > w - 2*pad: hf = F(CB, hf.size - 1)
    for line in headline:
        d.text((pad, y), line, font=hf, fill=INK); y += int(hf.size*1.38)
    y += 6*S; dash(y); y += 24*S
    rows = [('SEATS', True, 'BOOKED'), ('HOTEL', True, 'BOOKED'), ('RIDES', True, 'BOOKED'), ('FOOD + DRINK', False, 'INCLUDED')]
    lf = F(CR, 18*S); vf = F(CB, 18*S)
    for lab, tick, val in rows:
        d.text((pad, y), lab, font=lf, fill=INK)
        vw = d.textlength(val, font=vf); vx = w - pad - vw
        if tick:
            checkmark(d, vx - 26*S, y + 2*S, 16*S, 3*S); left_end = vx - 34*S
        else:
            left_end = vx - 10*S
        x = pad + d.textlength(lab, font=lf) + 8*S
        while x < left_end - 4*S: d.ellipse((x, y + 15*S, x + 2.6*S, y + 17.6*S), fill=INK); x += 8*S
        d.text((vx, y), val, font=vf, fill=INK); y += 34*S
    y += 10*S
    # perforation: tear line between body and stub
    x = 0
    while x < w: d.ellipse((x, y - 3*S, x + 6*S, y + 3*S), fill=(0, 0, 0, 0)); x += 14*S
    y += 18*S
    st = stamp(logo, 150*S)
    t.alpha_composite(st, (int(w/2 - st.width/2), int(y)))
    y += st.height + 12*S
    ff = F(CB, 17*S); foot = 'TALK TO A NERD · TRIPNERD.COM'
    d.text(((w - d.textlength(foot, font=ff))/2, y), foot, font=ff, fill=INK); y += 40*S
    t = t.crop((0, 0, w, int(y)))
    t.putalpha(torn_mask(t.width, t.height, 14*S)) if True else None
    # re-punch perforation holes into alpha
    return t

def polaroid(photo, label):
    pw = 300*S; inner = pw - 2*16*S
    sq = photo.resize((inner, inner), Image.LANCZOS)
    p = Image.new('RGBA', (pw, pw + 58*S), (250, 249, 245, 255))
    p.paste(grade(sq, 1.06, 1.04, 1.03), (16*S, 16*S))
    d = ImageDraw.Draw(p); hf = F(HAND, 40*S)
    d.text((24*S, inner + 16*S + 4*S), label, font=hf, fill=(30, 40, 90))
    return p

def logo_layer(logo, width):
    a = logo.crop(logo.getbbox()); return a.resize((width, round(a.height*width/a.width)), Image.LANCZOS)

def build(spec):
    src = grade(load(spec['photo']), *spec.get('grade', (1.10, 1.06, 1.02)))
    base = cover(src, spec['crop']).convert('RGBA')
    logo = Image.open(os.path.join(SRC, 'logo.png')).convert('RGBA')
    tk = ticket(spec['headline'], logo)
    box_t = paste_rot(base, tk, spec['ticket'][0]*S, spec['ticket'][1]*S, spec['ticket'][2])
    pol_src = load('IMG_1901.JPG').crop((100, 700, 1440, 2040))
    pol = polaroid(pol_src, 'Ours:')
    box_p = paste_rot(base, pol, spec['polaroid'][0]*S, spec['polaroid'][1]*S, spec['polaroid'][2], shadow=(10, 110, (4, 7)))
    lg = logo_layer(logo, 250*S)
    sh, pad = shadow_of(lg, 10*S, 90, (0, 3*S)); base.alpha_composite(sh, (60*S - pad, 52*S - pad)); base.alpha_composite(lg, (60*S, 52*S))
    out = base.convert('RGB').resize((W, H), Image.LANCZOS)
    out.save(os.path.join(OUT, spec['name'] + '.png'), optimize=True)
    print(spec['name'], 'ticket box', [v//S for v in box_t], 'polaroid box', [v//S for v in box_p])

SPECS = [
 dict(name='TN-DERBY-01-everyones-filming-it', photo='TN_2026-05-02_kentucky-derby_P050.jpg', crop=(0, 0, 1229, 1536),
      headline=["EVERYONE'S FILMING IT.", "YOU'RE LIVING IT."], ticket=(810, 360, -4), polaroid=(345, 520, 6)),
 dict(name='TN-DERBY-02-the-bubblys-cold', photo='TN_2026-05-01_kentucky-derby_P179.jpg', crop=(0, 0, 1536, 1920),
      headline=["THE BUBBLY'S COLD.", "THE PLAN'S DONE."], ticket=(650, 858, 3.5), polaroid=(190, 1110, -7)),
]
for sp in SPECS:
    if len(sys.argv) < 5 or sys.argv[4] == sp['name']: build(sp)
