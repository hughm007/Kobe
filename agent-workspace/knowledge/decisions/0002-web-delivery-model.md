---
title: "0002 — Websites are built as code with Claude and hosted on Vercel"
type: decision
client: internal
owner: Karl
status: active
created: 2026-08-24
updated: 2026-08-24
tags: [decision, web, delivery, vercel, foundational]
---

# 0002 — Websites are built as code with Claude and hosted on Vercel

> **⛔ Open conflict as of 2026-09-03 — affects servicepow.com ONLY, not client sites.**
> This decision describes a servicepow.com that is not the one currently live. The live site is
> the Vercel `plumbing` project, developed outside this workspace. Whether 0002 stands, is
> amended, or is superseded is an **owner decision recorded in
> [`0006`](0006-servicepow-com-production-reality.md)** — no session may settle it, and
> `plumbing` is READ-ONLY from here. **For client websites this decision is unaffected and
> remains in force.**

**Status:** Accepted — recording existing practice
**Date:** 2026-08-24
**Decided by:** Karl

## Context

Service Pow sells website design and build. Most agencies at this size deliver on a
page-builder CMS — WordPress, Squarespace, Webflow, Shopify — because it's familiar and
the client can edit their own content afterward.

Service Pow doesn't. Sites are **written as code with Claude and deployed to Vercel**.

This isn't a minor tooling preference. It changes what's cheap, what's expensive, what
handover means, and what the client can do for themselves after launch — so it needs to
be written down rather than rediscovered mid-project.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **Page-builder CMS** (WordPress / Squarespace) | Client self-edits; familiar; huge plugin ecosystem | Slower to build well; performance and security overhead; template ceiling on design; recurring plugin maintenance |
| **Code + Claude + Vercel** *(chosen)* | Very fast to build; no design ceiling; excellent performance defaults; free/cheap hosting; preview deploys per change; version-controlled | Client cannot edit content without a CMS layer or a developer; hosting dependency on Vercel; requires the agency to hold the code |
| **Hybrid — code front end + headless CMS** | Self-editing plus code flexibility | More moving parts, more cost, more to explain and maintain |

## Decision

Build as code with Claude; deploy and host on Vercel.

The hybrid option stays available and should be **quoted deliberately whenever a client
genuinely needs to edit their own content regularly** — a blog, a frequently changing
menu, an events calendar.

## Why

For a one-person agency, build speed is the binding constraint on how much work can be
taken on. Building as code with Claude removes most of the assembly time that a
page-builder consumes, and removes the plugin-maintenance tail that follows a WordPress
site for years.

Vercel handles hosting, SSL, CDN, and preview deployments as a default rather than as
configuration, which removes another category of work. Preview deploys in particular
change the client review process for the better: every revision has a real URL to look
at, rather than a screenshot or a staging site that has to be maintained by hand.

## Consequences

**Easier**
- Fast builds; a site can go from discovery to live in a fraction of the usual time
- No design ceiling imposed by a theme or template
- Strong performance and Core Web Vitals by default
- Every change is version-controlled and revertible
- Client review happens on a real preview URL per revision
- Minimal hosting cost

**Harder — and these must be handled explicitly in every proposal**

1. **The client cannot edit their own content.** This is the single biggest difference
   from what a client expects when they hear "website", and the most likely source of a
   dispute after launch. Settle it in the proposal, in writing: either they accept that
   content changes come through Service Pow, or a CMS layer is quoted as part of the
   build. Never leave it implied.
2. **Ongoing content changes need a commercial answer.** Ad-hoc requests, a retainer, or
   a bundled allowance — decide which, and price it. Otherwise small edits become free
   work forever.
3. **Hosting is a dependency.** If Vercel's pricing, terms or availability change, every
   client site is affected at once. Worth knowing; not worth over-engineering against.
4. **We hold the code.** Ownership at end of engagement must be settled up front — see
   the ownership section of every client's `access-and-accounts.md`. A client who cannot
   take their site with them when they leave will feel trapped, and will say so publicly.
5. **The domain points at Vercel.** DNS control needs to be established during
   onboarding, not on launch day.

**Accepted costs**
- Self-editing is not the default and has to be sold as an add-on when needed
- A small ongoing maintenance obligation sits with Service Pow rather than with the client

**Revisit if**
- Clients repeatedly want self-editing — the hybrid option becomes the default rather
  than the exception
- Vercel's terms or pricing change materially
- The volume of small content edits stops being manageable by one person

## Related

- [`../../playbooks/web/website-build.md`](../../playbooks/web/website-build.md)
- [`../../company/services.md`](../../company/services.md)
- [`0001-workspace-structure.md`](0001-workspace-structure.md)
