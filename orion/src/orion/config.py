"""Configuration — loaded from orion.toml, with secrets from the environment.

Nothing tunable should be a literal anywhere else in the codebase. If you find
yourself typing a number into a module, it probably belongs in orion.toml.
"""

from __future__ import annotations

import os
import tomllib
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path


class ConfigError(RuntimeError):
    """Configuration is missing or malformed, phrased for a human to fix."""


def find_home(start: Path | None = None) -> Path:
    """Locate the `orion/` directory by walking up looking for orion.toml.

    Overridable with ORION_HOME so the heartbeat can run from anywhere.
    """
    override = os.environ.get("ORION_HOME")
    if override:
        home = Path(override).expanduser().resolve()
        if not (home / "orion.toml").is_file():
            raise ConfigError(f"ORION_HOME is set to {home}, but there's no orion.toml there.")
        return home

    here = (start or Path(__file__)).resolve()
    for candidate in [here, *here.parents]:
        if (candidate / "orion.toml").is_file():
            return candidate
    raise ConfigError(
        "Couldn't find orion.toml. Run Orion from inside the repo, or set ORION_HOME."
    )


def load_dotenv(path: Path) -> None:
    """Read KEY=VALUE lines from a .env file into the environment.

    Deliberately tiny and dependency-free. Never overrides a variable that is
    already set — an exported key wins over the file.
    """
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip("'\"")
        if key and value and key not in os.environ:
            os.environ[key] = value


@dataclass(frozen=True)
class ModelConfig:
    name: str = "claude-opus-5"
    effort: str = "medium"
    max_tokens: int = 4000
    timeout_seconds: float = 90.0
    max_retries: int = 2
    refusal_fallback: bool = True
    price_input_per_mtok: float = 5.0
    price_output_per_mtok: float = 25.0


@dataclass(frozen=True)
class ConversationConfig:
    max_history_messages: int = 60
    max_tool_iterations: int = 8


@dataclass(frozen=True)
class Config:
    home: Path
    name: str
    spec_file: Path
    workspace: Path
    state_dir: Path
    model: ModelConfig
    conversation: ConversationConfig
    raw: dict = field(default_factory=dict, repr=False)

    @property
    def provider_name(self) -> str:
        """Which brain to use. `fake` runs the whole harness with no API key."""
        return os.environ.get("ORION_PROVIDER", "anthropic").strip().lower()

    def state_path(self, *parts: str) -> Path:
        self.state_dir.mkdir(parents=True, exist_ok=True)
        return self.state_dir.joinpath(*parts)


def _resolve(home: Path, value: str) -> Path:
    path = Path(value).expanduser()
    return path if path.is_absolute() else (home / path).resolve()


def load_config(home: Path | None = None) -> Config:
    home = home or find_home()
    load_dotenv(home / ".env")

    try:
        data = tomllib.loads((home / "orion.toml").read_text(encoding="utf-8"))
    except tomllib.TOMLDecodeError as exc:
        raise ConfigError(f"orion.toml is not valid TOML: {exc}") from exc

    assistant = data.get("assistant", {})
    model = data.get("model", {})
    conversation = data.get("conversation", {})

    known_model = {f for f in ModelConfig.__dataclass_fields__}
    known_conv = {f for f in ConversationConfig.__dataclass_fields__}

    return Config(
        home=home,
        name=assistant.get("name", "Orion"),
        spec_file=_resolve(home, assistant.get("spec_file", "../AGENT.md")),
        workspace=_resolve(home, assistant.get("workspace", "../agent-workspace")),
        state_dir=_resolve(home, assistant.get("state_dir", "state")),
        model=ModelConfig(**{k: v for k, v in model.items() if k in known_model}),
        conversation=ConversationConfig(
            **{k: v for k, v in conversation.items() if k in known_conv}
        ),
        raw=data,
    )


@lru_cache(maxsize=1)
def get_config() -> Config:
    return load_config()
