"""TripNerd hospitality-suite card clip, v1 (5.0 s, 1080x1920, 30 fps).
Real media only: the TripNerd website photo, real V06 race footage on the TV, the real card and
lanyard cut from the photo. No AI generation. Classical OpenCV inpainting (Telea) fills the small
area behind the card and strap once they move away."""
import math, subprocess, json, wave, numpy as np, cv2

D = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/'
PHOTO = D + 'reel/photos/tripnerd-daytona_hospitality-suite.jpg'
V06 = D + 'reel/v6.npy'
V06_MP4 = D + 'photos/TN_2024-02-19_daytona_V06.mp4'
OUT = D + 'card/out/'
W, H, FPS, N = 1080, 1920, 30, 60
CROP_X, CROP_X1 = 0, 600            # photo x 0-600: the whole TV (cars are on its left) plus lanyard and card
SC = W / (CROP_X1 - CROP_X)          # 1.8x
BIG_W = int(round(800 * SC)); PH = int(round(535 * SC)); Y0 = (H - PH) // 2
XO = int(round(CROP_X * SC))
SHIFT = np.float32([-XO, Y0])
NAVY = (0x38, 0x28, 0x20)            # BGR of #202838
V06_START_F = 60                     # TV plays V06 from 2.000 s at real speed

img = cv2.imread(PHOTO)              # 800x535 BGR
assert img.shape[:2] == (535, 800)

# ---------- geometry measured in photo pixels ----------
TV_VIS = np.float32([(0, 28), (498, 41), (493, 457), (0, 477)])          # visible video area
TV_FULL = np.float32([(CROP_X, 28 + 0.026 * CROP_X), (498, 41), (493, 457), (CROP_X, 477 - 0.0406 * CROP_X)])  # TV area visible in the frame
V06_X = 250                          # V06 columns shown on the visible part of the TV (pack crosses here f75-115)
CARD = np.float32([(483, 329), (566, 336), (565, 448), (483, 438)])       # TL TR BR BL
CLIP = (512, 294, 538, 338)
STRAP_C = [(515, 0), (516, 80), (518, 160), (520, 240), (524, 300)]      # centreline, top -> clip
STRAP_W = 26


def poly_mask(shape, pts):
    m = np.zeros(shape, np.uint8); cv2.fillPoly(m, [np.int32(np.round(pts))], 255); return m


def strap_poly():
    left, right = [], []
    for i, (x, y) in enumerate(STRAP_C):
        left.append((x - STRAP_W / 2, y)); right.append((x + STRAP_W / 2, y))
    return np.float32(left + right[::-1])


# ---------- clean plate (card + clip + strap removed) ----------
m_card = poly_mask((535, 800), CARD)
m_clip = np.zeros_like(m_card); cv2.rectangle(m_clip, CLIP[:2], CLIP[2:], 255, -1)
m_strap = poly_mask((535, 800), strap_poly())
m_obj = cv2.dilate(m_card | m_clip | m_strap, np.ones((5, 5), np.uint8))
plate = cv2.inpaint(img, m_obj, 6, cv2.INPAINT_TELEA)
# TV right bezel stays black where the strap and card covered it
bez = (m_obj > 0) & (np.arange(800)[None, :] >= 494) & (np.arange(800)[None, :] <= 503) & (np.arange(535)[:, None] < 470)
plate[bez] = np.median(img[470:500, 494:503].reshape(-1, 3), axis=0).astype(np.uint8)

# ---------- textures ----------
TEX_W, TEX_H, TEX_TOP = 405, 540, 220          # card face 405x540; clip area above it
def card_texture():
    tl, tr, br, bl = CARD
    up = (tl - bl) / np.linalg.norm(tl - bl)
    ext = 44.0                                    # include the clip above the card
    src = np.float32([tl + up * ext, tr + up * ext, br, bl])
    dst = np.float32([(0, 0), (TEX_W, 0), (TEX_W, TEX_TOP + TEX_H), (0, TEX_TOP + TEX_H)])
    Hm = cv2.getPerspectiveTransform(src, dst)
    big = cv2.warpPerspective(img, Hm, (TEX_W, TEX_TOP + TEX_H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    # mild unsharp mask (classical sharpening only)
    blur = cv2.GaussianBlur(big, (0, 0), 3)
    big = cv2.addWeighted(big, 1.35, blur, -0.35, 0)
    a = np.zeros(big.shape[:2], np.float32)
    body = np.zeros_like(a); r = 22
    cv2.rectangle(body, (r, TEX_TOP), (TEX_W - r, TEX_TOP + TEX_H), 1, -1)
    cv2.rectangle(body, (0, TEX_TOP + r), (TEX_W, TEX_TOP + TEX_H - r), 1, -1)
    for cx, cy in ((r, TEX_TOP + r), (TEX_W - r, TEX_TOP + r), (r, TEX_TOP + TEX_H - r), (TEX_W - r, TEX_TOP + TEX_H - r)):
        cv2.circle(body, (cx, cy), r, 1, -1)
    # clip: dark pixels in the top band, centred
    clipband = np.zeros_like(a); cx0 = int(TEX_W * (CLIP[0] - 483) / 83); cx1 = int(TEX_W * (CLIP[2] - 483) / 83)
    clipband[:TEX_TOP + 6, max(0, cx0):cx1] = 1
    dark = (cv2.cvtColor(big, cv2.COLOR_BGR2GRAY) < 110).astype(np.float32)
    a = np.maximum(body, clipband * dark)
    a = cv2.GaussianBlur(a, (0, 0), 1.2)
    face_color = np.percentile(big[TEX_TOP + 20:TEX_TOP + TEX_H - 20, 20:TEX_W - 20].reshape(-1, 3), 92, axis=0)
    back = np.zeros_like(big); back[:] = face_color
    return big, back, a, face_color


FRONT, BACK, ALPHA, CARD_WHITE = card_texture()
# the card was photographed in shade: lift its exposure so the paper reads white (grade only, card pixels kept)
_gain = np.float32([236, 238, 240]) / np.maximum(CARD_WHITE, 1)          # BGR target for the brightest paper
FRONT = np.clip(FRONT.astype(np.float32) * _gain, 0, 255).astype(np.uint8)
CARD_WHITE = np.clip(CARD_WHITE * _gain, 0, 255)
BACK = np.zeros_like(FRONT); BACK[:] = CARD_WHITE.astype(np.uint8)

# crisp rebuilt card (make_card.py): white card, stacked lockup, navy wordmark (APPROVER-approved recolour)
_hr = cv2.imread(D + 'card/card_face_hr.png', cv2.IMREAD_UNCHANGED)        # BGRA, 4x geometry
HR = _hr.shape[1] / TEX_W
CRISP_PYR = []                                                          # (px per geometry px, bgr, alpha)
for f in (HR, HR / 2, HR / 4, HR / 8):
    sz = (int(round(TEX_W * f)), int(round((TEX_TOP + TEX_H) * f)))
    im = cv2.resize(_hr, sz, interpolation=cv2.INTER_AREA)
    CRISP_PYR.append((f, im[..., :3].copy(), im[..., 3].astype(np.float32) / 255))
PAPER_BGR = np.float32(_hr[TEX_TOP * int(HR) + 200, 60, :3])
CARD_WHITE = PAPER_BGR
T_SWAP = 0.35                      # photo card dissolves into the crisp card during the first 0.35 s of the lift


def strap_texture():
    rows = []
    ys = np.arange(0, 300)
    xs_c = np.interp(ys, [p[1] for p in STRAP_C], [p[0] for p in STRAP_C])
    for y, xc in zip(ys, xs_c):
        xs = np.linspace(xc - STRAP_W / 2, xc + STRAP_W / 2, STRAP_W * 4)
        mapx = xs.astype(np.float32)[None, :]; mapy = np.full_like(mapx, float(y))
        rows.append(cv2.remap(img, mapx, mapy, cv2.INTER_LINEAR))
    tex = np.vstack(rows)
    tex = cv2.resize(tex, (tex.shape[1], int(300 * SC * 1.0)), interpolation=cv2.INTER_LANCZOS4)
    a = np.ones(tex.shape[:2], np.float32)
    edge = np.linspace(0, 1, tex.shape[1]); a *= np.clip(np.minimum(edge, 1 - edge) * 10, 0, 1)[None, :]
    return tex, a


STRAP_TEX, STRAP_A = strap_texture()

# ---------- TV picture ----------
V6 = np.load(V06, mmap_mode='r')
TVmask_vis = poly_mask((535, 800), TV_VIS)
def big(a, interp=cv2.INTER_LANCZOS4):
    return cv2.resize(a, (BIG_W, PH), interpolation=interp)[:, XO:XO + W]
big_mask_tv = big(TVmask_vis, cv2.INTER_LINEAR).astype(np.float32) / 255
_vh = 720.0; _vw = _vh * (498 - CROP_X) / (457 - 41)
H_tv = cv2.getPerspectiveTransform(np.float32([(V06_X, 0), (V06_X + _vw, 0), (V06_X + _vw, _vh), (V06_X, _vh)]), TV_FULL * SC + SHIFT)
orig_big = big(img)
plate_big = big(plate)
obj_big = big(cv2.GaussianBlur(m_obj, (0, 0), 1.0), cv2.INTER_LINEAR).astype(np.float32) / 255
glare = np.clip(cv2.GaussianBlur(cv2.cvtColor(orig_big, cv2.COLOR_BGR2GRAY), (0, 0), 25).astype(np.float32) - 175, 0, 80)[..., None] * 0.55


GEN = None; H_gen = None


def load_gen(path):
    """AI-animated version of this photo (Seedance 2.5, start image = this photo). Only its TV area is used."""
    global GEN, H_gen
    cap = cv2.VideoCapture(path); fr = []
    while True:
        ok, f = cap.read()
        if not ok: break
        fr.append(f)
    GEN = fr
    # align generated frames to the photo outside the TV (ORB + RANSAC homography on frame 0)
    g0 = cv2.cvtColor(fr[0], cv2.COLOR_BGR2GRAY); p0 = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    orb = cv2.ORB_create(4000)
    k1, d1 = orb.detectAndCompute(g0, None); k2, d2 = orb.detectAndCompute(p0, None)
    mt = sorted(cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2), key=lambda m: m.distance)[:600]
    a = np.float32([k1[m.queryIdx].pt for m in mt]); b = np.float32([k2[m.trainIdx].pt for m in mt])
    H_gen, inl = cv2.findHomography(a, b, cv2.RANSAC, 3.0)
    return len(fr), int(inl.sum())


def load_mosaics(d, n_frames=121):
    """TV area of the AI-animated photo (Grok Video 1.5), already aligned to photo coords in the sandbox:
    tiles of photo x 0-500, y 20-480, 2x2 per mosaic."""
    global GEN
    import glob
    tiles = []
    for p in sorted(glob.glob(d + '/m*.jpg')):
        m = cv2.imread(p)
        for r in range(2):
            for c in range(2):
                tiles.append(m[r * 460:(r + 1) * 460, c * 500:(c + 1) * 500])
    tiles = tiles[:n_frames]
    GEN = []
    for t in tiles:
        f = img.copy(); f[20:480, 0:500] = t
        GEN.append(f)
    return len(GEN)


def tv_frame(k):
    if GEN is None:                      # preview: TV picture still (AI animation not back yet)
        return orig_big.astype(np.float32)
    f = GEN[min(int(k / FPS * 24), len(GEN) - 1)]          # generated video is 24 fps
    return big(f).astype(np.float32)


def base_frame(k, removed):
    src = plate_big if removed else orig_big
    out = src.astype(np.float32)
    tv = tv_frame(k)
    m = big_mask_tv[..., None]
    if not removed:
        m = m * (1 - obj_big[..., None])     # card/strap stay on top of the TV until they lift
    out = out * (1 - m) + tv * m
    canvas = np.zeros((H, W, 3), np.float32); canvas[:] = NAVY
    canvas[Y0:Y0 + PH] = out
    return canvas


# ---------- motion ----------
def ss(x): x = min(max(x, 0.0), 1.0); return x * x * x * (x * (x * 6 - 15) + 10)


card_c = CARD.mean(0) * SC + SHIFT
s0 = (np.linalg.norm(CARD[1] - CARD[0]) * SC) / TEX_W
phi0 = math.atan2(CARD[1][1] - CARD[0][1], CARD[1][0] - CARD[0][0])
TARGET = np.float32([540, 1010]); S_HOLD = 470 / TEX_W
T_LIFT, T_HOLD, T_TWIRL, T_END = 0.25, 0.85, 1.3, 2.0


def card_pose(t):
    """centre, scale, in-plane angle, Y angle (radians)"""
    if t < T_LIFT:
        return card_c, s0, phi0, 0.0
    if t < T_HOLD:
        u = ss((t - T_LIFT) / (T_HOLD - T_LIFT))
        c = card_c + (TARGET - card_c) * u + np.float32([0, -70 * math.sin(math.pi * u)])
        s = s0 * (S_HOLD / s0) ** u
        phi = phi0 + (math.radians(-2.5) - phi0) * u + math.radians(4) * math.sin(math.pi * u)
        th = math.radians(14) * math.sin(math.pi * u)
        return c, s, phi, th
    drift = t - T_HOLD
    c_hold = TARGET + np.float32([4 * math.sin(2 * math.pi * 0.45 * drift), 7 * math.sin(2 * math.pi * 0.6 * drift)])
    phi_hold = math.radians(-2.5 + 1.5 * math.sin(2 * math.pi * 0.5 * drift))
    th_hold = math.radians(6 * math.sin(2 * math.pi * 0.4 * drift))
    if t < T_TWIRL:
        return c_hold, S_HOLD, phi_hold, th_hold
    w = (t - T_TWIRL) / (T_END - T_TWIRL)
    e = w * w * (3 - 2 * w)
    th = th_hold + 3 * math.pi * e                      # 3.5 turns, lands back-face (plain white) toward camera
    phi = phi_hold + math.radians(60) * e
    s = S_HOLD * math.exp(math.log(7.0) * w ** 2.0)
    c = c_hold + (np.float32([540, 960]) - c_hold) * e
    return c, s, phi, th


def card_quad(c, s, phi, th, f=1800.0):
    hw, top, bot = TEX_W / 2, -(TEX_TOP + TEX_H / 2), TEX_H / 2
    pts = []
    for u, v in ((-hw, top), (hw, top), (hw, bot), (-hw, bot)):
        X, Z, Y = u * s * math.cos(th), u * s * math.sin(th), v * s     # v measured from the card-body centre
        xr = X * math.cos(phi) - Y * math.sin(phi); yr = X * math.sin(phi) + Y * math.cos(phi)
        k = f / (f + Z)
        pts.append((c[0] + xr * k, c[1] + yr * k))
    return np.float32(pts)


def clip_anchor(c, s, phi, th):
    q = card_quad(c, s, phi, th)
    return (q[0] + q[1]) / 2           # top centre of the texture (top of the clip)


def _warp(tex, alpha, scale_px, q, back):
    src = np.float32([(0, 0), (TEX_W, 0), (TEX_W, TEX_TOP + TEX_H), (0, TEX_TOP + TEX_H)]) * scale_px
    if back:
        src = src[[1, 0, 3, 2]]
    Hm = cv2.getPerspectiveTransform(src, q)
    col = cv2.warpPerspective(tex, Hm, (W, H), flags=cv2.INTER_LINEAR).astype(np.float32)
    al = cv2.warpPerspective(alpha, Hm, (W, H), flags=cv2.INTER_LINEAR)
    return col, al


def draw_card(canvas, t):
    c, s, phi, th = card_pose(t)
    q = card_quad(c, s, phi, th)
    back = math.cos(th) < 0
    m = ss((t - T_LIFT) / T_SWAP)                       # 0 = photo card, 1 = crisp card
    # crisp card: pick the pyramid level closest above the on-screen size (avoids aliasing)
    lvl = [p for p in CRISP_PYR if p[0] >= s] or [CRISP_PYR[0]]
    f, tex, a = lvl[-1]
    a = a.copy()
    if back:
        tex = np.empty_like(tex); tex[:] = PAPER_BGR.astype(np.uint8)
        a[:int((TEX_TOP - 4) * f)] = 0                  # the back has no clip
    col, al = _warp(tex, a, f, q, back)
    if m < 1:
        pa = ALPHA.copy()
        col0, al0 = _warp(FRONT, pa, 1.0, q, False)
        col = col0 * (1 - m) + col * m; al = al0 * (1 - m) + al * m
    al = al[..., None]
    canvas[:] = canvas * (1 - al) + col * al
    return (q[0] + q[1]) / 2, al


# ---------- lanyard: verlet rope with gravity, bending stiffness and air drag ----------
from PIL import Image as _Im, ImageDraw as _Dr, ImageFont as _Ft
NS = 48                                         # rope nodes
L_PHOTO = 300 * SC                              # strap length visible in the photo (top of frame -> clip)
ys = np.linspace(0, 300, NS)
xs = np.interp(ys, [p[1] for p in STRAP_C], [p[0] for p in STRAP_C])
rope = np.stack([xs * SC - XO, ys * SC + Y0], 1).astype(np.float64)
rope_prev = rope.copy()
PIN = rope[0].copy()                            # strap continues off the top of the photo (as in the original): top end pinned
G = np.array([350.0, 2900.0])                  # gravity + air drag trailing right as the card floats up-left
DRAG = 0.975                                    # per sub-step velocity retention (air drag)


def strap_strip(width_px=72, length_px=1400):
    """Clean lanyard texture: black woven strap, faint edge stitching, white STAFF print along its length."""
    strip = _Im.new('RGB', (width_px, length_px), (18, 18, 20))
    d = _Dr.Draw(strip)
    for x in (4, width_px - 5):
        d.line([(x, 0), (x, length_px)], fill=(46, 46, 50), width=2)
    font = _Ft.truetype(D + 'reel/fonts/montserrat-2.ttf', int(width_px * 0.62))
    word = _Im.new('RGBA', (int(width_px * 3.2), width_px), (0, 0, 0, 0))
    _Dr.Draw(word).text((word.width / 2, width_px / 2), 'STAFF', font=font, fill=(236, 236, 236, 255), anchor='mm')
    word = word.rotate(-90, expand=True)        # reads top-to-bottom along the strap, as on the real lanyard
    step = int(width_px * 4.4)
    for y in range(int(width_px * 0.6), length_px - word.height, step):
        strip.paste(word, ((width_px - word.width) // 2, y), word)
    return cv2.cvtColor(np.asarray(strip), cv2.COLOR_RGB2BGR)


STRIP = strap_strip()


def rope_step(anchor, attached, seg, dt):
    global rope, rope_prev
    vel = (rope - rope_prev) * DRAG
    rope_prev = rope.copy()
    rope = rope + vel + G * dt * dt
    for _ in range(14):
        rope[0] = PIN
        if attached:
            rope[-1] = anchor
        d = rope[1:] - rope[:-1]; L = np.linalg.norm(d, axis=1) + 1e-9
        corr = ((L - seg) / L)[:, None] * d * 0.5
        rope[:-1] += corr; rope[1:] -= corr
        # bending stiffness: soft constraint between nodes i and i+2
        d2 = rope[2:] - rope[:-2]; L2 = np.linalg.norm(d2, axis=1) + 1e-9
        c2 = (np.maximum(2 * seg * 0.985 - L2, 0) / L2)[:, None] * d2 * 0.5
        rope[:-2] -= c2; rope[2:] += c2
    if attached:
        rope[-1] = anchor
        # the webbing hangs from the clip: no node may sit far above it (prevents folding back over the card)
        pass
    rope[0] = PIN


def _catmull(p, per=6):
    p = np.vstack([p[0], p, p[-1]]); out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for tt in np.linspace(0, 1, per, endpoint=False):
            t2, t3 = tt * tt, tt * tt * tt
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * tt + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(p[-2])
    return np.array(out)


def draw_rope(canvas, width):
    pts = _catmull(rope)
    seglen = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seglen)])
    # tangents / normals per point (smooth)
    tan = np.gradient(pts, axis=0); tan /= (np.linalg.norm(tan, axis=1)[:, None] + 1e-9)
    nrm = np.stack([-tan[:, 1], tan[:, 0]], 1)
    sw = STRIP.shape[1]; px_per = sw / width          # texture px per output px
    layer = np.zeros((H, W, 3), np.float32); lal = np.zeros((H, W), np.float32)
    for i in range(len(pts) - 1):
        a0, a1 = arc[i], arc[i + 1]
        if a1 - a0 < 0.3: continue
        e = 0.8                                      # overlap along the strap so neighbouring pieces meet
        p0 = pts[i] - tan[i] * e; p1 = pts[i + 1] + tan[i + 1] * e
        h = width / 2
        dst = np.float32([p0 + nrm[i] * h, p0 - nrm[i] * h, p1 - nrm[i + 1] * h, p1 + nrm[i + 1] * h])   # unmirrored print
        x0, y0 = np.floor(dst.min(0)).astype(int) - 2; x1, y1 = np.ceil(dst.max(0)).astype(int) + 2
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W), min(y1, H)
        if x1 <= x0 or y1 <= y0: continue
        r0 = ((a0 - e) * px_per) % (STRIP.shape[0] - 1); r1 = r0 + (a1 - a0 + 2 * e) * px_per
        if r1 >= STRIP.shape[0]: r0, r1 = 0, (a1 - a0 + 2 * e) * px_per
        src = np.float32([(0, r0), (sw, r0), (sw, r1), (0, r1)])
        Hm = cv2.getPerspectiveTransform(src, dst - np.float32([x0, y0]))
        col = cv2.warpPerspective(STRIP, Hm, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR).astype(np.float32)
        m = np.zeros((y1 - y0, x1 - x0), np.uint8)
        cv2.fillConvexPoly(m, np.int32(np.round((dst - np.float32([x0, y0])) * 4)), 255, cv2.LINE_AA, shift=2)
        al = m.astype(np.float32) / 255
        roi_a = lal[y0:y1, x0:x1]; take = al > roi_a
        layer[y0:y1, x0:x1][take] = col[take]; roi_a[take] = al[take]
    # soft edge + a faint shadow so the strap sits in the scene
    sh = cv2.GaussianBlur(lal, (0, 0), 6) * 0.35
    canvas *= (1 - sh[..., None])
    canvas[:] = canvas * (1 - lal[..., None]) + layer * lal[..., None]


def main():
    import os
    os.makedirs(OUT, exist_ok=True)
    import sys
    if len(sys.argv) > 1:
        print('TV frames:', load_mosaics(sys.argv[1]))
    frames = []
    w_strap0 = STRAP_W * SC * 0.9
    attached = True; ratio_frozen = None
    prev_anchor = None
    for k in range(N):
        t = k / FPS
        removed = t >= T_LIFT
        cv = base_frame(k, removed)
        if removed:
            c, s, phi, th = card_pose(t)
            ratio = s / s0 if ratio_frozen is None else ratio_frozen
            if t >= T_TWIRL and attached:
                attached = False; ratio_frozen = ratio
            depth = min(ratio, 1.6)                       # strap is at the card's depth: grows with it, capped
            # anchor = top of the clip on the card (texture row TEX_TOP-116 in geometry px)
            q = card_quad(c, s, phi, th)
            fr = (TEX_TOP - 116) / (TEX_TOP + TEX_H)
            anchor = ((q[0] + q[1]) / 2 * (1 - fr) + (q[3] + q[2]) / 2 * fr).astype(np.float64)
            if prev_anchor is None:
                prev_anchor = rope[-1].copy()
            sub = 16
            seg = L_PHOTO * depth / (NS - 1)
            for j in range(1, sub + 1):
                a_j = prev_anchor + (anchor - prev_anchor) * (j / sub)   # anchor moves smoothly inside the frame
                rope_step(a_j, attached, seg, 1 / FPS / sub)
            prev_anchor = anchor
            draw_rope(cv, w_strap0 * depth)          # strap behind the card
            draw_card(cv, t)
            # final whiteout: card face colour fills the frame by 5.0 s
            if t >= 1.70:
                a = ss((t - 1.70) / 0.27)
                cv[:] = cv * (1 - a) + np.float32(CARD_WHITE) * a
        frames.append(np.clip(cv, 0, 255).astype(np.uint8))
    # ---------- audio: real V06 sound (same moments as the TV picture), muffled ----------
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '2.0', '-t', '2.0', '-i', V06_MP4, '-vn', '-ac', '2', '-ar', '48000',
                    '-af', 'highpass=f=70,lowpass=f=420,lowpass=f=420,lowpass=f=600,aecho=0.85:0.6:35|61:0.22|0.12,afade=t=in:d=0.15',
                    OUT + 'muffled.wav'])
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', OUT + 'muffled.wav', '-af', 'loudnorm=I=-20:TP=-2:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rfind('{'):meas.rfind('}') + 1])
    af = (f"loudnorm=I=-20:TP=-2:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
    name = OUT + ('card-open-2.0s.mp4' if GEN is not None else 'TripNerd-Daytona-hospitality-card-v2-PREVIEW-still-TV.mp4')
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-i', OUT + 'muffled.wav', '-af', af, '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
           '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', '2.0', '-movflags', '+faststart', name]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fr in frames: p.stdin.write(fr.tobytes())
    p.stdin.close(); p.wait()
    cv2.imwrite(OUT + 'plate.png', plate)
    print('done', p.returncode, 'card white', CARD_WHITE)


if __name__ == '__main__':
    main()
