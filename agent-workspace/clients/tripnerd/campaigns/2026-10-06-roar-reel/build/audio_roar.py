#!/usr/bin/env python3
# TripNerd ROAR reel: sound. The real V24 crowd audio (film 0 = source 11.4 s, from src/a_win.wav), a soft inhale
# before the hit and a sub impact on it, then loudnorm to -14 LUFS / -1 dBTP. Also writes src/env.npy, the per-frame
# crowd level the renderer pulses the word column with. No music: the roar is the audio.
import numpy as np, subprocess, json
SR=48000; FPS=30; DUR=8.0; HIT=2.1; N=int(DUR*FPS)
def run(c): return subprocess.run(c,capture_output=True,check=True)
raw=run(['ffmpeg','-v','error','-i','src/a_win.wav','-t','%.3f'%DUR,'-ac','2','-ar',str(SR),'-f','f32le','-']).stdout
a=np.frombuffer(raw,np.float32).reshape(-1,2).copy()[:int(DUR*SR)]
hop=SR//FPS; rms=np.array([20*np.log10(np.sqrt(np.mean(a[i*hop:(i+1)*hop]**2))+1e-9) for i in range(N)])
env=np.clip((rms+26)/14,0,1); sm=np.zeros(N); v=0.0            # 0 at the quiet level (-26 dB), 1 at the peak (-12 dB)
for i in range(N): v=max(float(env[i]),v*0.90); sm[i]=v        # fast attack, slow release
np.save('src/env.npy',sm); print('envelope: max %.2f at %.2f s'%(sm.max(),sm.argmax()/FPS))
rng=np.random.default_rng(1); t=np.arange(int(0.45*SR))/SR
thump=np.sin(2*np.pi*(52+40*np.exp(-t*14))*t)*np.exp(-t*9)
burst=rng.standard_normal(len(t)).astype(np.float32)*np.exp(-t*60)*0.35
hit=thump*0.9+burst; hit=hit/np.abs(hit).max()
tw=np.arange(int(0.3*SR))/SR; wh=np.convolve(rng.standard_normal(len(tw)),np.ones(24)/24,'same')*np.sin(np.pi*tw/0.3)**2
def add(sig,at,gain):
    s=int(at*SR); e=min(len(a),s+len(sig)); a[s:e]+=(sig[:e-s]*gain)[:,None]
add(wh,HIT-0.3,0.12); add(hit,HIT,0.28)
a=np.clip(a,-1,1); open('src/mix_pre.f32','wb').write(a.astype(np.float32).tobytes())
run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','src/mix_pre.f32','src/mix_pre.wav'])
m=subprocess.run(['ffmpeg','-i','src/mix_pre.wav','-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
j=json.loads(m[m.rfind('{'):m.rfind('}')+1])
run(['ffmpeg','-v','error','-y','-i','src/mix_pre.wav','-af','loudnorm=I=-14:TP=-1:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true'%(j['input_i'],j['input_tp'],j['input_lra'],j['input_thresh'],j['target_offset']),'-ar',str(SR),'out/mix.wav'])
m2=subprocess.run(['ffmpeg','-i','out/mix.wav','-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
j2=json.loads(m2[m2.rfind('{'):m2.rfind('}')+1]); print('mix: %s LUFS, TP %s dBTP (pre: %s LUFS)'%(j2['input_i'],j2['input_tp'],j['input_i']))
