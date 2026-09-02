# Grounded inputs — the evidence corpus behind scaled creative
Single home of the input-grounding discipline for any scaled/recurring creative production.
Method derived from `marketingskills` `ad-creative` (MIT, Corey Haines), re-expressed for
Service Pow and bound to our evidence law.

**The failure this prevents:** ungrounded generation produces plausible ads from training
data, not from what converts for THIS client. Grounding is an input problem, not an output
problem.

## The corpus (durable, per client, in the client KB)
```
inputs/
  winning-ads/   10–20 captures of the client's highest-performing ads, last 90 days
  reviews/       real customer reviews (verbatim; sources noted)
  comments/      ad comments — customers state their own objections and angles here,
                 and those usually convert best
```
Every generated concept must trace to named source material from this corpus — the trace is
recorded with the concept (it is the creative twin of an Evidence Record, and any factual
claim inside a concept still needs its own EV id per
`../../_servicepow/policies/claims-and-proof.md`).

## Hard rules
- **Empty corpus = stop.** If winning-ads/ or reviews/ is empty, production halts and the
  OPERATOR requests material — ungrounded concepts are never generated as a fallback.
- **Inputs decay.** Refresh winning-ads/ as new ads scale; refresh reviews/ and comments/
  monthly. A stale corpus is flagged in the concept pack.
- **Client review discloses grounding.** Any concept pack presented for CLIENT_APPROVER
  review carries a disclosure block: which elements are grounded in real assets and which are
  generated/illustrative (consistent with
  `../../_servicepow/policies/realism-and-disclosure.md`).
- **One variable per test cycle** when iterating from performance data — changing several
  things at once destroys the read.

Boundary: this reference governs INPUT discipline. Concept quality remains the Hook
Tournament + Anti-Generic Gate in `../SKILL.md`; judgment remains the critic and skeptic.
