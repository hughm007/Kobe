"""The ears and mouth.

A thin wrapper around the same brain text mode uses — never a second one.
The pipeline: microphone → Deepgram streaming STT → Agent.run_turn →
spoken-response formatter → ElevenLabs streaming TTS → speakers, with
barge-in throughout.
"""
