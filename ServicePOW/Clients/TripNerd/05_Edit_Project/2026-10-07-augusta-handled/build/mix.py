"""Voice + music mix for 'Augusta, handled' (15.0 s, 48 kHz stereo, -14 LUFS / -1 dBTP).
1. Voice: 4 % faster with pitch kept (atempo 1.04) so the line fits the list beat; trim head/tail silence;
   shorten any comma pause longer than 0.26 s to 0.22 s (cut inside the silence, 15 ms crossfades).
2. Word timestamps (faster-whisper) on the edited voice -> out/ticks.json: the voice start T0 and the
   moment each checklist item is spoken, so assemble.py lands every tick on its word.
3. Music ducked 9 dB under the voice (0.15 s ramps), summed, loudness-normalised with a static gain and
   a true-peak limiter, written to out/mix.wav. Also writes out/vo_edit.wav for the BC-27 check.
Usage: python3 mix.py <music.wav> <voice.wav>"""
import json, subprocess, sys, wave
import numpy as np
SR = 48000; DUR = 15.0; T0 = 5.5; DUCK_DB = -9.0; ATEMPO = 1.04
ITEMS = {"course": 0, "private": 1, "daily": 2, "concierge": 3}
def read(p, af=None):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p] + (["-af", af] if af else []) + ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
def write(p, x):
    st = (np.clip(x, -1, 1)*32767).astype(np.int16)
    with wave.open(p, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
music, voice = read(sys.argv[1]), read(sys.argv[2], "atempo=%.2f" % ATEMPO)
# 1. trim + tighten pauses
hop = int(0.01*SR); env = np.array([np.sqrt((voice[i:i+hop]**2).mean()) for i in range(0, len(voice)-hop, hop)])
db = 20*np.log10(env/env.max()+1e-9); loud = db > -40
first, last = np.argmax(loud), len(loud)-1-np.argmax(loud[::-1])
voice = voice[max(0, first-2)*hop:(last+3)*hop]; db = db[max(0, first-2):last+3]; loud = db > -40
keep, i, XF = [], 0, int(0.015*SR)
runs = []; s = None
for k, v in enumerate(loud):
    if not v and s is None: s = k
    if v and s is not None: runs.append((s, k)); s = None
cuts = [(a, b) for a, b in runs if (b-a)*0.01 > 0.26]
out = np.zeros((0, 2)); pos = 0
for a, b in cuts:
    keep_len = int(0.22*SR); mid_a = a*hop + keep_len//2; mid_b = b*hop - keep_len//2
    seg = voice[pos:mid_a]
    if len(out) and len(seg) > XF:
        r = np.linspace(0, 1, XF)[:, None]; out[-XF:] = out[-XF:]*(1-r) + seg[:XF]*r; seg = seg[XF:]
    out = np.vstack([out, seg]); pos = mid_b - XF
tail = voice[pos:]
if len(out) and len(tail) > XF:
    r = np.linspace(0, 1, XF)[:, None]; out[-XF:] = out[-XF:]*(1-r) + tail[:XF]*r; tail = tail[XF:]
voice = np.vstack([out, tail]); VD = len(voice)/SR
voice *= 10**(-18/20)/np.sqrt((voice**2).mean())                       # voice RMS -18 dBFS
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
json.dump({"T0": T0, "voice_dur": round(VD, 3), "ticks": ticks, "transcript": transcript, "pauses_cut": len(cuts)}, open("out/ticks.json", "w"), indent=1)
print("voice", round(VD, 3), "s; ticks", ticks, "|", transcript)
# 3. duck, sum, loudness
n = int(DUR*SR); mus = np.zeros((n, 2)); mus[:min(n, len(music))] = music[:n]
mus *= 10**(-24/20)/np.sqrt((mus**2).mean())                           # music RMS -24 dBFS before ducking
t = np.arange(n)/SR; a, b = T0-0.15, T0+VD+0.1
g = np.ones(n); dk = 10**(DUCK_DB/20)
inside = (t >= a) & (t <= b); g[inside] = dk
ra = (t > a-0.15) & (t < a); g[ra] = 1+(dk-1)*(t[ra]-(a-0.15))/0.15
rb = (t > b) & (t < b+0.35); g[rb] = dk+(1-dk)*(t[rb]-b)/0.35
mix = mus*g[:, None]; i0 = int(T0*SR); mix[i0:i0+len(voice)] += voice[:n-i0]
write("out/pre.wav", mix/np.abs(mix).max()*0.5)
def measure(p):
    e = subprocess.run(["ffmpeg", "-i", p, "-af", "loudnorm=I=-14:TP=-1:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(e[e.rfind("{"):e.rfind("}")+1]); return float(j["input_i"]), float(j["input_tp"])
gain = 0.0; I, TP = measure("out/pre.wav")
for _ in range(3):
    gain += (-14.0 - I)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/pre.wav", "-af", "volume=%.2fdB,aresample=192000,alimiter=limit=0.891:attack=1:release=60:level=false,aresample=%d" % (gain, SR), "-c:a", "pcm_s16le", "out/mix.wav"], check=True)
    I, TP = measure("out/mix.wav")
    if abs(I+14.0) < 0.3: break
print("mix: %.2f LUFS, TP %.2f dBTP (static gain %.2f dB)" % (I, TP, gain))
