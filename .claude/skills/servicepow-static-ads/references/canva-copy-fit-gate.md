# Canva copy-fit gate — template-bound editing without silent reflow
Single home of the rule for editing text inside a Canva design that was instantiated from a
Service Pow Brand Template. Applies to the semi-automated channel: a human creates the
editable design from the template; this skill replaces the client-specific text and decides
whether the result may be committed. Tool: `../scripts/servicepow_canva_fit.py`.

## Why the gate exists (proved 2026-09-04)
Canva text boxes keep their width and **grow in height when copy wraps**; a shape holding
text grows around it. Exact, formatting-preserving text replacement therefore can still break
a layout: in the first template-bound test a longer headline reflowed to three lines and
overlapped the supporting paragraph, and a longer CTA label wrapped and doubled its chip's
height. Nothing in the edit call reports this. The geometry must be read back and judged.

## The procedure — every step, every time
1. **Inspect before editing.** `read-design` with `open_transaction: true`. Keep the returned
   page document (it carries every element's top/left/width/height, text and formatting) and
   the before-thumbnail. Identify the elements to edit by `locator_id`.
2. **Apply the proposed replacements inside the transaction** with `edit-design`
   `replace_text`, `finalize: keep_open`. Text only — no size, position, font or colour
   operations.
3. **Read back the geometry before commit.** The `document` returned by `edit-design` is the
   after state. Save it beside the before state.
4. **Run the gate:** `servicepow_canva_fit.py --before <before.json> --after <after.json>
   --expect <expect.json>` (expect = `{locator_id: exact new text}`). It checks:
   A geometry frozen (top/left/width) · **B no height growth** (wrapping or container growth)
   · C every box inside the safe zone (54 px on a 1080 canvas; pass `--safe` otherwise) ·
   **D no new overlap** between any two boxes · E formatting frozen · F edited text exact and
   every other element byte-identical.
5. **Any FAIL → do not commit.** `edit-design` `finalize: cancel`. Report the failing element,
   the check, the numbers, and the tool's character budget.
6. **Offer shorter copy** that preserves the intended message, within the budget. The
   operator or APPROVER chooses; then repeat from step 1 with the new copy.
7. **Commit only when every check passes**: `edit-design` `finalize: commit`.
8. **Never silently change** font size, position, dimensions, or the copy itself to make a
   fit. A fit obtained by shrinking type or moving a box is a design change and goes back
   through the layout law and BC-52, not through this gate.

## What the gate does not cover
It judges geometry and text contracts only. Claims (`../../_servicepow/policies/claims-and-proof.md`),
brand marks (`../../_servicepow/policies/brand-assets.md`), client facts (BC-55) and the
dual quality gate still apply to anything that leaves for a client. A committed Canva edit
is a draft until those run.

## Units
Canva's editor size field is in **points**; transaction reads report `fontSize` in pixels.
On a 1080×1080 design, target px × 0.75 is the point size to type in the editor.

## Regression
`tests/fixtures/canva/` holds the captured before/after documents from the first test;
`tests/canva_fit_test.py` proves the gate refuses that case (both growths, the new overlap)
and allows a same-length case. It runs in the regression harness.
