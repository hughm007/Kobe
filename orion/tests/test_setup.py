"""The setup wizard: writes .env correctly, keeps existing keys, never echoes."""

from orion import setup


def run_wizard(monkeypatch, tmp_path, answers, env_content=None, config=None):
    """Drive main() with scripted hidden-input answers against a temp home."""
    home = tmp_path / "orion-home"
    home.mkdir()
    (home / "orion.toml").write_text(
        '[assistant]\nname = "Orion"\n'
        f'spec_file = "{config.spec_file}"\n'
        f'workspace = "{config.workspace}"\n'
    )
    if env_content is not None:
        (home / ".env").write_text(env_content)

    feed = iter(answers)
    monkeypatch.setattr(setup, "prompt_hidden", lambda question: next(feed, ""))
    monkeypatch.setenv("ORION_HOME", str(home))
    monkeypatch.setenv("ORION_PROVIDER", "fake")  # preflight: no live brain check
    # preflight would try the network for keys; keep the wizard test offline.
    monkeypatch.setattr(
        "orion.voice.preflight.run_preflight", lambda cfg: ([], True)
    )
    assert setup.main() == 0
    return setup.read_env_file(home / ".env")


def test_pasted_keys_land_in_env_and_defaults_are_kept(monkeypatch, tmp_path, config):
    values = run_wizard(
        monkeypatch, tmp_path,
        answers=["sk-ant-test", "dg-test", "el-test"],
        config=config,
    )
    assert values["ANTHROPIC_API_KEY"] == "sk-ant-test"
    assert values["DEEPGRAM_API_KEY"] == "dg-test"
    assert values["ELEVENLABS_API_KEY"] == "el-test"
    assert values["ELEVENLABS_VOICE_ID"] == "KyjzVGDMoVqkKJdc4UFh"
    assert values["ELEVENLABS_MODEL_ID"] == "eleven_flash_v2_5"


def test_skipping_a_key_leaves_it_blank_not_broken(monkeypatch, tmp_path, config):
    values = run_wizard(
        monkeypatch, tmp_path,
        answers=["sk-ant-test", "", ""],  # Enter twice: no Deepgram, no ElevenLabs
        config=config,
    )
    assert values["ANTHROPIC_API_KEY"] == "sk-ant-test"
    assert values["DEEPGRAM_API_KEY"] == ""
    assert values["ELEVENLABS_API_KEY"] == ""


def test_rerunning_keeps_existing_keys_unless_replaced(monkeypatch, tmp_path, config):
    existing = "ANTHROPIC_API_KEY=sk-ant-old\nDEEPGRAM_API_KEY=dg-old\nELEVENLABS_API_KEY=\n"
    values = run_wizard(
        monkeypatch, tmp_path,
        # keep anthropic (Enter), replace deepgram, provide the missing elevenlabs
        answers=["", "dg-new", "el-new"],
        env_content=existing,
        config=config,
    )
    assert values["ANTHROPIC_API_KEY"] == "sk-ant-old"
    assert values["DEEPGRAM_API_KEY"] == "dg-new"
    assert values["ELEVENLABS_API_KEY"] == "el-new"


def test_a_custom_voice_id_in_env_survives_the_wizard(monkeypatch, tmp_path, config):
    values = run_wizard(
        monkeypatch, tmp_path,
        answers=["", "", ""],
        env_content="ELEVENLABS_VOICE_ID=CustomVoice123\n",
        config=config,
    )
    assert values["ELEVENLABS_VOICE_ID"] == "CustomVoice123"


def test_keys_are_masked_when_shown():
    assert setup.mask("sk-ant-abcdefgh") == "sk-a…efgh"
    assert "abcdef" not in setup.mask("sk-ant-abcdefgh")
    assert setup.mask("short") == "•••••"
