import os
import sys
from pathlib import Path

import pytest

# Tests never touch a real model. Set before anything imports the provider.
os.environ["ORION_PROVIDER"] = "fake"

REPO = Path(__file__).resolve().parents[2]

from orion.config import load_config  # noqa: E402

KEY_VARS = (
    "ANTHROPIC_API_KEY", "DEEPGRAM_API_KEY", "ELEVENLABS_API_KEY",
    "ELEVENLABS_VOICE_ID", "ELEVENLABS_MODEL_ID",
)


@pytest.fixture(autouse=True)
def _no_real_keys(monkeypatch):
    """Tests never see a real key: whatever a developer's .env (or a previous
    test's load_dotenv) put in the environment is cleared per test."""
    for var in KEY_VARS:
        monkeypatch.delenv(var, raising=False)


@pytest.fixture
def config(tmp_path, monkeypatch):
    """Real config and real AGENT.md, but state written to a temp directory."""
    cfg = load_config(REPO / "orion")
    object.__setattr__(cfg, "state_dir", tmp_path / "state")
    return cfg
