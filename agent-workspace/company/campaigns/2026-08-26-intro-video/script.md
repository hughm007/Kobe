---
title: "Service Pow intro video — Script (60s hero) — REVISION 2"
type: report
client: internal
owner: Karl
status: draft
created: 2026-08-28
updated: 2026-08-28
tags: [company, video, intro-video, script, code-rendered]
---

# Script — Service Pow intro video (60s, 16:9 website hero)

**Revision 2.** Lockstep partner: `storyboard.md` (same revision number, or one of them is wrong).
**Runtime:** 60.0s · 1920×1080 · 30 fps · 1800 frames.
**Nothing here is rendered from a generative model.** Every frame is drawn by code.

---

## 0. Owner-supplied ground truth added this revision

| Fact | Source | State |
|---|---|---|
| The public URL is `servicepow.com` | Owner, in-session 2026-08-28 ("use this https://www.servicepow.com/") | **CONFIRMED by Owner** |
| The site's hero headline, subhead, palette, logo file | — | **NOT VERIFIED** — `www.servicepow.com` is blocked by this container's egress policy (curl: `CONNECT tunnel failed, response 403`; WebFetch: `EGRESS_BLOCKED`). Two independent attempts, two blocks. Not routed around. |

Consequence: the copy below is built **only** from canonical workspace files, not from the live
site. If the site says something different, the site wins and this script gets a revision.

---

## 1. Timing spine

| # | Beat | In | Out | Dur | Speech in | Speech out | Speech dur | Words | WPM |
|---|---|---|---|---|---|---|---|---|---|
| 1 | HOOK | 0.0 | 7.0 | 7.0 | 0.6 | 7.0 | 6.4 | 16 | **150.0** |
| 2 | WHO | 7.0 | 15.0 | 8.0 | 7.4 | 14.7 | 7.3 | 16 | **131.5** |
| 3 | PACKS | 15.0 | 26.0 | 11.0 | 15.3 | 25.6 | 10.3 | 23 | **134.0** |
| 4 | REAL+AI | 26.0 | 36.5 | 10.5 | 26.3 | 36.1 | 9.8 | 26 | **159.2** |
| 5 | SAFE | 36.5 | 44.5 | 8.0 | 36.9 | 44.2 | 7.3 | 16 | **131.5** |
| 6 | BUILD | 44.5 | 52.5 | 8.0 | 44.8 | 52.2 | 7.4 | 17 | **137.8** |
| 7 | START | 52.5 | 57.2 | 4.7 | 52.8 | 57.0 | 4.2 | 10 | **142.9** |
| 8 | END | 57.2 | 60.0 | 2.8 | — | — | — | 0 | — |

**Pace checks (thresholds live in `playbooks/ads/video-production.md`, not here):**

- Fastest line: REAL+AI **159.2** — under the ceiling ✅
- Slow anchor: SAFE **131.5** — this is the trust beat and it is the slowest paid-attention line ✅
- CTA line: START **142.9** — comfortably under the CTA cap ✅
- Rhythm ratio: 159.2 ÷ 131.5 = **1.21** — over the floor ✅
- Overall: 127 words ÷ 52.7s of speech = **144.6 WPM**
- Silence: 60.0 − 52.7 = **7.3s** (12.2% of runtime), all of it load-bearing

**Breath gaps** (speech-out to next speech-in): 0.4 · 0.6 · 0.7 · 0.8 · 0.6 · 0.6 — every gap at or
over the floor ✅. The longest breath (0.8s) sits before SAFE on purpose: the trust beat gets air.

---

## 2. Voiceover — full read

> Delivery note: competence-calm. This is not an excited read. The primary emotion in the bible is
> **relief that someone has a system**, and an energetic VO actively fights that. Nearest reference:
> a good contractor explaining what they're going to do, not a promo.

**1 · HOOK** (0.6 → 7.0)
> "Most marketing money buys one ad. One idea. One guess. No way to know what worked."

**2 · WHO** (7.4 → 14.7)
> "Service Pow makes video ads. We also build the sites and run the social around them."

**3 · PACKS** (15.3 → 25.6)
> "You don't get one video. Two concepts, two hooks — four finished ads in five to seven business days. Four chances, not one guess."

**4 · REAL+AI** (26.3 → 36.1)
> "It won't look like a robot made it. Your footage stays the hero — AI builds the world around it. Shots that used to need a crew."

**5 · SAFE** (36.9 → 44.2)
> "It has to be safe to run. Disclosure handled. No fake testimonials. Every claim backed up."

**6 · BUILD** (44.8 → 52.2)
> "The ad needs somewhere to land. We build the page, the captions, the end cards — in code."

**7 · START** (52.8 → 57.0)
> "So we'll make one for your business — before you ask."

**8 · END** (57.2 → 60.0)
> *(no VO — wordmark and URL settle in silence)*

---

## 3. Burned text — every string, with legibility math

Measured in **characters per second**, not WPM. Comfort band is an **upper bound**: a string may
dwell longer than the band requires (that is easier, not harder), but never shorter. Minimum dwell
floor for any string: 0.8s.

| # | Beat | String | Chars | In | Out | Dwell | cps | Verdict |
|---|---|---|---|---|---|---|---|---|
| T1 | HOOK | `One ad. One guess.` | 18 | 3.4 | 6.6 | 3.2 | **5.6** | ✅ |
| T2 | WHO | `SERVICE POW` | 11 | 8.0 | 15.0 | 7.0 | **1.6** | ✅ |
| T3 | WHO | `video ads` | 9 | 10.6 | 14.6 | 4.0 | **2.3** | ✅ |
| T4 | WHO | `websites` | 8 | 11.6 | 14.6 | 3.0 | **2.7** | ✅ |
| T5 | WHO | `social` | 6 | 12.6 | 14.6 | 2.0 | **3.0** | ✅ |
| T6 | PACKS | `2 concepts × 2 hooks` | 20 | 16.4 | 20.4 | 4.0 | **5.0** | ✅ |
| T7 | PACKS | `4 finished ads` | 14 | 20.2 | 23.0 | 2.8 | **5.0** | ✅ |
| T8 | PACKS | ~~`5–7 business days`~~ — **superseded, see §4a** | — | — | — | — | — | ⚠️ |
| T9 | REAL+AI | `Your footage stays the hero` | 27 | 29.4 | 33.0 | 3.6 | **7.5** | ✅ |
| T10 | REAL+AI | `AI builds the rest` | 18 | 33.2 | 36.2 | 3.0 | **6.0** | ✅ |
| T11 | SAFE | `Disclosure handled` | 18 | 38.6 | 44.4 | 5.8 | **3.1** | ✅ |
| T12 | SAFE | `No fake testimonials` | 20 | 40.4 | 44.4 | 4.0 | **5.0** | ✅ |
| T13 | SAFE | `Claims substantiated` | 20 | 42.2 | 44.4 | 2.2 | **9.1** | ✅ |
| T14 | BUILD | `The page it lands on` | 20 | 46.4 | 49.4 | 3.0 | **6.7** | ✅ |
| T15 | BUILD | `Captions. End cards. Titles.` | 28 | 49.6 | 52.4 | 2.8 | **10.0** | ✅ |
| T16 | START | `We make the first one before you ask.` | 37 | 54.0 | 57.2 | 3.2 | **11.6** | ✅ |
| T17 | END | `SERVICE POW` | 11 | 57.4 | 60.0 | 2.6 | **4.2** | ✅ (repeat of T2 — recognition, not first read) |
| T18 | END | `servicepow.com` | 14 | 58.0 | 60.0 | 2.0 | **7.0** | ✅ |

### 3a. Simultaneous-read load (the check a per-string table hides)

Per-string cps passes are worthless if three strings share the screen. Every window where more than
one **unread** string is on screen:

| Window | Strings on screen | New chars | Dur | Aggregate cps | Verdict |
|---|---|---|---|---|---|
| 10.6–11.6 | T3 | 9 | 1.0 | 9.0 | ✅ |
| 11.6–12.6 | T3(read)+T4 | 8 new | 1.0 | 8.0 | ✅ |
| 12.6–14.6 | T3,T4(read)+T5 | 6 new | 2.0 | 3.0 | ✅ |
| 20.2–23.0 | T7 only (T6 retired 20.4, 0.2s tail) | 14 | 2.8 | 5.0 | ✅ |
| 23.2–25.8 | T8 only (T7 retired 23.0) | 17 | 2.6 | 6.5 | ✅ |
| 29.4–33.0 | T9 only | 27 | 3.6 | 7.5 | ✅ |
| 33.2–36.2 | T10 only (T9 retired 33.0) | 18 | 3.0 | 6.0 | ✅ |
| 38.6–40.4 | T11 | 18 | 1.8 | **10.0** | ✅ |
| 40.4–42.2 | T11(read)+T12 | 20 new | 1.8 | **11.1** | ✅ |
| 42.2–44.4 | T11,T12(read)+T13 | 20 new | 2.2 | **9.1** | ✅ |
| 58.0–60.0 | T17(repeat)+T18 | 14 new | 2.0 | 7.0 | ✅ |

**PROPOSED MEASUREMENT RULE — flag this to the Skeptic, do not assume it survives.**
For a **cumulative stack** (SAFE's three ticks: lines land one at a time and stay), cps is measured
on the **newly arriving line against its own uncontested window**, not on the whole stack against
the last line's window. The argument: once a line has had its uncontested dwell it becomes
recognition, not reading load. The counter-argument the Skeptic should press: on a **muted social
autoplay**, a viewer arriving mid-beat has read nothing, and for them the stack at 42.2 is 58 chars
in 2.2s = **26.4 cps**, a hard fail. This rule is **not settled**. It is written here so it can be
attacked rather than assumed. If it falls, SAFE stretches or the strings shorten.

### 3b. Everything the burned text is deliberately NOT

No price. No client name. No results figure. No "trusted by". No email marketing. No Google LSA.
No logo. Cross-checked against §2 of `campaign-bible.md` line by line — all six bars clear.

---

## 4. Claim audit — every asserted sentence, with its source

| # | Claim as it reaches the viewer | Class | Source | Verdict |
|---|---|---|---|---|
| C1 | "Most marketing money buys one ad… no way to know what worked" | frame-narration (about the market, not about us) | — | Rhetorical framing, not a measurable assertion. No figure given. ✅ |
| C2 | "Service Pow makes video ads" | self-description | `company/services.md` | ✅ |
| C3 | "We also build the sites and run the social around them" | self-description | `company/services.md` (both listed live) | ✅ |
| C4 | "Two concepts, two hooks — four finished ads" | offer definition | `company/services.md`, pilot pack, verbatim | ✅ |
| C5 | "in five to seven business days" | **delivery commitment** | `company/services.md` — "5–7 business days **from receipt of client assets**" | ⚠️ **The source is conditional; the VO is not.** See §4a. |
| C6 | "It won't look like a robot made it" | product claim | `company/services.md` — "beats the 'it looks AI' objection" | ✅ as an intent claim; it is our own promise about our own output |
| C7 | "Your footage stays the hero — AI builds the world around it" | method description | `company/services.md` — "client's real footage as hero shots, AI environments and B-roll" | ✅ |
| C8 | "Disclosure handled. No fake testimonials. Every claim backed up." | compliance claim | `company/positioning-and-icp.md` — "platform-safe AI ads" | ✅ — and it is a claim we are then bound by |
| C9 | "We build the page, the captions, the end cards — in code" | method description | `company/services.md` + decision 0002 | ✅ |
| C10 | "We'll make one for your business — before you ask" | **operational commitment** | `company/positioning-and-icp.md` — "the spec ad made before they ask" | ⚠️ See §4b — Owner ruling needed |

### 4a. C5 — the conditional that got dropped

The source says 5–7 business days **from receipt of client assets**. The VO says "in five to seven
business days" with no condition attached, which a viewer will hear as *from hiring you*. That is a
gap between what we can deliver and what we appear to promise — the exact defect class this
workspace exists to catch, and the same defect as an unqualified performance figure.

**Resolution applied:** the condition moves to the burned text, which is where a qualifier can live
without wrecking the VO's rhythm. **T8 becomes `5–7 days from your footage`** (28 ch).
Recomputed: 28 ÷ 2.6s = **10.8 cps** ✅ — still inside the band, no timing change needed.
T8 in the table above is superseded by this line. The VO is left alone; the burn carries the
condition, and burn and VO are read together.

### 4b. C10 — the one claim that creates an obligation

"We'll make one for your business — before you ask" is sourced: it is Service Pow's own stated
differentiator in its own positioning file. But it is different in kind from every other line here,
because **it is the only one a viewer can hold us to**. If this runs on the homepage, every inbound
enquiry arrives expecting a spec ad to already be in motion, at zero revenue, for anyone who asks.

That is a capacity decision, not a copy decision, and it belongs to the Owner. Three options, for
sign-off:

1. **Keep it as written.** Strongest differentiator in the video; strongest inbound pull; unbounded
   obligation.
2. **Bound it** — "we'll make one for your business first" (drops the free-before-you-hire
   implication, keeps the sequence). Weaker pull, no capacity exposure.
3. **Cut to a plain CTA** — "So let's start with one." Safest, and materially less interesting.

**Recommendation was option 1**, because it is the single most differentiating thing Service Pow
does and the video has no other proof to offer, *and* because a one-person shop can throttle a
spec-ad promise by simply being slow to a bad-fit lead.

> ### ✅ OWNER RULING — 2026-08-28
> **Option 1. Keep it as written.** Signed by Karl (Wyatt), in-session.
> The line stays: *"So we'll make one for your business — before you ask."*
>
> **What this now commits Service Pow to.** Every enquiry that arrives through this video is
> entitled to expect a spec ad already in motion, at zero revenue. That is accepted deliberately,
> not overlooked. Two things follow and are recorded here so they are not rediscovered later:
> 1. The **throttle is qualification, not silence** — a bad-fit lead is declined, not ignored. The
>    hard gates in `positioning-and-icp.md` are what stop this becoming unbounded.
> 2. **Call-qualification tracking has to exist before this video runs anywhere**, for the same
>    reason it is a pre-launch item on 911 Drain: an unmeasured promise cannot be throttled.
>
> C10 is now a **registered claim**, not an open question. It moves out of §5's gap list.

---

## 5. What this script does not do (stated, not hidden)

- **No proof.** No client, no result, no number. That is the correct call given the barred list, but
  it means the video runs entirely on assertion + craft. The craft has to carry it, which is why the
  animation quality is not decoration here — it is the only evidence in the file.
- **No named audience.** The wedge (home services, local trades) is never spoken. Deliberate: the
  positioning file calls it "the WEDGE, not the ceiling", and a homepage hero that says "for
  plumbers" caps the company on its own front door. The *visuals* lean trade-adjacent so the wedge
  self-selects without the copy excluding anyone.
- **No price and no timeline promise beyond C5.** Both by Owner decision.

---

## 6. 20s social cutdown — spec only, do not build until the 60s is signed

Derived from the same scene code, re-timed. Not a crop of the 60s render — a re-render at new
timings, because burned text at 20s pace needs its own cps pass.

| Beat | Source | New window | Note |
|---|---|---|---|
| HOOK | beat 1, compressed | 0.0–3.5 | VO: "Most marketing money buys one ad. One guess." (10 words) |
| PACKS | beat 3 | 3.5–10.0 | the 2×2 snap is the whole middle |
| REAL+AI | beat 4, compressed | 10.0–15.5 | drop "shots that used to need a crew" |
| START | beat 7 | 15.5–18.5 | unchanged line |
| END | beat 8 | 18.5–20.0 | wordmark + URL, 1.5s — **needs its own cps check, likely fails at 1.5s** |

WHO, SAFE and BUILD are cut. Consequence to be argued at the gate: the 20s version loses the
compliance beat, which is the differentiator competitors ignore. That may be the wrong cut. Flagged,
not resolved.

---

## Revision log

| Rev | Date | Change |
|---|---|---|
| 1 | 2026-08-28 | First draft. Timing spine, VO, 18 burned strings with cps, simultaneous-read table, claim audit. Two claims escalated (C5 resolved in-file, C10 to Owner). Cumulative-stack measurement rule proposed and flagged for attack. |
| 2 | 2026-08-28 | Built and rendered. **No timing, VO or copy changed** — the spine survived contact with the build intact. The superseded T8 row is struck through in the table so it cannot be read in isolation; §4a's replacement string is what is on screen. Contrast measured at render time rather than asserted: ink/ground **15.97:1**, accent/ground **5.93:1**, light/plate **12.40:1** — all clear of 4.5:1. |
