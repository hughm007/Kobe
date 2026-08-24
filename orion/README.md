# Orion

Karl's voice-first assistant for Service Pow. What it is and what it's allowed to
do lives in [`../AGENT.md`](../AGENT.md) — read that first; this file is just how
to run it.

## Setup

```bash
cd orion
uv sync                      # add --extra voice once you reach Tier 3
cp .env.example .env         # then put your ANTHROPIC_API_KEY in it
```

`.env` is git-ignored. Never put a key in a source file, even for a minute.

## Run

```bash
uv run orion
```

| Command | |
|---|---|
| `/help` | the list |
| `/reset` | clear the current conversation |
| `/history` | how many turns are in short-term memory |
| `/cost` | tokens and spend this session |
| `/quit` | leave |

## Voice

```bash
uv sync --extra voice          # audio + websocket deps (needs PortAudio on the OS)
uv run orion-voicetest check   # preflight: every layer, every key, clear errors
uv run orion                   # then /voice for the live conversation
```

The pipeline: **microphone → Deepgram (Flux) → the same agent → spoken-response
formatter → ElevenLabs (streaming) → speakers.** Continuous listening with
Flux's built-in turn detection — no Enter key, no push-to-talk. Speak over
Orion and it stops mid-word and listens (barge-in); it recognises its own
voice leaking into the mic and ignores it. Every turn prints the transcript of
what it *heard* next to the reply, plus a T0–T6 latency breakdown.

Keys go in `.env` (see `.env.example`): `DEEPGRAM_API_KEY`,
`ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`.
If ElevenLabs is down or unconfigured, voice mode still listens and answers on
screen — the mouth degrades, the brain doesn't.

Test each layer on its own before blaming the whole pipeline:

| Command | Layer |
|---|---|
| `orion-voicetest mic` | mic → Deepgram: speak, watch live + final transcripts |
| `orion-voicetest tts` | "Good evening. Orion is online." → ElevenLabs → speakers |
| `orion-voicetest stt-agent` | speak → Orion answers in text (no ElevenLabs) |
| `orion-voicetest agent-tts` | type → Orion answers aloud (no Deepgram) |
| `orion-voicetest pipeline` | the full loop — interrupt it, hold five turns |

## Run it without an API key

```bash
ORION_PROVIDER=fake uv run orion
```

Swaps the brain for a scripted fake. The whole harness — tools, memory, the
heartbeat, the confirmation gate — runs normally; only the model call is faked.
This is how the test suite runs, and it's the fastest way to debug everything
that isn't the model.

## Test

```bash
uv run pytest
```

No keys, no network.

## Layout

```
src/orion/
  provider.py   the seam to the model — the only file that imports the SDK
  agent.py      the core: one turn in, one reply out
  prompts.py    system prompt assembly; persona is read from AGENT.md
  config.py     orion.toml + .env
  cli.py        the terminal interface
  tools/        the registry — one self-contained module per capability
  voice/        ears and mouth: stt.py, tts.py, audio.py, conversation.py,
                format.py (spoken-response), sentences.py, preflight.py
orion.toml      every tunable value
state/          memory, notices, schedule, audit log (git-ignored)
```

The rule that keeps this honest: **one shared agent core, many ways in and out.**
Typed turns, spoken turns and heartbeat-initiated turns all go through
`Agent.run_turn`. If that logic ever exists in two places, something has gone wrong.
