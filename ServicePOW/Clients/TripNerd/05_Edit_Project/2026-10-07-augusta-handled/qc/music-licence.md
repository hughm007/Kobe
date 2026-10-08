---
title: "Augusta A4 — music licence evidence (Mixkit 'Golden Storm')"
type: report
client: tripnerd
campaign_id: 2026-10-07-augusta-handled
owner: Karl
status: active
created: 2026-10-07
updated: 2026-10-07
tags: [licence, music, mixkit, bc-20, evidence]
---

# Music licence evidence: Mixkit #470 "Golden Storm" (Diego Nava)

**Track:** "Golden Storm" by Diego Nava, Mixkit item 470, file `https://assets.mixkit.co/music/470/470.mp3` (MD5 `4fc47eba…`, 95.5 s). Mixkit tags it EDM, Elegant, Positive; it has no vocals (faster-whisper finds no words, see [`qa1.md`](qa1.md) BC-26).
Mixkit lists it under its free music library (`assets.mixkit.co`). The Envato preview tracks that sit on the same Mixkit pages are paid Envato Elements items and were excluded.

**How A4 uses it:** a synced background bed under the picture, 18.12 s from 2.11 s into the track. Its drop (15.11 s in the track) lands on the cut into the end shot at 13.0 s. It is ducked under the voice, has card sound effects on top, and fades out at the end. It is never distributed as a music-only file.

## The licence, captured 2026-10-07 (Playwright render of `https://mixkit.co/license/#musicFree`, sandbox)
Verbatim text of the "Stock Music Free License" modal:

> **Allowed:** Podcasts · Social Media video posts · Online marketing ads · Educational Purposes · YouTube videos*
> **Not Allowed:** CDs & DVDs · TV & Radio Broadcasts · Video Games
>
> Items under the Mixkit Stock Music Free License can be used in your commercial and non-commercial projects for free.
>
> You're permitted to download, copy, modify, distribute and publicly perform the Music Items on any web or social media platform, including internet-based video on demand services, podcasts and advertisements.
>
> You're not allowed to use them in CDs or DVDs, video games or tv or radio broadcast. You're also not allowed to remix them (or incorporate in a music-only track), claim them as your own or register them on any rights management service.
>
> There are some important limits to these rights, described in our User Terms.
>
> \* If you receive a claim, please forward the details to team@mixkit.co for assistance.

**User Terms** (`https://mixkit.co/terms/`, fetched 2026-10-07 12:54 UTC in the sandbox, HTML MD5 `37363ada…`). Clause 9 "Restrictions" covers:
- use that breaches the Acceptable Use Policy;
- reselling copies of an item without substantial alteration;
- redistributing items on a stock basis;
- building a competing library;
- using "Envato" or "Mixkit" as a trademark;
- removing watermarks;
- mass downloading.

Clause 10 applies the item's Mixkit License to all use. **None of these restricts using a track as the background of an advert on social media.**

## What this means for posting (FACT unless marked)
- **Allowed by the licence:** organic Instagram/Facebook Reels and paid Meta ads (the licence names "Social Media video posts" and "Online marketing ads"), with no attribution.
- **Not allowed:**
  - TV or radio placement of this cut;
  - registering the audio with any rights-management or Content ID service;
  - uploading the track on its own.
- **If a platform claim appears:** forward it to team@mixkit.co (the licence's own instruction).
- **ESTIMATE:** free-library tracks occasionally draw automated claims when a third party has wrongly registered them. If that happens on a boosted post, the fallback is the original bed already composed for this campaign (`build/music.py`). An Epidemic or Artlist subscription is the upgrade path if TripNerd scales paid spend.
- **Why not the music in competitors' Reels:** it is licensed to them (or to Meta's in-app library for organic use), and Meta's business/ads catalogue does not carry trending commercial songs. Copying it would risk muted or rejected ads. A cleared, baked-in track plays identically in organic posts and ads, and the Reel credits as TripNerd's original audio.
