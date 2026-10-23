# TripNerd x Phoenix Open, Reel 3 "Your Ticket In" (owner brief 2026-10-20). 16.5 s, 9:16, 30 fps, 495 frames.
# AI is used ONLY in shot 1: a still of the first frame of Wyatt's Higgsfield drink+ticket clip (internal note: AI).
#   1  0.0-1.2   AI first frame, 1.5% slow drift; ticket face tracked onto the blank stub      "Your ticket in."
#   2  1.2-3.7   V01 from 2.45 s (the pole leaves frame at 2.4 s): desert pan into the 16th green
#   3  3.7-5.0   the ticket graphic rises from the bottom, fills the frame, push into the stamp, 2-frame white flash
#   4  5.0-9.5   V03 from 1.9 s, original framing                                            "This is the 16th." on the blast
#   5  9.5-13.5  4 guest photos, 1.0 s each, static, cover-cropped to 9:16                    "Food & drink included." (held)
#   6  13.5-16.5 end card: logo, "Phoenix 2027", "Talk to a Nerd", "Link in bio"
#   python3 renderR6.py <out.mp4> <assets.json>
#   assets.json: {"opener": path|null, "stub_quad": [[x,y]x4] (TL,TR,BR,BL in 1080x1920 opener coords)|null,
#                 "photos": [{"path":..., "cx": 0..1}, x4]   (null path -> marked slot)}
import subprocess, sys, json, math, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
_argv = sys.argv; sys.argv = ['x', 'o']
exec(open('renderR3.py').read().split('def build')[0])        # r, FF, W, H, SP, F(), LOGO, MASCOT, stamp(), place_ticket(), card(), ease_*
sys.argv = _argv

def ticket16():
    """TRIPNERD · HOLE 16 · FEB 2027 + round stamp; header uses the real logo pixels on their own blue"""
    tw, th, stub = 940, 470, 250
    m = Image.new('L', (tw, th), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, tw - 1, th - 1), 26, fill=255)
    for y in (0, th): ImageDraw.Draw(m).ellipse((tw - stub - 22, y - 22, tw - stub + 22, y + 22), fill=0)
    body = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(body)
    band = tuple(int(v) for v in np.median(np.asarray(LOGO)[:8, :].reshape(-1, 3), 0))
    d.rectangle((0, 0, tw, 150), fill=(*band, 255))
    lg = LOGO.resize((int(130 * LOGO.size[0] / LOGO.size[1]), 130), Image.LANCZOS)
    la = Image.new('L', lg.size, 0); ImageDraw.Draw(la).rounded_rectangle((0, 0, lg.size[0] - 1, lg.size[1] - 1), 30, fill=255)
    body.paste(lg, (30, 10), la.filter(ImageFilter.GaussianBlur(10)))
    for y in range(168, th - 20, 22): d.line((tw - stub, y, tw - stub, y + 11), fill=(170, 170, 170, 255), width=3)
    d.text((40, 186), 'TRIPNERD  ·  FEB 2027', font=F(36), fill=(*NAVY, 255))
    d.text((40, 250), 'HOLE', font=F(34), fill=(120, 130, 150, 255))
    d.text((40, 284), '16', font=F(150), fill=(*NAVY, 255))
    d.text((tw - stub + 34, 180), 'ADMIT', font=F(30), fill=(120, 130, 150, 255))
    d.text((tw - stub + 34, 214), 'YOUR', font=F(52), fill=(*NAVY, 255))
    d.text((tw - stub + 34, 268), 'CREW', font=F(52), fill=(*NAVY, 255))
    g = np.random.default_rng(3).normal(0, 3.5, (th, tw, 1)).astype(np.float32); g[:150] = 0
    a = np.asarray(body).astype(np.float32); a[..., :3] = np.clip(a[..., :3] + g, 0, 255); body = Image.fromarray(a.astype(np.uint8))
    st = stamp(170); st.putalpha(st.split()[3].point(lambda v: int(v * 0.92)))
    sx, sy = tw - stub - st.size[0] // 2 + 14, th - st.size[1] - 2
    body.alpha_composite(st, (sx, sy))
    out = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); out.paste(body, (0, 0), m)
    return out, (sx + st.size[0] / 2, sy + st.size[1] / 2)

def slot(label, sub=''):
    im = Image.new('RGB', (W, H), (60, 60, 66)); d = ImageDraw.Draw(im)
    d.rectangle((40, 40, W - 40, H - 40), outline=(255, 200, 0), width=8)
    d.text((540, 820), label, font=F(64), fill=(255, 200, 0), anchor='mm'); d.text((540, 920), sub, font=F(34), fill=(230, 230, 230), anchor='mm')
    return np.asarray(im)

def cover_9x16(path, cx):
    p = Image.open(path).convert('RGB'); w, h = p.size
    if w / h > 9 / 16:
        cw = int(h * 9 / 16); x0 = int(np.clip(cx * w - cw / 2, 0, w - cw)); p = p.crop((x0, 0, x0 + cw, h))
    else:
        ch = int(w * 16 / 9); y0 = int((h - ch) / 2); p = p.crop((0, y0, w, y0 + ch))
    return np.asarray(p.resize((W, H), Image.LANCZOS))

def warp_onto(f, face, quad):
    fa = np.asarray(face).astype(np.float32); fw, fh = face.size
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [fw, 0], [fw, fh], [0, fh]]), np.float32(quad))
    w = cv2.warpPerspective(fa, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    w = cv2.GaussianBlur(w, (0, 0), 0.6); a = w[..., 3:4] / 255.0
    lum = cv2.GaussianBlur(cv2.cvtColor(f, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 5)[..., None] / 240.0
    return (f.astype(np.float32) * (1 - a) + w[..., :3] * np.clip(lum, 0.6, 1.05) * a).clip(0, 255).astype(np.uint8)

def build(out, assets):
    A = json.load(open(assets)); TK, stamp_c = ticket16(); seq = []
    # 1) AI first frame, slow 1.5% drift, ticket on the stub
    if A.get('opener'):
        base = np.asarray(Image.open(A['opener']).convert('RGB').resize((W, H), Image.LANCZOS))
        if A.get('stub_quad'): base = warp_onto(base, TK, A['stub_quad'])
    else:
        base = slot('AI FIRST-FRAME SLOT', 'Higgsfield drink + ticket clip, frame 0')
    for k in range(36):
        z = 1.0 + 0.015 * k / 35; f = r.punch(base, z, 540, 1100)
        seq.append(card(f, 'Your ticket in.', k - 3, 420, 112) if k >= 3 else f)
    # 2) V01 from 2.45 s, 2.5 s
    seq += r.read('V01', 2.45, 75)
    # 3) ticket rises, fills the frame, push into the stamp, 2-frame white flash
    last = Image.fromarray((seq[-1].astype(np.float32) * 0.35).astype(np.uint8)).filter(ImageFilter.GaussianBlur(12)).convert('RGBA')
    for k in range(39):
        c = last.copy()
        rise = ease_out(k / 12); s_fill = 1.1
        push = ease_io((k - 13) / 24) if k > 13 else 0.0
        s = s_fill * (1 + 1.6 * push)
        ax = (stamp_c[0] - TK.size[0] / 2) * s; ay = (stamp_c[1] - TK.size[1] / 2) * s
        cx = 540 - ax * push; cy = (2400 + (960 - 2400) * rise) - ay * push
        place_ticket(c, TK, cx, cy, s, -3.0 * (1 - push))
        f = np.asarray(c.convert('RGB'))
        if k >= 37: f = np.full_like(f, 255) if k == 37 else (f * 0.4 + 255 * 0.6).astype(np.uint8)
        seq.append(f)
    # 4) V03 from 1.9 s, card on the sand blast (contact ~2.87 s raw -> frame 29)
    V3 = r.read('V03', 1.9, 135)
    seq += [card(f, 'This is the 16th.', k - 29, 820, 118) if k >= 29 else f for k, f in enumerate(V3)]
    # 5) four guest photos, 1.0 s each, static, card held across all four (pops in once)
    for j, ph in enumerate(A['photos']):
        img = cover_9x16(ph['path'], ph.get('cx', 0.5)) if ph.get('path') else slot(f'GUEST PHOTO SLOT {j + 1}', 'faces / drinks / smiles, Phoenix folder')
        for k in range(30): seq.append(card(img, 'Food & drink included.', j * 30 + k, 1250, 100))
    # 6) end card, 3.0 s
    ecbg = np.asarray(EC).astype(np.float32).copy()
    for yy in range(380, 1340):
        l, rr = ecbg[yy, 20:60].mean(0), ecbg[yy, 1020:1060].mean(0); ecbg[yy] = l[None] + (rr - l)[None] * np.linspace(0, 1, W)[:, None]
    ECB = Image.fromarray(ecbg.clip(0, 255).astype(np.uint8)).convert('RGBA')
    lg = LOGO.resize((640, int(640 * LOGO.size[1] / LOGO.size[0])), Image.LANCZOS)
    pill = Image.new('RGBA', (600, 170), (0, 0, 0, 0)); pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle((20, 21, 580, 149), 64, fill=(255, 255, 255, 255)); pd.text((300, 85), 'Talk to a Nerd', font=F(56), fill=(72, 136, 222, 255), anchor='mm')
    for k in range(90):
        c = ECB.copy(); c.paste(lg, (int(540 - lg.size[0] / 2), int(560 - lg.size[1] / 2)))
        al = min(1, (k + 1) / 5); tl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(tl).text((540, 790), 'Phoenix 2027', font=F(72), fill=(255, 255, 255, int(255 * al)), anchor='mm'); c.alpha_composite(tl)
        if k >= 6:
            ps = 0.7 + 0.3 * r.ease_back((k - 6) / 7); p2 = pill.resize((int(600 * ps), int(170 * ps)), Image.LANCZOS)
            c.alpha_composite(p2, (int(540 - p2.size[0] / 2), int(1010 - p2.size[1] / 2)))
        if k >= 12: c.alpha_composite(r.text_layer('Link in bio', 46, k - 12, 1140))
        seq.append(np.asarray(c.convert('RGB')))
    assert len(seq) == 495, len(seq)
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    json.dump({'frames': 495, 'cuts_s': [1.2, 3.7, 5.0, 9.5, 10.5, 11.5, 12.5, 13.5], 'blast_card_s': 5.97, 'roar_drop_s': 7.9,
               'contact_frames_s': [0.6, 2.4, 4.3, 7.0, 11.0, 15.0]}, open(out + '.json', 'w'))
    print('495 frames')

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
