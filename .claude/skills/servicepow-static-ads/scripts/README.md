# Static-ads toolkit — canonical home
| Tool | Job |
|---|---|
| `servicepow_static_compose.py` | layout spec JSON -> export PNG + QA MANIFEST. Typographic text (BC-42), real logo files, safe-zone-aware placement, contrast measured at compose time. |
| `servicepow_static_qc.py` | gate battery over an export dir: BC-51 dims/size, BC-52 safe/size/contrast from manifests, BC-53 CTA presence, BC-54 pairwise distinctiveness score, BC-55 facts strings. |
| `servicepow_canva_fit.py` | copy-fit gate for template-bound Canva edits: before/after page documents from an open editing transaction -> commit or cancel. Geometry, growth, safe zone, overlap, formatting and text-contract checks; prints a character budget on failure. Rule: `../references/canva-copy-fit-gate.md`. Stdlib only. |

Bootstrap: same venv pattern as the video toolkit (`python3 -m venv .qcvenv &&
.qcvenv/bin/pip install Pillow`). Fonts are macOS Arial paths — repoint BOLD/REG on other
platforms. Spec example: `../templates/ad-spec-example.json`.
**The manifest is the contract:** hand-built comps that ship no manifest cannot pass the
machine gates — that is by design, not a limitation.
