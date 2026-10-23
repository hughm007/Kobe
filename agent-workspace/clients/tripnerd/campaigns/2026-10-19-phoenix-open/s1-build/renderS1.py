# TripNerd Phoenix S1 "From our seats": real footage only, 13.0 s, 9:16, beat grid 120 BPM (hit at 3.0 s).
#   0.0-3.0  V03 real bunker shot (swing -> splash -> backspin)      "This is the 16th."
#   3.0-5.0  V01 guests at the shaded rail                            "Watched from our seats."   (DRAFT claim)
#   5.0-7.5  P02 guest at the rail, thumbs up (cropped, marks covered) "Your group, rail side."     (DRAFT claim)
#   7.5-9.5  P08 group at the rail, 2024                              "We've hosted here before." (DRAFT claim)
#   9.5-13.0 approved end card (animated)
# TripNerd badge (real logo from the approved end card) on screen 0.3-9.5 s for brand awareness.
import subprocess, sys, json, numpy as np
sys.path.insert(0, 'real')
import render2 as r, despeck
from PIL import Image, ImageDraw, ImageFilter
FF = r.FF; W, H = r.W, r.H; SP = r.SP
NAVY = (14, 22, 36)

def badge():
    ec = Image.open(SP + 'endcards/TripNerd_endcard_CameraRoll_9x16.jpg').convert('RGB').crop((130, 560, 950, 860))
    b = ec.resize((300, round(300 * ec.size[1] / ec.size[0])), Image.LANCZOS).convert('RGBA')
    m = Image.new('L', b.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, b.size[0] - 1, b.size[1] - 1), 22, fill=255)
    b.putalpha(m)
    sh = Image.new('RGBA', (b.size[0] + 40, b.size[1] + 40), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((20, 24, b.size[0] + 20, b.size[1] + 24), 22, fill=(0, 0, 0, 110))
    sh = sh.filter(ImageFilter.GaussianBlur(8)); sh.alpha_composite(b, (20, 20))
    return sh
BADGE = badge()

def put_badge(f, i, start=9):
    if i < start: return f
    a = min(1.0, (i - start + 1) / 6)
    img = Image.fromarray(f).convert('RGBA'); bb = BADGE.copy()
    if a < 1: bb.putalpha(bb.split()[3].point(lambda v: int(v * a)))
    img.alpha_composite(bb, (40, 290)); return np.asarray(img.convert('RGB'))

def still_frame(img, box_y, size):
    base = Image.new('RGB', (W, H), NAVY); p = img.resize(size, Image.LANCZOS); base.paste(p, (0, box_y)); return np.asarray(base)

def build(out):
    # 1) real bunker shot, 2.47 s -> 5.47 s (contact ~0.4 s, ball lands ~1.8 s, spins back ~2.4 s)
    F = r.read('V03', 2.47, 90); F, band = r.paint_out(F, 100, 950, 3)
    s1 = [despeck.despeck(f, int(t) - 3, int(b) + 4) for f, (t, b) in zip(F, band)]
    s1 = [r.put_text(f, 'This is the 16th.', 118, i - 9, 860) if i >= 9 else f for i, f in enumerate(s1)]
    # 2) hit at 3.0 s: hard cut to the real rail
    s2, _ = r.paint_out(r.read('V01', 0.0, 60), 900, 1150, 3, minrun=6)
    s2 = [r.put_text(f, 'Watched from our seats.', 104, i, 720) for i, f in enumerate(s2)]
    # 3) P02 guest at the rail (crop above the rail card; wall logos, swoosh and bottle label covered)
    p = Image.open('p02_clean.png').convert('RGB').crop((0, 0, 800, 600))
    base = still_frame(p, 420, (1080, 810))
    s3 = [r.put_text(r.punch(base, 1.0 if i < 38 else 1.1, 540, 825), 'Your group, rail side.', 96, i, 1345) for i in range(75)]
    # 4) P08 group at the rail, proven 2024 (same moment as P09's "2024" board)
    p8 = Image.open(SP + 'grok/pack/photos/P08.jpg').convert('RGB').crop((380, 900, 1260, 2000))
    b8 = Image.fromarray(still_frame(p8, 330, (1080, 1350))); d = ImageDraw.Draw(b8)
    from PIL import ImageFont
    fnt = ImageFont.truetype(r.FONT, 40); tb = fnt.getbbox('2024'); d.text((1040 - (tb[2] - tb[0]) - tb[0], 470 - tb[1]), '2024', font=fnt, fill=(255, 255, 255))
    b8 = np.asarray(b8)
    s4 = [r.put_text(r.punch(b8, 1.0 if i < 30 else 1.08, 540, 1005), "We've hosted here before.", 96, i, 1250) for i in range(60)]
    # 5) end card
    s5 = r.end_frames(105)
    body = s1 + s2 + s3 + s4
    body = [put_badge(f, i) for i, f in enumerate(body)]
    seq = body + s5
    p_ = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for f in seq: p_.stdin.write(np.ascontiguousarray(f).tobytes())
    p_.stdin.close(); p_.wait()
    json.dump({'frames': len(seq), 'total_s': len(seq) / 30, 'cuts_s': [3.0, 5.0, 7.5, 9.5], 'punch_s': [6.27, 8.5]}, open(out + '.json', 'w'))
    print(len(seq), 'frames', len(seq) / 30, 's')

if __name__ == '__main__':
    build(sys.argv[1])
