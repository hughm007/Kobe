#!/usr/bin/env python3
"""Shoot proto-van.html at 1920x1080. Usage: python3 proto-shoot.py r1 [frame]"""
import pathlib, sys
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
tag = sys.argv[1] if len(sys.argv) > 1 else "r1"
frame = int(sys.argv[2]) if len(sys.argv) > 2 else 0
out = HERE / "out" / f"proto-van-{tag}.png"

errors = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=CHROME,
        args=["--force-color-profile=srgb", "--disable-lcd-text", "--hide-scrollbars"])
    page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}")
            if m.type in ("error", "warning") else None)
    page.goto((HERE / "proto-van.html").as_uri(), wait_until="load")
    page.evaluate("f => window.setFrame(f)", frame)
    page.screenshot(path=str(out), clip={"x": 0, "y": 0, "width": 1920, "height": 1080})
    browser.close()
for e in errors:
    print("ERR", e)
print("WROTE", out)
