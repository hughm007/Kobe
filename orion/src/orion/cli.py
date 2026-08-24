"""The terminal interface.

The typed path is the default and it never goes away. It is how every future
change gets debugged without talking to a computer, and the fallback for when
audio misbehaves.
"""

from __future__ import annotations

import os
import sys
from typing import Callable

from .agent import Agent
from .config import ConfigError, get_config
from .prompts import PromptError
from .provider import ProviderError, build_provider


def _supports_colour() -> bool:
    return sys.stdout.isatty() and not os.environ.get("NO_COLOR")


class Style:
    def __init__(self, enabled: bool) -> None:
        self.enabled = enabled

    def _wrap(self, code: str, text: str) -> str:
        return f"\033[{code}m{text}\033[0m" if self.enabled else text

    def dim(self, text: str) -> str:
        return self._wrap("2", text)

    def bold(self, text: str) -> str:
        return self._wrap("1", text)

    def cyan(self, text: str) -> str:
        return self._wrap("36", text)

    def yellow(self, text: str) -> str:
        return self._wrap("33", text)

    def red(self, text: str) -> str:
        return self._wrap("31", text)


class Repl:
    def __init__(self, agent: Agent, style: Style | None = None) -> None:
        self.agent = agent
        self.style = style or Style(_supports_colour())
        self.running = True
        self.commands: dict[str, Callable[[str], None]] = {
            "help": self.cmd_help,
            "quit": self.cmd_quit,
            "exit": self.cmd_quit,
            "reset": self.cmd_reset,
            "history": self.cmd_history,
            "cost": self.cmd_cost,
        }

    # -------------------------------------------------------------- commands

    def cmd_help(self, _: str) -> None:
        rows = [
            ("/help", "this list"),
            ("/reset", "clear the current conversation"),
            ("/history", "how many turns are in short-term memory"),
            ("/cost", "tokens and spend this session"),
            ("/quit", "leave"),
        ]
        print()
        for name, desc in rows:
            print(f"  {self.style.bold(name.ljust(10))} {self.style.dim(desc)}")
        print()

    def cmd_quit(self, _: str) -> None:
        self.running = False

    def cmd_reset(self, _: str) -> None:
        self.agent.reset()
        print(self.style.dim("  conversation cleared\n"))

    def cmd_history(self, _: str) -> None:
        count = len(self.agent.messages)
        limit = self.agent.config.conversation.max_history_messages
        print(self.style.dim(f"  {count} messages in short-term memory (limit {limit})\n"))

    def cmd_cost(self, _: str) -> None:
        u = self.agent.usage
        print(
            self.style.dim(
                f"  {u.input_tokens:,} in / {u.output_tokens:,} out "
                f"— ${self.agent.cost_usd:.4f} this session\n"
            )
        )

    def dispatch(self, line: str) -> bool:
        """Handle a /command. Returns True if the line was a command."""
        if not line.startswith("/"):
            return False
        name, _, rest = line[1:].partition(" ")
        handler = self.commands.get(name.strip().lower())
        if handler is None:
            print(self.style.yellow(f"  unknown command /{name} — try /help\n"))
            return True
        handler(rest.strip())
        return True

    # ------------------------------------------------------------------- loop

    def banner(self) -> None:
        cfg = self.agent.config
        provider = cfg.provider_name
        tag = f"{cfg.model.name} · effort {cfg.model.effort}"
        if provider == "fake":
            tag = "fake provider — no model calls"
        print()
        print(f"  {self.style.bold(cfg.name)} {self.style.dim('· ' + tag)}")
        print(self.style.dim("  /help for commands, /quit to leave"))
        print()

    def prompt_once(self) -> None:
        try:
            line = input(self.style.cyan("you › ")).strip()
        except EOFError:
            print()
            self.running = False
            return
        except KeyboardInterrupt:
            print(self.style.dim("\n  (ctrl-c — /quit to leave)"))
            return

        if not line or self.dispatch(line):
            return

        print(self.style.bold(f"{self.agent.config.name} › "), end="", flush=True)
        try:
            reply = self.agent.run_turn(line, on_text_delta=self._emit)
        except ProviderError as exc:
            print("\r" + " " * 20, end="\r")
            print(self.style.red(f"  {exc}\n"))
            return
        except KeyboardInterrupt:
            print(self.style.dim("\n  (interrupted)\n"))
            return

        if not reply:
            print(self.style.dim("(no reply)"))
        print("\n")

    @staticmethod
    def _emit(chunk: str) -> None:
        print(chunk, end="", flush=True)

    def run(self) -> None:
        self.banner()
        while self.running:
            self.prompt_once()
        print(self.style.dim("  goodbye\n"))


def main() -> int:
    try:
        config = get_config()
        provider = build_provider(config)
        agent = Agent(config, provider)
    except (ConfigError, PromptError, ProviderError) as exc:
        print(f"\n  {exc}\n", file=sys.stderr)
        return 1

    Repl(agent).run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
