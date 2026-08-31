---
title: "Claim qualifiers drop every time a claim is re-transcribed — diff against source, never retype"
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [claims, compliance, copy]
---

# Claim qualifiers drop every time a claim is re-transcribed — diff against source, never retype

## What happened
The pilot-pack turnaround claim ("5–7 **business** days **from receipt of client assets**",
services.md) lost its qualifiers **twice in one campaign, by the same author, in the cut built to
fix claim hygiene**:
1. 08-28: the control VO said "in five to seven business days" — condition dropped; caught in
   self-audit, fixed in the burn.
2. 08-30: the challenger burn said `4 ads · 5–7 days` — BOTH qualifiers dropped; caught by the
   Skeptic (S4). Sibling case same round: "we build the page" implying an unpriced service is
   included.
3. Rev 3: survived only because the synthesis enforced a **single-source rule** — each mandated
   claim exists as exactly one burned string in exactly one place, diffed word-by-word against
   services.md before render. Checker: 0 blocking.

## Mechanism
Every re-transcription (source → VO → burn → cutdown) is a fresh chance to shorten, and qualifiers
are what rhythm pressure deletes first. The error rate wasn't ignorance — the author had *just
caught the same defect*.

## The rule this earns
A claim never gets retyped. It gets **copied from its source file once**, placed in one burned
string, and every other surface points at that string. Two occurrences + the 911 Drain claim
discipline → pattern-watch at 2; promote on the third.
