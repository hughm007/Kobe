# VENDOR PRECEDENCE — Higgsfield
The rule, in one line: **SERVICE POW DECIDES WHAT AND WHY. VENDOR INTELLIGENCE EXPLAINS HOW THE
TOOL WORKS.**

Upstream vendor skills are pinned technical manuals (see `pin.json`). We do not edit upstream
source to make it agree with us — we subordinate it by architecture:

1. **Triggers.** Vendor skills never own Service Pow advertising workflow requests. Generic ad
   requests ("make an ad", "create a commercial", "make a video ad", campaign work for a
   client) belong to `servicepow-campaign-director` wherever the ad-production profile is
   installed. In profiles without the ad suite (e.g. website), the installed LAW file directs
   such requests to the ad-production profile instead of letting vendor Marketing Studio
   answer them.
2. **Spend.** Vendor conveniences (quality-default routing, one-shot `--wait` dispatch, "don't
   pre-estimate cost") are subordinate to `policies/generation-and-spend.md`. The vendor
   command runs only AFTER method → live state → cost → SPEND_APPROVER.
3. **Brand truth.** Vendor mark-generation routes (brandkit SVG logos, Marketing Studio brand
   kits from a URL) are subordinate to `policies/brand-assets.md` §4.
4. **Compliance & delivery.** Nothing a vendor tool emits ships without the canonical
   blocking-check registry. Vendor QC/checklists are inputs, never gates.
5. **Technical truth flows the other way.** Current model IDs, capabilities, prices, plan and
   balance come from the vendor runtime (`higgsfield model list`, `account status`,
   `generate cost`). Service Pow doctrine never hardcodes them; where vendor docs and the live
   CLI disagree, the live CLI wins. Operation states are classified per
   `vendor/CAPABILITY-LADDER.md`.

Known upstream frictions (recorded, not "fixed" upstream): quality-default + no-pre-estimate UX
rules conflict with our ladder; broad ad triggers conflict with our director; brandkit generates
marks; `higgsfield-websites` targets TanStack/Bun/Cloudflare and is excluded from the website
profile (stack collision with servicepow-v2). These are handled by the rules above.
