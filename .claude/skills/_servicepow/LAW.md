# SERVICE POW LAW — ad-production profile (generated install; do not hand-edit)
Canonical source: `~/servicepow-ai-os`. This project is a consumer.

1. **`servicepow-campaign-director` owns every generic advertising request** — "make an ad",
   "create an ad", "produce an ad", "build a campaign", "create a commercial", "make a video
   ad", and campaign work for any client. Specialists and vendor tools never answer these
   directly. ONE ORCHESTRATOR OWNS STATE: only the Campaign Director holds the Campaign Bible,
   sequence, gates, and readiness.
2. **Policies are always on** (`_servicepow/policies/`): claims-and-proof, brand-assets,
   generation-and-spend, realism-and-disclosure. Skills reference them and never restate them.
3. **The delivery gate list lives only in `_servicepow/data/blocking-checks.yaml`.** Never
   state its count in prose; say "see the canonical blocking-check registry."
4. **Vendor skills are subordinate** per `_servicepow/vendor/higgsfield/PRECEDENCE.md`: Service Pow
   decides what and why; vendor intelligence explains how the tool works. No vendor default
   bypasses the spend gate, the brand-asset law, or the registry.
5. **Live tool state is queried, never assumed**: model IDs, plans, prices, and balances come
   from the runtime at decision time.
6. **Roles, not people**: OPERATOR, APPROVER, SPEND_APPROVER, CLIENT_APPROVER
   (`_servicepow/data/roles.md`).
