import subprocess, numpy as np, sherpa_onnx, wave, sys, time
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
D='/tmp/claude-0/-home-user-Kobe/8c048fe7-e164-5dfe-aada-4e21bced4c43/scratchpad/asr/'; Z=D+'sherpa-onnx-zipvoice-distill-zh-en-emilia/'
V='/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/322c0697-One-static-shot-of-a-fictional-adult-mal.mp4'
ref=np.frombuffer(subprocess.run([FF,'-v','error','-ss','7.55','-t','5.5','-i',V,'-vn','-ac','1','-ar','24000','-f','f32le','-'],capture_output=True).stdout,np.float32).copy()
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(tokens=Z+'tokens.txt',encoder=Z+'text_encoder.onnx',decoder=Z+'fm_decoder.onnx',vocoder=D+'vocos_24khz.onnx',data_dir=Z+'espeak-ng-data',lexicon=Z+'pinyin.raw'),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg)
for name,text in [('hear','And hear the roar.'),('feel_synth','And feel the roar.'),('done','All done with TripNerd!')]:
    g=sherpa_onnx.GenerationConfig(); g.reference_audio=ref; g.reference_sample_rate=24000; g.reference_text='Bring your people. Enjoy the moment. And feel the roar.'; g.num_steps=16; g.speed=1.0
    t=time.time(); a=tts.generate(text,g); x=np.array(a.samples,np.float32)
    w=wave.open(D+'tts_%s.wav'%name,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(a.sample_rate); w.writeframes((np.clip(x,-1,1)*32767).astype(np.int16).tobytes()); w.close()
    print(name,'%.2fs audio in %.1fs, rate %d'%(len(x)/a.sample_rate,time.time()-t,a.sample_rate))
