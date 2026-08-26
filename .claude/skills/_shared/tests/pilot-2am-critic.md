# Pilot: the critic vs. the killed v8 "2:07 AM"

**Why this pilot.** 911 Drain Video Pack 01 "2:07 AM" (3-hook, 9:16, ~15s) reached v8 and was
**killed on owner watch, 2026-08-20**. We have documented ground truth for exactly why. So the
question is not "does the critic produce output" — it is:

> **Does the critic independently reach the same verdict a human owner reached, without being
> told the answer?**

If the critic passes v8, the critic is wrong and gets fixed before anything else is built.

Run: scorecard applied to the five documented failures, checking whether each is caught by a
*named* mechanism rather than by general good taste.

---

## Result: 3 of 5 caught cleanly · 2 gaps found · both now fixed

| # | Documented failure | Caught by | Verdict |
|---|---|---|---|
| 1 | **Motion inert** | Machine check: *motion floor per clip AND per master shot* (check 31 requires a named motion axis per shot) | **CAUGHT** — hard block |
| 2 | **Dead-space open** | Machine check: *no opening dead-space*; ServicePow-6 axis *hook inside 2s* | **CAUGHT** — twice |
| 3 | **Dissolve-only cuts** | `cinematography-editor` — "dissolve-only editing is a symptom, not a style"; critic axes *editing* + *sequence coherence* | **CAUGHT** |
| 4 | **Price line too fast to read** | Machine checks verified expected strings were *present on screen*, but nothing checked they were **on screen long enough to read** | **GAP — MISSED** |
| 5 | **Uncited references** | LB30/LB51 enforced at storyboard time, but the critic had no independent re-check at QC | **GAP — MISSED** |

**A 3-of-5 critic is not a critic.** Both gaps were real: v8 would have scored poorly but could
have escaped a HARD FAIL verdict on the two missed items.

---

> ## ⚠ SUPERSEDED BY THE v4.0 MERGE (2026-08-26)
> Both gaps this pilot found **already existed in `servicepow-ad-producer` v4.0 as measured
> checks** — discovered when v4.0 was reconstructed from the Drive ledger later the same day.
> The measured versions win (decision 0004):
>
> | Pilot finding | Now enforced as |
> |---|---|
> | Gap 1 — legibility duration (my hard failure #13) | **Blocking check 32 — performance gate**, measured in WPM by `servicepow_performance_qc.py`. The recorded failing case *is* this ad's price line at **~242 WPM** — which breaches both the global line ceiling and the tighter ceiling the gate puts on any line carrying the price, offer or CTA. The thresholds themselves are in the playbook; read them there |
> | Gap 2 — reference citation audit (my hard failure #14) | **Blocking check 34 + LB51**, including the state amendment |
>
> The scorecard no longer carries #13/#14 — it points at the playbook. The history below is kept
> because the convergence is the point: two independent routes found the same two holes.

## Gap 1 — legibility duration

**The hole:** "expected strings verified on screen" is a *presence* check. A price, phone number
or licence number that flashes for four frames is present and unreadable. Presence ≠ legibility.

**Fix applied** — added to the machine-check sweep in `servicepow-creative-critic/references/scorecard.md`:

> **On-screen text dwell time** — every string the viewer is expected to read (price, phone, URL,
> licence number, CTA) is on screen long enough to be read at delivery speed. Rule of thumb: a
> short string needs ≥1s, a phone number or licence number ≥2s. Text present but unreadable is a
> **hard failure**, not a note — it is the same defect as text absent, plus wasted frames.

Also added to the hard-failure list as #13.

## Gap 2 — reference citation at QC

**The hole:** the storyboard is required to cite openable references (LB30/LB51), but nothing
re-verified this at QC. A reference cited at storyboard time and never opened is exactly the
"I looked" failure the law exists to prevent — and it survived to v8.

**Fix applied** — added to the compliance sweep:

> **Reference citation audit** — every shot claiming a real reference names one that can be
> opened *now*. A missing or unopenable reference is a **hard failure**, and is surfaced to Karl
> by name — never accepted silently (LB30/LB51). Verification honesty (LB29): a check that was
> not actually run is recorded as not run.

Also added to the hard-failure list as #14.

---

## Re-run after fixes

| # | Failure | Caught | Mechanism |
|---|---|---|---|
| 1 | Motion inert | ✅ | motion floor / motion axis |
| 2 | Dead-space open | ✅ | opening dead-space + hook-inside-2s |
| 3 | Dissolve-only cuts | ✅ | editing + sequence coherence |
| 4 | Price line too fast | ✅ | **blocking check 32 — performance gate** (~242 WPM, measured — over both the global ceiling and the price/offer/CTA ceiling) |
| 5 | Uncited references | ✅ | **blocking check 34 + LB51** state amendment |

**5 of 5. Verdict on v8: HARD FAIL** — motion-floor block, opening dead-space, check 32
(performance gate), check 34 (uncited reference). Matches the owner's kill.

Independently confirmed by the Drive install ledger, which recorded the same conclusion on
2026-08-20: *"the 911Drain price line at ~242 WPM stops being an unactioned observation and
becomes a failure of blocking check 32… The rebuild is storyboard-level, not a motion pass."*

**Regression rule:** v8 must keep failing. If any future scorecard edit lets it pass, the edit is
wrong.

**Re-confirmed 2026-08-26** against the real v4.0 thresholds (decision 0005). Nothing in the
verdict moved: the failure is now stated with numbers rather than judgment, which is the whole
improvement. The one change is procedural — the adversarial half of this pilot now belongs to
`servicepow-skeptic`, so a re-run exercises **both** gates and v8 must fail each independently.

---

## What the pilot also proved

**Composition.** The failures routed to their owning skills without overlap: motion → storyboard
(motion axis) and editor; dead-space → editor; dissolves → editor; dwell time → editor + brand
fidelity (legal copy legibility); references → storyboard. No two skills claimed the same fix, and
no skill needed to rewrite an upstream decision to make its own fix.

**Conflict protocol.** Failure #1 is the test case: motion inertness originates in the *shot
design*, not the edit. The editor cannot fix it alone — it raises a `## CONFLICTS` entry against
the approved shot list rather than quietly re-cutting around it. That is the intended behaviour
and the reason the protocol exists.

## Known weakness this pilot did not resolve

The pilot was run against **documented failure descriptions**, not against the video file — that
file is not in this repo. So the critic's *procedure* is verified; its *perception* (whether it
sees dead eyes in actual footage) is not, and cannot be until it runs on a real cut on Karl's
machine. Stated plainly rather than claimed as tested.
