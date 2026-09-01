# Shot field set — the ten

> **The storyboard gate is TEN required fields. There is no eleventh.** The gate is owned by
> `servicepow-storyboard-director` and enforced through the canonical blocking-check registry —
> BC-34 (real reference cited per scene) and BC-31 (motion axis named per shot). This file
> expands what each field must contain.
>
> **Why ten and not more.** The APPROVER ordered a real-reference field on 2026-08-20; building
> it revealed the field *already existed* (`Real-ref`, present since the Real-Reference Law) —
> and a football scene had shipped with players running out of bounds behind the endzone anyway.
> **The defect was never a missing field. It was a field that accepted an unverifiable answer.**
> So the fix made the existing field citable and refusable rather than adding a box. An eleventh
> field would have been SOP bloat papering over an enforcement failure.
>
> This file previously carried a 24-field set. That set was exactly the bloat this rule forbids
> and was retired on 2026-08-26. Everything it asked for that actually changes a shot survives
> *inside* one of the ten below.

## The template

Every shot in a Service Pow storyboard is written out in this form, before any image is
generated. A blank field is unfinished work, not shorthand — a blank is what lets a filler shot
survive into production.

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
Hyper-specific: who does what, with which hand, to what object, in what order. **Every action
must pass the In-World Reason Test** — if the honest answer to "why is he doing that?" is "to
show the viewer the logo / app / product", the action is fake and the shot fails. (Rejected on
record: a man spinning in circles to display a lanyard; a woman in a crowd holding her phone's
home screen up to camera.) The one exception is direct-address UGC, where talking to camera *is*
the format.

### 3. Camera
**One** named move, plus position and FOV/shot size. Not a list of moves — a named one. "Slow
push in, eye level, 35mm equivalent, medium" is a camera. "Dynamic cinematic movement" is not.

### 4. Lighting
Source, direction, level. Named practicals where they exist in the world of the shot. This field
is what keeps a grade family consistent across shots that were generated hours apart.

### 5. Audio
The diegetic sound *this shot contributes* — not the music, not the VO. What the room actually
sounds like. The Sound Spine assembles these; this field supplies them.

### 6. Text
On-screen text if any. **Always burned in post from real files** — never generated inside the
image or clip. Generated text is the single most reliable synthetic tell, and it is unfixable
after the fact. Exact identity assets (logos, wordmarks, packaging text, legal copy) are
governed by the brand-assets policy: any shot containing them is marked COMPOSITE at the board.

### 7. Source
`REAL client footage` / `AI from client still` / `pure AI + why`. The footage hierarchy in the
realism-and-disclosure policy means the third option needs a stated reason, every time. This
field is also what makes the media ask concrete: the shots marked `pure AI + why` are the list
of footage to request from the client.

### 8. Real-ref — the field with teeth (BC-34)
**Required and cited.** A real-world source someone can **open** — a link, a title, or named
client media — plus **the specific observed behaviors this shot copies**: what hands do, where
phones point, how people stand, what they ignore.

- **"I looked" is not evidence. The citation is.**
- Applies to **every** scene with a findable reference — not just trades. Sport, hospitality,
  travel, retail, any domain with rules a viewer knows.
- The OPERATOR often cannot stream video at research time. Photos, video stills, image-search
  results and detailed written accounts of the real event are all valid evidence. An
  unreferenced assertion ("real fans do X") is not.
- If no reference exists, write **exactly**:
  `NO REFERENCE FOUND — HIGH RISK — <scene> — <what would help>` and surface it to the
  APPROVER. **The OPERATOR never accepts that entry alone.**
- It binds the **keyframe** as well as the motion. The endzone error existed in the still.
- **Exemption:** a deliberately unreal "impossible shot" concept beat skips the lookup, but
  still passes the In-World Reason Test and still needs APPROVER approval at storyboard.

**State amendment (2026-08-26):** where the scene depends on a jurisdiction — a license class, a
code requirement, a road rule, a sign — the reference must be for **that state**, not a generic
national one.

### 9. Angle
The argument this pack makes for the business: speed-of-response, price transparency, the people
behind it, proof, risk removal. **Same on every shot in a pack**, and it **must differ from this
client's previous deliverable** (the Angle Rotation Law, enforced downstream at BC-24).
Declaring it here is what makes rotation enforceable at the point where changing it is still
free.

### 10. Motion (BC-31)
Which of the **five motion axes** this shot uses — camera translation · subject travel through
depth · foreground occlusion event · focus change · light change — **and how it is achieved**.
Hero beats name **two**.

> "The camera is locked and the subject talks" is not an axis. That shot goes back to the board.

This is the only field that forces the director to design movement *before* the QC gate can
report its absence, and it costs nothing at the storyboard stage. It was added after a whole
pack shipped with no movement in any shot.

The five axes above are the whole of the taxonomy this system holds — name the axis and the
method, and do not assume a deeper staging taxonomy exists elsewhere.

## Companion artifacts (timeline-level, not per-shot)

These are not fields — they sit alongside the shot list and are required at the same gate.

- **Feeling Spec** — for every meaningful ad: at each beat, the specific feeling **and its
  observable on-screen cause**. *An emotion with no cause is a wish.* Specific states only —
  "relief", "anticipation", "recognition" — never bare "engaged" or "excited". Causes come from
  event, framing, cut rhythm, audio and small real behavior. The arc must make the CTA the
  emotionally obvious next step.
- **Sound Spine** — where sound is meaningful: the full timeline as TIME · diegetic · music ·
  SFX · VO · silence · transitions · **emotional purpose**, plus where energy rises, drops and
  lands the CTA. Most placements autoplay muted, so the sonic hook is a bonus layer, never
  load-bearing.

## Also decided at the board, not later

- **The shot-length and motion thresholds.** Their single home is the DECISION RULES section of
  this skill's SKILL.md — they are applied here at the board and are not restated in this file.
- **Hero beats identified and marked HERO** for the 3-draft rule.
- The storyboard **is the Master Timeline seed**: clip order, story jobs, audio spine, and the
  continuity locks at each joint.
