"""The provider seam.

One job: send a conversation, get back a reply (or a request to use a tool).

This is the only module in Orion that imports the Anthropic SDK. Everything
else talks to the `Provider` protocol below, which is what makes it possible to
swap models, add retries, log cost, or run the entire harness against a scripted
fake with no API key and no network.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any, Callable, Protocol

TextDeltaHandler = Callable[[str], None]


class ProviderError(RuntimeError):
    """A failure talking to the model, already phrased for a human to read.

    Callers print this and carry on. It is never a stack trace in Karl's face.
    """


@dataclass
class Usage:
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0

    def cost_usd(self, price_in_per_mtok: float, price_out_per_mtok: float) -> float:
        return (
            self.input_tokens * price_in_per_mtok
            + self.output_tokens * price_out_per_mtok
        ) / 1_000_000


@dataclass
class TurnResult:
    """One model response, normalised away from any SDK's object model.

    `content` is a list of plain JSON-able dicts — text, thinking and tool_use
    blocks — in the order the model produced them. Plain dicts are what get
    appended back into the conversation and written to the audit log.
    """

    content: list[dict[str, Any]] = field(default_factory=list)
    stop_reason: str = "end_turn"
    usage: Usage = field(default_factory=Usage)
    model: str = ""

    @property
    def text(self) -> str:
        return "".join(
            b.get("text", "") for b in self.content if b.get("type") == "text"
        ).strip()

    @property
    def tool_calls(self) -> list[dict[str, Any]]:
        return [b for b in self.content if b.get("type") == "tool_use"]


class Provider(Protocol):
    """Send this conversation, get back a reply. That is the whole contract."""

    def stream_turn(
        self,
        *,
        system: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        on_text_delta: TextDeltaHandler | None = None,
    ) -> TurnResult: ...


def _block_to_dict(block: Any) -> dict[str, Any]:
    """Normalise an SDK content block into a plain dict.

    Thinking blocks are converted too, signature and all — they have to be
    echoed back unchanged when the conversation continues on the same model.
    """
    if isinstance(block, dict):
        return block
    dump = getattr(block, "model_dump", None)
    if callable(dump):
        return dump(exclude_none=True, mode="json")
    return {"type": getattr(block, "type", "text"), "text": str(block)}


class AnthropicProvider:
    """The real brain: Claude, streamed."""

    def __init__(self, config) -> None:
        try:
            import anthropic  # imported lazily so the fake provider needs no SDK
        except ImportError as exc:  # pragma: no cover - depends on the environment
            raise ProviderError(
                "The anthropic SDK isn't installed. Run `uv sync` inside orion/."
            ) from exc

        self._sdk = anthropic
        self._config = config
        self._model = config.model

        if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
            # Not fatal — the SDK also resolves an `ant auth login` profile.
            # Fail at call time with a real message rather than guessing here.
            pass

        self._client = anthropic.Anthropic(
            timeout=float(self._model.timeout_seconds),
            max_retries=int(self._model.max_retries),
        )

    def stream_turn(
        self,
        *,
        system: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        on_text_delta: TextDeltaHandler | None = None,
    ) -> TurnResult:
        kwargs: dict[str, Any] = {
            "model": self._model.name,
            "max_tokens": int(self._model.max_tokens),
            "system": system,
            "messages": messages,
            # Adaptive thinking with display left omitted: Orion reasons, but the
            # reasoning never reaches the text stream and so never gets spoken.
            "thinking": {"type": "adaptive"},
            "output_config": {"effort": self._model.effort},
        }
        if tools:
            kwargs["tools"] = tools

        try:
            if self._model.refusal_fallback:
                # If a safety classifier declines, the API routes to a comparable
                # model instead of handing back a dead turn.
                stream_ctx = self._client.beta.messages.stream(
                    betas=["server-side-fallback-2026-07-01"],
                    fallbacks="default",
                    **kwargs,
                )
            else:
                stream_ctx = self._client.messages.stream(**kwargs)

            with stream_ctx as stream:
                for chunk in stream.text_stream:
                    if on_text_delta and chunk:
                        on_text_delta(chunk)
                final = stream.get_final_message()
        except Exception as exc:  # narrowed immediately below
            raise self._as_provider_error(exc) from exc

        usage = getattr(final, "usage", None)
        return TurnResult(
            content=[_block_to_dict(b) for b in final.content],
            stop_reason=final.stop_reason or "end_turn",
            usage=Usage(
                input_tokens=getattr(usage, "input_tokens", 0) or 0,
                output_tokens=getattr(usage, "output_tokens", 0) or 0,
                cache_read_tokens=getattr(usage, "cache_read_input_tokens", 0) or 0,
            ),
            model=getattr(final, "model", self._model.name),
        )

    def _as_provider_error(self, exc: Exception) -> ProviderError:
        """Turn an SDK exception into one clear sentence.

        Most specific first — a bare `except APIStatusError` would lose the
        difference between "your key is wrong" and "slow down".
        """
        sdk = self._sdk
        if isinstance(exc, ProviderError):
            return exc
        if isinstance(exc, sdk.AuthenticationError):
            return ProviderError(
                "The model rejected the API key. Check ANTHROPIC_API_KEY in orion/.env."
            )
        if isinstance(exc, sdk.PermissionDeniedError):
            return ProviderError("That key isn't allowed to use this model.")
        if isinstance(exc, sdk.NotFoundError):
            return ProviderError(
                f"Model '{self._model.name}' wasn't found. Check [model].name in orion.toml."
            )
        if isinstance(exc, sdk.RateLimitError):
            return ProviderError("Rate limited. Give it a few seconds and try again.")
        if isinstance(exc, sdk.APITimeoutError):
            return ProviderError(
                f"The model took longer than {self._model.timeout_seconds:.0f}s to answer. "
                "Try again, or raise [model].timeout_seconds."
            )
        if isinstance(exc, sdk.APIConnectionError):
            return ProviderError("Can't reach the model — looks like a network problem.")
        if isinstance(exc, sdk.APIStatusError):
            status = getattr(exc, "status_code", "?")
            return ProviderError(f"The model returned an error (HTTP {status}).")
        return ProviderError(f"Unexpected failure talking to the model: {exc}")


class FakeProvider:
    """A scripted brain, for tests and for driving the harness with no API key.

    Every tier except the live model call can be verified against this, which is
    what keeps the test suite runnable on a machine with no keys and no network.
    """

    def __init__(self, script: list[Any] | None = None) -> None:
        self.script: list[Any] = list(script or [])
        self.calls: list[dict[str, Any]] = []

    def queue(self, *responses: Any) -> "FakeProvider":
        self.script.extend(responses)
        return self

    def stream_turn(
        self,
        *,
        system: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        on_text_delta: TextDeltaHandler | None = None,
    ) -> TurnResult:
        self.calls.append(
            {"system": system, "messages": [*messages], "tools": list(tools or [])}
        )

        if self.script:
            nxt = self.script.pop(0)
        else:
            last = messages[-1]["content"] if messages else ""
            nxt = f"(fake reply to: {last!r})"

        if isinstance(nxt, Exception):
            raise nxt
        result = nxt if isinstance(nxt, TurnResult) else text_response(str(nxt))

        if on_text_delta:
            # Deliver in chunks so streaming consumers are genuinely exercised.
            for block in result.content:
                if block.get("type") == "text":
                    words = block["text"].split(" ")
                    for i, word in enumerate(words):
                        on_text_delta(word if i == len(words) - 1 else word + " ")
        return result


def text_response(text: str, *, stop_reason: str = "end_turn") -> TurnResult:
    return TurnResult(
        content=[{"type": "text", "text": text}],
        stop_reason=stop_reason,
        usage=Usage(input_tokens=10, output_tokens=len(text.split())),
        model="fake",
    )


def tool_response(
    name: str,
    tool_input: dict[str, Any],
    *,
    text: str = "",
    tool_use_id: str = "toolu_fake_1",
) -> TurnResult:
    content: list[dict[str, Any]] = []
    if text:
        content.append({"type": "text", "text": text})
    content.append({"type": "tool_use", "id": tool_use_id, "name": name, "input": tool_input})
    return TurnResult(
        content=content,
        stop_reason="tool_use",
        usage=Usage(input_tokens=10, output_tokens=5),
        model="fake",
    )


def build_provider(config, *, fake_script: list[Any] | None = None) -> Provider:
    """Pick a brain based on config/env. `ORION_PROVIDER=fake` selects the fake."""
    if config.provider_name == "fake":
        return FakeProvider(fake_script)
    return AnthropicProvider(config)
