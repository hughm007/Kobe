#!/usr/bin/env python3
# Applause-clip clean-up, frame by frame, no generation. The owner's still carried two player-and-caddie groups on the far fairway
# (left and right frame edges) and a stone arch bridge; the video model kept them and walks them a little. A cleaned copy of the still
# (those figures and the bridge inpainted from the grass and hedge around them) is aligned to every frame (scale + shift, tracked);
# inside the three regions, every pixel that is not fairway grass and not part of the foreground people is replaced by the cleaned
# still. In the lowest rows, where the standing crowd's heads rise into the regions, only pixels that still match the still or carry
# the figures' colours (khaki, lavender, dark green, black, tall white strips) are replaced, so the crowd is left alone.
# Usage: python3 farfix4.py [test n ...]
import sys, subprocess, numpy as np, cv2
from PIL import Image
SRC='/home/user/owner/C_7bc4c0e2.mp4'; DST='/home/user/owner/C_7bc4c0e2_clean.mp4'; W,H=1080,1920
p0=np.asarray(Image.open('/home/user/owner/img/start_v6.png').convert('RGB').resize((W,H),Image.LANCZOS)).copy()
def hsv_of(a):
    x=np.array(Image.fromarray(a).convert('HSV')).astype(np.int16); return x[...,0],x[...,1],x[...,2]
h0,s0,v0=hsv_of(p0); grass0=(h0>=30)&(h0<=88)&(s0>=40)&(v0>=50)
fig=np.zeros((H,W),bool)
fig[795:903,0:176]=~grass0[795:903,0:176]; fig[903:916,0:50]=~grass0[903:916,0:50]; fig[903:909,95:165]=~grass0[903:909,95:165]; fig[795:916,45:92]=False   # the thin trunk stays
fig[815:905,880:1078]=~grass0[815:905,880:1078]
for (x0,y0,x1,y1) in [(890,905,935,918),(940,905,972,912),(990,905,1010,912),(1012,905,1046,920)]: fig[y0:y1,x0:x1]=~grass0[y0:y1,x0:x1]
fig[688:748,765:895]=True   # the bridge and the water under it
figU=cv2.dilate(fig.astype(np.uint8),np.ones((3,3),np.uint8),iterations=2)
p1=cv2.inpaint(np.ascontiguousarray(p0),figU,9,cv2.INPAINT_TELEA)
Image.fromarray(p1).save('/home/user/owner/img/start_v61_plate.png')
mask0=np.zeros((H,W),np.uint8); mask0[790:920,0:182]=255; mask0[805:942,870:1080]=255; mask0[680:755,760:900]=255
def warp(a,sc,dx,dy,nearest=False):
    im=Image.fromarray(a); w,h=im.size; nw,nh=int(round(w*sc)),int(round(h*sc))
    im=im.resize((nw,nh),Image.NEAREST if nearest else Image.BILINEAR); ox=(nw-w)//2-dx; oy=(nh-h)//2-dy
    return np.asarray(im.crop((ox,oy,ox+w,oy+h)))
sp=cv2.resize(p1,(W//4,H//4),interpolation=cv2.INTER_AREA)
def align(fn,prev):
    sn=cv2.resize(fn,(W//4,H//4),interpolation=cv2.INTER_AREA).astype(np.float32); best=None; sc0,dx0,dy0=prev
    for sc in (sc0-0.01,sc0,sc0+0.01):
        if sc<0.99: continue
        wp=warp(sp,round(sc,3),0,0).astype(np.float32)
        for dx in range(dx0//4-3,dx0//4+4):
            for dy in range(dy0//4-3,dy0//4+4):
                d=np.abs(np.roll(np.roll(wp,dy,axis=0),dx,axis=1)[25:160]-sn[25:160]).mean()
                if best is None or d<best[0]: best=(d,round(sc,3),dx*4,dy*4)
    _,sc,dx,dy=best; base=warp(p1,sc,0,0); fine=None
    for ddx in range(dx-3,dx+4):
        for ddy in range(dy-3,dy+4):
            aa=np.roll(np.roll(base,ddy,axis=0),ddx,axis=1)
            d=np.abs(aa[100:650:2].astype(np.float32)-fn[100:650:2].astype(np.float32)).mean()
            if fine is None or d<fine[0]: fine=(d,ddx,ddy)
    return (sc,fine[1],fine[2]),fine[0]
K3=np.ones((3,3),np.uint8)
def fix(fn,prev):
    st,d=align(fn,prev); sc,dx,dy=st
    P0=np.roll(np.roll(warp(p0,sc,0,0),dy,axis=0),dx,axis=1); P1=np.roll(np.roll(warp(p1,sc,0,0),dy,axis=0),dx,axis=1)
    M=np.roll(np.roll(warp(mask0,sc,0,0,nearest=True),dy,axis=0),dx,axis=1)>0
    h,s,v=hsv_of(fn)
    grass=(h>=30)&(h<=88)&(s>=40)&(v>=50)
    navy=(h>=145)&(h<=180)&(s>=60)&(v<=135); hair=(h>=5)&(h<=32)&(s>=50)&(v>=35)&(v<=150); shirt=(h>=120)&(h<=165)&(s>=12)&(s<=130)&(v>=140); skin=(h>=3)&(h<=28)&(s>=35)&(s<=160)&(v>=110)
    fg=cv2.morphologyEx((navy|hair|shirt|skin).astype(np.uint8),cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))   # the people in front, as one large component each (the pale light-blue shirt included)
    nlab,lab,stats,_=cv2.connectedComponentsWithStats(fg,8); big=np.zeros(nlab,bool); big[1:]=stats[1:,cv2.CC_STAT_AREA]>15000
    protect=cv2.dilate(big[lab].astype(np.uint8),K3,iterations=3)>0
    static=cv2.blur(np.abs(P0.astype(np.float32)-fn.astype(np.float32)).mean(axis=2),(9,9))<40
    khaki=(h>=18)&(h<=40)&(s>=35)&(s<=110)&(v>=120)&(v<=215); lav=(h>=165)&(h<=205)&(s>=25)&(s<=90)&(v>=140); dgreen=(h>=70)&(h<=118)&(s>=45)&(v>=40)&(v<=235); black=(v<55)&(s<120)
    white=((s<45)&(v>180)).astype(np.uint8); nl,wl,ws,_=cv2.connectedComponentsWithStats(white,8); tall=np.zeros(nl,bool)
    tall[1:]=(ws[1:,cv2.CC_STAT_HEIGHT]>=10)&(ws[1:,cv2.CC_STAT_HEIGHT]>=1.0*ws[1:,cv2.CC_STAT_WIDTH]); wtall=tall[wl]
    figc=cv2.dilate((khaki|lav|dgreen|black|wtall).astype(np.uint8),K3,iterations=4)>0   # the figures' caps and edges sit within a few px of their colours
    ys=np.arange(H)[:,None]; top=M&(ys<880); bottom=M&(ys>=880)
    paint=(top&~grass&~protect)|(bottom&~grass&~protect&(static|figc))
    paint=cv2.dilate(paint.astype(np.uint8),K3,iterations=4)>0; paint&=M&~protect
    a=cv2.GaussianBlur(paint.astype(np.float32),(0,0),1.5)[...,None]
    out=(fn.astype(np.float32)*(1-a)+P1.astype(np.float32)*a).clip(0,255).astype(np.uint8)
    return out,st,d,int(paint.sum())
if len(sys.argv)>1 and sys.argv[1]=='test':
    rows=[]; prev=(1.0,0,0)
    for n in [int(x) for x in sys.argv[2:]]:
        raw=subprocess.run(['ffmpeg','-v','error','-i',SRC,'-vf','select=eq(n\\,%d)'%n,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
        fn=np.frombuffer(raw,np.uint8).reshape(H,W,3); out,st,d,np_=fix(fn,prev); prev=st; print('frame',n,'align',st,'diff %.1f'%d,'painted',np_)
        rows.append(np.concatenate([fn[760:960,0:220],out[760:960,0:220],fn[760:960,860:1080],out[760:960,860:1080],fn[640:840,740:960],out[640:840,740:960]],axis=1))
    Image.fromarray(np.concatenate(rows,axis=0)).save('out/farfix4_test.jpg',quality=90); Image.fromarray(p1[640:960,0:1080]).save('out/plate61_band.jpg',quality=88); sys.exit()
dec=subprocess.Popen(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r','24','-i','-','-i',SRC,'-map','0:v','-map','1:a?','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy',DST],stdin=subprocess.PIPE)
n=0; prev=(1.0,0,0); log=open('out/farfix4_log.txt','w')
while True:
    b=dec.stdout.read(W*H*3)
    if len(b)<W*H*3: break
    out,st,d,np_=fix(np.frombuffer(b,np.uint8).reshape(H,W,3),prev); prev=st; enc.stdin.write(out.tobytes()); log.write('%d %s %.1f %d\n'%(n,st,d,np_)); n+=1
enc.stdin.close(); enc.wait(); log.close(); print('frames',n)
