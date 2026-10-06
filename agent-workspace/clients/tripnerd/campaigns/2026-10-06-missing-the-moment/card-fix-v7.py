# Replace the flickering generated badge card with a stable clean card (real logo) every frame.
# Usage: python3 card_fix.py <in_frames_dir> <out_dir> <logo.png> <cx> <cy>
# The card is the bright-bordered quad near (cx, cy); its outline is found per frame from the
# white border (jacket is dark navy), smoothed over time, and a clean card is warped onto it.
import sys, os, glob
import numpy as np, cv2

fdir, odir, logo_p = sys.argv[1], sys.argv[2], sys.argv[3]
cx, cy = int(sys.argv[4]), int(sys.argv[5])
os.makedirs(odir, exist_ok=True)
frames = sorted(glob.glob(os.path.join(fdir, '*.png')))
R = 170  # search window half-size

def order(pts):
    pts = pts[np.argsort(pts[:, 1])]
    top = pts[:2][np.argsort(pts[:2, 0])]; bot = pts[2:][np.argsort(pts[2:, 0])]
    return np.array([top[0], top[1], bot[1], bot[0]], np.float32)  # tl tr br bl

quads = []
for fp in frames:
    im = cv2.imread(fp)
    x0, y0 = max(0, cx - R), max(0, cy - R)
    win = im[y0:cy + R, x0:cx + R]
    hsv = cv2.cvtColor(win, cv2.COLOR_BGR2HSV)
    # border: bright, low saturation
    m = ((hsv[..., 2] > 170) & (hsv[..., 1] < 60)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    best = None
    for c in cnts:
        a = cv2.contourArea(c)
        if a < 3000: continue
        if best is None or a > cv2.contourArea(best): best = c
    if best is None:
        quads.append(None); continue
    (rcx, rcy), (rw, rh), ang = cv2.minAreaRect(best)
    t = np.deg2rad(ang)
    e1 = np.array([np.cos(t), np.sin(t)]) * rw      # side of length rw
    e2 = np.array([-np.sin(t), np.cos(t)]) * rh     # side of length rh
    vl, vs = (e1, e2) if rw >= rh else (e2, e1)     # long (vertical-ish) and short axes
    if vl[1] < 0: vl = -vl                           # long axis points down
    if vs[0] < 0: vs = -vs                           # short axis points right
    c = np.array([rcx + x0, rcy + y0])
    quads.append(np.array([c - vl/2 - vs/2, c - vl/2 + vs/2, c + vl/2 + vs/2, c + vl/2 - vs/2], np.float32))

# fill gaps, then temporal smoothing
idx = [i for i, q in enumerate(quads) if q is not None]
for i in range(len(quads)):
    if quads[i] is None:
        j = min(idx, key=lambda k: abs(k - i)); quads[i] = quads[j]
Q = np.stack(quads)
K = 3
Qs = np.stack([Q[max(0, i - K // 2): i + K // 2 + 1].mean(0) for i in range(len(Q))])
Qs = Qs.mean(1, keepdims=True) + (Qs - Qs.mean(1, keepdims=True)) * 1.07

# clean card artwork: white border, navy face, real logo
CW, CH = 400, 620
card = np.zeros((CH, CW, 4), np.uint8)
card[...] = (245, 245, 245, 255)                       # BGR white border
b = 26
card[b:CH - b, b:CW - b, :3] = (0x3d, 0x28, 0x07)      # #07283d in BGR
cv2.circle(card, (CW // 2, 40), 11, (60, 60, 60, 255), -1)   # punch hole
logo = cv2.imread(logo_p, cv2.IMREAD_UNCHANGED)
ys, xs = np.nonzero(logo[..., 3] > 10)
logo = logo[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
lw = 300; lh = int(logo.shape[0] * lw / logo.shape[1])
logo = cv2.resize(logo, (lw, lh), interpolation=cv2.INTER_AREA)
ox, oy = (CW - lw) // 2, 250
a = logo[..., 3:4].astype(np.float32) / 255
card[oy:oy + lh, ox:ox + lw, :3] = (card[oy:oy + lh, ox:ox + lw, :3] * (1 - a) + logo[..., :3] * a).astype(np.uint8)
src = np.array([[0, 0], [CW, 0], [CW, CH], [0, CH]], np.float32)

for fp, q in zip(frames, Qs):
    im = cv2.imread(fp).astype(np.float32)
    H = cv2.getPerspectiveTransform(src, q)
    warp = cv2.warpPerspective(card, H, (im.shape[1], im.shape[0]), flags=cv2.INTER_LINEAR)
    al = warp[..., 3:4].astype(np.float32) / 255
    al = cv2.GaussianBlur(al, (3, 3), 0.8)[..., None]
    art = cv2.GaussianBlur(warp[..., :3].astype(np.float32), (3, 3), 0.7)
    # match local light: scale by the jacket's brightness around the card vs the first frame
    out = im * (1 - al) + art * 0.9 * al
    cv2.imwrite(os.path.join(odir, os.path.basename(fp)), np.clip(out, 0, 255).astype(np.uint8))
print('frames', len(frames), 'detected', len(idx))
