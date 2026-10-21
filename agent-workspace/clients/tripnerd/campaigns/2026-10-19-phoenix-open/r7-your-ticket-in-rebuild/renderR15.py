# TripNerd Phoenix Open 2027 Reel - FINAL calm/premium checklist cut (owner brief 2026-10-21). 1080x1920, 30 fps, 124 BPM grid.
# Beats: drone 4 | V01 pan 5 | opener 4 | stamp push 1 + flat spin ~3.7 + soft flash | DROP | V03 5 (only use) |
#        ticket(slide, check 1) 4 | suite 6 | ticket(check 2) 4 | NEW food clip 5 | ticket(check 3) 4 | hotel 06 pan 6 | end card 6
# All video plays as motion: real speed, or slowed with motion-compensated (DIS optical-flow) frame blending.
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
import render2 as r
sys.argv = sys.argv_saved
from final13 import grade, crop916, SP, PK, W, H
from ticket7 import F, logo_w, TNBLUE, NAVY, MUTE, PAPER
from ticket9 import stamp_k
from renderR7 import endcard_bg, warp_onto, OPENER, QUADS, FF, B
from renderR8 import ease_io5, ease_io
from renderR14 import navy_bg, place, read_clip, DRONE
FOOD2 = '/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/7ad517ba-hf_20261021_185542_4b4906b2-d93f-4a53-9580-11a27ce1a310.mp4'
r.SRC.update({'V01': B + 'V01.mp4', 'V03': B + 'V03.mp4'})
FONT = SP + 'thumb/Montserrat.ttf'; CAP_SIZE, CAP_CX, CAP_MAXW = 70, 520, 880

def caption_layer(text):
    f = ImageFont.truetype(FONT, CAP_SIZE); words = text.split(); lines = [text]
    if f.getlength(text) > CAP_MAXW:
        best = min(range(1, len(words)), key=lambda k: max(f.getlength(' '.join(words[:k])), f.getlength(' '.join(words[k:]))))
        lines = [' '.join(words[:best]), ' '.join(words[best:])]
    assert all(len(l.split()) <= 6 for l in lines)
    lh = int(CAP_SIZE * 1.18); y = 305 if len(lines) == 1 else 345; top = y - lh * len(lines) / 2      # top edge >= 262 px
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    for j, t in enumerate(lines): d.text((CAP_CX, top + j * lh + lh / 2), t, font=f, fill=(255, 255, 255, 255), anchor='mm')
    a = L.split()[3]; out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for blur, op, off in ((16, 0.38, (0, 4)), (4, 0.55, (2, 3))):                                     # subtle drop shadow
        s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s.paste((0, 0, 0, 255), (0, 0), a.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * op))); out.alpha_composite(s, off)
    out.alpha_composite(L); return np.asarray(out).astype(np.float32) / 255.0
def apply_cap(f, C, k):                                                       # fades in, fully on by frame 6
    if C is None: return f
    al = min(1.0, (k + 1) / 6.0); a = C[..., 3:4] * al
    return (f.astype(np.float32) * (1 - a) + C[..., :3] * 255 * a).clip(0, 255).astype(np.uint8)
def push(f, z):                                                               # gentle centred push (z >= 1)
    if z <= 1.0005: return f
    cw, ch = W / z, H / z; x0, y0 = (W - cw) / 2, (H - ch) / 2
    return cv2.resize(f[int(y0):int(y0 + ch), int(x0):int(x0 + cw)], (W, H), interpolation=cv2.INTER_CUBIC)

# --- motion-compensated frame blending on arbitrary-size frames
_dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
def interp_any(a, b, t):
    h, w = a.shape[:2]; s = lambda f: cv2.resize(cv2.cvtColor(f, cv2.COLOR_RGB2GRAY), (w // 2, h // 2))
    fab = cv2.resize(_dis.calc(s(a), s(b), None), (w, h)) * 2.0; fba = cv2.resize(_dis.calc(s(b), s(a), None), (w, h)) * 2.0
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    A = cv2.remap(a, gx - t * fab[..., 0], gy - t * fab[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    Bm = cv2.remap(b, gx - (1 - t) * fba[..., 0], gy - (1 - t) * fba[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    return (A * (1 - t) + Bm * t).clip(0, 255).astype(np.uint8)
def at_pos(frames, p):
    i = int(np.floor(p)); t = p - i
    if i >= len(frames) - 1: return frames[-1]
    return frames[i] if t < 0.02 else (frames[i + 1] if t > 0.98 else interp_any(frames[i], frames[i + 1], t))

class Ticket15:
    """ONE ticket design: header band (original logo file), 3 real-text lines with checkboxes (~40% larger than before),
    perforated stub holding the round stamp (square raster -> perfect circle). Nothing overlaps text."""
    LINES = ['16th Hole LOGE Suite', 'Food & drink included', 'Hotel included']
    def __init__(self, k):
        self.k = K = k; tw, th = 1000 * K, 600 * K; self.tw, self.th = tw, th; px = 772 * K; self.px = px
        m = Image.new('L', (tw, th), 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 0, tw - 1, th - 1), 24 * K, fill=255)
        for y in (0, th): md.ellipse((px - 22 * K, y - 22 * K, px + 22 * K, y + 22 * K), fill=0)
        rr = th / 9 / 2
        for j in range(9): md.ellipse((tw - rr, (2 * j + 1) * rr - rr, tw + rr, (2 * j + 1) * rr + rr), fill=0)
        self.mask = m; b = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(b)
        d.rectangle((0, 0, tw, 118 * K), fill=(*TNBLUE, 255)); lg = logo_w(250 * K); b.alpha_composite(lg, (30 * K, (118 * K - lg.size[1]) // 2))
        fe = F(24 * K); ev = 'PHOENIX OPEN · FEB 2027'; d.text((tw - 48 * K - fe.getlength(ev), 46 * K), ev, font=fe, fill=(255, 255, 255, 255))
        for y in range(int(150 * K), int(th - 30 * K), int(24 * K)): d.line((px, y, px, y + 12 * K), fill=(*MUTE, 255), width=3 * K)
        g = np.random.default_rng(3).normal(0, 3.0, (th, tw, 1)).astype(np.float32); g[:118 * K] = 0
        a = np.asarray(b).astype(np.float32); a[..., :3] = np.clip(a[..., :3] + g, 0, 255); self.base = Image.fromarray(a.astype(np.uint8))
        self.box = 80 * K; self.bx = 40 * K; self.tx = 148 * K; self.rows = [(172 + j * 132) * K for j in range(3)]
        self.font = F(44 * K)
        for t in self.LINES: assert self.tx + self.font.getlength(t) < px - 16 * K, ('text must clear the stub', t)
        self.stamp = stamp_k(170 * K); self.sc = ((px + tw - rr) / 2, (118 * K + th) / 2 + 4 * K)
        assert self.sc[0] - 85 * K > px + 6 * K and self.sc[0] + 85 * K < tw - rr, 'stamp sits fully inside the stub'
    def render(self, checked=(), active=None, prog=0.0, pop=1.0, phi=0.0):
        K = self.k; b = self.base.copy(); d = ImageDraw.Draw(b)
        for j, (txt, yt) in enumerate(zip(self.LINES, self.rows)):
            if j == active:
                hl = Image.new('RGBA', b.size, (0, 0, 0, 0)); ImageDraw.Draw(hl).rounded_rectangle((self.bx - 14 * K, yt - 16 * K, self.px - 20 * K, yt + self.box + 16 * K), 18 * K, fill=(*TNBLUE, 44))
                b.alpha_composite(hl); d = ImageDraw.Draw(b)
            d.text((self.tx, yt + self.box / 2), txt, font=self.font, fill=NAVY, anchor='lm')
            p = 1.0 if j in checked else (prog if j == active else 0.0); sc = pop if (j == active and p > 0) else 1.0
            bx = Image.new('RGBA', (self.box + 40 * K, self.box + 40 * K), (0, 0, 0, 0)); bd = ImageDraw.Draw(bx); o = 20 * K
            bd.rounded_rectangle((o, o, o + self.box, o + self.box), 14 * K, outline=(*(TNBLUE if p >= 1 else MUTE), 255), width=5 * K)
            if p > 0:
                bxl = self.box
                pts = [(o + 0.18 * bxl, o + 0.52 * bxl), (o + 0.42 * bxl, o + 0.76 * bxl), (o + 0.84 * bxl, o + 0.22 * bxl)]
                seg = [np.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), np.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1])]
                Lp = p * sum(seg); path = [pts[0]]
                if Lp <= seg[0]: path.append((pts[0][0] + (pts[1][0] - pts[0][0]) * Lp / seg[0], pts[0][1] + (pts[1][1] - pts[0][1]) * Lp / seg[0]))
                else: u = (Lp - seg[0]) / seg[1]; path += [pts[1], (pts[1][0] + (pts[2][0] - pts[1][0]) * u, pts[1][1] + (pts[2][1] - pts[1][1]) * u)]
                bd.line(path, fill=(*TNBLUE, 255), width=int(13 * K), joint='curve')
                for q in (path[0], path[-1]): bd.ellipse((q[0] - 6.5 * K, q[1] - 6.5 * K, q[0] + 6.5 * K, q[1] + 6.5 * K), fill=(*TNBLUE, 255))
            if abs(sc - 1) > 1e-3: n = round(bx.size[0] * sc); bx = bx.resize((n, n), Image.LANCZOS)          # uniform pop
            b.alpha_composite(bx, (int(self.bx + self.box / 2 - bx.size[0] / 2), int(yt + self.box / 2 - bx.size[1] / 2))); d = ImageDraw.Draw(b)
        st = self.stamp if phi % 360 == 0 else self.stamp.rotate(-phi, resample=Image.BICUBIC)
        b.alpha_composite(st, (int(self.sc[0] - st.size[0] / 2), int(self.sc[1] - st.size[1] / 2)))
        out = Image.new('RGBA', b.size, (0, 0, 0, 0)); out.paste(b, (0, 0), self.mask); return out

def build(out, tjson):
    T = json.load(open(tjson)); P = 60 / T['bpm']; D = T['drop_frame']; g0 = D / 30 + T['grid_offset']
    bf = lambda k: max(0, int(round((g0 + k * P) * 30))); seq = []; segs = []
    def seg(nm, a, b, kind): segs.append((nm, a, b, kind))
    TK2 = Ticket15(2); BG = navy_bg()
    # 1) drone 0:00-0:02, real speed, 9:16 on the 16th, light push
    a, b = 0, bf(-14); C = caption_layer('Phoenix Open 2027.'); src = read_clip(DRONE, 0.0, 2.05); cw = 1080 * 9 / 16; x0 = 0.5 * 1920 - cw / 2
    DF = [grade(np.asarray(Image.fromarray(s_).resize((W, H), Image.LANCZOS, box=(x0, 0, x0 + cw, 1080)))) for s_ in src]
    for k in range(b - a):                                                    # 24 fps source -> 30 fps by flow blending (no repeated frames)
        seq.append(apply_cap(push(at_pos(DF, k * 24 / 30), 1 + 0.025 * k / (b - a)), C, k))
    seg('drone (real speed)', a, b, 'video')
    # 2) V01 16th pan from 2.5 s, real speed (+ its crowd audio in the mix)
    a = len(seq); b = bf(-9); C = caption_layer('Everyone wants the 16th.')
    for k, f in enumerate(r.read('V01', 2.5, b - a)): seq.append(apply_cap(push(grade(f), 1 + 0.025 * k / (b - a)), C, k))
    seg('V01 pan (real speed)', a, b, 'video')
    # 3) opener: source frames 0-17 (clean, before any warp) slowed with flow blending; ticket tracked on the stub
    a = len(seq); b = bf(-5); n = b - a; C = caption_layer('TripNerd gets you in.')
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '19', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    osrc = np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3); s_ = H / 1912; nw = round(1080 * s_); ox = int((nw - W) / 2)
    OF = [grade(cv2.resize(f, (nw, H), interpolation=cv2.INTER_LANCZOS4)[:, ox:ox + W]) for f in osrc]
    face = TK2.render().resize((1000, 600), Image.LANCZOS)
    for k in range(n):
        p = k * 17.0 / (n - 1); i = min(16, int(p)); t = p - i
        f = at_pos(OF, p); q = np.float32(QUADS[i]) * (1 - t) + np.float32(QUADS[i + 1]) * t
        q = q * s_ - np.float32([ox, 0]); c = q.mean(0); q = (q - c) * 1.06 + c
        seq.append(apply_cap(warp_onto(f, face, q), C, k))
    seg('opener (src 0-0.71 s, ~37% flow-blended)', a, b, 'video')
    # 4) stamp: smooth push-in (1 beat ~0.5 s), flat 2D 360 spin (~1.8 s), lands, soft white flash, hard cut ON the drop
    a = len(seq); TK4 = Ticket15(4); S0, S1 = 1.04, 4.0; sx, sy = TK4.sc[0] / 4, TK4.sc[1] / 4; sp = bf(-4); land = D - 5
    def framing(u):
        s = S0 * (S1 / S0) ** u; return s, 540 - (sx - 500) * s * u, 960 - (sy - 300) * s * u
    tk = []
    for k in range(a, D):
        if k < sp: s, cx, cy = framing(ease_io((k - a + 1) / (sp - a))); phi = 0.0
        else: s, cx, cy = framing(1.0); phi = 0.0 if k >= land else 360 * ease_io5((k - sp + 1) / (land - sp + 1))
        c = BG.copy(); place(c, TK4.render(phi=phi), 4, cx, cy, s); f = np.asarray(c.convert('RGB'))
        if k > land: w_ = [0.15, 0.35, 0.6, 0.85][k - land - 1]; f = (f.astype(np.float32) * (1 - w_) + 255 * w_).astype(np.uint8)   # soft flash
        tk.append(f)
    assert np.array_equal(tk[land - a], tk[sp - a - 1]), 'stamp lands pixel-identical'
    seq += tk; seg('stamp push 0.5 s + spin 1.8 s + soft flash', a, D, 'graphic')
    # 5) DROP -> V03 bunker from 3.6 s (only appearance), real speed
    a = D; b = bf(5); C = caption_layer('Do the Phoenix Open with TripNerd.')
    for k, f in enumerate(r.read('V03', 3.6, b - a)):
        f = push(grade(f), 1 + 0.02 * k / (b - a))
        if k < 6: w_ = [0.9, 0.6, 0.38, 0.22, 0.1, 0.04][k]; f = (f.astype(np.float32) * (1 - w_) + 255 * w_).astype(np.uint8)
        seq.append(apply_cap(f, C, k))
    seg('V03 bunker (real speed, ONLY use)', a, b, 'video')
    # ticket segments: slide in once; later returns are hard cuts with a gentle push; check draws on the beat (0.3 s) + subtle pop
    ticks = []
    def ticket_seg(j, kb, slide):
        a = bf(kb); b = bf(kb + 4); hit = bf(kb + 1); ticks.append(hit / 30); out = []
        for k in range(a, b):
            c = BG.copy(); y = 960
            if slide: u = min(1, (k - a + 1) / 12); y = 2400 + (960 - 2400) * (1 - (1 - u) ** 3)
            prog = 0.0 if k < hit else min(1.0, (k - hit + 1) / 9); kp = k - hit - 9
            pop = 1.0 + (0.14 * np.sin(np.pi * kp / 6) if 0 <= kp < 6 else 0.0)
            place(c, TK2.render(checked=tuple(range(j)), active=j, prog=prog, pop=pop), 2, 540, y, 1.04 * (1 + 0.015 * (k - a) / (b - a)))
            out.append(np.asarray(c.convert('RGB')))
        return out
    # 6a) suite: ticket line 1 -> V01 0.0-1.93 s (guests at the suite rail), slowed to fill 6 beats with flow blending
    a = len(seq); seq += ticket_seg(0, 5, True); seg('ticket: line 1 (slides in, check on beat)', a, len(seq), 'graphic')
    a = len(seq); b = bf(15); n = b - a; S = [grade(f) for f in r.read('V01', 0.0, 58)]
    for k in range(n): seq.append(push(at_pos(S, k * 57.0 / (n - 1)), 1 + 0.02 * k / n))
    seg('suite footage (V01 0-1.93 s, ~67% flow-blended)', a, b, 'video')
    # 6b) food: ticket line 2 -> NEW food clip, first part trimmed, ~85% with flow blending, crop follows the pan
    a = len(seq); seq += ticket_seg(1, 15, False); seg('ticket: line 2', a, len(seq), 'graphic')
    a = len(seq); b = bf(24); n = b - a
    raw = subprocess.run([FF, '-v', 'error', '-i', FOOD2, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fv = np.frombuffer(raw, np.uint8).reshape(-1, 1080, 1920, 3); fv = [fv[i] for i in range(len(fv))]
    span = n / 30 * 0.85; t_end = (len(fv) - 1) / 24; t_start = t_end - span
    kt = np.array([t_start, 2.35, 2.65, 3.05, 3.45, t_end]); kx = np.array([0.17, 0.25, 0.42, 0.47, 0.62, 0.70])
    cw = 1080 * 9 / 16; xs = []
    for k in range(n):
        ts = t_start + k / 30 * 0.85; xs.append(np.interp(ts, kt, kx))
    xs = np.convolve(np.pad(xs, 6, mode='edge'), np.ones(13) / 13, 'valid')                               # smooth path
    for k in range(n):
        ts = t_start + k / 30 * 0.85; f = at_pos(fv, ts * 24)
        cx = float(np.clip(xs[k] * 1920, cw / 2, 1920 - cw / 2))
        seq.append(grade(np.asarray(Image.fromarray(f).resize((W, H), Image.LANCZOS, box=(cx - cw / 2, 0, cx + cw / 2, 1080)))))
    seg(f'food clip ({t_start:.2f}-{t_end:.2f} s src, 85% flow-blended, crop follows pan)', a, b, 'video')
    # 6c) hotel: ticket line 3 -> 06 Fairmont pool, the only still, one slow lateral pan; quiet dip in the mix
    a = len(seq); seq += ticket_seg(2, 24, False); seg('ticket: line 3', a, len(seq), 'graphic')
    a = len(seq); b = bf(34); n = b - a; travel = 620.0; fa = 0.3; v = travel / (n * (1 - fa / 2))
    xpos = lambda i: v * n * ((i / n) ** 2 / (2 * fa)) if i / n < fa else v * n * (fa / 2 + (i / n - fa))
    for i in range(n): seq.append(grade(crop916(PK + '06_hotel_pool_real.jpg', 0, 0.5, 1.0, x_px=2040 + xpos(i))))
    seg('hotel 06 pan (still photo, lateral pan only)', a, b, 'photo'); pan_v = v * W / 1620
    # 7) end card: light blue, original logo, headline + padded buttons fade in on beats; arrives at the pan's speed
    EB = endcard_bg(); LG = logo_w(880); a = len(seq); e = bf(40); m = 18; Dx = pan_v * m / 2
    head = r.text_layer('Do the trip right with TripNerd.', 66, 99, 870)
    fb = F(54); bt = 'Talk to a Nerd'; bb = fb.getbbox(bt); bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    fl = F(44); lt = 'Link in bio'; lb = fl.getbbox(lt); lw, lh_ = lb[2] - lb[0], lb[3] - lb[1]
    def fade(layer, k0, i):
        al = min(1.0, max(0.0, (i - k0 + 1) / 6)); 
        if al <= 0: return None
        x = layer.copy(); x.putalpha(x.split()[3].point(lambda q: int(q * al))); return x
    btn = Image.new('RGBA', (W, H), (0, 0, 0, 0)); pd = ImageDraw.Draw(btn); cy = 1085
    pd.rounded_rectangle((540 - bw / 2 - 96, cy - bh / 2 - 46, 540 + bw / 2 + 96, cy + bh / 2 + 46), (bh + 92) / 2, fill=(255, 255, 255, 255)); pd.text((540, cy), bt, font=fb, fill=(*TNBLUE, 255), anchor='mm')
    lnk = Image.new('RGBA', (W, H), (0, 0, 0, 0)); pd = ImageDraw.Draw(lnk); cy = 1265
    pd.rounded_rectangle((540 - lw / 2 - 72, cy - lh_ / 2 - 32, 540 + lw / 2 + 72, cy + lh_ / 2 + 32), (lh_ + 64) / 2, outline=(255, 255, 255, 255), width=5); pd.text((540, cy), lt, font=fl, fill=(255, 255, 255, 255), anchor='mm')
    for i in range(a, e):
        k = i - a; dx = int(round(Dx * (1 - k / m) ** 2)) if k < m else 0
        fg = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fg.alpha_composite(LG, (540 - LG.size[0] // 2, 560 - LG.size[1] // 2))
        for layer, kk in ((head, bf(35)), (btn, bf(36)), (lnk, bf(37))):
            x = fade(layer, kk, i)
            if x is not None: fg.alpha_composite(x)
        c = EB.copy(); c.alpha_composite(fg, (dx, 0)); seq.append(np.asarray(c.convert('RGB')))
    seg('end card', a, e, 'graphic')
    N = len(seq); assert N == e
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'dur_s': N / 30, 'drop_s': D / 30, 'v01_s': [bf(-14) / 30, bf(-9) / 30], 'v03_s': [D / 30, bf(5) / 30],
            'hotel_cut_s': bf(28) / 30, 'kick29_s': round(g0 + 29 * P, 4), 'ticks_s': ticks, 'end_s': N / 30,
            'segments': [(nm, a_ / 30, b_ / 30, kd) for nm, a_, b_, kd in segs], 'beat_times_s': [round(g0 + k * P, 4) for k in range(-18, 41)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(json.dumps(meta['segments']))
if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
