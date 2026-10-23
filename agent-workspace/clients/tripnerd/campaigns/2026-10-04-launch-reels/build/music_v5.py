"""Original music bed for 'Augusta, by the clock' v5 — synthesised from scratch (no samples, no voices).
Owned outright by ServicePOW: no third-party licence involved. 92.3 BPM, D major, 7.833 s (235 frames).
Arrangement (beats): 0-3 groove from frame 0 (9:03 open) | 3-6 clock race: drop, ticks accelerate (1.9/2.6 kHz),
reverse swell | 6-8 crash + groove on the 5:44 cut | 8-12 close: groove to 10, open Gmaj9 rings out (loops into D).
v5 mix: less sub (bass/kick down, bass high-passed), mids up, ticks audible on phone speakers."""
import numpy as np, wave, sys
SR = 48000; BEAT = 0.65; DUR = 235/30            # 19.5 frames per beat at 30 fps
N = int(round(DUR*SR)); rng = np.random.default_rng(7)
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
    env = np.minimum(1, t/0.004)*(0.75*np.exp(-t/1.1)+0.25*np.exp(-t/0.25))
    env *= np.minimum(1, (d-t)/0.06)
    return y*env*v
def pluck(f, d=0.9, v=1.0):     # additive plucked string, exactly in tune
    t = t_(d); y = np.zeros_like(t)
    for k in range(1, 11):
        if k*f > 12000: break
        y += (1/k**1.3)*np.sin(2*np.pi*k*f*t + k)*np.exp(-t*(2.2+0.9*k**1.4))
    return y*np.minimum(1, t/0.002)*np.minimum(1, (d-t)/0.03)*v
def bass(f, d, v=1.0):
    t = t_(d); y = np.sin(2*np.pi*f*t)+0.45*np.sin(4*np.pi*f*t)+0.2*np.sin(6*np.pi*f*t)   # more harmonics: reads on phone speakers
    return np.tanh(1.4*y)*np.minimum(1, t/0.008)*np.exp(-t/0.55)*np.minimum(1, (d-t)/0.03)*v
def kick(v=1.0):
    t = t_(0.35); ph = 2*np.pi*np.cumsum(46+90*np.exp(-t*38))/SR
    y = np.sin(ph)*np.exp(-t*13); y[:120] += band(rng.normal(0, 1, 120), 1500, 8000)*np.exp(-t[:120]*400)*0.3
    return y*v
def clap(v=1.0):
    t = t_(0.25); n = rng.normal(0, 1, len(t)); env = 0.55*np.exp(-t*18)
    for o in (0, 0.009, 0.018): env += np.where(t >= o, np.exp(-(t-o)*160), 0)
    return band(n, 900, 5200)*env*v
def hat(v=1.0, d=0.06):
    t = t_(d); return band(rng.normal(0, 1, len(t)), 7000, 16000)*np.exp(-t*70)*v
def shaker(v=1.0):
    t = t_(0.09); return band(rng.normal(0, 1, len(t)), 4500, 11000)*np.minimum(1, t/0.012)*np.exp(-t*45)*v
def tick(v=1.0, f=2600):
    t = t_(0.04); y = np.sin(2*np.pi*f*t)*np.exp(-t*180)+band(rng.normal(0, 1, len(t)), 1200, 4500)*np.exp(-t*400)*0.6
    return y*v
def pad(fs, d, v=1.0):
    t = t_(d); y = np.zeros_like(t)
    for f in fs:
        for det in (-0.004, 0, 0.004):
            for k in range(1, 7): y += np.sin(2*np.pi*k*f*(1+det)*t + rng.uniform(0, 6.28))/(k*1.6)
    return y/len(fs)*v
def crash(v=1.0):
    t = t_(2.2); n = band(rng.normal(0, 1, len(t)), 3500, 15000)
    return n*np.minimum(1, t/0.002)*np.exp(-t*2.6)*v

b = lambda x: x*BEAT
CH = {  # chord voicings (EP), bass root, pluck tones
 "Dmaj9": (["D3","A3","C#4","E4","F#4"], "D2", ["D5","A4","F#5","E5"]),
 "A/C#":  (["C#3","A3","B3","E4"],        "C#2",["E5","A4","C#5","B4"]),
 "Bm7":   (["B2","F#3","A3","D4","E4"],   "B1", ["D5","F#4","B4","A4"]),
 "Gmaj9": (["G2","D3","F#3","A3","B3"],   "G1", ["B4","D5","F#5","A5"]),
 "D":     (["D3","F#3","A3","D4","E4"],   "D2", ["F#5","D5","A4","E5"]),
 "A":     (["A2","E3","A3","C#4","E4"],   "A1", ["E5","C#5","A4","B4"]),
}
def chord(name, start, beats, ep_v=0.28, groove=True, plucks=True):
    tones, root, pl = CH[name]
    tones = [n for n in tones if m(n) >= m("D3")] + [tones[-1][:-1] + str(int(tones[-1][-1])+1)]   # v5: bass owns the low end; add a top octave
    for i, n in enumerate(tones):
        add(ep(hz(m(n)), b(beats)+0.4, ep_v), b(start)+0.004*i, pan=-0.35+0.7*i/max(1, len(tones)-1))
    if groove:
        add(bass(hz(m(root)), b(1.4), 0.20), b(start))
        if beats >= 2: add(bass(hz(m(root)), b(0.45), 0.14), b(start+1.5))
    if plucks:
        for k in range(int(beats*2)):
            add(pluck(hz(m(pl[k % 4])), 0.8, 0.22 if k % 2 == 0 else 0.15), b(start+k*0.5), pan=0.3 if k % 2 else -0.3)
def drums(s, e, kick_on=True):
    x = s
    while x < e-1e-6:
        if kick_on: add(kick(0.50), b(x))
        if kick_on and int(round(x)) % 2 == 1: add(clap(0.34), b(x), pan=0.05)
        add(hat(0.10), b(x+0.5), pan=0.25); add(hat(0.05), b(x), pan=0.25)
        for q in range(4): add(shaker(0.07 if q % 2 else 0.045), b(x+q*0.25), pan=-0.3)
        x += 1

# 0-3 groove from frame 0 (9:03 open: brand + clock + "Thursday in Augusta")
chord("Dmaj9", 0, 3); drums(0, 3)
# 3-6 clock race: drop to a low pad, accelerating ticks (alternating pitch), reverse swell into the 5:44 cut
add(pad([hz(m(n)) for n in ["B2","F#3","A3","D4"]], b(3), 0.08) * np.minimum(1, t_(b(3))/0.2) * np.exp(-t_(b(3))*0.2), b(3))
add(bass(hz(m("B1")), b(1.5), 0.12), b(3))
x = b(3); iv = b(0.5); k = 0
while x < b(5.6):
    add(tick(0.5, 2600 if k % 2 == 0 else 1900), x, pan=0.15 if k % 2 else -0.15); x += iv; iv = max(0.045, iv*0.86); k += 1
sw = t_(b(1.5)); swell = band(rng.normal(0, 1, len(sw)), 2500, 13000)*(sw/sw[-1])**3
add(swell*0.24, b(6)-len(sw)/SR, pan=0.0)
# 6-8 crash + groove on the 5:44 cut
add(crash(0.16), b(6)); chord("D", 6, 2); drums(6, 8)
# 8-12 close (5:48): groove to beat 10, then the open IV chord rings out and loops back into D
chord("A", 8, 2); drums(8, 10)
chord("Gmaj9", 10, 2, ep_v=0.28, groove=False, plucks=False)
add(bass(hz(m("G1")), b(2), 0.22), b(10))
for k, n in enumerate(["B4","D5","F#5","A5"]): add(pluck(hz(m(n)), 1.0, 0.18), b(10+k*0.5), pan=0.3 if k % 2 else -0.3)
add(hat(0.06), b(10.5), pan=0.25); add(hat(0.05), b(11.5), pan=0.25)

# reverb: stereo exponential-noise IR, ~0.9 s
ir_t = t_(1.0); irL = rng.normal(0, 1, len(ir_t))*np.exp(-ir_t/0.16); irR = rng.normal(0, 1, len(ir_t))*np.exp(-ir_t/0.16)
irL = band(irL, 150, 9000); irR = band(irR, 150, 9000); irL /= np.sqrt((irL**2).sum()); irR /= np.sqrt((irR**2).sum())
def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x)+len(h)))); return np.fft.irfft(np.fft.rfft(x, n)*np.fft.rfft(h, n), n)[:len(x)]
wetL, wetR = conv(L, irL), conv(R, irR)
outL, outR = band(L+0.22*wetL, 45, 20000), band(R+0.22*wetR, 45, 20000)   # high-pass the sub rumble
fade = np.ones(N); nf = int(0.35*SR); fade[-nf:] = np.linspace(1, 0, nf)**1.5
fi = int(0.004*SR); fade[:fi] = np.linspace(0, 1, fi)
outL *= fade; outR *= fade
pk = max(np.abs(outL).max(), np.abs(outR).max()); outL, outR = np.tanh(1.2*outL/pk)/np.tanh(1.2)*0.7, np.tanh(1.2*outR/pk)/np.tanh(1.2)*0.7
st = (np.stack([outL, outR], 1)*32767).astype(np.int16)
out = sys.argv[1] if len(sys.argv) > 1 else "reel03/music_v5_raw.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print("wrote", out, round(N/SR, 3), "s")
