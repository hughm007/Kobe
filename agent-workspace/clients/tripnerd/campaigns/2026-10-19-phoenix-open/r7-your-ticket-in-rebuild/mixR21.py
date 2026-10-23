# R21 sound (= R16 with a 1.5 s end fade): one EDM Hybrid Intro track, drop locked to the bunker hard cut; V01 real crowd under the stadium pan; V03 real crowd
# roar layered under the bunker from the drop; soft tick on each check, set ~5 dB above the local music bed; gentle dip (-9 dB) with
# soft water across the pool, recovering into the end card; music resolves on the final frame.
import sys, json, numpy as np
import mix2 as m
from mixR6 import load
from mixR12 import water, rms
from mixR15 import tick
BP = '/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/r3build_in/TripNerd_PHX_Reel3/'
m.S['V03'] = BP + 'V03.mp4'; m.S['V01'] = BP + 'V01.mp4'
SR = m.SR
def cos_ramp(t, t0, t1, a, b):
    u = np.clip((t - t0) / (t1 - t0), 0, 1); return a + (b - a) * (0.5 - 0.5 * np.cos(np.pi * u))
def build(meta, music, mdrop):
    T = meta['end_s']; N = int(round(SR * T)); m.N = N; m.T = T; drop = meta['drop_s']
    mu = load(music, mdrop - drop, T) * 0.75; mu[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    t = np.arange(N) / SR; pa, pb = meta['pool_s']; ec = meta['endcard_s']; q = 10 ** (-9 / 20)
    g = np.where(t < pa, 1.0, np.where(t < ec - 0.35, cos_ramp(t, pa, pa + 0.4, 1.0, q), cos_ramp(t, ec - 0.35, ec + 0.25, q, 1.0))).astype(np.float32)
    FO = 1.5; res = t >= T - FO; g[res] *= (0.5 + 0.5 * np.cos(np.pi * np.clip((t[res] - (T - FO)) / FO, 0, 1)))   # music plays under the end card, 1.5 s cosine fade
    bus = mu * g[:, None]
    sa, sb = meta['stadium_s']; v1 = m.src('V01', 2.5, sb - sa)
    m.place(bus, v1, sa, 20 * np.log10(rms(mu[int(sa * SR):int(sb * SR)]) / rms(v1)) - 8.0, fin=0.08, fout=0.12)
    ba, bb = meta['bunker_s']; v3 = m.src('V03', 3.6, bb - ba + 0.3)
    m.place(bus, v3, ba, 20 * np.log10(rms(mu[int(ba * SR):int((ba + 2.4) * SR)]) / rms(v3)) - 4.0, fin=0.005, fout=0.25)
    wd = ec + 0.3 - pa; wa = water(wd); env = np.ones(len(wa), np.float32); r0 = int(0.3 * SR); env[:r0] = np.linspace(0, 1, r0)
    r1 = int(0.6 * SR); env[-r1:] = np.linspace(1, 0, r1)
    m.place(bus, wa * env[:, None], pa, 20 * np.log10(rms(mu[int((pa - 1) * SR):int(pa * SR)]) / rms(wa)) - 16.0, fin=0.0, fout=0.01)
    tk = tick(); tr = rms(tk[:int(0.03 * SR)]); lv = []
    for ts in meta['ticks_s']:
        bed = rms(bus[int((ts - 0.25) * SR):int((ts + 0.25) * SR)]); gt = 20 * np.log10(bed / tr) + 5.0
        m.place(bus, tk, ts, gt, fin=0.0, fout=0.01); lv.append(round(gt, 1))
    print('music start', round(mdrop - drop, 3), '| ticks', meta['ticks_s'], lv, '| pool dip', pa, '->', ec, '| end', T)
    return limit(bus, 0.8)
def limit(x, ceil):                                            # 5 ms look-ahead peak limiter (sample-peak), smooth gain, no clipping
    from scipy.ndimage import minimum_filter1d
    a = np.abs(x).max(1); g = np.minimum(1.0, ceil / np.maximum(a, 1e-9)); w = int(0.005 * SR)
    g = minimum_filter1d(g, 2 * w + 1); k = np.hanning(2 * w + 1); k /= k.sum(); g = np.convolve(g, k, 'same')
    y = x * g[:, None]; print('pre-master peak', round(float(a.max()), 3), '-> limited', round(float(np.abs(y).max()), 3),
                             '| max reduction dB', round(float(20 * np.log10(g.min())), 1)); return y * (0.5 / np.abs(y).max())
import subprocess, re
from scipy.signal import resample_poly
from scipy.ndimage import minimum_filter1d
def measure(path):
    r = subprocess.run([m.FF, '-hide_banner', '-nostats', '-i', path, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = r[r.rfind('Summary'):]; return float(re.search(r'I:\s+(-?[\d.]+)', s).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+)', s).group(1))
def tp_limit(x, ceil_db):                                      # true-peak (4x oversampled) look-ahead limiter
    c = 10 ** (ceil_db / 20); up = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)
    a = up.reshape(-1, 4).max(1)[:len(x)] if len(up) >= 4 * len(x) else np.pad(up, (0, 4 * len(x) - len(up))).reshape(-1, 4).max(1)
    g = np.minimum(1.0, c / np.maximum(a, 1e-9)); w = int(0.004 * SR); g = minimum_filter1d(g, 2 * w + 1)
    k = np.hanning(2 * w + 1); k /= k.sum(); g = np.minimum(1.0, np.convolve(g, k, 'same')); return x * g[:, None]
def master16(bus, silent, out):
    wav = out + '.wav'; enc = lambda x: subprocess.run([m.FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', wav], input=x.astype(np.float32).tobytes(), check=True)
    enc(bus); I0, _ = measure(wav); gain = -14.0 - I0; ceil = -2.0
    for it in range(6):
        y = tp_limit(bus * 10 ** (gain / 20), ceil); enc(y)
        subprocess.run([m.FF, '-v', 'error', '-y', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
        I, TP = measure(out); print(f'  pass {it}: gain {gain:+.2f} dB ceil {ceil} -> I {I} LUFS, TP {TP} dBTP')
        if TP > -1.0: ceil -= 0.5; continue
        if abs(I + 14.0) > 0.2: gain += -14.0 - I; continue
        break
    print(out, 'I', I, 'LUFS TP', TP)
if __name__ == '__main__':
    silent, out, music, mdrop = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    meta = json.load(open(silent + '.json')); master16(build(meta, music, mdrop), silent, out)
