---
title: Creative Testing
type: playbook
client: internal
owner: Karl
status: active
created: 2026-08-24
updated: 2026-08-24
tags: [ads, creative, testing, experimentation]
---

# Creative Testing

**When to use:** whenever more than one creative is running, which is nearly always.

The purpose of testing is not to find "the best ad". It's to learn something transferable
about what moves this audience — so the next campaign starts ahead of where this one did.
An ad that wins without teaching you why is a lucky result, not an asset.

---

## Every test starts with a hypothesis

Written before the creative is made:

> **We believe** that [change]
> **will** [effect]
> **because** [reason grounded in the audience]
> **We'll know we're right if** [metric] [moves how much] over [window].

Example:

> We believe that leading with the price rather than the outcome will increase
> click-through, because this audience's main hesitation is cost uncertainty. We'll know
> we're right if CTR rises by at least 20% over two weeks at comparable spend.

No hypothesis, no test — you're just running ads and calling the survivor a winner.

## Test one thing

Isolate a single variable so the result means something:

| Variable | Examples |
|---|---|
| **Message / angle** | outcome vs. price vs. speed vs. risk-reversal |
| **Hook** | the first three seconds, or the first line |
| **Format** | static / video / carousel / UGC-style |
| **Offer** | what's actually being offered, and the terms |
| **Proof** | review, case study, guarantee, credential |
| **Call to action** | what you ask for, and how hard you ask |

**Angle before execution.** Testing five polished versions of the same idea tells you
almost nothing. Testing five genuinely different ideas roughly-made tells you where to
spend the production budget. Find the angle first, then refine it.

## Running the test

- Give each variant enough budget and enough time to produce a readable result. Underfunded
  tests generate confident nonsense.
- Agree the sample threshold before starting, and don't call it early because a variant
  looks good on day two.
- Change nothing else mid-test.
- Watch the metric your hypothesis named. Note the others, but don't retrofit a hypothesis
  to whichever number happened to move.

## Reading the result

Ask, in order:

1. Did the metric in the hypothesis move as predicted?
2. Is the difference big enough to be real, given the volume? Small gaps on small numbers
   are noise.
3. Did it move the *business* outcome, or only the platform metric? A CTR win that
   delivers worse leads is a loss.
4. **Why?** This is the transferable part. "Version B won" is worth nothing next quarter.
   "This audience responds to price certainty over speed" shapes everything that follows.

## Log it

Every completed test gets an entry in
[`../../knowledge/learnings/`](../../knowledge/learnings/) with:

- the hypothesis
- what ran, at what spend, over what window
- the result, with real numbers
- the interpretation — and how confident we are
- what we'd test next

Losing tests are logged too. A record of what doesn't work for an audience is a
competitive advantage, and it's the record everyone else throws away.

## Creative fatigue

Performance decaying while nothing else changed usually means the audience has seen it
enough. Watch frequency alongside cost per outcome, refresh before the decline rather
than after, and keep a bank of tested angles so a refresh isn't a scramble.

## Common failures

| Failure | Prevention |
|---|---|
| Testing without a hypothesis | Write it before the creative brief |
| Five versions of the same idea | Test angles first, executions second |
| Calling a winner on day two | Set the threshold and window in advance |
| Winner on CTR, worse on cost per sale | Judge on the business outcome |
| Winner recorded, reason never captured | The "why" is the deliverable |
| Losing tests never written down | Log them — they're half the value |

## Related

- [`campaign-launch.md`](campaign-launch.md)
- [`../../knowledge/learnings/_template.md`](../../knowledge/learnings/_template.md)
