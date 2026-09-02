# Outbound log
Records follow the schema in
`.claude/skills/servicepow-outbound-director/references/outbound-log.md`. Empty fields are
written `UNKNOWN`, never left blank. Research lines carry an evidence class: CONFIRMED /
INFERENCE / ASSUMPTION / UNKNOWN.

## Live runs
_None. No run has been defined, because the capacity input in `capacity.md` is UNKNOWN._

## Fixture record — TEST DATA, not a real business, never contactable
```
prospect:                 UNKNOWN
company:                  FIXTURE CLEAR CO (TEST DATA)
source:                   fixture, 2026-09-01
research_facts:           CONFIRMED 2026-09-01, 2 sources: no standalone website found
                          CONFIRMED 2026-09-01, 1 source: active social profile
inferences:               INFERENCE: inbound leads arrive by phone and social message only
                          ASSUMPTION: the owner is the decision maker — unverified
                          UNKNOWN: revenue, ad spend, marketing performance, current pain
offer:                    Free Growth Audit (EV-sp-001) — chosen because website status is the
                          only CONFIRMED gap; no other service is evidenced
angle:                    Searched as a customer would and found no website — observation only
message_version:          fixture/email-1/v1
channel:                  email
status:                   packet-pending
approval:                 NOT APPROVED
sent_status:              not sent
response:                 UNKNOWN
response_classification:  UNKNOWN
follow_up_date:           NONE
outcome:                  open
learning:                 UNKNOWN — no run has produced data
suppression_status:       clear 2026-09-01
```

## Learnings
_None. One row is an anecdote; there is not yet a run, let alone a pattern._
