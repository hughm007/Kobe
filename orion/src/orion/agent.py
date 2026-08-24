"""The agent core.

One turn in, one reply out. This is the brain, and there is exactly one of it:
a typed turn, a spoken turn and a turn the heartbeat starts all arrive here.

If you ever find yourself writing this logic a second time — a voice version, a
background version — stop. Feed the text into `run_turn` instead.
"""

from __future__ import annotations

from typing import Any, Callable

from .prompts import build_system_prompt
from .provider import Provider, ProviderError, TurnResult, Usage

TextDeltaHandler = Callable[[str], None]

# A refusal is a real outcome, not an error. Say so plainly rather than
# returning an empty turn and letting Karl wonder what happened.
REFUSAL_MESSAGE = (
    "I can't answer that one — the request was declined upstream. "
    "Rephrasing it usually helps."
)


class Agent:
    """A conversation with Orion.

    Short-term memory is `self.messages`: the running list of turns, held in
    memory and lost on exit. What survives a restart is long-term memory (Tier 4).
    """

    def __init__(
        self,
        config,
        provider: Provider,
        *,
        mode: str = "text",
        memories: str | None = None,
    ) -> None:
        self.config = config
        self.provider = provider
        self.mode = mode
        self._memories = memories
        self.messages: list[dict[str, Any]] = []
        self.usage = Usage()
        self.system = self._build_system()

    # ------------------------------------------------------------------ state

    def _build_system(self) -> str:
        return build_system_prompt(self.config, mode=self.mode, memories=self._memories)

    def set_mode(self, mode: str) -> None:
        """Switch between typed and spoken replies. Same brain, different shape."""
        if mode != self.mode:
            self.mode = mode
            self.system = self._build_system()

    def set_memories(self, memories: str | None) -> None:
        self._memories = memories
        self.system = self._build_system()

    def reset(self) -> None:
        """Forget this conversation. Long-term memory is untouched."""
        self.messages = []

    def _trim_history(self) -> None:
        """Keep the conversation bounded without corrupting it.

        Two invariants the API cares about: the first message must be from the
        user, and a tool_result must never be orphaned from its tool_use. So we
        drop from the front and then keep dropping until we land on a plain user
        turn — never slicing between a tool call and its result.
        """
        limit = self.config.conversation.max_history_messages
        if len(self.messages) <= limit:
            return
        self.messages = self.messages[-limit:]
        while self.messages and not self._is_plain_user_turn(self.messages[0]):
            self.messages.pop(0)

    @staticmethod
    def _is_plain_user_turn(message: dict[str, Any]) -> bool:
        if message.get("role") != "user":
            return False
        content = message.get("content")
        if isinstance(content, list):
            return not any(
                isinstance(b, dict) and b.get("type") == "tool_result" for b in content
            )
        return True

    # ------------------------------------------------------------------- turn

    def run_turn(
        self,
        user_text: str,
        *,
        on_text_delta: TextDeltaHandler | None = None,
    ) -> str:
        """Run one full turn and return Orion's reply as text.

        Raises ProviderError if the model can't be reached — the caller prints
        one clear line and asks for the next turn. Never a stack trace.
        """
        self.messages.append({"role": "user", "content": user_text})
        self._trim_history()

        result = self.provider.stream_turn(
            system=self.system,
            messages=self.messages,
            on_text_delta=on_text_delta,
        )
        self._record(result)
        self.messages.append({"role": "assistant", "content": result.content})

        if result.stop_reason == "refusal":
            return REFUSAL_MESSAGE
        return result.text

    def _record(self, result: TurnResult) -> None:
        self.usage.input_tokens += result.usage.input_tokens
        self.usage.output_tokens += result.usage.output_tokens
        self.usage.cache_read_tokens += result.usage.cache_read_tokens

    @property
    def cost_usd(self) -> float:
        return self.usage.cost_usd(
            self.config.model.price_input_per_mtok,
            self.config.model.price_output_per_mtok,
        )
