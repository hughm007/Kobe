#!/usr/bin/env python3
# Clip A flag clean-up, v3 (Augusta A4). The generated flag carries a thin dark outline emblem; flagfix2's local-contrast
# paint-out left half-erased outlines and fill smudges on several frames (checked at native 4k). This version works on the
# raw 4k frames: the flag = the yellow component hanging from the tracked stick, with its enclosed holes (the emblem's dark
# lines) filled; well inside that shape, strokes darker than the local (61 px) flag luminance are inpainted (Telea) and the result is
# median-smoothed (25 px), which removes the drawing and keeps the broad fold shading; the replacement is feathered in. No generation.
# Usage: python3 flagfix3.py <raw 4k> <track.json> <out.mp4> [n_frames]   |   python3 flagfix3.py test <raw> <track.json> n1,n2,...
import sys, json, subprocess, numpy as np, cv2
W,H=3840,2160; FB=W*H*3; K=25; INSET=10; DTH=7
def fix(f,px):
    x0=max(0,px-60); x1=min(W,px+1000); y1=1400
    roi=f[:y1,x0:x1]; r,g,b=[roi[...,k].astype(np.int16) for k in range(3)]
    yel=((r>130)&(g>100)&(b<140)&((r-b)>55)).astype(np.uint8)
    yel=cv2.morphologyEx(yel,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(yel,8)
    best=0; ba=0
    for i in range(1,n):
        if st[i,cv2.CC_STAT_LEFT]<=(px-x0)+140 and st[i,cv2.CC_STAT_AREA]>ba: best,ba=i,st[i,cv2.CC_STAT_AREA]
    if best==0 or ba<3000: return f,0
    m=(lab==best).astype(np.uint8)
    inv=(1-m).copy(); ff=inv.copy(); hh,ww=ff.shape; mask=np.zeros((hh+2,ww+2),np.uint8)
    for sx,sy in [(0,0),(ww-1,0),(0,hh-1),(ww-1,hh-1)]:
        if ff[sy,sx]==1: cv2.floodFill(ff,mask,(sx,sy),2)
    holes=(ff==1).astype(np.uint8); full=np.maximum(m,holes)
    inner=cv2.erode(full,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*INSET+1,2*INSET+1)))
    if inner.sum()==0: return f,0
    # dark strokes = well below the local flag luminance (fold shading is broad, so it stays above this test)
    lum=(0.299*r+0.587*g+0.114*b).astype(np.float32); fi=inner.astype(np.float32)
    lm=cv2.blur(lum*fi,(61,61))/np.maximum(cv2.blur(fi,(61,61)),1e-3)
    dark=((lum<lm-DTH)&(inner>0)).astype(np.uint8)
    dark=cv2.dilate(dark,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(11,11)))&inner
    src=np.ascontiguousarray(roi)
    if dark.sum(): src=cv2.inpaint(src,dark,9,cv2.INPAINT_TELEA)
    sm=cv2.GaussianBlur(cv2.medianBlur(src,K),(0,0),1.2)
    a=cv2.GaussianBlur(inner.astype(np.float32),(0,0),3.0)*full
    out=(roi.astype(np.float32)*(1-a[...,None])+sm.astype(np.float32)*a[...,None]).clip(0,255).astype(np.uint8)
    g2=f.copy(); g2[:y1,x0:x1]=out; return g2,int(holes.sum())
TR={o['n']:o for o in json.load(open(sys.argv[3] if sys.argv[1]=='test' else sys.argv[2]))}
def pole(n):
    for k in (n,n+1,n-1,n+2,n-2):
        if k in TR and TR[k]['pole'] and 1500<TR[k]['pole']<2600: return TR[k]['pole']
    return 2000
if sys.argv[1]=='test':
    from PIL import Image
    SRC=sys.argv[2]; ns=[int(x) for x in sys.argv[4].split(',')]; tiles=[]
    for n in ns:
        raw=subprocess.run(['ffmpeg','-v','error','-i',SRC,'-vf',"select='eq(n\\,%d)'"%n,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
        f=np.frombuffer(raw,np.uint8).reshape(H,W,3); g,hc=fix(f,pole(n)); px=pole(n)
        ys,xs=np.where((f[:1400,max(0,px-60):px+1000,0].astype(int)-f[:1400,max(0,px-60):px+1000,2])>90)
        yy0,yy1=(max(0,ys.min()-20),min(1400,ys.max()+20)) if len(ys) else (0,700); xx0=max(0,px-60); xx1=min(W,px+1000)
        a=Image.fromarray(np.concatenate([f[yy0:yy1,xx0:xx1],g[yy0:yy1,xx0:xx1]],1)); a.thumbnail((800,330)); tiles.append(a); print(n,'holes px',hc)
    G=Image.new('RGB',(800*2,330*((len(tiles)+1)//2)))
    for k,t in enumerate(tiles): G.paste(t,((k%2)*800,(k//2)*330))
    G.save('ff3_test.jpg',quality=80); sys.exit()
SRC,OUT=sys.argv[1],sys.argv[3]; NF=int(sys.argv[4]) if len(sys.argv)>4 else 81
dec=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-frames:v',str(NF),'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r','24','-i','-','-i',SRC,'-map','0:v','-map','1:a?','-shortest',
     '-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','192k',OUT],stdin=subprocess.PIPE)
n=0; log=[]
while n<NF:
    b=dec.stdout.read(FB)
    if len(b)<FB: break
    g,hc=fix(np.frombuffer(b,np.uint8).reshape(H,W,3),pole(n)); enc.stdin.write(g.tobytes()); log.append(hc); n+=1
enc.stdin.close(); enc.wait(); print('frames',n,'hole px per frame',log)
