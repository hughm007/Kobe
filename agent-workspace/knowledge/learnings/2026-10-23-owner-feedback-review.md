---
title: Owner feedback review — every recorded verdict on video and static ads (Aug–Oct 2026)
type: learning
client: internal
owner: Karl
status: active
created: 2026-10-23
updated: 2026-10-23
tags: [ads, video, static, owner-feedback, pacing, realism, process]
---

# Owner feedback review (2026-10-23)

**Why:** the owner asked to go back through all his feedback and learn what he has been trying to
get the system to do. The rules distilled from it are in `.claude/OWNER-TASTE.md`, which every
session loads. This file holds the evidence. Method: three read-only agents searched the whole repo
after the 2026-10-23 merge (PR hughm007/Kobe#2), covering video, statics and process. Quotes are as
recorded. A SUMMARY is an agent's paraphrase in the source file.

## Video verdicts
| Advert | Date | Outcome | Owner's words (source) |
|---|---|---|---|
| 911 Drain "2:07 AM" v8 | 08-20 | Killed | SUMMARY "motion inert, dead-space open, dissolve-only cuts, price line too fast" (clients/911drain/client-brief.md) |
| 911 Drain realistic lane | ~09-02 | 4/10 (illustrated 7/10) | SUMMARY; generated audio failed outright (learnings/2026-09-02-audio-decoupled-from-visual.md) |
| 911 Drain voice | Aug | Defect | "I want him to sound relieved" / "sounds AI, she speaks too quick and it's robotic" (lesson-bank LB41) |
| Service Pow intro | 08-31 | Process redirected | "I would rather have something made for me that I can look at within 10 minutes" (worklog) |
| TripNerd 17th hole v3-v7 | 09-23 | Set aside | "Two backswings", "Ball and hole look fake", "20 s cut felt choppy; the back half must be one video", "quality over quantity", "still kind of seems fake" (ServicePOW/…/2026-09-23-17th-hole/) |
| Hosting spot | 09-27 | Approved 8.4 | "Idea was great… the quality of the advert full screen looks low quality… I liked how chat only used its strengths… the realism was there." (07_Client_Approved) |
| YOUR PEOPLE | 09-29 | Killed | "looks very fake… basic, boring, not realistic"; "sucks, i hate it scratch the whole advert idea" (ten-scripts/your-people-build-log.md) |
| Their Camera Roll | 09-29 | Approved, above 8.4 | "we need to be able to capitalize on the real client footage and this advert is a good example of that" (07) |
| Two ways to see the 17th v2 | 10-06 | Rejected | "don't like it, just stop" (worklog) |
| Book It Now | 10-06 | Redirected | "I hate still images… in this instance it does not look good" (book-it-now/script-v4-transformation.md) |
| Missing the Moment v4-v9 | 10-06 | Not approved | "Seems rushed. Try to like slow down… just don't have so many cuts like in the beginning… just have him waiting there and chilling and then something big happens" (campaign-bible.md) |
| The Thread v1-v7 | 10-06 | Not approved | "you're just using the wrong footage after"; "feels too rushed"; "make it a lot slower… the ball never goes in, so don't make them too excited, just like clapping" (worklog) |
| Augusta, handled | 10-08 | Jason approved; owner 7.7 | "I just really don't like how the house is a still image and it looks fake"; earlier "the voiceover feels rushed" (07) |
| Daytona suite Reel | 10-19 | Approved after ~10 rounds | "why is everything cropped?" (boxed on blur); STAFF read mirrored; "let me see the burnout clip before adding it"; quality "looks pretty low resoloution"; wanted dates, the approved end card, A/B versions (this session's chat) |
| Phoenix fly-up | 10-19 | Rejected | SUMMARY "No aerial… The crowd is frozen. 'TROON' is legible." |
| Phoenix Reel R1-R21 | 10-20/22 | Iterated | SUMMARY: pop-in caption read as "zoom", accelerating push as "squish", "Food & drink" read literally, "No blurred backgrounds" (worklog; r7 build-record) |
| Phoenix Open Reel 31 s | 10-23 | Approved | Approved once the ticket said "16th Hole Suite", not "LOGE" (07) |

## Static verdicts
| Advert | Date | Outcome | Owner's words (source) |
|---|---|---|---|
| Derby "Everyone's filming it" (ticket stub + "Ours:" Polaroid) | 10-20 | **Approved**, the only approved static on record | Brief: "so each ad shows something only a TripNerd guest gets"; "Use the original logo top-left"; "Real photos only, light grade, no blur, no face edits"; banned "handled, VIP, exclusive, owns, private, best, #1, guaranteed, 'DM us', 'book now', tag a friend" (ServicePOW/…/2026-10-20-derby-ticket-statics/README.md) |
| Louisville ticket statics x5 | 10-19 | Superseded; #5's headline became the approved ad | No verdict recorded; they broke two rules later stated in the Derby brief ("handled", blur over marks) |
| Randy's Rooter spec | 10-20 | v1 rejected | "looks like AI slop" (clients/prospects/randys-rooter-midland/prospect-brief.md) |
| IG Story week v2 | 10-04 | Rejected | SUMMARY "too generic and repeated the feed" (worklog) |

**Gap:** the owner counts about 6 approved statics; the repo records 1. The other approvals are
in chat only and need recovering from the owner.

## Patterns, by frequency
1. **Too rushed / too many cuts** (about 8). Not captured before; `video-production.md` pushed the opposite.
2. **Looks fake** (about 9; the main reason ads were killed). Partly captured (decision 0008; animated-stills learning).
3. **Event and physics logic** (about 7). Not captured.
4. **Audio register and presence** (about 7). Partly captured (LB41).
5. **Picture quality and framing** (about 7). Partly captured (the 8.4 learning).
6. **Captions read literally and motion read as zoom/squish** (about 6). Not captured.
7. **End card reuse plus spoken sign-off** (about 5). Captured in the Reel playbook.
8. **Process: show fast, explain first, both options, stop when told** (about 6). Scattered; now in OWNER-TASTE.
9. **Statics: no AI-slop layout; device plus client-only proof; cover don't blur; banned words** (3-4 each). Not captured before.

## Repeated agent mistakes the owner had to correct
- Built when he wanted a script or something else (Phoenix S1, website review set, Two Ways).
- Described media from memory or 180 px contact sheets (3 recorded misses).
- Spent generation credits before proving the output could be downloaded (08-31, then 10-21: 179 credits).
- Claim words caught only after render ("LOGE", "Suites", "Food & drink").
- Full dual gates on every draft despite the 08-31 "gate once on the final" rule.
- Rules stranded on branches: the guest-consent approval (10-06) was invisible to the 10-19 session,
  which then flagged consent for nothing.

## Conflicts that need an owner ruling
Listed at the bottom of `.claude/OWNER-TASTE.md` (AI labels, animated photos, sponsor logos, blurred
backgrounds, "handled", TripNerd's own AI-person rule).
