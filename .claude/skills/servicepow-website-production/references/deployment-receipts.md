# Deployment receipts — proving what actually happened (BC-50's paper trail)
Single home of the deploy-loop record format. The deployment platform (Vercel, per the
settled stack decision) is infrastructure BENEATH this skill — it never becomes a second
workflow. Preview is the default terminal state; production is human-gated, always.

## The loop
build → **preview deployment** (one per review round, URL recorded) → QA gates run against
the REAL preview URL (never simulated evidence) → dual gate on the commit-pinned preview →
**BC-50: explicit operator/APPROVER approval recorded** → production deployment →
post-deploy receipts (build log tail, runtime-errors probe) → learning record.

## The receipt (one per deployment, filed in the project's QA log)
```
DEPLOYMENT RECEIPT
kind:            preview | production
deployment_id:   dpl_...
url:             https://...
project/team:    <names or ids>
source:          commit sha / file-set description
state:           READY | ERROR (+ build log tail if ERROR)
gates_run:       which BCs were executed against THIS url, with results
runtime_probe:   runtime-errors check result (window, count)
approval:        production only - WHO approved, WHEN, quoting the ask  |  preview: n/a
```
A production deployment without an `approval` line is a BC-50 violation regardless of who
clicked what. A session that cannot reach the platform tooling still writes the receipt
from whatever evidence exists and marks the gaps UNKNOWN.

## Guardrails
- Never deploy to, modify, or promote a project that is not this engagement's own project.
  Live client or company production projects managed outside this workflow are read-only
  evidence sources here.
- Platform plan changes, paid add-ons, or protection-setting changes are spend/config
  actions outside this skill - SPEND_APPROVER / owner territory.
- Deployment protection may make preview URLs non-public; the receipt records the access
  state, and rendered QA then runs via authenticated access or a local build - the gate is
  never skipped because the URL was inconvenient.
