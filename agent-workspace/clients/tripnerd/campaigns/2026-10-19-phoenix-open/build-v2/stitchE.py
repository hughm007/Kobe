# Phoenix "one continuous shot": the REAL bunker shot (V03 2.47 s -> the exact 5.03 s frame, swing and ball untouched,
# only the standing wall-logo cover) followed without a cut by the AI pull-back that was generated FROM that same frame.
#   python3 stitchE.py <ai_pullback.mp4> <out_silent.mp4>
import subprocess, sys, numpy as np, cv2
sys.path.insert(0, 'real')
import render2 as r, despeck
from PIL import Image
FF = r.FF; W, H = r.W, r.H
LAST = 'drone/START_green_bunker_clean.png'          # the uploaded AI start frame = V03 at ~5.03 s, painted + despecked

def real_part():
    F = r.read('V03', 2.47, 77)                        # 2.47 -> ~5.00 s
    F, band = r.paint_out(F, 100, 950, 3)
    F = [despeck.despeck(f, int(t) - 3, int(b) + 4) for f, (t, b) in zip(F, band)]
    return F + [np.asarray(Image.open(LAST).convert('RGB'))]   # ends on the exact frame the AI clip starts from

def ai_part(path):
    pr = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    fps = float(__import__('re').search(r'(\d+(?:\.\d+)?) fps', pr).group(1))
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920',
                          '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    A = list(np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3))
    n = int(round(len(A) / fps * 30))
    return A if abs(fps - 30) < 0.5 else r.slowmo(A, n), fps   # 24 -> 30 fps with optical-flow in-betweens, same duration

def build(ai, out):
    R = real_part(); A, fps = ai_part(ai)
    # 3-frame dissolve from the real last frame into the AI clip hides any colour/compression shift at the join
    for k in range(3):
        a = (k + 1) / 4; A[k] = (R[-1].astype(np.float32) * (1 - a) + A[k].astype(np.float32) * a).astype(np.uint8)
    seq = R + A[1:]
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    print('real', len(R), '| ai', len(A) - 1, f'(src {fps} fps) | total', len(seq), 'frames', len(seq) / 30, 's | join at frame', len(R))

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
