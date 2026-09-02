# Pilot 01 — research phase result
Date researched: 2026-09-01 · Method: public web search + cross-verification only.
No paid data, no enrichment, no platform connected, nothing sent.

## STATUS: HALTED — structural blocker, not an effort limit
Research stopped deliberately after the blocker below was confirmed across the segment rather
than in a single row. Padding the cohort to 50 unmailable rows would have hit the number and
failed the task.

## The blocker
**The ICP and the channel are mutually exclusive.** Segment A (no website) and Segment B
(social-only) are defined by the absence of a website — and a local business's public email
address almost always lives on its website. No website, therefore no public email.

Verified across candidates, not assumed from one:
- Businesses found WITH a public email (Water Pros, Oasis) all HAVE websites — which
  disqualifies them from this pilot's ICP.
- The one genuine Segment B candidate found (AZ Advance Plumbing) has phone, address and
  hours publicly available, but **no public email anywhere in cross-checked search**.
- A targeted search for Chandler social-only plumbers returned the same shape: the companies
  exposing emails were the ones with websites; reaching the rest would require Facebook
  Messenger — a DM, which this pilot excludes.

The only routes to email for this ICP are paid enrichment or data purchase (both forbidden,
and both produce addresses obtained without consent), Facebook DM (excluded), or phoning to
ask (excluded). There is no compliant fourth route.

## Secondary tooling limits found
| Required field | Status |
|---|---|
| #4 Google Business Profile | Not retrievable. GBP data lives on Google Maps; bulk extraction is banned by the qualification rubric and by platform ToS. |
| #9 Review / activity signals | Same constraint — Google and Yelp are ToS-protected. |
| #10 Hours / alive signals | Partially available via aggregator listings only. |
| Public registry cross-check | AZ ROC contractor search returns HTTP 403 to automated fetch. |
| Facebook page verification | Pages are login-walled; content returned truncated and unusable. |

## Verified rows

### ROW 1 — candidate, Segment B
```
company:               AZ Advance Plumbing LLC
website_status:        social only - no standalone website found
website_url:           NONE FOUND
public_listing:        Facebook page; also listed on Yelp, BuildZoom, Manta, Buzzfile
city_service_area:     Gilbert, AZ 85233
public_email:          NONE FOUND - blocks email contact
public_phone:          (602) 403-5009
social_profiles:       facebook.com/AZAdvancePlumbing
review_activity:       UNKNOWN - not verifiable without ToS-protected extraction
hours_alive_signals:   listed 24/7 via aggregator listings; independent confirmation UNKNOWN
confirmed:             CONFIRMED 2026-09-01, 2 sources: no standalone website surfaced in
                       cross-checked search; business is listed with phone and Gilbert address
inferences:            INFERENCE: leads likely arrive by phone and Facebook message. Not observed.
unknowns:              owner name, decision maker, email, revenue, ad spend, marketing
                       performance, current pain, whether absence of a site is deliberate
confidence:            MEDIUM
recommended_offer:     Free Growth Audit (EV-sp-001)
outreach_angle:        Searched as a customer would and found no website - observation only,
                       stated as a question, never as a diagnosis
segment:               B
suppression_status:    clear 2026-09-01
sources:               facebook.com/AZAdvancePlumbing; yelp.com/biz/az-advance-plumbing-gilbert-2;
                       buildzoom.com/contractor/az-advance-plumbing-llc; manta.com/c/mhxtw8j/...
date_researched:       2026-09-01
```
**Not mailable.** No public email exists, so this row cannot enter an email-only pilot.

## Rejected rows — all rejected for HAS SITE (fails the Hot-only ICP)
| Company | Website found | Verdict |
|---|---|---|
| Oasis Plumbing Services (Gilbert) | oasisplumbingserviceaz.com | REJECT - has site |
| Water Pros Plumbing (Gilbert) | waterprosplumbing.com | REJECT - has site |
| Edwards Plumbing LLC (Gilbert) | edwardsplumbingllc.com | REJECT - has site |
| Phend Plumbing (Gilbert) | phendplumbing.com | REJECT - has site |
| Gilbert Plumbing | gilbertplumbingaz.com | REJECT - has site |
| Lawson Family Plumbing | lawsonfamilyplumbing.com | REJECT - has site |
| Chandler Plumbing | chandlerplumbing.com | REJECT - has site |
| EZ Flow Plumbing | ezflowplumbingaz.com | REJECT - has site |
| Gold Star Plumbing & Drain | goldstarplumbingaz.com | REJECT - has site |
| Jet'n Drains of Mesa | jetndrainsmesa.com | REJECT - has site |
| Los Plumbers | losplumbersaz.com | REJECT - has site |
| Roto-Rooter / Mr. Rooter (Mesa) | national franchises | REJECT - has site, not local SMB |

Discovery-method note: web search ranks websites, so it structurally surfaces the rows this
ICP excludes and hides the rows it wants. It is the wrong instrument for a no-website ICP.

## Options for the APPROVER — one decision needed
1. **Keep the ICP, change the channel.** Segment A/B are reachable by phone or physical mail,
   not cold email. Both are outside this pilot's stated restrictions.
2. **Keep the channel, change the ICP.** Target `weak site` rows instead: a site exists, so a
   public email usually exists, and the confirmed observation becomes something specific and
   checkable (no mobile viewport, no conversion path, broken form). This keeps email-only,
   keeps evidence discipline, and is the smallest change that makes the pilot runnable.
3. **Keep both, change discovery.** Manual map-walking by a person could find Segment A rows,
   but it does not solve the missing-email problem, so it does not make an email pilot viable.

**Recommendation: option 2.**
