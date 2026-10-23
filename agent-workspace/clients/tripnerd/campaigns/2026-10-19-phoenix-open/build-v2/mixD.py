# Reel 3 (drone hook) sound: real clip audio + synthesised SFX, 14.0 s, music hit/drop at 2.0 on the cut to the suite rail.
#   python3 mixD.py <silentD.mp4> <out.mp4> beat|fx
import sys, numpy as np
import mix2 as m
import mixC
m.T = 14.0; m.N = int(m.SR * m.T)

def build(with_beat):
    N = m.N; real = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32); P = m.place; S = m.src
    P(real, S('V02', 0.3, 2.0), 0.0, -8, fin=0.1)                                 # real crowd air from the event under the AI rise
    P(fx, m.riser(2.0), 0.0, -4); P(fx, m.whoosh(1.4, up=True), 0.5, -3)           # the lift
    P(fx, m.impact(1.0), 2.0, 0)                                                   # HIT: hard cut to the real suite rail
    P(real, S('V01', 0.0, 1.5), 2.0, -1)
    P(fx, m.whoosh(0.4), 3.3, -3)
    P(real, S('V03', 0.0, 2.0, 'lowpass=f=1400'), 3.5, -4); P(fx, m.reverse_swell(2.0), 3.5, -4)   # slow-motion blast
    P(fx, m.bass_hit(), 5.5, 0)                                                    # snap to real speed
    P(real, S('V03', 3.22, 1.0), 5.5, 0); P(real, S('V03', 4.6, 2.0), 5.5, 3, fin=0.03, fout=0.5)
    P(real, S('V03', 4.47, 2.5), 6.5, 1)
    P(real, S('V02', 2.0, 5.0), 9.0, -6, fout=1.5)
    for c, s in ((6.5, 0.6), (8.0, 0.5), (9.0, 0.7), (11.0, 0.8)): P(fx, m.impact(s), c, -4)
    for c in (6.5, 9.0, 11.0): P(fx, m.whoosh(0.3), c - 0.2, -8)
    mix = real + fx * 0.9
    if with_beat: mix += mixC.temp_beat_c() * 0.8
    return mix

m.build = build
if __name__ == '__main__':
    m.master(sys.argv[1], sys.argv[2], sys.argv[3] == 'beat')
