# TripNerd Phoenix Open 2027 Reel, "ticket checklist" version (owner brief 2026-10-21). 1080x1920, 30 fps, 124 BPM grid.
# Every video asset plays as real motion (no stills, freezes or Ken Burns); the only still is the hotel pool (06), which pans.
#   drone 0:00-0:02 (4 beats) | V01 16th pan from 2.5 s (5) | opener real frames 0-22 (~65%, 3) | ticket push-in + flat stamp
#   spin (3) -> flash/DROP | V03 bunker from 3.6 s (5, ONLY use of V03) | ticket ck1 (2) + V01 suite rail 0.0-1.93 s (4) |
#   ticket ck2 (2) + AI food clip, wide two-panel stack (3) | ticket ck3 (2) + 06 hotel pan (5) | end card (7)
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
import render2 as r
sys.argv = sys.argv_saved
from final13 import grade, crop916, SP, PK, W, H
from ticket7 import F, logo_w, TNBLUE, NAVY, INK, MUTE, PAPER
from ticket9 import stamp_k
from renderR7 import endcard_bg, warp_onto, OPENER, QUADS, FF, B
from renderR8 import ease_io5, ease_io
DRONE = '/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/56bd8250-hf_20261021_183239_f0d22a57-3a41-4e9c-b622-c60e1d30e913.mp4'
FOOD = '/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/9900a359-hf_20261021_175347_4947cdf7-6cd6-401e-854d-19d38f14845f.mp4'
FONT = SP + 'thumb/Montserrat.ttf'; CAP_SIZE, CAP_Y, CAP_CX, CAP_MAXW = 70, None, 520, 880   # x 80-960: clear of the right UI
NAVYBG = None

def caption(text, y=CAP_Y):
    """same font/size everywhere; white with a subtle two-layer shadow; no box, no pop-in"""
    f = ImageFont.truetype(FONT, CAP_SIZE); words = text.split(); lines = [text]
    if f.getlength(text) > CAP_MAXW:
        best = min(range(1, len(words)), key=lambda k: max(f.getlength(' '.join(words[:k])), f.getlength(' '.join(words[k:]))))
        lines = [' '.join(words[:best]), ' '.join(words[best:])]
    lh = int(CAP_SIZE * 1.18); y = (305 if len(lines) == 1 else 345) if y is None else y; top = y - lh * len(lines) / 2   # top edge >= 262
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    for j, t in enumerate(lines): d.text((CAP_CX, top + j * lh + lh / 2), t, font=f, fill=(255, 255, 255, 255), anchor='mm')
    a = L.split()[3]; out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for blur, op, off in ((16, 0.38, (0, 4)), (4, 0.55, (2, 3))):
        s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s.paste((0, 0, 0, 255), (0, 0), a.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * op)))
        out.alpha_composite(s, off)
    out.alpha_composite(L); return out
def with_cap(f, L):
    img = Image.fromarray(f).convert('RGBA'); img.alpha_composite(L); return np.asarray(img.convert('RGB'))

def navy_bg():
    y = np.linspace(0, 1, H)[:, None, None]; x = np.linspace(-1, 1, W)[None, :, None]
    top, bot = np.array([18, 34, 68]), np.array([10, 18, 40])
    v = (top * (1 - y) + bot * y) * (1 - 0.18 * x ** 2)
    return Image.fromarray(v.clip(0, 255).astype(np.uint8)).convert('RGBA')

class ChecklistTicket:
    """ONE ticket design used everywhere: header band with the ORIGINAL logo file, three real-text lines with checkboxes,
    perforated stub on the right holding the round stamp (square raster -> uniform scale -> perfect circle).
    Checks are drawn-on strokes inside the boxes; highlight is a soft tint behind the active line. Nothing overlaps text."""
    LINES = ['16th Hole LOGE Suite', 'Food & drink included', 'Hotel included']
    def __init__(self, k):
        self.k = K = k; tw, th = 1000 * K, 540 * K; self.tw, self.th = tw, th; px = 735 * K; self.px = px
        m = Image.new('L', (tw, th), 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 0, tw - 1, th - 1), 22 * K, fill=255)
        for y in (0, th): md.ellipse((px - 22 * K, y - 22 * K, px + 22 * K, y + 22 * K), fill=0)
        rr = th / 9 / 2
        for j in range(9): md.ellipse((tw - rr, (2 * j + 1) * rr - rr, tw + rr, (2 * j + 1) * rr + rr), fill=0)
        self.mask = m
        b = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(b)
        d.rectangle((0, 0, tw, 118 * K), fill=(*TNBLUE, 255))
        lg = logo_w(250 * K); b.alpha_composite(lg, (30 * K, (118 * K - lg.size[1]) // 2))
        fe = F(24 * K); ev = 'PHOENIX OPEN · FEB 2027'; d.text((tw - 48 * K - fe.getlength(ev), 46 * K), ev, font=fe, fill=(255, 255, 255, 255))
        for x in range(int(150 * K), int(th - 30 * K), int(24 * K)): d.line((px, x, px, x + 12 * K), fill=(*MUTE, 255), width=3 * K)
        g = np.random.default_rng(3).normal(0, 3.0, (th, tw, 1)).astype(np.float32); g[:118 * K] = 0
        a = np.asarray(b).astype(np.float32); a[..., :3] = np.clip(a[..., :3] + g, 0, 255); self.base = Image.fromarray(a.astype(np.uint8))
        self.rows = [(178 + j * 112) * K for j in range(3)]               # row top y
        self.font = F(44 * K); self.box = 58 * K; self.bx = 44 * K; self.tx = 128 * K
        for yt in self.rows: assert self.tx + self.font.getlength(max(self.LINES, key=len)) < px - 20 * K, 'text must clear the stub'
        self.stamp = stamp_k(200 * K); self.sc = ((px + tw - rr) / 2, (118 * K + th) / 2 + 6 * K)
        assert self.sc[0] - 100 * K > px + 8 * K and self.sc[0] + 100 * K < tw - rr, 'stamp sits fully inside the stub'
    def render(self, checked=(), active=None, prog=0.0, phi=0.0):
        K = self.k; b = self.base.copy(); d = ImageDraw.Draw(b)
        for j, (txt, yt) in enumerate(zip(self.LINES, self.rows)):
            if j == active:
                hl = Image.new('RGBA', b.size, (0, 0, 0, 0)); ImageDraw.Draw(hl).rounded_rectangle((self.bx - 14 * K, yt - 14 * K, self.px - 22 * K, yt + self.box + 14 * K), 16 * K, fill=(*TNBLUE, 46))
                b.alpha_composite(hl); d = ImageDraw.Draw(b)
            d.rounded_rectangle((self.bx, yt, self.bx + self.box, yt + self.box), 10 * K, outline=(*MUTE, 255), width=4 * K)
            d.text((self.tx, yt + self.box / 2), txt, font=self.font, fill=NAVY, anchor='lm')
            p = 1.0 if j in checked else (prog if j == active else 0.0)
            if p > 0:
                pts = [(self.bx + 12 * K, yt + 31 * K), (self.bx + 25 * K, yt + 44 * K), (self.bx + 48 * K, yt + 13 * K)]
                seg = [np.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), np.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1])]
                L = p * sum(seg); path = [pts[0]]
                if L <= seg[0]: path.append((pts[0][0] + (pts[1][0] - pts[0][0]) * L / seg[0], pts[0][1] + (pts[1][1] - pts[0][1]) * L / seg[0]))
                else:
                    u = (L - seg[0]) / seg[1]; path += [pts[1], (pts[1][0] + (pts[2][0] - pts[1][0]) * u, pts[1][1] + (pts[2][1] - pts[1][1]) * u)]
                d.line(path, fill=(*TNBLUE, 255), width=9 * K, joint='curve')
                for q in (path[0], path[-1]): d.ellipse((q[0] - 4.5 * K, q[1] - 4.5 * K, q[0] + 4.5 * K, q[1] + 4.5 * K), fill=(*TNBLUE, 255))
        st = self.stamp if phi % 360 == 0 else self.stamp.rotate(-phi, resample=Image.BICUBIC)
        b.alpha_composite(st, (int(self.sc[0] - st.size[0] / 2), int(self.sc[1] - st.size[1] / 2)))
        out = Image.new('RGBA', b.size, (0, 0, 0, 0)); out.paste(b, (0, 0), self.mask); return out

def place(canvas, raster, k, cx, cy, s):
    t = raster.resize((max(1, round(raster.size[0] * s / k)), max(1, round(raster.size[1] * s / k))), Image.LANCZOS)
    sh = Image.new('RGBA', (t.size[0] + 120, t.size[1] + 120), (0, 0, 0, 0)); sh.paste((0, 0, 0, 150), (60 + int(8 * s), 60 + int(20 * s)), t.split()[3])
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(max(2, 16 * s))), (int(cx - t.size[0] / 2 - 60), int(cy - t.size[1] / 2 - 60)))
    canvas.alpha_composite(t, (int(round(cx - t.size[0] / 2)), int(round(cy - t.size[1] / 2))))

def read_clip(path, t0, dur):
    raw = subprocess.run([FF, '-v', 'error', '-ss', str(t0), '-t', str(dur), '-i', path, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 1080, 1920, 3)

def build(out, tjson):
    T = json.load(open(tjson)); P = 60 / T['bpm']; D = T['drop_frame']; g0 = D / 30 + T['grid_offset']
    bf = lambda k: max(0, int(round((g0 + k * P) * 30))); seq = []; shots = []; vids = {}
    def mark(nm, a, b, video=True): shots.append((nm, a, b)); vids[nm] = (a, b, video)
    TK2 = ChecklistTicket(2); BG = navy_bg()
    # 1) drone 0:00-0:02 at real speed (24 -> 30 fps by nearest source frame), 9:16 on the 16th stadium
    a, b = 0, bf(-11); src = read_clip(DRONE, 0.0, 2.05); L = caption('Phoenix Open 2027.'); cw = 1080 * 9 / 16; x0 = T['drone_cx'] * 1920 - cw / 2
    for k in range(b - a):
        f = src[min(len(src) - 1, int(k * 24 / 30))]
        seq.append(with_cap(grade(np.asarray(Image.fromarray(f).resize((W, H), Image.LANCZOS, box=(x0, 0, x0 + cw, 1080)))), L))
    mark('drone', a, b)
    # 2) V01 real 16th pan from 2.5 s
    a = len(seq); b = bf(-6); L = caption('Everyone wants the 16th.'); seq += [with_cap(grade(f), L) for f in r.read('V01', 2.5, b - a)]; mark('V01 pan', a, b)
    # 3) opener: REAL frames 0-22 held (~65% speed), the same ticket design tracked on the stub
    a = len(seq); b = bf(-3); n = b - a; L = caption('TripNerd gets you in.')
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '23', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    osrc = np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3); s_ = H / 1912; nw = round(1080 * s_); ox = int((nw - W) / 2)
    face = TK2.render().resize((1000, 540), Image.LANCZOS)
    for k in range(n):
        i = min(22, int(k * 23 / n)); f = grade(cv2.resize(osrc[i], (nw, H), interpolation=cv2.INTER_LANCZOS4)[:, ox:ox + W])
        q = np.float32(QUADS[i]) * s_ - np.float32([ox, 0]); c = q.mean(0); q = (q - c) * 1.06 + c
        seq.append(with_cap(warp_onto(f, face, q), L))
    mark('opener', a, b)
    # 4) push-in on the stamp (1 beat, single scale factor), then flat 2D 360 spin in place (2 beats); lands on the frame before the flash
    a = len(seq); TK4 = ChecklistTicket(4); S0, S1 = 1.04, 3.6; sx, sy = TK4.sc[0] / 4, TK4.sc[1] / 4
    def framing(u):
        s = S0 * (S1 / S0) ** u; return s, 540 - (sx - 500) * s * u, 960 - (sy - 270) * s * u
    sp = bf(-2); tk = []
    for k in range(a, D):
        if k < sp: s, cx, cy = framing(ease_io((k - a + 1) / (sp - a))); phi = 0.0
        else: s, cx, cy = framing(1.0); phi = 0.0 if k == D - 1 else 360 * ease_io5((k - sp + 1) / (D - sp))
        c = BG.copy(); place(c, TK4.render(phi=phi), 4, cx, cy, s); tk.append(np.asarray(c.convert('RGB')))
    assert np.array_equal(tk[-1], tk[sp - a - 1]), 'stamp must land pixel-identical'
    seq += tk; mark('stamp push+spin', a, D, video=False)
    # 5) DROP: white flash -> V03 from 3.6 s (the ONLY bunker appearance)
    a = D; b = bf(5); L = caption('Do the Phoenix Open with TripNerd.')
    for k, f in enumerate(r.read('V03', 3.6, b - a)):
        f = grade(f)
        if k < 4: f = (f.astype(np.float32) * (1 - [1, .7, .4, .15][k]) + 255 * [1, .7, .4, .15][k]).astype(np.uint8)
        seq.append(with_cap(f, L) if k >= 1 else f)
    mark('V03 bunker', a, b)
    # checklist ticket segment helper: slide in (first time) or hard cut back; the line's check draws on the beat
    def ticket_seg(j, kb, slide):
        a = bf(kb); b = bf(kb + 2); hit = bf(kb + 1); out = []
        for k in range(a, b):
            c = BG.copy(); y = 960
            if slide: u = min(1, (k - a + 1) / 10); y = 2400 + (960 - 2400) * (1 - (1 - u) ** 3)
            prog = 0.0 if k < hit else min(1.0, (k - hit + 1) / 6)
            place(c, TK2.render(checked=tuple(range(j)), active=j, prog=prog), 2, 540, y, 1.04); out.append(np.asarray(c.convert('RGB')))
        return out
    # 6) checklist 1 -> real suite footage (V01 0.0-1.93 s: guests at the rail under the canopy)
    a = len(seq); seq += ticket_seg(0, 5, True); mark('ticket ck1', a, len(seq), video=False)
    a = len(seq); b = bf(11); L = caption('Your 16th Hole LOGE Suite.'); seq += [with_cap(grade(f), L) for f in r.read('V01', 0.0, b - a)]; mark('suite (V01 0-1.9s)', a, b)
    # 7) checklist 2 -> AI food clip as real video, WIDE: two stacked 1080x957 windows (each 1215x1077 of the 1920x1080 source, downscaled)
    a = len(seq); seq += ticket_seg(1, 11, False); mark('ticket ck2', a, len(seq), video=False)
    a = len(seq); b = bf(16); n = b - a; L = caption('Food & drink included.')
    # top: 1.45 s on, right window (both drinks + tostadas; caption band crosses counter/glasses); bottom: 0.0 s on, left window
    # (flatbread + tostadas). Both ~55% speed from REAL frames (held, no synthesis) - same treatment as the opener.
    fa = read_clip(FOOD, 1.45, 1.2); fb_ = read_clip(FOOD, 0.0, 1.2)
    for k in range(n):
        j = int(k * 0.55 * 24 / 30)
        top = Image.fromarray(fa[min(len(fa) - 1, j)]).resize((W, 957), Image.LANCZOS, box=(705, 0, 1920, 1077))
        bot = Image.fromarray(fb_[min(len(fb_) - 1, j)]).resize((W, 957), Image.LANCZOS, box=(0, 3, 1215, 1080))
        c = Image.new('RGB', (W, H), PAPER); c.paste(top, (0, 0)); c.paste(bot, (0, 963)); seq.append(with_cap(grade(np.asarray(c)), L))
    mark('food (2-panel)', a, b)
    # 8) checklist 3 -> 06 hotel pool (the only still), one slow lateral pan; ease in then constant into the end card
    a = len(seq); seq += ticket_seg(2, 16, False); mark('ticket ck3', a, len(seq), video=False)
    a = len(seq); b = bf(23); n = b - a; L = caption('Fairmont Scottsdale Princess included.'); travel = 600.0; fa_ = 0.3; v = travel / (n * (1 - fa_ / 2))
    xpos = lambda i: v * n * ((i / n) ** 2 / (2 * fa_)) if i / n < fa_ else v * n * (fa_ / 2 + (i / n - fa_))
    for i in range(n): seq.append(with_cap(grade(crop916(PK + '06_hotel_pool_real.jpg', 0, 0.5, 1.0, x_px=2050 + xpos(i))), L))
    mark('hotel 06 pan', a, b, video=False); pan_v = v * W / 1620
    # 9) end card: light blue, original logo, headline, padded buttons; arrives at the pan's speed
    EB = endcard_bg(); LG = logo_w(880); a = len(seq); e = bf(30); m = 18; Dx = pan_v * m / 2
    head = r.text_layer('Do the trip right with TripNerd.', 66, 99, 870)
    fb = F(54); bt = 'Talk to a Nerd'; bb = fb.getbbox(bt); bw, bh = bb[2] - bb[0], bb[3] - bb[1]; padx, pady = 96, 46
    fl = F(44); lt = 'Link in bio'; lb = fl.getbbox(lt); lw, lh_ = lb[2] - lb[0], lb[3] - lb[1]; lpx, lpy = 70, 32
    for i in range(a, e):
        k = i - a; dx = int(round(Dx * (1 - k / m) ** 2)) if k < m else 0
        fg = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fg.alpha_composite(LG, (540 - LG.size[0] // 2, 560 - LG.size[1] // 2))
        if i >= bf(24): fg.alpha_composite(head)
        pd = ImageDraw.Draw(fg)
        if i >= bf(25):
            cy = 1085; pd.rounded_rectangle((540 - bw / 2 - padx, cy - bh / 2 - pady, 540 + bw / 2 + padx, cy + bh / 2 + pady), (bh + 2 * pady) / 2, fill=(255, 255, 255, 255))
            pd.text((540, cy), bt, font=fb, fill=(*TNBLUE, 255), anchor='mm')
        if i >= bf(26):
            cy = 1265; pd.rounded_rectangle((540 - lw / 2 - lpx, cy - lh_ / 2 - lpy, 540 + lw / 2 + lpx, cy + lh_ / 2 + lpy), (lh_ + 2 * lpy) / 2, outline=(255, 255, 255, 255), width=5)
            pd.text((540, cy), lt, font=fl, fill=(255, 255, 255, 255), anchor='mm')
        c = EB.copy(); c.alpha_composite(fg, (dx, 0)); seq.append(np.asarray(c.convert('RGB')))
    mark('end card', a, e, video=False)
    N = len(seq); assert N == e
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'dur_s': N / 30, 'drop_s': D / 30, 'v03_src': 3.6, 'v03_out_s': bf(5) / 30, 'hotel_cut_s': bf(18) / 30,
            'kick19_s': round(g0 + 19 * P, 4), 'end_s': N / 30, 'shots': [(nm, a_ / 30, b_ / 30) for nm, a_, b_ in shots],
            'video_segments': {nm: [a_, b_] for nm, (a_, b_, vid) in vids.items() if vid}, 'beat_times_s': [round(g0 + k * P, 4) for k in range(-15, 31)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(json.dumps(meta['shots']))
if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
