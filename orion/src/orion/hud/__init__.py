"""The HUD — Orion's command-center face.

A local web page served by the Orion process at 127.0.0.1, mirroring the live
agent in real time over Server-Sent Events. It is a view, never a second
brain: it subscribes to the same event stream the audit log receives, and the
one thing it can *do* — send a message, stop Orion talking — routes through
the exact same agent core as a typed or spoken turn.

Every value on the page is real. No fake gauges, no invented telemetry.
"""
