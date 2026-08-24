"""The confirmation gate — Karl's rules, with teeth.

The flow he specified, word for word:

1. Orion states plainly what it is about to do.
2. Karl says yes (any natural affirmative, spoken or typed).
3. Orion asks: "Are you sure you want to confirm?"
4. Only the exact word "confirm" executes it.

Two steps because voice sits in the approval path: step 1 accepts natural
affirmatives, so a mis-heard word can't reach step 2 by itself; step 2 demands
an exact match on "confirm". Both would have to fail for a mistake to get
through. Anything else — a different word, silence, a timeout — is a decline,
returned to the model as an ordinary result, never an error.

Per-action, never generalising: approving one send does not pre-authorise the
next. And a gate with nobody to answer it (the heartbeat) never exists at all —
the agent's built-in default declines unattended consequential actions.
"""

from __future__ import annotations

import re
from typing import Callable

# Step 1: natural affirmatives, deliberately generous — this step is cheap.
AFFIRMATIVES = {
    "y", "yes", "yeah", "yep", "yup", "sure", "ok", "okay", "affirmative",
    "go ahead", "do it", "confirm", "proceed", "approved", "go for it",
}

# Step 2: exactly this, nothing else. Not "yes", not "confirmed", not "sure".
CONFIRM_WORD = "confirm"

_PUNCT = re.compile(r"[^\w\s]")


def _normalise(answer: str | None) -> str:
    if answer is None:
        return ""
    return _PUNCT.sub("", answer).strip().lower()


def is_affirmative(answer: str | None) -> bool:
    return _normalise(answer) in AFFIRMATIVES


def is_confirm_word(answer: str | None) -> bool:
    """Only the exact word, alone. 'confirm.' passes (STT punctuation);
    'confirm it' and 'yes confirm please go' do not."""
    return _normalise(answer) == CONFIRM_WORD


class TwoStepGate:
    """The gate as a callable the Agent accepts as its `confirm` seam.

    `ask(question) -> answer | None` is the only dependency: typed mode wires
    it to input(), voice mode wires it to speak-then-listen with a timeout.
    None (timeout, EOF, interrupt) is always a decline.
    """

    def __init__(
        self,
        ask: Callable[[str], str | None],
        *,
        on_decision: Callable[[str, bool, str], None] | None = None,
    ) -> None:
        self.ask = ask
        self.on_decision = on_decision

    def __call__(self, action_summary: str, tool_name: str) -> bool:
        decision = self._run(action_summary)
        if self.on_decision is not None:
            try:
                self.on_decision(tool_name, decision, action_summary)
            except Exception:  # noqa: BLE001 — observers never change the outcome
                pass
        return decision

    def _run(self, action_summary: str) -> bool:
        first = self.ask(
            f"I'm about to {action_summary}. This is on your always-ask list. "
            "Should I go ahead?"
        )
        if not is_affirmative(first):
            return False
        second = self.ask('Are you sure you want to confirm? Say "confirm" to proceed.')
        return is_confirm_word(second)
