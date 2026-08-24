#!/bin/bash
# Build ORION.app on macOS. Run on the Mac, from this directory:
#
#     ./build.sh              build ./ORION.app
#     ./build.sh --install    build and copy into /Applications
#
# Needs the Xcode Command Line Tools (swiftc):  xcode-select --install
set -euo pipefail
cd "$(dirname "$0")"

command -v swiftc >/dev/null || { echo "swiftc not found — run: xcode-select --install"; exit 1; }

APP=ORION.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

echo "· compiling"
swiftc -O Sources/main.swift -o "$APP/Contents/MacOS/ORION" \
    -framework Cocoa -framework WebKit -framework Carbon -framework ServiceManagement

cp Info.plist "$APP/Contents/Info.plist"

if [ -f icon_1024.png ]; then
    echo "· building icon"
    rm -rf orion.iconset
    mkdir orion.iconset
    for size in 16 32 64 128 256 512; do
        sips -z $size $size icon_1024.png --out "orion.iconset/icon_${size}x${size}.png" >/dev/null
        sips -z $((size*2)) $((size*2)) icon_1024.png --out "orion.iconset/icon_${size}x${size}@2x.png" >/dev/null
    done
    iconutil -c icns orion.iconset -o "$APP/Contents/Resources/orion.icns"
    rm -rf orion.iconset
fi

# Ad-hoc signature so macOS remembers the microphone permission across builds.
codesign --force --deep -s - "$APP"

echo "· built $(pwd)/$APP"
if [ "${1:-}" = "--install" ]; then
    rm -rf /Applications/ORION.app
    cp -R "$APP" /Applications/
    echo "· installed to /Applications/ORION.app"
fi
echo "done. First run: right-click ORION.app → Open (unsigned app), allow the microphone when asked."
