#!/usr/bin/env python3
"""Structural validator for the Service Pow skill set.

Checks what can actually be checked mechanically, so "the skills are valid" is a
measured statement rather than a claim:

  - every skill directory has a SKILL.md with parseable frontmatter
  - `name` is present and matches the directory (Claude Code resolves by directory)
  - only the six frontmatter fields that are legal for BOTH Claude Code and
    claude.ai uploads are used (claude.ai hard-errors on the rest)
  - the description states what it does AND when not to use it
  - the operating sections Service Pow requires are all present
  - every relative reference path a skill cites actually resolves
  - no secrets, and no client-specific facts hardcoded into permanent skills
  - LB50 in three forms: the blocking-check count is declared once, every LB and HB
    is defined exactly once in its canonical home, and no skill restates a
    threshold the playbook owns

Run:  python3 .claude/skills/_shared/scripts/validate_skills.py
Exit: 0 all pass, 1 any failure.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SKILLS_DIR = Path(__file__).resolve().parents[2]
REPO = SKILLS_DIR.parents[1]

# Legal in Claude Code AND on claude.ai upload. Anything else hard-errors there.
ALLOWED_FRONTMATTER = {
    "name", "description", "license", "compatibility", "metadata", "allowed-tools",
}

REQUIRED_SECTIONS = [
    "## PURPOSE",
    "## TRIGGER",
    "## WORKFLOW",
    "## DECISION RULES",
    "## OUTPUT CONTRACT",
    "## QUALITY GATES",
    "## FAILURE CONDITIONS",
    "## HANDOFF",
    "## REFERENCE FILES",
    "## LEARNING BEHAVIOR",
]

SECRET_PATTERNS = [
    (re.compile(r"sk_[A-Za-z0-9]{20,}"), "possible API key"),
    (re.compile(r"(?i)api[_-]?key\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}"), "inline api key"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "private key"),
]

# Client facts must live in the workspace, never inside a permanent skill.
CLIENT_FACT_PATTERNS = [
    (re.compile(r"\b\d{3}-\d{3}-\d{4}\b"), "client phone number"),
    (re.compile(r"\bROC\s*\d{5,}\b"), "client licence number"),
]

failures: list[str] = []
warnings: list[str] = []
checked = 0


def fail(skill: str, msg: str) -> None:
    failures.append(f"{skill}: {msg}")


def warn(skill: str, msg: str) -> None:
    warnings.append(f"{skill}: {msg}")


def parse_frontmatter(text: str) -> tuple[dict, str] | tuple[None, str]:
    if not text.startswith("---\n"):
        return None, "no frontmatter block"
    end = text.find("\n---\n", 4)
    if end == -1:
        return None, "unterminated frontmatter"
    raw = text[4:end]
    data: dict = {}
    key = None
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if re.match(r"^\s+", line) and key:          # continuation / nested
            data.setdefault(key, "")
            if isinstance(data[key], str):
                data[key] += " " + line.strip()
            continue
        m = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", line)
        if m:
            key = m.group(1)
            data[key] = m.group(2).strip()
    return data, ""


def check_skill(d: Path) -> None:
    global checked
    name = d.name
    skill_md = d / "SKILL.md"
    if not skill_md.is_file():
        fail(name, "no SKILL.md")
        return
    checked += 1
    text = skill_md.read_text(encoding="utf-8")

    fm, err = parse_frontmatter(text)
    if fm is None:
        fail(name, err)
        return

    # name present and matching the directory
    if "name" not in fm:
        fail(name, "frontmatter missing `name`")
    elif fm["name"] != name:
        fail(name, f"frontmatter name '{fm['name']}' != directory '{name}'")

    # portable frontmatter only
    illegal = set(fm) - ALLOWED_FRONTMATTER
    if illegal:
        fail(name, f"frontmatter fields illegal on claude.ai upload: {sorted(illegal)}")

    # description quality
    desc = str(fm.get("description", ""))
    if not desc:
        fail(name, "frontmatter missing `description`")
    else:
        if len(desc) < 120:
            warn(name, f"description short ({len(desc)} chars) — weak auto-invocation signal")
        if "do not use" not in desc.lower() and "not for" not in desc.lower():
            warn(name, "description does not say when NOT to use it")

    # required operating sections
    for section in REQUIRED_SECTIONS:
        if section not in text:
            fail(name, f"missing required section {section}")

    # relative reference paths resolve
    for rel in re.findall(r"`((?:\.\./|references/|templates/|scripts/)[^`\s]+\.md)`", text):
        target = (d / rel).resolve()
        if not target.exists():
            fail(name, f"reference path does not resolve: {rel}")

    # no secrets, no client facts baked into a permanent skill
    for path in [skill_md, *d.rglob("*.md")]:
        body = path.read_text(encoding="utf-8")
        where = path.relative_to(d)
        for pattern, label in SECRET_PATTERNS:
            if pattern.search(body):
                fail(name, f"{label} in {where}")
        for pattern, label in CLIENT_FACT_PATTERNS:
            if pattern.search(body):
                fail(name, f"{label} hardcoded in {where} — belongs in the workspace")


CANONICAL_MARKER = "CANONICAL: blocking-check-count"
BARE_COUNT_RE = re.compile(r"\b\d+\s+(?:blocking\s+)?checks\b", re.IGNORECASE)


def check_single_source() -> None:
    """Mechanise LB50: one number, one file.

    The blocking-check count is declared in exactly one place, marked with
    CANONICAL_MARKER. No skill file may state a bare count — skills point at the
    playbook instead. Historical references (a changelog noting a past count) are
    allowed outside .claude/skills, since they describe the past, not the present.
    """
    declarers = []
    for path in REPO.rglob("*.md"):
        if ".git" in path.parts:
            continue
        try:
            body = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        if CANONICAL_MARKER in body:
            declarers.append(path.relative_to(REPO))

    if len(declarers) == 0:
        fail("LB50", "no file declares the canonical blocking-check count")
    elif len(declarers) > 1:
        fail("LB50", f"blocking-check count declared in {len(declarers)} files: {declarers}")

    for path in _repo_md():
        rel = path.relative_to(REPO)
        # History describes the past, not the present: the worklog, the decision
        # records and LB50's own origin story may quote a count that has since moved.
        if rel.parts[:3] == ("agent-workspace", "knowledge", "decisions"):
            continue
        if rel.name == "lesson-bank.md":
            continue
        body = path.read_text(encoding="utf-8")
        if CANONICAL_MARKER in body:
            continue
        if BARE_COUNT_RE.search(body):
            fail("LB50", f"{rel} states a blocking-check count — point at the playbook instead")


# ---------------------------------------------------------------- LB / HB homes

RULE_SETS = {
    "LB": {"marker": "CANONICAL: lesson-bank", "expect": 52, "label": "lesson"},
    "HB": {"marker": "CANONICAL: hard-boundaries", "expect": 14, "label": "hard boundary"},
}

DEF_RE = re.compile(r"^(\d{1,3})\.\s+\*\*(.+?)\*\*", re.MULTILINE)

# Files that record history rather than current law may legitimately quote a rule.
HISTORY_DIRS = ("tmp", "archive")   # anywhere in the path, at any depth
HISTORY_FILES = ("worklog.md",)


def _is_history(path: Path) -> bool:
    rel = path.relative_to(REPO)
    return any(part in HISTORY_DIRS for part in rel.parts) or rel.name in HISTORY_FILES


def _repo_md() -> list[Path]:
    return [
        p for p in REPO.rglob("*.md")
        if ".git" not in p.parts and not _is_history(p)
    ]


def check_rule_homes() -> None:
    """One rule, one home — mechanised for LB1-52 and HB1-14.

    Two failures are possible and both matter:

      1. Coverage. The canonical home must define every number in the set exactly
         once, contiguously. A gap means a lesson was lost in a move; a repeat
         means two versions of the same lesson are live.
      2. A second definition elsewhere. Citing "LB24" is correct and expected.
         Pasting LB24's text into a skill is how the two-sources problem grows
         back, so a distinctive span of each rule's own wording is searched for
         across the repo. An exact 60-character match is a copy, not a coincidence.
    """
    docs = _repo_md()
    for prefix, spec in RULE_SETS.items():
        homes = [d for d in docs if spec["marker"] in d.read_text(encoding="utf-8")]
        if len(homes) != 1:
            fail(prefix, f"expected exactly 1 canonical home, found {len(homes)}: "
                         f"{[str(h.relative_to(REPO)) for h in homes]}")
            continue
        home = homes[0]
        body = home.read_text(encoding="utf-8")

        numbers: list[int] = []
        shingles: dict[int, str] = {}
        for m in DEF_RE.finditer(body):
            n = int(m.group(1))
            numbers.append(n)
            line = body[m.start():body.find("\n", m.start())]
            tail = line[m.end() - m.start():]
            if len(tail) >= 60:
                shingles[n] = tail[:60]

        expect = spec["expect"]
        missing = sorted(set(range(1, expect + 1)) - set(numbers))
        extra = sorted(n for n in numbers if n > expect or n < 1)
        dupes = sorted({n for n in numbers if numbers.count(n) > 1})
        if missing:
            fail(prefix, f"{home.relative_to(REPO)} is missing {spec['label']}s {missing}")
        if extra:
            fail(prefix, f"{home.relative_to(REPO)} defines out-of-range {spec['label']}s {extra}")
        if dupes:
            fail(prefix, f"{home.relative_to(REPO)} defines {spec['label']}s twice: {dupes}")

        for doc in docs:
            if doc == home:
                continue
            text = doc.read_text(encoding="utf-8")
            for n, shingle in shingles.items():
                if shingle in text:
                    fail(prefix, f"{prefix}{n} is re-stated verbatim in "
                                 f"{doc.relative_to(REPO)} — cite it, do not copy it")


# Thresholds the playbook tier owns. A skill that repeats one has forked it.
OWNED_THRESHOLDS = [
    ("175 WPM", "check 32 — the performance gate"),
    ("165 WPM", "check 32 — the performance gate"),
    ("155 WPM", "check 32 — the performance gate"),
    ("1.6 px/frame", "the motion floor"),
    ("≥ 8.0", "the ServicePow-6 ship floor"),
]


def check_owned_thresholds() -> None:
    """A skill states procedure. The number it gates on belongs to the playbook."""
    for path in SKILLS_DIR.rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        for token, owner in OWNED_THRESHOLDS:
            if token in text:
                fail("THRESHOLDS", f"{path.relative_to(REPO)} states '{token}' — "
                                   f"{owner} is owned by the playbook; point at it instead")


def main() -> int:
    skills = sorted(
        p for p in SKILLS_DIR.iterdir()
        if p.is_dir() and not p.name.startswith("_")
    )
    if not skills:
        print("No skills found.")
        return 1
    for d in skills:
        check_skill(d)
    check_single_source()
    check_rule_homes()
    check_owned_thresholds()

    print(f"Validated {checked} skills in {SKILLS_DIR.relative_to(REPO)}")
    print("Single-source rule (LB50): blocking-check count, LB1-52, HB1-14, owned thresholds\n")
    if warnings:
        print(f"WARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"  ~ {w}")
        print()
    if failures:
        print(f"FAILURES ({len(failures)}):")
        for f in failures:
            print(f"  x {f}")
        return 1
    print("All structural checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
