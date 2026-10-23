# Final calm checklist cut sound: one EDM Hybrid Intro track (drop locked to the flash cut at 8.70 s); V01's real crowd under the
# music on the 16th pan; V03's real crowd clear (but under the music) on the bunker; a soft tick on each checkmark beat;
# hotel cut: music dips for one beat (150 ms) to soft synthesized water, back on the kick (100 ms); music resolves on the last beat.
import sys, json, numpy as np
import mix2 as m
from mixR6 import load
from mixR12 import water, rms
BP = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/r3build_in/TripNerd_PHX_Reel3/'
m.S['V03'] = BP + 'V03.mp4'; m.S['V01'] = BP + 'V01.mp4'
SR = m.SR
def tick():
    n = int(0.09 * SR); t = np.arange(n) / SR; rng = np.random.default_rng(5)
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR); X[(f < 1800) | (f > 7000)] = 0; nz = np.fft.irfft(X, n)
    y = nz / np.abs(nz).max() * np.exp(-t / 0.006) * 0.6 + np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.022) * 0.5
    return np.stack([y, y], 1).astype(np.float32)
def build(meta, music, mdrop):
    T = meta['end_s']; N = int(SR * T); m.N = N; m.T = T; drop = meta['drop_s']; cut = meta['hotel_cut_s']; kick = meta['kick29_s']
    mu = load(music, mdrop - drop, T) * 0.75; mu[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    t = np.arange(N) / SR; g = np.ones(N, np.float32); q = 10 ** (-28 / 20)
    dn = (t >= cut) & (t < cut + 0.15); g[dn] = 1 + (q - 1) * (0.5 - 0.5 * np.cos(np.pi * (t[dn] - cut) / 0.15))
    g[(t >= cut + 0.15) & (t < kick - 0.10)] = q
    up = (t >= kick - 0.10) & (t < kick); g[up] = q + (1 - q) * (0.5 - 0.5 * np.cos(np.pi * (t[up] - (kick - 0.10)) / 0.10))
    last = meta['beat_times_s'][-1]; res = (t >= last - 0.45)                                      # resolve on the final beat
    g[res] *= np.clip(1 - (t[res] - (last - 0.45)) / 0.45, 0, 1) ** 1.5
    bus = mu * g[:, None]
    v1a, v1b = meta['v01_s']; v1 = m.src('V01', 2.5, v1b - v1a)
    m.place(bus, v1, v1a, 20 * np.log10(rms(mu[int(v1a * SR):int(v1b * SR)]) / rms(v1)) - 8.0, fin=0.06, fout=0.08)
    v3a, v3b = meta['v03_s']; v3 = m.src('V03', 3.6, v3b - v3a)
    m.place(bus, v3, v3a, 20 * np.log10(rms(mu[int(v3a * SR):int((v3a + 2.4) * SR)]) / rms(v3)) - 5.0, fin=0.005, fout=0.06)
    tk = tick(); gt = 20 * np.log10(rms(mu[int(10 * SR):int(12 * SR)]) / rms(tk[:int(0.02 * SR)])) - 10.0
    for ts in meta['ticks_s']: m.place(bus, tk, ts, gt, fin=0.0, fout=0.01)
    wd = (kick - cut) + 0.8; wa = water(wd); ne = len(wa); env = np.ones(ne, np.float32)
    env[:int(0.12 * SR)] = np.linspace(0, 1, int(0.12 * SR)); aft = int((kick - cut) * SR); env[aft:] = np.linspace(1, 0, ne - aft) ** 1.5
    m.place(bus, wa * env[:, None], cut, 20 * np.log10(rms(mu[int((cut - 1) * SR):int(cut * SR)]) / rms(wa[:aft])) - 18.0, fin=0.0, fout=0.01)
    print('music start', round(mdrop - drop, 3), '| ticks', meta['ticks_s'], '| dip', round(cut, 3), '->', kick, '| resolve', last)
    return bus
if __name__ == '__main__':
    silent, out, music, mdrop = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    meta = json.load(open(silent + '.json')); m.build = lambda wb: build(meta, music, mdrop); m.master(silent, out, False)
