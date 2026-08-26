# Higgsfield capability map

**Living document. Every row carries SOURCE · DATE VERIFIED · STATUS.**
Nothing here is a permanent truth. Refresh interval: **30 days**, or immediately when a routing
decision depends on a row older than that.

Status ladder: `DOCUMENTED` (vendor API/docs) < `VENDOR CLAIM` (marketing) <
`INDEPENDENT TEST` < **`SERVICE POW TEST`** (we ran it — wins for our work).

Last full refresh: **2026-08-25**

---

## Account

| Fact | Value | Source | Verified | Status |
|---|---|---|---|---|
| Plan | Ultra | `balance` | 2026-08-25 | DOCUMENTED |
| Credit balance | 8,918.4 | `balance` | 2026-08-25 | DOCUMENTED |
| Free-trial "unlim" available | No (`unlim.available: false`) | `models_explore` | 2026-08-25 | DOCUMENTED |

## Observed real costs (from our own transaction log)

**These are what we were actually charged — the most trustworthy numbers here.**

| Model | Credits / generation | Source | Verified | Status |
|---|---|---|---|---|
| Higgsfield Soul V2 (image) | **0.12** | our transactions | 2026-08-25 | SERVICE POW TEST |
| Nano Banana Pro (image) | **2.00** | our transactions | 2026-08-25 | SERVICE POW TEST |
| Kling v3.0 (video) | **7.5 – 12.5** | our transactions | 2026-08-25 | SERVICE POW TEST |
| Seedance 2.5 (video) | **32.5** | our transactions | 2026-08-25 | SERVICE POW TEST |

**Ratio worth remembering: one Seedance 2.5 video = 271 Soul V2 images.**

## Cost-relevant parameters (the levers routing actually pulls)

| Model | Lever | Effect | Source | Verified | Status |
|---|---|---|---|---|---|
| `seedance_2_0` | `mode: fast` | cheaper/faster; 480p/720p only | `models_explore` | 2026-08-25 | DOCUMENTED |
| `seedance_2_0_mini` | — | explicit budget variant of 2.0 | `models_explore` | 2026-08-25 | DOCUMENTED |
| `kling3_0` | `sound: 'off'` | vendor states **lower credits** | `models_explore` | 2026-08-25 | DOCUMENTED |
| `kling3_0` | `mode: std/pro/4k` | quality tier | `models_explore` | 2026-08-25 | DOCUMENTED |
| `kling3_0_turbo` | — | tagged fast / budget | `models_explore` | 2026-08-25 | DOCUMENTED |
| `cinematic_studio_3_0` | `resolution` | "higher = more credits" | `models_explore` | 2026-08-25 | VENDOR CLAIM |
| all video | `duration` | longer = more credits | `models_explore` | 2026-08-25 | DOCUMENTED |

## Capability notes by need

| Need | Current candidate(s) | Source | Verified | Status |
|---|---|---|---|---|
| Cheap composition exploration (image) | `soul_v2`, `z_image`, `nano_banana` | `models_explore` | 2026-08-25 | DOCUMENTED |
| Legible on-screen text in an image | `nano_banana_pro`, `openai_hazel` | `models_explore` tags | 2026-08-25 | VENDOR CLAIM |
| Brand-colour-locked vector/logo-adjacent art | `recraft_v4_1` (accepts up to 10 hex colours) | `models_explore` | 2026-08-25 | DOCUMENTED |
| Identity consistency across shots | `seedance_2_0` / `2_0_mini` (reference roles), `wan2_7` | `models_explore` | 2026-08-25 | DOCUMENTED |
| Motion test / cheap moving proof | `seedance_2_0_mini`, `kling3_0_turbo` @480p | `models_explore` | 2026-08-25 | DOCUMENTED |
| Premium final render | `seedance_2_5`, `kling3_0` pro, `cinematic_studio_3_0` | `models_explore` | 2026-08-25 | DOCUMENTED |
| Purpose-built ad formats | `marketing_studio_video`, `ms_image` (DTC Ads) — brand-kit aware | `models_explore` | 2026-08-25 | DOCUMENTED |
| Motion transfer from a driving clip | `motion_control` (Kling 3.0) | tool schema | 2026-08-25 | DOCUMENTED |
| Free/cheap edits instead of re-rolls | `outpaint` (all-crop served **locally free**), `upscale_image`, `reframe`, `remove_background` | tool schemas | 2026-08-25 | DOCUMENTED |
| Hook/retention prediction on a cut | `virality_predictor` | tool schema | 2026-08-25 | DOCUMENTED — advisory only, never a gate |

## Marketing Studio (structural, currently unused by Service Pow)

| Capability | Note | Source | Verified | Status |
|---|---|---|---|---|
| Brand kit | Can be auto-populated by fetching a website URL (logo, colours, fonts, tone, imagery); folds into every prompt | tool schema | 2026-08-25 | DOCUMENTED |
| Product / webproduct / avatar library | Define once, reuse — removes a major cause of re-rolls | tool schema | 2026-08-25 | DOCUMENTED |
| `ad_reference` | Generate to an analysed existing ad's scenario | tool schema | 2026-08-25 | DOCUMENTED |
| Hooks / settings | Explicit attention mechanic + location for supported presets | tool schema | 2026-08-25 | DOCUMENTED |

**Recommendation standing open:** build a brand kit per active client. Most re-rolls are
off-brand drift; a kit removes the cause. *(Not yet done — 2026-08-25.)*

## Known failure modes

| Failure | Evidence | Verified | Status |
|---|---|---|---|
| Generated marks/wordmarks read fake — "nearly right" is worse than absent | LB24, paid for in production | 2026-08-25 | SERVICE POW TEST |
| Slow-motion / uniform slowness fails the motion floor | documented 5-of-7 failure | 2026-08-25 | SERVICE POW TEST |
| Generated celebrations at readable distance look performed | LB25 | 2026-08-25 | SERVICE POW TEST |
| Unspecified crowd vocals generate as gibberish | LB26 | 2026-08-25 | SERVICE POW TEST |
| "During" state of real work cannot be safely generated | three-state structure | 2026-08-25 | SERVICE POW TEST |
| Batch-firing premium video burns credits fast | 6 × Seedance 2.5 in 22s = 195 credits, 2026-08-21 | 2026-08-25 | SERVICE POW TEST |

## Stale / needs verification

| Item | Why it matters | Action |
|---|---|---|
| Per-generation credit cost for models we have not run | Routing assumes rough tiers | Price before committing (`models_explore get`) — never assume |
| Vendor "lower credits" claim for `kling3_0 sound:off` | Cost lever we rely on | Measure on next Kling job, upgrade to SERVICE POW TEST |
