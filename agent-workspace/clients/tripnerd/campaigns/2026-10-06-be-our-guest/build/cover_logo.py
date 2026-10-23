#!/usr/bin/env python3
"""Shot 1 logo clearance: the suite door placard reads "THE PLAYERS | TRIPNERD". TripNerd's rule
bans event logos, so on every frame we find the placard (largest wide, saturated-blue component)
and paint its left part — the event logo and divider — with the placard's own blue, leaving
"TRIPNERD". No generative AI; a flat colour fill.

Usage: python3 cover_logo.py <in.mp4> <out.mp4> <t_in> <t_out> [preview.jpg]
"""
import colorsys, os, subprocess, sys, tempfile
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

src, dst, t_in, t_out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
prev = sys.argv[5] if len(sys.argv) > 5 else None
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t_in), '-to', str(t_out), '-i', src,
                f'{tmp}/f%04d.png'], check=True)
frames = sorted(x for x in os.listdir(tmp) if x.endswith('.png'))
S = 4
COVER = 0.36   # left share of the placard holding the event logo + divider


def placard(rgb):
    a = rgb.astype(np.float32) / 255.0
    mx, mn = a.max(2), a.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    blue = (a[..., 2] > a[..., 0] + 0.15) & (a[..., 2] > a[..., 1] + 0.02) & (sat > 0.35) & (mx > 0.35)
    h, w = blue.shape
    seen = np.zeros_like(blue)
    best = None
    for y in range(h):
        for x in range(w):
            if blue[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True
                n, y0, y1, x0, x1 = 0, y, y, x, x
                while q:
                    cy, cx = q.popleft(); n += 1
                    y0, y1, x0, x1 = min(y0, cy), max(y1, cy), min(x0, cx), max(x1, cx)
                    for ny, nx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
                        if 0 <= ny < h and 0 <= nx < w and blue[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                bw, bh = x1 - x0 + 1, y1 - y0 + 1
                if bw >= 2.6 * bh and n > 20 and (best is None or n > best[0]):
                    best = (n, (x0, y0, x1 + 1, y1 + 1))
    return None if best is None else tuple(v * S for v in best[1])


boxes = []
for f in frames:
    im = Image.open(f'{tmp}/{f}').convert('RGB')
    small = np.asarray(im.resize((im.width // S, im.height // S)))
    boxes.append(placard(small))
found = [b for b in boxes if b]
if not found:
    sys.exit('placard not found')
last = found[0]
boxes = [last := (b or last) for b in boxes]
arr = np.array(boxes, dtype=float)
sm = np.array([np.median(arr[max(0, i-2):i+3], axis=0) for i in range(len(arr))])
for i, f in enumerate(frames):
    im = Image.open(f'{tmp}/{f}').convert('RGB')
    x0, y0, x1, y1 = sm[i]
    pad = 3
    x0, y0, y1 = int(x0) - pad, int(y0) - pad, int(y1) + pad
    xc = int(x0 + COVER * (x1 - x0))
    px = np.asarray(im)[max(0, y0+6):max(1, y1-6), max(0, xc):max(1, int(x1)-6)].reshape(-1, 3)
    if len(px):
        keep = px[(px[:, 2].astype(int) - px[:, 0]) > 40]          # blue pixels only, not the white text
        col = tuple(int(v) for v in np.median(keep if len(keep) else px, axis=0))
    else:
        col = (45, 110, 180)
    patch = Image.new('RGB', (max(1, xc - x0), max(1, y1 - y0)), col)
    mask = Image.new('L', patch.size, 255).filter(ImageFilter.GaussianBlur(1))
    im.paste(patch, (max(0, x0), max(0, y0)), mask)
    im.save(f'{tmp}/{f}')
    if prev and i == int(len(frames) * 0.85):
        im.resize((im.width // 2, im.height // 2)).save(prev, quality=80)
fps = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate',
                      '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', fps, '-i', f'{tmp}/f%04d.png',
                '-ss', str(t_in), '-to', str(t_out), '-i', src, '-map', '0:v', '-map', '1:a?',
                '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', dst], check=True)
print('frames', len(frames), 'placard found in', len(found), 'x', int(sm[:, 0].min()), '-', int(sm[:, 2].max()))
