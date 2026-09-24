# Tracked replacement of a misspelt garment wordmark with the real logo file.
# Ran in the Higgsfield sandbox (python3 + opencv-python-headless + Pillow) on 2026-09-24
# for the TripNerd 20 s hosting spot, shot 8.0-10.0 s (60 frames at 30 fps).
# Inputs: polo/f%03d.png (frames exported with ffmpeg), logo.png (official colour logo, media 46ae277a).
# Output: polo_out6/f%03d.png, polo_track.json, polo_fix_qc5.jpg (before/after zoom of five frames).
# Then: ffmpeg -framerate 30 -i polo_out6/f%03d.png ... seg6.mp4, overlaid with -itsoffset 8.0 and
# enable='between(t,8.0,9.99)' on the source before the end-card swap (see endcard_swap.sh).
# Tune per shot: the text bbox on frame 1 (x, y, w, h), the wordmark height wh, the fabric HSV gate.
import cv2, numpy as np, glob, json, os
from PIL import Image
frames = sorted(glob.glob('/home/user/tn20/polo/f*.png')); out_dir = '/home/user/tn20/polo_out6/'; os.makedirs(out_dir, exist_ok=True)
f0 = cv2.imread(frames[0])
# 1. the misspelt text on frame 1 (polo is navy, text is light) — measured by hand on a 4x zoom
x, y, w, h = 676, 568, 52, 16
pad = 6; tx, ty, tw, th = x-pad, y-pad, w+2*pad, h+2*pad
tmpl = cv2.cvtColor(f0[ty:ty+th, tx:tx+tw], cv2.COLOR_BGR2GRAY)
# 2. wordmark from the real logo: white pixels right of the character, upper block
logo = Image.open('/home/user/tn20/logo.png').convert('RGBA'); la = np.array(logo)
wm_mask = (la[:,:,3] > 128) & (la[:,:,0] > 200) & (la[:,:,1] > 200) & (la[:,:,2] > 200)
wm_mask[:, :560] = False; wm_mask[360:, :] = False
wys, wxs = np.where(wm_mask); wbox = (wxs.min(), wys.min(), wxs.max()+1, wys.max()+1)
wm = logo.crop(wbox)
# 3. track the text (template match in a +-70 px window; hold the last velocity if the score drops)
pos = []; px, py = tx, ty; dx = dy = 0
for i, fp in enumerate(frames):
    fr = cv2.imread(fp); g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    sx0, sy0 = max(0, px+dx-70), max(0, py+dy-70); sx1, sy1 = min(g.shape[1], px+dx+tw+70), min(g.shape[0], py+dy+th+70)
    res = cv2.matchTemplate(g[sy0:sy1, sx0:sx1], tmpl, cv2.TM_CCOEFF_NORMED); _, mx, _, ml = cv2.minMaxLoc(res)
    nx, ny = sx0+ml[0], sy0+ml[1]
    if mx < 0.45: nx, ny = px+dx, py+dy
    dx, dy = nx-px, ny-py; px, py = nx, ny; pos.append((i, int(px), int(py), float(mx)))
arr = np.array([[p[1], p[2]] for p in pos], dtype=float); k = 5; sm = np.copy(arr)
for i in range(len(arr)):
    a, b = max(0, i-k//2), min(len(arr), i+k//2+1); sm[i] = arr[a:b].mean(axis=0)
print('track scores min/mean', min(p[3] for p in pos), sum(p[3] for p in pos)/len(pos))
# 4. composite
gains = []
for i, fp in enumerate(frames):
    fr = cv2.imread(fp); X, Y = int(round(sm[i][0])), int(round(sm[i][1]))
    patch = fr[Y:Y+th, X:X+tw].astype(np.float32)
    ring = np.concatenate([fr[Y-6:Y, X-6:X+tw+6].reshape(-1,3), fr[Y+th:Y+th+6, X-6:X+tw+6].reshape(-1,3), fr[Y:Y+th, X-6:X].reshape(-1,3), fr[Y:Y+th, X+tw:X+tw+6].reshape(-1,3)]).astype(np.float32)
    col = np.median(ring, axis=0)
    # fill only the bright text pixels with the fabric colour, soft-edged, so the cloth texture stays
    hsvp = cv2.cvtColor(patch.astype(np.uint8), cv2.COLOR_BGR2HSV); tm = ((hsvp[:,:,2] > 110) & (hsvp[:,:,1] < 120)).astype(np.float32)
    tm = cv2.dilate(tm, np.ones((3,3), np.uint8)); tm = cv2.GaussianBlur(tm, (0,0), 1.2); tm = np.clip(tm*1.4, 0, 1)[..., None]
    fr[Y:Y+th, X:X+tw] = (patch*(1-tm) + col*tm).astype(np.uint8)
    # the real wordmark, sized by height (a wide lockup at the old text's width is too small to read)
    wh = 9; ww = int(round(wm.width * wh / wm.height)); wmr = wm.resize((ww, wh), Image.LANCZOS); wa = np.array(wmr).astype(np.float32)
    ox, oy = X+pad + (w-ww)//2, Y+pad + (h-wh)//2
    alpha = np.clip(cv2.GaussianBlur(wa[:,:,3]/255.0, (0,0), 0.6)*1.15, 0, 1)
    # paint on navy fabric only: hair, skin and buttons never take the mark
    roi0 = fr[oy:oy+wh, ox:ox+ww]; hsvr = cv2.cvtColor(roi0, cv2.COLOR_BGR2HSV)
    fab = ((hsvr[:,:,2] < 120) & (hsvr[:,:,0] > 95) & (hsvr[:,:,0] < 135)).astype(np.float32)
    alpha = (alpha * cv2.GaussianBlur(fab, (0,0), 1.0))[..., None]
    rgb = cv2.cvtColor(wa[:,:,:3].astype(np.uint8), cv2.COLOR_RGB2BGR).astype(np.float32)
    rgb = rgb*0.96 + col*0.04
    # brightness match against the original stitching (brightest 120 px each side, one pass)
    g0 = cv2.cvtColor(patch.astype(np.uint8), cv2.COLOR_BGR2GRAY); L0 = float(np.sort(g0.flatten())[-120:].mean())
    roi = fr[oy:oy+wh, ox:ox+ww].astype(np.float32)
    comp = roi*(1-alpha) + rgb*alpha
    g1 = cv2.cvtColor(np.clip(comp,0,255).astype(np.uint8), cv2.COLOR_BGR2GRAY); L1 = float(np.sort(g1.flatten())[-120:].mean())
    gain = float(np.clip(L0 / max(L1, 1.0), 0.8, 1.35)); gains.append(gain)
    # 1 px relief shadow under the strokes so the mark sits like stitching
    sh = np.zeros_like(alpha); sh[1:] = alpha[:-1]; sh = sh*(1-alpha)*0.45
    roi = roi*(1-sh) + (col*0.55)*sh
    fr[oy:oy+wh, ox:ox+ww] = np.clip(roi*(1-alpha) + np.clip(rgb*gain, 0, 255)*alpha, 0, 255).astype(np.uint8)
    cv2.imwrite(out_dir + os.path.basename(fp), fr)
print('gain min/mean/max', round(min(gains),3), round(sum(gains)/len(gains),3), round(max(gains),3))
json.dump({'pos': [[int(a),int(b),int(c),float(d)] for a,b,c,d in pos], 'tmpl': [int(tx), int(ty), int(tw), int(th)], 'text': [int(x), int(y), int(w), int(h)]}, open('/home/user/tn20/polo_track.json', 'w'))
# QC: before/after zoom of five frames
sheet = Image.new('RGB', (5*360, 2*220), (255,255,255))
for j, i in enumerate([0, 15, 30, 45, 59]):
    X, Y = int(round(sm[i][0])), int(round(sm[i][1]))
    for row, d in enumerate(['/home/user/tn20/polo/', out_dir]):
        im = Image.open(d + os.path.basename(frames[i])).crop((X-60, Y-50, X+tw+60, Y+th+50)).resize((360, 220), Image.LANCZOS); sheet.paste(im, (j*360, row*220))
sheet.save('/home/user/tn20/polo_fix_qc5.jpg', quality=90)
