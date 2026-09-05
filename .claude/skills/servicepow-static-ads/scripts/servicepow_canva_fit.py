#!/usr/bin/env python3
"""Canva copy-fit gate: decide COMMIT or CANCEL for text replacements made inside an open
Canva editing transaction. Stdlib only.

usage: servicepow_canva_fit.py --before before.json --after after.json
                               [--safe 54] [--expect expect.json]
  before.json / after.json : the `page` object returned by `read-design` (with
                             open_transaction) and by `edit-design` — or the full
                             read-design response (design_content.pages[0] is used).
  --expect                 : {locator_id: "exact new text"} for the edited elements.
                             Every other element must be byte-identical.

Checks (all must pass before a commit is allowed):
  A  geometry frozen   top / left / width unchanged for every element
  B  no growth         height unchanged — a taller text box means the copy wrapped; a taller
                       shape means its container grew around wrapped text
  C  safe zone         every box inside the safe margin (default 54 px on a 1080 canvas)
  D  no new overlap    no pair of boxes intersects that did not intersect before
  E  formatting frozen fontSize / weight / style / color / align / lineHeight /
                       letterSpacing / fontRef unchanged
  F  text contract     unedited elements unchanged; edited elements exactly as expected
Exit 0 = every check passed, commit allowed.  Exit 1 = CANCEL the transaction.
On a growth failure the tool prints a character budget (before/after height ratio applied to
the new copy length) so shorter copy can be proposed. It never edits anything itself.
"""
import argparse, json, sys

TOL = 0.5
FMT_KEYS = ("fontSize", "fontWeight", "fontStyle", "color", "textAlign", "lineHeight", "letterSpacing", "fontRef")

def load_page(path):
    d = json.loads(open(path).read())
    if "elements" in d: return d
    if "page" in d: return d["page"]
    if "design_content" in d: return d["design_content"]["pages"][0]
    if "pages" in d: return d["pages"][0]
    sys.exit(f"{path}: no page object found")

def regions(el):
    if el.get("type") == "text": return el.get("textRegions", [])
    out = []
    for tc in el.get("textContents", []): out += tc.get("textRegions", [])
    return out

def text_of(el): return "".join(r.get("characters", "") for r in regions(el))
def fmt_of(el):
    r = regions(el)
    return {k: r[0].get("formatting", {}).get(k) for k in FMT_KEYS} if r else {}
def box(el): return (el["left"], el["top"], el["left"] + el["width"], el["top"] + el["height"])
def overlaps(a, b):
    return not (a[2] <= b[0] + TOL or b[2] <= a[0] + TOL or a[3] <= b[1] + TOL or b[3] <= a[1] + TOL)
def label(el): return f"{el.get('locator_id', el['id'])}:{el.get('type')}:'{text_of(el)[:28]}'"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--before", required=True); ap.add_argument("--after", required=True)
    ap.add_argument("--safe", type=float, default=54.0); ap.add_argument("--expect")
    a = ap.parse_args()
    B = load_page(a.before); A = load_page(a.after)
    expect = json.loads(open(a.expect).read()) if a.expect else {}
    W, H = A["dimensions"]["width"], A["dimensions"]["height"]
    lo, hi_x, hi_y = a.safe, W - a.safe, H - a.safe
    bi = {e["id"]: e for e in B["elements"]}; ai = {e["id"]: e for e in A["elements"]}
    fails = []; ok = []
    def gate(name, cond, detail): (ok if cond else fails).append(f"{'PASS' if cond else 'FAIL'}  {name}: {detail}")

    gate("dims", (W, H) == (B["dimensions"]["width"], B["dimensions"]["height"]), f"{W}x{H}")
    gate("element-set", set(bi) == set(ai), f"{len(bi)} before / {len(ai)} after")
    for eid, e in ai.items():
        if eid not in bi: continue
        b = bi[eid]; L = label(e)
        for k in ("top", "left", "width"):
            gate(f"A:geometry:{k}:{L}", abs(e[k] - b[k]) <= TOL, f"{b[k]:.1f} -> {e[k]:.1f}")
        grew = e["height"] > b["height"] + TOL
        detail = f"{b['height']:.1f} -> {e['height']:.1f}"
        if grew:
            budget = int(len(text_of(e)) * b["height"] / e["height"])
            detail += f" px — copy wrapped/container grew; budget ≈ {budget} chars for '{text_of(e)}' ({len(text_of(e))} now)"
        gate(f"B:growth:{L}", not grew, detail)
        x0, y0, x1, y1 = box(e)
        gate(f"C:safe-zone:{L}", x0 >= lo - TOL and y0 >= lo - TOL and x1 <= hi_x + TOL and y1 <= hi_y + TOL, f"box {[round(v) for v in (x0,y0,x1,y1)]} vs safe [{lo:.0f},{lo:.0f},{hi_x:.0f},{hi_y:.0f}]")
        gate(f"E:formatting:{L}", fmt_of(e) == fmt_of(b), "unchanged" if fmt_of(e) == fmt_of(b) else f"{fmt_of(b)} -> {fmt_of(e)}")
        loc = e.get("locator_id", eid)
        if loc in expect: gate(f"F:edited-text:{L}", text_of(e) == expect[loc], "exact" if text_of(e) == expect[loc] else f"got '{text_of(e)}'")
        else: gate(f"F:unedited-text:{L}", text_of(e) == text_of(b), "unchanged" if text_of(e) == text_of(b) else f"CHANGED to '{text_of(e)}'")
    ids = [i for i in ai if i in bi]
    for i, p in enumerate(ids):
        for q in ids[i+1:]:
            before_ov = overlaps(box(bi[p]), box(bi[q])); after_ov = overlaps(box(ai[p]), box(ai[q]))
            gate(f"D:overlap:{label(ai[p])}~{label(ai[q])}", not (after_ov and not before_ov), "new overlap" if (after_ov and not before_ov) else ("pre-existing" if after_ov else "clear"))
    for l in ok + fails: print(l)
    verdict = "COMMIT ALLOWED" if not fails else "CANCEL TRANSACTION"
    print(f"\nCANVA-FIT: {'PASS' if not fails else 'FAIL'} ({len(ok)} passed, {len(fails)} failed) — {verdict}")
    sys.exit(0 if not fails else 1)

if __name__ == "__main__": main()
