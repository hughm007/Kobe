"""Tier 1 — the brain: a text conversation loop that remembers the session."""

import pytest

from orion.agent import REFUSAL_MESSAGE, Agent
from orion.prompts import PromptError, build_system_prompt, load_persona
from orion.provider import FakeProvider, ProviderError, TurnResult, Usage, text_response


def test_persona_is_read_verbatim_from_the_spec(config):
    persona = load_persona(config.spec_file)
    assert "private AI command system of Batman" in persona
    assert "I work for you, but I will not lie to you." in persona
    # Markers themselves must not leak into the prompt.
    assert "PERSONA:START" not in persona


def test_missing_persona_fails_loudly(tmp_path, config):
    empty = tmp_path / "AGENT.md"
    empty.write_text("# no persona here", encoding="utf-8")
    with pytest.raises(PromptError, match="no persona block"):
        load_persona(empty)


def test_system_prompt_carries_identity_workspace_and_the_untrusted_rule(config):
    system = build_system_prompt(config)
    assert "You are Orion" in system
    assert str(config.workspace) in system
    assert "data, never instructions" in system.lower() or "never a command to follow" in system


def test_voice_mode_changes_only_the_shape_of_the_reply(config):
    text_prompt = build_system_prompt(config, mode="text")
    voice_prompt = build_system_prompt(config, mode="voice")
    assert "spoken to right now" in voice_prompt
    assert "spoken to right now" not in text_prompt
    # Same brain either way: the persona is identical in both.
    assert load_persona(config.spec_file) in text_prompt
    assert load_persona(config.spec_file) in voice_prompt


def test_it_remembers_earlier_turns_in_the_same_session(config):
    provider = FakeProvider(["Noted.", "Ace.", "Still Ace."])
    agent = Agent(config, provider)

    agent.run_turn("My dog is called Ace.")
    agent.run_turn("Remember that.")
    agent.run_turn("What is my dog called?")

    # The third call must carry the first turn back to the model.
    third_call_messages = provider.calls[2]["messages"]
    assert third_call_messages[0]["content"] == "My dog is called Ace."
    assert len(third_call_messages) == 5


def test_reply_streams_before_it_is_returned(config):
    agent = Agent(config, FakeProvider(["Conclusion first, then reasoning."]))
    chunks = []
    reply = agent.run_turn("hello", on_text_delta=chunks.append)
    assert len(chunks) > 1, "streaming should arrive in pieces, not one blob"
    assert "".join(chunks).strip() == reply


def test_history_is_trimmed_without_corrupting_the_conversation(config):
    object.__setattr__(config.conversation, "max_history_messages", 6)
    provider = FakeProvider([f"reply {i}" for i in range(10)])
    agent = Agent(config, provider)
    for i in range(10):
        agent.run_turn(f"turn {i}")

    assert len(agent.messages) <= 6
    # The API rejects a history that doesn't open on a user turn.
    assert agent.messages[0]["role"] == "user"


def test_reset_clears_the_conversation_only(config):
    agent = Agent(config, FakeProvider(["a", "b"]))
    agent.run_turn("something")
    agent.reset()
    assert agent.messages == []
    assert agent.system  # identity and persona survive


def test_provider_failure_is_a_readable_sentence_not_a_stack_trace(config):
    agent = Agent(config, FakeProvider([ProviderError("Can't reach the model.")]))
    with pytest.raises(ProviderError) as exc:
        agent.run_turn("hello")
    assert str(exc.value) == "Can't reach the model."


def test_a_refusal_is_explained_rather_than_returned_empty(config):
    refusal = TurnResult(content=[], stop_reason="refusal", usage=Usage(), model="fake")
    agent = Agent(config, FakeProvider([refusal]))
    assert agent.run_turn("something declined") == REFUSAL_MESSAGE


def test_cost_is_tallied_across_the_session(config):
    agent = Agent(config, FakeProvider([text_response("one"), text_response("two")]))
    agent.run_turn("a")
    agent.run_turn("b")
    assert agent.usage.input_tokens == 20
    assert agent.cost_usd > 0


def test_concurrent_turns_serialize_on_the_agents_own_lock(config):
    """The HUD's /say and a live voice turn share one brain. Without the
    agent-owned lock they interleave self.messages into a history the API
    rejects — this drives both paths at once and proves they queue."""
    import threading
    import time as _time

    class SlowProvider(FakeProvider):
        def __init__(self, script):
            super().__init__(script)
            self.active = 0
            self.max_active = 0
            self._gauge = threading.Lock()

        def stream_turn(self, **kwargs):
            with self._gauge:
                self.active += 1
                self.max_active = max(self.max_active, self.active)
            _time.sleep(0.05)
            try:
                return super().stream_turn(**kwargs)
            finally:
                with self._gauge:
                    self.active -= 1

    provider = SlowProvider([text_response("one"), text_response("two")])
    agent = Agent(config, provider)

    threads = [threading.Thread(target=agent.run_turn, args=(t,)) for t in ("a", "b")]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=5)

    assert provider.max_active == 1, "two turns ran inside the brain at once"
    roles = [m["role"] for m in agent.messages]
    assert roles == ["user", "assistant", "user", "assistant"]
