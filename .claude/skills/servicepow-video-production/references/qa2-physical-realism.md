# QA2 — physical + trade realism gate (BC-41 / BC-42)
Run on EVERY generated asset before it may LOCK, and on the assembled master. Machine QC
cannot see any of this; a human or vision-capable reviewer must. Beautiful but wrong = FAIL.

## Automatic-fail checklist
**Trade credibility** (judge the SPECIFIC operation shown; do not overfit to any one prior
example): wrong tool for the job · tool not contacting the correct fitting/fastener · wrong
orientation or force direction · impossible plumbing/HVAC/electrical configurations · unsafe
procedure or implausible PPE · work that makes no mechanical sense · **wrong trade entirely**.
**Physics:** visible water inside opaque metal · open pipe ends/cutaways/transparent metal
(unless explicitly stylized AND approved) · floating, merging, morphing objects · broken
gravity or fluid behaviour.
**People:** bad anatomy · merged limbs/objects · frozen or staged expressions · unnatural
motion · lip-sync failures where speech is shown.
**Devices/text:** fake-looking screens or UI · unreadable or warped on-screen text · garbled
icons · warped logos (brand marks are real files, never generated — LB24 class).
**The AI-tell class:** too clean, too staged, too rehearsed, showroom-perfect surfaces where
a lived-in one belongs — "lacks natural imperfection" is a defect, not a taste note.
**Continuity:** objects/wardrobe/lighting changing across cuts without cause.

## Rejection vocabulary (closed — one per rejected asset)
AI_LOOK · BAD_ANATOMY · BAD_DEVICE · WRONG_TOOL · MECHANICALLY_IMPOSSIBLE · WRONG_TRADE ·
GENERIC · OFF_BRAND · BAD_MOTION · UNUSABLE_COMPOSITION · BAD_TEXT · CONTINUITY_FAILURE ·
WEAK_PERFORMANCE · RIGHTS_DUPLICATION

## The standard behind the gate
Nothing ships that a competent tradesperson, or an ordinary viewer, would immediately
recognize as fake or wrong. When a shot cannot clear this gate through generation, the
answer is routing (composite / real asset / request footage / avoid) — never acceptance.
