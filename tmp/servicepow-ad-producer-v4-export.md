---
title: "servicepow-ad-producer v4.0 — reconstructed export"
type: research
client: internal
owner: Karl
status: draft
created: 2026-08-26
updated: 2026-08-26
tags: [ad-producer, v4.0, export, reconstruction, review]
---

# ⚠ RECONSTRUCTED — NOT PORTED

**This is not the v4.0 skill.** The skill body lives inside the installed package of the
claude.ai ServicePow Project and is unreachable from Claude Code. This file reconstructs what
v4.0 *contains* from the Drive records that describe it, which were read in full.

| | |
|---|---|
| **Reconstructed from** | `CLAIM_servicepow-ad-producer_v4.0_2026-08-20T2045.md` · `35_2026-08-20T2100_v4.0-installed-silo-fork-lb50-drift.md` · `35_2026-08-20T2120_LB51-amendment-reference-the-state.md` · `08_VIDEO_QUALITY_STANDARDS.md` |
| **Source of truth for this file** | Drive folder "ServicePow OS 2" |
| **Read on** | 2026-08-26 |
| **Fidelity** | Deltas: HIGH (explicitly enumerated in the claim + install ledger). Full text: **ABSENT** |
| **Known gaps** | §8B (the check list text itself) · HB1–14 wording · exact wording of checks 32–34 · both QC scripts' source |

**To replace this file with the real thing:** paste the actual v4.0 `SKILL.md` and I will diff it
against what was merged, correct anything reconstruction got wrong, and delete this file.

---

## Version lineage (from the Drive ledger)

| Version | Date | Content |
|---|---|---|
| v3.4 | 2026-08-18 | announce-confirmed installed |
| v3.5 | 2026-08-19 | Creative Engine (distilled, not pasted) |
| v3.6 | 2026-08-19 | Source-Verification set |
| v3.7 / v3.8 | 2026-08-19/20 | interim merge deliveries |
| **v3.9** | 2026-08-19 evening | THE MERGE RELEASE — LB38–48 · **31 blocking checks** · HB1–14 · two scripts (`servicepow_qc.py`, `servicepow_source_qc.py`) |
| **v4.0** | 2026-08-20 ~21:00 | announce-confirmed live: *"ServicePow Video OS v4.0 loaded."* |

**Why 4.0 and not 3.10** (verbatim from the claim): *"LB51 changes what may enter production and
adds a required storyboard field — existing storyboards do not satisfy the new gate. That is a
breaking change to the pipeline contract, not an increment."*
**Supersedes:** nothing. Extends v3.9.

---

## v4.0 deltas — what to merge

### New laws

**LB49 — VAD by safe error direction.**
An ASR gate chooses its voice-activity detection by which error direction is safe. (Origin: the
ASR boundary in `servicepow_performance_qc.py` was UNVERIFIED at build time — no whisper model
reachable — so the gate had to be designed around which way it fails.)

**LB50 — one number, one file.**
A number written in two files drifted in six hours. A count lives in exactly one file.

> **Amendment owed** (recorded in the install ledger, day one): the rule needs a second half —
> *within* a file, the count lives in exactly one PLACE, and every summary points at it rather
> than restating it. A session misread the v4.0 release note within an hour of shipping because
> the note's summary line restated a count instead of pointing at the gate.

**LB51 — THE UNIVERSAL REAL-REFERENCE LAW** (owner-ordered 2026-08-20).
Every scene with a findable real-world equivalent carries a cited, openable reference.

**LB51 AMENDMENT — reference the STATE, not just the scene** (owner-ordered 21:20, *in force as
state, NOT YET BAKED into the skill*).

> Owner's words: *"Make sure you reference real footage of drains that are broken and drains that
> work properly so we can get the realism look in our adverts when they are made."*

Where a shot depicts a **state** — broken/working, before/after, dirty/clean, failing/fixed —
**each state is referenced separately.** One reference for "a drain" is not compliance.

The `Real-ref` field carries, for any state-change shot:
- **BEFORE state** — cited, openable source + observable markers copied (water level, colour,
  debris type, surface condition, flow behaviour)
- **AFTER state** — cited, openable source + observable markers copied
- **THE DIFFERENCE** — what a viewer must *see* change. If it cannot be written in one line, the
  shot pair proves nothing and goes back to the board

Rationale, verbatim: *"The transition is the proof; an unreferenced transition is an
unsubstantiated claim in visual form"* — which places it adjacent to blocking checks 16–20, not
merely to craft.

**Why trades are the hardest case, not the easiest:** *"The viewer is a domain expert in the exact
moment being depicted."* A homeowner with a blocked drain has stood over that drain — they know
how standing water sits, how slowly it drains, what comes out on an auger. Generic "AI plumbing"
reads false instantly to the only person who matters. Corollary: **real client jobsite footage is
worth more than any generated pair, and it is free.**

`NO REFERENCE FOUND — HIGH RISK` still applies **per state**, surfaced to the owner with the scene
named and the help needed stated.

> **Citation note:** until baked into a skill release, cite this law **by name, not by number**
> (the LB38 three-claimant lesson).

**LB52 — the one-sided check.**
Every floor gets asked what its ceiling is. (A crowd moving faster than humanly possible once
passed every check, because only minimums were tested.)

### New blocking checks — total 31 → **34**

| # | Check | Note |
|---|---|---|
| **32** | **Performance gate** | Measured. The 911 Drain price line at **~242 WPM** is the recorded failing case — *"stops being an unactioned observation and becomes a failure of blocking check 32"* |
| **33** | **Impossible human speed** | Biomechanical plausibility of human motion |
| **34** | **Cited real reference** | The enforcement arm of LB51 |

*(The claim file lists 34 as "sport/domain accuracy"; the install ledger lists it as "cited real
reference". **Discrepancy — resolve against the real skill text.**)*

### Storyboard gate

**Ten required fields — there is no eleventh.** The `Real-ref` field has existed since v3.1; the
defect was a field that accepted an unverifiable answer, not a missing field. The v4.0 build
explicitly **refused to add an eleventh box** because a duplicate box would be bloat papering over
an enforcement failure.

### Scripts (source NOT recoverable from Drive)

| Script | Version | State |
|---|---|---|
| `scripts/servicepow_performance_qc.py` | v1.1 | self-test 6/6; **ASR boundary UNVERIFIED** at build time |
| `scripts/servicepow_biomech_qc.py` | v1.0 | self-test exits 0 |
| `scripts/servicepow_qc.py` | v1.6 | from v3.9 — `--preflight`, `--gate-clips`, clip-gate ledger |
| `scripts/servicepow_source_qc.py` | v1.0/v1.1 | from v3.9 |

All three v4.0 self-tests exit 0 from a clean unzip of the delivered package.

---

## Immediate consequences recorded at install

1. **911 Drain Pack 01 fails the new gates.** The price line (~242 WPM) fails check 32. The
   storyboard's `Real-ref` entries cannot survive LB51's citation requirement.
   **"The rebuild is storyboard-level, not a motion pass."**
2. **Pack 01 has still never been watched end to end by a human** — recorded as *"the loudest item
   in the system."*
3. Four owner items outstanding: watch all three masters end to end · answer claims Q8 · decide
   the six §8d items · sign the claims sheet.

---

## The silo fork (why this whole exercise exists)

The install ledger's §2 records that a workspace **outside** the claude.ai Project held facts the
Project did not have: 911drain.com live since 2026-07-28 · ROC 366870 · the van wrap spec · the
36-month exit structure · the LSA-first marketing plan.

> *"This is a worse fork than the file forks… two workspaces each holding a true and incomplete
> picture, with no shared surface at all."*

**Those are exactly the facts now held in this repo.** The repo is the silo that ledger flagged.
Its standing rule — *"ServicePow client state lives in the Drive state folder or it does not
exist"* — is superseded by the canonical architecture recorded in
`agent-workspace/knowledge/decisions/0004-canonical-source-of-truth.md`.
