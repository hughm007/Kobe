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

> **Approval status: CONCEPT APPROVED.**
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
| Pass 1 (storyboard) | `scratchpad/gate_groupchat_sb1_skeptic_1791230634/packet.txt` (contamination scan clean) | *in progress; transcribed verbatim on return* |

## 15. CONFLICTS
None open.

## 16. Decision log

| Date | Decision | Who |
|---|---|---|
| 2026-10-05 | Concept "The Group Chat" chosen over "Countdown listicle" and "POV: a Nerd's morning" | Karl (APPROVER) |
| 2026-10-05 | Higgsfield limited to one labelled bridge shot (F6.5): no people; proof shots stay real | Karl (APPROVER) |
| 2026-10-05 | Depth FULL; §1/§2 inherited; §5 and §7 N/A (no spoken lines, no generated people) | Claude (director) |
| 2026-10-05 | "Seen by 3" (not 4): Mike plus three friends. Emoji dropped from rendered text (no colour-emoji font) | Claude (director) |
| 2026-10-05 | F7/F8 crops narrowed so they stay below the face exclusion line (the guard tripped on the first attempt) | Claude (director) |
