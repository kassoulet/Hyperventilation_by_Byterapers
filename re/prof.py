#!/usr/bin/env python3
"""prof.py T [NFRAMES]: run to time T (s), then count basic-block executions (weighted by block size) over NFRAMES frames; print hottest blocks."""
import sys,collections
from harness import *
T=float(sys.argv[1]); NF=int(sys.argv[2]) if len(sys.argv)>2 else 3
import os
g=Golden(os.environ.get("RESUME")); g.k=7
cnt=collections.Counter(); st={'on':False,'n':0}
def blk(uc,a,sz,_): cnt[a]+=sz
def cb(gg,i):
    if st['on']:
        st['n']+=1
        if st['n']>=NF: mu.emu_stop()
    elif gg.ticks/70>=T:
        st['on']=True; mu.hook_add(UC_HOOK_BLOCK,blk)
g.on_frame=cb; g.run()
tot=sum(cnt.values()); print('total bytes executed',tot)
import ds
agg=collections.Counter()
for a,n in cnt.items(): agg[a>>6]+=n
for a,n in cnt.most_common(14): print('block %x %d bytes-exec (%.1f%%)'%(a,n,100*n/tot))
for p,n in agg.most_common(0): print('%6.2f%% region %x'%(100*n/tot,p<<6))
