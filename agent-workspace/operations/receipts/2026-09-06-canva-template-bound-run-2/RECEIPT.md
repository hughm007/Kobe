# Canva template-bound editing — run 2 receipt (second independent test)
date: 2026-09-06 · all times UTC · lane under test: **human instantiates the Brand Template, Claude edits inside a gated transaction**
owner decisions applied: copy-fit gate = MANDATORY BLOCKING check · no advance above PROVISIONAL without this test · automatic Brand Template draft creation stays FAILED/BLOCKED (not re-attempted here)

## Subject
design `DAHUcEAAcO0` "Copy of TEST-DISPOSABLE — Service Pow Editorial Frame 1080sq v1" — one page `PBG5d0ZbZDw9hHMQ`, 1080×1080, instantiated by the owner in the Canva UI from Brand Template `EAHUResUDmY`; owner-designated for this test; created 16:40:16Z, owner's last edit 16:44:47Z. Same page id and the same five element ids as the 2026-09-04 design `DAHUSZ8nCr8` → locator ids are stable across UI instantiations of this template (observed on two).
gate: installed `servicepow-static-ads/scripts/servicepow_canva_fit.py` (sha256 `bd39bd8f49e3a2de…`, identical to canonical `b196d85`), default safe zone 54 px.
connector calls: `read-design` ×7 (4 plain, 3 with `open_transaction`), `edit-design` ×5 (2 `replace_text` batches, 2 `cancel`, 1 `commit`). **No** export, publish, share, delete, brand-template, brand-kit, folder, comment or browser-automation call. No other design touched.

## Phase A — required refusal (transaction `…5274`)
| step | time | result | file |
|---|---|---|---|
| clean plain read | 16:53:19Z | text = template copy; thumbnail sha256 `b4675d5c…` | `00-clean-plain-read.json`, `00-clean-thumb.png` |
| open transaction, capture before | 16:54:04Z | 5 elements, full geometry/formatting | `A1-before.json` |
| apply 3 `replace_text` (keep_open) | ~16:55Z | headline 228.8→**347.8** px (3 lines), CTA chip 99.9→**177.9** px (wrapped); support box unchanged | `A3-after-page.json`, `A3-after-thumb-uncommitted.png` |
| **gate** | 16:55:25Z | **FAIL (44 passed, 3 failed) — CANCEL TRANSACTION**, exit 1: `B:growth` headline, `B:growth` CTA, `D:overlap` headline~support (new). Budgets printed: headline ≈23 chars, CTA ≈10 chars | `A4-gate-output.txt` |
| cancel | ~16:55:45Z | `status: cancelled` | — |
| verify return | 16:55:55Z | after-cancel page document **sha256-identical** to `A1-before` (geometry, formatting, text, background, nineSlice); persisted text + page metadata identical; thumbnail content hash identical | `A5-plain-read-after-cancel.json`, `A6-return-to-clean-verification.txt` |

Only delta: `design_metadata.updated_at` 16:44:47Z → **16:53:19Z** = the exact second of the first *read-only* call (thumbnail render), 45 s **before** the transaction opened. A read moves `updated_at`; it is not evidence of a persisted edit — the transaction page document is.

## Phase B — required pass (transaction `…4822`)
| step | time | result | file |
|---|---|---|---|
| open transaction, capture before | 16:55:56Z | page sha256 == Phase A before (doubles as the exact-return proof) | `B1-before.json` |
| apply 3 `replace_text` (keep_open) | ~16:57Z | every height unchanged: CTA 99.9, eyebrow 33.4, headline 228.8, support 166.6, meta 33.4 | `B3-after-page.json`, `B3-after-thumb-uncommitted.png` |
| **gate** | 16:57:54Z | **PASS (47 passed, 0 failed) — COMMIT ALLOWED**, exit 0 | `B4-gate-output.txt` |
| commit | 16:58:28Z | `status: committed` (persisted `updated_at` = 16:58:28Z) | — |
| read back, persisted | 16:58:2xZ | text lines exactly: `LET'S TALK` · `SERVICE POW / TYPOGRAPHY STUDY` · `Marketing built to work.` · `Strategy and production, connected through one measurable system.` · `THE FRAME / CONTROLLED TYPE TEST` | `C1-plain-read-after-commit.json` |
| read back, geometry (verification transaction `…6312`, no ops, cancelled) | 16:58:3xZ | committed page **sha256-identical** to the gated after-state; per element vs clean-before: top/left/width/height SAME, formatting SAME (fontSize/weight/style/color/align/lineHeight/letterSpacing/fontRef), eyebrow + meta text UNCHANGED, 3 edited texts EXACT | `C2-transaction-read-after-commit.json`, `C3-committed-verification.txt` |

Observed: the persisted-state thumbnail still rendered the **pre-commit** image 7 min after commit (17:05Z; the URL carried `fallbackstale=T` at first, then a new content hash without the flag, image still stale). `updated_at` moved again at 17:03:22Z with no call of ours at that second. Verify a commit by transaction read or text, never by the persisted thumbnail alone.

## Verdict
Phase A refused and returned exactly; Phase B passed, committed, and read back exactly. **Second independent successful template-bound editing run** (first: 2026-09-04, `DAHUSZ8nCr8`). Lane promoted PROVISIONAL → PROVEN in `connector-register.md`; auto draft creation unchanged at FAILED/BLOCKED.

## Regression floor — same day, canonical `b196d85` untouched (real tool output, not restated)
validator `15 check groups passed, 0 failures` (both deployments in sync; derived registry count 55) · web `PASS (24 passed, 0 failed, 2 pages)` / bad `FAIL (1 passed, 14 failed, 1 pages)` · static clean `PASS (41 passed, 0 failed, 2 exports)` / planted `FAIL (56 passed, 6 failed, 3 exports)` / BC-54 pair `FAIL (40 passed, 1 failed, 2 exports)` with `diff=0.029 (NEAR-DUPLICATE - judge)` · ingest isolation `PASS (19 passed, 0 failed, 19 cases)` · canva-fit `PASS (8 passed, 0 failed, 8 cases)` · video preflight `PASS (6/6)`. Cold-session sims not run: no doctrine or capability file changed (regression.md step 9 rule).
Hashes are sha256 over canonical JSON (sorted keys, compact separators, UTF-8). Per-call share links were stripped from the persisted-read files; ids and timestamps kept.
