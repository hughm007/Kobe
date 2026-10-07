#!/usr/bin/env python3
# Turn-shot touch-up, frame by frame, no generation: the video model put a white-bordered oval badge with text-like marks on
# the front of the man's plain navy cap. The cap is the highest large navy component; inside its eroded convex hull the light
# pixels (badge border, pale field, marks) form the badge core; a 1.3x oval fitted to that core, clipped to the cap, is filled
# with the cap's own surrounding navy (local mean, fine grain) through a soft edge.
# Usage: python3 capfix.py SRC DST [test t ...]
import sys, subprocess, numpy as np, cv2
SRC,DST=sys.argv[1],sys.argv[2]; W,H=1080,1912
def fix(fr):
    hsv=cv2.cvtColor(fr,cv2.COLOR_RGB2HSV); h,s,v=hsv[...,0].astype(int),hsv[...,1].astype(int),hsv[...,2].astype(int)
    navy=((h>=100)&(h<=128)&(s>=70)&(v>=25)&(v<=150)).astype(np.uint8); navy[int(H*0.62):]=0
    navy=cv2.morphologyEx(navy,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(navy,8)
    cands=[i for i in range(1,n) if 1500<st[i,4]<120000 and st[i,1]<H*0.5]
    if not cands: return fr,0,None
    cap=min(cands,key=lambda i: st[i,1])          # the highest navy blob is the cap (the polo starts lower)
    m=(lab==cap).astype(np.uint8); cnts,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    hull=np.zeros_like(m); cv2.fillPoly(hull,[cv2.convexHull(max(cnts,key=cv2.contourArea))],1)
    hull=cv2.erode(hull,np.ones((5,5),np.uint8),iterations=2)
    light=((v>=135)&((s<=110)|((h>=95)&(h<=130))))&(m==0)
    mark=(light&(hull>0)).astype(np.uint8)
    if mark.sum()<25: return fr,0,st[cap]
    mark=cv2.morphologyEx(mark,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
    k2,l2,s2,_=cv2.connectedComponentsWithStats(mark,8)
    if k2<2: return fr,0,st[cap]
    big=1+int(np.argmax(s2[1:,4]))
    full=np.zeros_like(mark)
    c,_=cv2.findContours((l2==big).astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); pts=np.vstack(c)
    cv2.fillPoly(full,[cv2.convexHull(pts)],1)
    if len(pts)>=5:                                # the badge is an oval patch: cover a 1.3x oval fitted to its light core
        (cx,cy),(ew,eh),ang=cv2.fitEllipse(pts); cv2.ellipse(full,((cx,cy),(ew*1.3,eh*1.3),ang),1,-1)
    capfull=np.zeros_like(m); cv2.fillPoly(capfull,[cv2.convexHull(max(cnts,key=cv2.contourArea))],1)
    mark=cv2.dilate(full,np.ones((3,3),np.uint8),iterations=4)&capfull
    keep=((m>0)&(mark==0)).astype(np.float32)                 # the cap's own navy around the badge
    f32=fr.astype(np.float32); k=61
    col=np.dstack([cv2.blur(f32[...,c]*keep,(k,k))/np.maximum(cv2.blur(keep,(k,k)),1e-3) for c in range(3)])
    col2=np.dstack([cv2.blur(f32[...,c]*keep,(151,151))/np.maximum(cv2.blur(keep,(151,151)),1e-3) for c in range(3)])
    den=cv2.blur(keep,(k,k))[...,None]; col=np.where(den>0.02,col,col2)
    rng=np.random.default_rng(int(mark.sum())); col=col+rng.normal(0,2.2,col.shape)
    a=cv2.GaussianBlur(mark.astype(np.float32),(0,0),2.5)[...,None]; a=np.clip(a*1.4,0,1)
    out=(f32*(1-a)+col*a).clip(0,255).astype(np.uint8)
    return out,int(mark.sum()),st[cap]
if len(sys.argv)>3 and sys.argv[3]=='test':
    tiles=[]
    for t in sys.argv[4:]:
        raw=subprocess.run(['ffmpeg','-v','error','-ss',t,'-i',SRC,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
        fr=np.frombuffer(raw,np.uint8).reshape(H,W,3); out,k,b=fix(fr); print(t,'mask px',k,'cap bbox',None if b is None else b[:4].tolist())
        x,y,w,hh=(b[:4] if b is not None else (300,300,300,200)); x0=max(0,x-60); y0=max(0,y-40)
        tiles.append(np.concatenate([fr[y0:y0+260,x0:x0+380],out[y0:y0+260,x0:x0+380]],axis=1))
    from PIL import Image; Image.fromarray(np.concatenate(tiles,axis=0)).save('out/capfix_test.jpg',quality=90); sys.exit()
dec=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r','24','-i','-','-i',SRC,'-map','0:v','-map','1:a?','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy',DST],stdin=subprocess.PIPE)
ks=[]
while True:
    b=dec.stdout.read(W*H*3)
    if len(b)<W*H*3: break
    out,k,_=fix(np.frombuffer(b,np.uint8).reshape(H,W,3)); enc.stdin.write(out.tobytes()); ks.append(k)
enc.stdin.close(); enc.wait(); print('frames',len(ks),'mask px per frame',ks)
