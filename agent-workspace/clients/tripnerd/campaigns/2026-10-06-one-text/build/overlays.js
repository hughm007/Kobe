// One Text — composited overlay renderer (BC-42: every readable glyph is real type, never model-painted).
// Renders transparent 1080x1920 PNGs and checks every text block sits inside the Reels text band
// (y 288–1344 px, x <= 940 px; BC-28).
// Usage: [FONTS_CSS=fonts-embed.css] node overlays.js <outDir> <logo-white.png> [copy.json]
// Without FONTS_CSS the page loads Poppins + Inter from Google Fonts.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [outDir, logoPath, copyPath] = process.argv.slice(2);
if (!outDir || !logoPath) { console.error('usage: node overlays.js <outDir> <logo.png> [copy.json]'); process.exit(2); }
const copy = Object.assign({
  out: '6 of us.<br>Can you make it happen?',
  reply: 'On it.',
  sender: 'TripNerd',
  head: ['It starts with', 'one text.'],
  cta: 'DM <b>@tripnerd</b> with your group size.',
}, copyPath ? JSON.parse(fs.readFileSync(copyPath, 'utf8')) : {});

const logo = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
const fontsCss = process.env.FONTS_CSS
  ? `<style>${fs.readFileSync(process.env.FONTS_CSS, 'utf8')}</style>`
  : '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=Poppins:wght@600;700;800&display=block">';

const NAVY = '#07283d', BLUE = '#2ea3f2', GOLD = '#e6a310';
const base = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1080px;height:1920px;background:transparent;overflow:hidden}
  body{position:relative;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
  .t{position:absolute}
  .bub{border-radius:46px;padding:28px 40px;font-weight:600;font-size:46px;line-height:1.18;
       box-shadow:0 14px 34px rgba(0,0,0,.38)}
  .out{right:140px;top:690px;max-width:720px;background:${BLUE};color:#fff;border-bottom-right-radius:12px}
  .in{left:60px;top:930px;display:flex;align-items:flex-end;gap:20px}
  .ava{width:104px;height:104px;border-radius:52px;background:${NAVY};display:flex;align-items:center;
       justify-content:center;box-shadow:0 10px 26px rgba(0,0,0,.35);border:3px solid rgba(255,255,255,.9);flex:none}
  .ava img{width:84px;height:auto;display:block}
  .col{display:flex;flex-direction:column;gap:10px}
  .name{font-weight:700;font-size:32px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6);padding-left:8px}
  .inb{background:#fff;color:${NAVY};border-bottom-left-radius:12px;font-weight:800;font-size:52px}
  .dots{display:flex;gap:16px;align-items:center;height:62px}
  .dots i{width:20px;height:20px;border-radius:10px;background:#8fa3b3;display:block}
  .end{left:96px;top:560px;width:820px}
  .end img{width:380px;display:block}
  .bar{width:120px;height:10px;background:${GOLD};border-radius:5px;margin:44px 0 40px}
  .head{font-family:Poppins,sans-serif;font-weight:800;font-size:96px;line-height:1.04;color:#fff;letter-spacing:-1px}
  .cta{margin-top:44px;font-weight:600;font-size:46px;line-height:1.25;color:#fff}
  .cta b{color:${BLUE};font-weight:800}
  .scrim{left:0;top:0;width:1080px;height:1920px;
         background:linear-gradient(180deg,rgba(7,40,61,.50) 0%,rgba(7,40,61,.86) 30%,rgba(7,40,61,.86) 62%,rgba(7,40,61,.55) 100%)}
`;
const html = (body) => `<!doctype html><html><head><meta charset="utf-8">${fontsCss}<style>${base}</style></head><body>${body}</body></html>`;
const inMsg = (inner) => `<div class="t in"><div class="ava"><img src="${logo}"></div><div class="col"><div class="name">${copy.sender}</div>${inner}</div></div>`;

const layers = {
  'b1': html(`<div class="t bub out" data-text>${copy.out}</div>`),
  'dots': html(inMsg(`<div class="bub inb" data-text><div class="dots"><i></i><i></i><i></i></div></div>`)),
  'b2': html(inMsg(`<div class="bub inb" data-text>${copy.reply}</div>`)),
  'end': html(`<div class="t end" data-text><img src="${logo}"><div class="bar"></div><div class="head">${copy.head.join('<br>')}</div><div class="cta">${copy.cta}</div></div>`),
  'scrim': html(`<div class="t scrim"></div>`),
};

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  let fails = 0, checks = 0;
  for (const [name, doc] of Object.entries(layers)) {
    await page.setContent(doc, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const fam = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
    // the whole incoming row (avatar + name + bubble) counts as the text block
    const boxes = await page.$$eval('[data-text], .in', els => els.map(e => {
      const r = e.getBoundingClientRect(); return { cls: e.className, top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    }));
    for (const b of boxes) {
      checks++;
      const ok = b.top >= 288 && b.bottom <= 1344 && b.right <= 940 && b.left >= 0;
      if (!ok) fails++;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${name} [${b.cls}] y ${b.top.toFixed(0)}–${b.bottom.toFixed(0)} x ${b.left.toFixed(0)}–${b.right.toFixed(0)}`);
    }
    if (name !== 'scrim' && !fam.some(f => /Inter|Poppins/.test(f))) { console.log(`FAIL ${name} fonts not loaded: ${fam}`); fails++; }
    await page.screenshot({ path: path.join(outDir, `ov_${name}.png`), omitBackground: true });
  }
  await browser.close();
  console.log(`text-band check: ${checks - fails}/${checks} pass`);
  process.exit(fails ? 1 : 0);
})();
