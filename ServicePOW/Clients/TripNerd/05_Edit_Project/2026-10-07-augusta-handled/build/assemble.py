#!/usr/bin/env python3
# TripNerd "Augusta, handled" 15 s, 9:16, 30 fps.
# Variant A: the hook is real TripNerd footage (V19, sunset over the hospitality lawn). Variant B: the hook is the
# owner's Seedance clip A (adac6b4d, ball lands by the pin). Everything after the hook is shared.
# Picture: hook | the Private Executive Home, Seedance move on TripNerd's published photo | the veranda, Seedance move on
# TripNerd's published photo + checklist | V25 real veranda video | lockup over V25's tail, blurred.
# Joins are 0.25 s crossfades centred on the beat times. Needs out/mix.wav and out/ticks.json from mix.py.
# Text is composited (Pillow layers, Montserrat); nothing readable is generated. Usage: assemble.py A|B
# v3 (owner, 2026-10-07): music + voice on the list (mix.py -> out/mix.wav, ticks from out/ticks.json), no on-screen
# AI label on B (disclosure is the platform AI toggle at posting, per realism-and-disclosure §3). Beats retimed so the
# list holds the whole voice line: hook 0-3.0 | house 3.0-5.5 | list 5.5-10.95 | V25 10.95-13.0 | lockup 13.0-15.0.
import subprocess, sys, os, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
V=sys.argv[1] if len(sys.argv)>1 else 'A'; W,H,FPS=1080,1920,30; DUR=15.0; XF=0.25; NAME='TN-AUG15-%s-v3'%V
TK=json.load(open('out/ticks.json')); T0=TK['T0']; VEND=T0+TK['voice_dur']; TICKS=TK['ticks']
assert None not in TICKS, 'a checklist word was not found in the voice transcript'
os.makedirs('out',exist_ok=True)
EB='/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf'; SB='fonts/Montserrat-SemiBold.ttf' if os.path.exists('fonts/Montserrat-SemiBold.ttf') else EB
F=lambda p,s: ImageFont.truetype(p,s)
BLUE=(82,142,224); NAVY=(7,40,61); WHITE=(255,255,255)
def layer(): return Image.new('RGBA',(W,H),(0,0,0,0))
def shadowed(L,draws):
    # draws: list of (xy,text,font,fill); white text with a soft dark shadow for legibility over real footage
    S=layer(); ds=ImageDraw.Draw(S)
    for (x,y),t,f,_ in draws: ds.text((x+3,y+4),t,font=f,fill=(0,0,0,170))
    S=S.filter(ImageFilter.GaussianBlur(7)); L.alpha_composite(S); d=ImageDraw.Draw(L)
    for (x,y),t,f,fill in draws: d.text((x,y),t,font=f,fill=fill)
    return L
def centred(lines,font,y0,lh):
    d=ImageDraw.Draw(layer()); out=[]
    for i,t in enumerate(lines):
        bb=d.textbbox((0,0),t,font=font); out.append((((W-(bb[2]-bb[0]))//2-bb[0],y0+i*lh),t,font,WHITE+(255,)))
    return out
def scrim(L,y0,y1,peak=0.36):
    # soft dark band behind a super so white type reads over bright footage (alpha ramps in and out)
    S=layer(); d=ImageDraw.Draw(S); n=y1-y0
    for i in range(n): a=int(255*peak*min(1.0,min(i,n-i)/(0.3*n))); d.line([(0,y0+i),(W,y0+i)],fill=(0,0,0,a))
    L.alpha_composite(S); return L
def card(lines,path,y0=470,size=84,lh=104,band=None):
    L=layer()
    if band: L=scrim(L,*band)
    shadowed(L,centred(lines,F(EB,size),y0,lh)).save(path)
card(['Augusta is the','bucket-list moment.'],'out/c1.png',band=(360,760))
card(['Planning it shouldn’t','be the hard part.'],'out/c2.png',band=(360,760))
card(['Bring your people.'],'out/c4a.png',y0=470,band=(380,760))
card(['Enjoy the moment.'],'out/c4b.png',y0=590)
# checklist: navy panel + header, then four ticked items that slide in one by one
P=layer(); d=ImageDraw.Draw(P); d.rounded_rectangle((70,340,1010,1060),radius=36,fill=NAVY+(214,))
fh=F(EB,66); bb=d.textbbox((0,0),'With TripNerd:',font=fh); d.text((130-bb[0],392),'With TripNerd:',font=fh,fill=WHITE+(255,)); P.save('out/panel.png')
ITEMS=[(['Course access'],540),(['Private executive','accommodations'],660),(['Daily hospitality'],850),(['Concierge support'],960)]
fi=F(SB,56)
for k,(lines,y) in enumerate(ITEMS):
    L=layer(); d=ImageDraw.Draw(L); cx,cy,r=160,y+34,30
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=BLUE+(255,)); d.line([(cx-14,cy+1),(cx-4,cy+12),(cx+15,cy-11)],fill=WHITE+(255,),width=7,joint='curve')
    for i,t in enumerate(lines): bb=d.textbbox((0,0),t,font=fi); d.text((212-bb[0],y+i*70+4),t,font=fi,fill=WHITE+(255,))
    L.save('out/i%d.png'%k)
# lockup: headline, brand-blue pill with the real logo file, CTA button, handle (all inside 14-65 % of height)
L=layer(); L=shadowed(L,centred(['Let TripNerd handle','the details.'],F(EB,76),340,94)); d=ImageDraw.Draw(L)
LOGO=Image.open('src/logo.png').convert('RGBA'); LOGO=LOGO.resize((560,round(560*LOGO.height/LOGO.width)),Image.LANCZOS)
top=600; d.rounded_rectangle((160,top,920,top+520),radius=40,fill=BLUE+(244,)); L.alpha_composite(LOGO,((W-LOGO.width)//2,top+44))
fc=F(EB,44); t='Get the Augusta details'; bb=d.textbbox((0,0),t,font=fc); bw=(bb[2]-bb[0])+96; y=top+300
d.rounded_rectangle(((W-bw)//2,y,(W+bw)//2,y+100),radius=50,fill=WHITE+(255,)); d.text(((W-(bb[2]-bb[0]))//2-bb[0],y+50-(bb[3]+bb[1])//2),t,font=fc,fill=NAVY+(255,))
fh2=F(SB,40); t='@tripnerd'; bb=d.textbbox((0,0),t,font=fh2); d.text(((W-(bb[2]-bb[0]))//2-bb[0],top+438),t,font=fh2,fill=WHITE+(225,))
L.save('out/lockup.png')
# ---------- picture ----------
CUT=[3.0,5.5,10.95,13.0]; SEG=[CUT[0]+XF/2,CUT[1]-CUT[0]+XF,CUT[2]-CUT[1]+XF,CUT[3]-CUT[2]+XF,DUR-CUT[3]+XF/2]
real='scale=1080:1924:flags=lanczos,crop=1080:1920,unsharp=5:5:0.5,setsar=1'   # 404x720 phone video to 1080x1920, no AI
# A: 1.22x punch-in anchored left keeps the golfer on West Lake's fairway (right edge, source 2.4-3.0 s) out of frame
if V=='A': hook="[0:v]trim=2.4:%.3f,setpts=PTS-STARTPTS,fps=%d,%s,scale=1318:2343:flags=lanczos,crop=1080:1920:0:200,eq=saturation=1.06[s1]"%(2.4+SEG[0],FPS,real)
else:      hook="[0:v]trim=0.7:%.3f,setpts=PTS-STARTPTS,fps=%d,crop=608:1080:730:0,scale=1080:1920:flags=lanczos,setsar=1[s1]"%(0.7+SEG[0],FPS)
fc=[hook,
    "[1:v]trim=0.3:%.3f,setpts=PTS-STARTPTS,fps=%d,scale=1080:1920:flags=lanczos,setsar=1[s2]"%(0.3+SEG[1],FPS),
    "[2:v]trim=0:5.0,setpts=%.4f*(PTS-STARTPTS),fps=%d,scale=1080:1920:flags=lanczos,setsar=1,trim=0:%.3f[s3]"%(SEG[2]/5.0+0.002,FPS,SEG[2]),
    "[3:v]trim=0:%.3f,setpts=PTS-STARTPTS,fps=%d,%s[s4]"%(SEG[3],FPS,real),
    "[4:v]trim=2.35:3.866,setpts=1.45*(PTS-STARTPTS),fps=%d,%s,gblur=sigma=22,eq=brightness=-0.06,trim=0:%.3f[s5]"%(FPS,real,SEG[4])]
prev='s1'; off=0.0
for i,s in enumerate(['s2','s3','s4','s5']):
    off+=SEG[i]-XF; fc.append("[%s][%s]xfade=transition=fade:duration=%.2f:offset=%.3f[x%d]"%(prev,s,XF,off,i)); prev='x%d'%i
def ov(idx,a,b,y='0',x='0',fin=0.25,fout=0.2):
    global prev
    tag='o%d'%idx; fade="fade=in:st=%.2f:d=%.2f:alpha=1"%(a,fin)+(",fade=out:st=%.2f:d=%.2f:alpha=1"%(b-fout,fout) if fout else '')
    fc.append("[%d:v]format=rgba,%s[l%d]"%(idx,fade,idx)); fc.append("[%s][l%d]overlay=x='%s':y='%s':enable='between(t,%.2f,%.2f)'[%s]"%(prev,idx,x,y,a,b,tag)); prev=tag
LAY=['c1','c2','panel','i0','i1','i2','i3','c4a','c4b','lockup']; base=5
ov(base+0,0.25,2.85,y='-18*(t-0.25)')
ov(base+1,3.15,5.3,y='-18*(t-3.15)')
PEND=min(CUT[2]-0.1,VEND+0.12); ov(base+2,5.4,PEND)   # the panel holds until the voice finishes
for k,ti in enumerate(TICKS): ov(base+3+k,ti,PEND,x='-44*max(0,1-(t-%.2f)/0.3)'%ti)   # each tick lands on its spoken word
ov(base+7,11.1,12.85,y='-16*(t-11.1)'); ov(base+8,11.7,12.85,y='-16*(t-11.1)')
ov(base+9,13.05,DUR+0.1,y='-16*(t-13.05)',fin=0.3,fout=0)
srcs=['src/v19.mp4' if V=='A' else 'src/clipA.mp4','src/house.mp4','src/veranda2.mp4','src/v25.mp4','src/v25.mp4']
cmd=['ffmpeg','-v','error','-y']
for s in srcs: cmd+=['-i',s]
for l in LAY: cmd+=['-loop','1','-t','%.2f'%(DUR+0.2),'-i','out/%s.png'%l]
cmd+=['-i','out/mix.wav','-filter_complex',';'.join(fc),'-map','[%s]'%prev,'-map','%d:a'%(len(srcs)+len(LAY)),
      '-t','%.3f'%DUR,'-r',str(FPS),'-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
      '-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart','out/%s.mp4'%NAME]
subprocess.run(cmd,check=True); print('written out/%s.mp4'%NAME)
