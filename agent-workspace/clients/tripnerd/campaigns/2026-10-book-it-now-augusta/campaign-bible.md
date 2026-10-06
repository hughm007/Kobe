---
title: "TripNerd — 'Book It Now' (Augusta) Reel (SLIM Bible)"
type: campaign-bible
client: tripnerd
campaign_id: 2026-10-book-it-now-augusta
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-06
tags: [campaign, bible, slim, reel, augusta, dm-keyword, ai-actor]
---

# TripNerd: "Book It Now" (Augusta) Reel

> **Status: v4 IN PRODUCTION, blocked on network access** (2026-10-06). Karl's direction: no still images; after the tap the man **transforms from his couch onto a TripNerd hospitality-lawn sofa**. Script and generation plan: [`script-v4-transformation.md`](script-v4-transformation.md).
> - Every Higgsfield host is blocked from this environment; Karl adds them to Allowed domains.
> - v3 (real watching-view section) and v3.1 (phone screen re-fitted) are DRAFTS. v3 gate: critic **6.2, HARD FAIL**; Skeptic **VOID** ([`qc/gate-v3-2026-10-06.md`](qc/gate-v3-2026-10-06.md)).
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

## v2 repairs (2026-10-05), against the Pass 3 findings on v1

| Finding | v2 |
|---|---|
| S4 AI actor (client rule) | **TripNerd's gate:** Jason's written OK ([`asks-for-tripnerd.md`](asks-for-tripnerd.md)). Not fixable by us |
| S4 auto-reply doesn't exist | **TripNerd's gate:** switch on "AUGUSTA" with the exact text and name the DM owner ([`auto-reply-setup.md`](auto-reply-setup.md)) |
| S4 recognisable bartender and guests | **TripNerd's gate:** written staff and guest consent. If refused, swap beats 6 and 8 for people-free frames |
| S3 banner blur blocks; venue sign legible; look-alike cut from the AI man to a real man | **Fixed:** the banner shot (IMG_1985) is dropped. The real section opens on the bar (a woman bartender), so no look-alike |
| S3 the bartender's venue name badge | **Open:** part of the venue OK (gate 3) |
| S3 inclusions have no EV ID | EV-tripnerd-009 is filed (it wasn't in the packet). The course-passes scope stays a gate |
| S2 screen composite (dotted edges, overhang, status icons, thumb seam) | **Fixed:** the alpha is now the generated phone's own screen mask, kept inside the bezel and excluding the thumb |
| S2 reply readable for only 2.5 s | **Fixed:** the reply now holds about 3.5 s (3.8–7.8); typing is shortened to 1.6 s |
| S2 no golf or Augusta cue in the first 3 s | **Fixed:** the hook is "Augusta week. Still on the couch?" from frame 1 |
| S2 disclaimer only in the caption | **Fixed:** an on-screen independence line on the end card (28 px, 4.5:1+) |
| S2 harsh audio beds | **Fixed:** smooth room tone and soft outdoor air (about −40/−38 dBFS); the master is −14.4 LUFS. The music added in Instagram still needs a listen on Karl's phone |
| S2 supermarket labels, condiments; home and course never shown | **Open:** TripNerd's private-home photos would be the strongest swap (ask) |
| S1 mock keyboard | **Fixed:** shift, backspace, 123 and send keys |
| S1 third-party bottle and cap logos | Accepted as incidental (S1) |

**QC v2:**
- `servicepow_qc.py` exits 1 only on two sampled-frame OCR strings; every structural check passes.
- Both strings were confirmed on their exact frames ([`qc/ocr-direct-v2.txt`](qc/ocr-direct-v2.txt)).
- The send copy is 17.8 MB.

**Re-attack:** the isolated Skeptic re-runs on v2, or on v3 with any swapped frames, **once TripNerd's answers clear the S4 gates.** Re-running before then would only re-find the same three S4s.

## Posting gates (all required)

1. **Jason's written OK for an AI actor in the couch skit.** TripNerd's agreed rule is "AI never creates a person, a voice or a testimonial". Draft ask: [`asks-for-tripnerd.md`](asks-for-tripnerd.md).
2. **The "AUGUSTA" keyword auto-reply is live** on @tripnerd with the exact text shown in the video, plus a named DM owner. Setup: [`auto-reply-setup.md`](auto-reply-setup.md).
3. **TripNerd's written OK** on the 9 Apr venue photos (venue name and permission) and on guest/staff consent. That includes the bartender in beat 6 and the guests from behind in beat 8.
4. **What "course passes" covers,** confirmed (the on-screen wording stays generic until then).
5. **Instagram AI label on.** TripNerd's approver signs off. The critic gate and Karl's phone watch.

## 14. Skeptic verdicts

| Pass | Packet | Verdict |
|---|---|---|
| Pass 3 (draft master v1) | `scratchpad/gate_bookitnow_v1_skeptic_1791236510/packet.txt` (contamination scan clean) | **BLOCK** (3 × S4, 4 × S3). Verbatim below |
| Pass 3 (master v3, `a8c8463b…`) | `scratchpad/gate_bookitnow_v3_skeptic_1791324416/packet.txt` (contamination scan clean; the path carries "v3" by naming convention) | **VOID**: `SKEPTIC VOID — NOT INDEPENDENT`. Block at BC-23. **Likely cause:** the invoking prompt named other evaluators' output (VOID condition 3). The v4 pass is invoked with the packet path only. Full gate record: [`qc/gate-v3-2026-10-06.md`](qc/gate-v3-2026-10-06.md) |

```
SKEPTIC VERDICT — Pass 3
Verdict: BLOCK
Findings:
- [S4] Shots 1 and 4 (0.0–2.2, 7.4–8.6) / client lens — The master contains an AI-generated person, which breaks the client-agreed rule "AI never creates a person, a voice or a testimonial"; the written exception is not granted, so per CLIENT-FACTS this cut cannot post.
- [S4] Shots 2–3 (2.2–7.4), end card (17.0–20.0) and post caption / target-customer lens — The CTA shows an exact instant keyword reply with a "Get the Augusta details" button and promises "a Nerd will reply", but per CLIENT-FACTS the "AUGUSTA" auto-reply does not exist and no one is named to answer DMs, so everyone who acts on the ad gets nothing (ad-to-destination parity fails).
- [S4] Shot 6 (10.6–12.6) and shot 8 (14.6–17.0) / rights — The bartender is shown face-on and smiling in the focal area, and at least four guests can be recognised in profile or three-quarter view (the woman in the sun hat, the woman in sunglasses, the man in glasses, two men at right), while written guest and staff consent is still pending per CLIENT-FACTS; the shot list's "guests from behind" understates what is on screen.
- [S3] Shot 5 (8.6–10.6) and shot 6 / rights and client lens — The venue can be identified: "St. Andrew's Ballroom" signage is legible and the bartender wears a venue name badge, while the venue's written OK to use its photos is still pending.
- [S3] Shot 5 (8.6–10.6) / trust and competitor lens — Three hard-edged rectangular blur blocks cover about a third of the "TripNerd hosted" proof frame, two of them on TripNerd's own banner, and the middle block leaves a yellow-on-green shape in tournament colours, so the proof shot reads as censorship and a competitor can screenshot it as "they had to blur their own banner."
- [S3] Hard cut at 8.6 / trust and AI-detection — The cut goes from the photoreal generated couch man to a real man seen from behind with a similar build and dark clothing, which invites viewers to read the actor as a real customer whose trip the photos record; the reel-wide Instagram AI label also covers the real proof photos, so viewers cannot tell what is real, and the cut is dishonest in both directions.
- [S3] Shot 3 reply, shot 7 caption, end card / claims — No package inclusion ("private executive home", "course passes", "daily hospitality", "food & drink", "hosted by TripNerd") has an EV- Evidence ID in CLIENT-FACTS, only a same-day screenshot of the client's own sales page, and "course passes", the claim that drives the purchase, names no course, days or terms.
- [S2] Shot 4 (7.4–8.6) / focal-area forensic — The screen composite on the focal object has visible faults: dotted plate edges on the right and bottom, the plate hanging past the phone bezel at bottom-right, the generated phone's own status-bar icons showing above the plate at top-right, and a hard vertical matte seam through the thumb doing the pressing.
- [S2] 4.4–7.4 / weakest-2s — The 46-word reply bubble is fully visible for only about 2.5 s, too little to read at Reel pace, so the core offer lands only on the end card, and the 2.2–4.4 stretch before it is a mostly blank white screen.
- [S2] 0.0–3.0 / first-3s — The open is a frozen still of a generic man on a phone under a slow push, the hook "Still watching from the couch?" shows nothing being watched, there is no golf or Augusta cue until about 3.8 s, and the platform AI label is visible from the first frame on a brand that sells real experiences.
- [S2] Shots 6–7 (10.6–14.6) / persuasion and competitor lens — The proof of a premium executive package centres on supermarket-tier wine labels (Canyon Road, Josh) and a condiment station of Heinz, French's and bagged chips, while the two strongest inclusions (the private home and course access) are never shown.
- [S2] Audio 8.6–17.0 / forensic — The "open-air" bed is loud broadband noise (about -15 dBFS RMS) with evenly spaced comb-filter notches from about 1.2 kHz up, so it sounds like hollow static, and it plays unchanged under the indoor ballroom shot; the room tone on the open and the end card is about -16 dBFS RMS of rumble below 150 Hz.
- [S2] Audio / delivery — The music track is to be added inside Instagram after this gate, so the mix that actually posts has not been judged and will sit on top of the noise beds above.
- [S2] Post caption and video / competitor and industry-professional lens — The non-affiliation disclaimer appears only as the third sentence of the post caption, likely hidden behind "more" on Reels, while the video pairs "Augusta week", golf-course views, tournament-colour décor and the blurred yellow-green banner with no on-screen independence line.
- [S2] End card and DM header / CTA — The handle "@tripnerd" / "tripnerd" is not confirmed anywhere in CLIENT-FACTS, and if the posting account's handle differs, both the CTA and the thread shown on screen are wrong.
- [S1] Shots 2–3 (2.2–7.4) — The code-built DM UI reads as a mock-up: the keyboard has no return, send, shift or 123 keys yet the message sends, the status bar shows only "9:41", and typing dots come before an obviously canned auto-reply.
- [S1] Shots 6–8 (10.6–17.0) — Third-party marks are legible on screen (Malibu and Jack Daniel's bottles, a collegiate logo on a guest's cap, apparel logos).
Isolation: packet verified; production reasoning, cost, draft history, and other evaluators' output withheld.
```

## 16. Decision log

| Date | Decision | Who |
|---|---|---|
| 2026-10-06 | Karl: put the watching-view picks "in a bucket" and rebuild. Drive folder "Augusta advert picks - watching view (COPIES, internal)" (19 copies). v3 built: P155, P035, P115, P150 and P139 replace the face-on bartender, the condiments and the face-on lawn guests. A dessert card in P150 names West Lake Country Club (EV-tripnerd-010): the course in view is not Augusta National | Karl (APPROVER) / Claude (director) |
| 2026-10-06 | v3 gate: critic 6.2 HARD FAIL (frozen stills, thin audio, composite seams, safe-band and claims items); Skeptic VOID; 6 of 6 verified S3/S4 audit findings held ([`qc/gate-v3-2026-10-06.md`](qc/gate-v3-2026-10-06.md)) | Claude (director) |
| 2026-10-06 | Karl: "fix the screen, it is not properly centered." v3.1: the screen corners are re-fitted from the real screen edges, the button is centred, and no original UI shows through | Karl (APPROVER) / Claude (director) |
| 2026-10-06 | Karl: no still images; replicas of real footage as AI motion. Karl chose people-free AI motion only (no AI replicas of guests), up to 600 credits on Seedance 2.5 with drafts first (SPEND_APPROVER), and the Higgsfield hosts allowlisted | Karl (APPROVER, SPEND_APPROVER) |
| 2026-10-06 | Karl: after the tap, cut back to the man on the couch and **transform him onto a couch at the event**. **Supersedes the 2026-10-05 "no AI people at Augusta" decision** for this one actor. Done as a start-frame/end-frame transformation that lands on the real P005 lounge sofa, rather than Genjutsu World Shift (that preset copies another creator's worlds). Jason's AI-actor ask must now cover the venue too | Karl (APPROVER) / Claude (director) |
| 2026-10-05 | Build "Book It Now" now with Karl's two Higgsfield stills; AI actor in the couch beats only; real Augusta photos; keyword auto-reply CTA; line as text | Karl (APPROVER) |
| 2026-10-05 | Phone screen replaced (unverified claims in the generated screen). Real frames chosen to avoid faces where possible; IMG_1932 (bartender) chosen over IMG_1915 (foreground clutter); event marks on the banner blurred | Claude (director) |
| 2026-10-06 | Karl: write an all-AI frame-by-frame for Higgsfield (pre-viz), with real footage swapped in later. Written as `script-ai-previz-v1.md`: INTERNAL PRE-VIZ, NOT FOR POSTING, with a slot map naming the real replacement and gate per AI frame. No generation from this session | Karl (APPROVER) / Claude (director) |
| 2026-10-06 | Karl (SPEND_APPROVER): generate every pre-viz frame in Higgsfield, "don't worry about capping the credits… highest quality… realism". Ran 35 stills: 9 frames × 2 takes on `gpt_image_2_5` flare max 4k, a full `nano_banana_pro` set (served as `nano_banana_2`), and a realism shootout on frames 6 and 11 across 4 more models. Spent 339.24 credits (balance 11,102.90 → 10,763.66), plus 24.75 on the superseded batch 1. No visual QC possible here (CDN 403); Karl picks in the gallery. `soul_2` index 116 is off-brief (the server rewrote its prompt). Record: `script-ai-previz-v2-realism-stills.md`. Still INTERNAL PRE-VIZ | Karl (APPROVER, SPEND_APPROVER) / Claude (director) |
| 2026-10-05 | Skeptic Pass 3 on v1: BLOCK (3 × S4 = TripNerd gates; 4 × S3). v2 built: banner shot dropped, mask-based screen composite, longer reply hold, Augusta cue at 0 s, on-screen independence line, softer temp beds. v2 sent to Karl | Claude (director) |
| 2026-10-05 | Draft delivered before gates (first-artifact rule); Skeptic Pass 3 running on the frozen master | Claude (director) |
