# TripNerd x Phoenix Open, Reel 3 "Your Ticket In" FINAL (owner brief 2026-10-21): TripNerd is the hero.
# 9:16, 1080x1920, 30 fps, 124 BPM grid, drop on the white flash (frame 217 = 7.233 s). One caption per shot, whole shot,
# white with a subtle shadow. One warm/bright grade on footage + photos (never on the logo/ticket graphics).
#   opener   REAL frames 0-22 of opener.mp4 (0.00-0.92 s) over 43 output frames (~65% speed, frames held, none synthesized)
#   V01 5 beats | ticket: rise 1, HOLD 3 (1.47 s), push 1, flat CW stamp turn 2 | V03 8 | crowd 2 | suite 2 | bar 2 | hotel pan 5 | end 6
#   web photos are 300x201 thumbnails: shown sharp at 2.4x (720x482) centred over a blurred, darkened fill of themselves
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
import render2 as r
sys.argv = sys.argv_saved
from ticket7 import F, logo_w, TNBLUE
from ticket9 import Ticket
from renderR7 import endcard_bg, ease_out, W, H, FF, OPENER, QUADS, warp_onto, B
from renderR8 import ease_io5, ease_io
from renderR9 import place_k, K
from renderR10 import stamp_roundness
r.SRC.update({'V01': B + 'V01.mp4', 'V03': B + 'V03.mp4'})
WEB = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/web_split/'

def grade(f):
    x = f.astype(np.float32) / 255
    x = x ** 0.93                                                        # brighter mids
    x = x * np.float32([1.045, 1.012, 0.955])                            # warm
    g = x.mean(2, keepdims=True); x = g + (x - g) * 1.06                 # +6% saturation
    x = 0.5 + (x - 0.5) * 1.04                                           # gentle contrast
    return (x.clip(0, 1) * 255).astype(np.uint8)

def cap_layer(text, y, size=94): return r.text_layer(text, size, 99, y)  # static, subtle shadow
def with_cap(f, L):
    img = Image.fromarray(f).convert('RGBA'); img.alpha_composite(L); return np.asarray(img.convert('RGB'))

def web_card(name, x_off=0.0, fill_off=0.0, scale=2.4):
    im = Image.open(WEB + name + '.png').convert('RGB'); w, h = im.size
    fw = round(H * w / h); fill = im.resize((fw, H), Image.LANCZOS)
    fx = int((fw - W) / 2 + fill_off); fill = fill.crop((fx, 0, fx + W, H)).filter(ImageFilter.GaussianBlur(38))
    fill = Image.fromarray((np.asarray(fill).astype(np.float32) * 0.5).astype(np.uint8))
    fg = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
    c = fill.convert('RGBA'); sh = Image.new('RGBA', (fg.size[0] + 80, fg.size[1] + 80), (0, 0, 0, 0))
    sh.paste((0, 0, 0, 150), (40, 52), Image.new('L', fg.size, 255)); sh = sh.filter(ImageFilter.GaussianBlur(18))
    px = (W - fg.size[0]) / 2 + x_off; py = 1010 - fg.size[1] / 2
    c.alpha_composite(sh, (int(px - 40), int(py - 40)))
    out = np.asarray(c.convert('RGB')).copy()
    if abs(x_off - round(x_off)) > 1e-3:                                 # sub-pixel placement for a smooth pan
        a = np.asarray(fg).astype(np.float32); M = np.float32([[1, 0, px], [0, 1, py]])
        lay = cv2.warpAffine(a, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)
        msk = cv2.warpAffine(np.ones(a.shape[:2], np.float32), M, (W, H), flags=cv2.INTER_LINEAR)[..., None]
        out = (out * (1 - msk) + lay * msk).clip(0, 255).astype(np.uint8)
    else:
        o = Image.fromarray(out); o.paste(fg, (int(round(px)), int(round(py)))); out = np.asarray(o)
    return grade(out)

def opener_real(face, n):
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '23', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    src = np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3); s = H / 1912; nw = round(1080 * s); x0 = int((nw - W) / 2); out = []
    for k in range(n):
        i = min(22, int(k * 23 / n))                                     # real frame, held 1-2x (no blending, no flow)
        f = grade(cv2.resize(src[i], (nw, H), interpolation=cv2.INTER_LANCZOS4)[:, x0:x0 + W])
        q = np.float32(QUADS[i]) * s - np.float32([x0, 0]); c = q.mean(0); q = (q - c) * 1.05 + c
        out.append(warp_onto(f, face, q))
    return out

def build(out, timing):
    T = json.load(open(timing)); P = 60.0 / T['bpm']; D = T['drop_frame']; Dt = D / 30; g0 = Dt + T['grid_offset']
    bf = lambda k: int(round((g0 + k * P) * 30)); C = T['captions']
    TKo = Ticket(K); face = TKo.at(0).resize((1000, 470), Image.LANCZOS); seq = []; shots = []
    nO = bf(-12); shots.append(('opener', 0)); L = cap_layer(C['opener'], 430)
    seq += [with_cap(f, L) for f in opener_real(face, nO)]
    shots.append(('V01', len(seq))); V1 = [grade(f) for f in r.read('V01', 2.5, bf(-7) - len(seq))]; L = cap_layer(C['v01'], 460)
    seq += [with_cap(f, L) for f in V1]
    # ticket shot
    shots.append(('ticket', len(seq))); L = cap_layer(C['ticket'], 365)
    base = Image.fromarray((V1[-1].astype(np.float32) * 0.28).astype(np.uint8)).convert('RGBA')
    T0 = TKo.at(0); sc = TKo.center1; S0, S1 = 1.06, 2.8     # S1 2.8: blue header band spans y 120-456 behind the caption
    nR, nH, nP = bf(-6) - bf(-7), bf(-3) - bf(-6), bf(-2) - bf(-3); tk = []
    for k in range(nR):
        c = base.copy(); u = ease_out((k + 1) / nR); place_k(c, T0, 540, 2500 + (960 - 2500) * u, S0, -4.0 * (1 - u)); tk.append(np.asarray(c.convert('RGB')))
    hold = base.copy(); place_k(hold, T0, 540, 960, S0); tk += [np.asarray(hold.convert('RGB'))] * nH
    def framing(u):
        s = S0 * (S1 / S0) ** u
        return s, 540 - (sc[0] - 500) * s * u, 960 - (sc[1] - 235) * s * u
    for k in range(nP):
        s, cx, cy = framing(ease_io((k + 1) / nP)); c = base.copy(); place_k(c, T0, cx, cy, s); tk.append(np.asarray(c.convert('RGB')))
    pre = tk[-1]; s, cx, cy = framing(1.0); nS = D - bf(-2)
    for k in range(nS):
        phi = 360.0 * ease_io5((k + 1) / nS); c = base.copy(); place_k(c, TKo.at(0.0 if k == nS - 1 else phi), cx, cy, s); tk.append(np.asarray(c.convert('RGB')))
    assert np.array_equal(tk[-1], pre), 'stamp must land pixel-identical'
    ratios = [x for x in (stamp_roundness(f) for f in tk[nR + nH:]) if x is not None]
    assert all(abs(x - 1) <= 0.005 for x in ratios), ('stamp not round', min(ratios), max(ratios))
    seq += [with_cap(f, L) for f in tk]; assert len(seq) == D, (len(seq), D)
    # drop -> V03
    shots.append(('V03', len(seq))); L = cap_layer(C['v03'], 460); V3 = r.read('V03', T['v03_src'], bf(T['v03_beats']) - D)
    for k, f in enumerate(V3):
        f = grade(f)
        if k < 4: f = (f.astype(np.float32) * (1 - [1, .7, .4, .15][k]) + 255 * [1, .7, .4, .15][k]).astype(np.uint8)
        seq.append(with_cap(f, L) if k >= 1 else f)
    # web photos, static
    kb = T['v03_beats']
    for ph in T['photos']:
        img = web_card(ph['name']); a, b = bf(kb), bf(kb + ph['beats']); shots.append((ph['name'], a))
        seq += [with_cap(img, cap_layer(C[ph['cap']], 460))] * (b - a); kb += ph['beats']
    # hotel pan: card slides left (ease in, then constant), fill drifts at 40% (parallax); speed carries into the end card
    a, b = bf(kb), bf(kb + T['pan_beats']); n = b - a; shots.append(('WEB_hotel pan', a)); travel = 150.0; fa = 0.3
    v = travel / (n * (1 - fa / 2)); xpos = lambda i: v * n * ((i / n) ** 2 / (2 * fa)) if i / n < fa else v * n * (fa / 2 + (i / n - fa))
    L = cap_layer(C['hotel'], 460)
    for i in range(n):
        x = xpos(i); seq.append(with_cap(web_card('WEB_hotel', x_off=75 - x + 1e-2, fill_off=0.4 * x), L))
    kb += T['pan_beats']
    # end card
    BG = endcard_bg(); LG = logo_w(880); a = bf(kb); e = bf(kb + T['end_beats']); shots.append(('end card', a)); m = 18; Dx = v * m / 2
    head = r.text_layer(T['end_headline'], 66, 99, 880)
    fb = F(54); bt = 'Talk to a Nerd'; bb = fb.getbbox(bt); bw, bh = bb[2] - bb[0], bb[3] - bb[1]; padx, pady = 96, 46
    for i in range(a, e):
        k = i - a; dx = int(round(Dx * (1 - k / m) ** 2)) if k < m else 0
        fg = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fg.alpha_composite(LG, (540 - LG.size[0] // 2, 560 - LG.size[1] // 2))
        if i >= bf(kb + 1): fg.alpha_composite(head)
        if i >= bf(kb + 2):
            pd = ImageDraw.Draw(fg); cy = 1100
            pd.rounded_rectangle((540 - bw / 2 - padx, cy - bh / 2 - pady, 540 + bw / 2 + padx, cy + bh / 2 + pady), (bh + 2 * pady) / 2, fill=(255, 255, 255, 255))
            pd.text((540, cy), bt, font=fb, fill=(*TNBLUE, 255), anchor='mm')
        if i >= bf(kb + 3): fg.alpha_composite(r.text_layer('Link in bio', 48, 99, 1275))
        c = BG.copy(); c.alpha_composite(fg, (dx, 0)); seq.append(np.asarray(c.convert('RGB')))
    N = len(seq); assert N == e
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'dur_s': N / 30, 'drop_s': Dt, 'v03_src': T['v03_src'], 'v03_out_s': bf(T['v03_beats']) / 30,
            'shots_s': [(nm, round(f / 30, 3)) for nm, f in shots], 'stamp_aspect_range': [round(min(ratios), 4), round(max(ratios), 4)],
            'end_s': N / 30, 'bpm': T['bpm'], 'beat_times_s': [round(g0 + k * P, 4) for k in range(-12, kb + T['end_beats'] + 1)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(meta)

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
