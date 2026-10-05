---
title: "TripNerd — Fan Experiences carousel (C03): finishing the owed September 'VIP Fan Experiences' draft"
type: campaign-bible
client: tripnerd
campaign_id: 2026-10-13-fan-experiences-carousel
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [campaign, bible, slim, instagram, carousel, static, organic, fans, owed-september]
---

# TripNerd: Fan Experiences carousel C03 (SLIM Bible)

> **Status: DRAFT v1. Machine QC passed. NOT GATED.**
> - `servicepow_static_qc.py`: exit 0, 362 passed, 0 failed ([`qc/v1/static-qc-v1.txt`](qc/v1/static-qc-v1.txt)).
> - The extra checks: exit 0, 112 passed, 0 failed ([`qc/v1/extra-checks-v1.txt`](qc/v1/extra-checks-v1.txt)).
>
> **Cards c1 and c3 carry a labelled empty frame** ("PHOTO TO COME · 17th-hole rail frame · Taylor's original"). The dual gate does **not** run until those frames are real.
>
> Nothing is approved by TripNerd, and nothing posts. Only the campaign director changes this status.

This Bible uses the SLIM form: `.claude/skills/servicepow-campaign-director/templates/campaign-bible-slim.md`. SLIM compresses authorship ceremony, never gates.

---

## SLIM block

| Field | Entry |
|---|---|
| **CAMPAIGN** | TripNerd · `2026-10-13-fan-experiences-carousel` · **C03** · **DEPTH: SLIM**.<br>Reasons:<br>- it is an **owed September deliverable**: the client brief's engagement state lists "2 carousels (VIP Fan Experiences …; Augusta …)";<br>- its slot is in the approved October plan;<br>- it uses only real photos and nothing generated |
| **SOURCE** | Karl's design artifact "TripNerd VIP Carousel", https://claude.ai/artifact/NAs9WAPrnjVkB321LhJuGT (3 Sep 2026; version read 2026-10-05).<br>Its design: 7 slides at 1080×1350, Poppins, accent #1FA2F4, yellow CTA #F5B324.<br>**All 7 photo slots were empty.** The artifact is left untouched; this build is a new set |
| **LANE** | A/B hybrid:<br>- real-photo panels on c5 and c6 (TripNerd's own camera roll, conventional grade only);<br>- type on c2, c4 and c7;<br>- c1 and c3 wait on the 17th-hole rail frames |
| **FORMAT** | Instagram carousel, 7 cards · `feed-portrait` 1080×1350 (4:5) · organic, no paid media · **slot Tue 13 Oct 2026, 1 PM ET**, if the frames arrive by Fri 9 Oct (test-month plan §3; the tracker) |
| **AUDIENCE** | **Fans and friend groups** traveling to a big event. Deliberately not C02's corporate hosts (C02 posts Thu 8) |
| **CLIENT TRUTH** | Read in full:<br>- [`../../client-brief.md`](../../client-brief.md), including the owner-approved hook direction ("a man visibly unhappy with where he's sitting → pay off with where TripNerd seats him");<br>- [`../../brand-guide.md`](../../brand-guide.md);<br>- [`../../evidence-register.md`](../../evidence-register.md);<br>- [`../../grok/02-knowledge-file.md`](../../grok/02-knowledge-file.md), for the words TripNerd uses and the can't-say list |
| **CLAIMS BOUNDS** | **Barred** ([`qc/v1/facts.json`](qc/v1/facts.json); case-insensitive substring):<br>Masters, Augusta, 2026, 2027, golf major, guarantee, best, #1, VIP, official, review, 5-star, five-star, sold out, limited, PGA TOUR, always, every, THE PLAYERS, handled, tripnerd.com, transport, ultimate, Super Bowl, field-level, years, one call, Book Smart, suite, steps.<br><br>**Required in the set:**<br>- "link in bio";<br>- the four EV proof sentences, verbatim (EV-tripnerd-004, 006, 007, 008).<br><br>**Never:**<br>- event marks in hashtags;<br>- guest faces;<br>- AI imagery |
| **CONCEPT** | Karl's spine, kept: the hook "you didn't come all this way to sit in row 40" → what TripNerd does instead → proof → "plan yours".<br>Card sequence:<br>1. hook;<br>2. "A ticket gets you in.";<br>3. the view from the rail;<br>4. the big events;<br>5. arrival;<br>6. the food;<br>7. close |
| **BEAT MAP** | The verbatim on-image text: [`copy-and-hooks.md`](copy-and-hooks.md) §2. Specs and manifests: [`qc/v1/specs/`](qc/v1/specs/), [`qc/v1/manifests/`](qc/v1/manifests/) |
| **ROUTING RECORD** | - **All readable text:** COMPOSITE, set by the composer (Montserrat ExtraBold with Inter).<br>- **Logo:** REAL-ASSET, the committed `brand-assets/tripnerd-logo-colour-1633x601.png`.<br>- **Photos:** REAL-ASSET, TripNerd camera roll; c5 is IMG_1901 (scrubbed working copy), c6 is IMG_1998. Each was cropped below the face/mark exclusion line, downscaled only, and given the conventional grade (`static_hosts/grade/grade.py`, presets c2 and c4).<br>- **Nothing generated.** BC-17/18/41: N/A |
| **GATES RUN** | ☒ Static QC (exit 0)<br>☒ Extra checks (exit 0; X7 proves downscale-only and the exclusion line)<br>☒ Faces: an eye check of both panels at full size (no face, no third-party logo)<br>☐ **Skeptic (isolated): NOT RUN.** Waits on the frames<br>☐ **Critic scorecard: NOT RUN.** Waits on the frames |
| **APPROVALS** | - **Finish the VIP carousel:** Karl (APPROVER), 2026-10-05 (chose "Finish VIP carousel"), then the plan was approved.<br>- **Copy changes:** in the approved plan (§ Decision log below).<br>- **Readiness:** pending the dual gate.<br>- **Taste check:** pending.<br>- **CLIENT_APPROVER:** TripNerd hasn't named one (**NEEDS INPUT**) |

---

## Copy changes from Karl's draft: what changed and why

Karl's structure and meaning are kept. Only barred or unproven words changed.

| Card | Karl's line (3 Sep) | Problem | v1 line | Proof |
|---|---|---|---|---|
| c1 | "Ultimate Fan Experiences / You didn't cross the country to sit in row 40." | "Ultimate" is hype (TripNerd's own phrase, but on the voice no-list). "Cross the country" assumes distance | Kicker "FAN EXPERIENCES" (TripNerd's own mark, printed on its table cloth, EV-001). Headline "You didn’t travel this far to sit in row 40." | Rail frame (pending) |
| c2 | "'VIP' shouldn't mean a ticket and a lanyard." / "Upper-deck seats. A buffet in a tent. A shuttle that leaves without you." | "VIP" is barred. It knocks competitors without proof. **It contradicts TripNerd's own proof**: its staff wear lanyards (EV-001) and its hosting proof is a buffet spread (EV-003/007) | "A ticket gets you in." / "Where you watch from is the part you remember." | Opinion line; no factual claim |
| c3 | "VIP means the field, not the parking lot." / "Field-level access / Stadium hospitality, hosted / [Hotel + transfers — confirm scope]" | "VIP"; no record of field-level access; a placeholder left in | "See it from the rail." / "Not from the back of the crowd." / proof band | EV-tripnerd-006, verbatim |
| c4 | "Super Bowl. Augusta. The big ones." / "[Add 2–3 more]" | Augusta is barred. Super Bowl is a third-party mark with no guest record on file. A placeholder | "Not just any event." / "The big ones." / "TripNerd hosts guests at golf tournaments and other big events." | EV-tripnerd-004, verbatim |
| c5 | "Hosting clients? One call. Every seat handled." | "Handled" and "every" are barred. "One call" is unproven. A host line in a fan carousel | "Know who to find when you get there." / proof band | EV-tripnerd-008, verbatim, with the IMG_1901 panel |
| c6 | "43 five-star Google reviews. Nine years of fans." / a quote placeholder | No primary source: both figures exist only in the 2026-08-25 Drive-OS sync of the client brief. A quote needs the real review plus the guest's OK | "Eat well between the big moments." / proof band | EV-tripnerd-007, verbatim, with the IMG_1998 panel |
| c7 | "Now booking 2026 & 2027 / Plan the big ones a year out. Book Smart. Trip like a Nerd. tripnerd.com Link in bio" | Booking years unconfirmed. "A year out" is advice nobody has stated. "Book Smart" has no source on file | "Bringing friends to a big event?" / "Trip like a Nerd." (TripNerd's own line) / CTA "Plan yours · link in bio" | EV-tripnerd-005 (BC-19 receipt still owed) |

**Order change:** Karl's c5 ("Hosting clients") and c6 ("reviews") slots now hold arrival and food, in the order a guest meets them.

**How the reviews card can come back:**
1. Karl screenshots TripNerd's Google Business Profile on his phone, dated.
2. TripNerd confirms its founding year.
3. Each fact gets an EV record.

The wording would then be "Rated 5.0 on Google (43 reviews, as of [date])". **Not** "43 five-star reviews": Google rounds the average, so a 5.0 shown on 43 reviews can include 4-star reviews.

## Design

- **Brand system:** TripNerd's palette, the same as C02.
  - Navy #202838 cards (c1–c3, c5, c6) and site blue #5896E9 (c4, c7).
  - Logo on a blue plate, top-left.
  - Navy text on blue (4.89:1); white or #18A0F0 on navy.
- **Karl's yellow CTA and Poppins are dropped.** Neither is in TripNerd's palette or type.
- **Different from C02,** so the feed doesn't repeat itself four days apart:
  - the cover is navy (C02's is blue) and leads with a photo frame;
  - no big numerals (C02 numbers its moments 1–4);
  - header labels name each card ("THE TICKET", "THE VIEW" …);
  - the photo crops differ:
    - c5 is the IMG_1901 left side (C02 used 1907 full width, and 1901 cloth only);
    - c6 is the tartlet plate up close (C02 used the wide spread).
- **File names** use `tripnerd-fanexp-C03-…`, not the plan's `vipfan`, so the barred word "VIP" appears nowhere in the deliverable files.

## Open risks (for the gate to judge)

1. **The hook's payoff is pending.** Without the rail frame, c1 promises a better seat and the set shows a table and food. **Do not gate or post v1 as is.**
2. **Proof overlap with C02.**
   - c3, c5 and c6 reuse EV-006/007/008, the same sentences C02 uses.
   - c5 and c6 show the same two scenes, cropped differently.
   - Whether two carousels four days apart can share proof lines is a judgement for the critic and Karl.
3. **Fans vs. hosts.** EV-006 says "guests". At this suite they were likely corporate guests. The c7 line "Bringing friends" invites fans without claiming the suite was a fan trip.
4. **"Row 40" at golf.** Golf has no rows. It's a metaphor for a bad seat from Karl's own hook, and the payoff is the rail. The Skeptic may flag it.
5. **BC-19:** "link in bio" depends on Karl's bio-link phone receipt (EV-005).

## Next steps

1. **Taylor's originals arrive** (the same upload unlocks R01 and C02):
   - pull the rail frames at ≥1080 px with no upscale;
   - crop out every guest face, the board and the named pro;
   - apply the same conventional grade;
   - fill c1 and c3 and remove the draft labels;
   - run QC again, as v2.
2. **Dual gate:**
   - freeze with sha256;
   - a fresh critic in `gate_fanexp_v2_critic_<epoch>`;
   - an isolated Skeptic in `gate_fanexp_v2_skeptic_<epoch>`, after a clean contamination grep;
   - spawn both in the same message;
   - transcribe both verdicts verbatim into [`gate-log.md`](gate-log.md).
3. **Karl's taste check, then TripNerd's approver.**
4. **Fallback, if the originals aren't in by Fri 9 Oct:**
   - C03 holds;
   - Tue 13 gets another static;
   - no Augusta photos or 720p frames in c1 or c3 without Karl's logged override.

## Decision log

| Date | Decision | Who |
|---|---|---|
| 2026-10-05 | Finish the owed VIP carousel (rather than the Augusta carousel or both) | Karl (APPROVER) |
| 2026-10-05 | Plan approved: rebuild in the static pipeline with TripNerd's palette; copy changes as tabled above; reviews card cut by default; c1 and c3 wait for the rail frames | Karl (APPROVER) |
| 2026-10-05 | v1 built, machine QC passed (both exit 0). Arrival and food order swapped; file prefix `fanexp`; "Book Smart" dropped (no source) | Claude (OPERATOR) |
