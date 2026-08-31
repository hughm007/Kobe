#!/usr/bin/env python3
"""
visual-density.py — turn "more visually appealing" into numbers.

Measures a rendered frame directory (or two, for a before/after delta) on the axes the
Rev-3 craft review actually raised:

  coverage  share of pixels that are not the paper ground        (emptiness)
  chroma    mean per-pixel (max-min) across RGB, 0-255           (colour presence)
  accent    share of pixels close to the brand accent            (colour AS EVENT)
  motion    mean abs frame-to-frame delta, sampled               (life)

Reported film-wide and per beat, because the failure is not uniform: the delivered
Rev 3 master averages 15.3% coverage but only 5.4% across the hook.

Usage:
  visual-density.py FRAMES_DIR [--label NAME]
  visual-density.py BEFORE_DIR AFTER_DIR      # delta mode
"""
import sys, glob, argparse
import numpy as np
from PIL import Image

GROUND = np.array([0xF7, 0xF5, 0xF0], dtype=np.int16)
ACCENT = np.array([0x1B, 0x5F, 0xA8], dtype=np.int16)
FPS = 30.0
STEP = 20          # sample every Nth frame
SUB = 4            # spatial subsample; 1920x1080 -> 480x270
BEATS = [(0.0, 7.5, 'B1 hook'), (7.5, 15.0, 'B2'), (15.0, 22.5, 'B3'),
         (22.5, 30.0, 'B4'), (30.0, 37.5, 'B5'), (37.5, 45.0, 'B6'),
         (45.0, 52.5, 'B7'), (52.5, 60.0, 'B8/endcard')]


def measure(dirpath):
    files = sorted(glob.glob(f'{dirpath}/*.png'))
    if not files:
        sys.exit(f'no frames in {dirpath}')
    rows, prev, motions = [], None, {}
    for f in files[::STEP]:
        a = np.asarray(Image.open(f).convert('RGB'), dtype=np.int16)[::SUB, ::SUB]
        cov = float((np.abs(a - GROUND).max(axis=2) > 12).mean())
        chroma = float((a.max(axis=2) - a.min(axis=2)).mean())
        acc = float((np.abs(a - ACCENT).max(axis=2) < 60).mean())
        idx = int(f.split('/')[-1].split('.')[0])
        rows.append((idx / FPS, cov, chroma, acc))
        if prev is not None:
            motions[idx / FPS] = float(np.abs(a - prev).mean())
        prev = a
    # hook motion needs consecutive frames, not the sparse sample
    hook = [np.asarray(Image.open(f).convert('RGB'), dtype=np.int16)[::SUB, ::SUB]
            for f in files[:37]]
    hook_motion = float(np.mean([np.abs(hook[i + 1] - hook[i]).mean()
                                 for i in range(len(hook) - 1)])) if len(hook) > 1 else 0.0
    return rows, motions, hook_motion


def summarize(rows, motions, hook_motion, label):
    cov = np.mean([r[1] for r in rows]); chroma = np.mean([r[2] for r in rows])
    acc = np.mean([r[3] for r in rows]); mot = np.mean(list(motions.values())) if motions else 0.0
    print(f'\n=== {label} ===')
    print(f'  coverage     {100*cov:6.2f} %')
    print(f'  chroma       {chroma:6.2f} / 255')
    print(f'  accent px    {100*acc:6.2f} %')
    print(f'  motion       {mot:6.2f}')
    print(f'  hook motion  {hook_motion:6.2f}   (first 1.2s, consecutive frames)')
    print(f'  {"beat":<12} {"cover%":>8} {"chroma":>8} {"accent%":>8}')
    per = {}
    for lo, hi, name in BEATS:
        v = [r for r in rows if lo <= r[0] < hi]
        if not v:
            continue
        c, ch, ac = (100*np.mean([x[1] for x in v]), np.mean([x[2] for x in v]),
                     100*np.mean([x[3] for x in v]))
        per[name] = (c, ch, ac)
        flag = '  <-- emptiest' if c < 8 else ''
        print(f'  {name:<12} {c:8.2f} {ch:8.2f} {ac:8.2f}{flag}')
    return {'coverage': 100*cov, 'chroma': chroma, 'accent': 100*acc,
            'motion': mot, 'hook': hook_motion, 'per': per}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dirs', nargs='+')
    ap.add_argument('--label', default=None)
    a = ap.parse_args()
    if len(a.dirs) == 1:
        summarize(*measure(a.dirs[0]), a.label or a.dirs[0])
    else:
        before = summarize(*measure(a.dirs[0]), f'BEFORE {a.dirs[0]}')
        after = summarize(*measure(a.dirs[1]), f'AFTER  {a.dirs[1]}')
        print('\n=== DELTA ===')
        for k in ('coverage', 'chroma', 'accent', 'motion', 'hook'):
            d = after[k] - before[k]
            print(f'  {k:<12} {before[k]:8.2f} -> {after[k]:8.2f}   {d:+8.2f}')
        print(f'\n  {"beat":<12} {"cover%":>18} {"chroma":>16}')
        for name in before['per']:
            if name in after['per']:
                b, f_ = before['per'][name], after['per'][name]
                print(f'  {name:<12} {b[0]:7.2f} -> {f_[0]:7.2f}   {f_[0]-b[0]:+6.2f}'
                      f'   {b[1]:6.2f} -> {f_[1]:6.2f}  {f_[1]-b[1]:+6.2f}')


if __name__ == '__main__':
    main()
