#!/usr/bin/env python
"""Render controlled text/graphic overlays to transparent PNG.
Text is NEVER generated - it is composited from real glyphs. Safe-area enforced."""
import sys
from PIL import Image, ImageDraw, ImageFont
W, H = 1080, 1920
SAFE_X = int(W * 0.08)          # 8% side margins
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REG  = "/System/Library/Fonts/Supplemental/Arial.ttf"

def wrap(draw, text, font, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def render(out, items):
    img = Image.new("RGBA", (W, H), (0,0,0,0))
    d = ImageDraw.Draw(img)
    for it in items:
        f = ImageFont.truetype(BOLD if it.get("bold") else REG, it["size"])
        lines = wrap(d, it["text"], f, W - 2*SAFE_X)
        y = it["y"]
        for ln in lines:
            tw = d.textlength(ln, font=f)
            x = (W - tw)/2
            if it.get("chip"):
                pad = 18
                d.rounded_rectangle([x-pad, y-10, x+tw+pad, y+it["size"]+14], 10,
                                    fill=(0,0,0,190))
            d.text((x, y), ln, font=f, fill=it.get("fill", (255,255,255,255)))
            y += int(it["size"]*1.25)
    img.save(out)
    print("wrote", out)

if __name__ == "__main__":
    which = sys.argv[1]
    if which == "endcard":
        render("build/assets/txt-endcard.png", [
            {"text":"480-992-3541","size":104,"y":1010,"bold":True},
            {"text":"911 Drain LLC  ·  ROC 366870  —  look us up.","size":38,"y":1170,
             "fill":(205,205,205,255)},
            {"text":"Residential drain repair  ·  East Valley, AZ","size":32,"y":1235,
             "fill":(150,150,150,255)},
        ])
    elif which == "caption":
        render("build/assets/txt-caption.png", [
            {"text":"You can check your plumber's license yourself — state registrar.",
             "size":52,"y":1280,"bold":True,"chip":True},
        ])
    elif which == "strap":
        render("build/assets/txt-strap.png", [
            {"text":"911 Drain LLC  ·  ROC 366870  ·  480-992-3541",
             "size":40,"y":1620,"chip":True},
        ])
    elif which == "s4":
        render("build/assets/txt-s4.png", [
            {"text":"This is 911 Drain.","size":64,"y":1290,"bold":True,"chip":True},
        ])
    elif which == "s5":
        render("build/assets/txt-s5.png", [
            {"text":"Back to normal.","size":64,"y":1290,"bold":True,"chip":True},
        ])
