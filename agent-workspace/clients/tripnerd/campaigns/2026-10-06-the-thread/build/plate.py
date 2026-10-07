#!/usr/bin/env python3
# The cleaned course still (farfix4's plate step): the owner's still with the two far-fairway player-and-caddie groups and the
# stone bridge inpainted from the surrounding grass and hedge. Writes /home/user/owner/img/start_v61_plate.png.
import numpy as np, cv2
from PIL import Image
W,H=1080,1920
p0=np.asarray(Image.open('/home/user/owner/img/start_v6.png').convert('RGB').resize((W,H),Image.LANCZOS)).copy()
def hsv_of(a):
    x=np.array(Image.fromarray(a).convert('HSV')).astype(np.int16); return x[...,0],x[...,1],x[...,2]
h0,s0,v0=hsv_of(p0); grass0=(h0>=30)&(h0<=88)&(s0>=40)&(v0>=50)
fig=np.zeros((H,W),bool)
fig[795:903,0:176]=~grass0[795:903,0:176]; fig[903:916,0:50]=~grass0[903:916,0:50]; fig[903:909,95:165]=~grass0[903:909,95:165]; fig[795:916,45:92]=False
fig[815:905,880:1078]=~grass0[815:905,880:1078]
for (x0,y0,x1,y1) in [(890,905,935,918),(940,905,972,912),(990,905,1010,912),(1012,905,1046,920)]: fig[y0:y1,x0:x1]=~grass0[y0:y1,x0:x1]
fig[688:748,765:895]=True
figU=cv2.dilate(fig.astype(np.uint8),np.ones((3,3),np.uint8),iterations=2)
p1=cv2.inpaint(np.ascontiguousarray(p0),figU,9,cv2.INPAINT_TELEA)
Image.fromarray(p1).save('/home/user/owner/img/start_v61_plate.png')
