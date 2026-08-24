"""The audit trail — what Orion did, and why, in one greppable file.

Every turn, tool call, confirmation outcome, interruption and heartbeat event
lands in state/audit.jsonl with a timestamp. When something surprises Karl,
this file is how he finds out what happened. It also carries per-turn token
usage, so a runaway loop shows up as a visible cost line, not a bill.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path


class AuditLog:
    def __init__(self, path: Path) -> None:
        self.path = path

    def log(self, kind: str, data: dict | None = None) -> None:
        entry = {"ts": datetime.now().isoformat(timespec="seconds"), "kind": kind}
        if data:
            # Keep entries readable: clip giant payloads, never store secrets.
            entry.update({k: self._clip(v) for k, v in data.items()})
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            with self.path.open("a", encoding="utf-8") as fh:
                fh.write(json.dumps(entry, ensure_ascii=False, default=str) + "\n")
        except OSError:
            pass  # a full disk must never take down a conversation

    @staticmethod
    def _clip(value, limit: int = 500):
        if isinstance(value, str) and len(value) > limit:
            return value[:limit] + f"…[{len(value)} chars]"
        return value

    # ------------------------------------------------------------- reporting

    def lifetime_cost(self, price_in_per_mtok: float, price_out_per_mtok: float) -> tuple[int, int, float]:
        """Total tokens and dollars across every session in the log."""
        tokens_in = tokens_out = 0
        if self.path.is_file():
            for line in self.path.read_text(encoding="utf-8").splitlines():
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if entry.get("kind") == "turn.end":
                    tokens_in += int(entry.get("input_tokens", 0) or 0)
                    tokens_out += int(entry.get("output_tokens", 0) or 0)
        cost = (tokens_in * price_in_per_mtok + tokens_out * price_out_per_mtok) / 1_000_000
        return tokens_in, tokens_out, cost

    def tail(self, count: int = 20) -> list[dict]:
        if not self.path.is_file():
            return []
        lines = self.path.read_text(encoding="utf-8").splitlines()[-count:]
        out = []
        for line in lines:
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                continue
        return out
