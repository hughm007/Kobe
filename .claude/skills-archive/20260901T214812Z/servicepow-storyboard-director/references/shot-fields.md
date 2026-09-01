# Shot field set — the ten

> **The storyboard gate is TEN required fields. There is no eleventh.** The gate itself is owned
> by [`agent-workspace/playbooks/ads/video-production.md`](../../../../agent-workspace/playbooks/ads/video-production.md)
> (decision 0004) — this file expands what each field must contain.
>
> **Why ten and not more.** The owner ordered a real-reference field on 2026-08-20; building it
> revealed the field *already existed* (`Real-ref`, present since the Real-Reference Law) — and a
> TripNerd football scene had shipped with players running out of bounds behind the endzone
> anyway. **The defect was never a missing field. It was a field that accepted an unverifiable
> answer.** So the fix made the existing field citable and refusable rather than adding a box.
> An eleventh field would have been SOP bloat papering over an enforcement failure.
>
> This file previously carried a 24-field set. That set was exactly the bloat this rule forbids
> and was retired on 2026-08-26 (decision 0005). Everything it asked for that actually changes a
> shot survives *inside* one of the ten below.

## The template

Every shot in a Service Pow storyboard is written out in this form, before any image is generated.
A blank field is unfinished work, not shorthand — a blank is what lets a filler shot survive into
production.

```
Shot N — [start]–[end]s
Story job:   [what this beat does for the ad — hook / proof / payoff / CTA]
Action:      [who does what, hyper-specific — every action passes the In-World Reason Test]
Camera:      [one named move, position, FOV/shot size]
Lighting:    [source, direction, level]
Audio:       [diegetic sound this shot contributes]
Text:        [on-screen text, if any — always burned in post from real files]
Source:      [REAL client footage / AI from client still / pure AI + why]
Real-ref:    [REQUIRED AND CITED — see below]
Angle:       [REQUIRED — the argument this pack makes for the business]
Motion:      [REQUIRED — which of the five motion axes, and how it is achieved]
```

## What each field must actually contain

### 1. Story job
Hook, proof, payoff or CTA. One of them, not two. A shot whose story job is "looks good" has no
story job and does not survive the board. This is the field the In-World Reason Test and the
beautiful-filler problem both resolve against.

### 2. Action
Hyper-specific: who does what, with which hand, to what object, in what order. **Every action must
pass the In-World Reason Test** — if the honest answer to "why is he doing that?" is "to show the
viewer the logo / app / product", the action is fake and the shot fails. (Rejected on record: a man
spinning in circles to display a lanyard; a woman in a crowd holding her phone's home screen up to
camera.) The one exception is direct-address UGC, where talking to camera *is* the format.

### 3. Camera
**One** named move, plus position and FOV/shot size. Not a list of moves — a named one. "Slow push
in, eye level, 35mm equivalent, medium" is a camera. "Dynamic cinematic movement" is not.

### 4. Lighting
Source, direction, level. Named practicals where they exist in the world of the shot. This field is
what keeps a grade family consistent across shots that were generated hours apart.

### 5. Audio
The diegetic sound *this shot contributes* — not the music, not the VO. What the room actually
sounds like. The Sound Spine assembles these; this field supplies them.

### 6. Text
On-screen text if any. **Always burned in post from real files** — never generated inside the
image or clip. Generated text is the single most reliable synthetic tell, and it is unfixable
after the fact.

### 7. Source
`REAL client footage` / `AI from client still` / `pure AI + why`. Real-Media-First means the third
option needs a stated reason, every time. This field is also what makes the media ask concrete:
the shots marked `pure AI + why` are the list of footage to request from the client.

### 8. Real-ref — the field with teeth
**Required and cited.** A real-world source someone can **open** — a link, a title, or named client
media — plus **the specific observed behaviors this shot copies**: what hands do, where phones
point, how people stand, what they ignore.

- **"I looked" is not evidence. The citation is.**
- Applies to **every** scene with a findable reference — not just trades. Sport, hospitality,
  travel, retail, any domain with rules a viewer knows.
- Claude often cannot stream video. Photos, video stills, image-search results and detailed written
  accounts of the real event are all valid evidence. An unreferenced claim ("real fans do X") is not.
- If no reference exists, write **exactly**:
  `NO REFERENCE FOUND — HIGH RISK — <scene> — <what would help>` and surface it to Karl.
  **Claude never accepts that entry alone.**
- It binds the **keyframe** as well as the motion. The endzone error existed in the still.
- **Exemption:** a deliberately unreal "impossible shot" concept beat skips the lookup, but still
  passes the In-World Reason Test and still needs owner approval at storyboard.

**State amendment (owner-ordered, 2026-08-26):** where the scene depends on a jurisdiction — a
license class, a code requirement, a road rule, a sign — the reference must be for **that state**,
not a generic national one.

### 9. Angle
The argument this pack makes for the business: speed-of-response, price transparency, the people
behind it, proof, risk removal. **Same on every shot in a pack**, and it **must differ from this
client's previous deliverable** (the Angle Rotation Law). Declaring it here is what makes rotation
enforceable at the point where changing it is still free.

### 10. Motion
Which of the **five motion axes** this shot uses — camera translation · subject travel through
depth · foreground occlusion event · focus change · light change — **and how it is achieved**.
Hero beats name **two**.

> "The camera is locked and the subject talks" is not an axis. That shot goes back to the board.

This is the only field that forces the director to design movement *before* the QC gate can report
its absence, and it costs nothing at the storyboard stage. It was added after a whole pack shipped
with no movement in any shot.

## Companion artifacts (timeline-level, not per-shot)

These are not fields — they sit alongside the shot list and are required at the same gate.

- **Feeling Spec** — for every meaningful ad: at each beat, the specific feeling **and its
  observable on-screen cause**. *An emotion with no cause is a wish.* Specific states only —
  "relief", "anticipation", "recognition" — never bare "engaged" or "excited". Causes come from
  event, framing, cut rhythm, audio and small real behavior. The arc must make the CTA the
  emotionally obvious next step.
- **Sound Spine** — where sound is meaningful: the full timeline as TIME · diegetic · music · SFX ·
  VO · silence · transitions · **emotional purpose**, plus where energy rises, drops and lands the
  CTA. Most placements autoplay muted, so the sonic hook is a bonus layer, never load-bearing.

## Also decided at the board, not later

- **Total ÷ shot count ≥ 1.3s** — the average-shot-length floor.
- **Shot-Length Law:** pure-AI shots hold the screen **≤5s by default** (openers/action 2–4s, faces
  2–5s). The one exception is a static-subject environment shot with no visible people, which may
  hold to **7s**. Synthetic tells — breathing regularity, eye tracking — surface around 8s.
  Generate 6–8s takes for the edit room, but cut before the tell window.
- **Hero beats identified and marked** for the 3-draft rule.
- The storyboard **is the Master Timeline seed**: clip order, story jobs, audio spine, and the
  continuity locks at each joint.

## Known gap

The five motion axes have a dedicated reference in the ad-producer source tree
(`SHOT_MOTION_AND_STAGING`) that has never been pasted into this repo. Until it is, the axis
definitions above are the whole of what we hold — name the axis and the method, and do not assume
a deeper taxonomy exists here.
