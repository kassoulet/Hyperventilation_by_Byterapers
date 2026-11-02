"""harness.py - run the ORIGINAL demo code under Unicorn with a virtual clock and grab real frames.
 from harness import *; g=Golden(); g.run(ticks_per_frame=7, on_frame=cb)
Virtual time: 70 ticks/s. The 70 Hz MIDAS timer callback (0x1de94, increments the tick counters and calls the engine's per-tick hook) is
injected by hand at the main-loop spin (0x1d56a); MIDASgetPlayStatus (0x27fac) is replaced by a lookup in re/xm_times.json."""
import emucore as E,struct,json,bisect
from unicorn import *
from unicorn.x86_const import *
mu=E.mu
XM=json.load(open(E.HERE+'/xm_times.json'))
ROWS=XM['rows']; TIMES=[r[2] for r in ROWS]
def rd32(a): return struct.unpack('<I',bytes(mu.mem_read(a,4)))[0]
def wr32(a,v): mu.mem_write(a,struct.pack('<I',v&0xffffffff))
def pos_at(t):
    i=max(0,bisect.bisect_right(TIMES,t)-1); r=ROWS[i]
    return XM['orders'][r[0]] if False else r
FB=0x20000000; W,H=320,240
class Golden:
    def __init__(s,state=None):
        st=E.load_snapshot(state or E.HERE+'/state.bin')
        ex=st.get('extra') or {}
        s.resumed=False; s.ticks=ex.get('ticks',0); s.pending=0; s.k=7; s.frames=0; s.on_frame=None; s.stop_at=None; s.pos_override=None
        mu.hook_add(UC_HOOK_CODE,lambda *a:s.spin(),begin=0x1d56a,end=0x1d56a)
        mu.hook_add(UC_HOOK_CODE,lambda *a:s.getstatus(),begin=0x27fac,end=0x27fac)
    def _ret(s):
        esp=E.ireg('ESP'); r=struct.unpack('<I',bytes(mu.mem_read(esp,4)))[0]; E.w('ESP',esp+4); mu.reg_write(UC_X86_REG_EIP,r)
    def getstatus(s):
        esp=E.ireg('ESP'); p=rd32(esp+4); t=s.ticks/70.0
        r=pos_at(t)
        mu.mem_write(p,struct.pack('<III',r[0],XM['orders'][r[0]],r[1])); E.w('EAX',0); s._ret()
    def spin(s):
        edi=E.ireg('EDI')
        if s.pending==0 and edi!=rd32(0x10eba0): return          # tick advanced: leave the spin loop
        if s.pending==0:                                          # frame boundary
            if s.frames>0 and s.on_frame: s.on_frame(s,s.frames-1)
            s.frames+=1
            if s.stop_at is not None and s.ticks>=s.stop_at: mu.emu_stop(); return
            s.pending=s.k
        s.pending-=1; s.ticks+=1
        esp=E.ireg('ESP')-4; mu.mem_write(esp,struct.pack('<I',0x1d56a)); E.w('ESP',esp); mu.reg_write(UC_X86_REG_EIP,0x1de94)
    def frame_rgb(s):
        import numpy as np
        a=np.frombuffer(bytes(mu.mem_read(FB,W*H*4)),dtype=np.uint8).reshape(H,W,4)
        return a[:,:,[2,1,0]]
    def checkpoint(s,path):
        """snapshot at a frame boundary (call from on_frame); resume with Golden(path)"""
        E.save_snapshot(path,extra={'ticks':s.ticks})
    def run(s,n=80000000000): E.run(0x1d56a if not s.resumed else E.ireg('EIP'),n)
