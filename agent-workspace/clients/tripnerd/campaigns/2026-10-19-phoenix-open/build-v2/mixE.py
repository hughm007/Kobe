# Sound for the one-shot: ONLY real recordings from the owner's Phoenix clips. No synthesised impacts, no metallic hits.
# Real V03 audio (with its real sand splash) under the real part, the real crowd boosted after the ball lands, then real
# Phoenix crowd recordings layered under the AI aerial, rising into a full stadium roar. -14 LUFS / -1 dBTP.
#   python3 mixE.py <silent.mp4> <out.mp4> <join_seconds>
import sys, numpy as np
import mix2 as m
m.S['V04'] = m.U + '2280cf92-IMG_0097.mov'   # real Phoenix crowd swell from the owner's other clip

def build_for(T, join):
    m.T = T; m.N = int(m.SR * T); N = m.N
    bus = np.zeros((N, 2), np.float32); P = m.place; S = m.src
    real = S('V03', 2.47, join)                                    # the real shot's own audio, untouched
    t = np.arange(len(real)) / m.SR
    land = 4.3 - 2.47                                              # ball on the green at about 4.3 s source
    g = np.where(t < land, 1.0, 10 ** ((6 * np.clip((t - land) / 0.4, 0, 1)) / 20))[:, None]   # +6 dB on the crowd after landing
    P(bus, (real * g).astype(np.float32), 0.0, 0, fout=0.01)
    tail = S('V03', 2.47 + join, 8.17 - 2.47 - join)               # the same crowd keeps going under the aerial
    P(bus, tail, join, 6, fin=0.01, fout=0.6)
    # rising stadium roar under the aerial: layered real crowd recordings, each ramped up
    layers = [('V04', 8.4, 3.6, join + 0.4), ('V03', 4.4, 3.7, join + 1.2), ('V02', 0.5, 6.0, join), ('V01', 4.0, 6.0, join + 0.2), ('V04', 9.8, 2.2, T - 2.6)]
    for k, s, d, at in layers:
        x = S(k, s, min(d, T - at)); n = len(x)
        ramp = np.linspace(0.25, 1.0, n) ** 1.5
        P(bus, (x * ramp[:, None]).astype(np.float32), at, 4, fin=0.3, fout=0.4)
    bus[-int(0.3 * m.SR):] *= np.linspace(1, 0, int(0.3 * m.SR))[:, None]
    return bus

if __name__ == '__main__':
    silent, out, join = sys.argv[1], sys.argv[2], float(sys.argv[3])
    import subprocess, re
    d = re.search(r'Duration: (\d+):(\d+):([\d.]+)', subprocess.run([m.FF, '-i', silent], capture_output=True, text=True).stderr)
    T = int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3))
    m.build = lambda with_beat: build_for(T, join)
    m.master(silent, out, False)
