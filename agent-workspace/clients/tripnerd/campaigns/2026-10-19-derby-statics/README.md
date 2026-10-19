---
title: "TripNerd — Louisville race-day ticket statics (5 x 1080x1350)"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-19
updated: 2026-10-19
tags: [client, static, derby, louisville, real-photos]
---

# Louisville race-day ticket statics (draft, internal)

Five feed statics (1080x1350) from real Drive photos. Picks and rejects: [photo-picks.md](photo-picks.md).
Rebuild: `TN_LOGO=<tripnerd-logo-colour-1633x601.png> python3 build_statics.py <derby originals dir> <out dir>`.
Rendered JPGs are not committed (client photos stay out of git).

## Why this looks different
- **What TripNerd's feed does (from Insights and the growth plan; the live feed could not be opened: login wall):**
  mostly static graphics, an aspirational headline laid over a photo ("You Don't Need to Know Someone
  Who Knows Someone"). Our own Louisville carousel draft (2026-10-13) used a burgundy serif over a gradient
  with P181, P174, P183, P178 and P047.
- **This set:** the photo stays clean and the copy sits on a printed race-day ticket stub dropped onto the
  scene. Each headline is about what is in that exact photo, so the line cannot be moved to another picture.
  The ticket also carries the offer (seats, hotel, rides handled; food and drink included), the date
  and the action, so it reads as an advert, not a mood post. None of the five photos are in the carousel draft.

## The five
| # | Photo (EXIF) | Ticket headline | Caption |
|---|---|---|---|
| 1 | P185 spires at sunset (2026-05-01) | STAY TILL THE LIGHTS COME ON. | The last race ends. The night doesn't. Louisville, Saturday, May 1, 2027: seats, a downtown hotel, rides, and food and drink, all handled by a Nerd. Talk to a Nerd at the link in bio. |
| 2 | P179 champagne couple (2026-05-01) | THE BUBBLY'S COLD. THE PLAN'S DONE. | Somebody brought the bubbly. Somebody else sorted the seats, the hotel and the rides. (That was us.) Louisville, May 1, 2027. Talk to a Nerd at the link in bio. |
| 3 | P182 rose jacket and bowler (2026-05-02) | HIS JACKET. OUR PLAN. | He picked the jacket. We picked up everything else: seats, hotel, rides, food and drink. Louisville, May 1, 2027. Talk to a Nerd at the link in bio. |
| 4 | P184 race-finish cheer (2026-05-02) | HE PLANNED NOTHING. LOOK AT HIM. | This is what race day looks like when someone else did the planning. Louisville, May 1, 2027. Bring your group: talk to a Nerd at the link in bio. |
| 5 | P050 phones up as the field passes (2026-05-02) | EVERYONE'S FILMING IT. YOU'RE LIVING IT. | Every phone in the place was up. Louisville, May 1, 2027: seats, a downtown hotel, rides, and food and drink handled, so you can just watch. Talk to a Nerd at the link in bio. |

## Edits made
Crop to 4:5 (downscale only), contrast +6 %, colour +5 %, the real TripNerd logo file (scaled only).
Plain Gaussian blur, no AI, over marks: the "152 Kentucky Derby" cap (P182), "Churchill Downs" on the
champagne bucket and the Veuve Clicquot label text (P179), a "Kentucky Oaks" sign and a branded cup (P184),
the twinspires and SAP signs (P050). No person, face or body was altered.

## Not postable until
- **Guest consent** for every recognisable person (Drive READ ME rule: internal until TripNerd confirms).
- **Claims confirmed in writing by TripNerd:** seats, hotel, rides "handled" and food and drink "included"
  (source: tripnerd.com Derby page and FAQ: premium race access, food and beverage included, luxury hotel,
  concierge-managed logistics, transportation coordination). Date May 1, 2027 from the same FAQ.
- **Spires (P185, also in P182 background):** Churchill Downs trade dress. TripNerd decides; the copy never
  names the event or venue.
- **Alcohol (P179):** Meta requires alcohol ads to target 21+ (18+ outside the US); set at launch.
- Ad 4's line jokes about a real guest: get his OK along with the photo release.
