#!/usr/bin/env python3
"""Track the bright phone screen in shot 1 and blur it on every frame (BC-21/BC-42: the
model painted fake chat text and an AI-drawn TripNerd logo on the screen; none of it may be
readable). The screen is the largest bright connected region below the top of the frame.

Usage: python3 blur_screen.py <in.mp4> <out.mp4> <seconds> [preview.jpg]
Needs ffmpeg, numpy, Pillow.
"""
import os, subprocess, sys, tempfile
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, dst, secs = sys.argv[1], sys.argv[2], float(sys.argv[3])
prev = sys.argv[4] if len(sys.argv) > 4 else None
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-t', str(secs), '-vf',
                'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1',
                f'{tmp}/f%04d.png'], check=True)
frames = sorted(f for f in os.listdir(tmp) if f.endswith('.png'))
S = 8  # analysis downscale


def largest_bright(a):
    """bbox (x0,y0,x1,y1) in full-res px of the largest bright component, or None."""
    m = a > 185
    h, w = m.shape
    seen = np.zeros_like(m)
    best = (0, None)
    for y in range(h):
        for x in range(w):
            if m[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True
                n, y0, y1, x0, x1 = 0, y, y, x, x
                while q:
                    cy, cx = q.popleft(); n += 1
                    y0, y1, x0, x1 = min(y0, cy), max(y1, cy), min(x0, cx), max(x1, cx)
                    for ny, nx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
                        if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if n > best[0]:
                    best = (n, (x0 * S, y0 * S, (x1 + 1) * S, (y1 + 1) * S))
    return best[1]


boxes = []
for f in frames:
    im = Image.open(f'{tmp}/{f}').convert('L').resize((1080 // S, 1920 // S))
    boxes.append(largest_bright(np.asarray(im)))
# fill misses, then smooth each edge with a 5-frame median (no jitter)
last = next(b for b in boxes if b)
boxes = [last := (b or last) for b in boxes]
arr = np.array(boxes, dtype=float)
sm = np.array([np.median(arr[max(0, i-2):i+3], axis=0) for i in range(len(arr))])
M = 46  # margin so bezel glow and thumbs at the edge are covered too
for i, f in enumerate(frames):
    x0, y0, x1, y1 = sm[i]
    x0, y0 = max(0, int(x0 - M)), max(0, int(y0 - M))
    x1, y1 = min(1080, int(x1 + M)), min(1920, int(y1 + M))
    im = Image.open(f'{tmp}/{f}').convert('RGB')
    region = im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(30))
    region = Image.blend(region, Image.new('RGB', region.size, (205, 214, 222)), 0.25)
    mask = Image.new('L', region.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((12, 12, region.size[0]-12, region.size[1]-12), 60, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(10))
    im.paste(region, (x0, y0), mask)
    im.save(f'{tmp}/{f}')
    if prev and i == len(frames) // 2:
        im.resize((540, 960)).save(prev, quality=80)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{tmp}/f%04d.png',
                '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-pix_fmt', 'yuv420p', dst], check=True)
print('frames', len(frames), 'box range x', int(sm[:, 0].min()), '-', int(sm[:, 2].max()),
      'y', int(sm[:, 1].min()), '-', int(sm[:, 3].max()))
