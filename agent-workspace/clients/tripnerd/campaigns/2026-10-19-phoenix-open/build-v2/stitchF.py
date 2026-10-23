# Phoenix one-shot, final: REAL V03 2.47 s -> its last frame (8.14 s), untouched apart from the standing wall-logo cover,
# then the Veo pull-back that was generated FROM that last frame, retimed into 2.0 s (eased: starts at the real shot's pace,
# speeds through the reveal, settles on the hold). The two invented lettered boards in the AI part are covered with the
# wall's own colour, tracked per frame.  python3 stitchF.py <out_silent.mp4>
import subprocess, sys, json, numpy as np, cv2
sys.path.insert(0, 'real')
import render2 as r, despeck
FF = r.FF; W, H = r.W, r.H

# board keyframes (seconds in the AI clip -> x0, y0, x1, y1), read off gridded full-size frames
KEYS = {'left':  [(2.5, (0, 950, 220, 1040)), (3.5, (0, 1062, 268, 1145)), (4.5, (0, 1142, 284, 1226)), (5.95, (0, 1204, 284, 1288))],
        'right': [(2.5, (1012, 862, 1080, 982)), (3.5, (974, 988, 1080, 1088)), (4.5, (958, 1066, 1080, 1178)), (5.95, (952, 1130, 1080, 1240))]}

def key_box(keys, t):
    ts = [k[0] for k in keys]; B = np.array([k[1] for k in keys], float)
    if t <= ts[0]:  # extrapolate backwards along the first segment (the boards slide in from the frame edge)
        a = (t - ts[0]) / (ts[1] - ts[0]); return B[0] + a * (B[1] - B[0])
    return np.array([np.interp(t, ts, B[:, j]) for j in range(4)])

def cover_boards(f, t):
    f = f.copy()
    for side, keys in KEYS.items():
        x0, y0, x1, y1 = key_box(keys, t); pad = 40
        X0, Y0, X1, Y1 = int(max(0, x0 - pad)), int(max(0, y0 - pad)), int(min(W, x1 + pad)), int(min(H, y1 + pad))
        if X1 - X0 < 10 or Y1 - Y0 < 10 or Y0 >= H: continue
        roi = f[Y0:Y1, X0:X1].astype(int); rr, gg, bb = roi[..., 0], roi[..., 1], roi[..., 2]
        navy = ((bb > rr + 18) & (roi.max(2) < 125)).astype(np.uint8)
        navy = cv2.morphologyEx(navy, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(navy)
        if n <= 1: continue
        k = 1 + int(np.argmax(st[1:, 4]))
        if st[k, 4] < 250: continue
        bx, by, bw, bh = st[k, :4]; bx0, by0 = X0 + bx - 5, Y0 + by - 5; bx1, by1 = X0 + bx + bw + 5, Y0 + by + bh + 5
        bx0, by0, bx1, by1 = max(0, bx0), max(0, by0), min(W, bx1), min(H, by1)
        # wall colour from the same rows just beside the board (right of the left board, left of the right board)
        if side == 'left': smp = f[by0:by1, min(W - 1, bx1 + 4):min(W, bx1 + 40)]
        else: smp = f[by0:by1, max(0, bx0 - 40):max(1, bx0 - 4)]
        if smp.size == 0: continue
        col = np.median(smp.astype(np.float32), 1)                      # per-row wall colour
        f[by0:by1, bx0:bx1] = np.repeat(col[:, None, :], bx1 - bx0, 1).clip(0, 255).astype(np.uint8)
    return f

def build(out):
    # real part: 2.47 s to the clip's end (8.14 s); same cover + despeck as every other real shot
    R = r.read('V03', 2.47, 171) if False else None
    raw = subprocess.run([FF, '-v', 'error', '-ss', '2.47', '-i', r.SRC['V03'], '-vf', 'scale=1080:1920:flags=lanczos,unsharp=5:5:0.5,fps=30',
                          '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    R = list(np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3))
    R, band = r.paint_out(R, 100, 950, 3)
    R = [despeck.despeck(f, int(t) - 3, int(b) + 4) for f, (t, b) in zip(R, band)]
    A = np.load('final/ai.npy')                                          # 144 frames @24, 6.0 s, starts on V03's last frame
    n = 60; u = np.linspace(0, 1, n)
    ease = 3 * u ** 2 - 2 * u ** 3                                       # smoothstep: real-pace start, fast middle, gentle stop
    src = ease * (len(A) - 1)
    hook = []
    for s in src:
        i = int(np.floor(s)); t = s - i
        fr = A[i] if t < 0.05 or i >= len(A) - 1 else r.interp(A[i], A[i + 1], t)
        hook.append(cover_boards(fr, s / 24))
    # 4-frame dissolve from the real last frame into the AI start (hides the small colour/compression shift)
    for k in range(4):
        a = (k + 1) / 5; hook[k] = (R[-1].astype(np.float32) * (1 - a) + hook[k].astype(np.float32) * a).astype(np.uint8)
    seq = R + hook[1:]
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    json.dump({'real_frames': len(R), 'ai_frames': len(hook) - 1, 'join_s': len(R) / 30, 'total_s': len(seq) / 30}, open(out + '.json', 'w'))
    print('real', len(R), 'frames | ai', len(hook) - 1, '| join at %.2f s | total %.2f s' % (len(R) / 30, len(seq) / 30))

if __name__ == '__main__':
    build(sys.argv[1])
