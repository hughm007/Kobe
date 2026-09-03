---
title: "Photorealism is not physical correctness — trade and device shots need reference grounding"
type: learning
client: internal
owner: APPROVER
status: active
created: 2026-09-02
updated: 2026-09-02
tags: [video, qa, realism, trade, devices]
---

# Photorealism is not physical correctness

## What happened
Two independent failures in the same test, both invisible to every existing gate:

1. **Wrench.** A Cinematic Studio image looked expensive and was mechanically wrong — the
   wrench sat at an orientation to the fitting that no plumber would use. It passed as
   photoreal and failed as plumbing.
2. **Phone.** A Seedance shot rendered a featureless blue glow on a dark counter. The owner's
   reference shows what the shot needed: a real handset, correct bezel and camera geometry,
   a genuine incoming-call interface with accept/decline affordances, plausible reflections
   and a correct relationship to the surface it rests on.

Separately, a hook shot prompted for "pipe wrenches in a garage" rendered a **woodworking
bench** — hammers and hand planes. Wrong trade entirely.

## Why the existing gates missed all three
The machine QC harness measures resolution, fps, pixel format, loudness, frozen sections,
black frames, motion, aspect and duration. **Every one of those passed.** None of them can
see that the tool is wrong, the phone is fake, or the trade is not the client's.

## The rule this earns
Any shot containing a specialised physical interaction gets **reference grounding before
generation** and **correctness QA before acceptance**.

**TRADE CORRECTNESS — verify before accepting:** correct tool for the job · tool oriented
correctly · hands contact it plausibly · the work makes mechanical sense · plausible safety
equipment where relevant · the serviced object correctly represented · nothing impossible
occurring · **the trade shown is the client's trade**.

**DEVICE REALISM — verify before accepting:** plausible device geometry · believable screen
proportions · correct perspective · realistic reflections · a real interface, not a glow ·
no malformed icons or text · plausible hand interaction · physically correct relationship to
the surface · no warped buttons, cameras or bezel.

Reference images constrain **physical correctness only**. Never import their styling, palette
or composition — extract how the thing actually works, nothing else.

**A consumer recognises a fake phone instantly, and a tradesperson recognises a wrong wrench
instantly. Either one destroys the credibility of the whole advertisement.**
