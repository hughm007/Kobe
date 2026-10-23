# Reel 3 v5 sound: v4 mix unchanged through 14.0 s; then "from the noise to the quiet":
#   14.00-14.50  V03's real crowd roar (source 6.25-6.75 s) swells in OVER the music -> loudest moment of the Reel
#   14.50        hard duck: music to -30 dB in 30 ms, crowd cut; soft synthesized pool/water ambience (no voices)
#   14.967       stamp lands on beat 17: music back to full in 8 ms; water fades out under it
#   end          music fades over the last second.  -14 LUFS / -1 dBTP master (mix2.master)
#   python3 mixR12.py <silent.mp4> <out.mp4> <music.mp3> <music_drop_s>
import sys, json, numpy as np
import mix2 as m
from mixR6 import load
m.S['V03'] = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/r3build_in/TripNerd_PHX_Reel3/V03.mp4'
SR = m.SR
def rms(x): return float(np.sqrt((x ** 2).mean()) + 1e-9)
def water(dur, seed=11):
    """gentle pool lapping: brown-ish noise in 150-1800 Hz, slow random swells, a few soft drips; no tonal or vocal content"""
    rng = np.random.default_rng(seed); n = int(dur * SR); t = np.arange(n) / SR
    w = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    w[(f < 150) | (f > 1800)] = 0; w[f > 0] /= np.sqrt(f[f > 0] / 150); x = np.fft.irfft(w, n)
    sw = 0.55 + 0.45 * np.sin(2 * np.pi * 0.9 * t + 0.6) * np.sin(2 * np.pi * 0.37 * t + 1.3)
    x = x / (np.abs(x).max() + 1e-9) * sw
    for d0 in (0.12, 0.43, 0.71):                                        # soft drips
        i = int(d0 * SR); k = np.arange(int(0.09 * SR)) / SR
        x[i:i + len(k)] += 0.25 * np.sin(2 * np.pi * (900 + 1400 * k / 0.09) * k) * np.exp(-k / 0.025)
    y = np.stack([x, np.roll(x, 211)], 1).astype(np.float32)          # slight stereo width
    return y / (np.abs(y).max() + 1e-9)
def build(meta, music, mdrop):
    T = meta['end_s']; N = int(SR * T); m.N = N; m.T = T; drop = meta['drop_s']
    cut = dict(meta['shots_s'])['FSP_01 pool']; land = meta['stamp_land_s']
    bus = np.zeros((N, 2), np.float32)
    mstart = mdrop - drop; mu = load(music, mstart, T) * 0.75
    mu[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    t = np.arange(N) / SR; g = np.ones(N, np.float32); q = 10 ** (-30 / 20)
    dn = (t >= cut) & (t < cut + 0.03); g[dn] = 1 + (q - 1) * (t[dn] - cut) / 0.03
    g[(t >= cut + 0.03) & (t < land)] = q
    up = (t >= land) & (t < land + 0.008); g[up] = q + (1 - q) * (t[up] - land) / 0.008
    nf = int(1.0 * SR); g[-nf:] *= np.cos(np.linspace(0, np.pi / 2, nf)) ** 2
    bus += mu * g[:, None]
    # V03 under the bunker shot (as v4)
    v3 = m.src('V03', meta['v03_src'], meta['v03_out_s'] - drop)
    gv = 20 * np.log10(rms(mu[int(drop * SR):int((drop + 4) * SR)]) / rms(v3)) - 9.0
    m.place(bus, v3, drop, gv, fin=0.005, fout=0.03)
    # crowd peak 14.0-14.5: swell in, hard cut on the picture cut
    roar = m.src('V03', 6.25, cut - 14.0).astype(np.float32); n_ = len(roar)
    roar *= (np.linspace(0, 1, n_) ** 1.6)[:, None]
    gr = 20 * np.log10(rms(mu[int(13.5 * SR):int(14.0 * SR)]) / rms(roar[-int(0.15 * SR):])) + 5.0   # ends ~5 dB over the music: the loudest moment
    m.place(bus, roar, 14.0, gr, fin=0.0, fout=0.004)
    # water ambience: in on the cut, under the music after the stamp
    wd = (land - cut) + 0.9; wa = water(wd); ne = len(wa)
    env = np.ones(ne, np.float32); env[:int(0.03 * SR)] = np.linspace(0, 1, int(0.03 * SR))
    after = int((land - cut) * SR); env[after:] = np.linspace(1, 0, ne - after) ** 1.5
    wa *= env[:, None]
    gw = 20 * np.log10(rms(mu[int(13.0 * SR):int(14.0 * SR)]) / rms(wa[:after])) - 20.0          # subtle: ~20 dB under full music
    m.place(bus, wa, cut, gw, fin=0.0, fout=0.01)
    print('music start', round(mstart, 3), 'duck', round(cut, 3), '->', round(land, 3), '| roar gain', round(gr, 1), 'water gain', round(gw, 1))
    return bus
if __name__ == '__main__':
    silent, out, music, mdrop = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    meta = json.load(open(silent + '.json')); meta['shots_s'] = [tuple(x) for x in meta['shots_s']]
    m.build = lambda wb: build(meta, music, mdrop); m.master(silent, out, False)
