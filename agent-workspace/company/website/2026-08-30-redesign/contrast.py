#!/usr/bin/env python3
"""Measure WCAG contrast for the Service Pow token system.

'Accessibility outranks fidelity' (style-bank.md). Ratios are measured here, never asserted.
Exit code 1 if any declared pair fails its required threshold.
"""
import sys

def srgb_to_lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)

def ratio(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)

# ---------------------------------------------------------------- the palette
T = {
    # ink — primary typography, cool near-black to sit with the blue
    "ink-900": "#12161B",
    "ink-700": "#39414C",
    "ink-500": "#5F6875",
    "ink-400": "#828B99",
    # paper — warm off-white, not sterile white
    "paper":        "#FAF8F5",
    "paper-raised": "#FFFFFF",
    "paper-sunk":   "#F2EFEA",
    "rule":         "#E4DFD8",
    "rule-strong":  "#CFC8BE",
    # brand — deep ink blue, the anchor
    "blue-900": "#0B2340",
    "blue-800": "#0F3157",
    "blue-700": "#133B69",
    "blue-600": "#17457A",   # THE brand value
    "blue-500": "#1E5896",
    "blue-400": "#3C7CBF",
    "blue-200": "#B9D0E6",
    "blue-100": "#DCE8F3",
    "blue-50":  "#F0F5FA",
    # signal — optional, data-positive only, never a CTA
    "signal-700": "#8A5310",
    "signal-600": "#A9661B",
}

# ------------------------------------------------- pairs that must hold, and why
# (foreground, background, minimum, label)
PAIRS = [
    ("ink-900", "paper",        4.5, "body text on page ground"),
    ("ink-900", "paper-raised", 4.5, "body text on a card"),
    ("ink-900", "paper-sunk",   4.5, "body text on a sunk panel"),
    ("ink-700", "paper",        4.5, "secondary text on page ground"),
    ("ink-700", "paper-raised", 4.5, "secondary text on a card"),
    ("ink-500", "paper",        4.5, "meta text on page ground"),
    ("ink-400", "paper",        3.0, "large/disabled text only"),

    ("blue-600", "paper",        4.5, "brand blue as link text on paper"),
    ("blue-700", "paper",        4.5, "link hover on paper"),
    ("blue-600", "paper-raised", 4.5, "brand blue as link text on a card"),
    ("blue-600", "blue-50",      4.5, "blue text on the faintest blue wash"),

    ("paper",        "blue-600", 4.5, "CTA label on brand blue"),
    ("paper",        "blue-700", 4.5, "CTA label, hover"),
    ("paper",        "blue-800", 4.5, "CTA label, pressed"),
    ("paper-raised", "blue-900", 4.5, "text on the darkest blue ground"),
    ("blue-200",     "blue-900", 4.5, "muted text on dark blue ground"),

    ("blue-400", "blue-900", 3.0, "focus ring on dark blue (non-text)"),
    ("blue-600", "paper",    3.0, "focus ring on paper (non-text)"),

    ("signal-700", "paper",     4.5, "signal as data label on paper"),
    ("signal-600", "ink-900",   3.0, "signal mark on dark (non-text)"),
]

def main():
    width = max(len(l) for _, _, _, l in PAIRS)
    failures = []
    print(f"{'pair':<26}{'ratio':>7}  {'min':>4}      what")
    print("-" * (44 + width))
    for fg, bg, minimum, label in PAIRS:
        r = ratio(T[fg], T[bg])
        ok = r >= minimum
        if not ok:
            failures.append((fg, bg, r, minimum, label))
        print(f"{fg + ' on ' + bg:<26}{r:>6.2f}  {minimum:>5.1f}  {'ok  ' if ok else 'FAIL'}  {label}")
    print()
    if failures:
        print(f"{len(failures)} FAILING PAIR(S):")
        for fg, bg, r, m, label in failures:
            print(f"  {fg} on {bg} = {r:.2f}, needs {m} — {label}")
        return 1
    print(f"All {len(PAIRS)} pairs pass.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
