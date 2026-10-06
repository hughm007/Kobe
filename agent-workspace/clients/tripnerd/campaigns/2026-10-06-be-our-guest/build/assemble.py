#!/usr/bin/env python3
"""Be Our Guest — assemble the 15.0 s 9:16 master from real TripNerd footage.
Runs in the Higgsfield sandbox. Expects src/*.mp4 (Drive originals), s1c.mp4 (shot 1 with the event
logo cleared by cover_logo.py) and ov_*.png (overlays.js) in the cwd.
Uniform timebase: every segment -> fps=24 (hero footage is 24 fps), concat FILTER. Audio is each
shot's own location sound, levelled per source, then loudness-normalised (no music in the file;
music is chosen in-app at posting).
Usage: python3 assemble.py <out.mp4>
"""
import subprocess, sys
OUT = sys.argv[1] if len(sys.argv) > 1 else 'bog_master.mp4'
V = lambda n: f'src/TN_{n}.mp4'
V23, V24 = V('2026-03-12_the-players_V23'), V('2026-03-14_the-players_V24')
V07, V08, V16 = V('2024-03-16_the-players_V07'), V('2024-03-17_the-players_V08'), V('2025-03-15_the-players_V16')
LUFS = {V23: -23.2, V24: -18.2, V07: -19.1, V08: -18.4, V16: -20.9, 's1c.mp4': -23.2}
# (file, in, out, sharpen, overlay layers)
EDL = [
    ('s1c.mp4', 0.0, 2.4, 0.4, ['hook']),        # arrival: TRIPNERD door (logo cleared)
    (V23, 10.3, 12.1, 0.4, ['suite']),           # inside the suite (from 10.3: no TV broadcast in frame)
    (V23, 24.0, 25.8, 0.4, ['balcony']),         # out to the balcony
    (V24, 13.0, 15.0, 0.4, ['seventeen']),       # the 17th
    (V23, 30.0, 32.0, 0.4, ['view']),            # guests looking out from the balcony
    (V23, 50.0, 52.5, 0.4, ['ask']),             # payoff: the table on the balcony
    (V24, 15.5, 18.0, 0.4, ['scrim', 'end']),    # end card plate (the green, under scrim)
]
FPS = 24
args = ['ffmpeg', '-v', 'error', '-y']
for f, a, b, _, _ in EDL:
    args += ['-i', f]
ov_index = {}
for i, (_, a, b, _, lays) in enumerate(EDL):
    for L in lays:
        ov_index[(i, L)] = len(EDL) + len(ov_index)
        args += ['-loop', '1', '-framerate', str(FPS), '-t', f'{b - a:.3f}', '-i', f'ov_{L}.png']
fc, cat = [], []
for i, (f, a, b, sh, lays) in enumerate(EDL):
    d = b - a
    fc.append(f'[{i}:v]trim=start={a}:end={b},setpts=PTS-STARTPTS,fps={FPS},'
              f'scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,'
              f'eq=contrast=1.04:saturation=1.07,unsharp=5:5:{sh},format=rgba[b{i}]')
    cur = f'b{i}'
    for L in lays:
        k = ov_index[(i, L)]
        if L == 'hook':
            fc.append(f'[{k}:v]format=rgba,fade=t=out:st={d - 0.2:.3f}:d=0.2:alpha=1[o{i}{L}]')
            pos = '0:0'
        elif L == 'scrim':
            fc.append(f'[{k}:v]format=rgba,fade=t=in:st=0:d=0.35:alpha=1[o{i}{L}]'); pos = '0:0'
        elif L == 'end':
            fc.append(f'[{k}:v]format=rgba,fade=t=in:st=0.15:d=0.35:alpha=1[o{i}{L}]')
            pos = "x=0:y='if(lt(t,0.15),36,if(lt(t,0.5),36*(1-(t-0.15)/0.35),0))':eval=frame"
        else:   # labels and the ask: quick fade in, fade out before the cut
            fc.append(f'[{k}:v]format=rgba,fade=t=in:st=0.08:d=0.15:alpha=1,fade=t=out:st={d - 0.18:.3f}:d=0.15:alpha=1[o{i}{L}]')
            pos = "x=0:y='if(lt(t,0.08),24,if(lt(t,0.25),24*(1-(t-0.08)/0.17),0))':eval=frame"
        fc.append(f'[{cur}][o{i}{L}]overlay={pos}[c{i}{L}]'); cur = f'c{i}{L}'
    g = -20.0 - LUFS[f] - (6.0 if 'end' in lays else 0.0)
    fo = 0.6 if 'end' in lays else 0.04
    fc.append(f'[{i}:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,aresample=48000,'
              f'aformat=channel_layouts=stereo,volume={g:.1f}dB,afade=t=in:d=0.04,afade=t=out:st={d - fo:.3f}:d={fo}[a{i}]')
    cat += [f'[{cur}]', f'[a{i}]']
fc.append(''.join(cat) + f'concat=n={len(EDL)}:v=1:a=1[vc][ac]')
fc.append('[vc]settb=AVTB,format=yuv420p[v]')
fc.append('[ac]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]')
total = sum(b - a for _, a, b, _, _ in EDL)
args += ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium',
         '-crf', '17', '-profile:v', 'high', '-r', str(FPS), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
         '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-t', f'{total:.3f}', OUT]
subprocess.run(args, check=True)
print('duration', round(total, 3))
print(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,width,height,r_frame_rate,pix_fmt,sample_rate,channels',
                      '-show_entries', 'format=duration', '-of', 'compact', OUT], capture_output=True, text=True).stdout)
