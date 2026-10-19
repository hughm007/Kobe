# TripNerd Phoenix v2 "This is the 16th." - energy cut on a 120 BPM grid (beat = 15 frames at 30 fps).
# Real owner footage only. Logos are painted out with flat wall-coloured patches only where they appear (no blur, no AI).
# Slow motion on the opening bunker blast uses DIS optical-flow in-betweens (disclosed in the build record).
import subprocess, sys, json, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
U = '/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/'
SP = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/'
SRC = {'V01': U + '50fc4af8-IMG_0075.mov', 'V02': U + '4c826f89-IMG_0192.mov', 'V03': U + 'b378ad27-IMG_0112.mov'}
FONT = SP + 'thumb/Montserrat.ttf'  # Montserrat ExtraBold
W, H = 1080, 1920
GROUP_LINE = sys.argv[2] if len(sys.argv) > 2 else 'Your group, rail side.'   # DRAFT until Jason confirms rail access

# ---------- source reading ----------
def read(key, t0, n, speed=1.0):
    vf = (f'setpts=PTS/{speed},' if speed != 1.0 else '') + 'scale=1080:1920:flags=lanczos,unsharp=5:5:0.5,fps=30'
    raw = subprocess.run([FF, '-v', 'error', '-ss', str(t0), '-i', SRC[key], '-vf', vf, '-frames:v', str(n),
                          '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).copy()
    assert len(F) == n, (key, t0, len(F), n)
    return list(F)

# ---------- optical-flow slow motion ----------
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
def _flow(a, b):
    s = lambda f: cv2.resize(cv2.cvtColor(f, cv2.COLOR_RGB2GRAY), (W // 2, H // 2))
    return (cv2.resize(dis.calc(s(a), s(b), None), (W, H)) * 2.0).astype(np.float32)
def interp(a, b, t):
    t = np.float32(t); fab = _flow(a, b); fba = _flow(b, a)
    A = cv2.remap(a, gx - t * fab[..., 0], gy - t * fab[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    B = cv2.remap(b, gx - (1 - t) * fba[..., 0], gy - (1 - t) * fba[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    return (A * (1 - t) + B * t).clip(0, 255).astype(np.uint8)
def slowmo(F, n):
    out = []
    for p in np.linspace(0, len(F) - 1, n):
        i = int(np.floor(p)); t = p - i
        out.append(F[i] if t < 0.02 or i >= len(F) - 1 else interp(F[i], F[i + 1], t))
    return out

# ---------- logo paint-out ----------
def wall_rows2(f, ylo, yhi, minrun=12):
    r = f[ylo:yhi].astype(np.int16); med = np.median(r, 1)                      # per-row median colour
    gray = med.mean(1); br = med[:, 2] - med[:, 0]
    dev = np.abs(r - med[:, None, :]).max(2); uni = (dev < 28).mean(1)
    ok = (gray > 70) & (gray < 215) & (br > 10) & (br < 75) & (uni > 0.45)
    rows = np.where(ok)[0]
    if len(rows) == 0: return None
    runs, s = [], rows[0]
    for a, b in zip(rows, rows[1:]):
        if b > a + 4: runs.append((s, a)); s = b
    runs.append((s, rows[-1]))
    s, e = max(runs, key=lambda q: q[1] - q[0])
    return (ylo + s, ylo + e) if e - s >= minrun else None

def paint_out(F, ylo, yhi, margin, minrun=12, smooth=7):
    """fill the sponsor-wall rows with the wall's own flat colour (per-row median of its clean pixels)"""
    bands = [wall_rows2(f, ylo, yhi, minrun) for f in F]
    last = next((b for b in bands if b), None)
    for i, b in enumerate(bands):
        if b is None: bands[i] = last
        else: last = b
    if last is None: return F, []
    a = np.array(bands, float); k = smooth; pad = np.pad(a, ((k // 2, k // 2), (0, 0)), mode='edge')
    a = np.array([np.median(pad[i:i + k], 0) for i in range(len(a))])
    out = []
    for f, (t, b) in zip(F, a):
        t = int(t) - margin; b = int(b) + margin; f = f.copy()
        seg = f[t:b].astype(int); col = np.median(seg, 1)   # the wall's own colour, row by row (logos are a minority of each row)
        fill = np.repeat(col[:, None, :], W, 1)
        alpha = np.ones((b - t, 1, 1)); e = min(4, (b - t) // 4)
        alpha[:e, 0, 0] = np.linspace(0, 1, e); alpha[-e:, 0, 0] = np.linspace(1, 0, e)
        g = seg.mean(2); sat = seg.max(2) - seg.min(2)
        fg = ((g > 150) & (sat < 40)).astype(np.float32)                 # bright foreground (pillars, flags) stays untouched
        fg = cv2.dilate(fg, np.ones((5, 9), np.uint8))[..., None]
        a2 = alpha * (1 - fg)
        f[t:b] = (fill * a2 + seg * (1 - a2)).clip(0, 255).astype(np.uint8)
        out.append(f)
    return out, a.tolist()

# ---------- camera moves ----------
def punch(f, z, cx=540, cy=960):
    if z == 1.0: return f
    w, h = W / z, H / z; x0 = min(max(cx - w / 2, 0), W - w); y0 = min(max(cy - h / 2, 0), H - h)
    return cv2.resize(f[int(y0):int(y0 + h), int(x0):int(x0 + w)], (W, H), interpolation=cv2.INTER_LANCZOS4)
def whip(f, strength, shift=0):
    if strength <= 0 and shift == 0: return f
    k = max(3, int(strength)); ker = np.zeros((1, k), np.float32); ker[0, :] = 1.0 / k
    g = cv2.filter2D(f, -1, ker) if strength > 0 else f
    return np.roll(g, int(shift), axis=1) if shift else g

# ---------- type ----------
def ease_back(x):
    c1 = 1.70158; c3 = c1 + 1; x = min(max(x, 0), 1); return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def text_layer(text, size, i, y, bump=0.0):
    """bold white text that pops in (overshoot) over 6 frames, with a soft shadow for legibility"""
    s = 0.6 + 0.4 * ease_back(i / 6) + bump
    f = ImageFont.truetype(FONT, max(10, int(size * s)))
    words = text.split(' '); lines = [text]
    if f.getbbox(text)[2] - f.getbbox(text)[0] > 980:
        best = min(range(1, len(words)), key=lambda k: max(f.getbbox(' '.join(words[:k]))[2], f.getbbox(' '.join(words[k:]))[2]))
        lines = [' '.join(words[:best]), ' '.join(words[best:])]
    lh = int(f.size * 1.12); L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    top = y - lh * len(lines) / 2
    for j, t in enumerate(lines):
        b = f.getbbox(t); d.text(((W - (b[2] - b[0])) / 2 - b[0], top + j * lh + (lh - b[3] - b[1]) / 2), t, font=f, fill=(255, 255, 255, 255))
    a = min(1.0, (i + 1) / 3)
    sh = L.split()[3].filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.75 * a))
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); out.paste((0, 0, 0, 255), (0, 0), sh)
    L.putalpha(L.split()[3].point(lambda v: int(v * a))); out.alpha_composite(L)
    return out
def put_text(f, text, size, i, y, bump=0.0):
    img = Image.fromarray(f).convert('RGBA'); img.alpha_composite(text_layer(text, size, i, y, bump)); return np.asarray(img.convert('RGB'))

# ---------- stills ----------
def p08_frames(n, text):
    p = Image.open(SP + 'grok/pack/photos/P08.jpg').convert('RGB').crop((380, 900, 1260, 2000)).resize((1080, 1350), Image.LANCZOS)
    base = Image.new('RGB', (W, H), (14, 22, 36)); base.paste(p, (0, 300))
    d = ImageDraw.Draw(base); f = ImageFont.truetype(FONT, 40); b = f.getbbox('2024')
    d.text((1040 - (b[2] - b[0]) - b[0], 330 - b[1]), '2024', font=f, fill=(255, 255, 255))
    base = np.asarray(base); out = []
    for i in range(n):
        f2 = punch(base, 1.0 if i < n // 2 else 1.12, 540, 975)   # hard punch-in on the half-way beat
        out.append(put_text(f2, text, 92, i, 1745))
    return out
def end_frames(n):
    ec = np.asarray(Image.open(SP + 'endcards/TripNerd_endcard_CameraRoll_9x16.jpg').convert('RGB')).astype(float)
    bg = ec.copy()
    for y in range(540, 1330):
        l, r = ec[y, 20:60].mean(0), ec[y, 1020:1060].mean(0); bg[y] = l[None] + (r - l)[None] * np.linspace(0, 1, W)[:, None]
    logo = ec[555:985, 120:960]; lbg = bg[555:985, 120:960]
    m = (np.abs(logo - lbg).max(2) > 10).astype(np.float32); m = cv2.GaussianBlur(cv2.dilate(m, np.ones((5, 5))), (7, 7), 0)
    bgimg = Image.fromarray(bg.clip(0, 255).astype(np.uint8))
    lg = Image.fromarray(logo.clip(0, 255).astype(np.uint8)).convert('RGBA'); lg.putalpha(Image.fromarray((m * 255).astype(np.uint8)))
    pill = Image.new('RGBA', (600, 170), (0, 0, 0, 0)); pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle((20, 21, 580, 149), 64, fill=(255, 255, 255, 255))
    pf = ImageFont.truetype(FONT, 56); t = 'Talk to a Nerd'; b = pf.getbbox(t)
    pd.text((300 - (b[2] - b[0]) / 2 - b[0], 85 - (b[1] + b[3]) / 2), t, font=pf, fill=(72, 136, 222, 255))
    out = []
    for i in range(n):
        img = bgimg.copy().convert('RGBA')
        s = 0.86 + 0.14 * ease_back(i / 9); l2 = lg.resize((int(840 * s), int(430 * s)), Image.LANCZOS)
        img.alpha_composite(l2, (int(540 - l2.size[0] / 2), int(770 - l2.size[1] / 2)))
        if i >= 8:
            ps = 0.7 + 0.3 * ease_back((i - 8) / 7); p2 = pill.resize((int(600 * ps), int(170 * ps)), Image.LANCZOS)
            img.alpha_composite(p2, (int(540 - p2.size[0] / 2), int(1080 - p2.size[1] / 2)))
        if i >= 14:
            img.alpha_composite(text_layer('Link in bio', 52, i - 14, 1250))
        out.append(np.asarray(img.convert('RGB')))
    return out

# ---------- timeline (frames @30; cuts on the 120 BPM grid) ----------
def build(out_path):
    log = {}
    # S1 0-90: bunker blast. 0-60 slow motion (src 2.82-3.22, 0.2x), snap to real speed at 60 (2.0 s, bass hit), src 3.22-4.22
    raw = read('V03', 2.82, 13); slow = slowmo(raw, 60)
    real = read('V03', 3.22, 30)
    s1, log['s1_wall'] = paint_out(slow + real, 100, 900, 3)
    s1 = [punch(f, 1.08 - 0.08 * min(i, 60) / 60, 540, 1150) for i, f in enumerate(s1)]  # slow drift out, real speed full frame
    s1 = [put_text(f, 'This is the 16th.', 118, i, 860, bump=(0.10 * max(0, 1 - (i - 60) / 6) if i >= 60 else 0)) for i, f in enumerate(s1)]
    # S2 90-105: GA crowd (V02 24 fps shown frame-for-frame = 1.25x), whip in
    s2, _ = paint_out(read('V02', 0.30, 15, 1.25), 900, 1150, 3, minrun=6)
    s2 = [punch(f, 1.12, 540, 1300) for f in s2]
    # S3 105-120: crowd sweep, V01 src 2.0-2.75 at 1.5x
    s3, _ = paint_out(read('V01', 2.0, 15, 1.5), 900, 1150, 3, minrun=6)
    s3 = [punch(f, 1.1, 540, 1250) for f in s3]
    # S4 120-150: suite rail, DROP lands on frame 120 (4.0 s)
    s4, _ = paint_out(read('V01', 0.0, 30), 900, 1150, 3, minrun=6)
    s4 = [put_text(f, 'From up here.', 112, i, 700) for i, f in enumerate(s4)]
    # S5 150-165: punch-in on the rail
    s5, _ = paint_out(read('V01', 1.0, 15), 900, 1150, 3, minrun=6)
    s5 = [put_text(punch(f, 1.3, 600, 1250), 'From up here.', 112, 20, 700) for f in s5]
    # S6 165-210 + S7 210-240: real-speed bunker aftermath with the real crowd swell; jump punch-in at 210
    s67, log['s6_wall'] = paint_out(read('V03', 4.47, 75), 100, 950, 3)
    s67 = [punch(f, 1.0 if i < 45 else 1.28, 540, 1150) for i, f in enumerate(s67)]
    s67 = [put_text(f, 'Pros play right below.', 104, i, 860) for i, f in enumerate(s67)]
    s8 = p08_frames(60, GROUP_LINE)
    s9 = end_frames(90)
    seq = s1 + s2 + s3 + s4 + s5 + s67 + s8 + s9
    # whips on 90 / 105 / 120: blur out of the outgoing shot and slide the incoming one in
    for c in (90, 105, 120):
        for k, (st, sh) in enumerate([(30, 0), (70, 0)]): seq[c - 2 + k] = whip(seq[c - 2 + k], st)
        for k, (st, sh) in enumerate([(80, -260), (45, -110), (18, -30)]): seq[c + k] = whip(seq[c + k], st, sh)
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out_path], stdin=subprocess.PIPE)
    for f in seq: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    json.dump({'frames': len(seq), 'cuts': [90, 105, 120, 150, 165, 210, 240, 300], 'group_line': GROUP_LINE}, open(out_path + '.json', 'w'))
    print(len(seq), 'frames', len(seq) / 30, 's')

if __name__ == '__main__':
    build(sys.argv[1])
