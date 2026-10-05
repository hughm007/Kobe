---
title: "TripNerd — 'Book It Now' (Augusta) Reel (SLIM Bible)"
type: campaign-bible
client: tripnerd
campaign_id: 2026-10-book-it-now-augusta
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [campaign, bible, slim, reel, augusta, dm-keyword, ai-actor]
---

# TripNerd: "Book It Now" (Augusta) Reel

> **Status: DRAFT v1 BUILT** (2026-10-05).
> - Master: `TN-book-it-now-augusta-v1-DRAFT.mp4` (sha256 in [`qc/sha256-v1.txt`](qc/sha256-v1.txt)).
> - Sent to Karl.
> - The isolated Skeptic Pass 3 is in progress (§14).
> - **Not postable** until every posting gate below clears.

| Field | Entry |
|---|---|
| **CONCEPT** | Karl's script (5 Oct): couch → DM "AUGUSTA" → auto-reply → tap → hard cut to Augusta → end card "DM AUGUSTA" |
| **DEPTH** | SLIM: Karl's own concept, one Reel. **Generated people:** one AI actor in beats 1 and 4 only, as a staged skit, never as a customer or reviewer |
| **KARL'S DECISIONS** | 1. AI couch skit, **real** Augusta (no AI people at Augusta).<br>2. CTA = a real "AUGUSTA" keyword auto-reply; the button reads "Get the Augusta details", not "Book now".<br>3. "Way better than the couch." is on-screen text, never a voice |
| **ROUTING** | **Beats 1 and 4:** Karl's Higgsfield stills (couch: media `389ec001`; phone: generation `5b3387e3`), with motion added in code. **The phone's generated screen was replaced** with a code-built DM: it carried unverified claims ("practice round access", "unforgettable", "Book Now"). The original thumb is composited back on top.<br>**Beats 2–3:** DM UI built in code (real logo file).<br>**Beats 5–8:** **real** 9 Apr Augusta-week photos (IMG_1985, IMG_1932, IMG_2034, IMG_2036). 9:16 crops are downscale only; push ≤1.06.<br>**Beat 9:** end card. All text composited |
| **SCRUBS** | IMG_1985: the event's flag logo and a player photo on TripNerd's banner, and a wall TV (broadcast), are **blurred as third-party marks**. Nothing else is altered |
| **CLAIMS** | EV-tripnerd-009 (TripNerd's Augusta inclusions, per tripnerd.com 5 Oct). No event name or marks. The caption mirrors the site's non-affiliation line |
| **NETWORK NOTE** | Higgsfield's CDN is blocked from this container (403), so generated video can't be downloaded here. An animated couch shot can replace the still later |
| **SOUND** | Temp only: synthesised UI sounds and room tone, −14.0 LUFS, peak −1.9 dBTP, stereo. Karl adds a commercial-library track in Instagram |

## QC (v1)

- **Scope:** `servicepow_qc.py --master` ([`qc/master-qc-v1.txt`](qc/master-qc-v1.txt)).
- **Script result:** **exit 1.** Every structural check passes:
  - 1080×1920, 30 fps, stereo 48 kHz;
  - no frozen or black sections;
  - motion and hook motion;
  - no flash cuts;
  - duration.
- **Why it still exits 1:** the sampled-frame OCR missed 3 of 7 expected text strings.
- **Direct check of those 3 strings** ([`qc/ocr-direct-v1.txt`](qc/ocr-direct-v1.txt)):
  - 2 were found by OCR on their exact frames;
  - "Get the Augusta details" is navy on blue, which tesseract can't read at that size. It was **verified by eye**; the contrast of 4.89:1 is asserted in code.

## Posting gates (all required)

1. **Jason's written OK for an AI actor in the couch skit.** TripNerd's agreed rule is "AI never creates a person, a voice or a testimonial". Draft ask: [`asks-for-tripnerd.md`](asks-for-tripnerd.md).
2. **The "AUGUSTA" keyword auto-reply is live** on @tripnerd with the exact text shown in the video, plus a named DM owner. Setup: [`auto-reply-setup.md`](auto-reply-setup.md).
3. **TripNerd's written OK** on the 9 Apr venue photos (venue name and permission) and on guest/staff consent. That includes the bartender in beat 6 and the guests from behind in beat 8.
4. **What "course passes" covers,** confirmed (the on-screen wording stays generic until then).
5. **Instagram AI label on.** TripNerd's approver signs off. The critic gate and Karl's phone watch.

## 14. Skeptic verdicts

| Pass | Packet | Verdict |
|---|---|---|
| Pass 3 (draft master v1) | `scratchpad/gate_bookitnow_v1_skeptic_1791236510/packet.txt` (contamination scan clean) | *in progress; transcribed verbatim on return* |

## 16. Decision log

| Date | Decision | Who |
|---|---|---|
| 2026-10-05 | Build "Book It Now" now with Karl's two Higgsfield stills; AI actor in the couch beats only; real Augusta photos; keyword auto-reply CTA; line as text | Karl (APPROVER) |
| 2026-10-05 | Phone screen replaced (unverified claims in the generated screen). Real frames chosen to avoid faces where possible; IMG_1932 (bartender) chosen over IMG_1915 (foreground clutter); event marks on the banner blurred | Claude (director) |
| 2026-10-05 | Draft delivered before gates (first-artifact rule); Skeptic Pass 3 running on the frozen master | Claude (director) |
