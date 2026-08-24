# Orion

Karl's voice-first assistant for Service Pow. What it is and what it's allowed to
do lives in [`../AGENT.md`](../AGENT.md) — read that first; this file is just how
to run it.

## Quickstart — from zero to talking

```bash
git clone -b claude/voice-first-agent-core-dysy9h https://github.com/hughm007/Kobe.git
cd Kobe/orion
uv sync --extra voice
uv run orion-setup           # paste your 3 keys when prompted (input is hidden)
uv run orion                 # then type /voice
```

Prerequisites: [uv](https://docs.astral.sh/uv/) and, for audio —
macOS: `brew install portaudio` · Debian/Ubuntu: `apt install libportaudio2` ·
Windows: nothing (sounddevice bundles PortAudio).

Where the keys come from:

| Key | Get it at | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API keys | no brain at all |
| `DEEPGRAM_API_KEY` | console.deepgram.com (free credit on signup) | voice can't hear you |
| `ELEVENLABS_API_KEY` | elevenlabs.io → profile → API keys (free tier) | answers on screen, not aloud |

`orion-setup` is safe to re-run any time — it keeps keys you've already set and
finishes with the same preflight as `orion-voicetest check`, so you always know
what's working. `.env` is git-ignored; never put a key in a source file, even
for a minute.

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

## The HUD

Orion serves its own command-center page at `http://127.0.0.1:8765` (localhost
only, never a network service). It opens automatically when Orion starts —
`/hud` reprints or reopens it — and mirrors the live agent over a server-sent
event stream: system status, the tool registry (tools flash as they run), the
conversation feed with streaming replies, LISTENING/THINKING/SPEAKING state,
real T0–T6 latency, session tokens and cost, heartbeat notices (dismissible),
and the kill-switch state. The input bar sends a turn through the same agent
core as typing or speaking; the stop button is barge-in from the screen.

Every value on it is real. There are no fake gauges: the concept image's
fictional telemetry became live equivalents, and things that don't exist
(a wake word) say so instead of pretending. `[hud]` in orion.toml controls
port and auto-open.

## The rails

Karl's "never without asking" list is enforced by a two-step gate that sits
between the model choosing a tool and the tool running — identical for typed,
spoken, and heartbeat turns:

1. Orion states plainly what it's about to do; any natural "yes" passes step one.
2. It asks **"Are you sure you want to confirm?"** — only the exact word
   `confirm` executes. Anything else, or silence, is a decline.

Per-action, never generalising. The gate list is config
(`[gate].always_confirm` in orion.toml) plus what tools declare themselves
(overwrites, `forget`). The heartbeat never gets a gate at all — unattended
consequential actions are declined by default and leave a note.

- **Audit**: everything lands in `state/audit.jsonl` — turns, tool runs, gate
  decisions, per-turn tokens. `/cost` shows session and lifetime spend.
- **Kill switch**: `/pause` holds all proactive behaviour (heartbeat included);
  conversation keeps working. `/resume` releases it.
- **Injection posture**: everything Orion reads arrives wrapped as untrusted
  data — a file ordering it to act can't authorise anything; the gate still asks.

## The heartbeat

```bash
uv run orion-heartbeat    # separate process; move it to an always-on box later
```

Checks and their thresholds live in `orion.toml` (`[checks.*]`). Shipped:
`inbox_triage` (untriaged files in `inbox/`, escalates if ignored) and
`open_loops` (daily: quiet worklog, active client with an empty brief, stale
drafts). Notices are **held** in `state/notices.jsonl` until you're back —
the REPL shows "while you were away" — and every one is dismissible via
`/notices`. Quiet hours defer non-urgent checks; restarts resume the schedule
instead of refiring it.

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
