import cv2, numpy as np, json, subprocess, sys
sys.path.insert(0, sys.path[0]); import patch
W='/tmp/claude-0/-home-user-Kobe/411896a1-4643-5966-b007-9108eefe8cbf/scratchpad/phx'
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
t=json.load(open(W+'/track.json')); valid=set(json.load(open(W+'/valid.json')))
Hs={n: np.array(t[str(n)]['H']) for n in valid}
for n in range(228, 238): Hs[n] = np.array(t['238']['H'])
for n in range(388, 390): Hs[n] = np.array(t['390']['H'])         # fade-in: ticket static at frame 238's transform
for n in range(841, 844): Hs[n] = np.array(t['838']['H'])         # fade-out: static at frame 838's transform
for n in range(844, 929): Hs.pop(n, None)                         # end card: matches are the end-card logo, line not present
# reference delta (clean full ticket, frame 13.5 s): corrected - original, line-1 zone only
ref=cv2.imread(W+'/f_13.5.png'); refc,_=patch.patch(ref, np.eye(3))
D=(refc.astype(np.float32)-ref.astype(np.float32))
x0,y0,x1,y1=patch.ZONE
hp=lambda a: a-cv2.GaussianBlur(a,(0,0),3)
refg=cv2.cvtColor(ref,cv2.COLOR_BGR2GRAY).astype(np.float32)
log={}
def opacity(f, H, s):
    sig=max(0.0, 0.5/s-0.5)
    m=np.zeros((1920,1080),np.uint8); poly=cv2.perspectiveTransform(np.float32([[[x0,y0]],[[x1,y0]],[[x1,y1]],[[x0,y1]]]),H).reshape(-1,2)
    cv2.fillPoly(m,[np.int32(np.round(poly))],1)
    rw=cv2.warpPerspective(cv2.GaussianBlur(refg,(0,0),sig) if sig>0.05 else refg, H,(1080,1920),flags=cv2.INTER_LINEAR)
    fg=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY).astype(np.float32)
    a=hp(rw)[m>0]; b=hp(fg)[m>0]
    if a.size<20: return None
    return float(np.clip((a*b).sum()/max((a*a).sum(),1e-6),0,1))

def refine(f, H, s):
    """sub-pixel alignment of the reference line to this frame (ECC, affine, on high-passed images)"""
    sig=max(0.0, 0.5/s-0.5)
    poly=cv2.perspectiveTransform(np.float32([[[x0-40,y0-15]],[[x1+40,y0-15]],[[x1+40,y1+15]],[[x0-40,y1+15]]]),H).reshape(-1,2)
    bx0,by0=np.int32(np.floor(poly.min(0))); bx1,by1=np.int32(np.ceil(poly.max(0)))
    bx0,by0=max(bx0,0),max(by0,0); bx1,by1=min(bx1,1080),min(by1,1920)
    if bx1-bx0<20 or by1-by0<8: return H
    T=np.array([[1,0,-bx0],[0,1,-by0],[0,0,1]],np.float64)
    rw=cv2.warpPerspective(cv2.GaussianBlur(refg,(0,0),sig) if sig>0.05 else refg, T@H,(bx1-bx0,by1-by0),flags=cv2.INTER_LINEAR)
    fg=cv2.cvtColor(f[by0:by1,bx0:bx1],cv2.COLOR_BGR2GRAY).astype(np.float32)
    A=np.eye(2,3,dtype=np.float32)
    try:
        _,A=cv2.findTransformECC(hp(fg),hp(rw),A,cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,100,1e-5),None,3)
    except cv2.error:
        return H
    if np.abs(A[:,2]).max()>6: return H
    A3=np.vstack([A,[0,0,1]]).astype(np.float64)
    # ECC maps template(frame) coords -> input(ref-warp) coords; frame = A^-1 * refwarp
    return np.linalg.inv(T)@np.linalg.inv(A3)@T@H

def delta_apply(f, H, s):
    sig=max(0.0, 0.5/s-0.5)
    Db=cv2.GaussianBlur(D,(0,0),sig) if sig>0.05 else D
    Dw=cv2.warpPerspective(Db, H, (1080,1920), flags=cv2.INTER_LINEAR, borderValue=0)
    # ticket opacity from high-pass correlation of the line with the warped reference line (background uncorrelated)
    m=np.zeros((1920,1080),np.uint8); poly=cv2.perspectiveTransform(np.float32([[[x0,y0]],[[x1,y0]],[[x1,y1]],[[x0,y1]]]),H).reshape(-1,2)
    cv2.fillPoly(m,[np.int32(np.round(poly))],1)
    rw=cv2.warpPerspective(cv2.GaussianBlur(refg,(0,0),sig) if sig>0.05 else refg, H,(1080,1920),flags=cv2.INTER_LINEAR)
    fg=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY).astype(np.float32)
    a=hp(rw)[m>0]; b=hp(fg)[m>0]
    if a.size<20: return f, None
    alpha=float(np.clip((a*b).sum()/max((a*a).sum(),1e-6),0,1))
    out=np.clip(f.astype(np.float32)+alpha*Dw+0.5,0,255).astype(np.uint8)
    return out, alpha
# cross-fades: the mix is (opaque ticket frame next to the fade) x alpha + (other shot) x (1-alpha), so the correction is that
# neighbour's own in-frame change, re-positioned to this frame and scaled by alpha
ANCH={**{n:244 for n in range(228,244)}, **{n:396 for n in range(388,396)}, **{n:837 for n in range(838,844)}}
need=set(ANCH.values()); TF={}
pp=subprocess.Popen([FF,'-v','error','-i',W+'/in/src.mp4','-f','rawvideo','-pix_fmt','bgr24','-'],stdout=subprocess.PIPE); i=0
while i<=max(need):
    b=pp.stdout.read(1080*1920*3)
    if i in need:
        f0=np.frombuffer(b,np.uint8).reshape(1920,1080,3).copy(); o0,_=patch.patch(f0,Hs[i])
        TF[i]=(None,None,f0,o0)
    i+=1
pp.kill()
import fade
def ghost(o, H):
    pv=cv2.perspectiveTransform(np.float32([[[566,864]],[[660,864]],[[660,899]],[[566,899]]]),H).reshape(-1,2)
    mv=np.zeros((1920,1080),np.uint8); cv2.fillPoly(mv,[np.int32(np.round(pv))],1)
    return float(np.abs(hp(o.astype(np.float32).mean(2)))[mv>0].mean())
def fade_apply(f, n):
    a_idx=ANCH[n]; T=TF[a_idx][2]; Tc=TF[a_idx][3]; Hn=Hs[n]; M=Hn@np.linalg.inv(Hs[a_idx])
    cands=[]
    o1=fade.fade_fix(f,T,Tc,M,Hn); cands.append((ghost(o1,Hn),'curve',o1))
    o2,box=patch.patch(f,Hn)
    if box is not None: cands.append((ghost(o2,Hn),'inframe',o2))
    cands.sort(key=lambda c:c[0])
    return cands[0][2], (cands[0][1], round(cands[0][0],2), [ (c[1],round(c[0],2)) for c in cands])
p=subprocess.Popen([FF,'-v','error','-i',W+'/in/src.mp4','-f','rawvideo','-pix_fmt','bgr24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen([FF,'-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s','1080x1920','-r','30','-i','-','-c:v','ffv1','-level','3',W+'/patched_lossless.mkv'],stdin=subprocess.PIPE)
n=0
while True:
    b=p.stdout.read(1080*1920*3)
    if len(b)<1080*1920*3: break
    f=np.frombuffer(b,np.uint8).reshape(1920,1080,3)
    if n in Hs:
        H=Hs[n]; z=cv2.perspectiveTransform(np.float32([[[x0,y0]],[[x1,y0]]]),H).reshape(-1,2); s=float(np.linalg.norm(z[1]-z[0])/(x1-x0))
        al=opacity(f,H,s)
        if n in ANCH:
            o,al2=fade_apply(f,n); log[n]=('fade',round(s,3),None if al is None else round(al,3),al2)
        elif al is None:
            o=f; log[n]=('skip',round(s,3),None)
        elif s>1.15 or al>=0.93:
            o,box=patch.patch(f,H); log[n]=('inframe',round(s,3),round(al,3),box)
        else:
            Hr=refine(f,H,s); o,al2=delta_apply(f,Hr,s); log[n]=('delta+ecc',round(s,3),round(al,3),al2)
        f=o
    enc.stdin.write(np.ascontiguousarray(f).tobytes()); n+=1
enc.stdin.close(); enc.wait()
json.dump({str(k):v for k,v in log.items()},open(W+'/render_log.json','w'),default=str); print('frames',n,'patched',len(log))
