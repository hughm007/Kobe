#!/usr/bin/env python3
# Turn-shot touch-up 3, frame by frame, no generation: the generated script-like mark on the hem of the man's left sleeve
# (the toasting arm), which sits against the forearm skin, so sleevefix's "ringed by navy" rule misses it. In the lower-left
# region where the sleeve hem travels, pixels much brighter and greyer than the local navy fabric, in clusters next to navy,
# are filled with the local navy. Usage: python3 hemfix.py SRC DST [test t ...]
import sys, subprocess, numpy as np, cv2
SRC,DST=sys.argv[1],sys.argv[2]; W,H=1080,1912; X0,X1,Y0,Y1=0,520,850,1400
def fix(fr):
    sub=fr[Y0:Y1,X0:X1]; hsv=cv2.cvtColor(sub,cv2.COLOR_RGB2HSV); h,s,v=[hsv[...,i].astype(np.float32) for i in range(3)]
    navy=((h>=100)&(h<=128)&(s>=60)&(v>=20)&(v<=160)).astype(np.float32)
    m=np.maximum(cv2.blur(navy,(25,25)),1e-3); lv=cv2.blur(v*navy,(25,25))/m; ls=cv2.blur(s*navy,(25,25))/m
    cand=((v>lv+35)&(s<ls-22)&(m>0.35)&(v>=90)&(navy==0)).astype(np.uint8)
    skin=((h>=0)&(h<=25)&(s>=40)&(v>=80)).astype(np.uint8)
    cand&=(cv2.dilate(skin,np.ones((3,3),np.uint8),iterations=1)==0).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(cand,8); mark=np.zeros_like(cand)
    for i in range(1,n):
        if 4<=st[i,4]<=700 and st[i,2]<=90 and st[i,3]<=60: mark[lab==i]=1
    if mark.sum()==0: return fr,0
    mark=cv2.dilate(cv2.morphologyEx(mark,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8)),np.ones((3,3),np.uint8),iterations=2)
    mark&=(skin==0).astype(np.uint8)
    keep=((navy>0)&(mark==0)).astype(np.float32); f=sub.astype(np.float32); k=31
    col=np.dstack([cv2.blur(f[...,c]*keep,(k,k))/np.maximum(cv2.blur(keep,(k,k)),1e-3) for c in range(3)])
    col+=np.random.default_rng(int(mark.sum())).normal(0,2.0,col.shape)
    a=np.clip(cv2.GaussianBlur(mark.astype(np.float32),(0,0),1.3)*1.6,0,1)[...,None]
    out=fr.copy(); out[Y0:Y1,X0:X1]=(f*(1-a)+col*a).clip(0,255).astype(np.uint8); return out,int(mark.sum())
if len(sys.argv)>3 and sys.argv[3]=='test':
    tiles=[]
    for t in sys.argv[4:]:
        raw=subprocess.run(['ffmpeg','-v','error','-ss',t,'-i',SRC,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
        fr=np.frombuffer(raw,np.uint8).reshape(H,W,3); out,k=fix(fr); print(t,'mask px',k)
        tiles.append(np.concatenate([fr[980:1230,0:300],out[980:1230,0:300]],axis=1))
    from PIL import Image; Image.fromarray(np.concatenate(tiles,axis=0)).save('out/hem_test.jpg',quality=88); sys.exit()
dec=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r','24','-i','-','-i',SRC,'-map','0:v','-map','1:a?','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy',DST],stdin=subprocess.PIPE)
ks=[]
while True:
    b=dec.stdout.read(W*H*3)
    if len(b)<W*H*3: break
    out,k=fix(np.frombuffer(b,np.uint8).reshape(H,W,3)); enc.stdin.write(out.tobytes()); ks.append(k)
enc.stdin.close(); enc.wait(); print('frames',len(ks),'mask px per frame',ks)
