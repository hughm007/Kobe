# One-shot sound: real recordings only. V03's own audio under the real part (real sand splash), its real crowd boosted
# after the ball lands, then real Phoenix crowd roars layered under the AI pull-back, rising to a peak on the final hold.
# No synthesised impacts, no metallic hits, no music. -14 LUFS / -1 dBTP.   python3 mixF.py <silent.mp4> <out.mp4>
import sys, json, numpy as np
import mix2 as m
m.S['V04'] = m.U + '2280cf92-IMG_0097.mov'

def build(silent):
    info = json.load(open(silent + '.json')); T = info['total_s']; J = info['join_s']
    m.T = T; m.N = int(m.SR * T); N = m.N; SR = m.SR
    bus = np.zeros((N, 2), np.float32); P = m.place; S = m.src
    real = S('V03', 2.47, J); t = np.arange(len(real)) / SR
    land = 4.3 - 2.47                                                      # ball lands on the green ~4.3 s source
    g = 10 ** ((6 * np.clip((t - land) / 0.5, 0, 1)) / 20)[:, None]        # +6 dB on the real crowd once it lands
    P(bus, (real * g).astype(np.float32), 0.0, 0, fout=0.02)
    # under the aerial (J .. T): real crowd roars, each ramped so the whole bed swells into the final held frame
    D = T - J
    def ramp_in(x, lo_db, hi_db):
        n = len(x); r = np.linspace(0, 1, n) ** 1.6
        return (x * (10 ** ((lo_db + (hi_db - lo_db) * r) / 20))[:, None]).astype(np.float32)
    P(bus, ramp_in(S('V03', 5.2, D + 0.3), 2, 8), J - 0.3, 0, fin=0.3, fout=0.25)       # the same 16th-hole crowd, carried on
    P(bus, ramp_in(S('V04', 10.75 - D + 0.15, D + 0.3), -6, 6), J - 0.15, 0, fin=0.2, fout=0.25)   # real roar, peak lands on the hold
    P(bus, ramp_in(S('V02', 1.0, D + 0.3), -4, 4), J - 0.3, 0, fin=0.3, fout=0.25)      # stadium bed (same suite)
    P(bus, ramp_in(S('V01', 4.0, D + 0.3), -6, 3), J - 0.3, 0, fin=0.3, fout=0.25)
    return bus

if __name__ == '__main__':
    silent, out = sys.argv[1], sys.argv[2]
    m.build = lambda with_beat: build(silent)
    m.master(silent, out, False)
