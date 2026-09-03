#!/bin/bash
# Run 9 gate sequence — cheap/high-information first, on frozen artifacts only.
set -u
T=~/Kobe/agent-workspace/playbooks/ads/scripts
QCPY="$T/.qcvenv/bin/python"
echo "=== MACHINE QA (BC-01..15 enforcement side) ==="
for v in build/exports/*.mp4; do
  [ -e "$v" ] || { echo "no exports yet"; exit 1; }
  echo "--- $(basename "$v") ---"
  "$QCPY" "$T/servicepow_qc.py" --master --aspect 16:9 --duration 20 "$v" 2>&1 | tail -12
done
