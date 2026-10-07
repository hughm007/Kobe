import sys, subprocess, numpy as np, sherpa_onnx, time
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
src,out=sys.argv[1],sys.argv[2]
raw=subprocess.run([FF,'-v','error','-i',src,'-vn','-ac','2','-ar','44100','-f','f32le','-'],capture_output=True).stdout
x=np.frombuffer(raw,np.float32).reshape(-1,2).T.copy()
cfg=sherpa_onnx.OfflineSourceSeparationConfig(model=sherpa_onnx.OfflineSourceSeparationModelConfig(uvr=sherpa_onnx.OfflineSourceSeparationUvrModelConfig(model='/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/asr/UVR-MDX-NET-Voc_FT.onnx'),num_threads=4,provider='cpu'))
sp=sherpa_onnx.OfflineSourceSeparation(cfg); t=time.time()
o=sp.process(sample_rate=44100,samples=x); print('sep %.1fs, stems %d, rate %d'%(time.time()-t,len(o.stems),o.sample_rate))
for i,st in enumerate(o.stems):
    d=np.array(st.data,dtype=np.float32); print(i,d.shape,'rms %.4f'%np.sqrt((d**2).mean()))
    np.save(out+'_stem%d.npy'%i,d)
