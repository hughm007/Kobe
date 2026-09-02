# Pilot 01 — sending infrastructure plan (PLANNING ONLY)
STATUS: DESIGN. Nothing purchased, connected, configured, warmed, or sent.
Date: 2026-09-01. Active set: 5 prospects. Total payload: 5 recipients x 3 touches = 15 emails.

Sources are labelled: **[DOCTRINE]** = Service Pow law in the Director's
`references/deliverability.md`; **[EXTERNAL]** = current industry practice researched
2026-09-01, advisory only; **[LAW]** = statutory requirement.

---

## 1. SENDER IDENTITY — 4 of 5 fields need an owner decision

| Field | Status | Requirement |
|---|---|---|
| Sender name | **UNKNOWN — owner decision** | Must be a real person at Service Pow. Synthetic personas as senders are barred [DOCTRINE: realism-and-disclosure]. |
| Email naming convention | **UNKNOWN — owner decision** | Recommend `firstname@<sending-domain>`. Reads as a person, matches how small trades businesses correspond. `info@` or `sales@` would undercut a 1:1 email. |
| Reply-to | **UNKNOWN — owner decision** | Recommend reply-to = the sending address, monitored daily. A reply arriving nowhere is worse than no send. |
| Company identity | **READY** | "Service Pow". No trading-name variants, no title claims for the sender without evidence. |
| Signature | **DEFINED, pending the above** | Plain text only: name, Service Pow, postal address, opt-out line. No logo, no image, no tracking pixel, no link [DOCTRINE + drafts already written this way]. |

## 2. PHYSICAL POSTAL ADDRESS — required, cannot be invented

**[LAW]** Commercial email must carry a valid physical postal address. Acceptable forms: a
current street address; a PO box registered with USPS; or a private mailbox from a registered
commercial mail-receiving agency. Also required: honest subject, clear opt-out, and opt-out
processing within 10 business days with the mechanism live at least 30 days after send.

**Status: BLOCKED — owner must supply.** The drafts carry `{{postal_address}}` and cannot ship
without it. A client's address (e.g. any client KB entry) is not usable — it must be Service
Pow's own.

## 3. SENDING DOMAIN ARCHITECTURE

**Sizing, from the doctrine formula.** 15 emails / month ÷ 20 working days = **under 1 per
day**. 1/day ÷ 20–25 per mailbox = **1 mailbox**. 1 mailbox x 1.5 ÷ 2 = **1 domain**.
This is the smallest configuration the formula produces.

| Item | Requirement |
|---|---|
| Domains | **1** dedicated sending domain |
| Primary domain isolation | **Mandatory.** [DOCTRINE] "Never send cold outreach from the primary domain. Ever." [EXTERNAL] agrees: if the main domain gets flagged, ordinary business mail — invoices, replies — starts landing in spam too. |
| Naming strategy | A recognisable variant of the brand, not a disguise: e.g. `servicepow.co`, `getservicepow.com`, `servicepowmail.com`. Must not impersonate another business, and should be plainly Service Pow when read. |
| Mailboxes | **1** required; a 2nd is optional redundancy, not needed at this volume. Doctrine caps 2 per domain. |
| Per-mailbox daily volume | **1–2/day.** Far under every published ceiling ([EXTERNAL] ranges 20–30/day conservative, ≤100/day aggressive). |
| DNS | **MX, SPF, DKIM, DMARC — all four, verified before any send** [DOCTRINE + EXTERNAL agree]. MX is needed to receive replies, which this pilot depends on. |
| DMARC policy | Start `p=none` to monitor, tighten to `p=quarantine` once aligned. |
| Registrar spread / provider split | Scale rules. **Not triggered at one domain** — they bind when a second is added. |
| Warmup | **[DOCTRINE] 2–3 weeks minimum, never disabled once live.** [EXTERNAL] concurs: 2 weeks minimum, 4–6 weeks for a new domain ramping 5–10/day. |

### Flagged tension — proportionality of warmup (owner decision, see §7)
Doctrine warmup for this pilot means roughly 140–300 warmup emails to enable **15** real ones —
the scaffolding is ~10–20x the payload, and typical warmup tooling generates artificial
inbox-to-inbox traffic to do it. Three ways to resolve, none chosen unilaterally:

- **Option A — doctrine-strict.** Dedicated domain, 1 mailbox, full DNS, 2–3 week warmup, then
  send. Fully compliant. Cost below; **delay ~3 weeks**.
- **Option B — send from the primary domain.** Zero cost, zero delay. **Violates doctrine
  outright** ("Ever"). Not recommended: the downside is primary-domain reputation, which is
  slow and expensive to repair, and it is the one asset the pilot cannot re-buy.
- **Option C — dedicated domain, natural ramp, no warmup tool.** Buy the domain, set DNS, then
  send 1–2 genuinely personal emails per day from day one. At this volume the send pattern *is*
  a conservative ramp. **Requires an explicit doctrine exception**, because doctrine says warm
  before real sending. Cost as Option A minus warmup tooling; **delay ~2–3 days** for DNS.

**Recommendation: Option A if the pilot is a rehearsal for scale** (the infrastructure is
reusable and you will want it warmed anyway). **Option C if the pilot is a one-off test of
whether the message lands** — but only with an exception recorded, never by quietly ignoring
the rule.

## 4. TOOLING — no sending platform is needed

**Verdict: NONE required.** Fifteen emails, five recipients, three touches, hand-written and
individually researched. A person sends these from a mailbox and records outcomes in
`outbound-log.md`.

Instantly, Smartlead, lemlist and similar exist to sequence hundreds-to-thousands of sends.
Introducing one here would add monthly cost, add a platform whose defaults and "activate"
conveniences are exactly what the send gate exists to stop [DOCTRINE: tools never own the
motion], and risk making genuinely 1:1 email feel automated — the opposite of what the copy
pass just spent a phase achieving.

| Option | Verdict |
|---|---|
| Manual send from mailbox + log | **Chosen.** Sufficient, cheapest, best 1:1 fidelity. |
| Sending platform | Not justified. Revisit above ~50 prospects or when sequencing by hand starts causing errors. |
| Warmup tool | Only under Option A. Optional, needs a quote. |
| Enrichment / data platform | Not justified. The five addresses were found on the businesses' own public sites. |

## 5. COST PLAN — researched 2026-09-01, not estimated

### REQUIRED
| Line | Price found | Note |
|---|---|---|
| 1x .com domain, first year | **$9.77/yr** (Cloudflare, at-cost, same renewal) or **$11.28 + $0.20 ICANN** (Namecheap first year, ~$15 renewal) | Cloudflare cheaper and renews flat |
| 1x mailbox | **$7.00/user/mo** annual commitment, or **$8.40/user/mo** flexible (Google Workspace Business Starter); **$7.00/user/mo** (Microsoft 365 Business Basic, after the July 2026 increase) | Either is fine; monthly billing avoids a 12-month lock for a pilot |

**Required total: ~$9.77 one-off + ~$7.00–8.40/month.**
Illustrative 3-month pilot window: **≈ $31–35 all-in.**

### OPTIONAL
| Line | Note |
|---|---|
| 2nd mailbox | +$7.00–8.40/mo. Redundancy only; unnecessary at 1–2 sends/day. |
| Warmup tooling | Needed only under Option A. Price not quoted — no vendor selected, and I will not guess one. |

### NOT JUSTIFIED YET
Sending platform · Apollo · ColdIQ · Instantly/Smartlead · Twilio (no SMS in this pilot) ·
additional domains (formula returns 1) · CRM · deliverability-testing SaaS.

## 6. SPEND_APPROVER PACKET
Presented under the two-step spend gate [DOCTRINE: generation-and-spend]. Plan and expected
cost below; authorisation required **before** any purchase.

```
purpose:        Sending infrastructure for pilot-01. 5 prospects, 15 emails, email only.
items:          1x .com domain (registrar: Cloudflare at-cost recommended)
                1x mailbox seat (Google Workspace Business Starter or MS365 Business Basic)
one_off_cost:   ~$9.77  (domain, first year, renews flat at the same price)
recurring_cost: ~$7.00-8.40 / month for one mailbox
3_month_total:  ~$31-35
alternatives:   Namecheap domain ~$11.48 first year but ~$15 renewal - rejected on renewal cost
excluded:       sending platform, enrichment, data purchase, SMS, additional domains,
                second mailbox - none justified at this volume
warmup_choice:  DEPENDS ON OPTION A vs C (section 3) - Option A may add a warmup tool cost
                that is NOT quoted here and would need its own gate
reversibility:  Domain is a sunk 12-month cost. Mailbox on monthly billing is cancellable
                within one billing cycle.
risk_if_wrong:  Low. Total exposure under ~$35 for the pilot window.
requires:       SPEND_APPROVER authorisation. Separately, BC-35 APPROVER sign-off before any
                send - spend approval is NOT send approval.
```

## 7. LIVE PILOT BLOCKERS — everything that must be true before ONE email sends

| # | Blocker | Owner | Status |
|---|---|---|---|
| 1 | Sender name chosen (real person) | Owner | **OPEN** |
| 2 | Sending-address convention chosen | Owner | **OPEN** |
| 3 | Reply-to chosen and monitored daily | Owner | **OPEN** |
| 4 | Physical postal address supplied | Owner | **OPEN — statutory** |
| 5 | Warmup approach: Option A, B or C decided | Owner | **OPEN** |
| 6 | SPEND_APPROVER authorises ~$9.77 + ~$7-8.40/mo | SPEND_APPROVER | **OPEN** |
| 7 | Domain registered | OPERATOR | Blocked by 6 |
| 8 | Mailbox created | OPERATOR | Blocked by 6 |
| 9 | MX, SPF, DKIM, DMARC set and verified | OPERATOR | Blocked by 7 |
| 10 | Warmup completed (if Option A) | OPERATOR | Blocked by 9 |
| 11 | Merge fields filled in all 5 drafts, no placeholder left | OPERATOR | Blocked by 1-4 |
| 12 | Suppression re-checked immediately before send (BC-37) | OPERATOR | Not yet due |
| 13 | Approval packet completed with real infra state and re-verified (BC-36) | OPERATOR | Blocked by 7-9 |
| 14 | **APPROVER signs the send packet (BC-35)** | APPROVER | **OPEN — final gate** |
| 15 | Engagement-onboarding capacity recorded | Owner | OPEN (not blocking at 5 prospects) |

Items 1–6 are all decisions or authorisations. **Nothing technical is blocked by anything
except those.**
