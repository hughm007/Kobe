from PIL import Image,ImageDraw,ImageFont
import os
rows=[('mon','MON 5 OCT · 10 AM poll + 2 PM Reel push'),('tue','TUE 6 OCT · Corporate + 1 PM carousel push'),('wed','WED 7 OCT · Inside the Augusta Experience'),('thu','THU 8 OCT · Real guests + 12:30 PM proof push'),('fri','FRI 9 OCT · The Big Game in LA (sends)')]
W,H,G,T=270,480,8,54
try: f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
except: f=ImageFont.load_default()
S=Image.new('RGB',(5*(W+G)+G,len(rows)*(H+T+G)+G),'#07283d');d=ImageDraw.Draw(S)
for r,(k,lab) in enumerate(rows):
  y=G+r*(H+T+G); d.text((G,y+12),lab,fill='#2ea3f2',font=f)
  fs=sorted(x for x in os.listdir('out/preview') if x.startswith('tripnerd-story-'+k+'-'))
  for i,x in enumerate(fs): S.paste(Image.open('out/preview/'+x).convert('RGB').resize((W,H)),(G+i*(W+G),y+T))
S.save('tripnerd-story-week-preview-v2.jpg',quality=82)
