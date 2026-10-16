# TN-DAYTONA-001: final 18 s cut, QA

Exports (media is not committed): `TripNerd-Daytona-Reel-FINAL-18s-burnout-video.mp4` (Kling animation of Photo A, AI)
and `...-burnout-photo.mp4` (Photo A still, no AI frames). Both: 1080x1920, 30 fps, 540 frames, 18.000 s, H.264 + AAC, faststart.

| Check | Result (both variants) |
|---|---|
| Integrated loudness | -14.0 LUFS (ebur128) |
| True peak | -1.8 dBTP |
| Text band y 288-1344 | all boxes inside (see qa_build_*.json) |
| Words per card | max 5; end card = "Daytona 2027." + "Talk to a Nerd" + tripnerd.com (7 tokens counting the URL; flagged) |
| Photos | static, pixel 1:1 at native size, blurred fill from the same photo; no zoom, pan or resampling |
| Opener photo | hospitality-suite.jpg md5 2d9008ce... untouched; not flipped (scoreboard and NASCAR read correctly) |
| Music | original composition (compose_music_v3.py, FluidSynth + FluidR3_GM, MIT); through-composed, no loop |

| Time | Picture | Sound |
|---|---|---|
| 0.0-2.0 | suite photo, "Our Daytona suite.", white-out 1.7-2.0 | music build; real V06 audio 4.0-6.0 s, low-passed, low |
| 2.0-4.0 | V06 2.00-3.47 s (73% speed), "This beats watching from home." 2024 | first music hit at 2.0; real V06 audio 2.0-4.0 s, music -6 dB |
| 4.0-7.5 | V05 0.0-3.5 s real speed, "Race weekend, the TripNerd way." 2024 | real V05 audio 0.0-3.5 s, music -6 dB |
| 7.5-9.0 | Photo B, "Headsets on. Drinks up." 2023 | music |
| 9.0-10.2 | father-son, "Thumbs up from the seats." | music |
| 10.2-11.5 | wow guests, "Bring your people." | music |
| 11.5-14.5 | burnout, "The burnout. The memories." | real V06 audio 0.0-2.25 s, then V05 3.5-8.0 s (crowd/engine roar peaks at 14.5), music -6 dB |
| 14.5-18.0 | end card "Daytona 2027.", fade to black 17.6-18.0 | final chord at 14.5; V05 roar decays with it; all to silence by 18.0 |
