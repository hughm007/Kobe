# remove leftover logo specks inside the painted wall rows: pixels far from their row's median take the median
import numpy as np
def despeck(f, top, bot, thr=18):
    f = f.astype(np.int16).copy(); seg = f[top:bot]; med = np.median(seg, 1, keepdims=True)
    dev = np.abs(seg - med).max(2) > thr
    bright = (seg.mean(2) > 150) & ((seg.max(2) - seg.min(2)) < 40)   # keep bright foreground (flag, pillars)
    m = dev & ~bright
    seg[m] = np.broadcast_to(med, seg.shape)[m]; f[top:bot] = seg
    return f.clip(0, 255).astype(np.uint8)
