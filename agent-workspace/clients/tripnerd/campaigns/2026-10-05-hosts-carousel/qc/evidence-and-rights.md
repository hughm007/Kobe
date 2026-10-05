---
title: "Hosts carousel v1 — evidence, rights and blocking-check record"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [client, instagram, carousel, static, qc, evidence, rights]
---

# Hosts carousel v1: evidence, rights and blocking checks

## The export set

- Seven cards, `tripnerd-hostswrong-C02-H1-feed-portrait-v1-c1.png` to `…-c7.png`. Each is 1080×1350, PNG, RGB with no alpha, and 64–91 KB.
- Hashes: [`sha256-v1.txt`](sha256-v1.txt). The PNGs live in the session scratchpad (`static_hosts/exports/`) and are **not committed**.
- **Which checks are listed:** this records every check in the canonical blocking-check registry (`.claude/skills/_servicepow/data/blocking-checks.yaml`) whose `applies` matches a static ad:
  - any-deliverable
  - ad
  - static
  - client-facing
  - any-visual

  Every other check is listed as N/A, with its `applies` value.

**The receipts in this folder:**

| File | What it is |
|---|---|
| `static-qc-v1.txt` | The `servicepow_static_qc.py --dir exports --facts facts.json` stdout. **Exit 0: "STATIC-QC: PASS (285 passed, 0 failed, 7 exports)"** |
| `extra-checks-v1.txt` | The extra checks (overlap, contrast on the pre-text plate, mode, size, bytes, chip safe zone, OCR). **Exit 0: "EXTRA-CHECKS: PASS (90 passed, 0 failed, 7 exports)"**. The script is `static_hosts/qc/extra_checks.py` in the session scratchpad |
| `compose.diff` | The composer patch: (a) Montserrat ExtraBold headline face; (b) chip contrast measured against the blended chip colour; (c) optional `chip_fill` and `chip_radius` |
| `specs/*.spec.json` | The layout spec per card |
| `specs/*.plates.json` | The background plate geometry: the logo plate, proof bands and list rules |
| `manifests/*.manifest.json` | The composer manifests |
| `facts.json` | The BC-55 facts file |

## Applicable checks

| Check | Status | Receipt / basis |
|---|---|---|
| **BC-16** Every claim substantiated | **PENDING** | See the claim map below. Every on-image claim cites a filed record, EV-tripnerd-001 to 005 ([`../../../evidence-register.md`](../../../evidence-register.md)). **Outstanding:** CLIENT_APPROVER sign-off on each record (policy §2; TripNerd's approver isn't named yet). Two record elements are INFERRED: "steps" (003) and "our guests" (002) |
| **BC-19** Ad-to-landing-page parity | **PENDING** | **Karl's phone receipt** that the Instagram bio link opens tripnerd.com, with a working enquiry path. Instagram and tripnerd.com aren't reachable from this environment. The site's state as of 2026-09-30 is in EV-tripnerd-005 |
| **BC-20** Rights cleared | **PASS** | No photos, footage, music or likeness are in the exports.<br>**Fonts:** Montserrat ExtraBold (Debian `fonts-montserrat` 7.222-2) and Inter SemiBold (Google Fonts file), both SIL Open Font License.<br>**Logo:** TripNerd's own file, accepted by the APPROVER (Karl, 2026-10-05). TripNerd is asked to confirm.<br>**Not covered here:** the event *name* "THE PLAYERS" in c3's copy is a word mark, not media. It is raised as an open risk under BC-55 |
| **BC-21** Correct client, correct brand assets | **PASS** | The logo file's sha256 `1c4996e5dc60000c10ac31b3b1e31bc5d9d0aa95fbe0d05209163f9b1b0caa51` matches the APPROVER decision.<br>It is composited unaltered (scaled to 237, 324 or 367 px wide, never redrawn). It sits only on site blue: directly on c1 and c7, and on a #5896E9 plate on c2–c6.<br>**Note:** TripNerd's `brand-guide.md` is an empty template. The palette comes from the director's brief, so TripNerd should confirm it |
| **BC-22** Client-ready score floor | **PENDING** | Dual gate (critic). Not run here, by instruction |
| **BC-23** Skeptic verdict | **PENDING** | Dual gate (isolated Skeptic). Not run here, by instruction |
| **BC-24** Angle declared and rotated; Anti-Generic Gate | **PENDING** (human) | Angle and rotation excerpt: see [`../campaign-bible.md`](../campaign-bible.md). A self-assessment is recorded there; the verdict belongs to the gate. Known risks: type-only cards, and "handled" echoes September's "Hospitality. Handled." |
| **BC-42** Composited text discipline | **PASS** | Every readable string is real type placed by the composer; the manifest lists each block.<br>No generated imagery exists in the set.<br>OCR read back **189/193 manifest words** (`extra-checks-v1.txt`, INFO OCR). The only misses are Montserrat display numerals: "1" was read as "t" and "3" as "5". Visual inspection confirms the glyphs |
| **BC-51** Placement spec exact | **PASS** | `static-qc-v1.txt`: BC-51 dimensions and size, all seven. `extra-checks-v1.txt`: X3 (PNG, RGB, no alpha or transparency), X4 (1080×1350) and X5 (under 8 MB).<br>**Colour space:** untagged RGB PNG, every colour specified in sRGB. No ICC profile is embedded, because the composer saves without one and the patch scope didn't allow adding it.<br>**Filename:** the name encodes the variant coordinate plus the `-c<n>` card index. That extension of the naming law is recorded in the Bible |
| **BC-52** Safe zones and legibility floor | **PASS** | `static-qc-v1.txt`: every element is inside the safe box (54, 67, 1026, 1283), and every text block meets its floor (headline ≥ 66, support ≥ 42, CTA ≥ 42, fact 34–38, labels 30–34; floors 64/36/40/28).<br>**Contrast on the pre-text plate** (X2), measured at the actual ink pixels. The rebuilt plate was proven exact: re-rendering reproduces each export pixel-for-pixel.<br>- Navy on site blue: **4.89:1**. This is the lowest, on c1, c7 and the proof bands.<br>- Logo blue on navy: 5.15:1.<br>- White on navy, and navy on the white pill: 14.77:1.<br><br>**No text block is wider than 80% of the safe width** (the composer wraps at that width).<br>**Note:** the logo *plate* (background) extends 12–16 px past the safe line on c2–c6. The logo itself is inside |
| **BC-53** Hierarchy and CTA | **Machine PASS; human PENDING** | **Machine:** a CTA block on every card, in a distinct pill form. Each pill, not just its text, is inside the safe box (X6). The logo is small: 22–34% of the width, never the hero.<br>**Human (gate):** one dominant element and a plausible reading order.<br>**Declared order:** label → (numeral) → headline → support → proof → CTA. On c3 the numeral sits after the proof as a folio.<br>**Risk:** on c5 the "4" (470 px) and on c3 the "2" (380 px) are deliberately the biggest shapes on the card |
| **BC-54** Variant distinctiveness within the set | **PASS** (judged) | **"7 cards of one ad (one concept, one hook, one placement), not variants."** The set is one carousel, so the near-duplicate test guards against repeated cards rather than measuring variant spread. Pairwise scores are below (`static-qc-v1.txt`; rms of the difference, flag at ≤ 0.05) |
| **BC-55** Client information verbatim on statics | **Machine PASS; human PENDING** | **Machine:** none of the barred terms are on any export, and "tripnerd.com" is present in the set (`facts.json`, from the director's brief).<br>**Where the barred terms come from:**<br>- "#1", guarantee, "VIP", "best": the 2026-09-30 audit §9.<br>- "2027": the PLAYERS dates aren't set (real-material inventory §4).<br>- "Masters", "Augusta": the earlier Story and Reel gates.<br>- "PGA TOUR": the 2026-09-29 footage-log standing rule.<br><br>**Human half (misleading implication):**<br>1. THE PLAYERS is named on c3 with no non-affiliation wording, while tripnerd.com's own event page carries one.<br>2. Nothing implies transport (c5 has no proof line by design).<br>3. No services or results are implied beyond EV-tripnerd-001 to 005 |

### BC-16 claim map

| Card | On-image wording | EV | Label |
|---|---|---|---|
| c2 | "Ours: a staffed TripNerd check-in table." | EV-tripnerd-001 | CONFIRMED (seen). "Check-in" INFERRED |
| c3 | "At THE PLAYERS, our guests watched 17 from the rail." | EV-tripnerd-002 | CONFIRMED by record (footage not on disk). "Our guests" INFERRED |
| c4 | "In our suite on 17, the buffet was steps from the rail." | EV-tripnerd-003 | Same suite: CONFIRMED by record. "Steps": INFERRED (about 5.5 s of continuous camera travel) |
| c7 | "TripNerd hosts guests at golf tournaments and other big events." | EV-tripnerd-004 | CONFIRMED |
| c7 | "Plan yours at tripnerd.com" | EV-tripnerd-005 | CONFIRMED as of 2026-09-30. BC-19 re-check pending |
| c1–c6 | Advice, questions and labels (e.g. "Four moments decide the day.", "Check tee times…", "Who meets them?") | none | Not claims about TripNerd. "Four moments decide the day" is editorial framing |

### BC-54 pairwise scores (v1)

|  | c2 | c3 | c4 | c5 | c6 | c7 |
|---|---|---|---|---|---|---|
| **c1** | 0.353 | 0.345 | 0.346 | 0.364 | 0.355 | 0.092 |
| **c2** |  | 0.180 | 0.152 | 0.170 | 0.173 | 0.365 |
| **c3** |  |  | 0.200 | 0.194 | 0.177 | 0.357 |
| **c4** |  |  |  | 0.169 | 0.188 | 0.351 |
| **c5** |  |  |  |  | 0.166 | 0.374 |
| **c6** |  |  |  |  |  | 0.371 |

- The lowest pair is c1~c7 at 0.092: the two blue bookends, which differ in text, layout and the white pill.
- Among the navy cards, the lowest pair is c2~c4 at 0.152. The numeral's position and size vary per card for this reason:
  - c2: 340, top;
  - c3: 380, bottom;
  - c4: 250, top;
  - c5: 470, top.

## Checks recorded N/A (their `applies` does not match a static ad)

| Checks | `applies` | Why N/A |
|---|---|---|
| BC-01 to BC-15, BC-25 to BC-28, BC-30 | video-master | A static image set, not a video master |
| BC-17, BC-18 | generated-media | Nothing generated: no synthetic people or imagery |
| BC-29, BC-43 | generation | No generation request; $0 spend |
| BC-31, BC-34 | video-storyboard | No storyboard; not video |
| BC-32, BC-33 | video-people | Not video |
| BC-35 to BC-40 | outbound | Nothing is sent. Posting is TripNerd's approver's and Karl's action |
| BC-41 | generated-visual | No generated visuals |
| BC-44 to BC-50 | web | Not a website |
