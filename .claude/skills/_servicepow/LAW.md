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
7. **Vendored external skills are subordinate manuals.** `claude-ads-audit` (wrapped fork,
   narrowed trigger) performs paid-media AUDITS only — any account mutation follows
   `_servicepow/policies/generation-and-spend.md` and the SPEND_APPROVER gate; its findings
   obey the audit-honesty scoring in servicepow-skeptic's reference. `local-seo-manager`
   output (GBP edits, review responses, service-area pages) publishes only with APPROVER
   sign-off, and NAP/brand data passes servicepow-brand-fidelity. `ab-testing`/`analytics`
   advise; twilio compliance skills are a legal floor, not a sending authorization —
   sending anything is servicepow-outbound-director's gate. Tool operations are classified
   per `_servicepow/vendor/CAPABILITY-LADDER.md`.
8. **Outbound is gated like spend**: `servicepow-outbound-director` owns Service Pow's own
   acquisition; nothing sends without its APPROVER packet.
