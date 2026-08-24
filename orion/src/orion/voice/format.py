"""The spoken-response formatter.

Orion's reasoning is untouched; only the surface is reshaped for a voice.
Markdown scaffolding, URLs, file paths and code fences read fine on a screen
and terribly out loud — strip or naturalise them before ElevenLabs sees them.
"""

from __future__ import annotations

import re

_CODE_FENCE = re.compile(r"```.*?```", re.DOTALL)
_INLINE_CODE = re.compile(r"`([^`]*)`")
_HEADING = re.compile(r"^#{1,6}\s+", re.MULTILINE)
_BOLD_ITALIC = re.compile(r"(\*{1,3}|_{1,3})(?=\S)(.+?)(?<=\S)\1")
_STRIKE = re.compile(r"~~(.+?)~~")
_MD_LINK = re.compile(r"\[([^\]]+)\]\([^)]+\)")
_BARE_URL = re.compile(r"https?://[^\s)>\]]+")
_BULLET = re.compile(r"^\s*(?:[-*+•]|\d+[.)])\s+", re.MULTILINE)
_BLOCKQUOTE = re.compile(r"^\s*>\s?", re.MULTILINE)
_TABLE_ROW = re.compile(r"^\s*\|.*\|\s*$", re.MULTILINE)
_TABLE_RULE = re.compile(r"^\s*[|\s:-]+\s*$", re.MULTILINE)
_HRULE = re.compile(r"^\s*([-*_]\s*){3,}$", re.MULTILINE)
_FILE_PATH = re.compile(
    r"(?<![\w/])(?:[\w.-]+/){2,}[\w.-]+\.(?:md|py|toml|json|jsonl|txt|yaml|yml|html|css|js)\b"
)
_EMOJI = re.compile(
    "[\U0001f300-\U0001faff\U00002600-\U000027bf\U0001f1e6-\U0001f1ff⬀-⯿️]"
)
_CITATION = re.compile(r"\[(?:\d+|\^[^\]]+)\]")
_MULTI_BLANK = re.compile(r"\n{2,}")
_MULTI_SPACE = re.compile(r"[ \t]{2,}")


def spoken_text(text: str) -> str:
    """Reshape a text reply so it sounds natural read aloud."""
    out = text

    out = _CODE_FENCE.sub(" — the code is on screen — ", out)
    out = _INLINE_CODE.sub(r"\1", out)
    out = _TABLE_RULE.sub("", out)
    out = _TABLE_ROW.sub(
        lambda m: ", ".join(
            cell.strip() for cell in m.group(0).strip().strip("|").split("|") if cell.strip()
        ),
        out,
    )
    out = _MD_LINK.sub(r"\1", out)
    out = _BARE_URL.sub("the link on screen", out)
    out = _FILE_PATH.sub(lambda m: _speakable_path(m.group(0)), out)
    out = _HEADING.sub("", out)
    out = _BOLD_ITALIC.sub(r"\2", out)
    out = _STRIKE.sub(r"\1", out)
    out = _BLOCKQUOTE.sub("", out)
    out = _HRULE.sub("", out)
    out = _CITATION.sub("", out)
    out = _EMOJI.sub("", out)

    # Bullets become sentences: each item ends with a period if it has none.
    def _flatten_bullet(match: re.Match) -> str:
        return ""

    lines = []
    for raw in out.splitlines():
        line = _BULLET.sub("", raw).strip()
        if not line:
            lines.append("")
            continue
        if raw != line + "" and _BULLET.match(raw) and line[-1] not in ".!?:;":
            line += "."
        lines.append(line)
    out = "\n".join(lines)

    out = _MULTI_SPACE.sub(" ", out)
    out = _MULTI_BLANK.sub("\n", out)
    return out.strip()


def _speakable_path(path: str) -> str:
    """'clients/911drain/client-brief.md' → 'the client brief file'."""
    stem = path.rsplit("/", 1)[-1]
    stem = re.sub(r"\.\w+$", "", stem)
    stem = re.sub(r"^\d{4}-\d{2}-\d{2}-?", "", stem)
    words = stem.replace("-", " ").replace("_", " ").strip()
    return f"the {words} file" if words else "that file"
