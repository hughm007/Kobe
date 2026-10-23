# TripNerd x Phoenix Open, Reel 3 "Your Ticket In" revision (owner revision 2026-10-21). 9:16, 1080x1920, 30 fps.
# All section boundaries sit on the music's 124 BPM kick grid (drop attack locked to the white-flash frame).
#   opener   source 0.00-0.72 s at 50% speed (DIS optical flow), ticket face over the stub (quad +5% so no stub edge shows)
#   V01      from 2.5 s, 5 beats
#   ticket   rise 1 beat -> HOLD still 2 beats -> push into the stamp 1 beat -> original logo file spins 360 deg on Y, 2 beats,
#            landing on its exact, unaltered pixels on the last frame before the drop
#   DROP     white flash, V03 from 3.6 s (spectator head fully out of frame), 8 beats              "This is the 16th."
#   photos   2 beats each, static hard cuts, one caption per photo or pair (captions cut on, no scaling)
#   end card fixed-size original logo (880x324 = 1633:601), "Phoenix 2027", "Talk to a Nerd", "Link in bio", elements cut on beats
#   python3 renderR8.py <out.mp4> <timing.json>
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
import render2 as r
sys.argv = sys.argv_saved
from ticket7 import ticket, F, logo_w, LOGO, TNBLUE, SP, B
from renderR7 import warp_onto, place, cover, endcard_bg, ease_out, ease_in, OPENER, QUADS, W, H, FF
r.SRC.update({'V01': B + 'V01.mp4', 'V03': B + 'V03.mp4'})
PB = SP + 'grok/pack/photos/'

def ease_io(u): u = min(max(u, 0), 1); return u * u * (3 - 2 * u)
def ease_io5(u): u = min(max(u, 0), 1); return u ** 3 * (u * (6 * u - 15) + 10)       # smootherstep for the spin

def text_static(f, text, size, y):
    img = Image.fromarray(f).convert('RGBA'); img.alpha_composite(r.text_layer(text, size, 99, y)); return np.asarray(img.convert('RGB'))

def opener_frames(face, n):
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '20', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    src = np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3)
    s = H / 1912; nw = round(1080 * s); x0 = int((nw - W) / 2)
    S = [cv2.resize(f, (nw, H), interpolation=cv2.INTER_LANCZOS4)[:, x0:x0 + W] for f in src]
    Q = []
    for q in QUADS[:20]:
        q = np.float32(q) * s - np.float32([x0, 0]); c = q.mean(0); Q.append((q - c) * 1.05 + c)   # 5% larger: covers stub edges + teeth
    out = []
    for k in range(n):
        p = k * 0.4; i = int(p); t = p - i
        f = S[i] if t < 0.02 else r.interp(S[i], S[i + 1], t)
        q = Q[i] if t < 0.02 else Q[i] * (1 - t) + Q[i + 1] * t
        out.append(warp_onto(f, face, q))
    return out

def spin_frame(bg, lg, theta, cx, cy, f=2600.0):
    """original logo pixels, rotated about the vertical axis with perspective; back half shown un-mirrored"""
    c = np.cos(np.radians(theta)); sn = np.sin(np.radians(theta))
    if abs(c) < 0.03: return bg.copy()
    w, h = lg.size[0] / 2, lg.size[1] / 2
    pts = []
    for x, y in ((-w, -h), (w, -h), (w, h), (-w, h)):
        X = x * c; Z = x * sn; k = f / (f + Z); pts.append((cx + X * k, cy + y * k))
    img = lg if c > 0 else lg.transpose(Image.FLIP_LEFT_RIGHT)
    a = np.asarray(img).astype(np.float32); fw, fh = img.size
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [fw, 0], [fw, fh], [0, fh]]), np.float32(pts))
    wp = cv2.warpPerspective(a, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    base = np.asarray(bg.convert('RGB')).astype(np.float32); al = wp[..., 3:4] / 255
    return Image.fromarray((base * (1 - al) + wp[..., :3] * al).clip(0, 255).astype(np.uint8)).convert('RGBA')

def build(out, timing):
    T = json.load(open(timing)); P = 60.0 / T['bpm']; D = T['drop_frame']; Dt = D / 30
    g0 = Dt + T['grid_offset']                                          # kick-grid beat at the drop
    bf = lambda k: int(round((g0 + k * P) * 30))                        # frame of beat k (k<0 = before the drop)
    TK, stamp_c = ticket(); seq = []
    nO = bf(-11)
    # 1) opener
    for k, f in enumerate(opener_frames(TK, nO)):
        seq.append(text_static(f, 'Your ticket in.', 112, 430) if k >= 3 else f)
    # 2) V01 from 2.5 s
    seq += r.read('V01', 2.5, bf(-6) - len(seq))
    # 3) ticket: rise, hold, push into stamp
    base = Image.fromarray((seq[-1].astype(np.float32) * 0.28).astype(np.uint8)).convert('RGBA')
    nR, nH, nP = bf(-5) - bf(-6), bf(-3) - bf(-5), bf(-2) - bf(-3)
    S0, S1 = 1.04, 8.0
    for k in range(nR):
        c = base.copy(); u = ease_out((k + 1) / nR)
        place(c, TK, 540, 2500 + (960 - 2500) * u, S0, -4.0 * (1 - u)); seq.append(np.asarray(c.convert('RGB')))
    hold = base.copy(); place(hold, TK, 540, 960, S0, 0.0); hold = np.asarray(hold.convert('RGB'))
    seq += [hold] * nH                                                   # perfectly still, readable
    BG = endcard_bg(); LG = logo_w(880)                                  # 880x324: 1633:601 within half a pixel
    for k in range(nP):
        u = ease_in((k + 1) / nP); s = S0 * (S1 / S0) ** u                # exponential push reads as constant speed
        ax = (stamp_c[0] - TK.size[0] / 2) * s; ay = (stamp_c[1] - TK.size[1] / 2) * s
        c = base.copy(); place(c, TK, 540 - ax * u, 960 - ay * u, s, 0.0)
        f = np.asarray(c.convert('RGB')).astype(np.float32)
        if k >= nP - 4:                                                 # dissolve into the stamp-blue spin stage
            m = (k - (nP - 5)) / 5; f = f * (1 - m) + np.asarray(spin_frame(BG, LG, 0.0, 540, 960).convert('RGB')) * m
        seq.append(f.astype(np.uint8))
    # 4) logo spin, 360 deg, lands exactly on the last frame before the drop
    nS = D - bf(-2)
    for k in range(nS):
        u = (k + 1) / nS; th = 360.0 * ease_io5(u)
        if k == nS - 1:
            fr_ = BG.copy(); fr_.alpha_composite(LG, (540 - LG.size[0] // 2, 960 - LG.size[1] // 2))   # exact original pixels
        else:
            fr_ = spin_frame(BG, LG, th, 540, 960)
        seq.append(np.asarray(fr_.convert('RGB')))
    assert len(seq) == D, (len(seq), D)
    # 5) DROP: white flash into V03 from 3.6 s
    nV = bf(T['v03_beats']) - D; V3 = r.read('V03', T['v03_src'], nV)
    for k, f in enumerate(V3):
        if k < 4: f = (f.astype(np.float32) * (1 - [1, .7, .4, .15][k]) + 255 * [1, .7, .4, .15][k]).astype(np.uint8)
        seq.append(text_static(f, 'This is the 16th.', 118, 820) if k >= 1 else f)
    # 6) photos, 2 beats each, static, caption per photo/pair
    kb = T['v03_beats']; cuts = []
    for nm, cx, cap in T['photos']:
        img = cover_any(nm, cx); a, b = bf(kb), bf(kb + 2); cuts.append(a / 30)
        seq += [text_static(img, cap, 100, 480)] * (b - a); kb += 2       # caption in the sky band, clear of faces
    # 7) end card, elements cut on beats, logo fixed size
    a = bf(kb); cuts.append(a / 30); e = bf(kb + T['end_beats'])
    for i in range(a, e):
        k = i - a; c = BG.copy(); c.alpha_composite(LG, (540 - LG.size[0] // 2, 600 - LG.size[1] // 2))
        if i >= bf(kb + 1): c.alpha_composite(r.text_layer('Phoenix 2027', 76, 99, 880))
        if i >= bf(kb + 2):
            pill = Image.new('RGBA', (W, H), (0, 0, 0, 0)); pd = ImageDraw.Draw(pill)
            pd.rounded_rectangle((260, 996, 820, 1124), 64, fill=(255, 255, 255, 255)); pd.text((540, 1060), 'Talk to a Nerd', font=F(56), fill=(*TNBLUE, 255), anchor='mm')
            c.alpha_composite(pill)
        if i >= bf(kb + 3): c.alpha_composite(r.text_layer('Link in bio', 48, 99, 1215))
        seq.append(np.asarray(c.convert('RGB')))
    N = len(seq); assert N == e
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'dur_s': N / 30, 'drop_s': Dt, 'v03_src': T['v03_src'], 'v03_out_s': bf(T['v03_beats']) / 30,
            'opener_out_s': nO / 30, 'ticket_in_s': bf(-6) / 30, 'hold_s': [bf(-5) / 30, bf(-3) / 30], 'spin_s': [bf(-2) / 30, Dt],
            'photo_cuts_s': cuts, 'end_s': N / 30, 'bpm': T['bpm'], 'beat_times_s': [round(g0 + k * P, 4) for k in range(-11, kb + T['end_beats'] + 1)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(meta)

def cover_any(name, cx):
    p = Image.open(PB + name + '.jpg').convert('RGB'); w, h = p.size
    if w / h > W / H:
        cw = round(h * W / H); x0 = int(np.clip(cx * w - cw / 2, 0, w - cw)); p = p.crop((x0, 0, x0 + cw, h))
    else:
        ch = round(w * H / W); y0 = (h - ch) // 2; p = p.crop((0, y0, w, y0 + ch))
    return np.asarray(p.resize((W, H), Image.LANCZOS))

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
