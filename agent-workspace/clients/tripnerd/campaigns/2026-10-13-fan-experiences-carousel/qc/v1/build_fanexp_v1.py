#!/usr/bin/env python3
"""TripNerd fan-experiences carousel C03 v1 (finishing Karl's 3 Sep "VIP Fan Experiences" draft).
Helpers copied verbatim from static_hosts/build_v3.py (C02); only constants, the placeholder frame and build() differ.
C02 header text kept below for the layout law it documents.

TripNerd hosts carousel v2 - plates + photo panels + layout specs, then the (patched) composer.
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
import photos_fanexp as PH

SP = Path("/tmp/claude-0/-home-user-Kobe/7684385f-af46-5eba-9499-dc37ceef99c7/scratchpad")
WD = SP / "static_vip"
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
SLOT = [44, 56, 80]       # placeholder frame fill (draft only; replaced by the 17th-hole rail frame)
VER = "v1"
BASE = "tripnerd-fanexp-C03-H1-feed-portrait-" + VER
EXP = WD / "exports_v1"; SPECS = WD / "specs_v1"; BG = WD / "bg_v1"
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
    if photo and photo[0] == "PLACEHOLDER":   # C03 draft: labelled empty frame drawn into the plate
        box = [PANEL_X[0], photo[2], PANEL_X[1], photo[3]]
        d.rounded_rectangle(box, PANEL_R, fill=tuple(SLOT), outline=tuple(LBLUE), width=4)
        plates.append({"kind": "photo-panel", "rect": box, "source": "PLACEHOLDER: " + photo[1]})
        photo = None
    bgp = BG / f"c{n}-plate.png"; img.save(bgp)
    spec = {"name": f"{BASE}-c{n}", "placement": "feed-portrait", "background": {"image": str(bgp)},
            "logo": {"file": LOGO, "width_frac": LOGO_FRAC, "pos": "top-left", "xy": LOGO_XY}, "blocks": []}
    photo_rec = None
    if photo:
        name, crop, y0, y1, y_min, anchor = photo[:6]; preset = photo[6] if len(photo) > 6 else "c2"
        size = (PANEL_X[1] - PANEL_X[0], y1 - y0)
        pp, photo_rec = PH.panel(name, crop, size, f"{BASE}-c{n}-photo.png", y_min=y_min, anchor=anchor, preset=preset)
    if photo:
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
    name, crop, y_min, anchor = photo[:4]
    return hdr + placed + [c], (name, crop, y0, y1, y_min, anchor) + tuple(photo[4:])


def type_card(n, numeral, label, items, cta_c, gap_cta=48):
    hdr = header(numeral, label)
    c = cta_block(cta_c); chip_top = c["_y"] - 10
    placed, top = stack_up(items, chip_top - gap_cta)
    assert top >= header_bottom(hdr) + 24, f"c{n}: stack top {top} hits header"
    return hdr + placed + [c], top - header_bottom(hdr)


def slot_text(ph, lines=("PHOTO TO COME", "17th-hole rail frame · Taylor’s original")):
    """Draft-only label centred in a PLACEHOLDER frame (white on SLOT, ~11.9:1). Removed when the frame is filled."""
    y0, y1 = ph[2], ph[3]
    items = [(0, T("label", lines[0], 34, WHITE, bold=True, align="center")),
             (20, T("label", lines[1], 32, WHITE, align="center"))]
    tot = 20 + sum(box_h(b) for _, b in items)
    placed, _ = stack_down(items, y0 + ((y1 - y0) - tot) // 2)
    return placed


def build():
    log = []; specs = []; notes = {}
    HL = 72; PRF = 36
    RAIL = "17th-hole rail frame (Taylor's original, >=1080 px, faces cropped out)"

    # c1 COVER (navy) - Karl's row-40 hook; rail frame is the payoff image (placeholder until the originals arrive)
    c1 = [(0, T("headline", "You didn’t travel this far to sit in row 40.", 88, WHITE, bold=True))]
    blocks, ph = photo_card(1, None, "FAN EXPERIENCES", ("PLACEHOLDER", RAIL, 0, "top"), c1, cta("Swipe →", WHITE, NAVY, 42), min_photo=420)
    specs.append(card(1, NAVY, blocks + slot_text(ph), photo=ph, log=log))

    # c2 THE TICKET (navy) - type card; replaces the "VIP / lanyard / buffet in a tent" knock
    c2 = [(0, T("headline", "A ticket gets you in.", 124, WHITE, bold=True)),
          (40, T("support", "Where you watch from is the part you remember.", 52, WHITE))]
    hb2 = header_bottom(header(None, "THE TICKET")); h2 = sum(g for g, _ in c2[1:]) + sum(box_h(b) for _, b in c2)
    free2 = (CTA_BOTTOM - 52 - 10) - (hb2 + 24) - h2
    blocks, spare = type_card(2, None, "THE TICKET", c2, cta("Next: the view →", WHITE, NAVY), gap_cta=max(48, free2 // 2))
    notes[2] = spare; specs.append(card(2, NAVY, blocks, log=log))

    # c3 THE VIEW (navy) - EV-tripnerd-006 proof band; rail frame placeholder
    c3 = [(0, T("headline", "See it from the rail.", 100, WHITE, bold=True)),
          (20, T("support", "Not from the back of the crowd.", 44, WHITE)),
          (40, T("fact", "Ours: at the island-green 17th, guests watched from the rail.", PRF, NAVY, x=SAFE[0] + BAND_PAD_X))]
    blocks, ph = photo_card(3, None, "THE VIEW", ("PLACEHOLDER", RAIL, 0, "top"), c3, cta("Next: where we go →", WHITE, NAVY), min_photo=360)
    specs.append(card(3, NAVY, blocks + slot_text(ph), photo=ph, log=log))

    # c4 WHERE WE GO (blue) - EV-tripnerd-004 exact wording; no event names (Augusta/Super Bowl cut)
    c4 = [(0, T("support", "Not just any event.", 52, NAVY)),
          (20, T("headline", "The big ones.", 104, NAVY, bold=True)),
          (40, T("support", "TripNerd hosts guests at golf tournaments and other big events.", 50, NAVY))]
    hb4 = header_bottom(header(None, "WHERE WE GO")); h4 = sum(g for g, _ in c4[1:]) + sum(box_h(b) for _, b in c4)
    free4 = (CTA_BOTTOM - 52 - 10) - (hb4 + 24) - h4
    hdr4 = [dict(b, fill=NAVY) for b in header(None, "WHERE WE GO")]      # navy label on blue (4.89:1)
    blocks, spare = type_card(4, None, "WHERE WE GO", c4, cta("Next: arrival →", WHITE, NAVY), gap_cta=max(48, free4 // 2))
    blocks = hdr4 + [b for b in blocks if b["role"] != "label"]
    notes[4] = spare; specs.append(card(4, BLUE, blocks, log=log))

    # c5 ARRIVAL (navy) - EV-tripnerd-008; IMG_1901 LEFT crop (C02 used 1907 full width + 1901 cloth only).
    # Faces sit at y <= ~1125 in the source (z1901_neck.png); exclusion line 1160.
    c5 = [(0, T("headline", "Know who to find when you get there.", HL, WHITE, bold=True)),
          (40, T("fact", "Ours: a TripNerd-branded table, with staff on hand.", PRF, NAVY, x=SAFE[0] + BAND_PAD_X))]
    blocks, ph = photo_card(5, None, "ARRIVAL", ("IMG_1901", (0, 1160, 1100, 1860), 1160, "top", "c2"), c5, cta("Next: the food →", WHITE, NAVY))
    specs.append(card(5, NAVY, blocks, photo=ph, log=log))

    # c6 THE FOOD (navy) - EV-tripnerd-007; IMG_1998 tartlet-plate close crop (C02 used the wide spread)
    c6 = [(0, T("headline", "Eat well between the big moments.", HL, WHITE, bold=True)),
          (40, T("fact", "Ours: a hosted spread, set out for guests.", PRF, NAVY, x=SAFE[0] + BAND_PAD_X))]
    blocks, ph = photo_card(6, None, "THE FOOD", ("IMG_1998", (0, 1270, 1290, 1830), 1105, "top", "c4"), c6, cta("Next: plan yours →", WHITE, NAVY))
    specs.append(card(6, NAVY, blocks, photo=ph, log=log))

    # c7 CLOSE (blue) - TripNerd's own line "Trip like a Nerd."; CTA per EV-tripnerd-005 (BC-19 receipt owed)
    c7 = [(0, T("headline", "Bringing friends to a big event?", 104, NAVY, bold=True)),
          (36, T("support", "Trip like a Nerd.", 56, NAVY, bold=True)),
          (64, T("cta", "Plan yours · link in bio", 48, NAVY, bold=True, chip=True, chip_fill=WHITE + [255],
                 chip_radius="pill", x=SAFE[0] + 20))]
    hb = header_bottom([]); tot = sum(g for g, _ in c7[1:]) + sum(box_h(b) for _, b in c7)
    top = hb + ((CTA_BOTTOM - hb) - tot) // 2
    placed, _ = stack_down(c7, top)
    notes[7] = top - hb
    specs.append(card(7, BLUE, placed, log=log))
    print("spare/top gaps:", notes)
    (WD / "qc" / "photo-panels-v1.json").write_text(json.dumps({f"c{n}": r for n, r in log if r}, indent=1))
    return specs


def compose(specs):
    for sp in specs:
        r = subprocess.run([PY, str(WD / "compose_v2.py"), str(sp), str(EXP)], capture_output=True, text=True)
        print(r.stdout.strip(), r.stderr.strip())
        if r.returncode:
            sys.exit(r.returncode)


if __name__ == "__main__":
    compose(build())
