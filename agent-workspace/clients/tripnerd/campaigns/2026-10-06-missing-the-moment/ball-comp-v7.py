# v7 ball: CG golf ball on the broadcast-telephoto plate (no plate ball to paint out).
# Usage: python3 ball_comp2.py <frames_dir> <out_dir> <hole_x> <hole_y> <r_at_hole>
# 30 fps, 1080x1920. Lands ~3 m past the pin, small check hop, pauses, spins back toward
# the cup, stops ~1 m (~3.4 ft) short-right of it. Ball is drawn every frame once it enters.
import sys, os, glob, math
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

fdir, odir = sys.argv[1], sys.argv[2]
HX, HY, RH = float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
os.makedirs(odir, exist_ok=True)
frames = sorted(glob.glob(os.path.join(fdir, '*.png')))
FPS = 30.0

ENTER = (HX + 210, -40.0);       T_ENTER = 0.28
LAND1 = (HX + 150, HY - 150);     T_LAND1 = 0.62
LAND2 = (HX + 146, HY - 166);    T_LAND2 = 0.80; HOP_H = 22.0
T_BACK = 0.98                    # checks, then backspin pulls it back
STOP = (HX + 170, HY + 45);     T_STOP = 2.05

def radius_at(yg):  # telephoto: mild perspective scaling
    return float(np.clip(RH * (1 + (yg - HY) * 0.0011), RH * 0.8, RH * 1.15))

def ease_in_out(u):
    return u * u * (3 - 2 * u)

def ball_state(t):
    if t < T_ENTER: return None
    if t < T_LAND1:
        u = ((t - T_ENTER) / (T_LAND1 - T_ENTER)) ** 1.1
        x = ENTER[0] + (LAND1[0] - ENTER[0]) * u
        y = ENTER[1] + (LAND1[1] - ENTER[1]) * u
        return (x, y, LAND1[1], max(LAND1[1] - y, 0))
    if t < T_LAND2:
        u = (t - T_LAND1) / (T_LAND2 - T_LAND1)
        x = LAND1[0] + (LAND2[0] - LAND1[0]) * u
        yg = LAND1[1] + (LAND2[1] - LAND1[1]) * u
        h = HOP_H * 4 * u * (1 - u)
        return (x, yg - h, yg, h)
    if t < T_BACK:
        u = (t - T_LAND2) / (T_BACK - T_LAND2)       # tiny forward skid as it grabs
        x = LAND2[0] - 3 * u; yg = LAND2[1] - 4 * u
        return (x, yg, yg, 0.0)
    if t < T_STOP:
        u = ease_in_out((t - T_BACK) / (T_STOP - T_BACK))
        sx, sy = LAND2[0] - 3, LAND2[1] - 4
        x = sx + (STOP[0] - sx) * u; yg = sy + (STOP[1] - sy) * u
        return (x, yg, yg, 0.0)
    return (STOP[0], STOP[1], STOP[1], 0.0)

SS = 4
def render_ball(r):
    R = int(math.ceil(r * SS)) + 2
    size = 2 * R
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    c = R - 0.5
    dx, dy = (xx - c) / (r * SS), (yy - c) / (r * SS)
    d2 = dx * dx + dy * dy
    dz = np.sqrt(np.clip(1 - d2, 0, 1))
    L = np.array([-0.35, -0.7, 0.62]); L = L / np.linalg.norm(L)
    lam = np.clip(dx * L[0] + dy * L[1] + dz * L[2], 0, 1)
    shade = 0.66 + 0.34 * lam                    # overcast: soft shading
    base = np.stack([248 * shade, 248 * shade, 244 * shade], -1)
    bounce = np.clip(dy, 0, 1)[..., None] * np.array([-16, -6, -24])
    rim = (1 - dz)[..., None] * np.array([-24, -22, -20])
    col = np.clip(base + bounce + rim, 0, 255)
    alpha = np.clip((1.0 - np.sqrt(d2)) * r * SS, 0, 1)
    img = np.dstack([col, alpha * 255]).astype(np.uint8)
    return Image.fromarray(img, 'RGBA').resize((size // SS + 1, size // SS + 1), Image.LANCZOS)

def shadow(w, h, x, yg, r, height):
    lay = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(lay)
    s = 1.0 + height / 50.0
    rw, rh = 1.1 * r * s, 0.38 * r * s
    cx, cy = x + 0.1 * r, yg + 0.85 * r
    d.ellipse([cx - rw, cy - rh, cx + rw, cy + rh], fill=255)
    lay = lay.filter(ImageFilter.GaussianBlur(max(1.0, 0.45 * r * s)))
    return lay, 0.38 / (1 + height / 30.0)

rng = np.random.default_rng(7)
for i, fp in enumerate(frames):
    t = i / FPS
    out = Image.open(fp).convert('RGBA')
    st = ball_state(t)
    if st is not None:
        subs = 12 if t < T_LAND1 + 0.03 else (5 if t < T_STOP else 1)
        acc = Image.new('RGBA', out.size, (0, 0, 0, 0))
        sh = np.zeros((out.size[1], out.size[0]), np.float32)
        layers = []
        for k in range(subs):
            s2 = ball_state(t - (k / subs) * (0.5 / FPS)) or st
            x, y, yg, hg = s2
            r = radius_at(yg)
            if yg > 0:
                sl, op = shadow(out.size[0], out.size[1], x, yg, r, hg)
                sh += np.asarray(sl).astype(np.float32) / 255.0 * op / subs
            b = render_ball(r)
            layers.append((b, int(round(x - b.size[0] / 2)), int(round(y - b.size[1] / 2))))
        arr = np.asarray(out).astype(np.float32)
        arr[..., :3] *= (1 - sh[..., None])
        out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')
        for b, bx, by in layers:
            a = np.asarray(b).astype(np.float32)
            a[..., 3] /= len(layers)
            bb = Image.fromarray(a.astype(np.uint8), 'RGBA')
            if by + bb.size[1] > 0 and by < out.size[1]:
                lay = Image.new('RGBA', out.size, (0, 0, 0, 0))
                lay.paste(bb, (bx, by))  # no mask: a masked paste squares alpha
                acc = Image.alpha_composite(acc, lay)
        if len(layers) > 1:
            a = np.asarray(acc).astype(np.float32)
            a[..., 3] = np.clip(a[..., 3] * 2.2, 0, 255)   # keep the streak solid white
            acc = Image.fromarray(a.astype(np.uint8), 'RGBA')
        acc = acc.filter(ImageFilter.GaussianBlur(0.7))
        out.alpha_composite(acc)
        arr = np.asarray(out).astype(np.float32)
        x, y = st[0], st[1]
        y0, y1 = int(max(0, y - 30)), int(min(out.size[1], y + 30))
        x0, x1 = int(max(0, x - 30)), int(min(out.size[0], x + 30))
        if y1 > y0 and x1 > x0:
            arr[y0:y1, x0:x1, :3] += rng.normal(0, 2.0, (y1 - y0, x1 - x0, 1))
        out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')
    out.convert('RGB').save(os.path.join(odir, os.path.basename(fp)))
print('frames', len(frames))
