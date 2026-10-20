# S1 sound: real audio first. V03's real splash and crowd (0-3 s), a soft low hit on the 3.0 s cut (no metallic sound),
# real suite air and the real Phoenix crowd under the stills, real roar tail under the end card.
# Optional TEMP 120 BPM beat from 3.0 s (placeholder for the owner's Pixabay track). -14 LUFS / -1 dBTP.
#   python3 mixS1.py <silent.mp4> <out.mp4> beat|fx
import sys, numpy as np
import mix2 as m
m.S['V04'] = m.U + '2280cf92-IMG_0097.mov'
m.T = 13.0; m.N = int(m.SR * m.T); SR = m.SR

def beat():
    N = m.N; bus = np.zeros(N); b = 0.5
    def add(x, at, g=1.0):
        i = int(at * SR); e = min(N, i + len(x)); bus[i:e] += x[:e - i] * g
    roots = [55.0, 43.65, 65.41, 49.0]
    for k in range(int((12.5 - 3.0) / b)):
        at = 3.0 + k * b; add(m.kick(), at, 0.85)
        if k % 2: add(m.clap(), at, 0.5)
        add(m.hat(), at + b / 2, 0.8)
        if k % 2 == 0:
            tt = np.arange(int(0.95 * SR)) / SR
            add(np.tanh(1.5 * np.sin(2 * np.pi * roots[(k // 8) % 4] * tt)) * np.exp(-tt / 0.6) * 0.3, at + 0.02)
    bus[int(12.0 * SR):int(13.0 * SR)] *= np.linspace(1, 0, int(1.0 * SR))
    return m.st(bus)

def low_hit():                     # a soft sub thump: felt, not heard as a "ping"
    n = int(0.9 * SR); t = np.arange(n) / SR
    return m.st(np.sin(2 * np.pi * np.cumsum(42 + 30 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.35) * 0.8)

def build(with_beat):
    N = m.N; bus = np.zeros((N, 2), np.float32); P = m.place; S = m.src
    P(bus, S('V03', 2.47, 3.0), 0.0, 2, fout=0.03)                                   # real swing, splash, crowd
    P(bus, S('V03', 5.47, 2.7), 3.0, 4, fin=0.02, fout=0.4)                           # the same crowd's reaction carries over the cut
    P(bus, S('V01', 0.0, 2.0), 3.0, -2, fin=0.05, fout=0.3)                           # real suite air
    P(bus, S('V04', 9.6, 2.6), 5.0, 0, fin=0.3, fout=0.5)                             # real roar under the guests
    P(bus, S('V02', 1.0, 6.0), 7.0, -4, fin=0.4, fout=1.5)                            # real stadium bed to the end card
    P(bus, low_hit(), 3.0, -2)
    for c in (5.0, 7.5, 9.5): P(bus, m.whoosh(0.3), c - 0.2, -10)
    if with_beat: bus += beat() * 0.7
    return bus

m.build = build
if __name__ == '__main__':
    m.master(sys.argv[1], sys.argv[2], sys.argv[3] == 'beat')
