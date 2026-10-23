# Owner taste: what gets ads approved (read before every advert)

Owner's standing preferences, mined on 2026-10-23 from every recorded owner verdict (7 approved
adverts, about 12 killed or rejected) across the repo. Each rule names its evidence. It sits beside
the Advert Brief and does not override Service Pow law. Full evidence:
`agent-workspace/knowledge/learnings/2026-10-23-owner-feedback-review.md`.
When the owner gives new feedback, update this file in the same session.

## How approved differs from killed
- **Approved:** real client footage and photos carry the people beats; motion design or a device
  (camera roll, ticket stub) tells the story; the owner's own cut. (Hosting spot 8.4, Camera Roll,
  Augusta 7.7, Daytona, Derby static, Phoenix Reel.)
- **Killed:** generated people at readable distance, all-generated pictures, frozen crowds, animated
  stills standing in for the product, or a concept that misses the idea. (YOUR PEOPLE "sucks, i hate
  it", 911 realistic 4/10, Phoenix fly-up, Two Ways v2 "don't like it, just stop".)

## Video
1. **Slow down.** The most repeated complaint (about 8 times): "Seems rushed… don't have so many cuts",
   "feels too rushed", "make it a lot slower", "voiceover feels rushed". Fewer, longer shots. Open on
   one take that breathes before the payoff. Hold payoffs 2-3 s or more. Read voiceover slower.
   If it runs long, add time at the front, never the end. Stay under about 30 s. This overrides the
   generic "visual change every 3 s" advice in `playbooks/ads/video-production.md`.
2. **Real beats fake.** About 9 kills were for fakeness. No generated people at readable distance, no frozen
   crowds, no wrong-speed motion, no photo animated to stand in for the product or a place we sell.
   AI is fine where it is not obvious (the owner judges; see Advert Brief).
3. **Event logic must be right.** The crowd faces the action and reacts on cue, sized to the
   outcome ("the ball never goes in, so don't make them too excited, just like clapping"). Real
   speed. The ball stays visible. No repeated actions (no "two backswings").
4. **Sound:** music on every cut plus a real-sounding voice where there is speech. The voice matches the
   emotion ("I want him to sound relieved"). The real crowd sound peaks on the payoff.
5. **Captions:** few, cut on statically (a pop-in reads as "zoom"; an accelerating push reads as
   "squish"). The owner reads captions literally against the frame: only say what the frame shows
   and what the client sells ("LOGE" and "Food & drink" were both caught).
6. **End:** reuse the client's approved end card, spoken sign-off ("All done with TripNerd!"), fade
   at the very end, no hard cut.
7. **Liked hook:** a real-behaving phone chat (iPhone look, 2-3 messages, slow, no floating
   bubbles, about 6-8 s). The owner liked it twice.
8. **Quality:** 1080p native body; check centring, crops and judder on every shot.

## Statics
1. **No "AI slop" layout.** The rejected look was rounded photo cards, stickers, centred stacks,
   pill buttons. The fix that worked: full-bleed real photo, one strict grid, one accent, a thin rule
   with the contact line.
2. **One tactile device plus proof only the client has.** The approved Derby static was a ticket
   stub over a real crowd photo, plus an "Ours:" Polaroid of TripNerd's own check-in table
   ("so each ad shows something only a TripNerd guest gets"). The headline belongs to that exact photo.
3. **Cover marks, never blur.** Hide logos under the ticket or Polaroid, or crop them out. "Real photos
   only, light grade, no blur, no face edits."
4. **Original logo file, top-left** unless the owner says otherwise.
5. **TripNerd banned words** (Derby brief, 2026-10-20): handled, VIP, exclusive, owns, private,
   best, #1, guaranteed, "DM us", "book now", tag a friend. Check before the first render.
6. **Once approved, the layout is frozen.** Later polish only adds; keep the approved file as reference.
7. **Don't copy the client's feed.** TripNerd's feed is "gallery photo + blue headline bar" (19 of 21
   posts). Their September carousel copy is not reused.

## Working with the owner
- **Show something fast** (first artifact in about 10-15 minutes), then improve it together. Gates run
  once, on the frozen final, not on every draft.
- **Explain what you think he wants before building anything novel**; confirm whether he wants a
  script or a build.
- **When asked for options, render both and send both.** Stop the moment he says stop.
- **Preview generated pieces on their own** before putting them into the advert ("let me see the
  burnout clip before adding it").
- **Layouts that look like mistakes** (small boxes on blur read as "cropped") need a visible reason
  (logo, frame) or should not be used.
- **Never describe media from memory or a thumbnail contact sheet**; look at full size.
- **Before any generation spend, prove the output can be downloaded into the build.**
- **TripNerd standing approvals:** guest consent ("Always assume that", 2026-10-06), the whole
  library is cleared to post (2026-10-04), media authorization (2026-09-28). Do not re-ask.
- **Record every verdict** (score plus one line why) in the client's `07_Client_Approved` or the
  rejection in the campaign folder, and update this file.

## Waiting on owner rulings (conflicts in the record)
1. **On-screen AI labels.** He asked to remove "AI generated" and "Scenes dramatized"; policy wants
   disclosure. The platform AI toggle at posting stays either way.
2. **Animated photos.** Banned for product or place shots (Augusta house), but the approved Daytona
   burnout was one. Proposed reading: OK for a payoff moment, never for what we sell.
3. **Sponsor logos.** "Fine in frame" (Daytona, Phoenix R3) versus "cover them" (Derby, brand guide).
4. **Blurred backgrounds.** The Daytona boxed-on-blur layout was approved; Phoenix R21 said "No blurred
   backgrounds".
5. **"Handled".** Banned in the Derby brief, yet "Augusta, handled" was approved.
6. **TripNerd's own rule "AI never creates a person"** versus the 10-19 "AI allowed anywhere".
