"""The agent core.

One turn in, one reply out. This is the brain, and there is exactly one of it:
a typed turn, a spoken turn and a turn the heartbeat starts all arrive here.

If you ever find yourself writing this logic a second time — a voice version, a
background version — stop. Feed the text into `run_turn` instead.
"""

from __future__ import annotations

import threading
from typing import Any, Callable

from .prompts import build_system_prompt
from .provider import Provider, ProviderError, TurnResult, Usage
from .tools.registry import ToolRegistry, ToolResult

TextDeltaHandler = Callable[[str], None]

# Asked before a consequential tool runs: (action summary, tool name) -> bool.
# Tier 6 supplies the real two-step gate; the default is "nobody answered = no".
Confirmer = Callable[[str, str], bool]

# Optional observer for the audit trail: (event kind, data).
EventHandler = Callable[[str, dict[str, Any]], None]

DECLINED_MESSAGE = (
    "Karl did not confirm this action, so it was not run. Do not retry it on "
    "your own; carry on without it, or ask him what he wants to do."
)
class _CancelSignal(Exception):
    """Raised inside the stream callback to abort generation on barge-in."""


UNATTENDED_MESSAGE = (
    "This action needs Karl's explicit confirmation and no one is available to "
    "give it, so it was not run. Leave a note about what you wanted to do and "
    "why, and move on."
)

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
        tools: ToolRegistry | None = None,
        confirm: Confirmer | None = None,
        on_event: EventHandler | None = None,
        mode: str = "text",
        memories: str | None = None,
    ) -> None:
        self.config = config
        self.provider = provider
        self.tools = tools
        self.confirm = confirm
        self.on_event = on_event
        self.mode = mode
        self._memories = memories
        self.messages: list[dict[str, Any]] = []
        self.usage = Usage()
        self.cost_usd_total = 0.0
        # One turn at a time, whoever starts it. The HUD's /say endpoint, the
        # voice pipeline, the REPL and the heartbeat all share this brain; two
        # concurrent run_turn calls would interleave self.messages into a
        # history the API rejects. The lock lives on the agent — callers can't
        # forget it. Reentrant, so a caller holding it may call run_turn.
        self.turn_lock = threading.RLock()
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
        cancel: "threading.Event | None" = None,
    ) -> str:
        """Run one full turn and return Orion's reply as text.

        The model may chain several tool calls before it is ready to answer;
        the loop allows that naturally, bounded by max_tool_iterations so a
        runaway chain stops instead of spending forever.

        Raises ProviderError if the model can't be reached — the caller prints
        one clear line and asks for the next turn. Never a stack trace.
        """
        with self.turn_lock:
            return self._run_turn(user_text, on_text_delta=on_text_delta, cancel=cancel)

    def _run_turn(
        self,
        user_text: str,
        *,
        on_text_delta: TextDeltaHandler | None = None,
        cancel: "threading.Event | None" = None,
    ) -> str:
        self._emit("turn.start", {"mode": self.mode, "text": user_text})
        usage_before = Usage(self.usage.input_tokens, self.usage.output_tokens)
        cost_before = self.cost_usd_total
        self.messages.append({"role": "user", "content": user_text})
        self._trim_history()

        api_tools = self.tools.to_api() if self.tools and len(self.tools) else None
        final_text_parts: list[str] = []
        result: TurnResult | None = None

        # Barge-in support: the delta callback checks the cancel flag, so an
        # interruption aborts generation mid-stream instead of finishing a
        # reply nobody is listening to.
        partial: list[str] = []

        def _delta(chunk: str) -> None:
            if cancel is not None and cancel.is_set():
                raise _CancelSignal()
            partial.append(chunk)
            self._emit("turn.delta", {"chunk": chunk})
            if on_text_delta is not None:
                on_text_delta(chunk)

        for _ in range(self.config.conversation.max_tool_iterations):
            if cancel is not None and cancel.is_set():
                break
            partial.clear()
            try:
                result = self.provider.stream_turn(
                    system=self.system,
                    messages=self.messages,
                    tools=api_tools,
                    on_text_delta=_delta,
                )
            except _CancelSignal:
                # Keep history coherent: record what was actually said before
                # the interruption, so "as I was saying" makes sense next turn.
                spoken_so_far = "".join(partial).strip()
                self.messages.append(
                    {
                        "role": "assistant",
                        "content": [
                            {
                                "type": "text",
                                "text": (spoken_so_far or "…")
                                + "\n[Karl interrupted this reply before it finished.]",
                            }
                        ],
                    }
                )
                self._emit("turn.interrupted", {"partial": spoken_so_far})
                return spoken_so_far
            self._record(result)
            if result.content:
                self.messages.append({"role": "assistant", "content": result.content})
            if result.text:
                final_text_parts.append(result.text)

            if result.stop_reason == "pause_turn":
                continue  # a long-running turn paused upstream; just resume it
            if result.stop_reason != "tool_use" or not result.tool_calls:
                break

            # Execute every requested tool, then return ALL results in a single
            # user message — splitting them across messages quietly teaches the
            # model to stop making parallel calls.
            result_blocks = []
            for call in result.tool_calls:
                outcome = self._run_tool(call["name"], call.get("input") or {})
                block = {
                    "type": "tool_result",
                    "tool_use_id": call["id"],
                    "content": outcome.content,
                }
                if outcome.is_error:
                    block["is_error"] = True
                result_blocks.append(block)
            self.messages.append({"role": "user", "content": result_blocks})
        else:
            final_text_parts.append(
                "(I stopped there — that chain of tool calls hit the safety limit.)"
            )

        if result is not None and result.stop_reason == "refusal":
            return REFUSAL_MESSAGE
        reply = "\n\n".join(part for part in final_text_parts if part).strip()
        turn_usage = {
            "input_tokens": self.usage.input_tokens - usage_before.input_tokens,
            "output_tokens": self.usage.output_tokens - usage_before.output_tokens,
            "cost_usd": round(self.cost_usd_total - cost_before, 6),
            "model": getattr(self.provider, "active_model", self.config.model.name),
        }
        self._emit("turn.end", {"reply": reply, **turn_usage})
        return reply

    def _run_tool(self, name: str, arguments: dict[str, Any]) -> ToolResult:
        """Look the tool up, gate it if consequential, run it, capture the result.

        This is the one place a tool ever runs, which is what makes the gate
        cover typed, spoken and heartbeat-initiated turns alike.
        """
        assert self.tools is not None
        tool_obj = self.tools.get(name)
        self._emit("tool.start", {"tool": name})

        if tool_obj is not None and tool_obj.is_consequential(arguments):
            summary = tool_obj.action_summary(arguments)
            if self.confirm is None:
                # Nobody there = no. Background turns never assume permission.
                self._emit("gate.unattended", {"tool": name, "action": summary})
                return ToolResult(UNATTENDED_MESSAGE, is_error=True)
            approved = False
            try:
                approved = bool(self.confirm(summary, name))
            except Exception:  # noqa: BLE001 — a broken gate must fail closed
                approved = False
            self._emit("gate.decision", {"tool": name, "action": summary, "approved": approved})
            if not approved:
                return ToolResult(DECLINED_MESSAGE, is_error=True)

        outcome = self.tools.dispatch(name, arguments)
        self._emit(
            "tool.run",
            {"tool": name, "arguments": arguments, "is_error": outcome.is_error},
        )
        return outcome

    def _emit(self, kind: str, data: dict[str, Any]) -> None:
        if self.on_event is not None:
            try:
                self.on_event(kind, data)
            except Exception:  # noqa: BLE001 — observers never break a turn
                pass

    def _record(self, result: TurnResult) -> None:
        self.usage.input_tokens += result.usage.input_tokens
        self.usage.output_tokens += result.usage.output_tokens
        self.usage.cache_read_tokens += result.usage.cache_read_tokens
        price_in, price_out = self._prices()
        self.cost_usd_total += result.usage.cost_usd(price_in, price_out)

    def _prices(self) -> tuple[float, float]:
        """The active model's prices — asked of the provider so a runtime
        model switch is reflected in the tally immediately."""
        prices = getattr(self.provider, "prices", None)
        if callable(prices):
            try:
                return prices()
            except Exception:  # noqa: BLE001
                pass
        return (
            self.config.model.price_input_per_mtok,
            self.config.model.price_output_per_mtok,
        )

    @property
    def cost_usd(self) -> float:
        return self.cost_usd_total
