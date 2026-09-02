# Pilot 01 — personalization drafts v2 (Run 8 conversion-quality pass)
STATUS: DRAFT — NOT APPROVED, NOT SENT. Gated by BC-35.
Active set: 5 prospects (Queen Creek dropped from personalization; research retained).
Cohort frozen at Kobe 10d6254 and unmodified. Claim basis: EV-sp-001 only.

## v2 changes — hooks withdrawn as WEAK or INVALID
Re-checked which URLs the sites actually link to, 2026-09-01:
- **Young Plumbing /contact 404 — WITHDRAWN, INVALID.** The nav "Contact" item links to
  `youngplumbingaz.com/#contact`, a homepage anchor. Nothing links to `/contact`. That URL was
  one I typed; no visitor would ever reach it. Replaced with a real, site-linked observation:
  the Contact menu item lands on a section with no form.
- **Queen Creek /contact 404 — WITHDRAWN, INVALID.** Same reason, and stronger: the site has
  no contact link anywhere. Nav is `#home`, `#services`, `#locations`, `#faq` and a `tel:`.
- **Los Plumbers "/contact 404s as well" — WITHDRAWN.** Same guessed-URL problem. The valid
  half is kept: the "Get a free quote" button's own href targets `#contact`, and that section
  has no quote form.
- Davis and Amour keep their `/contact/` observations: those pages return 200 and genuinely
  exist, so the absence of a form on them is real.

**Rule applied:** a URL I guessed returning 404 is not evidence of anything. Only a path the
site itself links to can carry a hook.

## Structural rules for v2
Initial emails 65–130 words · one primary observation each · one low-friction CTA · no shared
offer paragraph · hedges only where they add factual honesty, not as a tic · the full audit is
not explained in every email, curiosity is used instead where truthful.

---

## 1. Zippy Zebra Plumbing — Mesa · admin@zippyzebraplumbing.com
**Hook (site-linked, CONFIRMED):** "Request an Appointment" → /contact-us/ → no form there.
```
Subject: your appointment button

Hi,

I clicked "Request an Appointment" on your site. It goes to /contact-us/, which
has your number, the PO box, your email and your socials - but nothing to
actually request an appointment with.

Might be on purpose. If it isn't, it's a small fix.

I noticed a couple of other things while I was on there. Want me to send them
over?

{{sender_full_name}}, Service Pow
{{postal_address}} - reply STOP and I'll drop it.
```
**Follow-up 1 (day 4)**
```
Subject: re: your appointment button

Two ways to close that gap: give the button a form to land on, or relabel it so
it says what it does. Either takes an afternoon.

Still happy to send the rest of what I found.
```
**Final (day 11)**
```
Subject: last one

I'll leave it there. The button's the only thing I'd genuinely bother fixing -
the rest was minor.

Good luck with it.
```

---

## 2. Amour Plumbing Services — San Tan Valley · office@amourplumbingservices.com
**Hook (CONFIRMED, quoted verbatim):** two founding dates live on the same site.
```
Subject: 1987 or 2009?

Hi,

Your site says both. One line: "Since 1987, we have been offering plumbing
services to the San Tan Valley region." Further down: "FAMILY-OWNED & OPERATED
SINCE 2009."

My guess is one is the founding year and the other is when the family took it
over. Someone reading it cold can't tell which.

Costs nothing to make them agree. There were one or two other things I spotted
too - want them?

{{sender_full_name}}, Service Pow
{{postal_address}} - reply STOP and I'll drop it.
```
**Follow-up 1 (day 4)**
```
Subject: re: 1987 or 2009?

Whichever year is the real one, it's worth saying it the same way everywhere -
it's the sort of detail people notice on an About page and nowhere else.

The other notes are still here if you want them.
```
**Final (day 11)**
```
Subject: closing this out

Done pestering you. If the site gets a tidy-up one day, the two dates are a
five-minute job.
```

---

## 3. Los Plumbers Rooter & Plumbing — Mesa · office@losplumbersaz.com
**Hook (site-linked, CONFIRMED):** "Get a free quote" href targets #contact; no quote form there.
```
Subject: the quote button

Hi,

You lead with trenchless sewer repair - Picote and Maxliner, no jackhammered
driveway. It's the most specific thing on the site and the part I'd point
traffic at.

Then "Get a free quote" drops people at #contact, which has a phone number, an
email and an address, but no quote form.

Odd gap given how good the page above it is. Want me to send the rest of what I
noticed?

{{sender_full_name}}, Service Pow
{{postal_address}} - reply STOP and I'll drop it.
```
**Follow-up 1 (day 4)**
```
Subject: re: the quote button

To be clear I'm not suggesting a rebuild. The trenchless page is doing its job.
It's the step straight after it that goes quiet.
```
**Final (day 11)**
```
Subject: last note

That's me. Two generations and a lining rig is a decent place to be standing -
I'll leave you to it.
```

---

## 4. Davis Plumbing & Drain Service — Apache Junction · davisplumbingdrain@msn.com
**Hook (CONFIRMED):** footer reads © 2013; no form on homepage or the real /contact/ page.
```
Subject: the year in your footer

Hi,

The footer on davisplumbingservice.com still reads 2013. The rest of the site
says the Davis family has been at this in East Mesa since 1986, which is by far
the more interesting number and it's buried.

There's also no form anywhere, so phone and email are the only ways in.

Neither is dramatic. If you want the short list of what I noticed, I'll send it.

{{sender_full_name}}, Service Pow
{{postal_address}} - reply STOP and I'll drop it.
```
**Follow-up 1 (day 4)**
```
Subject: re: the year in your footer

One more: the email on the site is an msn.com address rather than one at your
own domain. Both work. The domain one just looks like it belongs to the
business - that's my opinion, not a fact.
```
**Final (day 11)**
```
Subject: closing the loop

Leaving it here. Forty years in, you've heard from plenty of people like me.

If the site ever moves up the list, reply and I'll pick it up.
```

---

## 5. Young Plumbing — Gilbert · youngplumbingaz@gmail.com
**Hook (site-linked, CONFIRMED):** nav "Contact" → homepage #contact anchor with no form.
```
Subject: your Contact menu item

Hi,

The Contact link in your menu jumps down the homepage rather than opening a
contact page, and the section it lands on has no form - just the call-or-text
number.

For a shop that opened in 2024 and runs on calls, that's a reasonable way to
build it, so this may well be deliberate.

If you ever want an email route alongside the phone, it's a small piece of work.
I noticed a couple of other things too - shall I send them?

{{sender_full_name}}, Service Pow
{{postal_address}} - reply STOP and I'll drop it.
```
**Follow-up 1 (day 4)**
```
Subject: re: your Contact menu item

Also worth an hour sometime: the address on the site is a gmail one rather than
something at youngplumbingaz.com. Works identically, just reads differently on a
quote - my opinion, not data.
```
**Final (day 11)**
```
Subject: last note

Signing off. Building a team inside two years is the hard part and that bit's
done.

Reply any time if the website becomes the thing you want to sort.
```

---

## Queen Creek Plumbing Services — DROPPED from the active set 2026-09-01
Decision by the role-holder after the Run 8 quality pass. Reason: the only verified
observation is that the site is phone-first with no contact page or contact link. That is
true, but it describes a great many legitimate plumbing businesses, and every framing that
made it compelling started to imply lost revenue — which BC-38 and the pilot brief both bar.
Outreach strength scored 4/10, the lowest of the six.

**Dropped from personalization only.** Its research record is retained in full and unaltered
in `pilot-01-cohort.md` (row 6), which is frozen and committed at Kobe 10d6254. Nothing about
its qualification, evidence, or sources has been deleted or revised. It remains a qualified
prospect on the record; it is simply not in the active send-preparation set.

Active personalized prospects: 5.

## Audits
**Deliverability:** plain text · zero links · no attachments · honest subjects · identification
and opt-out present · no urgency, guarantees or pricing hype. Flagged token annotated not
deleted: "free" in the Los Plumbers subject-adjacent copy quotes THEIR button text, and the
audit offer where mentioned stays inside EV-sp-001 terms.
**Claims:** no performance figure, no client name, no guarantee, no comparative. No email
states or implies the missing form is costing the prospect business. Opinions are labelled as
opinions. Guesses are labelled as guesses.
**Offer handling:** four of six no longer describe the audit at all — they offer to send what
was noticed, which is truthful because the observations exist and are recorded here. No email
claims an audit has been completed.
