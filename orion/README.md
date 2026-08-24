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
orion.toml      every tunable value
state/          memory, notices, schedule, audit log (git-ignored)
```

The rule that keeps this honest: **one shared agent core, many ways in and out.**
Typed turns, spoken turns and heartbeat-initiated turns all go through
`Agent.run_turn`. If that logic ever exists in two places, something has gone wrong.
