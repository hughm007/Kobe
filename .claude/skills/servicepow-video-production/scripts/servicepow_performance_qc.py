#!/usr/bin/env python3
"""servicepow_performance_qc.py — the delivery performance gate (blocking check 32).

REBUILT 2026-08-26 from the thresholds in the production playbook (imported from ad-producer
v4.0). The original (v1.1) was never recovered. Origin of this gate: the 911 Drain price line —
the ad's key claim — ran at ~242 WPM and every installed gate passed it.

Thresholds (change only with owner sign-off):
  no line above 175 WPM
  any line carrying the price / offer / CTA: <= 165 WPM
  at least one slow anchor line: <= 155 WPM
  rhythm ratio (fastest line WPM / slowest line WPM): >= 1.15
  at least one inter-line breath: >= 0.40 s

Input is a timed transcript — JSON list of {"text": ..., "start": s, "end": s, "cta": bool}.
The rendered VO is the thing measured at delivery; ASR timing extraction (whisper) is wired but
optional. Without ASR, running against --audio is UNVERIFIED (exit 2) — never a pass. The ASR
word-boundary path is UNVERIFIED as of this rebuild (no whisper at build time; capability map).

  python3 servicepow_performance_qc.py --transcript lines.json
  python3 servicepow_performance_qc.py --audio master.mp4          # needs whisper
  python3 servicepow_performance_qc.py --self-test                 # LB40

Exit: 0 pass · 1 FAIL · 2 UNVERIFIED.
"""

from __future__ import annotations

import argparse
import json
import sys

MAX_WPM = 175.0
CTA_MAX_WPM = 165.0
SLOW_ANCHOR_WPM = 155.0
RHYTHM_RATIO_MIN = 1.15
BREATH_MIN_S = 0.40


def wpm(text: str, start: float, end: float) -> float:
    dur = max(1e-6, end - start)
    return len(text.split()) / (dur / 60.0)


def evaluate(lines: list[dict]) -> int:
    if not lines:
        print("  no lines. VERDICT: FAIL — a silent gate run proves nothing; declare the lines")
        return 1
    fails: list[str] = []
    speeds: list[float] = []
    print(f"  {'WPM':>6}  {'window':>12}  line")
    for ln in lines:
        v = wpm(ln["text"], ln["start"], ln["end"])
        speeds.append(v)
        tag = ""
        if v > MAX_WPM:
            tag = f"  << FAIL > {MAX_WPM:.0f}"
            fails.append(f"line over {MAX_WPM:.0f} WPM: {ln['text']!r} at {v:.0f}")
        if ln.get("cta") and v > CTA_MAX_WPM:
            tag = f"  << FAIL CTA > {CTA_MAX_WPM:.0f}"
            fails.append(f"CTA/price/offer line over {CTA_MAX_WPM:.0f} WPM: {ln['text']!r} at {v:.0f}")
        print(f"  {v:6.0f}  {ln['start']:5.2f}-{ln['end']:5.2f}s  {ln['text'][:60]!r}{tag}")
    if not any(v <= SLOW_ANCHOR_WPM for v in speeds):
        fails.append(f"no slow anchor: every line is faster than {SLOW_ANCHOR_WPM:.0f} WPM")
    if len(speeds) > 1:
        ratio = max(speeds) / max(1e-6, min(speeds))
        print(f"  rhythm ratio: {ratio:.2f} (floor {RHYTHM_RATIO_MIN})")
        if ratio < RHYTHM_RATIO_MIN:
            fails.append(f"rhythm ratio {ratio:.2f} < {RHYTHM_RATIO_MIN} — the read is metronomic")
        gaps = [lines[i + 1]["start"] - lines[i]["end"] for i in range(len(lines) - 1)]
        best = max(gaps)
        print(f"  longest inter-line breath: {best:.2f}s (floor {BREATH_MIN_S}s)")
        if best < BREATH_MIN_S:
            fails.append(f"no breath >= {BREATH_MIN_S}s between lines (longest {best:.2f}s)")
    for f in fails:
        print(f"  FAIL: {f}")
    print(f"  VERDICT: {'FAIL' if fails else 'PASS'}")
    return 1 if fails else 0


def from_audio(path: str) -> int:
    try:
        import whisper
    except ImportError:
        print("  ASR UNAVAILABLE (openai-whisper not installed).")
        print("  VERDICT: UNVERIFIED — the rendered VO's pace cannot be measured; "
              "supply --transcript with real timings or install whisper")
        return 2
    model = whisper.load_model("base")
    result = model.transcribe(path, word_timestamps=False)
    lines = [{"text": seg["text"].strip(), "start": seg["start"], "end": seg["end"],
              "cta": False}
             for seg in result.get("segments", []) if seg["text"].strip()]
    print(f"--audio {path}: {len(lines)} ASR segment(s). CTA lines must still be tagged by "
          "re-running with --transcript (ASR cannot know which line carries the offer).")
    print("  NOTE: the ASR word-boundary path is UNVERIFIED as of the 2026-08-26 rebuild.")
    return evaluate(lines)


def self_test() -> int:
    """LB40. The recorded failing case IS the 911 Drain price line at ~242 WPM."""
    print("SELF-TEST — servicepow_performance_qc.py (rebuilt 2026-08-26)")
    # The v8 kill, reconstructed as arithmetic: a 12-word price line in ~3.0s = 240 WPM.
    v8_like = [
        {"text": "Okay, that's the price before I start. You good with it? Yeah.",
         "start": 10.0, "end": 13.0, "cta": True},
        {"text": "Call now.", "start": 13.4, "end": 14.2, "cta": True},
    ]
    print("case 1 — the ~242 WPM price line MUST FAIL:")
    rc1 = evaluate(v8_like)
    good = [
        {"text": "Before you let anyone in, check them.", "start": 2.5, "end": 6.0, "cta": False},
        {"text": "Verified, at your door.", "start": 6.5, "end": 9.0, "cta": False},
        {"text": "The number's on your screen. Look us up first.",
         "start": 14.0, "end": 17.4, "cta": True},
    ]
    print("case 2 — a compliant read MUST PASS:")
    rc2 = evaluate(good)
    metronome = [
        {"text": "one two three four five six", "start": 0.0, "end": 2.0, "cta": False},
        {"text": "one two three four five six", "start": 2.5, "end": 4.5, "cta": False},
    ]
    print("case 3 — a metronomic read (ratio 1.0) MUST FAIL:")
    rc3 = evaluate(metronome)
    ok = rc1 == 1 and rc2 == 0 and rc3 == 1
    print(f"SELF-TEST: {'PASS — the gate can fail, and for the recorded reason' if ok else 'FAIL (LB40)'}")
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--transcript", metavar="JSON",
                    help='JSON list of {"text","start","end","cta"}')
    ap.add_argument("--audio", metavar="MEDIA")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    if args.transcript:
        with open(args.transcript, encoding="utf-8") as fh:
            return evaluate(json.load(fh))
    if args.audio:
        return from_audio(args.audio)
    ap.error("nothing to do — use --transcript / --audio / --self-test")


if __name__ == "__main__":
    sys.exit(main())
