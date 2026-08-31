#!/usr/bin/env python3
"""Shoot proto-hand.html at 1920x1080. Usage: shoot-proto-hand.py <round-tag>"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

tag = sys.argv[1] if len(sys.argv) > 1 else "r1"
build = Path(__file__).resolve().parent
out = build / "out" / f"proto-hand-{tag}.png"

with sync_playwright() as pw:
    b = pw.chromium.launch(
        executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
        args=["--force-device-scale-factor=1"])
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((build / "proto-hand.html").as_uri())
    pg.wait_for_timeout(250)
    pg.screenshot(path=str(out), clip={"x": 0, "y": 0, "width": 1920, "height": 1080})
    b.close()
print(out)
