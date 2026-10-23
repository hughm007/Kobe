---
title: "Phoenix footage: Grok blind analysis vs Claude, reconciled"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-19
updated: 2026-10-19
tags: [client, phoenix-open, video, real-footage, external-review]
---

# Grok (Step 1, blind) vs Claude: who was right, checked against the files

**Source:** Grok's answer is `TripNerd_Phoenix_GROK_STEP1_ANSWER.md` (owner upload, 2026-10-19). Every disputed claim below was re-checked against the media (full-size frames, EXIF, audio levels).

## 1. Rule changes in Grok's answer: not yet on record here
Grok worked under rules attributed to Wyatt that this workspace has never been given:
- Faces in all real TripNerd footage are approved by Jason (CEO). The only remaining face risk is identifiable pros in paid use.
- **No blurring.** Marks may only be cropped, reframed or trimmed out.
- TripNerd banned words: VIP, exclusive, owns, private, **handled**, best, number-one, guaranteed, "DM us", **"send this to…"**, tag-a-friend, and "Book now" unless confirmed.
- Cards are 6 words max. Event names go in the caption only. Photos stay static, with no AI upscaling.

**NEEDS INPUT:** confirm these rules, ideally with Jason's face approval in writing. Once confirmed, they go into `brand-guide.md` (its "Words to avoid" is still blank).

**If confirmed, Claude's earlier work breaks them:**

| Work | What breaks |
|---|---|
| Augusta cover ("Augusta, handled.") | Banned word "handled" |
| Phoenix concept 2 ("Phoenix, handled.") | Banned word "handled" |
| Daytona Script 1 v2 ("Send this to your crew.") | Banned "send this to…" |
| Every plan that blurred marks | No blurring |

## 2. Verdict on the disputed points

| Point | Grok | Claude | Checked result | Winner |
|---|---|---|---|---|
| Biggest crowd reaction | V04, about 10.5 s | V03, after the bunker shot, about 6 dB | V04 swells about 12 dB above its baseline (−16 vs −28 dBFS RMS) at 10.5–11.0 s, the largest in the set. Grok also caught V01's 8–10 s swell (−16 dB), which I didn't report | **Grok** |
| V04 "ball stops a foot from the pin" | Stated as fact | Not described | **Not verifiable.** At 720p the ball can't be seen in any frame from 9.6 to 11.8 s (cropped top band checked). The swell suggests something happened; the "foot" is a guess | Neither: unproven |
| V03 player identity | Board names: Spieth, Hoffman, Kitayama | "Small, maybe identifiable" | The board at 0–1.5 s reads "NOW ON GREEN: JORDAN SPIETH / CHARLEY HOFFMAN / KURT KITAYAMA", so the bunker player is one of three named pros. That is a likeness risk in paid use and also a lead for dating the clip | **Grok** |
| Marks on the wall across every frame of the 16th | Flagged as the core problem when blurring isn't allowed | Planned to blur | Confirmed: the WM/FedEx wall band crosses the middle of V01–V03 (V01 at about y 985–1005 of 1920) | **Grok** (under the no-blur rule) |
| P01 is a screenshot | Yes | "Lowest resolution" only | EXIF has 4 tags, 144 dpi and an odd 958x1704 size, consistent with a screen capture or crop, not a camera original | **Grok** (probable, not proven) |
| P08 clean 4:5 crop | x380–1260, y900–2000 | Not given | Rendered and checked: it removes the board, the wall and the cap. One thing it leaves in: a red banner on the rail whose white/black emblem may be a team mark. Check it | **Grok**, with one flag |
| P09 on screen with a "2024" label | Keep it as evidence only | Show it labelled 2024 | With no blurring, the "WELCOME TO THE 2024 [event]" board can't appear on screen. The 2024 label moves to the P08 crop, which matches P09 exactly | **Grok** |
| GPS in the delivered files | Missing | Stated as embedded | The originals have it. **My re-encode for the pack dropped it** (the MP4 shows encoder tags only) | **Grok** (my packaging error) |
| P08 "2025" trap, P10 Augusta composite, V01/V02 duplicates, no real roar | Caught all four | Caught all four | Both | Tie |
| What the package actually sells | C1 opens on V04, which isn't the 16th or the suite; Grok flags this itself | Built around the rail view | V04 is at the gallery ropes about 0.8 km away. Opening on it sells an experience any ticket gets | **Claude** |
| Hook works with sound off | C1: "Watch the ball." | Contrast cards | The ball is invisible at 720p on a phone. With sound off, C1's hook is a shot of a man's back and a distant flag | **Claude** |

**Score:** Grok was right on 7 points, I was right on 2, we tied on 1, and 1 is unproven. Grok's blind pass beat mine on detail: audio, scoreboard text, EXIF, and crops under the stated rules. Mine was stronger on what the ad has to sell.

## 3. Merged concept (recommended first): "Down there / Up here", Grok-compliant
- Native audio only; no added roar.
- Every card is 6 words or fewer, with no banned words. The event name appears in the caption only.

| Time | Source (in–out) | Card | Note |
|---|---|---|---|
| 0.0–1.8 | V01 [2.2–4.0]: the packed crowd below the rail | "Down there, shoulder to shoulder." | A **cut**, not a reversed pan, so nobody walks backwards. Warm, not mocking |
| 1.8–3.8 | V01 [0.0–2.0]: canopy, rail, guests | "Up here: shade and a rail." | The answer to the contrast, in the first 4 s |
| 3.8–7.3 | V03 [2.3–5.8]: the bunker shot, then the swell | "Pros play right below." | Grok's line. Real reaction |
| 7.3–10.0 | P08, static 4:5 crop x380–1260 y900–2000 | "Your group, rail side." + small "2024" | The year is proven through P09 |
| 10.0–13.0 | End card: original logo | "Talk to a Nerd" + "Link in bio" | — |

- **B variant for a Trial Reel:** Grok's C1 opener, V04 [8.6–12.2], replaces 0.0–3.8. It tests the near-miss sound hook against the contrast hook. Judge them on 3-second hold and sends per reach.

## 4. Blockers, in order
1. **The wall band.** With no blurring, every shot of the 16th carries WM/FedEx. One of these is needed:
   - Wyatt approves solid caption panels placed over the band; or
   - accept a soft 720p reframe; or
   - get cleaner footage.

   Nothing can be built until this is decided.
2. Confirm the rules in §1 and record them.
3. Originals of V01 and V03 (1080p/4K, with capture dates). The 720p copies will look soft at full screen.
4. Clear, or keep organic-only, the identifiable pros: V03 by name on the board, V04 by face.
5. Check the red banner in P08.
