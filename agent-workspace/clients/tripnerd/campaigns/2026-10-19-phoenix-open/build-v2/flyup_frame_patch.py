# Hand-placed logo patches for stills: each box is filled with the wall's own colour,
# graded top-to-bottom from the pixels just above and below the box (no blur, no AI).
import numpy as np, sys
from PIL import Image
H = '../../handoff_in/higgsfield_handoff/'
BOXES = {
 'START_crowd': [(14,1050,56,1084),(96,1060,188,1086),(226,1052,300,1088),(333,1052,362,1086),(390,1058,472,1084),(488,1050,552,1086),(573,1052,602,1084),(618,1056,697,1082),(703,1048,757,1082),(778,1050,807,1080),(813,1052,882,1078),(883,1046,932,1076)],
 'END_suite_rail': [(0,980,36,1006),(76,982,104,1012),(138,992,208,1014),(242,986,302,1018),(332,984,358,1012),(378,992,442,1014),(465,986,512,1018)],
 'ALT_END_P08_rail': [(92,183,148,207),(328,226,383,246),(466,206,508,228),(582,192,608,220),(677,182,718,199),(866,122,917,142),(955,38,1005,64),(790,40,840,64)],
}
def fill(a, box, pct=70):
    x0, y0, x1, y1 = box; r = 3
    q = lambda p: np.percentile(p.reshape(-1, 3), pct, 0)   # upper wall tone; borders often catch dark seams
    top = q(a[y0 - r:y0, x0:x1]); bot = q(a[y1:y1 + r, x0:x1])
    left = q(a[y0:y1, max(0, x0 - r):max(r, x0)]); right = q(a[y0:y1, x1:x1 + r])
    h, w = y1 - y0, x1 - x0
    v = top[None, None] + (bot - top)[None, None] * np.linspace(0, 1, h)[:, None, None]
    hz = left[None, None] + (right - left)[None, None] * np.linspace(0, 1, w)[None, :, None]
    a[y0:y1, x0:x1] = (0.5 * v + 0.5 * hz)
for n, boxes in BOXES.items():
    a = np.asarray(Image.open(H + n + '.png').convert('RGB')).astype(np.float32).copy()
    for b in boxes: fill(a, b, 92 if n.startswith('ALT') else 70)
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(f'{n}_clean.png')
