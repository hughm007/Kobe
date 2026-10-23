---
title: "TripNerd — follow link and QR hand-over pack"
type: playbook
client: tripnerd
owner: Karl
status: draft
created: 2026-10-05
updated: 2026-10-05
tags: [client, instagram, owned-channels, qr-code, email, hand-over, test-month]
---

# Follow link and QR pack

**What TripNerd was promised** (PDF page 2, "Beyond the posts"):
> "Your customers, pointed at Instagram. We write a follow link and QR code for your booking emails, itineraries, email signatures and website. Past guests are your warmest followers."

- **This file is the pack** we hand over. **The process** (setup-call questions, steps, timing) is in [`../owned-channels-follow-link.md`](../owned-channels-follow-link.md).
- **We** write and test. **TripNerd** places it, because we have no access to its booking system, email tool or website.
- **All copy is DRAFT** until TripNerd's approver signs off. **Nothing goes to TripNerd without Karl.**

## 1. The copy pack, per placement

The copy is from the runbook's Step 4, unchanged. Each link is the tracked short link for that placement (§2). Until those exist, the destination is https://www.instagram.com/tripnerd/.

| # | Placement | Where exactly | Copy (DRAFT) | Link | QR | Check before use |
|---|---|---|---|---|---|---|
| 1 | **Booking confirmation** | One line under the booking details | "Follow @tripnerd for photos from our trips and first looks at next season's events." + button "Follow on Instagram" | Booking link | No | **Claim check:** keep "first looks at next season's events" only if TripNerd will really show next season's events on Instagram first. Otherwise cut it. Transactional email, so keep it short and below the booking details (§3) |
| 2 | **Pre-trip email / itinerary** | Near the trip-day details | "During the trip, tag @tripnerd in your Stories. We reshare the best ones." + QR | Pre-trip link | Yes, from the pre-trip link (useful on printed or PDF itineraries) | Ties to the guest loop: reshares follow [`guest-loop.md`](guest-loop.md) |
| 3 | **Printed** (welcome pack, table card, lanyard back) | Beside the QR | "Tag @tripnerd · Scan to follow" + QR | Print link | Yes, from the print link | Print spec in §5. Test the printed proof |
| 4 | **Post-trip thank-you** | In the thank-you email | "Your photos from [event] are here. If you post them, tag @tripnerd and we'll share the best ones." | Post-trip link | No | **NEEDS INPUT:** does TripNerd send photos after trips? If not, use only the second sentence. [event] names where guests went, never a partnership |
| 5 | **Email signature** (everyone who emails guests) | Under the name and title | "Follow our trips on Instagram: @tripnerd" (linked) | Signature link | No | **NEEDS INPUT:** who on the team sends email |
| 6 | **Website** | Instagram icon in the header and footer. On the enquiry thank-you page: "While you wait, see the trips: follow @tripnerd." | Icons: no text. Thank-you page: as shown | Website link | No | Optional: a separate link for the thank-you page, to count it apart. **NEEDS INPUT:** who edits tripnerd.com |
| 7 | **One-time past-guest email** (opted-in only) | Its own email | Subject: "We're showing more of the trips". Body: "We've started sharing more from our trips on Instagram: the seats, the setups, the moments. Follow along at @tripnerd. Got photos from your trip with us? Tag us, and we'll share the best." | Past-guest link | No | **Marketing email:** CAN-SPAM (§3). Send only after 3–4 strong posts are live (week 2–3). Reshared guest photos follow the consent rules in [`guest-loop.md`](guest-loop.md) §5 |

**Accessibility:** in emails and on the web, give the QR image alt text ("QR code: follow TripNerd on Instagram") and always print the handle next to it, so people who can't scan can still find the account.

## 2. Link plan

- **One tracked short link per placement:** 7 links (8 if the website thank-you page gets its own). Each one counts its own clicks.
- **All of them point to** https://www.instagram.com/tripnerd/.
- **Created in TripNerd's own link-shortener account**, so TripNerd owns them. **Open question for the call:**
  - which shortener;
  - who holds its login (record only where it lives, in [`access-and-accounts.md`](../../../access-and-accounts.md), never the password);
  - whether its free plan still counts clicks. Check the live plan before choosing (runbook Step 2).
- **No UTM tags:** the destination is Instagram, which doesn't report them back to TripNerd. The shortener's click count is the measure.

| # | Placement | Suggested link name | Short link | Created (date, by) | Clicked once to test |
|---|---|---|---|---|---|
| 1 | Booking confirmation | `ig-booking` | **NEEDS INPUT** | | ☐ |
| 2 | Pre-trip email / itinerary | `ig-pretrip` | **NEEDS INPUT** | | ☐ |
| 3 | Printed | `ig-print` | **NEEDS INPUT** | | ☐ |
| 4 | Post-trip thank-you | `ig-posttrip` | **NEEDS INPUT** | | ☐ |
| 5 | Email signature | `ig-signature` | **NEEDS INPUT** | | ☐ |
| 6 | Website | `ig-website` (+ `ig-thankyou` if split) | **NEEDS INPUT** | | ☐ |
| 7 | Past-guest email | `ig-pastguest` | **NEEDS INPUT** | | ☐ |

**Weekly, in the Monday report:** clicks per link, and follows that week. For the past-guest email, compare follows in the two days after it goes out with a normal day (runbook Step 7).

## 3. CAN-SPAM and email notes

- **Booking confirmations and pre-trip or itinerary emails are transactional.** Their main job has to stay the booking or the trip, so the follow line stays short and sits below the trip details.
- **The post-trip thank-you is close to the line.** Keep its main job the trip itself (the thanks, the photos). If it starts promoting new trips, treat it as marketing and apply the rules below.
- **The past-guest email is commercial**, so CAN-SPAM applies in full:
  - only people who agreed to marketing email;
  - an accurate "From" line and a subject line that isn't misleading;
  - a working unsubscribe link, with opt-outs honored within 10 business days;
  - a valid physical postal address.
  - Their email tool normally adds the unsubscribe link and the address.
- **Raise these from the client brief** ([`client-brief.md`](../../../client-brief.md), as recorded 2026-08-25; may have changed):
  - The brief found **no email platform**, and the contact form drops into an inbox. **NEEDS INPUT:** what sends booking and trip emails today, and what would send the past-guest email.
  - The brief notes the **CAN-SPAM address resolves to a residential condo**. **NEEDS INPUT:** which physical address goes in the footer.
  - A list built over years **can't be blasted.** Send to recent, opted-in guests first. The brief's email doctrine (validate, recent-first waves, re-permission) applies.

## 4. The QR files in this folder

| File | What it is |
|---|---|
| [`qr/tripnerd-instagram-direct.svg`](qr/tripnerd-instagram-direct.svg) | Vector. Scales to any print size |
| [`qr/tripnerd-instagram-direct.png`](qr/tripnerd-instagram-direct.png) | 740 × 740 px, black and white |

**These are an UNTRACKED test QR.** They point directly at https://www.instagram.com/tripnerd/, so **scans are not counted**.
- **Use them for:** testing, and laying out the print designs until the tracked links exist.
- **Once the print and pre-trip links exist:** make a new QR from each, with the same spec. Mark these files as superseded rather than deleting them.
- **If a print deadline comes before the tracked links,** printing the untracked QR is Karl's decision. Scans won't be counted.
- **The other fallback** is Instagram's own QR (app → profile → Share profile). It's free and branded, but it can't count scans either.

| Spec | Value |
|---|---|
| Encodes | `https://www.instagram.com/tripnerd/` |
| Generator | Python `segno` 1.6.6, 2026-10-05 |
| QR version, error correction | Version 3 (29 × 29 modules), level **M** (recovers about 15% damage) |
| Quiet zone | 4 modules of white on every side, built into both files |
| Colors | Black `#000000` on white `#FFFFFF` |
| SVG | Scale 10 → 370 × 370 px, vector |
| PNG | Scale 20 → 740 × 740 px, 1-bit |
| Verified | Both files decoded back to the exact URL with `zxing-cpp` on 2026-10-05: the PNG at full size and shrunk to 150 px, and the SVG from its own path data. The SVG and PNG match module for module. **Phone test pending (Karl)** |

**To rebuild for a tracked link** (same spec):

```python
import segno
qr = segno.make_qr("<tracked print link>", error="m", boost_error=False)
qr.save("tripnerd-instagram-print.svg", scale=10, border=4, dark="#000000", light="#ffffff")
qr.save("tripnerd-instagram-print.png", scale=20, border=4, dark="#000000", light="#ffffff")
```

## 5. Print spec

| Rule | Detail |
|---|---|
| **Size** | The code itself is **at least 0.8 in (2 cm) wide**. The files include the white border, so print the whole image at **at least 1.05 in (2.6 cm)** |
| **Resolution** | The PNG prints sharp up to about 2.4 in (6 cm) at 300 dpi. Larger than that, use the SVG |
| **Dark on light** | Black on white. Don't invert it, put it on a photo, or set it on brand blue without a new test |
| **Quiet zone** | Keep the white border clear: no text, logo, fold or card edge inside it |
| **No changes to the code** | No logo in the middle (that needs a different build and a new test), no stretching, no rounded or recolored modules |
| **Label** | Print the handle next to it ("Tag @tripnerd · Scan to follow") |
| **Surfaces** | On lanyards, curved or glossy stock, test the printed proof, not just the screen |

**Test with two phones (Karl), before anything is printed:**
1. Use one iPhone and one Android, each with its built-in camera app.
2. Scan from the screen, then from the printed proof at the real size.
3. Scan at arm's length and in dim light.
4. Confirm it opens **TripNerd's own profile** in the Instagram app. If possible, also check it in a browser on a phone without the app.
5. Record the result in the checklist below.

## 6. Hand-over checklist

**Before the pack goes**
- [ ] Setup-call answers in (runbook Step 1): email tool and editor, website editor, past-guest list and consent, printed items, October/November trips, who sends email
- [ ] Copy approved by TripNerd's approver (CLIENT_APPROVER). Claim check on placement 1 done
- [ ] Tracked links created in TripNerd's shortener account, one per placement, each clicked once (§2)
- [ ] Print and pre-trip QRs made from the tracked links, decoded, and **two-phone tested (Karl)**
- [ ] Where the shortener login lives recorded in `access-and-accounts.md` (pointer only)
- [ ] Past-guest email: opted-in list confirmed, sending tool known, unsubscribe link and physical address present, scheduled for week 2–3 after 3–4 strong posts

**The pack** (one line per item saying where it goes)
- [ ] Copy for placements 1–7
- [ ] The 7 (or 8) links, each named by placement
- [ ] QR files (SVG + PNG) for the pre-trip email and print
- [ ] Print spec (§5)
- [ ] **Karl sends it** to TripNerd's approver, and their team pastes it in

**After it's live** (runbook Step 6)
- [ ] Every link clicked
- [ ] Every printed QR scanned
- [ ] A test booking email sent to us and checked
- [ ] Clicks per link added to the Monday report
