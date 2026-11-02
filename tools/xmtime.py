#!/usr/bin/env python3
"""xmtime.py [XM] -> JSON {rows:[[order,row,t_sec,speed,bpm],...], length}: start time of every (order,row) as played
sequentially by an XM player (Fxx speed/tempo, Bxx jump, Dxx break, EEx pattern delay, linear/amiga irrelevant for timing)."""
import struct,sys,json
def load(path):
    d=open(path,'rb').read()
    hsize=struct.unpack_from('<I',d,60)[0]
    songlen,restart,nch,npat,ninst,flags,speed,bpm=struct.unpack_from('<8H',d,64)
    orders=list(d[80:80+256])[:songlen]
    o=60+hsize; pats=[]
    for p in range(npat):
        hl,pack,nrows,psize=struct.unpack_from('<IBHH',d,o); o+=hl
        rows=[];q=o
        for r in range(nrows):
            row=[]
            for c in range(nch):
                b=d[q];q+=1
                note=ins=vol=eff=par=0
                if b&0x80:
                    if b&1: note=d[q];q+=1
                    if b&2: ins=d[q];q+=1
                    if b&4: vol=d[q];q+=1
                    if b&8: eff=d[q];q+=1
                    if b&16: par=d[q];q+=1
                else:
                    note=b;ins=d[q];vol=d[q+1];eff=d[q+2];par=d[q+3];q+=4
                row.append((eff,par))
            rows.append(row)
        o+=psize; pats.append(rows)
    return dict(orders=orders,pats=pats,speed=speed,bpm=bpm,nch=nch,restart=restart)
def timeline(xm,maxrows=100000):
    orders,pats=xm['orders'],xm['pats']; speed,bpm=xm['speed'],xm['bpm']
    t=0.0; out=[]; od=0; row=0; seen=set()
    while od<len(orders) and len(out)<maxrows:
        if (od,row) in seen: break
        seen.add((od,row))
        out.append([od,row,round(t,5),speed,bpm])
        pat=pats[orders[od]]; jump=None; brk=None; delay=0
        for eff,par in pat[row]:
            if eff==0xF:
                if par==0: pass
                elif par<32: speed=par
                else: bpm=par
            elif eff==0xB: jump=par
            elif eff==0xD: brk=(par>>4)*10+(par&15)
            elif eff==0xE and (par>>4)==0xE: delay=par&15
        t+=(speed*(1+delay))*2.5/bpm
        if jump is not None: od=jump; row=brk or 0
        elif brk is not None: od+=1; row=brk
        else:
            row+=1
            if row>=len(pat): od+=1; row=0
    return out,t
if __name__=='__main__':
    xm=load(sys.argv[1] if len(sys.argv)>1 else '../Hypermmx.xm')
    tl,end=timeline(xm)
    print(json.dumps({'length':round(end,3),'orders':xm['orders'],'rows':tl}))
