# Remove the two disposable vapes from P085 without generative tools.
# Mask: convex hull of each vape's teal pixels, dilated. Fill: the upright vape stands on the
# phone's top edge, so the phone part is inpainted only from phone pixels and the counter part
# only from counter pixels, split by the phone edge line fitted from the visible edge.
# The lying vape is on the napkin: Telea inpaint. Both get grain matched to the surface.
import sys, cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
im = cv2.imread(src); H, W = im.shape[:2]
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(int)
teal = (hsv[...,0] >= 68) & (hsv[...,0] <= 100) & (hsv[...,1] > 45) & (hsv[...,2] > 40)
def vape(x0, y0, x1, y1, dil):
    t = np.zeros((H, W), np.uint8); t[y0:y1, x0:x1] = teal[y0:y1, x0:x1]
    n, lab, st, _ = cv2.connectedComponentsWithStats(t)
    i = 1 + int(np.argmax(st[1:, 4]))
    m = np.zeros((H, W), np.uint8)
    cv2.fillConvexPoly(m, cv2.convexHull(cv2.findNonZero((lab == i).astype(np.uint8))), 1)
    return cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dil, dil)))
skin0 = (((hsv[...,0] <= 22) | (hsv[...,0] >= 170)) & (hsv[...,1] > 35) & (hsv[...,2] > 90))
UP = vape(588, 890, 648, 992, 11)
LY = vape(548, 1012, 650, 1118, 13)
LY[skin0] = 0
# phone top edge: first dark pixel per column; across the vape, interpolate linearly between the
# edge measured just left and just right of the mask (the edge is straight there)
gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
def edge_y(x):
    d = np.nonzero(gray[930:1005, x] < 70)[0]; return 930 + d[0]
cols = np.nonzero(UP.any(axis=0))[0]; xl, xr = cols.min() - 1, cols.max() + 1
yl = np.median([edge_y(x) for x in range(xl - 6, xl + 1)]); yr = np.median([edge_y(x) for x in range(xr, xr + 7)])
print('phone edge: (%d, %.1f) -> (%d, %.1f)' % (xl, yl, xr, yr))
yy, xx = np.mgrid[0:H, 0:W]
phone = (yy >= yl + (yr - yl) * (xx - xl) / (xr - xl)) & (yy < 1010)
res = im.copy()
near = cv2.dilate(UP, np.ones((41, 41), np.uint8)).astype(bool)
for region in (phone, ~phone):
    hole = (UP.astype(bool) | (near & ~region)).astype(np.uint8) * 255
    f = cv2.inpaint(im, hole, 7, cv2.INPAINT_TELEA)
    sel = UP.astype(bool) & region
    res[sel] = f[sel]
# lying vape: keep the arm's skin out of the fill sources
skin = ((hsv[...,0] <= 22) | (hsv[...,0] >= 170)) & (hsv[...,1] > 35) & (hsv[...,2] > 90)
skin = cv2.dilate(skin.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
nearL = cv2.dilate(LY, np.ones((41, 41), np.uint8)).astype(bool)
f = cv2.inpaint(res, ((LY > 0) | (nearL & skin)).astype(np.uint8)*255, 9, cv2.INPAINT_TELEA)
res[LY > 0] = f[LY > 0]
# grain: robust per-channel noise level of the untouched neighbourhood
M = np.maximum(UP, LY)
ring = (cv2.dilate(M, np.ones((25, 25), np.uint8)) > 0) & (M == 0) & ~teal
g = im.astype(np.float32); hp = g - cv2.GaussianBlur(g, (0, 0), 1.2)
sd = 1.4826 * np.median(np.abs(hp[ring]), axis=0)
rng = np.random.default_rng(85)
nz = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.7)
nz = (nz / nz.std())[..., None] * sd
res = np.where(M[..., None] > 0, np.clip(res + nz, 0, 255), res).astype(np.uint8)
a = cv2.GaussianBlur(M.astype(np.float32), (0, 0), 1.0)[..., None]; a = np.maximum(a, M[..., None])
res = (res * a + im * (1 - a)).round().astype(np.uint8)
np.save(out + '.mask.npy', M)
cv2.imwrite(out, res)
print('masked px', int(M.sum()), 'grain sd', sd.round(2))
