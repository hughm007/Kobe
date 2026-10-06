// Be Our Guest — composited supers (BC-42: real type, never model-painted) + text-band check (BC-28:
// every text block inside y 288–1344 px, x <= 940 px on 1080x1920).
// Usage: [FONTS_CSS=fonts-embed.css] node overlays.js <outDir> <logo-white.png>
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [outDir, logoPath] = process.argv.slice(2);
const logo = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
const fontsCss = process.env.FONTS_CSS
  ? `<style>${fs.readFileSync(process.env.FONTS_CSS, 'utf8')}</style>`
  : '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800&family=Poppins:wght@700;800&display=block">';
const NAVY = '7,40,61', BLUE = '#2ea3f2', GOLD = '#e6a310';
const base = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1080px;height:1920px;background:transparent;overflow:hidden}
  body{position:relative;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;color:#fff}
  .t{position:absolute}
  .panel{background:rgba(${NAVY},.74);border-radius:30px;box-shadow:0 12px 34px rgba(0,0,0,.30)}
  .hook{left:72px;top:330px;max-width:860px;padding:30px 40px 34px}
  .pov{font-weight:800;font-size:38px;letter-spacing:6px;color:${GOLD};margin-bottom:10px}
  .hl{font-family:Poppins,sans-serif;font-weight:800;font-size:70px;line-height:1.06;letter-spacing:-.5px}
  .lab{left:72px;top:1170px;padding:20px 32px 22px}
  .lab .bar{width:64px;height:7px;background:${GOLD};border-radius:4px;margin-bottom:14px}
  .lab .tx{font-weight:800;font-size:46px;letter-spacing:9px}
  .ask{left:72px;top:880px;max-width:860px;padding:30px 40px 34px}
  .ask .q{font-family:Poppins,sans-serif;font-weight:800;font-size:80px;line-height:1.04;letter-spacing:-.5px}
  .ask .s{font-weight:600;font-size:44px;margin-top:14px}
  .end{left:96px;top:560px;width:820px}
  .end img{width:380px;display:block}
  .end .bar{width:120px;height:10px;background:${GOLD};border-radius:5px;margin:44px 0 40px}
  .end .head{font-family:Poppins,sans-serif;font-weight:800;font-size:108px;line-height:1.02;letter-spacing:-1px}
  .end .cta{margin-top:44px;font-weight:600;font-size:46px;line-height:1.25}
  .end .cta b{color:${BLUE};font-weight:800}
  .scrim{left:0;top:0;width:1080px;height:1920px;
    background:linear-gradient(180deg,rgba(${NAVY},.45) 0%,rgba(${NAVY},.85) 28%,rgba(${NAVY},.85) 62%,rgba(${NAVY},.50) 100%)}
`;
const html = (body) => `<!doctype html><html><head><meta charset="utf-8">${fontsCss}<style>${base}</style></head><body>${body}</body></html>`;
const label = (tx) => html(`<div class="t panel lab" data-text><div class="bar"></div><div class="tx">${tx}</div></div>`);
const layers = {
  hook: html(`<div class="t panel hook" data-text><div class="pov">POV:</div><div class="hl">you're our guest at The Players</div></div>`),
  suite: label('THE SUITE'),
  balcony: label('THE BALCONY'),
  seventeen: label('THE 17TH'),
  ask: html(`<div class="t panel ask" data-text><div class="q">Where would<br>you sit?</div><div class="s">Tell us in the comments.</div></div>`),
  end: html(`<div class="t end" data-text><img src="${logo}"><div class="bar"></div><div class="head">Be our<br>guest.</div><div class="cta">Plan your group's trip at <b>tripnerd.com</b></div></div>`),
  scrim: html(`<div class="t scrim"></div>`),
};

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  let fails = 0, checks = 0;
  for (const [name, doc] of Object.entries(layers)) {
    await page.setContent(doc, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const fam = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family));
    const boxes = await page.$$eval('[data-text]', els => els.map(e => {
      const r = e.getBoundingClientRect(); return { cls: e.className, top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    }));
    for (const b of boxes) {
      checks++;
      const ok = b.top >= 288 && b.bottom <= 1344 && b.right <= 940 && b.left >= 0;
      if (!ok) fails++;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${name} y ${b.top.toFixed(0)}-${b.bottom.toFixed(0)} x ${b.left.toFixed(0)}-${b.right.toFixed(0)}`);
    }
    if (name !== 'scrim' && !fam.some(f => /Inter|Poppins/.test(f))) { console.log(`FAIL ${name} fonts not loaded`); fails++; }
    await page.screenshot({ path: path.join(outDir, `ov_${name}.png`), omitBackground: true });
  }
  await browser.close();
  console.log(`text-band check: ${checks - fails}/${checks} pass`);
  process.exit(fails ? 1 : 0);
})();
