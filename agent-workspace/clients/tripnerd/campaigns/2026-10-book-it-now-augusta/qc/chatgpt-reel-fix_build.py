#!/usr/bin/env python3
"""TripNerd Augusta Reel (ChatGPT cut) -> fixed version, real footage only.
Keeps the original's real shots and its look; replaces the two AI-looking shots and the risky lines.
  0.00-2.60  ORIGINAL: real dusk-lawn clip + "Augusta is the bucket-list moment."
  2.60-2.90  dissolve
  2.90-5.60  REAL TripNerd check-in table (cleaned IMG_1907, logo cloth) + "Planning it shouldn't be the hard part."   [was: AI-looking house]
  5.60-10.60 REAL fence-and-fairway view (P026) + list: Private executive home / Daily hospitality / Food & drink included / Hosted by our Nerds   [was: AI-looking veranda; Course access + Concierge support removed]
 10.60-12.95 ORIGINAL: real V25 veranda video + "Bring your people. / Enjoy the moment."
 12.95-13.25 dissolve
 13.25-15.00 End card rebuilt in the original's style over blurred real V25: "Plan Augusta week with TripNerd." / DM "AUGUSTA" / @tripnerd / independence line   [was: "Let TripNerd handle the details."]
Audio: silent, same as the original (music + human VO to be added). Stills: downscale only, push <= 1.06."""
import subprocess, sys, json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter

D = Path(__file__).resolve().parent; SP = D.parent
W, H, FPS, DUR = 1080, 1920, 30, 15.0
N = int(DUR * FPS)
MB = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"; MS = "/usr/share/fonts/truetype/montserrat/Montserrat-SemiBold.ttf"
F = lambda p, s: ImageFont.truetype(p, s)
NAVY_BOX = (16, 42, 74); CHECK = (74, 144, 226); PLATE = (78, 140, 222); NAVY_TXT = (16, 36, 66)
LOGO = Image.open(SP / "brand/tripnerd-logo-colour-1633x601.png").convert("RGBA")

def load_orig():
    od = D / "orig_frames"; od.mkdir(exist_ok=True)
    if not (od / "o0449.png").exists():
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(D / "src.mp4"), "-vsync", "0", str(od / "o%04d.png")], check=True)
    return lambda n: Image.open(od / f"o{n+1:04d}.png").convert("RGB")
orig = load_orig()

def still916(path, x0):
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    cw = int(round(im.height * 9 / 16)); c = im.crop((x0, 0, x0 + cw, im.height)); assert c.width >= W
    return c
def push(base, u, z1=1.06, focus=(0.5, 0.5)):
    z = 1 + (z1 - 1) * u; bw, bh = base.size; cw, ch = bw / z, bh / z
    x0 = min(max(focus[0] * bw - cw / 2, 0), bw - cw); y0 = min(max(focus[1] * bh - ch / 2, 0), bh - ch)
    return base.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + cw, y0 + ch))

TABLE = still916(SP / "static_hosts/photos_v3/clean2_IMG_1907.png", 0)
VIEW = still916(SP / "augusta_scan/p2026/TN_2026-04-09_masters-week_P026.jpg", 192)

def shadow_text(im, xy, text, font, fill=(255, 255, 255), anchor="ma", alpha=1.0, spacing=8):
    """White text with the original's soft drop shadow."""
    lay = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.multiline_text((xy[0] + 3, xy[1] + 4), text, font=font, fill=(0, 0, 0, int(150 * alpha)), anchor=anchor, align="center", spacing=spacing)
    lay = lay.filter(ImageFilter.GaussianBlur(6))
    ImageDraw.Draw(lay).multiline_text(xy, text, font=font, fill=fill + (int(255 * alpha),), anchor=anchor, align="center", spacing=spacing)
    im.alpha_composite(lay)

def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)

def seg_table(t):
    u = (t - 2.60) / (5.60 - 2.60); im = push(TABLE, u, 1.06, (0.35, 0.72)).convert("RGBA")
    a = ease((t - 3.00) / 0.3)
    if a > 0:
        sc = Image.new("L", im.size, 0); ImageDraw.Draw(sc).rounded_rectangle([40, 420, W - 40, 650], 60, fill=int(130 * a))
        sc = sc.filter(ImageFilter.GaussianBlur(40)); im.alpha_composite(Image.merge("RGBA", (*[Image.new("L", im.size, 0)] * 3, sc)))
        shadow_text(im, (W // 2, 470), "Planning it shouldn't\nbe the hard part.", F(MB, 66), alpha=a)
    return im.convert("RGB")

ITEMS = [("Private executive home", 6.35), ("Daily hospitality", 7.25), ("Food & drink included", 8.15), ("Hosted by our Nerds", 9.05)]
def seg_list(t):
    u = (t - 5.60) / 5.0; im = push(VIEW, u, 1.06, (0.5, 0.55)).convert("RGBA")
    a = ease((t - 5.70) / 0.35)
    if a > 0:
        box = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(box)
        d.rounded_rectangle([70, 340, 1010, 1010], 34, fill=NAVY_BOX + (int(205 * a),))
        d.text((132, 400), "With TripNerd:", font=F(MB, 64), fill=(255, 255, 255, int(255 * a))); im.alpha_composite(box)
        for i, (txt, t0) in enumerate(ITEMS):
            b = ease((t - t0) / 0.3)
            if b <= 0: continue
            y = 560 + i * 120 + int(14 * (1 - b))
            lay = Image.new("RGBA", im.size, (0, 0, 0, 0)); dl = ImageDraw.Draw(lay)
            dl.ellipse([132, y - 4, 192, y + 56], fill=CHECK + (int(255 * b),))
            dl.line([(146, y + 26), (158, y + 39), (179, y + 13)], fill=(255, 255, 255, int(255 * b)), width=7, joint="curve")
            dl.text((214, y - 2), txt, font=F(MS, 54), fill=(255, 255, 255, int(255 * b)))
            im.alpha_composite(lay)
    return im.convert("RGB")

def v25_frames():
    vd = D / "v25_frames"; vd.mkdir(exist_ok=True)
    if not (vd / "v0001.png").exists():
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(SP / "augusta_scan/p2026/TN_2026-04-11_masters-week_V25.mp4"),
                        "-vf", "scale=1080:1920:flags=lanczos", str(vd / "v%04d.png")], check=True)
    return sorted(vd.glob("v*.png"))
V25 = v25_frames()

def end_bg(t):
    k = min(len(V25) - 1, int((t - 12.95) * FPS) + 50)                    # V25 from ~1.7 s on, same scene the original blurs
    return Image.open(V25[k]).convert("RGB").filter(ImageFilter.GaussianBlur(22))
def endcard(t):
    im = end_bg(t).convert("RGBA")
    dk = Image.new("RGBA", im.size, (0, 0, 0, 60)); im.alpha_composite(dk)
    shadow_text(im, (W // 2, 330), "Plan Augusta week\nwith TripNerd.", F(MB, 74), spacing=10)
    pl = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(pl)
    d.rounded_rectangle([160, 580, 920, 1100], 40, fill=PLATE + (245,)); im.alpha_composite(pl)
    lw = 560; lg = LOGO.resize((lw, int(LOGO.height * lw / LOGO.width)), Image.LANCZOS); im.alpha_composite(lg, ((W - lw) // 2, 640))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([215, 880, 865, 985], 52, fill=(255, 255, 255, 255))
    d.text((W // 2, 933), "DM “AUGUSTA”", font=F(MB, 46), fill=NAVY_TXT + (255,), anchor="mm")
    d.text((W // 2, 1045), "@tripnerd", font=F(MS, 40), fill=(255, 255, 255, 255), anchor="mm")
    shadow_text(im, (W // 2, 1150), "TripNerd is an independent travel company,\nnot affiliated with Augusta National or the tournament.", F(MS, 28), spacing=6)
    return im.convert("RGB")

def frame(n):
    t = n / FPS
    if t < 2.60: return orig(n)                                      # original's own dissolve to its house starts ~2.65 s
    if t < 2.90: return Image.blend(orig(min(n, 78)), seg_table(t), ease((t - 2.60) / 0.30))
    if t < 5.60: return seg_table(t)
    if t < 10.60: return seg_list(t)
    if t < 12.95: return orig(n)
    if t < 13.25: return Image.blend(orig(n), endcard(t), ease((t - 12.95) / 0.30))
    return endcard(t)

if __name__ == "__main__":
    fr = D / "fix_frames"; fr.mkdir(exist_ok=True)
    only = [int(x) for x in sys.argv[1:]]
    for n in (only or range(N)):
        frame(n).save(fr / f"f{n:04d}.png", compress_level=1)
    if only: sys.exit(0)
    out = D / "TN-Augusta-Reel-ChatGPT-FIXED-v1.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", str(fr / "f%04d.png"), "-i", str(D / "src.mp4"),
                    "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-b:v", "12M", "-maxrate", "14M", "-bufsize", "28M",
                    "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", "-movflags", "+faststart", str(out)], check=True)
    print(json.dumps({"out": out.name, "sha256": hashlib.sha256(out.read_bytes()).hexdigest()}))
