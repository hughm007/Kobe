---
title: "Canva procedure — runtime facts and the template-bound editing workflow"
type: procedure
client: internal
status: active
created: 2026-09-04
updated: 2026-09-06
tags: [connectors, canva, static, templates]
---
# Canva — runtime facts for this workspace (verified 2026-09-04, re-verified 2026-09-06)
Doctrine: installed skill `servicepow-static-ads/references/canva-copy-fit-gate.md`.
Gate tool: `servicepow-static-ads/scripts/servicepow_canva_fit.py`.

## Connected surface
- Canva **Business** (free trial; ends 2026-10-04, decision by 2026-10-01 — see the connector register).
- Canonical Brand Kit **`kAHUQhq3Ihc`** "Service Pow — Core Brand" (colours, fonts, one logo —
  OWNER/UI-verified; the connector cannot read kit contents). Canva's unnamed default kit
  `kAHUQtGS0Bs` stays untouched.
- Brand Template **`EAHUResUDmY`** "TEST-DISPOSABLE — Service Pow Editorial Frame 1080sq v1",
  published 2026-09-04 from the owner-approved design. **Publishing CONVERTED the source design
  into the template master** — the design id stopped resolving. Kit association UNVERIFIED BY
  CONNECTOR.
- `search-brand-templates` with no query returns nothing; search **by title**.

## Permission wall — recorded, not solved
`create-brand-template-draft` on `EAHUResUDmY` is refused ("User does not have permission to
access brand template") **twice**, including after the owner disconnected and reconnected the
connector with team integration access confirmed. Publish works; every access to the result
does not. Canva's help service cannot name the missing scope.
**Standing state (owner decision 2026-09-06): FAILED/BLOCKED. Not re-attempted in run 2; do not re-attempt
without a Canva-side permission change.**

## The template-bound editing workflow — PROVEN (two independent tests: 2026-09-04 `DAHUSZ8nCr8`, 2026-09-06 `DAHUcEAAcO0`)
Receipt of the second run: `receipts/2026-09-06-canva-template-bound-run-2/RECEIPT.md`.
1. **Human:** open the Brand Template in Canva and create an editable design from it (the
   UI "use template" path). Share nothing; the design id is enough.
2. **Claude:** `read-design` with `open_transaction: true` → full element geometry and
   formatting (top/left/width/height, fontSize in px, weight, colour, lineHeight,
   letterSpacing, fontRef) plus the before-thumbnail.
3. **Claude:** `edit-design` `replace_text` per element, `finalize: keep_open`. Text
   replacement is **exact and formatting-preserving** (proved on `DAHUSZ8nCr8`).
4. **Claude:** run the copy-fit gate on the before/after page documents. Canva text boxes
   **auto-grow in height when copy wraps** and shapes grow around their text — a longer
   headline overlapped the support paragraph (228.8 → 347.8 px) and a longer CTA wrapped
   (99.9 → 177.9 px) in the test — and again, on a fresh instantiation, in run 2. **The gate is a
   MANDATORY BLOCKING check (owner decision 2026-09-06): no commit without a recorded PASS run.**
5. **Claude:** `finalize: commit` only on PASS; on FAIL `finalize: cancel`, report the failing
   element and its character budget, and propose shorter copy. Never change size, position,
   dimensions or copy silently.
6. **Claude:** read the committed design back — a plain `read-design` for the persisted text, and a
   fresh `read-design` with `open_transaction: true` (no operations; cancel it) for the geometry —
   and hash-compare the page document to the gated after-state. After a cancel, do the same to
   prove the exact return to the before-state. File before/after page documents, gate output and
   the verification under `operations/receipts/` (strip per-call share links; keep ids and times).

## Units
Canva's size field is **points**. On a 1080×1080 design, **target px × 0.75** gave the correct
point size (92 px → 69, 44 → 33, 56 → 42, 28 → 21). Transaction reads report `fontSize` in px.

## Facts learned in run 2 (2026-09-06)
- **Locator ids are stable across UI instantiations of the same template** — `DAHUSZ8nCr8` and
  `DAHUcEAAcO0` carried the same page id and the same five element ids. Still read them back every
  time; never assume.
- **`updated_at` moves on a read-only call** (it matched the first plain read's thumbnail render to
  the second, before any transaction opened) and moved again later with no call of ours at that
  second. It is not evidence of a persisted edit; the transaction page document is.
- **The persisted-state thumbnail can lag a commit** — seven minutes after the commit it still served
  the pre-commit render (`fallbackstale` in the URL at first; the flag cleared, the image had not).
  Verify a commit by transaction read or text, never by the thumbnail.
- **`edit_url` / `view_url` differ per call** and are access links — record the design id, not them.
- **Heights come back with float noise** (99.88799999999999 vs 99.888); compare with the gate's
  0.5 px tolerance, not string equality. Everything else was byte-identical.
- Wall clock for the whole two-phase run: about five minutes (16:53–16:58 UTC).

## UI-only facts (for a human, or a supervised browser session)
Typing while a panel lacks focus fires editor shortcuts (`t` text, `r` rectangle, `/` action
palette); use the Position panel's numeric fields for geometry; Fraunces exposes six fixed
instances (no optical-size / Softness / Wonky control).
