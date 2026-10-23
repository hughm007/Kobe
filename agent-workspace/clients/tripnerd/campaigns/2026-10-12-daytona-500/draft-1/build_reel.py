"""TripNerd Daytona Beach Reel, draft 1. Real TripNerd media only; text composited typographically."""
import json, subprocess, wave, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import masks

D = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/reel/'
OUT = D + 'out/'
W, H, FPS = 1080, 1920, 24
BAND = (288, 1344)
NAVY = (0x20, 0x28, 0x38)      # brand guide: logo navy #202838
BLUE = (0x58, 0x96, 0xE9)      # brand guide: site blue #5896E9 (logo plate)
FX = D + 'fonts/montserrat-3.ttf'   # ExtraBold
FB = D + 'fonts/montserrat-2.ttf'   # Bold
FS = D + 'fonts/montserrat-1.ttf'   # SemiBold
EMOJI = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'
LOGO = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/tn/brand-assets/tripnerd-logo-colour-1633x601.png'

V5 = np.load(D + 'v5.npy'); V6 = np.load(D + 'v6.npy')
QA = {'text_boxes': [], 'beats': []}


def to_out(bgr):
    return cv2.resize(bgr, (W, H), interpolation=cv2.INTER_LANCZOS4)


def v5_frame(f):
    return to_out(masks.masked('v5', V5, f))


def v6_frame(f):
    m = masks.masked('v6', V6, f)
    return to_out(m[:, 437:842])          # centre crop 405x720 = 9:16


def text_layer(lines, beat, year=None, tag=None):
    """lines: list of (text, font_path, size). Bottom of the block sits at y=1290."""
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer); ds = ImageDraw.Draw(shadow)
    # measure
    items = []
    for txt, fp, size in lines:
        f = ImageFont.truetype(fp, size)
        emoji = ' 🏁' in txt
        base = txt.replace(' 🏁', '')
        bb = d.textbbox((0, 0), base, font=f)
        w = bb[2] - bb[0]; h = bb[3] - bb[1]
        ew = 0
        if emoji:
            ew = int(size * 1.0) + int(size * 0.25)
        items.append((base, f, w + ew, h, bb, emoji, size))
    gap = 18
    total = sum(i[3] for i in items) + gap * (len(items) - 1)
    y = 1290 - total
    for base, f, w, h, bb, emoji, size in items:
        x = (W - w) // 2
        for dd, col in ((ds, (0, 0, 0, 200)), (d, (255, 255, 255, 255))):
            dd.text((x - bb[0], y - bb[1]), base, font=f, fill=col)
        box = [x, y, x + w, y + h]
        if emoji:
            ef = ImageFont.truetype(EMOJI, 109)
            em = Image.new('RGBA', (140, 140), (0, 0, 0, 0))
            ImageDraw.Draw(em).text((0, 0), '🏁', font=ef, embedded_color=True)
            em = em.crop(em.getbbox()); es = int(size * 1.0)
            em = em.resize((es, int(es * em.height / em.width)), Image.LANCZOS)
            ex = x + (w - int(size * 1.0)); ey = y + (h - em.height) // 2
            layer.alpha_composite(em, (ex, ey))
            box = [x, min(y, ey), x + w, max(y + h, ey + em.height)]
        QA['text_boxes'].append({'beat': beat, 'text': base + (' 🏁' if emoji else ''), 'box': box})
        y += h + gap
    if year:
        f = ImageFont.truetype(FB, 38)
        bb = d.textbbox((0, 0), year, font=f); w = bb[2] - bb[0]; h = bb[3] - bb[1]
        x, yy = W - 64 - w, 312
        ds.text((x - bb[0], yy - bb[1]), year, font=f, fill=(0, 0, 0, 200))
        d.text((x - bb[0], yy - bb[1]), year, font=f, fill=(255, 255, 255, 235))
        QA['text_boxes'].append({'beat': beat, 'text': year, 'box': [x, yy, x + w, yy + h]})
    if tag:
        f = ImageFont.truetype(FB, 34)
        bb = d.textbbox((0, 0), tag, font=f); w = bb[2] - bb[0]; h = bb[3] - bb[1]
        x, yy = (W - w) // 2, 700
        d.rounded_rectangle([x - 24, yy - 18, x + w + 24, yy + h + 18], 14, fill=(240, 170, 40, 255))
        d.text((x - bb[0], yy - bb[1]), tag, font=f, fill=(20, 20, 20, 255))
        QA['text_boxes'].append({'beat': beat, 'text': tag, 'box': [x - 24, yy - 18, x + w + 24, yy + h + 18]})
    shadow = shadow.filter(ImageFilter.GaussianBlur(9))
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.alpha_composite(shadow); out.alpha_composite(shadow); out.alpha_composite(layer)
    return out


def comp(bgr, layer):
    im = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)).convert('RGBA')
    im.alpha_composite(layer)
    return np.asarray(im.convert('RGB'))


def placeholder(label):
    im = Image.new('RGB', (W, H), (34, 37, 43))
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FS, 30)
    msg = label
    bb = d.textbbox((0, 0), msg, font=f)
    d.text(((W - (bb[2] - bb[0])) // 2, 800), msg, font=f, fill=(150, 156, 166))
    QA['text_boxes'].append({'beat': 'placeholder-note', 'text': msg, 'box': [(W - (bb[2] - bb[0])) // 2, 800, (W + (bb[2] - bb[0])) // 2, 800 + bb[3] - bb[1]]})
    return cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)


def end_card():
    im = Image.new('RGBA', (W, H), NAVY + (255,))
    d = ImageDraw.Draw(im)
    logo = Image.open(LOGO).convert('RGBA')
    lw = 600; lh = round(logo.height * lw / logo.width)
    logo = logo.resize((lw, lh), Image.LANCZOS)        # scaled only; never redrawn or recoloured
    px, py = 60, 46
    pw, ph = lw + 2 * px, lh + 2 * py
    x0, y0 = (W - pw) // 2, 520
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], 28, fill=BLUE + (255,))
    im.alpha_composite(logo, (x0 + px, y0 + py))
    QA['text_boxes'].append({'beat': 7, 'text': '[logo on brand-blue plate]', 'box': [x0, y0, x0 + pw, y0 + ph]})
    y = y0 + ph + 90
    for txt, fp, size, col in (('Daytona Beach plans · February 2027', FB, 46, (255, 255, 255)),
                               ('tripnerd.com', FX, 88, (255, 255, 255))):
        f = ImageFont.truetype(fp, size)
        bb = d.textbbox((0, 0), txt, font=f); w = bb[2] - bb[0]; h = bb[3] - bb[1]
        x = (W - w) // 2
        d.text((x - bb[0], y - bb[1]), txt, font=f, fill=col)
        QA['text_boxes'].append({'beat': 7, 'text': txt, 'box': [x, y, x + w, y + h]})
        y += h + 46
    return cv2.cvtColor(np.asarray(im.convert('RGB')), cv2.COLOR_RGB2BGR)


def main():
    import os
    os.makedirs(OUT, exist_ok=True)
    frames = []
    # Beat 1: 0.0-2.0, V05 3.0-5.0 (frames 72-119)
    L = text_layer([('Sound on. 🏁', FX, 104)], 1)
    for f in range(72, 120): frames.append(comp(v5_frame(f), L))
    QA['beats'].append({'beat': 1, 'out': '0.0-2.0', 'source': 'V05 3.000-4.958 s (frames 72-119)'})
    # Beat 2: 2.0-4.5, V05 0.0-2.5 (frames 0-59)
    L = text_layer([('Night over pit road.', FX, 84)], 2, year='2024')
    for f in range(0, 60): frames.append(comp(v5_frame(f), L))
    QA['beats'].append({'beat': 2, 'out': '2.0-4.5', 'source': 'V05 0.000-2.458 s (frames 0-59)'})
    # Beat 3: 4.5-7.0, V06 2.0-3.5 at 60% speed, plain frame repetition
    L = text_layer([('Daytime. Engines on.', FX, 84)], 3, year='2024')
    src = []
    for k in range(60):
        f = int(np.floor((2.0 + k * 0.6 / FPS) * 30 + 1e-6))
        src.append(f); frames.append(comp(v6_frame(f), L))
    QA['beats'].append({'beat': 3, 'out': '4.5-7.0', 'source': f'V06 frames {src[0]}-{src[-1]} (2.000-{src[-1]/30:.3f} s) at 60% speed', 'v6_frames': src})
    # Beat 4: 7.0-9.5, Photo B (NOT ACCESSIBLE) -> placeholder
    ph = placeholder('Planned: TripNerd photo gallery_07, 19 Feb 2023, 16:54')
    L = text_layer([('4:54 PM.', FX, 96)], 4, year='2023', tag='PHOTO B NOT SUPPLIED')
    fr = comp(ph, L)
    for _ in range(60): frames.append(fr)
    QA['beats'].append({'beat': 4, 'out': '7.0-9.5', 'source': 'PLACEHOLDER (Photo B not accessible)'})
    # Beat 5: 9.5-12.5, Photo A (NOT ACCESSIBLE) -> placeholder
    ph = placeholder('Planned: TripNerd photo gallery_05, 19 Feb 2023, 18:56')
    L = text_layer([('6:56 PM.', FX, 96), ('Still filming.', FX, 84)], 5, year='2023', tag='PHOTO A NOT SUPPLIED')
    fr = comp(ph, L)
    for _ in range(72): frames.append(fr)
    QA['beats'].append({'beat': 5, 'out': '9.5-12.5', 'source': 'PLACEHOLDER (Photo A not accessible)'})
    # Beat 6: 12.5-14.0, V05 8.5-10.0 forward (frames 204-239)
    L = text_layer([('Where would', FX, 92), ('your crew sit?', FX, 92)], 6)
    for f in range(204, 240): frames.append(comp(v5_frame(f), L))
    QA['beats'].append({'beat': 6, 'out': '12.5-14.0', 'source': 'V05 8.500-9.958 s (frames 204-239), forward'})
    # Beat 7: 14.0-16.0 end card
    ec = end_card()
    for _ in range(48): frames.append(cv2.cvtColor(ec, cv2.COLOR_BGR2RGB))
    QA['beats'].append({'beat': 7, 'out': '14.0-16.0', 'source': 'End card: navy #202838, original logo file on #5896E9 plate'})
    assert len(frames) == 384, len(frames)
    # audio bed (already built, 16.000 s, 48 kHz stereo float)
    bed = np.load(D + 'bed.npy')
    with wave.open(OUT + 'bed.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000)
        w.writeframes((np.clip(bed, -1, 1) * 32767).astype(np.int16).tobytes())
    # encode
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-i', OUT + 'bed.wav',
           '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,atrim=0:16',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', str(FPS),
           '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-t', '16', '-movflags', '+faststart',
           OUT + 'TripNerd-Daytona-Beach-Reel-DRAFT-1.mp4']
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fr in frames: p.stdin.write(np.ascontiguousarray(fr).tobytes())
    p.stdin.close(); p.wait()
    json.dump(QA, open(OUT + 'qa_build.json', 'w'), indent=1, ensure_ascii=False)
    print('done', p.returncode)


if __name__ == '__main__':
    main()
