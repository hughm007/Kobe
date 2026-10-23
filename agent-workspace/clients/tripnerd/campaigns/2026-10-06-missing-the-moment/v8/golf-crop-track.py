# Track the yellow flag and the white ball in a 16:9 clip; print per-frame x positions and a
# smoothed crop centre for a 9:16 window. Usage: python3 track.py <video> <out.json>
import sys, json, numpy as np, cv2
cap = cv2.VideoCapture(sys.argv[1]); rows = []
while True:
    ok, f = cap.read()
    if not ok: break
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    flag = (hsv[..., 0] > 20) & (hsv[..., 0] < 35) & (hsv[..., 1] > 140) & (hsv[..., 2] > 150)
    ys, xs = np.nonzero(flag)
    fx = float(np.median(xs)) if len(xs) > 30 else None
    # ball: small bright low-saturation blob surrounded by green (exclude bunkers: big white areas)
    white = ((hsv[..., 2] > 200) & (hsv[..., 1] < 50)).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(white)
    bx = None; best = 0
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if 6 <= a <= 400 and w < 30 and h < 30 and y > 300:
            ring = hsv[max(0, y - 12):y + h + 12, max(0, x - 12):x + w + 12]
            g = np.mean((ring[..., 0] > 30) & (ring[..., 0] < 90) & (ring[..., 1] > 60))
            if g > 0.5 and g > best: best = g; bx = float(cen[i][0])
    rows.append((fx, bx))
fxs = np.array([r[0] if r[0] is not None else np.nan for r in rows])
bxs = np.array([r[1] if r[1] is not None else np.nan for r in rows])
idx = np.arange(len(rows))
fxs = np.interp(idx, idx[~np.isnan(fxs)], fxs[~np.isnan(fxs)])
c = np.where(np.isnan(bxs), fxs, (fxs + bxs) / 2)
k = 15; cs = np.convolve(np.pad(c, k, mode='edge'), np.ones(2 * k + 1) / (2 * k + 1), 'valid')
json.dump({'flag': fxs.tolist(), 'ball': [None if np.isnan(b) else b for b in bxs], 'centre': cs.tolist()},
          open(sys.argv[2], 'w'))
for i in range(0, len(rows), 12):
    print(i, rows[i][0] and round(rows[i][0]), rows[i][1] and round(rows[i][1]), round(cs[i]))
