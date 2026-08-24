"""The heartbeat — Orion acting without being spoken to.

A separate loop in a separate process (`uv run orion-heartbeat`), deliberately
decoupled from the conversation so that moving it to an always-on machine
later is a relocation, not a rewrite. It wakes on an interval, runs whichever
checks are due, and routes anything noteworthy onto the notice board that the
REPL shows Karl.

The hard-won rules, built in from the start:

- Quiet by default. Most checks produce nothing most of the time.
- The schedule survives restarts: next-due times persist in
  state/schedule.json, so a restart resumes instead of refiring everything.
- No overlapping runs: a check still running when its next turn comes due is
  skipped, not stacked.
- Quiet hours defer non-urgent surfacing; only level="interrupt" may break
  through at night.
- The kill switch (state/PAUSED) halts all checks while conversation and
  notices keep working.
- Never blocks on an absent human: checks don't get a confirmer at all, so a
  consequential action is declined by the agent's own default and the check
  leaves a note instead (see agent.UNATTENDED_MESSAGE).
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable

from .audit import AuditLog
from .config import Config, get_config
from .notices import NoticeBoard


@dataclass
class Check:
    """One scheduled check: a name, a cadence, and a callable that inspects
    the world and posts notices. Interval and settings come from orion.toml —
    tuning a threshold is a config edit, not a code change."""

    name: str
    interval_seconds: float
    run: Callable[[Config, NoticeBoard, dict], None]
    settings: dict


def _parse_quiet_hours(raw: str) -> tuple[int, int] | None:
    """'22:00-08:00' → (22, 8). Empty disables quiet hours."""
    try:
        start_str, end_str = raw.split("-")
        return int(start_str.split(":")[0]), int(end_str.split(":")[0])
    except (ValueError, AttributeError):
        return None


def in_quiet_hours(now: datetime, window: tuple[int, int] | None) -> bool:
    if window is None:
        return False
    start, end = window
    if start == end:
        return False
    if start < end:
        return start <= now.hour < end
    return now.hour >= start or now.hour < end  # crosses midnight


class Heartbeat:
    def __init__(self, config: Config, checks: list[Check], board: NoticeBoard | None = None) -> None:
        self.config = config
        self.checks = checks
        self.board = board or NoticeBoard(config.state_path("notices.jsonl"))
        self.audit = AuditLog(config.state_path("audit.jsonl"))
        self.schedule_path = config.state_path("schedule.json")
        self.pause_path = config.state_path("PAUSED")
        hb = config.raw.get("heartbeat", {})
        self.tick_seconds = float(hb.get("tick_seconds", 30))
        self.quiet_hours = _parse_quiet_hours(hb.get("quiet_hours", ""))
        self._running: set[str] = set()

    # ------------------------------------------------------------- schedule

    def _load_schedule(self) -> dict[str, float]:
        if not self.schedule_path.is_file():
            return {}
        try:
            return {
                k: float(v)
                for k, v in json.loads(self.schedule_path.read_text(encoding="utf-8")).items()
            }
        except (json.JSONDecodeError, ValueError, AttributeError):
            return {}

    def _save_schedule(self, schedule: dict[str, float]) -> None:
        self.schedule_path.parent.mkdir(parents=True, exist_ok=True)
        self.schedule_path.write_text(json.dumps(schedule, indent=1), encoding="utf-8")

    @property
    def paused(self) -> bool:
        return self.pause_path.exists()

    # ----------------------------------------------------------------- tick

    def tick(self, now: float | None = None, wall_now: datetime | None = None) -> list[str]:
        """Run whatever is due. Returns the names of checks that ran.

        Separated from the sleep loop so tests can drive time by hand.
        """
        if self.paused:
            return []
        now = time.time() if now is None else now
        wall_now = wall_now or datetime.now()
        quiet = in_quiet_hours(wall_now, self.quiet_hours)

        schedule = self._load_schedule()
        ran: list[str] = []
        for check in self.checks:
            due_at = schedule.get(check.name)
            if due_at is None:
                # First sighting: schedule forward rather than firing everything
                # at once on boot.
                schedule[check.name] = now + check.interval_seconds
                continue
            if now < due_at:
                continue
            if check.name in self._running:
                continue  # still working — skip this beat, don't stack
            if quiet and not check.settings.get("urgent", False):
                # Defer to the end of quiet hours, don't drop.
                schedule[check.name] = now + min(check.interval_seconds, 900)
                continue

            self._running.add(check.name)
            try:
                before = len(self.board.pending())
                check.run(self.config, self.board, check.settings)
                ran.append(check.name)
                surfaced = len(self.board.pending()) - before
                if surfaced > 0:
                    self.audit.log("heartbeat.surfaced", {"check": check.name, "count": surfaced})
            except Exception as exc:  # noqa: BLE001 — one bad check never kills the pulse
                self.board.post(
                    check.name, "log", f"check failed: {type(exc).__name__}: {exc}"
                )
                self.audit.log("heartbeat.check_failed", {"check": check.name, "error": str(exc)})
            finally:
                self._running.discard(check.name)
                schedule[check.name] = now + check.interval_seconds

        self._save_schedule(schedule)
        return ran

    def loop(self) -> None:  # pragma: no cover — the thin production wrapper
        print(f"heartbeat: {len(self.checks)} checks, tick every {self.tick_seconds:.0f}s")
        if self.paused:
            print("heartbeat: currently PAUSED (state/PAUSED exists — /resume clears it)")
        while True:
            try:
                self.tick()
            except Exception as exc:  # noqa: BLE001
                print(f"heartbeat: tick failed: {exc}")
            time.sleep(self.tick_seconds)


def build_checks(config: Config) -> list[Check]:
    """Checks come from [checks.*] in orion.toml. Adding one = a module in
    checks/ plus a config section; disabling one = enabled = false."""
    from .checks import AVAILABLE

    checks: list[Check] = []
    for name, settings in config.raw.get("checks", {}).items():
        if not settings.get("enabled", True):
            continue
        run = AVAILABLE.get(name)
        if run is None:
            continue
        checks.append(
            Check(
                name=name,
                interval_seconds=float(settings.get("interval_minutes", 30)) * 60,
                run=run,
                settings=dict(settings),
            )
        )
    return checks


def main() -> int:  # pragma: no cover
    config = get_config()
    heartbeat = Heartbeat(config, build_checks(config))
    try:
        heartbeat.loop()
    except KeyboardInterrupt:
        print("\nheartbeat stopped")
    return 0
