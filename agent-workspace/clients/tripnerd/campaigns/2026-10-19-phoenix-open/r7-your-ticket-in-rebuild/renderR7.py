# TripNerd x Phoenix Open, Reel 3 "Your Ticket In" (BRIEF.md + owner updates 2026-10-20). 9:16, 1080x1920, 30 fps.
#   1  0.0-1.8   opener.mp4 0.00-0.90 s at 50% speed (DIS optical-flow in-betweens), ticket face tracked onto the stub   "Your ticket in."
#   2  1.8-4.1   V01 from 2.5 s (the canopy pole is in frame until 2.45 s), muted
#   3  4.1-5.1   ticket rises from the bottom, fills the frame, fast push into the stamp
#   4  5.1       white flash = music DROP
#   5  5.1-...   V03 from 1.9 s, real audio under the music                                    "This is the 16th." on the blast
#   6            P05, P08, P02, P04, P09, P01, hard cuts every 2 beats, static cover crops          "Food & drink included."
#   7            end card on TripNerd blue: original logo, "Phoenix 2027", "Talk to a Nerd", "Link in bio"
#   python3 renderR7.py <out.mp4> <timing.json>     timing.json: {"bpm": float, "v03_beats": int, "end_beats": int}
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
import render2 as r
sys.argv = sys.argv_saved
from ticket7 import ticket, F, logo_w, TNBLUE, EC, SP, B
W, H, FF = r.W, r.H, r.FF
OPENER = '/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/a92c0d42-One-continuous-smooth-handheld-phone-sh.mp4'
r.SRC.update({'V01': B + 'V01.mp4', 'V03': B + 'V03.mp4'})
QUADS = json.load(open(SP + 'r7/quads.json'))          # stub corners per opener source frame (LK + RANSAC homography)
PHOTOS = [('P05', 0.28), ('P08', 0.5), ('P02', 0.25), ('P04', 0.32), ('P09', 0.55), ('P01', 0.5)]
DROP = 5.1

def opener_frames(face):
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '24', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    src = np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3)
    s = H / 1912; nw = round(1080 * s); x0 = (nw - W) / 2              # uniform scale to 1920 tall, centre crop (no stretch)
    S = [cv2.resize(f, (nw, H), interpolation=cv2.INTER_LANCZOS4)[:, int(x0):int(x0) + W] for f in src]
    Q = [np.float32(q) * s - np.float32([int(x0), 0]) for q in QUADS]
    out = []
    for k in range(54):                                               # 0.4 source frames per output frame = 50% speed
        p = k * 0.4; i = int(p); t = p - i
        f = S[i] if t < 0.02 else r.interp(S[i], S[i + 1], t)
        q = Q[i] * (1 - t) + Q[i + 1] * t if t >= 0.02 else Q[i]
        out.append(warp_onto(f, face, q))
    return out

def warp_onto(f, face, quad):
    fa = np.asarray(face).astype(np.float32); fw, fh = face.size
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [fw, 0], [fw, fh], [0, fh]]), np.float32(quad))
    w = cv2.warpPerspective(fa, M, (W, H), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
    w = cv2.GaussianBlur(w, (0, 0), 0.7); a = w[..., 3:4] / 255.0
    g = cv2.cvtColor(f, cv2.COLOR_RGB2GRAY).astype(np.float32)
    lum = cv2.GaussianBlur(g, (0, 0), 4)[..., None]
    ref = np.percentile(g[a[..., 0] > 0.9], 92) if (a > 0.9).sum() > 50 else 230.0   # the stub's own lit paper level
    shade = np.clip(lum / max(ref, 1), 0.55, 1.04)                    # keeps the cup shadow and the sun falloff on the paper
    return (f.astype(np.float32) * (1 - a) + w[..., :3] * shade * a).clip(0, 255).astype(np.uint8)

def place(canvas, tk, cx, cy, scale, angle):
    t = tk.resize((max(1, int(tk.size[0] * scale)), max(1, int(tk.size[1] * scale))), Image.LANCZOS).rotate(angle, expand=True, resample=Image.BICUBIC)
    sh = Image.new('RGBA', (t.size[0] + 120, t.size[1] + 120), (0, 0, 0, 0))
    sh.paste((0, 0, 0, 140), (60 + int(10 * scale), 60 + int(22 * scale)), t.split()[3])
    from PIL import ImageFilter
    sh = sh.filter(ImageFilter.GaussianBlur(max(2, 16 * scale)))                 # soft drop shadow under the paper
    canvas.alpha_composite(sh, (int(cx - t.size[0] / 2 - 60), int(cy - t.size[1] / 2 - 60)))
    canvas.alpha_composite(t, (int(cx - t.size[0] / 2), int(cy - t.size[1] / 2)))

def ease_out(u): u = min(max(u, 0), 1); return 1 - (1 - u) ** 3
def ease_in(u): u = min(max(u, 0), 1); return u ** 2.2

def cover(name, cx):
    p = Image.open(B + name + '.jpg').convert('RGB'); w, h = p.size
    if w / h > W / H:
        cw = round(h * W / H); x0 = int(np.clip(cx * w - cw / 2, 0, w - cw)); p = p.crop((x0, 0, x0 + cw, h))
    else:
        ch = round(w * H / W); y0 = (h - ch) // 2; p = p.crop((0, y0, w, y0 + ch))
    return np.asarray(p.resize((W, H), Image.LANCZOS))

def endcard_bg():
    e = np.asarray(EC).astype(np.float32)                              # the approved end card's own blue, from its clean edge columns
    l, rr = e[:, 6:40].mean(1), e[:, 1040:1074].mean(1)
    l = cv2.GaussianBlur(l[:, None, :], (1, 0), sigmaX=1, sigmaY=40)[:, 0]; rr = cv2.GaussianBlur(rr[:, None, :], (1, 0), sigmaX=1, sigmaY=40)[:, 0]
    g = l[:, None, :] + (rr - l)[:, None, :] * np.linspace(0, 1, W)[None, :, None]
    return Image.fromarray(g.clip(0, 255).astype(np.uint8)).convert('RGBA')

def build(out, timing):
    T = json.load(open(timing)); P = 60.0 / T['bpm']
    fr = lambda t: int(round(t * 30))
    t_ph = DROP + T['v03_beats'] * P
    cuts = [t_ph + 2 * j * P for j in range(7)]                        # 6 photos, 2 beats each; cuts[6] = end card in
    t_end = cuts[6] + T['end_beats'] * P
    TK, stamp_c = ticket(); seq = []
    # 1) opener, slowed, ticket tracked on the stub
    for k, f in enumerate(opener_frames(TK)):
        seq.append(r.put_text(f, 'Your ticket in.', 112, k - 4, 430) if k >= 4 else f)
    assert len(seq) == 54
    # 2) V01 from 2.5 s
    seq += r.read('V01', 2.5, 69)
    # 3) ticket rises, fills the frame, fast push into the stamp
    base = Image.fromarray((seq[-1].astype(np.float32) * 0.28).astype(np.uint8)).convert('RGBA')
    n3 = fr(DROP) - len(seq)
    for k in range(n3):
        c = base.copy(); rise = ease_out(k / 11); push = ease_in((k - 12) / (n3 - 13)) if k > 12 else 0.0
        s = 1.04 * (1 + 4.2 * push)
        ax = (stamp_c[0] - TK.size[0] / 2) * s; ay = (stamp_c[1] - TK.size[1] / 2) * s
        cx = 540 - ax * push; cy = 2500 + (960 - 2500) * rise - ay * push
        place(c, TK, cx, cy, s, -4.0 * (1 - rise) * (1 - push))
        seq.append(np.asarray(c.convert('RGB')))
    # 4-5) white flash on the drop, V03 from 1.9 s
    nV = fr(t_ph) - fr(DROP); V3 = r.read('V03', 1.9, nV)
    for k, f in enumerate(V3):
        if k < 4: f = (f.astype(np.float32) * (1 - [1, .7, .4, .15][k]) + 255 * [1, .7, .4, .15][k]).astype(np.uint8)
        seq.append(r.put_text(f, 'This is the 16th.', 118, k - 29, 820) if k >= 29 else f)
    # 6) photos, hard cuts exactly on the beat grid
    k0 = 0
    for j, (nm, cx) in enumerate(PHOTOS):
        img = cover(nm, cx)
        for _ in range(fr(cuts[j + 1]) - fr(cuts[j])):
            seq.append(r.put_text(img, 'Food & drink included.', 96, k0, 1240)); k0 += 1
    # 7) end card
    ECB = endcard_bg(); lg = logo_w(880)
    pill = Image.new('RGBA', (600, 170), (0, 0, 0, 0)); pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle((20, 21, 580, 149), 64, fill=(255, 255, 255, 255)); pd.text((300, 85), 'Talk to a Nerd', font=F(56), fill=(*TNBLUE, 255), anchor='mm')
    nE = fr(t_end) - fr(cuts[6])
    for k in range(nE):
        c = ECB.copy(); sc = 0.92 + 0.08 * ease_out(k / 6); l2 = logo_w(int(880 * sc))
        c.alpha_composite(l2, (int(540 - l2.size[0] / 2), int(600 - l2.size[1] / 2)))
        c.alpha_composite(r.text_layer('Phoenix 2027', 76, k - 3, 880)) if k >= 3 else None
        if k >= 7:
            ps = 0.7 + 0.3 * r.ease_back((k - 7) / 7); p2 = pill.resize((int(600 * ps), int(170 * ps)), Image.LANCZOS)
            c.alpha_composite(p2, (int(540 - p2.size[0] / 2), int(1060 - p2.size[1] / 2)))
        if k >= 12: c.alpha_composite(r.text_layer('Link in bio', 48, k - 12, 1215))
        seq.append(np.asarray(c.convert('RGB')))
    N = len(seq); assert N == fr(t_end), (N, fr(t_end))
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'dur_s': N / 30, 'drop_s': DROP, 'v03_out_s': fr(t_ph) / 30, 'photo_cuts_s': [fr(c) / 30 for c in cuts],
            'end_s': fr(t_end) / 30, 'blast_card_s': (fr(DROP) + 29) / 30, 'bpm': T['bpm']}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(meta)

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
