---
title: Evidence Records — Service Pow's own claims
type: profile
client: internal
owner: APPROVER
status: active
created: 2026-09-01
updated: 2026-09-22
tags: [company, claims, evidence]
---

# Service Pow self-KB — Evidence Records

The home for claims Service Pow makes about **itself**. Client claims live in that client's KB
and never here; these live here and never in a client KB. Record structure, ID scheme and the
evidence bar are owned by `.claude/skills/_servicepow/policies/claims-and-proof.md` — this file
holds the records, not the rules.

Subject slug is `sp`. Outbound and website copy cite these ids; a material claim with no
APPROVED record here is omitted or rewritten as non-claim positioning (BC-38).

---

## APPROVED

### EV-sp-001
```
claim:        "A free, no-obligation review of a prospective client's current marketing and
              growth system, designed to identify the highest-impact opportunities, leaks and
              next actions." Free; no purchase required; no obligation.
evidence:     Offer definition and terms recorded in company/services.md section 0, marked
              owner-confirmed on that date.
source:       Owner confirmation, recorded 2026-08-31 in company/services.md
verified:     2026-09-01 (re-read against services.md section 0)
approver:     APPROVER
scope/expiry: Outbound copy, website, decks. Re-confirm if the offer terms change.
status:       APPROVED
```
**Usage limits:** the audit may be described only as reviewing what is public or what the
prospect supplies. Never paired with a revenue figure, a performance figure, a guarantee, or
any suggestion of private-account access — those boundaries are part of the approved claim.

### EV-sp-002
```
claim:        The unit of sale for ad production is a tested-variation pack (concepts x hook
              variants), not a single video.
evidence:     Product definition recorded in company/services.md section 1.
source:       Company services profile, synced 2026-08-25
verified:     2026-09-01
approver:     APPROVER
scope/expiry: Outbound and sales copy. Re-confirm if packaging changes.
status:       APPROVED
```
**Usage limits:** describes what is sold. Carries no claim about how the variants perform.

### EV-sp-003
```
claim:        The free Trade Growth Audit is delivered within 48 hours of the request, as a
              plain-English document sent by email, with an optional free 20-minute
              walkthrough call.
evidence:     Owner answer in session, 2026-09-22, choosing "48 hours + free 20-min call"
              after being told to pick it only if 48 hours can be hit every time, including
              busy weeks (claims policy §3 commitment).
source:       Owner (APPROVER), Claude Code session 2026-09-22
verified:     2026-09-22
approver:     APPROVER
scope/expiry: Website (/growth-audit, homepage audit band, form confirmation), outbound.
              Re-confirm if volume makes 48 hours unreliable; withdraw the day it slips.
status:       APPROVED
```
**Usage limits:** the clock starts at request receipt. Never "guaranteed", never paired with
results. Supersedes the earlier "within a few business days" wording.

---

## AWAITING EVIDENCE — not usable in any copy

These are the claims outbound would most like to make. None has a record, so none may appear —
not softened, not hedged, absent. Listed so the gap is visible and closeable, never so it can
be borrowed.

| Wanted claim | What would create the record | Blocked because |
|---|---|---|
| Named client work / case study | CLIENT_APPROVER confirmation to use the client name and outcome | No client-side confirmation on file |
| Any performance result (leads, calls, ROI, conversion lift) | Measurement with a dated source and method | No measurement filed |
| Response-time or turnaround promises beyond stated delivery windows | APPROVER commitment that the business will honor it | Guarantee needs the §3 double gate |
| Client counts, years in business, volume delivered | Records with a dated source | Not filed |
| Comparative claims against named competitors | Substantiation per claims policy §1 | Not filed |
