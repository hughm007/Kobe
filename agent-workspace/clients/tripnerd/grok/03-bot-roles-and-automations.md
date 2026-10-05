---
title: "TripNerd — Grok bot roles, prompts and Automations"
type: playbook
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [client, grok, ai-tools, automations, routines]
---

# TripNerd Grok bots: roles, prompts and schedules

**How to run them:**
- Every "bot" below runs **inside the TripNerd Grok Project**, so it inherits [`01-project-instructions.md`](01-project-instructions.md) and the knowledge file.
- Recurring ones are set up as **Grok Automations** (schedules run in your timezone; set ET).
- Paste each prompt as written. Text in [brackets] is filled in each time.

**The one rule that keeps this from creating extra work:**
- Grok **drafts**, ServicePOW **checks**, TripNerd's approver **approves**, and a person **posts**.
- Every Grok draft goes through the normal claims and quality checks before a client sees it.
- Track how many drafts survive. Cut any bot whose drafts keep failing.

| # | Bot | Runs | Output goes to |
|---|---|---|---|
| 1 | Trend scout | Automation: weekdays 8:00 AM ET | Karl: pick 0–2 ideas a week |
| 2 | Hook and caption drafter | On demand, per post | Carousel/Reel brief, then our gate |
| 3 | Weekly content prep | Automation: Thursdays 9:00 AM ET | Next week's plan, for Karl's edit |
| 4 | Engagement target list | Automation: weekdays 9:00 AM ET | The person doing the 20-minute routine |
| 5 | Monday report drafter | On demand, Mondays | Karl pastes the numbers; draft goes to the report template |
| 6 | Reply drafter | On demand | A human edits and sends; never auto-sent |
| 7 | Concept sketcher (Grok Imagine) | On demand | Internal mood frames only; never posted |

---

## 1. Trend scout (Automation, weekdays 8:00 AM ET)
```
Search X and the web from the last 24 hours for conversations TripNerd's audiences care about: golf-fan moments, golf trips with friends, corporate hospitality at sports events, and the events on TripNerd's calendar (Phoenix Open, Super Bowl, Daytona, THE PLAYERS, Kentucky Derby, CMA Fest) — without using "Masters" or Augusta topics.
Return at most 5 items. For each: what's happening (1 line), link, why TripNerd's audience cares, one post or Story idea that uses TripNerd's real footage or photos (say which kind), and a risk note (trademarks, players' likeness, news sensitivity). Skip anything political, betting-related, or about injuries/tragedy. If nothing fits, say "nothing worth acting on today".
```

## 2. Hook and caption drafter (on demand)
```
Post brief: [slot date/time] · [Reel or carousel or Story] · audience: [corporate hosts OR fans] · topic: [topic] · footage available: [describe the real clips/photos].
Give me: 10 hooks (frame-1 on-screen text, ≤7 words each, topic visible with sound off), the 3 you'd test as Trial Reels and why, on-screen text per beat, a caption (first line has search words, then 1–2 short lines, CTA "link in bio"), 3–5 hashtags (no event marks), and alt text. Then the CLAIMS TABLE and RISKS as in your instructions.
```

## 3. Weekly content prep (Automation, Thursdays 9:00 AM ET)
```
Plan next week's TripNerd posts using the October calendar in the knowledge file. For each slot: the post idea, audience, format, which real footage or photo it needs (or "needs from TripNerd: …"), 3 hook options, and the Story plan for Mon/Wed/Fri 10 AM including any sticker text. Flag anything that depends on an open item in "Still unknown". Keep it to one screen.
```

## 4. Engagement target list (Automation, weekdays 9:00 AM ET)
```
List 15 recent public Instagram or X posts worth a genuine comment from TripNerd today, across: official event accounts, venues and host hotels, golf and sports-travel culture accounts, fans posting from upcoming event locations, and partners. For each: link, account, why it fits, and what kind of comment would add something (a question, a specific observation) — but do NOT write the comment itself. Mark every handle "verify in app". Skip minors, politics, betting and anything negative.
```

**Why it doesn't write the comment:** outbound comments must be genuine and human. That's a rule TripNerd agreed to, and it protects the account.

## 5. Monday report drafter (on demand)
```
Here are this week's numbers from Instagram Insights / Supermetrics: [paste]. Draft the Monday report narrative in this order: what happened, what it means, what we change next week. Use only the numbers I pasted; name the source and date range under each table; never estimate a missing number — write "not available". Call out the best and weakest post by sends, saves and follows (not likes). No promises about future growth.
```

## 6. Reply drafter (on demand)
```
Draft replies in TripNerd's voice to these comments/DMs: [paste, with names removed]. For questions about price, dates or availability, use: "Thanks for getting in touch. Someone from our trips team will reply here with the details." Never quote prices, dates or availability. Keep each reply to 1–2 sentences. Flag anything that needs a human (complaints, refunds, personal details).
```

## 7. Concept sketcher (Grok Imagine, on demand, internal only)
```
Make a rough concept frame for an internal mood board: [describe scene]. No people's faces, no logos, no event marks, no text. This is a sketch for planning only.
```

**Rules for Grok Imagine:**
- Never post these frames.
- Never use them as proof.
- Never generate people as guests or customers.
- Label any AI frame that is ever shared.

The real finished pieces are built from TripNerd's footage in the ServicePOW workspace.

---

## Setting the Automations (verify the menu names in the app; Grok updates them often)
1. Open the TripNerd Project in Grok and go to **Automations** (or **Tasks**).
2. Click **Create**.
3. Paste the prompt.
4. Set the schedule and the timezone (US Eastern).
5. Choose how results reach you (app notification or email).
6. Review the run history weekly. Pause any Automation whose output you haven't used in two weeks.
