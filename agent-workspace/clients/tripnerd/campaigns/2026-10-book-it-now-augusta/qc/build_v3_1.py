#!/usr/bin/env python3
"""Book It Now v3.1: v3 with the phone-screen composite (beat 4) rebuilt after Karl's note "fix the screen, it is not properly centered".
Fixes: (1) screen corners re-fitted from the real screen edges (robust line fits on left/right/top/bottom edges, rounded corners
and the thumb excluded) instead of the hand-placed quad, which sat off the screen and overhung the bezel; (2) plate aspect matches
the screen (h/w 2.28, was 2.08, so text was stretched); (3) the button is centred where the generated still's own button was, same
size, so the thumb presses its lower edge and the label stays readable; (4) messages stack above the composer like a real thread;
(5) the alpha covers the whole screen polygon (rounded corners) minus the notch and the thumb, so no original UI shows around the thumb."""
import sys
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageDraw

WD = Path(__file__).resolve().parent
sys.path.insert(0, str(WD))
import build_v3 as V
B = V.B

src = B.phone_src
Q = np.load(WD / "work_v4/quad.npy").astype(np.float32)            # TL TR BR BL, fitted 2026-10-06
SW = 780; SH = int(round(SW * float(np.linalg.norm(Q[3] - Q[0]) / np.linalg.norm(Q[1] - Q[0]))))
PLATE = np.float32([[0, 0], [SW, 0], [SW, SH], [0, SH]])
M = cv2.getPerspectiveTransform(PLATE, Q); Minv = np.linalg.inv(M)
to_plate = lambda pts: cv2.perspectiveTransform(np.float32(pts).reshape(-1, 1, 2), Minv).reshape(-1, 2)

# the generated still's own button (image px) -> plate box; our button takes its place and size
btn_img = [(786, 1132), (1050, 1132), (1050, 1210), (786, 1210)]
bp = to_plate(btn_img); BX0, BY0 = float(bp[:, 0].min()), float(bp[:, 1].min()); BX1, BY1 = float(bp[:, 0].max()), float(bp[:, 1].max())
BCX = SW / 2.0                                                       # centred on the screen
BW = 580.0; BH = 118.0; BCY = (BY0 + BY1) / 2.0 - 0.10 * BH                      # thumb lands on the lower edge

def screen_plate(pressed):
    k = SW / 780.0; s = lambda v: int(round(v * k)); F = B.F
    im = Image.new("RGB", (SW, SH), B.WHITE); d = ImageDraw.Draw(im)
    d.text((s(70), s(44)), "9:41", font=F(s(32), True), fill=(20, 20, 20))
    d.line([(0, s(206)), (SW, s(206))], fill=(225, 228, 233), width=2)
    d.text((s(34), s(124)), "<", font=F(s(46), True), fill=B.NAVY)
    av = s(88); ax, ay = s(92), s(108); d.ellipse([ax, ay, ax + av, ay + av], fill=B.BLUE)
    lw = int(av * 0.86); lg = B.LOGO.resize((lw, int(601 * lw / 1633)), Image.LANCZOS); im.paste(lg, (ax + (av - lw) // 2, ay + (av - lg.height) // 2), lg)
    d.text((ax + av + s(22), s(112)), "TripNerd", font=F(s(38), True), fill=B.NAVY)
    d.text((ax + av + s(22), s(158)), "tripnerd", font=F(s(28)), fill=B.GREYT)
    # button (centred), then reply bubble above it, then the sent message above that
    fb = F(s(36), True); fill = (64, 120, 200) if pressed else B.BLUE
    bx0, by0 = int(BCX - BW / 2), int(BCY - BH / 2)
    d.rounded_rectangle([bx0, by0, bx0 + int(BW), by0 + int(BH)], int(BH / 2), fill=fill)
    d.text((BCX, BCY), B.BUTTON, font=fb, fill=B.WHITE if pressed else B.NAVY, anchor="mm")
    assert d.textlength(B.BUTTON, font=fb) <= BW - s(40), "button label does not fit"
    f = F(s(34)); lines = B.wrap(d, B.REPLY, f, s(560)); lh = s(46); bh = lh * len(lines) + s(48); rx0 = s(36); rw = s(620)
    ry = by0 - s(28) - bh
    d.rounded_rectangle([rx0, ry, rx0 + rw, ry + bh], s(36), fill=B.GREYB)
    for i, l in enumerate(lines): d.text((rx0 + s(30), ry + s(24) + i * lh), l, font=f, fill=B.NAVY)
    fs = F(s(40), True); t = "AUGUSTA"; tw = d.textlength(t, font=fs); x1 = SW - s(36); x0 = x1 - int(tw) - s(64)
    sy = ry - s(70) - s(96)
    d.rounded_rectangle([x0, sy, x1, sy + s(96)], s(48), fill=B.NAVY); d.text((x0 + s(32), sy + s(24)), t, font=fs, fill=B.WHITE)
    d.text((x1, sy + s(104)), "Seen", font=F(s(24)), fill=B.GREYT, anchor="ra")
    assert sy > s(230), "thread overlaps the header"
    cy = SH - s(150); d.rounded_rectangle([s(30), cy, SW - s(30), cy + s(96)], s(48), outline=(215, 218, 224), width=3, fill=B.WHITE)
    d.text((s(70), cy + s(48)), "Message...", font=F(s(34)), fill=B.GREYT, anchor="lm")
    assert by0 + BH < cy, "button overlaps the composer"
    return im

# alpha: the screen polygon with rounded corners (drawn in plate space, warped), minus the notch and the thumb
pa = Image.new("L", (SW, SH), 0); ImageDraw.Draw(pa).rounded_rectangle([3, 3, SW - 4, SH - 4], 64, fill=255)
alpha = cv2.warpPerspective(np.array(pa), M, (src.shape[1], src.shape[0]), flags=cv2.INTER_LINEAR)
hsv = cv2.cvtColor(src, cv2.COLOR_RGB2HSV)
notch = ((hsv[..., 2] < 70) & (alpha > 0)).astype(np.uint8) * 255
top_band = np.zeros_like(notch); cv2.fillConvexPoly(top_band, np.int32(cv2.perspectiveTransform(np.float32([[0, 0], [SW, 0], [SW, 150], [0, 150]]).reshape(-1, 1, 2), M).reshape(-1, 2)), 255)
notch = cv2.bitwise_and(notch, top_band)
# keep only the notch itself: the dark component containing the notch centre (status-bar text and icons are separate, smaller blobs)
_n, _lab, _st, _ = cv2.connectedComponentsWithStats(notch)
_seed = (455, 1060)                                                # (y, x) inside the notch, image px
_ids = [i for i in range(1, _n) if _lab[_seed] == i] or [1 + int(np.argmax(_st[1:, cv2.CC_STAT_AREA]))]
notch = ((_lab == _ids[0]) * 255).astype(np.uint8); notch = cv2.dilate(notch, np.ones((5, 5), np.uint8))
cv2.imwrite(str(WD / "work_v4/notch_v31.png"), notch)
thumb = (B.keep > 0).astype(np.uint8) * 255
a = alpha.astype(np.float32) / 255.0
a = a * (1 - cv2.GaussianBlur(notch, (5, 5), 0).astype(np.float32) / 255.0) * (1 - B.thumb_alpha)
cv2.imwrite(str(WD / "work_v4/alpha_v31.png"), (a * 255).astype(np.uint8))

def phone_with_screen(pressed):
    warped = cv2.warpPerspective(np.array(screen_plate(pressed)), M, (src.shape[1], src.shape[0]), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    out = src.astype(np.float32) * (1 - a[..., None]) + warped.astype(np.float32) * a[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).crop((410, 0, 410 + 1125, 2000))

B.phone_up, B.phone_dn = phone_with_screen(False), phone_with_screen(True)

if __name__ == "__main__":
    import json, hashlib, subprocess
    V.FR = WD / "frames_v31"; V.FR.mkdir(exist_ok=True)
    nfr = int(round(V.DUR * V.FPS))
    for i in range(nfr): V.frame_at(i / V.FPS).save(V.FR / f"f{i:04d}.png", compress_level=1)
    wav = V.OUT / "temp_audio_v3.wav"
    mp4 = V.OUT / "TN-book-it-now-augusta-v3.1-DRAFT.mp4"
    v3 = V.OUT / "TN-book-it-now-augusta-v3-DRAFT.mp4"                 # audio stream copied from v3 (-14.4 LUFS, -1.5 dBTP)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(V.FPS), "-i", str(V.FR / "f%04d.png"), "-i", str(v3),
                    "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-b:v", "16M", "-maxrate", "18M", "-bufsize", "36M",
                    "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", "-movflags", "+faststart", str(mp4)], check=True)
    rec = {"master": mp4.name, "sha256": hashlib.sha256(mp4.read_bytes()).hexdigest(), "screen_quad": Q.round(1).tolist(), "plate": [SW, SH],
           "button_plate_box": [BCX - BW / 2, BCY - BH / 2, BCX + BW / 2, BCY + BH / 2], "change": "beat 4 screen composite only; all else = v3"}
    (V.QC / "build-v3.1.json").write_text(json.dumps(rec, indent=1)); print(json.dumps(rec, indent=1))
