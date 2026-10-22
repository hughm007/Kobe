import cv2, numpy as np, subprocess, sys, json
W='/tmp/claude-0/-home-user-Kobe/411896a1-4643-5966-b007-9108eefe8cbf/scratchpad/phx'
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
ref=cv2.imread(W+'/f_13.5.png'); RX0,RY0,RX1,RY1=100,700,1000,1250
rg=cv2.cvtColor(ref[RY0:RY1,RX0:RX1],cv2.COLOR_BGR2GRAY)
sift=cv2.SIFT_create(nfeatures=4000)
rk,rd=sift.detectAndCompute(rg,None)
bf=cv2.BFMatcher()
p=subprocess.Popen([FF,'-v','error','-i',W+'/in/src.mp4','-f','rawvideo','-pix_fmt','bgr24','-'],stdout=subprocess.PIPE)
out={}; n=0
while True:
    b=p.stdout.read(1080*1920*3)
    if len(b)<1080*1920*3: break
    f=np.frombuffer(b,np.uint8).reshape(1920,1080,3); g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY)
    k,d=sift.detectAndCompute(g,None); res=None
    if d is not None and len(k)>10:
        m=bf.knnMatch(rd,d,k=2); good=[a for a,b2 in (x for x in m if len(x)==2) if a.distance<0.72*b2.distance]
        if len(good)>=12:
            src=np.float32([rk[a.queryIdx].pt for a in good])+[RX0,RY0]; dst=np.float32([k[a.trainIdx].pt for a in good])
            H,mask=cv2.findHomography(src,dst,cv2.RANSAC,3.0)
            if H is not None:
                inl=int(mask.sum())
                c=cv2.perspectiveTransform(np.float32([[[430,860]],[[662,860]],[[662,903]],[[430,903]]]),H).reshape(-1,2)
                res=dict(inl=inl,ngood=len(good),H=H.tolist(),zone=c.tolist())
    out[n]=res; n+=1
    if n%60==0: print(n, flush=True)
json.dump(out,open(W+'/track.json','w')); print('frames',n)
