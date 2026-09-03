# Run 9 — video production architecture (as proven, 2026-09-02)

## 1. Build location — SOLVED, and the previous constraint was environmental
**Rule: build where the heaviest inputs can actually land, and prove the delivery path
before spending a single credit.**

The Run 8 audit inherited a documented blocker: cloud-generated media could not reach the
build container (CDN 403 at the egress gateway, no local TTS, base64 relay corrupted mid-
transfer), and *roughly half the hours* of that build were spent moving bytes.

Preflight on this machine, 2026-09-02, measured:

| Check | Result |
|---|---|
| ffmpeg / ffprobe | present natively |
| higgsfield CLI | present, authenticated |
| CloudFront asset host | HTTP 403 on an unsigned **root** GET — a normal S3 `AccessDenied`, **not** a gateway CONNECT rejection |
| Signed asset URL fetch | **HTTP 200, 404,099 bytes in 1.12s**, verified h264 1280x720 24fps 4.0s |
| Proxy / egress gateway | none — no proxy env, no `__agentproxy` |
| Local TTS | `say` present, produced verified real audio |

**Conclusion: the egress wall was an artifact of the cloud build container, not of the
pipeline.** Generation, fetch, assembly, audio and export all occur under one filesystem
root here. The transport tax is gone — one second, not half a build.

## 2. Gate sequencing — cheap and high-information first
Owner's recorded verdict on the previous run: *"way too long... I would rather have
something made for me that I can look at within 10 minutes."* The dual gate was answering
*is this defensible* before anyone had answered *is this the right thing at all*.

Order now enforced by the pipeline:
brief -> concept/hook -> **preflight (free)** -> generate -> assemble -> **first viewable
artifact** -> machine QA -> creative critique -> adversarial review -> final approval.

Preflight is free and runs first. The expensive multi-agent gate runs once, last, on frozen
artifacts.

## 3. State ledger
`servicepow_video.py` holds one manifest per campaign. Every element carries state
(`PLANNED / EXISTS / APPROVED / FAILED / NEEDS_REGENERATION / MUST_NOT_CHANGE`), a version,
a path and a SHA-256. The six questions are answerable at any moment by `state`.

## 4. Targeted revision
`freeze <round>` hash-locks every artifact. After a repair, `verify <round>
--expect-changed <ids>` proves which artifacts moved and asserts the rest are byte-identical.
A failed shot regenerates alone; approved work cannot silently regress.

## 5. Variant engine
Body and CTA elements are marked `shared_across_hooks`; hooks are not. One concept's body
and the shared CTA are generated once and inherited by every hook variant of that concept.

## 6. Voice route — RESOLVED locally
`say` produces real, ffprobe-verified audio with no external service and no spend. This is
adequate for animatic and internal cut voice. **Honest limit:** it is macOS system TTS, not
a performance voice product. Whether it clears the client-facing bar is a creative judgment
for the APPROVER, not a technical one, and it is recorded here as unresolved at that level.

## 7. The cost ladder found a hard floor — rung 1 cannot pass our own gates
Rung 1 was `veo3_1_lite` at **4 credits**/4s. Nine elements would have cost 36 credits.
It was tested first, per doctrine, and the result was decisive:

| Machine QC check | Result on rung-1 output |
|---|---|
| resolution | **FAIL** — 1280x720 against a min-dimension floor of 1080 |
| no-frozen-sections | **FAIL** — frozen at 0.4s+0.8s and 2.3s+1.0s |
| motion-gate | **FAIL** — edge travel 0.10 px/frame against a floor of 1.6 |
| fps / no-black / oner | PASS |

`higgsfield model get veo3_1_lite` exposes **no resolution parameter at all**. The cheapest
model is therefore *structurally incapable* of clearing Service Pow's resolution gate — not a
tuning problem, a capability ceiling. Escalation to `seedance_2_0` (1080p selectable,
36 credits/4s) is evidence-driven, not preference.

**Second cause, ours not the vendor's:** the first prompt set described stillness — "shallow
depth of field", "quiet", "tense stillness". The motion gate gives those a floor they cannot
clear. The prompts failed QC *by construction*, exactly as the code-rendered film did in the
previous run when every stroke had to boil.

## 8. What this Run changed so it cannot recur
Preflight now runs two additional free checks before any credit is spent:

- **`model:<name>:resolution>=1080`** — reads the model's own parameter surface and fails if it
  cannot reach the resolution the QC harness will grade it against.
- **`prompts:motion-floor`** — scans every prompt in the manifest for camera or subject motion
  language and names the offenders.

Both were verified to fire against the exact conditions that wasted the first 20 credits:

```
FAIL  model:veo3_1_lite:resolution>=1080: model exposes no resolution >=1080p
FAIL  prompts:motion-floor: 8 prompt(s) describe stillness and will fail the motion gate
PREFLIGHT: FAIL (6/8)
```

The generation-quality floor is now enforced *before* spend rather than discovered after it.

## 9. A capability the audit over-rated
The audit graded machine QA "executable, Level 3-4" because the harness parses and has real
logic. It does not run on this machine: `servicepow_qc.py` imports `numpy`, which is absent,
and the system Python is PEP 668 externally-managed. Fixed with a dedicated venv at
`playbooks/ads/scripts/.qcvenv` rather than by breaking the system interpreter.

**Exists is not works.** The harness had never been run in this environment.
