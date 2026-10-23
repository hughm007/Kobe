#!/usr/bin/env python3
# A4 end shot: the owner's clip A (4k, flag cleaned: clip/A4k_clean3.mp4) reframed to 9:16 so the frame follows the
# flagstick and the ball and settles centred on the cup as the ball arrives (source 2.33-2.42 s is its closest approach).
# The window centre is the stick, pulled a third of the way toward the ball while the ball is rolling in, Gaussian-smoothed
# over the whole move (offline, so no lag). It eases in from 1.0x to 1.4x so the cup ends near 75 % of frame height, clear
# of the Reels caption zone, without pushing the 4k source past the softness of the real phone footage elsewhere in the cut.
# Writes out/endclip.mp4 (1080x1920, 24 fps, source 0..LAST s) and out/endclip.json (per-frame window).
# Usage: python3 endclip.py clip/A4k_clean3.mp4 clip/track.json [last_s]
import sys, json, subprocess, numpy as np, cv2
SRC, TRK = sys.argv[1], sys.argv[2]; LAST = float(sys.argv[3]) if len(sys.argv) > 3 else 3.08
W, H, OW, OH, FPS = 3840, 2160, 1080, 1920, 24
N = int(round(LAST*FPS)); OUT_S = 2.62                       # the cut to the end card happens at source 2.62 s
tr = {o['n']: o for o in json.load(open(TRK))}
def series(key, lo, hi, n0):
    v = np.array([tr[n][key] if (n in tr and tr[n][key] is not None and lo < tr[n][key] < hi) else np.nan for n in range(N)], float)
    v[:n0] = np.nan; idx = np.where(~np.isnan(v))[0]
    return np.interp(np.arange(N), idx, v[idx])
pole = series('pole', 1500, 2600, 10)                        # the stick is in view from frame 10 (0.42 s); held before that
base = series('base', 1300, 2160, 12)
bx = np.array([tr[n]['ball'][0] if (n in tr and tr[n]['ball'] and n >= 32 and abs(tr[n]['ball'][0]-pole[n]) < 400) else np.nan for n in range(N)])
w = np.clip((57 - np.arange(N))/25, 0, 1)*0.33                 # ball pull fades out by the closest approach (frame 57)
cx = np.where(np.isnan(bx), pole, pole + w*(np.nan_to_num(bx) - pole))
def smooth(v, s):
    k = np.exp(-0.5*(np.arange(-3*s, 3*s+1)/s)**2); k /= k.sum(); p = np.pad(v, 3*s, mode='edge'); return np.convolve(p, k, 'valid')
cx = smooth(cx, 5); base = smooth(base, 5)
u = np.clip(np.arange(N)/(OUT_S*FPS), 0, 1); z = 1.0 + 0.4*(u*u*(3 - 2*u))      # smoothstep 1.0 -> 1.4 by the cut
cw, ch = 1215.0/z, 2160.0/z
x0 = np.clip(cx - cw/2, 0, W - cw); y0 = np.clip(base - 0.75*ch, 0, H - ch)
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-frames:v', str(N), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, bufsize=10**8)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (OW, OH), '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', 'out/endclip.mp4'], stdin=subprocess.PIPE)
log = []
for n in range(N):
    b = dec.stdout.read(W*H*3)
    if len(b) < W*H*3: break
    f = np.frombuffer(b, np.uint8).reshape(H, W, 3); s = OW/cw[n]
    M = np.float32([[s, 0, -x0[n]*s], [0, s, -y0[n]*s]])
    enc.stdin.write(cv2.warpAffine(f, M, (OW, OH), flags=cv2.INTER_LANCZOS4).tobytes())
    log.append(dict(n=n, t=round(n/FPS, 3), x0=round(float(x0[n]), 1), y0=round(float(y0[n]), 1), cw=round(float(cw[n]), 1), z=round(float(z[n]), 3),
                    cup_x=round(float((pole[n]-x0[n])/cw[n]), 3), cup_y=round(float((base[n]-y0[n])/ch[n]), 3)))
enc.stdin.close(); enc.wait(); json.dump(log, open('out/endclip.json', 'w'))
for o in log[::6] + [log[int(OUT_S*FPS)]]: print(o)
