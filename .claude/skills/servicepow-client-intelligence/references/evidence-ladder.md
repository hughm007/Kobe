# Evidence ladder and conflict protocol

Two mechanics every Service Pow skill obeys. This file is owned by
`servicepow-client-intelligence`; other skills cite it as
`../../servicepow-client-intelligence/references/evidence-ladder.md` and do not restate it.

---

## 1. The evidence ladder

**Never invent a client fact.** Every material statement about a client, their customers, their
market or their results carries one of four labels:

| Label | Means | Allowed use |
|---|---|---|
| **CONFIRMED** | Client stated it, or a primary document/source says it. Cite the source. | Anything, including client-facing claims — subject to `../../_servicepow/policies/claims-and-proof.md` (Evidence Records, §2) |
| **INFERRED** | Reasoned from confirmed facts. State the reasoning. | Internal planning. Must be confirmed before it reaches a claim |
| **UNKNOWN** | We do not know and have not established it. | Must be surfaced. Never quietly filled in |
| **HYPOTHESIS** | A creative bet we are deliberately making. | Creative direction only. Must be labelled and testable |

Rules:

- An UNKNOWN that blocks the work is escalated to the role that can answer it — the
  CLIENT_APPROVER for client facts, the APPROVER for internal calls — not worked around. The
  never-stall rule in `../../_servicepow/data/roles.md` governs how work parks while waiting.
- Marked-unknown always beats confidently-wrong.
- A claim that will appear in a finished deliverable must be CONFIRMED **and** carried by a
  filed Evidence Record per `../../_servicepow/policies/claims-and-proof.md` §2 — substantiation
  before production, cited by EV- ID. Registry gate: BC-16 in the canonical blocking-check
  registry (`../../_servicepow/data/blocking-checks.yaml`).
- "I looked" is not evidence. A reference must be **cited and openable**.

---

## 2. The conflict protocol

The Campaign Bible is the single source of truth. Downstream skills consume it; they do not
rewrite it.

**No skill silently invalidates an upstream approved decision.**

When a skill believes an approved decision is wrong — the strategy will not convert, the
concept cannot be produced within budget, the script contradicts the spine, a shot cannot be
generated believably — it does **not** quietly fix it. It:

1. **STOPS** work on the affected part.
2. **APPENDS** an entry to the Bible's `## CONFLICTS` section:

```markdown
### CONFLICT <date> · raised by <skill> · status: OPEN
**Approved decision:** <what the Bible currently says>
**Problem:** <what is wrong, concretely>
**Evidence:** <why — cite the shot, the rule, the number>
**Proposed change:** <the specific alternative>
**Cost of not changing:** <what happens if we ship as approved>
```

3. **RETURNS** to `servicepow-campaign-director`, which decides: accept the change (update the
   Bible, mark the conflict RESOLVED with the decision), reject it (mark REJECTED with the
   reason — the record matters), or escalate to the APPROVER.

A conflict is not failure. A conflict caught before generation is the system working; the same
problem caught after generation spend has been committed is the system failing.

### The catch law applies here

Noticing an obvious problem creates an obligation. If it violates a written law, fix it and
report. If it is a judgment call, ask before delivery — with a recommendation and the cost.
**The spec is not a shield.** Tag catches CLAUDE-CAUGHT or OWNER-CAUGHT; the ratio is the KPI
of a system learning to see.
