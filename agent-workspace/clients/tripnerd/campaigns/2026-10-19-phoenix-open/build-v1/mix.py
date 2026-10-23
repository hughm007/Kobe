import subprocess, sys, json, re
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
U='/root/.claude/uploads/8c048fe7-e164-5dfe-aada-4e21bced4c43/'
S={'V01':U+'50fc4af8-IMG_0075.mov','V02':U+'4c826f89-IMG_0192.mov','V03':U+'b378ad27-IMG_0112.mov','V04':U+'2280cf92-IMG_0097.mov'}
# (source, in, duration) in timeline order; all real audio from the same clips the picture uses
PLAN={'A':[('V02',0.0,1.8),('V01',0.0,2.0),('V03',2.47,3.5),('V03',5.97,2.2),('V02',2.0,3.5)],
      'B':[('V04',8.4,3.6),('V01',0.0,2.0),('V03',2.47,3.5),('V03',5.97,2.2),('V02',2.0,3.5)]}
v,silent,out=sys.argv[1],sys.argv[2],sys.argv[3]
plan=PLAN[v]; total=sum(d for *_,d in plan)
inp=[]; fl=[]
for i,(k,t,d) in enumerate(plan):
    inp+=['-ss',str(t),'-t',str(d+0.02),'-i',S[k]]
    fl.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{d},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={d-0.015}:d=0.015[a{i}]')
n=len(plan)
fl.append(''.join(f'[a{i}]' for i in range(n))+f'concat=n={n}:v=0:a=1,afade=t=out:st={total-1.6}:d=1.6[mix]')
tmp=f'mix_{v}.wav'
subprocess.run([FF,'-v','error','-y',*inp,'-filter_complex',';'.join(fl),'-map','[mix]',tmp],check=True)
r=subprocess.run([FF,'-hide_banner','-i',tmp,'-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
m=json.loads(r[r.rindex('{'):r.rindex('}')+1])
ln=f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run([FF,'-v','error','-y','-i',silent,'-i',tmp,'-map','0:v','-map','1:a','-c:v','copy','-af',ln+',aresample=48000','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out],check=True)
r=subprocess.run([FF,'-hide_banner','-i',out,'-vn','-af','ebur128=peak=true:framelog=quiet','-f','null','-'],capture_output=True,text=True).stderr
s=r[r.rfind('Summary'):]
print(v,'total',total,'| I',re.search(r'I:\s+(-?[\d.]+)',s).group(1),'LUFS | TP',re.search(r'Peak:\s+(-?[\d.]+)',s).group(1),'dBTP | input I',m['input_i'])
