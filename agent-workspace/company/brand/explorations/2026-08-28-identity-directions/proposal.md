---
title: "Service Pow visual identity — three directions for selection"
type: report
client: internal
owner: Karl
status: draft
created: 2026-08-28
updated: 2026-08-28
tags: [company, brand, visual-identity, exploration]
---

# Service Pow visual identity — three directions

**Why this exists.** `brand/visual-identity.md` is `NEEDS INPUT` in every section — logo, colour,
typography, imagery, layout, templates. That is not a documentation gap, it is a **production
blocker**: the intro video's endcard is provisional, its accent colour is a guess, and every
Service Pow asset after it hits the same wall. Owner decision, 2026-08-28: fix the root first.

**What is being decided here.** One of three directions. **Not** a typeface — every board is set
in Liberation Sans, which is a stand-in. Picking a direction unlocks the typeface question; it
does not answer it.

---

## 1. The brief, derived not invented

| Input | Source | What it forces |
|---|---|---|
| Service Pow's own site routes to **archetype I (experimental agency)**, A/D alt | `brand/style-bank.md` §vertical routing | The identity has to survive an experimental layout without becoming the experiment |
| Archetype I sits under **taste anxiety**, not competence anxiety | `brand/style-bank.md` — "Competence anxiety → B and F. Taste anxiety → A, G and I" | **The identity's job is to make a buyer think *these people have taste*.** Restraint is the mechanism. Anything that tries hard fails |
| Archetype I permits **"one 3D/gradient hero as the sole chromatic event"** | `brand/style-bank.md` | Near-achromatic, one decisive colour. Not a palette — an event |
| Defensible differentiators: the spec ad before they ask · realism discipline · platform-safe AI · tested variants not guesses | `positioning-and-icp.md` | The identity should read *production company*, not *marketing agency* |
| "Results metrics are a claim surface" | `brand/style-bank.md` | No badge, no trust-bar, no numbers in the identity system |
| Accessibility outranks fidelity; 4.5:1 body text | `brand/style-bank.md`, `visual-identity.md` | Measured, not asserted — every board prints its own ratios |
| Logos are real files, never generated (LB24) | `playbooks/ads/video-production.md` | This is Service Pow's **own** identity, designed and Owner-selected. Nothing here is generated, and nothing here is a client's mark |

**The one real tension:** the intro video is pitched *competence-calm*, but the Style Bank says
this archetype answers *taste* anxiety. Those are close but not identical. Taste anxiety is
answered by restraint and precision; competence anxiety is answered by proof and structure. All
three directions below lean restraint, which is the Style Bank's answer, and the film may need to
warm up half a step to match. **Flagged, not resolved.**

---

## 2. The three directions

| | **A — THE FRAME** | **B — THE CUT** | **C — THE MARK** |
|---|---|---|---|
| Idea | Everything we make lives inside a frame — an ad, a page, a shot. The mark is the frame | The wordmark is split by a hard rule at the join: an edit point | A precise eight-point burst — "pow" drawn with geometry instead of cartooning |
| Device | Two corner brackets | A full-height rule | A radial burst, exact construction |
| Accent | `#17457A` deep ink blue — **8.89:1** on paper | `#C2361B` signal vermilion — **4.93:1** | `#A85B00` deep amber — **4.51:1** |
| Says | Production discipline. Editorial restraint | Decisive. Video-first. The hottest thing on the page is the cut | Energy held under control |
| **Works as a favicon** | Weakly — brackets need something inside them | **No** — a bare rule reads as a bookmark, not a mark | **Yes** — the only direction that yields a real icon at 16px |
| Risk | Safest of the three. Brackets are common in agency identity; it has to be executed exactly or it reads generic | The rule can read as a divider rather than an edit, and it makes the name hard to set small | One bad decision from comic-book, and it pushes against the taste-anxiety brief |

All three accents clear 4.5:1 against their paper. That is **headroom, not a requirement** — the
system rule is that **accent is used for strokes, fills and devices, never for body text**, so text
contrast is satisfied by construction regardless of which accent is chosen.

### The honest read

**B is the most distinctive and the least functional.** It is the only one that says *video company*
without explanation, and the only one with no usable icon. Look at its 16px test on the board — it
disappears.

**C is the only complete system.** A wordmark, an icon, a favicon, an app mark, a watermark on an ad.
It is also the direction most likely to be judged as trying too hard, which is exactly the failure
mode the taste-anxiety brief warns about.

**A is the one that is hardest to get wrong and hardest to make memorable.**

---

## 3. What happens after you pick

1. **The typeface question opens.** Liberation Sans is a stand-in; the real face gets chosen and
   licensed, and the licence has to cover client-facing use (`visual-identity.md` requires this
   recorded). Until then nothing here is final artwork.
2. `visual-identity.md` gets filled in for real — logo rules, clear space, minimum size, misuse,
   the colour table, the type table, imagery and layout — replacing seven `NEEDS INPUT` blocks.
3. The intro video re-renders into the chosen palette. **One CSS variable, one 145-second render.**
4. The endcard stops being provisional and `-provisional-endcard` comes off the filename.
5. The video goes to Skeptic Pass 1 and the Kobe + DR-lens gate.

## 4. What this does not do

- **It does not produce final logo artwork.** These are directions rendered for judgement. Final
  artwork needs the real typeface, and vector masters need to land in `assets/` with a pointer file.
- **It does not set brand voice.** `brand-voice.md` is still `NEEDS INPUT` end to end — a separate
  and equally load-bearing gap.
- **It does not touch any client's brand.** Client work follows the client's own guide, always.

## Files

| File | What |
|---|---|
| `boards.html` | The three boards, rendered deterministically |
| `shoot.py` | Renders them — same pinned-Chromium pattern as the video build |
| `direction-A.png` · `direction-B.png` · `direction-C.png` | What the Owner is choosing between |
