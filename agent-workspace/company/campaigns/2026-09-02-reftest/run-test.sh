#!/bin/bash
P="A modern smartphone lying flat on a residential kitchen countertop, its screen showing an incoming call with a caller name and a green answer button and a red decline button, slow gentle push-in, soft natural daylight, plain uncluttered counter, no people"
gen() {  # $1=label  $2=use_ref
  local t0=$(date +%s)
  if [ "$2" = "ref" ]; then
    url=$(higgsfield generate create seedance_2_0 --prompt "$P" --duration 4 --resolution 1080p \
      --aspect-ratio 16:9 --generate-audio false --image-references refs/phone-incoming-call-REAL.jpeg \
      --wait --wait-timeout 12m --wait-interval 10s 2>&1 | grep -o 'https://[^ ]*' | tail -1)
  else
    url=$(higgsfield generate create seedance_2_0 --prompt "$P" --duration 4 --resolution 1080p \
      --aspect-ratio 16:9 --generate-audio false \
      --wait --wait-timeout 12m --wait-interval 10s 2>&1 | grep -o 'https://[^ ]*' | tail -1)
  fi
  local t1=$(date +%s)
  if [ -n "$url" ]; then
    curl -sS -f -o "out/$1.mp4" "$url" && echo "$1 OK  $((t1-t0))s  $(du -h out/$1.mp4 | cut -f1)"
  else
    echo "$1 FAILED"
  fi
}
gen "A-noref" none
gen "B-ref"   ref
gen "C-ref"   ref
