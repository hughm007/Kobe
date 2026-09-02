# Pilot 01 — controlled outbound pilot plan
STATUS: PLANNING ONLY. Nothing sent, scheduled, purchased, or connected. Gated by BC-35.
Capacity: `capacity.md`. Packet: `pilot-01-packet.yaml`. Record schema: the Director's
`references/outbound-log.md`.

## 1. Run definition
Goal: test whether a website-status-derived observation opens a conversation with trades
owners, at a volume small enough to read honestly. Ceiling 10/day, 50/week, email only.

## 2. ICP — exact criteria
**Include (all must hold):**
- Trade: ONE trade only, so results are readable. Recommended: residential plumbing / drain.
- Metro: ONE metro only. Recommended: Phoenix East Valley (Mesa, Gilbert, Chandler, Tempe) —
  chosen for operational familiarity only, NOT as a proof claim.
- Website status: **Hot** only — `no site found` or `social only` (qualification rubric).
- Operational signals (business is alive): GBP updated · recent reviews · hours posted ·
  owner responding to reviews.
- Confidence: **High** (2+ sources) or **Medium** (1 source + consistent evidence). Low is
  never contacted.

**Exclude:** decay signals (closed banner, listing reported closed, last activity >12 months) ·
`weak site` and `has site` rows (deferred to a later run so this pilot tests one axis) ·
regulated-claim verticals · anything on the suppression list.

**Deferred to the proposal stage, not prospecting** (per the diagnosis-before-proposal rule):
decision-maker access · ability to pay · a problem stated by them · willingness to send footage
monthly · auto-disqualifiers (wants guaranteed lead counts, pay-on-results, unlimited
revisions, haggles the pilot price). None of these are knowable cold, and none are guessed.

## 3. First pilot cohort
50 rows maximum, one trade x one metro, split into two segments by website status:
- **Segment A — no site found** (expected majority): sharpest CONFIRMED gap.
- **Segment B — social only**: has a presence, no owned conversion path.
One Tier-2 body per segment, Tier-1 variables layered. Tier-3 research-derived personalization
is NOT used at this volume — the personalization-tiers economics say a well-aimed mid-tier
email to qualified rows beats hand-crafting at this deal size.

**The 50 rows do not exist yet.** No research has been run. This is a cohort definition.

## 4. Research and qualification workflow
1. Browser-first discovery: search maps for the category near the metro, walk visible results.
   **No bulk extraction of Maps, Yelp, or any ToS-protected platform.** Discovery stays manual.
2. Cross-verify each row against the business's own site, directories, chamber listings, state
   registries, and a `[name] [city]` search.
3. Classify website status; record confidence High/Medium/Low with the sources counted.
4. Programmatic checks only against the business's OWN url (live, mobile-friendly, conversion
   path present) — never against aggregators.
5. Record every row in the outbound log with evidence classes: CONFIRMED / INFERENCE /
   ASSUMPTION / UNKNOWN. Only CONFIRMED material may appear in copy.
6. Suppression check at qualification, dated. Re-checked immediately before send (BC-37).

## 5. Evidence position
Usable: **EV-sp-001** (Free Growth Audit definition and terms) · **EV-sp-002** (unit of sale is
a tested-variation pack). Nothing else is filed, so nothing else may be claimed. The copy below
carries no performance figure, no client name, no guarantee, and no comparative.

## 6. Offer routing
Segment A and B both route to the **Free Growth Audit** (EV-sp-001) — it is the documented
front door and the only offer whose terms are evidenced. Ad production is NOT pitched cold:
website status is the only CONFIRMED gap, and pitching video to a business with no website
would be selling past the evidence.

## 7. Proposed email sequence — TEST COPY, NOT APPROVED, NOT SENT
Merge fields in `{{ }}`. Every `{{OBSERVED_*}}` slot must be filled from CONFIRMED, dated
research or the email does not go out.

### Email 1 — day 0
```
Subject: no website found for {{company}}

Hi {{first_name}},

I looked for {{company}} the way a customer would - searched "{{trade}} {{metro}}" - and
found {{OBSERVED_PRESENCE}}, but no website. [CONFIRMED {{date}}, {{n}} sources]

That is the only thing I actually know about your business, and it is the reason I am
writing. Anything else I said would be a guess.

We are a marketing company; most of our work is with home-service businesses. We offer a
free growth audit: a no-obligation review of what is publicly visible - first impression,
local search presence, reviews, how a lead reaches you - and the highest-impact
opportunities and next actions we would identify. No purchase required.

Worth twenty minutes?

{{sender_full_name}}
Service Pow
{{postal_address}}
Reply STOP and I will remove you from my list.
```

### Email 2 — day 4
```
Subject: re: no website found for {{company}}

{{first_name}} - one specific thing from that search: {{OBSERVED_FACT_2}}.

If a call is awkward, I can send the audit as a short written summary instead. Same review,
no meeting.

{{sender_full_name}}, Service Pow
{{postal_address}} - Reply STOP to opt out.
```

### Email 3 — day 11, breakup
```
Subject: closing the loop

{{first_name}} - I will stop here rather than clutter your inbox.

If a website or lead follow-up ever moves up your list, reply to this and I will pick it
back up. Otherwise you will not hear from me again.

{{sender_full_name}}, Service Pow
{{postal_address}} - Reply STOP to opt out.
```

**Deliverability audit result: clean.** Plain text · zero links · no attachments · no ALL-CAPS
beyond the STOP opt-out convention · no urgency bait, pricing hype, or guarantee language.
Flagged token annotated, not deleted: **free** — legitimate, it is the approved name and term
of the offer under EV-sp-001, which requires the audit be described as free with no purchase
required.

**Claims audit result: clean.** Every statement about Service Pow traces to EV-sp-001 or is
descriptive positioning. Every statement about the prospect is a CONFIRMED, dated observation.

## 8. Sending infrastructure required
- **1 dedicated sending domain.** The primary domain is never used for cold outreach.
- **2 mailboxes on that domain** (the maximum per domain), each sending ~5/day to cover the
  10/day ceiling with headroom.
- Sizing check: 10/day at 20–25 per mailbox needs 1 mailbox; 2 gives redundancy and a gentler
  per-mailbox rate. The formula's 1.5x buffer and a second domain only become necessary above
  roughly 25/day — not at this pilot's volume.
- All four DNS records in place and verified **before** warmup begins: MX, SPF, DKIM, DMARC.
- Registrar spread and provider split (~60/40) are scale rules; not triggered at one domain,
  but they bind the moment a second is added.
- Capability state today: `discovered`. Nothing is purchased, created, or connected.

## 9. Warmup requirements
2–3 weeks minimum before the first real send. Warmup is never disabled once campaigns run.
Volume ramps, never jumps. Bounce and spam-report rates monitored daily while live; a
threshold breach pauses the run with no debate.

## 10. Compliance requirements
- Commercial-email legal floor: accurate identification, honest subject line, working
  unsubscribe, prompt suppression on request.
- **Physical postal address required in every footer — not yet supplied.**
- Sender is a real person at Service Pow with a real reply-to. No synthetic persona.
- Suppression is permanent; opt-outs added on receipt, not on next run.
- TCPA is not engaged by this pilot: no SMS, no voice. If SMS is ever added it requires prior
  express written consent, and cold marketing SMS stays blocked at planning (BC-39).

## 11. Estimated costs
| Line | Amount |
|---|---|
| Domain registration x1 | UNKNOWN — quote required |
| Mailbox seats x2 | UNKNOWN — quote required |
| Warmup tooling (optional) | UNKNOWN — quote required |
| Paid enrichment | $0 — excluded from this pilot |
| Sending platform | $0 — excluded from this pilot |
| **Total** | **UNKNOWN pending quotes** |

No figure is estimated here. Real prices are obtained and presented through the SPEND_APPROVER
two-step gate before any purchase.
