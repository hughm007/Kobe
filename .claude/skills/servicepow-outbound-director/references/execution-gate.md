# Outbound execution gate
CANONICAL: outbound-execution-gate

Single home of Service Pow's outbound execution law: what counts as execution, what the
APPROVER must be shown before it, and the three inputs (suppression, capacity, evidence) a
run cannot be assembled without. Skills and the registry point here; they do not restate it.
Registry gates: BC-35 (the gate), BC-36 (packet completeness), BC-37 (suppression),
BC-39 (consent), BC-40 (capacity ceiling).

**A gate that cannot be tested is a promise, not a gate.** Every field below is enumerated so
a packet can be checked mechanically rather than vouched for in prose.

## 1. Execution surfaces — the actions this gate covers
Any one of these is execution and stops here until signed off:

| # | Surface |
|---|---|
| 1 | Email send (single, sequence step, or batch) |
| 2 | SMS send |
| 3 | Calling or dialing |
| 4 | DM send on any platform |
| 5 | List purchase |
| 6 | Paid enrichment (credits, per-record lookups) |
| 7 | Campaign activation or schedule enable |
| 8 | Bulk upload of recipients into a sending platform |
| 9 | Any API write that initiates outreach, directly or on a timer |

Loading a list into a sending tool is surface 8 even when nothing is scheduled: possession of
a warm list inside a tool that can send is treated as sending. Surfaces 5 and 6 are also
spend, so they carry the SPEND_APPROVER gate in addition to this one.

## 2. The approval packet — required fields
A packet missing any field is incomplete and cannot be signed off:

| Field | Content |
|---|---|
| `cohort` | The exact recipient list, or a cohort defined tightly enough to enumerate |
| `copy` | The exact message text per step, final, not a description of it |
| `channel` | Which surface(s) from section 1 |
| `volume` | Recipients, sends per day, and total across the sequence |
| `cost` | Estimated spend, or the literal value none |
| `suppression` | Result of the suppression check, dated |
| `compliance` | Consent tier, quiet hours, do-not-call, and legal-floor status per channel |
| `infrastructure` | The sending domain, mailbox set, or tool, and its capability state |
| `capacity` | The recorded capacity input and the ceiling derived from it |

The APPROVER signs the packet, not the intention. A packet altered after sign-off (different
copy, larger volume, new channel) is a new packet.

Precedent: once a pattern is approved, a later identical run may proceed-and-inform citing the
prior sign-off. Identical means same cohort definition, copy, channel, and volume band. Any
widening is not identical.

## 3. Suppression list
Home: `suppression-list.md` in the outbound surface of the Service Pow company KB. Format is
one row per entry:

```
<contact>  |  <scope: address | domain | company | phone>  |  <reason>  |  <date>  |  <source>
```

Rules: entries are permanent; opt-outs are added on receipt, not on next run; scope `domain`
and `company` suppress every contact beneath them; the list is checked at qualification and
again immediately before send (BC-37). A run whose suppression check has no date is unchecked.

## 4. Capacity input
Home: `capacity.md` in the same surface. It records how many new engagements Service Pow can
actually onboard in the period, who recorded it, and when. The volume ceiling is derived from
it — never from ambition, and never invented to fill the field. **An absent or stale capacity
input is an UNKNOWN that blocks the run** (BC-40); the correct move is to ask the role-holder
for the number, park the run per the never-stall rule in `../../_servicepow/data/roles.md`,
and do other work meanwhile.

## 5. Evidence input
Material claims about Service Pow in outbound copy cite Evidence Record ids from the Service
Pow self-KB (`../../_servicepow/policies/claims-and-proof.md` owns the record structure and
names the self-KB home). No valid record means the claim is omitted or rewritten as non-claim
positioning — never softened into a vaguer version of the same claim (BC-38).
