"""Original music bed for 'Augusta, handled' (15.0 s) — synthesised from scratch: no samples, no voices.
Owned outright by ServicePOW; no third-party licence. Instruments reused from the launch-reels bed
(clients/tripnerd/campaigns/2026-10-04-launch-reels/build/music_v5.py, branch claude/admiring-mendel-aqjyaw).
80 BPM (0.75 s beats), D major, warm and unhurried:
  0-3.0   hook: soft Dmaj9 keys + pad, sparse plucks          (no drums)
  3.0-6.0 A/C# -> Bm7, bass enters, plucks move to eighths
  6.0-12.75 light groove (kick, shaker, soft hat) under the voice: G - D - A - Bm - G
  12.75   one-beat lift, then the lockup lands on Dmaj9 at 13.0 and rings out (fade 14.6-15.0)
The voice ducking is done in mix.py, not here. Usage: python3 music.py out.wav"""
import numpy as np, wave, sys
SR = 48000; BEAT = 0.75; DUR = 15.0
N = int(round(DUR*SR)); rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
def t_(d): return np.arange(int(d*SR))/SR
def add(sig, start, pan=0.0, gain=1.0):
    i = int(round(start*SR)); j = min(N, i+len(sig))
    if j <= i: return
    s = sig[:j-i]*gain; L[i:j] += s*np.sqrt((1-pan)/2); R[i:j] += s*np.sqrt((1+pan)/2)
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1/SR)
    X *= ((f >= lo) & (f <= hi)) * 1.0; return np.fft.irfft(X, len(x))
def hz(m): return 440*2**((m-69)/12)
NOTE = {n:i for i,n in enumerate(["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"])}
def m(s): return 12*(int(s[-1])+1)+NOTE[s[:-1]]
def ep(f, d, v=1.0):            # FM electric piano
    t = t_(d); I = 1.8*np.exp(-t*7)+0.35
    y = np.sin(2*np.pi*f*t + I*np.sin(2*np.pi*f*t))
    y += 0.12*np.sin(2*np.pi*f*t + 0.9*np.exp(-t*25)*np.sin(2*np.pi*14*f*t))*np.exp(-t*9)
    env = np.minimum(1, t/0.004)*(0.75*np.exp(-t/1.1)+0.25*np.exp(-t/0.25)); env *= np.minimum(1, (d-t)/0.06)
    return y*env*v
def pluck(f, d=0.9, v=1.0):     # additive plucked string, exactly in tune
    t = t_(d); y = np.zeros_like(t)
    for k in range(1, 11):
        if k*f > 12000: break
        y += (1/k**1.3)*np.sin(2*np.pi*k*f*t + k)*np.exp(-t*(2.2+0.9*k**1.4))
    return y*np.minimum(1, t/0.002)*np.minimum(1, (d-t)/0.03)*v
def bass(f, d, v=1.0):
    t = t_(d); y = np.sin(2*np.pi*f*t)+0.45*np.sin(4*np.pi*f*t)+0.2*np.sin(6*np.pi*f*t)
    return np.tanh(1.4*y)*np.minimum(1, t/0.008)*np.exp(-t/0.55)*np.minimum(1, (d-t)/0.03)*v
def kick(v=1.0):
    t = t_(0.35); ph = 2*np.pi*np.cumsum(46+90*np.exp(-t*38))/SR
    y = np.sin(ph)*np.exp(-t*13); y[:120] += band(rng.normal(0, 1, 120), 1500, 8000)*np.exp(-t[:120]*400)*0.3
    return y*v
def hat(v=1.0, d=0.06):
    t = t_(d); return band(rng.normal(0, 1, len(t)), 7000, 16000)*np.exp(-t*70)*v
def shaker(v=1.0):
    t = t_(0.09); return band(rng.normal(0, 1, len(t)), 4500, 11000)*np.minimum(1, t/0.012)*np.exp(-t*45)*v
def pad(fs, d, v=1.0):
    t = t_(d); y = np.zeros_like(t)
    for f in fs:
        for det in (-0.004, 0, 0.004):
            for k in range(1, 7): y += np.sin(2*np.pi*k*f*(1+det)*t + rng.uniform(0, 6.28))/(k*1.6)
    env = np.minimum(1, t/0.6)*np.minimum(1, (d-t)/0.5)
    return y/len(fs)*env*v
CH = {  # EP voicing, bass root, pluck tones
 "Dmaj9": (["D3","A3","C#4","E4","F#4"], "D2", ["D5","A4","F#5","E5"]),
 "A/C#":  (["C#3","A3","B3","E4"],        "C#2",["E5","A4","C#5","B4"]),
 "Bm7":   (["B2","F#3","A3","D4","E4"],   "B1", ["D5","F#4","B4","A4"]),
 "Gmaj9": (["G2","D3","F#3","A3","B3"],   "G1", ["B4","D5","F#5","A5"]),
 "D":     (["D3","F#3","A3","D4","E4"],   "D2", ["F#5","D5","A4","E5"]),
 "A":     (["A2","E3","A3","C#4","E4"],   "A1", ["E5","C#5","A4","B4"]),
}
def chord(name, start, dur, ep_v=0.24, bass_v=0.0, pl_step=0.0, pl_v=0.16):
    tones, root, pl = CH[name]
    tones = [n for n in tones if m(n) >= m("D3")] + [tones[-1][:-1] + str(int(tones[-1][-1])+1)]
    for i, n in enumerate(tones): add(ep(hz(m(n)), dur+0.4, ep_v), start+0.006*i, pan=-0.35+0.7*i/max(1, len(tones)-1))
    if bass_v: add(bass(hz(m(root)), min(dur, 1.1), bass_v), start)
    if pl_step:
        k = 0; x = start
        while x < start+dur-1e-6:
            add(pluck(hz(m(pl[k % 4])), 0.9, pl_v if k % 2 == 0 else pl_v*0.7), x, pan=0.3 if k % 2 else -0.3); x += pl_step; k += 1
def groove(s, e):
    x = s; n = 0
    while x < e-1e-6:
        if n % 2 == 0: add(kick(0.36), x)
        add(hat(0.06), x+BEAT/2, pan=0.25)
        for q in range(2): add(shaker(0.05 if q else 0.035), x+q*BEAT/2, pan=-0.3)
        x += BEAT; n += 1

# 0-3: hook, keys + pad, sparse plucks
add(pad([hz(m(n)) for n in ["D3","A3","E4","F#4"]], 3.4, 0.05), 0.0)
chord("Dmaj9", 0.0, 3.0, ep_v=0.22, pl_step=BEAT, pl_v=0.12)
# 3-6: bass enters, plucks in eighths
chord("A/C#", 3.0, 1.5, bass_v=0.16, pl_step=BEAT/2); chord("Bm7", 4.5, 1.5, bass_v=0.16, pl_step=BEAT/2)
# 6-12.75: light groove under the voice
for name, s in [("Gmaj9", 6.0), ("D", 7.5), ("A", 9.0), ("Bm7", 10.5)]: chord(name, s, 1.5, bass_v=0.18, pl_step=BEAT/2, pl_v=0.14)
chord("Gmaj9", 12.0, 1.0, bass_v=0.18, pl_step=BEAT/2, pl_v=0.14)
groove(6.0, 12.75)
sw = t_(0.6); add(band(rng.normal(0, 1, len(sw)), 2500, 12000)*(sw/sw[-1])**3*0.12, 13.0-0.6)   # small lift into the lockup
# 13.0: the lockup lands on Dmaj9 and rings out
add(kick(0.30), 13.0); chord("Dmaj9", 13.0, 2.0, ep_v=0.26, bass_v=0.2)
for k, n in enumerate(["A4","D5","F#5","A5"]): add(pluck(hz(m(n)), 1.2, 0.15), 13.0+k*BEAT/2, pan=0.3 if k % 2 else -0.3)
add(pad([hz(m(n)) for n in ["D3","A3","E4","F#4"]], 2.0, 0.05), 13.0)
# reverb (stereo exponential-noise IR, ~0.9 s), high-pass, fades, soft clip
ir_t = t_(1.0); irL = band(rng.normal(0, 1, len(ir_t))*np.exp(-ir_t/0.18), 150, 9000); irR = band(rng.normal(0, 1, len(ir_t))*np.exp(-ir_t/0.18), 150, 9000)
irL /= np.sqrt((irL**2).sum()); irR /= np.sqrt((irR**2).sum())
def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x)+len(h)))); return np.fft.irfft(np.fft.rfft(x, n)*np.fft.rfft(h, n), n)[:len(x)]
outL, outR = band(L+0.25*conv(L, irL), 45, 20000), band(R+0.25*conv(R, irR), 45, 20000)
fade = np.ones(N); nf = int(0.4*SR); fade[-nf:] = np.linspace(1, 0, nf)**1.5; fi = int(0.01*SR); fade[:fi] = np.linspace(0, 1, fi)
outL *= fade; outR *= fade
pk = max(np.abs(outL).max(), np.abs(outR).max()); outL, outR = np.tanh(1.2*outL/pk)/np.tanh(1.2)*0.7, np.tanh(1.2*outR/pk)/np.tanh(1.2)*0.7
st = (np.stack([outL, outR], 1)*32767).astype(np.int16)
out = sys.argv[1] if len(sys.argv) > 1 else "music.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print("wrote", out, round(N/SR, 3), "s")
