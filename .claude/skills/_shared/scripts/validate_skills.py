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

    print(f"Validated {checked} skills in {SKILLS_DIR.relative_to(REPO)}\n")
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
