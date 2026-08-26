# Evidence ladder and conflict protocol

Two mechanics every Service Pow skill obeys.

---

## 1. The evidence ladder

**Never invent a client fact.** Every material statement about a client, their customers, their
market or their results carries one of four labels:

| Label | Means | Allowed use |
|---|---|---|
| **CONFIRMED** | Client stated it, or a primary document/source says it. Cite the source. | Anything, including client-facing claims — subject to the claims sheet |
| **INFERRED** | Reasoned from confirmed facts. State the reasoning. | Internal planning. Must be confirmed before it reaches a claim |
| **UNKNOWN** | We do not know and have not established it. | Must be surfaced. Never quietly filled in |
| **HYPOTHESIS** | A creative bet we are deliberately making. | Creative direction only. Must be labelled and testable |

Rules:
- An UNKNOWN that blocks the work is escalated to Karl **by name**, not worked around.
- Marked-unknown always beats confidently-wrong.
- A claim that will appear in the finished ad must be CONFIRMED **and** on the client's signed
  claims sheet. Substantiation is the client's, in writing, before production —
  see `agent-workspace/operations/compliance.md`.
- "I looked" is not evidence (LB30/LB51). A reference must be **cited and openable**.

---

## 2. The conflict protocol

The Campaign Bible is the single source of truth. Downstream skills consume it; they do not
rewrite it.

**No skill silently invalidates an upstream approved decision.**

When a skill believes an approved decision is wrong — the strategy will not convert, the concept
cannot be produced within budget, the script contradicts the spine, a shot cannot be generated
believably — it does **not** quietly fix it. It:

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
   reason — the record matters), or escalate to Karl.

A conflict is not failure. A conflict caught before generation is the system working; the same
problem caught after 195 credits of video is the system failing.

### The Claude-Catch Law applies here

Noticing an obvious problem creates an obligation. If it violates a written law, fix it and
report. If it is a judgment call, ask before delivery — with a recommendation and the cost.
**The spec is not a shield.** Tag catches CLAUDE-CAUGHT or OWNER-CAUGHT; the ratio is the KPI of
a system learning to see.
