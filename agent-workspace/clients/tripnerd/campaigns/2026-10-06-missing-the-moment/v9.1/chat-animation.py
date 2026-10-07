# Animated group-chat opening (1080x1920, 30fps). Typing indicators, then bubbles pop in
# top-anchored under the header, as a short thread does in a real messaging app. Every piece of text
# sits inside the platform safe band (15-70% of frame height); no platform wordmarks or status-bar time.
# Writes frames to <out_dir> and a cue list.
# Usage: python3 chat.py <out_dir>
import sys, os, math, json
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W, H, FPS, DUR = 1080, 1920, 30, 6.7
FONT = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
FONTB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
EMOJI = [p for p in ['/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf',
                     '/usr/share/fonts/noto/NotoColorEmoji.ttf'] if os.path.exists(p)]
f_msg = ImageFont.truetype(FONT, 42); f_name = ImageFont.truetype(FONT, 30)
f_title = ImageFont.truetype(FONT, 36); f_time = ImageFont.truetype(FONTB, 40)
f_small = ImageFont.truetype(FONT, 28); f_av = ImageFont.truetype(FONT, 40)
f_emo = ImageFont.truetype(EMOJI[0], 109) if EMOJI else None

BLUE, GREY, TXT, SUB = (11, 132, 254), (233, 233, 235), (0, 0, 0), (142, 142, 147)
MSGS = [  # (time, sender or None for me, text, emoji, typing-indicator start)
    (0.15, None,   "Alright, serious question… are we actually doing Augusta this year?", None, None),
    (1.50, 'Jess', "Augusta 100%. Bucket list", '⛳', 0.85),
    (2.55, 'Kate', "We said this last year and did nothing lol", None, 1.95),
    (3.65, 'Jess', "Lol facts. Lock it in.", None, 3.10),
    (4.75, None,   "No more talk… let’s do it", '\U0001F4AA', None),
    (5.90, None,   "TripNerd. Booked.", None, None),
]
MAXW = 800; PADX, PADY = 34, 20; LINE = 52; NAMEH = 36; GAP = 14

def emoji_img(ch, size):
    if not f_emo: return None
    im = Image.new('RGBA', (140, 140), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((0, 0), ch, font=f_emo, embedded_color=True)
    bb = im.getbbox(); im = im.crop(bb) if bb else im
    return im.resize((size, int(size * im.height / im.width)), Image.LANCZOS)

def wrap(text):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if f_msg.getlength(t) <= MAXW - 2 * PADX - 10: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def make_bubble(sender, text, emo):
    lines = wrap(text)
    ew = 50 if emo else 0
    tw = max(f_msg.getlength(l) for l in lines)
    if emo and f_msg.getlength(lines[-1]) + ew + 12 > MAXW - 2 * PADX: lines.append(''); tw = max(tw, ew)
    bw = int(min(MAXW, max(tw, f_msg.getlength(lines[-1]) + (ew + 12 if emo else 0)) + 2 * PADX))
    bh = int(len(lines) * LINE + 2 * PADY)
    me = sender is None
    im = Image.new('RGBA', (bw + 20, bh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    x0 = 0 if me else 20
    d.rounded_rectangle([x0, 0, x0 + bw, bh], radius=40, fill=BLUE if me else GREY)
    # tail
    if me: d.polygon([(bw - 22, bh - 30), (bw + 14, bh), (bw - 30, bh - 6)], fill=BLUE)
    else: d.polygon([(42, bh - 30), (6, bh), (50, bh - 6)], fill=GREY)
    col = (255, 255, 255) if me else TXT
    for i, l in enumerate(lines):
        d.text((x0 + PADX, PADY + i * LINE + 2), l, font=f_msg, fill=col)
    if emo:
        e = emoji_img(emo, 42)
        if e:
            lx = x0 + PADX + f_msg.getlength(lines[-1]) + (12 if lines[-1] else 0)
            im.alpha_composite(e, (int(lx), PADY + (len(lines) - 1) * LINE + 4))
    return im

def typing_bubble(phase):
    im = Image.new('RGBA', (170, 92), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([20, 0, 170, 92], radius=44, fill=GREY)
    d.ellipse([8, 70, 26, 88], fill=GREY); d.ellipse([0, 86, 8, 94], fill=GREY)
    for k in range(3):
        a = 0.35 + 0.65 * max(0.0, math.sin(2 * math.pi * (phase - k * 0.18)))
        c = int(142 + (60 - 142) * a)
        cx = 62 + k * 34
        d.ellipse([cx - 10, 36, cx + 10, 56], fill=(c, c, c + 4))
    return im

items = []
for t, s, txt, emo, ts in MSGS:
    b = make_bubble(s, txt, emo)
    items.append(dict(t=t, s=s, img=b, ts=ts, h=b.height + (NAMEH if s else 0) + GAP, th=92 + NAMEH + GAP))

TOP = 470                 # thread starts under the header; safe band is 288-1344 px

def ease(u): u = max(0, min(1, u)); return 1 - (1 - u) ** 3

def chrome(d, base):
    d.rectangle([0, 0, W, 446], fill=(247, 247, 249))
    for i, hgt in enumerate([14, 20, 26, 32]):          # status icons only, no text
        d.rounded_rectangle([880 + i * 13, 88 - hgt, 889 + i * 13, 88], radius=2, fill=TXT)
    d.rounded_rectangle([948, 60, 1008, 88], radius=7, outline=TXT, width=3)
    d.rounded_rectangle([953, 65, 1000, 83], radius=4, fill=TXT)
    d.rectangle([1010, 69, 1014, 79], fill=TXT)
    d.line([(80, 300), (56, 330), (80, 360)], fill=BLUE, width=7, joint='curve')   # back chevron
    for ch, cx in zip('JK', [508, 572]):
        cy = 330
        d.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=(165, 168, 176), outline=(255, 255, 255), width=4)
        d.text((cx, cy), ch, font=f_av, fill=(255, 255, 255), anchor='mm')
    title = 'Golf Crew'
    tw = f_title.getlength(title)
    d.text((540 - tw / 2 - 22, 384), title, font=f_title, fill=TXT)
    e = emoji_img('⛳', 36)
    if e: base.alpha_composite(e, (int(540 + tw / 2 - 14), 384))
    d.line([0, 446, W, 446], fill=(220, 220, 224), width=2)
    d.rounded_rectangle([140, 1760, 1030, 1846], radius=43, outline=(200, 200, 205), width=3)   # compose field, no placeholder
    d.ellipse([40, 1765, 116, 1841], fill=(235, 235, 238))
    d.line([(78, 1785), (78, 1821)], fill=(140, 140, 145), width=5); d.line([(60, 1803), (96, 1803)], fill=(140, 140, 145), width=5)
    d.rounded_rectangle([390, 1890, 690, 1900], radius=5, fill=TXT)

cues = []
nf = int(DUR * FPS)
for fi in range(nf):
    t = fi / FPS
    base = Image.new('RGBA', (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(base)
    vis = [it for it in items if t >= it['t'] or (it['ts'] is not None and t >= it['ts'])]
    # top-anchored stack; slots ease in (typing -> message) so the newest line grows in at the bottom
    hs = []
    for it in vis:
        if t >= it['t']:
            base_h = it['th'] if it['ts'] is not None else 0
            hs.append(base_h + (it['h'] - base_h) * ease((t - it['t']) / 0.22))
        else:
            hs.append(it['th'] * ease((t - it['ts']) / 0.2))
    y = TOP
    pos = []
    for it, hh in zip(vis, hs):
        pos.append((it, y)); y += hh
    for it, y0 in pos:
        if t < it['t']:   # typing indicator with the sender's avatar
            u = ease((t - it['ts']) / 0.18)
            tb = typing_bubble((t - it['ts']) / 0.9)
            a = tb.split()[3].point(lambda p: int(p * u)); tb.putalpha(a)
            yb = int(y0 + NAMEH)
            if True:
                cy = yb + tb.height - 34
                d.ellipse([28, cy - 34, 96, cy + 34], fill=(165, 168, 176))
                d.text((62, cy), it['s'][0], font=f_av.font_variant(size=34), fill=(255, 255, 255), anchor='mm')
                base.alpha_composite(tb, (96, yb))
            continue
        u = ease((t - it['t']) / 0.18); s = 0.86 + 0.14 * u
        b = it['img']
        bw, bh = int(b.width * s), int(b.height * s)
        bi = b.resize((max(1, bw), max(1, bh)), Image.LANCZOS)
        if u < 1:
            a = bi.split()[3].point(lambda p: int(p * u)); bi.putalpha(a)
        yb = int(y0 + (NAMEH if it['s'] else 0))
        if it['s'] is None:
            x = W - 34 - bw
        else:
            x = 116
            d.text((140, yb - 34), it['s'], font=f_name, fill=SUB)
            cy = yb + bh - 34
            d.ellipse([28, cy - 34, 96, cy + 34], fill=(165, 168, 176))
            d.text((62, cy), it['s'][0], font=f_av.font_variant(size=34), fill=(255, 255, 255), anchor='mm')
        base.alpha_composite(bi, (int(x), yb))
        if it is items[-1] and t > it['t'] + 0.45:
            d.text((W - 40, yb + bh + 6), 'Delivered', font=f_small, fill=SUB, anchor='ra')
    chrome(d, base)
    base.convert('RGB').save(os.path.join(OUT, f'{fi + 1:04d}.png'))
for it in items:
    cues.append({'t': it['t'], 'me': it['s'] is None})
json.dump(cues, open(os.path.join(OUT, 'cues.json'), 'w'))
print('frames', nf)
