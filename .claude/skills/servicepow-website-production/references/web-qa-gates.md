# Web QA gates — objective definitions (BC-44..BC-50)
What each gate checks, how it is executed, and what fails it. Executable wherever
objectivity allows; human where judgment is the instrument. Beautiful but broken = FAIL.

## BC-44 — RESPONSIVE (machine)
Width battery: 320 · 375 · 390 · 768 · 1024 · 1440. Fail on: horizontal overflow at any
width · content clipped or overlapping · tap targets under ~44px at mobile widths · fixed
elements covering content. Executed by the Playwright battery (rendered) — overflow is
measured (`scrollWidth > clientWidth`), never eyeballed.

## BC-45 — FUNCTIONAL (machine + one human receipt)
Every internal link resolves (no 4xx) · every button/CTA has a working target · tel:/mailto:
links well-formed and tap-correct on mobile · **every form submitted as a REAL test and the
notification confirmed received** (the human receipt — a form that was never test-submitted
is a broken form) · form validation messages explain the fix · thank-you/confirmation state
works · no console errors on any page.

## BC-46 — CLIENT-INFORMATION CORRECTNESS (hybrid)
Name, address, phone, licence number(s), hours, service list and service area on the site
match the client KB VERBATIM, with sources. Scope limits are honored (a residential-only
licence never markets commercial work — the barred-words list from the client KB applies to
site copy exactly as to ads). Wrong client information is a client-readiness failure of the
first order, not a typo.

## BC-47 — ACCESSIBILITY (machine floor + spot human)
axe: zero serious/critical violations · semantic heading order · keyboard-navigable with
visible focus · labeled form fields · AA contrast · alt text on meaningful images ·
reduced-motion respected where motion exists.

## BC-48 — PERFORMANCE (machine)
Budgets recorded per project before build (defaults: LCP < 2.5s on throttled mobile, CLS
< 0.1, images compressed/correctly sized/modern formats, no render-blocking third parties).
Measured, not asserted — Lighthouse or equivalent receipt filed.

## BC-49 — SEO BASELINE (machine)
Unique title + meta description per page · exactly one h1 per page · viewport meta ·
canonical · robots.txt + sitemap present and consistent · structured data for the business
(LocalBusiness at minimum) · no accidental noindex on launch · redirects mapped on rebuilds.
The vendored local-seo-manager's checkers may execute parts of this.

## BC-50 — DEPLOYMENT APPROVAL (human — never automated)
Preview is the default terminal state. Production deploy or domain cutover happens only on
explicit operator/APPROVER approval recorded in the project log, after BC-44..49 receipts
and the dual gate. Post-launch checklist (site-process §post-launch) runs after cutover,
including a live re-test of form deliverability.

## The generic-design kill (feeds BC-22, the critic's score — not a separate number)
A site that could belong to any business in the category — stock hero, interchangeable
copy, template feel, AI-generic imagery — fails the critic on distinctiveness exactly as a
generic ad does. Brand palette, real photography where supplied, and the client's actual
voice are the antidotes; the critic judges it, this file just names it.
