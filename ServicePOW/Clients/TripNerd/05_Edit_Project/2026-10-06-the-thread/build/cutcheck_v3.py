#!/usr/bin/env python3
# Frame-check for the harness's flash-cut row: list the scene-detect "cuts" and compare them with the message arrivals.
import sys, json, numpy as np
sys.path.insert(0,'.'); import servicepow_qc as q
frames,_,_=q.decode_gray(sys.argv[1]); dt=1.0/q.ANALYSIS_FPS
diffs=[float(np.abs(frames[i]-frames[i-1]).mean()) for i in range(1,len(frames))]; med=float(np.median(diffs)) or 0.1
cuts=[round((i+1)*dt,2) for i,d in enumerate(diffs) if d>q.SCENE_DIFF_MULT*med and d>8.0]
arr=[e['t'] for e in json.load(open('out/arrivals_v3.json'))]
real=[7.85,11.75]
print('median diff %.2f; detected %d "cuts"'%(med,len(cuts)))
ui=[c for c in cuts if any(abs(c-a)<=0.2 for a in arr)]; pic=[c for c in cuts if any(abs(c-r)<=0.2 for r in real)]; other=[c for c in cuts if c not in ui and c not in pic]
print('coincide with a message arrival (UI animation, not a cut):',ui)
print('coincide with a real picture cut:',pic)
print('neither:',other)
print('real picture cuts:',real,'-> min shot %.1f s'%min(b-a for a,b in zip([0]+real,real+[16.6])))
