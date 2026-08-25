"""The HUD server — stdlib only, localhost only.

GET  /        the page
GET  /events  Server-Sent Events from the bus
GET  /state   JSON snapshot for panels that aren't event-driven
GET  /health  liveness + pid + session state (the Mac app's instance check)
POST /say     a text turn into the same agent core (JSON: {"text": ...})
POST /wake    STANDBY → LISTENING (hotkey, app icon, HUD wake button)
POST /standby stop Deepgram + microphone now
POST /quit    graceful full shutdown of the app-mode process
POST /interrupt  stop Orion talking (voice mode barge-in, from the screen)
POST /dismiss    clear a notice (JSON: {"id": ...})

Bound to 127.0.0.1 — the HUD is Karl's window onto his own machine, never a
network service. Turns from the page serialize through one lock so the agent's
conversation history is never raced.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from ..notices import NoticeBoard

STATIC_DIR = Path(__file__).parent / "static"


class HudState:
    """Everything the server needs to answer for, in one place."""

    def __init__(self, config, agent, bus, board: NoticeBoard | None = None, session=None) -> None:
        self.config = config
        self.agent = agent
        self.bus = bus
        self.board = board or NoticeBoard(config.state_path("notices.jsonl"))
        self.session = session       # OrionSession in app mode; None in bare tests
        self.quit_event = threading.Event()
        self._legacy_conversation = None  # set by the REPL's /voice path
        # The agent's own lock, not a second one: a /say turn and a live voice
        # turn contend on the same mutex, so they can never interleave history.
        self.turn_lock = agent.turn_lock
        # Bounded intake: SSE streams each hold a thread + queue, and /say
        # turns queue on the turn lock — both get a cap instead of unbounded
        # growth. Semaphores live here so tests can reach them.
        self.sse_slots = threading.BoundedSemaphore(MAX_SSE_CLIENTS)
        self.say_slots = threading.BoundedSemaphore(MAX_PENDING_SAYS)
        self.started_at = time.time()
        self.last_latency_ms: float | None = None
        self.last_turn_seconds: float | None = None

    @property
    def conversation(self):
        if self.session is not None and self.session.conversation is not None:
            return self.session.conversation
        return self._legacy_conversation

    @conversation.setter
    def conversation(self, value) -> None:
        self._legacy_conversation = value

    # ------------------------------------------------------------- snapshot

    def snapshot(self) -> dict:
        from ..memory import MemoryStore

        config = self.config
        memory_count = len(MemoryStore(config.state_path("memory.jsonl")).load())
        paused = config.state_path("PAUSED").exists()
        heartbeat_known = config.state_path("schedule.json").exists()

        def key_set(name: str) -> bool:
            return bool(os.environ.get(name, "").strip())

        fake = config.provider_name == "fake"
        checks = {
            "brain": fake or key_set("ANTHROPIC_API_KEY") or key_set("ANTHROPIC_AUTH_TOKEN"),
            "ears": key_set("DEEPGRAM_API_KEY"),
            "voice": key_set("ELEVENLABS_API_KEY"),
            "memory": True,
            "heartbeat": heartbeat_known and not paused,
        }
        tools = []
        if self.agent.tools:
            for name in self.agent.tools.names():
                tool = self.agent.tools.get(name)
                tools.append(
                    {
                        "name": name,
                        "gated": bool(tool.consequential or tool.consequential_when),
                    }
                )
        usage = self.agent.usage
        session_state = self.session.state if self.session is not None else (
            "LISTENING" if self.conversation is not None else "TEXT"
        )
        return {
            "session_state": session_state,
            "session_detail": self.session.state_detail if self.session is not None else "",
            "name": config.name,
            "user": "KARL",
            "version": "0.1.0",
            "model": getattr(self.agent.provider, "active_model", config.model.name),
            "provider": config.provider_name,
            "effort": getattr(self.agent.provider, "active_effort", config.model.effort),
            "mode": self.agent.mode,
            "voice_live": self.conversation is not None,
            "paused": paused,
            "checks": checks,
            "memory_count": memory_count,
            "tools": tools,
            "uptime_seconds": time.time() - self.started_at,
            "tokens_in": usage.input_tokens,
            "tokens_out": usage.output_tokens,
            "cost_usd": round(self.agent.cost_usd, 4),
            "turns": sum(1 for m in self.agent.messages if m.get("role") == "user"),
            "last_latency_ms": self.last_latency_ms,
            "last_turn_seconds": self.last_turn_seconds,
            "notices": [
                {"id": n.id, "level": n.level, "text": n.text, "check": n.check}
                for n in self.board.pending()
            ],
        }

    # ---------------------------------------------------------------- verbs

    def say(self, text: str) -> None:
        """A turn from the screen — same core, same gate, same history."""
        from ..provider import ProviderError

        started = time.time()
        with self.turn_lock:
            try:
                self.agent.run_turn(text)
            except ProviderError as exc:
                self.bus.publish("hud.error", {"text": str(exc)})
        self.last_turn_seconds = round(time.time() - started, 2)

    def wake(self) -> dict:
        if self.session is None:
            return {"ok": False, "error": "no session manager (run `uv run orion-app`)"}
        return self.session.wake()

    def standby(self) -> dict:
        if self.session is None:
            return {"ok": False, "error": "no session manager"}
        return self.session.standby(reason="requested from HUD")

    def quit(self) -> None:
        if self.session is not None:
            self.session.shutdown()
        self.bus.publish("session.quit", {})
        self.quit_event.set()

    def interrupt(self) -> bool:
        conversation = self.conversation
        if conversation is None:
            return False
        conversation.interrupt()
        self.bus.publish("voice.state", {"state": "LISTENING", "cause": "hud stop"})
        return True


# The control plane binds 127.0.0.1 only, but that alone doesn't keep the
# browser out: any web page Karl has open may fire cross-site requests at
# localhost, and a DNS-rebinding page can even read responses. Two checks
# close both doors without breaking local callers (the Mac app, curl, the
# HUD page itself):
#   - Host must be a local origin — a rebound domain arrives as Host: evil.tld.
#   - A POST carrying a non-local Origin/Referer is refused — browsers always
#    attach Origin to cross-site POSTs; local non-browser tools send neither.
_LOCAL_HOST_RE = re.compile(r"^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$", re.IGNORECASE)
_LOCAL_ORIGIN_RE = re.compile(
    r"^https?://(127\.0\.0\.1|localhost|\[::1\])(:\d+)?(/|$)", re.IGNORECASE
)

MAX_BODY_BYTES = 64 * 1024      # /say text and /dismiss ids are small
MAX_SSE_CLIENTS = 32            # each stream holds a server thread + queue
MAX_PENDING_SAYS = 4            # /say turns queued on the turn lock


class _Handler(BaseHTTPRequestHandler):
    state: HudState  # injected by serve()

    def log_message(self, *args) -> None:  # the terminal belongs to the REPL
        pass

    def _send(self, code: int, body: bytes, content_type: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, payload: dict, code: int = 200) -> None:
        self._send(code, json.dumps(payload).encode(), "application/json")

    def _body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0) or 0)
        if not length:
            return {}
        if length > MAX_BODY_BYTES:
            return {}
        try:
            return json.loads(self.rfile.read(length))
        except json.JSONDecodeError:
            return {}

    def _local_request(self, *, for_write: bool) -> bool:
        host = (self.headers.get("Host") or "").strip()
        if not _LOCAL_HOST_RE.match(host):
            return False
        if for_write:
            for header in ("Origin", "Referer"):
                value = (self.headers.get(header) or "").strip()
                if value and value.lower() != "null" and not _LOCAL_ORIGIN_RE.match(value):
                    return False
        return True

    # ------------------------------------------------------------------ GET

    def do_GET(self) -> None:
        if not self._local_request(for_write=False):
            self._json({"ok": False, "error": "local requests only"}, 403)
            return
        if self.path in ("/", "/index.html"):
            page = (STATIC_DIR / "index.html").read_bytes()
            self._send(200, page, "text/html; charset=utf-8")
        elif self.path == "/state":
            self._json(self.state.snapshot())
        elif self.path == "/health":
            session = self.state.session
            self._json({
                "ok": True,
                "pid": os.getpid(),
                "app": self.state.config.name,
                "state": session.state if session is not None else "TEXT",
            })
        elif self.path == "/events":
            self._stream_events()
        else:
            self._send(404, b"not found", "text/plain")

    def _stream_events(self) -> None:
        if not self.state.sse_slots.acquire(blocking=False):
            self._json({"ok": False, "error": "too many event streams open"}, 503)
            return
        try:
            self._stream_events_locked()
        finally:
            self.state.sse_slots.release()

    def _stream_events_locked(self) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        sub_id, q = self.state.bus.subscribe()
        try:
            while True:
                try:
                    event = q.get(timeout=15.0)
                    payload = f"data: {json.dumps(event)}\n\n"
                except Exception:  # noqa: BLE001 — queue.Empty: keep-alive
                    payload = ": keep-alive\n\n"
                self.wfile.write(payload.encode())
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass  # the page closed; that's how SSE ends
        finally:
            self.state.bus.unsubscribe(sub_id)

    # ----------------------------------------------------------------- POST

    def do_POST(self) -> None:
        if not self._local_request(for_write=True):
            self._json({"ok": False, "error": "local requests only"}, 403)
            return
        if self.path == "/say":
            text = str(self._body().get("text", "")).strip()
            if not text:
                self._json({"ok": False, "error": "empty"}, 400)
                return
            if not self.state.say_slots.acquire(blocking=False):
                self._json({"ok": False, "error": "busy — turns already queued"}, 429)
                return

            def _run() -> None:
                try:
                    self.state.say(text)
                finally:
                    self.state.say_slots.release()

            # Answer immediately; the turn streams to the page over /events.
            threading.Thread(target=_run, daemon=True).start()
            self._json({"ok": True})
        elif self.path == "/wake":
            self._json(self.state.wake())
        elif self.path == "/standby":
            self._json(self.state.standby())
        elif self.path == "/quit":
            self._json({"ok": True})
            threading.Thread(target=self.state.quit, daemon=True).start()
        elif self.path == "/interrupt":
            self._json({"ok": self.state.interrupt()})
        elif self.path == "/dismiss":
            notice_id = str(self._body().get("id", "")).strip()
            ok = self.state.board.dismiss(notice_id) if notice_id else False
            self.state.bus.publish("notice.dismissed", {"id": notice_id})
            self._json({"ok": ok})
        else:
            self._send(404, b"not found", "text/plain")


class HudServer:
    def __init__(self, state: HudState, port: int = 8765) -> None:
        self.state = state
        handler = type("Handler", (_Handler,), {"state": state})
        self.httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)
        self.port = self.httpd.server_address[1]
        self._thread: threading.Thread | None = None

    @property
    def url(self) -> str:
        return f"http://127.0.0.1:{self.port}"

    def start(self) -> "HudServer":
        self._thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self._thread.start()
        return self

    def stop(self) -> None:
        self.httpd.shutdown()
        self.httpd.server_close()


def start_hud(config, agent, bus, *, port: int | None = None, session=None) -> HudServer:
    hud_config = config.raw.get("hud", {})
    state = HudState(config, agent, bus, session=session)
    server = HudServer(state, port=port if port is not None else int(hud_config.get("port", 8765)))
    return server.start()
