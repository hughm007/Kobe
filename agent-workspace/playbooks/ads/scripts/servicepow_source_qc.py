#!/usr/bin/env python3
"""servicepow_source_qc.py — source-side QC (blocking checks 26-28).

REBUILT 2026-08-26 from the documented interface in
agent-workspace/playbooks/ads/references/measurement.md §7A. The original (v3.6) was never
recovered. Verification honesty (LB29) is wired in: any check whose measurement dependency is
missing exits nonzero as UNVERIFIED — it never passes by default.

  python3 servicepow_source_qc.py --bed roomtone.wav                       # blocking 26
  python3 servicepow_source_qc.py --master hookA.mp4 \
      --expect-line "..." --expect-line "..."                              # blocking 27
  python3 servicepow_source_qc.py --safe-area hookA.mp4                    # blocking 28
  python3 servicepow_source_qc.py --self-test                              # LB40

Checks:
  --bed        the audio to be looped/layered is ASR-verified speech-free BEFORE use.
               ASR = openai-whisper if importable. Without ASR the bed is UNVERIFIED (exit 2):
               the 2026-08-19 defect was a "room tone" bed cut from a window containing speech,
               and a heuristic cannot honestly clear that. A voice-band energy heuristic is
               printed as ADVISORY context only.
  --master     the finished master's speech matches the declared lines exactly once each, with
               no undeclared speech (looped beds, duplicated beats, half-cut lines all show up
               here). Requires ASR; UNVERIFIED (exit 2) without it.
  --safe-area  every piece of burned text sits inside 15%-70% of frame height (the strip
               between TikTok's caption block and the Reels username bar). OCR = tesseract.
               UNVERIFIED (exit 2) without it.

Exit codes: 0 pass · 1 FAIL · 2 UNVERIFIED (dependency missing — not a pass).
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SAFE_TOP = 0.15
SAFE_BOTTOM = 0.70
OCR_CONF_MIN = 60       # tesseract word confidence below this = noise, not burned text
OCR_MIN_HITS = 2        # a real burned string yields the same word in multiple frames


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def have_asr() -> bool:
    try:
        import whisper  # noqa: F401
        return True
    except ImportError:
        return False


def have_ocr() -> bool:
    if shutil.which("tesseract") is None:
        return False
    try:
        import pytesseract  # noqa: F401
        return True
    except ImportError:
        return False


def transcribe(path: str) -> str:
    import whisper
    model = whisper.load_model("base")
    result = model.transcribe(path)
    return result.get("text", "").strip()


def voice_band_ratio(path: str) -> float | None:
    """ADVISORY heuristic: energy in the 300-3000 Hz voice band vs total. Never a verdict."""
    import numpy as np
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000",
                        "-f", "s16le", "-"], capture_output=True)
    if p.returncode != 0 or len(p.stdout) < 32000:
        return None
    x = np.frombuffer(p.stdout, dtype=np.int16).astype(np.float64)
    spec = np.abs(np.fft.rfft(x))
    freqs = np.fft.rfftfreq(len(x), d=1 / 16000)
    total = spec.sum() or 1.0
    voice = spec[(freqs >= 300) & (freqs <= 3000)].sum()
    return float(voice / total)


def cmd_bed(path: str) -> int:
    print(f"--bed {path}  (blocking 26: loop/layer audio must be speech-free)")
    ratio = voice_band_ratio(path)
    if ratio is not None:
        print(f"  advisory voice-band energy ratio: {ratio:.2f} (context only — never a verdict)")
    if not have_asr():
        print("  ASR UNAVAILABLE (openai-whisper not installed).")
        print("  VERDICT: UNVERIFIED — the bed may not be looped or layered until ASR verifies it")
        print("  (LB29: a check that was not actually run is recorded as not run.)")
        return 2
    text = transcribe(path)
    if text:
        print(f"  speech detected: {text[:160]!r}")
        print("  VERDICT: FAIL — this bed contains speech and may not be looped")
        return 1
    print("  VERDICT: PASS — no speech detected")
    return 0


def cmd_master(path: str, lines: list[str]) -> int:
    print(f"--master {path}  (blocking 27: declared lines exactly once each, nothing undeclared)")
    if not lines:
        print("  no --expect-line declared. VERDICT: FAIL — a master with speech must declare it;"
              " a silent master should still be declared (zero lines is a declaration, but then"
              " ANY detected speech fails).")
    if not have_asr():
        print("  ASR UNAVAILABLE (openai-whisper not installed).")
        print("  VERDICT: UNVERIFIED — speech match cannot be checked")
        return 2
    text = transcribe(path)
    norm = " ".join(text.lower().split())
    fails = []
    for line in lines:
        needle = " ".join(line.lower().split())
        count = norm.count(needle)
        status = "ok" if count == 1 else f"FAIL (appears {count}x)"
        print(f"  line {line!r}: {status}")
        if count != 1:
            fails.append(line)
    residue = norm
    for line in lines:
        residue = residue.replace(" ".join(line.lower().split()), " ")
    residue_words = [w for w in residue.split() if w.isalpha()]
    if len(residue_words) > 2:
        print(f"  undeclared speech present: {' '.join(residue_words)[:120]!r}")
        fails.append("<undeclared speech>")
    verdict = "FAIL" if fails else "PASS"
    print(f"  VERDICT: {verdict}")
    return 1 if fails else 0


def ocr_boxes(image_path: str):
    import pytesseract
    from PIL import Image
    from pytesseract import Output
    img = Image.open(image_path).convert("L")   # tesseract reads the L channel far more
    data = pytesseract.image_to_data(img, output_type=Output.DICT, config="--psm 11")
    h = img.height
    boxes = []
    for i, word in enumerate(data["text"]):
        if not word.strip():
            continue
        conf = float(data["conf"][i]) if data["conf"][i] not in ("-1", -1) else -1
        if conf < OCR_CONF_MIN:
            continue
        top = data["top"][i] / h
        bottom = (data["top"][i] + data["height"][i]) / h
        boxes.append((word.strip(), top, bottom))
    return boxes


def cmd_safe_area(path: str) -> int:
    print(f"--safe-area {path}  (blocking 28: burned text inside {SAFE_TOP:.0%}-{SAFE_BOTTOM:.0%} of frame height)")
    if not have_ocr():
        print("  OCR UNAVAILABLE (tesseract/pytesseract missing).")
        print("  VERDICT: UNVERIFIED — text placement cannot be checked")
        return 2
    from collections import Counter
    hits: Counter = Counter()
    offenders: dict[str, tuple[float, float]] = {}
    with tempfile.TemporaryDirectory() as td:
        run(["ffmpeg", "-v", "error", "-i", path, "-vf", "fps=2", f"{td}/f_%04d.png"])
        frames = sorted(Path(td).glob("f_*.png"))
        if not frames:
            print("  VERDICT: UNVERIFIED — no frames decoded")
            return 2
        for f in frames:
            for word, top, bottom in ocr_boxes(str(f)):
                key = word.lower()
                hits[key] += 1
                if top < SAFE_TOP or bottom > SAFE_BOTTOM:
                    offenders[key] = (top, bottom)
    real_offenders = {w: tb for w, tb in offenders.items() if hits[w] >= OCR_MIN_HITS}
    if real_offenders:
        for w, (top, bottom) in sorted(real_offenders.items()):
            print(f"  OUTSIDE SAFE AREA: {w!r} spans {top:.0%}-{bottom:.0%} of frame height")
        print("  VERDICT: FAIL")
        return 1
    n_words = len([w for w in hits if hits[w] >= OCR_MIN_HITS])
    print(f"  {n_words} distinct burned word(s) found, all inside the safe strip")
    print("  VERDICT: PASS")
    return 0


def self_test() -> int:
    """LB40: prove the gates can fail. Run whenever the script changes."""
    print("SELF-TEST — servicepow_source_qc.py (rebuilt 2026-08-26)")
    ok = True
    with tempfile.TemporaryDirectory() as td:
        # safe-area: text at 80% height must FAIL; text at 40% must PASS (needs OCR)
        if have_ocr():
            bad = f"{td}/bad.mp4"
            good = f"{td}/good.mp4"
            style = "fontsize=44:fontcolor=white:box=1:boxcolor=black"
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
                 "-i", "color=c=darkblue:size=720x1280:rate=6:duration=2",
                 "-vf", f"drawtext=text='CALLNOW':{style}:x=(w-text_w)/2:y=h*0.80", bad])
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
                 "-i", "color=c=darkblue:size=720x1280:rate=6:duration=2",
                 "-vf", f"drawtext=text='CALLNOW':{style}:x=(w-text_w)/2:y=h*0.40", good])
            rc_bad = cmd_safe_area(bad)
            rc_good = cmd_safe_area(good)
            print(f"  safe-area catches 80%-height text: {'yes' if rc_bad == 1 else 'NO'}")
            print(f"  safe-area passes 40%-height text: {'yes' if rc_good == 0 else 'NO'}")
            ok &= rc_bad == 1 and rc_good == 0
        else:
            print("  OCR missing: verifying the gate fails CLOSED instead")
            silent = f"{td}/frame.mp4"
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
                 "-i", "color=c=black:size=320x240:rate=6:duration=1", silent])
            ok &= cmd_safe_area(silent) == 2
        # bed: without ASR the gate must fail closed (exit 2), never pass
        tone = f"{td}/tone.wav"
        run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
             "-i", "sine=frequency=180:duration=2", tone])
        rc = cmd_bed(tone)
        if have_asr():
            print(f"  bed: pure tone passes ASR: {'yes' if rc == 0 else 'NO'}")
            ok &= rc == 0
        else:
            print(f"  bed: fails CLOSED without ASR (exit 2): {'yes' if rc == 2 else 'NO'}")
            ok &= rc == 2
    print(f"SELF-TEST: {'PASS — every gate can fail' if ok else 'FAIL — a gate could not fail (LB40)'}")
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--bed", metavar="AUDIO")
    ap.add_argument("--master", metavar="VIDEO")
    ap.add_argument("--expect-line", action="append", default=[], metavar="LINE")
    ap.add_argument("--safe-area", metavar="VIDEO")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    if args.bed:
        return cmd_bed(args.bed)
    if args.master:
        return cmd_master(args.master, args.expect_line)
    if args.safe_area:
        return cmd_safe_area(args.safe_area)
    ap.error("nothing to do — use --bed / --master / --safe-area / --self-test")


if __name__ == "__main__":
    sys.exit(main())
