# Flag close-ups for the emblem check: per frame, the yellow fabric right of the tracked stick, cropped to its box (+30 px) at
# native 4k, tiled 4x3 per sheet (fl_<tag>_<k>.jpg). Usage (in clip/): python3 ../flagsheet.py <video> <tag> [first_raw_frame]
import subprocess, numpy as np, json, sys
from PIL import Image, ImageDraw
SRC=sys.argv[1]; TAG=sys.argv[2]; OFF=int(sys.argv[3]) if len(sys.argv)>3 else 0; W,H=3840,2160; FB=W*H*3
TRK={o['n']:o for o in json.load(open('track.json'))}
p=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
tiles=[]; i=0
while True:
    b=p.stdout.read(FB)
    if len(b)<FB: break
    f=np.frombuffer(b,np.uint8).reshape(H,W,3); r,g,bl=[f[...,k].astype(np.int16) for k in range(3)]
    px=(TRK.get(i+OFF,{}).get('pole') or 2000); px=px if 1500<px<2600 else 2000
    y=(r>200)&(g>165)&(bl<120)&((r-bl)>90); y[1300:]=False; y[:,:max(0,px-60)]=False; y[:,min(W,px+900):]=False
    ys,xs=np.where(y)
    if len(xs)>2000:
        x0,x1=np.percentile(xs,[0.5,99.5]).astype(int); y0,y1=np.percentile(ys,[0.5,99.5]).astype(int)
        c=Image.fromarray(f[max(0,y0-30):y1+30,max(0,x0-30):x1+30]); c.thumbnail((400,300),Image.LANCZOS)
        t=Image.new('RGB',(400,300)); t.paste(c,(0,0)); ImageDraw.Draw(t).text((4,284),'%s%d'%(TAG,i+OFF),fill=(255,0,0)); tiles.append(t)
    i+=1
for s in range(0,len(tiles),12):
    G=Image.new('RGB',(1600,900))
    for k,t in enumerate(tiles[s:s+12]): G.paste(t,((k%4)*400,(k//4)*300))
    G.save('fl_%s_%d.jpg'%(TAG,s//12),quality=72)
print(TAG,'flag tiles',len(tiles),'sheets',(len(tiles)+11)//12)
