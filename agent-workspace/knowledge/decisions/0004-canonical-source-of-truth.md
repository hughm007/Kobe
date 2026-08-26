---
title: "0004 — One rule, one home: the canonical source of truth"
type: decision
client: internal
owner: Karl
status: accepted
created: 2026-08-26
updated: 2026-08-26
tags: [architecture, canonical, source-of-truth, ad-producer]
---

# 0004 — One rule, one home

**Status:** Accepted, 2026-08-26. Supersedes the precedence claim in
[`0003`](0003-orion-and-the-company-os.md) that the claude.ai skill wins on conflict.

## Context

Two rule systems were being maintained independently:

1. **`servicepow-ad-producer` v4.0**, installed in the claude.ai ServicePow Project — announce-
   confirmed live 2026-08-20 21:00 ("ServicePow Video OS v4.0 loaded"). Owner of the blocking
   checks, the LB laws, the HB hard boundaries, the storyboard gate and four QC scripts.
2. **This repo** — `agent-workspace/playbooks/` plus fifteen `.claude/skills/servicepow-*`
   skills built 2026-08-26.

`playbooks/ads/video-production.md` declared the skill canonical: *"on any conflict of substance,
the skill wins."* But the skill is **unreachable from Claude Code** — not in the account skill
library, not on disk, not in Drive. Neither Orion nor Claude Code could read the rules they were
told to obey.

The drift was already real: the repo said **31 blocking checks**; v4.0 shipped **34** on
2026-08-20. That is LB50 firing on our own system.

There was a second, larger fork. The Drive install ledger's §2 (2026-08-20) recorded a workspace
*outside* the Project holding facts the Project lacked — 911drain.com live, ROC 366870, the van
wrap spec, the exit structure, the LSA-first plan — and called it *"a worse fork than the file
forks… two workspaces each holding a true and incomplete picture."* **Those are exactly the facts
this repo now holds.** The repo is the silo that ledger flagged.

## Options weighed

| Option | Verdict |
|---|---|
| **Drive stays canonical** | Rejected. `08_VIDEO_QUALITY_STANDARDS` already disclaims ownership ("this file does not own the count"). Drive was always a mirror |
| **The claude.ai skill stays canonical** | Rejected. A canonical source the working tools cannot read is not canonical — it is a rumour with a version number |
| **The repo becomes canonical** | **Accepted** |

## Decision

**The repo is canonical. One category, one owner:**

| Category | Canonical home |
|---|---|
| Agent constitution, gates, persona | `AGENT.md` + `orion/orion.toml` |
| *When/how* to run a workflow (procedure only) | `.claude/skills/servicepow-*/SKILL.md` |
| **Production law** — blocking checks + count, LB laws, storyboard gate, ServicePow-6 | **`agent-workspace/playbooks/ads/video-production.md`** |
| Compliance, claims, disclosure, rights | `agent-workspace/operations/compliance.md` |
| Changing model/credit facts | `.claude/skills/servicepow-higgsfield-intelligence/references/higgsfield-capability-map.md` |
| Campaign decisions | `clients/<slug>/campaigns/<id>/campaign-bible.md` |
| Production learnings | `knowledge/production-log/` |
| Advertising performance | `knowledge/campaign-results/` |
| Client state | `agent-workspace/clients/<slug>/` |
| Historical ledger | Drive `35_*` append-only entries (unchanged) |

**Everyone else points. Nobody restates.** A file that needs a rule cites its path; it does not
copy the rule, and it never restates a count.

## Consequences

- The claude.ai `servicepow-ad-producer` skill becomes a **downstream consumer**. It is not
  deleted — it keeps working in that workspace — but on conflict, **this repo wins**. Its
  description should be updated at the next release to say so.
- v4.0's deltas were merged into the playbook on 2026-08-26: LB49, LB50 (with its day-one
  amendment), LB51 + the state amendment, LB52 as check 33, and checks 32–34.
- The count moved 31 → **34**, stated in exactly one place, with a banner saying so.
- The Drive standing rule *"client state lives in the Drive state folder or it does not exist"*
  is superseded for this repo's clients. Drive keeps the historical ledger.
- The blocking-check count is now **machine-enforced as single-source** by
  `.claude/skills/_shared/scripts/validate_skills.py`.

## Known gaps at the time of decision

- The v4.0 skill body was **never read**. Its deltas were reconstructed from the Drive claim and
  install ledger — see `tmp/servicepow-ad-producer-v4-export.md`, labelled RECONSTRUCTED.
  **§8B (the check-list text), HB1–14, and the exact wording of checks 32–34 are still missing.**
- The claim file calls check 34 *"sport/domain accuracy"*; the install ledger calls it *"cited
  real reference"*. Unresolved.
- The four QC scripts' source is not in this repo, so checks 32–33 are enforced by judgment here
  rather than measurement.

**To close all three: paste the real v4.0 `SKILL.md`.** The reconstruction will be diffed against
it, corrected, and the export file deleted.
