# TripNerd x Phoenix Open, Reel 3 "Your Seat's On This Ticket" (owner script, 2026-10-20). 17.0 s, 9:16, 30 fps.
# Real footage only, original framing (no punch-ins/zooms on footage, no Ken Burns on the photo). Footage logos left as filmed
# (owner rule for this version). Ticket + stamp composited in code from the REAL TripNerd logo pixels (never redrawn).
#   1  0.0-0.5   black
#   2  0.5-3.0   ticket slides up, slow push-in toward "THE 16TH"        "Your seat's on this ticket."
#   3  3.0-7.5   2-frame white flash -> V03 from 1.9 s                   "This is the 16th." on the sand blast
#   4  7.5-11.5  V01 from its first frame, natural pan                    "Filmed from our seats."
#   5  11.5-13.5 P05 static                                                "Bring your crew."
#   6  13.5-17.0 end card: logo, "Phoenix 2027", ticket slides back in stamped, "Talk to a Nerd", "Link in bio"
import subprocess, sys, json, math, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, '.')
import render2 as r
FF, W, H, SP = r.FF, r.W, r.H, r.SP
FONT = r.FONT                                   # Montserrat ExtraBold
EC = Image.open(SP + 'endcards/TripNerd_endcard_CameraRoll_9x16.jpg').convert('RGB')
LOGO = EC.crop((140, 565, 940, 902))            # real logo on its own blue
MASCOT = EC.crop((150, 570, 400, 860))
BLUE = (88, 146, 226); NAVY = (20, 34, 64); PAPER = (250, 247, 240)
CARD_FIX = sys.argv[2] if len(sys.argv) > 2 else 'Filmed from our seats.'   # fallback: "Filmed on our trip."
SECTION_LINE = (sys.argv[3] if len(sys.argv) > 3 else '1') == '1'          # drop "SECTION: THE 16TH" if not confirmed

def F(sz): return ImageFont.truetype(FONT, sz)

def stamp(d=230):
    s = Image.new('RGBA', (d, d), (0, 0, 0, 0)); dr = ImageDraw.Draw(s)
    dr.ellipse((4, 4, d - 4, d - 4), outline=(*BLUE, 255), width=8)
    dr.ellipse((26, 26, d - 26, d - 26), fill=(*BLUE, 255))
    m = MASCOT.resize((int(d * 0.52), int(d * 0.52 * MASCOT.size[1] / MASCOT.size[0])), Image.LANCZOS)
    cm = Image.new('L', m.size, 0); ImageDraw.Draw(cm).ellipse((0, 0, m.size[0], m.size[1] * 1.15), fill=255)
    s.paste(m, ((d - m.size[0]) // 2, (d - m.size[1]) // 2), cm)
    txt = 'TRIPNERD  ·  2027  ·  TRIPNERD  ·  2027  ·  '; f = F(15); n = len(txt); R = d / 2 - 16
    for i, ch in enumerate(txt):                # ring lettering
        a = -math.pi / 2 + 2 * math.pi * i / n
        g = Image.new('RGBA', (24, 24), (0, 0, 0, 0)); ImageDraw.Draw(g).text((12, 12), ch, font=f, fill=(*BLUE, 255), anchor='mm')
        g = g.rotate(-math.degrees(a) - 90, resample=Image.BICUBIC)
        s.alpha_composite(g, (int(d / 2 + R * math.cos(a) - 12), int(d / 2 + R * math.sin(a) - 12)))
    return s.rotate(-12, resample=Image.BICUBIC)

def ticket(stamped=True):
    tw, th, stub = 940, 470, 250
    t = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); m = Image.new('L', (tw, th), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, tw - 1, th - 1), 26, fill=255)
    for y in (0, th):                            # notches at the perforation
        ImageDraw.Draw(m).ellipse((tw - stub - 22, y - 22, tw - stub + 22, y + 22), fill=0)
    body = Image.new('RGBA', (tw, th), (*PAPER, 255)); d = ImageDraw.Draw(body)
    band = tuple(int(v) for v in np.median(np.asarray(LOGO)[:8, :].reshape(-1, 3), 0))
    d.rectangle((0, 0, tw, 150), fill=(*band, 255))                       # header band in the logo crop's own blue
    lg = LOGO.resize((int(130 * LOGO.size[0] / LOGO.size[1]), 130), Image.LANCZOS)
    lg_a = Image.new('L', lg.size, 0); ImageDraw.Draw(lg_a).rounded_rectangle((0, 0, lg.size[0] - 1, lg.size[1] - 1), 30, fill=255)
    body.paste(lg, (30, 10), lg_a.filter(ImageFilter.GaussianBlur(10)))
    for y in range(28, th - 20, 22): d.line((tw - stub, y, tw - stub, y + 11), fill=(170, 170, 170, 255), width=3)
    d.text((40, 190), 'SCOTTSDALE, AZ  ·  FEB 2027', font=F(36), fill=(*NAVY, 255))
    if SECTION_LINE:
        d.text((40, 262), 'SECTION', font=F(26), fill=(120, 130, 150, 255))
        d.text((40, 296), 'THE 16TH', font=F(110), fill=(*NAVY, 255))
    d.text((tw - stub + 34, 172), 'ADMIT', font=F(30), fill=(120, 130, 150, 255))
    d.text((tw - stub + 34, 206), 'YOUR', font=F(52), fill=(*NAVY, 255))
    d.text((tw - stub + 34, 260), 'CREW', font=F(52), fill=(*NAVY, 255))
    grain = (np.random.default_rng(3).normal(0, 3.5, (th, tw, 1))).astype(np.float32)   # paper texture
    a = np.asarray(body).astype(np.float32); grain[:150] = 0; a[..., :3] = np.clip(a[..., :3] + grain, 0, 255); body = Image.fromarray(a.astype(np.uint8))
    if stamped:                                   # stamped across the perforation, like a real stub
        st = stamp(160); st.putalpha(st.split()[3].point(lambda v: int(v * 0.9)))
        body.alpha_composite(st, (tw - stub - st.size[0] // 2 + 12, th - st.size[1] + 4))
    t.paste(body, (0, 0), m)
    return t, (40 + 300, 296 + 60)               # anchor = centre of "THE 16TH" in ticket coords

def place_ticket(canvas, tk, cx, cy, scale, angle):
    t = tk.resize((int(tk.size[0] * scale), int(tk.size[1] * scale)), Image.LANCZOS).rotate(angle, expand=True, resample=Image.BICUBIC)
    sh = Image.new('RGBA', (t.size[0] + 80, t.size[1] + 80), (0, 0, 0, 0))
    sh.paste((0, 0, 0, 150), (40 + int(14 * scale), 40 + int(26 * scale)), t.split()[3])
    sh = sh.filter(ImageFilter.GaussianBlur(18 * scale))
    canvas.alpha_composite(sh, (int(cx - t.size[0] / 2 - 40), int(cy - t.size[1] / 2 - 40)))
    canvas.alpha_composite(t, (int(cx - t.size[0] / 2), int(cy - t.size[1] / 2)))

def bg_dark():
    y = np.linspace(0, 1, H)[:, None, None]; x = np.linspace(-1, 1, W)[None, :, None]
    v = (1 - 0.35 * (x ** 2)) * (1 - 0.25 * (y - 0.5) ** 2 * 4)
    return Image.fromarray((np.array([16, 22, 34]) * v * np.ones((H, W, 3))).clip(0, 255).astype(np.uint8)).convert('RGBA')

def ease_out(u): u = min(max(u, 0), 1); return 1 - (1 - u) ** 3
def ease_io(u): u = min(max(u, 0), 1); return u * u * (3 - 2 * u)

def card(f, text, i, y, size=104):
    return r.put_text(np.asarray(f) if not isinstance(f, np.ndarray) else f, text, size, i, y)

def build(out):
    seq = []
    # 1) black
    seq += [np.zeros((H, W, 3), np.uint8)] * 15
    # 2) ticket: slide up 0.5-1.1 s, then slow push-in toward "THE 16TH" until 3.0 s
    TK, (ax, ay) = ticket(stamped=False); BG = bg_dark()
    tx, ty0, ty1, ang = 540, 2300, 1120, -4.0
    for k in range(75):
        t = k / 30
        cy = ty0 + (ty1 - ty0) * ease_out(t / 0.6)
        c = BG.copy(); place_ticket(c, TK, tx, cy, 1.0, ang)
        z = 1.0 + 0.45 * ease_io((t - 0.6) / 1.9)                       # push-in
        a = math.radians(ang); fx = tx + (ax - TK.size[0] / 2) * math.cos(a) + (ay - TK.size[1] / 2) * math.sin(a)
        fy = cy - (ax - TK.size[0] / 2) * math.sin(a) + (ay - TK.size[1] / 2) * math.cos(a)
        f = np.asarray(c.convert('RGB'))
        if z > 1.0001:
            w, h = W / z, H / z; x0 = min(max(fx - w / 2, 0), W - w); y0 = min(max(fy - h * 0.66, 0), H - h)
            f = cv2.resize(f[int(y0):int(y0 + h), int(x0):int(x0 + w)], (W, H), interpolation=cv2.INTER_CUBIC)
        if k >= 9: f = card(f, "Your seat's on this ticket.", k - 9, 400, 96)
        seq.append(f)
    # 3) V03 from 1.9 s, original framing, 4.5 s; 2-frame white flash; card on the sand blast (src ~2.87 s)
    V3 = r.read('V03', 1.9, 135)
    for k, f in enumerate(V3):
        if k < 2: f = (f.astype(np.float32) * (0.15 + 0.4 * k) + 255 * (0.85 - 0.4 * k)).astype(np.uint8)
        if k >= 29: f = card(f, 'This is the 16th.', k - 29, 820, 118)
        seq.append(f)
    # 4) V01 from its first frame, 4.0 s, natural pan
    V1 = r.read('V01', 0.0, 120)
    seq += [card(f, CARD_FIX, k, 720) for k, f in enumerate(V1)]
    # 5) P05 static: full photo on a soft fill of itself, no movement
    p = Image.open(SP + 'grok/pack/photos/P05.jpg').convert('RGB')
    fill = p.resize((int(H * p.size[0] / p.size[1]), H), Image.LANCZOS).crop((0, 0, W, H)).filter(ImageFilter.GaussianBlur(40))
    fill = Image.fromarray((np.asarray(fill).astype(np.float32) * 0.45).astype(np.uint8))
    fill.paste(p.resize((W, 810), Image.LANCZOS), (0, 470)); P5 = np.asarray(fill)
    seq += [card(P5, 'Bring your crew.', k, 1360 - 70, 104) for k in range(60)]
    # 6) end card
    ecbg = np.asarray(EC).astype(np.float32).copy()
    for yy in range(380, 1340):
        l, rr = ecbg[yy, 20:60].mean(0), ecbg[yy, 1020:1060].mean(0); ecbg[yy] = l[None] + (rr - l)[None] * np.linspace(0, 1, W)[:, None]
    ECB = Image.fromarray(ecbg.clip(0, 255).astype(np.uint8)).convert('RGBA')
    lg = LOGO.resize((640, int(640 * LOGO.size[1] / LOGO.size[0])), Image.LANCZOS)
    TKS, _ = ticket(stamped=True)
    pill = Image.new('RGBA', (600, 170), (0, 0, 0, 0)); pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle((20, 21, 580, 149), 64, fill=(255, 255, 255, 255))
    pd.text((300, 85), 'Talk to a Nerd', font=F(56), fill=(72, 136, 222, 255), anchor='mm')
    for k in range(105):
        c = ECB.copy()
        s = 0.9 + 0.1 * ease_out(k / 9); l2 = lg.resize((int(lg.size[0] * s), int(lg.size[1] * s)), Image.LANCZOS)
        c.paste(l2, (int(540 - l2.size[0] / 2), int(470 - l2.size[1] / 2)))
        if k >= 4:
            al = min(1, (k - 3) / 5); tl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(tl).text((540, 680), 'Phoenix 2027', font=F(66), fill=(255, 255, 255, int(255 * al)), anchor='mm'); c.alpha_composite(tl)
        if k >= 8:
            cy = 1700 + (930 - 1700) * ease_out((k - 8) / 14); place_ticket(c, TKS, 540, cy, 0.62, 3.0)
        if k >= 26:
            ps = 0.7 + 0.3 * r.ease_back((k - 26) / 7); p2 = pill.resize((int(600 * ps), int(170 * ps)), Image.LANCZOS)
            c.alpha_composite(p2, (int(540 - p2.size[0] / 2), int(1175 - p2.size[1] / 2)))
        if k >= 32: c.alpha_composite(r.text_layer('Link in bio', 50, k - 32, 1290))
        seq.append(np.asarray(c.convert('RGB')))
    assert len(seq) == 510, len(seq)
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    json.dump({'frames': len(seq), 'total_s': 17.0, 'cuts_s': [0.5, 3.0, 7.5, 11.5, 13.5], 'card_blast_s': 3.97, 'drop_s': 5.5}, open(out + '.json', 'w'))
    print(len(seq), 'frames')

if __name__ == '__main__':
    build(sys.argv[1])
