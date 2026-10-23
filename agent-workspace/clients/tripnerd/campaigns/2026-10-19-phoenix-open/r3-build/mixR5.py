# Reel 3 v5 sound (owner rules): ONE continuous music track start to finish (no loops, no stacked SFX); real crowd audio ONLY on
# the V03 shot (3.0-7.5 s); every other clip muted. Music ducked ~40% under the swing (3.0 s -> roar), slammed back to full on
# the roar (5.6 s). -14 LUFS / -1 dBTP.
#   python3 mixR5.py <silent.mp4> <out.mp4> [music_file] [music_start_s]
#   no music_file -> "music-ready" master: V03 real audio only, silence elsewhere
import sys, subprocess, numpy as np
import mix2 as m
SR = m.SR; T = 16.0; N = int(SR * T)
DUCK_DB = 20 * np.log10(0.6)          # ~40% down
ROAR = 5.6                            # V03 crowd swell lands here on the timeline

def load(path, start, dur):
    raw = subprocess.run([m.FF, '-v', 'error', '-ss', str(start), '-t', str(dur), '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return np.pad(x, ((0, max(0, int(dur * SR) - len(x))), (0, 0)))[:int(dur * SR)]

def build(music, mstart):
    bus = np.zeros((N, 2), np.float32)
    m.place(bus, m.src('V03', 1.9, 4.5), 3.0, 2, fin=0.01, fout=0.12)              # the only real audio
    if music:
        mu = load(music, mstart, T); t = np.arange(N) / SR
        g = np.ones(N)
        duck = (t >= 2.95) & (t < ROAR); g[duck] = 10 ** (DUCK_DB / 20)
        ramp_in = (t >= 2.85) & (t < 2.95); g[ramp_in] = 1 + (10 ** (DUCK_DB / 20) - 1) * (t[ramp_in] - 2.85) / 0.1
        g[-int(0.06 * SR):] *= np.linspace(1, 0, int(0.06 * SR))                 # clean button on the last beat
        bus += (mu * g[:, None] * 0.75).astype(np.float32)
    return bus

if __name__ == '__main__':
    silent, out = sys.argv[1], sys.argv[2]
    music = sys.argv[3] if len(sys.argv) > 3 else None
    mstart = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
    m.T = T; m.N = N
    m.build = lambda with_beat: build(music, mstart)
    m.master(silent, out, False)
