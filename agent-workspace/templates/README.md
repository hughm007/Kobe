# templates/

Fill-in-the-blank starting points for documents we produce repeatedly.

**Template vs. playbook:** a template is *what the artefact looks like*. A playbook is
*the steps you take*. A campaign brief is a template; running the campaign is a playbook.

## Contents

| Template | Use it for |
|---|---|
| [`campaign-brief.md`](campaign-brief.md) | Any paid campaign, before budget is committed |
| [`creative-brief.md`](creative-brief.md) | Briefing any creative execution — ad, video, design |
| [`content-brief.md`](content-brief.md) | Briefing a single content piece |
| [`website-discovery.md`](website-discovery.md) | Discovery for a website build or rebuild |
| [`proposal.md`](proposal.md) | Client proposals |
| [`meeting-notes.md`](meeting-notes.md) | Any client call or internal meeting |

## Using a template

Copy it to where the work lives — usually the client's folder — then fill it in. Don't
edit templates in place with client content.

```bash
cp templates/campaign-brief.md clients/<client-slug>/campaigns/2026-09-autumn-push.md
```

Set the frontmatter properly: real `title`, the client slug, an `owner`, today's date.

## Improving a template

If you find yourself adding the same section every time, or a field is never used, change
the template. Note the change in [`../operations/worklog.md`](../operations/worklog.md).
Templates that don't get maintained get quietly abandoned in favor of blank documents,
and the structure is lost.
