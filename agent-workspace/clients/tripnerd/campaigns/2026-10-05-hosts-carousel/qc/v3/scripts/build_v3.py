#!/usr/bin/env python3
"""TripNerd hosts carousel v2 - plates + photo panels + layout specs, then the (patched) composer.
v1 build.py is left untouched. Plates (solid colour, logo plate, proof band, list rules) are drawn here;
readable text, the logo and the real photo panels are placed by compose_v2.py so they appear in the manifest.

Layout law v2:
  * header row on every card: logo on a #5896E9 plate at TOP-LEFT (Instagram's counter covers top-right),
    logo 345 px wide, the plate fully inside the safe box (54,67,1026,1283);
  * c2-c5: numeral (one size, 140 px) + label beside it in the header row, right of the logo plate;
  * photo panel (c1, c2, c4) under the header, inside the safe box; text below it on flat colour;
  * text stacks are anchored to the CTA so there is no empty band above the CTA.
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).parent))
import photos_v3 as PH

SP = Path("/tmp/claude-0/-home-user-Kobe/7684385f-af46-5eba-9499-dc37ceef99c7/scratchpad")
WD = SP / "static_hosts"
PY = str(SP / "qcvenv/bin/python")
LOGO = str(SP / "brand/tripnerd-logo-colour-1633x601.png")
BOLD = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
REG = str(SP / "fonts/inter_1.ttf")
W, H = 1080, 1350
SAFE = (54, 67, 1026, 1283)
MAXW = (SAFE[2] - SAFE[0]) * 0.8

BLUE = [88, 150, 233]      # site blue  #5896E9
NAVY = [32, 40, 56]        # navy       #202838
LBLUE = [24, 160, 240]     # logo blue  #18A0F0
WHITE = [255, 255, 255]
VER = "v3"
BASE = "tripnerd-hostswrong-C02-H1-feed-portrait-" + VER
EXP = WD / "exports_v3"; SPECS = WD / "specs_v3"; BG = WD / "bg_v3"
for p in (EXP, SPECS, BG):
    p.mkdir(exist_ok=True)

# header geometry
LOGO_FRAC = 0.32
LW = int(W * LOGO_FRAC); LH = int(601 * LW / 1633)          # 345 x 126
PLATE = [SAFE[0], SAFE[1], SAFE[0] + LW + 32, SAFE[1] + LH + 24]   # [54,67,431,217] fully inside safe
LOGO_XY = [PLATE[0] + 16, PLATE[1] + 12]
NUM = 140
NUM_X = PLATE[2] + 40
HDR_MID = (PLATE[1] + PLATE[3]) / 2
PANEL_X = (SAFE[0], SAFE[2])
PANEL_R = 20
BAND_PAD_X = 32
CTA_BOTTOM = 1262

_d = ImageDraw.Draw(Image.new("RGB", (8, 8)))


def font(size, bold):
    return ImageFont.truetype(BOLD if bold else REG, size)


def wrap(text, size, bold):
    f = font(size, bold); lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if _d.textlength(t, font=f) <= MAXW:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def box_h(b):
    n = len(wrap(b["text"], b["size"], b.get("bold", False)))
    return b["size"] + 12 + (n - 1) * int(b["size"] * 1.3)


def T(role, text, size, fill, bold=False, align="left", **kw):
    b = {"role": role, "text": text, "size": size, "fill": fill, "bold": bold, "align": align}
    b.update(kw); return b


def cta(text, chip_fill, fill, size=40):
    return T("cta", text, size, fill, bold=True, align="left", chip=True, chip_fill=chip_fill + [255], chip_radius="pill",
             x=SAFE[0] + 20)


def glyph_mid_y(text, size, bold):
    """y origin that puts the ink's vertical centre on HDR_MID."""
    t, b = font(size, bold).getbbox(text)[1::2]
    return int(round(HDR_MID - (t + b) / 2))


def header(numeral=None, label=None):
    """Header blocks right of the logo plate: optional numeral, then label, both centred on the plate."""
    out = []; x = NUM_X
    if numeral is not None:
        y = max(SAFE[1], glyph_mid_y(numeral, NUM, True))
        out.append(T("numeral", numeral, NUM, LBLUE, bold=True, x=x, _y=y))
        x += int(_d.textlength(numeral, font=font(NUM, True))) + 32
    if label is not None:
        ly = glyph_mid_y(label, 34, True)
        if numeral is not None:
            nt, nb = font(NUM, True).getbbox(numeral)[1::2]; lt, lb = font(34, True).getbbox(label)[1::2]
            ly = int(round(out[0]["_y"] + (nt + nb) / 2 - (lt + lb) / 2))
        out.append(T("label", label, 34, LBLUE, bold=True, x=x, _y=ly))
    return out


def header_bottom(hdr):
    return max([PLATE[3]] + [b["_y"] + box_h(b) for b in hdr])


def stack_up(items, bottom):
    """items = [(gap_before, block)], placed so the last block's box bottom sits at `bottom`. Returns placed, top."""
    tot = sum(g for g, _ in items[1:]) + sum(box_h(b) for _, b in items)
    y = bottom - tot; top = y; placed = []
    for i, (g, b) in enumerate(items):
        if i:
            y += g
        b = dict(b); b["_y"] = y; placed.append(b); y += box_h(b)
    return placed, top


def stack_down(items, top):
    y = top; placed = []
    for i, (g, b) in enumerate(items):
        if i:
            y += g
        b = dict(b); b["_y"] = y; placed.append(b); y += box_h(b)
    return placed, y


def band_rect(b):
    s = b["size"]; n = len(wrap(b["text"], s, b.get("bold", False)))
    cap_top = b["_y"] + round(0.24 * s); base = b["_y"] + (n - 1) * int(s * 1.3) + round(0.97 * s)
    return [PANEL_X[0], cap_top - 30, PANEL_X[1], base + 30]


def card(n, bg, blocks, photo=None, rules=(), log=None):
    """blocks carry absolute _y. photo = (name, crop, y0, y1, y_min). Writes plate PNG, photo panel, spec."""
    img = Image.new("RGB", (W, H), tuple(bg)); d = ImageDraw.Draw(img)
    plates = [{"kind": "logo-plate", "rect": PLATE, "color": BLUE}]
    d.rounded_rectangle(PLATE, 18, fill=tuple(BLUE))
    for b in blocks:
        if b["role"] == "fact":
            r = band_rect(b); d.rounded_rectangle(r, 14, fill=tuple(BLUE)); plates.append({"kind": "proof-band", "rect": r, "color": BLUE})
    for (y, x0, x1) in rules:
        r = [x0, y, x1, y + 2]; d.rectangle(r, fill=tuple(LBLUE)); plates.append({"kind": "rule", "rect": r, "color": LBLUE})
    bgp = BG / f"c{n}-plate.png"; img.save(bgp)
    spec = {"name": f"{BASE}-c{n}", "placement": "feed-portrait", "background": {"image": str(bgp)},
            "logo": {"file": LOGO, "width_frac": LOGO_FRAC, "pos": "top-left", "xy": LOGO_XY}, "blocks": []}
    photo_rec = None
    if photo:
        name, crop, y0, y1, y_min, anchor = photo
        size = (PANEL_X[1] - PANEL_X[0], y1 - y0)
        pp, photo_rec = PH.panel(name, crop, size, f"{BASE}-c{n}-photo.png", y_min=y_min, anchor=anchor)
        box = [PANEL_X[0], y0, PANEL_X[1], y1]
        spec["photos"] = [{"file": str(pp), "box": box, "radius": PANEL_R}]
        plates.append({"kind": "photo-panel", "rect": box, "source": photo_rec["source"]})
        photo_rec["box"] = box
    for b in blocks:
        bb = {k: v for k, v in b.items() if not k.startswith("_")}
        bb["y_frac"] = (b["_y"] + 0.5) / H
        spec["blocks"].append(bb)
    sp = SPECS / f"{BASE}-c{n}.spec.json"; sp.write_text(json.dumps(spec, indent=1))
    (SPECS / f"{BASE}-c{n}.plates.json").write_text(json.dumps(
        {"plates": plates, "logo_box": [LOGO_XY[0], LOGO_XY[1], LOGO_XY[0] + LW, LOGO_XY[1] + LH], "photo": photo_rec}, indent=1))
    if log is not None:
        log.append((n, photo_rec))
    return sp


def cta_block(c):
    c = dict(c); c["_y"] = CTA_BOTTOM - (c["size"] + 12); return c


def photo_card(n, numeral, label, photo, items, cta_c, min_photo=380):
    """Header, photo panel, then the text stack anchored to the CTA (no empty band above the CTA)."""
    hdr = header(numeral, label)
    c = cta_block(cta_c); chip_top = c["_y"] - 10
    gap_cta = 40 if items[-1][1]["role"] == "fact" else 32
    placed, top = stack_up(items, chip_top - gap_cta)
    y0 = header_bottom(hdr) + 24; y1 = top - (40 if placed[0]["role"] == "fact" else 32)
    assert y1 - y0 >= min_photo, f"c{n}: photo panel only {y1 - y0}px"
    name, crop, y_min, anchor = photo
    return hdr + placed + [c], (name, crop, y0, y1, y_min, anchor)


def type_card(n, numeral, label, items, cta_c, gap_cta=48):
    hdr = header(numeral, label)
    c = cta_block(cta_c); chip_top = c["_y"] - 10
    placed, top = stack_up(items, chip_top - gap_cta)
    assert top >= header_bottom(hdr) + 24, f"c{n}: stack top {top} hits header"
    return hdr + placed + [c], top - header_bottom(hdr)


def rail_stills():
    d = SP / "two_ways/stills"
    files = sorted(p for p in d.glob("*") if p.suffix.lower() in (".png", ".jpg", ".jpeg")) if d.is_dir() else []
    return d, files


def build():
    d, stills = rail_stills()
    print(f"rail-still check: {d} -> {'%d files' % len(stills) if d.is_dir() else 'absent'}")
    if stills:
        sys.exit("rail stills present: choose one by eye before building (c1 + c3 rail, c2 = clean_IMG_1901)")
    log = []; specs = []; notes = {}
    HL = 72; SUP = 40; PRF = 36

    # c1 COVER (blue) - clean IMG_1901 crop: tablecloth logo + table top, below every face
    c1 = [(0, T("headline", "Hosting clients at a golf tournament?", 84, NAVY, bold=True)),
          (24, T("support", "Four moments make or break a hosted day.", 44, NAVY)),
          (20, T("label", "Arrival · The view · Food · The exit", 32, NAVY, bold=True))]
    blocks, ph = photo_card(1, None, None, ("IMG_1901", (0, 1395, 1187, 1868), 1290, "bottom"), c1, cta("Swipe →", NAVY, WHITE, 42), min_photo=340)
    specs.append(card(1, BLUE, blocks, photo=ph, log=log))

    # c2 1 · ARRIVAL - IMG_1907: table, laptops, lanyards and the STAFF badge; faces cropped out
    c2 = [(0, T("headline", "Give guests one place to arrive.", HL, WHITE, bold=True)),
          (24, T("support", "One check-in point. One host who knows their name.", SUP, WHITE)),
          (44, T("fact", "Ours: a TripNerd-branded table, with staff on hand.", PRF, NAVY, x=SAFE[0] + BAND_PAD_X))]
    blocks, ph = photo_card(2, "1", "1 · ARRIVAL", ("IMG_1907", (0, 1160, 1536, 1860), 1150, "bottom"), c2, cta("Next: the view →", WHITE, NAVY))
    specs.append(card(2, NAVY, blocks, photo=ph, log=log))

    # c3 2 · THE VIEW - type-only (no rail still on disk)
    c3 = [(0, T("headline", "Seat guests where the moment happens.", 96, WHITE, bold=True)),
          (32, T("support", "Know which hole matters, and get there before the leaders do.", 46, WHITE)),
          (56, T("fact", "Ours: at the island-green 17th, guests watched from the rail.", 40, NAVY, x=SAFE[0] + BAND_PAD_X))]
    blocks, spare = type_card(3, "2", "2 · THE VIEW", c3, cta("Next: food →", WHITE, NAVY))
    notes[3] = spare; specs.append(card(3, NAVY, blocks, log=log))

    # c4 3 · FOOD - IMG_1998 dessert spread, no people; venue card + stand cropped out (y < 1105)
    c4 = [(0, T("headline", "Keep the food close to the action.", HL, WHITE, bold=True)),
          (24, T("support", "Nobody should choose between lunch and the big shot.", SUP, WHITE)),
          (44, T("fact", "Ours: a hosted spread, set out for guests.", PRF, NAVY, x=SAFE[0] + BAND_PAD_X))]
    blocks, ph = photo_card(4, "3", "3 · FOOD", ("IMG_1998", (0, 1110, 1536, 1900), 1105, "top"), c4, cta("Next: the exit →", WHITE, NAVY))
    specs.append(card(4, NAVY, blocks, photo=ph, log=log))

    # c5 4 · THE EXIT - type-only, no proof band (never claim TripNerd handles transport)
    c5 = [(0, T("headline", "Plan the ride home before anyone arrives.", 108, WHITE, bold=True)),
          (40, T("support", "Know how every guest gets back, and when.", 50, WHITE))]
    hb5 = header_bottom(header("4", "4 · THE EXIT")); h5 = sum(g for g, _ in c5[1:]) + sum(box_h(b) for _, b in c5)
    free5 = (CTA_BOTTOM - 52 - 10) - (hb5 + 24) - h5
    blocks, spare = type_card(5, "4", "4 · THE EXIT", c5, cta("Next: your checklist →", WHITE, NAVY), gap_cta=max(48, free5 // 2))
    notes[5] = spare; specs.append(card(5, NAVY, blocks, log=log))

    # c6 YOUR CHECKLIST - label in the header slot; four labelled questions with logo-blue rules between
    q = [("1 · ARRIVAL", "Who meets them?"), ("2 · THE VIEW", "Where do they watch?"),
         ("3 · FOOD", "Where’s the food?"), ("4 · THE EXIT", "How do they get home?")]
    items = [(0, T("headline", "Before you host, answer four questions.", 68, WHITE, bold=True))]
    for i, (lab, qq) in enumerate(q):
        items.append((40 if i == 0 else 48, T("label", lab, 30, LBLUE, bold=True)))
        items.append((16, T("support", qq, 48, WHITE, bold=True)))
    hdr = header(None, "YOUR CHECKLIST")
    c = cta_block(cta("Save this checklist", WHITE, NAVY, 42))
    placed, top = stack_up(items, c["_y"] - 10 - 40)
    hb = header_bottom(hdr); shift = (top - (hb + 24)) // 2       # centre the list between header and CTA
    placed = [dict(b, _y=b["_y"] - shift) for b in placed]
    labs = [b for b in placed if b["role"] == "label"]
    rules = [(b["_y"] - 25, SAFE[0], SAFE[0] + int(MAXW)) for b in labs[1:]]
    notes[6] = top - shift - hb
    specs.append(card(6, NAVY, hdr + placed + [c], rules=rules, log=log))

    # c7 CLOSE (blue) - stack centred between the header and the bottom of the safe box
    c7 = [(0, T("headline", "Hosting clients or bringing friends?", 100, NAVY, bold=True)),
          (36, T("support", "TripNerd hosts guests at golf tournaments and other big events.", 46, NAVY)),
          (64, T("cta", "Plan yours · link in bio", 48, NAVY, bold=True, chip=True, chip_fill=WHITE + [255],
                 chip_radius="pill", x=SAFE[0] + 20))]
    hb = header_bottom([]); tot = sum(g for g, _ in c7[1:]) + sum(box_h(b) for _, b in c7)
    top = hb + ((CTA_BOTTOM - hb) - tot) // 2
    placed, _ = stack_down(c7, top)
    notes[7] = top - hb
    specs.append(card(7, BLUE, placed, log=log))
    print("spare/top gaps:", notes)
    (WD / "qc" / "photo-panels-v3.json").write_text(json.dumps({f"c{n}": r for n, r in log if r}, indent=1))
    return specs


def compose(specs):
    for sp in specs:
        r = subprocess.run([PY, str(WD / "compose_v2.py"), str(sp), str(EXP)], capture_output=True, text=True)
        print(r.stdout.strip(), r.stderr.strip())
        if r.returncode:
            sys.exit(r.returncode)


if __name__ == "__main__":
    compose(build())
