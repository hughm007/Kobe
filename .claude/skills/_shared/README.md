# _shared — Service Pow skill system mechanics

Not a skill (no `SKILL.md`, so Claude Code ignores it for invocation). This holds the few
rules **every** Service Pow skill needs, so no skill restates them and they can never drift
apart into fifteen slightly-different versions.

| File | What it is | Who reads it |
|---|---|---|
| `references/advertising-standard.md` | What a Service Pow ad must be, and the AI tells that get it killed | every creative skill |
| `references/anti-choppy.md` | The sequence-coherence law — the quality unit is the finished ad | spine, storyboard, editor, critic |
| `references/evidence-and-conflict.md` | CONFIRMED/INFERRED/UNKNOWN/HYPOTHESIS ladder + the conflict protocol | every skill |
| `references/campaign-bible-contract.md` | Where the Bible lives, who writes which section, read/write rules | every skill |

## Where the real content lives

These skills are **procedure**, not content. The standards themselves are in the workspace
and stay there — one home per rule:

- `agent-workspace/playbooks/ads/video-production.md` — the 31 blocking checks, laws LB24–LB52,
  the Claude-Catch Law, ServicePow-6 scoring
- `agent-workspace/operations/compliance.md` — claims, FTC synthetic-person rule, AI disclosure,
  ad↔landing-page parity, rights
- `agent-workspace/company/brand/style-bank.md` — design law
- `agent-workspace/clients/<slug>/client-brief.md` + `brand-guide.md` — client facts and constraints

If a skill and a playbook disagree, the playbook wins on *content* (what is true / what is
required); the skill wins on *procedure* (what order to do things in). Never copy a playbook's
rules into a skill — cite the path and read it when needed.
