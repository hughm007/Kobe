# Animated group-chat opening (1080x1920, 30fps). Bubbles pop in bottom-anchored and the
# thread scrolls up like a real messaging app. Writes frames to <out_dir> and a cue list.
# Usage: python3 chat.py <out_dir>
import sys, os, math, json
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W, H, FPS, DUR = 1080, 1920, 30, 5.6
FONT = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
FONTB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
EMOJI = [p for p in ['/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf',
                     '/usr/share/fonts/noto/NotoColorEmoji.ttf'] if os.path.exists(p)]
f_msg = ImageFont.truetype(FONT, 46); f_name = ImageFont.truetype(FONT, 30)
f_title = ImageFont.truetype(FONT, 36); f_time = ImageFont.truetype(FONTB, 40)
f_small = ImageFont.truetype(FONT, 28); f_av = ImageFont.truetype(FONT, 40)
f_emo = ImageFont.truetype(EMOJI[0], 109) if EMOJI else None

BLUE, GREY, TXT, SUB = (11, 132, 254), (233, 233, 235), (0, 0, 0), (142, 142, 147)
MSGS = [  # (time, sender or None for me, text, emoji)
    (0.25, None,   "Alright boys, serious question… Augusta or Players this year?", None),
    (1.05, 'Mike', "Augusta 100%. Bucket list", '⛳'),
    (1.75, 'Dave', "Nah, Players is the move.", None),
    (2.45, 'Jake', "We said this last year and did nothing lol", None),
    (3.10, 'Sam',  "Lol facts. Lock it in.", None),
    (3.75, None,   "No more talk… let’s do it", '\U0001F4AA'),
    (4.55, None,   "TripNerd. Booked.", None),
]
MAXW = 700; PADX, PADY = 34, 22; LINE = 56

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
    d.rounded_rectangle([x0, 0, x0 + bw, bh], radius=44, fill=BLUE if me else GREY)
    # tail
    if me: d.polygon([(bw - 22, bh - 30), (bw + 14, bh), (bw - 30, bh - 6)], fill=BLUE)
    else: d.polygon([(42, bh - 30), (6, bh), (50, bh - 6)], fill=GREY)
    col = (255, 255, 255) if me else TXT
    for i, l in enumerate(lines):
        d.text((x0 + PADX, PADY + i * LINE + 2), l, font=f_msg, fill=col)
    if emo:
        e = emoji_img(emo, 46)
        if e:
            lx = x0 + PADX + f_msg.getlength(lines[-1]) + (12 if lines[-1] else 0)
            im.alpha_composite(e, (int(lx), PADY + (len(lines) - 1) * LINE + 4))
    return im

items = []
for t, s, txt, emo in MSGS:
    b = make_bubble(s, txt, emo)
    items.append(dict(t=t, s=s, img=b, h=b.height + (44 if s else 0) + 18))

TOP, BOTTOM = 330, 1700   # thread viewport

def ease(u): u = max(0, min(1, u)); return 1 - (1 - u) ** 3

def chrome(d, base):
    d.text((70, 52), '9:41', font=f_time, fill=TXT)
    for i, hgt in enumerate([14, 20, 26, 32]):
        d.rounded_rectangle([880 + i * 13, 88 - hgt, 889 + i * 13, 88], radius=2, fill=TXT)
    d.rounded_rectangle([948, 60, 1008, 88], radius=7, outline=TXT, width=3)
    d.rounded_rectangle([953, 65, 1000, 83], radius=4, fill=TXT)
    d.rectangle([1010, 69, 1014, 79], fill=TXT)
    d.text((58, 168), '‹', font=ImageFont.truetype(FONT, 90), fill=BLUE)
    for i, (ch, cx) in enumerate(zip('JMDS', [450, 505, 560, 615])):
        cy = 180 + (12 if i % 2 else 0)
        d.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=(165, 168, 176), outline=(255, 255, 255), width=4)
        d.text((cx, cy), ch, font=f_av, fill=(255, 255, 255), anchor='mm')
    title = 'Golf Boys'
    tw = f_title.getlength(title)
    d.text((540 - tw / 2 - 26, 252), title, font=f_title, fill=TXT)
    e = emoji_img('⛳', 38)
    if e: base.alpha_composite(e, (int(540 + tw / 2 - 18), 252))
    d.line([0, 318, W, 318], fill=(220, 220, 224), width=2)
    d.rounded_rectangle([140, 1760, 1030, 1846], radius=43, outline=(200, 200, 205), width=3)
    d.text((180, 1782), 'iMessage', font=f_small.font_variant(size=38), fill=(190, 190, 195))
    d.ellipse([40, 1765, 116, 1841], fill=(235, 235, 238))
    d.text((78, 1801), '+', font=f_av.font_variant(size=56), fill=(140, 140, 145), anchor='mm')
    d.rounded_rectangle([390, 1890, 690, 1900], radius=5, fill=TXT)

cues = []
nf = int(DUR * FPS)
for fi in range(nf):
    t = fi / FPS
    base = Image.new('RGBA', (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(base)
    vis = [it for it in items if t >= it['t']]
    # bottom-anchored stack; the newest bubble's height eases in so older ones slide up
    hs = []
    for it in vis:
        u = ease((t - it['t']) / 0.22)
        hs.append(it['h'] * u)
    y = BOTTOM
    pos = []
    for it, hh in reversed(list(zip(vis, hs))):
        y -= hh; pos.append((it, y))
    for it, y0 in pos:
        u = ease((t - it['t']) / 0.18); s = 0.86 + 0.14 * u
        b = it['img']
        bw, bh = int(b.width * s), int(b.height * s)
        bi = b.resize((max(1, bw), max(1, bh)), Image.LANCZOS)
        if u < 1:
            a = bi.split()[3].point(lambda p: int(p * u)); bi.putalpha(a)
        yb = int(y0 + (44 if it['s'] else 0))
        if yb + bh < TOP - 20: continue
        if it['s'] is None:
            x = W - 34 - bw
        else:
            x = 116
            d.text((140, yb - 40), it['s'], font=f_name, fill=SUB)
            cy = yb + bh - 34
            d.ellipse([28, cy - 34, 96, cy + 34], fill=(165, 168, 176))
            d.text((62, cy), it['s'][0], font=f_av.font_variant(size=34), fill=(255, 255, 255), anchor='mm')
        base.alpha_composite(bi, (int(x), yb))
        if it is items[-1] and t > it['t'] + 0.45:
            d.text((W - 40, yb + bh + 8), 'Delivered', font=f_small, fill=SUB, anchor='ra')
    # mask out anything scrolled under the header
    d.rectangle([0, 0, W, 318], fill=(250, 250, 252))
    chrome(d, base)
    base.convert('RGB').save(os.path.join(OUT, f'{fi + 1:04d}.png'))
for it in items:
    cues.append({'t': it['t'], 'me': it['s'] is None})
json.dump(cues, open(os.path.join(OUT, 'cues.json'), 'w'))
print('frames', nf)
