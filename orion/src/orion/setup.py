"""The setup wizard — `uv run orion-setup`.

One guided command instead of hand-editing .env: it asks for each missing key
(input hidden, so nothing echoes to the screen or lands in shell history),
writes orion/.env, then runs the same preflight as `orion-voicetest check` so
you leave knowing exactly what works and what's still missing.

Safe to re-run any time: a key that is already set is kept unless you choose
to replace it, and skipping a key just leaves that layer non-operational.
"""

from __future__ import annotations

import getpass
import sys

from .config import ConfigError, find_home

# (env var, what it is, where to get it, what stays broken without it)
KEYS = (
    (
        "ANTHROPIC_API_KEY",
        "the brain — Claude",
        "console.anthropic.com → API keys",
        "Orion can't think at all",
    ),
    (
        "DEEPGRAM_API_KEY",
        "the ears — speech-to-text",
        "console.deepgram.com (new accounts get free credit)",
        "voice mode can't hear you (text mode still works)",
    ),
    (
        "ELEVENLABS_API_KEY",
        "the mouth — text-to-speech",
        "elevenlabs.io → profile icon → API keys (free tier exists)",
        "Orion listens and answers on screen, but doesn't speak",
    ),
)

# Non-secret settings carried into .env with their defaults.
DEFAULTS = (
    ("ELEVENLABS_VOICE_ID", "KyjzVGDMoVqkKJdc4UFh"),
    ("ELEVENLABS_MODEL_ID", "eleven_flash_v2_5"),
)


def read_env_file(path) -> dict[str, str]:
    values: dict[str, str] = {}
    if path.is_file():
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            values[key.strip()] = value.strip().strip("'\"")
    return values


def write_env_file(path, values: dict[str, str]) -> None:
    lines = [
        "# Orion's local secrets — git-ignored. Re-run `uv run orion-setup` to change.",
        "# Never commit this file or paste a key anywhere else.",
        "",
    ]
    for key, _, _, _ in KEYS:
        lines.append(f"{key}={values.get(key, '')}")
    for key, default in DEFAULTS:
        lines.append(f"{key}={values.get(key) or default}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def prompt_hidden(question: str) -> str:
    """Hidden input; a plain prompt if the terminal can't hide (still no echo
    into the file until Enter, and never into shell history)."""
    try:
        return getpass.getpass(question).strip()
    except (EOFError, KeyboardInterrupt):
        print()
        return ""


def mask(value: str) -> str:
    if len(value) <= 8:
        return "•" * len(value)
    return value[:4] + "…" + value[-4:]


def main() -> int:
    print("\nOrion setup — three keys, then a full check.\n")
    try:
        home = find_home()
    except ConfigError as exc:
        print(f"  {exc}\n", file=sys.stderr)
        return 1

    env_path = home / ".env"
    values = read_env_file(env_path)
    skipped: list[str] = []

    for key, role, where, consequence in KEYS:
        existing = values.get(key, "")
        print(f"■ {key} — {role}")
        print(f"  get it at: {where}")
        if existing:
            answer = prompt_hidden(f"  already set ({mask(existing)}) — paste a new key to replace, Enter to keep: ")
            if answer:
                values[key] = answer
                print("  replaced.\n")
            else:
                print("  kept.\n")
            continue
        answer = prompt_hidden("  paste the key (Enter to skip for now): ")
        if answer:
            values[key] = answer
            print("  saved.\n")
        else:
            skipped.append(key)
            print(f"  skipped — {consequence}.\n")

    write_env_file(env_path, values)
    print(f"Wrote {env_path}\n")

    if skipped:
        print("Still missing: " + ", ".join(skipped))
        print("Re-run `uv run orion-setup` whenever you have them.\n")

    # The same checks voice mode runs at startup — no separate logic to trust.
    print("Running preflight:\n")
    from .config import load_config
    from .voice.preflight import run_preflight

    config = load_config(home)
    results, hard_ok = run_preflight(config)
    for result in results:
        print(result.line())
    print()

    if hard_ok and not any(not r.ok for r in results):
        print("All clear. Start Orion:\n\n  uv run orion        (then /voice to talk)\n")
    elif hard_ok:
        print(
            "Orion can start — text works, and voice mode will listen; the ✗ lines\n"
            "above say what stays off until fixed.\n\n  uv run orion\n"
        )
    else:
        print(
            "Not ready yet — fix the ✗ lines above (audio deps need\n"
            "`uv sync --extra voice`; keys need this wizard again), then re-run:\n\n"
            "  uv run orion-setup\n"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
