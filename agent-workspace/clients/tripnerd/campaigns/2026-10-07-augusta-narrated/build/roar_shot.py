#!/usr/bin/env python3
# Rebuild the "roar" golf shot of TripNerd_Augusta_Narrated.mp4 (ad frames 545-682 @30 fps) from the source clip:
#  - same timing as the original edit (source time = 0.917 + (ad time - 18.667) * 0.3125, i.e. 0.3125x slow motion)
#  - in-between frames made by optical-flow interpolation (DIS) instead of repeated frames
#  - the source camera's push-in and tilt are locked at the shot's opening framing (ECC affine per source frame,
#    every frame warped back to the reference; the thin borders it no longer covers are filled from the reference frame)
#  - the faint generated emblem on the flag painted out (local-contrast fill, as in the earlier flag fix)
#  - no burned-in caption (the caption is composited later)
# Writes base_roar.npy-free output: roar_base.mp4 (1080x1920, 30 fps, frames for ad 545..682, crf 10)
import subprocess, numpy as np, cv2, sys
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
SRC='/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/49f52dc1-hf_20261006_223701_adac6b4d-bc48-41d3-b00b-b8bc0a89a4c7.mp4'
N0,N1=545,683                     # ad frames to rebuild [N0,N1)
X0,WW,HH=657,607,1080             # 9:16 window in the 1920x1080 source
OW,OH=1080,1920
def src_time(n): return 0.917+(n/30.0-18.667)*0.3125
raw=subprocess.run([FF,'-v','error','-i',SRC,'-pix_fmt','rgb24','-f','rawvideo','-'],capture_output=True).stdout
S=np.frombuffer(raw,np.uint8).reshape(-1,1080,1920,3); NS=len(S)
k_lo=max(0,int(np.floor(src_time(N0)*24))-1); k_hi=min(NS-1,int(np.ceil(src_time(N1-1)*24))+1)
REFK=int(round(src_time(N0+10)*24))   # the opening framing of the shot (first pure frame after the dissolve)
print('source frames %d..%d, reference %d'%(k_lo,k_hi,REFK))
# ---- camera motion of every source frame relative to the reference (half res, full frame) ----
g=lambda k: cv2.resize(cv2.cvtColor(S[k],cv2.COLOR_RGB2GRAY),(960,540)).astype(np.float32)
R=g(REFK); Wk={}
for k in range(k_lo,k_hi+1):
    W=np.eye(2,3,dtype=np.float32)
    if k!=REFK:
        _,W=cv2.findTransformECC(R,g(k),W,cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,300,1e-6),None,5)
    W=W.copy(); W[:,2]*=2.0; Wk[k]=W     # to full-res coordinates
# smooth the parameters over time (quadratic fit) so the lock never jitters
ks=np.array(sorted(Wk)); P=np.array([Wk[k].ravel() for k in ks])
co=[np.polyfit(ks,P[:,j],2) for j in range(6)]
def W_at(kf): return np.array([np.polyval(c,kf) for c in co],np.float32).reshape(2,3)
for k in [ks[0],REFK,ks[-1]]:
    W=W_at(k); print('k %d scale %.3f shift %.1f %.1f'%(k,np.sqrt(abs(np.linalg.det(W[:,:2]))),W[0,2],W[1,2]))
# ---- optical-flow interpolation between neighbouring source frames ----
dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
flows={}
def flow(k):
    if k not in flows:
        a=cv2.cvtColor(S[k],cv2.COLOR_RGB2GRAY); b=cv2.cvtColor(S[k+1],cv2.COLOR_RGB2GRAY)
        flows[k]=(dis.calc(a,b,None),dis.calc(b,a,None))
    return flows[k]
gx,gy=np.meshgrid(np.arange(1920,dtype=np.float32),np.arange(1080,dtype=np.float32))
def interp(sf):
    k=int(np.floor(sf)); f=sf-k
    if f<1e-3 or k+1>=NS: return S[k].astype(np.float32)
    fab,fba=flow(k)
    A=cv2.remap(S[k],gx-f*fab[...,0],gy-f*fab[...,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    B=cv2.remap(S[k+1],gx-(1-f)*fba[...,0],gy-(1-f)*fba[...,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    return A if f<0.5 else B          # nearest warped frame: no double image where the flow cannot follow the small ball
# ---- flag emblem paint-out (local contrast inside the yellow flag), on the output frame ----
def flagfix(img):
    reg=img[0:900].astype(np.int16); r,gg,b=reg[...,0],reg[...,1],reg[...,2]
    yellow=((r>150)&(gg>120)&(b<140)&((r-b)>70)&(r>=gg)).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(yellow,8)
    if n<2: return img,0
    i=1+int(np.argmax(st[1:,4])); flag=(lab==i).astype(np.uint8)
    flag=cv2.morphologyEx(flag,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8))   # fill the emblem lines into the flag area
    inner=cv2.erode(flag,np.ones((3,3),np.uint8),iterations=8)
    lum=(0.299*r+0.587*gg+0.114*b).astype(np.float32); yf=((lab==i)).astype(np.float32)
    lm=cv2.blur(lum*yf,(41,41))/np.maximum(cv2.blur(yf,(41,41)),1e-3)
    emb=((inner>0)&(lum<lm-20)).astype(np.uint8)
    emb=cv2.dilate(emb,np.ones((3,3),np.uint8),iterations=3)&inner
    k=int(emb.sum())
    if k==0: return img,0
    keep=((lab==i)&(emb==0)).astype(np.float32); f=reg.astype(np.float32)
    col=np.dstack([cv2.blur(f[...,c]*keep,(25,25))/np.maximum(cv2.blur(keep,(25,25)),1e-3) for c in range(3)])
    a=cv2.GaussianBlur(emb.astype(np.float32),(0,0),1.5)[...,None]
    out=img.copy(); out[0:900]=(f*(1-a)+col*a).clip(0,255).astype(np.uint8); return out,k
REF=S[REFK].astype(np.float32)
enc=subprocess.Popen([FF,'-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(OW,OH),'-r','30','-i','-','-c:v','libx264','-preset','slow','-crf','10','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','roar_base.mp4'],stdin=subprocess.PIPE)
ek=[]
for n in range(N0,N1):
    sf=src_time(n)*24; F=interp(sf); W=W_at(sf)
    warped=cv2.warpAffine(F,W,(1920,1080),flags=cv2.INTER_LANCZOS4|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_REPLICATE)
    cov=cv2.warpAffine(np.ones((1080,1920),np.float32),W,(1920,1080),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_CONSTANT,borderValue=0)
    cov=cv2.GaussianBlur(cv2.erode(cov,np.ones((5,5),np.uint8),iterations=6),(0,0),14)[...,None]
    fr=warped*cov+REF*(1-cov)
    win=fr[:,X0:X0+WW]
    out=cv2.resize(win,(OW,OH),interpolation=cv2.INTER_LANCZOS4).clip(0,255).astype(np.uint8)
    out,k=flagfix(out); ek.append(k)
    enc.stdin.write(out.tobytes())
enc.stdin.close(); enc.wait()
print('frames',N1-N0,'emblem px per frame (first/mid/last):',ek[0],ek[len(ek)//2],ek[-1])
