# Service Pow operating intelligence — project skills

Service Pow's judgment, made reusable. Anyone can buy Claude, Higgsfield, and a video model.
The advantage is the intelligence encoded around them: how we research, judge offers, develop
ideas, build stories, hold coherence, direct humans, select models, protect brands, edit, design
sound, reject bad work, test and learn.

These are **project** skills — they live in the repo, version with it, and reach Karl's Mac with
`git pull`. Frontmatter is restricted to the six fields legal on both Claude Code and claude.ai
uploads, so the same files work in both places.

## The pipeline

```
campaign-director  ← owns the Campaign Bible, sequences everything, resolves conflicts
      │
      ├─ client-intelligence ──── ground truth + voice of customer (evidence-labelled)
      ├─ strategy ─────────────── offer verdict (hard gate) + angle, ranked
      ├─ creative-director ────── concept pack + Hook Tournament + Anti-Generic Gate
      ├─ creative-spine ───────── ONE ad, not clips: beat map (anti-choppy authority)
      ├─ script-director ──────── words that survive being spoken
      ├─ storyboard-director ──── shots that each earn their place
      │
      ├─ brand-fidelity ───────── hard gate: marks are composited, never generated (LB24)
      ├─ continuity-supervisor ── one world across many generations
      ├─ human-performance-realism ─ AI people directed as actors
      │
      ├─ higgsfield-intelligence ─ dated capability map (never "best model" in prose)
      ├─ higgsfield-production ── the shot chooses the model + the cost ladder
      │
      ├─ cinematography-editor ── every cut states its reason
      ├─ audio-director ───────── audio as story, not music underneath
      │
      │
      └─ THE DUAL GATE — both must pass, never merged
            ├─ creative-critic ─── Kobe: taste + the ServicePow-6 score
            └─ skeptic ────────── the adversary, no production reasoning, 3 passes
```

**The unit of work is a pack, not an ad** — one concept family × 3–5 genuinely different hooks,
shared body and payoff. A single one-off ad is the exception and needs a stated reason.

## Directory

```
.claude/skills/
├── README.md
├── _shared/                            (not a skill — shared mechanics)
│   ├── references/
│   │   ├── advertising-standard.md     the bar + the judgment standard
│   │   ├── anti-choppy.md              the quality unit is the finished ad
│   │   ├── evidence-and-conflict.md    evidence ladder + conflict protocol
│   │   └── campaign-bible-contract.md  section ownership, read/write rules
│   ├── scripts/validate_skills.py      structural validator (16/16 passing)
│   └── tests/
│       ├── trigger-and-composition-tests.md
│       └── pilot-2am-critic.md         the v8 regression pilot
├── servicepow-campaign-director/       + templates/campaign-bible.md
├── servicepow-client-intelligence/     + references/voc-method.md
├── servicepow-strategy/
├── servicepow-creative-director/
├── servicepow-creative-spine/
├── servicepow-script-director/
├── servicepow-storyboard-director/     + references/shot-fields.md
├── servicepow-higgsfield-intelligence/ + references/higgsfield-capability-map.md
├── servicepow-higgsfield-production/   + references/cost-ladder.md
├── servicepow-continuity-supervisor/   + references/continuity-checklist.md
├── servicepow-human-performance-realism/ + references/realism-inspection.md
├── servicepow-brand-fidelity/
├── servicepow-cinematography-editor/
├── servicepow-audio-director/
├── servicepow-creative-critic/         + references/scorecard.md
└── servicepow-skeptic/                 the independent adversary (Kobe's counterpart)
```

## Where knowledge lives (one home per rule)

| Kind | Home |
|---|---|
| Permanent Service Pow rules | these skills + `agent-workspace/playbooks/` |
| Client facts | `agent-workspace/clients/<slug>/` |
| This campaign | `agent-workspace/clients/<slug>/campaigns/<id>/campaign-bible.md` |
| Current model facts | `servicepow-higgsfield-intelligence/references/higgsfield-capability-map.md` (dated) |
| Production learnings | `agent-workspace/knowledge/production-log/` |
| Campaign performance | `agent-workspace/knowledge/campaign-results/` |

**Skills are procedure; playbooks are content.** A skill never copies a playbook's rules — it
cites the path and reads it when needed. If they disagree: playbook wins on *what is true*,
skill wins on *what order to do it in*.

## Two ledgers, never merged

`production-log/` answers *did the generation work*. `campaign-results/` answers *did the ad
sell*. **Never confuse "this model generated the clip well" with "this advertisement made people
buy."** Learnings climb EXPERIMENTAL → REPEATED → VALIDATED; only VALIDATED changes a playbook.

## Running the checks

```bash
python3 .claude/skills/_shared/scripts/validate_skills.py
```

Validates frontmatter portability, required sections, reference-path resolution, that no secrets
or client facts are baked into permanent skills, and **LB50 in three forms**:

1. the blocking-check count is declared in exactly one file, and nothing else states a count;
2. LB1–LB52 and HB1–HB14 are each defined exactly once, in their canonical home — and a
   distinctive span of every rule's own wording is searched for across the repo, so **citing
   "LB24" passes and pasting LB24's text anywhere else fails**;
3. no skill restates a threshold the playbook owns.

All three were proved able to fail before being trusted — a gate that cannot fail is not a gate.
