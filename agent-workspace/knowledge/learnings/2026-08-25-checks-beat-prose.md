---
title: Prose rulebooks don't change behavior; enforced checks do
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-25
updated: 2026-08-25
tags: [meta, quality, process]
source: Drive "ServicePow OS 2" — 19_PRODUCTION_LEARNINGS.md meta-lessons (synced 2026-08-25)
---

# Prose rulebooks don't change behavior; enforced checks do

Across the video-production system's first weeks, three written, in-force rules (the
slow-motion ban, the phone-homescreen example, the Real-ref field) were all skipped in
practice — and were only caught by a human watching. Every failure that got fixed got
fixed by adding a **check that can fail** (a measured motion gate, an OCR string
assertion, an ASR speech test), not by adding a sentence.

**Falsifiable form:** a rule that exists only as prose will be violated within ~6
deliverables; a rule enforced by a machine check or a mandatory human gate holds.

**Application to Orion:** when something goes wrong, prefer adding a test, a gate, or a
tool-level constraint over adding a paragraph to a playbook. (This workspace's own
CLAUDE.md quality bar is prose — treat it as the checklist a human runs, and automate
pieces of it when they repeat.)
