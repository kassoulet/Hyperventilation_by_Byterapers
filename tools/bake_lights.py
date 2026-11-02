#!/usr/bin/env python3
"""bake_lights.py LIGHTDUMP.json... -> web/assets/lightanim.json
Input: dumps made from the original (re/lightdump.py): [[t, {"r,g,b,addr": [inner, outer, x, y, z, mult]}]] per rendered frame, from the per-vertex lighter 0x463ec.
Output: for every light whose range changes over time in the original (the 'flash' chase lights: range = base * max(0, cos(..)), written by the scene code), a table
{file: {"r,g,b#rank": {t0, dt, in:[...], out:[...]}}} sampled at the original's frame rate (10 Hz), gaps (frames where the object was too far to list the light) filled linearly.
rank = index among lights of the same colour sorted by guest address (= file order)."""
import json,sys,struct,glob,os
H=os.path.dirname(os.path.abspath(__file__))+'/../web/assets/'
def lights_of(fn):
    d=open(fn,'rb').read(); out=[]
    def walk(o,end,f):
        while o+6<=end:
            c,l=struct.unpack_from('<HI',d,o)
            if l<6: break
            f(c,o+6,o+l); o+=l
    def cb(c,b,e):
        if c in(0x4D4D,0x3D3D): walk(b,e,cb)
        elif c==0x4000: walk(d.index(b'\0',b)+1,e,cb)
        elif c==0x4600:
            col=[0,0,0]
            def s(c2,b2,e2):
                if c2==0x0010: col[:]=[round(x*255) for x in struct.unpack_from('<3f',d,b2)]
            walk(b+12,e,s); out.append(col[:])
    walk(0,len(d),cb); return out
files={os.path.basename(f)[:-4]:lights_of(f) for f in glob.glob(H+'3ds/*.3ds')}
res={}
for dump in sys.argv[1:]:
    rows=json.load(open(dump)); series={}
    for t,d in rows:
        for k,v in d.items():
            r,g,b,addr=k.split(','); series.setdefault((int(r),int(g),int(b),int(addr,16)),[]).append((t,v[0],v[1]))
    bycol={}
    for (r,g,b,a) in series: bycol.setdefault((r,g,b),[]).append(a)
    for col,addrs in bycol.items():
        addrs.sort()
        for rank,a in enumerate(addrs):
            ser=series[(*col,a)]; outs=[o for _,_,o in ser]
            if max(outs)-min(outs)<1 or len(ser)<6: continue
            owners=[f for f,L in files.items() if list(col) in L]
            # same colour may exist in several files: keep those that have at least rank+1 lights of this colour
            owners=[f for f in owners if sum(1 for x in files[f] if x==list(col))>rank]
            t0=ser[0][0]; n=int(round((ser[-1][0]-t0)/0.1))+1; I=[None]*n; O=[None]*n
            for t,i,o in ser: k=int(round((t-t0)/0.1)); I[k]=i; O[k]=o
            for arr in (I,O):                       # fill gaps
                last=None
                for k in range(n):
                    if arr[k] is not None:
                        if last is not None and k-last>1:
                            for j in range(last+1,k): arr[j]=arr[last]+(arr[k]-arr[last])*(j-last)/(k-last)
                        last=k
            for f in owners:
                res.setdefault(f,{}).setdefault('%d,%d,%d#%d'%(*col,rank),[]).append({'t0':round(t0,3),'dt':0.1,'in':[round(x,2) for x in I],'out':[round(x,2) for x in O]})
json.dump(res,open(H+'lightanim.json','w'),separators=(',',':'))
print({f:{k:[len(s['out']) for s in v] for k,v in d.items()} for f,d in res.items()})
