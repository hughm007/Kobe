# Human realism inspection

Run on every generated shot containing a person. Inspect in this order — the early items catch
most failures fastest.

## Scope: focal vs non-focal

Before inspecting, classify each human in frame:

- **Focal** — the subject the viewer is directed at: faces carrying the beat, the hands doing
  the featured action, anything the edit points attention to. The reject-on-sight items below
  are **binding** for focal tells at the shot level, pre-assembly. A focal tell fails the shot
  here, before it enters the cut.
- **Non-focal / background** — extras, mid-ground passers-by, incidental hands at frame edge.
  Tells here are **noted, not auto-rejected**: record them and forward to
  `servicepow-creative-critic`, whose AI-artifact risk score governs cumulative non-focal
  tells at the master level, judged at delivery size and speed.

Shots marked ELEVATED-QC in the performance direction (synthetic skilled labour permitted
under `../../_servicepow/policies/realism-and-disclosure.md` §1) get heightened scrutiny on
sections 3 and 4 — hands, tools, contact, and body mechanics.

## 1. Eyes (highest signal)

- **Gaze target** — are they looking at a real thing in the scene, at a consistent point?
- **Saccades** — do the eyes make small natural movements, or lock and drift?
- **Blinks** — present, irregular, at natural intervals? No blinking reads dead; metronomic
  blinking reads worse.
- **Dead eyes** — the eyes do not participate in the expression the face is making. **Reject.**
- **Camera awareness** — unintended looks to camera break the world. (POV and phone-style
  shots where camera address is intentional are the exception — the storyboard states it.)

## 2. Mouth and jaw

- Jaw movement matches the sound
- Teeth stable in shape and number across frames
- **Lip sync** — a visible speaking mouth that does not match the audio is a hard failure
  (the canonical maxim lives in `../../servicepow-script-director/SKILL.md`; at footage level
  the consequence is: the shot changes, not just the audio)
- Micro-expressions present around the mouth, not just a held shape

## 3. Hands and contact

- Correct number of fingers, stable across the shot
- **Grip is physical** — the hand deforms around the object; the object deforms nothing
- **Object contact** — is the object actually held, or floating in a hand-shaped gap?
- Precise manual work (tools, small parts) is a known failure mode — frame it out or route to
  real footage per `../../_servicepow/policies/realism-and-disclosure.md` §1

## 4. Weight and balance

- Body weight sits over the feet
- Posture consistent with the surface and the task
- Walking: heel strike, weight transfer, arm counter-swing
- Sitting: the body compresses what it sits on
- **Hovering** — feet not connected to the ground plane. **Reject.** (This one has shipped
  before.)
- Movement speed within human biomechanical limits — findings feed the impossible-human-speed
  gate (BC-33 in the canonical blocking-check registry,
  `../../_servicepow/data/blocking-checks.yaml`)

## 5. Breathing and time

- Chest and shoulders move
- **Reaction delay** — humans react late. Instant reaction reads synthetic
- Speech changes speed within a sentence. *Uniform slowness is its own robot*
- Stillness between actions, not constant motion

## 6. Overall behaviour

Reject on sight (focal area):

- Constant smiling
- Constant gesturing
- Robotic or uniformly-paced movement
- Perfect facial symmetry
- Excessive acting — emotion pushed past what the moment holds
- Performed celebration at readable distance — banned under the performed-emotion ban,
  `../../_servicepow/policies/realism-and-disclosure.md` §4

## Verdicts

| Verdict | When |
|---|---|
| **ACCEPT** | No focal tell visible at delivery size and speed; non-focal tells noted and forwarded |
| **FIX** | Reframe or crop the failure out of frame |
| **REGENERATE** | With a *changed performance brief* — never the same prompt again; re-dispatch passes the spend gate (`../../_servicepow/policies/generation-and-spend.md`) |
| **REDESIGN SHOT** | The shot asks for what models cannot do; change the framing, or route to real footage per the footage hierarchy |

## The framing escape hatch

When a performance cannot be generated believably, change what the camera sees:
back of head · over the shoulder · hands only · partial face in shadow · reflection · the
effect of the action rather than the face reacting to it. These read as directorial choices,
not compromises — and they are how restrained realism is achieved cheaply.
