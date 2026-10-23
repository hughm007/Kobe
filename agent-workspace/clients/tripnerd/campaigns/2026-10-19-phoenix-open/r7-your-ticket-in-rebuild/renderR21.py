# TripNerd PHX 2027 Reel, R21 = R20 timing/captions/order/ticket/end card + owner's final pass: NO blurred backgrounds (every shot
#  fills 9:16), new suite clip replaces the cup shot (0-2.5 s, ~3% push), new 9:16 food clip (0.5-4.0 s, ends on both drinks).
# R20 notes:
#  whole ticket with margin before the push, full branded ticket as the corner card (~38% width). R19 notes:
#  1 logo sequence: ticket dissolves in on the 7.97 s hit; push 1.0 s (no rotation) -> hold 0.2 s -> flat 360 spin 1.2 s -> hold 0.2 s
#    -> hard cut to the bunker on the drop hit (frame 319)
#  2 full ticket held exactly 1.75 s (continuous time), then 0.6 s eased shrink into the corner; the navy tint fades out over the
#    same 0.6 s while the suite comes up underneath
#  3 opener window x 12-70% / y 30-88% of the source: no pillar or canopy in frame, course visible from the first frame
#  4 food: speed eases in from rest (kills the direction-flip lurch against the suite) and out to a stop, then holds
#  5 16:9 food over an edge-extended blur (no tonal step at the feathered top/bottom); 36 px feather everywhere
#  6 corner card = clean 3-line checklist, 34 px text, 460 px wide, right margin 40 px; captions top-left at one size (60 px)
#  7 every transition centred on a measured strong hit of the music (onset analysis of the mix), drop cut on the drop hit
import subprocess, sys, os, json, glob, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import render2 as r
from final13 import grade, crop916, PK, W, H
from ticket7 import F, logo_w, TNBLUE, NAVY as INKNAVY, MUTE, PAPER
from renderR7 import endcard_bg, OPENER, FF
from renderR8 import ease_io5, ease_io
from renderR14 import navy_bg, place, read_clip, DRONE
from renderR15 import at_pos, interp_any, Ticket15, FOOD2, FONT
from renderR16 import smooth, sharpen, zoom
from renderR17 import blur_bg, feather, prep

IW = 864; XF = 12; CAPS = 60
def fr(t): return int(round(t * 30))
def inset(f, cy, grow=1.0, bg=None):
    """whole source frame at 80% width (x grow), centred x, centre y = cy, 36 px feather on every edge, over a blurred background"""
    bg = blur_bg(f) if bg is None else bg; h, w = f.shape[:2]; s = IW * grow / w
    M = np.float32([[s, 0, 540 - s * w / 2], [0, s, cy - s * h / 2]])
    t = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC).astype(np.float32)
    a = cv2.warpAffine(feather(w, h, 36 / s), M, (W, H), flags=cv2.INTER_LINEAR)[..., None] / 255
    return (bg * (1 - a) + t * a).clip(0, 255).astype(np.uint8)
def ext_bg(f, cy):
    """16:9 background: the frame at full width, edge-extended (reflect) to fill 9:16, 60 px blur, gently darkened ->
    colours at the inset's top/bottom edges continue into the background, so the feather never shows a tonal step"""
    h, w = f.shape[:2]; sm = cv2.resize(f, (270, round(h * 270 / w)), interpolation=cv2.INTER_AREA); hh = sm.shape[0]
    top = int(round(cy / 4 - hh / 2)); bot = 480 - top - hh
    big = cv2.copyMakeBorder(sm, max(0, top), max(0, bot), 0, 0, cv2.BORDER_REFLECT)[:480]
    big = cv2.GaussianBlur(big.astype(np.float32), (0, 0), 15)
    return cv2.resize(big, (W, H), interpolation=cv2.INTER_CUBIC) * 0.7
def band(f, cy, bg):
    """fit the WHOLE frame to the full 1080 width (nothing cropped), centre y = cy, 36 px feather top/bottom over bg"""
    h, w = f.shape[:2]; s = W / w; hh = h * s
    t = cv2.resize(f, (W, int(round(hh))), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC).astype(np.float32); y0 = int(round(cy - hh / 2))
    out = bg.copy(); hb = t.shape[0]; ys = np.arange(hb); a = np.clip(np.minimum(ys, hb - 1 - ys) / 36.0, 0, 1); a = (a * a * (3 - 2 * a))[:, None, None]
    out[y0:y0 + hb] = out[y0:y0 + hb] * (1 - a) + t * a; return out.clip(0, 255).astype(np.uint8)
def caption(text, maxw, x0=44, top=262):
    """one font, one size (60 px), white + soft shadow, left-aligned in the top-left zone"""
    f = ImageFont.truetype(FONT, CAPS); words = text.split(); lines = [words[0]]
    for wd in words[1:]:
        if f.getlength(lines[-1] + ' ' + wd) <= maxw: lines[-1] += ' ' + wd
        else: lines.append(wd)
    assert all(f.getlength(l) <= maxw for l in lines) and all(len(l.split()) <= 6 for l in lines), lines
    lh = int(CAPS * 1.18); L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    for j, t in enumerate(lines): d.text((x0, top + j * lh + lh / 2), t, font=f, fill=(255, 255, 255, 255), anchor='lm')
    a = L.split()[3]; out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for blur, op, off in ((16, 0.38, (0, 4)), (4, 0.55, (2, 3))):
        sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.paste((0, 0, 0, 255), (0, 0), a.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * op))); out.alpha_composite(sh, off)
    out.alpha_composite(L); bb = a.getbbox(); return np.asarray(out).astype(np.float32) / 255.0, bb

class Ticket20(Ticket15):
    """Ticket15 with the active-row tint faded by hl (0..1) instead of switching on in one frame"""
    def render(self, checked=(), active=None, prog=0.0, pop=1.0, phi=0.0, hl=1.0):
        K = self.k; b = self.base.copy(); d = ImageDraw.Draw(b)
        for j, (txt, yt) in enumerate(zip(self.LINES, self.rows)):
            if j == active and hl > 0:
                hlL = Image.new('RGBA', b.size, (0, 0, 0, 0)); ImageDraw.Draw(hlL).rounded_rectangle((self.bx - 14 * K, yt - 16 * K, self.px - 20 * K, yt + self.box + 16 * K), 18 * K, fill=(*TNBLUE, int(44 * hl)))
                b.alpha_composite(hlL); d = ImageDraw.Draw(b)
            d.text((self.tx, yt + self.box / 2), txt, font=self.font, fill=INKNAVY, anchor='lm')
            p = 1.0 if j in checked else (prog if j == active else 0.0); sc = pop if (j == active and p > 0) else 1.0
            bx = Image.new('RGBA', (self.box + 40 * K, self.box + 40 * K), (0, 0, 0, 0)); bd = ImageDraw.Draw(bx); o = 20 * K
            bd.rounded_rectangle((o, o, o + self.box, o + self.box), 14 * K, outline=(*(TNBLUE if p >= 1 else MUTE), 255), width=5 * K)
            if p > 0:
                bxl = self.box; pts = [(o + 0.18 * bxl, o + 0.52 * bxl), (o + 0.42 * bxl, o + 0.76 * bxl), (o + 0.84 * bxl, o + 0.22 * bxl)]
                seg = [np.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), np.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1])]
                Lp = p * sum(seg); path = [pts[0]]
                if Lp <= seg[0]: path.append((pts[0][0] + (pts[1][0] - pts[0][0]) * Lp / seg[0], pts[0][1] + (pts[1][1] - pts[0][1]) * Lp / seg[0]))
                else: u = (Lp - seg[0]) / seg[1]; path += [pts[1], (pts[1][0] + (pts[2][0] - pts[1][0]) * u, pts[1][1] + (pts[2][1] - pts[1][1]) * u)]
                bd.line(path, fill=(*TNBLUE, 255), width=int(13 * K), joint='curve')
                for q in (path[0], path[-1]): bd.ellipse((q[0] - 6.5 * K, q[1] - 6.5 * K, q[0] + 6.5 * K, q[1] + 6.5 * K), fill=(*TNBLUE, 255))
            if abs(sc - 1) > 1e-3: n = round(bx.size[0] * sc); bx = bx.resize((n, n), Image.LANCZOS)
            b.alpha_composite(bx, (int(self.bx + self.box / 2 - bx.size[0] / 2), int(yt + self.box / 2 - bx.size[1] / 2))); d = ImageDraw.Draw(b)
        st = self.stamp if phi % 360 == 0 else self.stamp.rotate(-phi, resample=Image.BICUBIC)
        b.alpha_composite(st, (int(self.sc[0] - st.size[0] / 2), int(self.sc[1] - st.size[1] / 2)))
        out = Image.new('RGBA', b.size, (0, 0, 0, 0)); out.paste(b, (0, 0), self.mask); return out
class Checklist:
    """clean corner card: 3 rows, checkbox + 34 px text, paper card, TripNerd blue checks. Rendered at 2x."""
    LINES = ['16th Hole LOGE Suite', 'Food & drink', 'Hotel']; W0, H0, K = 460, 214, 2
    def __init__(self):
        K = self.K; self.font = F(34 * K); self.rows = [(20 + 29 + j * 58) * K for j in range(3)]; self.bx = 18 * K; self.box = 34 * K; self.tx = 66 * K
        for t in self.LINES: assert (66 + self.font.getlength(t) / K) <= self.W0 - 14, t
    def render(self, checked=(), active=None, prog=0.0, pop=1.0, hl=0.0):
        K = self.K; w, h = self.W0 * K, self.H0 * K; im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rounded_rectangle((0, 0, w - 1, h - 1), 22 * K, fill=(*PAPER, 255))
        for j, (txt, yc) in enumerate(zip(self.LINES, self.rows)):
            if j == active and hl > 0:
                hlL = Image.new('RGBA', (w, h), (0, 0, 0, 0)); ImageDraw.Draw(hlL).rounded_rectangle((8 * K, yc - 26 * K, w - 8 * K, yc + 26 * K), 12 * K, fill=(*TNBLUE, int(46 * hl)))
                im.alpha_composite(hlL); d = ImageDraw.Draw(im)
            d.text((self.tx, yc), txt, font=self.font, fill=(*INKNAVY, 255), anchor='lm')
            p = 1.0 if j in checked else (prog if j == active else 0.0); sc = pop if (j == active and p > 0) else 1.0
            bxs = self.box + 24 * K; bx = Image.new('RGBA', (bxs, bxs), (0, 0, 0, 0)); bd = ImageDraw.Draw(bx); o = 12 * K; b = self.box
            bd.rounded_rectangle((o, o, o + b, o + b), 8 * K, outline=(*(TNBLUE if p >= 1 else MUTE), 255), width=3 * K)
            if p > 0:
                pts = [(o + 0.2 * b, o + 0.53 * b), (o + 0.43 * b, o + 0.76 * b), (o + 0.84 * b, o + 0.24 * b)]
                s1 = np.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]); s2 = np.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]); Lp = p * (s1 + s2); path = [pts[0]]
                if Lp <= s1: path.append((pts[0][0] + (pts[1][0] - pts[0][0]) * Lp / s1, pts[0][1] + (pts[1][1] - pts[0][1]) * Lp / s1))
                else: u = (Lp - s1) / s2; path += [pts[1], (pts[1][0] + (pts[2][0] - pts[1][0]) * u, pts[1][1] + (pts[2][1] - pts[1][1]) * u)]
                bd.line(path, fill=(*TNBLUE, 255), width=6 * K, joint='curve')
                for q in (path[0], path[-1]): bd.ellipse((q[0] - 3 * K, q[1] - 3 * K, q[0] + 3 * K, q[1] + 3 * K), fill=(*TNBLUE, 255))
            if abs(sc - 1) > 1e-3: n = round(bxs * sc); bx = bx.resize((n, n), Image.LANCZOS)
            im.alpha_composite(bx, (int(self.bx + b / 2 - bx.size[0] / 2), int(yc - bx.size[1] / 2)))
            d = ImageDraw.Draw(im)
        return im

def build(out, tjson):
    T = json.load(open(tjson)); D = T['drop_frame']
    # transition centres = measured strong hits of the music on this timeline (music starts 35.887 s into the track)
    # pre-drop (build, no steady kick): the audible stabs; post-drop: kick-grid beats that carry a hit (124 BPM, beat 0 = 10.645 s)
    P = 60 / 124; g0 = D / 30 + 0.0115; gb = lambda k: g0 + k * P
    T1, T2, TS = fr(2.545), fr(5.685), fr(7.97)
    T5, T6, T7, T8 = fr(gb(5)), fr(gb(20)), fr(gb(29)), fr(gb(36))
    H1, H2, H3 = fr(gb(12)), fr(gb(21)), fr(gb(32)); N = fr(gb(42)); h = XF // 2
    BG = navy_bg(); NAVYF = np.asarray(BG.convert('RGB')); VY = 960; FY = 1059

    # 1) drone, full frame 9:16, real speed (flow 24->30)
    cw = 1080 * 9 / 16; x0 = 960 - cw / 2                                          # full frame: 9:16 window on the 16th, slow push
    dr = [sharpen(grade(np.asarray(Image.fromarray(f).resize((W, H), Image.LANCZOS, box=(x0, 0, x0 + cw, 1080))))) for f in read_clip(DRONE, 0.0, 3.0)]
    def drone(i): return zoom(at_pos(dr, i * 24 / 30), 1 + 0.008 * i / 30)
    # 2) stadium V01 2.5 s+ at 70%, inset
    a2 = T1 - h; st = [grade(f) for f in r.read('V01', 2.5, int((T2 + h - a2) * 0.7) + 4)]      # native 9:16, full frame
    def stadium(i): k = i - a2; return zoom(at_pos(st, k * 0.7), 1 + 0.008 * k / 30)
    # 3) opener: source frames 0-20, window clear of pillars and canopy (x 12-70%, y 30-88% = 9:16), inset
    a3 = T2 - h; n3 = TS + h - a3
    SUITE2 = glob.glob('/root/.claude/uploads/*/fe88ebd4-hf_20261022_173642*.mp4')[0]            # new 9:16 suite clip, 0-2.5 s only
    raw = subprocess.run([FF, '-v', 'error', '-i', SUITE2, '-frames:v', '61', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    OF = [grade(f) for f in np.frombuffer(raw, np.uint8).reshape(-1, 1920, 1080, 3)]
    def opener(i): k = i - a3; return zoom(at_pos(OF, k * 60.0 / (n3 - 1)), 1 + 0.03 * k / (n3 - 1))   # ~3% push over the shot
    # 4) logo sequence: push [ps, ps+30) no rotation | hold 6 | spin [ps+36, ps+72) | hold 6 | cut at D
    TK4 = Ticket15(4); S0, S1 = 0.82, 4.0; sx, sy = TK4.sc[0] / 4, TK4.sc[1] / 4
    ps = D - 78; pe = ps + 30; sp = pe + 6; se = sp + 36; scache = {}
    def framing(u): s = S0 * (S1 / S0) ** u; return s, 540 - (sx - 500) * s * u, 960 - (sy - 300) * s * u
    def stamp(i):
        s, cx, cy = framing(ease_io(min(1.0, max(0.0, (i - ps) / (pe - ps)))))
        phi = 360 * ease_io(min(1.0, max(0.0, (i - sp) / (se - sp)))) if sp <= i < se else 0.0
        key = (round(s, 5), round(cx, 3), round(cy, 3), round(phi % 360, 4))
        if key not in scache: c = BG.copy(); place(c, TK4.render(phi=phi), 4, cx, cy, s); scache[key] = np.asarray(c.convert('RGB'))
        return scache[key]
    # 5) bunker V03 3.6 s+ at 70%, inset, flash decay after the cut
    bn = [grade(f) for f in r.read('V03', 3.6, int((T5 + h - D) * 0.7) + 4)]
    def bunker(i):
        k = i - D; f = zoom(at_pos(bn, k * 0.7), 1 + 0.008 * k / 30)
        if k < 6: w_ = [0.9, 0.6, 0.38, 0.22, 0.1, 0.04][k]; f = (f.astype(np.float32) * (1 - w_) + 255 * w_).astype(np.uint8)
        return f
    # ticket timing (continuous): fully in at T5+h, held exactly 1.75 s, shrink 0.6 s
    t_in = T5 + h; t_sh = t_in + 1.75 * 30; t_end = t_sh + 18
    # 6) suite V01 5.6 s+ at 55%, inset (visible from the shrink start)
    a6 = int(t_sh) - 1; su = [grade(f) for f in r.read('V01', 5.6, int((T6 + h - a6) * 0.55) + 4)]
    def suite(i): k = i - a6; return zoom(at_pos(su, k * 0.55), 1 + 0.008 * k / 30)
    # 7) food: gap-corrected source timeline (frames dropped at 62->63, 95->96 are flow-filled); speed eases in from rest and out to a stop
    a7 = T6 - h; e7 = T7 + h; endf = T7 - h                                       # last source frame lands as the pool dissolve starts
    FOOD3 = glob.glob('/root/.claude/uploads/*/840c49b9-hf_20261022_170152*.mp4')[0]; EXT = []
    raw = subprocess.run([FF, '-v', 'error', '-i', FOOD3, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fd = [grade(f) for f in np.frombuffer(raw, np.uint8).reshape(-1, 1920, 1080, 3)]; del raw; L = len(fd) - 1; p0 = 12.0  # 0.5 s .. 4.0 s
    # the AI clip's own camera speed alternates ~13/20 px per frame: re-time by measured camera travel so on-screen speed is smooth
    dis_ = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM); gq = [np.ascontiguousarray(cv2.cvtColor(cv2.resize(f, (540, 960)), cv2.COLOR_RGB2GRAY)[200:900, 40:500]) for f in fd]
    trav = np.concatenate([[0.0], np.cumsum([float(np.hypot(*np.median(dis_.calc(gq[j], gq[j + 1], None).reshape(-1, 2), 0))) for j in range(L)])])
    s0, s1 = float(np.interp(p0, np.arange(L + 1), trav)), float(trav[-1])
    nm = endf - a7; E = 15; prof = np.array([min(1.0, (j + 1) / E, max(0.0, (nm - 1 - j) / E)) for j in range(nm - 1)])
    vk = np.concatenate([[0.0], np.cumsum(prof)]) * ((s1 - s0) / prof.sum()); food_src = (p0 / 24, L / 24)   # eases in from rest, out to a stop
    def food(i):
        k = i - a7; sv = s0 + vk[min(max(k, 0), nm - 1)]; pos = float(np.interp(sv, trav, np.arange(L + 1)))
        return at_pos(fd, pos)                                                       # full frame, no crop, no push
    # 8) pool, the only still, full frame 9:16, constant lateral pan
    a8 = T7 - h; e8 = T8 + h
    def pool(i): return grade(crop916(PK + '06_hotel_pool_real.jpg', 0, 0.5, 1.0, x_px=1800 + 620 * (i - a8) / (e8 - a8)))   # fills, pool in frame
    # 9) end card (R18 unchanged, re-timed): logo settle from the dissolve start
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
        u = min(1.0, max(0.0, (i - (T8 - h) + 1) / 18)); s = 1.05 - 0.05 * (1 - (1 - u) ** 3)
        lg = LG.resize((round(LG.size[0] * s), round(LG.size[1] * s)), Image.LANCZOS)
        assert abs(lg.size[0] / lg.size[1] - LG.size[0] / LG.size[1]) < 0.004, 'logo stays uniform'
        c = EB.copy(); c.alpha_composite(lg, (540 - lg.size[0] // 2, 560 - lg.size[1] // 2))
        for layer, kk in ((head, T8), (btn, T8 + 14), (lnk, T8 + 22)):
            x = fade(layer, kk, i)
            if x is not None: c.alpha_composite(x)
        return np.asarray(c.convert('RGB'))

    # ---------- ticket -> corner checklist ----------
    TK2 = Ticket20(2); CSC = 0.39; CW = 1000 * CSC; CHH = 600 * CSC; CX, CY = 1040 - CW / 2, 250 + CHH / 2   # ticket card x 630-1040, y 250-496
    SH0 = 0.86                                                                       # held full ticket: whole, with margin
    hits = [H1, H2, H3]; ccache = {}; a_up = (T8 - h) - 15
    def card_state(i):
        checked = tuple(j for j, hh in enumerate(hits) if i >= hh + 9); active = None; prog = 0.0; pop = 1.0
        for j, hh in enumerate(hits):
            if i >= hh: active = j
        hl = 0.0
        if active is not None:
            hh = hits[active]; prog = min(1.0, (i - hh + 1) / 9); kp = i - hh - 9; pop = 1.0 + (0.14 * np.sin(np.pi * kp / 6) if 0 <= kp < 6 else 0.0)
            hl = min(1.0, (i - hh + 1) / 6)                                         # highlight fades in over 0.2 s (no pop)
            if prog >= 1: checked = tuple(sorted(set(checked) | {active}))
        if i >= a_up: hl *= max(0.0, 1 - (i - a_up + 1) / 6)
        return checked, active, round(prog, 3), round(pop, 3), 0.0, round(hl * 20) / 20
    def card_img(i):
        k = card_state(i)
        if k not in ccache: ccache[k] = TK2.render(*k)
        return ccache[k]
    def held(i):                                                                   # full ticket, sub-pixel push 1.00 -> 1.02 until the shrink
        if 'f' not in ccache: c = BG.copy(); place(c, TK2.render(), 2, 540, 960, SH0); ccache['f'] = np.asarray(c.convert('RGB'))
        return zoom(ccache['f'], 1.0 + 0.02 * min(1.0, max(0.0, (i - (T5 - h)) / (t_sh - (T5 - h)))))
    def shrink_u(i): return ease_io(min(1.0, max(0.0, (i - t_sh) / 18)))
    def overlay(f, i, alpha=1.0):
        c = Image.fromarray(f).convert('RGBA')
        if i < t_end:                                                              # 0.6 s shrink: the whole ticket, one piece
            u = shrink_u(i); s0 = SH0 * 1.02; s = s0 * (CSC / s0) ** u; cx, cy = 540 + (CX - 540) * u, 960 + (CY - 960) * u
            place(c, card_img(i), 2, cx, cy, s)
        else:
            if i < a_up: cx, cy, s = CX, CY, CSC
            else: u = ease_io(min(1.0, (i - a_up + 1) / 15)); cx, cy, s = CX + (540 - CX) * u, CY + (1000 - CY) * u, CSC * (0.86 / CSC) ** u
            ck = card_img(i)
            if alpha < 1: ck = ck.copy(); ck.putalpha(ck.split()[3].point(lambda q: int(q * alpha)))
            place(c, ck, 2, cx, cy, s)
        return np.asarray(c.convert('RGB'))

    # ---------- captions: top-left, one size; beside the card they stay left of x = 560 ----------
    caps = [('Phoenix Open 2027.', 0, T1 - 3, 6, 960), ('Everyone wants the 16th.', T1 + 3, T2 - 3, 9, 960), ('TripNerd gets you in.', T2 + 3, TS - 3, 9, 960),
            ('Do the Phoenix Open with TripNerd.', D, T5 - 3, 9, 960), ('Inside the 16th.', int(t_end) + 1, T6 - 3, 9, 596),
            ('Eat. Drink. Watch.', T6 + 3, T7 - 3, 9, 596), ('Then unwind at the Fairmont.', T7 + 3, a_up, 9, 596)]
    CLs = []
    for t, a, b, fi, mw in caps:
        assert (b - a) / 30 >= 2.0, (t, (b - a) / 30); lay, bb = caption(t, mw)
        if mw < 900: assert bb[2] < CX - CW / 2 - 16, ('caption collides with card', t, bb)
        CLs.append((lay, a, b, fi))
    def mix(A, B, i, c): w = smooth((i - (c - h) + 0.5) / XF); return (A.astype(np.float32) * (1 - w) + B.astype(np.float32) * w).clip(0, 255).astype(np.uint8)

    ONLY = [int(x) for x in os.environ.get('ONLY', '').split(',') if x]; spot = []
    if not ONLY:
        p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                               '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for i in range(N):
        if ONLY and i not in ONLY: continue
        if i < T1 - h: f = drone(i)
        elif i < T1 + h: f = mix(drone(i), stadium(i), i, T1)
        elif i < T2 - h: f = stadium(i)
        elif i < T2 + h: f = mix(stadium(i), opener(i), i, T2)
        elif i < TS - h: f = opener(i)
        elif i < TS + h: f = mix(opener(i), stamp(i), i, TS)
        elif i < D: f = stamp(i)
        elif i < T5 - h: f = bunker(i)
        elif i < T5 + h: f = mix(bunker(i), held(i), i, T5)
        elif i < t_sh: f = held(i)
        elif i < t_end: f = overlay((NAVYF * (1 - shrink_u(i)) + suite(i) * shrink_u(i)).astype(np.uint8), i)   # tint fades with the shrink
        elif i < T6 - h: f = overlay(suite(i), i)
        elif i < T6 + h: f = overlay(mix(suite(i), food(i), i, T6), i)
        elif i < T7 - h: f = overlay(food(i), i)
        elif i < T7 + h: f = overlay(mix(food(i), pool(i), i, T7), i)
        elif i < a_up: f = overlay(pool(i), i)
        elif i < T8 - h: u = smooth((i - a_up + 1) / 15); f = overlay((pool(i).astype(np.float32) * (1 - 0.22 * u)).astype(np.uint8), i)
        elif i < T8 + h:
            f = mix((pool(i).astype(np.float32) * 0.78).astype(np.uint8), endcard(i), i, T8)
            ca = 1 - smooth((i - (T8 - h) + 0.5) / 7)
            if ca > 0.01: f = overlay(f, i, ca)
        else: f = endcard(i)
        for C, a, b, fi in CLs:
            if a <= i < b:
                al = min(1.0, (i - a + 1) / fi, (b - i) / 9.0); m_ = C[..., 3:4] * al
                f = (f.astype(np.float32) * (1 - m_) + C[..., :3] * 255 * m_).clip(0, 255).astype(np.uint8)
        if ONLY: spot.append((i, f)); continue
        p_.stdin.write(np.ascontiguousarray(f).tobytes())
        if i % 60 == 0: print('frame', i, '/', N, flush=True)
    if ONLY:
        np.save(out + '.spot.npy', np.stack([f for _, f in spot])); json.dump([i for i, _ in spot], open(out + '.spot.json', 'w')); return
    p_.stdin.close(); p_.wait()
    assert np.array_equal(stamp(se), stamp(pe)) and np.array_equal(stamp(D - 1), stamp(pe)), 'logo lands exactly upright = pre-spin frame'
    meta = {'frames': N, 'end_s': N / 30, 'drop_s': D / 30, 'stadium_s': [(T1 - h) / 30, (T2 + h) / 30], 'bunker_s': [D / 30, (T5 + h) / 30],
            'pool_s': [(T7 - h) / 30, (T8 + h) / 30], 'endcard_s': (T8 - h) / 30, 'ticks_s': [x / 30 for x in hits],
            'cuts_s': {'drone>stadium': T1 / 30, 'stadium>opener': T2 / 30, 'opener>ticket': TS / 30, 'DROP hard cut': D / 30, 'bunker>ticket': T5 / 30,
                       'suite>food': T6 / 30, 'food>pool': T7 / 30, 'pool>endcard': T8 / 30},
            'logo': {'push': [ps / 30, pe / 30], 'hold1': [pe / 30, sp / 30], 'spin': [sp / 30, se / 30], 'hold2': [se / 30, D / 30]},
            'ticket': {'full_from_s': t_in / 30, 'shrink_start_s': t_sh / 30, 'hold_s': (t_sh - t_in) / 30, 'shrink_end_s': t_end / 30},
            'food_src': food_src, 'food_ext': bool(EXT), 'captions': [dict(text=t, start_s=a / 30, end_s=b / 30) for t, a, b, _, _ in caps],
            'card_rect': [CX - CW / 2, CY - CHH / 2, CX + CW / 2, CY + CHH / 2]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(json.dumps(meta, indent=0)[:1500])

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
