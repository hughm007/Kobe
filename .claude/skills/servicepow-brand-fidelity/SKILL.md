---
name: servicepow-brand-fidelity
description: >
  Hard gate protecting the client's exact identity assets — logos, wordmarks, exact brand marks
  (including vehicles, uniforms, signage), packaging and label text, and legal copy — which enter
  production only as real client files, composited, never regenerated. Runs in two phases:
  pre-generation COMPOSITE marking of identity-bearing shots, and post-generation PASS/FAIL
  review of every visible mark, product depiction, and legal line against the real files. Also
  enforces client-specific brand constraints such as banned words and licence-scope limits.
  Activates when (a) the Campaign Director invokes this phase (brand-fidelity: composite marking
  or pre-delivery brand review), or (b) the user explicitly asks for a brand-fidelity check,
  logo or legal-copy verification, composite marking, or a review of assets against client brand
  files. Generic advertising requests belong to servicepow-campaign-director. Not for creative
  judgment, shot-to-shot continuity, or banning generated design exploration.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.0.0
---

# Brand and Product Fidelity

## PURPOSE

The client's mark is not ours to approximate. This skill is the operational gate for the
brand-truth law in `../_servicepow/policies/brand-assets.md` (canonical LB24): it decides,
before generation, which shots must be produced for compositing of real client assets, and it
verifies, before delivery, that every visible identity asset traces to a real client file.

The gate's scope is **exact identity assets only** (policy §1). It is deliberately not a ban on
generated design work — see DECISION RULES.

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (brand-fidelity: pre-generation
COMPOSITE marking, or pre-delivery brand review), or (b) the user explicitly asks for a
brand-fidelity check, verification of a logo / wordmark / packaging text / legal copy against
client files, COMPOSITE marking of identity-bearing shots, or an answer to "can we just
generate the logo". Generic advertising requests belong to servicepow-campaign-director.

## INPUTS

**Required:** the client brand guide / brand standards (in the client KB) · the storyboard shot
list (path provided by the Campaign Director) · locations of the real client asset files.

**Optional:** brand kit · real product photography and packaging artwork · licence and legal
requirements · platform safe-area specs for the declared placements.

## WORKFLOW

### Phase A — pre-generation: COMPOSITE marking

1. **Read the client brand guide in full**, including its never-generate rules, banned words,
   and licence-scope limits. Compile the client's NEVER-GENERATE list from these rules — the
   named items that must only ever enter production as real files.
2. **Inventory identity assets per shot.** For every storyboard shot, identify any item from
   `../_servicepow/policies/brand-assets.md` §1: logo, wordmark, exact brand mark (including on
   vehicles, uniforms, signage), packaging or label text, legal copy, any other client-owned
   exact identity asset.
3. **Determine COMPOSITE markings and deliver them to the Campaign Director**, who records each
   in the storyboard's COMPOSITE field per the Bible contract
   (`../servicepow-campaign-director/references/bible-contract.md`). This is a
   production-method decision made before routing, not a review note. This skill does not write
   the storyboard itself.
4. **Locate the real client file for each marked item.** If a required asset does not exist,
   surface it by name to the Campaign Director — never generate a substitute. Options, in
   order: obtain the asset · reframe the shot so the asset is not visible · raise a CONFLICT to
   the APPROVER if neither is possible.
5. **Compile the required legal-copy list** — licence numbers, disclosures, mandated text —
   with placement constraints: present, legible, inside the platform-safe area (outside the
   region where platform UI covers content).

### Phase B — post-generation: brand review before delivery

6. **Verify every visible mark against the real client file.** Each mark must trace to a real
   asset composited per policy; spelling, geometry, and colour must match the file exactly.
7. **Verify product depictions against real product references**: geometry and proportions,
   colours, materials. A product whose proportions are wrong is a broken product.
8. **Verify legal copy**: present, legible, inside the safe area, matching the required text.
9. **Sweep copy, voiceover, and every on-screen word** for banned words and for anything
   outside the client's licensed scope.
10. **Issue a verdict per asset: PASS / FAIL + reason.** Any FAIL on this gate is a hard
    failure — the asset is not client-ready (BC-21).
11. **Write back learning.** New client brand constraints discovered during production are
    proposed for the client KB brand guide, dated, via the Campaign Director. Log each brand
    failure caught, tagged by who caught it (system vs. role-holder) — the ratio is the KPI of
    a gate learning to see.

## DECISION RULES

- **Identity assets are composited from real client files, never regenerated.** The law, its
  asset list, and its rationale live in `../_servicepow/policies/brand-assets.md` §1 — apply
  it, do not paraphrase it. No exceptions for "it's just a background", "it's small", or "it's
  blurred".
- **If the real asset does not exist, the shot does not ship with an approximated mark.**
  Frame it out, or get the asset. Otherwise: CONFLICT to the APPROVER.
- **Scope discipline — do not widen the gate.** Generated typography, UI, layout exploration,
  palettes, and supporting visuals are legitimate design work governed by
  `../_servicepow/policies/brand-assets.md` §2, subordinate to the client's brand standards.
  Review such work against those standards; do not ban the method. Widening §1 is a policy
  violation, not extra safety.
- **Product geometry is a hard gate at review.** Product depictions may be generated from real
  references, but materially wrong geometry, colour, or material is a hard failure.
- **Legal and licence copy is not decoration.** Required text must be present, legible, and
  inside the platform-safe area.
- **Client brand constraints outrank creative preference.** A banned word stays banned; a
  licence-scope limit is not a stylistic choice — it governs copy, voiceover, and every
  on-screen word. Scope-of-licence claims fall under
  `../_servicepow/policies/claims-and-proof.md`.
- **A vehicle wrap is an advertisement.** Everything on it is subject to the same gates.
- **Vendor mark-generators are never source truth for a real client's identity assets** —
  `../_servicepow/policies/brand-assets.md` §4 governs.

## QUALITY GATES

- Every identity-bearing shot carries a COMPOSITE marking in the storyboard before routing.
- Every visible mark traced to a real client file.
- Required legal copy present, legible, inside the safe area.
- Zero banned words in copy, voiceover, or on screen; nothing outside licensed scope.
- Colours of identity assets verified against the brand palette.

**Hard fail — not client-ready:** any generated mark or wordmark · materially wrong product
geometry · missing or illegible required legal copy · a banned word on screen or in audio · a
claim outside the client's licensed scope. Raise a CONFLICT when a required real asset does not
exist and the shot cannot be reframed.

## POLICY BINDINGS

- `../_servicepow/policies/brand-assets.md` — the law this skill enforces: the identity-asset
  list and composite requirement (§1), the scope limit this gate must not widen (§2), COMPOSITE
  flags (§3), vendor mark-generator subordination (§4).
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; this
  skill's verdicts feed BC-21 (correct client, correct brand assets) at the delivery gate.
- `../_servicepow/policies/claims-and-proof.md` — governs licence-scope limits and any factual
  claim encountered in copy or voiceover during the review sweep.
- `../_servicepow/policies/realism-and-disclosure.md` — governs the production-method hierarchy
  the COMPOSITE decision operates within (method chosen before model).
- `../_servicepow/data/roles.md` — defines APPROVER and OPERATOR bindings for the gates named
  here, and the never-stall rule when a role-holder is awaited.

## OUTPUT CONTRACT

Brand-reference material is written into the assigned Campaign Bible section (section
assignment per `../servicepow-campaign-director/references/bible-contract.md`):

- **Identity-asset inventory** — brand references and product references: each §1 item in the
  campaign, with the real client file it traces to, and any missing asset surfaced by name.
- **The client's NEVER-GENERATE list**, compiled from the brand guide.
- **Required legal-copy list** with placement constraints.

Delivered directly:

- **Per-shot COMPOSITE determinations**, to the Campaign Director for recording in the
  storyboard's COMPOSITE field.
- **Review verdicts per asset: PASS / FAIL + reason.** FAIL is a hard failure.
- **CONFLICT records** for missing assets that cannot be reframed, addressed to the APPROVER.
- **Dated brand-guide addenda** proposed to the client KB for newly discovered constraints.

## HANDOFF

COMPOSITE determinations → the Campaign Director, who records them in the storyboard and routes
production accordingly. Review verdicts → `servicepow-creative-critic`, where brand failures
are hard failures, and the BC-21 delivery gate. Missing-asset CONFLICTs → the APPROVER via the
Campaign Director. Newly discovered brand constraints → the client KB brand guide, dated.
