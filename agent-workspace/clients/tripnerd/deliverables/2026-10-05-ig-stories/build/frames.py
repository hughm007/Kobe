import os,sys,json
L='https://cdn.prod.website-files.com/697ae7a00afa01083b5681df/697d795a2b1c8f4dd7cc8413_tripnerd-logo_white.png'
U={l.strip().split('/')[-1].split('_',1)[-1]:l.strip() for l in open('urls.txt')}
def u(n):
    for k,v in U.items():
        if k.endswith(n): return v
    raise SystemExit('missing '+n)
B=lambda s:'<div class="k">%s</div>'%s
F=[
('mon-1','tripnerd_gallery_07.jpg','50% 40%','<div class="t top"><h1>Be honest.</h1><p>Where were you sitting at the last big event you went to?</p></div>',(1180,'10 AM ET · POLL · "Last big event, I was…" · In the crowd / In a suite')),
('mon-2','tripnerd_gallery_030.jpg','50% 50%','<div class="t top"><h1>This is where we put you.</h1></div><div class="t low"><div class="src">Real TripNerd guests · real seats</div></div>',None),
('mon-3',None,'','<div class="t mid">'+B('On the 2027 calendar')+'<div class="list"><div>The Big Game <span>· LA · Feb 14</span></div><div>Daytona <span>· Feb 21</span></div><div>Sawgrass <span>· Mar 11–14</span></div><div>Augusta <span>· April</span></div><div>Louisville <span>· May</span></div></div><p>New Reel at 2 PM: Augusta, by the clock.</p></div>',(1400,'LINK · "See 2027 experiences" (UTM link)')),
('mon-4',None,'','<div class="t top">'+B('New Reel')+'<h1 class="m">Augusta, by the clock.</h1></div><div class="t low"><p>DM us “AUGUSTA” and a Nerd will send you the details.</p></div>',(780,'~2 PM, within the hour · SHARE THE NEW REEL HERE (Reel ➤ Add to story)')),
('tue-1','tripnerd_gallery_013.jpg','50% 50%','<div class="t top"><h1>Taking 8 clients out this year?</h1></div>',None),
('tue-2','tripnerd_gallery_039.jpg','50% 50%','<div class="t top"><h1 class="m">They\'ll forget the steak dinner.</h1><h1 class="m gold">They won\'t forget this.</h1></div>',None),
('tue-3',None,'','<div class="t mid">'+B('From a corporate client')+'<div class="quote">“TripNerd has been an exceptional partner in our annual customer events at THE PLAYERS Championship for over seven years.”</div><div class="who">Chris</div><div class="src">TripNerd review · tripnerd.com/reviews</div></div>',None),
('tue-4','tripnerd_gallery_042.jpg','50% 50%','<div class="t top"><h1>DM us “HOST”</h1><p>Or tell us the hardest part of hosting clients at a big event.</p></div>',(1400,'10 AM ET · QUESTION · "What\'s the hardest part of hosting clients?" + LINK (UTM)')),
('tue-5',None,'','<div class="t top">'+B('New carousel')+'<h1 class="m">What corporate hosts get wrong.</h1></div><div class="t low"><p>Planning one for next year? DM us “HOST”.</p></div>',(780,'~1 PM, within the hour · SHARE THE NEW CAROUSEL HERE')),
('wed-1','augusta-in-april_og-b.jpg','50% 50%','<div class="t top">'+B('April 2027')+'<h1>Inside the Augusta Experience</h1><p>Five things. Tap through.</p></div>',None),
('wed-2','private-executive-home.jpg','40% 50%','<div class="t top"><div class="num">01</div><h1 class="m">Private executive home</h1></div>',None),
('wed-3','augusta_group.jpg','50% 50%','<div class="t top"><div class="num">02</div><h1 class="m">Course passes included</h1></div>',None),
('wed-4','tripnerd-augusta-experience-2022-0213.jpg','50% 50%','<div class="t top"><div class="num">03 + 04</div><h1 class="m">Daily hospitality. Food &amp; drink included.</h1></div>',None),
('wed-5','lifelong-memories_augusta.jpg','50% 30%','<div class="t top"><div class="num">05</div><h1 class="m">TripNerd hosted, all week</h1><p>DM us “AUGUSTA” and a Nerd will send you the details.</p></div>',(1380,'10 AM ET · QUESTION · "Ask us about Augusta" + LINK (UTM)')),
('thu-1','tripnerd_gallery_072.jpg','50% 40%','<div class="t top"><h1>Don\'t take our word for it.</h1></div>',None),
('thu-2','tripnerd_gallery_043.jpg','50% 50%','<div class="t mid"><div class="card"><div class="stars">★★★★★</div><div class="quote s">“TripNerd is absolutely first-class! From start to finish, the entire experience was seamless and stress-free. Their team took care of every detail and made sure I had the best possible trip!!! Communication was high level! HIGHLY recommend!!”</div><div class="who">Jon Reader</div><div class="src">TripNerd review</div></div></div>',None),
('thu-3','tripnerd_gallery_09.jpg','50% 40%','<div class="t low"><div class="card"><div class="quote s">“By far the best experience we’ve ever had going to an event! The Kentucky derby will never be the same. Highly recommend!”</div><div class="who">Kristin</div></div></div>',None),
('thu-4',None,'','<div class="t top"><h1>Quick quiz.</h1></div><div class="t low"><p>Earlier means better seats and better places to stay.</p></div>',(720,'10 AM ET · QUIZ · "How early should you book a bucket-list event?" · A month / 3 months / 6–12 months ✓ + LINK (UTM)')),
('thu-5',None,'','<div class="t top">'+B('New post')+'<h1 class="m">How we keep every guest in the loop.</h1></div><div class="t low"><p>Real guests. Real reviews.</p></div>',(780,'~12:30 PM, within the hour · SHARE THE NEW PROOF POST HERE')),
('fri-1','tripnerd_gallery_040.jpg','50% 35%','<div class="t top">'+B('Sun · Feb 14, 2027 · SoFi Stadium')+'<h1>The Big Game is in LA.</h1></div>',None),
('fri-2','super-bowl_tripnerd_event-hero.jpg','50% 50%','<div class="t top"><h1 class="m">Big Game packages are booking now.</h1><p>Tap “Remind me” and we\'ll ping you as it gets close.</p></div>',(1180,'10 AM ET · COUNTDOWN · "The Big Game · LA" → Feb 14, 2027')),
('fri-3',None,'','<div class="t top"><h1>Who are you taking?</h1><p>Send this to them. Then DM us “BIGGAME” for a quote.</p></div>',(1150,'QUESTION · "How many in your group?" + LINK "Get a quote" (UTM)')),
]
CSS='''*{box-sizing:border-box}body{margin:0;width:1080px;height:1920px;position:relative;overflow:hidden;font-family:Inter,sans-serif;background:#07283d;color:#fff}
.bg{position:absolute;inset:0;background-size:cover}.solid{position:absolute;inset:0;background:radial-gradient(900px 700px at 80% 0%,#1679b5 0%,rgba(22,121,181,0) 70%),#07283d}
.scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,40,61,.9) 0%,rgba(7,40,61,.55) 30%,rgba(7,40,61,0) 50%,rgba(7,40,61,0) 62%,rgba(7,40,61,.8) 100%)}
.t{position:absolute;left:84px;right:84px}.top{top:290px}.mid{top:50%;transform:translateY(-50%)}.low{bottom:420px}
h1{font:800 108px/1.0 Poppins,sans-serif;margin:0;letter-spacing:-1px;text-transform:uppercase;text-shadow:0 4px 30px rgba(0,0,0,.35)}h1.m{font-size:86px}h1.gold{color:#e6a310;margin-top:18px}
.k{font:600 30px Inter;letter-spacing:5px;text-transform:uppercase;color:#2ea3f2;margin-bottom:24px}
p{font:500 42px/1.35 Inter;margin:26px 0 0;color:rgba(255,255,255,.94);text-shadow:0 2px 16px rgba(0,0,0,.4)}
.num{font:700 34px Poppins;color:#e6a310;letter-spacing:4px;margin-bottom:12px}
.quote{font:600 54px/1.3 Poppins}.quote.s{font-size:48px}.who{font:700 36px Inter;color:#2ea3f2;margin-top:30px}.src{font:600 26px Inter;opacity:.8;letter-spacing:3px;text-transform:uppercase;margin-top:10px}
.card{background:rgba(7,40,61,.86);border-radius:36px;padding:56px}.stars{color:#e6a310;font-size:48px;letter-spacing:8px;margin-bottom:20px}
.list div{font:700 66px/1.3 Poppins}.list span{color:#2ea3f2;font-weight:600}
.logo{position:absolute;right:84px;top:200px;width:220px;opacity:.95}
.guide{position:absolute;left:140px;right:140px;border:5px dashed #e6a310;border-radius:36px;background:rgba(0,0,0,.45);color:#fff;font:600 32px/1.35 Inter;padding:30px;text-align:center}'''
os.makedirs('out/html',exist_ok=True)
for fid,img,fp,body,guide in F:
    for mode in ('post','preview'):
        bg='<div class="bg" style="background-image:url(%s);background-position:%s"></div><div class="scrim"></div>'%(u(img),fp) if img else '<div class="solid"></div>'
        g=('<div class="guide" style="top:%dpx">%s</div>'%guide) if (guide and mode=='preview') else ''
        h='<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@500;600;700&display=block" rel="stylesheet"><style>%s</style></head><body>%s<img class="logo" src="%s">%s%s</body></html>'%(CSS,bg,L,body,g)
        open('out/html/%s_%s.html'%(fid,mode),'w').write(h)
print(len(F))
