#!/usr/bin/env python3
"""TripNerd fan-experiences carousel (C03) v1 - real-photo panels. Conventional only: no AI, no generation.

Same pipeline as static_hosts/photos_v3.py (C02), reused, not re-derived:
  * sources are the already-scrubbed C02 working files (clean2_IMG_1901.png: tablecloth/laptop/polo marks
    healed) and TripNerd's own IMG_1998.JPG (no scrub: its only mark, the venue card on a stand at
    y 640-1100, is excluded by the crop's exclusion line);
  * Apple ICC (from IMG_2004, same device/day) -> sRGB, perceptual;
  * crop below the face/mark exclusion line, DOWNSCALE ONLY (LANCZOS) to the exact panel size;
  * conventional grade from static_hosts/grade/grade.py, preset chosen explicitly (no AI).
Different crops from C02 so the two carousels don't repeat the same frames four days apart.
"""
import io, hashlib, sys
from pathlib import Path
from PIL import Image, ImageCms

SP = Path("/tmp/claude-0/-home-user-Kobe/7684385f-af46-5eba-9499-dc37ceef99c7/scratchpad")
WD = SP / "static_vip"; OUT = WD / "photos_v1"; OUT.mkdir(exist_ok=True)
SRC_PROFILE_FILE = SP / "tn_assets/IMG_2004.JPG"
SRGB = ImageCms.createProfile("sRGB")
SOURCES = {"IMG_1901": SP / "static_hosts/photos_v3/clean2_IMG_1901.png",
           "IMG_1998": SP / "tn_assets/IMG_1998.JPG"}
sys.path.insert(0, str(SP / "static_hosts/grade")); import grade as G


def apple_profile():
    icc = Image.open(SRC_PROFILE_FILE).info["icc_profile"]
    return icc, ImageCms.ImageCmsProfile(io.BytesIO(icc))


def panel(name, crop, size, out_name, y_min=0, anchor="top", preset="c2"):
    """crop=(x0,y0,x1,y1) source px; size=(w,h). Crop height refitted to the panel aspect (anchored), then
    downscaled. Returns (path, record)."""
    src_p = SOURCES[name]
    im = Image.open(src_p).convert("RGB")
    icc, prof = apple_profile()
    im = ImageCms.profileToProfile(im, prof, SRGB, renderingIntent=0, outputMode="RGB")
    w, h = size; x0, y0, x1, y1 = crop
    cw = x1 - x0; ch = round(cw * h / w); cy = (y0 + y1) / 2
    y0n = int(round(cy - ch / 2)) if anchor == "center" else (y0 if anchor == "top" else y1 - ch)
    y0n = max(0, min(im.height - ch, y0n)); box = (x0, y0n, x1, y0n + ch)
    assert cw >= w and ch >= h, f"{name}: crop {cw}x{ch} smaller than panel {w}x{h} (would upscale)"
    assert box[1] >= y_min, f"{name}: crop top {box[1]} above the face/mark exclusion line {y_min}"
    out = im.crop(box).resize((w, h), Image.LANCZOS)
    out = G.grade(out, *G.PRESETS[preset])
    p = OUT / out_name
    out.save(p, icc_profile=ImageCms.ImageCmsProfile(SRGB).tobytes())
    rec = {"source": str(src_p.relative_to(SP)), "source_sha256": hashlib.sha256(src_p.read_bytes()).hexdigest(),
           "colour": "Apple Poppy Output Profile (from IMG_2004, sha256 %s) -> sRGB, perceptual" % hashlib.sha256(icc).hexdigest()[:16],
           "crop_src_px": list(box), "exclusion_line_y": y_min, "anchor": anchor, "scale": round(w / cw, 4),
           "panel_px": [w, h], "file": p.name, "sha256": hashlib.sha256(p.read_bytes()).hexdigest(),
           "grade": "conventional (static_hosts/grade/grade.py preset %s): white balance, exposure, S-curve, vibrance, unsharp mask; no AI" % preset}
    return p, rec
