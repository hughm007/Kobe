#!/usr/bin/env python3
"""Be Our Guest — assemble the 16.2 s 9:16 master from real TripNerd footage (v1.6: owner asked for longer, even beats).
Runs in the Higgsfield sandbox. Expects src/*.mp4 (Drive originals) and ov_*.png (overlays.js) in the cwd.
Uniform timebase: every segment -> fps=24 (hero footage is 24 fps), concat FILTER, hard picture cuts.
Audio (v1.5, after the v1.4a gates measured holes at every cut and a collapse under the end card):
each shot's own location sound runs a short tail past its cut and fades out under the next shot
(an overlap, so no hole), the hook's roar carries further as an L-cut, and a continuous crowd bed
(V07, ASR-verified speech-free) sits just under body level through the end card. Loudness: the mix is
measured, given one static gain to -16 LUFS and peak-limited (re-measured once to correct for the limiter) —
single-pass dynamic loudnorm landed at -18.3 LUFS on this 15 s cut and flattened the roar. No music in the
file; ships with original audio.
Usage: python3 assemble.py <out.mp4> [A|B]   (A = "TripNerd's got the best spot.", B = "This is TripNerd's spot.")
       python3 assemble.py --segments        (writes conformed seg<N>.mp4 per shot for the clip gate)
"""
import subprocess, sys
SEGMENTS = len(sys.argv) > 1 and sys.argv[1] == '--segments'
OUT = sys.argv[1] if len(sys.argv) > 1 and not SEGMENTS else 'bog_master.mp4'
VARIANT = (sys.argv[2] if len(sys.argv) > 2 else 'A').upper()
V = lambda n: f'src/TN_{n}.mp4'
V23, V24 = V('2026-03-12_the-players_V23'), V('2026-03-14_the-players_V24')
V07 = V('2024-03-16_the-players_V07')
LUFS = {V23: -23.2, V24: -18.2, V07: -19.1}
SRC_DUR = {V23: 54.14, V24: 31.1, V07: 16.63}
ASK = f'ask_{VARIANT.lower()}'
# (file, in, out, sharpen, zoom, audio tail s, overlay layers as (png, mode, start s))
#   zoom: 1.0, or (factor, x-anchor 0..1, y-anchor 0..1) for a punch-in
#   modes: hook = fade out at 2.0 s · in = fade/slide in, holds to the cut · out = holds, fades out
#   before the cut · both = in + out · scrim / end = end-card animation
EDL = [
    (V24, 13.6, 17.2, 0.4, (1.15, 1.0, 0.0), 0.6,
     [('hook', 'hook', 0), ('seventeen', 'both', 2.25)]),          # roar + ball by the pin; punch-in drops the foreground head
    (V23, 18.65, 19.55, 0.4, 1.00, 0.3, [('suite', 'in', 0)]),     # TripNerd logo wall + counter (clear of the TV)
    (V23, 48.6, 50.7, 0.4, 1.00, 0.3, [('suite', 'out', 0)]),      # guests on the suite's covered balcony (TV gone by 48.6; no cans or event cups)
    (V23, 24.5, 27.7, 0.4, 1.12, 0.3, [('view', 'both', 0)]),      # door-to-balcony reveal: island green, punched in
    (V23, 50.7, 54.1, 0.4, 1.00, 0.0, [(ASK, 'both', 0)]),         # the rail table: payoff + comment prompt
    (V24, 9.0, 12.0, 0.4, 1.00, 0.0, [('scrim', 'scrim', 0), ('end', 'end', 0)]),  # through the suite windows
]
BED = (V07, 0.0)          # 2024 crowd from the 17th walkway (0–16.2 s); ASR (small.en + VAD, base.en) found no speech
BODY, BED_LUFS = -21.0, -23.0
FPS = 24


def picture(i, f, a, b, sh, z):
    z, ax, ay = z if isinstance(z, tuple) else (z, 0.5, 0.42)
    crop = '' if z == 1.0 else (f',scale=trunc(iw*{z}/2)*2:trunc(ih*{z}/2)*2:flags=lanczos,'
                                f'crop=1080:1920:(iw-1080)*{ax}:(ih-1920)*{ay}')
    return (f'[{i}:v]trim=start={a}:end={b},setpts=PTS-STARTPTS,fps={FPS},'
            f'scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920{crop},setsar=1,'
            f'eq=contrast=1.04:saturation=1.07,unsharp=5:5:{sh}')


if SEGMENTS:
    for n, (f, a, b, sh, z, _, _) in enumerate(EDL, 1):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-filter_complex', picture(0, f, a, b, sh, z) + ',format=yuv420p[v]',
                        '-map', '[v]', '-an', '-c:v', 'libx264', '-crf', '17', '-r', str(FPS), f'seg{n}.mp4'], check=True)
    sys.exit(0)

args = ['ffmpeg', '-v', 'error', '-y']
for f, *_ in EDL:
    args += ['-i', f]
ov_index = {}
for i, (_, a, b, _, _, _, lays) in enumerate(EDL):
    for png, _, _ in lays:
        ov_index[(i, png)] = len(EDL) + len(ov_index)
        args += ['-loop', '1', '-framerate', str(FPS), '-t', f'{b - a:.3f}', '-i', f'ov_{png}.png']
bi = len(EDL) + len(ov_index)
args += ['-i', BED[0]]

total = sum(e[2] - e[1] for e in EDL)


def audio_graph(idx, bed_idx):
    """Per-shot location sound (with overlapping tails) + crowd bed -> [mx], before loudness."""
    g, mix, t0 = [], [], 0.0
    for i, (f, a, b, _, _, tail, _) in enumerate(EDL):
        d = b - a
        # own sound from the cut, plus a tail that fades out under the next shot
        tl = min(tail, SRC_DUR[f] - b - 0.05)
        fin = 0.02 if i == 0 else 0.05
        g.append(f'[{idx[i]}:a]atrim=start={a}:end={b + tl:.3f},asetpts=PTS-STARTPTS,aresample=48000,'
                 f'aformat=channel_layouts=stereo,highpass=f=100,volume={BODY - LUFS[f]:.1f}dB,afade=t=in:d={fin}'
                 + (f',afade=t=out:st={d:.3f}:d={tl:.3f}' if tl > 0 else '')
                 + f',adelay={int(round(t0 * 1000))}:all=1[a{i}]')
        mix.append(f'[a{i}]')
        t0 += d
    bf, ba = BED
    g.append(f'[{bed_idx}:a]atrim=start={ba}:end={ba + total:.3f},asetpts=PTS-STARTPTS,aresample=48000,'
             f'aformat=channel_layouts=stereo,highpass=f=100,volume={BED_LUFS - LUFS[bf]:.1f}dB,afade=t=in:d=0.05[bed]')
    g.append(''.join(mix) + f'[bed]amix=inputs={len(mix) + 1}:normalize=0:duration=longest,atrim=end={total:.3f}[mx]')
    return g


def master_chain(gain):
    return (f'[mx]volume={gain:.2f}dB,alimiter=limit=0.75:attack=2:release=60:level=0,aresample=48000,'
            f'afade=t=out:st={total - 0.8:.3f}:d=0.8')


def measure(gain):
    a = ['ffmpeg', '-v', 'info', '-nostats']
    for f, *_ in EDL:
        a += ['-i', f]
    a += ['-i', BED[0], '-filter_complex',
          ';'.join(audio_graph(list(range(len(EDL))), len(EDL)) + [master_chain(gain) + ',ebur128=peak=true[o]']),
          '-map', '[o]', '-f', 'null', '-']
    err = subprocess.run(a, capture_output=True, text=True).stderr
    summ = err[err.rindex('Summary:'):]
    lufs = float(summ.split('I:')[1].split('LUFS')[0])
    tp = float(summ.split('Peak:')[1].split('dBFS')[0])
    return lufs, tp


g1 = -16.0 - measure(0.0)[0]
GAIN = g1 + (-16.0 - measure(g1)[0])
print('loudness: static gain', round(GAIN, 2), 'dB -> measured (LUFS, dBTP)', measure(GAIN))

fc, cat = [], []
for i, (f, a, b, sh, z, tail, lays) in enumerate(EDL):
    d = b - a
    fc.append(picture(i, f, a, b, sh, z) + f',format=rgba[b{i}]')
    cur = f'b{i}'
    for png, mode, s0 in lays:
        k = ov_index[(i, png)]
        slide = (f"x=0:y='if(lt(t,{s0 + 0.08:.2f}),24,if(lt(t,{s0 + 0.25:.2f}),24*(1-(t-{s0 + 0.08:.2f})/0.17),0))':eval=frame")
        if mode == 'hook':
            fx, pos = 'fade=t=out:st=1.85:d=0.2:alpha=1', '0:0'
        elif mode == 'scrim':
            fx, pos = 'fade=t=in:st=0:d=0.35:alpha=1', '0:0'
        elif mode == 'end':
            fx = 'fade=t=in:st=0.15:d=0.35:alpha=1'
            pos = "x=0:y='if(lt(t,0.15),36,if(lt(t,0.5),36*(1-(t-0.15)/0.35),0))':eval=frame"
        elif mode == 'in':
            fx, pos = f'fade=t=in:st={s0 + 0.08:.2f}:d=0.15:alpha=1', slide
        elif mode == 'out':
            fx, pos = f'fade=t=out:st={d - 0.18:.3f}:d=0.15:alpha=1', '0:0'
        else:   # both
            fx, pos = f'fade=t=in:st={s0 + 0.08:.2f}:d=0.15:alpha=1,fade=t=out:st={d - 0.18:.3f}:d=0.15:alpha=1', slide
        fc.append(f'[{k}:v]format=rgba,{fx}[o{i}{png}]')
        fc.append(f'[{cur}][o{i}{png}]overlay={pos}[c{i}{png}]'); cur = f'c{i}{png}'
    cat.append(f'[{cur}]')
fc.append(''.join(cat) + f'concat=n={len(EDL)}:v=1:a=0[vc]')
fc.append('[vc]settb=AVTB,format=yuv420p[v]')
fc += audio_graph(list(range(len(EDL))), bi)
fc.append(master_chain(GAIN) + '[a]')
args += ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium',
         '-crf', '17', '-profile:v', 'high', '-r', str(FPS), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
         '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-t', f'{total:.3f}', OUT]
subprocess.run(args, check=True)
print('variant', VARIANT, 'duration', round(total, 3))
print(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,width,height,r_frame_rate,pix_fmt,sample_rate,channels',
                      '-show_entries', 'format=duration', '-of', 'compact', OUT], capture_output=True, text=True).stdout)
