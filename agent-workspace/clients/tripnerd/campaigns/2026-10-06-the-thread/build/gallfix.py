#!/usr/bin/env python3
# Landing clip (4k, locked camera) touch-up, frame by frame: (1) the small generated roundels on the gallery chair backs are
# detected by local brightness contrast inside the chair-green mask and filled with the local chair colour; (2) the two kelly-green
# knits on seated patrons are hue-shifted to navy inside fixed boxes. No generation. Usage: python3 gallfix.py [test]
import sys, subprocess, numpy as np, cv2
from PIL import Image
SRC='/home/user/owner/A4k_clean.mp4'; DST='/home/user/owner/A4k_clean2.mp4'; W,H=3840,2160
BAND=(1850,835,2600,905)                      # x0,y0,x1,y1: the empty chair backs behind the rope
KNITS=[(2370,800,2590,1010),(2990,880,3170,1050)]
def fix(fr):
    out=fr.copy()
    hsv=np.array(Image.fromarray(fr).convert('HSV')).astype(np.int16); h,s,v=hsv[...,0],hsv[...,1],hsv[...,2]
    # (1) chair roundels
    x0,y0,x1,y1=BAND; sub=fr[y0:y1,x0:x1].astype(np.float32); hh,ss,vv=h[y0:y1,x0:x1],s[y0:y1,x0:x1],v[y0:y1,x0:x1]
    chair=((hh>=55)&(hh<=125)&(ss>=35)&(vv>=60)&(vv<=175)).astype(np.float32)
    lum=sub.mean(axis=2); k=31
    cm=cv2.blur(chair,(k,k)); lm=cv2.blur(lum*chair,(k,k))/np.maximum(cm,1e-3)
    mark=(chair>0)&(lum>lm+16)&(cm>0.5)
    mark=cv2.dilate(mark.astype(np.uint8),np.ones((3,3),np.uint8),iterations=2)>0
    keep=(chair>0)&~mark
    col=np.dstack([cv2.blur(sub[...,c]*keep,(21,21))/np.maximum(cv2.blur(keep.astype(np.float32),(21,21)),1e-3) for c in range(3)])
    a=cv2.GaussianBlur(mark.astype(np.float32),(0,0),1.2)[...,None]
    out[y0:y1,x0:x1]=(sub*(1-a)+col*a).clip(0,255).astype(np.uint8)
    # (2) green knits -> charcoal (a soft hue-membership alpha so the garment edge carries no green fringe)
    for (x0,y0,x1,y1) in KNITS:
        hh,ss,vv=h[y0:y1,x0:x1].astype(np.float32),s[y0:y1,x0:x1].astype(np.float32),v[y0:y1,x0:x1].astype(np.float32)
        a=np.clip((hh-70)/8,0,1)*np.clip((132-hh)/8,0,1)*np.clip((ss-28)/12,0,1)*np.clip((vv-35)/15,0,1)
        a=cv2.morphologyEx(a,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8)); a=cv2.GaussianBlur(a,(0,0),1.2)
        sh=np.dstack([np.full(hh.shape,150,np.float32),ss*0.18,vv*0.58]).clip(0,255).astype(np.uint8)
        char=np.array(Image.fromarray(sh,'HSV').convert('RGB')).astype(np.float32)
        out[y0:y1,x0:x1]=(out[y0:y1,x0:x1].astype(np.float32)*(1-a[...,None])+char*a[...,None]).clip(0,255).astype(np.uint8)
    return out,int(mark.sum())
if len(sys.argv)>1 and sys.argv[1]=='test':
    raw=subprocess.run(['ffmpeg','-v','error','-ss','1.6','-i',SRC,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(H,W,3); out,n=fix(fr); print('mark px',n)
    a=np.concatenate([fr[820:1060,1880:3200],out[820:1060,1880:3200]],axis=0)
    Image.fromarray(a).resize((1320,480)).save('out/gallfix_test.jpg',quality=88); sys.exit()
dec=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r','24','-i','-','-i',SRC,'-map','0:v','-map','1:a?','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy',DST],stdin=subprocess.PIPE)
n=0; tot=0
while True:
    b=dec.stdout.read(W*H*3)
    if len(b)<W*H*3: break
    out,m=fix(np.frombuffer(b,np.uint8).reshape(H,W,3)); enc.stdin.write(out.tobytes()); n+=1; tot+=m
enc.stdin.close(); enc.wait(); print('frames',n,'mark px total',tot)
