#!/usr/bin/env python3
# servicepow_qc.py master checks, extracted verbatim (md5 of the full harness 321ef0b7166be6c71236a928c3dee980);
# preflight, clip ledger, contact sheet and OCR omitted. Usage: qc_master.py FILE --aspect 9:16 --duration D --endcard E
from __future__ import annotations
import json, math, shutil, subprocess, sys, tempfile
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

def print_table(path: str, rows: list[Row], overall: str) -> None:
    print(f"\n== {path} ==")
    width = max(len(r.check) for r in rows)
    for r in rows:
        print(f"  {r.check:<{width}}  {r.verdict:<13} {r.detail}")
    print(f"  OVERALL: {overall}")

def contact_sheet(path):
    return ""
def ocr_all_text(path):
    raise RuntimeError("OCR not used")
if __name__ == "__main__":
    import argparse
    ap=argparse.ArgumentParser(); ap.add_argument("file"); ap.add_argument("--aspect"); ap.add_argument("--duration",type=float); ap.add_argument("--endcard",type=float,default=0.0)
    a=ap.parse_args(); rows,overall=check_file(a.file,True,False,a.aspect,a.duration,[],a.endcard,False); print_table(a.file,rows,overall)
