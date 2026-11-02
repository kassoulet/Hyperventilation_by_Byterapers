#!/usr/bin/env python3
"""kfinfo.py FILE.3DS: dump keyframer info (frame range, per node: name, parent, #keys of pos/rot/scale/fov/roll, first/last frames)."""
import struct,sys
d=open(sys.argv[1],'rb').read()
def walk(o,end,fn,depth=0):
    while o+6<=end:
        c,l=struct.unpack_from('<HI',d,o)
        if l<6: break
        fn(c,o+6,o+l,depth); o+=l
nodes=[]; seg=[None]; cur=[None]
def cstr(o):
    e=d.index(b'\0',o); return d[o:e].decode('latin1'),e+1
def tl(b):
    flags,=struct.unpack_from('<H',d,b); n,=struct.unpack_from('<I',d,b+10); return flags,n
def cb(c,b,e,dp):
    if c in(0x4D4D,0xB000): walk(b,e,cb,dp+1)
    elif c==0xB008: seg[0]=struct.unpack_from('<II',d,b)
    elif c in(0xB002,0xB003,0xB004,0xB005,0xB006,0xB007):
        cur[0]={'type':{0xB002:'obj',0xB003:'cam',0xB004:'camtgt',0xB005:'light',0xB006:'spottgt',0xB007:'spot'}[c],'tr':{}}; nodes.append(cur[0]); walk(b,e,cb,dp+1)
    elif c==0xB010:
        n,p=cstr(b); fl1,fl2,par=struct.unpack_from('<HHh',d,p); cur[0]['name']=n; cur[0]['parent']=par
    elif c==0xB030: cur[0]['id']=struct.unpack_from('<H',d,b)[0]
    elif c==0xB013: cur[0]['pivot']=struct.unpack_from('<3f',d,b)
    elif c in(0xB020,0xB021,0xB022,0xB023,0xB024):
        fl,n=tl(b); q=b+14; frames=[]
        for i in range(n):
            f,=struct.unpack_from('<I',d,q); sf,=struct.unpack_from('<H',d,q+4); q+=6
            for bit in(1,2,4,8,16): 
                if sf&bit: q+=4
            sz={0xB020:12,0xB021:16,0xB022:12,0xB023:4,0xB024:4}[c]; q+=sz; frames.append(f)
        cur[0]['tr'][{0xB020:'pos',0xB021:'rot',0xB022:'scl',0xB023:'fov',0xB024:'roll'}[c]]=(n,frames[0] if frames else None,frames[-1] if frames else None)
walk(0,len(d),cb)
print('segment',seg[0])
for n in nodes: print(n.get('id'),n['type'],n.get('name'),'parent',n.get('parent'),n['tr'])
