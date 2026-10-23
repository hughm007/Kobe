# Reel 3 "Your Ticket In" rebuild sound (owner, final): ONE Pixabay track, start to finish, never ducked; the drop attack measured
# on the delivered MP3 lands on the white flash (5.1 s). Real audio ONLY from V03, under the music (about 9 dB below it), cut with
# the picture at the first photo. Opener, V01 and photos muted. No SFX, no voice. Music fades out cleanly over the end card's last
# second. -14 LUFS / -1 dBTP.
#   python3 mixR7.py <silent.mp4> <out.mp4> <music.mp3> <music_drop_s>
import sys, json, subprocess, numpy as np
import mix2 as m
from mixR6 import load
m.S['V03'] = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/r3build_in/TripNerd_PHX_Reel3/V03.mp4'
SR = m.SR
def rms(x): return float(np.sqrt((x ** 2).mean()) + 1e-9)
def build(meta, music, mdrop):
    T = meta['end_s']; N = int(SR * T); m.N = N; m.T = T; drop = meta['drop_s']
    bus = np.zeros((N, 2), np.float32)
    mstart = mdrop - drop; assert mstart >= 0, 'track drop must sit at least 5.1 s into the track'
    mu = load(music, mstart, T) * 0.75
    mu[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]       # click-free start mid-track
    nf = int(1.0 * SR); mu[-nf:] *= (np.cos(np.linspace(0, np.pi / 2, nf)) ** 2)[:, None]   # clean fade over the last second
    bus += mu
    v3d = meta['v03_out_s'] - drop                                             # crowd stops with the cut to the first photo
    v3 = m.src('V03', meta.get('v03_src', 1.9), v3d)
    post = mu[int(drop * SR):int((drop + 4) * SR)]
    g = 20 * np.log10(rms(post) / rms(v3)) - 9.0                              # crowd sits ~9 dB under the music
    m.place(bus, v3, drop, g, fin=0.005, fout=0.03)
    print('music start in track', round(mstart, 3), 's; V03 gain', round(g, 1), 'dB')
    return bus
if __name__ == '__main__':
    silent, out, music, mdrop = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    meta = json.load(open(silent + '.json'))
    m.build = lambda wb: build(meta, music, mdrop); m.master(silent, out, False)
