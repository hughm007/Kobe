#!/usr/bin/env python3
# Clip A (4k, 24 fps): per-frame flagstick and ball positions, measured at 1920x1080 and reported in 4k px.
# The putting surface = rows that are almost all bright lawn green (the gallery rows fail this); the stick = the column
# with the most near-white pixels; the ball = the near-white blob on the putting surface away from the stick, followed
# frame to frame. Writes clip/track.json. Usage: python3 track.py <video> [marks t1,t2,...]
import sys, json, subprocess, numpy as np
SRC=sys.argv[1]; W,H=1920,1080; FB=W*H*3
p=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-vf','scale=%d:%d'%(W,H),'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
out=[]; prev=None; n=0
while True:
    b=p.stdout.read(FB)
    if len(b)<FB: break
    f=np.frombuffer(b,np.uint8).reshape(H,W,3).astype(np.int16); r,g,bl=f[...,0],f[...,1],f[...,2]
    mn=f.min(2); mx=f.max(2); white=(mn>165)&((mx-mn)<55)
    lawn=(g>r+12)&(g>bl+12)&(g>110)
    rows=np.where(lawn.mean(1)>0.85)[0]
    ytop=int(rows.min()) if len(rows)>20 else None
    cs=np.convolve(white.sum(0),np.ones(3),'same'); px=int(np.argmax(cs)) if cs.max()>90 else None
    base=None
    if px is not None:
        ys=np.where(white[:,max(0,px-3):px+4].any(1))[0]; base=int(ys.max()) if len(ys) else None
    ball=None
    if ytop is not None:
        m=white.copy(); m[:ytop+3]=False
        if px is not None: m[:,max(0,px-8):px+9]=False
        ys,xs=np.where(m)
        if len(xs):
            if prev is not None:
                d=(xs-prev[0])**2+(ys-prev[1])**2; s=d<70**2
                if s.sum()>=3: xs,ys=xs[s],ys[s]
            Hh,xe,ye=np.histogram2d(xs,ys,bins=[np.arange(0,W+16,16),np.arange(0,H+16,16)])
            i,j=np.unravel_index(np.argmax(Hh),Hh.shape); cx,cy=xe[i]+8,ye[j]+8
            s=((xs-cx)**2+(ys-cy)**2)<24**2
            if 3<=s.sum()<=900: ball=(float(xs[s].mean()),float(ys[s].mean()),int(s.sum())); prev=ball
    out.append(dict(n=n,t=round(n/24,4),lawn_top=None if ytop is None else ytop*2,pole=None if px is None else px*2,
                    base=None if base is None else base*2,ball=None if ball is None else [round(ball[0]*2,1),round(ball[1]*2,1),ball[2]]))
    n+=1
json.dump(out,open('track.json','w'))
for o in out:
    d=None
    if o['ball'] and o['pole'] and o['base']: d=round(((o['ball'][0]-o['pole'])**2+(o['ball'][1]-o['base'])**2)**.5)
    print(o['n'],o['t'],'lawn',o['lawn_top'],'pole',o['pole'],'base',o['base'],'ball',o['ball'],'d',d)
