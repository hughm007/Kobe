"""A5 mix for 'Augusta, handled' (20.0 s, owner: slower voice, voice on every line; 48 kHz stereo, -14 LUFS / -1 dBTP).
Music: Mixkit #470 "Golden Storm" (Diego Nava), Mixkit Stock Music Free License (online ads and social posts allowed, no
attribution; evidence in ../qc/music-licence.md). The track starts at 2.11 s so its drop (15.11 s in the track) lands on
the cut into the end shot at 13.0 s; it fades over the last 0.6 s. Used as a synced bed, never as a music-only track.
Voice: Seed Audio take 505d1f23 (the hosting-spot host's voice from the audio reference) reading the owner's line; head/tail
trimmed; pauses longer than 0.16 s shortened to 0.12 s (cut inside the silence, 15 ms crossfades); no time-stretch.
Ticks: word times (faster-whisper) -> out/ticks.json. Card sounds from the approved camera-roll card (audio.py): the whoosh
as the card slides, the kick 0.25 s later (on the track's beat), the tap on the pill; its pitched plucks are left out so
nothing fights the track's key. Music ducked 9 dB under the voice; static gain + true-peak limiter to -14 LUFS.
Usage: python3 mix4.py <music.mp3> <voice.wav>"""
import json, subprocess, sys, wave
import numpy as np
SR = 48000; DUR = 20.0; T0 = 5.4; DUCK_DB = -9.0; MUS_OFF = 0.21; CARD = 17.51
# (file, start s, atempo, cut pauses longer than, keep) - list read at default rate, lightly tightened; the other lines untouched
LINES = [('v/list.wav', T0, 1.08, 0.20, 0.15), ('v/bring.wav', 12.4, 1.0, 0.25, 0.20), ('v/handle.wav', 15.15, 1.0, 0.25, 0.20), ('v/done.wav', 17.62, 1.0, 0.25, 0.20)]
ITEMS = {"course": 0, "private": 1, "daily": 2, "concierge": 3}
rng = np.random.default_rng(3)
def read(p, ss=None, t=None):
    raw = subprocess.run(["ffmpeg", "-v", "error"] + (["-ss", "%.4f" % ss] if ss is not None else []) + ["-i", p] + (["-t", "%.4f" % t] if t else []) +
                         ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
def write(p, x):
    st = (np.clip(x, -1, 1)*32767).astype(np.int16)
    with wave.open(p, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
# ---- card sounds (as audio.py) ----
def noise(n): return rng.standard_normal(n).astype(np.float32)
def filt(x, lo=None, hi=None, o=2):
    N = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(N, 1/SR)+1e-3; m = np.ones_like(f)
    if lo: m *= 1/np.sqrt(1+(lo/f)**(2*o))
    if hi: m *= 1/np.sqrt(1+(f/hi)**(2*o))
    return np.fft.irfft(X*m, N).astype(np.float32)
def pk(x, p=1.): m = np.abs(x).max(); return x*(p/m) if m > 0 else x
def sweep(dur, f0, f1, q=.55, curve=1.):
    n = int(dur*SR); x = noise(n+2048); hop = 256; L = 2048; win = np.hanning(L).astype(np.float32)
    out = np.zeros(n+L, np.float32); nm = np.zeros(n+L, np.float32); f = np.fft.rfftfreq(L, 1/SR)+1e-3
    for i in range(0, n, hop):
        u = (i/max(n, 1))**curve; fc = f0*(f1/f0)**u; m = np.exp(-.5*(np.log(f/fc)/q)**2)
        y = np.fft.irfft(np.fft.rfft(x[i:i+L]*win)*m, L).astype(np.float32); out[i:i+L] += y*win; nm[i:i+L] += win**2
    return pk(out[:n]/np.maximum(nm[:n], 1e-3))
def kick():
    n = int(.42*SR); t = np.arange(n)/SR; f = 46+120*np.exp(-t/.032); x = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.26)
    c = int(.004*SR); x[:c] += filt(noise(c), lo=1500)*.35*np.linspace(1, 0, c); return pk(x.astype(np.float32), .95)
def tap():
    n = int(.06*SR); t = np.arange(n)/SR
    x = np.sin(2*np.pi*1700*t)*np.exp(-t/.006)+.7*np.sin(2*np.pi*820*t)*np.exp(-t/.014)
    x[:96] += filt(noise(96), lo=3000)*.4; return pk(x.astype(np.float32), .7)
def whoosh(dur, f0, f1, pan0=0., pan1=0.):
    x = sweep(dur, f0, f1); u = np.linspace(0, 1, len(x)); e = np.sin(np.pi*np.clip(u, 0, 1))**1.6
    y = x*e; p = pan0+(pan1-pan0)*u; th = (p+1)*np.pi/4
    return np.stack([y*np.cos(th), y*np.sin(th)], 1).astype(np.float64)
music = read(sys.argv[1], MUS_OFF, DUR+0.2)
def edit(path, tempo, cut_over, keep):
    voice = read(path) if tempo == 1.0 else np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",path,"-af","atempo=%.3f"%tempo,"-ac","2","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,np.float32).reshape(-1,2).astype(np.float64)
    hop = int(0.01*SR); env = np.array([np.sqrt((voice[i:i+hop]**2).mean()) for i in range(0, len(voice)-hop, hop)])
    db = 20*np.log10(env/env.max()+1e-9); loud = db > -40
    first, last = np.argmax(loud), len(loud)-1-np.argmax(loud[::-1])
    voice = voice[max(0, first-2)*hop:(last+3)*hop]; loud = (db > -40)[max(0, first-2):last+3]
    XF = int(0.015*SR); runs = []; s = None
    for k, v in enumerate(loud):
        if not v and s is None: s = k
        if v and s is not None: runs.append((s, k)); s = None
    out = np.zeros((0, 2)); pos = 0
    for a, b in [(a, b) for a, b in runs if (b-a)*0.01 > cut_over]:
        kl = int(keep*SR); mid_a = a*hop + kl//2; mid_b = b*hop - kl//2; seg = voice[pos:mid_a]
        if len(out) and len(seg) > XF:
            r = np.linspace(0, 1, XF)[:, None]; out[-XF:] = out[-XF:]*(1-r) + seg[:XF]*r; seg = seg[XF:]
        out = np.vstack([out, seg]); pos = mid_b - XF
    tail = voice[pos:]
    if len(out) and len(tail) > XF:
        r = np.linspace(0, 1, XF)[:, None]; out[-XF:] = out[-XF:]*(1-r) + tail[:XF]*r; tail = tail[XF:]
    voice = np.vstack([out, tail]); return voice*10**(-18/20)/np.sqrt((voice**2).mean())
VO = [(edit(p, te, co, kp), t0) for p, t0, te, co, kp in LINES]
voice = VO[0][0]; VD = len(voice)/SR
for (v, t0), (p, *_ ) in zip(VO, LINES): print(p, "starts %.2f ends %.2f" % (t0, t0+len(v)/SR))
write("out/vo_edit.wav", voice)
# 2. word timestamps -> ticks
from faster_whisper import WhisperModel
words = [w for s_ in WhisperModel("base.en", device="cpu", compute_type="int8").transcribe(
    "out/vo_edit.wav", word_timestamps=True, vad_filter=True, condition_on_previous_text=False, language="en")[0] for w in s_.words]
ticks = [None]*4
for w in words:
    key = w.word.strip().strip(",.").lower()
    if key in ITEMS and ticks[ITEMS[key]] is None: ticks[ITEMS[key]] = round(T0 + w.start - 0.08, 3)
transcript = " ".join(w.word.strip() for w in words)
json.dump({"T0": T0, "voice_dur": round(VD, 3), "ticks": ticks, "transcript": transcript, "lines": [[p, t0, round(t0+len(v)/SR, 3)] for (v, t0), (p, *_ ) in zip(VO, LINES)]}, open("out/ticks.json", "w"), indent=1)
print("voice", round(VD, 3), "s; ends", round(T0+VD, 3), "; ticks", ticks, "|", transcript)
# 3. music bed, card sounds, duck, sum, loudness
n = int(DUR*SR); mus = np.zeros((n, 2)); mus[:min(n, len(music))] = music[:n]
mus *= 10**(-24/20)/np.sqrt((mus**2).mean())
f = int(0.6*SR); mus[-f:] *= np.linspace(1, 0, f)[:, None]**1.5
write("out/music4.wav", mus/np.abs(mus).max()*0.5)                     # the bed alone, for the BC-26 screen
sfx = np.zeros((n, 2))
def place(x, t, g):
    if x.ndim == 1: x = np.stack([x, x], 1)*0.7071
    i = int(round(t*SR)); j = min(n, i+len(x)); sfx[i:j] += x[:j-i]*g
place(whoosh(.45, 300, 1800), CARD, .16); place(kick(), CARD+.25, .30); place(tap(), CARD+1.5, .22)
t = np.arange(n)/SR; g = np.ones(n); dk = 10**(DUCK_DB/20)
for v, t0 in VO:
    a, b = t0-0.15, t0+len(v)/SR+0.1
    w = np.clip(np.minimum((t-(a-0.15))/0.15, ((b+0.35)-t)/0.35), 0, 1); g = np.minimum(g, 1+(dk-1)*w)
mix = mus*g[:, None] + sfx
for v, t0 in VO:
    i0 = int(t0*SR); m = min(len(v), n-i0); mix[i0:i0+m] += v[:m]
write("out/pre.wav", mix/np.abs(mix).max()*0.5)
def measure(p):
    e = subprocess.run(["ffmpeg", "-i", p, "-af", "loudnorm=I=-14:TP=-1:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(e[e.rfind("{"):e.rfind("}")+1]); return float(j["input_i"]), float(j["input_tp"])
gain = 0.0; I, TP = measure("out/pre.wav")
for _ in range(3):
    gain += (-14.0 - I)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/pre.wav", "-af", "volume=%.2fdB,aresample=192000,alimiter=limit=0.87:attack=1:release=60:level=false,aresample=%d" % (gain, SR), "-c:a", "pcm_s16le", "out/mix.wav"], check=True)
    I, TP = measure("out/mix.wav")
    if abs(I+14.0) < 0.3: break
print("mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)" % (I, TP, gain))
