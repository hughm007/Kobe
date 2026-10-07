# Make the owner's putt drop. The real ball's own pixels are re-positioned along a gradual break
# (cup-relative offset that eases in), the original position is filled with nearby grass, and the
# ball sinks into the cup at frame FA. Usage:
#   python3 putt.py <in.mp4> <track2.json> <out_frames_dir> <out.json> F0 FA CUP_SEED_F CUP_X CUP_Y BALL_SEED_F BALL_X BALL_Y
import sys, os, json, numpy as np, cv2
src, tj, odir, oj = sys.argv[1:5]
F0, FA = int(sys.argv[5]), int(sys.argv[6])
SF, SX, SY = int(sys.argv[7]), float(sys.argv[8]), float(sys.argv[9])
os.makedirs(odir, exist_ok=True)
cap = cv2.VideoCapture(src); frames = []
while True:
    ok, f = cap.read()
    if not ok: break
    frames.append(f)
N = len(frames); T = json.load(open(tj))

# --- cup tracking by template matching (seeded on a hand-verified frame) ---
TW, TH = 56, 26
def tmpl(f, x, y):
    return f[int(y - TH / 2):int(y + TH / 2), int(x - TW / 2):int(x + TW / 2)].copy()
cup = [None] * N; cup[SF] = (SX, SY)
for direction in (1, -1):
    tp = tmpl(frames[SF], SX, SY); px, py = SX, SY
    rng = range(SF + direction, N if direction > 0 else -1, direction)
    for i in rng:
        g = frames[i]; R = 40
        x0, y0 = int(px - TW / 2 - R), int(py - TH / 2 - R)
        win = g[max(0, y0):y0 + TH + 2 * R, max(0, x0):x0 + TW + 2 * R]
        if win.shape[0] < TH or win.shape[1] < TW: cup[i] = (px, py); continue
        res = cv2.matchTemplate(win, tp, cv2.TM_CCOEFF_NORMED)
        _, mv, _, ml = cv2.minMaxLoc(res)
        nx = max(0, x0) + ml[0] + TW / 2; ny = max(0, y0) + ml[1] + TH / 2
        if mv > 0.45: px, py = nx, ny
        cup[i] = (px, py)
        tp = tmpl(g, px, py) if mv > 0.7 else tp  # slow template refresh follows zoom
cup = np.array(cup, float)
k = 2; cup_s = np.array([cup[max(0, i - k):i + k + 1].mean(0) for i in range(N)])

# --- real ball: blob centroids from track2, outliers rejected, gaps interpolated ---
raw = np.array([t['ball'][:2] if t['ball'] else [np.nan, np.nan] for t in T][:N], float)
rr_ = np.array([t['ball'][2] if t['ball'] else np.nan for t in T][:N], float)
idx = np.arange(N)
def local_resid(i, good):
    nb = [k for k in range(i - 5, i + 6) if k != i and 0 <= k < N and good[k]]
    if len(nb) < 4: return 0.0
    px = np.polyfit(nb, raw[nb, 0], 2); py = np.polyfit(nb, raw[nb, 1], 2)
    return float(np.hypot(raw[i, 0] - np.polyval(px, i), raw[i, 1] - np.polyval(py, i)))
while True:   # drop the single worst outlier until every point sits on its local curve
    good = ~np.isnan(raw[:, 0])
    res = [(local_resid(i, good), i) for i in range(N) if good[i]]
    worst = max(res)
    if worst[0] <= 4.0: break
    raw[worst[1]] = np.nan
good = ~np.isnan(raw[:, 0])
bx = np.interp(idx, idx[good], raw[good, 0]); by = np.interp(idx, idx[good], raw[good, 1])
gr = ~np.isnan(rr_) & good
br = np.maximum(np.interp(idx, idx[gr], rr_[gr]), 4.5)
SB = int(sys.argv[10])  # (kept for CLI compatibility)

# --- new path: cup-relative offset easing in from F0 to FA ---
rel = np.stack([bx, by], 1) - cup_s
target = -rel[FA]                       # offset that lands the ball on the cup centre at FA
def smooth(u): u = np.clip(u, 0, 1); return u * u * (3 - 2 * u)
off = np.array([target * smooth((i - F0) / (FA - F0)) for i in range(N)])
newp = cup_s + rel + off

GRAY = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
def temporal_fill(img, i, x, y, r):
    """cover the real ball with the same patch of grass from a nearby frame, locally aligned"""
    rr = int(np.ceil(r + 11)); s = 2 * rr + 1; K = 35
    xi, yi = int(round(x)), int(round(y))
    tpl = GRAY[i][yi - K:yi + K + 1, xi - K:xi + K + 1]
    if tpl.shape != (2 * K + 1, 2 * K + 1): return
    yy, xx = np.mgrid[-K:K + 1, -K:K + 1]
    tmask = ((np.sqrt(xx ** 2 + ((yy - 0.3 * r) * 0.8) ** 2) > r + 9)).astype(np.uint8) * 255
    # also exclude the flagstick (thin bright column) from the alignment template
    tmask[tpl > 175] = 0
    best = None
    for dj in (-8, 8, -12, 12, -16, 16, -22, 22):
        j = i + dj
        if not (0 <= j < N): continue
        px = x - (cup_s[i][0] - cup_s[j][0]); py = y - (cup_s[i][1] - cup_s[j][1])
        if np.hypot(px - bx[j], py - by[j]) < 3 * r + 10: continue
        S = 22; x0, y0 = int(round(px)) - K - S, int(round(py)) - K - S
        win = GRAY[j][max(0, y0):y0 + 2 * (K + S) + 1, max(0, x0):x0 + 2 * (K + S) + 1]
        if win.shape[0] <= 2 * K + 1 or win.shape[1] <= 2 * K + 1: continue
        res = cv2.matchTemplate(win.astype(np.float32), tpl.astype(np.float32), cv2.TM_SQDIFF, mask=tmask)
        res[~np.isfinite(res)] = 1e18
        mn, _, ml, _ = cv2.minMaxLoc(res)
        mv = -mn / max(1, int((tmask > 0).sum()))      # higher is better
        sx = max(0, x0) + ml[0] + K; sy = max(0, y0) + ml[1] + K
        if np.hypot(sx - bx[j], sy - by[j]) < 3 * r + 6: continue
        if best is None or mv > best[0]: best = (mv, j, sx, sy)
    if best is None: return
    _, j, sx, sy = best
    ix, iy = int(round(sx)) - rr, int(round(sy)) - rr
    patch = frames[j][iy:iy + s, ix:ix + s].astype(np.float32)
    tx, ty = xi - rr, yi - rr
    dst = img[ty:ty + s, tx:tx + s].astype(np.float32)
    if patch.shape != dst.shape: return
    yy, xx = np.mgrid[0:s, 0:s] - rr
    de = np.sqrt((xx / (r + 5)) ** 2 + ((yy - 0.3 * r) / (r + 7)) ** 2)   # covers ball + contact shadow
    ring = (de > 1.2) & (de < 1.9)
    patch += (dst[ring].mean(0) - patch[ring].mean(0))
    m = np.clip((1 - de) * (r + 5) / 3.0 + 0.5, 0, 1)[..., None]
    img[ty:ty + s, tx:tx + s] = np.clip(dst * (1 - m) + patch * m, 0, 255).astype(np.uint8)

DROP = 3
outpos = []
for i, f in enumerate(frames):
    g = f.copy()
    moved = i >= F0 and np.hypot(*off[i]) > 1.0
    after = i > FA + DROP
    if moved or i >= FA:
        r = br[i]; rr = int(np.ceil(r + 3)); s = 2 * rr + 1
        ox, oy = int(round(bx[i])), int(round(by[i]))
        sprite = f[oy - rr:oy + rr + 1, ox - rr:ox + rr + 1].astype(np.float32).copy()
        temporal_fill(g, i, bx[i], by[i], r)
        if not after and sprite.shape[:2] == (s, s):
            yy, xx = np.mgrid[0:s, 0:s] - rr
            a = np.clip((r + 1.6 - np.sqrt(xx ** 2 + yy ** 2)) / 1.6, 0, 1)
            nx, ny = newp[i]
            if i > FA:  # sinking: ball drops below the near lip and fades into the dark cup
                u = (i - FA) / DROP
                ny += u * r * 1.4
                a = a * (yy < (rr - u * 2.2 * r)) * (1 - 0.85 * u)
                sprite *= (1 - 0.55 * u)
            tx, ty = int(round(nx)) - rr, int(round(ny)) - rr
            if 0 <= tx and 0 <= ty and tx + s <= g.shape[1] and ty + s <= g.shape[0]:
                dst = g[ty:ty + s, tx:tx + s].astype(np.float32)
                g[ty:ty + s, tx:tx + s] = (dst * (1 - a[..., None]) + sprite * a[..., None]).astype(np.uint8)
        outpos.append([float(newp[i][0]), float(newp[i][1])] if not after else None)
    else:
        outpos.append([float(bx[i]), float(by[i])])
    cv2.imwrite(os.path.join(odir, f'{i + 1:04d}.png'), g)
json.dump({'cup': cup_s.tolist(), 'ball_new': outpos,
           'flag': [t['flag'][0] if t['flag'] else None for t in T][:N], 'FA': FA}, open(oj, 'w'))
for i in range(F0 - 4, min(N, FA + 6), 4):
    print(i, [round(v) for v in cup_s[i]], [round(v) for v in (bx[i], by[i])], [round(v) for v in newp[i]])
print('frames', N)
