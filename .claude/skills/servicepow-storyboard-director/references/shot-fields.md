# Shot field set

> **The storyboard gate is TEN required fields. There is no eleventh.** The gate itself is owned
> by [`agent-workspace/playbooks/ads/video-production.md`](../../../../agent-workspace/playbooks/ads/video-production.md)
> (decision 0004) — this file expands what each field must contain, and never restates the count.
> `Real-ref` has existed since v3.1; the defect was never a missing field but a field that
> accepted an unverifiable answer, so v4.0 deliberately refused to add another box.

Every shot in a Service Pow shot list carries these. Blank fields are unfinished work, not
shorthand — a blank is what lets a filler shot survive into production.

## Placement in the story
| Field | Notes |
|---|---|
| **Shot number** | Sequential, stable — referenced by QC, continuity and the production log |
| **Beat** | Which beat map row this serves. One beat only |
| **Duration** | Seconds, from the beat's needs — not the model's default |
| **Purpose** | Why this shot exists at all |
| **What came before** | The state the viewer is in when it starts |
| **What this adds** | New information, proof or feeling. If nothing: cut |
| **What comes next** | Why the following shot follows *this* one |
| **Contributes** | attention / understanding / proof / emotion / desire / action (≥1) |

## What is in frame
| Field | Notes |
|---|---|
| **Subject** | Who or what |
| **Action** | What physically happens. Needs an in-world reason (LB31) |
| **Performance** | Want / feel / think / just happened / looking at / hiding |
| **Gaze** | Where the eyes go, and when they move |
| **Body language** | Weight, posture, restraint |
| **Environment** | Location, time, weather — must match the location bible |
| **Product** | Which product, orientation, scale |
| **Props** | Everything else that must be consistent |

## How it is filmed
| Field | Notes |
|---|---|
| **Shot size** | WS / MS / MCU / CU / ECU |
| **Camera** | Angle, height, position relative to the 180 line |
| **Lens feel** | Wide / normal / long — must stay in the campaign's lens family |
| **Movement** | What moves and why. **Motion axis is mandatory** (check 31) |
| **Light** | Direction, quality, temperature — matches the lighting bible |

## Sound and cut
| Field | Notes |
|---|---|
| **Dialogue** | Exact spoken words, or none |
| **Audio** | Room tone, foley, effects, music state |
| **Transition** | How we leave, and the cut's reason |

## Production
| Field | Notes |
|---|---|
| **Reference** | Cited and openable (**LB51**). "I looked" is not evidence. **State amendment:** where the shot depicts a state — broken/working, before/after, dirty/clean — carry a **BEFORE** source + observable markers, an **AFTER** source + observable markers, and **THE DIFFERENCE** the viewer must see, in one line. If that line cannot be written, the pair proves nothing |
| **Model requirement** | The *requirement*, not the model — production routes it |
| **Method flag** | generate / reference-driven / real footage / composite / hybrid |
| **Continuity notes** | What must match which other shots |

## Standing flags

- **Composite required** wherever a logo, wordmark, packaging text, UI or legal copy appears (LB24)
- **Real footage required** for the "during" state in trades work. The viewer of a trades ad is a domain expert in the exact moment depicted — real jobsite footage beats any generated pair, and it is free
- **`NO REFERENCE FOUND — HIGH RISK`** applies **per state**, surfaced to Karl by name with the scene named and the help needed stated
- **Safe area** — burned text inside 15–70% of frame height
- **No opening dead-space** — the first frame works from frame one
