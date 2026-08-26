# The Service Pow cost ladder

**Quality is cheap at the still frame and expensive at the master.**
Frame fix = 1 image job · clip fix = 130+ credits · master fix = a rebuild.

Live numbers live in the capability map, not here. The **ratios** are what matters and they are
stable: exploration costs pennies, premium video costs hundreds of times more.

> Reference point, verified 2026-08-25: Soul V2 **0.12** · Nano Banana Pro **2.0** ·
> Kling v3.0 **7.5–12.5** · Seedance 2.5 **32.5**.
> **One Seedance 2.5 video = 271 Soul V2 images.**

---

## The four rungs — never start above rung 1

### Rung 1 — Explore the composition (fractions of a credit)
Cheapest capable image model (`soul_v2`, `z_image`, `nano_banana`). Answer: is the framing right,
does the idea read, is the world believable? Iterate freely here — this is the only rung where
iteration is nearly free.

### Rung 2 — Lock the text and the detail (~2 credits)
Only once composition is settled. `nano_banana_pro` / `openai_hazel` for legible text. Marks and
legal copy are **still not generated** — they are composited (LB24).

### Rung 3 — Motion test (cheap video)
`seedance_2_0_mini` or `kling3_0_turbo` at 480p. Answer: does the motion work, does the
performance hold, is there a physics or hand failure? A cheap motion test before a premium render
is the single highest-return habit in the ladder.

### Rung 4 — Premium final, once
`seedance_2_5`, `kling3_0` pro, `cinematic_studio_3_0`. **One** generation, not a batch. If rungs
1–3 were done, this usually lands.

---

## Standing savings rules

| Rule | Why |
|---|---|
| **One test before any batch** | 6 × Seedance 2.5 in 22 seconds = 195 credits (observed 2026-08-21) |
| **Edit, don't re-roll** | `outpaint` / `upscale` / `reframe` / `remove_background`; an all-crop outpaint is served **free** |
| **Reuse identity** | brand kit, product, avatar and reference inputs stop consistency re-rolls |
| **`sound: 'off'`** | do not pay to generate audio you will replace with a licensed track |
| **Right resolution for the placement** | 4K for a feed ad is money burned |
| **`mode: fast` / mini variants for tests** | full quality is for the final only |
| **Price before you commit** | read the real cost; never assume a tier |
| **Check `balance` before a batch** | and report spend after the session |

## The two failure patterns to interrupt

1. **Premium-first.** Firing Seedance 2.5 to "see if the idea works". The idea is tested at rung
   1 for a fraction of a credit.
2. **Batch-before-test.** Firing six variations at once. One test tells you whether the other
   five were worth firing — and usually they were not, or they needed a different prompt.

## When the ladder is skipped legitimately

A shot already proven at rungs 1–3 in this campaign, being re-rendered after a small prompt
change, may go straight to rung 4 — say so in the routing reason. "Deadline" is not a legitimate
reason: a rushed premium render that fails costs more time than the motion test would have.
