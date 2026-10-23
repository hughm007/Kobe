# TripNerd Phoenix Open 2027 FINAL Reel, Explore cut (owner brief 2026-10-21). 1080x1920, 30 fps, 124 BPM grid, drop 6.30 s.
#   HOOK 01 aerial push (3 beats) | 05 "Everyone wants the 16th." (3) | opener real frames ~63% (3) | tall ticket pop+hold+flat
#   stamp spin (4) -> DROP flash | V03 3.6 s (6) | 03 (2) + 04 (3) suite POV | AI food 0:02-0:04 (4) | V03 roar beat (1) |
#   06b Fairmont pan, duck + water, stamp on beat 17 (6) | end card (6), last 0.3 s fades into frame 1 for the loop
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw
from final13 import *
from renderR7 import endcard_bg, warp_onto, OPENER, QUADS, FF, B
from renderR8 import ease_io5
from renderR10 import stamp_roundness
from ticket9 import Ticket
r.SRC.update({'V03': B + 'V03.mp4'})
FOOD = '/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/9900a359-hf_20261021_175347_4947cdf7-6cd6-401e-854d-19d38f14845f.mp4'
def ease_out3(u): u = min(max(u, 0), 1); return 1 - (1 - u) ** 3
def ease_back(u, s=1.4): u = min(max(u, 0), 1); return 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2

def build(out, tjson):
    T = json.load(open(tjson)); P = 60 / T['bpm']; D = T['drop_frame']; g0 = D / 30 + T['grid_offset']
    bf = lambda k: int(round((g0 + k * P) * 30)); seq = []; shots = []
    # 1) HOOK: aerial push, fast then slow (zoom 1.0 -> 1.3, always a downscale)
    a, b = 0, bf(-10); shots.append(('hook 01', a)); L = caption('The loudest hole in golf.')
    for k in range(b - a):
        z = 1 + 0.3 * ease_out3(k / (b - a - 1)); seq.append(with_cap(grade(crop916(PK + '01_aerial.jpg', 0, 0.5, z, x_px=2240)), L))
    frame1 = seq[0]
    # 2) iconic 16th (05; 02 is too small for 9:16 without upscaling)
    shots.append(('05 iconic', len(seq))); img = with_cap(grade(crop916(PK + '05_suite_view_tee.jpg', 0.42)), caption('Everyone wants the 16th.'))
    seq += [img] * (bf(-7) - len(seq))
    # 3) drink & ticket: REAL frames 0-22 of the opener, held (~63% speed), ticket face tracked on the stub
    shots.append(('opener', len(seq))); n = bf(-4) - len(seq)
    raw = subprocess.run([FF, '-v', 'error', '-i', OPENER, '-frames:v', '23', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    src = np.frombuffer(raw, np.uint8).reshape(-1, 1912, 1080, 3); s_ = H / 1912; nw = round(1080 * s_); x0 = int((nw - W) / 2)
    face = Ticket(4).at(0).resize((1000, 470), Image.LANCZOS); L = caption("Here's how you get in."); clean = None
    for k in range(n):
        i = min(22, int(k * 23 / n)); f = grade(cv2.resize(src[i], (nw, H), interpolation=cv2.INTER_LANCZOS4)[:, x0:x0 + W])
        q = np.float32(QUADS[i]) * s_ - np.float32([x0, 0]); c = q.mean(0); q = (q - c) * 1.05 + c
        clean = warp_onto(f, face, q); seq.append(with_cap(clean, L))
    # 4) tall ticket: pop up (8 frames), hold, stamp spins 360 flat in its stub (2 beats), lands upright on the frame before the flash
    shots.append(('ticket', len(seq))); ST = SuiteTicket(4); base = Image.fromarray((clean.astype(np.float32) * 0.3).astype(np.uint8)).convert('RGBA')
    TY = 905; a = len(seq); sp = bf(-2); tk = []
    for k in range(a, D):
        c = base.copy(); u = (k - a + 1) / 8
        y = 2500 + (TY - 2500) * ease_back(u) if k - a < 8 else TY
        phi = 360 * ease_io5((k - sp + 1) / (D - sp)) if k >= sp else 0.0
        if k == D - 1: phi = 0.0
        place(c, ST.frame(phi), 4, 540, y, 1.0); tk.append(np.asarray(c.convert('RGB')))
    assert np.array_equal(tk[-1], tk[sp - a - 1]), 'stamp must land pixel-identical'
    seq += tk; assert len(seq) == D
    # 5) DROP: flash -> V03 from 3.6 s
    shots.append(('V03', D)); L = caption('Hole 16. With TripNerd.'); nV = bf(6) - D
    for k, f in enumerate(r.read('V03', T['v03_src'], nV)):
        f = grade(f)
        if k < 4: f = (f.astype(np.float32) * (1 - [1, .7, .4, .15][k]) + 255 * [1, .7, .4, .15][k]).astype(np.uint8)
        seq.append(with_cap(f, L) if k >= 1 else f)
    # 6) suite POV: 03 (2 beats) -> 04 (3 beats), one caption across both
    L = caption('Your view from the 16th Hole LOGE Suite.')
    shots.append(('03', len(seq))); img = with_cap(grade(crop916(PK + '03_suite_view_vertical.jpg', 0.5)), L); seq += [img] * (bf(8) - len(seq))
    shots.append(('04', len(seq))); img = with_cap(grade(crop916(PK + '04_suite_view_green.jpg', 0.55)), L); seq += [img] * (bf(11) - len(seq))
    # 7) food: AI clip 0:02-0:04, 9:16 crop on the tostadas + short rib (source is 1080p: 607x1080 crop enlarged to fill)
    shots.append(('food', len(seq))); n = bf(15) - len(seq); L = caption('Food & drink included.')
    raw = subprocess.run([FF, '-v', 'error', '-ss', '2.0', '-t', '2.0', '-i', FOOD, '-vf', 'fps=30', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fv = np.frombuffer(raw, np.uint8).reshape(-1, 1080, 1920, 3); cw = 1080 * 9 / 16; fx = 0.47 * 1920 - cw / 2
    for k in range(n):
        f = fv[min(len(fv) - 1, int(k * len(fv) / n))]
        img = np.asarray(Image.fromarray(f).resize((W, H), Image.LANCZOS, box=(fx, 0, fx + cw, 1080)))
        seq.append(with_cap(grade(img), L))
    # 8) noise: V03's crowd erupting, 1 beat (the roar peaks in the mix)
    shots.append(('roar', len(seq))); seq += [grade(f) for f in r.read('V03', 6.5, bf(16) - len(seq))]
    # 9) hotel: 06b full-frame 9:16, slow lateral pan; mini ticket slides in; stamp lands beside the text on beat 17
    a = len(seq); e1 = bf(22); land = bf(17); n = e1 - a; shots.append(('hotel 06b', a)); L = caption('Then you stay here.')
    HM = HotelMini(4); TS, tcx, tcy = 0.8, 500, 1420; travel = 620.0; fa = 0.3; v = travel / (n * (1 - fa / 2))
    xpos = lambda i: v * n * ((i / n) ** 2 / (2 * fa)) if i / n < fa else v * n * (fa / 2 + (i / n - fa))
    for i in range(n):
        k = a + i; c = Image.fromarray(grade(crop916(PK + '06b_hotel_backup_fairmont.jpg', 0, 0.5, 1.0, x_px=1560 + xpos(i)))).convert('RGBA')
        u = ease_out3((i + 1) / 9); place(c, HM.body, 4, tcx, 2300 + (tcy - 2300) * u, TS)
        if k >= land - 5:
            p = min(1.0, (k - (land - 5) + 1) / 5); sc = 1.0 if k >= land else 1.6 - 0.6 * p ** 2; al = 1.0 if k >= land else min(1, 0.35 + p)
            d = max(2, round(HM.stamp.size[0] / 4 * TS * sc)); st = HM.stamp.resize((d, d), Image.LANCZOS)
            if al < 1: st.putalpha(st.split()[3].point(lambda v_: int(v_ * al)))
            c.alpha_composite(st, (int(round(tcx + (HM.stamp_c[0] / 4 - 550) * TS - d / 2)), int(round(tcy + (HM.stamp_c[1] / 4 - 150) * TS - d / 2))))
        c.alpha_composite(L); seq.append(np.asarray(c.convert('RGB')))
    pan_v = v * 0.75                                                      # source px/frame -> output px/frame
    # 10) end card: arrives at the pan's speed; elements on beats; final 0.3 s fades into frame 1 (loop)
    BG = endcard_bg(); LG = logo_w(880); a = len(seq); e = bf(28); shots.append(('end card', a)); m = 18; Dx = pan_v * m / 2
    head = r.text_layer('The Phoenix Open, done the TripNerd way.', 64, 99, 870)
    fb = F(54); bt = 'Talk to a Nerd'; bb = fb.getbbox(bt); bw, bh = bb[2] - bb[0], bb[3] - bb[1]; padx, pady = 96, 46
    for i in range(a, e):
        k = i - a; dx = int(round(Dx * (1 - k / m) ** 2)) if k < m else 0
        fg = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fg.alpha_composite(LG, (540 - LG.size[0] // 2, 560 - LG.size[1] // 2))
        if i >= bf(23): fg.alpha_composite(head)
        if i >= bf(24):
            pd = ImageDraw.Draw(fg); cy = 1085
            pd.rounded_rectangle((540 - bw / 2 - padx, cy - bh / 2 - pady, 540 + bw / 2 + padx, cy + bh / 2 + pady), (bh + 2 * pady) / 2, fill=(255, 255, 255, 255))
            pd.text((540, cy), bt, font=fb, fill=(*TNBLUE, 255), anchor='mm')
        if i >= bf(25): fg.alpha_composite(r.text_layer('Link in bio', 48, 99, 1250))
        c = BG.copy(); c.alpha_composite(fg, (dx, 0)); f = np.asarray(c.convert('RGB'))
        if i >= e - 9: t = (i - (e - 9) + 1) / 9; f = (f.astype(np.float32) * (1 - t) + frame1.astype(np.float32) * t).astype(np.uint8)
        seq.append(f)
    N = len(seq); assert N == e
    ratios = [x for x in (stamp_roundness(f) for f in tk[8:]) if x is not None]
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    meta = {'frames': N, 'dur_s': N / 30, 'drop_s': D / 30, 'v03_src': T['v03_src'], 'v03_out_s': bf(6) / 30, 'roar_s': [bf(15) / 30, bf(16) / 30],
            'hotel_cut_s': bf(16) / 30, 'stamp_land_s': land / 30, 'kick17_s': round(g0 + 17 * P, 4), 'end_s': N / 30,
            'shots_s': [(nm, round(f / 30, 3)) for nm, f in shots], 'stamp_aspect': [round(min(ratios), 4), round(max(ratios), 4)] if ratios else None,
            'beat_times_s': [round(g0 + k * P, 4) for k in range(-13, 29)]}
    json.dump(meta, open(out + '.json', 'w'), indent=1); print(meta)
if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
