---
title: "Vercel deploy procedure — runtime facts for this workspace"
type: procedure
client: internal
status: active
created: 2026-09-03
tags: [connectors, vercel, web]
---
# Vercel — runtime facts (probed live 2026-09-03)
Doctrine: installed skill `servicepow-website-production/references/deployment-receipts.md`.

## Connected surface
Team **"karlmalik's projects"** (`team_yHNWG8PHWgZ40mHIpLuUfo2L`), **Pro plan**.
**Deployment Protection is ON team-wide** — preview URLs 302 to Vercel SSO. MCP share-link
tools refused on the test deployment and get_deployment 404'd a live id — treat MCP
read-back as unreliable; verify URLs by direct HTTP probe and file receipts with UNKNOWNs
marked. Rendered QA falls back to the identical local build when the URL is protected.

## ⛔ PARALLEL PRODUCTION REALITY — OWNER DECISION REQUIRED
The team's only standing project, **"plumbing"**, IS the live servicepow.com and conflicts
with the workspace's doctrine site (`servicepow-v2`, decision 0002). The conflict is recorded
and locked in **[`decisions/0006-servicepow-com-production-reality.md`](../knowledge/decisions/0006-servicepow-com-production-reality.md)** —
that file owns the decision; this one does not restate it.

**RULE IN FORCE HERE: the `plumbing` project is READ-ONLY from this workspace** — never deploy
to, modify, promote, pause or relink it. No session resolves the conflict; the owner rules and
the ruling is written into 0006. This blocks servicepow.com only — client work and connector
testing continue normally.

## Procedure (per engagement project)
1. Each client site gets ITS OWN Vercel project — never a shared one, never `plumbing`.
2. Preview deploy per review round (MCP deploy_to_vercel target=preview, or git-linked
   preview). Record the receipt (format in the skill reference) in
   `operations/receipts/`.
3. Gates run against the preview URL when reachable; identical-local fallback when
   protected. 4. **BC-50:** production target only with the recorded human approval line.
5. Post-deploy: build-log tail + runtime-errors probe into the receipt.
