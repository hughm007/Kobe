---
name: servicepow-brand-fidelity
description: >
  Protects the client's actual brand and product as a hard gate — logo, wordmark, packaging text,
  typography, UI, legal copy, product geometry, colours and materials must come from real client
  assets and be composited, never generated, because near-correct branding is incorrect branding.
  Use before generation to mark which shots are composite-only, and during review to verify every
  visible mark, product and legal line against real files. Also enforces client-specific brand
  constraints such as banned words and licence-scope limits. Do NOT use for creative judgment or
  for continuity between shots.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [brand-references, product-references, brand-hard-gates]
  enforces: LB24
---

# Brand and Product Fidelity

## PURPOSE

The client's mark is not ours to approximate. **Near-correct branding is incorrect branding** — a
nearly-right mark reads faker than no mark at all, and it is the fastest way to lose an account.

## TRIGGER

Any shot containing a logo, wordmark, packaging, product, UI, signage, vehicle livery or legal
copy · before generation (mark composite shots) · reviewing any asset before client delivery ·
"can we just generate the logo".

## REQUIRED INPUTS

- Client `brand-guide.md`
- Bible section 6 (shot list)
- Real brand asset locations

## OPTIONAL INPUTS

Brand kit · product photography · packaging artwork · licence/legal requirements

## WORKFLOW

1. **Read the client brand guide in full**, including its never-generate rules and banned words.
2. **Mark every shot that contains a mark, product, text or legal line as COMPOSITE** in the shot
   list, before routing. This is a production-method decision, not a review note.
3. **Locate the real asset for each.** If a required asset does not exist, surface it by name —
   do not proceed to generate a substitute.
4. **Set the hard gates in the Bible:** product geometry · packaging · colours · materials · logo ·
   labels · brand identity · legal copy.
5. **Verify on review**: every visible mark matches the real file; colours match the brand
   palette; required legal copy is present, legible and inside the safe area; no banned word
   appears anywhere on screen or in audio.
6. **Write Bible section 9.**

## DECISION RULES

- **LB24 — the real files rule.** Logo, wordmark, packaging text, typography, UI and legal copy
  are composited from real client assets. **Never generated. Ever.** No exceptions for "it's just
  a background", "it's small", or "it's blurred".
- **If the real asset does not exist, the shot does not ship** with an approximated mark. Frame
  it out, or get the asset.
- **Product geometry is a hard gate.** A product whose proportions are wrong is a broken product,
  which is a hard failure at QC.
- **Legal and licence copy is not decoration.** Contractor licence numbers, disclosures and
  required text must be present, legible, and inside the platform-safe area — outside the region
  where platform UI covers content.
- **Client brand constraints outrank creative preference.** A banned word stays banned; a
  licence-scope limit is not a stylistic choice. Where a client's licence restricts what may be
  advertised, that constraint governs copy, voiceover and every on-screen word.
- **A vehicle wrap is an advertisement.** Everything on it is subject to the same gates.

## OUTPUT CONTRACT

Bible section 9: brand references, product references, the NEVER-GENERATE list, required legal
copy. Shot list annotated with COMPOSITE flags. Review verdicts per asset: PASS / FAIL + reason.

## QUALITY GATES

- Every mark-bearing shot flagged COMPOSITE before routing
- Every visible mark traced to a real file
- Required legal copy present, legible, inside the safe area
- Zero banned words in copy, voiceover or on screen
- Colours verified against the brand palette

## FAILURE CONDITIONS

**Hard fail — not client ready:** any generated mark or wordmark · wrong product geometry ·
missing or illegible required legal copy · a banned word on screen or in audio · a claim outside
the client's licensed scope.

Raise a CONFLICT when a required real asset does not exist and the shot cannot be reframed.

## HANDOFF

COMPOSITE flags → `servicepow-higgsfield-production` (routing). Verdicts feed
`servicepow-creative-critic`, where brand failures are hard failures.

## REFERENCE FILES

- `agent-workspace/clients/<slug>/brand-guide.md` — the governing document
- `agent-workspace/operations/compliance.md` — legal copy, disclosures, claims
- `agent-workspace/playbooks/ads/video-production.md` — LB24 and the safe-area rules

## LEARNING BEHAVIOR

Brand failures caught are logged to `knowledge/production-log/` tagged CLAUDE-CAUGHT or
OWNER-CAUGHT — the ratio is the KPI of a system learning to see. New client brand constraints
discovered during production are written back to `brand-guide.md` with the date.
