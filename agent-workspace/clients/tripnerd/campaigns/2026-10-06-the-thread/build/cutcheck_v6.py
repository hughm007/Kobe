#!/usr/bin/env python3
# Frame-check for the harness's flash-cut row. The harness compares each frame difference with the GLOBAL median difference;
# on a cut whose first half is a near-static phone thread that median collapses and every frame of live motion reads as a "cut".
# This check uses a rolling (+-1 s) median baseline instead and lists the real picture cuts against the build parameters.
# Usage: python3 cutcheck_v6.py <master.mp4> [params.json]
import sys, json, numpy as np
sys.path.insert(0,'.'); import servicepow_qc as q
P=dict(T_THREAD=10.25,XF=0.3,A_IN=0.0,A_SLOW=2.5,A_OUT=2.7,WHIP_FRAMES=10,C_LEN=3.4,E_LEN=2.9,ARRIVALS='out/arrivals_v6.json')
if len(sys.argv)>2: P.update(json.load(open(sys.argv[2])))
tA=P['T_THREAD']-P['XF']; tW=tA+(P['A_SLOW']-P['A_IN'])+2*(P['A_OUT']-P['A_SLOW']); tC=tW+P['WHIP_FRAMES']/24.0; tE=tC+P['C_LEN']; END=tE+P['E_LEN']
real=[round(tA+P['XF']/2,2),round(tW,2),round(tC,2),round(tE,2)]
frames,_,_=q.decode_gray(sys.argv[1]); dt=1.0/q.ANALYSIS_FPS
diffs=np.array([float(np.abs(frames[i]-frames[i-1]).mean()) for i in range(1,len(frames))])
gmed=float(np.median(diffs)) or 0.1
harness=[round((i+1)*dt,2) for i,d in enumerate(diffs) if d>q.SCENE_DIFF_MULT*gmed and d>8.0]
W=int(q.ANALYSIS_FPS*1.0)
roll=np.array([float(np.median(diffs[max(0,i-W):i+W+1])) for i in range(len(diffs))])
cuts=[round((i+1)*dt,2) for i,d in enumerate(diffs) if d>q.SCENE_DIFF_MULT*max(roll[i],0.5) and d>8.0]
arr=[e['t'] for e in json.load(open(P['ARRIVALS']))]
print('global median diff %.2f (the thread holds still, so the harness flags %d "cuts")'%(gmed,len(harness)))
print('rolling-median check: %d cuts'%len(cuts))
ui=[c for c in cuts if any(abs(c-a)<=0.2 for a in arr)]; pic=[c for c in cuts if any(abs(c-r)<=0.25 for r in real)]; other=[c for c in cuts if c not in ui and c not in pic]
print('coincide with a message arrival (UI animation, not a cut):',ui)
print('coincide with a real picture cut:',pic)
print('neither:',other)
print('real picture cuts:',real,'-> min shot %.2f s'%min(b-a for a,b in zip([0]+real,real+[END])))
