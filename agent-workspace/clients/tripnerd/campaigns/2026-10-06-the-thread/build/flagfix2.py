#!/usr/bin/env python3
# Paint out the generated emblem on the landing clip's flag: the emblem is a thin, darker-yellow line drawing on the yellow
# fabric, so it is found by LOCAL contrast inside the flag (luminance well below the local flag mean) and filled with the local
# flag colour (folds kept). Writes A4k_clean.mp4 (source 0.7-3.3 s, 4k, original audio). Usage: flagfix2.py [test <t>]
import subprocess, numpy as np, sys
from PIL import Image
A='/home/user/owner/A4k.mp4'; OUT='/home/user/owner/A4k_clean.mp4'; W,H=3840,2160; T0,TL=0.4,2.9; FB=W*H*3
X0,X1,Y0,Y1=1400,2800,0,620; CS=40; THR=22
def enclosed(m):
    l=np.maximum.accumulate(m,axis=1); r=np.maximum.accumulate(m[:,::-1],axis=1)[:,::-1]; u=np.maximum.accumulate(m,axis=0); d=np.maximum.accumulate(m[::-1,:],axis=0)[::-1,:]; return l&r&u&d
def boxsum(a,r):
    p=np.pad(a,((r+1,r),(r+1,r))+((0,0),)*(a.ndim-2),mode='constant'); c=p.cumsum(0).cumsum(1)
    return c[2*r+1:,2*r+1:]-c[:-2*r-1,2*r+1:]-c[2*r+1:,:-2*r-1]+c[:-2*r-1,:-2*r-1]
def dilate(m,k):
    o=m.copy()
    for dy in range(-k,k+1):
        for dx in range(-k,k+1): o|=np.roll(np.roll(m,dy,0),dx,1)
    return o
def largest_cluster(cells):
    cy,cx=cells.shape; seen=np.zeros_like(cells); best=None
    for y in range(cy):
        for x in range(cx):
            if cells[y,x] and not seen[y,x]:
                comp=[]; st=[(y,x)]; seen[y,x]=True
                while st:
                    a,b=st.pop(); comp.append((a,b))
                    for dy in (-1,0,1):
                        for dx in (-1,0,1):
                            n=(a+dy,b+dx)
                            if 0<=n[0]<cy and 0<=n[1]<cx and cells[n] and not seen[n]: seen[n]=True; st.append(n)
                if best is None or len(comp)>len(best): best=comp
    m=np.zeros_like(cells)
    if best:
        for a,b in best: m[a,b]=True
    return m
def fix(f):
    reg=f[Y0:Y1,X0:X1].astype(np.int16); r,g,b=reg[...,0],reg[...,1],reg[...,2]
    yellow=(r>150)&(g>120)&(b<140)&((r-b)>70)&(r>=g)
    hh,ww=yellow.shape; cy,cx=hh//CS,ww//CS
    cells=yellow[:cy*CS,:cx*CS].reshape(cy,CS,cx,CS).mean(axis=(1,3))>0.35
    if cells.sum()<2: return f,-1
    cl=largest_cluster(cells); grow=cl.copy()
    for dy in (-1,0,1):
        for dx in (-1,0,1): grow|=np.roll(np.roll(cl,dy,0),dx,1)
    cm=np.zeros_like(yellow); cm[:cy*CS,:cx*CS]=np.kron(grow,np.ones((CS,CS),bool))
    flag=yellow&cm; enc=enclosed(flag)&cm
    lum=(0.299*r+0.587*g+0.114*b).astype(np.float32); fm=flag.astype(np.float32)
    lmean=boxsum(lum*fm,20)/np.maximum(boxsum(fm,20),1)
    inner=~dilate(~enc,9)                                   # well inside the flag: 9 px in from any edge or concavity
    emb1=inner&(lum<lmean-THR); emb=dilate(emb1,3)&inner
    emb|=dilate(emb1,8)&inner&(lum<lmean-10)                # the lighter anti-aliased ring around the drawing
    n=int(emb.sum())
    if n==0: return f,0
    keep=(flag&~dilate(emb,2)).astype(np.float32)[...,None]; col=reg.astype(np.float32)*keep
    num=boxsum(col,12); den=boxsum(keep,12); num2=boxsum(col,30); den2=boxsum(keep,30); glob=reg[flag&~emb].mean(axis=0)
    fill=np.where(den>4,num/np.maximum(den,1),np.where(den2>4,num2/np.maximum(den2,1),glob[None,None,:]))
    out=reg.astype(np.float32); out[emb]=fill[emb]; f=f.copy(); f[Y0:Y1,X0:X1]=out.clip(0,255).astype(np.uint8); return f,n
if len(sys.argv)>1 and sys.argv[1]=='test':
    t=float(sys.argv[2]); subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',A,'-frames:v','1','out/dbg_full.png'],check=True)
    f=np.asarray(Image.open('out/dbg_full.png').convert('RGB')); g,n=fix(f); print('test',t,'emblem px',n)
    Image.fromarray(np.concatenate([f[150:570,1900:2600],g[150:570,1900:2600]],axis=1)).resize((1400,420),Image.LANCZOS).save('out/flag_dbg2.jpg',quality=85); sys.exit()
src=subprocess.Popen(['ffmpeg','-v','error','-ss',str(T0),'-i',A,'-t',str(TL),'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
dst=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r','24','-i','-','-ss',str(T0),'-t',str(TL),'-i',A,'-map','0:v','-map','1:a','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','192k','-shortest',OUT],stdin=subprocess.PIPE)
ns=[]
while True:
    buf=src.stdout.read(FB)
    if len(buf)<FB: break
    f=np.frombuffer(buf,np.uint8).reshape(H,W,3); g,n=fix(f); ns.append(n); dst.stdin.write(g.tobytes())
dst.stdin.close(); dst.wait(); print('frames',len(ns),'emblem px per frame',ns)
