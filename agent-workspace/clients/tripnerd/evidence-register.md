---
title: "TripNerd — Evidence register (EV-tripnerd-nnn)"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [client, evidence, claims, bc-16]
---

# TripNerd: Evidence register

This is the client KB home for TripNerd Evidence Records, in the format set by
`.claude/skills/_servicepow/policies/claims-and-proof.md` §2. Deliverables cite these IDs. They don't re-argue the evidence.

**How to read a record**
- **Evidence status** follows the evidence ladder:
  - **CONFIRMED:** a primary source was seen, or the claim is cited from a dated record.
  - **INFERRED:** reasoning is stated.
- **Approval status** uses the policy's enum: APPROVED, RESTRICTED or WITHDRAWN.
  - A record is **not APPROVED** until its approver signs it off. For a claim about TripNerd, the approver is the CLIENT_APPROVER, and an email is enough.
  - TripNerd's CLIENT_APPROVER isn't named yet (**NEEDS INPUT**, test-month plan). So every record below is filed but **awaiting sign-off**.
- **Source media not on disk:** the THE PLAYERS videos (V23, V24) are not in this environment. Records 002 and 003 rest on two earlier written footage logs, not on a fresh viewing.

---

## EV-tripnerd-001: staffed TripNerd check-in table

| Field | Record |
|---|---|
| **Claim (exact wording approved for use)** | "Ours: a staffed TripNerd check-in table." |
| **Used in** | `campaigns/2026-10-05-hosts-carousel/` **v1**, card c2 (proof band). **v2 does not use this wording**: its c2 band is the narrowed EV-tripnerd-008 |
| **Evidence** | **IMG_1901**, sha256 `f942d3beb675e263ac0343b5571c9e98b17b112276cf9f014bd2818e04471a86`. EXIF 2026-04-09 09:03:55 −04:00; Apple iPhone 15 Plus. **Viewed 2026-10-05:**<br>- A table draped in a "TripNerd® FAN EXPERIENCES" cloth (the nerd-head mark and wordmark).<br>- Three people seated behind it, all wearing lanyards, with laptops, clipboards and papers.<br>- An enlarged crop shows the right-hand man's badge reading **"STAFF"**.<br><br>**IMG_1907** (09:04:03) shows the same table and the same three people. |
| **Source** | TripNerd's Drive library (folder `0AJj-fhf07xDjUk9PVA`, uploaded 2026-09-22). Working copy: session scratchpad `tn_assets/`. Library cleared to use by the APPROVER on 2026-10-04 ([launch-reels Bible](campaigns/2026-10-04-launch-reels/campaign-bible.md), Decision log). |
| **Supporting records** | [`footage-inventory.md`](campaigns/2026-10-04-launch-reels/footage-inventory.md): "Morning check-in: TripNerd-branded table, Nerds at laptops". Also EV-TN-AUG-04 (see cross-references). |
| **Date captured** | 2026-10-05 |
| **Captured by** | OPERATOR (Claude, static-ads subagent of the campaign director) |
| **Evidence status** | **CONFIRMED:** the table is TripNerd-branded and staffed (seen).<br>**INFERRED (strong):** that it served as the *check-in* point. This rests on the registration set-up at 9:03 AM and the earlier record's label; no guest is shown checking in. |
| **Scope / expiry** | Use without a date or place. The photo was taken at the Augusta-week property, and the carousel names neither. Don't pair it with any tournament name. Re-confirm if TripNerd changes how it runs arrivals. |
| **Approver** | CLIENT_APPROVER (TripNerd; not yet named) |
| **Approval status** | Awaiting sign-off (not yet APPROVED) |

## EV-tripnerd-002: guests watched 17 from the rail at THE PLAYERS

| Field | Record |
|---|---|
| **Claim** | "At THE PLAYERS, our guests watched 17 from the rail." |
| **Used in** | `campaigns/2026-10-05-hosts-carousel/` **v1**, card c3 (proof band). **v2 does not use this wording** (no event name): its c3 band is EV-tripnerd-006, which rests on the same footage records |
| **Evidence** | **Two independent written logs of TripNerd's own footage:**<br>1. [`footage-inventory.md`](campaigns/2026-10-04-launch-reels/footage-inventory.md) (main):<br>  - **V23** (2026-03-12, 54 s, one take): "TripNerd suite walkthrough: doors → banner → logo walls → lounge → out to the rail".<br>  - **V24** (2026-03-14): "Seated view from the suite; the putt; 17 erupts".<br>2. Branch `claude/brave-mendel-0vxkwj`, `campaigns/2026-09-29-real-footage/footage-log.md` (read with `git show`; logged at 1 frame per second):<br>  - V23 3–6 s "the blue suite banner 'TRIPNERD'", whose left half carries THE PLAYERS logo; 24.5–38.5 s "out to the rail: the island green, the water, the packed gallery below"; 39–41 s "guests seated at the rail".<br>  - V24 0–2 s "backs of two guests at the rail, 17 below".<br><br>**Also:**<br>- The [launch-reels Bible](campaigns/2026-10-04-launch-reels/campaign-bible.md) §9 names "the THE PLAYERS · TRIPNERD banner (V23)", and its §8 says V23 and V24 show "the same suite on different days".<br>- TripNerd's own Vimeo upload "TripNerd 17th Hole VIP Suite at The PLAYERS Championship" (uploaded 2026-03-12; branch `claude/brave-mendel-0vxkwj`, `campaigns/2026-09-30-five-more-real-footage/real-material-inventory.md` §1). |
| **Source** | TripNerd's camera roll. The originals are on Taylor's (TripNerd's) phone; only 720p copies exist (Higgsfield). **Not on disk here and not re-viewed for this record.** |
| **Date captured** | 2026-10-05 (from records dated 2026-09-29, 2026-09-30 and 2026-10-04) |
| **Captured by** | OPERATOR (Claude, static-ads subagent) |
| **Evidence status** | **CONFIRMED (by record):**<br>- THE PLAYERS (the event banner on TripNerd's suite);<br>- the hole is 17 (the island green below the rail);<br>- people seated at the rail in TripNerd's branded suite.<br><br>**INFERRED (strong):** that those people are *TripNerd's* guests. This rests on the TripNerd-branded suite; no guest list is on file. |
| **Scope / expiry** | No year or dates on image. The event name is a third party's mark: it goes in on-image copy only, and **never in hashtags**. tripnerd.com's PLAYERS page carries a non-affiliation disclaimer. Whether our posts need equivalent wording is TripNerd's call (open, see the carousel Bible). |
| **Approver** | CLIENT_APPROVER (TripNerd) |
| **Approval status** | Awaiting sign-off |

## EV-tripnerd-003: the suite's buffet was steps from the rail

| Field | Record |
|---|---|
| **Claim** | "In our suite on 17, the buffet was steps from the rail." Wording changed from the brief's "the food was…" to match the record ("buffet counter"). |
| **Used in** | `campaigns/2026-10-05-hosts-carousel/` **v1 only**, card c4 (proof band). **UNUSED in v2** (2026-10-05): the v2 c4 band is EV-tripnerd-007, and nothing in v2 says "steps", "buffet" or "suite". Kept on file; not withdrawn |
| **Evidence** | **Branch footage log** (as in EV-tripnerd-002): V23 is **one continuous 54.1 s take**:<br>- "16–19 buffet counter, chafing lamps";<br>- "21–24 through to the balcony";<br>- "24.5–38.5 out to the rail".<br><br>[`footage-inventory.md`](campaigns/2026-10-04-launch-reels/footage-inventory.md) (main) independently records V23 as "54 s, one take" ending "out to the rail". Its suite-photos row lists "guests eating at the rail; lounge buffet".<br><br>TripNerd's Vimeo 17th-hole suite video (frame seen 2026-09-30) shows "TripNerd wall, buffet counter, TV" in the same suite. |
| **Source** | As EV-tripnerd-002. Footage not on disk; not re-viewed. |
| **Date captured** | 2026-10-05 |
| **Captured by** | OPERATOR (Claude, static-ads subagent) |
| **Evidence status** | **CONFIRMED (by record):** the buffet and the rail are in the same suite on 17, reached in one unbroken walk.<br>**INFERRED:** "steps from". The camera reaches the rail about **5.5 s** after leaving the buffet (19 s → 24.5 s). The distance is not measured. |
| **Scope / expiry** | THE PLAYERS suite, March 2026. Don't generalise to other events or years. **If the Skeptic or the APPROVER finds "steps" too strong**, the fallback fully supported by the record is "In our suite on 17, the buffet and the rail were one short walk apart." |
| **Approver** | CLIENT_APPROVER (TripNerd) |
| **Approval status** | Awaiting sign-off |

## EV-tripnerd-004: TripNerd hosts guests at golf tournaments and other big events

| Field | Record |
|---|---|
| **Claim** | "TripNerd hosts guests at golf tournaments and other big events." |
| **Used in** | `campaigns/2026-10-05-hosts-carousel/`, card c7 (support), **v1 and v2** (same wording). `campaigns/2026-10-13-fan-experiences-carousel/` (C03) v1, card c4 (support, same wording) |
| **Evidence** | **1. 2026-09-30 online presence audit** (branch `claude/brave-mendel-0vxkwj`, `marketing-plan/2026-09-30-online-presence-audit.md`, read with `git show`):<br>- LinkedIn description, CONFIRMED and in TripNerd's own words: "…delivering bucket list events to corporate America. Super Bowl, Phoenix Open, THE PLAYERS, Final Four, Ryder Cup, Golf MAJORS, Country Music Awards, and much more…".<br>- tripnerd.com event pages exist for THE PLAYERS, US Open Golf, Augusta and the Derby (each about 665–690 words), and for the Phoenix Open, Daytona, CMA Fest and others (§4).<br><br>**2. Event-page package lines** (`real-material-inventory.md` §3, same branch): THE PLAYERS "17th Hole … Luxury Suite", "Full Open Bar & Food Within Suite"; Phoenix Open "16th Hole LOGE Suite Tickets".<br><br>**3. Our own records of hosting:** EV-tripnerd-002 (the suite at THE PLAYERS) and EV-TN-AUG-04 (the hosted Augusta-week day).<br><br>**4. Client brief** (VERIFIED): "premium fan experiences: marquee sports hospitality". |
| **Source** | TripNerd's website and LinkedIn as read on 2026-09-30; TripNerd's own media |
| **Date captured** | 2026-10-05 (from the audit of 2026-09-30) |
| **Captured by** | OPERATOR (Claude, static-ads subagent) |
| **Evidence status** | **CONFIRMED** |
| **Limits** | The US Open Golf page's package content was not recorded, only that the page exists. Neither the audit nor the inventory is on `main`; both are on branch `claude/brave-mendel-0vxkwj`. |
| **Scope / expiry** | General description. No event names, counts or "every"/"always" wording. Re-check if TripNerd's event list changes. |
| **Approver** | CLIENT_APPROVER (TripNerd) |
| **Approval status** | Awaiting sign-off |

## EV-tripnerd-005: tripnerd.com is where a hosted day is planned

| Field | Record |
|---|---|
| **Claim** | CTA "Plan yours at tripnerd.com" (implies the site lets a visitor start planning a hosted event day) |
| **Used in** | `campaigns/2026-10-05-hosts-carousel/` **v1**, card c7 (CTA pill). v2's CTA is "Plan yours · link in bio" (no URL on image); the bio link's destination is still this record's subject and still needs the BC-19 phone receipt. `campaigns/2026-10-13-fan-experiences-carousel/` (C03) v1, card c7 CTA "Plan yours · link in bio" (same dependency) |
| **Evidence** | **2026-09-30 audit §4:**<br>- `http://tripnerd.com` redirects to `https://www.tripnerd.com`;<br>- the site has one form, the contact form;<br>- event pages exist for each event (as EV-tripnerd-004).<br><br>The real-material inventory §4 notes a "Get a Quote" path. |
| **Source** | tripnerd.com as fetched 2026-09-30 |
| **Date captured** | 2026-10-05 |
| **Captured by** | OPERATOR (Claude, static-ads subagent) |
| **Evidence status** | **CONFIRMED as of 2026-09-30.** Not re-opened today; tripnerd.com isn't reachable from this environment. |
| **Scope / expiry** | Re-confirm at **BC-19**: Karl opens the Instagram bio link on his phone and confirms it lands on tripnerd.com with a working enquiry path |
| **Approver** | APPROVER (Karl) for the parity check; CLIENT_APPROVER for the claim |
| **Approval status** | Awaiting BC-19 receipt |

## EV-tripnerd-006: at the island-green 17th, guests watched from the rail

| Field | Record |
|---|---|
| **Claim (exact wording)** | "Ours: at the island-green 17th, guests watched from the rail." |
| **Used in** | `campaigns/2026-10-05-hosts-carousel/` v2, card c3 (proof band). `campaigns/2026-10-13-fan-experiences-carousel/` (C03) v1, card c3 (proof band, same wording) |
| **Evidence** | **The same two footage records as EV-tripnerd-002** (no new viewing):<br>1. [`footage-inventory.md`](campaigns/2026-10-04-launch-reels/footage-inventory.md) (main): V23 (2026-03-12, 54 s, one take) "… out to the rail"; V24 (2026-03-14) "Seated view from the suite; the putt; 17 erupts".<br>2. Branch `claude/brave-mendel-0vxkwj`, `campaigns/2026-09-29-real-footage/footage-log.md`: V23 24.5–38.5 s "out to the rail: the island green, the water, the packed gallery below"; 39–41 s "guests seated at the rail"; V24 0–2 s "backs of two guests at the rail, 17 below".<br><br>**"Island-green 17th":** the footage records place TripNerd's suite on the 17th at THE PLAYERS (EV-tripnerd-002), which is played on TPC Sawgrass's Stadium Course. That course's par-3 17th is the well-known island green: publicly documented general knowledge, not re-fetched in this session (the web is not reachable from here). The logs independently describe "the island green, the water" below the rail. |
| **Source** | TripNerd's camera roll (V23, V24). Originals on Taylor's (TripNerd's) phone; only 720p copies exist. **Not on disk here and not re-viewed for this record.** |
| **Date captured** | 2026-10-05 (from records dated 2026-09-29 and 2026-10-04) |
| **Captured by** | OPERATOR (Claude, static-ads subagent, round 2) |
| **Evidence status** | **CONFIRMED (by record):** the hole is the 17th with the island green below; people watched from the rail of TripNerd's branded suite.<br>**INFERRED (strong), exactly as in EV-tripnerd-002:** that those people are TripNerd's *guests*. This rests on the TripNerd-branded suite; no guest list is on file.<br>**Wording note:** "Ours:" + "guests" carries the same inference as EV-002's "our guests". |
| **Scope / expiry** | **No event name, year or date on image.** "Island-green 17th" is a description of a course feature, not the event's mark; never add the event name or "TPC Sawgrass" to the card, and no event marks in hashtags. Don't pair it with the Augusta-week photos as if one day (see the carousel Bible's open risks). |
| **Approver** | CLIENT_APPROVER (TripNerd; not yet named) |
| **Approval status** | Awaiting sign-off |

## EV-tripnerd-007: a hosted spread, set out for guests

| Field | Record |
|---|---|
| **Claim (exact wording)** | "Ours: a hosted spread, set out for guests." |
| **Used in** | `campaigns/2026-10-05-hosts-carousel/` v2, card c4 (proof band, with the IMG_1998 photo panel above it). `campaigns/2026-10-13-fan-experiences-carousel/` (C03) v1, card c6 (proof band, same wording; a tighter IMG_1998 crop of the tartlet plate) |
| **Evidence** | **IMG_1998**, sha256 of the working copy as recorded in the carousel's `qc/v2/photo-panels-v2.json`. EXIF 2026-04-09 17:46:54; Apple iPhone 15 Plus, iOS 26.3.1: the same phone and the same day as IMG_1901 (09:03, EV-tripnerd-001) and the roll behind **EV-TN-AUG-04** ("hosted by TripNerd": the branded check-in table, the IMG_2030 staff badge, the IMG_1985 "Private Party" banner).<br>**Viewed 2026-10-05:** a dessert table with no people: a platter of fruit and berry tartlets, glazed doughnuts, dessert cups, lemon bars on a riser, chocolate-dipped pieces; white linen, serving tongs. A small table card on a stand (venue name) is present in the frame and is **cropped out** of the panel (crop starts below it). No liquor, bottle or brand labels are visible. |
| **Source** | TripNerd's Drive library (folder `0AJj-fhf07xDjUk9PVA`, uploaded 2026-09-22); working copy `tn_assets/IMG_1998.JPG` in the session scratchpad. Library cleared by the APPROVER on 2026-10-04 (launch-reels Bible, Decision log). |
| **Date captured** | 2026-10-05 |
| **Captured by** | OPERATOR (Claude, static-ads subagent, round 2) |
| **Evidence status** | **CONFIRMED (seen):** a food spread laid out on a serviced table.<br>**CONFIRMED (by record, EV-TN-AUG-04):** TripNerd hosted guests that day.<br>**INFERRED (strong):** that this spread was part of TripNerd's hosted day and "set out for guests". It rests on the same phone, same day, about 8 hours into the hosted day, in an interior matching the IMG_1901 room style; the photo itself carries no TripNerd mark and shows no guests. |
| **Scope / expiry** | No date, place or event name on image. The photo is from the Augusta-week property: never pair with a tournament name. Don't claim TripNerd catered or cooked it; "hosted spread" means laid on for TripNerd's guests. |
| **Approver** | CLIENT_APPROVER (TripNerd) |
| **Approval status** | Awaiting sign-off |

## EV-tripnerd-008: a TripNerd-branded table, with staff on hand

| Field | Record |
|---|---|
| **Claim (exact wording)** | "Ours: a TripNerd-branded table, with staff on hand." |
| **Used in** | `campaigns/2026-10-05-hosts-carousel/` v2, card c2 (proof band, with the IMG_1907 photo panel above it; c1 shows the same table in IMG_1901). `campaigns/2026-10-13-fan-experiences-carousel/` (C03) v1, card c5 (proof band, same wording; IMG_1901 left crop below the faces) |
| **Evidence** | **Narrowed from EV-tripnerd-001 to what the photos show.** IMG_1901 (09:03:55) and IMG_1907 (09:04:03), 2026-04-09, iPhone 15 Plus: a table draped in a "TripNerd® FAN EXPERIENCES" cloth; three people seated behind it wearing "STAFF" lanyards (lanyard text legible on 1907 and 1901), laptops, clipboards; the right-hand man's badge reads "STAFF" (EV-001's enlarged crop). |
| **What it drops from EV-001** | The word **"check-in"** (EV-001's INFERRED element; the v1 Skeptic S2). The card's support line "One check-in point…" is advice, not a claim about this table. |
| **Source** | As EV-tripnerd-001 |
| **Date captured** | 2026-10-05 |
| **Captured by** | OPERATOR (Claude, static-ads subagent, round 2) |
| **Evidence status** | **CONFIRMED (seen):** the table is TripNerd-branded; the people at it wear STAFF lanyards. That they are TripNerd's staff rests on the TripNerd table plus EV-TN-AUG-04 (CONFIRMED). |
| **Scope / expiry** | No date, place or event name on image (Augusta-week property): never pair with a tournament name. Faces are cropped out of the published panel. |
| **Approver** | CLIENT_APPROVER (TripNerd) |
| **Approval status** | Awaiting sign-off |

---

## Cross-references: earlier Evidence Records (not renumbered)

These were filed before this register existed, in
[`campaigns/2026-10-04-launch-reels/qc/2026-10-04-v5-evidence-and-rights.md`](campaigns/2026-10-04-launch-reels/qc/2026-10-04-v5-evidence-and-rights.md).
They stay valid under their original IDs.

| ID | Claim | Label there | Relation to this register |
|---|---|---|---|
| EV-TN-AUG-01 | "9:03 AM", "5:44 PM", "5:48 PM" (EXIF times) | CONFIRMED | Same photo roll as EV-tripnerd-001; times not used in the carousel |
| EV-TN-AUG-02 | "Thursday" (2026-04-09) | CONFIRMED | Not used in the carousel |
| EV-TN-AUG-03 | "in Augusta" | INFERRED, strong; needs TripNerd's confirmation | **Not used.** The carousel bars "Augusta" (facts file) |
| EV-TN-AUG-04 | "hosted by TripNerd." (IMG_1901 table with staff, the IMG_2030 staff badge, the IMG_1985 banner) | CONFIRMED | Supports EV-tripnerd-001 and 004 |

**Register-level open items**
- Name TripNerd's CLIENT_APPROVER, then send one email that confirms the records in use by ID: for the hosts carousel v2 that is **004, 006, 007 and 008** (001, 002, 003 and 005 are v1-only; 003 is unused in v2). Per policy §2, an email is enough.
- Full-resolution originals of V23 and V24 from Taylor. Viewing them would move 002 and 003 from "by record" to "seen".
