#!/usr/bin/env python3
"""TripNerd 17th-hole vertical advert, v5 assembly: shots + end card, one bed, multiple placed audio tracks (commentator, roar, end-card voice), captions. Usage: python3 build_v5.py shots.json"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
cfg = json.load(open(sys.argv[1])); W, H, FPS = 1080, 1920, 24; BLUE = (0x58, 0x96, 0xE9)
OUT = cfg.get("out", "v5.mp4"); work = cfg.get("work", "work"); os.makedirs(work, exist_ok=True)
def run(cmd):
    print("$", " ".join(str(c) for c in cmd)[:240], flush=True); subprocess.run([str(c) for c in cmd], check=True)
def probe_dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip() or 0)
def has_audio(p):
    return "audio" in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_type", "-of", "csv=p=0", p], capture_output=True, text=True).stdout
def fontpath(fams):
    for fam in fams:
        p = subprocess.run(["fc-match", fam, "--format=%{file}"], capture_output=True, text=True).stdout.strip()
        if p and os.path.exists(p) and ("ontserrat" in p or "etropolis" in p or "DejaVu" in p): return p
    return "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_B = fontpath(["Montserrat:extrabold", "Montserrat:bold", "Metropolis:bold", "DejaVuSans:bold"]); FONT_R = fontpath(["Montserrat:semibold", "Montserrat:medium", "Montserrat", "DejaVuSans"])
VF = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setsar=1,format=yuv420p"
segs_v, segs_a, timeline, t = [], [], [], 0.0
for i, s in enumerate(cfg["shots"]):
    dur = round(s["out"] - s["in"], 3); sv, sa = f"{work}/v{i:02d}.mp4", f"{work}/a{i:02d}.wav"
    run(["ffmpeg", "-v", "error", "-y", "-ss", s["in"], "-t", dur, "-i", s["src"], "-vf", VF, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-r", FPS, "-pix_fmt", "yuv420p", sv])
    af = [f"volume={s.get('vol', 1.0)}"] + ([f"lowpass=f={s['lp']}"] if s.get("lp") else []) + [f"afade=t=in:st=0:d=0.08,afade=t=out:st={max(dur-0.08,0)}:d=0.08"]
    asrc, ain = s.get("asrc", s["src"]), s.get("ain", s["in"])
    if s.get("mute") or not has_audio(asrc): run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", dur, "-i", "anullsrc=r=48000:cl=stereo", sa])
    else: run(["ffmpeg", "-v", "error", "-y", "-ss", ain, "-t", dur, "-i", asrc, "-vn", "-ar", "48000", "-ac", "2", "-af", ",".join(af), sa])
    segs_v.append(sv); segs_a.append(sa); timeline.append((round(t, 2), round(t + dur, 2), os.path.basename(s["src"]))); t += dur
ec = cfg["endcard"]; ec_dur = float(ec.get("dur", 3.0))
img = Image.new("RGB", (W, H), BLUE); d = ImageDraw.Draw(img)
if cfg.get("logo") and os.path.exists(cfg["logo"]):
    logo = Image.open(cfg["logo"]).convert("RGBA"); lw = int(W * 0.74); lh = int(logo.height * lw / logo.width); logo = logo.resize((lw, lh), Image.LANCZOS); img.paste(logo, ((W - lw) // 2, int(H * 0.31) - lh // 2), logo)
f1 = ImageFont.truetype(FONT_B, 96); f2 = ImageFont.truetype(FONT_B, 52); f3 = ImageFont.truetype(FONT_R, 44)
def center(txt, y, f, fill=(255, 255, 255)):
    bb = d.textbbox((0, 0), txt, font=f); d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], y), txt, font=f, fill=fill)
center(ec["line1"], int(H * 0.50), f1)
bb = d.textbbox((0, 0), ec["line2"], font=f2); tw = bb[2] - bb[0]; bx0, by0 = (W - tw) // 2 - 52, int(H * 0.605)
d.rounded_rectangle([bx0, by0, bx0 + tw + 104, by0 + 116], radius=58, fill=(255, 255, 255)); d.text((bx0 + 52 - bb[0], by0 + 26), ec["line2"], font=f2, fill=BLUE)
center(ec["line3"], int(H * 0.695), f3); img.save(f"{work}/endcard.png")
sv, sa = f"{work}/v_end.mp4", f"{work}/a_end.wav"
run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", ec_dur, "-i", f"{work}/endcard.png", "-vf", f"fade=t=in:st=0:d=0.35,fps={FPS},format=yuv420p", "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-r", FPS, sv])
run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", ec_dur, "-i", "anullsrc=r=48000:cl=stereo", sa])
segs_v.append(sv); segs_a.append(sa); timeline.append((round(t, 2), round(t + ec_dur, 2), "ENDCARD")); t += ec_dur
print("TIMELINE"); [print(f"  {a:5.2f}-{b:5.2f}  {n}") for a, b, n in timeline]; print("total", round(t, 2))
open(f"{work}/list.txt", "w").write("".join(f"file '{os.path.abspath(p)}'\n" for p in segs_v))
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{work}/list.txt", "-c", "copy", f"{work}/base.mp4"])
# ---- audio: bed = concatenated shot audio, ducked under speech tracks; placed tracks mixed in; resolve; normalise
inputs, fc = [], []
for j, p in enumerate(segs_a): inputs += ["-i", p]; fc.append(f"[{j}:a]")
n = len(segs_a); filt = "".join(fc) + f"concat=n={n}:v=0:a=1[bed0];"
tracks = [tr for tr in cfg.get("tracks", []) if os.path.exists(tr["src"])]
duck = float(cfg.get("duck", 0.4)); ivals = []
for tr in tracks:
    if tr.get("duck", True): ivals.append((tr["at"] - 0.1, tr["at"] + probe_dur(tr["src"]) + 0.15))
if ivals: filt += "[bed0]volume='if(" + "+".join(f"between(t,{a:.2f},{b:.2f})" for a, b in ivals) + f",{duck},1)':eval=frame[bed];"
else: filt += "[bed0]anull[bed];"
labels = ["[bed]"]
for k, tr in enumerate(tracks):
    idx = n + k; inputs += ["-i", tr["src"]]; dur = probe_dur(tr["src"]); ms = int(tr["at"] * 1000)
    chain = f"aresample=48000,aformat=channel_layouts=stereo,volume={tr.get('gain', 1.0)}"
    if tr.get("fade_in"): chain += f",afade=t=in:st=0:d={tr['fade_in']}"
    if tr.get("fade_out"): chain += f",afade=t=out:st={max(dur - tr['fade_out'], 0):.2f}:d={tr['fade_out']}"
    if tr.get("lp"): chain += f",lowpass=f={tr['lp']}"
    if tr.get("ducked") and ivals: chain += "," + "volume='if(" + "+".join(f"between(t,{a - tr['at']:.2f},{b - tr['at']:.2f})" for a, b in ivals) + f",{duck},1)':eval=frame"
    filt += f"[{idx}:a]{chain},adelay={ms}|{ms}[t{k}];"; labels.append(f"[t{k}]")
filt += "".join(labels) + f"amix=inputs={len(labels)}:duration=first:dropout_transition=0:normalize=0[mix0];"
filt += f"[mix0]afade=t=out:st={t-1.0:.2f}:d=1.0,loudnorm=I=-14:TP=-1.0:LRA=11,alimiter=limit=0.85:level=false[aout]"
run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", filt, "-map", "[aout]", "-ar", "48000", "-ac", "2", f"{work}/mix.wav"])
# ---- captions, grade (no grain), mux
cap_inputs, chain, last = [], [], "[0:v]"
for k, c in enumerate(cfg.get("cues", [])):
    size = c.get("size", 60); f = ImageFont.truetype(FONT_B, size); lines = c["text"].split("\n"); lh = int(size * 1.18)
    cap = Image.new("RGBA", (W, H), (0, 0, 0, 0)); cd = ImageDraw.Draw(cap); y = int(H * c.get("y", 0.62)) - (len(lines) * lh) // 2
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    for li, ln in enumerate(lines):
        bb = cd.textbbox((0, 0), ln, font=f); x = (W - (bb[2] - bb[0])) / 2 - bb[0]
        sd.text((x, y + li * lh + 4), ln, font=f, fill=(0, 0, 0, 170)); cd.text((x, y + li * lh), ln, font=f, fill=(255, 255, 255, 255))
    cap = Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)), cap); pth = f"{work}/cap{k}.png"; cap.save(pth); cap_inputs += ["-loop", "1", "-i", pth]
    a, b = c["t0"], c["t1"]; idx = k + 1
    chain.append(f"[{idx}:v]format=rgba,fade=t=in:st={a}:d=0.25:alpha=1,fade=t=out:st={b-0.25}:d=0.25:alpha=1[c{k}];{last}[c{k}]overlay=0:0:enable='between(t,{a},{b})'[o{k}];"); last = f"[o{k}]"
fcx = "".join(chain) + f"{last}eq=contrast=1.03:saturation=0.98,format=yuv420p[vout]"
run(["ffmpeg", "-v", "error", "-y", "-i", f"{work}/base.mp4"] + cap_inputs + ["-i", f"{work}/mix.wav", "-filter_complex", fcx, "-map", "[vout]", "-map", f"{len(cfg.get('cues', []))+1}:a", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-r", FPS, "-t", t, "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", OUT])
print("PROBE", subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt,color_range", "-of", "csv=p=0", OUT], capture_output=True, text=True).stdout)
ln = subprocess.run(["ffmpeg", "-i", OUT, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print("LOUDNESS", [l.strip() for l in ln.splitlines() if "I:" in l or "Peak:" in l][-2:])
frames, tt = [], 0.4
while tt < t:
    fp = f"{work}/qc_{tt:05.1f}.jpg"; subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(tt), "-i", OUT, "-frames:v", "1", "-vf", "scale=-2:400", fp]); frames.append((tt, fp)); tt += 1.0
cols, T = 8, 226; rows = (len(frames) + cols - 1) // cols; sheet = Image.new("RGB", (cols * T, rows * 418), "white"); dd = ImageDraw.Draw(sheet); fs = ImageFont.truetype(FONT_R, 14)
for i, (q, fp) in enumerate(frames):
    if os.path.exists(fp): im = Image.open(fp); x, y = (i % cols) * T, (i // cols) * 418; sheet.paste(im, (x + (T - im.width) // 2, y)); dd.text((x + 4, y + 401), f"{q:.1f}s", fill="black", font=fs)
sheet.save(cfg.get("qc", "qc.jpg"), quality=62); print("DONE", OUT, os.path.getsize(OUT))
