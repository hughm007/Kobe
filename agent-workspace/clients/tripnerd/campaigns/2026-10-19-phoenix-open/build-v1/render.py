# TripNerd Phoenix "Down there / Up here": renders version A or B (silent master) from real owner footage.
# Solid brand panels cover the sponsor wall band (owner-approved); no blur, no generation.
import subprocess, sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
U = '/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/'
SP = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/'
SRC = {'V01': U + '50fc4af8-IMG_0075.mov', 'V02': U + '4c826f89-IMG_0192.mov',
       'V03': U + 'b378ad27-IMG_0112.mov', 'V04': U + '2280cf92-IMG_0097.mov'}
FONT = SP + 'thumb/Montserrat.ttf'          # Montserrat ExtraBold
BLUE = (72, 132, 214)
W, H, FPS = 1080, 1920, 30

def frames(src, t0, n, speed=1.0):
    vf = 'scale=1080:1920:flags=lanczos,unsharp=5:5:0.5'
    if speed != 1.0:  # play every source frame once at 30 fps (24 fps source -> 1.25x, no duplicate-frame judder)
        vf = f'setpts=PTS/{speed},' + vf
    raw = subprocess.run([FF, '-v', 'error', '-ss', str(t0), '-i', src, '-vf', vf + ',fps=30',
                          '-frames:v', str(n), '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    assert len(F) == n, (src, t0, len(F), n)
    return F

def wall_band(F, ylo=250, yhi=900):
    """per-frame (top,bottom) of the white sponsor wall: rows where most pixels are bright and unsaturated"""
    out = []
    for f in F:
        r = f[ylo:yhi].astype(int); mn = r.min(2); mx = r.max(2)
        frac = ((mn > 165) & (mx - mn < 45)).mean(1)
        rows = np.where(frac > 0.55)[0]
        if len(rows) == 0: out.append(out[-1] if out else (400, 650)); continue
        # largest contiguous run
        runs, s = [], rows[0]
        for a, b in zip(rows, rows[1:]):
            if b != a + 1: runs.append((s, a)); s = b
        runs.append((s, rows[-1]))
        s, e = max(runs, key=lambda q: q[1] - q[0])
        out.append((ylo + s, ylo + e))
    a = np.array(out, float)
    k = 7; pad = np.pad(a, ((k // 2, k // 2), (0, 0)), mode='edge')
    sm = np.array([np.median(pad[i:i + k], 0) for i in range(len(a))])
    return sm

def layout(text, maxw=940, size=74):
    """one line if it fits, else the most balanced two-line split; shrink only as a last resort"""
    while True:
        f = ImageFont.truetype(FONT, size)
        wd = lambda t: f.getbbox(t)[2] - f.getbbox(t)[0]
        if wd(text) <= maxw: return f, [text]
        w = text.split(' '); best = None
        for k in range(1, len(w)):
            a, b = ' '.join(w[:k]), ' '.join(w[k:]); m = max(wd(a), wd(b))
            if best is None or m < best[0]: best = (m, [a, b])
        if best[0] <= maxw or size <= 48: return f, best[1]
        size -= 2

def panel(img, y0, y1, text, alpha):
    d = ImageDraw.Draw(img)
    if text:  # grow the panel symmetrically if the caption needs more room than the band
        f, lines = layout(text); lh = int(f.size * 1.18); need = lh * len(lines) + 56
        if y1 - y0 < need: c = (y0 + y1) / 2; y0, y1 = c - need / 2, c + need / 2
    d.rectangle((0, int(y0), W, int(y1)), fill=BLUE)
    if text and alpha > 0:
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
        top = (y0 + y1) / 2 - lh * len(lines) / 2
        for j, t in enumerate(lines):
            b = f.getbbox(t); tx = (W - (b[2] - b[0])) / 2 - b[0]
            ty = top + j * lh + (lh - (b[3] + b[1])) / 2
            ld.text((tx, ty), t, font=f, fill=(255, 255, 255, int(255 * alpha)))
        img.paste(layer, (0, 0), layer)

def text_alpha(i, start=0, n=5):
    return min(1.0, max(0.0, (i - start + 1) / n))

def video_shot(key, t0, n, cards, band=None, speed=1.0, fixed_panel=None):
    """cards: list of (start_frame, text). band: auto wall tracking; fixed_panel: (y0,y1)"""
    F = frames(SRC[key], t0, n, speed)
    trk = wall_band(F) if band else None
    out = []
    for i, f in enumerate(F):
        img = Image.fromarray(f)
        text, st = None, 0
        for s, t in cards:
            if i >= s: text, st = t, s
        if trk is not None:
            top, bot = trk[i]; c = (top + bot) / 2; h = max(bot - top + 70, 150)
            y0, y1 = c - h / 2, c + h / 2
        else:
            y0, y1 = fixed_panel
        panel(img, y0, y1, text, text_alpha(i, st))
        out.append(np.asarray(img))
    return out, (None if trk is None else trk.tolist())

def photo_shot(n, text):
    p = Image.open(SP + 'grok/pack/photos/P08.jpg').convert('RGB').crop((380, 900, 1260, 2000))  # Grok's 4:5 crop, verified clean of board/wall
    p = p.resize((1080, 1350), Image.LANCZOS)
    base = Image.new('RGB', (W, H), (14, 22, 36)); base.paste(p, (0, 440))
    d = ImageDraw.Draw(base)
    f = ImageFont.truetype(FONT, 36); b = f.getbbox('2024')           # same label style as the Daytona year labels
    x = 1013 - (b[2] - b[0]) - b[0]; y = 440 + 28 - b[1]
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).text((x, y), '2024', font=f, fill=(0, 0, 0, 170))
    sh = sh.filter(ImageFilter.GaussianBlur(3)); base.paste(sh, (0, 0), sh)
    d.text((x, y), '2024', font=f, fill=(255, 255, 255))
    out = []
    for i in range(n):
        img = base.copy(); panel(img, 296, 436, text, text_alpha(i)); out.append(np.asarray(img))
    return out

def end_card():
    ec = Image.open(SP + 'endcards/TripNerd_endcard_CameraRoll_9x16.jpg').convert('RGB')  # owner-approved card
    a = np.asarray(ec).astype(float)
    # repaint y 990-1320 with the card's own gradient (sampled per row at the clean margins), then redraw pill + "Link in bio"
    for y in range(990, 1320):
        l, r = a[y, 20:60].mean(0), a[y, 1020:1060].mean(0)
        a[y] = l[None] + (r - l)[None] * np.linspace(0, 1, W)[:, None]
    img = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((262, 1024, 818, 1150), 64, fill=(20, 50, 110, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(8)); img.paste(sh, (0, 0), sh)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((260, 1016, 820, 1144), 64, fill=(255, 255, 255))
    f = ImageFont.truetype(FONT, 56); t = 'Talk to a Nerd'; b = f.getbbox(t)
    d.text((540 - (b[2] - b[0]) / 2 - b[0], 1080 - (b[1] + b[3]) / 2), t, font=f, fill=(72, 136, 222))
    f2 = ImageFont.truetype(FONT, 50); t2 = 'Link in bio'; b2 = f2.getbbox(t2)
    d.text((540 - (b2[2] - b2[0]) / 2 - b2[0], 1248 - (b2[1] + b2[3]) / 2), t2, font=f2, fill=(255, 255, 255))
    return np.asarray(img)

def build(version, out):
    tail = []
    if version == 'A':
        s1, _ = video_shot('V02', 0.0, 54, [(0, 'Down there, shoulder to shoulder.')], speed=1.25, fixed_panel=(960, 1110))
        s2, _ = video_shot('V01', 0.0, 60, [(0, 'Up here: shade and a rail.')], fixed_panel=(960, 1110))
        shots = [s1, s2]
    else:
        s1, _ = video_shot('V04', 8.4, 108, [(0, 'Watch the flag.'), (66, 'Almost.')], fixed_panel=(700, 830))
        s2, _ = video_shot('V01', 0.0, 60, [(0, 'Now see it from up here.')], fixed_panel=(960, 1110))
        shots = [s1, s2]
    s3, trk = video_shot('V03', 2.47, 105, [(0, 'Pros play right below.')], band=True)
    s4 = photo_shot(81, 'Your group, rail side.')
    ec = end_card()
    s5 = []
    for i in range(90):  # 6-frame dissolve from the photo into the end card
        a = min(1, (i + 1) / 6)
        s5.append((s4[-1] * (1 - a) + ec * a).astype(np.uint8) if a < 1 else ec)
    seq = [f for s in shots + [s3, s4, s5] for f in s]
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
                         stdin=subprocess.PIPE)
    for f in seq: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    json.dump({'frames': len(seq), 'v03_wall_track': trk}, open(out + '.json', 'w'))
    print(version, len(seq), 'frames', len(seq) / 30, 's')

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
