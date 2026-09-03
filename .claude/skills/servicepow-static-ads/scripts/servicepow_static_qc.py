#!/usr/bin/env python3
"""Static QA battery (BC-51/52 machine parts, BC-54 diff scores, BC-55 strings).
usage: servicepow_static_qc.py --dir exports/ [--facts facts.json]
Consumes <name>.png + <name>.manifest.json pairs. Exit 0 pass / 1 fail."""
import argparse, json, sys, itertools
from pathlib import Path
from PIL import Image, ImageChops

PLACEMENTS={"feed-square":(1080,1080),"feed-portrait":(1080,1350),"story":(1080,1920),"link":(1200,628)}
FLOORS={"headline":64,"support":36,"cta":40,"legal":24,"fact":28}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--dir",required=True); ap.add_argument("--facts")
    a=ap.parse_args(); d=Path(a.dir); fails=[]; ok=[]
    def gate(n,c,det): (ok if c else fails).append(f"{'PASS' if c else 'FAIL'}  {n}: {det}")
    pairs=[(p,Path(str(p)[:-4]+".manifest.json")) for p in sorted(d.glob("*.png"))]
    facts=json.loads(Path(a.facts).read_text()) if a.facts else None
    texts={}
    for png,mf in pairs:
        if not mf.exists(): fails.append(f"FAIL  manifest:{png.name}: MISSING (hand-built comps must emit one)"); continue
        m=json.loads(mf.read_text()); im=Image.open(png)
        want=PLACEMENTS.get(m["placement"])
        gate(f"BC-51:dims:{png.name}", (im.width,im.height)==tuple(want), f"{im.width}x{im.height} vs {want}")
        gate(f"BC-51:size:{png.name}", png.stat().st_size < 8*1024*1024, f"{png.stat().st_size//1024}KB (<8MB)")
        sx0,sy0,sx1,sy1=m["safe"]; has_cta=False; roles=[]
        for e in m["elements"]:
            x0,y0,x1,y1=e["box"]; roles.append(e["role"])
            inside = x0>=sx0-1 and y0>=sy0-1 and x1<=sx1+1 and y1<=sy1+1
            gate(f"BC-52:safe:{png.name}:{e['role']}", inside, f"box {e['box']} vs safe {m['safe']}")
            if "font_px" in e:
                fl=FLOORS.get(e["role"],24)
                gate(f"BC-52:size:{png.name}:{e['role']}", e["font_px"]>=fl, f"{e['font_px']}px (floor {fl})")
                gate(f"BC-52:contrast:{png.name}:{e['role']}", e.get("contrast",0)>=4.5, f"{e.get('contrast')}:1 (>=4.5)")
            if e["role"]=="cta": has_cta=True
        gate(f"BC-53:cta-present:{png.name}", has_cta, "cta block" if has_cta else "NO CTA BLOCK")
        texts[png.name]=" ".join(e.get("text","") for e in m["elements"])
        if facts:
            t=texts[png.name]
            for s_ in facts.get("must_not_contain",[]):
                gate(f"BC-55:barred:'{s_}':{png.name}", s_.lower() not in t.lower(), "clean" if s_.lower() not in t.lower() else "PRESENT")
        # set-level facts: must_contain somewhere in the set (checked after loop)
    if facts:
        all_t=" ".join(texts.values())
        for s_ in facts.get("must_contain",[]):
            gate(f"BC-55:present:'{s_}'", s_ in all_t, "in set" if s_ in all_t else "ABSENT FROM SET")
    # BC-54 pairwise diff (rms of difference, normalized)
    ims={p.name:Image.open(p).convert("L").resize((64,64)) for p,_ in pairs if p.exists()}
    for (n1,i1),(n2,i2) in itertools.combinations(ims.items(),2):
        diff=ImageChops.difference(i1,i2); h=diff.histogram()
        rms=(sum(i*i*c for i,c in enumerate(h))/ (64*64))**0.5 / 255
        gate(f"BC-54:distinct:{n1}~{n2}", rms>0.05, f"diff={rms:.3f} ({'ok' if rms>0.05 else 'NEAR-DUPLICATE - judge'})")
    for l in ok: print(l)
    for l in fails: print(l)
    print(f"\nSTATIC-QC: {'PASS' if not fails else 'FAIL'} ({len(ok)} passed, {len(fails)} failed, {len(pairs)} exports)")
    sys.exit(1 if fails else 0)

if __name__=="__main__": main()
