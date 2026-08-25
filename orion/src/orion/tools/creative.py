"""Static ad drafting — the first visual deliverable Orion can produce itself.

An ad here is a self-contained HTML file: exact pixel dimensions, no network
requests, no external fonts — so the file alone IS the deliverable and renders
identically anywhere. When a Chromium binary is available on this machine the
tool also exports a PNG next to it; when it isn't, the HTML is still complete
and Karl can export later. Never claim a PNG exists unless it was written.

Drafting is always fine; dispatching is not. A new ad file writes freely,
overwriting an existing one stops at the confirmation gate — the same rule as
write_draft. The layout bakes in the Style Bank's structural laws (platform
safe area, single accent, no decoration for its own sake); the words and the
brand colors are Orion's job, taken from the client's brand-guide.md.
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
from datetime import date
from pathlib import Path
from typing import Literal

from ._shared import rel, resolve_inside
from .registry import ToolError, ToolRegistry, tool

# Canvas dimensions per size, CSS pixels. Story's taller safe area reflects
# where TikTok/Reels UI actually overlays content.
SIZES: dict[str, tuple[int, int]] = {
    "square": (1080, 1080),
    "story": (1080, 1920),
    "landscape": (1920, 1080),
}

_HEX_RE = re.compile(r"^#[0-9a-fA-F]{6}$")

# Chromium candidates, in order. ORION_CHROMIUM wins so Karl can point at any
# browser; the Playwright path covers dev containers.
_CHROMIUM_CANDIDATES = (
    "chromium",
    "chromium-browser",
    "google-chrome",
    "chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/opt/pw-browsers/chromium",
)


def find_chromium() -> str | None:
    override = os.environ.get("ORION_CHROMIUM", "").strip()
    if override:
        return override if os.access(override, os.X_OK) else None
    for candidate in _CHROMIUM_CANDIDATES:
        if "/" in candidate:
            if os.access(candidate, os.X_OK):
                return candidate
        else:
            found = shutil.which(candidate)
            if found:
                return found
    return None


def _luminance(hex_color: str) -> float:
    channels = [int(hex_color[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(fg: str, bg: str) -> float:
    lighter, darker = sorted((_luminance(fg), _luminance(bg)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    )


def _slug(text: str, fallback: str = "ad") -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (cleaned[:40].rstrip("-")) or fallback


def render_ad_html(
    *,
    client: str,
    size: str,
    headline: str,
    subline: str,
    cta: str,
    legal: str,
    notes: str,
    accent_hex: str,
    bg_hex: str,
    text_hex: str,
) -> str:
    width, height = SIZES[size]
    # Safe area: generous margins all round; story reserves extra top and
    # bottom because platform UI (captions, buttons) covers those bands.
    safe_x = round(width * 0.08)
    safe_top = round(height * 0.13) if size == "story" else round(height * 0.09)
    safe_bottom = safe_top
    headline_px = round(width / 10.5)
    subline_px = round(width / 24)
    cta_px = round(width / 27)
    legal_px = round(width / 42)

    legal_html = (
        f'\n    <div class="legal">{_escape(legal)}</div>' if legal.strip() else ""
    )
    subline_html = (
        f'\n      <p class="subline">{_escape(subline)}</p>' if subline.strip() else ""
    )
    notes_comment = f"<!-- production notes: {_escape(notes)} -->\n" if notes.strip() else ""

    return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>{_escape(client)} — {size} ad</title>
{notes_comment}<style>
  :root {{ --bg: {bg_hex}; --fg: {text_hex}; --accent: {accent_hex}; }}
  html, body {{ margin: 0; padding: 0; background: var(--bg); }}
  .ad {{
    width: {width}px; height: {height}px; position: relative; overflow: hidden;
    background: var(--bg); color: var(--fg);
    font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
  }}
  .accent-edge {{ position: absolute; left: 0; top: 0; bottom: 0; width: {max(8, width // 90)}px; background: var(--accent); }}
  .safe {{
    position: absolute; left: {safe_x}px; right: {safe_x}px; top: {safe_top}px; bottom: {safe_bottom}px;
    display: flex; flex-direction: column; justify-content: center; gap: {round(height * 0.035)}px;
  }}
  .headline {{
    margin: 0; font-size: {headline_px}px; line-height: 1.04; font-weight: 800;
    letter-spacing: -0.01em; text-transform: uppercase; text-wrap: balance;
  }}
  .subline {{ margin: 0; font-size: {subline_px}px; line-height: 1.35; font-weight: 400; opacity: 0.92; max-width: 26em; }}
  .cta {{
    align-self: flex-start; background: var(--accent); color: #ffffff;
    font-size: {cta_px}px; font-weight: 700; letter-spacing: 0.02em;
    padding: {round(cta_px * 0.6)}px {round(cta_px * 1.4)}px; border-radius: {max(4, cta_px // 5)}px;
  }}
  .legal {{
    position: absolute; left: {safe_x}px; right: {safe_x}px; bottom: {safe_bottom}px;
    font-size: {legal_px}px; opacity: 0.85; letter-spacing: 0.02em;
  }}
</style>
</head>
<body>
  <div class="ad">
    <div class="accent-edge"></div>
    <div class="safe">
      <h1 class="headline">{_escape(headline)}</h1>{subline_html}
      <div class="cta">{_escape(cta)}</div>
    </div>{legal_html}
  </div>
</body>
</html>
"""


def render_png(chromium: str, html_path: Path, png_path: Path, size: str) -> str | None:
    """Screenshot the ad with headless Chromium. Returns an error string on failure."""
    width, height = SIZES[size]
    cmd = [
        chromium,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        f"--screenshot={png_path}",
        html_path.resolve().as_uri(),
    ]
    # Chromium refuses its sandbox under root (containers, CI). The input is
    # our own just-written local file, so rendering unsandboxed there is fine;
    # a normal user account never gets the flag.
    if getattr(os, "geteuid", lambda: 1000)() == 0:
        cmd.insert(1, "--no-sandbox")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return f"{type(exc).__name__}: {exc}"
    if result.returncode != 0 or not png_path.is_file():
        detail = (result.stderr or result.stdout or "").strip().splitlines()
        return detail[-1] if detail else f"chromium exited {result.returncode}"
    return None


def register(registry: ToolRegistry, config) -> None:
    workspace: Path = config.workspace

    def _client_dir(client: str) -> Path:
        slug = client.strip().lower()
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
            raise ToolError("The client is a folder slug, e.g. '911drain' — lowercase, no spaces.")
        folder = resolve_inside(workspace, f"clients/{slug}")
        if not folder.is_dir():
            clients_root = workspace / "clients"
            known = sorted(
                p.name for p in clients_root.iterdir() if p.is_dir() and not p.name.startswith("_")
            ) if clients_root.is_dir() else []
            raise ToolError(
                f"There is no client folder 'clients/{slug}/'. Known clients: "
                + (", ".join(known) or "none")
                + ". Ads are client deliverables — they need a client folder to land in."
            )
        return folder

    def _target_path(arguments: dict) -> Path:
        folder = _client_dir(str(arguments.get("client", "")))
        size = str(arguments.get("size", ""))
        if size not in SIZES:
            raise ToolError(f"size must be one of: {', '.join(SIZES)}.")
        name = f"{date.today().isoformat()}-{_slug(str(arguments.get('headline', '')))}-{size}.html"
        return folder / "deliverables" / name

    @tool(
        registry,
        description=(
            "Draft a static ad as a pixel-exact, self-contained HTML file in "
            "clients/<slug>/deliverables/ — and a PNG export beside it when a "
            "Chromium browser is available on this machine. Sizes: square "
            "(1080x1080), story (1080x1920, with platform-safe margins for "
            "TikTok/Reels UI), landscape (1920x1080). Before calling this, read "
            "the client's brand-guide.md and pass THEIR colors and rules — the "
            "layout enforces safe areas and a single accent, but the words, the "
            "colors, and compliance lines (license numbers, disclosures) are "
            "yours to supply. This drafts a file; it publishes nothing."
        ),
        consequential=False,  # gated per-call below: only overwriting an existing ad asks
        describe_action="OVERWRITE the existing ad for {client} ({size}: {headline})",
        param_docs={
            "client": "Client folder slug the ad belongs to, e.g. '911drain'.",
            "size": "square, story, or landscape.",
            "headline": "The big line. Short and concrete — it sets the filename too.",
            "subline": "Supporting line under the headline. Empty string for none.",
            "cta": "The call-to-action label, e.g. 'CALL 480-992-3541'.",
            "notes": (
                "Production notes kept as a comment in the file — hypothesis, "
                "placement, what to test. Empty string for none."
            ),
            "legal": (
                "Compliance line rendered small at the bottom, inside the safe "
                "area — e.g. a contractor license number. Empty string ONLY if "
                "the client's compliance rules require nothing."
            ),
            "accent_hex": "Accent color as #RRGGBB, from the client's brand guide.",
            "bg_hex": "Background color as #RRGGBB.",
            "text_hex": "Text color as #RRGGBB. Must stay readable on bg_hex.",
        },
    )
    def make_static_ad(
        client: str,
        size: Literal["square", "story", "landscape"],
        headline: str,
        cta: str,
        subline: str = "",
        notes: str = "",
        legal: str = "",
        accent_hex: str = "#E11D2E",
        bg_hex: str = "#0A0A0A",
        text_hex: str = "#FFFFFF",
    ) -> str:
        if not headline.strip():
            raise ToolError("The headline is empty. An ad with nothing to say isn't an ad.")
        if not cta.strip():
            raise ToolError("The cta is empty. Every ad states the action it's asking for.")
        for label, value in (("accent_hex", accent_hex), ("bg_hex", bg_hex), ("text_hex", text_hex)):
            if not _HEX_RE.match(value.strip()):
                raise ToolError(f"{label} must be a #RRGGBB hex color, got {value!r}.")

        target = _target_path({"client": client, "size": size, "headline": headline})
        existed = target.is_file()
        target.parent.mkdir(parents=True, exist_ok=True)

        html = render_ad_html(
            client=client.strip().lower(),
            size=size,
            headline=headline.strip(),
            subline=subline.strip(),
            cta=cta.strip(),
            legal=legal.strip(),
            notes=notes.strip(),
            accent_hex=accent_hex.strip(),
            bg_hex=bg_hex.strip(),
            text_hex=text_hex.strip(),
        )
        target.write_text(html, encoding="utf-8")
        relative = rel(workspace, target)

        lines = [f"{'Overwrote' if existed else 'Wrote'} {relative} ({SIZES[size][0]}x{SIZES[size][1]})."]

        ratio = contrast_ratio(text_hex.strip(), bg_hex.strip())
        if ratio < 3.0:
            lines.append(
                f"WARNING: text on background contrast is {ratio:.1f}:1 — below 3:1, "
                "hard to read even at display sizes. Reconsider the colors."
            )

        brand_guide = target.parent.parent / "brand-guide.md"
        if not brand_guide.is_file():
            lines.append(
                "NOTE: this client has no brand-guide.md — the ad used the colors you "
                "passed, but nothing verified them against the client's brand."
            )
        if not legal.strip():
            lines.append(
                "NOTE: no legal line. If this client's compliance rules require one "
                "(license numbers, disclosures), the ad can't ship without it."
            )

        chromium = find_chromium()
        if chromium is None:
            lines.append(
                "No Chromium found on this machine, so no PNG was exported — the HTML "
                "file is the complete deliverable and renders exactly at size in any "
                "browser. (Set ORION_CHROMIUM to a browser binary to enable PNG export.)"
            )
        else:
            png = target.with_suffix(".png")
            error = render_png(chromium, target, png, size)
            if error is None:
                lines.append(f"Exported {rel(workspace, png)}.")
            else:
                lines.append(
                    f"PNG export failed ({error}) — the HTML deliverable is still "
                    "complete and correct."
                )

        lines.append("It stays a draft until Karl reviews it — nothing goes out without approval.")
        return "\n".join(lines)

    def _would_overwrite(arguments: dict) -> bool:
        try:
            return _target_path(dict(arguments)).is_file()
        except Exception:  # noqa: BLE001 — a call we can't judge gets gated
            return True

    registry.get("make_static_ad").consequential_when = _would_overwrite
