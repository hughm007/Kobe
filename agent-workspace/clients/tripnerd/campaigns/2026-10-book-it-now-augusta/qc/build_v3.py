#!/usr/bin/env python3
"""TripNerd 'Book It Now' (Augusta) Reel v3 DRAFT.
Beats 1-4 are unchanged from v2 (imported). The real section is rebuilt from the 2026-10-06 "watching view" scan:
  b5 P155  under the veranda, out to the hospitality lawn and course      "TripNerd hosted"
  b6 P035  brick colonial house (crop x0=0 keeps the event flag by the door out of frame)   "Private executive home"
  b7 P115  hospitality lawn, lounges facing the course                    "Daily hospitality"
  b8 P150  macarons (venue card blurred: names the venue, permission pending)   "Food & drink included"
  b9 P139  guests along the fence at dusk, seen from behind               "Way better than the couch."
Replaces v2's face-on bartender (IMG_1932), condiment station (IMG_2034) and face-on lawn guests (IMG_2036).
All real photos: originals, 9:16 crops are downscale only (1152x2048 -> 1080x1920), push <= 1.06. No AI anywhere in b5-b9."""
import sys, json, hashlib, subprocess, wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageDraw

WD = Path(__file__).resolve().parent
sys.path.insert(0, str(WD))
import build_v2 as B                                    # beats 1-4, DM UI, super_, push_frame, end card

SP = B.SP; P26 = SP / "augusta_scan/p2026"; FR = WD / "frames_v3"; OUT = WD / "out"; QC = WD / "qc"
for p in (FR, OUT, QC): p.mkdir(exist_ok=True)
W, H, FPS = B.W, B.H, B.FPS

def real(name, x0, blur_boxes=()):
    """EXIF-correct original -> 9:16 window (full height). blur_boxes are source px (x0,y0,x1,y1,radius), feathered."""
    im = ImageOps.exif_transpose(Image.open(P26 / name)).convert("RGB")
    cw = int(round(im.height * 9 / 16)); assert x0 + cw <= im.width, (name, x0, cw, im.size)
    for (bx0, by0, bx1, by1, r) in blur_boxes:
        blurred = im.filter(ImageFilter.GaussianBlur(r))
        m = Image.new("L", im.size, 0); ImageDraw.Draw(m).rounded_rectangle([bx0, by0, bx1, by1], 24, fill=255)
        m = m.filter(ImageFilter.GaussianBlur(18))     # feathered edge, reads as depth of field, not a block
        im = Image.composite(blurred, im, m)
    c = im.crop((x0, 0, x0 + cw, im.height))
    assert c.width >= W and c.height >= H, "would upscale"
    return c, (x0, 0, x0 + cw, im.height)

REAL = {
 "b5": real("TN_2026-04-11_masters-week_P155.jpg", 192),
 "b6": real("TN_2026-04-10_masters-week_P035.jpg", 0),                                   # flag sits at x>=1270: out of frame
 "b7": real("TN_2026-04-09_masters-week_P115.jpg", 384),
 "b8": real("TN_2026-04-11_masters-week_P150.jpg", 300, [(450, 115, 835, 405, 22), (995, 185, 1085, 345, 16)]),
 "b9": real("TN_2026-04-10_masters-week_P139.jpg", 192),
}
FOCUS = {"b5": (0.5, 0.55), "b6": (0.45, 0.55), "b7": (0.5, 0.6), "b8": (0.5, 0.65), "b9": (0.5, 0.6)}
CAP = {"b5": "TripNerd hosted", "b6": "Private executive home", "b7": "Daily hospitality",
       "b8": "Food & drink included", "b9": "Way better than the couch."}
T = [("b1", 0.0, 2.2), ("b2", 2.2, 3.8), ("b3", 3.8, 7.8), ("b4", 7.8, 9.0),
     ("b5", 9.0, 10.8), ("b6", 10.8, 12.6), ("b7", 12.6, 14.4), ("b8", 14.4, 16.0), ("b9", 16.0, 18.4), ("b10", 18.4, 21.4)]
DUR = 21.4

def frame_at(t):
    for name, a, b in T:
        if a <= t < b: u = (t - a) / (b - a); break
    else: name, u = "b10", 1.0
    if name in ("b1", "b2", "b3", "b4"):
        return B.frame_at(t)                           # v2 timings are identical for 0-9.0 s
    if name in REAL:
        im = B.push_frame(REAL[name][0], u, 1.0, 1.06, FOCUS[name]); B.super_(im, CAP[name], 300, 60); return im
    return B.END

def audio(path, dur):
    sr = 48000; n = int(sr * dur); rng = np.random.default_rng(7); x = np.zeros(n)
    brown = np.cumsum(rng.normal(0, 1, n)); brown -= np.convolve(brown, np.ones(4800) / 4800, "same"); brown /= np.abs(brown).max() + 1e-9
    room = np.convolve(brown, np.ones(24) / 24, "same"); room = room / (np.abs(room).max() + 1e-9) * 0.012
    def env(a, b, fade=0.05):
        e = np.zeros(n); i0, i1 = int(a * sr), int(b * sr); e[i0:i1] = 1
        k = int(fade * sr); e[i0:i0 + k] *= np.linspace(0, 1, k); e[i1 - k:i1] *= np.linspace(1, 0, k); return e
    x += room * env(0, 9.0) + room * 0.6 * env(18.4, dur)
    pink = np.cumsum(rng.normal(0, 1, n)); pink -= np.convolve(pink, np.ones(2400) / 2400, "same")
    pink = np.convolve(pink, np.ones(12) / 12, "same"); pink /= np.abs(pink).max() + 1e-9
    x += pink * 0.015 * env(9.0, 18.4, 0.25)            # soft outdoor air (synthetic, no voices)
    def blip(t0, f0, f1, d, amp):
        i0 = int(t0 * sr); m = int(d * sr); tt = np.arange(m) / sr; f = np.linspace(f0, f1, m)
        s = np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-tt * 18) * amp; x[i0:i0 + m] += s[:max(0, min(m, n - i0))]
    for i in range(7): blip(2.3 + i * 0.13, 1800, 1700, 0.04, 0.12)
    blip(3.3, 400, 1400, 0.25, 0.18); blip(4.3, 1320, 1320, 0.35, 0.22); blip(4.42, 1760, 1760, 0.35, 0.18)
    blip(8.45, 900, 600, 0.08, 0.3); blip(20.6, 1320, 1320, 0.3, 0.12)
    x = np.clip(x, -1, 1); pcm = (x * 32767 * 0.8).astype(np.int16)
    with wave.open(str(path), "wb") as w_: w_.setnchannels(1); w_.setsampwidth(2); w_.setframerate(sr); w_.writeframes(pcm.tobytes())

if __name__ == "__main__":
    nfr = int(round(DUR * FPS))
    for i in range(nfr):
        frame_at(i / FPS).save(FR / f"f{i:04d}.png", compress_level=1)
    wav = OUT / "temp_audio_v3.wav"; audio(wav, DUR)
    mp4 = OUT / "TN-book-it-now-augusta-v3-DRAFT.mp4"
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(wav), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(FR / "f%04d.png"), "-i", str(wav),
                    "-c:v", "libx264", "-preset", "slow", "-b:v", "16M", "-maxrate", "18M", "-bufsize", "36M", "-pix_fmt", "yuv420p",
                    "-af", ln + ",aformat=channel_layouts=stereo", "-ac", "2", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
                    "-shortest", "-movflags", "+faststart", str(mp4)], check=True)
    rec = {"master": mp4.name, "sha256": hashlib.sha256(mp4.read_bytes()).hexdigest(), "frames": nfr, "duration_s": DUR,
           "timeline": T, "captions": CAP, "real": {k: {"box": v[1]} for k, v in REAL.items()},
           "scrubs": {"b8": "venue dessert card(s) feathered-blurred (names the venue; permission pending)"},
           "beats_1_4": "unchanged from v2 (build_v2.py)"}
    (QC / "build-v3.json").write_text(json.dumps(rec, indent=1)); print(json.dumps(rec, indent=1))
