"""Original 21 s rock/sports music bed for the TripNerd Daytona advert (composed here, so it is royalty-free
and owned outright). 120 BPM, E minor (E5-C5-G5-D5). Rendered with FluidSynth + FluidR3_GM (MIT licence).

Timeline (s): 0-1 silence | 1-5 intro build (pad, kick, hats, snare roll) | 5.0 crash + full groove
(5-19, 7 bars) | 19.0 final chord + crash, rings to 21 with fade (fade applied in the mix)."""
import random, mido

random.seed(7)
TPB = 480                       # ticks per beat
BPM = 120
D = '/tmp/claude-0/-home-user-Kobe/d8c674ea-7b5d-5bd2-8b43-d8e60a0e96a7/scratchpad/card/'

events = []                     # (tick, channel, note, velocity, duration_ticks)
def note(beat, ch, n, vel, dur_beats):
    events.append((int(round(beat * TPB)), ch, n, max(1, min(127, vel + random.randint(-6, 6))), int(dur_beats * TPB)))

DR, BASS, GTR, PAD = 9, 1, 2, 3
KICK, SNARE, HAT, OHAT, CRASH, TOM_H, TOM_M, TOM_L, RIDE = 36, 38, 42, 46, 49, 50, 47, 45, 51
B = lambda sec: sec * BPM / 60  # seconds -> beats

pad_em = [52, 55, 59, 64]       # E minor voicing
# ---------- opener 0.0-1.5 s: quiet pad + pulse, snare pickup into the white cut ----------
for n in pad_em:
    note(0.0, PAD, n, 52, B(1.5))
note(0.0, BASS, 28, 60, B(1.5))
for b in range(0, 3):
    note(b, DR, KICK, 62 + b * 8, 0.25)
for i in range(8):                                 # 16th snare pickup 1.0-1.5 s, crescendo
    note(B(1.0) + i * 0.125, DR, SNARE, 46 + i * 9, 0.1)
note(B(1.375), DR, TOM_M, 92, 0.15)
# ---------- groove 1.5-13.5 s: 6 bars ----------
prog = [(40, [52, 59, 64]), (36, [48, 55, 60]), (43, [43, 50, 55]), (38, [50, 57, 62])]
start = B(1.5)
for bar in range(6):
    b0 = start + bar * 4
    root, chord = prog[bar % 4]
    if bar in (0, 4):
        note(b0, DR, CRASH, 112, 1)
    for i in range(8):
        note(b0 + i * 0.5, DR, HAT if bar < 3 else RIDE, 78 if i % 2 == 0 else 62, 0.2)
    for k in (0, 1.5, 2):
        note(b0 + k, DR, KICK, 108, 0.25)
    for sn in (1, 3):
        if not (bar == 5 and sn == 3):
            note(b0 + sn, DR, SNARE, 112, 0.25)
    if bar == 2:
        for i, tm in enumerate([TOM_H, TOM_H, TOM_M, TOM_M, TOM_L, TOM_L]):
            note(b0 + 3 + i * (1 / 6), DR, tm, 96 + i * 3, 0.15)
    if bar == 5:
        for i in range(8):
            note(b0 + 3 + i * 0.125, DR, SNARE, 80 + i * 5, 0.1)
    for i in range(8):
        note(b0 + i * 0.5, BASS, root, 100 if i % 2 == 0 else 88, 0.45)
    for i in range(8):
        dur = 1.0 if (bar >= 3 and i == 0) else 0.4
        if bar >= 3 and i == 1:
            continue
        for n in chord:
            note(b0 + i * 0.5, GTR, n, 104 if i in (0, 3) else 86, dur)
# ---------- final hit 13.5 s (end card), ring out ----------
fb = B(13.5)
note(fb, DR, CRASH, 120, 6); note(fb, DR, KICK, 118, 0.5)
note(fb, BASS, 40, 108, 6)
for n in [52, 59, 64, 71]:
    note(fb, GTR, n, 110, 6)
for n in pad_em:
    note(fb, PAD, n, 70, 6)

# ---------- write MIDI ----------
mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM), time=0))
for ch, prog_no in ((BASS, 34), (GTR, 30), (PAD, 89)):       # pick bass, distortion guitar, warm pad
    tr.append(mido.Message('program_change', channel=ch, program=prog_no, time=0))
tr.append(mido.Message('control_change', channel=GTR, control=7, value=88, time=0))   # guitar level
tr.append(mido.Message('control_change', channel=PAD, control=7, value=80, time=0))
tr.append(mido.Message('control_change', channel=BASS, control=7, value=110, time=0))
tr.append(mido.Message('control_change', channel=DR, control=7, value=118, time=0))
msgs = []
for tick, ch, n, v, dur in events:
    msgs.append((tick, 1, mido.Message('note_on', channel=ch, note=n, velocity=v)))
    msgs.append((tick + dur, 0, mido.Message('note_off', channel=ch, note=n, velocity=0)))
msgs.sort(key=lambda m: (m[0], m[1]))
last = 0
for tick, _, m in msgs:
    m.time = tick - last; last = tick
    tr.append(m)
mid.save(D + 'music_v2.mid')
print('events', len(events), 'length s', mid.length)
