---
title: "Intro video Rev 3 — bar-raiser brief (hero video craft + delivery research)"
type: research
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [company, video, intro-video, hero-video, craft, delivery, research]
---

# Bar-raiser brief — Service Pow intro video, Revision 3

**Purpose.** The repair board ([repair-board.md](../../company/campaigns/2026-08-26-intro-video/repair-board.md),
R1–R15) turns Revision 3 into a film that *passes the gate*. This brief is the layer above:
what separates a film a cold, burned home-service owner is impressed by from one that is
merely competent. Five research packets feed it (hook science, marker-line genre craft, web
delivery mechanics, homepage credibility, and ICP voice-of-customer).

**Honesty header.** The research container was egress-blocked for direct page fetches on
essentially every external host; nearly all web claims below come from search-result
snippets, not fetched pages, and are graded accordingly. The one true primary source is the
WCAG repository, cloned directly (`/home/user/w3c/wcag`). Section 5 is the full NOT VERIFIED
ledger. Nothing here loosens a standing constraint: no invented offers, the signed CTA
`See one made for your business ↓` is immovable, and the barred-claims list (R1/R4 —
`Can't get pulled.`, the realism claim over a cartoon) is absolute.

---

## 1. The ten criteria that separate impressive from competent — for THIS film

Each criterion is written as a checkable, with source and confidence carried through.
"Snippet" = WebSearch result content; the origin page was NOT fetched (egress-blocked).

### C1. Product legible by t = 3.0s, not just "inside 6s"
R7 requires `2 ideas × 2 hooks` legible inside 6s. Every external signal points tighter:
TikTok's own creative guidance (63% of highest-CTR videos put the product/message in the
first 3s; ~90% of recall impact inside 6s), VidMob's TikTok hook study (plain product shot
in first 6s lifted 6s-VTR +17%, beating every other opener), and Google's ABCD framework
(attract + brand inside 5s).
**Check:** OCR on frames at t ≤ 3.0s finds `video ads` or `2 ideas × 2 hooks` (P8: expects
avoid leading numerals); frame 1 carries ink AND motion. No centered wordmark in 0–3s —
corner mark only (never logo-first; Meta-attributed guidance).
**Source:** TikTok creative-tips PDF, VidMob hook analysis, Google ABCD — all via snippets,
NOT VERIFIED at origin. **Confidence:** practitioner-consensus (VidMob figure single-source).

### C2. The 10-second freeze test
Pause at t = 10.0s: a cold viewer must be able to state (a) what is sold — 4 video ads,
(b) for whom — service businesses, (c) one benefit. Rationale: the Nielsen/Meta-attributed
value curve (up to 47% of campaign value from sub-3s viewers, 74% by 10s) plus the Stanford
Web Credibility finding that look-and-first-impression is the dominant credibility test and
the 5-second-test convention for heroes.
**Check:** enumerate on-screen strings at t = 10; add a formal 5s/10s cold-watch question to
check 25 (Kobe cold watch).
**Source:** Meta/Nielsen via snippets NOT VERIFIED; Fogg 2003 / Lindgaard 2006 via snippets
(academic originals unfetchable). **Confidence:** practitioner-consensus resting on measured
originals not verified this session.

### C3. Front-loaded structure: 0–35s carries everything, 0–15s works alone
Wistia benchmark data (snippet): sub-60s videos average ~50–65% engagement — roughly half of
viewers never see the back half. Hero-context sources: visitors decide in 10–15s.
**Check (beat-map audit):** product name, `4 video ads · 2 ideas × 2 hooks`, `5–7 business
days from your footage`, and the compliance triple have ALL completed a first appearance by
t = 35s; product beat + compressed pain beat + one proof pointer complete inside 15s; the
endcard (t ≈ 55–60s) only reprises, never introduces. Pain beat capped at one beat, ≤ 6.0s
(it was 9.5s pain vs 1.4s offer pre-repair), framed as recognition (`You paid. It didn't
ring.`) not agitation.
**Source:** Wistia via snippet (single-source); hero-decision-window practitioner-consensus.
**Confidence:** practitioner-consensus.

### C4. Mid-loop entry never strands the viewer
Autoplay-loop viewers enter at random points; worst-case time-to-product-name must be
≤ 30s from ANY entry point. R8's persistent corner wordmark plus a repeated/persistent
compact product caption discharge this.
**Check:** from the string timeline, max gap between successive legible product
identifications ≤ 30s across the wrapped 60s loop.
**Source:** inference from loop mechanics + hook data above. **Confidence:** inference
(but cheap and fully checkable).

### C5. Reading physics on every burned string, not just the offer line
Sound-off video reading runs ~2 words/sec (subtitling ceiling ~3 wps); overlay convention
is 5–8 words, max 2 lines. Extends R2 (which protects only the offer line) to all 13
strings.
**Check:** per-string audit table — hold ≥ max(2.0s, 0.5s × word count); no string over
8 words or 2 lines (split into two cards rather than shrink type); no wordless hole > 2.5s
(R10) and no more than one element entering while a string is being read.
**Source:** biteable/subtitling/Clearcast via snippets, NOT VERIFIED (px/formula numbers
single-source). **Confidence:** practitioner-consensus.

### C6. Owner-register vocabulary gate
The ICP's language of pain is calls/jobs/phone — never impressions/clicks. Agencies worth
hiring "talk about leads, booked jobs, and cost per acquisition — not impressions and
clicks." `You paid. It didn't ring.` sits exactly on this register.
**Check (grep on build-source string list):** pain and outcome beats use only owner words
(ring, phone, booked, jobs, paid); zero marketing-metric words (impressions, clicks,
traffic, engagement, SEO); no feature string stands alone — `4 video ads · 2 ideas × 2
hooks` is co-timed with or chased (< 1.5s gap) by an outcome string in homeowner-plain
language; no string promises a third-party outcome (the labelled compliance triple is the
ceiling — `Can't get pulled.` stays dead permanently).
**Source:** trades-marketing buyer's guides via snippets; FTC HomeAdvisor order as the
archetypal burn (snippet + pre-cutoff knowledge). **Confidence:** practitioner-consensus.

### C7. Boil calibrated as craft, not Squigglevision
Line boil exists so held drawings read alive; over-boil is the documented cheap tell
(Squigglevision was explicitly a cost-cutter and viewers found it distracting).
Practitioner recipes: small amplitude relative to stroke weight, coarse noise, stepped
reseeds. Current build: 1.6–3px amplitude on ~4–6px strokes at 10 Hz — at the aggressive
edge — and one global 3-frame clock, so the whole picture pulses in unison.
**Check:** on a 3s held beat, difference three consecutive boil states — no vertex
displaces more than ~half the stroke width; adjacent elements change boil state on
different frame numbers (per-element phase offset); type wobble capped at ~1px or static
(motion on reading matter hurts comprehension — kinetic-typography consensus), verified at
the 390px crop.
**Source:** TVTropes/Squigglevision + premiumbeat recipe via snippets; build measurements
from `build/scenes.html` (measured). **Confidence:** practitioner-consensus; build facts
measured.

### C8. Nothing moves linearly; fast moves smear
Constant-velocity motion is the most-cited cheap tell. Current draw-ons are linear
dash-offset (`clamp(p*2)`), and all 13 strings enter with the identical 10px-rise+fade.
**Check:** every draw-on eases out (final 20% of path occupies ≥ 25% of reveal time);
reveal duration roughly proportional to path length (±30% across strokes); the 2-frame
snap gets one on-arc smear frame and the 0.5–0.6s board wipes get 2–3 dry-marker speed
strokes traveling with the wipe; text entrances differentiated by hierarchy — labels
appear/fade, only hook/offer/CTA get a kinetic moment, max one kinetic type moment per
beat.
**Source:** web.dev/NN/g-direction easing + smear-frame practice via snippets; build facts
measured from `scenes.html`. **Confidence:** practitioner-consensus.

### C9. The loop seam is a watched moment
Visitors instinctively wait for a loop to complete — the seam is inspected, not hidden.
Browsers can additionally hitch a frame at `<video>` loop restart; a drawn, matched,
ink-bearing seam masks the hitch, a blank one advertises it. Confirms R8's dual target
(matched AND non-empty) and R11's end-to-start sentence audit at full severity.
**Check:** seam frame-pair carries ink AND motion, PSNR dual target per R8; last string →
first string reads sanely (R11); the endcard resolves into the opening grid stroke.
**Source:** hero-video guides via snippets + delivery mechanics. **Confidence:**
practitioner-consensus.

### C10. The film never claims what the page can't show
B2B trust research: naked claims are distrusted; a homepage that depends on a video fails
the measurable share of visitors whose autoplay is blocked. The endcard points DOWN the
page — so the target must exist.
**Check (extends check 19, now a required pre-ship gate, Owner-run):** a finished spec ad
sits within one scroll below the hero; every claim burned into the film (5–7 business
days, 4 video ads · 2 ideas × 2 hooks, the compliance triple) also exists as HTML text on
the page; with the video element disabled, the page still states product, offer and CTA
above the fold via poster + copy; every load-bearing string legible at a 390px-wide crop
of the actual built hero, not just the 1920×1080 master.
**Source:** B2B trust-signal + conversion-posture snippets; no trustworthy public evidence
that hero video lifts conversion exists, so the page must not lean on it. **Confidence:**
practitioner-consensus.

---

## 2. Craft upgrades for the marker-line genre — apply at integration

Concrete, ranked; all compatible with R12–R15. The genre's premium/cheap split (synthesis,
inference-grade): premium = one bespoke drawing language, small stepped boil, eased
variable-speed reveals, smears on fast moves, type as drawn matter; cheap = stock assets,
constant-speed reveal, floating fake hand, dead vector holds, default fonts, uniform
entrances.

1. **De-synchronize the boil clock.** `boil()` is one global 3-frame clock (scenes.html
   lines 57–59) — every stroke reseeds on the same frame and the picture pulses in unison.
   Add a seed-derived per-element phase offset (0–2 frames). Check: two adjacent elements
   change boil state on different frame numbers.
2. **Ease the draw-on itself.** Replace linear `clamp(p*2)` dash progress with ease-out
   (marker decelerates into the final corner) and scale reveal duration to path length —
   a van outline visibly takes longer than a tick. Check: C8's ratio tests.
3. **Smear the two flash-cut offenders.** One elongated on-arc smear frame for the
   2-frame snap; 2–3 horizontal dry-marker speed strokes traveling with each board wipe.
   Gives the no-flash-cuts frame-check (P4) something to point at.
4. **Kill the default grotesque.** Liberation Sans/Arial (scenes.html line 15) is the
   largest remaining cheap tell after the boil fix. Marker/hand display face for short
   punch lines ONLY (never compliance labels or anything long), paired with a deliberately
   chosen legible sans for labels. Final pairing waits on brand direction A/B/C (Owner
   input 3) — but "not Arial" is decidable now.
5. **Boil-amplitude audit + type-boil cap.** C7's half-stroke-width ceiling; type static
   or ≤ 1px wobble. Reduce amplitude, not rate, if lines crawl at 100% zoom.
6. **Verify texture survives the encode.** The feTurbulence roughening (baseFrequency
   0.85) is sub-pixel; encode at delivery bitrate and crop-compare 200% against lossless.
   If marker edges smooth to clean vector or shimmer into mosquito noise, coarsen the
   noise or raise bitrate. If the 10 Hz boil (temporal noise) blows the size budget, the
   boil rate/amplitude is the first knob — and that tradeoff goes back through the gate,
   never tuned silently.
7. **Trade-accurate van (sharpens R14).** Check van v5 against a real reference photo of
   a US work van — roofline, wheels, ladder rack. Home-service owners pattern-match on
   their own equipment; one wrong detail reads as an out-of-touch agency to the one
   audience that knows trucks.
8. **The hand draws what is being drawn.** Keep the hand in the film's own wobble-stroke
   language (R13/R14); near a drawing beat it must plausibly relate to the stroke
   appearing — a hand that floats while lines appear elsewhere is the genre's most
   recognized VideoScribe-era tell. Never a photographic overlay.
9. **Draw/read co-timing, generalized from R15.** Every illustration's draw-on completes
   ≥ ~0.5s before its accompanying string leaves screen, so drawing and reading always
   overlap — the muted-hero equivalent of syncing draw speed to narration.
10. **Style rule, stated so no future revision "upgrades" it away:** no photoreal or
    pseudo-photographic element enters this film before a rights-clear real client clip
    does (R4 + R12 jointly enforce; the drawn style is strategically load-bearing — a
    cartoon makes no photorealism claim and cannot trigger the "looks AI" penalty).
    2025–26 trend coverage reads visible hand-drawn imperfection as an anti-AI
    authenticity signal (Adobe Creative Trends direction; practitioner-consensus).

---

## 3. Website delivery spec — handoff note for the site build

The film is a **message carrier, not wallpaper**. Practitioner consensus says ambient
background loops run 10–30s; 60s is a conscious, recorded deviation justified by the film
being narrative. Delivery choice for Karl (record it, don't default it): EITHER present
the 60s film as a foreground demo in the hero band with visible player chrome (pause +
scrub + replay), OR cut a 15–20s teaser loop for the hero and place the full 60s
click-to-play immediately below. Do not ship it as anonymous 60s background wallpaper.

**Markup contract**
```html
<video autoplay muted loop playsinline preload="metadata" poster="...">
  <!-- sources most-efficient-first, H.264 MP4 last -->
</video>
```
- `muted` as an HTML attribute (autoplay policy keys on the attribute); `playsinline`
  mandatory for iOS.
- JS: call `video.play()`, catch the rejected promise (iOS Low Power Mode, Android Data
  Saver) → leave the poster showing with a visible play button. Test on a real iPhone in
  Low Power Mode: page still communicates product + CTA as a still.

**Encode targets (run the matrix in-repo, record actual sizes in delivery notes)**
- H.264 MP4 (universal fallback): High profile, yuv420p, CRF ~23, `+faststart` (moov atom
  leads), ≤ 10 MB hard / ≤ 5 MB target.
- VP9 WebM: CRF ~33, ≤ 4 MB target. Optional AV1 as an additional source (Safari needs
  hardware decode — M3+/iPhone 15 Pro+), never the only source.
- Delivered master has NO audio stream (ffprobe shows exactly one video stream) — silent
  is the spec for this placement; keep `muted` in markup anyway. Supports the P2 ruling:
  harness gains a placement-aware `--allow-silent` mode, not per-master deviations.
- Exact 60.000s duration; mobile rendition (720p, ≤ 2–3 MB) or static poster on small
  screens if the 1080p master exceeds ~5 MB.

**Poster (load-bearing twice)**
- A rendered export of frame 1 AFTER R7 — grid drawing, ink on screen, product string
  legible. Never blank cream. It is the entire message for every autoplay-blocked viewer.
- AVIF/WebP ≤ ~100 KB with JPEG fallback; `fetchpriority=high` preload. Acceptance:
  Lighthouse reports the poster image, not the video, as the LCP element.

**Accessibility obligations (the one primary-source-verified item in this brief)**
- WCAG 2.2.2 Pause, Stop, Hide (Level A, and a Conformance-Requirement-5 non-interference
  criterion): auto-starting motion > 5s presented in parallel with other content requires
  a pause/stop/hide mechanism. A 60s autoplay hero beside page content unambiguously
  trips all three conditions. **Source: normative text read from the cloned w3c/wcag repo
  — measured, not snippet.**
- Therefore: a visible, keyboard-focusable pause/play toggle adjacent to or overlaid on
  the video, operable with Enter/Space, pausing without moving focus. `prefers-reduced-
  motion` does NOT discharge 2.2.2 (the Understanding doc never mentions it; WG debate is
  open in w3c/wcag issues #3766/#4319 — snippet-level).
- ADDITIONALLY honor reduced motion: `matchMedia('(prefers-reduced-motion: reduce)')` →
  suppress autoplay, show poster + play control (CSS alone cannot pause a `<video>`).
  Check: toggle the OS setting, reload, video does not move until asked.
- Fold both into blocking check 19 (page parity), Owner-run.

**Mobile crop**
- Do NOT `object-fit: cover` this 16:9 film on portrait viewports — cover-cropping keeps
  roughly the middle third of the 1920px width and destroys the R9-relaid strings.
  Either letterbox the 16:9 at intrinsic ratio (film is content, not wallpaper), or —
  since the film is code-rendered — re-render a true portrait/square layout from the same
  scene graph later.
- Acceptance: 390px-viewport screenshot at each beat, all strings legible (extends R9,
  which currently protects the vertical band only).

**Repurposing note (for the campaign bible):** the silent 16:9 master is
placement-correct ONLY for the homepage. Any TikTok/Reels placement requires the audio
bed restored (TikTok guidance treats sound as load-bearing), a 9:16 re-crop with the
safe band recomputed, and a full gate re-run.

---

## 4. Claims and credibility — an agency with no public case studies

The playbook the research converges on: with no client list, the proof classes available
are (a) the work itself, (b) the agency's own site as flagship, (c) a safe first step.
Service Pow's spec-ad-first design already matches — sharpen, don't decorate:

1. **The film + the on-page spec ad ARE the portfolio.** The endcard
   `See one made for your business ↓` may ship only if a finished spec ad is actually
   visible within one scroll below the hero (C10). An endcard pointing at nothing
   converts the asset into another broken promise — for an ICP whose archetypal burn is
   FTC-documented lead-quality misrepresentation (HomeAdvisor, up to $7.2M, Jan 2023 —
   snippet + pre-cutoff knowledge). The film is NOT signed off until the target exists.
2. **Zero fabricated proof on the page it plays on.** No invented logos, no anonymous
   testimonials — a testimonial without name + company + outcome is omitted entirely.
   This also keeps the `No fake testimonials` tick honest on the very page displaying it.
3. **Month-to-month string, conditional.** IF `pricing-and-packaging.md` (or the Drive
   OS) documents no-lock-in terms, add ONE trust-beat string (e.g. `No lock-in.`) —
   buyer's-guide consensus rates it the strongest single signal to contract-burned
   owners. If undocumented: add nothing, log the question in OPEN-QUESTIONS.md. Never
   invent the offer.
4. **AI is never the subject of a selling string.** Owners use AI themselves (SMB
   adoption snippets); consumers punish visibly-AI output (multiple survey snippets, all
   NOT VERIFIED). "AI" appears only in disclosure/compliance context. The sellable
   benefit is the output; the realism claim returns only over a rights-clear REAL client
   clip — the client's own jobsite/van/branding, never stock (constrains Owner input 2;
   stock footage would rebuild the exact objection the beat answers).
5. **Statistics hygiene (quality-bar rule: no source, cut it).** None of the
   snippet-level figures in this brief's research may appear in client-facing work until
   fetched at origin: not the CPL figures, not the AI-trust percentages, not "85% watched
   without sound" (a 2016 publisher-data report, not a Meta measurement — safe phrasing:
   "muted autoplay is the platform default"), not "80% conversion lift from video."
   Also: `positioning-and-icp.md` line 29 ("research shows consumers punish") is
   currently uncited in the workspace — keep the belief internally, source it before it
   goes external.
6. **No absolute performance/moderation promises, permanently.** Beyond R1: no string in
   any revision may promise a third-party outcome ("flood your phone with leads" is the
   scam register this ICP was burned by). The labelled compliance triple is the ceiling.

---

## 5. NOT VERIFIED ledger

Everything below was carried on WebSearch snippets or training knowledge only; every
origin host was egress-blocked (403 on CONNECT) from the research containers. Recorded
per honesty rules; none was routed around. Re-verify from an unblocked environment before
any external use.

**Figures that are folklore or untraceable — banned from all Service Pow materials:**
- "80% conversion boost from hero video" (no traceable study).
- "Clarity beats cleverness by 200–400%" (no underlying study).
- "71.3% completion for sub-60s ads" (low-trust roundup).
- "Hero videos add 1.2s to LCP" / "4.42% conversion loss per second" (untraceable).
- "85% of Facebook video watched without sound" as a Meta stat (origin: 2016 Digiday
  publisher-data report — inference from training knowledge).

**Directionally solid but snippet-level only (usable internally, not citable externally):**
- Meta/Nielsen value curve (47% by 3s, 74% by 10s); Facebook captions +12% view duration.
- TikTok creative tips (63% product-in-3s, ~90% recall by 6s); VidMob hook study
  (single-source); Google ABCD + Kantar lift figures (30%/17%).
- Wistia sub-60s engagement (~50–65%); Lindgaard 50ms / Fogg-Stanford credibility
  (academic originals unfetchable this session).
- AI-trust surveys: Klaviyo/Datalily 7%/31%, Gartner 50%, Harris/Smartly figures,
  JIA disclosure-label study; Thryv SMB AI adoption; contractor AI-trust survey.
- EverCommerce/Invoca/CallRail home-services stats (62%, 66%, CPL figures) —
  methodology uncheckable.
- Clutch 2025 website-trust figures (83%/87%) via a secondary snippet.
- FTC HomeAdvisor order — page level unverified (snippet + pre-cutoff knowledge of
  docket 1923106).
- All hero-video delivery norms (loop length 10–30s, size budgets, codec strategy,
  autoplay mechanics, Low Power Mode behavior) — 3+ independent guides agreeing, none
  fetched.
- All genre-craft claims (Squigglevision reception, RSA Animate history, VideoScribe
  tells, boil recipes, smear-frame practice, easing guidance, kinetic-typography rules).
- WCAG WG debate threads (w3c/wcag issues #3766/#4319) — GitHub API 403'd.

**Verified primary sources (the exceptions):**
- WCAG 2.2.2 normative + Understanding text — read from cloned w3c/wcag repo (measured).
- All internal build facts — measured from `build/scenes.html`, `repair-board.md`,
  `gate-record.md`, `positioning-and-icp.md`.

**Negative results, stated honestly:**
- No external evidence found for or against the spec-ad-as-cold-touch tactic
  specifically — it remains a company hypothesis (positioning-and-icp.md lines 26–28).
- No direct owner-voice forum quotes exist in this research (Reddit/ContractorTalk
  blocked); all "owner language" is filtered through agency/practitioner writing, which
  has an interest in the burned-buyer narrative. Directionally solid (agrees with the
  FTC record), rhetorically inflated.
- No trustworthy public evidence that a hero video lifts homepage conversion at all —
  which is why C10 requires the page to work with the video absent.
