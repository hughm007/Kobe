"""`uv run orion-app` — Orion as an application, no terminal required.

This is what ORION.app launches. It runs the same brain, tools, memory, gate
and HUD as the REPL, but with no prompt: the HUD *is* the interface, and the
voice session is driven programmatically — the hotkey or the HUD's wake
control calls POST /wake, silence calls it back to standby.

Lifecycle:
- Starts in STANDBY: microphone off, Deepgram off, nothing streams anywhere.
- Single instance by construction: the HUD port is the lock. If another
  orion-app already holds it, this process wakes that one and exits — no
  duplicate backends, mics, or Deepgram sessions, ever.
- POST /quit (the app's Quit ORION menu) or SIGTERM/SIGINT shuts everything
  down cleanly: voice pipeline, HUD server, process.
"""

from __future__ import annotations

import signal
import sys

from .agent import Agent
from .audit import AuditLog
from .config import ConfigError, get_config
from .hud.bus import EventBus
from .memory import MemoryStore
from .prompts import PromptError
from .provider import ProviderError, build_provider
from .tools import default_registry
from .voice.session import OrionSession


def _wake_existing(port: int) -> bool:
    """Another instance owns the port: wake it instead of duplicating it."""
    import urllib.request

    base = f"http://127.0.0.1:{port}"
    try:
        with urllib.request.urlopen(base + "/health", timeout=3) as response:
            if response.status != 200:
                return False
        request = urllib.request.Request(base + "/wake", data=b"{}", method="POST")
        urllib.request.urlopen(request, timeout=10).read()
        return True
    except OSError:
        return False


def main() -> int:
    try:
        config = get_config()
    except ConfigError as exc:
        print(f"orion-app: {exc}", file=sys.stderr)
        return 1

    port = int(config.raw.get("hud", {}).get("port", 8765))

    try:
        provider = build_provider(config)
        memories = MemoryStore(config.state_path("memory.jsonl")).as_prompt_section()
        audit = AuditLog(config.state_path("audit.jsonl"))
        bus = EventBus()

        session: OrionSession | None = None

        def on_event(kind: str, data: dict) -> None:
            if kind != "turn.delta":
                audit.log(kind, data)
            bus.publish(kind, data)
            if session is not None:
                session.note_agent_event(kind, data)

        # No typed confirmer here — there is no terminal. While the voice
        # session is live the gate speaks its questions; otherwise the
        # unattended default declines. Nothing consequential runs silently.
        agent = Agent(
            config, provider,
            tools=default_registry(config),
            memories=memories,
            on_event=on_event,
        )
        session = OrionSession(config, agent, bus, say=lambda line: print(f"  {line}"))

        from .hud.server import start_hud

        try:
            hud = start_hud(config, agent, bus, session=session)
        except OSError:
            if _wake_existing(port):
                print("orion-app: already running — woke the existing instance.")
                return 0
            print(
                f"orion-app: port {port} is taken by something that isn't Orion. "
                "Change [hud].port in orion.toml.",
                file=sys.stderr,
            )
            return 1
    except (ConfigError, PromptError, ProviderError) as exc:
        print(f"orion-app: {exc}", file=sys.stderr)
        return 1

    print(f"ORION online — HUD at {hud.url} (standby; POST /wake or press the hotkey)")

    def shutdown(signum, frame) -> None:  # noqa: ARG001
        hud.state.quit()

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    hud.state.quit_event.wait()
    session.shutdown()
    hud.stop()
    print("ORION offline.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
