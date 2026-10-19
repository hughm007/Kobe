# Version C sound: same palette as v2 (real clip audio + synthesised SFX), retimed for the 14.0 s C cut with the drop at 2.0.
#   python3 mixC.py <silentC.mp4> <out.mp4> beat|fx
import sys, numpy as np
import mix2 as m
m.T = 14.0; m.N = int(m.SR * m.T)
SR = m.SR

def temp_beat_c():
    N = m.N; bus = np.zeros(N); b = 0.5
    def add(x, at, g=1.0):
        i = int(at * SR); e = min(N, i + len(x)); bus[i:e] += x[:e - i] * g
    for k in range(2): add(m.kick(), 1.0 + k * 0.5, 0.6)              # 1-2 s: build under the fly-up
    for k in range(16): add(m.clap(), 1.0 + k * 0.0625, 0.2 + 0.5 * k / 16)
    roots = [55.0, 43.65, 65.41, 49.0]
    for beat in range(int((13.5 - 2.0) / b)):                          # drop at 2.0
        at = 2.0 + beat * b; add(m.kick(), at, 0.9)
        if beat % 2 == 1: add(m.clap(), at, 0.6)
        add(m.hat(), at + b / 2); add(m.hat(), at, 0.6)
        if beat % 2 == 0:
            f = roots[(beat // 8) % 4]; tt = np.arange(int(0.95 * SR)) / SR
            add(np.tanh(1.5 * np.sin(2 * np.pi * f * tt)) * np.exp(-tt / 0.6) * 0.35, at + 0.02)
    bus[int(13.0 * SR):int(14.0 * SR)] *= np.linspace(1, 0, int(1.0 * SR))
    return m.st(bus)

def build(with_beat):
    N = m.N; real = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32); P = m.place; S = m.src
    P(real, S('V02', 0.3, 2.0), 0.0, -6, fin=0.1)                                  # real crowd air from the same suite under the AI move
    P(real, S('V03', 0.0, 2.0, 'lowpass=f=1400'), 2.0, -4)                         # muffled murmur under the slow motion
    P(real, S('V03', 3.22, 1.0), 4.0, 0)                                           # real-speed snap
    P(real, S('V03', 4.6, 2.0), 4.0, 3, fin=0.03, fout=0.5)                        # the shot's own crowd swell on the hit
    P(real, S('V01', 0.0, 1.5), 5.0, -1)
    P(real, S('V03', 4.47, 2.5), 6.5, 1)                                           # real swell in sync
    P(real, S('V02', 2.0, 5.0), 9.0, -6, fout=1.5)
    P(fx, m.riser(2.0), 0.0, -5); P(fx, m.whoosh(1.2, up=True), 0.4, -4)           # fly-up lift
    P(fx, m.impact(1.0), 2.0, 0)                                                   # DROP on the bunker blast
    P(fx, m.reverse_swell(2.0), 2.0, -8)
    P(fx, m.bass_hit(), 4.0, 0)                                                    # slow motion snaps to real speed
    P(fx, m.whoosh(0.45), 4.72, -2); P(fx, m.impact(0.8), 5.0, -2)
    for c, s in ((6.5, 0.6), (8.0, 0.5), (9.0, 0.7), (11.0, 0.8)): P(fx, m.impact(s), c, -4)
    for c in (6.5, 9.0, 11.0): P(fx, m.whoosh(0.3), c - 0.2, -8)
    mix = real + fx * 0.9
    if with_beat: mix += temp_beat_c() * 0.8
    return mix

m.build = build
if __name__ == '__main__':
    m.master(sys.argv[1], sys.argv[2], sys.argv[3] == 'beat')
