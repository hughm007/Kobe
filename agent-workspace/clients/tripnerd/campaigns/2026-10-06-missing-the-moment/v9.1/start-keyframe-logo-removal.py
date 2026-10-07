# Start keyframe: remove the composited logos from the three badge cards and the cap so the video model
# has no mark to re-paint. Each mark is filled from the surrounding card/cap fabric (normalized convolution)
# plus matched grain, keeping the card's own shading.
import cv2, numpy as np
f = cv2.imread('start.jpg'); H, W = f.shape[:2]
hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV).astype(int)
out = f.astype(np.float32).copy(); dbg = []
def fill(region, body, mark, sigma=5.0):
    x0, y0, x1, y1 = region
    roi = out[y0:y1, x0:x1]; b = body[y0:y1, x0:x1].astype(np.float32); m = mark[y0:y1, x0:x1].astype(bool)
    src = b * (~m)
    num = cv2.GaussianBlur(roi * src[..., None], (0, 0), sigma); den = cv2.GaussianBlur(src, (0, 0), sigma)[..., None]
    sm = num / np.maximum(den, 1e-3)
    weak = den[..., 0] < 0.2
    if weak.any():   # no fabric nearby: fall back to the region's median fabric colour
        sm[weak] = np.median(roi[src > 0], 0)
    resid = (roi - cv2.GaussianBlur(roi, (0, 0), 1.5))[~m & (b > 0)]
    noise = np.random.default_rng(7).normal(0, max(1.0, resid.std() * 0.8), roi.shape).astype(np.float32)
    roi[m] = np.clip(sm[m] + noise[m], 0, 255)
# --- cards: teal-navy rectangles
card = ((hsv[..., 0] >= 95) & (hsv[..., 0] <= 110) & (hsv[..., 1] > 90) & (hsv[..., 2] < 130)).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.morphologyEx(card, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)))
for k in range(1, n):
    x, y, w, h, a = st[k]
    if not (1000 < a < 6000 and 1100 < y < 1300): continue
    comp = (lab == k).astype(np.uint8)
    cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    hull = np.zeros_like(comp); cv2.drawContours(hull, [cv2.convexHull(max(cnts, key=cv2.contourArea))], -1, 1, -1)
    inner = cv2.erode(hull, np.ones((5, 5), np.uint8))
    med = np.median(f[card.astype(bool) & inner.astype(bool)], 0)
    dist = np.abs(f.astype(int) - med).sum(2)
    mark = (inner.astype(bool) & (dist > 45)).astype(np.uint8)
    mark = cv2.dilate(mark, np.ones((5, 5), np.uint8)) & inner
    body = inner.astype(bool)
    fill((x - 4, y - 4, x + w + 4, y + h + 4), body, mark.astype(bool))
    dbg.append(('card', int(x), int(y), int(w), int(h), int(mark.sum())))
# --- cap: the logo sits at the front of the crown; box it explicitly (the cap edge meets bright flowers on the right)
lx0, ly0, lx1, ly1 = 830, 892, 868, 913
capm = (hsv[..., 0] >= 104) & (hsv[..., 0] <= 125) & (hsv[..., 1] > 80) & (hsv[..., 2] < 135)
capmed = np.median(f[880:925, 800:880][capm[880:925, 800:880]], 0)
dist = np.abs(f.astype(int) - capmed).sum(2)
markc = np.zeros((H, W), np.uint8); markc[ly0:ly1, lx0:lx1] = dist[ly0:ly1, lx0:lx1] > 40
markc = cv2.dilate(markc, np.ones((5, 5), np.uint8))
markc[:, lx1 + 1:] = 0
cur = np.clip(out, 0, 255).astype(np.uint8)
srcimg = cur.copy()
hb = hsv[ly0 - 14:ly1 + 14, lx0:lx1 + 30]
bg = ((hb[..., 0] > 135) | (hb[..., 0] < 25)) & (hb[..., 1] > 50)     # pink/skin background beside the cap
srcimg[ly0 - 14:ly1 + 14, lx0:lx1 + 30][bg] = capmed.astype(np.uint8)
inp = cv2.inpaint(srcimg, (markc * 255).astype(np.uint8), 9, cv2.INPAINT_NS)
grain = np.random.default_rng(3).normal(0, 2.0, inp.shape)
sel = markc.astype(bool)
out[sel] = np.clip(inp[sel].astype(np.float32) + grain[sel], 0, 255)
dbg.append(('cap', int(markc.sum())))
cv2.imwrite('start2.png', np.clip(out, 0, 255).astype(np.uint8))
print(dbg)
a = cv2.resize(f[840:1300, 230:920], None, fx=0.8, fy=0.8); b = cv2.resize(np.clip(out, 0, 255).astype(np.uint8)[840:1300, 230:920], None, fx=0.8, fy=0.8)
cv2.imwrite('qa_keyfix.jpg', np.vstack([a, b]), [cv2.IMWRITE_JPEG_QUALITY, 88])
