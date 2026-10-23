---
title: "TripNerd — week-one setup checklist (for the call with Jason)"
type: playbook
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [client, instagram, onboarding, setup, test-month, checklist]
---

# Week-one setup checklist

Use this on the setup call with **Jason (CEO)**. Each item has an owner, a "done when" and the place it gets recorded.
- **Deal:** October test month, $1,500, agreed verbally ([plan](../2026-10-test-month-plan.md)).
- **Posting starts Wed 7 Oct**, subject to the approver ([launch-week runbook](../launch-week-2026-10-07.md)).
- **Roles:** OPERATOR, APPROVER and SPEND_APPROVER are Karl. CLIENT_APPROVER is TripNerd's named approver (**NEEDS INPUT**: not named yet).
- **Never write a password, code or token in any of these records.** Pointers only ([`../../../access-and-accounts.md`](../../../access-and-accounts.md)).

**Leave the call with, at minimum:** items 1, 3, 4, 6 and 19. Without them, Wed 7 and Thu 8 can't post.

## Commercial

| # | Item | Owner | Done when | Recorded in |
|---|---|---|---|---|
| 1 | **The $1,500 October invoice sent** | Karl | Sent, with its date and number. Tracker rule: no work on TripNerd's account before it | [`../tracker.md`](../tracker.md) → Invoices (Oct row) |
| 2 | **Written confirmation of scope** | Karl sends a short summary; Jason replies yes | Jason's written yes to: 4 Reels at $300 and 4 statics at $75 ($1,500); the 3 owed September adverts (1 video, 2 statics) at no charge; 11 posts; Stories Mon/Wed/Fri 10 AM plus a Story share of each post within 15 min; the Monday report; 20 min of engagement every weekday; the review in the first week of November | Tracker → Engagement state (deal status). Save the email pointer in the client folder |

## People

| # | Item | Owner | Done when | Recorded in |
|---|---|---|---|---|
| 3 | **Name the approver** | Jason | A named person, how to reach them, and their agreement to answer within 2 business days | Tracker → Engagement state ("TripNerd approver"); plan header (Roles) |
| 4 | **Name the DM owner** | Jason | A named person who answers DMs the same day and counts enquiries for the Monday report | Tracker → Engagement state ("inbox owner") |
| 5 | **Who taps Post for Trial Reels and sticker Stories** | Jason | A named person with TripNerd's Instagram on their phone, and an agreed way for us to send them files, captions and sticker text | Tracker → Engagement state; [`stories-runbook.md`](stories-runbook.md) |
| 6 | **Who runs the daily engagement** (20 min every weekday) | Jason and Karl | The split is agreed and written down. **Our recommendation:** we answer comments and DMs through the Business Suite Inbox; TripNerd does outbound comments (on other accounts) from our daily list, unless they grant app access. Outbound commenting is likely app-only, which is **UNVERIFIED**: test it once partner access works. App access for us crosses the "no passwords" line, so that's Karl's call | [`engagement-daily.md`](engagement-daily.md) (SA-OPS-B); tracker |

## Access and data

| # | Item | Owner | Done when | Recorded in |
|---|---|---|---|---|
| 7 | **Partner access** (steps below) | Karl (before and after); TripNerd's portfolio admin (on the call) | Access test passed: the Inbox opens, and a draft post is scheduled and then deleted. The ad account stays **out** until a boost budget is approved | [`../../../access-and-accounts.md`](../../../access-and-accounts.md) (Meta Business Manager and Social accounts rows; pointers only); tracker → Week-one setup |
| 8 | **Supermetrics Instagram Insights login** | Karl, with TripNerd if the login needs their account | The Instagram Insights source shows TripNerd's account and a test query returns data. **Instagram Login preferred** (Facebook Login expires after about 60 days). How the Instagram Login is done without us holding a password: check live in Supermetrics. The trial account's email isn't Karl's (connector register): confirm the owner | [`../../../../../operations/connector-register.md`](../../../../../operations/connector-register.md); tracker → Engagement state |
| 9 | **Supermetrics paid plan decision** | Karl | Decided **by Fri 16 Oct** (the free trial ends Sun 18 Oct). **Check the price live**; nothing is on file. Fallback: a weekly Insights export (free) | Tracker → Blockers; plan §6 |
| 10 | **Insights baseline**, including September's net follows | Karl / Claude, once access works | Captured with the date and source: followers on the start date; September's net follows (1–30 Sep); median Reel views; non-follower share; profile visits; link taps; saves and sends per 1,000 reached. If Insights can't show a September figure, write that down rather than estimating | The first Monday report (Mon 12 Oct, setup and baseline); tracker |
| 11 | **Bio link check** | Karl | The bio link opens tripnerd.com on a phone. The Wed 7 caption points to it | Tracker → Week-one setup |
| 12 | **Facebook cross-post toggle** | Jason decides | Yes or no, for Reels and for carousels | Tracker → Decisions; [launch-week runbook](../launch-week-2026-10-07.md) §3 |

**Partner access, step by step** (from [`meta-partner-access.md`](../../../../../playbooks/client-lifecycle/meta-partner-access.md)):

1. **Before the call (Karl, about 10 min, once):**
   - business.facebook.com with Karl's own profile; create a "ServicePOW" business portfolio if there isn't one;
   - Settings → Business info: copy the 16-digit portfolio ID;
   - two-factor authentication on Karl's Facebook account;
   - record where this lives in `access-and-accounts.md` (never a password).
2. **On the call (TripNerd's admin, about 5 min; needs full control of TripNerd's portfolio):**
   - Settings → Accounts → **Instagram accounts**: TripNerd's Instagram is there and is a professional account (if not, Add and log in);
   - Settings → Users → **Partners → Add → "Give a partner access to your assets"**;
   - enter ServicePOW's portfolio ID;
   - assets: the **Instagram account** and the **Facebook Page**. **Leave the ad account out**;
   - permissions: **partial access**, with content, messages, community activity and insights ticked;
   - assign. If Meta asks a second admin to approve, it waits for them.
3. **Right after (Karl):**
   - ServicePOW's portfolio → Settings → Accounts: TripNerd's assets show as shared;
   - each asset → Assign people → Karl, same permissions;
   - open Business Suite; TripNerd is in the account switcher;
   - **test:** open the Inbox; schedule a draft post, then delete it. Access only counts once this works.
   - Also test two UNVERIFIED things: commenting on another account's post, and sharing a post to Story, from Business Suite.

## Assets and consent

| # | Item | Owner | Done when | Recorded in |
|---|---|---|---|---|
| 13 | **One Drive folder for all footage, Taylor's 17th-hole originals first** | Karl opens and shares it; TripNerd uploads (Taylor first) | Full-quality originals of **V16, V23, V24 and V08** are in it (check they aren't 720p copies). Then the rest of the trip archive | Tracker → Engagement state ("Footage folder (Drive)"; a link pointer only) |
| 14 | **Logo confirmation** | Karl shows it; Jason confirms | TripNerd confirms in writing that the file is its current logo and OK to use, or sends the right file and any brand guide. **Show this file:** `tripnerd-logo-colour-1633x601.png`, transparent PNG, 1633×601, sha256 `1c4996e5dc60000c10ac31b3b1e31bc5d9d0aa95fbe0d05209163f9b1b0caa51`, from the September client-approved work. It's in use now under Karl's APPROVER decision (2026-10-05). **NEEDS INPUT:** the file sits only in a session scratchpad today; give it a durable home (Drive) and a pointer file | [`../../../brand-guide.md`](../../../brand-guide.md); the launch-reels Bible decision log (campaign director) |
| 15 | **One-line consent email from TripNerd** | Jason sends | An email that covers (a) the 17th-hole clips, with guests shown from behind, and (b) posting TripNerd's suite with THE PLAYERS signage. Suggested line: *"TripNerd is OK posting the 17th-hole clips from THE PLAYERS (guests shown from behind) and our suite with THE PLAYERS signage on TripNerd's Instagram."* | Email pointer in the client folder; tracker. The campaign director files it against the Bible's §1.2 |
| 16 | **Photos for the owed VIP Fan Experiences carousel** (added: calendar dependency) | Jason / TripNerd | The photos the unfinished draft needs are in the Drive folder **by Fri 9 Oct**, so it can post Tue 13. If not, new static 2 takes Tue 13. **NEEDS INPUT:** which photos the draft needs (the draft isn't on file here) | Tracker; plan §3 |

## Answers we need

| # | Item | Owner | Done when | Recorded in |
|---|---|---|---|---|
| 17 | **The Augusta answers**, in writing | Jason | All seven answered: (1) the venue's name and town; (2) it was off the tournament grounds; (3) the property allows its photos in TripNerd's marketing; (4) guest consent; (5) the day was hosted by TripNerd; (6) whether TripNerd sells a trip that week; (7) which course the hospitality lawn and veranda overlook (our photos show people playing on it, so it is probably not Augusta National; see the [footage shortlist](../../../footage-drive-location.md)). Until then, no Augusta or Masters content posts, and the Thu 22 owed Augusta carousel can't clear its checks | Email pointer in the client folder; tracker → Blockers. The campaign director files the place and consent records and re-reads the carousel ([`../stories/gate-log.md`](../stories/gate-log.md)) |
| 18 | **Which trips run in October and November** | Jason | A list of trips with dates and who hosts each | [`guest-loop.md`](guest-loop.md) (SA-OPS-B); tracker |
| 19 | **A yes on the Wed 7 and Thu 8 posts** | The named approver | A written yes on both **by Tue 6 Oct, end of day**. No yes, no post | Tracker → Content log (status `approved`); [launch-week runbook](../launch-week-2026-10-07.md) |
| 20 | **Boost ceiling** | Jason | A written amount for October (suggested $250–$500, from week 3, best organic Reel only, on top of the $1,500), or "no boost in October". Also: does TripNerd have a Meta ad account? (**NEEDS INPUT**) | [`boost-brief-and-approval.md`](boost-brief-and-approval.md) → approvals log; tracker → Decisions |
| 21 | **The 5 owned-channel questions** ([`../owned-channels-follow-link.md`](../owned-channels-follow-link.md) step 1) | Jason | All five answered:<br>1. What sends the booking confirmations and trip emails, and who can edit those templates?<br>2. Who edits tripnerd.com?<br>3. Is there a past-guest email list? Roughly how many people, and did they agree to marketing email?<br>4. What do guests get in print or PDF (itinerary, welcome pack, lanyard, table cards)? Which trips run in October and November?<br>5. Who on the team sends email (for signatures)? | [`follow-link-qr-pack.md`](follow-link-qr-pack.md) (SA-OPS-B) |

## After the call

- Tick each item in [`../tracker.md`](../tracker.md) → Week-one setup (the tracker's owner updates it).
- Anything still open on Tue 6 at end of day holds the Wed/Thu posts. See the go/no-go list in the [launch-week runbook](../launch-week-2026-10-07.md) §2.
- Jason hasn't been told about tonight's two calendar swaps yet. The draft note is [`2026-10-05-schedule-change-note.md`](2026-10-05-schedule-change-note.md) (NOT SENT); Karl can cover it on the call instead.
