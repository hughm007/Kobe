#!/usr/bin/env python3
"""TripNerd 'The Group Chat' Reel - storyboard frames v1 (1080x1920). No AI, no generation.
Chat UI is drawn in code (generic messenger, TripNerd palette; NOT Apple's look: outgoing bubbles navy/white,
incoming white/navy, initial circles, no photo avatars). Real stills via photos_fanexp.panel (downscale only, conventional grade).
Emoji dropped from rendered text (no colour-emoji font here)."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
SP = Path("/tmp/claude-0/-home-user-Kobe/7684385f-af46-5eba-9499-dc37ceef99c7/scratchpad")
sys.path.insert(0, str(SP / "static_vip")); import photos_fanexp as PH
PH.OUT = SP / "group_chat/photos"; PH.SOURCES["IMG_1907"] = SP / "static_hosts/photos_v3/clean2_IMG_1907.png"
OUT = SP / "group_chat/frames"
W, H = 1080, 1920
BOLD = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"; REG = str(SP / "fonts/inter_1.ttf")
NAVY = (32, 40, 56); BLUE = (88, 150, 233); LBLUE = (24, 160, 240); WHITE = (255, 255, 255)
CHATBG = (238, 242, 247); GREY = (96, 106, 122)
LOGO = Image.open(SP / "brand/tripnerd-logo-colour-1633x601.png").convert("RGBA")
F = lambda s, b=False: ImageFont.truetype(BOLD if b else REG, s)
PEOPLE = {"A": ("Mike", (88, 150, 233)), "B": ("Dan", (24, 160, 240)), "C": ("Jess", (120, 132, 150)), "D": ("Rob", (60, 72, 96))}

def lum(c):
    f = lambda v: (v/255)/12.92 if v/255 <= 0.03928 else ((v/255+0.055)/1.055)**2.4
    return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2])
def contrast(a, b):
    x, y = sorted([lum(a), lum(b)], reverse=True); return (x+0.05)/(y+0.05)

def wrap(d, text, font, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur+" "+w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    return lines + ([cur] if cur else [])

def chat_base():
    im = Image.new("RGB", (W, H), CHATBG); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 330], fill=NAVY)                       # header (status-bar area + group bar)
    d.text((W//2, 255), "Golf trip", font=F(46, True), fill=WHITE, anchor="mm")
    d.text((W//2, 300), "Mike, Dan, Jess, Rob", font=F(26), fill=(200, 210, 225), anchor="mm")
    for i, k in enumerate("ABCD"):                               # initial circles, no photos
        x = 90 + i*52; d.ellipse([x-26, 229, x+26, 281], fill=PEOPLE[k][1], outline=NAVY, width=4)
        d.text((x, 255), PEOPLE[k][0][0], font=F(26, True), fill=WHITE if contrast(WHITE, PEOPLE[k][1]) >= 3 else NAVY, anchor="mm")
    return im

def bubble(im, y, who, text, me=False, size=60):
    d = ImageDraw.Draw(im); f = F(size, False); maxw = 700
    lines = wrap(d, text, f, maxw); lh = int(size*1.3)
    tw = max(d.textlength(l, font=f) for l in lines); bw = int(tw)+64; bh = lh*len(lines)+44
    if me:
        x1 = W-60; x0 = x1-bw; fill, tc = NAVY, WHITE
    else:
        x0 = 150; x1 = x0+bw; fill, tc = WHITE, NAVY
        d.ellipse([60, y+bh-70, 124, y+bh-6], fill=PEOPLE[who][1])
        d.text((92, y+bh-38), PEOPLE[who][0][0], font=F(30, True), fill=WHITE, anchor="mm")
        d.text((x0+8, y-40), PEOPLE[who][0], font=F(30), fill=GREY)
        y += 0
    d.rounded_rectangle([x0, y, x1, y+bh], 34, fill=fill)
    for i, l in enumerate(lines):
        d.text((x0+32, y+22+i*lh), l, font=f, fill=tc)
    assert contrast(tc, fill) >= 4.5
    return y+bh+(30 if me else 70)

def super_(im, text, y=1330, size=58):
    d = ImageDraw.Draw(im); f = F(size, True); lines = wrap(d, text, f, 860); lh = int(size*1.25)
    tw = max(d.textlength(l, font=f) for l in lines); h = lh*len(lines)+48
    x0 = (W-tw)//2-40; d.rounded_rectangle([x0, y, x0+tw+80, y+h], 24, fill=BLUE)
    for i, l in enumerate(lines): d.text((W//2, y+24+i*lh+size//2), l, font=f, fill=NAVY, anchor="mm")
    assert contrast(NAVY, BLUE) >= 4.5

def label(im, tag):
    d = ImageDraw.Draw(im); d.rounded_rectangle([40, 1700, 1040, 1860], 20, fill=(0, 0, 0))
    d.text((W//2, 1780), tag, font=F(30, True), fill=WHITE, anchor="mm")

MSGS = [("A", "Golf trip this spring. We doing it?", True), ("B", "IN", False), ("C", "in", False),
        ("D", "100% in", False), ("A", "ok who's booking", True)]

TOP, BOTTOM = 360, 1440          # chat window (keeps content out of the Reels bottom UI)
class Tall:
    def __init__(self): self.im = Image.new("RGB", (W, 6000), CHATBG); self.y = 80
def finish(t, extra_h=0):
    """Paste the tall chat canvas into the frame so its last content ends at BOTTOM (scrolls like a real thread)."""
    im = chat_base(); end = t.y + extra_h; off = max(0, end - (BOTTOM - TOP))
    win = t.im.crop((0, off, W, off + (H - TOP))); im.paste(win, (0, TOP))
    ImageDraw.Draw(im).rectangle([0, 0, W, 330], fill=NAVY); hdr = chat_base().crop((0, 0, W, 331)); im.paste(hdr, (0, 0))
    return im, off
def chat(n_msgs, extra=None):
    t = Tall()
    for who, tx, me in MSGS[:n_msgs]: t.y = bubble(t.im, t.y, who, tx, me)
    return t

frames = {}
im, _ = finish(chat(1)); frames["F01"] = (im, "F1  0.0-1.2 s  Hook H1 - chat opens")
im, _ = finish(chat(4)); frames["F02"] = (im, "F2  1.2-2.8 s  Three replies stack")
im, _ = finish(chat(5)); frames["F03"] = (im, "F3  2.8-3.6 s  'ok who's booking'")
t = chat(5); y = t.y; d = ImageDraw.Draw(t.im)
d.text((W-60, y-14), "Seen by 3", font=F(30), fill=GREY, anchor="ra")
d.rounded_rectangle([150, y+50, 320, y+140], 45, fill=WHITE)
for i in range(3): d.ellipse([182+i*44, y+80, 210+i*44, y+108], fill=(160, 168, 182))
t.y = y + 160
im, off = finish(t); super_(im, "Seen by 3. Nobody's booking.", y=TOP + (y + 190 - off), size=64)
frames["F04"] = (im, "F4  3.6-5.0 s  Seen by 3 - typing stops (H3 super)")
MSGS.append(("A", "...hotel? where do we even sit??", True))
im, _ = finish(chat(6)); frames["F05"] = (im, "F5  5.0-6.4 s  Version A line (B: '...food? who's meeting us there??')")
t = chat(6); t.y = bubble(t.im, t.y, "A", "found one.", True); y = t.y; d = ImageDraw.Draw(t.im)
card = [W-60-620, y, W-60, y+360]; d.rounded_rectangle(card, 30, fill=NAVY)
d.rounded_rectangle([card[0]+20, card[1]+20, card[2]-20, card[1]+240], 20, fill=BLUE)
lw = 460; lg = LOGO.resize((lw, int(601*lw/1633)), Image.LANCZOS); t.im.paste(lg, (card[0]+(620-lw)//2, card[1]+130-lg.height//2), lg)
d.text((card[0]+32, card[1]+262), "TripNerd", font=F(36, True), fill=WHITE)
d.text((card[0]+32, card[1]+310), "tripnerd.com", font=F(28), fill=(200, 210, 225))
t.y = card[3] + 20; im, _ = finish(t)
frames["F06"] = (im, "F6  6.4-7.4 s  'found one.' + link card (BC-19 owed)")

im = Image.new("RGB", (W, H), (60, 70, 86)); d = ImageDraw.Draw(im)
d.rounded_rectangle([60, 520, 1020, 1400], 30, outline=LBLUE, width=6)
for i, tx_ in enumerate(["AI BRIDGE SHOT (Higgsfield)", "Generic fairway at dawn, mist,", "slow forward dolly, 1.5 s.", "No people, flags, signage or", "recognisable hole. AI label ON.", "PENDING STORYBOARD + SPEND APPROVAL"]):
    d.text((W//2, 700+i*90), tx_, font=F(38 if i in (0, 5) else 40, i in (0, 5)), fill=WHITE, anchor="mm")
frames["F06b"] = (im, "F6.5  7.4-8.9 s  AI bridge - not generated")

def photo_frame(name, crop, ymin, preset, text, tag, out):
    im = Image.new("RGB", (W, H), NAVY)
    pw, ph = 1080, 760
    p, rec = PH.panel(name, crop, (pw, ph), out, y_min=ymin, anchor="top", preset=preset)
    im.paste(Image.open(p).convert("RGB"), (0, 470)); super_(im, text, y=1290, size=62)
    return im, rec
im, r7 = photo_frame("IMG_1907", (0, 1160, 1262, 2048), 1150, "c2", "Someone's expecting you.", "", "gc-F07-photo.png"); frames["F07"] = (im, "F7  8.9-10.6 s  REAL IMG_1907 (EV-008), push-in in edit")
im, r8 = photo_frame("IMG_1998", (0, 1180, 1233, 2048), 1105, "c4", "Lunch? Already out.", "", "gc-F08-photo.png"); frames["F08"] = (im, "F8  10.6-12.2 s  REAL IMG_1998 (EV-007), slow pan in edit")

def pending(text, src):
    im = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 470, 1080, 1230], 0, fill=(44, 56, 80), outline=LBLUE, width=6)
    d.text((W//2, 800), "REAL FOOTAGE TO COME", font=F(44, True), fill=WHITE, anchor="mm")
    d.text((W//2, 870), src, font=F(34), fill=WHITE, anchor="mm")
    if text: super_(im, text, y=1290, size=62)
    return im
frames["F09"] = (pending("This is where you sit.", "V24 0-2 s - backs at the rail (Taylor's original)"), "F9  12.2-14.2 s  REAL rail view (EV-006) - pending")
frames["F10"] = (pending("Shh.", "V24 8.6-10.5 s - the hush, calm beat"), "F10  14.2-15.6 s  REAL hush - pending")
frames["F11"] = (pending("", "V24 14.9-16.4 s + V08 audio - THE ROAR"), "F11  15.6-17.4 s  REAL roar, no text - pending")

im = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(im)
pl = [190, 420, 890, 700]; d.rounded_rectangle(pl, 30, fill=BLUE)
lw = 620; lg = LOGO.resize((lw, int(601*lw/1633)), Image.LANCZOS); im.paste(lg, ((W-lw)//2, 560-lg.height//2), lg)
yb = bubble(im, 820, "A", "Bringing the group chat?", True, size=66)
d.text((W//2, yb+90), "Trip like a Nerd.", font=F(64, True), fill=WHITE, anchor="mm")
f = F(52, True); t = "Plan yours · link in bio"; tw = d.textlength(t, font=f)
d.rounded_rectangle([(W-tw)//2-40, yb+190, (W+tw)//2+40, yb+290], 50, fill=WHITE)
d.text((W//2, yb+240), t, font=f, fill=NAVY, anchor="mm")
frames["F12"] = (im, "F12  17.4-19.0 s  End card (BC-19 owed)")

for k, (im, tag) in frames.items():
    im.save(OUT / f"group-chat-v1-{k}.png")
# contact strip with labels
tw_, th_ = 270, 480; cols = 7; rows = 2
sheet = Image.new("RGB", (cols*(tw_+12)+12, rows*(th_+70)+12), (245, 245, 245)); sd = ImageDraw.Draw(sheet)
for i, (k, (im, tag)) in enumerate(frames.items()):
    x = 12+(i % cols)*(tw_+12); y = 12+(i//cols)*(th_+70)
    sheet.paste(im.resize((tw_, th_), Image.LANCZOS), (x, y))
    sd.text((x, y+th_+6), tag.split("  ")[0]+"  "+tag.split("  ")[1], font=F(18, True), fill=NAVY)
    sd.text((x, y+th_+30), tag.split("  ")[2][:34], font=F(15), fill=GREY)
sheet.save(OUT / "group-chat-v1-storyboard-strip.png")
import json; json.dump({"F07": r7, "F08": r8}, open(OUT / "photo-panels.json", "w"), indent=1)
print("frames:", len(frames))
