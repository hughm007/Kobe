---
title: "Verify retouching on rendered frames, not on before/after crops of the box you chose"
type: learning
client: internal
owner: Karl
status: active
created: 2026-10-04
updated: 2026-10-04
tags: [production, retouch, qc, claude-caught]
---

# Verify retouching on rendered frames, not on crops of the box you chose

## What happened
- **The miss:** in a client Reel, a third-party logo (a polo pony) survived "removal". Its coordinates were read off a zoom of the wrong scale, and the heal box sat 25 px below the logo.
- **Why the check passed:** the before/after QC sheet was cropped around the *box*, so the box looked clean while the logo sat just outside it.
- **Who caught it:** both independent gates. **CLAUDE-CAUGHT:** the critic and the Skeptic in their v4 passes.
- **A related lesson:** feathered Gaussian blurs on labels in focal areas read as "amateur censor blur" (Skeptic S2). Heals and clones from adjacent fabric did not.

## What we think it means
- Retouch QC must look at the **whole subject in the rendered master** (or the full scrubbed photo), never only at the edited region.
- **Prefer, in order:**
  - **leave it:** the mark is unreadable at phone size and unbranded;
  - **clone:** match texture or stripes;
  - **heal:** fill small marks from the surrounding pixels;
  - **blur:** only as a last resort, and never in the focal area.

**Confidence:** High for the QC rule; Medium for the order of preference.

## Promotion
- [x] Added to [`../index.md`](../index.md)
- Playbook candidate: the retouch step in video production, if it recurs.
