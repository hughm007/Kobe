# Re-sets the hosting spot's opening overlays on a new 1920x1080 shot: "THE PLAYERS", "VIP ON 17", real logo wordmark.
# Positions/sizes were measured from the owner's 720p export by diffing a no-title frame against a title frame, x1.5.
# Needs Montserrat-Bold.ttf (fetched from github.com/JulietaUla/Montserrat) and logo.png (official colour logo, media 46ae277a).
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
FB = 'Montserrat-Bold.ttf'
def font_for_cap(path, cap):
    for s in range(10, 140):
        f = ImageFont.truetype(path, s); bb = f.getbbox('H')
        if bb[3]-bb[1] >= cap: return f
def draw_tracked(dr, text, f, x, top, target_w, fill):
    widths = [f.getlength(c) for c in text]; nat = sum(widths)
    extra = (target_w - nat) / max(1, len(text)-1); bb = f.getbbox('H'); cx = x
    for c, w in zip(text, widths):
        dr.text((cx, top - bb[1]), c, font=f, fill=fill); cx += w + extra
txt = Image.new('RGBA', (1920, 1080), (0,0,0,0)); dr = ImageDraw.Draw(txt)
draw_tracked(dr, 'THE PLAYERS', font_for_cap(FB, 58), 66, 823, 601, (255,255,255,255))
draw_tracked(dr, 'VIP ON 17', font_for_cap(FB, 23), 72, 933, 213, (207,187,137,255))
logo = Image.open('logo.png').convert('RGBA'); la = np.array(logo)
m = (la[:,:,3] > 128) & (la[:,:,0] > 200) & (la[:,:,1] > 200) & (la[:,:,2] > 200); m[:, :560] = False; m[360:, :] = False
wys, wxs = np.where(m); wm = logo.crop((wxs.min(), wys.min(), wxs.max()+1, wys.max()+1))
ww = 283; wh = int(round(wm.height*ww/wm.width)); wm = wm.resize((ww, wh), Image.LANCZOS)
txt.alpha_composite(wm, (1843-ww, 62))
sh = Image.new('RGBA', txt.size, (0,0,0,0)); a = txt.split()[3].point(lambda v: int(v*0.55))
sh.paste((0,0,0,255), (0,3), a); sh = sh.filter(ImageFilter.GaussianBlur(3))
Image.alpha_composite(sh, txt).save('title2.png')
