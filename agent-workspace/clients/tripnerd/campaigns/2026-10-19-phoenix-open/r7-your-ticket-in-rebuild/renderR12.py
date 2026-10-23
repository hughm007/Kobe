# Reel 3 v5: v4 (renderR10) unchanged through the food & drink beat; new ending 'from the noise to the quiet'.
# TripNerd x Phoenix Open, Reel 3 "Your Ticket In" v4 (owner revision 2026-10-21 #3): sells TripNerd AT the Phoenix Open.
# 9:16, 1080x1920, 30 fps, 124 BPM grid, drop on the white flash (frame 202). One caption per shot, on for the whole shot,
# bold white on a dark plate in the upper safe zone (y=460).
#   opener   REAL frames only: source frames 0-22 (0.00-0.92 s) at ~real time, 24->30 fps by frame choice (no synthesis)
#   V01      from 2.5 s, 6 beats
#   ticket   rise 1 / hold 2 / push 1 (ease-in-out, single scale factor) / flat clockwise stamp turn 2 (camera locked)
#   V03      from 3.6 s, 8 beats      P02 4 beats      P05 crop 4 beats      P06 pan 5 beats      end card 6 beats
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
import render2 as r
sys.argv = sys.argv_saved
from ticket7 import F, logo_w, TNBLUE
from ticket9 import Ticket
from renderR7 import endcard_bg, ease_out, W, H, FF, OPENER, QUADS, warp_onto, B
from renderR8 import ease_io5, ease_io, PB
from renderR9 import place_k, crop_box, cover, K
r.SRC.update({'V01': B + 'V01.mp4', 'V03': B + 'V03.mp4'})
CAP_Y = 460

def soft_grade(f):                                                       # gentle warm/bright match (half-strength of the v4-era look)
    x = f.astype(np.float32) / 255; x = x ** 0.97; x = x * np.float32([1.02, 1.005, 0.98])
    return (x.clip(0, 1) * 255).astype(np.uint8)

class HotelTicket:
    """same TripNerd ticket (paper, torn edge, header band with the ORIGINAL logo file) with ONE line of real text;
    the same TripNerd stamp (ticket9.stamp_k, a geometric circle at 4x) pressed onto that line"""
    def __init__(self, k=4):
        from ticket9 import stamp_k
        from ticket7 import PAPER, NAVY, spaced
        K_ = k; tw, th = 1100 * K_, 330 * K_; teeth = 7
        m = Image.new('L', (tw, th), 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 0, tw - 1, th - 1), 18 * K_, fill=255)
        rr = th / teeth / 2
        for j in range(teeth): md.ellipse((tw - rr, (2 * j + 1) * rr - rr, tw + rr, (2 * j + 1) * rr + rr), fill=0)
        body = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(body)
        d.rectangle((0, 0, tw, 120 * K_), fill=(*TNBLUE, 255))
        lg = logo_w(290 * K_); body.alpha_composite(lg, (34 * K_, (120 * K_ - lg.size[1]) // 2))
        f = F(40 * K_); line = 'HOTEL: Fairmont Scottsdale Princess'
        self.text_x1 = spaced(d, (36 * K_, 200 * K_), line, f, NAVY, 0.5 * K_)
        g = np.random.default_rng(3).normal(0, 3.0, (th, tw, 1)).astype(np.float32); g[:120 * K_] = 0
        a = np.asarray(body).astype(np.float32); a[..., :3] = np.clip(a[..., :3] + g, 0, 255)
        out = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); out.paste(Image.fromarray(a.astype(np.uint8)), (0, 0), m)
        self.body = out; self.k = K_; self.tw, self.th = tw, th
        self.stamp = stamp_k(200 * K_)                                   # square raster -> uniform scaling keeps a perfect circle
        self.sc_ticket = (self.text_x1 / K_ + 90, 220)              # disc clear of the text; ring kisses the last letter  # stamp centre in 1x ticket coords: on the line's end
    def press(self, canvas, tcx, tcy, ts, sc, alpha):
        d = max(2, round(self.stamp.size[0] / self.k * ts * sc))
        st = self.stamp.resize((d, d), Image.LANCZOS)                    # width == height: never oval
        if alpha < 1: st.putalpha(st.split()[3].point(lambda v: int(v * alpha)))
        cx = tcx + (self.sc_ticket[0] - self.tw / self.k / 2) * ts; cy = tcy + (self.sc_ticket[1] - 165) * ts
        canvas.alpha_composite(st, (int(round(cx - d / 2)), int(round(cy - d / 2))))

def caption_layer(text, size=92, y=CAP_Y):
    L = r.text_layer(text, size, 99, y)                                  # static (no pop), wraps above 980 px
    a = np.asarray(L.split()[3]); ys, xs = np.where(a > 40)
    plate = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(plate)
    d.rounded_rectangle((xs.min() - 34, ys.min() - 22, xs.max() + 34, ys.max() + 24), 26, fill=(0, 0, 0, 170))
    plate.alpha_composite(L); return plate
def with_cap(f, cap):
    img = Image.fromarray(f).convert('RGBA'); img.alpha_composite(cap); return np.asarray(img.convert('RGB'))

def opener_real(face, n):
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '23', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    src = np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3)
    s = H / 1912; nw = round(1080 * s); x0 = int((nw - W) / 2); out = []
    for k in range(n):
        i = int(round(k * 22 / (n - 1)))                                 # nearest REAL source frame, monotonic, no blending
        f = cv2.resize(src[i], (nw, H), interpolation=cv2.INTER_LANCZOS4)[:, x0:x0 + W]
        q = np.float32(QUADS[i]) * s - np.float32([x0, 0]); c = q.mean(0); q = (q - c) * 1.05 + c
        out.append(warp_onto(f, face, q))
    return out

def stamp_roundness(f):
    g = f.astype(int); m = ((g[..., 2] > 180) & (g[..., 0] < 150) & (g[..., 2] - g[..., 0] > 70)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)); cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    best = None
    for c in cs:
        x, y, w, h = cv2.boundingRect(c)
        if 60 < w < 1100 and 60 < h < 1100 and 0.7 < w / h < 1.4 and y > 380 and (best is None or w * h > best[0]): best = (w * h, w, h)
    return None if best is None else best[1] / best[2]

def build(out, timing):
    T = json.load(open(timing)); P = 60.0 / T['bpm']; D = T['drop_frame']; Dt = D / 30; g0 = Dt + T['grid_offset']
    bf = lambda k: int(round((g0 + k * P) * 30))
    caps = {k: caption_layer(v) for k, v in T['captions'].items()}
    TKo = Ticket(K); face = TKo.at(0).resize((1000, 470), Image.LANCZOS); seq = []; shots = []
    # 1) opener, real frames
    nO = bf(-12); shots.append(('opener', 0))
    seq += [with_cap(f, caps['opener']) for f in opener_real(face, nO)]
    # 2) V01
    shots.append(('V01', len(seq))); V1 = r.read('V01', 2.5, bf(-6) - len(seq)); seq += [with_cap(f, caps['v01']) for f in V1]
    # 3) ticket: rise / hold / push / flat stamp turn  (caption on for the whole shot)
    shots.append(('ticket', len(seq)))
    base = Image.fromarray((V1[-1].astype(np.float32) * 0.28).astype(np.uint8)).convert('RGBA')   # clean (uncaptioned) V01 frame
    T0 = TKo.at(0); sc = TKo.center1; S0, S1 = 1.04, 3.4
    nR, nH, nP = bf(-5) - bf(-6), bf(-3) - bf(-5), bf(-2) - bf(-3)
    tk = []
    for k in range(nR):
        c = base.copy(); u = ease_out((k + 1) / nR); place_k(c, T0, 540, 2500 + (960 - 2500) * u, S0, -4.0 * (1 - u)); tk.append(np.asarray(c.convert('RGB')))
    hold = base.copy(); place_k(hold, T0, 540, 960, S0); tk += [np.asarray(hold.convert('RGB'))] * nH
    def framing(u):                                                      # one scale factor (aspect locked) + translation
        s = S0 * (S1 / S0) ** u
        return s, 540 - (sc[0] - 500) * s * u, 960 - (sc[1] - 235) * s * u
    for k in range(nP):
        s, cx, cy = framing(ease_io((k + 1) / nP)); c = base.copy(); place_k(c, T0, cx, cy, s); tk.append(np.asarray(c.convert('RGB')))
    pre = tk[-1]; s, cx, cy = framing(1.0); nS = D - bf(-2)
    for k in range(nS):
        phi = 360.0 * ease_io5((k + 1) / nS); c = base.copy(); place_k(c, TKo.at(0.0 if k == nS - 1 else phi), cx, cy, s); tk.append(np.asarray(c.convert('RGB')))
    assert np.array_equal(tk[-1], pre), 'stamp must land pixel-identical to the pre-turn frame'
    ratios = [stamp_roundness(f) for f in tk[nR + nH:]]
    bad = [(i, x) for i, x in enumerate(ratios) if x is not None and abs(x - 1) > 0.005]
    assert not bad, ('stamp aspect drift', bad)
    seq += [with_cap(f, caps['ticket']) for f in tk]; assert len(seq) == D
    # 4) DROP: flash -> V03
    shots.append(('V03', len(seq))); nV = bf(T['v03_beats']) - D; V3 = r.read('V03', T['v03_src'], nV)
    for k, f in enumerate(V3):
        if k < 4: f = (f.astype(np.float32) * (1 - [1, .7, .4, .15][k]) + 255 * [1, .7, .4, .15][k]).astype(np.uint8)
        seq.append(with_cap(f, caps['v03']) if k >= 1 else f)
    # 5) static photos
    kb = T['v03_beats']
    for ph in T['photos']:
        img = crop_box(ph['name'], ph['box']) if 'box' in ph else cover(ph['name'], ph['cx'])
        a, b = bf(kb), bf(kb + ph['beats']); shots.append((ph['name'], a)); seq += [with_cap(img, caps[ph['cap']])] * (b - a); kb += ph['beats']
    # 6) NEW ENDING "from the noise to the quiet": Fairmont pool, native pixels (no upscaling), slow lateral pan
    a, e1 = bf(kb), bf(kb + T['hotel_beats']); n = e1 - a; land = bf(kb + 1); shots.append(('FSP_01 pool', a))
    fsp = Image.open(T['fsp']).convert('RGB'); fw, fh = fsp.size; assert fh <= H
    fsp_np = soft_grade(np.asarray(fsp))
    fill_s = H / fh; fill = cv2.resize(fsp_np, (round(fw * fill_s), H), interpolation=cv2.INTER_AREA)
    fill = cv2.GaussianBlur(fill, (0, 0), 42); fill = (fill.astype(np.float32) * 0.82).astype(np.uint8)
    y0 = (H - fh) // 2; feather = 28
    fm = np.ones((fh, 1, 1), np.float32); r_ = np.linspace(0, 1, feather)[:, None, None]; fm[:feather] = r_; fm[-feather:] = r_[::-1]
    travel = T['pan_px']; fa = 0.3; v = travel / (n * (1 - fa / 2)); x_start = T['pan_x0']
    xpos = lambda i: v * n * ((i / n) ** 2 / (2 * fa)) if i / n < fa else v * n * (fa / 2 + (i / n - fa))
    capH = caption_layer(T['captions']['hotel'])
    HT = HotelTicket(K); TS = 0.86; tcx, tcy = 540, 1180
    for i in range(n):
        x = x_start + xpos(i)
        fx = x * fill_s + (fill.shape[1] - fw * fill_s) / 2 * 0 ; M = np.float32([[1, 0, -fx], [0, 1, 0]])
        frm = cv2.warpAffine(fill, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
        band = cv2.warpAffine(fsp_np, np.float32([[1, 0, -x], [0, 1, 0]]), (W, fh), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
        frm[y0:y0 + fh] = frm[y0:y0 + fh] * (1 - fm) + band * fm
        c = Image.fromarray(frm.clip(0, 255).astype(np.uint8)).convert('RGBA')
        k = a + i
        if k >= a:                                                        # ticket slides up (0.3 s), then holds
            u = ease_out(min(1, (k - a + 1) / 9)); place_k(c, HT.body, tcx, 2300 + (tcy - 2300) * u, TS)
        st_land = k >= land
        if k >= land - 5 and not st_land:                                 # stamp presses: uniform scale 1.6 -> 1.0, lands on the beat
            p = (k - (land - 5) + 1) / 5; sc = 1.6 - 0.6 * (p ** 2); al = min(1.0, 0.35 + p)
            HT.press(c, tcx, tcy, TS, sc, al)
        if st_land: HT.press(c, tcx, tcy, TS, 1.0, 1.0)
        c.alpha_composite(capH); seq.append(np.asarray(c.convert('RGB')))
    kb += T['hotel_beats']
    # 7) end card (v4, unchanged): arrives at the pan's speed, settles; logo fixed 880x324; padded button
    BG = endcard_bg(); LG = logo_w(880); a = bf(kb); e = bf(kb + T['end_beats']); shots.append(('end card', a)); m = 18; Dx = v * m / 2
    head = r.text_layer(T['end_headline'], 64, 99, 870)
    fb = F(54); bt = 'Talk to a Nerd'; bb = fb.getbbox(bt); bw, bh = bb[2] - bb[0], bb[3] - bb[1]; padx, pady = 78, 40
    for i in range(a, e):
        k = i - a; dx = int(round(Dx * (1 - k / m) ** 2)) if k < m else 0
        fg = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fg.alpha_composite(LG, (540 - LG.size[0] // 2, 560 - LG.size[1] // 2))
        if i >= bf(kb + 1): fg.alpha_composite(head)
        if i >= bf(kb + 2):
            pd = ImageDraw.Draw(fg); cy = 1085
            pd.rounded_rectangle((540 - bw / 2 - padx, cy - bh / 2 - pady, 540 + bw / 2 + padx, cy + bh / 2 + pady), (bh + 2 * pady) / 2, fill=(255, 255, 255, 255))
            pd.text((540, cy), bt, font=fb, fill=(*TNBLUE, 255), anchor='mm')
        if i >= bf(kb + 3): fg.alpha_composite(r.text_layer('Link in bio', 48, 99, 1250))
        c = BG.copy(); c.alpha_composite(fg, (dx, 0)); seq.append(np.asarray(c.convert('RGB')))
    N = len(seq); assert N == e
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'dur_s': N / 30, 'drop_s': Dt, 'v03_src': T['v03_src'], 'v03_out_s': bf(T['v03_beats']) / 30,
            'stamp_land_s': land / 30, 'shots_s': [(nm, round(f / 30, 3)) for nm, f in shots], 'stamp_aspect_range': [round(min(x for x in ratios if x), 4), round(max(x for x in ratios if x), 4)],
            'end_s': N / 30, 'bpm': T['bpm'], 'beat_times_s': [round(g0 + k * P, 4) for k in range(-12, kb + T['end_beats'] + 1)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(meta)

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
