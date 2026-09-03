#!/bin/bash
g(){ local t0=$(date +%s) u
  u=$(higgsfield generate create seedance_2_0 --prompt "$2" --duration 4 --resolution 1080p \
      --aspect-ratio 9:16 --generate-audio false --wait --wait-timeout 12m --wait-interval 10s 2>&1 \
      | grep -o 'https://[^ ]*' | tail -1)
  local t1=$(date +%s)
  [ -n "$u" ] && curl -sS -f -o "build/assets/$1.mp4" "$u" && echo "$1 OK $((t1-t0))s" || echo "$1 FAIL"; }

g S1 "Slow push in toward a closed front door of a suburban Arizona house at dusk, warm porch light on, desert landscaping, no people, no text, documentary realism, vertical"
g S2 "Slow push in on standing grey water sitting in a stainless steel kitchen sink, not draining, faint ripple on the surface, clean modern kitchen, no people, no hands, no text, vertical"
g S3 "Slow tracking move along a quiet suburban Arizona residential street at dusk, single-storey homes, gravel yards, palm trees, warm sky, no people, no vehicles in foreground, no text, vertical"
g S4 "Slow push in under a kitchen sink on a chrome P-trap and braided supply lines, water beginning to move through the trap, clean cabinet interior, no people, no hands, no tools, no text, vertical"
g S5 "Slow push in on a kitchen tap running clear water into an empty clean stainless sink, water draining freely, bright daylight, no people, no hands, no text, vertical"
