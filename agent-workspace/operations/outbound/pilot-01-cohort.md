# Pilot 01 — qualified cohort (revised ICP: existing site + public email + verified weakness)
Date researched: 2026-09-01 · Method: public web search + direct inspection of each business's
OWN url (permitted by the qualification rubric). No paid data, no enrichment, no platform
connected, nothing sent. ICP change is a pilot targeting decision only — canonical doctrine
unchanged.

## Yield
Businesses inspected: 35 · Qualified: 6 · Rejected: 29 (~17% yield)

## Method limits — stated so the evidence is not overread
- **Segment B (mobile / performance / technical) is largely unverifiable with these tools.** I
  can fetch and parse a page; I cannot render it, measure load time, or test a mobile viewport.
- **I discarded my own initial broken-image findings.** Converted markup showed
  `data:image/gif;base64` and placeholder SVG stand-ins on several sites. Those are
  indistinguishable from ordinary lazy-loading without rendering, so treating them as breakage
  would have been an unverified claim. Same for one site's `0+` statistics block, which is
  consistent with a scroll-animated counter.
- What IS reliably verifiable this way: presence/absence of a published email, presence/absence
  of a lead-capture form (cross-checked on a second page), service/location clarity, footer
  copyright year, business-name inconsistency, HTTP status, and TLS certificate validity.

## Qualified cohort — 6 rows, all Segment A, all cross-checked on 2 pages
Every row: website exists, public business email exists, and a lead-capture form is absent
from BOTH the homepage and the contact page (or the contact page 404s). The confirmed
observation is the absence of a form, nothing more. Whether that absence is a problem is the
prospect's to say, not ours.

### 1. Davis Plumbing & Drain Service — Apache Junction
```
website:        davisplumbingservice.com          segment: A    confidence: HIGH
email:          davisplumbingdrain@msn.com        phone: (480) 985-3012 (tel: link present)
service_area:   "Mesa, Gilbert, Chandler, Tempe and Apache Junction" (quoted from site)
CONFIRMED:      No lead-capture form on homepage or /contact/ (2 pages, 2026-09-01).
                Footer copyright reads 2013. Contact email is on msn.com, not the business domain.
INFERENCE:      Enquiries arrive by phone only. Not observed.
UNKNOWN:        owner, revenue, ad spend, marketing performance, lead volume, whether any of
                this is deliberate
suppression:    clear 2026-09-01
sources:        davisplumbingservice.com/ ; davisplumbingservice.com/contact/
```

### 2. Zippy Zebra Plumbing — Mesa
```
website:        zippyzebraplumbing.com            segment: A    confidence: HIGH
email:          admin@zippyzebraplumbing.com      phone: 480-820-6595 (tel: link present)
service_area:   "Mesa, Gold Canyon, Gilbert, Apache Junction, Chandler and Tempe" (quoted)
CONFIRMED:      No lead-capture form on homepage or /contact/ (2 pages, 2026-09-01). The
                "Request an Appointment" CTA leads to a contact page that has no form.
                Address listed as PO Box 20071, Mesa AZ 85277.
INFERENCE:      The appointment CTA sets an expectation the page does not fulfil. Not observed.
UNKNOWN:        owner, revenue, ad spend, marketing performance, lead volume
suppression:    clear 2026-09-01
sources:        zippyzebraplumbing.com/ ; zippyzebraplumbing.com/contact/
```

### 3. Amour Plumbing Services — San Tan Valley
```
website:        amourplumbingservices.com         segment: A    confidence: HIGH
email:          office@amourplumbingservices.com  phone: (480) 680-7555 (tel: link present)
service_area:   "YOUR LOCAL, TRUSTED PLUMBING IN QUEEN CREEK AND SAN TAN VALLEY" (quoted)
CONFIRMED:      No lead-capture form on homepage or /contact/ (2 pages, 2026-09-01).
                Footer copyright reads 2022.
INFERENCE:      Enquiries arrive by phone only. Not observed.
UNKNOWN:        owner, revenue, ad spend, marketing performance, lead volume
NOTE:           Earlier suspected broken images were DISCARDED as unverifiable (lazy-loading).
suppression:    clear 2026-09-01
sources:        amourplumbingservices.com/ ; amourplumbingservices.com/contact/
```

### 4. Young Plumbing — Gilbert
```
website:        youngplumbingaz.com               segment: A    confidence: HIGH
email:          youngplumbingaz@gmail.com         phone: 480-549-6711 (tel: link present)
service_area:   East Valley - Gilbert, Chandler, Mesa, Queen Creek, San Tan Valley
CONFIRMED:      No lead-capture form on homepage; /contact returns HTTP 404 (2026-09-01).
                Primary CTA is "Call or text 480-549-6711". Email is a gmail address, not on
                the business domain.
INFERENCE:      Enquiries arrive by phone or text only. Not observed.
UNKNOWN:        owner, revenue, ad spend, marketing performance, lead volume
suppression:    clear 2026-09-01
sources:        youngplumbingaz.com/ ; youngplumbingaz.com/contact (404)
```

### 5. Queen Creek Plumbing Services — Queen Creek
```
website:        queencreekplumbingservices.com    segment: A    confidence: HIGH
email:          info@queencreekplumbingservices.com  phone: (520) 339-6873 (tel: link present)
service_area:   "Queen Creek, San Tan Valley, Florence, Gold Canyon, Apache Junction, Mesa,
                Gilbert, Chandler, Higley, Power Ranch" (quoted)
CONFIRMED:      No lead-capture form on homepage; /contact returns HTTP 404 (2026-09-01).
INFERENCE:      Enquiries arrive by phone only. Not observed.
UNKNOWN:        owner, revenue, ad spend, marketing performance, lead volume
suppression:    clear 2026-09-01
sources:        queencreekplumbingservices.com/ ; queencreekplumbingservices.com/contact (404)
```

### 6. Los Plumbers Rooter & Plumbing LLC — Mesa
```
website:        losplumbersaz.com                 segment: A    confidence: HIGH
email:          office@losplumbersaz.com          phone: (480) 765-3020 (tel: link present)
service_area:   "Mesa plumbing done right... across the Valley" - Mesa, East Valley, Greater
                Phoenix, Pinal County (quoted)
CONFIRMED:      No lead-capture form on homepage; the "Get a free quote" CTA targets a
                #contact anchor with no form behind it; /contact returns HTTP 404 (2026-09-01).
INFERENCE:      The quote CTA sets an expectation the page does not fulfil. Not observed.
UNKNOWN:        owner, revenue, ad spend, marketing performance, lead volume
suppression:    clear 2026-09-01
sources:        losplumbersaz.com/ ; losplumbersaz.com/contact (404)
```

## Offer routing — same for all six
Free Growth Audit (EV-sp-001) as the opener. The only CONFIRMED gap is lead capture, so the
relevant capability is website / landing-page work (services section 4). Ad production is NOT
pitched: nothing observed evidences a demand problem, and pitching video here would be selling
past the evidence.

## Notable rejection — verified weakness, but unmailable
**Mesa Plumbing & Pipe Experts** (mesaplumbingpipeexperts.com) has a genuine, measured
Segment B failure: the TLS certificate does not match the hostname (cert covers
`*.web-hosting.com` only), reproduced on both https and http requests 2026-09-01. Visitors get
a browser security warning. No public email is retrievable — the site cannot be loaded and
search surfaces none — so it cannot enter an email-only pilot. Recorded as the strongest
non-email lead found.

## Rejection summary (29)
| Reason | Count |
|---|---|
| No public business email published | 14 |
| No material verified weakness (site is sound) | 11 |
| Site unreachable - HTTP 403 blocked inspection | 2 |
| Email published but obfuscated, not retrievable | 1 |
| Verified weakness but no public email | 1 |

Two of the no-email rejections were also out of geography (Scottsdale, Tucson).
Near-name collisions resolved as distinct businesses, not duplicates: Oasis Plumbing Services
(Gilbert) vs Oasis Plumbing Solutions (Tucson); Davis Plumbing & Drain (Apache Junction) vs
MD/Mike Davis Plumbing (Gold Canyon); AZ Advance Plumbing vs Advanced Plumbing Services.
