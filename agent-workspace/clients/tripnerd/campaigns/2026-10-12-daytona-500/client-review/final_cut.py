"""TN-DAYTONA-001 client-review cut (16.5 s, 1080x1920, 30 fps), built from originals.
0.0-1.5 lanyard opener | 1.5-4.0 V06 @60% | 4.0-5.5 V05 pit road | 5.5-7.5 Photo B | 7.5-9.5 father-son
| 9.5-11.0 wow guests | 11.0-13.5 burnout (Kling animation of Photo A) | 13.5-16.5 approved end card."""
import json, subprocess, wave, numpy as np, cv2
from PIL import Image
import build_reel3 as b
import build_reel_hq as h

D = b.D
W, H, FPS = 1080, 1920, 30
NAVY = np.array(b.NAVY, np.float32)
OUT = D + 'out_final/'
NAME = 'TripNerd-Daytona-Reel-CLIENT-REVIEW.mp4'
CARD = D + '../card/out/card-short-1.5s.mp4'
ENDCARD = D + '../card/endcard_approved.jpg'
MUSIC = D + '../card/music_v2.wav'
V05_MP4 = D + '../photos/TN_2024-02-19_daytona_V05.mp4'
V06_MP4 = D + '../photos/TN_2024-02-19_daytona_V06.mp4'
FATHER = D + 'photos/tripnerd-daytona_father-son-seats.jpg'
WOW = D + 'photos/tripnerd-daytona_wow-guests.jpg'
PAPER = np.float32([246, 245, 241])
SR = 48000
QA = {'cuts': [], 'text': []}


def ss(x):
    x = np.clip(x, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10)


def read_frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    out = []
    while True:
        bb = p.stdout.read(W * H * 3)
        if len(bb) < W * H * 3: break
        out.append(np.frombuffer(bb, np.uint8).reshape(H, W, 3))
    p.wait(); return out


def navy_photo(path):
    """whole photo, static, full width on navy (no crop of faces/gestures), quality pass at its own size"""
    im = np.asarray(Image.open(path).convert('RGB'))
    ph = int(round(im.shape[0] * W / im.shape[1]))
    den = cv2.fastNlMeansDenoisingColored(cv2.cvtColor(im, cv2.COLOR_RGB2BGR), None, 2, 2, 5, 15)
    up = cv2.resize(den, (W, ph), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    up = up + 0.7 * (up - cv2.GaussianBlur(up, (0, 0), 1.3)) + 0.18 * (up - cv2.GaussianBlur(up, (0, 0), 9))
    up = cv2.cvtColor(np.clip(up, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)
    canvas = np.empty((H, W, 3), np.uint8); canvas[:] = NAVY.astype(np.uint8)
    y0 = 600
    canvas[y0:y0 + ph] = up
    return canvas, (y0, y0 + ph)


def layer(text, beat, year=None, y_ref=400, size=86):
    L = b.text_layer(text, beat, year=year, anchor='top', y_ref=y_ref, size=size)
    return L


def text_log():
    QA['text'] = b.QA['text_boxes']


def audio(path, start, dur):
    bb = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(dur), '-i', path, '-vn', '-ac', '2', '-ar', str(SR),
                         '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(bb, np.int16).reshape(-1, 2).astype(np.float32) / 32768


def place(bed, x, t0, fade_in=0.03, fade_out=0.03):
    n = len(x); a = int(t0 * SR)
    env = np.ones(n, np.float32)
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi: env[:fi] = np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
    if fo: env[-fo:] = np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    bed[a:a + n] += x[:len(bed) - a] * env[:len(bed) - a, None]


def main():
    import os
    os.makedirs(OUT, exist_ok=True)
    frames = []
    # 0.0-1.5 opener (45 frames) + "Our Daytona suite." on the navy above the photo, gone before the white-out
    card = read_frames(CARD); assert len(card) == 45
    L = layer('Our Daytona suite.', 0, y_ref=330)
    for k, f in enumerate(card):
        a = 1 - ss((k / FPS - 1.15) / 0.15)
        im = Image.fromarray(f).convert('RGBA')
        Lk = L.copy(); Lk.putalpha(Image.fromarray((np.asarray(L.split()[3], np.float32) * a).astype(np.uint8)))
        im.alpha_composite(Lk)
        frames.append(np.asarray(im.convert('RGB')))
    QA['cuts'].append({'t': '0.0-1.5', 'what': 'lanyard opener (card v3 motion, shortened), text in first 1.5 s'})
    # 1.5-4.0 V06 2.0-3.5 s at 60% (75 frames, plain frame repeats), dips in from paper white
    L = b.text_layer('This beats watching from home.', 1, year='2024')
    src = [int(np.floor((2.0 + k * 1.5 / 75) * 30 + 1e-6)) for k in range(75)]
    for k, f in enumerate(src):
        fr = b.comp(h.v6_frame(f), L)
        if k < 7:
            a = 1 - ss(k / 7)
            fr = (fr.astype(np.float32) * (1 - a) + PAPER * a).astype(np.uint8)
        frames.append(fr)
    QA['cuts'].append({'t': '1.5-4.0', 'what': f'V06 frames {src[0]}-{src[-1]} (2.000-3.500 s) at 60%'})
    # 4.0-5.5 V05 0.0-1.5 s (steady pit-road overview)
    L = b.text_layer('Race weekend, the TripNerd way.', 2, year='2024')
    v5 = [int(np.floor(k * 24 / 30)) for k in range(45)]
    for f in v5: frames.append(b.comp(h.v5_frame(f), L))
    QA['cuts'].append({'t': '4.0-5.5', 'what': f'V05 frames {v5[0]}-{v5[-1]} (0.000-{v5[-1] / 24:.3f} s)'})
    # 5.5-7.5 Photo B static
    L = b.text_layer('Headsets on. Drinks up.', 4, year='2023', anchor='top', y_ref=400)
    fr = b.comp(h.photo(b.PHOTO_B, (b.PB_X0, 0, b.PB_X0 + 771 * 9 / 16, 771)), L)
    frames += [fr] * 60
    # 7.5-9.5 father-son static on navy
    pic, band = navy_photo(FATHER)
    L = b.text_layer('Thumbs up from the seats.', 5, anchor='top', y_ref=380)
    fr = b.comp(pic, L); frames += [fr] * 60
    QA['cuts'].append({'t': '7.5-9.5', 'what': f'father-son photo, whole frame on navy, y {band}'})
    # 9.5-11.0 wow guests static on navy
    pic, band = navy_photo(WOW)
    L = b.text_layer('Bring your people.', 6, anchor='top', y_ref=420)
    fr = b.comp(pic, L); frames += [fr] * 45
    # 11.0-13.5 burnout (Kling clip frames 44-103 of 24 fps, smoke building), no year
    burn = h.burnout_frames()
    L = b.text_layer('The burnout. The memories.', 7, anchor='top', y_ref=380, size=84)
    for k in range(75):
        frames.append(b.comp(burn[24 + int(np.floor(k * 24 / 30))], L))
    QA['cuts'].append({'t': '11.0-13.5', 'what': 'Kling 3.0 Pro animation of Photo A (job 0ad498ed), clip frames 44-103'})
    # 13.5-16.5 approved end card (client artwork, unaltered)
    ec = np.asarray(Image.open(ENDCARD).convert('RGB').resize((W, H)))
    frames += [ec] * 90
    assert len(frames) == 495, len(frames)
    QA['text'] = b.QA['text_boxes']

    # ---------- sound ----------
    N = int(16.5 * SR); t = np.arange(N) / SR
    race = np.zeros((N, 2), np.float32)
    # opener: muffled real V06 sound ("next door")
    place(race, audio(D + '../card/out/card-short-1.5s.mp4', 0, 1.5) * 0.8, 0.0, 0.05, 0.08)
    # 1.5-4.0: V06 real sound 2.0-4.5 s, original speed
    place(race, audio(V06_MP4, 2.0, 2.5), 1.5, 0.04, 0.10)
    # 4.0-5.5: V05 real sound 0.0-1.5 s, ends before the photos
    place(race, audio(V05_MP4, 0.0, 1.55), 3.95, 0.10, 0.30)
    mus = audio(MUSIC, 0, 16.5); mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))
    # duck ~6 dB under real race sound 1.6-5.5 s, smooth 0.25 s ramps
    duck = 1 - (1 - 10 ** (-6 / 20)) * (ss((t - 1.6) / 0.25) * (1 - ss((t - 5.35) / 0.3)))
    fade = 1 - ss((t - 15.5) / 1.0)
    music = mus * (duck * fade)[:, None]
    # balance: race sits ~3 dB above the ducked music over 1.6-4.0 s
    a0, a1 = int(1.6 * SR), int(4.0 * SR)
    def rms(x): return 20 * np.log10(np.sqrt((x.mean(1) ** 2).mean()) + 1e-9)
    g = 10 ** ((rms(music[a0:a1]) + 3 - rms(race[a0:a1])) / 20)
    mix = race * g + music
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
           '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-t', '16.5', '-movflags', '+faststart', OUT + NAME]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in frames: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    QA['race_gain_db'] = round(20 * np.log10(g), 1)
    json.dump(QA, open(OUT + 'qa_build.json', 'w'), indent=1, default=str)
    print('done', p.returncode)


if __name__ == '__main__':
    main()
