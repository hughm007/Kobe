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

---

# v2 (2026-10-05): evidence, rights and blocking checks

**Scope:** machine QC only, by instruction. The dual gate (BC-22 critic, BC-23 isolated Skeptic) has **not** run on v2. Nothing is committed, posted or sent.

## The v2 export set

- Seven cards, `tripnerd-hostswrong-C02-H1-feed-portrait-v2-c1.png` to `…-c7.png`. Each is 1080×1350, PNG, RGB, no alpha; 77–683 KB (the photo cards are the larger files).
- They live in the session scratchpad, `static_hosts/exports_v2/`, beside the untouched v1 set. Hashes: [`v2/sha256-v2.txt`](v2/sha256-v2.txt). Preview strip (350 px tall): `static_hosts/preview/strip-v2.png`.
- Same check selection as v1: every check in the canonical blocking-check registry whose `applies` matches a static ad. The N/A list above is unchanged for v2.

**The v2 receipts** (all in [`v2/`](v2/)):

| File | What it is |
|---|---|
| `static-qc-v2.txt` | `servicepow_static_qc.py --dir exports_v2 --facts facts-v2.json`. **Exit 0: "STATIC-QC: PASS (323 passed, 0 failed, 7 exports)"** |
| `extra-checks-v2.txt` | `extra_checks_v2.py`. **Exit 0: "EXTRA-CHECKS: PASS (123 passed, 0 failed, 7 exports)"** |
| `facts-v2.json` | BC-55 facts: must contain "link in bio"; v1's barred list plus "THE PLAYERS", "handled", "Handled", "tripnerd.com", "transport" |
| `compose-v2.diff` | Composer patch v1 → v2: (d) an exact-size plate is used without resampling; (e) `logo.xy` absolute placement; (f) real photo panels pasted 1:1 and listed in the manifest as role `photo`; (g) `block.x` left edge |
| `photo-panels-v2.json` | Per photo panel: source file and sha256, colour conversion, source crop, scale (all ≤ 1), the face/mark exclusion line, the panel's placed box and the panel file's sha256 |
| `specs/`, `manifests/` | Layout spec, plate geometry (logo plate, proof bands, rules, photo panels) and composer manifest per card |
| `build-v2.log` | Build output, including the rail-still check ("absent") |
| `scripts/` | `build_v2.py`, `photos_v2.py`, `compose_v2.py`, `extra_checks_v2.py`, copied so the set can be rebuilt from the repo (v1 risk 12) |

**What `extra_checks_v2.py` adds to v1's checks:** the rebuild mirrors compose_v2 (and is still proven pixel-exact); photo panels count as placed boxes, so every text box must sit ≥ 16 px off the photo; the logo plate, the logo and every photo panel are **gated** inside the safe box (v1 only reported the plate); logo width ≥ 300 px; X7: each photo panel in the export equals the prepared panel file pixel-for-pixel, was only ever downscaled, and its crop starts at or below the recorded face/mark exclusion line.

## Applicable checks (v2)

| Check | Status | Receipt / basis |
|---|---|---|
| **BC-16** Every claim substantiated | **PENDING** | Claim map below. Every on-image claim cites a filed record (EV-tripnerd-004, 006, 007, 008). **Outstanding:** CLIENT_APPROVER sign-off (not named). INFERRED elements: "guests" (006, as EV-002), "hosted … set out for guests" (007) |
| **BC-19** Ad-to-landing-page parity | **PENDING** | The CTA is now "Plan yours · link in bio" and the caption says "link in bio". Still needs **Karl's phone receipt** that the bio link opens tripnerd.com with a working enquiry path (EV-tripnerd-005) |
| **BC-20** Rights cleared | **PASS (agency side); client confirmation pending** | **Photos** (c1 IMG_1901, c2 IMG_1907, c4 IMG_1998): TripNerd's own camera roll (iPhone 15 Plus, 2026-04-09), from TripNerd's Drive library. **Faces excluded by crop** (X7 exclusion line gated: c1 crop top y=1406, c2 y=1162 against a chin line at about y=1065–1085, c4 has no people). Library cleared to use by Karl (APPROVER) on **2026-10-04** (launch-reels Bible, Decision log). **TripNerd's confirmation is pending** (that the photos may be used in ads and that the staff shown, from the chest down, are fine to appear).<br>**Third-party marks removed** by conventional retouch (no AI, no generation): Apple logos on two laptop lids and a polo logo (diffusion heal); the Purell label, a cup's venue print, the event program card, the right-hand cup's print and lettering on a staff top (feathered blur). On IMG_1901 the launch-reels scrub (`marks/clean_IMG_1901.png`) plus two further heals (polo logo, a second laptop's Apple logo). On IMG_1998 the venue table card and its stand are **cropped out**, not retouched; no liquor or brand labels are in frame.<br>**Fonts and logo:** as v1 |
| **BC-21** Correct client, correct brand assets | **PASS** | Logo sha256 `1c4996e5…caa51` matches the APPROVER decision; composited unaltered, scaled to 345 px wide on every card, top-left, on a #5896E9 plate (on c1/c7 the card blue). The tablecloth logo in the c1/c2 photos is TripNerd's own printed mark, photographed, not redrawn |
| **BC-22** Client-ready score floor | **PENDING** | Not run, by instruction |
| **BC-23** Skeptic verdict | **PENDING** | Not run, by instruction |
| **BC-24** Angle and Anti-Generic Gate | **PENDING** (human) | v2 adds real TripNerd imagery on c1, c2 and c4 (the branded table, staff, the hosted spread) and drops "handled" (the September echo). c3, c5, c6 and c7 remain type-only |
| **BC-42** Composited text discipline | **PASS** | Every readable string is real type placed by the composer. The photos carry only real-world text (the TripNerd tablecloth, a "STAF…" badge). OCR read back **191/194** manifest words; misses are display numerals and the "1" in "1 · ARRIVAL" (read as "t"/"1t"/"35"), glyphs confirmed by eye |
| **BC-51** Placement spec exact | **PASS** | 1080×1350, PNG, RGB, no alpha, < 8 MB (static QC BC-51; X3–X5).<br>**Colour:** each photo was converted to **sRGB with PIL ImageCms before compositing**, the same recipe as `static_v4/bg_lawn_srgb.png` (verified: it reproduces that file to 0.21/255 mean). The three primary JPEG frames carry **no embedded profile** (only their HDR gain-map frames do), so the same-device "Apple Poppy Output Profile" from IMG_2004 (iPhone 15 Plus, iOS 26.3.1, same day) is applied as the source profile: **an assumption, recorded**. The exports themselves stay untagged sRGB, as v1 |
| **BC-52** Safe zones and legibility floor | **PASS** | Every element, **including each photo panel and the logo**, inside (54, 67, 1026, 1283) (static QC). **The logo plate is now fully inside the safe box** on all cards: [54, 67, 431, 217] (X6, gated). Text floors met (headline ≥ 68, support ≥ 40, CTA ≥ 40, fact ≥ 36, labels ≥ 30).<br>**Contrast on the pre-text plate (X2, at ink pixels, rebuild pixel-exact):** navy on site blue **4.89:1** (lowest; c1, c7, proof bands); logo blue on navy 5.15:1; white on navy and navy on white 14.77:1. All text sits on flat colour, never on a photo.<br>**Spacing (X1, floor 16 px, photo panels included):** tightest pairs c1 20, c2 24, c3 32, c4 24, c5 32, c6 16, c7 36 px |
| **BC-53** Hierarchy and CTA | **Machine PASS; human PENDING** | A CTA pill on every card, inside the safe box. Logo 345 px, never the hero. Numerals one size (140 px) in one position (header row, beside the label) on c2–c5; no numeral below the text. Text stacks on c2/c4 are anchored to the CTA (no empty band above it); c7 is centred between the header and the bottom of the safe box |
| **BC-54** Variant distinctiveness | **PASS** (judged) | **"7 cards of one ad (one concept, one hook, one placement), not variants."** Pairwise scores below; none at or below 0.05 |
| **BC-55** Client information verbatim | **Machine PASS; human PENDING** | **Machine:** no barred term on any card; "link in bio" present (`facts-v2.json`). **Human half, for the gate:** (1) no event is named; "island-green 17th" describes the hole. (2) Nothing claims transport: c5 has no proof band, and c7 no longer says "handled"; it asks "Hosting clients or bringing friends?" and states only EV-004. (3) c1/c2/c4 photos are Augusta-week; c3's proof is the 17th-hole suite: see the Bible's open risks on cross-event stitching |

### BC-16 claim map (v2)

| Card | On-image wording | EV | Label |
|---|---|---|---|
| c2 | "Ours: a TripNerd-branded table, with staff on hand." | EV-tripnerd-008 | CONFIRMED (seen). Narrowed from EV-001; drops "check-in" |
| c3 | "Ours: at the island-green 17th, guests watched from the rail." | EV-tripnerd-006 | CONFIRMED by record (same footage records as EV-002; footage not on disk). "Guests" INFERRED, as EV-002 |
| c4 | "Ours: a hosted spread, set out for guests." | EV-tripnerd-007 | Spread CONFIRMED (seen, IMG_1998); hosting that day CONFIRMED (EV-TN-AUG-04); this spread being for TripNerd's guests INFERRED |
| c7 | "TripNerd hosts guests at golf tournaments and other big events." | EV-tripnerd-004 | CONFIRMED |
| c7 | "Plan yours · link in bio" | EV-tripnerd-005 | BC-19 re-check pending |
| c1 photo | TripNerd tablecloth | EV-tripnerd-008 / EV-001 source photo | CONFIRMED (seen) |
| c1–c6 | Advice, questions and labels | none | Not claims about TripNerd |

**EV-tripnerd-003 ("steps") is unused in v2.**

### BC-54 pairwise scores (v2)

|  | c2 | c3 | c4 | c5 | c6 | c7 |
|---|---|---|---|---|---|---|
| **c1** | 0.309 | 0.329 | 0.306 | 0.349 | 0.339 | 0.114 |
| **c2** |  | 0.203 | 0.206 | 0.227 | 0.194 | 0.321 |
| **c3** |  |  | 0.217 | 0.221 | 0.204 | 0.356 |
| **c4** |  |  |  | 0.246 | 0.216 | 0.320 |
| **c5** |  |  |  |  | 0.206 | 0.370 |
| **c6** |  |  |  |  |  | 0.361 |

- Lowest pair: c1~c7 at 0.114, the two blue bookends; c1 carries the tablecloth photo, c7 is type-only.
- Lowest among the navy cards: c2~c6 at 0.194 (v1's lowest navy pair was 0.152).
