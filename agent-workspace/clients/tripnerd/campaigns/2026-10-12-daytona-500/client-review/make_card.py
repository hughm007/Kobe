"""Crisp TripNerd card face (white, stacked lockup as printed on the real lanyard card).
Mascot head: original logo file pixels, unaltered. Wordmark + 'FAN EXPERIENCES': original logo
pixels with their white fill recoloured navy #202838 (APPROVER decision, 2026-10-16), matching the real card."""
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
D = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/'
LOGO = Image.open(D + 'tn/brand-assets/tripnerd-logo-colour-1633x601.png').convert('RGBA')
HR = 4                                   # texture px per geometry px
TEX_W, TEX_H, TEX_TOP = 405, 540, 220    # same geometry as build_card.py
W, H, T = TEX_W * HR, TEX_H * HR, TEX_TOP * HR
NAVY = (0x20, 0x28, 0x38)
PAPER = (246, 245, 241)


def bbox(im):
    return im.getbbox()


head = LOGO.crop((0, 0, 520, 601)); head = head.crop(bbox(head))
word_all = LOGO.crop((540, 0, 1633, 601)); word_all = word_all.crop(bbox(word_all))
a = np.array(word_all)
# recolour the white fill to navy, keep alpha (anti-aliasing) exactly
a[..., :3] = NAVY
word_all = Image.fromarray(a)
# split wordmark from 'FAN EXPERIENCES' at the widest empty row band
alpha = a[..., 3]; rows = np.where(alpha.max(1) > 10)[0]
gaps = [(rows[i], rows[i + 1]) for i in range(len(rows) - 1) if rows[i + 1] - rows[i] > 8]
g = max(gaps, key=lambda p: p[1] - p[0])
word = word_all.crop((0, 0, word_all.width, g[0] + 1)); word = word.crop(bbox(word))
fan = word_all.crop((0, g[1], word_all.width, word_all.height)); fan = fan.crop(bbox(fan))

card = Image.new('RGBA', (W, T + H), (0, 0, 0, 0))
d = ImageDraw.Draw(card)
r = 22 * HR
d.rounded_rectangle([0, T, W - 1, T + H - 1], r, fill=PAPER + (255,))
# subtle edge so the card reads against bright backgrounds
d.rounded_rectangle([0, T, W - 1, T + H - 1], r, outline=(214, 212, 205, 255), width=2 * HR)
# slot punched near the top edge, where the clip goes through
sw, sh = 70 * HR, 12 * HR
d.rounded_rectangle([W // 2 - sw // 2, T + 18 * HR, W // 2 + sw // 2, T + 18 * HR + sh], sh // 2, fill=(205, 203, 196, 255))
# lockup positions measured from the real card (relative to card width/height)
def paste(im, width_frac, top_frac):
    w = int(W * width_frac); h = int(im.height * w / im.width)
    im2 = im.resize((w, h), Image.LANCZOS)
    card.alpha_composite(im2, ((W - w) // 2, T + int(H * top_frac)))
    return h
paste(head, 0.31, 0.20)
paste(word, 0.82, 0.50)
paste(fan, 0.43, 0.665)
# black plastic lanyard clip above the card (drawn, unbranded)
cx = W // 2; cw = 46 * HR
d.rounded_rectangle([cx - cw // 2, T - 120 * HR, cx + cw // 2, T + 30 * HR], 10 * HR, fill=(22, 22, 24, 255))
d.rounded_rectangle([cx - 14 * HR, T - 112 * HR, cx + 14 * HR, T - 70 * HR], 6 * HR, fill=(60, 60, 64, 255))
d.rectangle([cx - 4 * HR, T - 70 * HR, cx + 4 * HR, T + 22 * HR], fill=(45, 45, 48, 255))
card.save(D + 'card/card_face_hr.png')
card.resize((W // 4, (T + H) // 4), Image.LANCZOS).save(D + 'card/card_face_preview.png')
print(card.size, 'gap', g)
