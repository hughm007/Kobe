# TripNerd PHX 2027 Reel, R16 "smooth premium": ~31.5 s, 124 BPM grid, every cut/check on a beat, only hard cut = stamp -> bunker drop.
# Beats (k = 0 is the drop): drone -22..-16 | stadium -16..-10 | opener -10..-5 | stamp -5..0 | DROP | bunker 0..6 |
#   full ticket 6..12 (shrinks to the corner over the last 0.6 s) | suite 12..20 | food 20..28 | pool 28..36 (card scales up 35..36) |
#   end card 36..43.  Checks draw on the persistent corner card at beats 12, 20, 28 (bar downbeats).
# Framing: 16:9 clips (drone, food) and the 4:3 pool photo are shown WHOLE as an inset (80% width) over a blurred (40 px), darkened
# copy of themselves; nothing 16:9 is cropped. V01/V03 are native 9:16 phone clips and play full frame (no crop); the suite uses
# a window of V01 shifted right/down toward the course view so the pillar stays at the edge.
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import render2 as r
from final13 import grade, PK, W, H
from ticket7 import F, logo_w, TNBLUE
from renderR7 import endcard_bg, OPENER, FF
from renderR8 import ease_io5, ease_io
from renderR14 import navy_bg, place, read_clip, DRONE
from renderR15 import caption_layer, at_pos, Ticket15, FOOD2

IW = 864                                                       # inset width = 80% of 1080
def smooth(u): u = min(1.0, max(0.0, u)); return u * u * (3 - 2 * u)
def sharpen(x): x = x.astype(np.float32); return (x * 1.3 - cv2.GaussianBlur(x, (0, 0), 1.0) * 0.3).clip(0, 255).astype(np.uint8)
def zoom(f, z):                                                # sub-pixel centred push on a full-frame clip (z >= 1)
    M = np.float32([[z, 0, 540 * (1 - z)], [0, z, 960 * (1 - z)]])
    return cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
def blur_bg(f):                                                # cover-fit, 40 px gaussian at full res (10 px at 1/4), darkened
    h, w = f.shape[:2]; s = max(270 / w, 480 / h)
    sm = cv2.resize(f, (max(270, round(w * s)), max(480, round(h * s))), interpolation=cv2.INTER_AREA)
    y0, x0 = (sm.shape[0] - 480) // 2, (sm.shape[1] - 270) // 2
    sm = cv2.GaussianBlur(sm[y0:y0 + 480, x0:x0 + 270].astype(np.float32), (0, 0), 10)
    return cv2.resize(sm, (W, H), interpolation=cv2.INTER_CUBIC) * 0.66
_rm = {}
def rmask(w, h):
    if (w, h) not in _rm:
        m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), 20, fill=255); _rm[(w, h)] = np.asarray(m)
    return _rm[(w, h)]
def inset(f, ww, cy, grow=1.0):
    """f: graded, sharpened source frame shown WHOLE (no crop) at width ww*grow, centred x, centre y = cy, over its own blur"""
    bg = blur_bg(f); h, w = f.shape[:2]; s = ww * grow / w
    M = np.float32([[s, 0, 540 - s * w / 2], [0, s, cy - s * h / 2]])
    t = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC).astype(np.float32)
    a = cv2.warpAffine(rmask(w, h), M, (W, H), flags=cv2.INTER_LINEAR).astype(np.float32)[..., None] / 255
    sh = cv2.GaussianBlur(np.roll(a[..., 0], 14, 0), (0, 0), 22) * 0.5
    out = bg * (1 - sh[..., None]); out = out * (1 - a) + t * a
    return out.clip(0, 255).astype(np.uint8), (540 - s * w / 2, cy - s * h / 2, 540 + s * w / 2, cy + s * h / 2)
def prep(frames, pw):                                          # resize once to ~inset size (area filter), grade, light sharpen
    out = []
    for f in frames:
        h, w = f.shape[:2]; ph = round(h * pw / w)
        out.append(sharpen(grade(cv2.resize(f, (pw, ph), interpolation=cv2.INTER_AREA if pw < w else cv2.INTER_LANCZOS4))))
    return out

def build(out, tjson):
    T = json.load(open(tjson)); P = 60 / T['bpm']; D = T['drop_frame']; g0 = D / 30 + T['grid_offset']
    bf = lambda k: int(round((g0 + k * P) * 30)); assert bf(-22) == 0, bf(-22)
    N = bf(43); XF = 14                                                          # 14-frame (0.47 s) transitions
    segs = []; ins_rect = {}
    def seg(nm, a, b, kind, **kw): segs.append(dict(name=nm, a=a, b=b, kind=kind, **kw))
    BG = navy_bg()

    # ---------- shot renderers: each returns a frame for any global index in its (extended) range ----------
    # 1) drone, 16:9, whole frame as inset, real speed (24 -> 30 fps by flow blending)
    c1 = bf(-16); dr = prep(read_clip(DRONE, 0.0, 3.6), 890)
    def drone(i): f, rc = inset(at_pos(dr, i * 24 / 30), IW, 830, 1 + 0.01 * i / 30); ins_rect['drone'] = rc; return f
    # 2) stadium: V01 from 2.5 s at 70% (flow), native 9:16 full frame
    c2 = bf(-10); a2 = c1 - XF // 2; st = [grade(f) for f in r.read('V01', 2.5, int((c2 + XF - a2) * 0.7) + 4)]
    def stadium(i): k = i - a2; return zoom(at_pos(st, k * 0.7), 1 + 0.008 * k / 30)
    # 3) opener: clean source frames 0-20 only, slowed with flow blending, native 9:16 full frame, NO ticket overlay
    c3 = bf(-5); a3 = c2 - XF // 2; n3 = c3 + XF // 2 - a3
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '21', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    osrc = np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3); nw = round(1080 * H / 1912); ox = (nw - W) // 2
    OF = [grade(cv2.resize(f, (nw, H), interpolation=cv2.INTER_LANCZOS4)[:, ox:ox + W]) for f in osrc]
    def opener(i): k = i - a3; return zoom(at_pos(OF, k * 20.0 / (n3 - 1)), 1 + 0.008 * k / 30)
    # 4) stamp: full ticket -> push into the stub stamp (1 beat), flat 2D 360 spin, soft white flash, HARD CUT on the drop
    TK4 = Ticket15(4); S0, S1 = 1.0, 4.0; sx, sy = TK4.sc[0] / 4, TK4.sc[1] / 4; sp = bf(-4); land = D - 5
    def framing(u): s = S0 * (S1 / S0) ** u; return s, 540 - (sx - 500) * s * u, 960 - (sy - 300) * s * u
    stamp_cache = {}
    def stamp(i):
        if i < c3: s, cx, cy = framing(0.0); phi = 0.0
        elif i < sp: s, cx, cy = framing(ease_io((i - c3 + 1) / (sp - c3))); phi = 0.0
        else: s, cx, cy = framing(1.0); phi = 0.0 if i >= land else 360 * ease_io5((i - sp + 1) / (land - sp + 1))
        key = (round(s, 5), round(cx, 3), round(cy, 3), round(phi, 4))
        if key not in stamp_cache:
            c = BG.copy(); place(c, TK4.render(phi=phi), 4, cx, cy, s); stamp_cache[key] = np.asarray(c.convert('RGB'))
        f = stamp_cache[key]
        if i > land: w_ = [0.15, 0.35, 0.6, 0.85][i - land - 1]; f = (f.astype(np.float32) * (1 - w_) + 255 * w_).astype(np.uint8)
        return f
    # 5) bunker: V03 from 3.6 s at 70% (flow), native 9:16 full frame; flash decays over the first 6 frames
    c5 = bf(6); bn = [grade(f) for f in r.read('V03', 3.6, int((c5 + XF - D) * 0.7) + 4)]
    def bunker(i):
        k = i - D; f = zoom(at_pos(bn, k * 0.7), 1 + 0.008 * k / 30)
        if k < 6: w_ = [0.9, 0.6, 0.38, 0.22, 0.1, 0.04][k]; f = (f.astype(np.float32) * (1 - w_) + 255 * w_).astype(np.uint8)
        return f
    NAVY = np.asarray(BG.convert('RGB'))
    def navy(i): return NAVY
    # 6) suite: V01 0.0-1.2 s (guests at the suite rail + the course), window shifted right/down so the pillar stays at the edge
    c6 = bf(12); c7 = bf(20); a6 = c6 - XF; n6 = c7 - a6
    su = [sharpen(grade(f[880:1840, 216:1080])) for f in r.read('V01', 0.0, 31)]
    def suite(i): k = i - a6; f, rc = inset(at_pos(su, k * 30.0 / (n6 - 1)), IW, 1060, 1 + 0.01 * k / 30); ins_rect['suite'] = rc; return f
    # 7) food: NEW clip 0.6-4.0 s at ~86% (24 -> 30 by flow), WHOLE 16:9 frame as inset; ends on the last frame (both drinks)
    c8 = bf(28); WH = 12; a7 = c7 - XF; n7 = c8 - WH - a7
    raw = subprocess.run([FF, '-v', 'error', '-i', FOOD2, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fv = np.frombuffer(raw, np.uint8).reshape(-1, 1080, 1920, 3); fd = prep([fv[j] for j in range(len(fv))], 890); L = len(fd) - 1; del fv, raw
    p0 = 0.6 * 24
    def food(i):
        k = min(i - a7, n7 - 1); f, rc = inset(at_pos(fd, p0 + (L - p0) * k / (n7 - 1)), IW, 830, 1 + 0.01 * (i - a7) / 30)
        ins_rect['food'] = rc; return f
    # 8) pool: the only still (06, 4:3), whole-photo inset, slow constant lateral pan of a 92% window (no zoom); dims under the card
    c9 = bf(36); a8 = c8 - WH; e8 = c9 + XF; PH = Image.open(PK + '06_hotel_pool_real.jpg').convert('RGB'); pw_, ph_ = PH.size
    ww, wh = pw_ * 0.92, ph_ * 0.92; y0p = (ph_ - wh) / 2
    def pool(i):
        x0 = (pw_ - ww) * (i - a8) / (e8 - a8)
        f = sharpen(grade(np.asarray(PH.resize((IW, round(IW * wh / ww)), Image.LANCZOS, box=(x0, y0p, x0 + ww, y0p + wh)))))
        f, rc = inset(f, IW, 900); ins_rect['pool'] = rc; return f
    # 9) end card: original logo settles (uniform 1.05 -> 1.0), headline + padded buttons fade in (0.3 s)
    EB = endcard_bg(); LG = logo_w(880)
    head = r.text_layer('Do the trip right with TripNerd.', 66, 99, 870)
    fb = F(54); bt = 'Talk to a Nerd'; bb = fb.getbbox(bt); bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    fl = F(44); lt = 'Link in bio'; lb = fl.getbbox(lt); lw, lh_ = lb[2] - lb[0], lb[3] - lb[1]
    btn = Image.new('RGBA', (W, H), (0, 0, 0, 0)); pd = ImageDraw.Draw(btn); cyb = 1085
    pd.rounded_rectangle((540 - bw / 2 - 96, cyb - bh / 2 - 46, 540 + bw / 2 + 96, cyb + bh / 2 + 46), (bh + 92) / 2, fill=(255, 255, 255, 255)); pd.text((540, cyb), bt, font=fb, fill=(*TNBLUE, 255), anchor='mm')
    lnk = Image.new('RGBA', (W, H), (0, 0, 0, 0)); pd = ImageDraw.Draw(lnk); cyl = 1265
    pd.rounded_rectangle((540 - lw / 2 - 72, cyl - lh_ / 2 - 32, 540 + lw / 2 + 72, cyl + lh_ / 2 + 32), (lh_ + 64) / 2, outline=(255, 255, 255, 255), width=5); pd.text((540, cyl), lt, font=fl, fill=(255, 255, 255, 255), anchor='mm')
    ec_times = {'logo': c9, 'head': c9 + 10, 'btn': bf(37), 'link': bf(37) + 8}
    def fade(layer, k0, i, n=9):
        al = min(1.0, max(0.0, (i - k0 + 1) / n))
        if al <= 0: return None
        x = layer.copy(); x.putalpha(x.split()[3].point(lambda q: int(q * al))); return x
    def endcard(i):
        u = min(1.0, max(0.0, (i - c9 + 1) / 18)); s = 1.05 - 0.05 * (1 - (1 - u) ** 3)
        lg = LG.resize((round(LG.size[0] * s), round(LG.size[1] * s)), Image.LANCZOS)
        assert abs(lg.size[0] / lg.size[1] - LG.size[0] / LG.size[1]) < 0.004, 'logo stays uniform'
        c = EB.copy(); c.alpha_composite(lg, (540 - lg.size[0] // 2, 560 - lg.size[1] // 2))
        for layer, kk in ((head, ec_times['head']), (btn, ec_times['btn']), (lnk, ec_times['link'])):
            x = fade(layer, kk, i)
            if x is not None: c.alpha_composite(x)
        return np.asarray(c.convert('RGB'))

    # ---------- persistent ticket card (one design, Ticket15 at 2x): full hold -> shrink to corner -> checks -> scale up ----------
    TK2 = Ticket15(2); CX, CY, CS = 815, 405, 0.45                                 # corner card: 450x270 at x 590-1040, y 270-540
    hits = [c6, c7, c8]; card_cache = {}
    def card_state(i):
        checked = tuple(j for j, h in enumerate(hits) if i >= h + 9); active = None; prog = 0.0; pop = 1.0
        for j, h in enumerate(hits):
            if i >= h: active = j
        if active is not None and i >= hits[active]:
            h = hits[active]; prog = min(1.0, (i - h + 1) / 9); kp = i - h - 9; pop = 1.0 + (0.14 * np.sin(np.pi * kp / 6) if 0 <= kp < 6 else 0.0)
            if prog >= 1: checked = tuple(sorted(set(checked) | {active}))
        if i >= c9 - 15: active = None
        return checked, active, prog, pop
    a_sh = c6 - 18; a_up = bf(35)
    def card_geom(i):
        if i < a_sh: return 540, 960, 1.0 + 0.02 * (i - (c5 - XF // 2)) / (a_sh - (c5 - XF // 2))
        if i < c6:
            u = ease_io((i - a_sh + 1) / 18); s_a = 1.02
            return 540 + (CX - 540) * u, 960 + (CY - 960) * u, s_a * (CS / s_a) ** u
        if i < a_up: return CX, CY, CS
        u = ease_io(min(1.0, (i - a_up + 1) / (c9 - a_up))); return CX + (540 - CX) * u, CY + (1000 - CY) * u, CS * (0.92 / CS) ** u
    def draw_card(f, i, alpha=1.0):
        st_ = card_state(i); key = (st_[0], st_[1], round(st_[2], 3), round(st_[3], 3))
        if key not in card_cache: card_cache[key] = TK2.render(checked=st_[0], active=st_[1], prog=st_[2], pop=st_[3])
        img = card_cache[key]
        if alpha < 1: img = img.copy(); img.putalpha(img.split()[3].point(lambda q: int(q * alpha)))
        cx, cy, s = card_geom(i); c = Image.fromarray(f).convert('RGBA'); place(c, img, 2, cx, cy, s)
        return np.asarray(c.convert('RGB'))

    HELD = {}
    def held(i):                                                                 # full-ticket hold: sub-pixel push, no stepping
        if 'f' not in HELD:
            c = BG.copy(); place(c, TK2.render(), 2, 540, 960, 1.0); HELD['f'] = np.asarray(c.convert('RGB'))
        return zoom(HELD['f'], card_geom(i)[2])
    # ---------- assemble ----------
    def blend(A, B, w): return (A.astype(np.float32) * (1 - w) + B.astype(np.float32) * w).clip(0, 255).astype(np.uint8)
    def dis(i, c, fa, fb_, pre=XF // 2):                                         # dissolve centred on c (pre frames before)
        w = smooth((i - (c - pre) + 0.5) / XF); return blend(fa(i), fb_(i), w)
    def whip(A, B, u):                                                           # soft directional whip-blur, motion right->left
        e = 0.5 - 0.5 * np.cos(np.pi * u); off = int(round(e * W)); cat = np.concatenate([A, B], 1)[:, off:off + W]
        L = int(1 + 120 * np.sin(np.pi * u)); k = np.ones((1, L), np.float32) / L
        return cv2.filter2D(cat, -1, k, borderType=cv2.BORDER_REFLECT)
    caps = [('Phoenix Open 2027.', 0, c1, 6), ('Everyone wants the 16th.', c1, c2, 9), ('TripNerd gets you in.', c2, c3, 9),
            ('Do the Phoenix Open with TripNerd.', D, c5, 9)]
    CL = [(caption_layer(t), a, b, fi) for t, a, b, fi in caps]
    for t, a, b, fi in caps: assert (b - a) / 30 >= 2.0, (t, (b - a) / 30)
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    import os; ONLY = [int(x) for x in os.environ.get('ONLY', '').split(',') if x]; shots = []
    for i in range(N):
        if ONLY and i not in ONLY: continue
        if i < c1 - XF // 2: f = drone(i)
        elif i < c1 + XF // 2: f = dis(i, c1, drone, stadium)
        elif i < c2 - XF // 2: f = stadium(i)
        elif i < c2 + XF // 2: f = dis(i, c2, stadium, opener)
        elif i < c3 - XF // 2: f = opener(i)
        elif i < c3 + XF // 2: f = dis(i, c3, opener, stamp)
        elif i < D: f = stamp(i)
        elif i < c5 - XF // 2: f = bunker(i)
        elif i < c5 + XF // 2: f = blend(bunker(i), held(i), smooth((i - (c5 - XF // 2) + 0.5) / XF))
        elif i < a_sh: f = held(i)
        elif i < c6 - XF: f = draw_card(navy(i), i)
        elif i < c6: f = draw_card(blend(navy(i), suite(i), smooth((i - (c6 - XF) + 0.5) / XF)), i)
        elif i < c7 - XF: f = draw_card(suite(i), i)
        elif i < c7: f = draw_card(blend(suite(i), food(i), smooth((i - (c7 - XF) + 0.5) / XF)), i)
        elif i < c8 - WH: f = draw_card(food(i), i)
        elif i < c8: f = draw_card(whip(food(c8 - WH - 1), pool(i), (i - (c8 - WH) + 1) / WH), i)
        elif i < a_up: f = draw_card(pool(i), i)
        elif i < c9:
            u = smooth((i - a_up + 1) / (c9 - a_up)); f = draw_card((pool(i).astype(np.float32) * (1 - 0.22 * u)).astype(np.uint8), i)
        elif i < c9 + XF:
            w = smooth((i - c9 + 0.5) / XF); f = blend((pool(i).astype(np.float32) * 0.78).astype(np.uint8), endcard(i), w)
            ca = 1 - smooth((i - c9 + 0.5) / 7)                                  # card clears before the logo is readable
            if ca > 0.01: f = draw_card(f, i, ca)
        else: f = endcard(i)
        for C, a, b, fi in CL:                                                   # caption fade in (fi frames) / out (9 frames)
            if a <= i < b:
                al = min(1.0, (i - a + 1) / fi, (b - i) / 9.0); m_ = C[..., 3:4] * al
                f = (f.astype(np.float32) * (1 - m_) + C[..., :3] * 255 * m_).clip(0, 255).astype(np.uint8)
        if ONLY: shots.append((i, f)); continue
        p_.stdin.write(np.ascontiguousarray(f).tobytes())
        if i % 60 == 0: print('frame', i, '/', N, flush=True)
    if ONLY:
        p_.stdin.close(); p_.wait(); th = [Image.fromarray(f).resize((360, 640)) for _, f in shots]; cols = 6; rows = (len(th) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * 360, rows * 660), 'black'); d = ImageDraw.Draw(sheet)
        for n, ((i, _), t) in enumerate(zip(shots, th)): sheet.paste(t, ((n % cols) * 360, (n // cols) * 660)); d.text(((n % cols) * 360 + 4, (n // cols) * 660 + 642), f'f{i} {i/30:.2f}s', fill='white')
        sheet.save(out + '.sheet.png'); print(json.dumps(ins_rect)); return
    assert np.array_equal(stamp(land), stamp(sp - 1)), 'stamp lands pixel-identical (no squish)'
    seg('drone (16:9 whole-frame inset, real speed, flow 24->30)', 0, c1, 'video', caption='Phoenix Open 2027.')
    seg('stadium pan (V01 2.5 s+, 70%, flow, native 9:16)', c1, c2, 'video', caption='Everyone wants the 16th.')
    seg('opener (src frames 0-20, ~23%, flow, native 9:16, no ticket overlay)', c2, c3, 'video', caption='TripNerd gets you in.')
    seg('stamp: push 0.48 s + flat 360 spin + soft flash -> HARD CUT', c3, D, 'graphic')
    seg('bunker (V03 3.6 s+, 70%, flow, native 9:16) - DROP', D, c5, 'video', caption='Do the Phoenix Open with TripNerd.')
    seg('full ticket hold, then 0.6 s shrink to corner card', c5, c6, 'graphic')
    seg('suite (V01 0-1.0 s, ~23%, flow, window toward course) + check 1', c6, c7, 'video')
    seg('food (new clip 0.6-4.0 s, ~86%, flow, whole 16:9 inset) + check 2', c7, c8, 'video')
    seg('pool (06 still, whole-photo inset, lateral pan) + check 3; card scales up', c8, c9, 'photo')
    seg('end card (logo settle, headline, buttons)', c9, N, 'graphic')
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'end_s': N / 30, 'drop_s': D / 30, 'stadium_s': [(c1 - XF // 2) / 30, (c2 + XF // 2) / 30],
            'bunker_s': [D / 30, (c5 + XF // 2) / 30], 'pool_s': [(c8 - WH) / 30, (c9 + XF) / 30], 'endcard_s': c9 / 30,
            'ticks_s': [h / 30 for h in hits], 'segments': [dict(s, a=s['a'] / 30, b=s['b'] / 30) for s in segs],
            'captions': [dict(text=t, start_s=a / 30, end_s=b / 30) for t, a, b, _ in caps], 'inset_rects': ins_rect,
            'card_corner_rect': [CX - 225, CY - 135, CX + 225, CY + 135], 'beat_times_s': [round(g0 + k * P, 4) for k in range(-22, 44)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(json.dumps(meta['segments'], indent=0))

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
