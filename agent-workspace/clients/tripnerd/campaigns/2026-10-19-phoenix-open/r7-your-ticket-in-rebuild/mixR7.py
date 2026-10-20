# Reel 3 "Your Ticket In" rebuild sound: ONE Pixabay track, start to finish, never ducked, never quiet; the track's drop lands on
# the white flash (5.1 s). Real audio ONLY from V03, sitting UNDER the music (about 9 dB below it). Opener and V01 muted.
# Only extra SFX: a soft ice clink at 0.0 s. Clean 80 ms button on the final beat. -14 LUFS / -1 dBTP.
#   python3 mixR7.py <silent.mp4> <out.mp4> <music.mp3> <music_drop_s>
import sys, json, subprocess, numpy as np
import mix2 as m
from mixR6 import clink, load
m.S['V03'] = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/r3build_in/TripNerd_PHX_Reel3/V03.mp4'
SR = m.SR
def rms(x): return float(np.sqrt((x ** 2).mean()) + 1e-9)
def build(meta, music, mdrop):
    T = meta['end_s']; N = int(SR * T); m.N = N; m.T = T; drop = meta['drop_s']
    bus = np.zeros((N, 2), np.float32)
    mstart = mdrop - drop; assert mstart >= 0, 'track drop must sit at least 5.1 s into the track'
    mu = load(music, mstart, T) * 0.75
    mu[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR))[:, None]
    bus += mu
    v3d = meta['v03_out_s'] - drop + 0.4                                       # 0.4 s crowd tail rings under the first photo
    v3 = m.src('V03', 1.9, v3d)
    post = mu[int(drop * SR):int((drop + 4) * SR)]
    g = 20 * np.log10(rms(post) / rms(v3)) - 9.0                              # crowd sits ~9 dB under the music
    m.place(bus, v3, drop, g, fin=0.005, fout=0.4)
    m.place(bus, clink(), 0.0, -12, fin=0.0, fout=0.05)
    print('music start in track', round(mstart, 3), 's; V03 gain', round(g, 1), 'dB')
    return bus
if __name__ == '__main__':
    silent, out, music, mdrop = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    meta = json.load(open(silent + '.json'))
    m.build = lambda wb: build(meta, music, mdrop); m.master(silent, out, False)
