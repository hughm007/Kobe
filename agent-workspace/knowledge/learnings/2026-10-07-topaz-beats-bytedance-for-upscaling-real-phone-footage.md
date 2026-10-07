---
title: "Topaz keeps real phone footage natural when upscaling; ByteDance's video upscale paints foliage"
type: learning
client: internal
owner: Karl
status: active
created: 2026-10-07
updated: 2026-10-07
tags: [video-production, upscale, higgsfield, topaz, instagram, real-footage]
---

# Topaz keeps real phone footage natural when upscaling; ByteDance's video upscale paints foliage

## What we did
For TripNerd's Augusta Reel (A6), we upscaled two 404×720 phone clips (a sunset lawn and a veranda with a musician and guests) for a 1080×1920 Instagram master. Both upscales ran on Higgsfield, and we compared them at 1:1 on the final frame against plain Lanczos.

## What happened (FACT)
| Method | Cost (4 s clip) | Faces | Hard edges (fence, chairs, roofline) | Foliage against sky |
|---|---|---|---|---|
| Lanczos (no AI) | 0 | Soft, true | Soft | Soft, natural |
| ByteDance video upscale, 2k, "ugc" | 0.15 credits | True, sharper | Sharper | **Painted, posterised texture, visible at phone scale** |
| 50/50 blend of ByteDance and Lanczos | 0.15 credits | True | Slightly sharper | Texture reduced, still visible |
| Topaz Video, 2160p | 5 credits | True, sharper, nothing invented | Sharper | **Natural** |

**Sources:**
- Topaz Video jobs `299ab2b2` and `c70356ed`; ByteDance jobs `66aaa88d` and `2bffad90`.
- Comparison frame: `clients/tripnerd/campaigns/2026-10-07-augusta-handled/qc/A6-upscaler-compare-hook.jpg`.
- The production log, observation 14.

## What we think it means
- **Real footage:** use Topaz when upscaling. ByteDance's preset upscaler is fine for generated clips (we used it on clip A at 4k), but on real trees it reads as an AI filter. That is the wrong look for footage sold as real.
- **Review at 1:1, where foliage meets sky.** Faces alone are not enough: both tools kept faces true, and only the tree line showed the difference.
- **Don't 4k-export for Instagram.** Instagram serves Reels at 1080×1920 and re-encodes every upload. Spend instead on:
  - upscaling only the shots that are below 1080;
  - a single high-bitrate encode (H.264 High, about 17 Mb/s, AAC 320 kb/s).

**Confidence:** Medium. This is one comparison on two clips, and nobody has viewed it on a phone after posting. Confirm on the next upscale before treating it as a rule.
