---
title: "TripNerd — Instagram Content System (focus, formats, Grok prompt pack)"
type: playbook
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [instagram, reels, stories, grok, awareness, tripnerd]
---

# TripNerd — Instagram Content System

Read this before planning any TripNerd Instagram content. It sets the current goal, the
formats to borrow, the rules nothing breaks, and the prompts for Grok (SuperGrok is in the
growth plan's "Plan" step).

## 1. The main focus (owner decision, 2026-10-05)

**For the next 90 days the job is attention: make @tripnerd a page people find, enjoy,
follow and interact with.** Leads still matter, but they come second. No post should be
only an ad.

| Metric (primary) | Why it's the measure |
|---|---|
| Views from non-followers (%) | People finding the page, which is the whole point of Reels and Explore |
| Average watch time and completion | Instagram's top ranking signal (Mosseri, widely reported for 2025–26) |
| Sends per reach (DM shares) | Mosseri names it as a top signal for reaching new people |
| Saves per reach | Signals content worth coming back to |
| Follows per reach | Turns a view into an audience |
| Comments | Conversation; feeds the Feed ranking |

Enquiries and bookings stay in the Monday report as the business outcome.

**Needs telling to TripNerd:** the approved growth plan (p.10) says "Likes never the goal"
and leads with enquiries and bookings. This focus doesn't contradict it (likes still aren't
the goal; sends, saves, follows and watch time are), but the primary KPI has changed and
their approver should hear it from us.

**Risk to manage:** broad entertainment formats can attract followers who will never buy.
Rule: **borrow the format from the crowd, keep the subject inside TripNerd's world**
(sports, events, hospitality, travel), so the people we attract are sports fans and
hosts, not just foodies.

## 2. The AI food-review idea: what's allowed

**Not allowed as pitched:** an AI-generated person in "the TripNerd suite" saying "here's
what TripNerd offered us today… this was the best." That is a fake customer review.

- The FTC Fake Reviews Rule bans it, and disclosure doesn't fix it. This is the same reason
  "The Parking Lot" was killed in August.
- TripNerd's own approved plan (p.6) says "AI never creates a person, a voice or a
  testimonial" and "AI only to bridge short gaps between real shots and to upscale."
- Generated food or rooms presented as what TripNerd served is also a product
  misrepresentation.

**The same format, done legally (and it lands better):**

| Version | Who's on camera | Footage needed |
|---|---|---|
| A Nerd (TripNerd staff) rates the food at a real event | Real person | Shot on a phone at the event (from Feb) |
| "The $1.50 Augusta menu, made at home": a Nerd recreates and taste-tests the famous concession menu | Real person | None from the venue; kitchen and phone only |
| "Rating our hospitality spreads 1–10": real archive photos of TripNerd spreads, a Nerd's real voiceover | Voice only | Existing photos; subtle motion allowed only if labelled AI |
| Food creator collab at an event (the plan allows creators from Day 31) | Real creator | The creator films. The plan cites Golfbreaks' creator Reel at 7.4× its median. |

## 3. Formats to borrow ("sneak into the spots everyone watches")

| Popular format | TripNerd version | Footage |
|---|---|---|
| Food review / taste test | $1.50 Augusta menu made at home; stadium food vs suite food (event weeks) | Phone |
| "Rating X 1–10" | Rating hospitality spreads, seats or arrival days from the archive | Archive photos + voiceover |
| Price breakdown ("what $X gets you") | "What a Derby weekend actually costs" (TripNerd confirms ranges) | Graphics + talking head |
| "Things that make zero sense" | Augusta: phones banned so there are payphones, $1.50 sandwiches (sourced) | Talking head + photos |
| Guess-the-sound / quiz | "Guess the event from the crowd": roars from TripNerd's own footage | Existing audio |
| POV skit | "POV: a client wants 12 rooms in Augusta in April" | Staff, phone |
| Day in the life | A Nerd during event week | Staff, phone |
| Ranking / tier list | Tier list of event-week traditions (Derby hats, Phoenix 16th, the 17th at Sawgrass) | Archive + talking head |

Every Reel needs: a hook in the first second (visual plus on-screen text), one idea, a
payoff worth finishing, a reason to send it to one specific friend, captions on, and
original audio or Instagram's commercial-use library.

## 4. Rules nothing breaks (from TripNerd's approved plan, p.6)

- AI never creates a person, face, voice or testimonial. AI is only for short bridges
  between real shots and for upscaling, always labelled.
- Reviews are real and quoted word for word. Identifiable guests appear only with consent.
- Event names are used only to say where guests went. Never imply official partnership.
  No event logos, no broadcast footage. Say "the Big Game."
- Follow venue filming rules (Augusta: no phones on the grounds).
- Every number, price or superlative needs a source. TripNerd's prices and inclusions need
  their confirmation.
- Don't repeat the old feed slogans: "knowing the right people", "bucket list → booked",
  "details handled", "skip the client dinner", "memories last". See
  `notes/2026-10-04-instagram-audit-raw.md`.

## 5. What Grok can and can't do

- **Can:** search the web and X live (DeepSearch); read files you upload (paste Insights
  exports); write hooks, scripts and shot lists; generate images and video (Grok Imagine).
- **Can't:** log into Instagram or see TripNerd's Insights unless you paste or export them,
  or see private performance data for other accounts or industries. Instagram doesn't
  publish watch data by niche. "What food content gets" comes from public view counts and
  third-party benchmarks, so treat it as directional.
- **Use Grok Imagine only within the AI rule above:** labelled bridges and upscales, never
  people.
- **Better data source:** the Supermetrics connector in this workspace has an
  Instagram-insights tool. Once TripNerd grants access we can pull real Insights each Monday
  and hand them to Grok (prompt E).

## 6. Grok prompt pack

### Project instructions (paste once into a Grok Project or custom instructions)

```
You are the Instagram content strategist for TripNerd (@tripnerd), a premium sports-travel
concierge (tagline: "Trip like a Nerd"). Events: Augusta golf week, Kentucky Derby, Daytona,
THE PLAYERS, Phoenix Open, CMA Fest, US Open tennis, F1, and the pro football championship
(call it "the Big Game"; LA, Feb 14 2027). Audience: corporate hosts entertaining clients,
and premium fans planning bucket-list trips with friends. Agency: ServicePOW.

Account today: about 4,730 followers, median post about 2 likes, a feed of static graphics
with slogans. Do not repeat these old lines: "knowing the right people", "bucket list →
booked", "details handled", "skip the client dinner", "memories last".

PRIMARY GOAL (next 90 days): make @tripnerd a page people find, enjoy, follow and interact
with. Judge every idea by: views from non-followers, watch time/completion, sends (DM
shares), saves, follows per reach, comments. Leads come second. Never make a post that is
only an ad.

HOW TO THINK
1. Borrow formats people already binge (food reviews, taste tests, price breakdowns,
   rankings, POV skits, day-in-the-life, "things that make no sense", quizzes, guess-the-
   sound) and put TripNerd's world inside them. Format from the crowd, subject from us,
   so the people we attract are sports and travel people.
2. Every Reel: a hook in the first second (visual + on-screen text), one idea, a payoff
   worth finishing, a reason to send it to one specific friend, captions on, original audio
   or Instagram's commercial-use music.
3. "Nerd" is the brand device: every video teaches, reveals or ranks something a fan
   didn't know.
4. Research before claims. For algorithm or trend questions, search the web and X live.
   Cite every claim with source and date. Label each OFFICIAL (Instagram/Meta/Adam
   Mosseri/@creators), THIRD-PARTY (Later, Sprout, Socialinsider, Hootsuite, etc.),
   OBSERVED (posts or accounts you actually opened) or INFERENCE. Flag sources older than
   6 months. Never invent statistics, view counts, accounts or links; say "unverified"
   instead.
5. You cannot see TripNerd's Insights. Analyze performance only from exports I paste.

HARD RULES (TripNerd-approved; never break, and flag any idea that would)
- AI never creates a person, face, voice or testimonial: no AI guests, reviewers, hosts or
  narrators. AI is only for short bridges between real shots and upscaling, always
  labelled as AI.
- Reviews and guest quotes are real and word for word. Identifiable guests only with
  consent.
- Event names only to say where guests went ("our guests at THE PLAYERS"). Never imply
  official partnership. No league/tournament logos or broadcast footage.
- Follow venue filming rules (Augusta bans phones on the grounds: no footage from inside).
- Any number, price or "best/most" claim needs a source. TripNerd prices and inclusions
  need TripNerd's confirmation.

ASSETS WE HAVE
About 80 real guest photos from past trips (suites, hospitality spreads, an Augusta private
house, the Phoenix 16th, Derby, Daytona), some suite and crowd video from THE PLAYERS, the
nerd-head mascot and logo files, 15 real reviews on tripnerd.com, TripNerd staff ("Nerds")
who can film on phones, and public facts about each event. Fill footage gaps with a real
Nerd on camera, at-home recreations, photo edits with a real voiceover, screen-recording
explainers, or labelled AI bridges between real shots. Never fake people.

OUTPUT FORMAT FOR EVERY REEL IDEA
Title · format borrowed (and from what kind of account) · why people watch to the end ·
who they'd send it to and why · hook (first-second visual + on-screen text + first spoken
line) · shot list with the source of every shot (REAL ASSET / NEW PHONE FOOTAGE / AI BRIDGE,
labelled) · voiceover script · on-screen captions · CTA (a comment prompt or DM keyword:
AUGUSTA, HOST, NERD, BIGGAME) · the main algorithm signal it targets · rule check.
```

### A. Monthly algorithm briefing

```
Using live web and X search, brief me on how Instagram currently ranks Reels, Explore, Feed
and Stories. Prioritize what Instagram, Adam Mosseri and @creators said in the last 6
months. Give a table: signal | surface | what was said | source + date | OFFICIAL or
THIRD-PARTY. Then list what changed in the last 90 days (originality/repost rules, Trial
Reels, length limits, anything new) and 5 implications for a 4,700-follower brand account
trying to reach non-followers. No percentages you can't source.
```

### B. Niche format scan

```
Search X and the web for short-form formats getting outsized views right now in these
niches: food reviews and stadium food, golf, horse racing / Kentucky Derby, NFL fan
culture, NASCAR, luxury travel, and corporate hospitality. For each niche give 3–5
recurring formats with 2 real example posts or accounts (with links), what makes them
rewatchable and sendable, and whether each is OBSERVED or INFERRED. Flag anything you
couldn't open.
```

### C. Sneak-in generator

```
For each format from the scan, write 2 TripNerd versions using only our assets and hard
rules, in the standard output format. Then rank all ideas by (likely sends + watch time) ÷
production effort, and mark which can be made this week with no new footage.
```

### D. Script a Reel

```
Turn idea #__ into a 20–30 second Reel: a second-by-second beat sheet, on-screen text,
voiceover, the source of every shot, a caption whose first line is the hook, 3 comment
prompts, and 3 alternative first seconds to test as Trial Reels.
```

### E. Weekly Insights review

```
Here is last week's Instagram Insights export: [paste]. Rank posts by sends per reach,
saves per reach, average watch time and follows. What patterns win? What should we stop?
Give 3 tests for next week, each as a hypothesis with the one metric that decides it.
```

## Sources

- Mosseri's top signals (watch time, sends per reach, likes per reach) as reported for
  2026: [eclincher](https://www.eclincher.com/articles/how-the-instagram-algorithm-works-in-2026)
  (third-party summary; verify against Mosseri's own posts in prompt A).
- April 2026 repost/aggregator changes: [PetaPixel](https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/),
  [SocialPilot](https://www.socialpilot.co/es/blog/instagram-reels-algorithm).
- Grok capabilities (DeepSearch, X search, Grok Imagine):
  [review, 2026](https://witechpedia.com/grok-ai-review/).
- TripNerd posting rules and creator benchmark: TripNerd Instagram Growth Plan, pp.4, 6, 10.
