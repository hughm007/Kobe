# clients/

One folder per client. This is the filing cabinet — everything about a client lives in
their folder and nowhere else.

## Rules

- **One folder per client**, named as a slug: `acme-plumbing/`, not `Acme Plumbing Ltd/`.
- **Start every new client** by copying [`_template/`](_template/) — don't build a folder
  from scratch, or the structure drifts and cross-client comparison stops working.
- **Never mix clients.** One client's data, strategy, pricing or results must never
  appear in another client's folder. To generalise a lesson across clients, anonymize it
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

## Clients and prospects

| Client | Folder | Status | Services | Owner |
|---|---|---|---|---|
| 911 Drain | [`911drain/`](911drain/) | **Active** — main account | **NEEDS INPUT** | Karl |
| TripNerd | [`tripnerd/`](tripnerd/) | Prospect | — | Karl |
| WaveReaction | [`wavereaction/`](wavereaction/) | Prospect | — | Karl |

### Active vs. prospect

Prospects live here too, with `status: prospect` in their frontmatter, so that discovery
notes and research have a home before anything is signed. The distinction is a hard one
for the agent:

- **Active** — do the work.
- **Prospect** — research, discovery notes and proposal drafts only. No campaign builds,
  no live activity, no spend, and nothing sent to them without Karl's explicit go-ahead.

When a prospect signs, flip `status` to `active` and run
[`../playbooks/client-lifecycle/onboarding.md`](../playbooks/client-lifecycle/onboarding.md).
When a prospect goes cold, move the folder to [`../archive/`](../archive/) with a note on
why — lost-deal reasons are some of the most useful learnings the office can hold.

## When a client leaves

Move their folder to [`../archive/`](../archive/) with a dated note recording why the
engagement ended and what was handed over. Don't delete — the history is useful for
win-backs and for learning.
