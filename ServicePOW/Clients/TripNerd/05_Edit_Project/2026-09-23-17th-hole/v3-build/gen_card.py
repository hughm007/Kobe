#!/usr/bin/env python3
"""End card generator (16:9, 1920x1080) from the real logo file. Usage: gen_card.py <bg hex> <out.png> "<tagline>" "<CTA>" "<url>" [logo.png]
Tagline sits BELOW the logo; CTA is a white pill; brand blue 5896E9 or logo navy 202838 backgrounds. Written 2026-09-24 for the TripNerd hosting-spot end card fix."""
import sys
from PIL import Image, ImageDraw, ImageFont
bg = sys.argv[1]; out = sys.argv[2]; tag = sys.argv[3]; cta = sys.argv[4]; url = sys.argv[5]; logo_path = sys.argv[6] if len(sys.argv) > 6 else 'logo.png'
W, H = 1920, 1080
def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
BG = hexrgb(bg); BLUE = hexrgb('5896E9'); NAVY = hexrgb('202838'); WHITE = (255, 255, 255)
img = Image.new('RGB', (W, H), BG)
grad = Image.new('L', (1, H)); gp = grad.load()
for y in range(H): gp[0, y] = int(255 * (0.06 * y / H))
img = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), img, grad.resize((W, H))); d = ImageDraw.Draw(img)
FB = '/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf'
logo = Image.open(logo_path).convert('RGBA'); lw = 620; lh = int(logo.height * lw / logo.width); logo = logo.resize((lw, lh), Image.LANCZOS)
img.paste(logo, ((W - lw) // 2, int(H * 0.40) - lh // 2), logo)
def center(txt, y, size, fill):
    f = ImageFont.truetype(FB, size); bb = d.textbbox((0, 0), txt, font=f); d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], y), txt, font=f, fill=fill)
center(tag, int(H * 0.575), 58, WHITE)
f = ImageFont.truetype(FB, 30); bb = d.textbbox((0, 0), cta, font=f); tw = bb[2] - bb[0]; bx0 = (W - tw) // 2 - 44; by0 = int(H * 0.705)
d.rounded_rectangle([bx0, by0, bx0 + tw + 88, by0 + 84], radius=42, fill=WHITE); d.text((bx0 + 44 - bb[0], by0 + 24 - bb[1]), cta, font=f, fill=BLUE if bg.lower().lstrip('#') == '5896e9' else NAVY)
center(url, int(H * 0.83), 40, WHITE)
img.save(out); print('card', out, img.size)
