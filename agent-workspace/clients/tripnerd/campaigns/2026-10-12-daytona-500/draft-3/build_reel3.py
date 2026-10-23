"""TripNerd Daytona Beach Reel, draft 3 (consolidated Draft 3 brief, TN-DAYTONA-001).
Real TripNerd media only. No blur or overlays on the picture: framing is crop-only, ordinary
Lanczos scaling, plain frame sampling. Text is composited typographically."""
import json, subprocess, wave, re, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

D = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/reel/'
OUT = D + 'out3/'
NAME = 'TripNerd-Daytona-Beach-Reel-DRAFT-3.mp4'
W, H, FPS = 1080, 1920, 24
BAND = (288, 1344)
NAVY = (0x20, 0x28, 0x38)
BLUE = (0x58, 0x96, 0xE9)
FX = D + 'fonts/montserrat-3.ttf'   # ExtraBold
FB = D + 'fonts/montserrat-2.ttf'   # Bold
LOGO = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/tn/brand-assets/tripnerd-logo-colour-1633x601.png'
PHOTO_B = D + 'photos/tripnerd_gallery_07.jpg'   # EXIF 2023-02-19 16:54:45 -05:00
PHOTO_A = D + 'photos/tripnerd_gallery_05.jpg'   # EXIF 2023-02-19 18:56:07 -05:00

# crop-only framing (source pixels)
V06_X0 = 640                      # 405x720 window, x 640-1045 (pack stays in frame f60-104)
PB_X0 = 590                       # Photo B: x 590-1024, full height (Hendrick banner reduced to an edge fragment)
PA_BOX = (360, 0, 360 + 733 * 9 / 16, 733)   # Photo A: x 360-772, y 0-733 (drops retailer lettering on a bag at the bottom edge)

V5 = np.load(D + 'v5.npy', mmap_mode='r'); V6 = np.load(D + 'v6.npy', mmap_mode='r')
QA = {'text_boxes': [], 'beats': []}


def bgr2rgb(a):
    return cv2.cvtColor(np.ascontiguousarray(a), cv2.COLOR_BGR2RGB)


def v5_frame(f):          # full 720x1280 frame, 1.5x
    return cv2.resize(bgr2rgb(V5[f]), (W, H), interpolation=cv2.INTER_LANCZOS4)


def v6_frame(f):          # 405x720 window, 2.67x
    return cv2.resize(bgr2rgb(V6[f][:, V06_X0:V06_X0 + 405]), (W, H), interpolation=cv2.INTER_LANCZOS4)


def photo(path, box):
    im = Image.open(path).convert('RGB')
    return np.asarray(im.resize((W, H), Image.LANCZOS, box=box))


def wrap(text, font, maxw, d):
    words = text.split()
    if d.textlength(text, font=font) <= maxw:
        return [text]
    best = None
    for i in range(1, len(words)):          # balanced two-line split
        a, b = ' '.join(words[:i]), ' '.join(words[i:])
        wa, wb = d.textlength(a, font=font), d.textlength(b, font=font)
        if max(wa, wb) <= maxw and (best is None or max(wa, wb) < best[0]):
            best = (max(wa, wb), [a, b])
    assert best, text
    return best[1]


def text_layer(text, beat, year=None, size=86, anchor='bottom', y_ref=1290):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer); ds = ImageDraw.Draw(shadow)
    f = ImageFont.truetype(FX, size)
    lines = wrap(text, f, W - 2 * 72, d)
    boxes = [d.textbbox((0, 0), ln, font=f) for ln in lines]
    gap = 16
    total = sum(b[3] - b[1] for b in boxes) + gap * (len(lines) - 1)
    y = y_ref - total if anchor == 'bottom' else y_ref
    for ln, bb in zip(lines, boxes):
        w = bb[2] - bb[0]; h = bb[3] - bb[1]; x = (W - w) // 2
        ds.text((x - bb[0] + 2, y - bb[1] + 3), ln, font=f, fill=(0, 0, 0, 170))
        d.text((x - bb[0], y - bb[1]), ln, font=f, fill=(255, 255, 255, 255))
        QA['text_boxes'].append({'beat': beat, 'card': text, 'text': ln, 'box': [x, y, x + w, y + h]})
        y += h + gap
    if year:
        fy = ImageFont.truetype(FB, 38)
        bb = d.textbbox((0, 0), year, font=fy); w = bb[2] - bb[0]; h = bb[3] - bb[1]
        x, yy = W - 64 - w, 312
        ds.text((x - bb[0] + 2, yy - bb[1] + 2), year, font=fy, fill=(0, 0, 0, 170))
        d.text((x - bb[0], yy - bb[1]), year, font=fy, fill=(255, 255, 255, 240))
        QA['text_boxes'].append({'beat': beat, 'card': text, 'text': year, 'box': [x, yy, x + w, yy + h], 'year': True})
    shadow = shadow.filter(ImageFilter.GaussianBlur(5))      # restrained shadow, single pass
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.alpha_composite(shadow); out.alpha_composite(layer)
    return out


def comp(rgb, layer):
    im = Image.fromarray(rgb).convert('RGBA'); im.alpha_composite(layer)
    return np.asarray(im.convert('RGB'))


def end_card():
    im = Image.new('RGBA', (W, H), NAVY + (255,))
    d = ImageDraw.Draw(im)
    logo = Image.open(LOGO).convert('RGBA')
    lw = 560; lh = round(logo.height * lw / logo.width)
    logo = logo.resize((lw, lh), Image.LANCZOS)          # scaled only; artwork unchanged
    px, py = 56, 42
    pw, ph = lw + 2 * px, lh + 2 * py
    x0, y0 = (W - pw) // 2, 470
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], 26, fill=BLUE + (255,))
    im.alpha_composite(logo, (x0 + px, y0 + py))
    QA['text_boxes'].append({'beat': 6, 'card': 'end', 'text': '[original logo on #5896E9 plate]', 'box': [x0, y0, x0 + pw, y0 + ph], 'logo': True})
    y = y0 + ph + 96
    for txt, fp, size, gap in (('Daytona Beach 2027', FX, 92, 40), ('Plan yours · tripnerd.com', FB, 56, 0)):
        f = ImageFont.truetype(fp, size)
        bb = d.textbbox((0, 0), txt, font=f); w = bb[2] - bb[0]; h = bb[3] - bb[1]
        x = (W - w) // 2
        d.text((x - bb[0], y - bb[1]), txt, font=f, fill=(255, 255, 255))
        QA['text_boxes'].append({'beat': 6, 'card': 'end', 'text': txt, 'box': [x, y, x + w, y + h]})
        y += h + gap
    return np.asarray(im.convert('RGB'))


# ---------------- audio: one uninterrupted V05 bed, original speed ----------------
A_PASS1_SRC = 0.0      # pass 1: source 0.0 -> 9.0 s at output 0.0 -> 9.0 s
XF_START, XF_LEN = 8.0, 1.0   # equal-power crossfade at output 8.0-9.0 s (inside Photo B, 7.0-9.5 s)
A_PASS2_SRC = 0.0      # pass 2: source 0.0 -> 8.0 s at output 8.0 -> 16.0 s
RIDE_FLOOR_DB, RIDE_MAX_DB = -17.0, 12.0


def movavg(v, n):
    """centred moving average with edge padding (cumulative sum)"""
    p = np.pad(v, (n // 2, n - n // 2), mode='edge'); c = np.cumsum(np.insert(p, 0, 0.0))
    return (c[n:] - c[:-n])[:len(v)] / n


def build_bed():
    w = wave.open(D + 'v5a.wav'); sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float64) / 32768
    T = int(16 * sr); bed = np.zeros((T, 2))
    e1 = int((XF_START + XF_LEN) * sr); i0 = int(A_PASS1_SRC * sr)
    p1 = x[i0:i0 + e1].copy()
    s2 = int(XF_START * sr); j0 = int(A_PASS2_SRC * sr)
    p2 = x[j0:j0 + (T - s2)].copy()
    assert len(p1) == e1 and len(p2) == T - s2
    k = int(XF_LEN * sr); t = np.linspace(0, 1, k)[:, None]
    p1[-k:] *= np.cos(t * np.pi / 2); p2[:k] *= np.sin(t * np.pi / 2)
    bed[:e1] += p1; bed[s2:] += p2
    # gain ride: lift only stretches below the floor (V05's receding tails), capped, slow (no pumping)
    m = bed.mean(1)
    rms = np.sqrt(movavg(m ** 2, int(0.4 * sr)) + 1e-12)
    need = np.clip(RIDE_FLOOR_DB - 20 * np.log10(rms), 0, RIDE_MAX_DB)
    need = movavg(movavg(need, int(0.4 * sr)), int(0.4 * sr))   # two box passes ~ 0.8 s triangular smoothing
    bed *= (10 ** (need / 20))[:, None]
    QA['audio'] = {'pass1': f'V05 source {A_PASS1_SRC:.2f}-{A_PASS1_SRC + XF_START + XF_LEN:.2f} s -> output 0.00-{XF_START + XF_LEN:.2f} s',
                   'pass2': f'V05 source {A_PASS2_SRC:.2f}-{A_PASS2_SRC + 16 - XF_START:.2f} s -> output {XF_START:.2f}-16.00 s',
                   'crossfade': f'equal-power, output {XF_START:.2f}-{XF_START + XF_LEN:.2f} s',
                   'gain_ride': {'floor_dbfs': RIDE_FLOOR_DB, 'max_db': RIDE_MAX_DB,
                                 'max_applied_db': round(float(need.max()), 2),
                                 'applied_per_250ms_db': [round(float(need[int(t * sr):int((t + 0.25) * sr)].mean()), 1) for t in np.arange(0, 16, 0.25)]}}
    return bed, sr


def main():
    import os
    os.makedirs(OUT, exist_ok=True)
    frames = []
    # 1) 0.0-2.5: V06 2.0-3.5 s at a constant 60% (1.5 source s -> 2.5 output s), plain frame sampling
    L = text_layer('This beats watching from home.', 1, year='2024')
    src = [int(np.floor((2.0 + k * (1.5 / 60)) * 30 + 1e-6)) for k in range(60)]
    for f in src: frames.append(comp(v6_frame(f), L))
    QA['beats'].append({'beat': 1, 'out': '0.0-2.5', 'frames': 60, 'source': f'V06 2.000-3.500 s (frames {src[0]}-{src[-1]} of 30 fps) at 60%, crop x {V06_X0}-{V06_X0 + 405} full height', 'v06_frames': src})
    # 2) 2.5-4.5: V05 0.0-2.0 s
    L = text_layer('Race weekend, the TripNerd way.', 2, year='2024')
    for f in range(0, 48): frames.append(comp(v5_frame(f), L))
    QA['beats'].append({'beat': 2, 'out': '2.5-4.5', 'frames': 48, 'source': 'V05 0.000-1.958 s (frames 0-47), full frame'})
    # 3) 4.5-7.0: V05 3.0-5.5 s, normal speed
    L = text_layer('Bring your people.', 3, year='2024')
    for f in range(72, 132): frames.append(comp(v5_frame(f), L))
    QA['beats'].append({'beat': 3, 'out': '4.5-7.0', 'frames': 60, 'source': 'V05 3.000-5.458 s (frames 72-131), full frame'})
    # 4) 7.0-9.5: Photo B, static
    L = text_layer('Headsets on. Drinks up.', 4, year='2023', anchor='top', y_ref=400)   # upper band: clear of the seated group and drinks
    fr = comp(photo(PHOTO_B, (PB_X0, 0, PB_X0 + 771 * 9 / 16, 771)), L)
    for _ in range(60): frames.append(fr)
    QA['beats'].append({'beat': 4, 'out': '7.0-9.5', 'frames': 60, 'source': f'Photo B tripnerd_gallery_07.jpg, crop x {PB_X0}-1024 full height, static'})
    # 5) 9.5-13.0: Photo A, static; copy in the upper part of the band (brief)
    L = text_layer('Stay for the burnout.', 5, year='2023', size=82, anchor='top', y_ref=400)   # one line, clear of car, smoke, guests
    fr = comp(photo(PHOTO_A, PA_BOX), L)
    for _ in range(84): frames.append(fr)
    QA['beats'].append({'beat': 5, 'out': '9.5-13.0', 'frames': 84, 'source': 'Photo A tripnerd_gallery_05.jpg, crop x 360-772, y 0-733, static'})
    # 6) 13.0-16.0: end card
    ec = end_card()
    for _ in range(72): frames.append(ec)
    QA['beats'].append({'beat': 6, 'out': '13.0-16.0', 'frames': 72, 'source': 'End card: navy #202838, original logo file on #5896E9 plate'})
    assert len(frames) == 384, len(frames)
    bed, sr = build_bed()
    with wave.open(OUT + 'bed.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(bed, -1, 1) * 32767).astype(np.int16).tobytes())
    # two-pass loudnorm (linear) to -14 LUFS, TP -1.5
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', OUT + 'bed.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rfind('{'):meas.rfind('}') + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
    QA['audio']['loudnorm_pass1'] = j
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-i', OUT + 'bed.wav', '-af', af,
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', str(FPS),
           '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-t', '16', '-movflags', '+faststart', OUT + NAME]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fr in frames: p.stdin.write(np.ascontiguousarray(fr).tobytes())
    p.stdin.close(); p.wait()
    json.dump(QA, open(OUT + 'qa_build.json', 'w'), indent=1, ensure_ascii=False)
    print('done', p.returncode)


if __name__ == '__main__':
    main()
