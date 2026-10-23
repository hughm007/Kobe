"""Builds the approval page (storyboard + animatic + decisions) with every image embedded.
Usage: python3 page.py <render-out-dir> <template.html> <output.html> [skeptic.txt]
"""
import base64, html, io, json, sys
from pathlib import Path
from PIL import Image

out, tpl, dst = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
skeptic = Path(sys.argv[4]).read_text() if len(sys.argv) > 4 else 'Pass 1 not yet returned.'

def jpg(p, w=540, q=78):
    im = Image.open(p).convert('RGB')
    im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

def png(p, w=300):
    im = Image.open(p)
    im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

boards = {p.stem: jpg(p) for p in sorted((out / 'boards').glob('*.jpg'))}
overlays = {p.stem: png(p) for p in sorted((out / 'overlays').glob('*.png'))}

page = tpl.read_text()
page = page.replace('/*BOARDS*/{}', json.dumps(boards))
page = page.replace('<!--OVERLAYS-->', '\n'.join(
    f'<figure class="ov"><img src="{u}" alt="Overlay {html.escape(k)}" loading="lazy"><figcaption>{html.escape(k)}.png</figcaption></figure>'
    for k, u in overlays.items()))
page = page.replace('<!--SKEPTIC-->', html.escape(skeptic))
dst.write_text(page)
print(dst, round(len(page) / 1024), 'KB')
