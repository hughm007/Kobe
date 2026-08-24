---
title: "0001 — Workspace structure and conventions"
type: decision
client: internal
owner: Karl
status: active
created: 2026-08-24
updated: 2026-08-24
tags: [decision, workspace, conventions, foundational]
---

# 0001 — Workspace structure and conventions

**Status:** Accepted
**Date:** 2026-08-24
**Decided by:** Service Pow (workspace scaffolded by the agent)

## Context

Service Pow needed a persistent working environment for its AI agent — somewhere the
agent does marketing work *and* accumulates the knowledge from doing it. Without one,
every session starts from zero: context is re-explained, past decisions are re-litigated,
and lessons from finished campaigns evaporate when the chat window closes.

Constraints that shaped the design:

- It has to be readable and editable by humans without special software.
- It has to work in git, which rules out storing large binaries or any credential.
- An agent has to be able to navigate it reliably, which means conventions strict enough
  to be followed without judgment calls on every file.
- It starts almost empty and has to stay coherent as it fills.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Flat folder of Markdown** | Simplest; nothing to learn | Becomes unnavigable past ~50 files; no place for structure to live |
| **B. Structured folders + a root `CLAUDE.md` constitution** | Scales; the agent has one authoritative entry point; conventions are enforceable | Requires discipline to maintain; some upfront scaffolding cost |
| **C. External tool (Notion, a database, a wiki)** | Richer features, better search | Not readable by the agent as plain files; adds a dependency and a subscription; harder to version |

## Decision

**Option B.** A structured folder tree under `agent-workspace/`, governed by a root
`CLAUDE.md` that holds the rules and the map, with detail pushed down into the folder it
describes.

The specific choices within that:

1. **`CLAUDE.md` is the constitution, not a scratchpad.** Rules and the map live there;
   detail lives in playbooks and folder READMEs. It's capped at roughly 350 lines because
   an instruction file nobody reads to the end doesn't govern anything.
2. **Every folder has a README** stating what belongs in it *and what doesn't*. The
   negative half is what stops folders blurring into each other.
3. **Playbooks and learnings are separated**, with an explicit promotion path between
   them. Merging them would mean either process docs cluttered with one-off observations,
   or observations lost inside process docs.
4. **Decisions are immutable and numbered**, ADR-style, because the reasoning behind a
   choice is the part that can't be reconstructed later.
5. **Frontmatter on every substantive file**, so the workspace stays searchable and
   filterable as it grows past the point where a human can hold it in their head.
6. **`NEEDS INPUT` markers rather than plausible guesses**, tracked centrally in
   `company/OPEN-QUESTIONS.md`. In marketing, a confident wrong number reaches a client.
7. **Never delete, archive.** Deletion destroys the reasoning trail the workspace exists
   to preserve.
8. **No credentials, ever**, because git history is permanent and editing a secret out
   doesn't remove it.

## Why

The structure is optimized for one thing: **an agent or a human opening this folder cold
and becoming useful within minutes.** That means a single authoritative entry point, a
predictable place for every kind of artefact, and conventions consistent enough that
"where does this go?" has one answer rather than a judgment call.

The knowledge loop is deliberately the center of the design rather than an add-on. An
agency's real asset is what it has learned about its clients, its channels and its
audiences — and that asset is normally lost because nobody writes it down while it's
still fresh. Making capture a routine step, with a template and a home, is the difference
between a workspace that fills up and one that compounds.

## Consequences

**Easier**
- Starting a session with full context, without re-explaining the business
- Onboarding a new client consistently, from a template rather than from memory
- Answering "why do we do it this way?" from a file rather than from recall
- Spotting when a lesson has recurred often enough to change the process

**Harder**
- More upfront structure than a flat folder — there's a convention to learn
- Requires the end-of-session discipline in `CLAUDE.md` §4; the loop breaks quietly if
  worklog and learning capture get skipped

**Accepted costs**
- Large binaries can't live here; `assets/` holds pointers instead
- The workspace is seeded with placeholders rather than complete, so it looks unfinished
  until `company/OPEN-QUESTIONS.md` is worked through

**Revisit if**
- The folder count grows enough that routing becomes ambiguous
- Playbooks stop being updated after use — that would mean the loop isn't running, and
  the structure isn't the fix
- Service Pow adopts a different system of record that this should defer to

## Related

- [`../../CLAUDE.md`](../../CLAUDE.md)
- [`../../company/OPEN-QUESTIONS.md`](../../company/OPEN-QUESTIONS.md)
