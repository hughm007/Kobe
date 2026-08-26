---
title: "Prompt Craft, Production Law and the Realism Standard"
type: playbook
client: internal
owner: Karl
status: active
created: 2026-08-26
updated: 2026-08-26
tags: [ads, craft, generation, realism, canonical]
source: servicepow-ad-producer v4.0 §4–§6 (2026-08-20), imported verbatim 2026-08-26. See decision 0005.
---

# Prompt craft, Production Law and the realism standard

> **Canonical home for how shots are actually built.** Load at generation time — not into every
> task. What *blocks delivery* is the 34 in [`../video-production.md`](../video-production.md);
> this file is how you avoid needing them.

## 4. PRODUCTION LAW — build assets separately, then composite

> **Non-negotiable. Never generate a final clip straight from a text prompt.**
> *Characters → Backgrounds → Objects, each built and locked on its own — THEN combine them into every clip.*

| Asset type | Built how | Output |
|---|---|---|
| **People / characters** | A character-sheet flow | 85mm close-up + 35mm full-body, grey background, single face |
| **Backgrounds / locations** | A location flow | Empty location plate at a **3/4 angle** |
| **Objects / props** | An image model that holds legible detail | Turnaround sheet, multiple angles, no third-party branding |
| **Brand marks** | **The client's real vector/PNG files — never generated** | Composited onto stills (LB24) |
| **Composite / video** | The locked video model — always the newest stable one | Plate as `start_image` + people/props as references |

> **Which tool fills each row is volatile and is not stated here.** The current assignment, dated
> and sourced, is in [`higgsfield-capability-map.md`](../../../../.claude/skills/servicepow-higgsfield-intelligence/references/higgsfield-capability-map.md).

Order: (1) characters (one locked face, erase duplicates, bake state variants); (2) empty 3/4 plates, no people; (3) prop sheets; (4) **composite each start frame** — including the real logo onto any branded prop — and sweep it clean; (5) generate scene-by-scene, assemble in the edit. Diegetic audio only in generation; **the audio bed and music live in the edit**.

**Violations:** text-only final clips; multi-face references; flat head-on plates; AI-painted logos or legible brand text in motion generations; a different Style Prefix per clip. **The law also applies to camera moves (LB22):** if the model would have to invent a space mid-motion, build the space as an asset and split the shot.

---

## 5. REALISM STANDARD — real life, real physics, hyper-specific

Every video must look **filmed in real life** and **obey real-world physics**.

### 5.1 Hyper-specific writing — the 5X bar (LB12, permanent)
Vague writing produces fake-looking video. Every element the camera will see is described concretely — at a bar 5x higher than feels natural:
1. **Count everything** — "seven guests," never "guests."
2. **Place everything** — each named person/prop gets a position.
3. **Describe each foreground person individually** — build, hair, exact garment and color, what they hold, what they're doing.
4. **Describe what surrounds the CAMERA** — overhead, left, right, near-foreground, behind the subject.
5. **State every timing in seconds and every camera move as one specific named motion.**
6. **Crowd-Variety Clause:** background crowds get an explicit variety line ("varied ages, builds and clothing, no two people dressed alike, no repeated faces, no synchronized poses") or the model clones the featured outfits.
7. **Swept-Frame Clause:** any smudge, mark, or **corner pseudo-watermark** in a start frame WILL animate into gibberish — sweep all four corners and clean the source image at the STILL stage before generating video.

Every prop/surface/garment gets material, exact color, pattern, size, mounting, wear. **A prompt where any visible thing is left generic FAILS pre-flight.**

### 5.2 Real physics & real people
Gravity & weight; momentum & inertia; contact & shadows; real human motion (breathing, blinking, micro-pauses); truthful materials; physical continuity across cuts. **Bodies use furniture correctly: seated means hips in the seat, knees bent, feet planted, head at seated height** — a figure hovering behind or above furniture is an automatic reject. Forbidden: impossible motion, floating/teleporting props, over-emoting faces, plastic skin, HUD/neon overlays, morphing backgrounds, camera moves a real operator couldn't do.

### 5.3 Performed emotion is fake (LB25 — scope: GENERATED faces)
Current video models cannot do the micro-timing of big visible emotion. **Generated** celebrations, laughs, claps and hand-raises at readable distance look acted — a real client called it "way too fake." Payoff beats use: **back-of-head framing** (the viewer projects themselves in), **stillness** (held face, one slow blink), or **small physical business** (lean forward, hand on the rail, weight shift). If a generated face must react: tiny, brief, never at camera. **Real client footage of real reactions is exempt — and is the preferred way to get a reaction beat.** This ban is model-capability-dated: re-test on one throwaway clip after each major model update.

### The test every stage applies
> **"Could this exact shot be filmed with a real camera, and would a stranger believe it's real footage?"**

---

## 6. PROMPT CRAFT — photoreal generation

### 6.1 Core levers (priority order)
1. Lock every recurring element as a named reference before animating. 2. Specific, structured prompts (shots + duration + aspect up top; subject → setting → camera → mood). 3. Kill AI tells explicitly with negatives, grain, physics cues, controlled motion.

### 6.2 Model selection
> **⚠ VOLATILE — verify before relying on it.** Named models, credit figures and
> thresholds below were true on 2026-08-20. Current values live, dated and sourced, in
> [`higgsfield-capability-map.md`](../../../../.claude/skills/servicepow-higgsfield-intelligence/references/higgsfield-capability-map.md).
> The *technique* here is durable; the *numbers* are not.

- **One locked video model per ad**, and it is the newest stable release of the family we have
  standardised on — not a per-shot choice. Start with **1–2 references**, not more.
- **Its known weak spots are the durable part:** continuity degrades in long or slow shots, and
  fast complex motion warps. Design around those regardless of which release is current.
- **Image work splits by job:** one model for characters and keyframes, one for compositing, clean
  edits and prop sheets. The job is durable; the model filling it is not.
- **Which model is current is not written here** — it is in the capability map, dated.
- **On any model update: re-verify the locked parameter set on one test clip before a client ad
  uses it.**

### 6.3 The locked Style Prefix
ONE identical Style block on every clip of an ad. Photoreal template:
```
Style: Photorealistic cinematic commercial — warm, grounded, real. No 3D render, no game engine, no cartoon, no VFX. 24fps smooth motion, physical cine lens 35-85mm, 180° shutter motion blur. Cinematic natural lighting, soft atmospheric haze, film grain, tactile macro detail on skin, fabric and metal. Skin: pore-level realism — visible pores, vellus hair, asymmetric moles, capillary flush. Physics: real mass, gravity and inertia respected, correct contact shadows, no floating. Continuity: characters, props, environment identical across every cut. No warping or melting geometry, no design drift, no identity drift, no neon eyes. Audio: diegetic ambience and environmental SFX only. No music. No subtitles.
```
High-realism token stack to append: `35mm film quality, professional color grading, sharp focus, high detail texture, halation on highlights, soft highlight rolloff, slightly desaturated tones, practical VFX feel, natural imperfections`

### 6.4 The AI-tell kill list
1. Plastic skin → `no 3D, no cartoon, no VFX` + pore recipe + film grain. 2. Bad hands → give hands a specific task. 3. Dead eyes → `living eyes with catch-lights, a single slow blink`. 4. Floating objects → physics block + `parallax-locked, correct occlusion, contact shadow`. 5. Warping/drift → `no warping or melting geometry` + POSITIVE LOCKS. 6. Garbled text → real files only, composited (LB24). 7. Flicker → oner framing, clips 6–8s. 8. Too-perfect motion → `handheld shake, focus breathing`, operator error written in (overshoot, late follow, one correction). 9. **Slow motion → banned outright.** No slow-mo beats. Prose bans don't work — the measured motion gate enforces it (LB23). Suspense comes from cut rhythm (Section 2). 10. Melting crowds → 4K for crowds/fast motion/fine texture. 11. Blurry inputs → sharp references only. 12. Gibberish crowd voice → Crowd-Voice Law (LB26). 13. Phantom phones in selfie framing → Phone-Is-The-Camera (LB27). 14. Performed emotion → LB25.

### 6.5 Structure, continuity, single-take discipline
- **Lead every prompt with shot structure** (shots + total duration + aspect) and end with a footer.
- **Minimum Shot Duration (LB13):** total ÷ scene count ≥ 1.3s; "every shot holds at least 1.2 seconds; no flash cuts" on every multi-shot prompt.
- **ONER LOCK (LB18):** never name a shot size or new framing mid-prompt; describe arrivals as continuous motion; state "one single uninterrupted take — no cuts, no scene changes, no new camera angles, first frame to last" at TOP and BOTTOM; motion as one continuous verb chain.
- **SHOT SPLIT LAW (LB22):** never generate a take that must arrive inside a space the references don't show from that side — split into approach + arrival joined by a match cut.
- **Population Permanence (LB21):** everyone visible at any point exists from frame 1. **Enclosure Spec:** when the camera ends inside a structure, prompt what surrounds the CAMERA.
- **Ambient Life Law (LB20):** locks hold IDENTITY, LAYOUT, COUNT — never motion. Background humans visibly move, each independently, never in lockstep.
- **World-anchored orientation (LB4):** facing stated relative to WORLD landmarks during any camera move, never screen-relative.
- **Venue Geography (LB15):** real place → real photos pulled, actual layout written in, reverse-shot check.
- **Perspective discipline:** one declared camera family per ad + the locked Style Prefix on every clip.
- **Escalation arc:** calm → tension → payoff → resolution; motion spelled beat by beat; state carried forward.

### 6.6 Audio, resolution, iteration, cost
> **⚠ VOLATILE — verify before relying on it.** Named models, credit figures and
> thresholds below were true on 2026-08-20. Current values live, dated and sourced, in
> [`higgsfield-capability-map.md`](../../../../.claude/skills/servicepow-higgsfield-intelligence/references/higgsfield-capability-map.md).
> The *technique* here is durable; the *numbers* are not.

- Diegetic SFX only in generation; the bed and music in the edit. Native audio ≈ +50–100% credits — draft silent.
- Drafts 720p/fast → lock the winner → final 1080p high bitrate (4K for hero/crowds/fast motion). 
- **Iteration Protocol:** ONE variable per retry; simplify after 3 fails; problems hide at 5–8s — watch/measure the whole clip.
- **Retiming rescue (LB23):** a marginal slow clip (edge travel ~1.0–1.5) can be retimed `setpts=PTS/1.5–3.0` and **re-measured** — legitimate if it passes after. A frozen clip (~0.0–0.5) cannot be rescued — regen. Never ship a retime without a re-measure.
- **Unlimited pass (LB16):** only the UNLIMITED-badged entry on the web UI applies the pass — MCP/API generations always charge credits. Budget accordingly and say so.
- **CREDIT LEDGER & STOP-LOSS (v3.1):** call `balance` before and after every stage and log the diff in the ad package. **Stop-loss: two failed regens of the same beat = STOP** — the problem is upstream (storyboard, keyframe, or concept); re-diagnose at the still-frame level instead of paying for a third identical attempt. A day crossing the owner-flag threshold triggers a flag to Karl with the ledger attached — the threshold sits above an honest-day baseline so the flag means something when it fires. **The baseline and the flag figure are volatile and live in [`higgsfield-capability-map.md`](../../../../.claude/skills/servicepow-higgsfield-intelligence/references/higgsfield-capability-map.md), dated and labelled with their sample size** — both currently rest on a single observed day.

### 6.7 Post / edit standards
Normalize clips to master res (scale-to-cover + centre-crop), uniform fps, `yuv420p` delivery. Lower-thirds baked in the edit. Branded endcard = clean logo file on the BRAND color field, held per the S6 rule (2–3s feed/vertical, ≤5s YouTube in-stream), fade-in only. Loudness-normalize + true-peak limiter ≤ −1 dBTP. Hard cuts by default; transitions only when the story asks. Verify the final by running `servicepow_qc.py --master` AND extracting frames for review before shipping.
