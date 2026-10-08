#!/usr/bin/env python3
"""TripNerd 17th-hole 30s vertical advert, v3 assembly. Usage: python3 build_v3.py shots.json"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

cfg = json.load(open(sys.argv[1]))
W, H, FPS = 1080, 1920, 24
BLUE = (0x58, 0x96, 0xE9)
OUT = cfg.get("out", "v3.mp4")
work = "work"; os.makedirs(work, exist_ok=True)

def run(cmd):
    print("$", " ".join(str(c) for c in cmd)[:300], flush=True)
    subprocess.run([str(c) for c in cmd], check=True)

def has_audio(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_type", "-of", "csv=p=0", path], capture_output=True, text=True)
    return "audio" in r.stdout

def fontpath(fams):
    for fam in fams:
        p = subprocess.run(["fc-match", fam, "--format=%{file}"], capture_output=True, text=True).stdout.strip()
        if p and os.path.exists(p) and ("ontserrat" in p or "etropolis" in p or "DejaVu" in p):
            return p
    return "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_B = fontpath(["Montserrat:extrabold", "Montserrat:bold", "Metropolis:bold", "DejaVuSans:bold"])
FONT_R = fontpath(["Montserrat:semibold", "Montserrat:medium", "Montserrat", "Metropolis", "DejaVuSans"])
print("fonts:", FONT_B, FONT_R)

VF_NORM = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setsar=1,format=yuv420p"
segs_v, segs_a, timeline, t_cursor = [], [], [], 0.0
for i, s in enumerate(cfg["shots"]):
    dur = round(s["out"] - s["in"], 3)
    sv, sa = f"{work}/v{i:02d}.mp4", f"{work}/a{i:02d}.wav"
    run(["ffmpeg", "-v", "error", "-y", "-ss", s["in"], "-t", dur, "-i", s["src"], "-vf", VF_NORM, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-r", FPS, "-pix_fmt", "yuv420p", sv])
    af = [f"volume={s.get('vol', 1.0)}"] + ([f"lowpass=f={s['lp']}"] if s.get("lp") else []) + [f"afade=t=in:st=0:d=0.08,afade=t=out:st={max(dur-0.08,0)}:d=0.08"]
    asrc, ain = s.get("asrc", s["src"]), s.get("ain", s["in"])
    if has_audio(asrc):
        run(["ffmpeg", "-v", "error", "-y", "-ss", ain, "-t", dur, "-i", asrc, "-vn", "-ar", "48000", "-ac", "2", "-af", ",".join(af), sa])
    else:
        run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", dur, "-i", "anullsrc=r=48000:cl=stereo", sa])
    segs_v.append(sv); segs_a.append(sa); timeline.append((round(t_cursor, 2), round(t_cursor + dur, 2), os.path.basename(s["src"]))); t_cursor += dur

# ---- end card
ec = cfg["endcard"]; ec_dur = float(ec.get("dur", 3.0))
img = Image.new("RGB", (W, H), BLUE); d = ImageDraw.Draw(img)
if cfg.get("logo") and os.path.exists(cfg["logo"]):
    logo = Image.open(cfg["logo"]).convert("RGBA"); lw = int(W * 0.74); lh = int(logo.height * lw / logo.width)
    logo = logo.resize((lw, lh), Image.LANCZOS); img.paste(logo, ((W - lw) // 2, int(H * 0.31) - lh // 2), logo)
f1 = ImageFont.truetype(FONT_B, 96); f2 = ImageFont.truetype(FONT_B, 52); f3 = ImageFont.truetype(FONT_R, 44)
def center(txt, y, f, fill=(255, 255, 255)):
    bb = d.textbbox((0, 0), txt, font=f); d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], y), txt, font=f, fill=fill)
center(ec["line1"], int(H * 0.50), f1)
bb = d.textbbox((0, 0), ec["line2"], font=f2); tw = bb[2] - bb[0]
bx0, by0 = (W - tw) // 2 - 52, int(H * 0.605); bx1, by1 = bx0 + tw + 104, by0 + 116
d.rounded_rectangle([bx0, by0, bx1, by1], radius=58, fill=(255, 255, 255)); d.text((bx0 + 52 - bb[0], by0 + 26), ec["line2"], font=f2, fill=BLUE)
center(ec["line3"], int(H * 0.695), f3)
img.save(f"{work}/endcard.png")
sv, sa = f"{work}/v_end.mp4", f"{work}/a_end.wav"
run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", ec_dur, "-i", f"{work}/endcard.png", "-vf", f"fade=t=in:st=0:d=0.35,fps={FPS},format=yuv420p", "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-r", FPS, sv])
run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", ec_dur, "-i", "anullsrc=r=48000:cl=stereo", sa])
segs_v.append(sv); segs_a.append(sa); timeline.append((round(t_cursor, 2), round(t_cursor + ec_dur, 2), "ENDCARD")); t_cursor += ec_dur
print("TIMELINE"); [print(f"  {a:5.2f}-{b:5.2f}  {n}") for a, b, n in timeline]; print("total", round(t_cursor, 2))

# ---- concat video
open(f"{work}/list.txt", "w").write("".join(f"file '{os.path.abspath(p)}'\n" for p in segs_v))
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{work}/list.txt", "-c", "copy", f"{work}/base.mp4"])

# ---- audio: one concatenated bed, ducked under the VO, VO mixed in, normalized, resolved under the end card
inputs, fc = [], []
for j, p in enumerate(segs_a):
    inputs += ["-i", p]; fc.append(f"[{j}:a]")
n = len(segs_a); filt = "".join(fc) + f"concat=n={n}:v=0:a=1[bed0];"
vo_at = float(cfg.get("vo_at", 21.3)); has_vo = bool(cfg.get("vo")) and os.path.exists(cfg["vo"])
if has_vo:
    vo_dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", cfg["vo"]], capture_output=True, text=True).stdout.strip() or 7)
    inputs += ["-i", cfg["vo"]]; duck_end = vo_at + vo_dur + 0.3
    filt += f"[bed0]volume='if(between(t,{vo_at-0.4},{duck_end}),0.38,1)':eval=frame[bed];"
    filt += f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,volume={cfg.get('vo_gain',1.8)},adelay={int(vo_at*1000)}|{int(vo_at*1000)}[vo];"
    filt += "[bed][vo]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mix0];"
else:
    filt += "[bed0]anull[mix0];"
filt += f"[mix0]afade=t=out:st={t_cursor-1.0}:d=1.0,loudnorm=I=-14:TP=-1.0:LRA=11,alimiter=limit=0.85:level=false[aout]"
run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", filt, "-map", "[aout]", "-ar", "48000", "-ac", "2", f"{work}/mix.wav"])

# ---- captions as centered PNG overlays with fades, one grade, grain, mux
cap_inputs, chain, last = [], [], "[0:v]"
for k, c in enumerate(cfg.get("cues", [])):
    size = c.get("size", 60); f = ImageFont.truetype(FONT_B, size)
    lines = c["text"].split("\n"); lh = int(size * 1.18)
    cap = Image.new("RGBA", (W, H), (0, 0, 0, 0)); cd = ImageDraw.Draw(cap)
    y = int(H * c.get("y", 0.62)) - (len(lines) * lh) // 2
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    for li, ln in enumerate(lines):
        bb = cd.textbbox((0, 0), ln, font=f); x = (W - (bb[2] - bb[0])) / 2 - bb[0]
        sd.text((x, y + li * lh + 4), ln, font=f, fill=(0, 0, 0, 170)); cd.text((x, y + li * lh), ln, font=f, fill=(255, 255, 255, 255))
    sh = sh.filter(ImageFilter.GaussianBlur(6)); cap = Image.alpha_composite(sh, cap)
    pth = f"{work}/cap{k}.png"; cap.save(pth); cap_inputs += ["-loop", "1", "-i", pth]
    a, b = c["t0"], c["t1"]; idx = k + 1
    chain.append(f"[{idx}:v]format=rgba,fade=t=in:st={a}:d=0.25:alpha=1,fade=t=out:st={b-0.25}:d=0.25:alpha=1[c{k}];{last}[c{k}]overlay=0:0:enable='between(t,{a},{b})'[o{k}];")
    last = f"[o{k}]"
grade = "eq=contrast=1.04:saturation=0.97,noise=alls=6:allf=t+u,format=yuv420p"
fcx = "".join(chain) + f"{last}{grade}[vout]"
run(["ffmpeg", "-v", "error", "-y", "-i", f"{work}/base.mp4"] + cap_inputs + ["-i", f"{work}/mix.wav", "-filter_complex", fcx, "-map", "[vout]", "-map", f"{len(cfg.get('cues', []))+1}:a",
     "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
     "-r", FPS, "-t", t_cursor, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT])

# ---- QC: probe, loudness, contact sheet
print("PROBE", subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt,color_range", "-of", "csv=p=0", OUT], capture_output=True, text=True).stdout)
ln = subprocess.run(["ffmpeg", "-i", OUT, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print("LOUDNESS", [l.strip() for l in ln.splitlines() if "I:" in l or "Peak:" in l][-2:])
frames, t = [], 0.4
while t < t_cursor:
    fp = f"{work}/qc_{t:05.1f}.jpg"; subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", OUT, "-frames:v", "1", "-vf", "scale=-2:400", fp]); frames.append((t, fp)); t += 1.0
cols, T = 8, 226; rows = (len(frames) + cols - 1) // cols
sheet = Image.new("RGB", (cols * T, rows * 418), "white"); dd = ImageDraw.Draw(sheet); fs = ImageFont.truetype(FONT_R, 14)
for i, (tt, fp) in enumerate(frames):
    if os.path.exists(fp):
        im = Image.open(fp); x, y = (i % cols) * T, (i // cols) * 418; sheet.paste(im, (x + (T - im.width) // 2, y)); dd.text((x + 4, y + 401), f"{tt:.1f}s", fill="black", font=fs)
sheet.save("qc_sheet.jpg", quality=62)
print("DONE", OUT, os.path.getsize(OUT), "qc_sheet.jpg", os.path.getsize("qc_sheet.jpg"))
