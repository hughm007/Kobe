---
title: Meta partner access — getting into a client's Instagram and Facebook without their password
type: playbook
client: internal
owner: Karl
status: active
created: 2026-10-04
updated: 2026-10-04
tags: [onboarding, meta, instagram, business-suite, access]
---

# Meta partner access

**What it is:**
- The client keeps ownership of its Instagram account and Facebook Page, inside its own Meta **business portfolio** (formerly "Business Manager").
- It **shares** those assets with ServicePOW's business portfolio as a **partner**, choosing exactly what we can do.
- No passwords change hands, and the client can remove us in one click.
- Meta requires two-factor authentication for everyone in a business portfolio.

Steps verified against current guides on 2026-10-04 ([Leadsie](https://www.leadsie.com/blog/give-meta-business-portfolio-access), [Chatfuel](https://chatfuel.com/docs/for-agencies/meta-partner-access)). Meta renames menus often, so if a label differs, look for the same idea nearby.

## Before the call (ServicePOW, about 10 minutes, once)
1. Go to **business.facebook.com**, signed in with Karl's own Facebook profile. If ServicePOW has no business portfolio yet, create one ("ServicePOW").
2. **Settings → Business info**: copy the **16-digit business portfolio ID**. This is what the client types in.
3. Turn on **two-factor authentication** on Karl's Facebook account.
4. Record in `clients/<client>/access-and-accounts.md` *where* this lives (never a password).

## On the call (the client's admin, about 5 minutes)
The person doing this needs **full control** of the client's business portfolio.
1. **Check the Instagram account is in their portfolio:** Settings → Accounts → **Instagram accounts**. If it isn't, click Add and log in to Instagram. It must be a professional (business) account.
2. Go to **Settings → Users → Partners → Add → "Give a partner access to your assets."**
3. Enter **ServicePOW's portfolio ID**.
4. **Pick the assets:** the **Instagram account** and the **Facebook Page**. Leave the **ad account out** for now; it's added only when a paid budget is approved.
5. **Permissions: partial access**, not full control. Tick content (create and schedule posts), messages (DMs), community activity (comments) and insights.
6. **Assign assets.** If Meta asks for a second admin's approval, it waits until they approve.

## Right after (ServicePOW)
1. In ServicePOW's portfolio: **Settings → Accounts → Instagram accounts** (and **Pages**). The client's assets now show as shared by the partner.
2. Select each asset → **Assign people** → add Karl (and any team member) with the same permissions.
3. Open **Meta Business Suite**. The client appears in the account switcher (top left).
4. **Test it:** open the Inbox, and schedule (then delete) a draft post. Access only counts once it's confirmed working (onboarding §4).

## Day to day in Meta Business Suite (business.facebook.com)
| Job | Where |
|---|---|
| Schedule Reels, feed posts and plain Stories at the agreed times | Switch to the client → **Planner / Content → Create** → upload, caption → **Schedule** |
| Answer DMs and comments | **Inbox**: Instagram and Facebook in one place |
| Results for the Monday report | **Insights** (and Supermetrics, once it's connected) |

## What Business Suite can't do (use the Instagram app)
- **Trial Reels** can't be scheduled in Business Suite.
- **Story stickers** (polls, questions) don't carry over when a Story is scheduled from Business Suite.

So someone posts those two from the Instagram app on the client's phone. **Our default:** we send the file, caption and sticker text, and the client's poster taps Post. We never ask for the password to work around this.

Source: [PostEverywhere](https://posteverywhere.ai/blog/how-to-schedule-instagram-trial-reels), [SocialBu](https://socialbu.com/blog/schedule-instagram-reels-and-posts).

## Ending it
At offboarding (onboarding §7), the client removes ServicePOW under **Settings → Users → Partners**, and we confirm it's gone.
