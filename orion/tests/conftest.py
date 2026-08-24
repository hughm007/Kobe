import os
import sys
from pathlib import Path

import pytest

# Tests never touch a real model. Set before anything imports the provider.
os.environ["ORION_PROVIDER"] = "fake"

REPO = Path(__file__).resolve().parents[2]

from orion.config import load_config  # noqa: E402


@pytest.fixture
def config(tmp_path, monkeypatch):
    """Real config and real AGENT.md, but state written to a temp directory."""
    cfg = load_config(REPO / "orion")
    object.__setattr__(cfg, "state_dir", tmp_path / "state")
    return cfg
