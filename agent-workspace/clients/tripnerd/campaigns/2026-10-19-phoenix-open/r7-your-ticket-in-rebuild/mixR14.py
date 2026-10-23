# Checklist version sound: one EDM Hybrid Intro track (drop on the flash at 7.233 s); V03 crowd roar UNDER the music on the
# bunker (its only appearance); all other clips muted; hotel cut: music ducks for ONE beat (150 ms fade) to soft synthesized water,
# back to full on the kick (100 ms fade-up); music fades over the last second.
import sys, json, numpy as np
import mix2 as m
from mixR6 import load
from mixR12 import water, rms
m.S['V03'] = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/r3build_in/TripNerd_PHX_Reel3/V03.mp4'
SR = m.SR
def build(meta, music, mdrop):
    T = meta['end_s']; N = int(SR * T); m.N = N; m.T = T; drop = meta['drop_s']; cut = meta['hotel_cut_s']; kick = meta['kick19_s']
    mu = load(music, mdrop - drop, T) * 0.75; mu[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    t = np.arange(N) / SR; g = np.ones(N, np.float32); q = 10 ** (-30 / 20)
    dn = (t >= cut) & (t < cut + 0.15); g[dn] = 1 + (q - 1) * (t[dn] - cut) / 0.15
    g[(t >= cut + 0.15) & (t < kick - 0.10)] = q
    up = (t >= kick - 0.10) & (t < kick); g[up] = q + (1 - q) * (t[up] - (kick - 0.10)) / 0.10
    nf = int(1.0 * SR); g[-nf:] *= np.cos(np.linspace(0, np.pi / 2, nf)) ** 2
    bus = mu * g[:, None]
    v3 = m.src('V03', meta['v03_src'], meta['v03_out_s'] - drop)
    m.place(bus, v3, drop, 20 * np.log10(rms(mu[int(drop * SR):int((drop + 2.4) * SR)]) / rms(v3)) - 7.0, fin=0.005, fout=0.03)
    wd = (kick - cut) + 0.8; wa = water(wd); ne = len(wa); env = np.ones(ne, np.float32)
    env[:int(0.12 * SR)] = np.linspace(0, 1, int(0.12 * SR)); aft = int((kick - cut) * SR); env[aft:] = np.linspace(1, 0, ne - aft) ** 1.5
    m.place(bus, wa * env[:, None], cut, 20 * np.log10(rms(mu[int((cut - 1) * SR):int(cut * SR)]) / rms(wa[:aft])) - 20.0, fin=0.0, fout=0.01)
    print('music start', round(mdrop - drop, 3), '| duck', round(cut, 3), '-> full at kick', kick)
    return bus
if __name__ == '__main__':
    silent, out, music, mdrop = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    meta = json.load(open(silent + '.json')); m.build = lambda wb: build(meta, music, mdrop); m.master(silent, out, False)
