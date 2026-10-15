"""Blur masks for TripNerd Daytona Reel draft 2.
Draft 2 (owner direction, 15 Oct 2026): no person is blurred. All face masks and the masks that
covered people's clothing (crew firesuits, a hoodie, an official's jacket) are removed; only
third-party logos, signs and screens are masked.
Boxes are given in a reference frame's pixel coordinates (source resolution) and
moved with the camera using the per-frame cumulative shift (phase correlation).
"""
import cv2, numpy as np

D = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/reel/'
SH = {'v5': np.load(D + 'v5_shift.npy'), 'v6': np.load(D + 'v6_shift.npy')}

# (clip, ref_frame, (x0,y0,x1,y1), first_frame, last_frame, kind)
# kind: 'logo' heavy blur, 'sign' heavy blur + desaturate, 'can' light tight blur for small objects
# ('p' prefix = photo kinds, applied at output scale)
BOXES = [
    # ---- V05 world anchored at frame 0 (used in beats 1 and 2) ----
    ('v5', 0, (-20, 375, 350, 485), 0, 125, 'logo'),     # tower lettering
    ('v5', 0, (250, 600, 380, 642), 0, 125, 'logo'),     # painted wall lettering
    ('v5', 0, (135, 680, 290, 770), 0, 125, 'logo'),     # blue pit box logos
    ('v5', 0, (-140, 690, 150, 810), 0, 125, 'logo'),    # black pit box TV screens
    ('v5', 0, (325, 615, 580, 715), 0, 125, 'logo'),     # far pit box signs (McDonald's, RFK, red sign)
    ('v5', 0, (-10, 950, 125, 1035), 0, 125, 'logo'),    # Team Penske banner
    ('v5', 0, (0, 1150, 65, 1225), 0, 125, 'logo'),      # red sign on tyre cart
    ('v5', 0, (427, 1149, 464, 1225), 0, 125, 'can'),    # Coca-Cola can (tight: a loose mask read as a blurred head)
    ('v5', 0, (550, 1020, 605, 1075), 0, 125, 'logo'),   # red scanner
    ('v5', 0, (572, 815, 645, 948), 0, 125, 'logo'),     # Diet Coke can + labelled water bottles on rail
    # ---- V05 objects that enter during the beat 1 pan (anchored at frame 96 / 108) ----
    # yellow Pennzoil/Shell pit box, logo-level masks anchored at frame 96 (beat 1) ...
    ('v5', 96, (-50, 688, 315, 755), 76, 125, 'logo'),   # canopy roundels
    ('v5', 96, (-50, 782, 200, 908), 76, 125, 'logo'),   # panel Shell + Pennzoil roundels
    ('v5', 96, (212, 776, 312, 862), 76, 125, 'logo'),   # screen, right
    ('v5', 96, (-50, 862, 132, 958), 76, 125, 'logo'),   # lower screen + panel lettering
    # ... and the same box during the beat 6 return pan (wider: motion blur)
    ('v5', 96, (-90, 680, 355, 760), 215, 247, 'logo'),
    ('v5', 96, (-90, 775, 240, 915), 215, 247, 'logo'),
    ('v5', 96, (175, 770, 350, 870), 215, 247, 'logo'),
    ('v5', 96, (-90, 855, 260, 970), 215, 247, 'logo'),
    ('v5', 84, (90, 980, 160, 1040), 76, 125, 'logo'),   # red Coca-Cola box
    # ---- V05 beat 6 (frames 204-239) ----
    ('v5', 204, (50, 445, 300, 640), 200, 215, 'sign'),  # Sunoco sign (whip pan exit)
    ('v5', 239, (180, 680, 430, 810), 220, 247, 'logo'), # black pit box screens
    ('v5', 239, (410, 615, 730, 810), 220, 247, 'logo'), # blue pit box logos
    ('v5', 239, (250, 385, 640, 490), 220, 247, 'logo'), # tower lettering
    ('v5', 239, (-200, 690, 40, 900), 220, 247, 'logo'), # signage left of yellow box
    # ---- V06 (beat 3, frames 60-104), full-frame coords anchored at frame 60 ----
    ('v6', 60, (330, 342, 628, 392), 55, 110, 'logo'),   # canopy band (Pennzoil logos)
    ('v6', 60, (366, 428, 522, 578), 55, 110, 'logo'),   # panel logos: Shell, PENNZOIL, AAA, lower row
    ('v6', 60, (536, 422, 616, 485), 55, 110, 'logo'),   # pit box TV screen (broadcast)
    ('v6', 60, (346, 398, 396, 448), 55, 110, 'logo'),   # small screen, left
    ('v6', 60, (530, 565, 580, 605), 55, 110, 'logo'),   # red box with white lettering
    ('v6', 60, (762, 355, 915, 490), 55, 110, 'logo'),   # black pit box screens, right
    ('v6', 60, (380, 98, 900, 134), 55, 110, 'logo'),    # grandstand-top lettering
]


# ---- TripNerd website photos (source pixels, 1024x771); third-party logos only ----
PHOTO_BOXES = {
    'B': [  # tripnerd_gallery_07.jpg, 2023-02-19 16:54
        ((606, 250, 760, 276), 'plogo'),   # Menards canopy lettering
        ((618, 305, 710, 331), 'plogo'),   # Menards lettering on pit box
        ((545, 450, 650, 522), 'plogo'),   # Hendrick Motorsports banner
        ((602, 497, 626, 540), 'pcan'),    # Coca-Cola can + green soda can (tight)
        ((848, 502, 873, 539), 'pcan'),    # Coca-Cola can, right (tight: a loose mask read as a blurred face)
        ((772, 285, 803, 298), 'pcan'),    # 'LEGACY' team lettering (letters only, not the wearer)
    ],
    'A': [  # tripnerd_gallery_05.jpg, 2023-02-19 18:56
        ((188, 172, 312, 270), 'psign'),   # Sunoco sign + arrow (outside the x 350 crop; kept as a guard)
        ((428, 500, 448, 522), 'plogo'),   # emblem on a guest's cap
        ((527, 586, 581, 603), 'pcan'),    # lettering on pit-road cart
        ((488, 735, 545, 771), 'plogo'),   # retailer lettering on a bag
    ],
}


def boxes_for(clip, f, W, H):
    out = []
    sh = SH[clip]
    for c, ref, (x0, y0, x1, y1), a, b, kind in BOXES:
        if c != clip or not (a <= f <= b):
            continue
        dx, dy = sh[f] - sh[ref]
        bx = (int(round(x0 + dx)), int(round(y0 + dy)), int(round(x1 + dx)), int(round(y1 + dy)))
        if bx[2] <= 0 or bx[0] >= W or bx[3] <= 0 or bx[1] >= H:
            continue
        out.append((bx, kind))
    return out


def apply(img, boxes, feather=10):
    H, W = img.shape[:2]
    out = img.copy()
    for (x0, y0, x1, y1), kind in boxes:
        x0c, y0c, x1c, y1c = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
        if x1c - x0c < 2 or y1c - y0c < 2:
            continue
        pad = 40
        X0, Y0, X1, Y1 = max(0, x0c - pad), max(0, y0c - pad), min(W, x1c + pad), min(H, y1c + pad)
        region = out[Y0:Y1, X0:X1]
        sigma = {'logo': 13, 'sign': 30, 'can': 5, 'plogo': 16, 'psign': 34, 'pcan': 6}[kind]
        fth = {'can': 3, 'pcan': 5}.get(kind, feather)
        bl = cv2.GaussianBlur(region, (0, 0), sigma)
        bl = cv2.GaussianBlur(bl, (0, 0), sigma)
        if kind in ('sign', 'psign'):
            g = cv2.cvtColor(bl, cv2.COLOR_BGR2GRAY)
            g = cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)
            bl = cv2.addWeighted(bl, 0.35, g, 0.65, 0)
        m = np.zeros(region.shape[:2], np.float32)
        m[y0c - Y0:y1c - Y0, x0c - X0:x1c - X0] = 1.0
        m = cv2.GaussianBlur(m, (0, 0), fth)
        m = np.clip(m * 1.6, 0, 1)[..., None]
        out[Y0:Y1, X0:X1] = (bl * m + region * (1 - m)).astype(np.uint8)
    return out


def masked(clip, frames, f):
    img = frames[f]
    H, W = img.shape[:2]
    return apply(img, boxes_for(clip, f, W, H))


def debug(clip, frames, f):
    img = frames[f].copy()
    H, W = img.shape[:2]
    for (x0, y0, x1, y1), kind in boxes_for(clip, f, W, H):
        col = (0, 0, 255) if kind == 'face' else (255, 0, 255) if kind == 'sign' else (0, 255, 255)
        cv2.rectangle(img, (x0, y0), (x1, y1), col, 2)
    cv2.putText(img, f'{clip} f{f}', (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0, 0, 255), 3)
    return img
