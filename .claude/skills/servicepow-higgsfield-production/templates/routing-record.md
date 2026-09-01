# Routing record — one per shot

Fill every field. A blank field is a routing decision that was not made. Models, parameters,
and costs come from live runtime queries this session
(`../../_servicepow/policies/generation-and-spend.md` §1) — never from memory or from any
document. Cite the query and its date in the fields that carry live facts.

| Field | What it must say |
|---|---|
| **Shot ID / objective** | What this shot must achieve for the story, in one line. |
| **Requirements** | Hard constraints from the storyboard: identity to hold, text to read, motion, duration, aspect, placement. |
| **Method** | One of: full generation · reference-driven generation · real product + AI environment · real footage + AI · compositing · traditional editing · hybrid. Chosen before any model. COMPOSITE flag here if the shot contains an exact identity asset (`../../_servicepow/policies/brand-assets.md`). |
| **Ladder rung** | Current rung for this shot per the spend policy §2, entered at rung 1; a skip is justified here, in writing. |
| **Model** | From the live catalogue this session, with query date. |
| **Why this model** | The capability that meets this shot's requirements — with evidence status (DOCUMENTED / VENDOR CLAIM / INDEPENDENT TEST / SERVICE POW TEST). "It is the newest" and "it is impressive" are not reasons. |
| **Backup model** | Named now, not after the failure — with the condition that triggers the switch. |
| **References** | Which identity/brand/product/avatar inputs are attached, and what each is holding constant. |
| **Physical prompt** | The prompt as physics and staging — what is where, doing what, lit how — not adjectives. |
| **Known risks** | Failure modes for this model/shot combination, each with evidence status; SERVICE POW TEST entries from the client KB production log outrank everything else. |
| **Expected cost** | Priced by the runtime for the exact settings (mode, resolution, duration, audio on/off, batch size). Never an assumed tier. |
| **Savings rules applied** | Which standing savings rules of the spend policy §3 bind this shot (edit-vs-re-roll plan, identity reuse, audio off, placement-matched resolution, test-tier variant). |
| **Regeneration strategy** | If it fails: which edit ops are tried first, what one tightened re-roll changes, and the ceiling before re-routing to a different method. |

Plan-level footer (once, under the table): **total expected cost vs budget** ·
**plan-level risks** · **execution order** (cheapest proof first, one test before any batch,
premium final last and once).
