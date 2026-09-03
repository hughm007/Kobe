---
title: "Drive intake procedure — runtime steps for this workspace"
type: procedure
client: internal
status: active
created: 2026-09-03
tags: [connectors, drive, intake]
---
# Drive → client KB intake (runtime procedure)
Doctrine: installed skill `servicepow-client-intelligence/references/asset-intake.md`.
This file holds the workspace-specific facts a session needs at runtime.

## Verified transport (2026-09-03, read-only probe)
- Drive account: johnsonwyatt282@gmail.com (connected via the Google Drive connector).
- Root: folder **"Service Pow_Operation System OS"** (id `1S2uB7Cd06ZyI7aIl-L_eR3di3dtsNXo1`)
  → **"ServicePow OS 2"** (id `1qTqZX6r6tdLf-jEzy_qvyPAeJVtgmiII`) — the document workspace
  the client KBs were originally synced from.
- **Zero image/video files exist anywhere in Drive as of the probe** — the footage pipe is
  proven but EMPTY. R1 delivery requires creating the client folder and telling Will.

## Per-client convention (to create as clients supply files)
`Service Pow_Operation System OS / Clients / <client-slug> / incoming/`
Record each client's folder id in their `access-and-accounts.md`. Client uploads land in
`incoming/`; the session downloads them to a staging dir, then runs:
```
python3 .claude/skills/servicepow-client-intelligence/scripts/servicepow_asset_ingest.py \
  --client-dir agent-workspace/clients/<slug> --inbox <staging> \
  --allow-external-inbox --source "gdrive:<folder-id> uploaded by <who>"
```
Rows land in the client's asset-register with sha256 + source; **provenance starts UNKNOWN**
and only the client/owner upgrades it. Isolation: the tool writes only inside the named
client's dir and refuses inboxes inside another client's tree.

## Drive documents NOT yet ingested into the KB (found in probe — for owner triage)
- `43_MARKET_INTELLIGENCE_911DRAIN.md` (2026-08-27, 18KB) and
  `35_..._911drain-market-intelligence-and-site-P0.md` — newer than the last KB sync
  (2026-08-25); likely relevant to 911drain strategy. OWNER: confirm these are current
  before ingestion.
