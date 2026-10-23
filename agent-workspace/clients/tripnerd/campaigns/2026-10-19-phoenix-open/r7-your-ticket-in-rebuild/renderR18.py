# TripNerd PHX 2027 Reel, R18: R17 + six owner fixes (food judder, 36 px feather, bunker->ticket dissolve, 35% corner card
#  + left captions, opener window off the pillar, 2 s eased push-in with 1.5 s spin). Earlier R17 notes below still apply.
# R17 notes:
#  1 ticket shrinks continuously (0.6 s ease-in-out) into a 30%-larger corner card while the suite dissolves in underneath
#  2 no ticket over the bunker: bunker dissolves to navy, then the ticket slides in opaque
#  3 food at ~60% with flow                          4 suite = V01 5.6-8.2 s course view from the suite rail (no pillar)
#  5 drone + pool full-frame 9:16; stadium/opener/bunker/suite/food = 80% inset, 60 px blurred darkened bg, 20 px feathered edge
#  6 every transition except the drop = 0.4 s (12-frame) cross-dissolve that lands on the beat
#  7 proof-shot captions: "Inside the 16th." / "Eat. Drink. Watch." / "Then unwind at the Fairmont."
# Same 124 BPM grid as R16 (drop frame 319, 944 frames). Layout: captions y 262-430, corner card x 455-1040 y 445-796.
import subprocess, sys, os, json, numpy as np, cv2
from PIL import Image, ImageDraw
import render2 as r
from final13 import grade, crop916, PK, W, H
from ticket7 import F, logo_w, TNBLUE
from renderR7 import endcard_bg, OPENER, FF
from renderR8 import ease_io5, ease_io
from renderR14 import navy_bg, place, read_clip, DRONE
from renderR15 import caption_layer, at_pos, interp_any, Ticket15, FOOD2, FONT, CAP_SIZE
from PIL import ImageFont, ImageFilter
from renderR16 import smooth, sharpen, zoom

IW = 864; XF = 12
def blur_bg(f):                                                # cover-fit, 60 px gaussian (15 px at 1/4 res), darkened
    h, w = f.shape[:2]; s = max(270 / w, 480 / h)
    sm = cv2.resize(f, (max(270, round(w * s)), max(480, round(h * s))), interpolation=cv2.INTER_AREA)
    y0, x0 = (sm.shape[0] - 480) // 2, (sm.shape[1] - 270) // 2
    sm = cv2.GaussianBlur(sm[y0:y0 + 480, x0:x0 + 270].astype(np.float32), (0, 0), 15)
    return cv2.resize(sm, (W, H), interpolation=cv2.INTER_CUBIC) * 0.62
_fm = {}
def feather(w, h, fw):                                         # alpha ramps 0 -> 1 over fw px from every edge (smoothstep)
    key = (w, h, round(fw, 2))
    if key not in _fm:
        dx = np.minimum(np.arange(w), w - 1 - np.arange(w)); dy = np.minimum(np.arange(h), h - 1 - np.arange(h))
        m = np.clip(np.minimum.outer(dy, dx) / fw, 0, 1); _fm[key] = (m * m * (3 - 2 * m) * 255).astype(np.float32)
    return _fm[key]
def inset(f, cy, grow=1.0):
    """whole source frame at 80% width (x grow), centred x, centre y = cy, 36 px feathered edge (all sides), over its own 60 px blur"""
    bg = blur_bg(f); h, w = f.shape[:2]; s = IW * grow / w
    M = np.float32([[s, 0, 540 - s * w / 2], [0, s, cy - s * h / 2]])
    t = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC).astype(np.float32)
    a = cv2.warpAffine(feather(w, h, 36 / s), M, (W, H), flags=cv2.INTER_LINEAR)[..., None] / 255
    return (bg * (1 - a) + t * a).clip(0, 255).astype(np.uint8)
def caption_left(text, x0=44, maxw=596, top=262):
    """same font/size/shadow as caption_layer, left-aligned in the top-left zone so it never meets the corner card (x >= 660)"""
    f = ImageFont.truetype(FONT, CAP_SIZE); words = text.split(); lines = [words[0]]
    for wd in words[1:]:
        if f.getlength(lines[-1] + ' ' + wd) <= maxw: lines[-1] += ' ' + wd
        else: lines.append(wd)
    assert all(f.getlength(l) <= maxw for l in lines) and all(len(l.split()) <= 6 for l in lines), lines
    lh = int(CAP_SIZE * 1.18); L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    for j, t in enumerate(lines): d.text((x0, top + j * lh + lh / 2), t, font=f, fill=(255, 255, 255, 255), anchor='lm')
    a = L.split()[3]; out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for blur, op, off in ((16, 0.38, (0, 4)), (4, 0.55, (2, 3))):
        sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.paste((0, 0, 0, 255), (0, 0), a.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * op))); out.alpha_composite(sh, off)
    out.alpha_composite(L); return np.asarray(out).astype(np.float32) / 255.0
def prep(frames, pw):
    out = []
    for f in frames:
        h, w = f.shape[:2]; out.append(sharpen(grade(cv2.resize(f, (pw, round(h * pw / w)), interpolation=cv2.INTER_AREA if pw < w else cv2.INTER_LANCZOS4))))
    return out

def build(out, tjson):
    T = json.load(open(tjson)); P = 60 / T['bpm']; D = T['drop_frame']; g0 = D / 30 + T['grid_offset']
    bf = lambda k: int(round((g0 + k * P) * 30)); assert bf(-22) == 0
    N = bf(43); c1, c2, c3, c5, c6, c7, c8, c9 = bf(-16), bf(-10), bf(-5), bf(6), bf(12), bf(20), bf(28), bf(36)
    BG = navy_bg(); NAVY = np.asarray(BG.convert('RGB')); VY = 960; FY = 1059          # vertical inset centre / food inset centre

    # 1) drone: FULL FRAME 9:16 (full-height window centred on the 16th), real speed, 24 -> 30 by flow, slow push
    cw = 1080 * 9 / 16; x0 = 960 - cw / 2
    dr = [sharpen(grade(np.asarray(Image.fromarray(f).resize((W, H), Image.LANCZOS, box=(x0, 0, x0 + cw, 1080))))) for f in read_clip(DRONE, 0.0, 2.9)]
    def drone(i): return zoom(at_pos(dr, i * 24 / 30), 1 + 0.008 * i / 30)
    # 2) stadium: V01 2.5 s+ at 70% (flow), 80% inset
    a2 = c1 - XF; st = prep(r.read('V01', 2.5, int((c2 - a2) * 0.7) + 4), 890)
    def stadium(i): k = i - a2; return inset(at_pos(st, k * 0.7), VY, 1 + 0.01 * k / 30)
    # 3) opener: clean source frames 0-20, flow-slowed, 80% inset, no ticket overlay
    a3 = c2 - XF; n3 = c3 - a3
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '21', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    OF = prep([f[223:1912, 130:1080] for f in np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3)], 890)   # window clear of the left pillar
    def opener(i): k = i - a3; return inset(at_pos(OF, k * 20.0 / (n3 - 1)), VY, 1 + 0.01 * k / 30)
    # 4) stamp: full ticket -> push into the stub stamp (1 beat), flat 2D 360 spin, soft white flash, HARD CUT on the drop
    TK4 = Ticket15(4); S0, S1 = 1.0, 4.0; sx, sy = TK4.sc[0] / 4, TK4.sc[1] / 4; land = D - 5; pe = land - 7; ps = pe - 60; sp = pe - 45; scache = {}
    def framing(u): s = S0 * (S1 / S0) ** u; return s, 540 - (sx - 500) * s * u, 960 - (sy - 300) * s * u
    def stamp(i):
        s, cx, cy = framing(ease_io(min(1.0, max(0.0, (i - ps + 1) / 60))))                    # 2.0 s eased push
        phi = 360 * ease_io5((i - sp + 1) / 45) if sp <= i < pe else 0.0                        # 1.5 s flat spin inside it
        key = (round(s, 5), round(cx, 3), round(cy, 3), round(phi, 4))
        if key not in scache: c = BG.copy(); place(c, TK4.render(phi=phi), 4, cx, cy, s); scache[key] = np.asarray(c.convert('RGB'))
        f = scache[key]
        if i > land: w_ = [0.15, 0.35, 0.6, 0.85][i - land - 1]; f = (f.astype(np.float32) * (1 - w_) + 255 * w_).astype(np.uint8)
        return f
    # 5) bunker: V03 3.6 s+ at 70% (flow), 80% inset; white flash decays over 6 frames after the cut
    bn = prep(r.read('V03', 3.6, int((c5 - D) * 0.7) + 4), 890)
    def bunker(i):
        k = i - D; f = inset(at_pos(bn, k * 0.7), VY, 1 + 0.01 * k / 30)
        if k < 6: w_ = [0.9, 0.6, 0.38, 0.22, 0.1, 0.04][k]; f = (f.astype(np.float32) * (1 - w_) + 255 * w_).astype(np.uint8)
        return f
    # 6) suite: V01 5.6-8.15 s (green, bunkers and crowd from the suite rail; no pillar) at 60% (flow), 80% inset
    a6 = c6 - XF; su = prep(r.read('V01', 5.6, int((c7 - a6) * 0.6) + 4), 890)
    def suite(i): k = i - a6; return inset(at_pos(su, k * 0.6), VY, 1 + 0.01 * k / 30)
    # 7) food: new clip's last 1.1 s at 60% (flow, 24 fps) -> approved Seedance 2.5 forward extension (job 3078f1f1) at 100%:
    #    the camera eases to a stop with BOTH drinks fully in frame, held >1 s before the pool dissolve. Whole 16:9 frame, 80% inset.
    a7 = c7 - XF; n7 = c8 - a7; KA = 56; HOLD = 42                            # 1.0 s hold + 0.4 s dissolve
    def load24(path):
        raw = subprocess.run([FF, '-v', 'error', '-i', path, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
        v = np.frombuffer(raw, np.uint8).reshape(-1, 1080, 1920, 3); return prep([v[j] for j in range(len(v))], 890)
    import glob
    EXT = sorted(glob.glob('/root/.claude/uploads/*/*3078f1f1*.mp4')); fd = load24(FOOD2); L = len(fd) - 1
    vpos = np.array([j + (j >= 63) + (j >= 96) for j in range(len(fd))], np.float64); VL = vpos[-1]
    def vframe(v):                                                               # virtual time -> frame, gaps filled by flow
        v = min(max(v, 0.0), VL); j = int(np.searchsorted(vpos, v, 'right') - 1); j = min(j, L - 1)
        t = float((v - vpos[j]) / (vpos[j + 1] - vpos[j])); return fd[j] if t < 0.02 else (fd[j + 1] if t > 0.98 else interp_any(fd[j], fd[j + 1], t))
    if EXT:                                                                      # extension attached: pan -> settle -> hold on both drinks
        ed = load24(EXT[0]); p0 = VL - (KA - 1) * 0.8; food_src = (p0 / 24, VL / 24)
        def food(i):
            k = i - a7; f = vframe(p0 + k * 0.8) if k < KA else at_pos(ed, (k - KA + 1) * 0.8)
            return inset(f, FY, 1 + 0.01 * k / 30)
    else:                                                                        # fallback: original clip only, 60%, ends on both drinks
        nm = n7 - HOLD; E = 18                                                    # 100% speed, last 0.6 s eases to a stop, then hold
        rate = np.array([0.8 * min(1.0, max(0.0, (nm - 1 - j) / E)) for j in range(nm - 1)]); vk = np.concatenate([[0.0], np.cumsum(rate)])
        p0 = VL - vk[-1]; food_src = (p0 / 24, VL / 24)
        def food(i): k = i - a7; return inset(vframe(p0 + vk[min(k, nm - 1)]), FY, 1 + 0.01 * k / 30)
    print('food source:', 'FOOD2 + extension' if EXT else 'FOOD2 only (extension not attached)', food_src, flush=True)
    # 8) pool: the only still, FULL FRAME 9:16 full-height window of 06, constant lateral pan (no zoom)
    a8 = c8 - XF; e8 = c9
    def pool(i): return grade(crop916(PK + '06_hotel_pool_real.jpg', 0, 0.5, 1.0, x_px=1800 + 620 * (i - a8) / (e8 - a8)))
    # 9) end card
    EB = endcard_bg(); LG = logo_w(880); head = r.text_layer('Do the trip right with TripNerd.', 66, 99, 870)
    fb = F(54); bt = 'Talk to a Nerd'; bb = fb.getbbox(bt); bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    fl = F(44); lt = 'Link in bio'; lb = fl.getbbox(lt); lw, lh_ = lb[2] - lb[0], lb[3] - lb[1]
    btn = Image.new('RGBA', (W, H), (0, 0, 0, 0)); pd = ImageDraw.Draw(btn); cyb = 1085
    pd.rounded_rectangle((540 - bw / 2 - 96, cyb - bh / 2 - 46, 540 + bw / 2 + 96, cyb + bh / 2 + 46), (bh + 92) / 2, fill=(255, 255, 255, 255)); pd.text((540, cyb), bt, font=fb, fill=(*TNBLUE, 255), anchor='mm')
    lnk = Image.new('RGBA', (W, H), (0, 0, 0, 0)); pd = ImageDraw.Draw(lnk); cyl = 1265
    pd.rounded_rectangle((540 - lw / 2 - 72, cyl - lh_ / 2 - 32, 540 + lw / 2 + 72, cyl + lh_ / 2 + 32), (lh_ + 64) / 2, outline=(255, 255, 255, 255), width=5); pd.text((540, cyl), lt, font=fl, fill=(255, 255, 255, 255), anchor='mm')
    def fade(layer, k0, i, n=9):
        al = min(1.0, max(0.0, (i - k0 + 1) / n))
        if al <= 0: return None
        x = layer.copy(); x.putalpha(x.split()[3].point(lambda q: int(q * al))); return x
    def endcard(i):
        u = min(1.0, max(0.0, (i - (c9 - XF) + 1) / 18)); s = 1.05 - 0.05 * (1 - (1 - u) ** 3)
        lg = LG.resize((round(LG.size[0] * s), round(LG.size[1] * s)), Image.LANCZOS)
        assert abs(lg.size[0] / lg.size[1] - LG.size[0] / LG.size[1]) < 0.004, 'logo stays uniform'
        c = EB.copy(); c.alpha_composite(lg, (540 - lg.size[0] // 2, 560 - lg.size[1] // 2))
        for layer, kk in ((head, c9), (btn, bf(37)), (lnk, bf(37) + 8)):
            x = fade(layer, kk, i)
            if x is not None: c.alpha_composite(x)
        return np.asarray(c.convert('RGB'))

    # ---------- the ticket: slides in opaque on navy, holds, shrinks continuously into the corner card ----------
    TK2 = Ticket15(2); CS = 0.38; CX, CY = 1040 - 1000 * CS / 2, 250 + 600 * CS / 2        # corner card 380x228, x 660-1040, y 250-478
    hits = [c6, c7, c8]; ccache = {}; a_sh = c6 - 18; a_up = c9 - XF - 15; slide_end = c5 + XF
    def card_state(i):
        checked = tuple(j for j, h in enumerate(hits) if i >= h + 9); active = None; prog = 0.0; pop = 1.0
        for j, h in enumerate(hits):
            if i >= h: active = j
        if active is not None:
            h = hits[active]; prog = min(1.0, (i - h + 1) / 9); kp = i - h - 9; pop = 1.0 + (0.14 * np.sin(np.pi * kp / 6) if 0 <= kp < 6 else 0.0)
            if prog >= 1: checked = tuple(sorted(set(checked) | {active}))
        if i >= a_up: active = None
        return checked, active, prog, pop
    def card_geom(i):
        if i < a_sh: return 540, 960, 1.0 + 0.02 * (i - (c5 - XF)) / (a_sh - (c5 - XF))
        if i < c6: u = ease_io((i - a_sh + 1) / 18); return 540 + (CX - 540) * u, 960 + (CY - 960) * u, 1.02 * (CS / 1.02) ** u
        if i < a_up: return CX, CY, CS
        u = ease_io(min(1.0, (i - a_up + 1) / 15)); return CX + (540 - CX) * u, CY + (1000 - CY) * u, CS * (0.92 / CS) ** u
    def draw_card(f, i, alpha=1.0):
        st_ = card_state(i); key = (st_[0], st_[1], round(st_[2], 3), round(st_[3], 3))
        if key not in ccache: ccache[key] = TK2.render(checked=st_[0], active=st_[1], prog=st_[2], pop=st_[3])
        img = ccache[key]
        if alpha < 1: img = img.copy(); img.putalpha(img.split()[3].point(lambda q: int(q * alpha)))
        cx, cy, s = card_geom(i); c = Image.fromarray(f).convert('RGBA'); place(c, img, 2, cx, cy, s); return np.asarray(c.convert('RGB'))
    HELD = {}
    def held(i):                                                                 # hold: sub-pixel push, no 1 px stepping
        if 'f' not in HELD: c = BG.copy(); place(c, TK2.render(), 2, 540, 960, 1.0); HELD['f'] = np.asarray(c.convert('RGB'))
        return zoom(HELD['f'], card_geom(i)[2])

    # ---------- captions (top safe zone; fade in 0.3 s, hook fully in by frame 5; fade out 0.3 s) ----------
    caps = [('Phoenix Open 2027.', 0, c1 - 6, 6), ('Everyone wants the 16th.', c1, c2 - 6, 9), ('TripNerd gets you in.', c2, c3 - 6, 9),
            ('Do the Phoenix Open with TripNerd.', D, c5 - 6, 9), ('Inside the 16th.', c6, c7 - 6, 9), ('Eat. Drink. Watch.', c7, c8 - 6, 9),
            ('Then unwind at the Fairmont.', c8, a_up, 9)]
    for t, a, b, _ in caps: assert (b - a) / 30 >= 2.0, (t, (b - a) / 30)
    CL = [((caption_left(t) if a >= c6 else caption_layer(t)), a, b, fi) for t, a, b, fi in caps]   # proof captions top-left
    def mix(A, B, i, c): return (A.astype(np.float32) * (1 - (w := smooth((i - (c - XF) + 0.5) / XF))) + B.astype(np.float32) * w).clip(0, 255).astype(np.uint8)

    ONLY = [int(x) for x in os.environ.get('ONLY', '').split(',') if x]; spot = []
    if not ONLY:
        p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                               '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for i in range(N):
        if ONLY and i not in ONLY: continue
        if i < c1 - XF: f = drone(i)
        elif i < c1: f = mix(drone(i), stadium(i), i, c1)
        elif i < c2 - XF: f = stadium(i)
        elif i < c2: f = mix(stadium(i), opener(i), i, c2)
        elif i < c3 - XF: f = opener(i)
        elif i < c3: f = mix(opener(i), stamp(i), i, c3)
        elif i < D: f = stamp(i)
        elif i < c5 - XF: f = bunker(i)
        elif i < c5: f = mix(bunker(i), held(i), i, c5)                          # bunker -> ticket: clean 0.4 s dissolve
        elif i < a_sh: f = held(i)
        elif i < c6 - XF: f = draw_card(NAVY, i)                                 # continuous shrink starts on navy...
        elif i < c6: f = draw_card(mix(NAVY, suite(i), i, c6), i)                # ...while the suite dissolves in underneath
        elif i < c7 - XF: f = draw_card(suite(i), i)
        elif i < c7: f = draw_card(mix(suite(i), food(i), i, c7), i)
        elif i < c8 - XF: f = draw_card(food(i), i)
        elif i < c8: f = draw_card(mix(food(i), pool(i), i, c8), i)
        elif i < a_up: f = draw_card(pool(i), i)
        elif i < c9 - XF: u = smooth((i - a_up + 1) / 15); f = draw_card((pool(i).astype(np.float32) * (1 - 0.22 * u)).astype(np.uint8), i)
        elif i < c9:
            f = mix((pool(i).astype(np.float32) * 0.78).astype(np.uint8), endcard(i), i, c9)
            ca = 1 - smooth((i - (c9 - XF) + 0.5) / 7)
            if ca > 0.01: f = draw_card(f, i, ca)
        else: f = endcard(i)
        for C, a, b, fi in CL:
            if a <= i < b:
                al = min(1.0, (i - a + 1) / fi, (b - i) / 9.0); m_ = C[..., 3:4] * al
                f = (f.astype(np.float32) * (1 - m_) + C[..., :3] * 255 * m_).clip(0, 255).astype(np.uint8)
        if ONLY: spot.append((i, f)); continue
        p_.stdin.write(np.ascontiguousarray(f).tobytes())
        if i % 60 == 0: print('frame', i, '/', N, flush=True)
    if ONLY:
        np.save(out + '.spot.npy', np.stack([f for _, f in spot])); json.dump([i for i, _ in spot], open(out + '.spot.json', 'w')); return
    p_.stdin.close(); p_.wait()
    assert np.array_equal(stamp(land), stamp(pe)), 'stamp lands flat and still before the flash'
    segs = [('drone, FULL FRAME 9:16, real speed', 0, c1), ('stadium pan, V01 2.5 s+ 70%, 80% inset', c1, c2),
            ('opener, src frames 0-20 ~23%, 80% inset', c2, c3), ('stamp push + flat 360 spin + flash -> HARD CUT (drop)', c3, D),
            ('bunker, V03 3.6 s+ 70%, 80% inset', D, c5), ('ticket slides in, holds, 0.6 s shrink to corner card', c5, c6),
            ('suite, V01 5.6-8.15 s 60%, 80% inset + check 1', c6, c7), (f'food, src {food_src[0]:.2f}-{food_src[1]:.2f} s 60% {" + extension" if EXT else ""}, 80% inset + check 2', c7, c8),
            ('pool, 06 still FULL FRAME lateral pan + check 3; card scales up', c8, c9), ('end card', c9, N)]
    meta = {'frames': N, 'end_s': N / 30, 'drop_s': D / 30, 'stadium_s': [(c1 - XF) / 30, c2 / 30], 'bunker_s': [D / 30, c5 / 30],
            'pool_s': [(c8 - XF) / 30, c9 / 30], 'endcard_s': (c9 - XF) / 30, 'ticks_s': [h / 30 for h in hits],
            'segments': [dict(name=n, a=a / 30, b=b / 30) for n, a, b in segs], 'captions': [dict(text=t, start_s=a / 30, end_s=b / 30) for t, a, b, _ in caps],
            'card_corner_rect': [CX - 500 * CS, CY - 300 * CS, CX + 500 * CS, CY + 300 * CS], 'beat_times_s': [round(g0 + k * P, 4) for k in range(-22, 44)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(json.dumps(meta['segments'], indent=0))

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
