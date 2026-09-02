# Outbound log — record schema and learning loop
CANONICAL: outbound-log-schema

Single home of the outbound persistence structure. The Director writes and updates these
records; it never refers to a log that does not exist. Home: `outbound-log.md` in the outbound
surface of the Service Pow company KB, alongside `suppression-list.md` and `capacity.md`
(`execution-gate.md` sections 3 and 4).

## Record fields
One record per prospect per run. Fields are never silently blank — an empty field is written
as `UNKNOWN`.

| Field | Content |
|---|---|
| `prospect` | Contact name, or `UNKNOWN` if not yet identified |
| `company` | Business name |
| `source` | Where the row came from, and the date it was gathered |
| `research_facts` | Observed facts, each evidence-classed and dated (see below) |
| `inferences` | What was reasoned from those facts, labelled as inference |
| `offer` | Which service is being offered, and why this one |
| `angle` | The specific outreach angle derived from the research |
| `message_version` | Sequence and step id, e.g. `run-03/email-1/v2` |
| `channel` | The surface used, from `execution-gate.md` section 1 |
| `status` | `researching` / `qualified` / `disqualified` / `packet-pending` / `approved` / `live` / `closed` |
| `approval` | APPROVER sign-off reference and date, or `NOT APPROVED` |
| `sent_status` | `not sent` / `sent <date>` / `bounced` / `paused` |
| `response` | The reply text or call summary, verbatim where possible |
| `response_classification` | One value from the taxonomy below |
| `follow_up_date` | Next scheduled touch, or `NONE` |
| `outcome` | `opportunity` / `nurture` / `pass` / `suppressed` / `open` |
| `learning` | What this record teaches about signal, segment, or angle — dated |
| `suppression_status` | `clear <date>` / `SUPPRESSED <reason>` |

## Evidence classes — every research line carries one
| Class | Meaning | May it appear in copy? |
|---|---|---|
| `CONFIRMED` | Directly observed, dated, with source count per the qualification rubric | Yes |
| `INFERENCE` | Reasoned from confirmed facts; plausible, not observed | Only as a question, never as an assertion about them |
| `ASSUMPTION` | Believed without evidence; stated so it can be challenged | No |
| `UNKNOWN` | Not established | No |

A personalized line may cite `CONFIRMED` material only. This is what makes the difference
between a specific opening and a fabricated one: the sentence has a dated observation behind
it or it does not get written.

## Response classification and what each teaches
| Classification | Targeting effect | Messaging effect |
|---|---|---|
| `positive` | Promote the matching signal and segment in the next run | Keep the angle; note which observed fact opened it |
| `negative` | Demote the segment if the pattern repeats across runs, not on one row | Review whether the angle over-claimed |
| `no_response` | No signal from one row; only the aggregate rate is informative | Test one variable at a time against the segment |
| `wrong_contact` | Contact-discovery method needs correction, not the segment | Re-verify decision-maker method for this trade |
| `not_interested_now` | Keep in cohort, set follow-up date, do not re-mail before it | Timing angle, not a louder offer |
| `already_has_agency` | Segment stays valid; qualification should catch it earlier | Switch to the differentiated angle or pass |
| `opt_out` | Written to the suppression list immediately, permanently | Removed from every future cohort |

## Learning loop
After each run the Director writes dated learnings from the classifications above and lets the
data — not taste — pick the next run's priority signals. One row is an anecdote; a pattern
across a segment is a finding. Learnings that change targeting or copy are cited in the next
run's packet so the APPROVER sees what changed and why.
