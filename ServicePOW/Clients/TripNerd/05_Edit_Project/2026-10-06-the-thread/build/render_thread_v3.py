#!/usr/bin/env python3
# TripNerd "The thread" — the first 8.0 s: a group thread that never books, then "Booked. TripNerd."
# Generic messaging look (not any platform's UI), fictional messages, no names, no outcome claims.
# Renders 1080x1920 @ 30 fps frames and pipes them to ffmpeg -> out/thread_v3_silent.mp4. Also writes out/arrivals_v3.json for the sound.
import subprocess, json, math, random
from PIL import Image, ImageDraw, ImageFont
W,H,FPS=1080,1920,24; DUR=8.0; N=int(DUR*FPS)
BG=(28,28,30); INB=(58,58,63); OUTB=(82,142,224); INK=(255,255,255); GREY=(190,190,196)
FT=ImageFont.truetype('fonts/Montserrat-Medium.ttf',42); FH=ImageFont.truetype('fonts/Montserrat-SemiBold.ttf',46); FS=ImageFont.truetype('fonts/Montserrat-SemiBold.ttf',38); FA=ImageFont.truetype('fonts/Montserrat-SemiBold.ttf',28); FS2=ImageFont.truetype('fonts/Montserrat-Regular.ttf',30)
AV={'JM':(196,92,74),'RK':(86,140,110),'DP':(140,100,190),'AL':(190,150,70),'TB':(80,130,170)}
# (time, kind, who, text)  kind: sep | in | out
EV=[(0.00,'sep','','March'),(0.05,'in','JM','Golf trip. This year?'),(0.70,'out','','I\u2019m in'),(1.10,'in','RK','same'),(1.45,'in','DP','100%'),(1.80,'in','TB','haha let\u2019s go'),
    (2.35,'sep','','April'),(2.40,'in','JM','who\u2019s doing badges'),(2.80,'in','AL','I\u2019ll look into it'),
    (3.20,'sep','','July'),(3.25,'in','RK','any update on the house?'),(3.60,'in','AL','let\u2019s regroup after Q2'),
    (3.95,'sep','','November'),(4.00,'in','DP','we still doing this?'),(4.30,'in','JM','next year for sure'),
    (4.60,'sep','','January'),(4.65,'in','RK','anyone?'),
    (6.40,'sep','','February'),(6.45,'out','','Booked. TripNerd.')]
ANCHOR=1150; GAP=18; SEPH=84; PADX,PADY=30,22; MAXW=700
def wrap(d,text,font,maxw):
    lines=[]; cur=''
    for w in text.split():
        t=(cur+' '+w).strip()
        if d.textbbox((0,0),t,font=font)[2]>maxw: lines.append(cur); cur=w
        else: cur=t
    return lines+[cur]
# layout: compute each item's height and its natural y (stacked from 0)
tmp=ImageDraw.Draw(Image.new('RGB',(W,H))); items=[]
y=0
for (t,kind,who,text) in EV:
    if kind=='sep': h=SEPH; lines=[text]
    else:
        lines=wrap(tmp,text,FT,MAXW-2*PADX); h=len(lines)*52+2*PADY
    items.append({'t':t,'kind':kind,'who':who,'lines':lines,'h':h,'y':y}); y+=h+GAP
def ease(x): return 1-(1-x)**3
def scroll_at(tf):
    """offset so the newest *arrived* item sits at ANCHOR, eased over 0.35 s after each arrival, plus a slow drift."""
    arrived=[it for it in items if it['t']<=tf]
    if not arrived: return 0.0
    # target offsets for consecutive arrivals; ease between previous and current
    def target(it): return it['y']+it['h']-(ANCHOR-440)   # may be negative: the list hangs from the anchor and grows upward, like a real chat
    cur=arrived[-1]; prev=arrived[-2] if len(arrived)>1 else None
    k=min(1.0,(tf-cur['t'])/0.35); a=target(prev) if prev else 0.0; b=target(cur)
    off=a+(b-a)*ease(k)
    settle=70.0*ease(min(1.0,max(0.0,(tf-6.45)/1.55))) if tf>6.45 else 0.0   # after "Booked" the list settles upward, fast then slow, so the hold is never a freeze
    return off+16.0*tf+settle   # drift: the whole list keeps creeping up (nothing is ever frozen)
def frame(tf):
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im)
    off=scroll_at(tf); top=440
    for idx,it in enumerate(items):
        if it['t']>tf: continue
        age=tf-it['t']; k=min(1.0,age/(0.6 if idx<2 else 0.35)); kk=ease(k)
        yy=top+it['y']-off+(1-kk)*(320 if idx<2 else 160)   # the hook slides in from low in the frame; nothing sits still
        if yy+it['h']<top-20 or yy>H: continue
        alpha=kk
        if it['kind']=='sep':
            txt=it['lines'][0]; bb=d.textbbox((0,0),txt,font=FS); col=tuple(int(BG[i]+(GREY[i]-BG[i])*alpha) for i in range(3))
            d.text(((W-(bb[2]-bb[0]))//2,yy+20),txt,font=FS,fill=col); continue
        lines=it['lines']; tw=max(d.textbbox((0,0),l,font=FT)[2] for l in lines)+2*PADX; th=it['h']
        if it['kind']=='in':
            ax=60; bx=ax+72+22; col=INB
            # avatar
            av=AV.get(it['who'],(120,120,120)); avc=tuple(int(BG[i]+(av[i]-BG[i])*alpha) for i in range(3))
            d.ellipse((ax,yy+th-72,ax+72,yy+th),fill=avc); ib=d.textbbox((0,0),it['who'],font=FA)
            d.text((ax+36-(ib[2]-ib[0])//2-ib[0],yy+th-72+18),it['who'],font=FA,fill=INK)
        else:
            bx=W-60-tw; col=OUTB
        bcol=tuple(int(BG[i]+(col[i]-BG[i])*alpha) for i in range(3)); tcol=tuple(int(BG[i]+(INK[i]-BG[i])*alpha) for i in range(3))
        if it['kind']=='out' and it['lines'][0].startswith('Booked'):
            s=0.92+0.08*ease(min(1.0,age/0.3)); cx=bx+tw/2; cy=yy+th/2; bx2=cx-tw*s/2; yy2=cy-th*s/2
            d.rounded_rectangle((bx2,yy2,bx2+tw*s,yy2+th*s),radius=34,fill=bcol)
            ty=yy2+PADY*s
            for l in lines: d.text((bx2+PADX*s,ty),l,font=FT,fill=tcol); ty+=52*s
        else:
            d.rounded_rectangle((bx,yy,bx+tw,yy+th),radius=34,fill=bcol); ty=yy+PADY
            for l in lines: d.text((bx+PADX,ty),l,font=FT,fill=tcol); ty+=52
    # header drawn last on an opaque band (sits below the 250 px UI zone); the list scrolls underneath it
    d.rectangle((0,0,W,426),fill=BG)
    d.text(((W-d.textbbox((0,0),'The golf trip',font=FH)[2])//2,286),'The golf trip',font=FH,fill=INK)
    d.text(((W-d.textbbox((0,0),'6 people',font=FS2)[2])//2,346),'6 people',font=FS2,fill=(150,150,156))
    d.line((60,410,W-60,410),fill=(50,50,54),width=2)
    return im
if __name__=='__main__':
    import sys
    if len(sys.argv)>1 and sys.argv[1]=='stills':
        for t in [float(x) for x in sys.argv[2].split(',')]: frame(t).save('out/thread3_%05.2f.png'%t)
        sys.exit()
    json.dump([{'t':e[0],'kind':e[1],'text':e[3]} for e in EV],open('out/arrivals_v3.json','w'))
    p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r',str(FPS),'-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','out/thread_v3_silent.mp4'],stdin=subprocess.PIPE)
    for i in range(N): p.stdin.write(frame(i/FPS).tobytes())
    p.stdin.close(); p.wait(); print('thread_silent.mp4 written, frames',N)
