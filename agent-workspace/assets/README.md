# assets/

Logos, images, video, source files — or, more often, **pointers to where they actually
live**.

## The rule

**This is a git repository, not a digital asset manager.**

Committing large binaries makes the repo slow to clone and impossible to shrink later —
git keeps every version of every file forever, so a 200MB video committed once is 200MB
in the history permanently, even after deletion.

| File | What to do |
|---|---|
| Small, text-adjacent (SVG logo, favicon, small PNG) | Commit it |
| Anything large — video, raw photography, PSD/AI/Figma exports | Commit a **pointer file** |
| Anything a client owns and stores themselves | Pointer only |

## Pointer files

Create `<asset-name>.md`:

```markdown
---
title: Acme Plumbing — Logo Pack
type: profile
client: acme-plumbing
owner: Hugh
status: active
created: 2026-08-24
updated: 2026-08-24
tags: [assets, logo]
---

# Acme Plumbing — Logo Pack

**Location:** <where it lives — drive folder, DAM, client's server>
**Access via:** <who can grant access>
**Contains:** primary lockup (SVG, PNG), stacked, mono, favicon
**Licence / usage rights:** <who owns it, what we may use it for>
**Last verified:** 2026-08-24
```

The **last verified** field matters. Links to shared drives rot; a pointer nobody has
checked in a year is a guess.

## Structure

Organise by owner:

```
assets/
├── service-pow/     our own brand assets
└── clients/         one subfolder per client slug
```

## Licensing

Record the licence for every image, font and piece of stock media, and whether it covers
client use. "We used it before" is not a licence, and an unlicensed image on a client's
site is their legal problem and our reputational one.

**NEEDS INPUT:** where do Service Pow's master brand assets and client files actually
live? See [`../company/OPEN-QUESTIONS.md`](../company/OPEN-QUESTIONS.md).
