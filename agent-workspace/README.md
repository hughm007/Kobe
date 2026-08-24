# Service Pow — Agent Workspace

The working office for Service Pow's AI agent. Marketing work gets done here, and the
knowledge from doing it gets kept here.

**If you are the agent: read [`CLAUDE.md`](CLAUDE.md) first.** It is the operating manual
and it governs everything in this folder.

**If you are a human:** this is a plain folder of Markdown files. Nothing here needs a
build step or special software — open it in any editor, or read it on GitHub.

## Layout

| Folder | What's in it |
|---|---|
| [`inbox/`](inbox/) | Front desk. Unsorted drop-off, triaged out quickly. |
| [`company/`](company/) | Service Pow itself — profile, services, positioning, brand, pricing. |
| [`clients/`](clients/) | One folder per client. Briefs, brand guides, campaigns, deliverables. |
| [`playbooks/`](playbooks/) | How we do the work. Web, ads, content, client lifecycle. |
| [`templates/`](templates/) | Fill-in-the-blank starting points for recurring documents. |
| [`knowledge/`](knowledge/) | Decisions, learnings and research. The part that compounds. |
| [`operations/`](operations/) | How the office runs — stack, conventions, quality bar, worklog. |
| [`assets/`](assets/) | Logos, exports and source files — or pointers to where they live. |
| [`archive/`](archive/) | Finished or superseded work, kept for reference. |

## Where to start

1. [`CLAUDE.md`](CLAUDE.md) — the rules and the map.
2. [`company/OPEN-QUESTIONS.md`](company/OPEN-QUESTIONS.md) — what the workspace still
   needs from you. Filling this in is the highest-value thing a human can do here.
3. [`operations/worklog.md`](operations/worklog.md) — what's been happening.

## Conventions in one paragraph

Filenames are `kebab-case.md`, dated ones are prefixed `YYYY-MM-DD-`. Every substantive
file opens with YAML frontmatter (`title`, `type`, `client`, `owner`, `status`, `created`,
`updated`, `tags`). Unknowns are written as `**NEEDS INPUT:** <question>` rather than
guessed. No credentials are ever committed. Superseded work is archived, not deleted.
Full detail in [`CLAUDE.md`](CLAUDE.md) §6.
