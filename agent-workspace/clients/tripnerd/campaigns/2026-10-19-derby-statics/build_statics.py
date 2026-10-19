"""TripNerd Louisville (Derby) statics, 1080x1350 feed, from real Drive photos.
Concept: the photo stays clean; the copy is a race-day ticket stub dropped onto it.
Usage: python3 build_statics.py <dir with original TN_*_kentucky-derby_P###.jpg> <out dir>
Edits: crop, light contrast/colour, one non-AI blur over an official event mark (P182 cap). No person altered."""
import sys, glob, os, random
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter, ImageEnhance

SRC, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1350
MONO_B = '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf'
MONO = '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf'
LOGO = os.environ.get('TN_LOGO')                      # real TripNerd colour logo (white wordmark)
PAPER, INK = (246, 243, 234), (34, 34, 40)

# photo, crop box in source px (x0, y0, x1, y1; 4:5), ticket (x, y, width, angle), headline lines
ADS = [
    ('P185', (819, 0, 2048, 1536), (60, 720, 480, 3.0), ['STAY TILL THE', 'LIGHTS COME ON.']),
    ('P179', (0, 30, 1536, 1950), (45, 735, 480, -3.5), ["THE BUBBLY'S COLD.", "THE PLAN'S DONE."]),
    ('P182', (300, 0, 1529, 1536), (565, 760, 470, 4.0), ['HIS JACKET.', 'OUR PLAN.']),
    ('P184', (440, 0, 1669, 1536), (560, 45, 470, -4.0), ['HE PLANNED NOTHING.', 'LOOK AT HIM.']),
    ('P050', (0, 0, 1229, 1536), (560, 50, 470, 3.5), ["EVERYONE'S FILMING IT.", "YOU'RE LIVING IT."]),
]
# third-party / event marks softened with a plain blur, in output px (x0, y0, x1, y1)
MARKS = {'P179': [(615, 855, 805, 925), (440, 560, 535, 645)],
         'P184': [(0, 665, 95, 705), (795, 1300, 905, 1350)],
         'P050': [(300, 655, 400, 690), (215, 685, 285, 720)],
         'P182': [(645, 495, 720, 560)]}
LINES = [('SEATS', 'HANDLED'), ('HOTEL', 'HANDLED'), ('RIDES', 'HANDLED'), ('FOOD + DRINK', 'INCLUDED')]


def photo(pid, box):
    im = ImageOps.exif_transpose(Image.open(glob.glob(os.path.join(SRC, f'*_{pid}.jpg'))[0])).convert('RGB')
    if pid == 'P182':                                   # soften the official event mark on the cap (non-AI blur)
        r = (1055, 475, 1265, 625)
        patch = im.crop(r).filter(ImageFilter.GaussianBlur(9))
        m = Image.new('L', patch.size, 0); ImageDraw.Draw(m).ellipse((0, 0) + patch.size, fill=255)
        im.paste(patch, r[:2], m.filter(ImageFilter.GaussianBlur(10)))
    im = im.crop(box).resize((W, H), Image.LANCZOS)    # downscale only (source crop >= 1229 px wide)
    for r in MARKS.get(pid, []):
        patch = im.crop(r).filter(ImageFilter.GaussianBlur(7))
        m = Image.new('L', patch.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0) + patch.size, radius=12, fill=255)
        im.paste(patch, r[:2], m.filter(ImageFilter.GaussianBlur(5)))
    im = ImageEnhance.Contrast(im).enhance(1.06)
    return ImageEnhance.Color(im).enhance(1.05)


def ticket(width, head):
    s = width / 450
    f_s, f_m, f_h = (ImageFont.truetype(MONO_B, int(v * s)) for v in (17, 21, 46))
    f_r = ImageFont.truetype(MONO, int(21 * s))
    h = int(640 * s)
    t = Image.new('RGBA', (width, h), PAPER + (255,))
    d = ImageDraw.Draw(t)
    rnd = random.Random(width)
    for _ in range(int(width * h / 60)):                # thermal-paper grain
        x, y = rnd.randrange(width), rnd.randrange(h); g = rnd.randint(228, 240)
        d.point((x, y), fill=(g, g - 2, g - 9, 255))
    pad, y = int(30 * s), int(34 * s)
    def dash(yy):
        for x in range(pad, width - pad, int(12 * s)):
            d.line([(x, yy), (x + int(6 * s), yy)], fill=INK, width=max(1, int(2 * s)))
    d.text((pad, y), 'TRIPNERD  FAN EXPERIENCES', font=f_s, fill=INK); y += int(30 * s)
    d.text((pad, y), 'LOUISVILLE . SAT MAY 1 2027', font=f_s, fill=INK); y += int(36 * s); dash(y); y += int(22 * s)
    fs = f_h                                            # one size for both lines
    while max(d.textlength(ln, font=fs) for ln in head) > width - 2 * pad:
        fs = ImageFont.truetype(MONO_B, fs.size - 1)
    for ln in head:
        d.text((pad, y), ln, font=fs, fill=INK); y += int(56 * s)
    y += int(8 * s); dash(y); y += int(22 * s)
    for k, v in LINES:
        d.text((pad, y), k, font=f_r, fill=INK)
        vw = d.textlength(v, font=f_m); d.text((width - pad - vw, y), v, font=f_m, fill=INK)
        kw = d.textlength(k, font=f_r)
        for x in range(int(pad + kw + 8 * s), int(width - pad - vw - 8 * s), int(10 * s)):
            d.point((x, y + int(16 * s)), fill=INK)
        y += int(34 * s)
    y += int(6 * s); dash(y); y += int(20 * s)
    x = pad                                             # decorative barcode
    while x < width - pad:
        bw = rnd.choice((1, 2, 2, 3, 4)) * max(1, int(s * 1.4))
        if rnd.random() > .35: d.rectangle((x, y, x + bw - 1, y + int(52 * s)), fill=INK)
        x += bw + max(1, int(s * 1.6))
    y += int(68 * s)
    msg = 'TALK TO A NERD . TRIPNERD.COM'
    d.text(((width - d.textlength(msg, font=f_m)) / 2, y), msg, font=f_m, fill=INK)
    t = t.crop((0, 0, width, min(h, y + int(46 * s))))
    a = Image.new('L', t.size, 255); da = ImageDraw.Draw(a); z = int(9 * s)  # perforated top and bottom edges
    for x in range(0, width + z, z * 2):
        da.polygon([(x, 0), (x + z, z), (x + 2 * z, 0)], fill=0)
        da.polygon([(x, t.height), (x + z, t.height - z), (x + 2 * z, t.height)], fill=0)
    t.putalpha(a)
    ink = t.convert('RGB').filter(ImageFilter.GaussianBlur(0.35))  # slight thermal softness
    t = Image.merge('RGBA', (*ink.split(), a))
    return t


def place(canvas, t, x, y, ang):
    r = t.rotate(ang, resample=Image.BICUBIC, expand=True)
    sh = Image.new('RGBA', r.size, (0, 0, 0, 0)); sh.putalpha(r.split()[3].point(lambda v: v * 0.5))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    canvas.alpha_composite(sh, (x + 10, y + 16)); canvas.alpha_composite(r, (x, y))
    return (x, y, x + r.width, y + r.height)


def main():
    os.makedirs(OUT, exist_ok=True)
    logo = Image.open(LOGO).convert('RGBA'); lw = 250
    logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)   # scaled only
    lsh = Image.new('RGBA', logo.size, (0, 0, 0, 0)); lsh.putalpha(logo.split()[3].point(lambda v: v * 0.6))
    lsh = lsh.filter(ImageFilter.GaussianBlur(6))
    for i, (pid, box, (tx, ty, tw, ang), head) in enumerate(ADS, 1):
        c = photo(pid, box).convert('RGBA')
        lx, ly = (60, 60) if not (tx > 500 and ty < 300) else (60, 60)
        c.alpha_composite(lsh, (lx + 2, ly + 3)); c.alpha_composite(logo, (lx, ly))
        b = place(c, ticket(tw, head), tx, ty, ang)
        assert b[2] <= W + 40 and b[3] <= H + 40, (pid, b)
        name = f'TripNerd-Louisville-static-{i}-{pid}.jpg'
        c.convert('RGB').save(os.path.join(OUT, name), quality=93)
        print(name, 'ticket', b)


if __name__ == '__main__':
    main()
