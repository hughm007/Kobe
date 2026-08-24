# clients/

One folder per client. This is the filing cabinet — everything about a client lives in
their folder and nowhere else.

## Rules

- **One folder per client**, named as a slug: `acme-plumbing/`, not `Acme Plumbing Ltd/`.
- **Start every new client** by copying [`_template/`](_template/) — don't build a folder
  from scratch, or the structure drifts and cross-client comparison stops working.
- **Never mix clients.** One client's data, strategy, pricing or results must never
  appear in another client's folder. To generalise a lesson across clients, anonymise it
  and put it in [`../knowledge/learnings/`](../knowledge/learnings/).
- **No credentials, ever.** `access-and-accounts.md` records *where* access lives and who
  holds it. It never records the access itself.
- **Read before you write.** Before producing anything for a client, read their
  `client-brief.md` and `brand-guide.md` in full. Their voice beats Service Pow's house
  voice in their own materials, always.

## Starting a new client

```bash
cp -r _template clients/<client-slug>
```

Then, in order:
1. Fill `client-brief.md` from the discovery call —
   see [`../playbooks/client-lifecycle/discovery-call.md`](../playbooks/client-lifecycle/discovery-call.md).
2. Fill `brand-guide.md` from whatever the client supplies. If they have no brand guide,
   record what you can observe from their existing materials and mark the gaps.
3. Fill `access-and-accounts.md` as access is granted — pointers only.
4. Work through [`../playbooks/client-lifecycle/onboarding.md`](../playbooks/client-lifecycle/onboarding.md).

## Standard client folder

```
<client-slug>/
├── client-brief.md          who they are, what they want, how we're measured
├── brand-guide.md           their voice, their look — governs all their materials
├── access-and-accounts.md   where access lives and who holds it (never the credentials)
├── campaigns/               one folder or file per campaign
├── deliverables/            finished work sent to the client
└── notes/                   dated meeting and call notes
```

## Current clients

**NEEDS INPUT:** No clients set up yet. List them here as folders are created, so this
page works as the index.

| Client | Folder | Services | Status | Owner |
|---|---|---|---|---|
| — | — | — | — | — |

## When a client leaves

Move their folder to [`../archive/`](../archive/) with a dated note recording why the
engagement ended and what was handed over. Don't delete — the history is useful for
win-backs and for learning.
