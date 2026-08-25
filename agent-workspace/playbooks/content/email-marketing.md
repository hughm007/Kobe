---
title: Email Marketing — demand capture and nurture
type: playbook
client: internal
owner: Karl
status: active
created: 2026-08-25
updated: 2026-08-25
tags: [email, deliverability, nurture]
source: Drive "ServicePow OS 2" — 37_EMAIL_MARKETING_OFFERING.md (synced 2026-08-25)
---

# Email marketing

**What we sell: not a newsletter — a list that didn't previously exist, plus the
sequences that turn it into revenue.** Fits clients with considered purchases
(weeks-to-months windows) and a dormant pool of past customers. Sell it as a
verifiable diagnosis: *"You have no email platform, no signup form, and your contact
form drops into an inbox. Every prospect who isn't ready today is gone."*

## Stack
**Resend** for the sandbox (free tier, cleanest API) · **MailerLite** for client
production (~$25/mo full API) · **sending domain is always a subdomain**
(`news.clientdomain.com`) — a damaged root domain is not recoverable.

## The test rig — run once on our burner domain before any client sees it
1. **Domain + auth (day 1):** SPF, DKIM, DMARC `p=none` with `rua=`, custom tracking
   domain, Google Postmaster, Yahoo FBL. *Gate: Mail-Tester ≥ 9/10.*
2. **Seed list (day 2):** Gmail ×3, Outlook ×2, Yahoo ×2, iCloud, plus 2 corporate M365
   and 2 corporate Workspace — the corporate inboxes predict B2B. *Gate: primary-tab on
   both corporate + 2 of 3 Gmail.*
3. **Warmup (days 3–14):** 20→50→100→250→500/day, step only on clean holds. *Gate:
   Postmaster reputation Medium+, spam rate < 0.10%.* **There is no way to buy past the
   warmup — which is also the moat against the next agency.**
4. **Bot end-to-end (weeks 3–6):** four issues as drafts, human-approved. *Gate: 3 of 4
   ship with <3 edits AND the QA gate catches at least one real problem.*

## Numbers to memorise
Spam complaints **< 0.10%** (0.30% is the platform kill line) · bounces **< 2%** or the
list gets cleaned before the next send · one-click List-Unsubscribe, processed ≤ 2 days
· HTML **< 100 KB** (Gmail clips ~102 KB and clipped mail loses the unsubscribe link) ·
Mail-Tester ≥ 9/10 on every template change. Enforcement is real: since Feb 2024
non-compliant traffic is rejected outright at Gmail/Yahoo/Microsoft.

## Production flow
Read the client voice profile and the last two issues (highest-leverage instruction —
without it every issue opens the same way) → **web-verify every date, price and deadline
before drafting** → subject lines, preheader, body, plain-text alt → QA gate that can
actually fail → **push to the ESP as a DRAFT via API, never a send endpoint** → seed
test → **a human approves and presses send. The approval gate is permanent, not
training wheels** — one hallucinated date to thousands of corporate buyers is a
client-losing event. One test variable per issue.

## First application
TripNerd (see their brief): existing client, zero email infrastructure, nine-year seed
list. Then reusable for 911 Drain and Wave Reaction once proven once.
