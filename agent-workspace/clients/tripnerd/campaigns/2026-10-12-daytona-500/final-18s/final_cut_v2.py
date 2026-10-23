"""TN-DAYTONA-001 final 18 s cut (1080x1920, 30 fps, 540 frames), built from originals.
0.0-2.0 hospitality-suite photo (untouched, native 800x535) + white-out 1.7-2.0 | 2.0-4.0 V06 | 4.0-7.5 V05 0.0-3.5 s
| 7.5-9.0 Photo B | 9.0-10.2 father-son | 10.2-11.5 wow guests | 11.5-14.5 burnout | 14.5-18.0 end card, fade 17.6-18.0.
Photos: static, whole frame, pixel 1:1 (no resampling) on a blurred fill made from the same photo.
Usage: python3 final_cut_v2.py video   -> burnout = Kling animation of Photo A (AI)
       python3 final_cut_v2.py photo   -> burnout = Photo A still (real, no AI frames)"""
import sys, os, json, subprocess, wave, numpy as np, cv2
from PIL import Image
import build_reel3 as b
import build_reel_hq as h

VAR = sys.argv[1] if len(sys.argv) > 1 else 'video'
D = b.D
W, H, FPS, T = 1080, 1920, 30, 18.0
SR = 48000
OUT = D + 'out_final_v2/'
NAME = f'TripNerd-Daytona-Reel-FINAL-18s-{"burnout-video" if VAR == "video" else "burnout-photo"}.mp4'
SUITE = D + 'photos/tripnerd-daytona_hospitality-suite.jpg'
FATHER = D + 'photos/tripnerd-daytona_father-son-seats.jpg'
WOW = D + 'photos/tripnerd-daytona_wow-guests.jpg'
ENDCARD = D + '../card/endcard_daytona2027.png'
MUSIC = D + '../card/music_v3.wav'
V05_MP4 = D + '../photos/TN_2024-02-19_daytona_V05.mp4'
V06_MP4 = D + '../photos/TN_2024-02-19_daytona_V06.mp4'
WHITE = np.float32([255, 255, 255])
QA = {'variant': VAR, 'cuts': [], 'photos': []}


def ss(x):
    x = np.clip(x, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10)


def blurfill_photo(path):
    """Photo pasted untouched at native size, centred, over a blurred + darkened cover fill of itself."""
    im = np.asarray(Image.open(path).convert('RGB'))
    ph, pw = im.shape[:2]
    s = max(W / pw, H / ph)
    bg = cv2.resize(im, (int(np.ceil(pw * s)), int(np.ceil(ph * s))), interpolation=cv2.INTER_AREA)
    y0, x0 = (bg.shape[0] - H) // 2, (bg.shape[1] - W) // 2
    bg = cv2.GaussianBlur(bg[y0:y0 + H, x0:x0 + W].astype(np.float32), (0, 0), 40) * 0.55
    out = bg.astype(np.uint8)
    px, py = (W - pw) // 2, (H - ph) // 2
    out[py:py + ph, px:px + pw] = im                      # original pixels, unchanged
    assert np.array_equal(out[py:py + ph, px:px + pw], im)
    QA['photos'].append({'file': os.path.basename(path), 'native': [pw, ph], 'placed': [px, py, px + pw, py + ph]})
    return out, py


def audio(path, start, dur):
    bb = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(dur), '-i', path, '-vn', '-ac', '2', '-ar', str(SR),
                         '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(bb, np.int16).reshape(-1, 2).astype(np.float32) / 32768


def ffilter(x, af):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', af, '-f', 's16le', '-'],
                       input=(np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes(), capture_output=True)
    y = np.frombuffer(p.stdout, np.int16).reshape(-1, 2).astype(np.float32) / 32768
    return y[:len(x)] if len(y) >= len(x) else np.pad(y, ((0, len(x) - len(y)), (0, 0)))


def place(bed, x, t0, fade_in=0.03, fade_out=0.03):
    n = len(x); a = int(round(t0 * SR))
    env = np.ones(n, np.float32)
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi: env[:fi] = np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
    if fo: env[-fo:] = np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    m = min(n, len(bed) - a)
    bed[a:a + m] += x[:m] * env[:m, None]


def rms(x): return 20 * np.log10(np.sqrt((x.mean(1) ** 2).mean()) + 1e-9)


def main():
    os.makedirs(OUT, exist_ok=True)
    frames = []
    # 0.0-2.0 opener: untouched suite photo, text from frame 1, white-out 1.7-2.0 landing on the first music hit
    pic, py = blurfill_photo(SUITE)
    fr = b.comp(pic, b.text_layer('Our Daytona suite.', 0, anchor='bottom', y_ref=py - 50))
    for k in range(60):
        a = ss((k / FPS - 1.7) / 0.3)
        frames.append((fr.astype(np.float32) * (1 - a) + WHITE * a).astype(np.uint8) if a > 0 else fr)
    QA['cuts'].append({'t': '0.0-2.0', 'what': 'hospitality-suite photo (md5 2d9008ce..), native 800x535, white-out 1.7-2.0'})
    # 2.0-4.0 V06 2.000-3.467 s (pack stays inside the crop) over 60 frames = 73% speed; 4-frame release from white
    L = b.text_layer('This beats watching from home.', 1, year='2024')
    src = [int(np.floor((2.0 + k * 1.467 / 60) * 30 + 1e-6)) for k in range(60)]
    for k, f in enumerate(src):
        x = b.comp(h.v6_frame(f), L)
        if k < 4:
            a = 1 - ss((k + 1) / 5)
            x = (x.astype(np.float32) * (1 - a) + WHITE * a).astype(np.uint8)
        frames.append(x)
    QA['cuts'].append({'t': '2.0-4.0', 'what': f'V06 frames {src[0]}-{src[-1]} (30 fps source), 73% speed'})
    # 4.0-7.5 V05 0.0-3.5 s, real speed, no loop
    L = b.text_layer('Race weekend, the TripNerd way.', 2, year='2024')
    v5 = [int(np.floor(k * 24 / 30)) for k in range(105)]
    for f in v5: frames.append(b.comp(h.v5_frame(f), L))
    QA['cuts'].append({'t': '4.0-7.5', 'what': f'V05 frames {v5[0]}-{v5[-1]} (24 fps source, 0.000-{(v5[-1] + 1) / 24:.3f} s), real speed'})
    # 7.5-9.0 Photo B (EXIF 2023-02-19), native 1024x771
    pic, py = blurfill_photo(b.PHOTO_B)
    frames += [b.comp(pic, b.text_layer('Headsets on. Drinks up.', 3, year='2023', anchor='bottom', y_ref=py - 40))] * 45
    # 9.0-10.2 father-son, native 800x535
    pic, py = blurfill_photo(FATHER)
    frames += [b.comp(pic, b.text_layer('Thumbs up from the seats.', 4, anchor='bottom', y_ref=py - 50))] * 36
    # 10.2-11.5 wow guests, native 800x535
    pic, py = blurfill_photo(WOW)
    frames += [b.comp(pic, b.text_layer('Bring your people.', 5, anchor='bottom', y_ref=py - 50))] * 39
    # 11.5-14.5 burnout
    if VAR == 'video':
        burn = h.burnout_frames()
        L = b.text_layer('The burnout. The memories.', 6, anchor='top', y_ref=380, size=84)
        idx = [12 + int(np.floor(k * 24 / 30)) for k in range(90)]
        for i in idx: frames.append(b.comp(burn[i], L))
        QA['cuts'].append({'t': '11.5-14.5', 'what': f'Kling 3.0 Pro animation of Photo A (AI), clip frames {idx[0] + 20}-{idx[-1] + 20} at real speed'})
    else:
        pic, py = blurfill_photo(b.PHOTO_A)
        frames += [b.comp(pic, b.text_layer('The burnout. The memories.', 6, year='2023', anchor='bottom', y_ref=py - 40, size=84))] * 90
        QA['cuts'].append({'t': '11.5-14.5', 'what': 'Photo A still (EXIF 2023-02-19 18:56), native 1024x771'})
    # 14.5-18.0 end card ("Daytona 2027." version), fade to black over the last 0.4 s
    ec = np.asarray(Image.open(ENDCARD).convert('RGB'))
    assert ec.shape == (H, W, 3)
    for k in range(105):
        a = 1 - ss(((435 + k) / FPS - 17.6) / 0.4 + 1 / 12)   # last frame fully black
        frames.append((ec.astype(np.float32) * a).astype(np.uint8))
    assert len(frames) == 540, len(frames)
    QA['text'] = b.QA['text_boxes']

    # ---------- sound ----------
    N = int(T * SR); t = np.arange(N) / SR
    race = np.zeros((N, 2), np.float32)
    # opener: real V06 sound 4.0-6.0 s, low-passed and low ("through the suite wall")
    place(race, ffilter(audio(V06_MP4, 4.0, 2.0), 'lowpass=f=500,lowpass=f=500') * 0.5, 0.0, 0.25, 0.05)
    # 2.0-4.0: V06 real sound 2.0-4.0 s
    place(race, audio(V06_MP4, 2.0, 2.0), 2.0, 0.015, 0.06)
    # 4.0-7.5: V05 real sound 0.0-3.5 s
    place(race, audio(V05_MP4, 0.0, 3.5), 3.97, 0.04, 0.35)
    # 11.5-18.0 burnout: V06 0.0-2.0 s (engines approaching) -> V05 3.5-8.0 s (roar peaks 4.0-5.0 s => 14.0-15.0 out)
    burn = np.zeros((N, 2), np.float32)
    place(burn, audio(V06_MP4, 0.0, 2.25), 11.5, 0.12, 0.25)
    place(burn, audio(V05_MP4, 3.5, 4.5), 13.5, 0.25, 0.4)
    swell = 0.55 + 0.45 * ss((t - 11.5) / 3.0)            # builds into the cut, peaks at 14.5
    burn *= swell[:, None]
    mus = audio(MUSIC, 0, T); mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))
    # duck music 6 dB under real sound: 2.0-7.5 and 11.5-14.6, released under the final chord by 15.6
    duck_amt = np.maximum(ss((t - 1.95) / 0.1) * (1 - ss((t - 7.4) / 0.3)), ss((t - 11.4) / 0.2) * (1 - ss((t - 14.6) / 1.0)))
    music = mus * (1 - (1 - 10 ** (-6 / 20)) * duck_amt)[:, None]
    a0, a1 = int(2.0 * SR), int(7.5 * SR)
    g = 10 ** ((rms(music[a0:a1]) + 3 - rms(race[a0:a1])) / 20)
    b0, b1 = int(11.5 * SR), int(14.5 * SR)
    gb = 10 ** ((rms(music[b0:b1]) + 3 - rms(burn[b0:b1])) / 20)
    mix = race * g + burn * gb + music
    mix *= (1 - ss((t - 17.55) / 0.45))[:, None]          # everything lands at silence with the picture fade
    with wave.open(OUT + 'mix.wav', 'wb') as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
        wv.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', OUT + 'mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:print_format=json', '-f', 'null', '-'],
                          capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rfind('{'):meas.rfind('}') + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
           '-i', OUT + 'mix.wav', '-af', af, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p',
           '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-t', str(T), '-movflags', '+faststart', OUT + NAME]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in frames: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    QA.update(race_gain_db=round(20 * np.log10(g), 1), burn_gain_db=round(20 * np.log10(gb), 1), premaster=j)
    json.dump(QA, open(OUT + f'qa_build_{VAR}.json', 'w'), indent=1, default=str)
    print('done', p.returncode, OUT + NAME)


if __name__ == '__main__':
    main()
