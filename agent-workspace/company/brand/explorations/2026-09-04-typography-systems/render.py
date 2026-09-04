#!/usr/bin/env python3
"""Typography-system comparison renderer — TEST-SCOPED, not a production tool.

Emits the SAME PNG + manifest contract as the canonical static composer
(skills/servicepow-static-ads/scripts/servicepow_static_compose.py) so the canonical,
unmodified servicepow_static_qc.py can gate the output. The canonical composer hardcodes one
font pair and takes no per-block family; extending it would be a proven-capability change,
so this sibling exists for the study only. Layout, sizes, colours and copy are IDENTICAL on
every page; only the fonts change. Fonts are OFL files fetched from google/fonts (see README).

usage: render.py <fontdir> <outdir>
"""
import json, hashlib, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W=H=1080; SAFE=54
PAPER=(0xFA,0xF8,0xF5); INK900=(0x12,0x16,0x1B); INK700=(0x39,0x41,0x4C); INK500=(0x5F,0x68,0x75); BLUE=(0x17,0x45,0x7A)

COPY={"eyebrow":"SERVICE POW / TYPOGRAPHY STUDY",
      "headline":"Creative systems built to perform.",
      "support":"Research, strategy, production, and measurement—connected through one deliberate operating system.",
      "cta":"BUILD WITH INTENT",
      "meta":"THE FRAME / CONTROLLED TYPE TEST"}
# identical geometry on every page: role -> (size px, y px, fill, chip)
LAYOUT=[("eyebrow",28,  97,INK500,None),
        ("headline",92,174,INK900,None),
        ("support",44, 470,INK700,None),
        ("cta",56,     712,PAPER,BLUE),
        ("meta",28,    940,INK500,None)]

SYSTEMS={
 "01-editorial-frame":{"label":"Page 1 — Editorial Frame",
   "eyebrow":("JetBrainsMono-VF.ttf",{"Weight":400}),"headline":("Fraunces-VF.ttf",{"Optical Size":92,"Weight":300,"Softness":0,"Wonky":0}),
   "support":("WorkSans-VF.ttf",{"Weight":400}),"cta":("WorkSans-VF.ttf",{"Weight":700}),"meta":("JetBrainsMono-VF.ttf",{"Weight":400})},
 "02-systematic-precision":{"label":"Page 2 — Systematic Precision",
   "eyebrow":("IBMPlexMono-Regular.ttf",{}),"headline":("IBMPlexSerif-Light.ttf",{}),
   "support":("IBMPlexSans-VF.ttf",{"Weight":400,"Width":100}),"cta":("IBMPlexSans-VF.ttf",{"Weight":600,"Width":100}),"meta":("IBMPlexMono-Regular.ttf",{})},
 "03-newsroom-frame":{"label":"Page 3 — Newsroom Frame",
   "eyebrow":("SourceCodePro-VF.ttf",{"Weight":400}),"headline":("InstrumentSerif-Regular.ttf",{}),
   "support":("SourceSans3-VF.ttf",{"Weight":400}),"cta":("SourceSans3-VF.ttf",{"Weight":700}),"meta":("SourceCodePro-VF.ttf",{"Weight":400})},
}

def lum(c):
    def f(v):
        v/=255.0; return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    r,g,b=c; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def contrast(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)

def load(fontdir,fname,size,axes):
    f=ImageFont.truetype(str(fontdir/fname),size); applied={}
    if axes:
        names=[(a["name"].decode() if isinstance(a["name"],bytes) else a["name"]) for a in f.get_variation_axes()]
        defaults=[a["default"] for a in f.get_variation_axes()]
        vals=[axes.get(n,d) for n,d in zip(names,defaults)]
        f.set_variation_by_axes(vals); applied=dict(zip(names,vals))
    return f,applied

def render(key,sysdef,fontdir,outdir):
    img=Image.new("RGB",(W,H),PAPER); d=ImageDraw.Draw(img,"RGBA")
    safe=(SAFE,SAFE,W-SAFE,H-SAFE); maxw=(safe[2]-safe[0])*0.8
    man={"placement":"feed-square","size":[W,H],"safe":list(safe),"system":sysdef["label"],"elements":[]}
    for role,size,y0,fill,chip in LAYOUT:
        fname,axes=sysdef[role]; f,applied=load(fontdir,fname,size,axes)
        words=COPY[role].split(); lines=[]; cur=""
        for w in words:
            t=(cur+" "+w).strip()
            if d.textlength(t,font=f)<=maxw: cur=t
            else: lines.append(cur); cur=w
        if cur: lines.append(cur)
        y=y0; x0=y0b=None; x1=y1=0
        for ln in lines:
            tw=d.textlength(ln,font=f); x=safe[0]
            if chip: d.rounded_rectangle([x-20,y-10,x+tw+20,y+size+12],8,fill=chip)   # radius per tokens: 8px
            d.text((x,y),ln,font=f,fill=fill)
            x0=x if x0 is None else min(x0,x); y0b=y if y0b is None else y0b
            x1=max(x1,x+tw); y1=y+size+12; y+=int(size*1.3)
        eff_bg=chip if chip else PAPER
        man["elements"].append({"role":role,"box":[int(x0),int(y0b),int(x1),int(y1)],"font_px":size,"text":COPY[role],
            "contrast":round(contrast(fill,eff_bg),2),"font":{"file":fname,"axes":applied},"lines":len(lines)})
    name=f"TEST-DISPOSABLE-servicepow-typography-{key}-feed-square-v1"
    out=outdir/f"{name}.png"; img.save(out); man["file"]=out.name
    man["sha256"]=hashlib.sha256(out.read_bytes()).hexdigest()[:16]
    (outdir/f"{name}.manifest.json").write_text(json.dumps(man,indent=1))
    print(f"composed {out.name} {W}x{H} elements={len(man['elements'])}")
    return out,sysdef["label"]

def sheet(pages,outdir):
    th=600; gap=40; lab=70; S=Image.new("RGB",(gap+len(pages)*(th+gap),th+lab+gap*2),PAPER); d=ImageDraw.Draw(S)
    lf=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf",26)  # neutral system label, not a candidate
    for i,(p,label) in enumerate(pages):
        x=gap+i*(th+gap); im=Image.open(p).resize((th,th),Image.LANCZOS); S.paste(im,(x,gap+lab))
        d.rectangle([x-1,gap+lab-1,x+th,gap+lab+th],outline=(0xE4,0xDF,0xD8))
        d.text((x,gap+18),label,font=lf,fill=INK900)
    o=outdir/"comparison-sheet.png"; S.save(o); print(f"sheet {o.name} {S.size}")

def main():
    fontdir=Path(sys.argv[1]); outdir=Path(sys.argv[2]); outdir.mkdir(parents=True,exist_ok=True)
    pages=[render(k,v,fontdir,outdir) for k,v in SYSTEMS.items()]
    sheet(pages,outdir.parent)

if __name__=="__main__": main()
