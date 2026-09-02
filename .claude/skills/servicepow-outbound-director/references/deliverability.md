# Outbound deliverability law
Single home of Service Pow's sending-infrastructure and copy-deliverability rules. Sizing and
infra rules derived from ColdIQ's email-infra material (MIT, marketplace repo) and the
spam-trigger audit concept re-derived from public deliverability practice; re-expressed and
vendor-neutralized (the mechanics hold on any sending platform).

## Infrastructure rules (never break)
1. **Never send cold outreach from the primary domain.** Ever.
2. Max **2 mailboxes per domain**; one domain lives in one workspace only.
3. Spread domains across registrars (no single point of failure).
4. **Warm up 2–3 weeks minimum** before real sending; never disable warmup once campaigns run.
5. Start conservative, scale gradually; monitor bounce/spam-report rates daily while live.
6. All four DNS records in place and verified before warmup: MX, SPF, DKIM, DMARC.

## Sizing formula
monthly send goal ÷ 20 working days = daily volume · daily volume ÷ 20–25 per mailbox =
mailboxes · mailboxes × 1.5 buffer ÷ 2 = domains · split mailbox providers (~60/40 across two
majors). Example: 3,000/mo → 150/day → 10–12 mailboxes → 5–6 domains.

## Copy deliverability audit (mechanical, before any sequence is approved)
- Maintain a spam-trigger vocabulary (pricing hype, urgency bait, guarantee language, ALL-CAPS,
  excessive links/images, tracking-heavy HTML) and audit every email against it:
  **quote the exact flagged token → give the fix → re-audit until clean.** Context matters —
  a flagged token with a legitimate use is annotated, not blindly deleted.
- Plain-text-first; one link maximum early in a sequence; no attachments cold.
- Every factual/benefit claim in outbound copy obeys
  `../../_servicepow/policies/claims-and-proof.md` — the spam audit never substitutes for the
  evidence gate; guarantee-flavored copy is doubly gated (spam vocabulary AND EV record).

## Legal floor
Commercial-email law applies (identification, honest subject lines, working unsubscribe,
prompt suppression); SMS outbound additionally follows the vendored Twilio compliance rulebook
(consent tiers, quiet hours, DNC) — see the installed `twilio-compliance-traffic` skill.
Suppression lists are permanent and checked before every send.
