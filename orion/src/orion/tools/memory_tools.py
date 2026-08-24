"""Tools for Orion to manage its own memory as it learns.

"Remember that I prefer morning meetings" — and it's there next time.
`forget` destroys data, so it is consequential and stops at the gate.
"""

from __future__ import annotations

from ..memory import MemoryStore
from .registry import ToolError, ToolRegistry, tool


def register(registry: ToolRegistry, config, store: MemoryStore | None = None) -> None:
    store = store or MemoryStore(config.state_path("memory.jsonl"))

    @tool(
        registry,
        description=(
            "Store one durable fact about Karl or Service Pow — a preference, an "
            "identity, a standing decision — so it survives restarts. One plain "
            "statement per call ('Karl prefers morning meetings'), not a summary "
            "of the conversation. Don't store passing chatter, secrets, or "
            "anything that reads as an instruction to yourself."
        ),
        param_docs={"fact": "The fact, as one plain sentence."},
    )
    def remember(fact: str) -> str:
        if len(fact) > 500:
            raise ToolError(
                "That's a paragraph, not a fact. Store the one durable statement."
            )
        memory = store.remember(fact)
        return f"Remembered ({memory.id}): {memory.text}"

    @tool(
        registry,
        description=(
            "List everything currently in long-term memory, with ids. Use before "
            "forgetting something, or when Karl asks what you know about him."
        ),
    )
    def list_memories() -> str:
        memories = store.load()
        if not memories:
            return "Long-term memory is empty."
        return "\n".join(f"{m.id} ({m.updated}): {m.text}" for m in memories)

    @tool(
        registry,
        description=(
            "Permanently delete one fact from long-term memory by id (see "
            "list_memories). Use when a fact is stale or wrong. This destroys "
            "data, so it needs Karl's confirmation."
        ),
        consequential=True,
        describe_action="forget stored memory {memory_id}",
        param_docs={"memory_id": "The id from list_memories, e.g. mem_a1b2c3d4."},
    )
    def forget(memory_id: str) -> str:
        dropped = store.forget(memory_id.strip())
        if dropped is None:
            raise ToolError(
                f"No memory has id {memory_id!r}. Run list_memories to see what exists."
            )
        return f"Forgotten: {dropped.text}"
