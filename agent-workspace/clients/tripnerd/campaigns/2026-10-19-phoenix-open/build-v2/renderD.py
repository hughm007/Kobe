# TripNerd Phoenix Reel 3 (drone hook): AI drone reveal from our real bunker frame (0.0-2.0, card "This is the 16th."),
# hard cut on the music hit at 2.0 to the real suite rail ("Now watch it from up here."), then the real bunker blast and the
# rest of v2. Every real-footage frame comes from the frozen v2 silent master or the real sources; only the hook is generated.
#   python3 renderD.py <drone.mp4> <silent_v2.mp4> <out.mp4> [drone_in_s] [drone_out_s]
import subprocess, sys, numpy as np
import render2 as r
FF = r.FF; W, H = r.W, r.H

def frames(path, vf):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-vf', vf, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)

def build(drone, v2, out, t_in=0.0, t_out=None):
    A = frames(drone, 'scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30')
    t_out = t_out if t_out is not None else len(A) / 30
    a, b = int(t_in * 30), min(len(A), int(t_out * 30))
    # the chosen stretch of the move, retimed into 60 frames (2.0 s), easing in so the rise accelerates into the cut
    u = np.linspace(0, 1, 60); src = a + (u ** 1.35) * (b - 1 - a)
    hook = [r.put_text(A[int(round(s))].copy(), 'This is the 16th.', 118, i, 860) for i, s in enumerate(src)]
    V = frames(v2, 'null'); assert len(V) == 390, len(V)
    # 2.0: hard cut on the hit to the real suite rail with the new card (re-rendered from source so the old card is not burned in)
    rail, _ = r.paint_out(r.read('V01', 0.0, 45), 900, 1150, 3, minrun=6)
    rail = [r.put_text(f if i < 30 else r.punch(f, 1.3, 600, 1250), 'Now watch it from up here.', 104, i, 700) for i, f in enumerate(rail)]
    # 3.5: the real bunker blast (v2 S1, still carrying "This is the 16th." -> swap to a clean render without a card)
    raw = r.read('V03', 2.82, 13); slow = r.slowmo(raw, 60); real = r.read('V03', 3.22, 30)
    blast, _ = r.paint_out(slow + real, 100, 900, 3)
    blast = [r.punch(f, 1.08 - 0.08 * min(i, 60) / 60, 540, 1150) for i, f in enumerate(blast)]
    seq = hook + rail + blast + list(V[165:390])          # then v2 from "Pros play right below." to the end card
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    print(len(seq), 'frames', len(seq) / 30, 's | drone frames used', a, '-', b, 'of', len(A))

if __name__ == '__main__':
    args = sys.argv[1:]
    build(args[0], args[1], args[2], *(float(x) for x in args[3:5]))
