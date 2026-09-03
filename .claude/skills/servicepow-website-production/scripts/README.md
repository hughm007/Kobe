# Website-production toolkit — canonical home
Installed with the skill. These are THE tools the workflow names.

| Tool | Job |
|---|---|
| `servicepow_web_qc.py` | Static gate battery over a built site directory: BC-49 SEO checks (title/meta/h1/viewport/canonical/robots/sitemap), BC-45 static parts (internal link resolution, form/action presence, tel:/mailto: format), BC-46 helpers (verbatim NAP/licence string checks against a facts file), image alt coverage. Stdlib only — no install needed. |
| `web-qa.spec.template.ts` | Playwright battery template for the RENDERED checks: BC-44 overflow at 6 widths, console-error capture, axe accessibility floor (BC-47), nav/link click-through. Copy into the site repo's e2e dir, set BASE_URL, run with the repo's Playwright. |

## Usage
```
python3 servicepow_web_qc.py --site <built-dir-or-url> [--facts facts.json]
```
`facts.json` (BC-46): {"must_contain": ["480-555-0100", "ROC 123456", ...],
"must_not_contain": ["sewer", "commercial", ...]} — sourced from the client KB, never typed
from memory.

Rendered checks need a running site (dev server or preview URL) and a repo with Playwright +
axe-core installed (the reference implementation lives in the Service Pow site repo's e2e
suite, proven 9/9 with real contrast fixes). The template is framework-agnostic.

## Honest limits
Static checker parses HTML with stdlib — it verifies presence/resolution/strings, not
rendering. Overflow, contrast, focus and CLS are rendered-only: Playwright battery or
nothing. Performance receipts come from Lighthouse/equivalent, run manually or in CI.
