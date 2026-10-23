# TripNerd x Phoenix Open, Reel 3 "Your Ticket In" v3 (owner revision 2026-10-21 #2). 9:16, 1080x1920, 30 fps, 124 BPM grid.
#   opener   v2 unchanged: source 0.00-0.72 s at 50% speed (DIS optical flow), ticket tracked on the stub (+5%), no added drift
#   V01      from 2.5 s
#   ticket   rise 1 beat -> hold still 2 beats -> push into the stamp 1 beat -> camera stops; the STAMP turns 360 deg clockwise,
#            flat (2D) about its own centre, smootherstep, 2 beats; lands upright = pixel-identical to the pre-spin frame
#   DROP     white flash, V03 from 3.6 s                                                             "This is the 16th."
#   photos   P09, P02 "Hole 16." | P05, P04 (tight static crops, guest holding a cup) "Drinks in hand."  static hard cuts
#   P06      hotel pool pan, no caption, eases in then constant speed through the cut
#   end card foreground arrives at the pan's speed and settles; fixed-size original logo (no spin)
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
import render2 as r
sys.argv = sys.argv_saved
from ticket7 import F, logo_w, TNBLUE
from ticket9 import Ticket
from renderR7 import endcard_bg, ease_out, ease_in, W, H, FF
from renderR8 import opener_frames, text_static, ease_io5, PB
from renderR7 import B
r.SRC.update({'V01': B + 'V01.mp4', 'V03': B + 'V03.mp4'})
K = 4

def place_k(canvas, tk, cx, cy, s, angle=0.0):
    t = tk.resize((max(1, round(tk.size[0] * s / K)), max(1, round(tk.size[1] * s / K))), Image.LANCZOS)
    if angle: t = t.rotate(angle, expand=True, resample=Image.BICUBIC)
    from PIL import ImageFilter
    sh = Image.new('RGBA', (t.size[0] + 120, t.size[1] + 120), (0, 0, 0, 0))
    sh.paste((0, 0, 0, 140), (60 + int(10 * s), 60 + int(22 * s)), t.split()[3])
    sh = sh.filter(ImageFilter.GaussianBlur(max(2, 16 * s)))
    canvas.alpha_composite(sh, (int(cx - t.size[0] / 2 - 60), int(cy - t.size[1] / 2 - 60)))
    canvas.alpha_composite(t, (int(cx - t.size[0] / 2), int(cy - t.size[1] / 2)))

def crop_box(name, box):
    p = Image.open(PB + name + '.jpg').convert('RGB').crop(box)
    assert abs(p.size[0] / p.size[1] - W / H) < 0.002, (name, p.size)
    return np.asarray(p.resize((W, H), Image.LANCZOS))

def cover(name, cx):
    p = Image.open(PB + name + '.jpg').convert('RGB'); w, h = p.size
    if w / h > W / H:
        cw = round(h * W / H); x0 = int(np.clip(cx * w - cw / 2, 0, w - cw)); p = p.crop((x0, 0, x0 + cw, h))
    else:
        ch = round(w * H / W); y0 = (h - ch) // 2; p = p.crop((0, y0, w, y0 + ch))
    return np.asarray(p.resize((W, H), Image.LANCZOS))

def build(out, timing):
    T = json.load(open(timing)); P = 60.0 / T['bpm']; D = T['drop_frame']; Dt = D / 30; g0 = Dt + T['grid_offset']
    bf = lambda k: int(round((g0 + k * P) * 30))
    TKo = Ticket(K); face = TKo.at(0).resize((1000, 470), Image.LANCZOS); seq = []
    # 1) opener (v2)
    nO = bf(-11)
    for k, f in enumerate(opener_frames(face, nO)):
        seq.append(text_static(f, 'Your ticket in.', 112, 430) if k >= 3 else f)
    # 2) V01
    seq += r.read('V01', 2.5, bf(-6) - len(seq))
    # 3) rise, hold, push
    base = Image.fromarray((seq[-1].astype(np.float32) * 0.28).astype(np.uint8)).convert('RGBA')
    nR, nH, nP = bf(-5) - bf(-6), bf(-3) - bf(-5), bf(-2) - bf(-3)
    S0, S1 = 1.04, 3.5; T0 = TKo.at(0); sc = TKo.center1
    for k in range(nR):
        c = base.copy(); u = ease_out((k + 1) / nR); place_k(c, T0, 540, 2500 + (960 - 2500) * u, S0, -4.0 * (1 - u)); seq.append(np.asarray(c.convert('RGB')))
    hold = base.copy(); place_k(hold, T0, 540, 960, S0); seq += [np.asarray(hold.convert('RGB'))] * nH
    def framing(u):
        s = S0 * (S1 / S0) ** u
        return s, 540 - (sc[0] - 500) * s * u, 960 - (sc[1] - 235) * s * u
    for k in range(nP):
        s, cx, cy = framing(ease_in((k + 1) / nP)); c = base.copy(); place_k(c, T0, cx, cy, s); seq.append(np.asarray(c.convert('RGB')))
    pre_spin = seq[-1]
    # 4) flat stamp turn, camera locked at the push end
    s, cx, cy = framing(1.0); nS = D - bf(-2)
    for k in range(nS):
        phi = 360.0 * ease_io5((k + 1) / nS)
        c = base.copy(); place_k(c, TKo.at(0.0 if k == nS - 1 else phi), cx, cy, s); seq.append(np.asarray(c.convert('RGB')))
    assert np.array_equal(seq[-1], pre_spin), 'landing frame must equal the pre-spin frame'
    assert len(seq) == D
    # 5) drop -> V03
    nV = bf(T['v03_beats']) - D; V3 = r.read('V03', T['v03_src'], nV)
    for k, f in enumerate(V3):
        if k < 4: f = (f.astype(np.float32) * (1 - [1, .7, .4, .15][k]) + 255 * [1, .7, .4, .15][k]).astype(np.uint8)
        seq.append(text_static(f, 'This is the 16th.', 118, 820) if k >= 1 else f)
    # 6) static photos, one caption each
    kb = T['v03_beats']; cuts = []
    for ph in T['photos']:
        img = crop_box(ph['name'], ph['box']) if 'box' in ph else cover(ph['name'], ph['cx'])
        a, b = bf(kb), bf(kb + 2); cuts.append(a / 30); seq += [text_static(img, ph['cap'], 100, 480)] * (b - a); kb += 2
    # 7) P06 pan (only moving photo): ease in over 30%, then constant speed through the cut
    p6 = Image.open(PB + 'P06.jpg').convert('RGB'); p6 = np.asarray(p6.resize((round(p6.size[0] * H / p6.size[1]), H), Image.LANCZOS))
    travel = p6.shape[1] - W; a, b = bf(kb), bf(kb + T['pan_beats']); n = b - a; cuts.append(a / 30); fa = 0.3
    v = travel / (n * (1 - fa / 2))                                      # px/frame at full speed
    def xpos(i):
        t = i / n
        return v * n * (t * t / (2 * fa)) if t < fa else v * n * (fa / 2 + (t - fa))
    for i in range(n):
        M = np.float32([[1, 0, -xpos(i)], [0, 1, 0]])
        seq.append(cv2.warpAffine(p6, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT))
    kb += T['pan_beats']
    # 8) end card: foreground enters moving left at the pan's speed, decelerates to rest; logo never spins, fixed 880x324
    BG = endcard_bg(); LG = logo_w(880); a = bf(kb); e = bf(kb + T['end_beats']); cuts.append(a / 30); m = 18; Dx = v * m / 2
    for i in range(a, e):
        k = i - a; dx = int(round(Dx * (1 - k / m) ** 2)) if k < m else 0
        fg = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fg.alpha_composite(LG, (540 - LG.size[0] // 2, 600 - LG.size[1] // 2))
        if i >= bf(kb + 1): fg.alpha_composite(r.text_layer('Phoenix 2027', 76, 99, 880))
        if i >= bf(kb + 2):
            pd = ImageDraw.Draw(fg); pd.rounded_rectangle((260, 996, 820, 1124), 64, fill=(255, 255, 255, 255))
            pd.text((540, 1060), 'Talk to a Nerd', font=F(56), fill=(*TNBLUE, 255), anchor='mm')
        if i >= bf(kb + 3): fg.alpha_composite(r.text_layer('Link in bio', 48, 99, 1215))
        c = BG.copy(); c.alpha_composite(fg, (dx, 0)); seq.append(np.asarray(c.convert('RGB')))
    N = len(seq); assert N == e
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'dur_s': N / 30, 'drop_s': Dt, 'v03_src': T['v03_src'], 'v03_out_s': bf(T['v03_beats']) / 30,
            'opener_out_s': nO / 30, 'ticket_in_s': bf(-6) / 30, 'hold_s': [bf(-5) / 30, bf(-3) / 30], 'spin_s': [bf(-2) / 30, Dt],
            'cuts_s': cuts, 'pan_px_per_frame': round(v, 2), 'end_s': N / 30, 'bpm': T['bpm'],
            'beat_times_s': [round(g0 + k * P, 4) for k in range(-11, kb + T['end_beats'] + 1)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(meta)

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
