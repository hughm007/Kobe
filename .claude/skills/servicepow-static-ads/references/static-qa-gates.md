# Static QA gates — objective definitions (BC-51..BC-55)
Executable wherever objectivity allows. The composer emits a manifest per export (every
placed element: role, box, font px, colors); the QC measures the manifest + the pixels.
Hand-built comps must emit the same manifest or they cannot pass the machine gates.

## BC-51 — PLACEMENT SPEC EXACT (machine)
Pixel dimensions exactly match the placement matrix · format/colorspace per export
standards · file under budget · filename encodes the variant coordinate.

## BC-52 — SAFE ZONES + LEGIBILITY (machine)
Every essential element's box inside its placement's safe zone · every text role at or
above its px floor · measured contrast of each text block vs its local background >= 4.5:1
· no text block wider than 80% of safe width.

## BC-53 — HIERARCHY + CTA (hybrid)
Exactly one dominant element · a CTA block exists, distinct in form, inside the safe zone ·
reading order declared in the manifest and plausible on inspection · logo present, not
dominant. Machine checks presence/geometry; a human confirms the order actually reads.

## BC-54 — VARIANT DISTINCTIVENESS (hybrid)
Pairwise visual difference scored across the delivered set (the QC's diff score flags
near-duplicates); flagged pairs are judged — same-layout-different-words is ONE ad. The
critic's generic-kill covers distinctiveness against the market; this gate covers
distinctiveness within the set.

## BC-55 — CLIENT INFORMATION VERBATIM (hybrid)
Phone, licence, offer terms, service scope on every export match the client KB verbatim
(the facts file, sourced from the KB, never typed from memory) · barred words absent ·
misleading visual implications (services not offered, results not evidenced) fail here even
when no text lies.

## Shared gates that also bind statics
BC-16 claims · BC-20 rights · BC-21 brand assets · BC-42 composited text (any-visual) ·
BC-41 physical/trade realism for any generated imagery · BC-22 critic score (the only
client-ready number) · BC-23 isolated skeptic.
