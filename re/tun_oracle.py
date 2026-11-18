#!/usr/bin/env python3
"""tun_oracle.py OUT.npz [T0SEC] [N]: per-frame oracle of the lava-tunnel callback 0x23528 under the Unicorn harness (virtual clock, K=7).
At each call (after T0SEC) stores: tick [0x10eb9c], the 41x26 grid (u,v int32 at 0x12d41c, stride 8), the shade array (0x12c374), the texture object's data ([[0x12c364]+0x14], 64 KB),
the shade LUT pointed to by [0x21b314] (64 rows x 256 x 4 B), the 8-bit surface after the cell filler (0x12c36c, 320x200) and the final RGB screen after the callback (VRAM frame_rgb)."""
import sys,numpy as np
import harness as H,emucore as E
from unicorn import *
out=sys.argv[1]; T0=float(sys.argv[2]) if len(sys.argv)>2 else 30.2; N=int(sys.argv[3]) if len(sys.argv)>3 else 6
g=H.Golden(); g.k=7; g.stop_at=int(60*70)
rd=lambda a,s:bytes(E.mu.mem_read(a,s)); r32=lambda a:int.from_bytes(rd(a,4),'little')
fr=[]; cur=[None]
def entry(*a):
    if g.ticks/70.0<T0 or len(fr)>=N: return
    cur[0]=dict(tick=r32(0x10eb9c),ticks=g.ticks,fi=g.frames)
def after_grid(*a):   # at 0x2354b: cell filler done
    if cur[0] is None: return
    c=cur[0]; tex=r32(0x12c364)
    c['grid']=np.frombuffer(rd(0x12d41c-8,41*26*8+16),np.int32).copy()
    c['sh']=np.frombuffer(rd(0x12c374,41*26*4+8),np.int32).copy()
    c['tex']=np.frombuffer(rd(r32(tex+0x14),65536),np.uint8).copy() if tex else None
    lut=r32(0x21b314); c['lut']=np.frombuffer(rd(lut,64*256*4),np.uint8).copy()
    c['surf']=np.frombuffer(rd(r32(0x12c36c),64000),np.uint8).copy()
    c['texobj']=np.frombuffer(rd(tex,0x40),np.uint8).copy()
def done(*a):
    if cur[0] is None: return
    fr.append(cur[0]); print('captured tick',cur[0]['tick'],len(fr),flush=True); cur[0]=None
    if len(fr)>=N: pend[0]=1
pend=[0]
E.mu.hook_add(UC_HOOK_CODE,entry,begin=0x23528,end=0x23528)
E.mu.hook_add(UC_HOOK_CODE,after_grid,begin=0x2354b,end=0x2354b)
E.mu.hook_add(UC_HOOK_CODE,done,begin=0x2357d,end=0x2357d)
rgbs={}
def on_frame(g,i):
    # every frame's screen (the callback's output reaches the screen a few frames later: page-flip lag); fi = frame index of the capture
    t=g.ticks/70.0
    if t>=T0-0.3 and (not fr or g.frames<=fr[0]['fi']+N+6): rgbs[g.frames]=g.frame_rgb().copy()
    if len(fr)>=N and g.frames>fr[-1]['fi']+5:
        np.savez_compressed(out,rgbs_k=np.array(sorted(rgbs)),rgbs=np.array([rgbs[k] for k in sorted(rgbs)]),**{k:np.array([f[k] for f in fr]) for k in fr[0]}); print('saved'); E.mu.emu_stop(); E.exited[0]=1
g.on_frame=on_frame
g.run()
