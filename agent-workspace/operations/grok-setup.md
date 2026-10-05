---
title: "Grok (SuperGrok) setup for ServicePOW: how we use it across clients"
type: playbook
client: internal
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [ai-tools, grok, operations, automations, privacy]
---

# Grok setup for ServicePOW

**What Grok is for here:**
- A **fast drafting and live-trend engine**: real-time X and web chatter, hooks, captions, reply drafts, weekly plans and scheduled routines.
- It is **not** the source of truth and **not** the quality gate.
- The ServicePOW workspace holds the facts, and every client-facing piece still passes our checks and the client's approver.

**Honest framing:**
- More drafts don't mean more results.
- For TripNerd the bottleneck is footage, an approver and access, not ideas.
- Judge Grok by how many of its drafts survive our checks and get posted, not by how much it produces.

## 1. Account and privacy, set once

Feature names are as of 2026-10-05; verify them in the app.
- **Grok → Settings → Data controls:** turn **"Improve the model" off**.
  - Thumbs-up/down feedback can still be used for training, so don't rate client chats.
- **Memory:** keep it off, or use Projects only, so one client's details never leak into another client's chats.
- **Terms to know:**
  - You own what Grok outputs. But xAI's terms give it a broad licence to your inputs and outputs, and there is no protection if an output infringes someone's rights.
  - So upload only what a draft needs.
- **Plan:** SuperGrok. Email-triggered Automations need SuperGrok; scheduled ones don't.

## 2. Structure: one Project per client, plus one for ServicePOW

| Project | Instructions | Files | Bots |
|---|---|---|---|
| `TripNerd` | [`clients/tripnerd/grok/01-project-instructions.md`](../clients/tripnerd/grok/01-project-instructions.md) | [`02-knowledge-file.md`](../clients/tripnerd/grok/02-knowledge-file.md) | [`03-bot-roles-and-automations.md`](../clients/tripnerd/grok/03-bot-roles-and-automations.md) |
| `ServicePOW – internal` | Agency voice, offers and the outbound rules | Company files (services, pricing, positioning) | Prospect research, cold-email drafts. Nothing is sent without the APPROVER sign-off (outbound law) |
| `<Next client>` | From [`templates/grok-client-project-template.md`](../templates/grok-client-project-template.md) | That client's facts only | Same 7 roles, adapted |

- **Never mix clients:** no shared chats, no cross-uploads. One client's data, pricing and results never appear in another's Project.
- **Naming:**
  - Projects: the client name.
  - Automations: `<Client> · <bot> · <schedule>` (e.g. `TripNerd · Trend scout · weekdays 8am`).

## 3. The loop that turns Grok output into posts
1. **Grok drafts.** Every draft ends with a claims table and a risks list (built into each client's instructions).
2. **Karl or Claude checks it in the workspace:**
   - claims against the client's evidence register;
   - brand rules;
   - for creative: the blocking checks plus the critic and Skeptic gates.
3. **The client's approver says yes in writing.**
4. **A person schedules or posts it.**
5. **The Monday report records results.** Feed winners back into the next week's brief.

## 4. What never goes into Grok
- Passwords, logins, tokens, card details or any credential.
- Guest photos showing faces, guest names, DMs with personal details (strip them first).
- Unconfirmed client claims presented as fact (put them in as UNVERIFIED, or leave them out).
- Client fees or contract terms (not needed for drafting).
- Another client's information.

## 5. Keeping it accurate
- **Refresh:** the knowledge file is a copy of the workspace. Re-upload it **every Monday**, and whenever a fact, rule or approval changes. The date at the top shows its age.
- **Rules change:** update the workspace first, then Grok.
- **Usefulness check:** pause any Automation whose output you haven't used in two weeks.
- **Monthly check:** count how many Grok drafts were posted against how many were made. Keep the roles that earn their place.

## 6. Adding a new client (about 30 minutes once the brief exists)
1. Fill [`templates/grok-client-project-template.md`](../templates/grok-client-project-template.md) from the client's brief, brand guide and evidence register.
2. Create the Grok Project. Paste the instructions (keep them under 4,000 characters), upload the knowledge file, then add the bots you need.
3. Record in the client's tracker that the Grok Project exists and when its knowledge file was last refreshed.

## 7. Letting Grok see a client's photos

**1. Recommended: upload into the Project.**
- Upload the client's **Grok-safe pack** into the client's Grok Project → **Files**. For TripNerd: 3 faces-free photos, the logo, and the footage index.
- **Test it:** ask "describe tripnerd-hosted-food-spread.png". If Grok describes it accurately, it can see the photos.

**2. Optional: the Google Drive connector.**
- Set up at grok.com/connectors → New Connector → Google Drive (feature from May 2026; verify in the app).
- **Only with a separate Google account** that holds nothing but the Grok-safe folders. The connector reads the whole account.
- Wyatt's and Karl's main Drives hold the ServicePOW OS and other clients' files, so **never connect those**.
- Whether the connector can view images or video, not just documents, is **unconfirmed**. Test it with one photo before relying on it.

**3. Video.**
- Grok can plan from stills, frames and contact sheets, but it doesn't cut the finished advert.
- Upload 3–6 frames per clip, never the guest-face frames. Finished edits stay in the ServicePOW pipeline (real footage, our gates).

**Never upload:**
- photos with identifiable guests, until the client confirms consent covers it;
- anything marked INTERNAL ONLY (e.g. TripNerd's 9 Apr photo set);
- children;
- other clients' files.

**What a Grok-safe pack holds:**
- faces-free photos, graded only (no AI);
- the client's logo file;
- a `footage-index.md` saying what exists, what's cleared and what's missing.

Build it in the session scratchpad and send it to Karl. The images stay out of git; the index lives in the client's `grok/02-knowledge-file.md` §11.
