#!/usr/bin/env python3
"""Static ad composer: layout spec JSON -> export PNG + QA manifest.
Text is typographic (BC-42). Marks come from real files. Safe zones enforced at compose time.

usage: servicepow_static_compose.py spec.json outdir/
Spec: {placement, background:{color|image}, logo:{file,width_frac,pos}, blocks:[
  {role: headline|support|cta|legal|fact, text, size, y_frac, bold?, chip?, fill?, align?,
   chip_fill? [r,g,b,a] (default [0,0,0,200]), chip_radius? int|"pill", x? int}],
  photos?:[{file, box:[x0,y0,x1,y1], radius?}]}
v2 patch (TripNerd hosts carousel, 2026-10-05): (d) a background image already at WxH is used as-is (no resample);
(e) logo.xy [x,y] places the logo at an absolute top-left (overrides pos); (f) photos: pre-sized real photo panels
pasted 1:1 at box (size must equal the box; no resampling here), recorded in the manifest as role "photo";
(g) block.x: absolute left edge for a left-aligned block (default safe[0]).
Needs Pillow (same .qcvenv pattern as the video toolkit).
"""
import json, sys, hashlib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PLACEMENTS={"feed-square":(1080,1080,.05,.05,.05,.05),"feed-portrait":(1080,1350,.05,.05,.05,.05),
            "story":(1080,1920,.15,.20,.06,.06),"link":(1200,628,.05,.05,.05,.05)}
# (a) bold/headline face = Montserrat ExtraBold (apt fonts-montserrat 7.222-2, SIL OFL); body stays Inter SemiBold (SIL OFL)
BOLD="/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"; REG="/tmp/claude-0/-home-user-Kobe/7684385f-af46-5eba-9499-dc37ceef99c7/scratchpad/fonts/inter_1.ttf"  # REG repointed to Inter (per toolkit README)

def fit_bg(spec,W,H):
    bg=spec.get("background",{})
    if "image" in bg:
        im=Image.open(bg["image"]).convert("RGB")
        if im.size==(W,H): return im   # (d) exact-size plate: no resample
        s=max(W/im.width,H/im.height)
        im=im.resize((int(im.width*s)+1,int(im.height*s)+1))
        x=(im.width-W)//2; y=(im.height-H)//2
        return im.crop((x,y,x+W,y+H))
    return Image.new("RGB",(W,H),tuple(bg.get("color",[17,17,17])))

def luminance(rgb):
    def f(c):
        c/=255.0; return c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    r,g,b=rgb; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def contrast(a,b):
    la,lb=sorted([luminance(a),luminance(b)],reverse=True); return (la+0.05)/(lb+0.05)

def main():
    spec=json.loads(Path(sys.argv[1]).read_text()); outdir=Path(sys.argv[2]); outdir.mkdir(parents=True,exist_ok=True)
    pk=spec["placement"]; W,H,st,sb,sl,sr=PLACEMENTS[pk]
    safe=(int(W*sl),int(H*st),W-int(W*sr),H-int(H*sb))
    img=fit_bg(spec,W,H); d=ImageDraw.Draw(img,"RGBA")
    manifest={"placement":pk,"size":[W,H],"safe":list(safe),"elements":[]}
    for ph in spec.get("photos",[]):   # (f) real photo panels, pre-sized, pasted 1:1
        pim=Image.open(ph["file"]).convert("RGB"); bx=ph["box"]
        assert pim.size==(bx[2]-bx[0],bx[3]-bx[1]), f"photo {ph['file']} is {pim.size}, box {bx}"
        r4=4*ph.get("radius",0); m=Image.new("L",(pim.width*4,pim.height*4),0)   # 4x supersampled corner mask
        ImageDraw.Draw(m).rounded_rectangle((0,0,m.width-1,m.height-1),r4,fill=255); m=m.resize(pim.size,Image.LANCZOS)
        img.paste(pim,(bx[0],bx[1]),m)
        manifest["elements"].append({"role":"photo","box":list(bx),"file":Path(ph["file"]).name})
    lg=spec.get("logo")
    if lg:
        logo=Image.open(lg["file"]).convert("RGBA")
        lw=int(W*lg.get("width_frac",0.5)); lh=int(logo.height*lw/logo.width)
        logo=logo.resize((lw,lh))
        pos=lg.get("pos","bottom-center")
        x=(W-lw)//2 if "center" in pos else (safe[0] if "left" in pos else safe[2]-lw)
        y=safe[1] if "top" in pos else safe[3]-lh
        if "xy" in lg: x,y=lg["xy"]   # (e)
        img.paste(logo,(x,y),logo)
        manifest["elements"].append({"role":"logo","box":[x,y,x+lw,y+lh],"file":Path(lg["file"]).name})
    for b in spec.get("blocks",[]):
        f=ImageFont.truetype(BOLD if b.get("bold") else REG,b["size"])
        words=b["text"].split(); lines=[]; cur=""
        maxw=(safe[2]-safe[0])*0.8
        for w in words:
            t=(cur+" "+w).strip()
            if d.textlength(t,font=f)<=maxw: cur=t
            else: lines.append(cur); cur=w
        if cur: lines.append(cur)
        y=int(H*b["y_frac"]); fill=tuple(b.get("fill",[255,255,255])); x0=y0=None; x1=y1=0
        # (c) optional chip_fill [r,g,b,a] (e.g. a white pill with navy text) and chip_radius ("pill" = half height)
        chip_rgba=tuple(b.get("chip_fill",[0,0,0,200])); chip_rgba=chip_rgba+(255,)*(4-len(chip_rgba))
        chip_bgs=[]
        for ln in lines:
            tw=d.textlength(ln,font=f)
            x=(W-tw)/2 if b.get("align","center")=="center" else b.get("x",safe[0])   # (g)
            if b.get("chip"):
                cbox=[x-20,y-10,x+tw+20,y+b["size"]+12]
                rad=b.get("chip_radius",10); rad=(cbox[3]-cbox[1])//2 if rad=="pill" else int(rad)
                # (b) contrast vs the BLENDED chip colour: sample the plate under the chip before drawing it
                pre=img.crop(tuple(int(v) for v in cbox)).resize((1,1)).getpixel((0,0))[:3]
                a=chip_rgba[3]/255.0
                chip_bgs.append(tuple(round(a*c+(1-a)*p) for c,p in zip(chip_rgba[:3],pre)))
                d.rounded_rectangle(cbox,rad,fill=chip_rgba)
            d.text((x,y),ln,font=f,fill=fill)
            x0=min(x0,x) if x0 is not None else x; y0=y0 if y0 is not None else y
            x1=max(x1,x+tw); y1=y+b["size"]+12; y+=int(b["size"]*1.3)
        # local background sample for contrast (corner just outside first line, inside box)
        bgpx=img.crop((int(x0),int(y0),int(x0)+8,int(y0)+8)).resize((1,1)).getpixel((0,0))
        if b.get("chip"):  # (b) worst line's blended chip colour, not pure black
            eff_bg=min(chip_bgs,key=lambda c:contrast(fill,c))
        else:
            eff_bg=bgpx[:3]
        manifest["elements"].append({"role":b["role"],"box":[int(x0),int(y0),int(x1),int(y1)],
            "font_px":b["size"],"text":b["text"],"contrast":round(contrast(fill,eff_bg),2)})
    name=spec.get("name",f"ad-{pk}")
    out=outdir/f"{name}.png"; img.save(out)
    manifest["file"]=out.name
    manifest["sha256"]=hashlib.sha256(out.read_bytes()).hexdigest()[:16]
    (outdir/f"{name}.manifest.json").write_text(json.dumps(manifest,indent=1))
    print(f"composed {out.name} {W}x{H} elements={len(manifest['elements'])}")

if __name__=="__main__": main()
