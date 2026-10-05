"""Conventional photo grade for the C02 photo panels. No AI, no generation, no content change:
white balance (white-patch, partial), exposure (gamma to a target), gentle S-curve, vibrance, unsharp mask.
Every operation is a global per-pixel tone/colour map except the unsharp mask (local sharpening)."""
import numpy as np
from PIL import Image, ImageFilter

PRESETS = {
    # name: (wb_strength, target_mean_luma, contrast, vibrance, sharpen_percent)
    "c1": (0.9, 150, 0.16, 0.12, 60),   # tablecloth cover: cleaner whites, more punch
    "c2": (0.9, 116, 0.14, 0.12, 70),   # staff table: lift the underexposure
    "c4": (0.9, 132, 0.20, 0.28, 80),  # food: remove the tungsten cast, appetising colour
}

def grade(im, wb, target, contrast, vib, sharp):
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    # 1. white balance: scale channels so the 99th-percentile highlights move toward neutral
    # reference = bright, low-saturation pixels (white tablecloths/plates), excluding clipped highlights
    flat = a.reshape(-1, 3)
    lum = flat.mean(axis=1); sat = flat.max(axis=1) - flat.min(axis=1)
    sel = (lum > np.percentile(lum, 55)) & (lum < np.percentile(lum, 98))
    cand = flat[sel]; csat = sat[sel]
    ref = cand[csat <= np.percentile(csat, 30)].mean(axis=0)
    gains = ref.mean() / np.maximum(ref, 1e-3)
    a = a * (1 + wb * (gains - 1))
    a = np.clip(a, 0, 1)
    # 2. exposure: gamma so mean luma hits the target
    luma = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])
    m = max(luma.mean(), 1e-3); t = target / 255.0
    g = np.log(t) / np.log(m)
    a = np.clip(a, 1e-6, 1) ** g
    # 3. gentle S-curve around mid-grey
    a = a + contrast * (a - 0.5) * (1 - np.abs(2 * a - 1))
    a = np.clip(a, 0, 1)
    # 4. vibrance: boost saturation more where it is low
    mx = a.max(axis=2, keepdims=True); mn = a.min(axis=2, keepdims=True)
    sat = (mx - mn)
    mean = a.mean(axis=2, keepdims=True)
    a = mean + (a - mean) * (1 + vib * (1 - sat))
    a = np.clip(a, 0, 1)
    out = Image.fromarray((a * 255 + 0.5).astype(np.uint8), "RGB")
    # 5. sharpen
    return out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=sharp, threshold=2))

if __name__ == "__main__":
    import sys
    src, dst, key = sys.argv[1:4]
    grade(Image.open(src), *PRESETS[key]).save(dst)
