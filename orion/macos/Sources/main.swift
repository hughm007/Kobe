// ORION.app — the Mac shell around the Python backend.
//
// This app owns exactly four jobs (AGENT.md's "one shared agent core" rule —
// the brain stays in Python):
//   launcher   : starts `uv run orion-app` in ~/Kobe/orion if it isn't running
//   hotkey     : Ctrl+Option+Space wakes Orion from anywhere (Carbon hotkey —
//                no Accessibility permission needed)
//   window     : a WKWebView showing the local HUD, fullscreen-capable
//   process    : single instance, graceful Quit ORION
//
// Secrets never touch this bundle: keys live in ~/Kobe/orion/.env, read only
// by the Python backend.

import Cocoa
import WebKit
import Carbon
import ServiceManagement

let HUD_PORT = 8765
let HUD_URL = URL(string: "http://127.0.0.1:\(HUD_PORT)")!

// The backend checkout. Override:  defaults write com.servicepow.orion backendPath /some/path
func backendPath() -> String {
    if let custom = UserDefaults.standard.string(forKey: "backendPath") { return custom }
    return NSHomeDirectory() + "/Kobe/orion"
}

// MARK: - Tiny synchronous HTTP helpers (localhost only, short timeouts)

func httpJSON(_ path: String, method: String = "GET", timeout: TimeInterval = 4) -> [String: Any]? {
    var request = URLRequest(url: HUD_URL.appendingPathComponent(path), timeoutInterval: timeout)
    request.httpMethod = method
    if method == "POST" { request.httpBody = "{}".data(using: .utf8) }
    let semaphore = DispatchSemaphore(value: 0)
    var result: [String: Any]?
    URLSession.shared.dataTask(with: request) { data, _, _ in
        if let data = data {
            result = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
        }
        semaphore.signal()
    }.resume()
    _ = semaphore.wait(timeout: .now() + timeout + 1)
    return result
}

// MARK: - Process management

final class ProcessManager {
    private var backend: Process?

    func backendIsHealthy() -> Bool {
        httpJSON("health")?["ok"] as? Bool == true
    }

    private func findUv() -> String? {
        let candidates = [
            "/opt/homebrew/bin/uv", "/usr/local/bin/uv",
            NSHomeDirectory() + "/.local/bin/uv", NSHomeDirectory() + "/.cargo/bin/uv",
        ]
        for path in candidates where FileManager.default.isExecutableFile(atPath: path) {
            return path
        }
        // Last resort: ask a login shell, which has the user's PATH.
        let which = Process()
        which.executableURL = URL(fileURLWithPath: "/bin/zsh")
        which.arguments = ["-lc", "command -v uv"]
        let pipe = Pipe()
        which.standardOutput = pipe
        try? which.run()
        which.waitUntilExit()
        let output = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8)?
            .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return output.isEmpty ? nil : output
    }

    /// Start the backend if needed. Returns an error string, or nil on success.
    func ensureBackend() -> String? {
        if backendIsHealthy() { return nil }
        guard let uv = findUv() else {
            return "uv was not found. Install it (https://docs.astral.sh/uv/) and try again."
        }
        let dir = backendPath()
        guard FileManager.default.fileExists(atPath: dir + "/orion.toml") else {
            return "Orion backend not found at \(dir). Clone the repo there, or set backendPath."
        }
        let process = Process()
        process.executableURL = URL(fileURLWithPath: uv)
        process.arguments = ["run", "orion-app"]
        process.currentDirectoryURL = URL(fileURLWithPath: dir)
        do { try process.run() } catch {
            return "Couldn't launch the backend: \(error.localizedDescription)"
        }
        backend = process
        // Wait for /health — cold start includes venv checks, allow up to 30s.
        for _ in 0..<120 {
            if backendIsHealthy() { return nil }
            Thread.sleep(forTimeInterval: 0.25)
        }
        return "The backend started but never became healthy on port \(HUD_PORT)."
    }

    func quitBackend() {
        _ = httpJSON("quit", method: "POST")
        // Give it a moment to stop the mic and close cleanly, then make sure.
        Thread.sleep(forTimeInterval: 1.0)
        if let process = backend, process.isRunning { process.terminate() }
        backend = nil
    }
}

// MARK: - Global hotkey (Carbon — works without Accessibility permission)

final class HotkeyManager {
    private var hotKeyRef: EventHotKeyRef?

    // THE shortcut lives here — one configuration location, no rebuild needed:
    //   defaults write com.servicepow.orion hotkeyKeyCode -int 49
    //   defaults write com.servicepow.orion hotkeyModifiers -string "control,option"
    // then quit and relaunch ORION. Key codes: space=49, return=36, F19=80.
    // Modifier names: control, option, command, shift (comma-separated).
    static let defaultKeyCode = UInt32(kVK_Space)
    static let defaultModifiers = "control,option"

    private func modifierFlags(from names: String) -> UInt32 {
        var flags: UInt32 = 0
        for raw in names.lowercased().split(separator: ",") {
            switch raw.trimmingCharacters(in: .whitespaces) {
            case "control", "ctrl": flags |= UInt32(controlKey)
            case "option", "opt", "alt": flags |= UInt32(optionKey)
            case "command", "cmd": flags |= UInt32(cmdKey)
            case "shift": flags |= UInt32(shiftKey)
            default: break
            }
        }
        return flags == 0 ? UInt32(controlKey | optionKey) : flags
    }

    func register(handler target: AppDelegate) {
        var eventType = EventTypeSpec(
            eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed)
        )
        InstallEventHandler(
            GetEventDispatcherTarget(),
            { _, _, userData -> OSStatus in
                let delegate = Unmanaged<AppDelegate>.fromOpaque(userData!).takeUnretainedValue()
                DispatchQueue.main.async { delegate.wakeOrion(reason: "hotkey") }
                return noErr
            },
            1, &eventType, Unmanaged.passUnretained(target).toOpaque(), nil
        )
        // Ctrl+Option+Space by default; overridable via `defaults` (see above).
        let defaults = UserDefaults.standard
        let keyCode = defaults.object(forKey: "hotkeyKeyCode") != nil
            ? UInt32(defaults.integer(forKey: "hotkeyKeyCode"))
            : Self.defaultKeyCode
        let modifiers = modifierFlags(
            from: defaults.string(forKey: "hotkeyModifiers") ?? Self.defaultModifiers
        )
        let hotKeyID = EventHotKeyID(signature: OSType(0x4F52_494E), id: 1) // 'ORIN'
        RegisterEventHotKey(keyCode, modifiers, hotKeyID, GetEventDispatcherTarget(), 0, &hotKeyRef)
    }
}

// MARK: - The HUD window

final class HudWindowController: NSWindowController, NSWindowDelegate {
    convenience init() {
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1440, height: 900),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false
        )
        window.title = "ORION"
        window.appearance = NSAppearance(named: .darkAqua)
        window.backgroundColor = NSColor(red: 0.016, green: 0.04, blue: 0.086, alpha: 1)
        window.collectionBehavior = [.fullScreenPrimary]
        window.center()
        window.isReleasedWhenClosed = false   // closing hides; the app keeps running

        let webView = WKWebView(frame: window.contentView!.bounds)
        webView.autoresizingMask = [.width, .height]
        webView.load(URLRequest(url: HUD_URL))
        window.contentView!.addSubview(webView)

        self.init(window: window)
        window.delegate = self
    }

    func reload() {
        (window?.contentView?.subviews.first as? WKWebView)?.load(URLRequest(url: HUD_URL))
    }

    func present(fullscreen: Bool = false) {
        guard let window = window else { return }
        if window.isMiniaturized { window.deminiaturize(nil) }
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        if fullscreen && !window.styleMask.contains(.fullScreen) {
            // Slight delay lets the window land on screen before the space
            // transition starts — avoids a visual stutter on cold launch.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                if !window.styleMask.contains(.fullScreen) { window.toggleFullScreen(nil) }
            }
        }
    }
}

// MARK: - App delegate

final class AppDelegate: NSObject, NSApplicationDelegate {
    let processManager = ProcessManager()
    let hotkeyManager = HotkeyManager()
    var hudWindow: HudWindowController?
    var waking = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        buildMenu()
        hotkeyManager.register(handler: self)

        if UserDefaults.standard.bool(forKey: "launchAtLogin") {
            // Launched at login: backend up in STANDBY only. Microphone and
            // Deepgram stay OFF until the hotkey or the Dock icon wakes Orion.
            DispatchQueue.global().async { _ = self.processManager.ensureBackend() }
        } else {
            // Launched by the user: waking is what they asked for.
            wakeOrion(reason: "launch")
        }
    }

    /// Dock icon clicked while running.
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        wakeOrion(reason: "dock")
        return true
    }

    func wakeOrion(reason: String) {
        guard !waking else { return }
        waking = true
        DispatchQueue.global().async {
            let error = self.processManager.ensureBackend()
            DispatchQueue.main.async {
                defer { self.waking = false }
                if let error = error {
                    self.showError(error)
                    return
                }
                if self.hudWindow == nil { self.hudWindow = HudWindowController() }
                else { self.hudWindow?.reload() }   // reconnect after backend restarts
                // Immersive by default. Turn off with:
                //   defaults write com.servicepow.orion wakeFullscreen -bool false
                let wantFullscreen = UserDefaults.standard.object(forKey: "wakeFullscreen") == nil
                    || UserDefaults.standard.bool(forKey: "wakeFullscreen")
                self.hudWindow?.present(fullscreen: wantFullscreen)
                DispatchQueue.global().async { _ = httpJSON("wake", method: "POST") }
            }
        }
    }

    @objc func standbyOrion() { DispatchQueue.global().async { _ = httpJSON("standby", method: "POST") } }

    @objc func toggleLaunchAtLogin(_ item: NSMenuItem) {
        let enable = item.state != .on
        do {
            if enable { try SMAppService.mainApp.register() }
            else { try SMAppService.mainApp.unregister() }
            UserDefaults.standard.set(enable, forKey: "launchAtLogin")
            item.state = enable ? .on : .off
        } catch {
            showError("Couldn't change the login item: \(error.localizedDescription)")
        }
    }

    @objc func quitOrion() {
        processManager.quitBackend()
        NSApp.terminate(nil)
    }

    func applicationWillTerminate(_ notification: Notification) {
        processManager.quitBackend()
    }

    private func showError(_ message: String) {
        let alert = NSAlert()
        alert.messageText = "ORION"
        alert.informativeText = message
        alert.runModal()
    }

    private func buildMenu() {
        let mainMenu = NSMenu()
        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenuItem.submenu = appMenu

        appMenu.addItem(withTitle: "Wake ORION  (⌃⌥Space)", action: #selector(menuWake), keyEquivalent: "")
        appMenu.addItem(withTitle: "Standby — mic off", action: #selector(standbyOrion), keyEquivalent: "")
        appMenu.addItem(.separator())
        let login = NSMenuItem(title: "Launch ORION at Login (standby only)",
                               action: #selector(toggleLaunchAtLogin), keyEquivalent: "")
        login.state = UserDefaults.standard.bool(forKey: "launchAtLogin") ? .on : .off
        appMenu.addItem(login)
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Quit ORION", action: #selector(quitOrion), keyEquivalent: "q")

        NSApp.mainMenu = mainMenu
    }

    @objc func menuWake() { wakeOrion(reason: "menu") }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
