---
title: "<Client Name> — Access and Accounts"
type: brief
client: <client-slug>
owner: Karl
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [client, access, operations]
---

# <Client Name> — Access and Accounts

A map of what we have access to, how that access is held, and who to ask when it breaks.

> ## Hard rule — no credentials in this file
>
> Never write a password, API key, token, recovery code, PIN, card number or seed phrase
> here. This is a git repository: anything committed is recoverable from history forever,
> even after it's edited out.
>
> Record the **pointer**: which vault entry, which team member, which email address the
> account is registered to. That's enough to find the credential and safe to commit.
>
> If you ever find a credential committed here: treat it as leaked. Rotate it first,
> then remove it. Removing it without rotating fixes nothing.

## Access register

| System | Account / property ID | How we access | Vault entry | Who owns the account | Notes |
|---|---|---|---|---|---|
| Website admin / CMS | | | | | |
| Hosting | | | | | |
| Domain registrar | | | | | |
| DNS | | | | | |
| Google Analytics | | | | | |
| Google Search Console | | | | | |
| Google Tag Manager | | | | | |
| Google Ads | | | | | |
| Meta Business Manager | | | | | |
| Other ad platforms | | | | | |
| Email / marketing platform | | | | | |
| Social accounts | | | | | |
| Review platforms | | | | | |
| Shared file storage | | | | | |

**"How we access"** should be one of: *delegated agency access*, *own user on their
account*, *shared login via vault*, *client runs it, we don't have access*.

Prefer delegated agency access over shared logins everywhere it's offered — it survives
staff changes, it's revocable cleanly, and it keeps the client owning their own assets.

## Ownership

Who owns each asset if the engagement ends. Settle this at the start; it's a painful
conversation to have at the end.

| Asset | Owner during engagement | Owner after |
|---|---|---|
| Ad accounts | | |
| Website / codebase | | |
| Domain | | |
| Analytics property | | |
| Creative source files | | |

## Offboarding checklist

Run this when the engagement ends — see
[`../../playbooks/client-lifecycle/onboarding.md`](../../playbooks/client-lifecycle/onboarding.md).

- ☐ Transfer or confirm ownership of every asset above
- ☐ Remove Service Pow users from client systems
- ☐ Remove client credentials from our vault
- ☐ Hand over source files and documentation
- ☐ Cancel or reassign anything billed through us
- ☐ Archive the client folder with a closing note
