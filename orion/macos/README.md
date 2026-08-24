# ORION.app — the Mac shell

The Python backend in `~/Kobe/orion` stays the real Orion. This app is the
launcher, hotkey, window and process manager around it. No secrets live in the
bundle — keys stay in `~/Kobe/orion/.env`.

## Build (once, on the Mac)

```bash
xcode-select --install        # if you don't have the Command Line Tools yet
cd ~/Kobe/orion/macos
./build.sh --install          # builds ORION.app and copies it to /Applications
```

First launch: **right-click ORION.app → Open** (it's self-signed), and allow
the **microphone** when macOS asks. Pin to Dock: right-click its Dock icon →
Options → Keep in Dock. Spotlight finds it as ORION.

## Use

| | |
|---|---|
| **⌃⌥ Space** (Ctrl+Option+Space) | wake Orion from anywhere — launches everything if needed, brings the HUD forward, starts listening |
| Click the app / Dock icon | same as the hotkey |
| Green window button or `⌃⌘F` | fullscreen |
| menu → Standby | microphone and Deepgram off now |
| menu → Quit ORION (`⌘Q`) | stops listening, playback, backend, HUD — everything |
| menu → Launch ORION at Login | optional; at login the backend starts in **standby only** — the mic stays off until you wake it |

Silence after a reply returns Orion to standby on its own
(`[session].follow_up_seconds` / `idle_seconds` in `orion.toml`).

## Why Ctrl+Option+Space, and how to change it

Plain **Ctrl+Space is reserved by macOS** for input-source switching by
default, so the hotkey is **Ctrl+Option+Space**. To change it, edit the
`RegisterEventHotKey` line in `Sources/main.swift` (the comment marks it) and
re-run `./build.sh --install`. If you've freed Ctrl+Space in System Settings →
Keyboard → Shortcuts → Input Sources, `UInt32(controlKey)` alone works.

## If the backend lives somewhere other than ~/Kobe/orion

```bash
defaults write com.servicepow.orion backendPath /path/to/Kobe/orion
```
