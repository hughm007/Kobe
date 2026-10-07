#!/usr/bin/env python3
# Landing clip (4k; the camera tilts, so the boxes follow it by phase correlation, v7.1) touch-up, frame by frame: (1) the small generated roundels on the gallery chair backs are
# detected by local brightness contrast inside the chair-green mask and filled with the local chair colour; (2) the two kelly-green
# knits on seated patrons are hue-shifted to navy inside fixed boxes. No generation. Usage: python3 gallfix.py [test]
import sys, subprocess, numpy as np, cv2
from PIL import Image
SRC='/home/user/owner/A4k_clean.mp4'; DST='/home/user/owner/A4k_clean3.mp4'; W,H=3840,2160
BAND=(1850,835,2600,905)                      # x0,y0,x1,y1: the empty chair backs behind the rope
KNITS=[(2370,800,2590,1010),(2970,860,3260,1070)]
REF=None
def offset(fr):
    # camera tilt/pan relative to the reference frame (source 1.6 s, where the boxes were drawn): phase correlation on a quarter-res grey crop
    g=cv2.cvtColor(fr[400:1400,1400:3200],cv2.COLOR_RGB2GRAY); g=cv2.resize(g,(450,250)).astype(np.float32)
    (dx,dy),_=cv2.phaseCorrelate(REF,g); return int(round(dx*4)),int(round(dy*4))
def fix(fr):
    global BAND,KNITS
    dx,dy=offset(fr); B0,K0=BAND,KNITS
    cl=lambda a,b,c,d:(max(0,min(W-2,a)),max(0,min(H-2,b)),max(1,min(W,c)),max(1,min(H,d)))
    BAND=cl(B0[0]+dx,B0[1]+dy-20,B0[2]+dx,B0[3]+dy+20); KNITS=[k for k in (cl(a+dx,b+dy,c+dx,d+dy) for a,b,c,d in K0) if k[2]-k[0]>8 and k[3]-k[1]>8]
    try: return _fix(fr)
    finally: BAND,KNITS=B0,K0
def _fix(fr):
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
def _ref():
    global REF
    raw=subprocess.run(['ffmpeg','-v','error','-ss','1.6','-i',SRC,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(H,W,3); g=cv2.cvtColor(fr[400:1400,1400:3200],cv2.COLOR_RGB2GRAY); REF=cv2.resize(g,(450,250)).astype(np.float32)
_ref()
if len(sys.argv)>1 and sys.argv[1]=='test':
    tiles=[]
    for t in sys.argv[2:]:
        raw=subprocess.run(['ffmpeg','-v','error','-ss',t,'-i',SRC,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
        fr=np.frombuffer(raw,np.uint8).reshape(H,W,3); print(t,'offset',offset(fr)); out,n=fix(fr); print('  mark px',n)
        dx,dy=offset(fr); y0=max(0,780+dy); x0=max(0,1800+dx)
        tiles.append(np.concatenate([fr[y0:y0+300,x0:x0+1400],out[y0:y0+300,x0:x0+1400]],axis=0))
    Image.fromarray(np.concatenate(tiles,axis=0)).resize((1050,450*len(tiles))).save('out/gallfix_test.jpg',quality=85); sys.exit()
dec=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r','24','-i','-','-i',SRC,'-map','0:v','-map','1:a?','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy',DST],stdin=subprocess.PIPE)
n=0; tot=0
while True:
    b=dec.stdout.read(W*H*3)
    if len(b)<W*H*3: break
    out,m=fix(np.frombuffer(b,np.uint8).reshape(H,W,3)); enc.stdin.write(out.tobytes()); n+=1; tot+=m
enc.stdin.close(); enc.wait(); print('frames',n,'mark px total',tot)
