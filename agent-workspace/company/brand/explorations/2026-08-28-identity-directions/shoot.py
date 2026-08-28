#!/usr/bin/env python3
"""Render the three identity boards. Same deterministic pattern as the video build."""
import json, pathlib
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME, args=["--force-color-profile=srgb","--hide-scrollbars"])
    p = b.new_page(viewport={"width":1920,"height":1080}, device_scale_factor=1)
    errs=[]; p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto((HERE/"boards.html").as_uri(), wait_until="load")
    print("MEASURED CONTRAST:", json.dumps(p.evaluate("window.__ratios"), indent=1))
    for i,k in enumerate("ABC"):
        p.evaluate("i => window.setBoard(i)", i)
        p.screenshot(path=str(HERE/f"direction-{k}.png"))
        print("  wrote", f"direction-{k}.png")
    b.close()
print("JS ERRORS:", errs or "none")
