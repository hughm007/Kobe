"""Draft 3 advert rebuilt from the original sources with a quality pass (no AI upscaling):
light non-local-means denoise at source resolution -> Lanczos enlargement -> two-scale unsharp mask
(fine detail + gentle local contrast). Same timeline, copy and audio bed as build_reel3.py.
Usage: python3 build_reel_hq.py A   -> photo burnout (static)
       python3 build_reel_hq.py B   -> burnout beat uses the Kling video (frames in card/burnmos)"""
import sys, glob, json, wave, subprocess, numpy as np, cv2
from PIL import Image
import build_reel3 as b

VAR = sys.argv[1] if len(sys.argv) > 1 else 'A'
W, H = b.W, b.H
_cache = {}


def enhance(rgb, h_lum=3, amount=0.75, local=0.18):
    """rgb uint8 at source size -> enhanced uint8 at 1080x1920."""
    den = cv2.fastNlMeansDenoisingColored(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), None, h_lum, h_lum, 5, 15)
    up = cv2.resize(den, (W, H), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    fine = cv2.GaussianBlur(up, (0, 0), 1.3)
    wide = cv2.GaussianBlur(up, (0, 0), 9)
    out = up + amount * (up - fine) + local * (up - wide)
    return cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)


def v5_frame(f):
    k = ('v5', f)
    if k not in _cache:
        _cache[k] = enhance(b.bgr2rgb(b.V5[f]))
    return _cache[k]


def v6_frame(f):
    k = ('v6', f)
    if k not in _cache:
        _cache[k] = enhance(b.bgr2rgb(b.V6[f][:, b.V06_X0:b.V06_X0 + 405]), amount=0.9)
    return _cache[k]


def photo(path, box):
    im = Image.open(path).convert('RGB')
    x0, y0, x1, y1 = box
    crop = np.asarray(im.crop((int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1)))))
    return enhance(crop, h_lum=2, amount=0.7)


def burnout_frames():
    fr = []
    for p in sorted(glob.glob(b.D + '../card/burnmos/b*.jpg')):
        m = cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB)
        fr += [m[:, :720], m[:, 720:]]
    assert len(fr) == 84, len(fr)
    return [enhance(np.ascontiguousarray(f), h_lum=2, amount=0.6) for f in fr]


def main():
    import os
    out_dir = b.D + 'out_hq/'
    os.makedirs(out_dir, exist_ok=True)
    frames = []
    L = b.text_layer('This beats watching from home.', 1, year='2024')
    src = [int(np.floor((2.0 + k * (1.5 / 60)) * 30 + 1e-6)) for k in range(60)]
    for f in src: frames.append(b.comp(v6_frame(f), L))
    L = b.text_layer('Race weekend, the TripNerd way.', 2, year='2024')
    for f in range(0, 48): frames.append(b.comp(v5_frame(f), L))
    L = b.text_layer('Bring your people.', 3, year='2024')
    for f in range(72, 132): frames.append(b.comp(v5_frame(f), L))
    L = b.text_layer('Headsets on. Drinks up.', 4, year='2023', anchor='top', y_ref=400)
    fr = b.comp(photo(b.PHOTO_B, (b.PB_X0, 0, b.PB_X0 + 771 * 9 / 16, 771)), L)
    for _ in range(60): frames.append(fr)
    L = b.text_layer('Stay for the burnout.', 5, year='2023', size=82, anchor='top', y_ref=400)
    if VAR == 'B':
        for f in burnout_frames(): frames.append(b.comp(f, L))
    else:
        fr = b.comp(photo(b.PHOTO_A, b.PA_BOX), L)
        for _ in range(84): frames.append(fr)
    ec = b.end_card()
    for _ in range(72): frames.append(ec)
    assert len(frames) == 384
    bed, sr = b.build_bed()
    with wave.open(out_dir + 'bed.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(bed, -1, 1) * 32767).astype(np.int16).tobytes())
    name = out_dir + f'advert-hq-{VAR}.mp4'
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
           '-i', out_dir + 'bed.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p',
           '-profile:v', 'high', '-c:a', 'pcm_s16le', '-t', '16', name.replace('.mp4', '.mov')]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in frames: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    print('done', p.returncode, name.replace('.mp4', '.mov'))


if __name__ == '__main__':
    main()
