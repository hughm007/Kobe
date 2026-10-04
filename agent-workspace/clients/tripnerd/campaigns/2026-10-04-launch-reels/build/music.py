"""Original music bed for 'Augusta, by the clock' — synthesised from scratch (no samples, no voices).
Owned outright by ServicePOW: no third-party licence involved. 92.3 BPM, D major, 11.733 s.
Arrangement (beats): 0-3 cold open (EP + pluck) | 3-7 groove | 7-10 clock race: drop, ticks accelerate,
reverse swell | 10-14 groove + crash on the 5:44 cut | 14-18 groove, final Gmaj9 rings out."""
import numpy as np, wave, sys
SR = 48000; BEAT = 0.65; DUR = 352/30            # 19.5 frames per beat at 30 fps
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
    t = t_(d); y = np.sin(2*np.pi*f*t)+0.25*np.sin(4*np.pi*f*t)+0.08*np.sin(6*np.pi*f*t)
    return np.tanh(1.4*y)*np.minimum(1, t/0.008)*np.exp(-t/0.55)*np.minimum(1, (d-t)/0.03)*v
def kick(v=1.0):
    t = t_(0.35); ph = 2*np.pi*np.cumsum(46+90*np.exp(-t*38))/SR
    y = np.sin(ph)*np.exp(-t*9.5); y[:120] += band(rng.normal(0, 1, 120), 1500, 8000)*np.exp(-t[:120]*400)*0.3
    return y*v
def clap(v=1.0):
    t = t_(0.25); n = rng.normal(0, 1, len(t)); env = 0.55*np.exp(-t*18)
    for o in (0, 0.009, 0.018): env += np.where(t >= o, np.exp(-(t-o)*160), 0)
    return band(n, 900, 5200)*env*v
def hat(v=1.0, d=0.06):
    t = t_(d); return band(rng.normal(0, 1, len(t)), 7000, 16000)*np.exp(-t*70)*v
def shaker(v=1.0):
    t = t_(0.09); return band(rng.normal(0, 1, len(t)), 4500, 11000)*np.minimum(1, t/0.012)*np.exp(-t*45)*v
def tick(v=1.0):
    t = t_(0.03); y = np.sin(2*np.pi*2600*t)*np.exp(-t*260)+band(rng.normal(0, 1, len(t)), 2000, 7000)*np.exp(-t*500)*0.5
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
def chord(name, start, beats, ep_v=0.22, groove=True, plucks=True):
    tones, root, pl = CH[name]
    for i, n in enumerate(tones):
        add(ep(hz(m(n)), b(beats)+0.4, ep_v), b(start)+0.004*i, pan=-0.35+0.7*i/max(1, len(tones)-1))
    if groove:
        add(bass(hz(m(root)), b(1.4), 0.32), b(start))
        if beats >= 2: add(bass(hz(m(root)), b(0.45), 0.22), b(start+1.5))
    if plucks:
        for k in range(int(beats*2)):
            add(pluck(hz(m(pl[k % 4])), 0.8, 0.16 if k % 2 == 0 else 0.11), b(start+k*0.5), pan=0.3 if k % 2 else -0.3)
def drums(s, e, kick_on=True):
    x = s
    while x < e-1e-6:
        if kick_on: add(kick(0.65), b(x))
        if kick_on and int(round(x)) % 2 == 1: add(clap(0.34), b(x), pan=0.05)
        add(hat(0.10), b(x+0.5), pan=0.25); add(hat(0.05), b(x), pan=0.25)
        for q in range(4): add(shaker(0.07 if q % 2 else 0.045), b(x+q*0.25), pan=-0.3)
        x += 1

# 0-3 cold open: chord + pluck hook from frame 0, shaker only
chord("Dmaj9", 0, 3, ep_v=0.24, groove=False)
add(bass(hz(m("D2")), b(2.8), 0.30), 0)
for q in range(12): add(shaker(0.05 if q % 2 else 0.03), b(q*0.25), pan=-0.3)
sw0 = t_(b(1)); add(band(rng.normal(0, 1, len(sw0)), 3000, 12000)*(sw0/sw0[-1])**3*0.12, b(2))   # small lift into the first kick
# 3-7 groove (kick lands on the 9:03 cut)
chord("A/C#", 3, 2); chord("Bm7", 5, 2); drums(3, 7)
# 7-10 clock race: drop to a low pad, accelerating ticks, reverse swell into the 5:44 cut
add(pad([hz(m(n)) for n in ["G2","D3","F#3","B3"]], b(3), 0.05) * np.minimum(1, t_(b(3))/0.25) * np.exp(-t_(b(3))*0.25), b(7))
x = b(7); iv = b(0.5)
while x < b(9.6):
    add(tick(0.20), x, pan=0.15); x += iv; iv = max(0.045, iv*0.86)
sw = t_(b(1.5)); swell = band(rng.normal(0, 1, len(sw)), 2500, 13000)*(sw/sw[-1])**3
add(swell*0.22, b(10)-len(sw)/SR, pan=0.0)
# 10-14 groove returns with a crash on the 5:44 cut
add(crash(0.16), b(10)); chord("D", 10, 2); chord("A", 12, 2); drums(10, 14)
# 14-18: groove to beat 16, then the open IV chord rings out (loops back into D)
chord("Bm7", 14, 2); drums(14, 16)
chord("Gmaj9", 16, 2, ep_v=0.24, groove=False, plucks=False)
add(bass(hz(m("G1")), b(2), 0.35), b(16))
for k, n in enumerate(["B4","D5","F#5","A5"]): add(pluck(hz(m(n)), 1.0, 0.13), b(16+k*0.5), pan=0.3 if k % 2 else -0.3)
add(hat(0.06), b(16.5), pan=0.25); add(hat(0.05), b(17.5), pan=0.25)

# reverb: stereo exponential-noise IR, ~0.9 s
ir_t = t_(1.0); irL = rng.normal(0, 1, len(ir_t))*np.exp(-ir_t/0.16); irR = rng.normal(0, 1, len(ir_t))*np.exp(-ir_t/0.16)
irL = band(irL, 150, 9000); irR = band(irR, 150, 9000); irL /= np.sqrt((irL**2).sum()); irR /= np.sqrt((irR**2).sum())
def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x)+len(h)))); return np.fft.irfft(np.fft.rfft(x, n)*np.fft.rfft(h, n), n)[:len(x)]
wetL, wetR = conv(L, irL), conv(R, irR)
outL, outR = band(L+0.22*wetL, 32, 20000), band(R+0.22*wetR, 32, 20000)   # high-pass the sub rumble
fade = np.ones(N); nf = int(0.35*SR); fade[-nf:] = np.linspace(1, 0, nf)**1.5
fi = int(0.004*SR); fade[:fi] = np.linspace(0, 1, fi)
outL *= fade; outR *= fade
pk = max(np.abs(outL).max(), np.abs(outR).max()); outL, outR = np.tanh(1.2*outL/pk)/np.tanh(1.2)*0.7, np.tanh(1.2*outR/pk)/np.tanh(1.2)*0.7
st = (np.stack([outL, outR], 1)*32767).astype(np.int16)
out = sys.argv[1] if len(sys.argv) > 1 else "reel03/music_bed_raw.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print("wrote", out, round(N/SR, 3), "s")
