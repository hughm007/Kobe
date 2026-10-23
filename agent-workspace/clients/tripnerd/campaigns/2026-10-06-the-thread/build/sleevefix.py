#!/usr/bin/env python3
# Turn-shot touch-up 2, frame by frame, no generation: small generated white marks on the man's navy polo (sleeve and chest).
# Inside the large navy polo component, light low-saturation specks (10-900 px) whose surrounding ring is mostly navy are
# filled with the local navy (the foam and glass of the cup, skin, and the collar edge are not surrounded by navy, so they stay).
# Usage: python3 sleevefix.py SRC DST [test t ...]
import sys, subprocess, numpy as np, cv2
SRC,DST=sys.argv[1],sys.argv[2]; W,H=1080,1912
def fix(fr):
    hsv=cv2.cvtColor(fr,cv2.COLOR_RGB2HSV); h,s,v=hsv[...,0].astype(int),hsv[...,1].astype(int),hsv[...,2].astype(int)
    navy=((h>=100)&(h<=128)&(s>=60)&(v>=20)&(v<=160)).astype(np.uint8)
    nf=navy.astype(np.float32); m31=np.maximum(cv2.blur(nf,(31,31)),1e-3)
    lv=cv2.blur(v.astype(np.float32)*nf,(31,31))/m31; ls=cv2.blur(s.astype(np.float32)*nf,(31,31))/m31
    light=((v>lv+42)&(s<ls-28)&(m31>0.6)&(v>=95)).astype(np.uint8)   # brighter and greyer than the surrounding navy fabric
    n,lab,st,_=cv2.connectedComponentsWithStats(light,8)
    mark=np.zeros_like(light); k=0
    for i in range(1,n):
        x,y,w,hh,a=st[i]
        if a<12 or a>500 or w>60 or hh>40: continue
        comp=(lab[max(0,y-1):y+hh+1,max(0,x-1):x+w+1]==i).astype(np.uint8)
        ring=cv2.dilate(comp,np.ones((3,3),np.uint8),iterations=6)-cv2.dilate(comp,np.ones((3,3),np.uint8),iterations=2)
        y0,x0=max(0,y-1),max(0,x-1); nv=navy[y0:y0+comp.shape[0],x0:x0+comp.shape[1]]
        if ring.shape!=nv.shape: continue
        if ring.sum()==0 or (nv[ring>0].mean()<0.8): continue
        mark[y0:y0+comp.shape[0],x0:x0+comp.shape[1]]|=comp; k+=1
    if mark.sum()==0: return fr,0
    mark=cv2.dilate(mark,np.ones((3,3),np.uint8),iterations=2)
    keep=((navy>0)&(mark==0)).astype(np.float32); f32=fr.astype(np.float32); kk=31
    col=np.dstack([cv2.blur(f32[...,c]*keep,(kk,kk))/np.maximum(cv2.blur(keep,(kk,kk)),1e-3) for c in range(3)])
    rng=np.random.default_rng(int(mark.sum())); col=col+rng.normal(0,2.0,col.shape)
    a=np.clip(cv2.GaussianBlur(mark.astype(np.float32),(0,0),1.5)*1.5,0,1)[...,None]
    return (f32*(1-a)+col*a).clip(0,255).astype(np.uint8),int(mark.sum())
if len(sys.argv)>3 and sys.argv[3]=='test':
    tiles=[]
    for t in sys.argv[4:]:
        raw=subprocess.run(['ffmpeg','-v','error','-ss',t,'-i',SRC,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
        fr=np.frombuffer(raw,np.uint8).reshape(H,W,3); out,k=fix(fr); print(t,'mask px',k)
        tiles.append(np.concatenate([fr[1050:1500,0:760],out[1050:1500,0:760]],axis=1))
    from PIL import Image; Image.fromarray(np.concatenate(tiles,axis=0)).resize((760,450*len(tiles)//2)).save('out/sleeve_test.jpg',quality=88); sys.exit()
dec=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r','24','-i','-','-i',SRC,'-map','0:v','-map','1:a?','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy',DST],stdin=subprocess.PIPE)
ks=[]
while True:
    b=dec.stdout.read(W*H*3)
    if len(b)<W*H*3: break
    out,k=fix(np.frombuffer(b,np.uint8).reshape(H,W,3)); enc.stdin.write(out.tobytes()); ks.append(k)
enc.stdin.close(); enc.wait(); print('frames',len(ks),'mask px per frame',ks)
