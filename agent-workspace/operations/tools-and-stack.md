---
title: Tools and Stack
type: profile
client: internal
owner: Karl
status: draft
created: 2026-08-24
updated: 2026-08-24
tags: [operations, tools, stack]
---

# Tools and Stack

What Service Pow uses, and where things live. The agent uses this to know which platform
a given task happens on, and where to point a client or a colleague.

> **No credentials in this file.** Record the tool, the account, and where access is
> held — never the access itself. Same rule as
> [`../clients/_template/access-and-accounts.md`](../clients/_template/access-and-accounts.md).

Known entries are filled in. The rest are **NEEDS INPUT** — delete rows for tools not
used, and add any that are missing.

| Function | Tool | Account / workspace | Who administers | Notes |
|---|---|---|---|---|
| Website builds | Claude / Claude Code | | Karl | Built as code — see decision 0002 |
| Version control | GitHub | `hughm007` | Karl | One repo per client site |
| Hosting | Vercel | | Karl | SSL, CDN and preview deploys by default |
| Domains / DNS | | | | |
| Analytics | | | | |
| Tag management | | | | |
| Search Console | | | | |
| Paid search | Google Ads | | Karl | Search, PMax, Display, YouTube |
| Paid social | Meta Ads | | Karl | Facebook **and** Instagram placements — one account |
| Paid social | TikTok Ads | | Karl | |
| Paid social | LinkedIn Ads | | Karl | |
| Other ad platforms | Client-directed | | Karl | We run where the client's audience is |
| Email marketing | | | | |
| Social scheduling | | | | |
| SEO tooling | | | | |
| Design | | | | |
| Video / motion | | | | |
| Stock imagery | | | | |
| Project management | | | | |
| Time tracking | | | | |
| File storage | | | | |
| Password manager | | | | |
| Accounting / invoicing | | | | |
| Contracts / e-signature | | | | |
| Reporting / dashboards | | | | |

## Where things live

**NEEDS INPUT:**

- Master brand assets:
- Client files:
- Contracts and signed documents:
- Invoices:
- Client site repos: GitHub, one per client
- Deployed client sites: Vercel
- This workspace: `hughm007/Kobe` → `agent-workspace/`

## Credential policy

- All shared credentials live in the password manager — never in files, chat, or email.
- Prefer **delegated agency access** over shared logins on every platform that offers it:
  it survives staff changes, revokes cleanly, and keeps the client owning their own assets.
- Two-factor authentication on everything that supports it.
- Remove access promptly when someone leaves, or when an engagement ends.
- A credential that has been written into a file, a message or a commit is a leaked
  credential. Rotate first, then remove it.

## Adding a tool

Before adopting anything new: what does it replace, who administers it, what does it
cost, where does its data live, and what happens to that data if we stop paying? Record
the answers as a decision in
[`../knowledge/decisions/`](../knowledge/decisions/) if the commitment is meaningful.
