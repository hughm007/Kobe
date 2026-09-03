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

## ⚠ DISCOVERY — parallel production reality (OWNER TRIAGE REQUIRED)
The team's only standing project is **"plumbing"** ← private repo `karlmalik/Plumbing` —
**this is the LIVE servicepow.com**, actively developed via Cursor (latest production deploy
2026-09-02), containing an internal Ops SaaS at /app (leads→quotes→invoices, Supabase auth,
SendGrid, staff portals, LSA/review tooling, a $597 answering product, an AI Visibility SKU).
The workspace doctrine (decision 0002) and the servicepow-v2 repo describe a DIFFERENT site.
Two parallel realities now exist for servicepow.com. **RULE: the `plumbing` project is
READ-ONLY evidence for this workspace — never deploy to, modify, or promote it from here.**
Owner decides which reality is canonical.

## Procedure (per engagement project)
1. Each client site gets ITS OWN Vercel project — never a shared one, never `plumbing`.
2. Preview deploy per review round (MCP deploy_to_vercel target=preview, or git-linked
   preview). Record the receipt (format in the skill reference) in
   `operations/receipts/`.
3. Gates run against the preview URL when reachable; identical-local fallback when
   protected. 4. **BC-50:** production target only with the recorded human approval line.
5. Post-deploy: build-log tail + runtime-errors probe into the receipt.
