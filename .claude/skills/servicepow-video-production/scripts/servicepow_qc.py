#!/usr/bin/env python3
"""servicepow_qc.py — the machine QC harness (blocking checks 1-15, 29-31 enforcement side).

REBUILT 2026-08-26 from the documented thresholds in
agent-workspace/playbooks/ads/references/measurement.md (imported from ad-producer v4.0).
The original script (v1.6) was never recovered; this is a clean-room rebuild of the same
gates. Where the original's internal algorithm is unknown (the edge-travel motion measure),
the rebuilt measure is documented below and its thresholds stay PROVISIONAL until re-anchored
on scored clips. INDETERMINATE is not a pass, here as before.

Usage (unchanged from the documented interface):
  python3 servicepow_qc.py --preflight
  python3 servicepow_qc.py clip1.mp4 clip2.mp4                    # source clips
  python3 servicepow_qc.py final.mp4 --master --sheet             # edited master
  python3 servicepow_qc.py --gate-clips clip*.mp4                 # md5 ledger gate
  python3 servicepow_qc.py --gate-clips clip.mp4 --accept-indeterminate "Karl"
  python3 servicepow_qc.py clip.mp4 --calm                        # storyboard-declared calm beat
  python3 servicepow_qc.py final.mp4 --master --aspect 9:16 --duration 17 \
      --expect "480-992-3541" --expect "ROC 366870"

Thresholds (from measurement.md — change only with owner sign-off + a validation run):
  motion floor        edge travel >= 1.6 px/frame   (PROVISIONAL, n=2; calm beats: 0.6)
  freeze              no section > 0.7 s            (endcard exempt via --endcard N)
  resolution          min dimension >= 1080
  fps                 >= 23.9 (24fps family)
  pix_fmt (masters)   yuv420p
  audio (masters)     48000 Hz / 2 ch
  audio peak          max <= -0.5 dB, mean > -45 dB
  black               no section >= 0.3 s
  flash cuts (master) no shot < 0.4 s (scene-detect; frame-check a FAIL on whip-heavy edits)
  aspect / duration   +/- 2% vs declared
  hook motion (master)first 1.2 s edge travel >= 1.0 (WARN, not a block)

Rebuilt motion measure: frames are decoded at analysis rate (12 fps) to grayscale 160px-wide
arrays; per frame-pair, global displacement is estimated by FFT phase correlation on gradient
(edge) maps and scaled back to native pixels; per-clip score = mean displacement. Frames whose
edge density is below the featureless floor make the clip INDETERMINATE (fog/sky/black), never
a pass. Near-floor scores (within 25% of the floor) are also INDETERMINATE - the rebuilt
measure has not been cross-anchored against the original's two reference clips.

Exit codes: 0 all gates pass · 1 any FAIL (the file is dead until fixed and re-run) ·
2 INDETERMINATE present and not accepted by a named human.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ANALYSIS_FPS = 12
ANALYSIS_WIDTH = 160
MOTION_FLOOR = 1.6          # PROVISIONAL (n=2)
CALM_FLOOR = 0.6
INDET_BAND = 0.25           # within 25% of floor -> INDETERMINATE (uncross-anchored rebuild)
EDGE_DENSITY_FLOOR = 0.01   # fraction of pixels that are edges; below = featureless
FREEZE_MAX_S = 0.7
FREEZE_DIFF_EPS = 0.35      # mean abs luma diff (0-255) below which frames count as identical
BLACK_MAX_S = 0.3
BLACK_LUMA = 16.0
FLASH_CUT_MIN_S = 0.4
SCENE_DIFF_MULT = 6.0       # a cut = frame diff > mult * rolling median diff
MIN_HEIGHT = 1080
MIN_FPS = 23.9
PEAK_MAX_DB = -0.5
MEAN_MIN_DB = -45.0
HOOK_WINDOW_S = 1.2
HOOK_FLOOR = 1.0
TOL_PCT = 0.02

LEDGER = Path(__file__).resolve().parent / "servicepow_clip_ledger.jsonl"


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def ffprobe(path: str) -> dict:
    p = run(["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_streams", "-show_format", path])
    if p.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {path}: {p.stderr.strip()[:200]}")
    return json.loads(p.stdout)


def video_stream(meta: dict) -> dict | None:
    for s in meta.get("streams", []):
        if s.get("codec_type") == "video":
            return s
    return None


def audio_stream(meta: dict) -> dict | None:
    for s in meta.get("streams", []):
        if s.get("codec_type") == "audio":
            return s
    return None


def parse_fps(stream: dict) -> float:
    for key in ("avg_frame_rate", "r_frame_rate"):
        raw = stream.get(key, "0/0")
        try:
            num, den = raw.split("/")
            if float(den):
                return float(num) / float(den)
        except (ValueError, ZeroDivisionError):
            continue
    return 0.0


def decode_gray(path: str, fps: int = ANALYSIS_FPS, width: int = ANALYSIS_WIDTH,
                t_end: float | None = None):
    """Decode to grayscale numpy frames at analysis rate. Returns (frames, height, native_w)."""
    import numpy as np
    meta = ffprobe(path)
    vs = video_stream(meta)
    if vs is None:
        return None, 0, 0
    native_w = int(vs.get("width", 0))
    scale_h = max(2, round(width * int(vs.get("height", 1)) / max(1, native_w)) // 2 * 2)
    cmd = ["ffmpeg", "-v", "error", "-i", path]
    if t_end:
        cmd += ["-t", f"{t_end}"]
    cmd += ["-vf", f"fps={fps},scale={width}:{scale_h}",
            "-pix_fmt", "gray", "-f", "rawvideo", "-"]
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode != 0 or not p.stdout:
        return None, 0, 0
    n = len(p.stdout) // (width * scale_h)
    frames = np.frombuffer(p.stdout[: n * width * scale_h], dtype=np.uint8)
    return frames.reshape(n, scale_h, width).astype(np.float32), scale_h, native_w


def edge_map(frame):
    import numpy as np
    gy, gx = np.gradient(frame)
    mag = np.hypot(gx, gy)
    return mag


def phase_shift(a, b) -> float:
    """Global translation magnitude between two edge maps via phase correlation."""
    import numpy as np
    fa, fb = np.fft.rfft2(a), np.fft.rfft2(b)
    cross = fa * np.conj(fb)
    denom = np.abs(cross)
    denom[denom == 0] = 1e-9
    corr = np.fft.irfft2(cross / denom, s=a.shape)
    dy, dx = np.unravel_index(np.argmax(corr), corr.shape)
    if dy > a.shape[0] // 2:
        dy -= a.shape[0]
    if dx > a.shape[1] // 2:
        dx -= a.shape[1]
    return math.hypot(dx, dy)


def motion_score(path: str, t_end: float | None = None):
    """Returns (mean edge-travel px/frame at native scale, mean edge density) or (None, None)."""
    import numpy as np
    frames, h, native_w = decode_gray(path, t_end=t_end)
    if frames is None or len(frames) < 3:
        return None, None
    scale = native_w / ANALYSIS_WIDTH if native_w else 1.0
    edges = [edge_map(f) for f in frames]
    density = float(np.mean([(e > 20.0).mean() for e in edges]))
    travels, diffs = [], []
    for i in range(1, len(frames)):
        diffs.append(float(np.abs(frames[i] - frames[i - 1]).mean()))
        travels.append(phase_shift(edges[i - 1], edges[i]) * scale)
    # phase correlation reports 0 for pure content change; blend in residual diff motion
    # so subject-only movement (static camera) still registers.
    blended = [max(t, d / 4.0) for t, d in zip(travels, diffs)]
    return float(np.mean(blended)), density


def freeze_and_black(path: str, endcard_exempt_s: float = 0.0):
    import numpy as np
    frames, h, _ = decode_gray(path)
    if frames is None or len(frames) < 2:
        return None
    dt = 1.0 / ANALYSIS_FPS
    total = len(frames) * dt
    cutoff = total - endcard_exempt_s
    freezes, blacks = [], []
    run_f = run_b = 0
    for i in range(1, len(frames)):
        t = i * dt
        d = float(np.abs(frames[i] - frames[i - 1]).mean())
        if d < FREEZE_DIFF_EPS and t <= cutoff:
            run_f += 1
        else:
            if run_f * dt > FREEZE_MAX_S:
                freezes.append(((i - run_f) * dt, run_f * dt))
            run_f = 0
        if float(frames[i].mean()) < BLACK_LUMA and t <= cutoff:
            run_b += 1
        else:
            if run_b * dt >= BLACK_MAX_S:
                blacks.append(((i - run_b) * dt, run_b * dt))
            run_b = 0
    if run_f * dt > FREEZE_MAX_S:
        freezes.append(((len(frames) - run_f) * dt, run_f * dt))
    if run_b * dt >= BLACK_MAX_S:
        blacks.append(((len(frames) - run_b) * dt, run_b * dt))
    return {"freezes": freezes, "blacks": blacks, "duration": total}


def shot_lengths(path: str):
    """Scene cuts via frame-diff spikes; returns list of shot lengths in seconds."""
    import numpy as np
    frames, _, _ = decode_gray(path)
    if frames is None or len(frames) < 4:
        return None
    dt = 1.0 / ANALYSIS_FPS
    diffs = [float(np.abs(frames[i] - frames[i - 1]).mean()) for i in range(1, len(frames))]
    med = float(np.median(diffs)) or 0.1
    cuts = [0.0]
    for i, d in enumerate(diffs):
        if d > SCENE_DIFF_MULT * med and d > 8.0:
            t = (i + 1) * dt
            if t - cuts[-1] > dt:
                cuts.append(t)
    cuts.append(len(frames) * dt)
    return [b - a for a, b in zip(cuts, cuts[1:])], len(cuts) - 2


def audio_levels(path: str):
    p = run(["ffmpeg", "-v", "info", "-i", path, "-af", "volumedetect",
             "-f", "null", "-"])
    out = p.stderr
    mean = peak = None
    for line in out.splitlines():
        if "mean_volume:" in line:
            mean = float(line.split("mean_volume:")[1].split("dB")[0])
        if "max_volume:" in line:
            peak = float(line.split("max_volume:")[1].split("dB")[0])
    return mean, peak


def contact_sheet(path: str) -> str:
    out = str(Path(path).with_suffix("")) + "_sheet.jpg"
    run(["ffmpeg", "-v", "error", "-y", "-i", path,
         "-vf", "fps=2,scale=320:-2,tile=4x4", "-frames:v", "1", out])
    return out if Path(out).exists() else ""


class Row:
    def __init__(self, check: str, verdict: str, detail: str):
        self.check, self.verdict, self.detail = check, verdict, detail


def check_file(path: str, master: bool, calm: bool, aspect: str | None,
               duration: float | None, expects: list[str],
               endcard: float, sheet: bool) -> tuple[list[Row], str]:
    rows: list[Row] = []
    meta = ffprobe(path)
    vs = video_stream(meta)
    if vs is None:
        return [Row("container", "FAIL", "no video stream")], "FAIL"
    w, h = int(vs.get("width", 0)), int(vs.get("height", 0))
    fps = parse_fps(vs)
    pix = vs.get("pix_fmt", "?")
    dur = float(meta.get("format", {}).get("duration", 0.0))

    rows.append(Row("resolution", "PASS" if min(w, h) >= MIN_HEIGHT else "FAIL",
                    f"{w}x{h} (min dim >= {MIN_HEIGHT})"))
    rows.append(Row("fps", "PASS" if fps >= MIN_FPS else "FAIL", f"{fps:.3f}"))
    if master:
        rows.append(Row("pix_fmt", "PASS" if pix == "yuv420p" else "FAIL", pix))
        aud = audio_stream(meta)
        if aud is None:
            rows.append(Row("audio-48k-stereo", "FAIL", "no audio stream"))
        else:
            ok = int(aud.get("sample_rate", 0)) == 48000 and int(aud.get("channels", 0)) == 2
            rows.append(Row("audio-48k-stereo", "PASS" if ok else "FAIL",
                            f"{aud.get('sample_rate')} Hz / {aud.get('channels')} ch"))
        mean, peak = audio_levels(path)
        if mean is None:
            rows.append(Row("audio-peak/not-silent", "FAIL", "volumedetect produced nothing"))
        else:
            ok = peak <= PEAK_MAX_DB and mean > MEAN_MIN_DB
            rows.append(Row("audio-peak/not-silent", "PASS" if ok else "FAIL",
                            f"peak {peak} dB (<= {PEAK_MAX_DB}), mean {mean} dB (> {MEAN_MIN_DB})"))

    fb = freeze_and_black(path, endcard_exempt_s=endcard if master else 0.0)
    if fb is None:
        rows.append(Row("no-frozen-sections", "INDETERMINATE", "decode failed"))
    else:
        rows.append(Row("no-frozen-sections", "FAIL" if fb["freezes"] else "PASS",
                        f"{[f'{a:.1f}s+{b:.1f}s' for a, b in fb['freezes']] or 'none > 0.7s'}"))
        rows.append(Row("no-black-sections", "FAIL" if fb["blacks"] else "PASS",
                        f"{[f'{a:.1f}s+{b:.1f}s' for a, b in fb['blacks']] or 'none >= 0.3s'}"))

    score, density = motion_score(path)
    floor = CALM_FLOOR if calm else MOTION_FLOOR
    if score is None:
        rows.append(Row("motion-gate", "INDETERMINATE", "could not measure"))
    elif density is not None and density < EDGE_DENSITY_FLOOR:
        rows.append(Row("motion-gate", "INDETERMINATE",
                        f"featureless frames (edge density {density:.3f}) — unmeasurable is not measured-and-passing"))
    elif score < floor:
        rows.append(Row("motion-gate", "FAIL",
                        f"edge travel {score:.2f} px/frame < floor {floor} (PROVISIONAL)"))
    elif score < floor * (1 + INDET_BAND):
        rows.append(Row("motion-gate", "INDETERMINATE",
                        f"{score:.2f} px/frame is within 25% of the floor {floor} — rebuilt measure is not cross-anchored; needs human eyes"))
    else:
        rows.append(Row("motion-gate", "PASS", f"edge travel {score:.2f} px/frame >= {floor}"))

    if master:
        hook, hdens = motion_score(path, t_end=HOOK_WINDOW_S)
        if hook is None or (hdens is not None and hdens < EDGE_DENSITY_FLOOR):
            rows.append(Row("hook-motion", "WARN", "unmeasurable first 1.2s"))
        else:
            rows.append(Row("hook-motion", "PASS" if hook >= HOOK_FLOOR else "WARN",
                            f"first {HOOK_WINDOW_S}s edge travel {hook:.2f} (floor {HOOK_FLOOR}, WARN only)"))
        sl = shot_lengths(path)
        if sl is None:
            rows.append(Row("no-flash-cuts", "INDETERMINATE", "decode failed"))
        else:
            lengths, ncuts = sl
            fast = [l for l in lengths if l < FLASH_CUT_MIN_S]
            rows.append(Row("no-flash-cuts", "FAIL" if fast else "PASS",
                            f"{ncuts} detected cuts; shots < {FLASH_CUT_MIN_S}s: {len(fast)} "
                            "(scene-detect — frame-check before trusting a FAIL on a whip-heavy edit)"))
    else:
        sl = shot_lengths(path)
        if sl is not None:
            _, ncuts = sl
            rows.append(Row("oner-check", "PASS" if ncuts == 0 else "WARN",
                            f"{ncuts} model-inserted cut(s) detected" if ncuts else "no inserted cuts"))

    if aspect:
        try:
            aw, ah = (float(x) for x in aspect.split(":"))
            want, got = aw / ah, w / h
            ok = abs(got - want) / want <= TOL_PCT
            rows.append(Row("aspect", "PASS" if ok else "FAIL", f"declared {aspect}, got {w}x{h}"))
        except ValueError:
            rows.append(Row("aspect", "FAIL", f"bad --aspect {aspect!r}"))
    if duration:
        ok = abs(dur - duration) / duration <= TOL_PCT
        rows.append(Row("duration", "PASS" if ok else "FAIL",
                        f"declared {duration}s, got {dur:.2f}s (+/-2%)"))
    if expects:
        try:
            found = ocr_all_text(path)
            for exp in expects:
                ok = exp.replace(" ", "") in found
                rows.append(Row(f"expect:{exp}", "PASS" if ok else "FAIL",
                                "found on screen" if ok else "NOT found in OCR of sampled frames"))
        except RuntimeError as e:
            for exp in expects:
                rows.append(Row(f"expect:{exp}", "INDETERMINATE", str(e)))
    if sheet:
        out = contact_sheet(path)
        rows.append(Row("contact-sheet", "PASS" if out else "WARN", out or "sheet failed"))

    verdicts = [r.verdict for r in rows]
    overall = ("FAIL" if "FAIL" in verdicts
               else "INDETERMINATE" if "INDETERMINATE" in verdicts else "PASS")
    return rows, overall


def ocr_all_text(path: str) -> str:
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise RuntimeError("OCR unavailable (pytesseract not installed) — expect-strings UNVERIFIED")
    if shutil.which("tesseract") is None:
        raise RuntimeError("OCR unavailable (tesseract binary missing) — expect-strings UNVERIFIED")
    text = []
    with tempfile.TemporaryDirectory() as td:
        run(["ffmpeg", "-v", "error", "-i", path, "-vf", "fps=2", f"{td}/f_%04d.png"])
        for f in sorted(Path(td).glob("f_*.png")):
            text.append(pytesseract.image_to_string(Image.open(f).convert("L"), config="--psm 11"))
    return "".join(text).replace(" ", "").replace("\n", "")


def md5(path: str) -> str:
    h = hashlib.md5()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def print_table(path: str, rows: list[Row], overall: str) -> None:
    print(f"\n== {path} ==")
    width = max(len(r.check) for r in rows)
    for r in rows:
        print(f"  {r.check:<{width}}  {r.verdict:<13} {r.detail}")
    print(f"  OVERALL: {overall}")


def preflight() -> int:
    """Deps present + the harness's own segmentation self-test: the gate must be able to FAIL."""
    print("PREFLIGHT — servicepow_qc.py (rebuilt 2026-08-26)")
    ok = True
    for tool in ("ffmpeg", "ffprobe"):
        present = shutil.which(tool) is not None
        print(f"  {tool}: {'present' if present else 'MISSING'}")
        ok &= present
    try:
        import numpy  # noqa: F401
        print("  numpy: present")
    except ImportError:
        print("  numpy: MISSING")
        ok = False
    try:
        ocr_ok = True
        import pytesseract  # noqa: F401
        ocr_ok = shutil.which("tesseract") is not None
    except ImportError:
        ocr_ok = False
    print(f"  OCR (expect-strings): {'available' if ocr_ok else 'UNAVAILABLE — expect checks will be INDETERMINATE'}")
    if not ok:
        print("PREFLIGHT: FAIL — a session whose harness cannot self-test does not spend credits")
        return 1

    with tempfile.TemporaryDirectory() as td:
        bad = f"{td}/bad.mp4"
        # 1s motion, 1.2s frozen (a held still), 0.5s black -> freeze AND black must both trip
        run(["ffmpeg", "-v", "error", "-y",
             "-f", "lavfi", "-i", "testsrc2=size=320x240:rate=12:duration=1",
             "-f", "lavfi", "-i", "color=c=gray:size=320x240:rate=12:duration=1.2",
             "-f", "lavfi", "-i", "color=c=black:size=320x240:rate=12:duration=0.5",
             "-filter_complex", "[0:v][1:v][2:v]concat=n=3:v=1[v]", "-map", "[v]", bad])
        fb = freeze_and_black(bad)
        froze = fb and len(fb["freezes"]) > 0
        blacked = fb and len(fb["blacks"]) > 0
        print(f"  self-test planted-freeze detected: {'yes' if froze else 'NO'}")
        print(f"  self-test planted-black  detected: {'yes' if blacked else 'NO'}")
        still = f"{td}/still.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
             "-i", "color=c=darkslategray:size=320x240:rate=12:duration=2", still])
        score, density = motion_score(still)
        slow_caught = score is not None and (score < MOTION_FLOOR or (density or 1) < EDGE_DENSITY_FLOOR)
        print(f"  self-test still-clip fails motion gate: {'yes' if slow_caught else 'NO'}"
              f" (score {score if score is None else round(score, 3)}, density {density if density is None else round(density, 4)})")
        if not (froze and blacked and slow_caught):
            print("PREFLIGHT: FAIL — a gate that cannot fail is not a gate (LB40)")
            return 1
    print("PREFLIGHT: PASS — paste this output before any generation (blocking check 29)")
    return 0


def gate_clips(paths: list[str], accept: str | None, calm: bool) -> int:
    worst = 0
    for path in paths:
        rows, overall = check_file(path, master=False, calm=calm, aspect=None,
                                   duration=None, expects=[], endcard=0.0, sheet=False)
        print_table(path, rows, overall)
        entry = {"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                 "file": os.path.basename(path), "md5": md5(path), "verdict": overall,
                 "accepted_by": None}
        if overall == "INDETERMINATE":
            if accept:
                entry["verdict"] = "INDETERMINATE-ACCEPTED"
                entry["accepted_by"] = accept
                print(f"  INDETERMINATE accepted by named human: {accept}")
            else:
                print("  INDETERMINATE is not a pass — requires --accept-indeterminate \"<name>\"")
                worst = max(worst, 2)
        elif overall == "FAIL":
            worst = max(worst, 1)
        with open(LEDGER, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry) + "\n")
    print(f"\nledger: {LEDGER}")
    return worst


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("files", nargs="*")
    ap.add_argument("--preflight", action="store_true")
    ap.add_argument("--master", action="store_true")
    ap.add_argument("--calm", action="store_true",
                    help="storyboard-declared calm/stillness beat (floor 0.6)")
    ap.add_argument("--gate-clips", action="store_true")
    ap.add_argument("--accept-indeterminate", metavar="NAME")
    ap.add_argument("--aspect")
    ap.add_argument("--duration", type=float)
    ap.add_argument("--expect", action="append", default=[])
    ap.add_argument("--endcard", type=float, default=0.0,
                    help="seconds at tail exempt from the freeze gate (masters)")
    ap.add_argument("--sheet", action="store_true")
    args = ap.parse_args()

    if args.preflight:
        return preflight()
    if not args.files:
        ap.error("no input files (or use --preflight)")
    if args.gate_clips:
        return gate_clips(args.files, args.accept_indeterminate, args.calm)

    worst = 0
    for path in args.files:
        rows, overall = check_file(path, master=args.master, calm=args.calm,
                                   aspect=args.aspect, duration=args.duration,
                                   expects=args.expect, endcard=args.endcard,
                                   sheet=args.sheet)
        print_table(path, rows, overall)
        if overall == "FAIL":
            worst = max(worst, 1)
        elif overall == "INDETERMINATE":
            worst = max(worst, 2)
    return worst


if __name__ == "__main__":
    sys.exit(main())
