"""Regressions from the 2026-08-25 autopsy — each test reproduces a confirmed
finding from the three-lens review (concurrency, correctness, security) and
pins the fix."""

import threading
import time

import pytest

from orion.agent import REFUSAL_MESSAGE, Agent
from orion.provider import (
    EFFORT_LEVELS,
    MODEL_CAPS,
    MODEL_CATALOG,
    AnthropicProvider,
    FakeProvider,
    TurnResult,
    Usage,
    text_response,
    tool_response,
)
from orion.tools.registry import ToolRegistry, tool


# ------------------------------------------------- barge-in through the SDK

class _StubStream:
    """Mimics the anthropic SDK's streaming context manager closely enough to
    prove callback exceptions pass through stream_turn unwrapped."""

    def __init__(self, chunks):
        self._chunks = chunks

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    @property
    def text_stream(self):
        yield from self._chunks

    def get_final_message(self):
        class _Final:
            content = [{"type": "text", "text": "done"}]
            stop_reason = "end_turn"
            usage = None
            model = "stub"

        return _Final()


def _stub_provider(config, chunks):
    provider = AnthropicProvider.__new__(AnthropicProvider)
    import anthropic

    provider._sdk = anthropic
    provider._config = config
    provider._model = config.model
    provider.active_model = "claude-fable-5"
    provider.active_effort = "medium"

    class _Messages:
        def stream(self, **kwargs):
            return _StubStream(chunks)

    class _Client:
        messages = _Messages()

        class beta:
            messages = _Messages()

    provider._client = _Client()
    return provider


def test_cancel_signal_passes_through_the_real_provider(config):
    """The #1 finding, twice over: _CancelSignal raised inside the delta
    callback was re-wrapped as ProviderError by the provider's blanket except,
    so barge-in never worked outside the fakes."""
    object.__setattr__(config.model, "refusal_fallback", False)
    provider = _stub_provider(config, ["Hello ", "there ", "Karl, ", "long reply..."])

    agent = Agent(config, provider, mode="voice")
    cancel = threading.Event()

    def on_delta(chunk):
        cancel.set()  # interrupt as soon as the first words stream

    reply = agent.run_turn("say something long", on_text_delta=on_delta, cancel=cancel)

    # The interruption path ran: partial reply returned, history marked.
    assert "interrupted" in str(agent.messages[-1]).lower()
    assert reply.startswith("Hello")


def test_callback_errors_other_than_cancel_also_surface(config):
    object.__setattr__(config.model, "refusal_fallback", False)
    provider = _stub_provider(config, ["chunk"])

    class Boom(RuntimeError):
        pass

    def bad_delta(chunk):
        raise Boom("listener died")

    with pytest.raises(Boom):
        provider.stream_turn(system="s", messages=[{"role": "user", "content": "x"}], on_text_delta=bad_delta)


# ------------------------------------------------ history stays API-valid

def test_ctrl_c_mid_tool_leaves_no_dangling_tool_use(config):
    registry = ToolRegistry()

    @tool(registry, description="Interrupts like a Ctrl-C during a slow render.")
    def slow_tool() -> str:
        raise KeyboardInterrupt

    provider = FakeProvider([tool_response("slow_tool", {}), text_response("after")])
    agent = Agent(config, provider, tools=registry)
    with pytest.raises(KeyboardInterrupt):
        agent.run_turn("do the slow thing")

    # Every tool_use has a matching tool_result — the next turn will not 400.
    uses = [b["id"] for m in agent.messages if m["role"] == "assistant"
            for b in (m["content"] if isinstance(m["content"], list) else [])
            if isinstance(b, dict) and b.get("type") == "tool_use"]
    results = [b["tool_use_id"] for m in agent.messages if m["role"] == "user"
               for b in (m["content"] if isinstance(m["content"], list) else [])
               if isinstance(b, dict) and b.get("type") == "tool_result"]
    assert uses and set(uses) == set(results)


def test_tool_iteration_limit_is_on_the_models_record_too(config):
    registry = ToolRegistry()

    @tool(registry, description="Always available.")
    def ping() -> str:
        return "pong"

    limit = config.conversation.max_tool_iterations
    provider = FakeProvider([tool_response("ping", {}, tool_use_id=f"toolu_{i}") for i in range(limit + 2)])
    agent = Agent(config, provider, tools=registry)
    reply = agent.run_turn("loop forever")

    assert "safety limit" in reply
    assert any(
        m["role"] == "assistant" and "safety limit" in str(m["content"]) for m in agent.messages
    ), "what Karl heard must match what the model's history says"


def test_a_refusal_is_recorded_and_costed(config):
    refusal = TurnResult(content=[], stop_reason="refusal", usage=Usage(input_tokens=7), model="fake")
    events = []
    agent = Agent(config, FakeProvider([refusal]), on_event=lambda k, d: events.append(k))
    reply = agent.run_turn("declined upstream")

    assert reply == REFUSAL_MESSAGE
    assert any(m["role"] == "assistant" and REFUSAL_MESSAGE in str(m["content"]) for m in agent.messages)
    assert "turn.end" in events, "every turn ends on the record, refusals included"


# ------------------------------------------------ config gate covers late tools

def test_always_confirm_covers_tools_registered_after_startup(config):
    registry = ToolRegistry()

    @tool(registry, description="Registered late, like the coder/model tools.")
    def late_tool() -> str:
        return "ran"

    original = config.gate.always_confirm
    object.__setattr__(config.gate, "always_confirm", (*original, "late_tool"))
    try:
        asked = []
        agent = Agent(config, FakeProvider([tool_response("late_tool", {}), text_response("ok")]),
                      tools=registry, confirm=lambda summary, name: (asked.append(name), False)[1])
        agent.run_turn("use the late tool")
        assert asked == ["late_tool"], "a config-gated tool must ask even if registered late"
    finally:
        object.__setattr__(config.gate, "always_confirm", original)


# ------------------------------------------------------- model capabilities

def test_haiku_requests_omit_controls_it_rejects(config):
    provider = _stub_provider(config, [])
    provider.active_model = "claude-haiku-4-5"
    kwargs = provider._request_kwargs(system="s", messages=[], tools=None)
    assert "thinking" not in kwargs and "output_config" not in kwargs


def test_fable_requests_keep_adaptive_thinking(config):
    provider = _stub_provider(config, [])
    kwargs = provider._request_kwargs(system="s", messages=[], tools=None)
    assert kwargs["thinking"] == {"type": "adaptive"}
    assert kwargs["output_config"] == {"effort": "medium"}


def test_unsupported_effort_is_refused_not_stored(config):
    provider = FakeProvider([])
    with pytest.raises(ValueError, match="up to high"):
        provider.set_model("opus 4.6", "xhigh")
    # The failed switch left nothing behind.
    assert provider.active_model == "fake"


def test_effort_is_clamped_defensively_in_requests(config):
    provider = _stub_provider(config, [])
    provider.active_model = "claude-opus-4-6"
    provider.active_effort = "max"  # e.g. from a stale override file
    kwargs = provider._request_kwargs(system="s", messages=[], tools=None)
    assert kwargs["output_config"] == {"effort": "high"}


def test_every_catalog_model_has_caps_and_sonnet_5_price_is_right():
    assert set(MODEL_CAPS) == set(MODEL_CATALOG)
    assert MODEL_CATALOG["claude-sonnet-5"] == (2.0, 10.0)
    for caps in MODEL_CAPS.values():
        assert all(e in EFFORT_LEVELS for e in caps["efforts"])


# ---------------------------------------------------------------- memory

def test_hand_added_memory_lines_keep_a_stable_id(tmp_path):
    from orion.memory import MemoryStore

    path = tmp_path / "memory.jsonl"
    path.write_text("# Karl's own notes live here\nKarl is in the US Eastern timezone.\n")
    store = MemoryStore(path)

    first_id = store.load()[0].id
    assert store.load()[0].id == first_id, "the id must survive a reload"

    dropped = store.forget(first_id)
    assert dropped is not None, "forget must find the id the listing showed"
    assert "# Karl's own notes live here" in path.read_text(), "comments survive rewrites"


# ---------------------------------------------------------- notices races

def test_concurrent_notice_writers_lose_nothing(tmp_path):
    from orion.notices import NoticeBoard

    board = NoticeBoard(tmp_path / "notices.jsonl")

    def poster(tag):
        for i in range(10):
            board.post(f"check-{tag}", "notify", f"{tag} notice {i}")

    threads = [threading.Thread(target=poster, args=(t,)) for t in ("a", "b", "c")]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert len(board.pending()) == 30, "no lost updates between concurrent writers"


# ------------------------------------------------------------ echo guard

def test_echo_guard_survives_concurrent_speak_and_hear(config):
    from orion.voice.conversation import EchoGuard

    guard = EchoGuard(0.75)
    errors = []

    def speaker():
        for i in range(400):
            guard.spoke(f"phrase number {i} about drains and marketing")

    def listener():
        try:
            for _ in range(400):
                guard.is_echo("phrase number one about drains and marketing")
        except RuntimeError as exc:
            errors.append(exc)

    threads = [threading.Thread(target=speaker), threading.Thread(target=listener)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert not errors, "deque mutation during iteration must not drop the session"


# ------------------------------------------------- announce vs a live turn

def test_announce_never_finishes_a_live_turn(config):
    from orion.voice.audio import FakePlayer
    from orion.voice.conversation import ANNOUNCE_END, VoiceConversation
    from orion.voice.stt import FakeSTT
    from orion.voice.tts import FakeTTS

    convo = VoiceConversation(
        Agent(config, FakeProvider([])), FakeSTT([]), FakeTTS(), FakePlayer(),
        voice_config=config.voice, say=lambda s: None, show=lambda s: None,
    )
    convo.start()
    try:
        # Simulate a live turn: state SPEAKING with an active timer.
        from orion.voice.latency import TurnTimer

        convo.timer = TurnTimer()
        convo.state = "SPEAKING"
        convo._phrases.put("job done announcement")
        convo._phrases.put(ANNOUNCE_END)
        deadline = time.monotonic() + 2
        while not convo._phrases.empty() and time.monotonic() < deadline:
            time.sleep(0.01)
        time.sleep(0.1)
        assert convo.state == "SPEAKING", "an announcement must not end the live turn"
        assert convo.timer is not None, "the turn's latency record must survive"
    finally:
        convo.shutdown()


# --------------------------------------------------------- worklog dates

def test_future_dates_in_entry_bodies_do_not_silence_the_check():
    from orion.checks.open_loops import _last_worklog_date
    from datetime import date

    text = "## 2026-01-05 — Old entry\n\nlaunch scheduled for 2099-12-01, big day\n"
    assert _last_worklog_date(text) == date(2026, 1, 5)
