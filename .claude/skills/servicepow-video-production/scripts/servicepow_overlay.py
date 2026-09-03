#!/usr/bin/env python3
"""Composited text overlays (QA gate BC-42): render a JSON spec of text items to a
transparent 1080x1920 PNG. Text is never model-generated. Spec: JSON file with
[{text,size,y,bold?,chip?,fill?[r,g,b,a]}] . Usage: servicepow_overlay.py spec.json out.png"""
import json, sys
from PIL import Image, ImageDraw, ImageFont
W,H=1080,1920; SX=int(W*0.08)
BOLD="/System/Library/Fonts/Supplemental/Arial Bold.ttf"; REG="/System/Library/Fonts/Supplemental/Arial.ttf"
def wrap(d,t,f,mw):
    ws,ls,cur=t.split(),[],""
    for w in ws:
        c=(cur+" "+w).strip()
        if d.textlength(c,font=f)<=mw: cur=c
        else: ls.append(cur); cur=w
    if cur: ls.append(cur)
    return ls
spec=json.load(open(sys.argv[1])); img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
for it in spec:
    f=ImageFont.truetype(BOLD if it.get("bold") else REG,it["size"]); y=it["y"]
    for ln in wrap(d,it["text"],f,W-2*SX):
        tw=d.textlength(ln,font=f); x=(W-tw)/2
        if it.get("chip"): d.rounded_rectangle([x-18,y-10,x+tw+18,y+it["size"]+14],10,fill=(0,0,0,190))
        d.text((x,y),ln,font=f,fill=tuple(it.get("fill",[255,255,255,255]))); y+=int(it["size"]*1.25)
img.save(sys.argv[2]); print("wrote",sys.argv[2])
