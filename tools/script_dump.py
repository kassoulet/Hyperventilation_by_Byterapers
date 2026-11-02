#!/usr/bin/env python3
"""script_dump.py: decode the in-binary demo script (table at 0x104aa0, 28-byte records) and the sprite table (0x105dfc, 36-byte records) from
re/mem_clean.bin, convert (order,row) to seconds with re/xm_times.json, write web/assets/script.json and print a readable timeline."""
import struct,json,sys,os
H=os.path.dirname(os.path.abspath(__file__))+'/../re/'
m=open(H+'mem_clean.bin','rb').read(0x110000)
xm=json.load(open(H+'xm_times.json')); T={(r[0],r[1]):r[2] for r in xm['rows']}
def cs(a): return m[a:m.index(b'\0',a)].decode('latin1')
CMD={1:'sprite_start',2:'sprite_stop',3:'sprite_?3',4:'sprite_?4(alpha/size)',5:'sprite_?5',6:'fade_to_color',7:'flash_color',8:'sprite_?8',13:'sprite_?13'}
ev=[]
for i in range(400):
    o,r,ty,fn,a,b,c=struct.unpack_from('<7i',m,0x104aa0+28*i)
    if o==1000: break
    ev.append(dict(i=i,order=o,row=r,t=T.get((o,r)),type=ty,fn=fn,a=a,b=b,c=c))
sp=[]   # NOTE: the real table starts one record earlier (0x105dd8, entry 0 = lasit.png); the web player prepends it (demo.js)
for i in range(43):
    v=struct.unpack_from('<9I',m,0x105dfc+36*i); f=struct.unpack_from('<9f',m,0x105dfc+36*i)
    sp.append(dict(id=i,kind=v[0],alpha=round(f[1],3),flags=v[2],v3=v[3],v4=v[4],img=cs(v[5]) if v[5] else None,x=round(f[7],1),y=round(f[8],1)))
json.dump(dict(events=ev,sprites=sp),open(H+'../web/assets/script.json','w'),indent=0)
if __name__=='__main__':
    for e in ev:
        d=('call %x'%e['fn']) if e['type']!=3 or e['fn']!=0x222c4 else '%s(%d,%d)'%(CMD.get(e['a'],'cmd%d'%e['a']),e['b'],e['c'])
        if e['type']==3 and e['fn']==0x222c4 and e['a'] in(1,2): d+=' '+str(sp[e['b']]['img'])
        if e['type']==1: d='pulse call %x arg=%d'%(e['fn'],e['a'])
        print('%7.2fs o%2d r%02d  %s'%(e['t'] or -1,e['order'],e['row'],d))
