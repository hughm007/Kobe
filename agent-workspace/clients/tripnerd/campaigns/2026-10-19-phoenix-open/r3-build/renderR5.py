# TripNerd x Phoenix Open, Reel 3 v5 "Your Seat's On This Ticket" (owner script v5). 16.0 s, 9:16, 30 fps, 480 frames.
#   1  0.0-3.0   AI opener (Veo): blank stub on a tablecloth, iced drink, stadium soft behind; rack focus from ~1.8 s.
#                The TripNerd ticket face (real logo pixels) is composited onto the stub with a perspective warp and
#                blurred to match the stub's own sharpness frame by frame (it follows the rack focus).   "Your seat's on this ticket."
#   2  3.0-7.5   hard (match) cut -> V03 from 1.9 s, original framing          "This is the 16th." on the blast (3.97 s)
#   3  7.5-11.5  V01 from frame 1, natural pan                                  "Filmed from our seats."
#   4  11.5-13.0 P05 static                                                     "Bring your crew."
#   5  13.0-16.0 end card: logo, "Phoenix 2027", the same ticket slides in stamped, "Talk to a Nerd", "Link in bio"
#   python3 renderR5.py <opener.mp4> <out_silent.mp4> <corners.json>
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
sys.argv_saved = sys.argv; sys.argv = ['x', 'o']
exec(open('renderR3.py').read().split('def build')[0])      # ticket(), stamp(), place_ticket(), card(), F(), EC, LOGO ...
sys.argv = sys.argv_saved

def sharpness(img, quad):
    m = np.zeros(img.shape[:2], np.uint8); cv2.fillConvexPoly(m, quad.astype(np.int32), 1)
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32); lap = cv2.Laplacian(g, cv2.CV_32F)
    return float(lap[m > 0].var())

def overlay_ticket(frames, quad, face):
    """warp the flat ticket face onto the stub quad (TL, TR, BR, BL) and match blur to the stub's own focus"""
    fw, fh = face.size; src = np.float32([[0, 0], [fw, 0], [fw, fh], [0, fh]])
    Mx = cv2.getPerspectiveTransform(src, quad.astype(np.float32))
    face_a = np.asarray(face).astype(np.float32)
    s0 = max(sharpness(frames[0], quad), 1e-3)
    out = []
    for f in frames:
        s = sharpness(f, quad); ratio = min(1.0, s / s0)
        sigma = 0 if ratio > 0.92 else float(np.clip(2.6 * (1 / max(ratio, 0.03) - 1) ** 0.5, 0, 14))
        warped = cv2.warpPerspective(face_a, Mx, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
        if sigma > 0.3: warped = cv2.GaussianBlur(warped, (0, 0), sigma)
        a = warped[..., 3:4] / 255.0
        # multiply-style blend so the paper keeps the shot's own light and shadow; ink sits on top
        base = f.astype(np.float32); ink = warped[..., :3]
        lum = cv2.GaussianBlur(cv2.cvtColor(f, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 6)[..., None] / 245.0
        comp = ink * np.clip(lum, 0.55, 1.08)
        out.append((base * (1 - a) + comp * a).clip(0, 255).astype(np.uint8))
    return out

def build(opener, out, corners):
    quad = np.array(json.load(open(corners))['quad'], np.float32)
    raw = subprocess.run([FF, '-v', 'error', '-i', opener, '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30',
                          '-frames:v', '90', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    O = list(np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)); O += [O[-1]] * (90 - len(O))
    face, _ = ticket(stamped=True)
    O = overlay_ticket(O, quad, face)
    seq = [card(f, "Your seat's on this ticket.", k - 6, 400, 96) if k >= 6 else f for k, f in enumerate(O)]
    V3 = r.read('V03', 1.9, 135)
    seq += [card(f, 'This is the 16th.', k - 29, 820, 118) if k >= 29 else f for k, f in enumerate(V3)]
    V1 = r.read('V01', 0.0, 120)
    seq += [card(f, 'Filmed from our seats.', k, 720) for k, f in enumerate(V1)]
    p = Image.open(SP + 'grok/pack/photos/P05.jpg').convert('RGB')
    fill = p.resize((int(H * p.size[0] / p.size[1]), H), Image.LANCZOS).crop((0, 0, W, H)).filter(ImageFilter.GaussianBlur(40))
    fill = Image.fromarray((np.asarray(fill).astype(np.float32) * 0.45).astype(np.uint8)); fill.paste(p.resize((W, 810), Image.LANCZOS), (0, 470))
    P5 = np.asarray(fill); seq += [card(P5, 'Bring your crew.', k, 1290, 104) for k in range(45)]
    # end card, 3.0 s
    ecbg = np.asarray(EC).astype(np.float32).copy()
    for yy in range(380, 1340):
        l, rr = ecbg[yy, 20:60].mean(0), ecbg[yy, 1020:1060].mean(0); ecbg[yy] = l[None] + (rr - l)[None] * np.linspace(0, 1, W)[:, None]
    ECB = Image.fromarray(ecbg.clip(0, 255).astype(np.uint8)).convert('RGBA')
    lg = LOGO.resize((640, int(640 * LOGO.size[1] / LOGO.size[0])), Image.LANCZOS)
    pill = Image.new('RGBA', (600, 170), (0, 0, 0, 0)); pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle((20, 21, 580, 149), 64, fill=(255, 255, 255, 255)); pd.text((300, 85), 'Talk to a Nerd', font=F(56), fill=(72, 136, 222, 255), anchor='mm')
    for k in range(90):
        c = ECB.copy(); s = 0.9 + 0.1 * ease_out(k / 9); l2 = lg.resize((int(lg.size[0] * s), int(lg.size[1] * s)), Image.LANCZOS)
        c.paste(l2, (int(540 - l2.size[0] / 2), int(470 - l2.size[1] / 2)))
        if k >= 4:
            al = min(1, (k - 3) / 5); tl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(tl).text((540, 680), 'Phoenix 2027', font=F(66), fill=(255, 255, 255, int(255 * al)), anchor='mm'); c.alpha_composite(tl)
        if k >= 6: place_ticket(c, face, 540, 1700 + (930 - 1700) * ease_out((k - 6) / 12), 0.62, 3.0)
        if k >= 20:
            ps = 0.7 + 0.3 * r.ease_back((k - 20) / 7); p2 = pill.resize((int(600 * ps), int(170 * ps)), Image.LANCZOS)
            c.alpha_composite(p2, (int(540 - p2.size[0] / 2), int(1175 - p2.size[1] / 2)))
        if k >= 26: c.alpha_composite(r.text_layer('Link in bio', 50, k - 26, 1290))
        seq.append(np.asarray(c.convert('RGB')))
    assert len(seq) == 480, len(seq)
    pp = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: pp.stdin.write(np.ascontiguousarray(f).tobytes())
    pp.stdin.close(); pp.wait()
    json.dump({'frames': 480, 'cuts_s': [3.0, 7.5, 11.5, 13.0], 'blast_card_s': 3.97, 'roar_drop_s': 5.6}, open(out + '.json', 'w'))
    print('480 frames')

if __name__ == '__main__':
    build(*sys.argv[1:4])
