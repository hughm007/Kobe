#!/usr/bin/env python3
"""
Deterministic frame renderer for the Service Pow intro video.

Chromium is driven frame by frame through window.setFrame(N); every frame is a
pure function of N, so re-running this produces byte-identical PNGs.

  python3 render.py --start 450 --end 779 --out proof
  python3 render.py --all --out full

Chromium lives at a pinned in-container path because the Playwright python
package expects build 1234 and this image ships 1194. We point at the binary we
have rather than downloading one (the egress proxy would block it anyway).
"""
import argparse, json, os, pathlib, sys, time
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
FPS, TOTAL = 30, 1800

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--end",   type=int, default=None, help="inclusive")
    ap.add_argument("--all",   action="store_true")
    ap.add_argument("--out",   default="frames")
    ap.add_argument("--every", type=int, default=1, help="stride, for contact sheets")
    ap.add_argument("--cut",   default="control", choices=["control","challenger","rev3"])
    a = ap.parse_args()

    start = 0 if a.all else a.start
    end   = TOTAL - 1 if a.all else (a.end if a.end is not None else start)
    outdir = HERE / "frames" / a.out
    outdir.mkdir(parents=True, exist_ok=True)

    if not os.path.exists(CHROME):
        sys.exit(f"FAIL: chromium not at {CHROME}")

    errors = []
    t0 = time.time()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=CHROME, args=["--force-color-profile=srgb",
                                                                   "--disable-lcd-text",
                                                                   "--hide-scrollbars"])
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}")
                if m.type in ("error", "warning") else None)
        page.goto((HERE / "scenes.html").as_uri() + f"?cut={a.cut}", wait_until="load")

        contrast = page.evaluate("window.__contrast")
        print(f"CUT: {a.cut}")
        print("CONTRAST RATIOS (measured, not asserted):", json.dumps(contrast))
        for k, v in contrast.items():
            print(f"  {k:18s} {v:6.2f}  {'PASS >=4.5' if v >= 4.5 else 'BELOW 4.5'}")

        n = 0
        for f in range(start, end + 1, a.every):
            page.evaluate("f => window.setFrame(f)", f)
            page.screenshot(path=str(outdir / f"{f:05d}.png"), animations="disabled")
            n += 1
            if n % 50 == 0:
                print(f"  ... {n} frames, {time.time()-t0:.1f}s", flush=True)
        browser.close()

    print(f"OK: {n} frames -> {outdir}  ({time.time()-t0:.1f}s)")
    if errors:
        print("JS DIAGNOSTICS (not silently swallowed):")
        for e in errors[:25]:
            print("  " + e)
    else:
        print("JS DIAGNOSTICS: none")

if __name__ == "__main__":
    main()
