"""Startup checks for voice mode.

Nothing silently fails: every layer is checked before the first word, and each
missing piece is reported as the one-line fix, e.g.
"ElevenLabs is not configured. Add ELEVENLABS_API_KEY to .env."
"""

from __future__ import annotations

import os
from dataclasses import dataclass

import httpx


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str = ""

    def line(self) -> str:
        mark = "✓" if self.ok else "✗"
        return f"  {mark} {self.name}" + (f" — {self.detail}" if self.detail else "")


def _check_microphone() -> CheckResult:
    try:
        import sounddevice as sd
        device = sd.query_devices(kind="input")
        return CheckResult("microphone", True, device.get("name", ""))
    except ImportError:
        return CheckResult("microphone", False, "run `uv sync --extra voice`")
    except Exception as exc:  # noqa: BLE001
        return CheckResult("microphone", False, f"no input device ({exc})")


def _check_speakers() -> CheckResult:
    try:
        import sounddevice as sd
        device = sd.query_devices(kind="output")
        return CheckResult("speakers", True, device.get("name", ""))
    except ImportError:
        return CheckResult("speakers", False, "run `uv sync --extra voice`")
    except Exception as exc:  # noqa: BLE001
        return CheckResult("speakers", False, f"no output device ({exc})")


def _check_deepgram(timeout: float = 8.0) -> list[CheckResult]:
    key = os.environ.get("DEEPGRAM_API_KEY", "").strip()
    if not key:
        return [CheckResult("Deepgram key", False, "add DEEPGRAM_API_KEY to orion/.env")]
    results = [CheckResult("Deepgram key", True)]
    try:
        response = httpx.get(
            "https://api.deepgram.com/v1/auth/token",
            headers={"Authorization": f"Token {key}"},
            timeout=timeout,
        )
        if response.status_code in (200, 201):
            results.append(CheckResult("Deepgram auth", True))
        elif response.status_code in (401, 403):
            results.append(
                CheckResult("Deepgram auth", False, "key rejected — check DEEPGRAM_API_KEY")
            )
        else:
            results.append(
                CheckResult("Deepgram auth", False, f"unexpected HTTP {response.status_code}")
            )
    except httpx.HTTPError as exc:
        results.append(CheckResult("Deepgram auth", False, f"unreachable ({exc})"))
    return results


def _check_elevenlabs(voice_config, timeout: float = 8.0) -> list[CheckResult]:
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        return [
            CheckResult(
                "ElevenLabs key", False,
                "ElevenLabs is not configured. Add ELEVENLABS_API_KEY to .env.",
            )
        ]
    results = [CheckResult("ElevenLabs key", True)]
    headers = {"xi-api-key": key}
    try:
        response = httpx.get("https://api.elevenlabs.io/v1/user", headers=headers, timeout=timeout)
        if response.status_code == 200:
            results.append(CheckResult("ElevenLabs auth", True))
        elif response.status_code == 401:
            results.append(
                CheckResult("ElevenLabs auth", False, "key rejected — check ELEVENLABS_API_KEY")
            )
            return results
        else:
            results.append(
                CheckResult("ElevenLabs auth", False, f"unexpected HTTP {response.status_code}")
            )
            return results

        voice_id = voice_config.effective_voice_id
        response = httpx.get(
            f"https://api.elevenlabs.io/v1/voices/{voice_id}", headers=headers, timeout=timeout
        )
        if response.status_code == 200:
            name = response.json().get("name", "")
            results.append(CheckResult(f"voice {voice_id}", True, name))
        else:
            results.append(
                CheckResult(
                    f"voice {voice_id}", False,
                    "not accessible from this account — check ELEVENLABS_VOICE_ID",
                )
            )

        response = httpx.get("https://api.elevenlabs.io/v1/models", headers=headers, timeout=timeout)
        if response.status_code == 200:
            model_ids = {m.get("model_id") for m in response.json()}
            model = voice_config.effective_tts_model
            if model in model_ids:
                results.append(CheckResult(f"TTS model {model}", True))
            else:
                results.append(
                    CheckResult(f"TTS model {model}", False, "not in this account's model list")
                )
    except httpx.HTTPError as exc:
        results.append(CheckResult("ElevenLabs", False, f"unreachable ({exc})"))
    return results


def _check_brain(config) -> CheckResult:
    if config.provider_name == "fake":
        return CheckResult("brain", True, "fake provider (no model calls)")
    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        return CheckResult("brain", True, config.model.name)
    return CheckResult("brain", False, "add ANTHROPIC_API_KEY to orion/.env")


def run_preflight(config) -> tuple[list[CheckResult], bool]:
    """All checks, and whether voice mode can start at all.

    Hard requirements: mic, speakers, Deepgram, brain. ElevenLabs failing is
    soft — Orion can listen and answer on screen while the voice is down.
    """
    results: list[CheckResult] = []
    results.append(_check_microphone())
    results.append(_check_speakers())
    results.extend(_check_deepgram())
    results.append(_check_brain(config))
    results.extend(_check_elevenlabs(config.voice))

    hard = [r for r in results if not r.name.startswith(("ElevenLabs", "voice ", "TTS model"))]
    return results, all(r.ok for r in hard)
