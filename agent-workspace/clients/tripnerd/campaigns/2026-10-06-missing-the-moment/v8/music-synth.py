# Original high-energy music bed (140 BPM, A minor), synthesized from scratch.
# Usage: python3 music.py <out.wav> <duration_s> <riser_end_s> <end_hit_s>
#   riser_end_s: where the noise riser peaks into the big impact (start of the celebration)
#   end_hit_s:   final stab + tail (end card); the groove stops here
import sys, numpy as np, wave

out, DUR, RISE_END, END_HIT = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
SR = 48000; BPM = 140.0; BEAT = 60 / BPM; N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)
t_all = np.arange(N) / SR

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    s = sig[: N - i] * gain
    L[i:i + len(s)] += s * (1 - max(0, pan)); R[i:i + len(s)] += s * (1 + min(0, pan))

def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def kick():
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    click = rng.normal(0, 1, n) * np.exp(-t / 0.003) * 0.25
    return np.tanh(1.8 * np.sin(ph) * np.exp(-t / 0.22)) + click

def clap():
    n = int(0.3 * SR); t = np.arange(n) / SR
    nz = rng.normal(0, 1, n)
    e = sum(np.exp(-np.clip(t - o, 0, None) / 0.012) * (t >= o) for o in (0, 0.011, 0.022)) + 0.6 * np.exp(-t / 0.09)
    # crude band-pass: difference of one-pole lowpasses
    def lp(x, c):
        y = np.zeros_like(x); a = 0
        for k in range(len(x)): a += c * (x[k] - a); y[k] = a
        return y
    bp = lp(nz, 0.35) - lp(nz, 0.05)
    return bp * e * 1.6

def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR); t = np.arange(n) / SR
    nz = rng.normal(0, 1, n); nz = np.diff(np.concatenate([[0], nz]))  # brighten
    return nz * np.exp(-t / (0.06 if open_ else 0.012)) * 0.35

def saw(freq, n, detune=(0,)):
    t = np.arange(n) / SR
    return sum(2 * ((t * freq * (1 + d)) % 1) - 1 for d in detune) / len(detune)

def lowpass(x, cutoff):
    c = 1 - np.exp(-2 * np.pi * cutoff / SR); y = np.zeros_like(x); a = 0.0
    for k in range(len(x)): a += c * (x[k] - a); y[k] = a
    return y

K, C, HC, HO = kick(), clap(), hat(), hat(True)
CHORDS = [  # A minor: Am F C G (root, third, fifth) in Hz
    (220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (130.81, 164.81, 196.0), (196.0, 246.94, 293.66)]
BASS = [110.0, 87.31, 65.41, 98.0]

nbeats = int(END_HIT / BEAT)
side = np.ones(N)
for b in range(nbeats):
    tb = b * BEAT
    add(K, tb, 0.9)
    i = int(tb * SR); m = min(N, i + int(0.18 * SR))
    side[i:m] = np.minimum(side[i:m], 0.25 + 0.75 * np.linspace(0, 1, m - i) ** 0.6)
    if b % 2 == 1: add(C, tb, 0.55, 0.0)
    for s in range(4):
        add(HC, tb + s * BEAT / 4, 0.5 if s % 2 else 0.3, 0.25)
    add(HO, tb + BEAT / 2, 0.35, -0.2)
bar = 4 * BEAT
for bi in range(int(END_HIT / bar) + 1):
    ch = CHORDS[bi % 4]; bs = BASS[bi % 4]
    for e8 in range(8):  # rolling 8th-note bass
        st = bi * bar + e8 * BEAT / 2
        if st >= END_HIT: break
        n = int(BEAT / 2 * SR * 0.9)
        b = lowpass(saw(bs if e8 % 2 == 0 else bs * 2, n, (0, 0.004)), 900) * env(n, 0.003, 0.12)
        add(b, st, 0.55)
    for hit in (0, 1.5, 3):  # syncopated supersaw stabs
        st = bi * bar + hit * BEAT
        if st >= END_HIT: break
        n = int(0.32 * SR)
        s = sum(saw(f * 2, n, (-0.012, -0.004, 0.004, 0.012)) for f in ch) / 3
        s = lowpass(s, 4200) * env(n, 0.004, 0.16)
        add(s, st, 0.32, -0.3); add(s, st + 0.012, 0.32, 0.3)
# riser into the celebration, then impact
rs = RISE_END - 2 * bar
n = int((RISE_END - rs) * SR); t = np.arange(n) / SR
nz = rng.normal(0, 1, n); rise = np.zeros(n); a = 0.0
for k in range(n):
    c = 0.02 + 0.5 * (k / n) ** 2; a += c * (nz[k] - a); rise[k] = a
add(rise * (t / t[-1]) ** 2 * 0.9, rs, 1.0)
def impact():
    n = int(1.6 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (40 + 60 * np.exp(-t / 0.05)) * t) * np.exp(-t / 0.5)
    crash = lowpass(rng.normal(0, 1, n), 7000) * np.exp(-t / 0.6) * 0.5
    return boom + crash
add(impact(), RISE_END, 0.9); add(impact(), 0.0, 0.7)   # one on the drop, one at the top
# end: final chord stab with long tail, groove stops
n = int((DUR - END_HIT) * SR)
fin = sum(saw(f * 2, n, (-0.01, 0, 0.01)) for f in CHORDS[0]) / 3
add(lowpass(fin, 3000) * env(n, 0.005, 0.9), END_HIT, 0.4); add(impact(), END_HIT, 0.8)
mix = np.stack([L, R], 1) * side[:, None]
# fade the very end, normalize, soft clip
fade = int(0.25 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.4) * 0.89
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', DUR)
