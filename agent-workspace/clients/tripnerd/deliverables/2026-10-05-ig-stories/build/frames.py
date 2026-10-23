import os
U={l.strip().split('/')[-1].split('_',1)[-1]:l.strip() for l in open('urls.txt')}
def u(n):
    for k,v in U.items():
        if k.endswith(n): return v
    raise SystemExit('missing '+n)
LW='https://cdn.prod.website-files.com/697ae7a00afa01083b5681df/697d795a2b1c8f4dd7cc8413_tripnerd-logo_white.png'
LC='https://cdn.prod.website-files.com/697ae7a00afa01083b5681df/697ccdde03e1c807ff42ea30_tripnerd-fan-experiences_logo%403x.png'
def paper(body,head=''):
    return ('paper','<div class="hd">%s</div>'%head+body)
def navy(body): return ('navy',body)
def tape(img,rot=-3,top=1080,h=520):
    return '<div class="pol" style="top:%dpx;transform:rotate(%sdeg)"><div class="ph" style="height:%dpx;background-image:url(%s)"></div><i class="tp"></i></div>'%(top,rot,h,u(img))
HL=lambda s:'<span class="hl">%s</span>'%s
F=[
('mon-1',paper('<div class="t top"><div class="hand">Pop quiz.</div><h1>What does a pimento cheese sandwich cost at Augusta?</h1></div>'+tape('augusta_group.jpg',-4,1270,430),'Nerd Notes · Augusta · April 2027'),(860,'10 AM ET · QUIZ · "Pimento cheese sandwich at Augusta?" · $1.50 ✓ / $8 / $15')),
('mon-2',paper('<div class="t top"><div class="big"><span class="circ">$1.50</span></div><p>Same price since 2002. Still $1.50 in 2026.</p><h2>The sandwich is the easy part.</h2><p>The week around it is where a Nerd earns their keep.</p></div>','Nerd Notes · Augusta · Note 1'),None),
('mon-3',paper('<div class="t top"><div class="num">Note 2</div><h1>Your phone stays in the car.</h1><p>Get caught with one on the grounds and you\'re walked out, and can lose your credentials for good.</p><div class="hand sm">Need to call home? There are free payphones on the course. A Nerd knows where.</div></div>','Nerd Notes · Augusta · Note 2'),None),
('mon-4',paper('<div class="t top"><div class="num">Note 3</div><div class="rv"><div class="r"><b>Rookie</b><s>Shows up for Sunday.</s></div><div class="r n"><b>Nerd</b><span>Arrives Monday of tournament week.</span></div></div><p class="fine">TripNerd guests can arrive as early as Monday.</p><h2>Want the full cheat sheet? DM us “AUGUSTA”.</h2><div class="hand sm">New Reel at 2 PM: Augusta, by the clock.</div></div>','Nerd Notes · Augusta · Note 3'),None),
('mon-5',paper('<div class="t top"><div class="num">New Reel</div><h1>Augusta, by the clock.</h1></div><div class="t low"><h2>DM “AUGUSTA” for the Nerd Notes cheat sheet.</h2></div>','Nerd Notes · Augusta'),(760,'~2 PM, within the hour · SHARE THE NEW REEL HERE')),
('tue-1',paper('<div class="t top"><div class="hand">Be honest.</div><h1>The last thing you did for your top client?</h1></div>','Q4 · Client planning'),(900,'10 AM ET · POLL · "Last thing you did for your top client?" · Dinner / Box seats / Gift basket / Nothing yet')),
('tue-2',paper('<div class="t top"><div class="num">Augusta 2027 is six months out</div><h2>The calendar a Nerd builds for a client week:</h2><div class="cal"><div><b>OCT</b>Pick the event and headcount</div><div><b>NOV</b>Lock the private house</div><div><b>JAN</b>Invitations go out</div><div><b>MAR</b>Guest briefing lands</div><div><b>APR</b>You host. We handle the week.</div></div><div class="hand sm">Your clients only ever see April.</div></div>','Q4 · Client planning'),None),
('tue-3',paper('<div class="t mid"><h1>Every month you wait is one less choice.</h1><div class="hand sm">House, dates, headcount. Earlier means you pick. Later means you take what\'s left.</div></div>','Q4 · Client planning'),None),
('tue-4',paper('<div class="t top"><div class="num">At 1 PM</div><h1>What corporate hosts get wrong.</h1><p>A new carousel, from the people who plan these weeks.</p><h2>DM us “HOST” for the client-week planner.</h2></div>','Q4 · Client planning'),(1420,'10 AM ET · LINK (UTM) → tripnerd.com/contact')),
('tue-5',paper('<div class="t top"><div class="num">New carousel</div><h1>What corporate hosts get wrong.</h1></div><div class="t low"><h2>Planning one for 2027? DM “HOST”.</h2></div>','Q4 · Client planning'),(760,'~1 PM, within the hour · SHARE THE NEW CAROUSEL HERE')),
('wed-1',navy('<div class="t mid"><h1 class="xl">Don\'t book with TripNerd if…</h1></div>'),None),
('wed-2',navy('<div class="t mid"><h1>…you enjoy hunting for parking at Churchill Downs.</h1><div class="strike"></div></div>'),None),
('wed-3',navy('<div class="t mid"><h1>…you like refreshing resale sites at 2 a.m.</h1><div class="strike"></div></div>'),None),
('wed-4',navy('<div class="t top"><h1>…you think eight people can “just figure out” where to sleep in Augusta in April.</h1><div class="strike"></div></div>'),(1300,'10 AM ET · POLL · "Been there?" · Yes, painfully / Not yet')),
('wed-5',navy('<div class="t top"><div class="hand w">Still here?</div><h1 class="xl">You trip like a Nerd.</h1><h2>DM us “NERD” and tell us the event.</h2></div>'),(1360,'LINK (UTM) → tripnerd.com')),
('thu-1',paper('<div class="t top"><div class="hand">We read every review on our website.</div><h1>15 guests. How many mention Jason by name?</h1></div>','Review X-ray · tripnerd.com/reviews'),(990,'10 AM ET · QUIZ · "How many of 15 reviews mention Jason?" · 2 / 4 / 7 ✓')),
('thu-2',paper('<div class="t top"><div class="big"><span class="circ">7 of 15</span></div><h2>Not “the company.” Not “customer service.”</h2><h1>'+HL('Jason.')+'</h1><p>Guests remember the person who ran their trip.</p></div>','Review X-ray · tripnerd.com/reviews'),None),
('thu-3',paper('<div class="t top"><div class="q">“'+HL('Jason and the team')+' at TripNerd are the only group we use.”<em class="att">Sean Moseley</em></div><div class="q">“'+HL('Jason and the guys')+' at TripNerd were extremely helpful with every question or concern I had.”<em class="att">Daniel Niebergall</em></div><p class="fine">Whole sentences, word for word, from tripnerd.com/reviews.</p></div>','Review X-ray · tripnerd.com/reviews'),None),
('thu-4',paper('<div class="t top"><div class="big"><span class="circ">6 of 15</span></div><h2>also used one word: '+HL('detail')+'.</h2><p>That\'s the job. New post at 12:30 PM on how guests stay in the loop.</p><h2>DM us “NERD” to talk to one.</h2></div>','Review X-ray · tripnerd.com/reviews'),None),
('thu-5',paper('<div class="t top"><div class="num">New post</div><h1>How guests stay in the loop.</h1></div><div class="t low"><h2>Questions first? DM “NERD”.</h2></div>','Review X-ray'),(760,'~12:30 PM, within the hour · SHARE THE NEW PROOF POST HERE')),
('fri-1',paper('<div class="t top"><div class="num">Sun · Feb 14, 2027</div><h1>The Big Game is on Valentine\'s Day.</h1><div class="hand">Choose wisely.</div></div>','The Big Game · Los Angeles'),(1080,'10 AM ET · POLL · "Valentine\'s Day plans?" · Dinner for two / Two seats in LA')),
('fri-2',paper('<div class="t top"><h1>If your team makes it, you get 14 days.</h1><div class="days"></div><p class="fine">Conference championships: Jan 31. Kickoff in LA: Feb 14.</p><div class="hand">Tick, tock.</div></div>','The Big Game · Los Angeles'),None),
('fri-3',paper('<div class="t top"><h1>14 days to sort flights, a hotel and tickets in LA.</h1><h2>'+HL('The same 14 days')+' as every other fan from your city.</h2></div>','The Big Game · Los Angeles'),None),
('fri-4',paper('<div class="t top"><h1>Get a Nerd on standby now.</h1><h2>DM us “BIGGAME” with your team.</h2></div>','The Big Game · Los Angeles'),(980,'10 AM ET · COUNTDOWN "The Big Game · LA" → Feb 14 2027 + LINK (UTM) "Get a quote"')),
]
CSS='''*{box-sizing:border-box}body{margin:0;width:1080px;height:1920px;position:relative;overflow:hidden;font-family:Inter,sans-serif}
body.paper{background:#f6f3ea;color:#07283d;background-image:linear-gradient(rgba(46,163,242,.16) 2px,transparent 2px),linear-gradient(90deg,rgba(46,163,242,.16) 2px,transparent 2px);background-size:54px 54px}
body.paper:before{content:"";position:absolute;left:150px;top:0;bottom:0;width:4px;background:rgba(255,87,87,.45)}
body.navy{background:#07283d;color:#fff}
.hd{position:absolute;left:190px;top:282px;font:600 26px Inter;letter-spacing:4px;text-transform:uppercase;color:#1679b5}
.t{position:absolute;left:190px;right:90px}.top{top:340px}.mid{top:50%;transform:translateY(-50%)}.low{bottom:430px}
body.navy .t{left:90px}
h1{font:800 92px/1.02 Poppins,sans-serif;margin:0;letter-spacing:-1px}h1.xl{font-size:118px}
h2{font:700 52px/1.15 Poppins,sans-serif;margin:34px 0 0}
p{font:500 40px/1.38 Inter;margin:26px 0 0;color:#294456}body.navy p{color:#cfe6f5}
.fine{font-size:30px;color:#4d6577}
.hand{font:700 72px/1.1 Caveat,cursive;color:#ff5757;margin-bottom:14px;transform:rotate(-2deg);transform-origin:left}.hand.sm{font-size:54px;margin-top:34px;color:#d63f3f}.hand.w{color:#e6a310}
.num{font:700 30px Inter;letter-spacing:5px;text-transform:uppercase;color:#e6a310;margin-bottom:16px}
.big{font:800 210px/1 Poppins;letter-spacing:-4px}
.circ{position:relative;display:inline-block;padding:0 26px}.circ:after{content:"";position:absolute;inset:-18px -10px;border:7px solid #ff5757;border-radius:50%;transform:rotate(-4deg)}
.hl{background:linear-gradient(transparent 52%,rgba(230,163,16,.55) 52%);padding:0 6px}
.pol{position:absolute;left:240px;width:620px;background:#fff;padding:22px 22px 70px;box-shadow:0 14px 40px rgba(7,40,61,.22)}
.ph{background-size:cover;background-position:center}
.tp{position:absolute;top:-26px;left:220px;width:180px;height:56px;background:rgba(230,163,16,.35);transform:rotate(3deg)}
.rv{display:grid;gap:26px;margin-top:10px}.r{background:#fff;border:3px solid #07283d;border-radius:22px;padding:30px 34px;display:grid;gap:8px}
.r b{font:700 30px Inter;letter-spacing:4px;text-transform:uppercase;color:#ff5757}.r.n b{color:#1679b5}.r s,.r span{font:700 54px/1.15 Poppins}.r s{color:#7a8b97;text-decoration-color:#ff5757;text-decoration-thickness:6px}
.r.n{border-color:#2ea3f2;background:#eaf6fe}
.cal{display:grid;gap:18px;margin-top:30px}.cal div{display:grid;grid-template-columns:150px 1fr;align-items:center;gap:20px;font:600 42px/1.2 Inter;background:#fff;border-left:10px solid #2ea3f2;padding:22px 26px;border-radius:0 18px 18px 0}
.cal b{font:800 48px Poppins;color:#1679b5}.cal div:last-child{border-color:#e6a310}
.strike{height:10px;background:#ff5757;margin-top:40px;width:62%;transform:rotate(-2deg);border-radius:6px}
.q{background:#fff;border-radius:26px;padding:44px;font:600 50px/1.3 Poppins;margin-bottom:34px;box-shadow:0 10px 30px rgba(7,40,61,.12)}.q .att{display:block;font:700 32px Inter;font-style:normal;color:#1679b5;margin-top:20px}
.days{display:grid;grid-template-columns:repeat(7,1fr);gap:12px;margin-top:44px}
.days i{height:96px;border-radius:14px;background:#fff;border:3px solid #07283d;display:grid;place-items:center;font:800 34px Poppins;font-style:normal}
.days i:last-child{background:#e6a310;border-color:#e6a310;color:#07283d}
.logo{position:absolute;right:90px;top:140px;width:250px;padding:18px 22px;border-radius:18px;background:#07283d;box-sizing:content-box}body.navy .logo{background:none;padding:0}
.guide{position:absolute;left:150px;right:150px;border:5px dashed #e6a310;border-radius:36px;background:rgba(7,40,61,.78);color:#fff;font:600 32px/1.35 Inter;padding:30px;text-align:center;z-index:9}'''
os.makedirs('out/html',exist_ok=True)
for fid,(kind,body),guide in F:
    if 'class="days"' in body: body=body.replace('<div class="days"></div>','<div class="days">'+''.join('<i>%d</i>'%d for d in list(range(1,15)))+'</div>')
    for mode in ('post','preview'):
        g=('<div class="guide" style="top:%dpx">%s</div>'%guide) if (guide and mode=='preview') else ''
        logo=LW
        h='<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@500;600;700&family=Caveat:wght@700&display=block" rel="stylesheet"><style>%s</style></head><body class="%s">%s%s</body></html>'%(CSS,kind,body,g)
        open('out/html/%s_%s.html'%(fid,mode),'w').write(h)
print(len(F))
