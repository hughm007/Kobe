from PIL import Image,ImageDraw,ImageFont
import os
rows=[('s1','MON 5 OCT · Where are you sitting?'),('s2','TUE 6 OCT · Inside the Augusta Experience'),('s3','WED 7 OCT · Hosting clients?'),('s4','THU 8 OCT · The Big Game in LA'),('s5','FRI 9 OCT · From real guests')]
W,H,G,T=270,480,8,54
try: f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
except: f=ImageFont.load_default()
S=Image.new('RGB',(5*(W+G)+G,len(rows)*(H+T+G)+G),'#07283d');d=ImageDraw.Draw(S)
for r,(k,lab) in enumerate(rows):
  y=G+r*(H+T+G); d.text((G,y+12),lab,fill='#2ea3f2',font=f)
  fs=sorted(x for x in os.listdir('out/preview') if x.startswith('tripnerd-story-'+k+'-'))
  for i,x in enumerate(fs): S.paste(Image.open('out/preview/'+x).convert('RGB').resize((W,H)),(G+i*(W+G),y+T))
S.save('tripnerd-story-week-preview.jpg',quality=82)
