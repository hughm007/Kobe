---
title: "TripNerd — 'The Group Chat' Reel"
type: campaign-bible
client: tripnerd
campaign_id: 2026-10-16-group-chat-reel
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [campaign, bible, full, reel, video, instagram, chat-thread, trial-reel, organic]
---

# TripNerd — "The Group Chat" Reel (FULL Bible)

> **Approval status: CONCEPT APPROVED. Storyboard v1 BLOCKED at Skeptic Pass 1 (2026-10-05); storyboard v2 built with every flagged repair; fresh isolated Skeptic Pass 1 on v2 in progress.**
> - The storyboard is built (visual frames plus §6).
> - Skeptic Pass 1 is in progress (§14).
> - **Next gate: STORYBOARD APPROVED (Karl, APPROVER), then the SPEND_APPROVER gate for one generated shot (F6.5).**
> - Nothing has been generated, spent or posted.

| Header | Entry |
|---|---|
| **Depth** | **FULL.** The piece contains one realistic generated shot (F6.5) |
| **Format** | Instagram Reel · 9:16, 1080×1920 · 19.0 s (version A) or about 13.5 s (version B) · 30 fps · organic, also run as a Trial Reel |
| **Slot** | **Fri 16 Oct 2026, 11 AM ET** (Reel 2 in the October calendar, "Trial Reel" slot) |
| **Audience** | Fans and friend groups planning a trip to a big event; secondarily, the friend who always ends up booking |
| **Skipped phases (logged)** | **§1 ground truth and §2 strategy are inherited, not re-run.** Sources: [`../2026-10-instagram-growth/2026-10-test-month-plan.md`](../2026-10-instagram-growth/2026-10-test-month-plan.md), [`../2026-10-instagram-growth/algorithm-niche-strategy.md`](../2026-10-instagram-growth/algorithm-niche-strategy.md), [`../../evidence-register.md`](../../evidence-register.md), [`../../grok/02-knowledge-file.md`](../../grok/02-knowledge-file.md). §5 script: no spoken lines; the on-screen text lives in §6. §7 cast: **N/A**, no generated people |

## 1. Ground truth (inherited)

**Claims that may appear** (EV-tripnerd-004 to 008, exact wording only).

**Barred:**
- transport or hotel arrangements, and "handled";
- "VIP", "best", "every", "always", "guarantee", "official";
- review counts and years in business;
- event names in text or hashtags;
- identifiable pros and leaderboards.

**Client AI rule:** "AI never creates a person, a voice or a testimonial." AI bridges short gaps only, always labelled. Proof photos never get AI.

### 1.2 Open UNKNOWNs blocking work

| Unknown | Blocks | Owner |
|---|---|---|
| Taylor's original 17th-hole files (V24, V08) | F9–F11, so version A | TripNerd (Taylor) |
| BC-19 phone receipt for the bio link | F6 "tripnerd.com" and the F12 CTA | Karl |
| TripNerd's named approver | Posting | TripNerd |

## 2. Strategy (inherited)

- **Objective:** reach non-followers (Trial Reel), measured by sends, saves and follows.
- **Angle:** "the trip everyone's in for, and nobody books". TripNerd is the friend who finds the answer.
- **Proof** comes only from real TripNerd material after the turn.

## 3. Creative concept and pack

**Concept:** a group-chat thread stalls on "who's booking". Someone drops TripNerd, and the Reel cuts to real proof (the table, the food, the rail, the roar).

**Format:** a chat-thread opening. TripNerd hasn't run one (theirs: a camera-roll montage, a hero spot, a comparison Reel).

**Concept approval:** **CONCEPT APPROVED**, Karl (APPROVER), 2026-10-05. The single-author pack was recorded at the plan stage.

### The pack: 4 hook variants (same body, payoff and CTA)

| ID | Opening (0–1.5 s) | Test use |
|---|---|---|
| H1 | Chat opens: "Golf trip this spring. We doing it?" | Main feed post |
| H2 | Cold open on "ok who's booking", then silence | Trial Reel A/B |
| H3 | The super "Seen by 3. Nobody's booking." as the first frame | Trial Reel A/B |
| H4 | Super "POV: you're the one who has to book it." over the chat | Trial Reel A/B |

**Hard rules for the chat:**
1. **No chat line praises TripNerd** (it would be a fictional-customer testimonial).
2. Names appear on initial circles, with no photo avatars.
3. The UI is generic, in TripNerd's palette (outgoing bubbles navy with white text, incoming white with navy). It does not use any messaging app's look or marks.

## 4. Creative spine

| Spine decision | Entry |
|---|---|
| Core message | You don't have to be the one who figures it all out. |
| Primary emotion | Recognition, then relief, then release (the roar) |
| Viewer start → end | "Every trip stalls in our chat" → "That's who books it" |
| Narrative question | Who's booking? |
| Payoff | The seat at the rail and the roar |
| CTA logic | "Bringing the group chat?" → Plan yours · link in bio |

**Beat map:**
1. setup (F1–F2);
2. stall (F3–F4);
3. need (F5);
4. turn (F6);
5. bridge (F6.5);
6. proof (F7–F8);
7. payoff (F9–F11);
8. CTA (F12).

**Shuffle test:** every beat answers the one before it. F7 answers "who's meeting us", F8 answers "food", F9 answers "where do we even sit".

## 6. Storyboard

Frames: `scratchpad/group_chat/frames/group-chat-v1-F*.png` (not committed). Builder: [`storyboard_v1.py`](storyboard/storyboard_v1.py).

**Motion axis:**
- chat frames: vertical (messages stack upward);
- photo frames: z (push or pan);
- F6.5: z (forward dolly).

| # | Story job | Action | Camera | Lighting | Audio | Text | Source | Real reference | Angle | Motion axis |
|---|---|---|---|---|---|---|---|---|---|---|
| F1 | Hook: the plan | Mike's message slides in | Static screen | Flat UI | Ping | "Golf trip this spring. We doing it?" | COMPOSITE (code) | Every reader's own group chat | Nobody books | Vertical |
| F2 | Everyone's in | Three replies bounce in | Static | Flat | 3 pings, rising | "IN" / "in" / "100% in" | COMPOSITE | — | Nobody books | Vertical |
| F3 | The question | One message | Static | Flat | Ping, room tone drops | "ok who's booking" | COMPOSITE | — | Nobody books | Vertical |
| F4 | The stall | "Seen by 3"; typing dots start and stop | Slow 104% push | Flat | Near silence, one buzz | Super "Seen by 3. Nobody's booking." | COMPOSITE | — | Nobody books | Z |
| F5 | The need | Mike goes it alone | Static | Flat | Ping | A: "…hotel? where do we even sit??" · B: "…food? who's meeting us there??" | COMPOSITE | — | Nobody books | Vertical |
| F6 | The turn | "found one." plus the TripNerd link card | Push into the card | Flat | Send whoosh | "found one." · card "TripNerd / tripnerd.com" | COMPOSITE plus the **real logo file** | tripnerd.com | TripNerd finds it | Z |
| F6.5 | Bridge out of the phone | An empty fairway at dawn, mist | Slow forward dolly | Dawn, low sun, mist | Wind, birds (real library or recorded; not generated) | — | **GENERATED** (Higgsfield), AI label on | None: generic | — | Z |
| F7 | Proof 1: someone's there | The TripNerd table: cloth logo, sunflowers, laptops; no faces | Slow push in the edit | Natural, conventional grade | Murmur, J-cut | "Someone's expecting you." | REAL IMG_1907 (EV-008) | IMG_1907 | Proof | Z |
| F8 | Proof 2: food | Tartlet plate | Slow pan in the edit | Natural, conventional grade | Clink | "Lunch? Already out." | REAL IMG_1998 (EV-007) | IMG_1998 | Proof | X |
| F9 | Payoff: the seat | Backs of guests at the rail, island green below | As shot | As shot | Crowd bed | "This is where you sit." | REAL V24 0–2 s (EV-006) | V24 | Payoff | As shot |
| F10 | The hush | Calm before the putt; no identifiable pro or leaderboard | As shot; hold ≥1.4 s | As shot | Near silence | "Shh." | REAL V24 8.6–10.5 s | V24 | Payoff | As shot |
| F11 | Release | The eruption | 103% push | As shot | The real roar | — | REAL V24 14.9–16.4 s + V08 audio | V24, V08 | Payoff | Z |
| F12 | CTA | End card; chat bubble style returns | Static | Flat | Last ping | "Bringing the group chat?" / "Trip like a Nerd." / "Plan yours · link in bio" | COMPOSITE plus the real logo | — | TripNerd finds it | — |

**Version B** (the clips miss Fri 9): F1–F8, then F12, with F5's line B. No line promises a seat the video doesn't show.

### Storyboard v2 (2026-10-05): repairs to the Pass 1 findings. **This supersedes the v1 table above wherever they differ**

| Finding | v2 change |
|---|---|
| S4 F8 "Lunch? Already out." | Super is EV-007 verbatim: "Ours: a hosted spread, set out for guests." |
| S3 hotel promise (F5) | F5 is now "...where do we even watch from??", answered by F9. No hotel line anywhere |
| S3 F9 "This is where you sit." | Super is EV-006 verbatim: "Ours: at the island-green 17th, guests watched from the rail." |
| S3 version B (AI fairway the only golf) | **Version B removed** (Karl: hold until the clips arrive) |
| S2 "golf trip" reads as playing golf; "this spring" dates it | F1: "Golf tournament. We going?" Group name: "Tournament crew". No season |
| S2 F6.5 framing and trust (AI label) | **F6.5 cut** (Karl). F6 match-cuts to F7. The Reel has no AI and no label |
| S2 F7 blur patches on a proof photo | F7 uses the **raw, unretouched IMG_1907**, cropped at y ≥ 1430: below every face and below every scrub pad. Colour correction only. Motion is a pan of the crop window (scale 1.0, no zoom) |
| S2 F7/F8 push-ins enlarge phone photos | F7: pan only. F8: push capped at ≤114% (the source-pixel limit at scale 0.876) |
| S2 F4/F12 placement | Supers are left-aligned with a code assertion: bottom ≤ 80% of height, right edge ≤ x 950. Chat bubbles kept clear of the right UI column. F12 bubble is now visible (blue, navy text) |
| S2 F12 EV-005 | Still open: needs the BC-19 phone receipt |
| S2 F9–F11 Pass 2 items | Carried to Pass 2: ≥1080p after the crop, no identifiable player/leaderboard/marks, guests unidentifiable, commercial-use question for spectator video (added to TripNerd's questions) |
| S1 "Seen by" wording | Now "Read by 3". Pings are original synthesised tones |

**Timing v2 (19.5 s):**
- F1 0–1.2
- F2 1.2–2.8
- F3 2.8–3.6
- F4 3.6–5.0
- F5 5.0–6.4
- F6 6.4–7.4
- F7 7.4–9.9
- F8 9.9–12.2
- F9 12.2–14.7
- F10 14.7–16.1 (calm, ≥1.4 s)
- F11 16.1–17.9
- F12 17.9–19.5

**§10 routing update:** F6.5 is cut, so **no Higgsfield generation and no spend** in this campaign. The SPEND_APPROVER gate is N/A.

**Cross-campaign flag:** the C02 and C03 carousels use the scrubbed working copies of IMG_1901/1907 (blur patches on bottles and cups). The same S2 proof-integrity point applies to them at their gates. Fix: re-crop from the raw originals below the scrub pads, or accept the S2 explicitly.

## 9. Brand and product fidelity (COMPOSITE marking)

| Shot | Identity-bearing element | Marking |
|---|---|---|
| F6, F12 | TripNerd logo | **COMPOSITE:** the committed file `brand-assets/tripnerd-logo-colour-1633x601.png` (sha256 `1c4996e5…caa51`), placed only on site blue #5896E9. Never generated |
| F7 | The "TripNerd FAN EXPERIENCES" tablecloth | **REAL** photo; conventional grade only |
| F6.5 | — | The prompt bans every mark, flag, sign and logo. Brand review on the output is required |
| All | On-screen text | COMPOSITE, set in code (Montserrat ExtraBold with Inter). Never model-rendered |

## 10. Production plan (routing; nothing fired)

**Live tool state (queried 2026-10-05):** Higgsfield balance 11,779.65 credits, Ultra plan. The connector exposes **no read-only price quote**, so the cost is **not priced yet**. It must be shown to the SPEND_APPROVER at the confirmation step, before anything is fired.

| Shot | Method | Model (live list, 2026-10-05) | Why | Backup | Risk |
|---|---|---|---|---|---|
| F1–F6, F12 | Code-rendered frames, then ffmpeg | — | Exact text, no AI | — | Low |
| F7, F8 | Real stills; push and pan in ffmpeg | — | Proof photos never get AI | — | Low |
| F9–F11 | Real clips from Taylor's originals | — | Real footage first | Version B | Blocked on files |
| **F6.5** | Text-to-video, silent | **Seedance 2.5** (`seedance_2_5`, mode t2v, 9:16, 4 s minimum, trimmed to 1.5 s, audio off). It supports a 480p **preview** that can be finalised at 1080p without regenerating | Native 1080p; the cheap preview fits the cost ladder | `cinematic_studio_3_0` at 1080p, 4 s | Generic-course look; mist morphing; any flag or sign appearing |

**Excluded:**
- `grok_video_v15_lite` (its 1080p is upscaled from 720p, which breaks the standing rule);
- `minimax_h3_max` (768p maximum).

**Cost-ladder steps for F6.5, each only after Karl's SPEND_APPROVER yes:**
1. a 480p preview;
2. a frame check against §9 and the Skeptic Pass 1 notes;
3. finalise the same job at 1080p (no re-roll);
4. report the actual spend.

**Prompt (F6.5):**
> Photoreal vertical 9:16 shot, 4 seconds. An empty golf fairway at dawn, low mist over the grass, soft low sun behind trees, dew. Slow, steady forward dolly at walking speed, camera at chest height. No people, no flags, no flagsticks, no signage, no grandstands, no logos, no text, no water hazard, no recognisable course. Natural colour, documentary phone-video look, gentle grain.

## 11. Audio design

- Pings and the send whoosh are synthesised in code (simple tones), so there's no library licence.
- Room murmur, clink, crowd and roar come from TripNerd's real recordings.
- The F6.5 ambience is a recorded or library wind-and-birds bed (commercial-use only), not generated.
- No voiceover, no music.
- Master at −14 LUFS, ≤ −1 dBTP.

## 13. QC verdict (BC-22)
Not run. This happens at the master.

## 14. Skeptic verdicts (BC-23)

| Pass | Packet | Verdict |
|---|---|---|
| Pass 1 (storyboard v1) | `scratchpad/gate_groupchat_sb1_skeptic_1791230634/packet.txt` (contamination scan clean) | **BLOCK** (1 × S4, 3 × S3). Verbatim below |

```
SKEPTIC VERDICT — Pass 1
Verdict: BLOCK
Findings:
- [S4] F8 / claims — The "Lunch? Already out." super sits on a photo of dessert tartlets, so it is untrue of its own picture. "Lunch" is also a specific meal-inclusion claim with no record behind it, since EV-007 approves only "a hosted spread, set out for guests". Use EV-007's wording, or a line that does not name a meal.
- [S3] F5→F6 / claims (hotels) — "...hotel? where do we even sit??" is answered straight away by "found one." plus the TripNerd link card. That implies TripNerd solves the hotel, and CLIENT-FACTS has no record of TripNerd arranging hotels. F7 makes it worse: a check-in table on what looks like ballroom carpet reads as a hotel lobby. The ad then never answers "hotel?", so the promise is both unsupported and left open.
- [S3] F9 / claims (seats) — "This is where you sit." turns EV-006, a single past fact ("guests watched from the rail", with no date), into a forward promise to the viewer. It also says "sit" when the evidence says "from the rail". There is no record of seats, and EV-006's approved wording is not used.
- [S3] Alternate cut / truth and realism — With F9-F11 cut, the only golf image left in a Reel that opens "Golf trip this spring" is the generated fairway in F6.5. AI footage becomes the only depiction of the product. It also leaves the "Golf trip" premise without any real payoff.
- [S2] F1 + F6.5 / industry-professional and target-customer lens — "Golf trip" in a four-person group chat, followed by an empty fairway at dawn, reads as a trip to play golf (tee times). TripNerd's evidenced product is hosting spectators at tournaments, and the main cut only makes that clear at 12.2 s.
- [S2] F6.5 / realism and disclosure — The shot sits right after the TripNerd link card and leads into TripNerd's real table, so the sequence frames it as the venue TripNerd takes you to. No caption claims that, but the cut does.
- [S2] F6.5 / trust — 1.5 s of generated scenery forces the platform AI label onto the whole Reel. That invites viewers to discount the real proof in F7-F11, which is the Reel's main persuasive asset. The planned match-cut from F6 to F7 avoids this.
- [S2] F1 + F9 / claims — "this spring" next to the island-green 17th effectively dates and names the event. CLIENT-FACTS allows EV-006 only with no event name, year or date beside it.
- [S2] F7 / proof integrity — The proof photo has visible blur patches on the bottles. That is an alteration beyond "ordinary colour and light correction", and the smudges read as tampering on a proof image.
- [S2] F9-F11 / rights and realism (unverifiable at Pass 1) — The payoff is still placeholders, so these must clear in Pass 2:
  - the source is 1080p or better after the 9:16 crop or push-ins;
  - no identifiable player, leaderboard, scoreboard or event marks appear in the background;
  - the F9 guests cannot be identified;
  - the packet has no evidence that the tournament allows spectator video to be used commercially.
- [S2] F7 / F8 resolution — Push-ins on phone photos letterboxed in a 9:16 frame enlarge them further. F8 already looks soft, and the client's rule bars building from footage below 1080p. Because they are proof photos, AI upscaling is not allowed to fix this.
- [S2] F4 and F12 / placement — The F4 super runs to about y=1680, into the bottom ~20% where platform UI sits. In F12, "Bringing the group chat?" is plain text pushed to x≈990, into the right-edge UI column, and not the chat bubble the storyboard specifies.
- [S2] F12 / claims (EV-005) — "link in bio" may run only once the Instagram bio link has been re-checked on a phone. That receipt is still owed, so this is an open delivery condition.
- [S1] F1-F6 / testimonial test — The chat reads as a dramatized scenario, not a customer testimonial: no generated face or voice, and no praise line. Under H2's cold open, though, there is no brand framing until 6.4 s, so it could pass as a real customer's screen recording. No hook variant may add a review-style line.
- [S1] F1-F6 / trade dress — The chat UI is generic, but "Seen by 3" uses Instagram/Messenger wording and the typing-dots bubble is shared by every major app. The synthesized ping must not copy any app's real notification tone.
- [S1] F11 / audio — Crowd audio from a different recording (V08) is laid under the V24 picture. That is acceptable only if the sync looks natural and the sound is the same kind of moment.
(Pass 1 only) Shot risk:
- F6.5 — MEDIUM — Main risks: grass and mowing stripes shimmering or warping under the forward dolly through mist, tree lines and course layout that golfers would spot as fake, and failing to reach native 1080p.
Isolation: packet verified; production reasoning, cost, draft history, and other
evaluators' output withheld.
```

## 15. CONFLICTS
None open.

## 16. Decision log

| Date | Decision | Who |
|---|---|---|
| 2026-10-05 | Concept "The Group Chat" chosen over "Countdown listicle" and "POV: a Nerd's morning" | Karl (APPROVER) |
| 2026-10-05 | Higgsfield limited to one labelled bridge shot (F6.5): no people; proof shots stay real | Karl (APPROVER) |
| 2026-10-05 | Depth FULL; §1/§2 inherited; §5 and §7 N/A (no spoken lines, no generated people) | Claude (director) |
| 2026-10-05 | "Seen by 3" (not 4): Mike plus three friends. Emoji dropped from rendered text (no colour-emoji font) | Claude (director) |
| 2026-10-05 | Karl: cut F6.5 (match-cut instead) and hold the Reel until the 17th-hole clips arrive (no version B) | Karl (APPROVER) |
| 2026-10-05 | Storyboard v2 built; fresh isolated Skeptic Pass 1 spawned on v2 | Claude (director) |
| 2026-10-05 | Skeptic Pass 1 on storyboard v1: BLOCK (S4 F8 'Lunch'; S3 hotel promise, 'This is where you sit', version B with AI fairway as the only golf). Storyboard gate not reached; repairs routed to v2 | Claude (director) |
| 2026-10-05 | F7/F8 crops narrowed so they stay below the face exclusion line (the guard tripped on the first attempt) | Claude (director) |
