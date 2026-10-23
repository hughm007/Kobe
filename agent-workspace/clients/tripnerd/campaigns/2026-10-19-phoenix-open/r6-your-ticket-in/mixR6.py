# "Your Ticket In" sound (owner rules): ONE continuous Pixabay track (Wyatt's pick) start to finish, no loops; real clip audio
# ONLY on V03 (5.0-9.5 s); one SFX: soft ice clink at 0.0 s, low. Music ducked ~40% under the swing (5.0 s) and back to full
# exactly on the real crowd roar (7.9 s timeline = V03 raw ~4.8 s). -14 LUFS / -1 dBTP.
#   python3 mixR6.py <silent.mp4> <out.mp4> [music_file] [music_start_s]     (no music_file -> MUSIC SLOT version)
import sys, subprocess, numpy as np
import mix2 as m
SR = m.SR; T = 16.5; N = int(SR * T); DROP = 7.9; DUCK = 0.6

def clink():
    n = int(0.6 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for f, a, d in ((2637, 0.5, 0.18), (4186, 0.35, 0.12), (5920, 0.25, 0.08), (3135, 0.3, 0.15)):
        y += a * np.sin(2 * np.pi * f * t) * np.exp(-t / d)
    y[int(0.07 * SR):] += 0.5 * y[:n - int(0.07 * SR)]        # second, softer touch of ice
    y += m.bandnoise(n, 3000, 9000) * np.exp(-t / 0.01) * 0.2
    return m.st(y * 0.35)

def load(path, start, dur):
    raw = subprocess.run([m.FF, '-v', 'error', '-ss', str(start), '-t', str(dur), '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy(); return np.pad(x, ((0, max(0, int(dur * SR) - len(x))), (0, 0)))[:int(dur * SR)]

def build(music, mstart):
    bus = np.zeros((N, 2), np.float32)
    m.place(bus, clink(), 0.0, -12, fin=0.0, fout=0.05)
    m.place(bus, m.src('V03', 1.9, 4.5), 5.0, 2, fin=0.01, fout=0.12)
    if music:
        mu = load(music, mstart, T); t = np.arange(N) / SR; g = np.ones(N)
        g[(t >= 5.0) & (t < DROP)] = DUCK
        r1 = (t >= 4.9) & (t < 5.0); g[r1] = 1 + (DUCK - 1) * (t[r1] - 4.9) / 0.1
        g[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
        bus += (mu * g[:, None] * 0.75).astype(np.float32)
    return bus

if __name__ == '__main__':
    silent, out = sys.argv[1], sys.argv[2]; music = sys.argv[3] if len(sys.argv) > 3 else None
    mstart = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
    m.T = T; m.N = N; m.build = lambda wb: build(music, mstart); m.master(silent, out, False)
