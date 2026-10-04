"""Remove non-TripNerd marks from the Augusta photos (conventional retouch, no AI).
heal = diffusion fill from the surrounding pixels (small logos on clothes/shoes/devices).
blur = feathered Gaussian blur (labels, cards, name tag, watch dial)."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

MARKS = {
 "IMG_2004.JPG": [  # group on the lawn
  ("clone", (1192,1102,1228,1130)), # Ole Miss logo, polo (right)
  ("clone", (808,1134,828,1156)),   # Polo pony (centre-right man)
  ("blur", (630,1299,660,1319), 4), # bag patch imprint
  ("heal", (362,1682,382,1712)), ("heal", (380,1655,402,1670)),  # New Balance, man 2 left shoe
  ("heal", (484,1648,514,1694)),    # New Balance, man 2 right shoe
  ("heal", (881,1703,899,1723)), ("heal", (869,1676,884,1690)),  # On logo, man 4 shoe
  ("heal", (1198,1750,1242,1782)), ("heal", (1311,1773,1331,1791)), ("heal", (1326,1810,1348,1838)),  # New Balance, right man
 ],
 "IMG_1901.JPG": [  # check-in table
  ("blur", (750,1295,825,1390), 7), # Purell label
  ("blur", (503,1058,534,1138), 6), # drink can on the sill
  ("clone", (442,1170,460,1188)),   # jacket logo
  ("blur", (395,1366,492,1412), 6), # event program card
  ("heal", (918,1231,944,1262)),    # Apple logo
  ("blur", (662,1108,722,1142), 5), # packaging on the sill
  ("blur", (704,1290,748,1312), 3), # venue name printed on the cup
  ("heal", (621,1108,638,1125)),    # belt-bag logo on the sill
 ],
 "IMG_1933.JPG": [  # bar, 9:15
  ("blur", (738,1150,1040,1262), 8), ("blur", (738,1258,776,1316), 8),  # wine labels (body labels only; neck foils unreadable)
  ("blur", (570,1200,745,1330), 5), # small bottles behind the bar
  ("blur", (155,1245,205,1352), 6), ("blur", (52,1225,138,1402), 7), ("blur", (238,1316,288,1372), 6),  # spirits, sports drink, red-label bottle
  ("blur", (320,1267,384,1291), 5), # bartender's name tag
  ("heal", (198,1294,214,1312)),    # bartender shirt logo
  ("clone", (1244,1080,1278,1130)), # polo logo
  ("blur", (1258,1360,1318,1416), 4), # watch dial
 ],
 "IMG_1995.JPG": [("blur", (504,1296,552,1324), 4)],  # bag patch imprint
 "IMG_1998.JPG": [("blur", (695,642,768,725), 5)],    # venue card on the stand
}

def _mask(w, h, inset, feather):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((inset, inset, w-1-inset, h-1-inset), radius=max(2, min(w, h)//4), fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather))

def _heal(im, box, pad=8, iters=600, seed=0):
    x0,y0,x1,y1 = box; X0,Y0,X1,Y1 = x0-pad, y0-pad, x1+pad, y1+pad
    a = np.asarray(im.crop((X0,Y0,X1,Y1))).astype(np.float32)
    hole = np.zeros(a.shape[:2], bool); hole[pad:-pad, pad:-pad] = True
    f = a.copy(); f[hole] = a[~hole].mean(0)
    for _ in range(iters):
        avg = (np.roll(f,1,0)+np.roll(f,-1,0)+np.roll(f,1,1)+np.roll(f,-1,1))/4
        f[hole] = avg[hole]
    ring = a[~hole]; g = np.random.default_rng(seed).normal(0, 1, a.shape[:2])[..., None]
    f[hole] += (g * min(1.5, float(ring.std(0).mean())*0.1))[hole]   # light grain so the patch isn't plastic
    patch = Image.fromarray(np.clip(f, 0, 255).astype(np.uint8))
    im.paste(patch, (X0, Y0), _mask(X1-X0, Y1-Y0, pad//2, 2))

def _blur(im, box, r):
    x0,y0,x1,y1 = box; pad = max(10, min(x1-x0, y1-y0)//4)       # wider, softer edge on big regions
    X0,Y0,X1,Y1 = x0-pad, y0-pad, x1+pad, y1+pad
    region = im.crop((X0,Y0,X1,Y1)).filter(ImageFilter.GaussianBlur(r))
    im.paste(region, (X0, Y0), _mask(X1-X0, Y1-Y0, pad//2, max(3, pad//3)))

def _clone(im, box, pad=6):
    """Copy a same-fabric patch from beside the mark; offset chosen so the border ring matches (keeps stripes aligned)."""
    x0,y0,x1,y1 = box; X0,Y0,X1,Y1 = x0-pad, y0-pad, x1+pad, y1+pad
    A = np.asarray(im).astype(np.float32); w, h = X1-X0, Y1-Y0
    tgt = A[Y0:Y1, X0:X1]; ring = np.ones((h, w), bool); ring[pad:-pad, pad:-pad] = False
    best = None
    for dx in list(range(-90, -w+1, 2)) + list(range(w, 91, 2)):
        for dy in range(-12, 13):
            src = A[Y0+dy:Y1+dy, X0+dx:X1+dx]
            if src.shape != tgt.shape: continue
            e = float(((src - tgt)[ring] ** 2).mean())
            if best is None or e < best[0]: best = (e, dx, dy)
    _, dx, dy = best
    patch = im.crop((X0+dx, Y0+dy, X1+dx, Y1+dy))
    im.paste(patch, (X0, Y0), _mask(w, h, pad//2, 2))
    return dx, dy

def scrub(name, im):
    im = im.copy()
    for i, m in enumerate(MARKS.get(name, [])):
        if m[0] == "heal": _heal(im, m[1], seed=i)
        elif m[0] == "clone": _clone(im, m[1])
        else: _blur(im, m[1], m[2])
    return im
