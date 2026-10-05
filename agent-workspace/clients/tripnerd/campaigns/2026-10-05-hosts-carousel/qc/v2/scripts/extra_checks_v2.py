#!/usr/bin/env python3
"""Extra machine checks for the TripNerd hosts carousel (complements servicepow_static_qc.py).

usage: extra_checks.py <exports_dir> <specs_dir> <compose.py>
For every <name>.png in exports_dir, with <name>.manifest.json beside it and
<name>.spec.json + <name>.plates.json in specs_dir:

  X1 overlap   : every pair of placed boxes (text boxes widened to their chip, logo widened to its
                 plate) is separated by >= 16 px; no text box straddles a plate edge (band/plate).
  X2 contrast  : each text block measured against the BACKGROUND PLATE BEFORE TEXT IS DRAWN
                 (plate = fitted background + logo + chips, rebuilt with the composer's own code),
                 sampled at the block's actual ink pixels. Gate: minimum >= 4.5:1.
                 The rebuild is first proven exact: re-rendering text on it must reproduce the
                 export pixel-for-pixel, and re-wrapped boxes must equal the manifest boxes.
  X3 mode      : PNG, mode RGB, no alpha channel, no transparency chunk; colour profile reported.
  X4 size      : exactly 1080x1350.
  X5 bytes     : file < 8 MB.
  X6 chip-safe : every chip/pill (not just its text) inside the safe box.
  v2 additions (2026-10-05): rebuild mirrors compose_v2 (photo panels pasted 1:1, logo.xy, block.x);
  X1 also treats every photo panel as a placed box (text >= 16 px off the photo) and checks straddling of
  photo panels; X6 now GATES the logo plate and every photo panel inside the safe box (v1 reported plates as INFO);
  X7 photo: panel pixels equal the prepared panel file (no resample in the composer), the prepared panel was
  only ever downscaled (scale <= 1), and its crop top is at/below the recorded face/mark exclusion line.
  INFO ocr     : tesseract reads each text block from the export (fill-colour mask); word match
                 against the manifest text. Informational only (glyph sanity, BC-42 support).
Exit 0 = all gated checks pass.
"""
import json, sys, shutil, subprocess, tempfile, importlib.util, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops

GAP = 16
EXP, SPECS, COMPOSE = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
spec_mod = importlib.util.spec_from_file_location("compose", COMPOSE)
C = importlib.util.module_from_spec(spec_mod); spec_mod.loader.exec_module(C)

fails, lines = [], []


def gate(name, ok, detail):
    lines.append(f"{'PASS' if ok else 'FAIL'}  {name}: {detail}")
    if not ok:
        fails.append(name)


def info(name, detail):
    lines.append(f"INFO  {name}: {detail}")


def rebuild(spec, W, H, safe):
    """Composer logic, verbatim in effect: returns (plate_before_text, full_render, blocks)."""
    plate = C.fit_bg(spec, W, H); d = ImageDraw.Draw(plate, "RGBA")
    for ph in spec.get("photos", []):
        pim = Image.open(ph["file"]).convert("RGB"); bx = ph["box"]
        r4 = 4 * ph.get("radius", 0); m = Image.new("L", (pim.width * 4, pim.height * 4), 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, m.width - 1, m.height - 1), r4, fill=255); m = m.resize(pim.size, Image.LANCZOS)
        plate.paste(pim, (bx[0], bx[1]), m)
    lg = spec.get("logo"); logo_box = None
    if lg:
        logo = Image.open(lg["file"]).convert("RGBA")
        lw = int(W * lg.get("width_frac", 0.5)); lh = int(logo.height * lw / logo.width)
        logo = logo.resize((lw, lh)); pos = lg.get("pos", "bottom-center")
        x = (W - lw) // 2 if "center" in pos else (safe[0] if "left" in pos else safe[2] - lw)
        y = safe[1] if "top" in pos else safe[3] - lh
        if "xy" in lg: x, y = lg["xy"]
        plate.paste(logo, (x, y), logo); logo_box = [x, y, x + lw, y + lh]
    blocks = []
    for b in spec["blocks"]:
        f = ImageFont.truetype(C.BOLD if b.get("bold") else C.REG, b["size"])
        words = b["text"].split(); wl = []; cur = ""
        maxw = (safe[2] - safe[0]) * 0.8
        for w in words:
            t = (cur + " " + w).strip()
            if d.textlength(t, font=f) <= maxw: cur = t
            else: wl.append(cur); cur = w
        if cur: wl.append(cur)
        y = int(H * b["y_frac"]); rows = []; chips = []
        chip_rgba = tuple(b.get("chip_fill", [0, 0, 0, 200])); chip_rgba += (255,) * (4 - len(chip_rgba))
        for ln in wl:
            tw = d.textlength(ln, font=f)
            x = (W - tw) / 2 if b.get("align", "center") == "center" else b.get("x", safe[0])
            if b.get("chip"):
                cb = [x - 20, y - 10, x + tw + 20, y + b["size"] + 12]
                rad = b.get("chip_radius", 10); rad = (cb[3] - cb[1]) // 2 if rad == "pill" else int(rad)
                d.rounded_rectangle(cb, rad, fill=chip_rgba); chips.append(cb)
            rows.append((x, y, ln, tw)); y += int(b["size"] * 1.3)
        x0 = min(r[0] for r in rows); y0 = rows[0][1]; x1 = max(r[0] + r[3] for r in rows)
        y1 = rows[-1][1] + b["size"] + 12
        blocks.append({"b": b, "font": f, "rows": rows, "chips": chips, "box": [int(x0), int(y0), int(x1), int(y1)]})
    full = plate.copy(); fd = ImageDraw.Draw(full, "RGBA")
    for bl in blocks:
        for (x, y, ln, tw) in bl["rows"]:
            fd.text((x, y), ln, font=bl["font"], fill=tuple(bl["b"].get("fill", [255, 255, 255])))
    return plate, full, blocks, logo_box


def ink_mask(bl, W, H):
    m = Image.new("L", (W, H), 0); md = ImageDraw.Draw(m)
    for (x, y, ln, tw) in bl["rows"]:
        md.text((x, y), ln, font=bl["font"], fill=255)
    return m


def sep(a, b):
    dx = max(b[0] - a[2], a[0] - b[2], 0); dy = max(b[1] - a[3], a[1] - b[3], 0)
    return dx, dy


def straddles(box, rect):
    inter = not (box[2] <= rect[0] or box[0] >= rect[2] or box[3] <= rect[1] or box[1] >= rect[3])
    inside = box[0] >= rect[0] and box[2] <= rect[2] and box[1] >= rect[1] and box[3] <= rect[3]
    return inter and not inside


def ocr_block(png, bl):
    if not shutil.which("tesseract"):
        return None
    b = bl["b"]; fill = tuple(b.get("fill", [255, 255, 255]))
    x0, y0, x1, y1 = bl["box"]; pad = 8
    crop = png.crop((max(0, x0 - pad), max(0, y0 - pad), min(png.width, x1 + pad), min(png.height, y1 + pad)))
    px = crop.load(); bw = Image.new("L", crop.size, 255); bp = bw.load()
    for j in range(crop.height):
        for i in range(crop.width):
            r, g, bb = px[i, j][:3]
            if (r - fill[0]) ** 2 + (g - fill[1]) ** 2 + (bb - fill[2]) ** 2 < 70 ** 2:
                bp[i, j] = 0
    bw = bw.resize((bw.width * 2, bw.height * 2), Image.LANCZOS)
    with tempfile.NamedTemporaryFile(suffix=".png") as tf:
        bw.save(tf.name)
        psm = "10" if len(b["text"].strip()) == 1 else ("7" if len(bl["rows"]) == 1 else "6")
        r = subprocess.run(["tesseract", tf.name, "-", "--psm", psm], capture_output=True, text=True)
    return r.stdout.strip()


def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("→", "").replace("·", "")
    return [w for w in re.sub(r"[^a-z0-9'.]+", " ", s.lower()).split() if w]


pngs = sorted(EXP.glob("*.png"))
for p in pngs:
    n = p.stem; mf = json.loads((EXP / f"{n}.manifest.json").read_text())
    spec = json.loads((SPECS / f"{n}.spec.json").read_text())
    plates = json.loads((SPECS / f"{n}.plates.json").read_text())
    im = Image.open(p); W, H = mf["size"]; safe = mf["safe"]
    # X3 / X4 / X5
    has_alpha = im.mode in ("RGBA", "LA", "PA") or "transparency" in im.info
    gate(f"X3:mode:{p.name}", im.format == "PNG" and im.mode == "RGB" and not has_alpha,
         f"format={im.format} mode={im.mode} alpha={'yes' if has_alpha else 'no'}")
    prof = im.info.get("icc_profile"); srgb = im.info.get("srgb")
    info(f"X3:colour:{p.name}", "embedded ICC profile present" if prof else
         ("sRGB chunk present" if srgb is not None else "untagged RGB PNG (renders as sRGB); all colours specified in sRGB"))
    gate(f"X4:dims:{p.name}", im.size == (1080, 1350), f"{im.size[0]}x{im.size[1]}")
    sz = p.stat().st_size
    gate(f"X5:bytes:{p.name}", sz < 8 * 1024 * 1024, f"{sz} bytes ({sz / 1048576:.3f} MB)")
    # rebuild + exactness proof
    plate, full, blocks, logo_box = rebuild(spec, W, H, safe)
    diff = ImageChops.difference(full, im.convert("RGB")).getbbox()
    gate(f"X2:rebuild-exact:{p.name}", diff is None, "re-render == export pixel-for-pixel" if diff is None else f"differs in {diff}")
    mtext = [e for e in mf["elements"] if e["role"] not in ("logo", "photo")]
    mphoto = [e for e in mf["elements"] if e["role"] == "photo"]
    boxes_ok = [bl["box"] for bl in blocks] == [e["box"] for e in mtext]
    gate(f"X2:boxes-match-manifest:{p.name}", boxes_ok, "rebuilt boxes == manifest boxes" if boxes_ok else "MISMATCH")
    # X2 contrast at ink pixels on the pre-text plate
    pl = plate.load()
    for bl, e in zip(blocks, mtext):
        fill = tuple(bl["b"].get("fill", [255, 255, 255])); m = ink_mask(bl, W, H)
        x0, y0, x1, y1 = bl["box"]; mp = m.load(); vals = []
        for yy in range(max(0, y0 - 4), min(H, y1 + 4)):
            for xx in range(max(0, x0 - 4), min(W, x1 + 4)):
                if mp[xx, yy] >= 128:
                    vals.append(C.contrast(fill, pl[xx, yy][:3]))
        vals.sort(); mn = vals[0]; md = vals[len(vals) // 2]; p05 = vals[int(len(vals) * 0.05)]
        gate(f"X2:contrast:{p.name}:{e['role']}:'{e['text'][:28]}'", mn >= 4.5,
             f"min {mn:.2f}:1, p5 {p05:.2f}, median {md:.2f} over {len(vals)} ink px (manifest says {e['contrast']})")
    # X1 overlap / spacing
    placed = []
    if logo_box:
        lp = [pp["rect"] for pp in plates["plates"] if pp["kind"] == "logo-plate"]
        placed.append(("logo" + ("+plate" if lp else ""), lp[0] if lp else logo_box))
    for bl, e in zip(blocks, mtext):
        bx = list(bl["box"])
        if bl["chips"]:
            bx = [int(min(c[0] for c in bl["chips"])), int(min(c[1] for c in bl["chips"])),
                  int(max(c[2] for c in bl["chips"])), int(max(c[3] for c in bl["chips"]))]
        placed.append((f"{e['role']}:'{e['text'][:20]}'", bx))
    for e in mphoto:
        placed.append((f"photo:{e['file'][-12:]}", e["box"]))
    worst = None
    for i in range(len(placed)):
        for j in range(i + 1, len(placed)):
            (na, a), (nb, b) = placed[i], placed[j]
            dx, dy = sep(a, b); g = max(dx, dy)
            ok = g >= GAP
            if worst is None or g < worst[0]:
                worst = (g, na, nb)
            if not ok:
                gate(f"X1:gap:{p.name}:{na}~{nb}", False, f"gap {g}px < {GAP}")
    gate(f"X1:gaps:{p.name}", not any(f.startswith(f"X1:gap:{p.name}") for f in fails),
         f"{len(placed)} boxes, floor {GAP}px; tightest pair {worst[0]}px ({worst[1]} ~ {worst[2]})")
    for bl, e in zip(blocks, mtext):
        for pp in plates["plates"]:
            if pp["kind"] in ("proof-band", "logo-plate", "photo-panel") and straddles(bl["box"], pp["rect"]):
                gate(f"X1:straddle:{p.name}:{e['role']}", False, f"box {bl['box']} straddles {pp['kind']} {pp['rect']}")
    # X6 chips inside safe box
    for bl, e in zip(blocks, mtext):
        for cb in bl["chips"]:
            ok = cb[0] >= safe[0] and cb[1] >= safe[1] and cb[2] <= safe[2] and cb[3] <= safe[3]
            gate(f"X6:chip-safe:{p.name}:{e['role']}", ok, f"chip {[int(v) for v in cb]} vs safe {safe}")
    # X6 (v2, gated): logo plate, logo and every photo panel fully inside the safe box
    for pp in plates["plates"]:
        if pp["kind"] in ("logo-plate", "photo-panel"):
            r = pp["rect"]; ok = r[0] >= safe[0] and r[1] >= safe[1] and r[2] <= safe[2] and r[3] <= safe[3]
            gate(f"X6:{pp['kind']}-safe:{p.name}", ok, f"{pp['kind']} {r} vs safe {safe}")
    if logo_box:
        ok = logo_box[0] >= safe[0] and logo_box[1] >= safe[1] and logo_box[2] <= safe[2] and logo_box[3] <= safe[3]
        gate(f"X6:logo-safe:{p.name}", ok, f"logo {logo_box} ({logo_box[2]-logo_box[0]} px wide) vs safe {safe}")
        gate(f"X6:logo-width:{p.name}", logo_box[2] - logo_box[0] >= 300, f"logo {logo_box[2]-logo_box[0]} px wide (floor 300)")
    # X7 photo panels
    pr = plates.get("photo")
    for e, ph in zip(mphoto, spec.get("photos", [])):
        bx = ph["box"]; pim = Image.open(ph["file"]).convert("RGB")
        inner = (bx[0] + 24, bx[1] + 24, bx[2] - 24, bx[3] - 24)   # away from the rounded corners
        same = ImageChops.difference(im.convert("RGB").crop(inner), pim.crop((24, 24, pim.width - 24, pim.height - 24))).getbbox() is None
        gate(f"X7:photo-1to1:{p.name}", same, "panel interior == prepared panel file pixel-for-pixel" if same else "DIFFERS (resampled or overdrawn)")
        if pr:
            gate(f"X7:photo-downscale-only:{p.name}", pr["scale"] <= 1.0, f"source crop {pr['crop_src_px']} -> {pr['panel_px']} (scale {pr['scale']})")
            gate(f"X7:photo-exclusion-line:{p.name}", pr["crop_src_px"][1] >= pr["exclusion_line_y"],
                 f"crop top y={pr['crop_src_px'][1]} >= exclusion line y={pr['exclusion_line_y']} ({pr['source']})")
    # INFO OCR
    png = im.convert("RGB"); hits = tot = 0; misses = []
    for bl, e in zip(blocks, mtext):
        o = ocr_block(png, bl)
        if o is None:
            info(f"OCR:{p.name}", "tesseract not available"); break
        want = norm(e["text"]); got = set(norm(o))
        h = sum(1 for w in want if w in got); hits += h; tot += len(want)
        if h < len(want):
            misses.append(f"{e['role']}: wanted {want} got {sorted(got)}")
    if tot:
        info(f"OCR:{p.name}", f"{hits}/{tot} manifest words read back by tesseract" + ("" if not misses else "; misses: " + " | ".join(misses)))

for l in lines:
    print(l)
print(f"\nEXTRA-CHECKS: {'PASS' if not fails else 'FAIL'} ({sum(1 for l in lines if l.startswith('PASS'))} passed, "
      f"{len(fails)} failed, {len(pngs)} exports)")
sys.exit(1 if fails else 0)
