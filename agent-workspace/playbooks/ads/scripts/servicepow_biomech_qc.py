#!/usr/bin/env python3
"""servicepow_biomech_qc.py — the impossible-human-speed gate (blocking check 33).

REBUILT 2026-08-26 from the documented behavior (production playbook + LB52). The original
(v1.0) was never recovered. Origin of this gate: a generated crowd sitting and standing FASTER
than human bodies move passed every motion gate, because the motion gate only ever looked down.
A one-sided check on a two-sided property is half a check (LB52) — this is the ceiling.

Verdicts (from the playbook, check 33):
  OSCILLATION  — sustained vertical direction reversals faster than bodies move
                 (> ~2.2 Hz — the sit/stand tell; physically impossible) = FAIL, blocks.
  VELOCITY     — sustained displacement above human plausibility = WARN, needs a named
                 human acceptance (--accept "NAME"): a whip-pan is legitimately fast.
  BURST        — an acceleration spike (frame-to-frame velocity jump) = WARN, same rule.

ALL THRESHOLDS PROVISIONAL — the original was v1.0 with thresholds never re-derived from a
real sample (capability map). Tighten with every scored clip; change only with owner sign-off.

Measure: global vertical displacement per frame via FFT phase correlation on edge maps at
24 fps analysis rate; reversal frequency counted over a sliding 1 s window.

  python3 servicepow_biomech_qc.py clip.mp4 [clip2.mp4 ...]
  python3 servicepow_biomech_qc.py clip.mp4 --accept "Karl"
  python3 servicepow_biomech_qc.py --self-test                    # LB40

Exit: 0 pass (or WARNs accepted by a named human) · 1 OSCILLATION FAIL ·
2 WARN present and not accepted · 3 unmeasurable (not a pass).
"""

from __future__ import annotations

import argparse
import math
import subprocess
import sys
import tempfile

ANALYSIS_FPS = 24
ANALYSIS_WIDTH = 160
OSC_HZ_LIMIT = 2.2          # PROVISIONAL — the sit/stand tell
OSC_MIN_AMP_FRAC = 0.004    # reversals below this amplitude (fraction of frame height) = jitter
OSC_SUSTAIN_S = 0.75        # the reversal rate must hold this long to be a body, not noise
VEL_LIMIT_FRAC_S = 1.2      # PROVISIONAL — sustained displacement > 1.2 frame-heights/second
VEL_SUSTAIN_S = 0.5
BURST_JUMP_FRAC = 0.08      # PROVISIONAL — one-frame velocity jump > 8% of frame height


def decode_gray(path: str):
    import numpy as np
    p = subprocess.run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", path],
                       capture_output=True, text=True)
    if p.returncode != 0:
        return None, 0
    import json as _json
    streams = _json.loads(p.stdout).get("streams", [])
    vs = next((s for s in streams if s.get("codec_type") == "video"), None)
    if vs is None:
        return None, 0
    native_h = int(vs.get("height", 0))
    scale_h = max(2, round(ANALYSIS_WIDTH * native_h / max(1, int(vs.get("width", 1)))) // 2 * 2)
    q = subprocess.run(["ffmpeg", "-v", "error", "-i", path,
                        "-vf", f"fps={ANALYSIS_FPS},scale={ANALYSIS_WIDTH}:{scale_h}",
                        "-pix_fmt", "gray", "-f", "rawvideo", "-"], capture_output=True)
    if q.returncode != 0 or not q.stdout:
        return None, 0
    n = len(q.stdout) // (ANALYSIS_WIDTH * scale_h)
    frames = __import__("numpy").frombuffer(
        q.stdout[: n * ANALYSIS_WIDTH * scale_h], dtype="uint8"
    ).reshape(n, scale_h, ANALYSIS_WIDTH).astype("float32")
    return frames, scale_h


def vertical_velocity(frames):
    """Per frame-pair global vertical shift (analysis px, signed)."""
    import numpy as np

    def edges(f):
        gy, gx = np.gradient(f)
        return np.hypot(gx, gy)

    vys = []
    prev = edges(frames[0])
    for i in range(1, len(frames)):
        cur = edges(frames[i])
        fa, fb = np.fft.rfft2(prev), np.fft.rfft2(cur)
        cross = fa * np.conj(fb)
        mag = np.abs(cross)
        mag[mag == 0] = 1e-9
        corr = np.fft.irfft2(cross / mag, s=prev.shape)
        dy, dx = np.unravel_index(np.argmax(corr), corr.shape)
        if dy > prev.shape[0] // 2:
            dy -= prev.shape[0]
        vys.append(float(-dy))   # positive = content moving down
        prev = cur
    return vys


def analyze(path: str) -> tuple[str, list[str]]:
    frames, h = decode_gray(path)
    if frames is None or len(frames) < ANALYSIS_FPS // 2:
        return "UNMEASURABLE", ["decode failed or clip too short — unmeasurable is not a pass"]
    vys = vertical_velocity(frames)
    findings: list[str] = []
    dt = 1.0 / ANALYSIS_FPS

    # OSCILLATION: sign reversals of meaningful amplitude, rate over a sliding 1s window
    min_amp = OSC_MIN_AMP_FRAC * h
    events = []   # times of direction reversals with amplitude
    last_sign = 0
    for i, v in enumerate(vys):
        s = 0 if abs(v) < min_amp else (1 if v > 0 else -1)
        if s != 0 and last_sign != 0 and s != last_sign:
            events.append(i * dt)
        if s != 0:
            last_sign = s
    win = 1.0
    worst_rate, worst_t, sustain = 0.0, 0.0, 0.0
    t = 0.0
    while t + win <= len(vys) * dt:
        rate = sum(1 for e in events if t <= e < t + win) / win
        if rate > OSC_HZ_LIMIT:
            sustain += 0.25
            if rate > worst_rate:
                worst_rate, worst_t = rate, t
        else:
            sustain = 0.0
        if sustain >= OSC_SUSTAIN_S:
            findings.append(
                f"OSCILLATION: {worst_rate:.1f} reversals/s around t={worst_t:.2f}s "
                f"(limit {OSC_HZ_LIMIT}/s, PROVISIONAL) — bodies do not reverse this fast")
            break
        t += 0.25

    # VELOCITY: sustained |v| above human plausibility (normalized frame-heights/second)
    vel_frac_s = [abs(v) * ANALYSIS_FPS / h for v in vys]
    run_len = 0
    for i, v in enumerate(vel_frac_s):
        run_len = run_len + 1 if v > VEL_LIMIT_FRAC_S else 0
        if run_len * dt >= VEL_SUSTAIN_S:
            findings.append(
                f"VELOCITY: sustained {v:.2f} frame-heights/s at t={i * dt:.2f}s "
                f"(limit {VEL_LIMIT_FRAC_S}, PROVISIONAL) — WARN: a whip-pan is legitimately fast")
            break

    # BURST: one-frame acceleration spike
    for i in range(1, len(vys)):
        jump = abs(vys[i] - vys[i - 1]) / h
        if jump > BURST_JUMP_FRAC:
            findings.append(
                f"BURST: velocity jump {jump:.2f} frame-heights in one frame at t={i * dt:.2f}s "
                f"(limit {BURST_JUMP_FRAC}, PROVISIONAL) — WARN")
            break

    if any(f.startswith("OSCILLATION") for f in findings):
        return "FAIL", findings
    if findings:
        return "WARN", findings
    return "PASS", ["no impossible-speed signature detected"]


def synth(path: str, mode: str) -> None:
    """Synthesize fixtures: 'oscillate' = a bar bouncing at 3 Hz; 'pan' = slow pan."""
    import numpy as np
    fps, w, h, dur = 24, 320, 240, 2.0
    n = int(fps * dur)
    frames = np.zeros((n, h, w), dtype=np.uint8)
    for i in range(n):
        t = i / fps
        if mode == "oscillate":
            cy = int(h / 2 + (h / 5) * math.sin(2 * math.pi * 3.0 * t))   # 3 Hz
        else:
            cy = int(h / 2 + 8 * t)                                        # slow drift
        frames[i, max(0, cy - 12): cy + 12, :] = 220
        frames[i, :, :] += (np.arange(w, dtype=np.uint8) // 8)[None, :]    # texture for edges
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo",
                          "-pix_fmt", "gray", "-s", f"{w}x{h}", "-r", str(fps), "-i", "-",
                          "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)
    p.communicate(frames.tobytes())


def self_test() -> int:
    """LB40: the sit/stand tell must FAIL; a slow pan must not."""
    print("SELF-TEST — servicepow_biomech_qc.py (rebuilt 2026-08-26)")
    with tempfile.TemporaryDirectory() as td:
        osc, pan = f"{td}/osc.mp4", f"{td}/pan.mp4"
        synth(osc, "oscillate")
        synth(pan, "pan")
        v1, f1 = analyze(osc)
        print(f"  3 Hz oscillating bar: {v1} — {f1[0]}")
        v2, f2 = analyze(pan)
        print(f"  slow pan: {v2} — {f2[0]}")
        ok = v1 == "FAIL" and v2 in ("PASS", "WARN")
    print(f"SELF-TEST: {'PASS — the ceiling exists and can fail' if ok else 'FAIL (LB40)'}")
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("files", nargs="*")
    ap.add_argument("--accept", metavar="NAME",
                    help="named human accepting VELOCITY/BURST warnings (never OSCILLATION)")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    if not args.files:
        ap.error("no input files (or --self-test)")
    worst = 0
    for path in args.files:
        verdict, findings = analyze(path)
        print(f"\n== {path} ==")
        for f in findings:
            print(f"  {f}")
        if verdict == "FAIL":
            print("  VERDICT: FAIL — OSCILLATION blocks; no acceptance path exists")
            worst = max(worst, 1)
        elif verdict == "WARN":
            if args.accept:
                print(f"  VERDICT: WARN accepted by named human: {args.accept}")
            else:
                print("  VERDICT: WARN — requires --accept \"<name>\"")
                worst = max(worst, 2)
        elif verdict == "UNMEASURABLE":
            print("  VERDICT: UNMEASURABLE — not a pass")
            worst = max(worst, 3)
        else:
            print("  VERDICT: PASS")
    return worst


if __name__ == "__main__":
    sys.exit(main())
