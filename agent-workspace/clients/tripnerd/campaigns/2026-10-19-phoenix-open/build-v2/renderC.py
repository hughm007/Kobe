# TripNerd Phoenix version C (Reel 3): AI fly-up hook (0.0-2.0, from our two real frames) -> music drop at 2.0 on the real
# bunker blast -> the rest of v2. Reuses the frozen v2 silent master for every real-footage frame, so nothing real is re-rendered.
#   python3 renderC.py <flyup.mp4> <silent_v2.mp4> <out.mp4>
import subprocess, sys, numpy as np
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
W, H = 1080, 1920

def frames(path, vf='scale=1080:1920:flags=lanczos'):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-vf', vf, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)

def build(flyup, v2, out):
    A = frames(flyup, 'scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920')
    V = frames(v2)
    assert len(V) == 390, len(V)
    # speed ramp: the whole AI move squeezed into 60 frames, fast out of the crowd and settling on the rail (ease-out)
    u = np.linspace(0, 1, 60); src = (1 - (1 - u) ** 2.2) * (len(A) - 1)
    hook = [A[int(round(s))] for s in src]
    # the model invented sponsor wordmarks on the far wall: paint them out with the wall's own colour, as on the real shots
    import render2
    hook, _ = render2.paint_out(hook, 900, 1200, 4, minrun=6)
    seq = hook + list(V[0:90]) + list(V[120:390])      # v2 minus its two crowd whips (the fly-up replaces them)
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    print(len(seq), 'frames', len(seq) / 30, 's | fly-up source frames', len(A))

if __name__ == '__main__':
    build(*sys.argv[1:4])
