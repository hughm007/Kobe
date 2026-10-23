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
    # 6) P06 pan, caption fixed on screen
    p6 = Image.open(PB + 'P06.jpg').convert('RGB'); p6 = np.asarray(p6.resize((round(p6.size[0] * H / p6.size[1]), H), Image.LANCZOS))
    travel = p6.shape[1] - W; a, b = bf(kb), bf(kb + T['pan_beats']); n = b - a; shots.append(('P06 pan', a)); fa = 0.3
    v = travel / (n * (1 - fa / 2))
    xpos = lambda i: v * n * ((i / n) ** 2 / (2 * fa)) if i / n < fa else v * n * (fa / 2 + (i / n - fa))
    for i in range(n):
        seq.append(with_cap(cv2.warpAffine(p6, np.float32([[1, 0, -xpos(i)], [0, 1, 0]]), (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT), caps['p06']))
    kb += T['pan_beats']
    # 7) end card: arrives at the pan's speed; logo fixed 880x324, never spins; padded button
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
            'shots_s': [(nm, round(f / 30, 3)) for nm, f in shots], 'stamp_aspect_range': [round(min(x for x in ratios if x), 4), round(max(x for x in ratios if x), 4)],
            'end_s': N / 30, 'bpm': T['bpm'], 'beat_times_s': [round(g0 + k * P, 4) for k in range(-12, kb + T['end_beats'] + 1)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(meta)

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
