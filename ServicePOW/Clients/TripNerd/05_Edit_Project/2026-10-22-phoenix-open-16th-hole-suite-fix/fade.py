import cv2, numpy as np
import patch
y0v, y1v = 864, 899
hp=lambda a: a-cv2.GaussianBlur(a,(0,0),2.5)
def fade_fix(F8, T8, Tc8, M, Hn):
    """F = blend of the opaque ticket frame T (warped by M) with another shot. Correction = g(Tc) - g(T), where g is the
    per-channel monotone T->F curve fitted on the unchanged part of the line; T is first aligned to F sub-pixel (ECC)."""
    Hh, Ww = F8.shape[:2]
    poly=cv2.perspectiveTransform(np.float32([[[225,850]],[[705,850]],[[705,912]],[[225,912]]]),Hn).reshape(-1,2)
    bx0,by0=np.maximum(np.int32(np.floor(poly.min(0)))-6,0); bx1,by1=np.minimum(np.int32(np.ceil(poly.max(0)))+6,[Ww,Hh])
    Tw=cv2.warpPerspective(T8,M,(Ww,Hh)).astype(np.float32); Tcw=cv2.warpPerspective(Tc8,M,(Ww,Hh)).astype(np.float32)
    F=F8.astype(np.float32)
    fg=hp(F[by0:by1,bx0:bx1].mean(2)); tg=hp(Tw[by0:by1,bx0:bx1].mean(2))
    A=np.eye(2,3,dtype=np.float32)
    try:
        _,A=cv2.findTransformECC(fg,tg,A,cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,200,1e-6),None,3)
        if np.abs(A[:,2]).max()<5:
            Ai=cv2.invertAffineTransform(A)
            # ECC: template(F) coords -> input(T) coords; resample T and Tc onto F's grid
            sub=lambda X: cv2.warpAffine(X[by0:by1,bx0:bx1],A,(bx1-bx0,by1-by0),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_REPLICATE)
            Tw[by0:by1,bx0:bx1]=sub(Tw); Tcw[by0:by1,bx0:bx1]=sub(Tcw)
    except cv2.error:
        pass
    m=np.zeros((Hh,Ww),np.uint8); cv2.fillPoly(m,[np.int32(np.round(poly))],1); m=m>0
    unchanged=m&(np.abs(Tcw-Tw).max(2)<1)
    out=F.copy(); D=np.abs(Tcw-Tw).max(2)>0.5; corr=np.zeros_like(F)
    for c in range(3):
        xs=Tw[...,c][unchanged]; ys=F[...,c][unchanged]
        if xs.size<50: return F8
        bins=np.linspace(xs.min(),xs.max()+1e-3,24); idx=np.digitize(xs,bins); bx=[]; by=[]
        for k in range(1,len(bins)+1):
            s=idx==k
            if s.sum()>=8: bx.append(np.median(xs[s])); by.append(np.median(ys[s]))
        if len(bx)<3: return F8
        bx=np.array(bx); by=np.maximum.accumulate(np.array(by))
        corr[...,c]=np.where(m&D, np.interp(Tcw[...,c],bx,by)-np.interp(Tw[...,c],bx,by), 0)
    # strength chosen by the frame itself: least letter-edge energy where the old "Suite" was (no letters belong there)
    pv=cv2.perspectiveTransform(np.float32([[[566,y0v]],[[660,y0v]],[[660,y1v]],[[566,y1v]]]),Hn).reshape(-1,2)
    mv=np.zeros((Hh,Ww),np.uint8); cv2.fillPoly(mv,[np.int32(np.round(pv))],1); mv=mv>0
    best=(1e9,1.0,0.0,corr)
    for sg in (0.0,0.6,0.9,1.2,1.6,2.0,2.5):
        cb=cv2.GaussianBlur(corr,(0,0),sg) if sg>0 else corr
        for k in np.linspace(0.5,1.3,17):
            e=np.abs(hp((F+k*cb).mean(2)))[mv].mean()
            if e<best[0]: best=(e,k,sg,cb)
    fade_fix.last_k=(best[1],best[2])
    return np.clip(F+best[1]*best[3]+0.5,0,255).astype(np.uint8)
