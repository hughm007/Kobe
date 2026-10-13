"""Build TripNerd event carousels (1080x1350) from real TripNerd photos.
Text is typographic (HTML), the logo is the approved file composited unaltered."""
import os, subprocess, sys, html
D = os.path.dirname(os.path.abspath(__file__))
PREP = os.path.join(D, 'prep'); OUT = os.path.join(D, 'final'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
FONTS = os.path.join(D, 'fonts')

CSS = f"""
@font-face{{font-family:IS;src:url(file://{FONTS}/instrument-2.ttf)}}
@font-face{{font-family:IS;font-style:italic;src:url(file://{FONTS}/instrument-1.ttf)}}
@font-face{{font-family:Jost;font-weight:400;src:url(file://{FONTS}/jost-1.ttf)}}
@font-face{{font-family:Jost;font-weight:500;src:url(file://{FONTS}/jost-2.ttf)}}
@font-face{{font-family:Jost;font-weight:600;src:url(file://{FONTS}/jost-3.ttf)}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1350px;overflow:hidden;background:#062a1c}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;color:#ecf9f0;font-family:Jost}}
.bg{{position:absolute;inset:0;background-size:cover}}
.tint{{position:absolute;inset:0;background:#0b3a26;mix-blend-mode:multiply;opacity:.38}}
.grad{{position:absolute;inset:0}}
.frame{{position:absolute;inset:40px;border:1px solid rgba(236,249,240,.38)}}
.logo{{position:absolute;left:80px;top:80px;width:205px}}
.pg{{position:absolute;right:83px;top:84px;font:500 21px Jost;letter-spacing:.2em;color:#b9d2c0}}
.url{{position:absolute;right:83px;bottom:84px;font:500 21px Jost;letter-spacing:.22em;color:#d6e4db}}
.cta{{position:absolute;left:80px;bottom:84px;font:600 20px Jost;letter-spacing:.22em;color:#f3e844}}
.y{{color:#f3e844}} .i{{font-style:italic}}
.h{{font-family:IS;font-weight:400;line-height:.92;letter-spacing:-.01em}}
.meta{{position:absolute;left:80px;bottom:128px;font:400 27px Jost;letter-spacing:.2em;line-height:38px;text-transform:uppercase}}
.meta b{{font-weight:600;letter-spacing:.24em}}
.side{{position:absolute;right:83px;font:500 17px Jost;letter-spacing:.24em;color:#ecf9f0}}
.lab{{font:600 22px Jost;letter-spacing:.24em;color:#f3e844;padding-bottom:16px;border-bottom:1px solid rgba(236,249,240,.3);margin-bottom:20px}}
.val{{font-family:IS;font-size:48px;line-height:1.08}}
.box{{display:inline-block;border:1.5px solid #ecf9f0;padding:22px 30px;font:600 22px Jost;letter-spacing:.26em}}
.small{{font:500 16px Jost;letter-spacing:.2em;color:#a8c2b2}}
"""

def esc(s): return html.escape(s).replace('\n', '<br>')

def rich(s):
    # *text* -> yellow italic
    out = []; parts = s.split('*')
    for k, p in enumerate(parts):
        p = esc(p)
        out.append(f'<span class="y i">{p}</span>' if k % 2 else p)
    return ''.join(out)

def base(img, pos, grad, frame=False, size='cover'):
    return (f'<div class="bg" style="background-image:url(file://{PREP}/{img}.jpg);background-position:{pos};background-size:{size}"></div>'
            f'<div class="tint"></div><div class="grad" style="background:{grad}"></div>'
            + ('<div class="frame"></div>' if frame else '')
            + f'<img class="logo" src="file://{PREP}/logo.png">')

G_BOTTOM = 'linear-gradient(180deg,rgba(4,30,20,.55) 0%,rgba(4,30,20,.05) 22%,rgba(4,30,20,.10) 45%,rgba(4,36,24,.86) 72%,rgba(4,36,24,.97) 100%)'
G_COVER = 'linear-gradient(180deg,rgba(4,30,20,.55) 0%,rgba(4,30,20,.25) 30%,rgba(4,36,24,.55) 55%,rgba(4,36,24,.92) 85%,rgba(4,36,24,.98) 100%)'
G_FULL = 'linear-gradient(180deg,rgba(6,42,28,.78),rgba(6,42,28,.86) 60%,rgba(5,36,24,.96))'

def cover(e, n, tot):
    return base(*e['cover'][:2], G_COVER, size=(e['cover'][2] if len(e['cover'])>2 else 'cover')) + f'''
<div class="pg">01 / {tot:02d}</div>
<div class="h y" style="position:absolute;left:76px;top:560px;font-size:{e.get('cover_size',172)}px">{esc(e['place'])},<br>in {esc(e['month'])}.</div>
<div class="side" style="top:{e.get('side_top',1000)}px">NOW BOOKING {e['year']}</div>
<div class="meta"><b>TRIPNERD · FAN EXPERIENCES</b><br>[{esc(e['month']).upper()} DATES, {e['year']}]<br>{esc(e['city'])}</div>
<div class="url">TRIPNERD.COM</div>'''

def hook(e, n, tot):
    return base(*e['hook'][:2], G_BOTTOM, frame=True, size=(e['hook'][2] if len(e['hook'])>2 else 'cover')) + f'''
<div class="pg">{n:02d} / {tot:02d}</div>
<div style="position:absolute;left:100px;right:100px;bottom:190px">
 <div class="h" style="font-size:{e.get('hook_size',100)}px">{rich(e['hook_line'])}</div>
 <div style="font:400 32px Jost;margin-top:30px">{esc(e['hook_sub'])}</div></div>
<div class="url">TRIPNERD.COM</div>'''

def included(e, n, tot):
    cells = ''.join(f'<div><div class="lab">{esc(a)}</div><div class="val">{esc(b)}</div></div>' for a, b in e['included'])
    return base(*e['incl'][:2], G_FULL) + f'''
<div class="pg">{n:02d} / {tot:02d}</div>
<div class="h i" style="position:absolute;left:80px;top:255px;font-size:112px">What&#8217;s included</div>
<div style="position:absolute;left:80px;right:80px;top:432px;display:grid;grid-template-columns:1fr 1fr;column-gap:64px;row-gap:56px">{cells}</div>
<div style="position:absolute;left:80px;bottom:190px"><div class="box">{esc(e['month']).upper()} {e['year']} · [DATES]</div>
<div class="small" style="margin-top:28px">DETAILS CONFIRMED AT BOOKING</div></div>
<div class="cta">CHECK YOUR DATES · LINK IN BIO</div><div class="url">TRIPNERD.COM</div>'''

def proof(e, n, tot):
    return base(*e['proof'][:2], G_BOTTOM, frame=True) + f'''
<div class="pg">{n:02d} / {tot:02d}</div>
<div style="position:absolute;left:100px;right:100px;bottom:190px">
 <div class="h" style="font-size:96px">{rich(e['proof_line'])}</div>
 <div style="margin-top:34px;border-left:1.5px solid rgba(236,249,240,.5);padding-left:26px">
  <div class="h i" style="font-size:40px;line-height:1.18">&#8220;[Real customer quote, verbatim from a Google review, with permission]&#8221;</div>
  <div class="small" style="margin-top:14px">[NAME] · [EVENT] · [YEAR]</div></div></div>
<div class="url">TRIPNERD.COM</div>'''

def corporate(e, n, tot):
    return base(*e['corp'][:2], G_BOTTOM, size=(e['corp'][2] if len(e['corp'])>2 else 'cover')) + f'''
<div class="pg">{n:02d} / {tot:02d}</div>
<div style="position:absolute;left:80px;right:90px;bottom:300px">
 <div class="h y" style="font-size:118px">Bring the clients<br>who matter.</div>
 <div style="font:400 30px Jost;line-height:1.4;margin-top:30px">Corporate hospitality for the people you need to impress.<br>One call, every seat handled.</div></div>
<div class="meta" style="bottom:128px;font-size:22px;line-height:34px"><b>CORPORATE HOSPITALITY</b><br>{esc(e['city'])}</div>
<div class="cta">PLAN YOUR GROUP · LINK IN BIO</div><div class="url">TRIPNERD.COM</div>'''

def endcard(e, n, tot):
    return base(*e['end'][:2], G_FULL) + f'''
<div class="pg">{n:02d} / {tot:02d}</div>
<div style="position:absolute;left:80px;right:80px;top:430px">
 <div class="h" style="font-size:136px">Your {esc(e['month'])},<br><span class="y i">handled.</span></div>
 <div style="font:400 32px Jost;line-height:1.45;margin-top:40px;max-width:820px">Tell us the trip and how many are coming. We&#8217;ll send the options.</div></div>
<div style="position:absolute;left:80px;bottom:200px">
 <div style="font:600 64px Jost;letter-spacing:.06em;color:#f3e844">tripnerd.com</div>
 <div style="font:500 24px Jost;letter-spacing:.2em;margin-top:18px">TAP THE LINK IN BIO · OR SEND US A DM</div></div>
<div class="cta" style="color:#b9d2c0;font-weight:500">SEND THIS TO WHO YOU&#8217;D BRING</div><div class="url">@TRIPNERD</div>'''

T = {'cover': cover, 'hook': hook, 'included': included, 'proof': proof, 'corporate': corporate, 'end': endcard}

def render(e):
    tot = len(e['slides']); files = []
    for k, kind in enumerate(e['slides'], 1):
        body = T[kind](e, k, tot)
        h = f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="s">{body}</div></body></html>'
        hp = os.path.join(D, 'html', f"{e['slug']}-{k:02d}.html"); os.makedirs(os.path.dirname(hp), exist_ok=True)
        open(hp, 'w').write(h)
        png = os.path.join(OUT, f"TripNerd-{e['slug']}-{k:02d}-{kind}.png")
        subprocess.run([CHROME, '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
                        '--force-device-scale-factor=1', '--window-size=1080,1350', '--virtual-time-budget=3000',
                        f'--screenshot={png}', f'file://{hp}'], check=True, capture_output=True)
        files.append(png)
    return files

if __name__ == '__main__':
    import json
    events = json.load(open(os.path.join(D, 'events.json')))
    only = sys.argv[1:]
    for e in events:
        if only and e['slug'] not in only: continue
        print(e['slug'], len(render(e)))
