# raw-shots/

This is a local, private store for raw shot data: recorded observation streams, exported shot
records and, later, raw frames and audio. **Everything in this folder except this README is
git-ignored** (see `../../.gitignore`).

## Status

**Empty.** No capture hardware or driver exists: the camera, radar and hybrid adapters are
stubs that throw `HardwareNotAvailableError`. Live recording is Planned (Phase 2) — not
implemented. No code writes to this folder automatically.

## What belongs here

| Content | Produced by | Format |
|---|---|---|
| Recorded sessions, `*.jsonl` | `writeReplayFile` / `serializeReplay` (`@glm/sensor-adapters`). Today only synthetic or manual sessions you record yourself; live sessions once capture exists. | Replay JSON Lines ([../README.md](../README.md#replay-files-json-lines-utf-8)) |
| Shot exports, `*.json` | `npm run replay -- <file> --json out.json`, or the UI export | `glm-shot-export` envelope with full `ShotRecord`s |
| Shot exports, `*.csv` | `shotsToCsv`, or the UI export | CSV whose column names carry unit and sign |
| `players/`, `sessions/`, `shots/` | `JsonDirectoryRepository` (`@glm/persistence/node`) rooted here | One validated JSON file per record |
| Raw frames and audio | A future capture service, referenced from `ShotRecord.rawCapturePaths` | Planned (Phase 2) — not implemented |

## Keep provenance intact

A recording keeps the origin of its data. The replay parser enforces this:

- A `live` or `replay` file must describe a camera, radar or hybrid sensor.
- It may not contain `synthetic` or `manual` triggers, nor spin with method `synthetic`.
- Generated or hand-typed data must be written with `dataOrigin` `synthetic` or `manual`.
- A replayed live recording is reported as `replay` and never counts toward a score.

## Replaying a file

```bash
npm run replay -- datasets/raw-shots/<file>.jsonl [--mc 100] [--json out.json]
```

The CLI (`scripts/replay.ts`) has fixed settings and one known gap:

- It always uses the default indoor environment and the `premium-urethane-baseline` ball
  profile, with no player and no club.
- With no club category, a shot without observed spin cannot get a club-model estimate. Its
  simulation is skipped with a stated reason.
- **Known gap:** the CLI ignores the calibration stored in the replay header (it configures
  `calibration: null`). Replaying a **live** recording would therefore mark every shot invalid
  ("No calibration"). Synthetic and manual files are unaffected.

## Privacy

- This folder can hold player identities, swing data, timestamps and, later, images or audio
  of the user's home. Do not `git add -f` anything here.
- Shot records retain raw observations only when the user consents (`storeRawObservations`,
  default off). Raw frames are governed by `SensorConfiguration.storeRawCaptures`.
- To share a dataset:
  1. Get the player's consent.
  2. Replace player ids and remove `rawCapturePaths`.
  3. Review the files.
  4. Move them to a tracked location deliberately.
