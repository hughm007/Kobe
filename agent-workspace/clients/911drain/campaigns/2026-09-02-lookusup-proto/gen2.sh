#!/bin/bash
g(){ local t0=$(date +%s) out
  out=$(higgsfield generate create seedance_2_0 --prompt "$2" --duration 4 --resolution 1080p \
      --aspect-ratio 9:16 --generate-audio false --wait --wait-timeout 12m --wait-interval 10s 2>&1)
  local t1=$(date +%s)
  echo "--- $1 raw output ---"; echo "$out" | tail -3
  u=$(echo "$out" | grep -o 'https://[^ ]*' | tail -1)
  if [ -n "$u" ]; then curl -sS -f -o "build/assets/$1.mp4" "$u" && echo "$1 OK $((t1-t0))s"; else echo "$1 NO-URL"; fi
  sleep 20; }
g S4 "Slow push in under a kitchen sink on a chrome P-trap and braided supply lines, water beginning to move through the trap, clean cabinet interior, no people, no hands, no tools, no text, vertical"
g S5 "Slow push in on a kitchen tap running clear water into an empty clean stainless sink, water draining freely, bright daylight, no people, no hands, no text, vertical"
