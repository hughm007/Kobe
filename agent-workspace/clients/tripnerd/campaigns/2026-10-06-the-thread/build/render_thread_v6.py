#!/usr/bin/env python3
# TripNerd "The thread" v6 - the first 10.3 s: a phone-style group thread (light mode, blue and grey bubbles with tails, typing dots,
# a "Delivered" receipt), three messages a year apart, then "Booked. TripNerd." No platform name, no status bar, no platform icons.
# Fictional first names and messages. Renders 1080x1920 @ 24 fps frames piped to ffmpeg -> out/thread_v6_silent.mp4; writes out/arrivals_v6.json.
import subprocess, json, math
from PIL import Image, ImageDraw, ImageFont
W,H,FPS=1080,1920,24; DUR=10.3; N=int(DUR*FPS)
BG=(255,255,255); GREY=(233,233,235); BLUE=(27,135,255); INK=(0,0,0); SUBC=(142,142,147); LINE=(214,214,218); AVC=(170,170,176)
F=lambda n,s: ImageFont.truetype('fonts/Inter-%s.ttf'%n,s)
FT=F('Regular',44); FN=F('Regular',28); FDB=F('SemiBold',28); FDR=F('Regular',28); FH=F('SemiBold',34); FDel=F('Regular',26); FAV=F('SemiBold',26); FAV2=F('SemiBold',40)
EV=[(0.00,'sep','','Tue, Mar 4|at 7:12 PM'),(0.45,'typing','Jake','1.25'),(1.70,'in','Jake','Golf trip this year?'),
    (4.30,'sep','','Sat, Nov 15|at 9:41 PM'),(4.75,'typing','Ryan','1.15'),(5.90,'in','Ryan','next year for sure'),
    (8.20,'sep','','Mon, Feb 9|at 6:30 AM'),(8.70,'out','','Booked. TripNerd.'),(9.35,'delivered','','Delivered')]
ANCHOR=1120; GAP=14; MAXW=700; PADX,PADY=30,22; LH=56; DRIFT=14.0
def wrap(d,text,font,maxw):
    lines=[]; cur=''
    for w in text.split():
        t=(cur+' '+w).strip()
        if d.textbbox((0,0),t,font=font)[2]>maxw: lines.append(cur); cur=w
        else: cur=t
    return lines+[cur]
tmp=ImageDraw.Draw(Image.new('RGB',(W,H)))
# items: each has start time, an optional end time (typing bubbles end when their message arrives), a height and a slot
items=[]
for (t,kind,who,text) in EV:
    if kind=='sep': items.append(dict(t=t,end=None,kind=kind,who=who,text=text,h=64,lines=[]))
    elif kind=='typing':
        end=[e[0] for e in EV if e[1]=='in' and e[2]==who and e[0]>t][0]; items.append(dict(t=t,end=end,kind=kind,who=who,text='',h=34+76,lines=[]))
    elif kind=='in':
        lines=wrap(tmp,text,FT,MAXW-2*PADX); items.append(dict(t=t,end=None,kind=kind,who=who,text=text,h=34+len(lines)*LH+2*PADY,lines=lines))
    elif kind=='out':
        lines=wrap(tmp,text,FT,MAXW-2*PADX); items.append(dict(t=t,end=None,kind=kind,who=who,text=text,h=len(lines)*LH+2*PADY,lines=lines))
    elif kind=='delivered': items.append(dict(t=t,end=None,kind=kind,who=who,text=text,h=34,lines=[]))
def ease(x): return 1-(1-x)**3
def layout(tf):
    """visible items with their resting y (bottom-anchored stack), easing the stack when heights change."""
    vis=[it for it in items if it['t']<=tf and (it['end'] is None or tf<it['end'])]
    # a typing bubble is replaced by its message in the same slot: the stack height changes by (msg h - typing h); ease that change
    y=ANCHOR; pos={}
    for it in reversed(vis):
        pos[id(it)]=y-it['h']; y-=it['h']+GAP
    return vis,pos
def bubble(layer,x0,y0,w,h,col,tail,scale=1.0):
    d=ImageDraw.Draw(layer)
    if scale!=1.0:
        cx=x0+w if tail=='right' else x0; cy=y0+h; x0=cx-(cx-x0)*scale; y0=cy-(cy-y0)*scale; w*=scale; h*=scale
    r=36; d.rounded_rectangle((x0,y0,x0+w,y0+h),radius=r,fill=col)
    if tail=='left':
        d.ellipse((x0-14,y0+h-36,x0+22,y0+h),fill=col); d.ellipse((x0-30,y0+h-40,x0-2,y0+h+4),fill=BG)
    else:
        d.ellipse((x0+w-22,y0+h-36,x0+w+14,y0+h),fill=col); d.ellipse((x0+w+2,y0+h-40,x0+w+30,y0+h+4),fill=BG)
    return x0,y0,w,h
def frame(tf):
    im=Image.new('RGB',(W,H),BG); vis,pos=layout(tf); off=DRIFT*tf
    for it in vis:
        age=tf-it['t']; k=min(1.0,age/0.38); kk=ease(k); yy=pos[id(it)]-off+(1-kk)*110
        L=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(L)
        if it['kind']=='sep':
            a,b=it['text'].split('|'); wa=d.textbbox((0,0),a,font=FDB)[2]; wb=d.textbbox((0,0),' '+b,font=FDR)[2]; x=(W-wa-wb)//2
            d.text((x,yy+18),a,font=FDB,fill=SUBC+(255,)); d.text((x+wa,yy+18),' '+b,font=FDR,fill=SUBC+(255,))
        elif it['kind'] in ('in','typing'):
            ax=48; bx=ax+64+18
            d.text((bx+18,yy),it['who'],font=FN,fill=SUBC+(255,))
            by=yy+34; bh=it['h']-34
            # avatar beside the bubble's bottom
            d.ellipse((ax,by+bh-64,ax+64,by+bh),fill=AVC); ib=d.textbbox((0,0),it['who'][0],font=FAV); d.text((ax+32-(ib[2]-ib[0])//2-ib[0],by+bh-64+16),it['who'][0],font=FAV,fill=(255,255,255,255))
            if it['kind']=='typing':
                bubble(L,bx,by,132,76,GREY,'left')
                for i in range(3):
                    ph=0.5+0.5*math.sin(2*math.pi*(tf*1.1-i*0.22)); c=int(150-60*ph); d.ellipse((bx+26+i*32,by+28,bx+46+i*32,by+48),fill=(c,c,c+4,255))
            else:
                tw=max(d.textbbox((0,0),l,font=FT)[2] for l in it['lines'])+2*PADX
                bubble(L,bx,by,tw,bh,GREY,'left'); ty=by+PADY-4
                for l in it['lines']: d.text((bx+PADX,ty),l,font=FT,fill=INK+(255,)); ty+=LH
        elif it['kind']=='out':
            tw=max(d.textbbox((0,0),l,font=FT)[2] for l in it['lines'])+2*PADX; bx=W-48-tw; s=0.9+0.1*ease(min(1.0,age/0.28))
            x0,y0,w2,h2=bubble(L,bx,yy,tw,it['h'],BLUE,'right',scale=s); ty=y0+PADY*s-4
            for l in it['lines']: d.text((x0+PADX*s,ty),l,font=FT,fill=(255,255,255,255)); ty+=LH*s
        elif it['kind']=='delivered':
            tb=d.textbbox((0,0),it['text'],font=FDel); d.text((W-48-(tb[2]-tb[0])-8,yy+2),it['text'],font=FDel,fill=SUBC+(255,))
        if kk<1.0:
            a=L.split()[3].point(lambda v: int(v*kk)); L.putalpha(a)
        im.paste(L,(0,0),L)
    d=ImageDraw.Draw(im)
    # header band, opaque: two stacked avatars, the group name, a chevron, a hairline; the list scrolls underneath
    d.rectangle((0,0,W,446),fill=BG)
    d.ellipse((W//2-74,262,W//2+18,354),fill=AVC); d.ellipse((W//2-18,262,W//2+74,354),fill=(186,186,192)); d.ellipse((W//2-21,259,W//2+77,357),outline=BG,width=4)
    ib=d.textbbox((0,0),'J',font=FAV2); d.text((W//2-28-(ib[2]-ib[0])//2-ib[0],262+22),'J',font=FAV2,fill=(255,255,255)); ib=d.textbbox((0,0),'R',font=FAV2); d.text((W//2+28-(ib[2]-ib[0])//2-ib[0],262+22),'R',font=FAV2,fill=(255,255,255))
    t='The golf trip'; tb=d.textbbox((0,0),t,font=FH); x=(W-(tb[2]-tb[0]))//2-14; d.text((x,370),t,font=FH,fill=INK); d.text((x+(tb[2]-tb[0])+12,372),'›',font=FH,fill=SUBC)
    d.line((0,444,W,444),fill=LINE,width=2)
    # input bar (decoration, inside the platform's own UI band): a plus circle and an empty rounded field with a grey mic dot
    d.rectangle((0,1640,W,H),fill=BG); d.line((0,1640,W,1640),fill=LINE,width=2)
    d.ellipse((48,1678,112,1742),fill=GREY); d.line((80,1694,80,1726),fill=SUBC,width=4); d.line((64,1710,96,1710),fill=SUBC,width=4)
    d.rounded_rectangle((136,1676,W-48,1744),radius=34,outline=LINE,width=3); d.ellipse((W-48-56,1690,W-48-16,1730),fill=GREY)
    return im
if __name__=='__main__':
    import sys
    if len(sys.argv)>1 and sys.argv[1]=='stills':
        for t in [float(x) for x in sys.argv[2].split(',')]: frame(t).save('out/thread6_%05.2f.png'%t)
        sys.exit()
    json.dump([{'t':e[0],'kind':e[1],'text':e[3]} for e in EV if e[1] in ('in','out')],open('out/arrivals_v6.json','w'))
    p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r',str(FPS),'-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','out/thread_v6_silent.mp4'],stdin=subprocess.PIPE)
    for i in range(N): p.stdin.write(frame(i/FPS).tobytes())
    p.stdin.close(); p.wait(); print('thread_v6_silent.mp4 written, frames',N)
