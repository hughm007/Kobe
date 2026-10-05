// Renders the Augusta menu Reel edit kit: transparent 1080x1920 text overlays and
// storyboard boards (overlay on a labelled REAL FOOTAGE placeholder).
// Usage: FONTS_CSS=fonts-embed.css node render.js <outDir> <logo.png> [scores.json]
//   scores.json (after the shoot): {"order":["chips","straws","pimento","peach","egg"],
//   "scores":{"chips":6,...},"name":"FirstName","receipt":"0.00"}  (see scores.example.json)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || 'out';
const logo = 'data:image/png;base64,' + fs.readFileSync(process.argv[3] || 'logo.png').toString('base64');
const cfg = process.argv[4] ? JSON.parse(fs.readFileSync(process.argv[4], 'utf8')) : {};
const S = cfg.scores || {};
const sc = k => (S[k] !== undefined ? S[k] : '?');
const NAME = cfg.name || '[Name]';
const RECEIPT = cfg.receipt ? '$' + cfg.receipt : '$?';

const ITEMS = {
  chips: { name: 'Chips', price: '$1.50' },
  straws: { name: 'Cheese straws', price: '$2.50' },
  pimento: { name: 'Pimento cheese', price: '$1.50' },
  peach: { name: 'Peach ice cream sandwich', price: '$3' },
  egg: { name: 'Egg salad', price: '$1.50' },
};
const ORDER = cfg.order || ['chips', 'straws', 'pimento', 'peach', 'egg']; // #5 → #1

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;background:transparent;overflow:hidden}
body{font-family:Inter,sans-serif;position:relative}
.bg{position:absolute;inset:0}
.ph{position:absolute;left:90px;right:90px;top:760px;text-align:center;color:rgba(255,255,255,.55);
 font:500 34px/1.35 Inter;letter-spacing:.2px}
.ph b{display:inline-block;margin-bottom:22px;font:800 26px Poppins;letter-spacing:3px;color:#07283d;
 background:#e6a310;padding:10px 18px;border-radius:8px}
.hook{position:absolute;left:60px;right:140px;top:300px;font:800 76px/1.08 Poppins;color:#fff;
 text-shadow:0 4px 0 rgba(0,0,0,.55),0 0 28px rgba(0,0,0,.55);letter-spacing:-.5px}
.hook em{font-style:normal;color:#e6a310}
.tag{position:absolute;left:60px;top:560px;background:#07283d;color:#fff;border-radius:12px;padding:12px 20px;font:700 34px Poppins}
.sub{position:absolute;left:60px;right:140px;top:300px;font:800 64px/1.1 Poppins;color:#fff;
 text-shadow:0 4px 0 rgba(0,0,0,.55),0 0 24px rgba(0,0,0,.5)}
.lt{position:absolute;left:60px;top:300px;display:flex;align-items:center;gap:16px;background:#07283d;
 color:#fff;border-radius:14px;padding:20px 30px;font:700 42px Poppins}
.lt span{font:600 36px Inter;color:#2ea3f2}
.card{position:absolute;left:60px;top:1110px;width:880px;background:#07283d;border-radius:22px;
 padding:28px 32px;display:flex;align-items:center;gap:26px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.rank{flex:none;width:118px;height:118px;border-radius:18px;background:#e6a310;color:#07283d;
 font:800 62px/118px Poppins;text-align:center}
.it{flex:1;min-width:0}
.it h2{font:800 48px/1.05 Poppins;color:#fff}
.it p{font:600 34px Inter;color:#2ea3f2;margin-top:8px}
.score{flex:none;text-align:center;color:#fff}
.score small{display:block;font:600 20px Inter;letter-spacing:2px;color:#9fb6c6;text-transform:uppercase}
.score div{font:800 60px Poppins}
.score div i{font-style:normal;font-size:30px;color:#9fb6c6}
.fight{position:absolute;left:60px;right:140px;top:300px;font:800 70px/1.08 Poppins;color:#fff;
 text-shadow:0 4px 0 rgba(0,0,0,.55),0 0 24px rgba(0,0,0,.5)}
.rec{position:absolute;left:60px;width:880px;top:330px;background:#fff;border-radius:22px;padding:34px 36px;
 box-shadow:0 10px 30px rgba(0,0,0,.35)}
.rec .row{display:flex;justify-content:space-between;align-items:baseline;font:700 44px Poppins;color:#07283d}
.rec .row+.row{margin-top:18px;padding-top:18px;border-top:3px dashed #c9d4dc}
.rec .row b{font:800 64px Poppins;color:#1679b5}
.rec .row:last-child b{color:#e6a310}
.rec small{display:block;font:500 24px Inter;color:#5b7385;margin-top:16px}
.cta{position:absolute;left:60px;width:880px;top:1000px;background:#2ea3f2;color:#fff;border-radius:20px;
 padding:26px 30px;font:800 50px/1.2 Poppins;text-align:center}
.cta em{font-style:normal;background:#07283d;border-radius:10px;padding:2px 14px}
.logo{position:absolute;left:50%;transform:translateX(-50%);top:1196px;background:#07283d;border-radius:18px;
 padding:22px 34px}
.logo img{display:block;width:300px}
.guide{position:absolute;left:0;right:0;background:rgba(255,0,80,.22);border:2px dashed #ff2d6f}
`;

const ph = (n, t, d) => `<div class="ph"><b>REAL FOOTAGE · ${n ? 'SHOT ' + n : 'HOOK'} · ${t}</b><br>${d}</div>`;
const card = (rank, k) => {
  const it = ITEMS[k];
  const s = rank === 1 ? '' : `<div class="score"><small>Nerd verdict</small><div>${sc(k)}<i>/10</i></div></div>`;
  return `<div class="card"><div class="rank">#${rank}</div><div class="it"><h2>${it.name}</h2><p>${it.price} at Augusta</p></div>${s}</div>`;
};

// Overlays: [file, html, board shot number, timing, placeholder description]
const L = [];
L.push(['01-hook-A', `<div class="hook"><em>$1.50</em> at Augusta since 2002.</div><div class="tag">We made ours at home ↓</div>`,
  1, '0:00–0:02', 'Hands unwrap a homemade pimento cheese sandwich from plain white deli paper. Big bite. No voice.']);
L.push(['02-setup', `<div class="sub">So we recreated 5 Augusta classics at home. And ranked them.</div>`,
  2, '0:02–0:05', 'Slide along the counter: five items, hand-written price cards. VO: "We recreated five Augusta classics at home."']);
const desc = {
  chips: 'Example order. Chips poured from a plain bowl, crunch, verdict to camera.',
  straws: 'Cheese straw snapped in half. Eaten.',
  pimento: 'Bite, tilt up to the face for the verdict. The pause goes wherever the Nerd really hesitated.',
  peach: 'Peach ice cream sandwich. Bite, quick reaction.',
  egg: 'Held up like a trophy. Small push-in.',
};
const times = ['0:05–0:08.5', '0:08.5–0:12', '0:12–0:16.5', '0:16.5–0:20.5', '0:20.5–0:24.5'];
ORDER.forEach((k, i) => {
  const rank = 5 - i;
  const extra = rank === 1 ? `<div class="fight">Fight us in the comments.</div>` : rank === 5 ? `<div class="lt">${NAME} <span>· TripNerd Nerd</span></div>` : '';
  L.push([`0${3 + i}-rank-${rank}-${k}`, card(rank, k) + extra, 3 + i, times[i], desc[k]]);
});
L.push(['08-receipt', `<div class="rec"><div class="row"><span>Those 5 at Augusta</span><b>$10</b></div><div class="row"><span>Making them at home</span><b>${RECEIPT}</b></div><small>Plenty left over. 2026 Augusta prices: 1.50 + 1.50 + 1.50 + 2.50 + 3.00</small></div>`,
  8, '0:24.5–0:28.5', 'Real receipt slides in, framed on the total only (store details out of frame or blurred). VO: "Those five at Augusta: ten bucks. Our groceries: [total]."']);
const payoff = cta => `<div class="hook">Lunch is the easy part.</div><div class="cta">${cta}</div><div class="logo"><img src="${logo}"></div>`;
L.push(['09-payoff-comment', payoff('Comment <em>NERDNOTES</em><br>for our Augusta notes'),
  9, '0:28.5–0:34', 'The Nerd to camera, sandwich in hand: "Lunch is the easy part. House, passes, logistics? That\'s what a Nerd\'s for."']);
L.push(['09-payoff-dm', payoff('DM <em>AUGUSTA</em><br>for our Augusta notes'), 9, '0:28.5–0:34', 'Same shot as 09 (DM version of the CTA).']);
L.push(['10-loop', '', 10, '0:34–0:35', 'Picks up a second, still-wrapped sandwich. Framing matches shot 1, so the Reel loops.']);
// Hook variants (replace shot 1 text)
L.push(['hook-B-egg', `<div class="hook">Egg salad beats pimento cheese. Our verdict:</div>`, 0, 'Trial B', 'Only if it is the real verdict. Egg salad held up to camera.']);
L.push(['hook-B-pimento', `<div class="hook">We ranked 5 Augusta classics. The legend held.</div>`, 0, 'Trial B alt', 'If pimento cheese wins. Held up to camera.']);
L.push(['hook-C', `<div class="hook">Can we make Augusta's <em>$10</em> lunch for $10?</div>`, 0, 'Reserve C', 'The Nerd at the counter, five items. Answered by the receipt.']);
L.push(['hook-D', `<div class="hook">Augusta charges <em>$10</em> for these five. My groceries: ${RECEIPT}.</div>`, 0, 'Trial D', 'Only if the total is over $10. Receipt (total line only) fills the frame.']);

// Fonts are inlined (FONTS_CSS = @font-face rules with data: URLs) because headless Chromium
// may not reach Google Fonts through the workspace proxy.
const FONTS = process.env.FONTS_CSS ? fs.readFileSync(process.env.FONTS_CSS, 'utf8') : '';
const page = (body, board) => `<!doctype html><html><head><meta charset="utf-8">
<style>${FONTS}${CSS}</style></head><body>${board || ''}${body}</body></html>`;
const boardBg = (n, t, d) => `<div class="bg" style="background:radial-gradient(120% 80% at 50% 40%,#4a3b2c 0%,#2a221b 55%,#16120e 100%)"></div>${ph(n, t, d)}`;
// Burned-text band: 15-70% of frame height (y 288-1344), right 140 px kept clear for IG buttons.
const guides = `<div class="guide" style="top:0;height:288px"></div><div class="guide" style="top:1344px;height:576px"></div><div class="guide" style="top:288px;height:1056px;left:940px;right:0;background:rgba(255,0,80,.10)"></div>`;

(async () => {
  for (const d of ['overlays', 'boards']) fs.mkdirSync(path.join(out, d), { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const shoot = async (html, file, opts) => {
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: file, ...opts });
  };
  const band = [];
  for (const [f, body, n, t, d] of L) {
    if (body) {
      await shoot(page(body), path.join(out, 'overlays', f + '.png'), { omitBackground: true });
      // Text-band check (BC-28 pre-check): every text block inside y 288-1344 and x <= 940.
      const boxes = await p.evaluate(() => [...document.querySelectorAll('.hook,.sub,.lt,.card,.fight,.rec,.cta,.logo,.tag')]
        .map(e => { const r = e.getBoundingClientRect(); return [e.className, Math.round(r.top), Math.round(r.bottom), Math.round(r.right)]; }));
      for (const [c, top, bottom, right] of boxes)
        band.push({ f, c, top, bottom, right, ok: top >= 288 && bottom <= 1344 && right <= 940 });
    }
    if (d) await shoot(page(body, boardBg(n, t, d)), path.join(out, 'boards', f + '.jpg'), { type: 'jpeg', quality: 85 });
  }
  // Safe-zone guide boards for four representative frames
  for (const [f, body, n, t, d] of L.filter(x => ['01-hook-A', '03-rank-5-chips', '06-rank-2-peach', '09-payoff-comment'].includes(x[0])))
    await shoot(page(body + guides, boardBg(n, t, d)), path.join(out, 'boards', 'safe-' + f + '.jpg'), { type: 'jpeg', quality: 80 });
  await browser.close();
  fs.writeFileSync(path.join(out, 'band-check.json'), JSON.stringify(band, null, 1));
  const bad = band.filter(x => !x.ok);
  console.log('text-band check:', band.length, 'blocks,', bad.length, 'outside', bad.map(x => x.f + ' ' + x.c + ' ' + x.top + '-' + x.bottom + ' r' + x.right).join('; '));
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(L.map(([f, , n, t, d]) => ({ f, n, t, d })), null, 1));
  console.log('rendered', L.length, 'entries');
})();
