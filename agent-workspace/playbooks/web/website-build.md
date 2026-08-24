---
title: Website Build
type: playbook
client: internal
owner: NEEDS INPUT
status: active
created: 2026-08-24
updated: 2026-08-24
tags: [web, build, launch, process]
---

# Website Build

**When to use:** any new website or full rebuild.
**Doesn't cover:** small edits to a live site, or landing pages built for a single
campaign (those follow [`../ads/campaign-launch.md`](../ads/campaign-launch.md)).

**NEEDS INPUT:** platform-specific steps once the build platform is confirmed in
[`../../company/services.md`](../../company/services.md).

---

## The rule that governs the whole process

**Discovery before design. Content before layout.**

Designing before you know the content is how a site ends up with three beautiful sections
nobody has anything to put in, and a services page that doesn't fit the design. Get the
words and the structure agreed, then design around them.

---

## 1. Discovery

Before anything visual exists.

- Business objectives for the site — what should be different after launch, in numbers
- Primary conversion action, and the secondary one
- Audiences, and what each needs to see before they'll act
- Required pages, and the reason each exists (a page with no reason is a page to cut)
- Competitor sites — what to learn from, what to avoid
- Content inventory: what exists, what needs writing, what needs producing, who's doing it
- Technical constraints: existing platform, integrations, CRM, booking systems
- If it's a rebuild: current traffic, current top pages, current rankings, current
  conversion rate — the baseline you'll be judged against
- Success measures and how they'll be tracked
- Timeline and the client's real review capacity

Output: a signed-off discovery summary in the client's folder.

## 2. Structure

- Sitemap — every page, with its purpose and its conversion action
- URL structure agreed *before* build starts; changing it later means redirects
- Navigation: primary, secondary, footer
- For a rebuild: a full URL inventory of the old site, mapped to new URLs. **This is the
  step that gets skipped and costs the most.** Every old URL with traffic or backlinks
  needs a destination.

## 3. Content

- Copy written or supplied, per page, against the client's `brand-guide.md`
- Every page has: an H1, a clear purpose, and a call to action
- Metadata drafted per page — title tag, meta description
- Images sourced, licensed, and the licence recorded
- Alt text written — as content, not as a compliance afterthought
- Legal pages: privacy policy, cookie notice, terms. **NEEDS INPUT:** who supplies these,
  us or their legal counsel?

## 4. Design and build

- Design responsive: mobile is usually the majority of traffic, and it's where layouts break
- Real content in the design, not lorem ipsum — placeholder text hides layout problems
  until they're expensive
- Accessibility as you build: semantic headings in order, keyboard-navigable, visible
  focus states, AA contrast, labelled form fields, alt text on meaningful images
- Performance as you build: compressed and correctly-sized images, modern formats, lazy
  loading below the fold, no unnecessary scripts
- Forms: every field justified, validation messages that explain the fix, a real
  confirmation state

## 5. Pre-launch checklist

**Nothing goes live until every box is ticked.** Copy this into the client folder and
tick it there, so there's a record of who checked what.

**Content**
- ☐ Every page proofread — spelling, grammar, names, prices, phone numbers
- ☐ No placeholder text, dummy images or lorem ipsum anywhere
- ☐ Contact details correct and consistent across every page
- ☐ Legal pages present and current

**Function**
- ☐ Every internal link works
- ☐ Every external link works and opens as intended
- ☐ **Every form submitted as a real test** — and the notification confirmed received by
  the right person at the right address
- ☐ Form confirmation / thank-you state works
- ☐ Phone, email and address links tap correctly on mobile
- ☐ Any booking, payment or integration completed end to end as a real transaction test
- ☐ 404 page exists and is useful

**Technical**
- ☐ Tested on mobile, tablet and desktop — and in more than one browser
- ☐ HTTPS working, certificate valid, no mixed-content warnings
- ☐ Page speed checked; obvious offenders fixed
- ☐ Favicon and social share previews (title, description, image) render correctly
- ☐ `robots.txt` correct and **not blocking the site**
- ☐ Staging-site noindex removed *(the single most common launch failure)*
- ☐ XML sitemap generated and submitted
- ☐ Redirects live for every old URL, tested against the URL inventory
- ☐ Backup taken before switching over

**Measurement**
- ☐ Analytics installed and recording
- ☐ Conversion tracking configured and fired at least once in test
- ☐ Search Console verified and sitemap submitted
- ☐ Ad platform pixels installed and firing, if applicable
- ☐ Cookie consent working, and consent state actually respected

**Handover**
- ☐ Client has appropriate admin access
- ☐ Access recorded in their `access-and-accounts.md` (pointers, not credentials)
- ☐ Training or documentation delivered
- ☐ Maintenance and support expectations stated in writing

## 6. Post-launch

- Day 1: re-verify forms, tracking and indexing on the live domain — not just staging
- Week 1: watch Search Console for crawl errors and redirect misses
- Week 2–4: check analytics against the pre-launch baseline; investigate any drop
- Then: write the learning. What took longer than estimated? What did the client change
  their mind about, and could a better discovery question have caught it?

---

## Common failures

| Failure | Prevention |
|---|---|
| Staging noindex left on after launch | It's on the checklist. Check it on the live domain, not staging. |
| Old URLs not redirected → rankings and traffic drop | Build the URL inventory in step 2, before build starts |
| Form notifications going nowhere | Submit a real test and confirm a human received it |
| Design signed off before content exists | Content before layout — refuse to invert it |
| Scope creep through "just one more page" | Quote it. See scope discipline in `../../company/services.md` |
| Client review stalls the timeline | Agree review windows up front, and state the timeline impact of missing them |
| Tracking installed but never verified firing | "Installed" isn't "working". Test the conversion. |

## Related

- [`seo-baseline.md`](seo-baseline.md)
- [`../client-lifecycle/onboarding.md`](../client-lifecycle/onboarding.md)
- [`../../operations/quality-bar.md`](../../operations/quality-bar.md)
