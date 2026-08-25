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

## The shortcut — one configuration location, no rebuild

Default: **Ctrl+Option+Space**. Change it any time with two Terminal lines and
a relaunch of ORION (no rebuild):

```bash
defaults write com.servicepow.orion hotkeyKeyCode -int 49              # 49 = space
defaults write com.servicepow.orion hotkeyModifiers -string "control,option"
```

Modifier names: `control`, `option`, `command`, `shift` (comma-separated).
If you have freed plain Ctrl+Space from Input Sources, `-string "control"`
gives you exactly that. `defaults delete com.servicepow.orion hotkeyKeyCode`
returns to the default.

Waking is **immersive by default** — the HUD enters fullscreen on the hotkey.
Prefer a normal window? `defaults write com.servicepow.orion wakeFullscreen
-bool false`.

## Permissions — what macOS will and won't ask

- **Microphone**: yes, once, on the first wake. If you ever denied it:
  System Settings → Privacy & Security → Microphone → enable ORION.
- **Accessibility / Input Monitoring: NOT required.** RegisterEventHotKey is
  a registered system hotkey, not keyboard sniffing — nothing to grant.

## Always-armed hotkey

A global hotkey only exists while ORION is running — a closed app cannot hear
the keystroke that would launch it (an OS fact, not a limitation of this
code). For the "press it anywhere, any time" experience: menu → **Launch
ORION at Login**. At login ORION starts in **standby only** — microphone and
Deepgram stay off until you actually wake it.

## If the backend lives somewhere other than ~/Kobe/orion

```bash
defaults write com.servicepow.orion backendPath /path/to/Kobe/orion
```
