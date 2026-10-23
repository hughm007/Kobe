# Reel 3 sound: real crowd leads. 0-0.5 muffled murmur (tunnel); 0.5-3.0 paper snap + murmur swelling;
# 3.0-7.5 V03's real swing and roar (untouched); MUSIC DROP on the roar (5.5 s); V01 suite ambience low;
# one real crowd cheer under P05; crowd tail fades under the end card. TEMP 120 BPM beat = placeholder for Wyatt's Pixabay track.
#   python3 mixR3.py <silent.mp4> <out.mp4> beat|fx
import sys, numpy as np
import mix2 as m
m.S['V04'] = m.U + '2280cf92-IMG_0097.mov'
m.T = 17.0; m.N = int(m.SR * m.T); SR = m.SR

def paper_snap():
    n = int(0.18 * SR); t = np.arange(n) / SR
    y = m.bandnoise(n, 1200, 7000) * np.exp(-t / 0.025) + 0.4 * m.bandnoise(n, 300, 1500) * np.exp(-t / 0.06)
    return m.st(y * 0.8)

def beat():
    N = m.N; bus = np.zeros(N); b = 0.5
    def add(x, at, g=1.0):
        i = int(at * SR); e = min(N, i + len(x)); bus[i:e] += x[:e - i] * g
    for k in range(4): add(m.kick(), 3.5 + k * 0.5, 0.35 + 0.1 * k)          # soft build under the swing
    for k in range(16): add(m.clap(), 4.5 + k * 0.0625, 0.15 + 0.4 * k / 16)
    roots = [55.0, 43.65, 65.41, 49.0]
    for k in range(int((16.5 - 5.5) / b)):                                    # DROP at 5.5 s on the real roar
        at = 5.5 + k * b; add(m.kick(), at, 0.85)
        if k % 2: add(m.clap(), at, 0.5)
        add(m.hat(), at + b / 2, 0.8)
        if k % 2 == 0:
            tt = np.arange(int(0.95 * SR)) / SR
            add(np.tanh(1.5 * np.sin(2 * np.pi * roots[(k // 8) % 4] * tt)) * np.exp(-tt / 0.6) * 0.3, at + 0.02)
    tt = np.arange(int(1.4 * SR)) / SR; add(np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 0.7) * 0.5, 16.0)   # resolve
    bus[int(16.0 * SR):] *= np.linspace(1, 0, N - int(16.0 * SR))
    return m.st(bus)

def build(with_beat):
    N = m.N; bus = np.zeros((N, 2), np.float32); P = m.place; S = m.src
    murm = S('V02', 0.3, 3.0, 'lowpass=f=700'); n = len(murm)
    P(bus, (murm * np.linspace(0.35, 1.0, n)[:, None] ** 1.5).astype(np.float32), 0.0, 0, fin=0.2, fout=0.15)  # tunnel murmur swelling
    P(bus, paper_snap(), 0.55, -4)
    P(bus, S('V03', 1.9, 4.5), 3.0, 3, fin=0.01, fout=0.2)                                          # the real shot, untouched
    P(bus, S('V01', 0.0, 4.0), 7.5, -8, fin=0.05, fout=0.3)                                         # suite ambience, low
    P(bus, S('V03', 6.4, 1.6), 7.5, -2, fin=0.05, fout=0.8)                                         # roar carries over the cut
    P(bus, S('V04', 10.4, 1.4), 11.6, -2, fin=0.1, fout=0.4)                                        # one real crowd cheer under P05
    P(bus, S('V02', 2.0, 3.5), 13.5, -6, fin=0.3, fout=2.0)                                         # crowd tail
    if with_beat: bus += beat() * 0.7
    return bus

m.build = build
if __name__ == '__main__':
    m.master(sys.argv[1], sys.argv[2], sys.argv[3] == 'beat')
