# Phoenix v2 sound: real clip audio + synthesised SFX (made here, no licence needed) + optional TEMP 120 BPM beat.
# The final music is the owner's Pixabay track, laid so its drop lands on 4.0 s (the suite-rail cut).
import subprocess, sys, json, re, numpy as np
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
U = '/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/'
S = {'V01': U + '50fc4af8-IMG_0075.mov', 'V02': U + '4c826f89-IMG_0192.mov', 'V03': U + 'b378ad27-IMG_0112.mov'}
SR = 48000; T = 13.0; N = int(SR * T)
rng = np.random.default_rng(7)

def src(k, t, d, af=None):
    cmd = [FF, '-v', 'error', '-ss', str(t), '-t', str(d), '-i', S[k], '-ac', '2', '-ar', str(SR)]
    if af: cmd += ['-af', af]
    raw = subprocess.run(cmd + ['-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def place(bus, x, at, gain_db=0.0, fin=0.015, fout=0.015):
    x = x.copy(); n = len(x); fi = int(fin * SR); fo = int(fout * SR)
    if fi: x[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo: x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    i = int(at * SR); e = min(N, i + n); bus[i:e] += x[:e - i] * 10 ** (gain_db / 20)
def st(m): return np.stack([m, m], 1).astype(np.float32)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def bandnoise(n, lo, hi):
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR); X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
def sweepnoise(dur, f0, f1):  # noise through a moving band, built in 20 ms slices
    n = int(dur * SR); out = np.zeros(n); hop = int(0.02 * SR)
    for i in range(0, n, hop):
        c = f0 * (f1 / f0) ** (i / n); out[i:i + hop] = bandnoise(hop * 2, c * 0.6, c * 1.6)[:min(hop, n - i)]
    return out

# ---- SFX ----
def bass_hit():
    n = int(1.2 * SR); t = np.arange(n) / SR; f = 38 + 42 * np.exp(-t / 0.06)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45); y = np.tanh(2.2 * y)
    y[:int(0.004 * SR)] += bandnoise(int(0.004 * SR), 2000, 9000) * 0.6
    return st(y * 0.9)
def impact(size=1.0):
    n = int(0.9 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-t / 0.04)) / SR) * np.exp(-t / (0.25 * size))
    crack = bandnoise(n, 800, 7000) * np.exp(-t / 0.05)
    return st(np.tanh(1.6 * (0.9 * boom + 0.35 * crack)) * 0.85 * size)
def whoosh(dur=0.38, up=True):
    n = int(dur * SR); y = sweepnoise(dur, 300 if up else 3500, 3500 if up else 300)
    e = np.sin(np.pi * np.arange(n) / n) ** 2; m = y * e * 0.55
    pan = np.linspace(-0.7, 0.7, n)
    return np.stack([m * (1 - pan) / 1.4, m * (1 + pan) / 1.4], 1).astype(np.float32)
def riser(dur=1.0):
    n = int(dur * SR); y = sweepnoise(dur, 400, 6000); e = (np.arange(n) / n) ** 2.2
    return st(y * e * 0.45)
def reverse_swell(dur=2.0):
    n = int(dur * SR); y = bandnoise(n, 200, 5000); e = (np.arange(n) / n) ** 3
    return st(y * e * 0.35)

# ---- TEMP beat (120 BPM, A minor), only for previewing energy ----
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(48 + 90 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.16))
def clap(): n = int(0.2 * SR); return bandnoise(n, 900, 6000) * env(n, 0.001, 0.05) * 0.7
def hat(): n = int(0.06 * SR); return bandnoise(n, 7000, 16000) * env(n, 0.0005, 0.015) * 0.35
def temp_beat():
    bus = np.zeros(N); b = 0.5
    def add(x, at, g=1.0):
        i = int(at * SR); e = min(N, i + len(x)); bus[i:e] += x[:e - i] * g
    t = np.arange(int(2.0 * SR)) / SR  # 0-2 s: low drone under the slow motion
    add((np.sin(2 * np.pi * 55 * t) + 0.4 * np.sin(2 * np.pi * 110 * t)) * np.minimum(1, t / 0.8) * 0.18, 0.0)
    for k in range(4): add(kick(), 2.0 + k * 0.25 * 2, 0.7)          # 2-4 s: build
    for k in range(16): add(clap(), 3.0 + k * 0.0625, 0.25 + 0.5 * k / 16)
    roots = [55.0, 43.65, 65.41, 49.0]
    for beat in range(int((12.5 - 4.0) / b)):                         # 4.0 s drop onward
        at = 4.0 + beat * b; add(kick(), at, 0.9)
        if beat % 2 == 1: add(clap(), at, 0.6)
        add(hat(), at + b / 2); add(hat(), at, 0.6)
        if beat % 2 == 0:
            f = roots[(beat // 8) % 4]; tt = np.arange(int(0.95 * SR)) / SR
            add(np.tanh(1.5 * np.sin(2 * np.pi * f * tt)) * np.exp(-tt / 0.6) * 0.35, at + 0.02)
    fo = int(1.0 * SR); bus[int(12.0 * SR):int(13.0 * SR)] *= np.linspace(1, 0, fo)
    return st(bus)

def build(with_beat):
    real = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32)
    place(real, src('V03', 0.0, 2.0, 'lowpass=f=1400'), 0.0, -4, fin=0.2)            # muffled murmur under slow motion
    place(real, src('V03', 3.22, 1.0), 2.0, 0)                                        # real speed snap
    place(real, src('V03', 4.6, 2.0), 2.0, 3, fin=0.03, fout=0.5)                     # the shot's own real crowd swell, layered on the hit
    place(real, src('V02', 0.30, 0.5), 3.0, -2); place(real, src('V01', 2.0, 0.5), 3.5, -2)
    place(real, src('V01', 0.0, 1.5), 4.0, -1)
    place(real, src('V03', 4.47, 2.5), 5.5, 1)                                        # real swell in sync with picture
    place(real, src('V02', 2.0, 5.0), 8.0, -6, fout=1.5)
    place(fx, reverse_swell(2.0), 0.0, -3)
    place(fx, bass_hit(), 2.0, 0)
    for c in (3.0, 3.5): place(fx, whoosh(), c - 0.25, -2)
    place(fx, riser(1.0), 3.0, -4); place(fx, whoosh(0.45), 3.72, -1)
    place(fx, impact(1.0), 4.0, 0)
    for c, s in ((5.5, 0.6), (7.0, 0.5), (8.0, 0.7), (10.0, 0.8)): place(fx, impact(s), c, -4)
    for c in (5.5, 8.0, 10.0): place(fx, whoosh(0.3), c - 0.2, -8)
    mix = real + fx * 0.9
    if with_beat: mix += temp_beat() * 0.8
    return mix

def master(silent, out, with_beat):
    mix = build(with_beat); tmp = out + '.wav'
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', tmp], input=mix.astype(np.float32).tobytes(), check=True)
    r = subprocess.run([FF, '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    ln = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run([FF, '-v', 'error', '-y', '-i', silent, '-i', tmp, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', ln + ',alimiter=limit=0.85:level=false,aresample=48000',
                    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
    r = subprocess.run([FF, '-hide_banner', '-i', out, '-vn', '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = r[r.rfind('Summary'):]
    print(out, 'I', re.search(r'I:\s+(-?[\d.]+)', s).group(1), 'LUFS TP', re.search(r'Peak:\s+(-?[\d.]+)', s).group(1))

if __name__ == '__main__':
    master(sys.argv[1], sys.argv[2], sys.argv[3] == 'beat')
