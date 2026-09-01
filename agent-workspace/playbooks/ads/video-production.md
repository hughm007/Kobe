---
title: Video Production — what blocks delivery, and the pipeline that gets there
type: playbook
client: internal
owner: Karl
status: active
created: 2026-08-25
updated: 2026-08-26
tags: [ads, video, quality, qc, canonical, blocking]
source: servicepow-ad-producer v4.0 (2026-08-20), imported and split 2026-08-26. Verbatim archive at agent-workspace/archive/servicepow-ad-producer-v4.0-VERBATIM.md. See decision 0005.
---

# Video production — the blocking tier

> ## ⚠ OWNERSHIP MOVED — SUPERSEDED 2026-09-01 (Service Pow AI OS, Run 2)
> **The canonical home of the blocking checks, their count, and the delivery gates is now the
> Service Pow AI OS**: `~/servicepow-ai-os/data/blocking-checks.yaml` (count is DERIVED by
> `~/servicepow-ai-os/scripts/validate.py`; no file states it), with company law in
> `~/servicepow-ai-os/policies/` and the reasoning skills in `~/servicepow-ai-os/skills/`.
> This file remains as the historical import of ad-producer v4.0 (decision
> [0005](../../knowledge/decisions/0005-v40-consolidation.md)) — its list below is a dated
> snapshot, NOT the operative gate. Do not cite this file as an owner; point at the registry.
>
> **Three corrections applied on import**, because v4.0 contradicted itself:
> the count is **34** (v4.0 said 31 in three places while §8B said 34) · `Real-ref` is the
> **tenth** storyboard field, there is no eleventh · check 34 is **cited real reference** (the
> Drive claim file's "sport/domain accuracy" was wrong). The uncorrected original is archived.

**Where the rest lives — loaded when needed, never all at once:**

| Need | File |
|---|---|
| The 52 lessons (advisory) | [`references/lesson-bank.md`](references/lesson-bank.md) |
| The 14 hard boundaries + **the canonical gate chain (HB8)** | [`references/hard-boundaries.md`](references/hard-boundaries.md) |
| Production Law · realism standard · prompt craft · Style Prefix · AI-tells | [`references/prompt-craft.md`](references/prompt-craft.md) |
| QC thresholds · Eyes Protocol · Describe-Back · Skeptic gate | [`references/measurement.md`](references/measurement.md) |
| Claims, disclosure, rights | [`../../operations/compliance.md`](../../operations/compliance.md) |

---

## Doctrine

**REALISM FIRST.** If realism conflicts with anything — flashiness, cleverness, ambition —
realism wins.

**ONE BRAIN.** The pipeline's stages are hats worn by **one director in one session**, never
handoffs between separate agents. *Artifacts cross stage boundaries; interpretations never do.*
Every handoff between agents was a chance to drift from the brief.

**Consistency is won in asset prep and still frames, not in the video model.** Never try to fix a
bad scene with motion — get the still right first. A frame fix costs one image job; a clip fix
costs far more.

### THE VOLUME DOCTRINE
**Coverage beats polish, and the evidence is not close.** Across $1.29B of measured Meta spend (578,750 creatives), roughly **5% of creatives are winners and they absorb 55% of the spend**. Meta's own 1.1M-creative study puts **creative diversity at up to a 32% CPA improvement** — the single largest lever available. Advertisers who win ship many meaningfully different swings; they do not perfect one guess.

This changes what ServicePow optimises:
- **The unit of work is a pack, not an ad.** One concept family × 3–5 genuinely different hooks, shared body and payoff. Cost per additional variant is near-zero — that is the actual advantage generative video gives us, and gilding one asset throws it away.
- **Diversity means different ARGUMENTS, not different edits.** Three hooks that all argue "we're fast" is one swing, not three. Rotate the angle (LB37) across packs and vary the hook pattern within them.
- **Quality is a floor, not a ceiling.** Hold the realism laws and the blocking checks absolutely — research is clear that ads which merely *look* AI underperform whether or not they are. Above that floor, **spend the next hour on another variant, not on a better version of the same one.**
- **Kill the perfection loop.** If a variant needs a third rebuild, bin it and make a different one. The 3-draft rule already assumes ~⅓ of generated material ships.

---

## Smooth advert flow — law at every stage
Every advert plays as **one connected story**: hook → main message → visual scenes → CTA, with a clear beginning, middle, and end. Never choppy, disconnected, rushed, confusing, random, robotic, or like separate clips placed next to each other.

- **Script:** the hook leads directly into the main message; every beat sets up the next; the CTA lands as the *obvious next step* of the story. **Shuffle test:** if any two beats could swap and nobody would notice, the flow is broken — rewrite the connection.
- **Generation:** each scene visually leads into the next (shared subject, direction, location, or cause→effect). Flow cannot be edited into scenes that don't connect.
- **Edit:** every join must answer the shot before it. Fix order: reorder/trim → B-roll bridge → regen.
- **Pacing as the suspense engine:** suspense is built from **cutting rhythm and stillness-vs-motion contrast, never slow motion**. The proven pattern: a near-still opening held slightly too long → accelerating cut lengths (e.g. 2.0s → 1.4s → 1.0s → 0.8s) → rhythm break into one long held beat for the payoff. The break in rhythm is what makes the payoff read as significant.
- **QC:** the cold viewer explicitly checks flow — any stitched-together joint or bolted-on CTA gets flagged.

### THE HOOK LAW (v3.1 — research-backed)
The first seconds decide everything: on Meta, roughly half of a campaign's value is carried by the first 3 seconds, and a static first frame is the most-cited cause of weak thumbstop.
- **Frame 1 has visible motion** (subject or camera) — never a logo-only or static title open. This does NOT contradict the §2 "near-still opening" suspense pattern: near-still means visible life (rain, breath vapor, crowd shimmer, a slow drift) — alive but held. Static means dead pixels. Muted homepage heroes may open near-still; feed ads open with real motion.
- **The proposition is readable by second 3**; brand appears by second 5 on feed ads (a muted homepage hero may hold branding later — placement decides).
- Pick the hook from the **Hook Pattern Menu** at S1: problem→fix speedrun · before/after split · visual satisfaction/macro · pattern-interrupt framing · price-shock text · mystery/curiosity-gap image · real reaction face *(real client footage or UGC direct-address only — LB25 bans generated big reactions)* · slow push-in + hyper-specific caption · emotional scroll-stopper · behind-the-scenes raw · shock statement · mistake callout · persona callout · bold claim · native-format camouflage. Visual hooks work without dialogue.
- **A meaningful visual change lands every ≤3 seconds** (cut, zoom step, text beat, or angle change ≥30°).
- Post-ship targets (S9): hook rate ≥25–30% Meta / ≥30% TikTok / ≥25% Shorts; hold rate ≥50%; average watch ≥50% of duration. Below-benchmark hooks feed the next concept's WHY.

### THE PROBE PASS (v1.0 — 2026-08-31, promoted at third occurrence; ADVISORY tier)

Before any full render and before any gate on a code-rendered build: render a probe set — ~12
spread frames plus every snap and seam frame — and **look at each one as a stranger**. Clean code
is not evidence; across three consecutive build rounds of the company intro video, 15 composition
defects (collisions, unfinished draw states, floating objects, wrong-nesting transforms) were
invisible to code review and JS diagnostics, and all 15 were visible in the first probe frame that
showed them. Evidence: `knowledge/learnings/2026-08-31-frames-catch-what-code-review-cannot.md`.
Advisory, not a blocking check — it changes when you look, not what blocks.

### THE PERFORMANCE CHALLENGER RULE (v1.0 — 2026-08-26, Owner-directed; ADVISORY tier)
Production QA answers "is it correct?" Performance-Marketing QA answers "will someone care?"
**Correctness is the floor. Conversion is the objective.** The standing question, asked of
every board before sign-off (the Owner's words): *"If we removed 30% of the cleverness and
made this 30% more persuasive, would the phone ring more?"*
- **A pack whose concept leans on a clever mechanism ships with a problem/solution-first
  CHALLENGER cut built from the same production assets.** The challenger reorders, it does
  not reshoot: pain → the brand solving it → proof → work → relief → direct CTA.
- **The market decides between control and challenger — never a reviewer on paper** — on a
  metric chain stated before launch (e.g. 3-second hold → 25% video view → CTR → calls →
  cost per qualified lead).
- A structural beat under pressure ("does this scene earn its seconds?") is tested by
  CUTTING it from the challenger, not by arguing about it.
- This is ADVISORY doctrine, not a blocking check — it shapes the work at the point of
  making it, and the `servicepow-creative-critic` Direct-Response lens reads against it.
Origin: OWNER-CAUGHT, 911 Drain storyboard read #2 —
[the learning](../../knowledge/learnings/2026-08-26-correctness-floor-conversion-objective.md).

---

## The pipeline — stages, gates, artifacts
One director, nine stages. **A stage may not begin until the previous stage's artifact passed its gate.** No artifact = the gate did not run.

```
S0 Client Knowledge → S1 Concept+Script [Paul] → S2 Storyboard → S3 Key Frames + Gate 1.5
→ S4 Draft Generation [Steve] → S5 Machine QC → S6 Edit [D-Wade] → S7 Kobe Scorecard
→ S8 Owner Review → (team delivers) → S9 Results
```

**Evidence Rule (every gate):** a PASS with no pasted evidence — file path, metric, ffprobe output, screenshot, QC table — is an automatic FAIL.

**Status Header** at the top of every ad package (stage, gates passed, what's approved, blocked-on, single NEXT ACTION, file paths) — updated at every gate.

### S0 — Client Knowledge (before anyone writes anything)
0. **PREFLIGHT — run `python3 scripts/servicepow_qc.py --preflight` and paste the output BEFORE any other work.** It proves ffmpeg/ffprobe/numpy are present, reports whether OCR is available, and re-runs the harness's own segmentation self-test so the gate is proven able to fail, not merely able to run. **A FAIL here stops the session — do not generate.** This exists because on 2026-08-19 the harness was lost to a sandbox reset, the session proceeded anyway, and a whole pack was produced with no motion gate running (LB45). The harness lives in this skill's `scripts/` folder; if a sandbox has reset, re-stage it from here before continuing, never rebuild it from memory.
1. Open the **client knowledge base** (Section 10): brand kit, persona, offers, approved/rejected history + WHY, Asset Registry, media vault. No KB → create one from the brief first.
2. **Real-media inventory:** check the client's media vault BEFORE planning shots (Section 9). Real footage available changes the whole build.
3. Confirm brief minimums; resolve or list every `⚠️ NEEDS CLIENT INPUT`.
4. **Lock placement → aspect** (LinkedIn/YouTube 16:9; IG/FB/TikTok/Shorts 9:16 / 4:5 feed). A vertical placement gets a **native vertical build** — never a letterboxed or centre-cropped 16:9. If both are needed, they are composed separately.
4b. **Lock the placement's SOUND ASSUMPTION (v3.1):** homepage heroes and most feed placements autoplay MUTED — the story must land with zero audio (visual hook, on-screen text beats, readable action); the audio bed is a bonus layer for the sound-on minority. A homepage hero also gets a **loop decision**: if it autoplay-loops, the last frame must hand off to the first (composition returns home, motion resolves) — a hard cut back to frame 1 reads broken.
5. **WORTH-MAKING CALL:** one line on why this concept deserves credits. Weak answer → rework or park.
5b. **CREATIVE INPUT QUALITY SCORE (v3.5, high-priority work):** real assets · brand knowledge · customer knowledge · offer clarity · references · audio resources, each /10. Poor inputs → name the input limitation and recommend better assets — never attribute input-caused weakness to the tools (engine reference, Cross-Engine Machinery).
6. **State the full generation count and credit plan BEFORE making anything** — including the 3-draft multiplier on hero beats.

### S1 — Concept + Script [Paul hat]
- **Market scan first (15 min, logged):** 3–5 currently-running ads in the client's vertical; best/worst promoted to the Swipe File with a one-line WHY. *(External skills available: `competitor-profiling`, `competitors`.)*
- **EXTERNAL CONCEPT AIDS (v3.9 — they propose, this skill disposes):** `marketing-council` (a board of distinct marketing minds — the fastest way to fill the tournament's 8–12 *mechanistically different* candidates without convergence) · `marketing-psychology` (desire/mechanism) · `ad-creative` (hook copy and text variants) · `copywriting`/`copy-editing` (VO and captions before they become prompts). **Every candidate still faces the paper-Skeptic attack, the Hook Law, the Anti-Generic Gate and LB37.** No external skill directs a shot, storyboard, keyframe, or any production stage.
- Ship a **beat sheet with prompt-ready visual lines**, VO read, caption list, production notes.
- **FRESHNESS RULE (applies PER PACK, not per video):** every new **concept pack** = new concept, framework, hero character(s), setting — proven in the **Concept lineage** field against the client's ad history. Hook variants *within* a pack deliberately reuse the concept and assets — that's the product.
- **VARIANT PACK MODE (v3.4 — THE DEFAULT UNIT OF WORK, not a mode):** the deliverable clients buy is a **pack**: one concept family × 3–5 hook variants (different opening 3 seconds; shared body/payoff/CTA), in the placement's native aspect(s). One storyboard covers the pack with a per-variant hook block; ONE batched Gate 1.5 approves all variant start frames together; body/payoff clips generate once and are reused; machine QC runs per variant master; Kobe scores the pack's lead variant fully and each sibling on Hook/Flow/CTA axes. **A single one-off ad is now the exception and needs a reason.** See the Volume Doctrine in §1.
- Scripts must be **renderable**, obey Smooth Advert Flow, and pass the shuffle test.
- **HOOK TOURNAMENT (v3.5 — how the pack's variants get chosen):** 8–12 hook candidates (each with mechanism, first frame/action/text/audio, why the target stops, expected failure mode) → paper Skeptic attack → **the 3–5 survivors are the pack's hook variants.** Cheap prototypes (keyframe/animatic/temp audio, EXPLORATION budget) settle close calls — never finals spend. Full mechanics + mechanism taxonomy: `references/CREATIVE_PERFORMANCE_ENGINE.md`. Low-stakes work may take a one-line justified exemption.
- **STAKES CHECK (v3.5):** what does the customer want / what could they miss / what continues if unsolved / what does success feel like / why now. A flat concept with no desire, consequence or tension is reworked before scripting.
- **ANTI-GENERIC GATE (v3.5 — the logo-swap test):** could a competitor run this exact ad changing only logo, name and CTA? YES → rework a meaningful element (client truth, insight, device, offer, real asset, proof…). Where a Brand Device Kit exists (client KB slot 11), at least one device is considered; devices are **reused infrastructure — exempt from Freshness and Angle Rotation.**
- **GATE:** checklist passed; realism line checked; lineage genuinely different; hooks cross-checked against approved/rejected history; **tournament run (or exemption noted), stakes stated, logo-swap test passed;** **the ANGLE is declared in one line AND the client's last three angles are pasted from `10_Ad_History.md` as evidence.** No pasted excerpt = the angle gate did not run, and LB37 is unenforceable without it (an unlogged angle silently turns Angle Rotation, the Freshness Rule and LB28's "cite the precedent" into guesswork).

### S2 — Storyboard (mandatory artifact — this is where quality was being lost)
Before any image is generated, write the shot-by-shot storyboard. **Every shot gets:**

```
Shot N — [start]–[end]s
Story job:   [what this beat does for the ad — hook / proof / payoff / CTA]
Action:      [who does what, hyper-specific — every action passes the In-World Reason Test]
Camera:      [one named move, position, FOV/shot size]
Lighting:    [source, direction, level]
Audio:       [diegetic sound this shot contributes]
Text:        [on-screen text, if any — always burned in post from real files]
Source:      [REAL client footage / AI from client still / pure AI + why]
Real-ref:    [REQUIRED AND CITED (LB51) — a real-world source someone can OPEN (link, title, or named client media) plus the specific observed behaviors this shot copies. "I looked" is not evidence; the citation is. Applies to EVERY scene with a findable reference, not just trades — sport, hospitality, travel, retail, any domain with rules a viewer knows. If none exists, write exactly: NO REFERENCE FOUND — HIGH RISK — <scene> — <what would help>, and surface it to the owner. Claude never accepts that entry alone. Binds the KEYFRAME as well as the motion: the endzone error existed in the still.]
Angle:       [REQUIRED — the argument this pack makes for the business, e.g. speed-of-response / price transparency / the people behind it / proof / risk removal. Same on every shot in a pack; MUST differ from this client's previous deliverable (LB37)]
Motion:      [REQUIRED — which of the FIVE MOTION AXES this shot uses (LB46): camera translation / subject travel through depth / foreground occlusion event / focus change / light change. Name the axis AND how it is achieved. Hero beats name two. "The camera is locked and the subject talks" is not an axis — that shot goes back to the board. See references/SHOT_MOTION_AND_STAGING.md]
```

> **That is TEN fields — and v4.0 adds NO eleventh.** The owner ordered a real-reference field on 2026-08-20; building it revealed **the field already existed** (`Real-ref`, field 8, present since v3.1's Real-Reference Law). **A TripNerd football scene shipped with players running out of bounds behind the endzone anyway.** That is the third rule this session found already-written-and-skipped, and the most damning, because this one has a box on the form. **The defect was never a missing field — it was a field that accepted an unverifiable answer.** So LB51 does not add a field; it makes the existing one *citable and refusable*: a source you can open, or the explicit `NO REFERENCE FOUND — HIGH RISK` entry. **Adding an eleventh box would have been SOP bloat papering over an enforcement failure (§94).**
>
> **The ten (v3.7):** v3.3 and earlier listed eight and told you to check nine — an operator counting to nine either invented a field or ticked the box without counting. **Angle** is the ninth, and it makes LB37 enforceable at the point where it is cheap. **Motion** is the tenth, added after a whole pack shipped with no movement in any shot: it is the only field that forces the director to design movement *before* the gate can report its absence, and it costs nothing at the storyboard stage.

- **REAL-REFERENCE LAW (LB30 — owner-ordered, 2026-08-17):** before writing any shot's prompt, **search the web for real footage of that exact event** (game-day crowds, service calls, tailgates, whatever the scene is) and copy how real people actually behave — what their hands do, where phones point, how they stand, what they ignore. **Evidence standard for the Real-ref field:** source URL(s) + the specific observed behaviors being copied. Claude often cannot stream video — photos, video stills, image-search results, and detailed written accounts of the real event are valid evidence; an unreferenced claim ("real fans do X") is not. No real reference found → the shot is flagged HIGH-RISK and either redesigned around a referencable event or built from real client media. **Exemption:** a §9 "impossible shot" (deliberately unreal concept beat) is exempt from the lookup but must still pass the In-World Reason Test and be owner-approved at storyboard.
- **IN-WORLD REASON TEST (LB31):** every character action must have a reason inside the scene's world. If the honest answer to "why is he doing that?" is "to show the viewer the logo/app/product" — the action is fake and fails (rejected examples: a man spinning in circles to display a lanyard; a woman in a crowd holding her phone's home screen up to the camera). Exception: direct-address UGC, where talking to camera IS the format.
- Total ÷ shot count ≥ 1.3s (LB13). Hero beats identified and marked for the 3-draft rule.
- **SHOT-LENGTH LAW (LB33):** in the edit, pure-AI shots hold the screen **≤5 seconds by default** (openers/action 2–4s, faces 2–5s); the one exception is a **static-subject environment shot with no visible people, which may hold up to 7s**. Synthetic tells (breathing regularity, eye tracking) surface around 8s. Generate 6–8s takes for edit room, but cut before the tell window.
- The storyboard IS the Master Timeline seed (LB19) — clip order, story jobs, audio spine, continuity locks per joint.
- **FEELING SPEC (v3.5 — companion artifact, timeline-level):** for every meaningful ad, the emotional timeline — at each beat, the specific feeling AND its **observable on-screen cause** (Emotion Causality Rule: an emotion with no cause is a wish). The arc must land the CTA as the emotionally obvious next step. Specific states only ("relief", "anticipation", "recognition") — never bare "engaged/excited". Causes come from event, framing, cut rhythm, audio and small real behavior (LB25/30/31 unchanged).
- **SOUND SPINE (v3.5 — companion artifact where sound is meaningful, executed at S6):** the full-timeline sound design — TIME · diegetic · music · SFX · VO · silence · transitions · **emotional purpose** — plus the audio arc (where energy rises, drops, emphasizes, contrasts, lands the CTA) and the sonic-hook decision for second one. LB26 governs how the bed is built; the Spine governs what the sound is FOR. Remember most placements autoplay muted (S0 4b) — the sonic hook is the bonus layer, never load-bearing.
- **GATE:** every shot has **all TEN fields** filled (Angle, Motion and **a CITED Real-ref** included — v3.8 fix: this line said NINE while the template said TEN, the exact counting bug the nine-fields fiasco taught); every action passed the In-World Reason Test; flow reads as one story; **Feeling Spec exists with a cause per emotional beat; Sound Spine exists where sound is meaningful;** owner has seen the storyboard for anything concept-level.

### S3 — Key Frames + Gate 1.5 (hard stop before any video credit)
- Build assets per the **Production Law** (Section 4), then composite each shot's start frame.
- Frames are presented as a **numbered contact sheet with options** (2–3 per hero shot when the direction is open) and a stated recommendation — the owner picks. Number them; never make the owner describe frames in words.
- Frame checks before sign-off: action geometry, reverse-shot geography, prop-vs-spec, **corner sweep for baked watermarks/smudges** (they animate into gibberish), crowd variety, logo = real file composited (LB24).
- **GATE 1.5 — Start-Frame Sign-off:** owner approves the frames. **No video generation before this. Ever.**

### S4 — Draft Generation [Steve hat]
- **THE 3-DRAFT RULE:** every hero beat (the hook and the payoff at minimum) generates **three drafts** — A safest/most realistic, B more cinematic, C attention-grabbing — at working quality (720p/fast, silent). Pick the winner, THEN spend finals-quality credits (1080p, high bitrate, audio) on that one only. *30 rough clips and 5 excellent shipped shots beat 8 clips used because they were paid for.* Footage is expected to be binned.
- Non-hero connective shots: single take at working quality, finalize on pass.
- Composite every clip in the locked video model; **Iteration Protocol** (ONE variable per retry; simplify after 3 fails).
- Motion levers that actually work (LB23): speed lives in the **camera** (whip pans, jolts, operator overshoot, retreat-ahead-of-subject) and in subjects **crossing frame close to the lens** — "he moves quickly" does nothing.
- **GATE:** every candidate clip run through Machine QC (S5) before it is eligible for the edit.

### S5 — Machine QC (code-enforced — Section 7)
- Run `servicepow_qc.py` on **every clip** (clip mode) and later on **every master** (--master). Paste the output table into the ad package. Exit 1 = that file is dead: retime-and-remeasure, regen, or bin. Taste is never spent on technically broken clips.
- **THE CLIP GATE LEDGER (v3.7).** Every clip-mode run writes itself to `servicepow_clip_ledger.jsonl` automatically, keyed on the file's **md5** — PASS, FAIL or INDETERMINATE, with no way to record only the runs that went well. Before the edit begins, run `--gate-clips <every clip about to be used>` and paste the result. It **BLOCKS** any clip with no record for that exact hash, and any clip whose record is not PASS. Renaming a failed clip does not launder it; the hash is the identity.
- **INDETERMINATE IS NOT A PASS.** A clip whose motion could not be measured (featureless frames — fog, night, sky) is unmeasurable, not measured-and-passing. It requires `--accept-indeterminate "<name>"` from a named human. This path was found by the harness's own test, where a featureless clip scored INDETERMINATE, carried an overall PASS, and would have entered the edit with a green ledger entry.
- **GATE:** all clips entering the edit carry a pasted PASS table **AND** clear `--gate-clips` with exit 0.

### S6 — Edit [D-Wade hat]
- **NO RATING WITHOUT PLAYBACK:** watch every clip twice (full speed + frame-stepped at weak points). Unwatchable in this session → use the Eyes Protocol (§7B) on first/mid/last frames, and still mark **"UNVERIFIED — full playback not watched"** where true (LB29). Never claim QA that didn't happen.
- **INVISIBLE-CUT GRAMMAR (v3.1)** — how stitched clips become one flowing film: cut ON action (motion matches across the join); adjacent same-subject shots change angle ≥30° or shot size (else it reads as a jump cut); keep the point of interest in the same screen region across the cut (eye trace); match motion DIRECTION and camera height shot-to-shot; J-cut or L-cut every major transition. A join that breaks all of these needs a bridge shot or a regen, not a crossfade.
- Free extra check: the **Describe-Back Gate (§7C) may also be run on hero finals BEFORE the edit** — catching a nonsense action at the clip stage is cheaper than at the master.
- Rate: final = min(Realism, Consistency) ± 1. Realism ≤ 4 → regen with the precise lever named. Every regen gets a Regen Log row.
- **Assembly Manifest Law (LB17):** written ordered manifest from the Master Timeline BEFORE rendering; all audio re-encoded 48kHz stereo before concat; verify order + durations against manifest + full listen-through.
- **DESIGNED AUDIO BED (LB26):** one continuous bed per ad built in the edit from a single source — perspective changes are filter automation (lowpass + level for far/muffled, filter opens + gain slams on the reveal cut), never a different ambience per clip. Music (if any) in the edit only. Loudness-normalize, true-peak limiter ≤ −1 dBTP.
- **Grade sells the story:** grade is designed per ad (e.g. desaturated/lifted/cold for the "before", saturated/contrasty for the "after") and applied consistently — one grade family across the ad, two only when the story IS a before/after reversal.
- **DE-AI FINISH PASS (v3.1 — runs on every master, after the grade):**
  1. ONE unified grade across all shots (AI + real) — the single biggest cohesion lever; desaturate ~5–10%, slight contrast lift, soft highlight rolloff.
  2. **Temporal film grain** after the grade: `ffmpeg -vf "noise=alls=12:allf=t"` (dose 8–20 by platform: TikTok hotter, hero pages subtler). Grain must change every frame like a real sensor.
  3. Room tone / ambience continuous under EVERY cut — zero frames of dead silence anywhere; major transitions use J-cuts or L-cuts (incoming audio leads the picture, or outgoing audio bridges it).
  4. On-screen text max ~5–6 words per beat, inside platform safe zones (vertical: avoid bottom ~15% and top ~8%).
  5. Compliance note: do NOT strip file metadata by default — platform AI-disclosure rules (and EU AI Act labeling, in force Aug 2026) favor provenance; the disclosure toggle is set at the platform level on upload (S8 logs it).
- Captions muted-safe; endcard = brand color field + clean logo **from the client's real files**, **2–3s on vertical/feed placements, up to 5s on YouTube in-stream** (one rule, everywhere), CTA restates the ad's core benefit — never new information; music/ambience resolves under the endcard, never cuts dead.
- **SOUND-ONLY PASS + MUTE PASS (v3.5, where sound is meaningful):** review the edit twice — audio alone (is the energy arc audible, intentional, voice clear, music supporting not competing, nothing cheap, ending finished — does sound create emotion or merely fill silence?) and picture alone (does the message land at zero volume?). Executed against the Sound Spine; a serious sound-only finding blocks like any other edit defect.
- **GATE:** master passes `servicepow_qc.py --master` (pasted) + manifest verification + listen-through **+ sound-only/mute passes vs the Sound Spine** + **Describe-Back Gate (§7C)** + **Eyes Protocol frame review (§7B)**.

### S7 — Kobe Scorecard (the taste gate — Section 8)
- Runs ONLY after Machine QC passes. Score all nine axes, compute the verdict, log it.
- **GATE: overall ≥ 8/10 AND no axis ≤ 6, or the ad does not reach the owner as "ready."** Below the floor → targeted fix list (each failing axis names its precise lever) → fix → rescore. Every sub-floor score is logged to the client's Rejected+WHY library same day.

### S8 — Owner Review → Client (the finish line)
- Owner watches the master. **The team delivers — you never contact clients.** You stay internal, always.
- **HUMAN TASTE GATE (v3.5, presented alongside the master):** would I personally stop for this? does it feel real? does it make me FEEL anything? does the sound feel intentional? do I remember who made it? would I be proud to show the client? **what is the weakest moment?** Plus the **MEMORY TEST:** if the logo vanished after viewing, what would the viewer remember — beyond "some company"? If something feels wrong while AI scoring is high, INVESTIGATE: human intuition is a signal, not an inconvenience. Nothing-memorable gets logged even when shipping.
- **Disclosure & Rights line (v3.1, required in every ad package):** which platforms the ad targets and whether their synthetic-human disclosure toggle applies (Meta/TikTok/YouTube require it for photoreal synthetic people); confirmation every face is fully synthetic (no real-person likeness) or covered by client-supplied footage rights; testimonials never fabricated (hard boundary). This line is what makes the "platform-safe AI ads" promise true.
- **Delivery spec (v3.1):** H.264 MP4, yuv420p, 24fps-family, target loudness −14 LUFS / peak ≤ −1 dBTP; filename `CLIENT_campaign_concept_hookvariant_ASPECT_DURs_vN.mp4` (e.g. `TRIPNERD_seat_notforsale_hookB_16x9_30s_v2.mp4`).
- Verdict back → **targeted revisions only**, version bump, **same-day logging** into the client KB: hooks/angles/verdicts, production lessons, approved/rejected + WHY, Asset Registry updates, taste-ledger row.

### S9 — Post-publish Results
- Team logs live results (impressions, 3-sec hold %, CTR, leads) into the client KB. Monthly: winners/losers by hook type roll into the Hook & CTA Library. Realism is the floor; measured results are the strategy.
- **MEASUREMENT AIDS (v3.9):** `analytics` (tracking/UTM setup so results are attributable at all), `attribution` (which creative actually drove revenue), `ab-testing` (design the variant pack as a real experiment rather than five ads that happened to run). Outputs land in `21_PERFORMANCE_METRICS` — never in a second ledger.
- **CALIBRATION (v3.5):** every launched deliverable gets an extended Angle Ledger row in `21_PERFORMANCE_METRICS` — angle · **hook mechanism** · emotional arc · brand device(s) · audio strategy · predicted score · actual performance · calibration error · learning. **One ledger — the CPE calibration lives in these columns, never in a second file.** The Taste-Calibration Ledger remains SUSPENDED per v3.4; keep logging its rows unchanged.

### Standing rules at every stage
1. REALISM FIRST. 2. Production Law. 3. Generation counts stated before generating. 4. Fresh creative, reused infrastructure. 5. Lessons promote same day. 6. Lesson Bank read before generating. 7. Smooth Advert Flow. 8. One new Higgsfield project per video. 9. **Owner-Decision Gate (LB28, tiered v3.1):** a NOVEL materially ad-changing choice is asked, with options and a recommendation, before spend; a choice matching a pattern the owner has already approved in the client KB (same casting style, payoff style, crowd treatment, etc.) is **proceed-and-inform** — cite the precedent. Questions are batched per stage, never dribbled. 10. **Owner-Unavailable Rule (v3.1):** production never stalls silently at a gate — park the ad with a Status Header stating exactly what's awaited, prepare the recommendation and both options so the owner's return costs one decision, and move to other work. No gate is ever skipped because the owner was away.

---

<!-- HISTORICAL SNAPSHOT — canonical count now DERIVED from ~/servicepow-ai-os/data/blocking-checks.yaml -->
## What actually blocks delivery — the 34
**The audit counted ~600 discrete checks per ad across this skill, the lesson bank, four overlapping final checklists and the Skeptic passes. That is not rigour — for a one-person shop it guarantees silent skipping, and a check everyone skips is worse than no check.** §94 forbids it. So the rules are now tiered.

**BLOCKING (34). Every one has pasted evidence or the gate did not run:**

*Machine (harness, exit 0 required):* 1 resolution · 2 fps · 3 pixel format · 4 audio present/48k stereo · 5 **LUFS** · 6 no frozen sections · 7 no black sections · 8 clip motion gate (slow-mo) · 9 **master per-shot slow-mo** · 10 no flash cuts · 11 **aspect declared + matched** · 12 **duration declared + matched** · 13 **no letterbox/pillarbox** · 14 opening dead-space · 15 **expected strings on screen (`--expect`)**.

*Compliance (`38_COMPLIANCE_AND_CLAIMS.md`):* 16 every claim substantiated · 17 **no synthetic testimonial / no AI person as a real customer** · 18 platform AI disclosure set where required · 19 **ad-to-landing-page parity** · 20 rights cleared (music, footage, likeness, logos).

*Human/judgement:* 21 correct client + correct brand assets · 22 **ServicePow 6 ≥ 8, no axis ≤ 6** · 23 **Skeptic verdict = PASS or named-human-accepted CONDITIONAL** · 24 angle declared + rotated (LB37, ad-history excerpt pasted) **and the Anti-Generic Gate passed (logo-swap + memory test)** · 25 **a human actually watched it end to end.**

*Source-side (`scripts/servicepow_source_qc.py`, exit 0 required — v3.6):* 26 **any audio to be looped or layered is ASR-verified speech-free BEFORE use (`--bed`)** · 27 **the finished master's speech matches the declared lines exactly once each, with no undeclared speech (`--master --expect-line`)** · 28 **all burned text inside the platform safe area, 15%–70% of frame height (`--safe-area`)**.

*Enforcement-side (`scripts/servicepow_qc.py`, exit 0 required — v3.7). These three are not new standards; they are the three standards that already existed and were skipped anyway (LB45):* 29 **`--preflight` passed and pasted before any generation** — a gate that could not run is a BLOCK, and a session whose harness cannot self-test does not spend credits · 30 **`--gate-clips` returns exit 0 for every clip in the edit**, each matched to a PASS by md5; INDETERMINATE requires a named human via `--accept-indeterminate` · 31 **every shot names a motion axis at storyboard (LB46)** and no shot in the delivered master sits below the motion floor without that named acceptance.

*Delivery-craft (v4.0 — the three the human watch exposed):* 32 **the performance gate passes (`scripts/servicepow_performance_qc.py`)** — no line above 175 WPM, rhythm ratio ≥1.15, a breath ≥0.40s, a slow anchor ≤155 WPM, and any line carrying the price/offer/CTA ≤165 WPM. *(Origin: the 911Drain price line — the ad's key claim — ran at ~242 WPM and every installed gate passed it.)* · 33 **no shot fails the impossible-human-speed gate (`scripts/servicepow_biomech_qc.py`)** — an OSCILLATION failure blocks; VELOCITY and BURST warnings need a named human acceptance. *(Origin: a crowd sitting and standing faster than bodies move. The motion gate only ever looked down.)* · 34 **every scene with a findable real reference carries it, cited, in the storyboard's **tenth** field (LB51) *(corrected on import: v4.0 §8B said "eleventh" while §S2 says ten and "adds NO eleventh")***, or carries `NO REFERENCE FOUND — HIGH RISK` **surfaced to the owner with the scene named and the help needed stated.** Claude never accepts that entry alone. **This one is not machine-checkable and is not pretended to be** — it is enforced at the storyboard gate, before a keyframe exists.

**ADVISORY (everything else — the 52-entry Lesson Bank, the forensic sweeps, the craft rules).** They shape the work at the point of making it. They do not each get a checkbox at the end. A lesson graduates to BLOCKING only when it has caused a real failure twice, or can be machine-measured.

**Retired: the four overlapping final checklists** (§40, §99, §17 pre-flight, and this skill's pre-flight scan) collapse into the **34** above. One list, one place. (v3.8 fix: this line said 25, the header said 31, the pre-flight said 28 — three counts in one file.)

---

## Scoring
**v3.4 rebuild, operator-approved 2026-08-18.** The 26-axis card was replaced. Reason, on the evidence: Meta's 1.1M-creative study measured which creative properties actually move CPA and CVR (9:16 native · a visible human · text overlay · emotional hook inside 2s · layered audio = **16% lower CPA, 29% higher CVR**), and independent research (Taboola, 500M impressions) found that ads which merely *look* AI underperform whether or not they are. Twenty-six subjective axes measured neither, took too long to run per variant, and blocked the volume the same research says wins. **Six axes, five of them anchored to measured predictors.**

### The ServicePow 6 — the ONLY client-ready score
| # | Axis | 10 looks like | Anchored to |
|---|---|---|---|
| 1 | **Doesn't-look-AI** | A stranger would say it was filmed. No uncanny faces, no physics tells, no AI sheen | Measured: "looks-AI" underperforms regardless of origin; polished AI draws 29% negative sentiment vs 42–49% for sloppy |
| 2 | **Hook inside 2s** | Motion on frame 1, an emotional or curiosity beat landing before 2.0s, proposition readable by 3s | Meta-measured; harness `skeptic-opening` enforces the floor |
| 3 | **Human presence** | A real-feeling person on screen doing something with an in-world reason (LB31) | Meta-measured |
| 4 | **Format fit** | Native 9:16 (never centre-cropped), legible text overlay, captions, safe zones | Meta-measured; harness checks aspect + borders |
| 5 | **Audio design** | One continuous designed bed, layered, no stitched ambiences, no gibberish voice | Meta-measured; harness checks LUFS |
| 6 | **Message + CTA clarity** | A cold viewer can say what is sold and what to do next | Persuasion attack (Skeptic P3) |

**Ship floor: overall ≥ 8.0, no axis ≤ 6, reported as `X ± 1.5`.** No offset (see the ledger note).

### AUTOMATIC FAIL — independent of score, most now machine-checked
Wrong client · wrong logo · wrong phone/URL/address *(harness `--expect`)* · false or unsubstantiated claim · **synthetic testimonial or AI person presented as a real customer (FTC Fake Reviews Rule — civil penalties; disclosure does NOT cure it)** · missing platform AI disclosure where required · **ad promises something the landing page doesn't deliver** · broken CTA · obvious AI artifact in a focal area · confidential information · unprofessional presentation.

> **These are where ads actually die.** Platform rejections cluster on claims, disclosure and ad-to-landing-page mismatch — not on motion or freeze frames. Run `38_COMPLIANCE_AND_CLAIMS.md` before the score, not after.

### The 9-axis card — ROUGH CUTS ONLY
Hook · visual realism · brand accuracy · camera · continuity · audio · offer clarity · CTA · scroll-stop. Use it to fix an edit fast. **It may never clear a deliverable for a client.**

### Taste-Calibration Ledger (v3.4 — OFFSET SUSPENDED)
Claude's scores have run hotter than the owner's on both scored ads (The Seat: Claude ~7.5 pre-diagnosis vs owner 6.5 → Δ1.0; Reversal v1/v2: Claude ~7 vs owner 6.2 → Δ0.8). Known caveat: Claude's own scoring of the same ad has swung ±1.6 pre/post-diagnosis — the offset corrects bias, not variance, so treat predicted scores as a range, not a decimal truth.
- **SUSPENDED 2026-08-18 (audit finding).** The −0.9 offset was derived from n=2 while the same scorer's own variance is ±1.6 — a correction smaller than its noise, wired to a delivery block, producing an effective raw floor of ≈8.9 that nothing could clear. **Do not apply an offset.**
- **Report a range, not a decimal:** state the score as `X ± 1.5` and gate on the midpoint. Keep logging ledger rows (date · ad · Claude raw · owner actual · delta · root cause). **The offset may be reinstated only once the ledger has ≥5 rows AND the observed spread is smaller than the proposed correction.**

---

## Real-media-first — the local-business realism edge
Local companies need to feel real, and nothing reads realer than reality. **The hierarchy for every shot: real client footage > AI-enhanced real media > pure AI.** Pure AI is justified only when the client has no usable media for that beat, or the concept requires an impossible shot.

- **Monthly media ask (standing, per client):** real employees, trucks/vehicles, jobsites, equipment, before/after photos, storefront, testimonials, product/service footage. Phone quality is fine — real beats polished.
- **AI's job around real media:** impossible B-roll, animating stills, hooks, transitions, cinematic inserts, cleanup/upscale — enhancement of reality, not replacement.
- The storyboard's **Source field** (S2) forces the decision shot-by-shot, and "pure AI + why" must actually answer why.
- Real footage still passes Machine QC (specs) and the edit standards; it is exempt from the motion gate.

---

## Client knowledge system — one brain per client
**One Claude Project (or client folder) per client. Never one giant project for all clients.** The Project carries the ServicePow SOP (this skill) plus the client's own knowledge, so every session starts already knowing the client.

Standing structure per client:

```
[Client]/
├─ 01_Brand_Standards.md      logo files (vector+PNG), colors, fonts, voice, banned language
├─ 02_Customer_Persona.md     who buys, what they fear, what convinces them
├─ 03_Offers_CTAs.md          current offers, pricing lines, CTA library
├─ 04_Competitor_Swipe.md     competitor ads with WHY notes
├─ 05_Approved_Library.md     shipped ads + what the client praised
├─ 06_Rejected_Library.md     every rejection + WHY + the lever that fixed it
├─ 07_Asset_Registry.md       Higgsfield references, media IDs, character sheets, plates
├─ 08_Media_Vault/            the real-footage folder (monthly ask)
├─ 09_Campaign_State.md       live campaign, Master Timelines, results log
├─ 10_Ad_History.md           concept lineage — every hook/angle used, dated
└─ 11_Brand_Device_Kit.md     (v3.5) the client's repeatable creative devices — reused infrastructure, exempt from Freshness/Angle Rotation
```

- **Same-day logging is what makes this compound:** approvals, rejections+WHY, Kobe scores, new assets, results. After three months the library answers "what does this client approve?" better than taste does.
- At S0, reading this structure IS the intake. A missing file = a `⚠️ NEEDS CLIENT INPUT` line, not a guess.

---

## Revision & logging protocol
1. **Targeted revisions only.** Fix exactly what was flagged; never re-roll the whole ad; never fix at the edit what belongs at the source. Bump the version.
2. **Name the precise lever** in every regen request: clip, frame range, prompt line or reference, and the ONE variable changed. Regen Log row for each.
3. **Same-day logging** into the client KB: hooks/angles/verdicts, generation lessons, Kobe scores, approved/rejected+WHY, Asset Registry, ad history.
4. **Promote lessons same day** — confirmed working, generalizes, deduped, dated, and (where possible) machine-checked.
5. **Confirm the log in one line** — don't ask permission to log.
