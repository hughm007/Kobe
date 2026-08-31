---
title: "A gate on a mutating artifact judges nothing — freeze with hashes before any gate runs"
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [process, qa, gates]
---

# A gate on a mutating artifact judges nothing — freeze with hashes before any gate runs

## What happened, twice in three days
1. 08-31 round 1: the boil re-render ran **while Kobe was mid-review** — the critic caught it
   itself ("a truncated 524KB file with no moov atom... you cannot gate a file that is being
   rewritten underneath you") and had to rebuild its own frame set to stay reproducible.
2. 08-31 round 2: the B6 boil re-render touched `frames/rev3/` while gate agents may still have
   been reading individual frames — bounded (the hashed master and sheet were untouched) but a
   breach of the rule adopted the day before.

## The rule this earns
Before spawning any gate: copy the master, the contact sheet, **and the frame set** into
`gates/<round>/`, record SHA-256 for everything, and point every gate agent only at the frozen
paths. The build side may keep working; the gate side must be immutable. `build/freeze.sh` exists
for this; the failure mode is pointing gates at the live frames directory "because it's the same
content" — it stops being the same content the moment a fix lands.
