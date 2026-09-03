# Test 1 — device reference grounding. Controlled single-variable test.
SHOT JOB: a realistic smartphone on a residential countertop receiving an incoming call.
The phone is the subject. No distracting cinematic scenery.

CONTROLLED IDENTICAL ACROSS A' / B / C:
  model seedance_2_0 · duration 4 · resolution 1080p · aspect 16:9 · mode std
  generate_audio false (silent visual master, per audio-decoupling doctrine)
  PROMPT (byte-identical):
  "A modern smartphone lying flat on a residential kitchen countertop, its screen showing an
   incoming call with a caller name and a green answer button and a red decline button, slow
   gentle push-in, soft natural daylight, plain uncluttered counter, no people"

ONLY VARIABLE: presence of --image-references refs/phone-incoming-call-REAL.jpeg

  A' = no reference   (NEW controlled control - see note)
  B  = reference
  C  = reference, independent second generation (reliability, not a retry)

NOTE ON BASELINE: the Run 9 phone shot is NOT a valid control. Its prompt differed
("blank search field, water beading near the sink"). Using it would confound prompt change
with reference change. A' is generated fresh with the identical prompt so B and C differ
from it by exactly one variable. Cost of scientific validity: 36 credits.

SEED: seedance_2_0 exposes no seed parameter. Reproducibility cannot be seed-pinned;
this is why C exists.
