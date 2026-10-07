#!/usr/bin/env python3
# TripNerd "The thread" v7 - the first 8.0 s: a phone-style group thread that behaves like the real app.
# Messages are pinned under the header and never drift: a received message's typing dots appear in its own slot and morph
# into the bubble in place; a sent message is typed into the compose field, then lifts from the field into its slot (the app's
# own send motion), the field clears and "Delivered" appears. Nothing already on screen moves. Generic status bar drawn here
# (time, bars, battery), no platform name, no platform icons, no "iMessage" placeholder. Inter (OFL). Fictional names.
# Renders 1080x1920 @ 24 fps -> out/thread_v7_silent.mp4; writes out/arrivals_v7.json (sound cues).
import subprocess, json, math, sys
from PIL import Image, ImageDraw, ImageFont
W,H,FPS=1080,1920,24; DUR=8.0; N=int(round(DUR*FPS))
BG=(255,255,255); GREY=(233,233,235); BLUE=(10,132,255); INK=(0,0,0); SUBC=(138,138,142); LINE=(216,216,220); AVC=(168,168,174)
F=lambda n,s: ImageFont.truetype('fonts/Inter-%s.ttf'%n,s)
FT=F('Regular',47); FN=F('Regular',30); FDB=F('SemiBold',31); FDR=F('Regular',31); FH=F('SemiBold',36); FDel=F('Medium',29)
FAV=F('SemiBold',30); FAV2=F('SemiBold',42); FSB=F('SemiBold',44); FPH=F('Regular',46)
# events (seconds)
SEP1=0.00; TYP1=0.00; MSG1=1.20
SEP2=2.55; TYP2=2.85; MSG2=3.85
SEP3=4.95; TYPE0=5.15; TYPE1=5.85; SEND=6.05; FLY=0.26; DELIV=6.55
T1='Golf trip this year?'; T2='next year for sure'; T3='Booked. TripNerd.'
PADX,PADY,LH,R=34,19,60,50; TOP=478
tmp=ImageDraw.Draw(Image.new('RGB',(W,H)))
def tw(t,f): b=tmp.textbbox((0,0),t,font=f); return b[2]-b[0]
# fixed layout (y of every element, decided once: nothing ever re-flows)
y=TOP
L={}
L['sep1']=y; y+=70
L['nm1']=y; y+=38; L['b1']=y; BH=LH+2*PADY; y+=BH+30
L['sep2']=y; y+=70
L['nm2']=y; y+=38; L['b2']=y; y+=BH+30
L['sep3']=y; y+=70
L['b3']=y; y+=BH+8
L['del']=y
COMP_Y=1748; COMP_H=92        # compose field
def ease_out(x): x=min(max(x,0),1); return 1-(1-x)**3
def spring(x):                 # 0->1 with a small overshoot, like the app's bubble pop
    x=min(max(x,0),1); return 1-math.exp(-7*x)*math.cos(9*x)
def bubble(d,x0,y0,w,h,col,tail):
    d.rounded_rectangle((x0,y0,x0+w,y0+h),radius=min(R,h/2),fill=col)
    if tail=='left':
        d.ellipse((x0-15,y0+h-38,x0+24,y0+h),fill=col); d.ellipse((x0-36,y0+h-42,x0-6,y0+h+4),fill=BG)
    elif tail=='right':
        d.ellipse((x0+w-24,y0+h-38,x0+w+15,y0+h),fill=col); d.ellipse((x0+w+6,y0+h-42,x0+w+36,y0+h+4),fill=BG)
def sep(d,yy,a,b,alpha):
    c=tuple(int(255-(255-v)*alpha) for v in SUBC)
    wa=tw(a,FDB); wb=tw(' '+b,FDR); x=(W-wa-wb)//2
    d.text((x,yy+16),a,font=FDB,fill=c); d.text((x+wa,yy+16),' '+b,font=FDR,fill=c)
def avatar(d,ax,ay,letter,size=76):
    d.ellipse((ax,ay,ax+size,ay+size),fill=AVC); ib=d.textbbox((0,0),letter,font=FAV)
    d.text((ax+size/2-(ib[2]-ib[0])/2-ib[0],ay+size/2-(ib[3]-ib[1])/2-ib[1]),letter,font=FAV,fill=(255,255,255))
def incoming(im,tf,who,txt,ty,tm,ny,by):
    """typing dots from ty, morphing into the message at tm, all in one slot (by)."""
    if tf<ty: return
    d=ImageDraw.Draw(im); ax=44; bx=ax+76+22
    d.text((bx+20,ny),who,font=FN,fill=SUBC)
    full_w=tw(txt,FT)+2*PADX; typ_w,typ_h=150,BH
    if tf<tm:
        k=spring((tf-ty)/0.30); s=0.55+0.45*k
        w=typ_w*s; h=typ_h*s; x0=bx; y0=by+BH-h
        bubble(d,x0,y0,w,h,GREY,'left' if s>0.9 else None)
        if s>0.8:
            for i in range(3):
                ph=0.5+0.5*math.sin(2*math.pi*(tf*1.6-i*0.2)); c=int(158-62*ph)
                cx=x0+42+i*33; cy=y0+h/2; r=10
                d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(c,c,c+3))
    else:
        k=ease_out((tf-tm)/0.18); w=typ_w+(full_w-typ_w)*k
        bubble(d,bx,by,w,BH,GREY,'left')
        if k>0.35:
            a=min(1,(k-0.35)/0.5); c=int(255*(1-a))
            d.text((bx+PADX,by+PADY-3),txt,font=FT,fill=(c,c,c))
    avatar(d,ax,by+BH-76,who[0])
def outgoing(im,tf):
    d=ImageDraw.Draw(im); w=tw(T3,FT)+2*PADX; x_end=W-44-w; y_end=L['b3']
    if tf<SEND: return
    p=ease_out((tf-SEND)/FLY)
    # start: the text sits in the compose field; end: the bubble in its slot
    x0=150+(x_end-150)*p; y0=(COMP_Y+(COMP_H-BH)/2)+(y_end-(COMP_Y+(COMP_H-BH)/2))*p
    bubble(d,x0,y0,w,BH,BLUE,'right' if p>0.6 else None)
    d.text((x0+PADX,y0+PADY-3),T3,font=FT,fill=(255,255,255))
def chrome(im,tf):
    d=ImageDraw.Draw(im)
    # status bar (generic): time left, bars + battery right
    d.text((118,58),'6:31',font=FSB,fill=INK)
    bx=W-262
    for i in range(4): hgt=12+i*7; d.rounded_rectangle((bx+i*15,96-hgt,bx+i*15+10,96),radius=3,fill=INK)
    d.rounded_rectangle((W-170,66,W-104,98),radius=10,outline=(150,150,150),width=3); d.rounded_rectangle((W-165,71,W-125,93),radius=6,fill=INK)
    d.rounded_rectangle((W-100,76,W-94,88),radius=2,fill=(150,150,150))
    # header: stacked avatars, group name, chevron, hairline
    d.ellipse((W//2-60,262,W//2+32,354),fill=AVC); d.ellipse((W//2+10,300,W//2+70,360),fill=(186,186,192)); d.ellipse((W//2+7,297,W//2+73,363),outline=BG,width=4)
    ib=d.textbbox((0,0),'J',font=FAV2); d.text((W//2-14-(ib[2]-ib[0])//2-ib[0],262+22),'J',font=FAV2,fill=(255,255,255))
    ib=d.textbbox((0,0),'R',font=FAV); d.text((W//2+40-(ib[2]-ib[0])//2-ib[0],300+13),'R',font=FAV,fill=(255,255,255))
    t='The golf trip'; x=(W-tw(t,FH))//2-14; d.text((x,372),t,font=FH,fill=INK); d.text((x+tw(t,FH)+12,374),'›',font=FH,fill=SUBC)
    d.line((0,446,W,446),fill=LINE,width=2)
    d.text((40,150),'‹',font=F('Regular',84),fill=BLUE)
    # compose row: plus button, field with placeholder or typed text, send arrow when there is text
    d.ellipse((40,COMP_Y+6,40+80,COMP_Y+86),fill=(238,238,240)); d.line((80,COMP_Y+28,80,COMP_Y+64),fill=(120,120,126),width=6); d.line((62,COMP_Y+46,98,COMP_Y+46),fill=(120,120,126),width=6)
    fx0,fx1=138,W-40
    d.rounded_rectangle((fx0,COMP_Y,fx1,COMP_Y+COMP_H),radius=COMP_H//2,outline=(206,206,210),width=3,fill=BG)
    if TYPE0<=tf<SEND:
        n=int(len(T3)*min(1,(tf-TYPE0)/(TYPE1-TYPE0))); s=T3[:n]
        d.text((fx0+30,COMP_Y+18),s,font=FPH,fill=INK)
        if int(tf*2.2)%2==0 or n<len(T3): cx=fx0+30+tw(s,FPH)+4; d.line((cx,COMP_Y+18,cx,COMP_Y+74),fill=BLUE,width=4)
        if n>0: d.ellipse((fx1-82,COMP_Y+10,fx1-10,COMP_Y+82),fill=BLUE); d.line((fx1-46,COMP_Y+66,fx1-46,COMP_Y+28),fill=BG,width=6); d.line((fx1-62,COMP_Y+42,fx1-46,COMP_Y+26),fill=BG,width=6); d.line((fx1-30,COMP_Y+42,fx1-46,COMP_Y+26),fill=BG,width=6)
    else:
        d.text((fx0+30,COMP_Y+18),'Message',font=FPH,fill=(190,190,194))
    d.rounded_rectangle((W//2-140,H-24,W//2+140,H-14),radius=5,fill=(30,30,30))   # home indicator
def frame(tf):
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im)
    for key,t0,a,b in (('sep1',SEP1,'Tue, Mar 4','at 7:12 PM'),('sep2',SEP2,'Sat, Nov 15','at 9:36 PM'),('sep3',SEP3,'Mon, Feb 9','at 6:30 AM')):
        if tf>=t0: sep(d,L[key],a,b,1.0 if t0==0 else ease_out((tf-t0)/0.2))
    incoming(im,tf,'Jake',T1,TYP1,MSG1,L['nm1'],L['b1'])
    incoming(im,tf,'Ryan',T2,TYP2,MSG2,L['nm2'],L['b2'])
    chrome(im,tf)
    outgoing(im,tf)          # drawn last: it lifts over the compose row
    if tf>=DELIV:
        a=ease_out((tf-DELIV)/0.2); c=tuple(int(255-(255-v)*a) for v in SUBC); t='Delivered'
        d.text((W-44-tw(t,FDel)-6,L['del']),t,font=FDel,fill=c)
    return im
if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='stills':
        for t in [float(x) for x in sys.argv[2].split(',')]: frame(t).save('out/thread7_%05.2f.png'%t)
        sys.exit()
    json.dump([{'t':MSG1,'kind':'in','text':T1},{'t':MSG2,'kind':'in','text':T2},{'t':SEND,'kind':'out','text':T3},
               {'t':TYPE0,'kind':'keys','t1':TYPE1}],open('out/arrivals_v7.json','w'))
    p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W,H),'-r',str(FPS),'-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','out/thread_v7_silent.mp4'],stdin=subprocess.PIPE)
    for i in range(N): p.stdin.write(frame(i/FPS).tobytes())
    p.stdin.close(); p.wait(); print('thread_v7_silent.mp4 written, frames',N)
