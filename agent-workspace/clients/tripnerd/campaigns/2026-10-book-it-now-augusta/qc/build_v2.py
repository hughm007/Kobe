#!/usr/bin/env python3
"""TripNerd 'Book It Now' (Augusta) Reel v2 DRAFT (repairs to Skeptic Pass 3 on v1: banner shot dropped; mask-based screen composite;
readable reply hold; golf cue at 0 s; on-screen independence line; softer temp beds; fuller keyboard). v1 notes: - 9:16 1080x1920, 30 fps, ~20 s.
Beats 1-4: Karl's Higgsfield stills (AI actor, couch skit) + DM UI rendered in code (no generated text).
Beat 4: the phone still's AI screen (unverified claims) is REPLACED by our coded DM, perspective-warped,
        with the original thumb composited back on top.
Beats 5-8: TripNerd's REAL 9 Apr Augusta-week photos (no AI), 9:16 crops = downscale only, push <= source px.
Beat 9: end card. Text = composited, never generated. Sound = synthesised UI sounds + room tone (temp)."""
import math, subprocess, sys, wave, hashlib, json
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SP = Path("/tmp/claude-0/-home-user-Kobe/7684385f-af46-5eba-9499-dc37ceef99c7/scratchpad")
IMGS = Path("/tmp/claude-0/-home-user-Kobe/7684385f-af46-5eba-9499-dc37ceef99c7/images")
WD = SP / "book_it_now"; FR = WD / "frames_v2"; OUT = WD / "out"
for p in (FR, OUT): p.mkdir(exist_ok=True)
W, H, FPS = 1080, 1920, 30
BOLD = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"; REG = str(SP / "fonts/inter_1.ttf")
F = lambda s, b=False: ImageFont.truetype(BOLD if b else REG, s)
NAVY = (32, 40, 56); BLUE = (88, 150, 233); LBLUE = (24, 160, 240); WHITE = (255, 255, 255)
GREYB = (236, 238, 242); GREYT = (120, 128, 140)
LOGO = Image.open(SP / "brand/tripnerd-logo-colour-1633x601.png").convert("RGBA")
REPLY = ("Thanks for messaging TripNerd! Augusta week with us includes a private executive home, "
         "course passes, daily hospitality and food & drink, hosted by TripNerd. "
         "Tap below and a Nerd will reply with dates and details.")
BUTTON = "Get the Augusta details"

def lum(c):
    f = lambda v: (v/255)/12.92 if v/255 <= 0.03928 else ((v/255+0.055)/1.055)**2.4
    return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2])
def contrast(a, b):
    x, y = sorted([lum(a), lum(b)], reverse=True); return (x+0.05)/(y+0.05)
def wrap(d, text, font, maxw):
    lines, cur = [], ""
    for w_ in text.split():
        t = (cur+" "+w_).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w_
    return lines + ([cur] if cur else [])

# ---------- DM UI (rendered in code; generic, TripNerd palette) ----------
def dm_screen(sw, sh, typed="", sent=False, typing_dots=False, reply=False, pressed=False, btn_center=None, top_pad=0, kb_h=0):
    """Return RGB screen image sw x sh. Layout scales with sw. btn_center=(x,y) forces the button position."""
    k = sw / 780.0
    full = Image.new("RGB", (sw, sh), WHITE)
    sh = sh - kb_h
    im = Image.new("RGB", (sw, sh), WHITE); d = ImageDraw.Draw(im)
    s = lambda v: int(round(v*k)) + 0
    d.text((s(48), s(40)), "9:41", font=F(s(34), True), fill=(20, 20, 20))
    # header
    d.line([(0, s(200)), (sw, s(200))], fill=(225, 228, 233), width=max(1, s(2)))
    d.text((s(30), s(118)), "<", font=F(s(46), True), fill=NAVY)
    av = s(92); ax, ay = s(90), s(100)
    d.ellipse([ax, ay, ax+av, ay+av], fill=BLUE)
    lw = int(av*0.86); lg = LOGO.resize((lw, int(601*lw/1633)), Image.LANCZOS)
    im.paste(lg, (ax+(av-lw)//2, ay+(av-lg.height)//2), lg)
    d.text((ax+av+s(22), s(108)), "TripNerd", font=F(s(38), True), fill=NAVY)
    d.text((ax+av+s(22), s(156)), "tripnerd", font=F(s(28)), fill=GREYT)
    y = s(250)
    if sent:
        f = F(s(40), True); t = "AUGUSTA"; tw = d.textlength(t, font=f)
        x1 = sw - s(36); x0 = x1 - int(tw) - s(64)
        d.rounded_rectangle([x0, y, x1, y+s(96)], s(48), fill=NAVY); d.text((x0+s(32), y+s(24)), t, font=f, fill=WHITE)
        assert contrast(WHITE, NAVY) >= 4.5
        y += s(96) + s(10); d.text((x1, y), "Seen", font=F(s(24)), fill=GREYT, anchor="ra"); y += s(60)
    if typing_dots:
        d.rounded_rectangle([s(36), y, s(36)+s(150), y+s(84)], s(42), fill=GREYB)
        for i in range(3): d.ellipse([s(66)+i*s(36), y+s(30), s(66)+i*s(36)+s(24), y+s(54)], fill=(160, 166, 178))
    if reply:
        f = F(s(34)); lines = wrap(d, REPLY, f, s(560)); lh = s(46)
        bh = lh*len(lines) + s(48); x0 = s(36); bw = s(620)
        if btn_center: y = int(btn_center[1] - s(48) - s(28) - bh)
        d.rounded_rectangle([x0, y, x0+bw, y+bh], s(36), fill=GREYB)
        for i, l in enumerate(lines): d.text((x0+s(30), y+s(24)+i*lh), l, font=f, fill=NAVY)
        assert contrast(NAVY, GREYB) >= 4.5
        y += bh + s(28)
        fb = F(s(36), True); tw = d.textlength(BUTTON, font=fb); bwid = int(tw) + s(80); bhei = s(96)
        if btn_center: bx0, by0 = int(btn_center[0]-bwid/2), int(btn_center[1]-bhei/2)
        else: bx0, by0 = x0, y
        fill = (64, 120, 200) if pressed else BLUE
        d.rounded_rectangle([bx0, by0, bx0+bwid, by0+bhei], s(48), fill=fill)
        d.text((bx0+bwid//2, by0+bhei//2), BUTTON, font=fb, fill=NAVY if not pressed else WHITE, anchor="mm")
        assert contrast(NAVY, BLUE) >= 4.5 and contrast(WHITE, (64, 120, 200)) >= 4.0
    # composer
    cy = sh - s(130); d.rounded_rectangle([s(30), cy, sw-s(30), cy+s(96)], s(48), outline=(215, 218, 224), width=max(1, s(3)), fill=WHITE)
    if typed:
        d.text((s(70), cy+s(48)), typed + "|", font=F(s(38), True), fill=NAVY, anchor="lm")
    else:
        d.text((s(70), cy+s(48)), "Message...", font=F(s(34)), fill=GREYT, anchor="lm")
    if top_pad:
        body = im.crop((0, s(90), sw, sh - s(150))); im.paste(Image.new("RGB", (sw, sh - s(150) - s(90)), WHITE), (0, s(90)))
        im.paste(body.crop((0, 0, sw, body.height - top_pad)), (0, s(90) + top_pad))
    full.paste(im, (0, 0))
    if kb_h:
        kd = ImageDraw.Draw(full); kd.rectangle([0, sh, sw, sh + kb_h], fill=(210, 213, 219))
        rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]; kw = (sw - 11*12) // 10; khh = (kb_h - 5*14) // 4
        for r, row in enumerate(rows):
            x = (sw - (len(row)*kw + (len(row)-1)*12)) // 2; y = sh + 14 + r*(khh + 14)
            for ch in row:
                kd.rounded_rectangle([x, y, x+kw, y+khh], 10, fill=WHITE); kd.text((x+kw//2, y+khh//2), ch, font=F(38), fill=(30, 30, 30), anchor="mm"); x += kw + 12
        y = sh + 14 + 2*(khh + 14)
        kd.rounded_rectangle([12, y, 12+kw+30, y+khh], 10, fill=(178, 182, 190)); kd.text((12+(kw+30)//2, y+khh//2), "⇧", font=F(36), fill=(30, 30, 30), anchor="mm")
        kd.rounded_rectangle([sw-12-kw-30, y, sw-12, y+khh], 10, fill=(178, 182, 190)); kd.text((sw-12-(kw+30)//2, y+khh//2), "⌫", font=F(36), fill=(30, 30, 30), anchor="mm")
        y = sh + 14 + 3*(khh + 14)
        kd.rounded_rectangle([12, y, 160, y+khh], 10, fill=(178, 182, 190)); kd.text((86, y+khh//2), "123", font=F(32), fill=(30, 30, 30), anchor="mm")
        kd.rounded_rectangle([176, y, sw-196, y+khh], 10, fill=WHITE); kd.text(((176+sw-196)//2, y+khh//2), "space", font=F(32), fill=(90, 90, 90), anchor="mm")
        kd.rounded_rectangle([sw-180, y, sw-12, y+khh], 10, fill=BLUE); kd.text((sw-96, y+khh//2), "send", font=F(32, True), fill=NAVY, anchor="mm")
    return full

# ---------- shared helpers ----------
def super_(im, text, y, size=58):
    """Brand-voice caption (Group Chat v3 style): square white plate, navy text, logo-blue bar, TRIPNERD kicker.
    Left-aligned; bottom <= 80% of height; right edge <= x 950."""
    d = ImageDraw.Draw(im); f = F(size, True); lines = wrap(d, text, f, 740); lh = int(size*1.25)
    tw = max([d.textlength(l, font=f) for l in lines] + [d.textlength("TRIPNERD", font=F(26, True))]); h = 44+44+lh*len(lines)+20
    x0 = 60; x1 = x0+16+36+int(tw)+36
    d.rectangle([x0, y, x1, y+h], fill=WHITE); d.rectangle([x0, y, x0+16, y+h], fill=LBLUE)
    d.text((x0+52, y+22), "TRIPNERD", font=F(26, True), fill=NAVY)
    for i, l in enumerate(lines): d.text((x0+52, y+66+i*lh+size//2), l, font=f, fill=NAVY, anchor="lm")
    assert contrast(NAVY, WHITE) >= 4.5
    assert y+h <= int(H*0.80), f"super bottom {y+h} in bottom-20% UI zone"
    assert x1 <= W-130, f"super right edge {x1} in right UI column"

def push_frame(base, t, z0=1.0, z1=1.06, focus=(0.5, 0.5)):
    """base: PIL image whose width >= W*z1 is NOT required; zoom is relative to fitting base to WxH.
    Crops a window of the base (never smaller than W x H source px when fit_scale<=1/z) and resizes to WxH."""
    z = z0 + (z1-z0)*t
    bw, bh = base.size; cw, ch = bw/z, bh/z
    cx, cy = focus[0]*bw, focus[1]*bh
    x0 = min(max(cx-cw/2, 0), bw-cw); y0 = min(max(cy-ch/2, 0), bh-ch)
    return base.resize((W, H), Image.LANCZOS, box=(x0, y0, x0+cw, y0+ch))

def crop916(path, x0, blur_boxes=(), y0=0):
    im = Image.open(path).convert("RGB")
    cw = int(round(im.height*9/16)) if y0 == 0 else None
    box = (x0, 0, x0+cw, im.height)
    assert box[2] <= im.width, (path, box)
    c = im.crop(box)
    for (bx0, by0, bx1, by1, r) in blur_boxes:      # third-party marks only (event logo, player photo, broadcast TV)
        reg = c.crop((bx0-x0, by0, bx1-x0, by1)).filter(ImageFilter.GaussianBlur(r))
        c.paste(reg, (bx0-x0, by0))
    return c, box

# ---------- sources ----------
couch, couch_box = crop916(IMGS/"5.webp", 150)                      # 1125x2000, TV excluded (TV x>=1545)
phone_src = np.array(Image.open(IMGS/"4.webp").convert("RGB"))
QUAD = np.float32([[823, 432], [1245, 498], [1098, 1413], [680, 1305]])   # TL TR BR BL, located 2026-10-05 (screenquad.png)
SW, SH = 780, 1624
M = cv2.getPerspectiveTransform(np.float32([[0, 0], [SW, 0], [SW, SH], [0, SH]]), QUAD)
Minv = np.linalg.inv(M)
thumb_tip = np.float32([[[960, 1222]]]); btn_screen = cv2.perspectiveTransform(thumb_tip, Minv)[0, 0]
# thumb/skin mask inside the quad (keep original pixels there)
hsv = cv2.cvtColor(phone_src, cv2.COLOR_RGB2HSV)
skin = ((hsv[..., 0] <= 22) | (hsv[..., 0] >= 170)) & (hsv[..., 1] > 45) & (hsv[..., 2] > 50)
quadmask = np.zeros(phone_src.shape[:2], np.uint8); cv2.fillConvexPoly(quadmask, QUAD.astype(np.int32), 255)
tm = (skin & (quadmask > 0)).astype(np.uint8)*255
tm = cv2.morphologyEx(tm, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)); tm = cv2.morphologyEx(tm, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(tm)
keep = np.zeros_like(tm)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] > 3000: keep[lab == i] = 255
thumb_alpha = cv2.GaussianBlur(keep, (9, 9), 0).astype(np.float32)/255.0

def phone_with_screen(pressed):
    scr = dm_screen(SW, SH, sent=True, reply=True, pressed=pressed, btn_center=(float(btn_screen[0]), float(btn_screen[1])))
    a = Image.new("L", (SW, SH), 0); ImageDraw.Draw(a).rounded_rectangle([0, 0, SW-1, SH-1], 70, fill=255)
    # warp over-sized (the quad is extended 3% outward) so the plate fully covers the screen; the real screen mask trims it
    warped = cv2.warpPerspective(np.array(scr), M_big, (phone_src.shape[1], phone_src.shape[0]), flags=cv2.INTER_LANCZOS4,
                                 borderMode=cv2.BORDER_REPLICATE)
    wa = screen_alpha[..., None]
    out = phone_src.astype(np.float32)*(1-wa) + warped.astype(np.float32)*wa
    im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    return im.crop((410, 0, 410+1125, 2000))                         # 9:16, TV excluded (x>=1645)

# real screen mask: bright/low-sat + blue UI inside the phone, closed to swallow the original UI text, NOT the thumb (skin)
_hsv = cv2.cvtColor(phone_src, cv2.COLOR_RGB2HSV)
_scr = (((_hsv[..., 2] > 170) & (_hsv[..., 1] < 50)) | ((_hsv[..., 0] > 95) & (_hsv[..., 0] < 130) & (_hsv[..., 1] > 90))).astype(np.uint8)*255
_c0 = QUAD.mean(axis=0); _roi = np.zeros_like(_scr); cv2.fillConvexPoly(_roi, (_c0 + (QUAD - _c0)*1.012).astype(np.int32), 255)
_scr = cv2.bitwise_and(_scr, _roi)
_scr = cv2.morphologyEx(_scr, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
_scr = cv2.bitwise_and(_scr, _roi)                                          # closing can't spill past the bezel
_n, _lab, _st, _ = cv2.connectedComponentsWithStats(_scr); _i = 1 + int(np.argmax(_st[1:, cv2.CC_STAT_AREA])); _scr = ((_lab == _i)*255).astype(np.uint8)
_scr = cv2.bitwise_and(_scr, cv2.bitwise_not(keep))                       # never paint over the thumb
_scr = cv2.erode(_scr, np.ones((3, 3), np.uint8))
screen_alpha = cv2.GaussianBlur(_scr, (5, 5), 0).astype(np.float32)/255.0
_c = QUAD.mean(axis=0); QUAD_BIG = _c + (QUAD - _c)*1.03
M_big = cv2.getPerspectiveTransform(np.float32([[0, 0], [SW, 0], [SW, SH], [0, SH]]), np.float32(QUAD_BIG))
cv2.imwrite(str(WD / "work/screen_alpha_v2.png"), _scr)
phone_up, phone_dn = phone_with_screen(False), phone_with_screen(True)

REAL = {
 "b6": crop916(SP/"tn_assets/IMG_1932.JPG", 384),
 "b7": crop916(SP/"tn_assets/IMG_2034.JPG", 192),
 "b8": crop916(SP/"tn_assets/IMG_2036.JPG", 192),
}

# ---------- timeline ----------
T = [("b1", 0.0, 2.2), ("b2", 2.2, 3.8), ("b3", 3.8, 7.8), ("b4", 7.8, 9.0),
     ("b6", 9.0, 11.4), ("b7", 11.4, 13.8), ("b8", 13.8, 16.6), ("b9", 16.6, 20.0)]
CAP = {"b6": "Daily hospitality", "b7": "Food & drink included", "b8": "Way better than the couch."}

def end_card():
    im = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(im)
    pl = [190, 380, 890, 660]; d.rounded_rectangle(pl, 30, fill=BLUE)
    lw = 620; lg = LOGO.resize((lw, int(601*lw/1633)), Image.LANCZOS); im.paste(lg, ((W-lw)//2, 520-lg.height//2), lg)
    d.text((60, 760), "Augusta week with TripNerd", font=F(54, True), fill=WHITE)
    items = ["Private executive home", "Course passes", "Daily hospitality", "Food & drink"]
    for i, t in enumerate(items):
        y = 860 + i*70; d.rectangle([60, y+14, 76, y+30], fill=LBLUE); d.text((96, y), t, font=F(40), fill=WHITE)
    t = "DM “AUGUSTA” to @tripnerd"; f = F(50, True); tw = d.textlength(t, font=f)
    d.rounded_rectangle([60, 1200, 60+tw+80, 1310], 55, fill=WHITE); d.text((100, 1255), t, font=f, fill=NAVY, anchor="lm")
    assert 60+tw+80 <= W-130 and contrast(NAVY, WHITE) >= 4.5 and contrast(WHITE, NAVY) >= 4.5
    disc = "TripNerd is an independent travel company, not affiliated with Augusta National or the tournament."
    fd = F(28); ls = wrap(d, disc, fd, 820)
    for i, l in enumerate(ls): d.text((60, 1360 + i*38), l, font=fd, fill=(200, 210, 225))
    assert contrast((200, 210, 225), NAVY) >= 4.5 and 1360 + len(ls)*38 <= int(H*0.80)
    return im
END = end_card()

def frame_at(t):
    for name, a, b in T:
        if a <= t < b: u = (t-a)/(b-a); break
    else: name, u = "b9", 1.0
    if name == "b1":
        im = push_frame(couch, u, 1.0, 1.10, (0.40, 0.45)); super_(im, "Augusta week. Still on the couch?", 300, 60); return im
    if name == "b2":
        tt = t-2.2; word = "AUGUSTA"; n = min(len(word), max(0, int((tt-0.1)/0.13)+1)) if tt >= 0.1 else 0
        if tt < 1.1: return push_frame(dm_screen(W, H, typed=word[:n], top_pad=120, kb_h=560), u, 1.0, 1.035, (0.5, 0.45))
        return push_frame(dm_screen(W, H, sent=True, top_pad=120, kb_h=560), u, 1.0, 1.035, (0.5, 0.45))
    if name == "b3":
        tt = t-3.8
        if tt < 0.5: return push_frame(dm_screen(W, H, sent=True, typing_dots=True, top_pad=120, kb_h=0), u, 1.0, 1.05, (0.5, 0.35))
        return push_frame(dm_screen(W, H, sent=True, reply=True, top_pad=120, kb_h=0), u, 1.0, 1.05, (0.5, 0.35))
    if name == "b4":
        base = phone_dn if t >= 8.45 else phone_up
        im = push_frame(base, u, 1.0, 1.06, (0.47, 0.62))
        if 8.45 <= t < 8.65:                                                  # tap flash (soft)
            im = Image.blend(im, Image.new("RGB", (W, H), WHITE), 0.08*(1-(t-8.45)/0.2))
        return im
    if name in REAL:
        im = push_frame(REAL[name][0], u, 1.0, 1.06, (0.5, 0.5)); super_(im, CAP[name], 300 if name != "b8" else 300, 60); return im
    return END

def audio(path, dur):
    sr = 48000; n = int(sr*dur); rng = np.random.default_rng(7); x = np.zeros(n)
    brown = np.cumsum(rng.normal(0, 1, n)); brown -= np.convolve(brown, np.ones(4800)/4800, "same"); brown /= np.abs(brown).max()+1e-9
    room = np.convolve(brown, np.ones(24)/24, "same"); room = room/(np.abs(room).max()+1e-9)*0.012   # ~-40 dBFS, low, smooth
    def env(a, b, fade=0.05):
        e = np.zeros(n); i0, i1 = int(a*sr), int(b*sr); e[i0:i1] = 1
        k = int(fade*sr); e[i0:i0+k] *= np.linspace(0, 1, k); e[i1-k:i1] *= np.linspace(1, 0, k); return e
    x += room*env(0, 9.0) + room*0.6*env(16.6, dur)
    pink = np.cumsum(rng.normal(0, 1, n)); pink -= np.convolve(pink, np.ones(2400)/2400, "same")
    pink = np.convolve(pink, np.ones(12)/12, "same"); pink /= np.abs(pink).max()+1e-9
    x += pink*0.015*env(9.0, 16.6, 0.25)                                      # soft outdoor air, ~-38 dBFS                                        # hard cut: open-air bed (synthetic noise, no voices)
    def blip(t0, f0, f1, d, amp):
        i0 = int(t0*sr); m = int(d*sr); tt = np.arange(m)/sr; f = np.linspace(f0, f1, m)
        s = np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-tt*18)*amp; x[i0:i0+m] += s[:max(0, min(m, n-i0))]
    for i in range(7): blip(2.3+i*0.13, 1800, 1700, 0.04, 0.12)              # key taps
    blip(3.3, 400, 1400, 0.25, 0.18)                                          # send
    blip(4.3, 1320, 1320, 0.35, 0.22); blip(4.42, 1760, 1760, 0.35, 0.18)      # reply ping
    blip(8.45, 900, 600, 0.08, 0.3)                                            # tap
    blip(19.2, 1320, 1320, 0.3, 0.12)                                          # end ping
    x = np.clip(x, -1, 1); pcm = (x*32767*0.8).astype(np.int16)
    with wave.open(str(path), "wb") as w_: w_.setnchannels(1); w_.setsampwidth(2); w_.setframerate(sr); w_.writeframes(pcm.tobytes())

if __name__ == "__main__":
    dur = 20.0; nfr = int(dur*FPS)
    for i in range(nfr):
        frame_at(i/FPS).save(FR/f"f{i:04d}.png", compress_level=1)
    audio(WD/"out/temp_audio.wav", dur)
    mp4 = OUT/"TN-book-it-now-augusta-v2-DRAFT.mp4"
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(WD/"out/temp_audio.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rindex("{"):meas.rindex("}")+1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(FR/"f%04d.png"), "-i", str(WD/"out/temp_audio.wav"),
                    "-c:v", "libx264", "-preset", "slow", "-b:v", "16M", "-maxrate", "18M", "-bufsize", "36M", "-pix_fmt", "yuv420p",
                    "-af", ln + ",aformat=channel_layouts=stereo", "-ac", "2", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(mp4)], check=True)
    rec = {"master": mp4.name, "sha256": hashlib.sha256(mp4.read_bytes()).hexdigest(), "frames": nfr,
           "couch_crop": couch_box, "phone_crop": [410, 0, 1535, 2000], "screen_quad": QUAD.tolist(),
           "button_screen_px": [float(btn_screen[0]), float(btn_screen[1])],
           "real": {k: {"box": v[1]} for k, v in REAL.items()}}
    (WD/"qc/build-v2.json").write_text(json.dumps(rec, indent=1)); print(json.dumps(rec, indent=1))
