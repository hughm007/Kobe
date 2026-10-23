import sys, subprocess, numpy as np, sherpa_onnx
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
M='/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/asr/sherpa-onnx-whisper-base.en/'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'base.en-encoder.int8.onnx',decoder=M+'base.en-decoder.int8.onnx',tokens=M+'base.en-tokens.txt',language='en',task='transcribe')
def load(p,af=None):
    cmd=[FF,'-v','error','-i',p,'-vn','-ac','1','-ar','16000']+(['-af',af] if af else [])+['-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,np.float32)
def segments(a,thr_db,min_gap=0.25,min_len=0.15):
    hop=160; e=np.array([np.sqrt(np.mean(a[i:i+400]**2)+1e-12) for i in range(0,len(a)-400,hop)]); db=20*np.log10(e)
    on=db>thr_db; segs=[]; i=0; n=len(on)
    while i<n:
        if on[i]:
            j=i
            while j<n and (on[j] or (j+int(min_gap*100)<n and on[j:j+int(min_gap*100)].any())): j+=1
            if (j-i)/100>=min_len: segs.append((i/100,j/100))
            i=j
        else: i+=1
    return segs,db
p=sys.argv[1]; thr=float(sys.argv[2]) if len(sys.argv)>2 else -35; af=sys.argv[3] if len(sys.argv)>3 else None
a=load(p,af); segs,db=segments(a,thr)
print('peak dB %.1f, median dB %.1f, %d segments at %.0f dB'%(db.max(),np.median(db),len(segs),thr))
for s,e in segs:
    st=rec.create_stream(); st.accept_waveform(16000,a[int(max(0,s-0.1)*16000):int((e+0.1)*16000)]); rec.decode_stream(st)
    print('%.2f-%.2f  %s'%(s,e,st.result.text.strip()))
