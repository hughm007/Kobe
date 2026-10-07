# Per-frame tracking for the owner's golf clip: flag, flagstick base (cup) and the real ball.
# Usage: python3 track2.py <video> <out.json>
import sys, json, numpy as np, cv2
cap = cv2.VideoCapture(sys.argv[1]); out = []
prev_ball = None
while True:
    ok, f = cap.read()
    if not ok: break
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    H, S, V = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    flag = (H > 20) & (H < 35) & (S > 140) & (V > 150)
    ys, xs = np.nonzero(flag)
    rec = {'flag': None, 'cup': None, 'ball': None}
    if len(xs) > 30:
        fx0, fy1 = int(np.percentile(xs, 2)), int(ys.max())
        rec['flag'] = [float(np.median(xs)), float(np.median(ys))]
        # flagstick: thin bright low-saturation column near the flag's hoist edge, below the flag
        white = (V > 175) & (S < 70)
        best = None
        for px in range(max(0, fx0 - 25), min(f.shape[1], fx0 + 12)):
            col = white[fy1:min(f.shape[0], fy1 + 700), max(0, px - 1):px + 2].any(1)
            # longest run starting near the flag bottom
            run = 0; bottom = None; gap = 0
            for k, v in enumerate(col):
                if v: run += 1; bottom = fy1 + k; gap = 0
                else:
                    gap += 1
                    if gap > 6 and run > 0: break
            if run > 60 and (best is None or run > best[0]): best = (run, px, bottom)
        if best:
            _, px, by = best
            # cup: dark pixels around the stick base
            win = V[by - 8:by + 18, px - 40:px + 41]
            dy, dx = np.nonzero(win < 75)
            if len(dx) > 8:
                cx = px - 40 + float(np.mean(dx)); cy = by - 8 + float(np.mean(dy))
                w = float(dx.max() - dx.min() + 1); h = float(dy.max() - dy.min() + 1)
                rec['cup'] = [cx, cy, w, h, px, by]
            else:
                rec['cup'] = [float(px), float(by + 3), 30.0, 9.0, px, by]
    # ball: small bright low-sat blob surrounded by grass, excluding the stick
    wm = ((V > 195) & (S < 55)).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(wm)
    cand = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if 8 <= a <= 300 and w <= 22 and h <= 22 and 0.5 < w / max(h, 1) < 2.0 and y > 250:
            ring = hsv[max(0, y - 10):y + h + 10, max(0, x - 10):x + w + 10]
            g = np.mean((ring[..., 0] > 30) & (ring[..., 0] < 90) & (ring[..., 1] > 60))
            if g > 0.55:
                cand.append((float(cen[i][0]), float(cen[i][1]), float(max(w, h)) / 2, a))
    if cand:
        if prev_ball:
            cand.sort(key=lambda c: (c[0] - prev_ball[0]) ** 2 + (c[1] - prev_ball[1]) ** 2)
        else:
            cand.sort(key=lambda c: -c[3])
        rec['ball'] = list(cand[0][:3]); prev_ball = cand[0]
    out.append(rec)
json.dump(out, open(sys.argv[2], 'w'))
for i in range(0, len(out), 6):
    r = out[i]
    print(i, r['flag'] and [round(v) for v in r['flag']], r['cup'] and [round(v) for v in r['cup']], r['ball'] and [round(v, 1) for v in r['ball']])
