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
from .memory import MemoryStore
from .notices import NoticeBoard
from .provider import ProviderError, build_provider
from .tools import default_registry


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
        self.board = NoticeBoard(agent.config.state_path("notices.jsonl"))
        self.running = True
        self.commands: dict[str, Callable[[str], None]] = {
            "help": self.cmd_help,
            "quit": self.cmd_quit,
            "exit": self.cmd_quit,
            "reset": self.cmd_reset,
            "history": self.cmd_history,
            "cost": self.cmd_cost,
            "tools": self.cmd_tools,
            "voice": self.cmd_voice,
            "memory": self.cmd_memory,
            "notices": self.cmd_notices,
            "pause": self.cmd_pause,
            "resume": self.cmd_resume,
        }

    # -------------------------------------------------------------- commands

    def cmd_help(self, _: str) -> None:
        rows = [
            ("/help", "this list"),
            ("/reset", "clear the current conversation"),
            ("/history", "how many turns are in short-term memory"),
            ("/tools", "what Orion can do"),
            ("/voice", "start the spoken conversation (Ctrl-C returns here)"),
            ("/memory", "what Orion remembers across restarts"),
            ("/notices", "what the heartbeat surfaced (/notices dismiss <id>|all)"),
            ("/pause", "kill switch: hold all proactive behaviour"),
            ("/resume", "let the heartbeat beat again"),
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

    def cmd_tools(self, _: str) -> None:
        if not self.agent.tools or not len(self.agent.tools):
            print(self.style.dim("  no tools registered\n"))
            return
        print()
        for name in self.agent.tools.names():
            t = self.agent.tools.get(name)
            gated = " (asks first)" if t.consequential or t.consequential_when else ""
            first_line = t.description.split(". ")[0]
            print(f"  {self.style.bold(name.ljust(20))} {self.style.dim(first_line + gated)}")
        print()

    def show_notices(self, notices, *, header: str) -> None:
        if not notices:
            return
        print(self.style.bold(f"\n  {header}"))
        for notice in notices:
            badge = {"interrupt": self.style.red("!"), "notify": self.style.yellow("•")}.get(
                notice.level, self.style.dim("·")
            )
            print(f"  {badge} {self.style.dim(notice.id)}  {notice.text}")
        print(self.style.dim("  (/notices dismiss <id> clears one, `all` clears everything)\n"))

    def catch_up(self) -> None:
        """Anything the heartbeat noticed while Karl was away — held, not lost."""
        unseen = self.board.unseen()
        if unseen:
            self.show_notices(unseen, header=f"while you were away ({len(unseen)}):")
            self.board.mark_seen([n.id for n in unseen])

    def cmd_notices(self, rest: str) -> None:
        words = rest.split()
        if words and words[0] == "dismiss":
            target = words[1] if len(words) > 1 else ""
            if not target:
                print(self.style.yellow("  which one? /notices dismiss <id> or all\n"))
            elif self.board.dismiss(target):
                print(self.style.dim("  dismissed\n"))
            else:
                print(self.style.yellow(f"  nothing matched {target!r}\n"))
            return
        pending = self.board.pending()
        if not pending:
            print(self.style.dim("  nothing on the board\n"))
            return
        self.show_notices(pending, header=f"notices ({len(pending)}):")
        self.board.mark_seen()

    def cmd_pause(self, _: str) -> None:
        self.agent.config.state_path("PAUSED").write_text(
            "created by /pause — delete this file or run /resume to re-enable proactive behaviour\n"
        )
        print(self.style.dim("  paused — the heartbeat holds all background action; conversation still works\n"))

    def cmd_resume(self, _: str) -> None:
        pause_file = self.agent.config.state_path("PAUSED")
        if pause_file.exists():
            pause_file.unlink()
            print(self.style.dim("  resumed — the heartbeat is live again\n"))
        else:
            print(self.style.dim("  it wasn't paused\n"))

    def cmd_memory(self, _: str) -> None:
        store = MemoryStore(self.agent.config.state_path("memory.jsonl"))
        memories = store.load()
        if not memories:
            print(self.style.dim("  long-term memory is empty\n"))
            return
        print()
        for memory in memories:
            print(f"  {self.style.dim(memory.id)}  {memory.text}")
        print(self.style.dim(f"\n  edit the file directly: {store.path}\n"))

    def cmd_voice(self, _: str) -> None:
        """Enter continuous voice mode. The same agent — same memory of this
        conversation — carries straight on; only the ears and mouth change."""
        import threading

        try:
            from .voice.audio import AudioError, Microphone, Player
            from .voice.conversation import VoiceConversation
            from .voice.devtests import _pump_mic_to_stt
            from .voice.preflight import run_preflight
            from .voice.stt import DeepgramStream
            from .voice.tts import ElevenLabsSpeaker
        except ImportError:
            print(self.style.yellow(
                "  voice support isn't installed — run `uv sync --extra voice`\n"
            ))
            return

        config = self.agent.config
        results, ok = run_preflight(config)
        for result in results:
            print(result.line())
        if not ok:
            print(self.style.yellow("\n  voice mode can't start — fix the ✗ lines above\n"))
            return

        stt = DeepgramStream(config.voice)
        speaker = ElevenLabsSpeaker(config.voice)
        mic = Microphone(config.voice.sample_rate)
        player = Player(config.voice.tts_sample_rate)
        try:
            mic.start()
            player.start()
        except AudioError as exc:
            print(self.style.red(f"  {exc}\n"))
            return

        self.agent.set_mode("voice")
        convo = VoiceConversation(
            self.agent, stt, speaker, player,
            voice_config=config.voice,
            say=lambda line: print(self.style.dim("  " + line)),
            show=print,
        )
        print(self.style.dim("\n  listening — speak naturally, interrupt freely, Ctrl-C returns to text\n"))
        running = threading.Event()
        running.set()
        threading.Thread(target=_pump_mic_to_stt, args=(mic, stt, running), daemon=True).start()
        try:
            convo.run()
        except KeyboardInterrupt:
            pass
        finally:
            running.clear()
            convo.shutdown()
            mic.stop()
            player.close()
            self.agent.set_mode("text")
        print(self.style.dim("\n  back to text\n"))

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
            self.catch_up()
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
        self.catch_up()
        while self.running:
            self.prompt_once()
        print(self.style.dim("  goodbye\n"))


def main() -> int:
    try:
        config = get_config()
        provider = build_provider(config)
        memories = MemoryStore(config.state_path("memory.jsonl")).as_prompt_section()
        agent = Agent(config, provider, tools=default_registry(config), memories=memories)
    except (ConfigError, PromptError, ProviderError) as exc:
        print(f"\n  {exc}\n", file=sys.stderr)
        return 1

    Repl(agent).run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
