// Renders the Augusta menu Reel edit kit: transparent 1080x1920 text overlays and
// storyboard boards (overlay on a labelled REAL FOOTAGE placeholder).
// Usage: FONTS_CSS=fonts-embed.css node render.js <outDir> <logo.png> [scores.json]
//   scores.json (after the shoot): {"names":["A","B"],"scores":{"chips":[6,7],...},
//   "made":{...},"leftovers":true,"receipt":"0.00"}  (see scores.example.json). Rank order is
//   computed from the average score (#5 = lowest); set "order" only to break a tie as filmed.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || 'out';
const logo = 'data:image/png;base64,' + fs.readFileSync(process.argv[3] || 'logo.png').toString('base64');
const cfg = process.argv[4] ? JSON.parse(fs.readFileSync(process.argv[4], 'utf8')) : {};
const S = cfg.scores || {};
const NAMES = cfg.names || ['[Name A]', '[Name B]'];
const pair = k => (Array.isArray(S[k]) ? S[k] : [undefined, undefined]);
const avg = k => { const [a, b] = pair(k); return a === undefined || b === undefined ? undefined : (a + b) / 2; };
const fmt = v => (v === undefined ? '?' : Number.isInteger(v) ? String(v) : v.toFixed(1));
const RECEIPT = cfg.receipt ? '$' + cfg.receipt : '$?';
const MADE = cfg.made || {}; // {item: true (homemade) | false (store-bought)}
const made = k => (MADE[k] === true ? 'homemade' : MADE[k] === false ? 'store-bought' : 'homemade / store-bought');
const LEFTOVERS = cfg.leftovers === true && parseFloat(cfg.receipt) > 10;

const ITEMS = {
  chips: { name: 'Chips', price: '$1.50' },
  straws: { name: 'Cheese straws', price: '$2.50' },
  pimento: { name: 'Pimento cheese', price: '$1.50' },
  peach: { name: 'Peach ice cream sandwich', price: '$3' },
  egg: { name: 'Egg salad', price: '$1.50' },
};
const KEYS = ['chips', 'straws', 'pimento', 'peach', 'egg'];
const ORDER = cfg.order || (KEYS.every(k => avg(k) !== undefined)
  ? [...KEYS].sort((x, y) => avg(x) - avg(y)) // #5 (lowest average) → #1
  : KEYS); // example order until scores exist

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
.lt{position:absolute;left:60px;top:560px;max-width:880px;display:flex;flex-wrap:wrap;align-items:center;column-gap:16px;row-gap:4px;background:#07283d;
 color:#fff;border-radius:14px;padding:20px 30px;font:700 42px Poppins}
.lt span{font:600 36px Inter;color:#2ea3f2}
.card{position:absolute;left:60px;bottom:590px;width:880px;background:#07283d;border-radius:22px;
 padding:28px 32px;display:flex;align-items:center;gap:26px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.rank{flex:none;width:118px;height:118px;border-radius:18px;background:#e6a310;color:#07283d;
 font:800 62px/118px Poppins;text-align:center}
.it{flex:1;min-width:0}
.it h2{font:800 48px/1.05 Poppins;color:#fff}
.it p{font:600 30px/1.25 Inter;color:#2ea3f2;margin-top:8px}
.it p span{color:#9fb6c6}
.it p b{color:#fff;font-weight:700}
.sub2{position:absolute;left:60px;right:140px;top:410px;font:700 50px/1.15 Poppins;color:#fff;
 text-shadow:0 3px 0 rgba(0,0,0,.55),0 0 20px rgba(0,0,0,.5)}
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
  const [a, b] = pair(k);
  const s = `<div class="score"><small>Nerd avg</small><div>${fmt(avg(k))}<i>/10</i></div></div>`;
  return `<div class="card"><div class="rank">#${rank}</div><div class="it"><h2>${it.name}</h2><p>${it.price} at Augusta (2026)<br><span>ours: ${made(k)}</span><br><b>${NAMES[0]}&nbsp;${fmt(a)} · ${NAMES[1]}&nbsp;${fmt(b)}</b></p></div>${s}</div>`;
};

// Overlays: [file, html, board shot number, timing, placeholder description]
const L = [];
L.push(['01-hook-A', `<div class="hook"><em>$1.50</em> at Augusta since 2002.</div><div class="tag">Ours is homemade ↓</div>`,
  1, '0:00–0:02', 'A judge\'s hands unwrap homemade pimento cheese sandwich A from plain white deli paper. Big bite. No voice. Tag appears at 1.0 s.']);
L.push(['02-setup', `<div class="sub">Two Nerds. 5 Augusta classics. Scored out of 10.</div><div class="lt">${NAMES[0]} &amp; ${NAMES[1]} <span>· TripNerd Nerds</span></div>`,
  2, '0:02–0:05', 'Locked two-shot: the judging table, two judges with blank paddles, five cloches. VO: "Two Nerds. Five Augusta classics. Scored out of ten."']);
const desc = {
  chips: 'Example order. Cloche lifted, both judges bite, both paddles up.',
  straws: 'Cloche lifted, both bite, paddles up. The other judge speaks.',
  pimento: 'Cloche lifted, both bite, paddles up. Hold on the look if they disagree.',
  peach: 'Cloche lifted, both bite, paddles up. Fresh ice cream sandwich per take.',
  egg: 'The #1 item: cloche lifted, both bite, paddles up together.',
};
const times = ['0:05–0:08.5', '0:08.5–0:12', '0:12–0:16.5', '0:16.5–0:20.5', '0:20.5–0:24.5'];
ORDER.forEach((k, i) => {
  const rank = 5 - i;
  const extra = rank === 1 ? `<div class="fight">Fight us in the comments.</div>` : '';
  L.push([`0${3 + i}-rank-${rank}-${k}`, card(rank, k) + extra, 3 + i, times[i], desc[k]]);
});
L.push(['08-receipt', `<div class="rec"><div class="row"><span>Those 5 at Augusta (2026)</span><b>$10</b></div><div class="row"><span>Making them at home</span><b>${RECEIPT}</b></div><small>${LEFTOVERS ? 'Plenty left over. ' : ''}2026 Augusta prices: 1.50 + 1.50 + 1.50 + 2.50 + 3.00</small></div>`,
  8, '0:24.5–0:28.5', 'Real receipt slides onto the tablecloth, framed on the total only (store details out of frame or blurred). VO: "Those five at Augusta: ten bucks. Ours?"']);
const payoff = cta => `<div class="hook">Lunch is the easy part.</div><div class="sub2">The house, passes and logistics? That's what a Nerd's for.</div><div class="cta">${cta}</div><div class="logo"><img src="${logo}"></div>`;
L.push(['09-payoff-comment', payoff('Comment <em>NERDNOTES</em><br>for our Augusta notes'),
  9, '0:28.5–0:34', 'Two-shot to camera. Nerd A: "Lunch is the easy part." Nerd B: "House, passes, logistics? That\'s what a Nerd\'s for."']);
L.push(['09-payoff-dm', payoff('DM <em>NERDNOTES</em><br>for our Augusta notes'), 9, '0:28.5–0:34', 'Same shot as 09 (DM version of the CTA).']);
L.push(['10-loop', '', 10, '0:34–0:35', 'A judge\'s hands pick up still-wrapped sandwich B. Framing matches shot 1, so the Reel loops.']);
// Hook variants (replace shot 1 text)
L.push(['hook-B', `<div class="hook">Pimento cheese or egg salad? Two Nerds decide.</div>`, 0, 'Trial B', 'Shot 1 picture unchanged. Works for any result.']);
L.push(['hook-C', `<div class="hook">Can we make Augusta's <em>$10</em> lunch for $10?</div>`, 0, 'Reserve C', 'Shot 1 picture unchanged. Answered by the receipt.']);
L.push(['hook-D', `<div class="hook">Augusta: <em>$10</em> for these five. At home?</div>`, 0, 'Trial D', 'Shot 1 picture unchanged. Answered by the receipt.']);

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
      const boxes = await p.evaluate(() => [...document.querySelectorAll('.hook,.sub,.sub2,.lt,.card,.fight,.rec,.cta,.logo,.tag')]
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
