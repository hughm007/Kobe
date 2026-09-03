#!/bin/bash
P="A plumber crouched under a residential bathroom sink, gripping a red pipe wrench with both hands, the wrench jaws closed horizontally around the chrome P-trap nut and turning it, chrome trap and braided supply lines visible, tiled wall behind, natural daylight, realistic documentary photography"
gen() {
  local t0=$(date +%s) url
  if [ "$2" = "ref" ]; then
    url=$(higgsfield generate create seedance_2_0 --prompt "$P" --duration 4 --resolution 1080p \
      --aspect-ratio 16:9 --generate-audio false --image-references refs/wrench-ref-B.jpg \
      --wait --wait-timeout 12m --wait-interval 10s 2>&1 | grep -o 'https://[^ ]*' | tail -1)
  else
    url=$(higgsfield generate create seedance_2_0 --prompt "$P" --duration 4 --resolution 1080p \
      --aspect-ratio 16:9 --generate-audio false \
      --wait --wait-timeout 12m --wait-interval 10s 2>&1 | grep -o 'https://[^ ]*' | tail -1)
  fi
  local t1=$(date +%s)
  [ -n "$url" ] && curl -sS -f -o "out/$1.mp4" "$url" && echo "$1 OK $((t1-t0))s" || echo "$1 FAILED"
}
gen "D-noref" none
gen "E-ref"   ref
gen "F-ref"   ref
