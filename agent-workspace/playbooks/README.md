# playbooks/

How Service Pow does the work. A playbook is the current best answer to "how do we run
this?" — steps, sequence, checks and the traps we've already fallen into.

**Belongs here:** repeatable processes.
**Doesn't belong here:** blank documents to fill in (→ `../templates/`), one-off
observations (→ `../knowledge/learnings/`), or client-specific instructions
(→ that client's folder).

## The relationship to knowledge

Playbooks and learnings are a loop, not two shelves:

```
do the work → observe → knowledge/learnings/ → (repeats 3×?) → promote into a playbook
```

A learning is evidence from one instance. A playbook is settled practice. When the same
learning appears three times, fold it into the playbook and link back to the learnings
that earned it. When a playbook step is contradicted by experience, change the playbook —
don't route around it silently.

**Every playbook is a living document.** If you follow one and it was wrong, incomplete,
or missing a step you had to improvise, fix it before you close the session. That is the
whole point of the folder.

## Contents

### Web
- [`web/website-build.md`](web/website-build.md) — discovery through launch, with the
  pre-launch checklist that gates every go-live
- [`web/seo-baseline.md`](web/seo-baseline.md) — the SEO floor every site we ship meets

### Advertising
- [`ads/campaign-launch.md`](ads/campaign-launch.md) — planning, build, QA, launch
- [`ads/creative-testing.md`](ads/creative-testing.md) — how we test creative so results mean something

### Content
- [`content/content-engine.md`](content/content-engine.md) — planning and producing content
  that maps to objectives

### Client lifecycle
- [`client-lifecycle/discovery-call.md`](client-lifecycle/discovery-call.md) — the questions, and why each earns its place
- [`client-lifecycle/onboarding.md`](client-lifecycle/onboarding.md) — signature to first deliverable
- [`client-lifecycle/reporting.md`](client-lifecycle/reporting.md) — reporting that survives scrutiny

## Writing a new playbook

Structure: **When to use this → Prerequisites → Steps → Checks → Common failures →
Related.** Number the steps. Put the checklist somewhere it can be copied and ticked.
Write the "common failures" section from real experience — it's the part people actually
read twice.
