#!/usr/bin/env python3
"""TripNerd hosts carousel v2 - real-photo panels (conventional retouch only, no AI, no generation).

Pipeline per panel:
  1. source = TripNerd's own camera-roll JPG (tn_assets/) or the already-scrubbed marks/clean_*.png;
  2. third-party marks scrubbed with the same conventional heal/blur used for the launch reels
     (reel03/marks_v4.py: diffusion heal, feathered Gaussian blur), here clamped to the image edge;
  3. colour: Apple ICC -> sRGB with PIL ImageCms (perceptual), exactly as static_v4/bg_lawn_srgb.png was made
     (verified: clean_IMG_2004 + its embedded "Apple Poppy Output Profile" -> sRGB reproduces bg_lawn_srgb.png,
     mean abs diff 0.21/255). IMG_1901/1907/1998 primary frames carry no embedded profile (only the HDR gain-map
     frame does), so the same-device profile from IMG_2004 (iPhone 15 Plus, iOS 26.3.1, same day) is applied;
  4. crop (faces excluded by crop; third-party marks excluded by crop where possible), then DOWNSCALE ONLY
     (LANCZOS) to the exact panel size. The composer pastes the panel 1:1.
"""
import io, hashlib, importlib.util
from pathlib import Path
import numpy as np
from PIL import Image, ImageCms, ImageDraw, ImageFilter

SP = Path("/tmp/claude-0/-home-user-Kobe/7684385f-af46-5eba-9499-dc37ceef99c7/scratchpad")
WD = SP / "static_hosts"; OUT = WD / "photos_v2"; OUT.mkdir(exist_ok=True)
_ms = importlib.util.spec_from_file_location("marks_v4", SP / "reel03/marks_v4.py")
MK = importlib.util.module_from_spec(_ms); _ms.loader.exec_module(MK)

SRC_PROFILE_FILE = SP / "tn_assets/IMG_2004.JPG"
SRGB = ImageCms.createProfile("sRGB")


def apple_profile():
    icc = Image.open(SRC_PROFILE_FILE).info["icc_profile"]
    return icc, ImageCms.ImageCmsProfile(io.BytesIO(icc))


def blur_clamped(im, box, r):
    """marks_v4._blur, but the padded region is clamped to the image so no off-canvas black bleeds in."""
    x0, y0, x1, y1 = box; pad = max(10, min(x1 - x0, y1 - y0) // 4)
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)
    region = im.crop((X0, Y0, X1, Y1)).filter(ImageFilter.GaussianBlur(r))
    im.paste(region, (X0, Y0), MK._mask(X1 - X0, Y1 - Y0, pad // 2, max(3, pad // 3)))


# third-party marks, located on 2-3x zooms (work_v2/z1907_*.png, z1901_right.png)
MARKS_1907 = [
    ("heal", (834, 1229, 866, 1264)),     # Apple logo, centre laptop lid
    ("heal", (1290, 1247, 1322, 1282)),   # Apple logo, right laptop lid
    ("heal", (1240, 1172, 1260, 1192)),   # polo logo, man (right)
    ("blur", (648, 1296, 720, 1372), 7),  # Purell label (as IMG_1901 precedent)
    ("blur", (604, 1276, 652, 1324), 4),  # venue print on the cup
    ("blur", (272, 1342, 393, 1408), 6),  # event program card
    ("blur", (1478, 1262, 1536, 1345), 4),  # print on the right-hand cup
    ("blur", (792, 1155, 852, 1177), 4),  # lettering printed on the centre woman's top
]
MARKS_1901_EXTRA = [   # on top of marks/clean_IMG_1901.png (marks_v4 list already applied there)
    ("heal", (1284, 1166, 1306, 1190)),   # polo logo, man (right)
    ("heal", (1355, 1236, 1388, 1270)),   # Apple logo, right laptop lid
]


def scrub(im, marks):
    im = im.copy()
    for m in marks:
        if m[0] == "heal":
            MK._heal(im, m[1])
        else:
            blur_clamped(im, m[1], m[2])
    return im


def cleaned(name):
    if name == "IMG_1907":
        p = OUT / "clean2_IMG_1907.png"
        if not p.exists():
            scrub(Image.open(SP / "tn_assets/IMG_1907.JPG").convert("RGB"), MARKS_1907).save(p)
        return p
    if name == "IMG_1901":
        p = OUT / "clean2_IMG_1901.png"
        if not p.exists():
            scrub(Image.open(SP / "marks/clean_IMG_1901.png").convert("RGB"), MARKS_1901_EXTRA).save(p)
        return p
    if name == "IMG_1998":      # no scrub: the only mark (venue card on its stand, y 640-1100) is cropped out
        return SP / "tn_assets/IMG_1998.JPG"
    raise KeyError(name)


def panel(name, crop, size, out_name, y_min=0, anchor="center"):
    """crop=(x0,y0,x1,y1) in source px; size=(w,h). Crop aspect is fitted to size around the crop centre
    (height adjusted), then downscaled. Returns (path, record)."""
    src_p = cleaned(name)
    im = Image.open(src_p).convert("RGB")
    icc, prof = apple_profile()
    im = ImageCms.profileToProfile(im, prof, SRGB, renderingIntent=0, outputMode="RGB")
    w, h = size; x0, y0, x1, y1 = crop
    cw = x1 - x0; ch = round(cw * h / w); cy = (y0 + y1) / 2
    y0n = int(round(cy - ch / 2)) if anchor == "center" else (y0 if anchor == "top" else y1 - ch); y0n = max(0, min(im.height - ch, y0n)); box = (x0, y0n, x1, y0n + ch)
    assert cw >= w and ch >= h, f"{name}: crop {cw}x{ch} smaller than panel {w}x{h} (would upscale)"
    assert box[1] >= y_min, f"{name}: crop top {box[1]} above the face/mark exclusion line {y_min}"
    out = im.crop(box).resize((w, h), Image.LANCZOS)
    p = OUT / out_name
    out.save(p, icc_profile=ImageCms.ImageCmsProfile(SRGB).tobytes())
    rec = {"source": str(src_p.relative_to(SP)), "source_sha256": hashlib.sha256(src_p.read_bytes()).hexdigest(),
           "colour": "Apple Poppy Output Profile (from IMG_2004, sha256 %s) -> sRGB, perceptual" % hashlib.sha256(icc).hexdigest()[:16],
           "crop_src_px": list(box), "exclusion_line_y": y_min, "anchor": anchor, "scale": round(w / cw, 4), "panel_px": [w, h], "file": p.name,
           "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
    return p, rec
