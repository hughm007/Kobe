"""Tier 5 — the heartbeat: proactive, quiet by default, never losing a notice."""

import shutil
import time
from datetime import datetime

from orion.heartbeat import Check, Heartbeat, build_checks, in_quiet_hours
from orion.notices import NoticeBoard


def make_board(config) -> NoticeBoard:
    return NoticeBoard(config.state_path("notices.jsonl"))


def make_heartbeat(config, checks) -> Heartbeat:
    return Heartbeat(config, checks, board=make_board(config))


def counting_check(name="probe", interval=60, calls=None, settings=None, body=None):
    calls = calls if calls is not None else []

    def run(config, board, s):
        calls.append(time.time())
        if body:
            body(config, board, s)

    return Check(name=name, interval_seconds=interval, run=run, settings=settings or {}), calls


# ------------------------------------------------------------------ notices

def test_notices_are_held_until_seen_and_dismissible(config):
    board = make_board(config)
    notice = board.post("probe", "notify", "something happened")
    assert notice is not None

    # "Karl was away": a fresh board over the same file still has it.
    later = make_board(config)
    unseen = later.unseen()
    assert [n.id for n in unseen] == [notice.id]

    later.mark_seen([notice.id])
    assert later.unseen() == []
    assert len(later.pending()) == 1  # seen but not dismissed → still on the board

    assert later.dismiss(notice.id)
    assert later.pending() == []


def test_a_standing_condition_surfaces_once_not_every_tick(config):
    board = make_board(config)
    assert board.post("probe", "notify", "inbox has files", dedupe_key="standing")
    assert board.post("probe", "notify", "inbox has files", dedupe_key="standing") is None
    assert len(board.pending()) == 1
    # Dismissed → the condition may legitimately surface again later.
    board.dismiss("all")
    assert board.post("probe", "notify", "inbox has files", dedupe_key="standing")


# ----------------------------------------------------------------- schedule

def test_first_boot_schedules_forward_instead_of_firing_everything(config):
    check, calls = counting_check()
    heartbeat = make_heartbeat(config, [check])
    heartbeat.tick(now=1000.0)
    assert calls == [], "nothing fires on first sighting"
    heartbeat.tick(now=1059.0)
    assert calls == []
    heartbeat.tick(now=1061.0)
    assert len(calls) == 1


def test_schedule_survives_a_restart(config):
    check, calls = counting_check()
    heartbeat = make_heartbeat(config, [check])
    heartbeat.tick(now=1000.0)  # schedules for t=1060

    # Restart: a new Heartbeat over the same state dir must resume, not reset.
    check2, calls2 = counting_check()
    reborn = make_heartbeat(config, [check2])
    reborn.tick(now=1030.0)
    assert calls2 == [], "restart must not refire early"
    reborn.tick(now=1061.0)
    assert len(calls2) == 1


def test_overlapping_runs_are_skipped_not_stacked(config):
    check, calls = counting_check()
    heartbeat = make_heartbeat(config, [check])
    heartbeat.tick(now=1000.0)
    heartbeat._running.add("probe")  # simulate the previous run still going
    heartbeat.tick(now=2000.0)
    assert calls == [], "a busy check is skipped, not run twice"
    heartbeat._running.clear()
    heartbeat.tick(now=3000.0)
    assert len(calls) == 1


def test_a_crashing_check_leaves_a_note_and_the_pulse_survives(config):
    def explode(cfg, board, settings):
        raise RuntimeError("boom")

    bad = Check(name="bad", interval_seconds=60, run=explode, settings={})
    good, calls = counting_check(name="good")
    heartbeat = make_heartbeat(config, [bad, good])
    heartbeat.tick(now=1000.0)
    heartbeat.tick(now=1100.0)  # both due — bad crashes, good still runs
    assert len(calls) == 1
    notes = [n for n in make_board(config).pending() if n.check == "bad"]
    assert notes and "boom" in notes[0].text


# -------------------------------------------------------------- quiet hours

def test_quiet_hours_defer_but_urgent_breaks_through(config):
    assert in_quiet_hours(datetime(2026, 8, 24, 23, 30), (22, 8))
    assert in_quiet_hours(datetime(2026, 8, 24, 3, 0), (22, 8))
    assert not in_quiet_hours(datetime(2026, 8, 24, 12, 0), (22, 8))

    calm, calm_calls = counting_check(name="calm")
    urgent, urgent_calls = counting_check(name="urgent", settings={"urgent": True})
    heartbeat = make_heartbeat(config, [calm, urgent])
    heartbeat.quiet_hours = (22, 8)
    night = datetime(2026, 8, 24, 23, 30)
    heartbeat.tick(now=1000.0, wall_now=night)
    heartbeat.tick(now=1100.0, wall_now=night)
    assert calm_calls == [], "non-urgent work waits for morning"
    assert len(urgent_calls) == 1, "urgent work still runs at night"
    # Morning comes: the deferred check runs without having been dropped.
    heartbeat.tick(now=2200.0, wall_now=datetime(2026, 8, 25, 9, 0))
    assert len(calm_calls) == 1


# -------------------------------------------------------------- kill switch

def test_the_kill_switch_holds_everything_and_releases(config):
    check, calls = counting_check()
    heartbeat = make_heartbeat(config, [check])
    heartbeat.tick(now=1000.0)

    config.state_path("PAUSED").write_text("paused")
    heartbeat.tick(now=5000.0)
    assert calls == [], "paused means nothing runs, however overdue"

    config.state_path("PAUSED").unlink()
    heartbeat.tick(now=5001.0)
    assert len(calls) == 1


# --------------------------------------------------------------- the checks

def _sandboxed(config, tmp_path):
    ws = tmp_path / "ws"
    shutil.copytree(config.workspace, ws)
    object.__setattr__(config, "workspace", ws)
    return ws


def test_inbox_triage_notices_a_dropped_file_and_escalates(config, tmp_path):
    from orion.checks import inbox_triage

    ws = _sandboxed(config, tmp_path)
    board = make_board(config)
    settings = {"escalate_after_hours": 4}

    inbox_triage.run(config, board, settings)
    assert board.pending() == [], "an empty inbox stays quiet"

    dropped = ws / "inbox" / "from-karl.md"
    dropped.write_text("raw notes")
    inbox_triage.run(config, board, settings)
    pending = board.pending()
    assert len(pending) == 1 and pending[0].level == "notify"
    assert "from-karl.md" in pending[0].text

    # Same standing condition → no duplicate on the next run.
    inbox_triage.run(config, board, settings)
    assert len(board.pending()) == 1

    # Ignored past the threshold → it stops being polite.
    import os
    old = time.time() - 5 * 3600
    os.utime(dropped, (old, old))
    board.dismiss("all")
    inbox_triage.run(config, board, settings)
    assert board.pending()[0].level == "interrupt"


def test_open_loops_flags_the_empty_active_brief(config, tmp_path):
    from orion.checks import open_loops

    _sandboxed(config, tmp_path)
    board = make_board(config)
    open_loops.run(config, board, {"active_clients": "911drain", "worklog_gap_days": 3650})

    briefs = [n for n in board.pending() if "empty brief" in n.text]
    assert briefs, "911drain's empty brief is exactly the blocking condition"
    assert briefs[0].level == "interrupt"


def test_open_loops_notices_a_quiet_worklog(config, tmp_path):
    from orion.checks import open_loops

    ws = _sandboxed(config, tmp_path)
    worklog = ws / "operations" / "worklog.md"
    worklog.write_text("---\ntitle: Worklog\n---\n\n## 2026-01-05 — Old entry\n\n- stuff\n")
    board = make_board(config)
    open_loops.run(config, board, {"active_clients": "", "worklog_gap_days": 3})
    assert any("No worklog entry" in n.text for n in board.pending())


def test_checks_come_from_config_not_code(config):
    checks = build_checks(config)
    names = {c.name for c in checks}
    assert names == {"inbox_triage", "open_loops"}
    # Turn one off in config → it's gone, no code change.
    config.raw["checks"]["open_loops"]["enabled"] = False
    assert {c.name for c in build_checks(config)} == {"inbox_triage"}
