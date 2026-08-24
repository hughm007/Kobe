"""Orion — a voice-first assistant for Service Pow.

Five layers, one shared agent core:

    provider.py   the seam to the model — the only module that imports the SDK
    agent.py      the core: one turn in, one reply out, tools in between
    tools/        the hands — a registry the model chooses from
    voice/        the ears and mouth — a thin wrapper, never a second brain
    memory.py     what survives a restart
    heartbeat.py  acting without being spoken to

A typed turn, a spoken turn and a heartbeat-initiated turn all flow through
`Agent.run_turn`. If the agent logic ever exists twice, something has gone wrong.
"""

__version__ = "0.1.0"
