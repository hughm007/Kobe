---
title: "The machine QC harness has four measured instrument limits — check the instrument before trusting a FAIL"
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-09-29
tags: [qc, harness, tooling]
---

# The machine QC harness has four measured instrument limits — check the instrument before trusting a FAIL

## The four, with evidence (all from the intro-video campaign)
| Limit | Evidence | Status |
|---|---|---|
| **No silent-master mode** — auto-fails audio checks on a cut the playbook itself declares muted-first | control + challenger + Rev 3 all FAIL audio-48k/peak by design | needs `--allow-silent` or a recorded deviation per master (playbook ruling pending) |
| **Freeze gate blind to micro-motion** — 12fps/~320px mean-diff (<0.35/255) cannot see a 2–3px 10 Hz boil | full-res PSNR inside the "frozen" hold: 82.9 dB within a boil group, **33–34 dB at every group boundary** | P7 — needs calm-window exemption or full-res sub-check |
| **flash-cut false positives on multi-frame wipes** | round 1: Kobe's frame-check found 6–7 real transitions vs 15 reported, none under 0.4s; round 2 pending same check; round 3 (2026-09-29, TripNerd camera-roll build): 11 and 12 reported vs **1 real hard cut** per cut, all other spikes inside a momentum scroll, swipes and a pinch-out (sheet in `clients/tripnerd/campaigns/2026-09-29-all-events/build-v1.md`) | frame-check before trusting; **three confirmations, so it is now a candidate for a harness ruling** (e.g. ignore spikes whose neighbours share >50% content, or report cut clusters) |
| **OCR expect-strings can't read curly apostrophes or leading digits** | `You paid. It didn't ring.` fails whole, all substrings pass; `4 video` fails while `video ads` passes, string verified on-frame at 64px | write expects without punctuation or leading numerals |

## The rule this earns
A FAIL is a claim by an instrument, and instruments have ranges. Before repairing the artifact,
read the check's implementation and reproduce the measurement at full fidelity; **fix the film only
when the film is wrong**. Never silently pass a FAIL either — a standing limit gets recorded next
to the result, every time, until the harness ruling lands.

## Addendum 2026-10-06 — three more instrument limits, from the TripNerd ROAR build
- **Speech screen, whisper `tiny` on crowd noise:** returned seven evenly spaced "No, no" segments (avg log-prob −0.92, language p = 0.27) on an 8 s continuous roar with no words. Treat low-confidence repeated short words on noise as hallucination; confirm with the source-footage screen or a larger model before calling a clip "speech". (1st observation.)
- **Sandbox lease:** a `nohup sleep 880 &` started inside a *foreground* `sandbox_exec` does not keep the sandbox alive; the files were gone on the next call. Only a `sandbox_exec` with `background:true` (its own `sleep 880`) holds the 15-minute lease. (2nd confirmation; the 2026-09-29 learning used the background form.)
- **`pkill -f <pattern>` inside `sandbox_exec`** matches the call's own command line (the pattern is in it) and kills the call before anything runs; exit code −1, no output. Kill by PID from `ps` instead.
- **Egress:** this container cannot reach `upload.higgsfield.ai` (proxy 403); presigned PUTs must run from the sandbox where the bytes are. Scripts cross into the sandbox by heredoc (≤16 KB per call; split larger files and byte-check with md5).
- **YouTube reference frames (2026-10-06, late):** `yt-dlp` installs with pip in the Higgsfield sandbox and youtube.com is reachable there (not from this container); a 20-minute 480p video is about 70 MB. Quote any `%(ext)s` output template in a `background:true` command, or use a fixed name: the wrapper's shell chokes on the bare parentheses and the job dies at line 1. To look at frames, pass `image_paths` (four images, 512 KiB in all); contact sheets of 20–30 thumbnails at 256x144 fit. The frames are reference only: they never cross into the repository or an advert.
- **Scene-detect on mixed content (2026-10-06, late night, "The thread"):** `no-flash-cuts` flagged 21 sub-0.4 s "shots", all inside the 2.2 s of handheld roar footage, none at a real cut. The detector's threshold is six times the file's median frame diff; eight seconds of near-static UI pulled the median to 3.3, so ordinary handheld motion read as cuts. A frame-check script (`cutcheck.py` in the build kit) lists detected cuts against the real cut list; the row is overridden only with that evidence attached. Candidate fix for the harness: compute the median per shot or per rolling window rather than per file.
- **Fades read as cuts (2026-10-07):** a 0.25 s fade to a dark colour at the tail trips `no-flash-cuts` as two sub-0.4 s shots; same root cause as the mixed-content median (the fade's frame diffs exceed six times a low median). `cutcheck.py` lists them as "neither a real cut nor an arrival"; override only with that evidence.
- **Reels clear zone, measured not assumed:** anchoring a chat list at the bottom of the frame put the payoff bubble at 92–97 % of height, inside Instagram's caption area; four independent reviewers caught it, the harness cannot. Rule now: essential text and the lockup end at or above 65 % of frame height (1248 px of 1920) and start below 14 %.
- **Vimeo embeds:** yt-dlp is login-walled and TLS-fingerprint-blocked on vimeo.com, but a headless Chromium on the client's own page receives the HLS playlist; ffmpeg then saves the stream. Use only for the client's own videos under their standing authorisation, and keep asking for the master.
