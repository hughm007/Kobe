---
title: Website Build
type: playbook
client: internal
owner: Karl
status: active
created: 2026-08-24
updated: 2026-08-24
tags: [web, build, launch, process]
---

> **CANONICAL OWNER (Run 13):** this process now lives in the installed skill
> `.claude/skills/servicepow-website-production/` (references/site-process.md + executable
> gates). This playbook copy is a consumer pointer; where they differ, the skill wins.

# Website Build

**When to use:** any new website or full rebuild.
**Doesn't cover:** small edits to a live site, or landing pages built for a single
campaign (those follow [`../ads/campaign-launch.md`](../ads/campaign-launch.md)).

**Our stack:** sites are built as code with Claude and deployed on **Vercel**. See
[`../../knowledge/decisions/0002-web-delivery-model.md`](../../knowledge/decisions/0002-web-delivery-model.md)
for why, and for the consequences this playbook has to handle.

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
- **Content editing expectation — ask directly:** "After launch, who changes the words on
  the page?" A code-built site has no admin login by default. If the client expects to
  edit their own content, a CMS layer must be scoped and quoted now, not discovered in
  week six. This is the single most common source of post-launch friction on our stack.
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
- Images sourced, licensed, and the license recorded
- Alt text written — as content, not as a compliance afterthought
- Legal pages: privacy policy, cookie notice, terms. **NEEDS INPUT:** who supplies these,
  us or their legal counsel?

## 4. Design and build

**Stack specifics**

- Work in a git repo from the first commit — every change revertible, every revision
  reviewable
- Use **Vercel preview deployments for client review**: each revision gets a real URL on
  a real device, which beats screenshots and removes the need to maintain a staging site
  by hand
- Set environment variables in Vercel rather than committing them. Never commit an API
  key, form endpoint secret, or analytics token to the repo
- Confirm DNS control early — the domain has to point at Vercel on launch day, and
  chasing registrar access at the last minute is a self-inflicted delay
- Keep the client's site in its own repo, so handover is a transfer rather than an
  extraction

- Design responsive: mobile is usually the majority of traffic, and it's where layouts break
- Real content in the design, not lorem ipsum — placeholder text hides layout problems
  until they're expensive
- Accessibility as you build: semantic headings in order, keyboard-navigable, visible
  focus states, AA contrast, labeled form fields, alt text on meaningful images
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
- ☐ **Content-editing arrangement is in writing** — either the client accepts that edits
      come through Service Pow (with the commercial terms stated), or the CMS layer they
      paid for is working and they've been trained on it
- ☐ Code ownership and repo access settled per their `access-and-accounts.md`
- ☐ Vercel project access arranged as agreed
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
| Client expected to edit their own content, and can't | Ask the question in discovery; put the answer in the proposal |
| Domain not pointing at Vercel on launch day | Establish DNS control during onboarding |
| Secrets committed to the site repo | Environment variables in Vercel, never in the repo |
| Tracking installed but never verified firing | "Installed" isn't "working". Test the conversion. |

## Related

- [`seo-baseline.md`](seo-baseline.md)
- [`../client-lifecycle/onboarding.md`](../client-lifecycle/onboarding.md)
- [`../../operations/quality-bar.md`](../../operations/quality-bar.md)
