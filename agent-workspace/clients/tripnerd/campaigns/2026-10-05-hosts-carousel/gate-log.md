---
title: "C02 hosts carousel — gate log"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [client, instagram, carousel, qc, gates]
---

# C02 "What corporate hosts get wrong": gate log

Each round goes to a fresh critic and a fresh, isolated Skeptic, each in its own scratchpad folder. Card PNGs aren't committed; their hashes are in `qc/sha256-v1.txt`.

| Version | Critic | Skeptic | Main findings | Next |
|---|---|---|---|---|
| v1 (7 type-only cards, frozen sha256 list `scratchpad/frozen/c02-v1/SHA256.txt`) | **HARD FAIL 6.4 ± 1.5**. BC-55 human half: "Want the day handled?" implies transport. Human presence 3 | **CONDITIONAL**: 6 × S2, 8 × S1, no S3/S4 | Implied transport on c7; c3's proof doesn't fit its point; type-only cover is generic; no premium-fan line; CTA not tappable; BC-19 pending | v2: copy fixes plus real TripNerd imagery (faces-free) |

## v1 critic report (verbatim)

```
SERVICEPOW CREATIVE CRITIC — GATE 1 OF 2 (BC-22)
Deliverable: TripNerd · 2026-10-05-hosts-carousel · C02-H1 · feed-portrait 1080x1350 · v1, 7 cards
Card: ServicePow-6 (client-facing static). Audio axis N/A (static).
Run: cold, 2026-10-05. Skeptic's verdict not seen and not waited on.

INTEGRITY
- SHA256.txt verified: all 7 PNGs match (sha256sum -c: 7/7 OK). The 16-character hash prefixes in the
  manifests also match.
- Inputs used: the 7 PNGs, the manifests, caption.txt, facts.json, static-qc-v1.txt, extra-checks-v1.txt,
  the Campaign Bible, the evidence register, qc/evidence-and-rights.md and the registry. I treated the
  Bible's narrative justifications as context only, never as evidence.

======================================================================
VERDICT: HARD FAIL — ServicePow-6 6.4 ± 1.5
  The hard failure is the BC-55 human half: c7 implies a service that no Evidence Record supports.
  The fix is a copy change ($0, no generation).
  Even with it fixed, the set is REVISE: the midpoint is below the 8.0 floor, and human presence
  scores 3, which is at or below 6.
  Even after both fixes, delivery stays blocked by the pending gates listed under Registry.
======================================================================

FIRST REACTION (stranger read, cards 1-7 in order at feed size)
  A clean, competent hosting-tips carousel. The cover tells me exactly who it's for, and I'd swipe.
  By card 4 it feels like a slide deck from a brand I can't see. The last card then asks me to trust
  them with "the day" without ever showing a guest, a suite or a golf course.
  The checklist card is the one thing I'd actually save.

FIVE VIEWER QUESTIONS
  WHO is it for?    ANSWERED. c1 says it outright: "Hosting clients at a golf tournament?" That is the
                    corporate host. Premium fans, the brief's second audience, are not addressed.
  WHY does it matter? MOSTLY ANSWERED. "Four moments decide the day." The stakes are implied (your
                    clients' experience), never stated: there's no cost to getting it wrong, and the
                    client relationship is never named.
  WHAT is offered?  WEAK. The offer appears only on c7: "TripNerd hosts guests at golf tournaments and
                    other big events." It's generic, never says "corporate", and never shows what is
                    sold (suites, hosted packages). "Want the day handled?" over-promises (see the hard
                    failure).
  WHY believe it?   PARTLY ANSWERED. Three proof bands from TripNerd's own records (c2, c3, c4) are the
                    strongest part of the set. They are text-only, though, with no image proving
                    anything, and c5, the moment c7 then promises to handle, has no proof at all.
  WHAT next?        ANSWERED. Save the checklist (c6); plan at tripnerd.com (c7). Gaps against the
                    stated objective: no send ask, no follow ask, and no "link in bio". A URL on an
                    image isn't tappable, and the caption doesn't say it either.

SEMANTIC HARD-FAILURE SWEEP (scorecard §1; each row checked, not assumed)
   1 Random disconnected scene ......... NONE. The c1 → c2-c5 → c6 → c7 sequence is coherent, and each
                                         card earns the next ("Next: …" chips).
   2 Story that does not make sense ..... NONE.
   3 Major face or hand issue .......... N/A. No people.
   4 Broken product ..................... N/A. No product depicted.
   5 Incorrect branding .................. NONE. The real logo file is composited unaltered (BC-21
                                         receipt; X2 rebuild is pixel-exact). Visually correct:
                                         nerd head, "TripNerd®", "FAN EXPERIENCES".
   6 Major continuity error ............. NONE at the hard-failure level. There is a minor
                                         system-continuity defect: the c3 numeral flips to the bottom
                                         (a format-fit note, below).
   7 Bad lip sync ........................ N/A.
   8 Unusable audio ...................... N/A.
   9 Wrong CTA ........................... NONE. Plan at tripnerd.com, plus save, is the right ask for
                                         the objective. It is incomplete (no send or follow ask), which
                                         is scored, not failed.
  10 Visuals contradict script ........... NONE.
  Semantic result: no §1 hit.
  The hard failure comes from the registry (BC-55 human half), cited by its BC id below, not
  re-derived here.

REGISTRY VERIFICATION (canonical blocking-check registry; status by BC id)
  Applicable by `applies` (any-deliverable / ad / client-facing / any-visual / static):

  | BC    | applies         | Status                     | Basis |
  |-------|-----------------|----------------------------|-------|
  | BC-16 | any-deliverable | COULD NOT RUN (pending)     | Every on-image claim cites EV-tripnerd-001 to 005, but none is APPROVED, because the CLIENT_APPROVER isn't named (known pending). INFERRED elements await that sign-off: "check-in" (001), "our guests" (002), "steps" (003). The scope of EV-001 says "don't pair with any tournament name"; c2's proof (an Augusta-week photo) sits one swipe from "At THE PLAYERS" on c3, inside a "the day" frame that reads as one hosted day. That needs an APPROVER ruling. The c7 transport implication has no EV record; it is counted under BC-55. |
  | BC-19 | ad              | COULD NOT RUN (pending)     | Known pending: the owner's phone receipt of the bio link. I tried to open https://tripnerd.com from here and got a proxy 403 (CONNECT tunnel failed). The page was NOT opened. Parity is not inferred. |
  | BC-20 | any-deliverable | PASSED (media scope)        | No photos, footage, music or likeness. Fonts are under the SIL OFL. The logo is the client's own, accepted by the APPROVER (TripNerd to confirm). The receipt explicitly excludes the "THE PLAYERS" word mark, so that question is carried under BC-55 and CONFLICT 2, not cleared here. |
  | BC-21 | any-deliverable | PASSED                      | The logo sha256 matches the APPROVER decision. It is composited unaltered, scaled only, and never placed directly on navy. Note: the palette comes from the director's brief, and TripNerd hasn't confirmed it (its brand guide is an empty template). |
  | BC-22 | client-facing   | FAILED                      | This verdict: 6.4 ± 1.5. Human presence 3, at or below 6. |
  | BC-23 | client-facing   | NOT RUN BY THIS GATE        | The isolated Skeptic's gate. Not seen, not awaited. |
  | BC-24 | ad              | COULD NOT RUN (owner ruling pending) | The angle is declared and the rotation excerpt is present. Critic's read: the mechanism really is rotated (teach and checklist vs the September showcase and montage). Logo-swap: the copy layer partly holds (the c2-c4 proofs are TripNerd-only), but the visual layer fails, since only the palette and logo are TripNerd's. Overlaps: "handled" echoes September's "Hospitality. Handled.", and the 17th repeats the 7 Oct Reel the day before. |
  | BC-42 | any-visual      | PASSED                      | All text is composited real type. OCR read back 189/193 words; the misses are display numerals. I inspected the PNGs and "1" and "3" render correctly. |
  | BC-51 | static          | PASSED                      | All 7 are 1080x1350 PNG, RGB, no alpha, 64-91 KB. Notes: the colour profile is untagged sRGB, and the "-c<n>" filename suffix awaits APPROVER ratification. |
  | BC-52 | static          | PASSED                      | Every element is inside the safe zone and every text role meets its floor. Minimum contrast is 4.89:1, measured at the ink pixels (X2). The logo plate overhangs the safe line by 12-16 px; it is background only. |
  | BC-53 | static          | PASSED (machine); human: passes with notes | A CTA pill on every card, inside the safe zone. The logo is never the hero. Critic's inspection: on c3 the "2" sits after the proof as a footer, breaking the reading order the other cards set. The "4" on c5 dominating is an acceptable folio device. |
  | BC-54 | static          | PASSED                      | One carousel, not variants. The lowest pair is c1~c7 at 0.092: two bookends with different text and layout. |
  | BC-55 | static          | FAILED (human half)         | Machine: no barred term appears, and tripnerd.com is present. Human: c5 teaches "Decide how every guest gets home", c6 asks "How do they get home?", then c7 asks "Want the day handled?" (repeated in the caption). The plain reading is that TripNerd handles all four moments, including getting guests home. No Evidence Record supports transport or the exit, and the Bible bars any transport claim. The registry's own words: "visuals that imply services not offered or results not evidenced fail even when no text lies." The receipt's "nothing implies transport" judged c5 alone, not the c6 → c7 payoff. ALSO OPEN (could not run): "THE PLAYERS" on c3 (CONFLICT 2). It's a registered event mark; a standing rule (on a branch) bars it in copy; tripnerd.com's own page carries a non-affiliation line; and facts.json bars "PGA TOUR" and "official" but not "THE PLAYERS". This needs an APPROVER ruling. |

  N/A by `applies` (not blocks):
    BC-01 to BC-15, BC-25 to BC-28, BC-30 (video-master; BC-25 is video-only, as briefed)
    BC-17, BC-18 (generated-media)
    BC-29, BC-43 (generation)
    BC-31, BC-34 (video-storyboard)
    BC-32, BC-33 (video-people)
    BC-35 to BC-40 (outbound)
    BC-41 (generated-visual)
    BC-44 to BC-50 (web)

  Known pending, recorded as could-not-run, not as creative failures:
    - BC-19 (the owner's phone receipt);
    - BC-16 (CLIENT_APPROVER not named, so EV-001 to 005 are unapproved).
  Per the scorecard, an applicable gate that could not run is still a delivery BLOCK. It stays open
  until a receipt lands.

SERVICEPOW-6 (each axis with its reason)
  1 Doesn't-look-AI ........... 8. Nothing is generated: real type and the real logo. The only drag is a
                                  flat, templated text-carousel look that reads "generic social", not
                                  synthetic.
  2 Hook inside 2s ............ 7. The c1 headline names the buyer and the situation in five words at
                                  96 px, and the subline promises a list (four moments). Strong for the
                                  target. But it's a flat site-blue field with no golf or hospitality
                                  image, so it has little stopping power in a photo-led feed.
  3 Human presence ............ 3. No people, no photo, no named host and no TripNerd imagery on any
                                  card. The only trace is the "Ours" / "our guests" voice. For a
                                  hospitality brand whose product is people being looked after, the
                                  absence is the set's biggest weakness. Real TripNerd material exists.
  4 Format fit ................ 7. Exact 4:5 spec, safe zones, swipe chips, a save card in the right
                                  place, and the cover survives the profile-grid crop.
                                  Deductions:
                                  - the c3 numeral flips to the bottom, which reads as an error, not a
                                    choice;
                                  - numeral scale wanders (250 / 340 / 380 / 470 px);
                                  - dead lower thirds on c2 (~y 1000-1190) and c4 (~y 960-1190);
                                  - about 370 px of empty top on c7.
  5 Audio design .............. N/A (static).
  6 Message + CTA clarity ..... 7. The teach structure and checklist are crystal clear, and "Plan yours at
                                  tripnerd.com" is a direct ask.
                                  Deductions:
                                  - "handled" over-promises;
                                  - no send or follow ask, against an objective of saves, sends and
                                    follows;
                                  - the on-image URL isn't tappable, and there's no "link in bio";
                                  - the c7 support line never names the corporate buyer.
  Mean of the five scored axes: (8 + 7 + 3 + 7 + 7) / 5 = 6.4  →  6.4 ± 1.5 (gated on the midpoint;
  no offset applied).
  Floor 8.0: NOT MET. No axis at or below 6: NOT MET (human presence 3).

AI ARTIFACT RISK: 1/10. No generated pixels. All type is real glyphs and the logo is the real file.
  There are no synthetic tells at feed size.

PACK RULE: this is one ad (1 concept x 1 hook x 1 placement). There are no siblings to score; H2 is held,
  not exported.

TOP 3 REASONS NOT TO SHIP
  1. c7 "Want the day handled?" (and the caption) implies TripNerd handles getting guests home. No
     EV record supports it and the Bible bars it. BC-55 FAILS.
  2. There's no human presence and no TripNerd imagery anywhere (axis 3), so the ServicePow-6 is
     6.4 ± 1.5, below the floor.
  3. Open blocks:
     - "THE PLAYERS" on c3 with no non-affiliation line (CONFLICT 2, unresolved);
     - BC-19 parity not opened;
     - EV-tripnerd-001 to 005 not approved by a CLIENT_APPROVER;
     - the BC-24 ruling is pending.

PRIORITIZED FIX LIST (per card, routed; the critic does not fix)
  P1 — HARD FAIL, copy-only, $0. Owners: servicepow-static-ads; claims via the campaign director.
    c7: replace "Want the day handled?" with a line that claims only what EV-001 to 004 support. For
        example, a direction: "Want a host who's done this before?" or "Want arrival, timing and dining
        handled?". Mirror the change in caption.txt line 3. This also removes the September
        "Hospitality. Handled." echo (BC-24).
    c5: EITHER keep it advice-only and make sure no later card implies TripNerd does the exit, OR have
        servicepow-client-intelligence confirm whether TripNerd arranges guest transport. If it does,
        file an EV record and add a c5 proof band like c2-c4. Never add the band without the record.
  P2 — BLOCK, needs an APPROVER ruling (campaign director; CONFLICT 2).
    c3: rule on "THE PLAYERS". Either:
        - reword without the event name, e.g. "At the island-green 17th, our guests watched from the
          rail"; or
        - keep it and add a non-affiliation line to the caption, matching tripnerd.com's own
          disclaimer.
        Either way, record the decision in facts.json, since the file bars "PGA TOUR" and "official"
        but is silent on the mark actually used.
    c2 / c3 / c4: rule on whether stitching an Augusta-week proof (c2) next to THE PLAYERS proofs
        (c3, c4), inside a "the day" frame, respects the EV-001 scope ("don't pair with any
        tournament name"). If not: loosen the c1 subline from "the day" to "a hosted day", and keep
        c2 without a place. Do not reach for "every event" framing: "every" is barred and
        unevidenced.
  P3 — REVISE, human presence (servicepow-static-ads for layout; servicepow-brand-fidelity and BC-20 for
       any photo).
    c1: put a real TripNerd photo behind or above the hook, keeping the type. This lifts both hook and
        human presence.
    c2: the real check-in table image (IMG_1901, the source of EV-001) as a proof panel. It turns the
        proof from a sentence into evidence.
    c3 / c4: a rail or suite still from TripNerd's own footage. CAUTION: V23 frames carry THE PLAYERS
        banner logo, a third-party mark, so crop it out or resolve P2 first. The 720p copies may be
        too soft for a 1080-wide panel; get Taylor's originals.
    c7: a real hosted-guest image in the empty top third.
  P4 — Format fit (servicepow-static-ads).
    c3: move the "2" to the top, as on c2, c4 and c5, or adopt one consistent numeral rule. That
        restores the label → numeral → headline reading order.
    c4: bring the "3" (250 px) into the same scale family as the others, or make the scale rule
        deliberate and consistent.
    c2, c4: close the dead band between the proof band and the CTA chip. Raise the chip, or use the
        space for the P3 photo panel.
    c7: rebalance the vertical composition; about 370 px of empty blue sits above the headline.
  P5 — CTA vs objective (servicepow-static-ads, caption).
    c6: add a send ask beside "Save this checklist", in the caption at minimum. A direction: "Send this
        to whoever's planning your next client day."
    c7: add "Link in bio" to the pill or as a subline (an on-image URL isn't tappable). Make the support
        line name the buyer, e.g. "TripNerd hosts corporate guests at golf tournaments…". "Corporate"
        must be covered by a re-filed EV-004 (LinkedIn: "corporate America").
    caption: add a follow ask (follows are a stated objective) and "link in bio".
  P6 — Optional tone (advisory).
    c2-c5: four "Don't…" headlines in a row can read as lecturing a senior buyer. Consider turning one
        or two into positive imperatives.

  Process items, not creative (campaign director):
    - BC-19 receipt;
    - name the CLIENT_APPROVER and get one email approving EV-tripnerd-001 to 005, including the
      INFERRED "check-in", "our guests" and "steps";
    - BC-24 ruling;
    - BC-23 Skeptic;
    - APPROVER ratification of the "-c<n>" suffix;
    - TripNerd's confirmation of the palette and logo.
  Any repair re-runs BOTH gates.

HUMAN WATCHED END TO END: BC-25 is N/A for a static (video-master only). An APPROVER read-through of all
  seven cards in swipe order, at phone size, is not recorded.
HUMAN TASTE GATE: AWAITING (the APPROVER's to answer: "would I put my name on this?").

ADVISORY — Direct-Response lens (never blocks, never clears, adds no axis)
  - Time to value proposition: what TripNerd sells first appears as a proof band on c2, and the offer
    itself only on c7. That suits a save-first organic play, but most viewers never reach c7.
  - CTA directness: c7 asks with a verb, the brand and an action ("Plan yours at tripnerd.com"). Good.
    It's undercut by the non-tappable URL and the missing "link in bio".
  - Persuasion vs cleverness: the cleverest element is the giant numerals. Give that space to a real
    photo of a TripNerd guest at the rail, and a corporate host is more likely to act.
  - Challenger: no problem/solution-first challenger exists (H2 is an alternate cover, not a
    challenger). Surface the exemption to the APPROVER by name.

LEARNING-LOG ENTRY (for the campaign director to file; location not provided to this gate)
  CLAUDE-CAUGHT — Implied service via the payoff card. A checklist carousel whose final card says
  "handled" implies the brand delivers every listed step, including steps with no Evidence Record
  (here, guest transport). Machine BC-55 cannot see it, and the per-card claim map checked c5 in
  isolation.
  Proposed check: the claim map gets a row for the payoff/CTA card's implied scope across every step
  the piece lists.

QC-VERDICT SECTION FOR THE BIBLE (§13; for the campaign director to transcribe — this gate edits no file
but this one)
  HARD FAIL, ServicePow-6 6.4 ± 1.5.
  - BC-55 human half FAILED: c7 "day handled" implies transport (no EV).
  - BC-22 FAILED: human presence 3.
  - BC-16, BC-19 and BC-24 could not run (pending); CONFLICT 2 (THE PLAYERS) is unresolved.
  - AI-artifact risk 1/10.
  - Fixes P1-P6 above. Re-run both gates after repair.
```

## v1 Skeptic Pass 3 (verbatim)

```
SKEPTIC VERDICT — Pass 3
Verdict: CONDITIONAL
Findings:
- [S2] c2 / client + truth — Record shows a TripNerd-draped table with lanyard-wearing people and one "STAFF" badge; it does not show check-in activity or which event. The "Ours:" band also makes the advice line ("one host who knows their name") read as TripNerd's own practice at golf events, which no record supports. Confirm the photo shows a check-in function at a golf/comparable event, or narrow the band to what the photo shows, before posting.
- [S2] c3 / industry professional + persuasion — The proof band ("At THE PLAYERS, our guests watched 17 from the rail") is about where guests stood, not when; it does not support the card's TIMING point (tee times, leaders reaching your hole). The strongest proof in the set sits on the card it doesn't prove; a professional reads it as a non-sequitur.
- [S2] c5 → c7 / target customer + truth — Cards 2–4 each carry a TripNerd proof band; c5 (THE EXIT) is the only one without, which draws attention to the gap, and "Want the day handled?" on c7 then implies TripNerd also handles getting every guest home. CLIENT-FACTS contains no record of TripNerd doing guest transport/exit logistics.
- [S2] c7 + caption / CTA — "Plan yours at tripnerd.com" is not tappable in an Instagram caption or image, the caption does not point to the bio link, and the packet states the bio-link destination is still being re-confirmed; the only conversion path is unverified at review time, and nothing shows the destination has a corporate/golf-hospitality entry point rather than a generic homepage.
- [S2] c1 (grid/feed cover) / first-3s + competitor — The cover is a flat blue text card with no picture and nothing client-specific beyond the logo; the client owns footage of its own suite on 17 at THE PLAYERS, but it appears only as two text bands on cards 3–4. Swap the logo and cards 1, 5, 6 and 7 work for any hospitality competitor, falling short of the "specific to this client" rule on the card doing most of the stopping.
- [S2] whole carousel / target customer (premium fan) — Every card is framed as "Hosting clients…"; a premium fan (one of the stated save/follow goals) has nothing to save or follow for.
- [S1] c2–c6 / legibility — The logo's "FAN EXPERIENCES" descriptor in the top-right badge is about 8px tall on a 1080px canvas and unreadable at phone size.
- [S1] c1, c7, c2–c6 badge / legibility — The white TripNerd wordmark on the light-blue field (#5896E9) is about 3.0:1 contrast; it passes only as a large logo and looks washed out on phone screens.
- [S1] c2–c6 / placement — Instagram's carousel counter ("2/7") appears top-right on swipe and will briefly cover the right edge of the logo badge (x≈774–1044, y≈55–167).
- [S1] c3 / layout — The big "2" sits orphaned under the band in the bottom half, while on c2/c4/c5 the number precedes the headline; reads as a layout slip rather than a choice.
- [S1] c3 / trademark — "THE PLAYERS" copies the event's own all-caps mark styling with no non-affiliation line (TripNerd's website page carries one); usage stays at "where guests went," so low risk.
- [S1] c4 / industry professional — The advice is "put the food where the view is," but the proof says the buffet was "steps from" the rail, i.e. not at the view; a sharp reader sees the proof slightly conceding the point.
- [S1] c2 vs c3/c4 / consistency — Only c2's band starts with "Ours:"; the three proof bands are worded inconsistently.
- [S1] caption / discovery — "#golf" is the only discovery hashtag; nothing targets corporate hospitality.
Lens/test coverage: target customer, client, industry professional, competitor lenses run; weakest-2s (c3 proof/point mismatch), first-3s (c1 weak, above), persuasion (proof carried by two text bands only), cheese (no false/salesy lines found), trust (c2 inference, c5/c7 implied capability), AI-detection (no synthetic imagery or people; nothing for a viewer to spot as synthetic); claims checked against CLIENT-FACTS — c3 rail, c4 suite/buffet and c7 golf-hosting lines supported by records (2), (3), (4); c2 "check-in" and implied exit handling not fully supported (above). No S3 or S4 found.
Conditions for APPROVER acceptance: each S2 above must be fixed or individually accepted by the APPROVER; the bio-link/destination check must pass on a phone before the Thursday 8 October 2026, 12:30 PM ET slot (failure converts to BLOCK).
Isolation: packet verified; production reasoning, cost, draft history, and other evaluators' output withheld.
```
