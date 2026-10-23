# reference-measurements/

This folder is for readings from an **independent reference launch monitor**, taken of the same
shots this system measured. That paired data is the only route to the status **VERIFIED**.
Today nothing in this repository is VERIFIED.

## Status

**Empty: no reference data exists.** There is also no hardware to produce our side of a pair
yet; capture is Planned (Phase 2) — not implemented, and spin measurement Planned (Phase 3).
The reference-monitor import, accuracy dashboard and held-out report are Planned (Phase 7) —
not implemented.

| Implemented and tested (`@glm/validation`) | Not implemented |
|---|---|
| `ReferenceMeasurementSchema` (zod) for one reference record | A file loader for this folder |
| `normalizeReference`: unit conversion and sign flips, logged step by step; incompatible metrics excluded with a reason; an optional per-shot `ReferenceComparisonContext` for landing metrics (below) | A pairing tool that joins reference records to our `ShotRecord`s |
| `compareToReference`: one row per metric, error = ours − reference (SI, our signs) | Any accuracy report or published error figure |
| `errorStats`, `pairedErrors`, `groupedErrorStats`, `intervalCoverage`, `accuracyTableMarkdown` | |
| `PartitionedDataset`: deterministic training / validation / held-out-test split | Stable capture-time shot ids (see "Pairing key" below) |

## Record format (`ReferenceMeasurementSchema`)

```json
{
  "referenceId": "ref-0001",
  "shotId": "<our ShotRecord.shotId for the same physical shot>",
  "device": { "make": "…", "model": "…", "firmware": null },
  "metrics": {
    "ballSpeed": { "value": 0, "unit": "mph", "definition": "glm:ball-speed" }
  },
  "conventions": {
    "horizontalAngleSign": "right-positive",
    "spinAxisSign": "right-positive",
    "lateralSign": "right-positive",
    "carryDefinition": "first-ground-contact",
    "ballSpeedReference": "ball-center"
  },
  "notes": ""
}
```

Values in the example are placeholders, not data. Unknown fields are rejected (strict
objects).

**Proposed file convention (no loader enforces it yet):**

- one JSON Lines file per capture campaign, `<campaign>.reference.jsonl`, with one record per line;
- the matching recording of our observations kept in `../raw-shots/`;
- records paired by `shotId`, filled with a capture-derived key (below), not with the
  processing-time id.

**Pairing key.** Our `ShotRecord.shotId` is assigned when a shot is processed, so re-processing
a recording with another id provider or in another order changes it. Until capture-time ids
exist, use a key derived from the recording, for example
`<SHA-256 of the replay file>:<capture index>`, as the `shotId` of reference records and of the
items given to `PartitionedDataset`, and list it in the campaign manifest next to our processing
`shotId` ([validation-protocol.md §3.3](../../docs/validation-protocol.md#33-pairing)). Replay
files record no player or club; keep them in the manifest.

## Comparison rules (implemented)

- **Comparable metrics.** Ball speed, vertical launch, horizontal launch, total spin, spin
  axis, carry, carry lateral, total, apex height and descent angle. Each reference metric must
  declare our definition id (`glm:ball-speed`, `glm:carry`, …; see
  `REFERENCE_METRIC_DEFINITIONS`). A different definition is reported as **incompatible** and
  excluded. It is never silently compared.
- **Units** are converted with `@glm/units`. An unknown unit, or a unit of the wrong
  dimension, makes the metric incompatible.
- **Signs.**
  - Ours: horizontal angle and lateral offset positive = **left**; spin-axis tilt positive =
    curves **right** ([../../docs/coordinate-system.md](../../docs/coordinate-system.md)).
  - A reference that declares the opposite convention is sign-flipped, and the flip is logged.
- **Landing definition.**
  - Our carry ends at first ground contact.
  - If the reference declares `carryDefinition: "unknown"`, carry, carry lateral and descent
    angle are excluded.
  - If it declares `"landing-at-launch-height"`, they are excluded unless the caller passes a
    `ReferenceComparisonContext` for that shot whose `ourFirstContactHeightAboveLaunchM` (our
    ball-centre height at first contact minus at launch) is within ±0.05 m
    (`LANDING_HEIGHT_EQUIVALENCE_TOLERANCE_M`, a provisional tolerance). That holds on flat
    ground at tee height, e.g. a mat shot on the current range terrain. The assertion is logged
    and shown in the comparison row's note; outside the tolerance, or with an unknown height,
    the metrics stay excluded.
- **Ball-speed measurement point** `unknown` excludes ball speed.
- **Our side must already be SI in our sign conventions.** `LaunchState` stores the launch
  angles in degrees and spin in rpm, so the caller converts them to rad and rad/s before
  calling `compareToReference`.
- **Missing values are skipped and counted, never zero-filled.**

## Avoiding self-deception

- **Partitions.** `assignPartition` assigns each shot to training (60 %), validation (20 %) or
  held-out test (20 %) by hashing a salt and the `shotId`. A shot's partition never changes as
  the dataset grows.
- **Held-out guard.** The held-out set is returned only for the purpose
  `"final-accuracy-report"` with the exact acknowledgement
  `"I will not tune models on these results"`, and every access is logged.
- **Tune only on training and validation.** That covers physics coefficients, confidence
  thresholds and noise models.
- **Independence.** A reference device is itself a measurement with its own error. Record its
  make, model and firmware, and never treat it as ground truth without stating so.
- **What VERIFIED requires.** Simultaneous capture of the same shots by both systems,
  documented conventions, accuracy targets written down **before** collection, results reported
  on the held-out set, and a status scoped to the conditions tested. See
  [product-requirements.md §8](../../docs/product-requirements.md#8-acceptance-criteria-for-phase-completion).
  In the [phase plan](../../docs/product-requirements.md#9-phase-plan) this is Phase 7
  (validation and hardening).

## Privacy

**This folder is not git-ignored**, unlike `raw-shots/` and `calibration/`. Reference data can
include player identities and device serial numbers. Before committing, get consent, replace
player ids, and remove serial numbers from `notes`. Otherwise keep the files local.
