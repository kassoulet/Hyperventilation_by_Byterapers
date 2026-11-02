"""boot_trace.py: like boot.py but logs every resource load (bitmap 0x49ee4, bump 0x4a208, 3DS scene 0x2bf23) with the scene-init function that triggered it."""
import emucore as E,struct,sys
from unicorn import *
from unicorn.x86_const import *
def wr32(a,v): E.mu.mem_write(a,struct.pack('<I',v))
def rd32(a): return struct.unpack('<I',bytes(E.mu.mem_read(a,4)))[0]
def ret():
    esp=E.ireg('ESP'); r=rd32(esp); E.w('ESP',esp+4); E.mu.reg_write(UC_X86_REG_EIP,r)
def detect(): wr32(0x21b82c,5); wr32(0x21b828,0x10d634); E.w('EAX',1); ret()
E.mu.hook_add(UC_HOOK_CODE,lambda *a:detect(),begin=0x274c8,end=0x274c8)
E.mu.hook_add(UC_HOOK_CODE,lambda *a:(E.mu.mem_write(0x149810,b'\x01'),E.mu.mem_write(0x14981a,b'\x01')),begin=0x1d378,end=0x1d378)
INITS=[0x2359c,0x22030,0x2109c,0x1eea0,0x20dd0,0x1f13c,0x1e390,0x1f4fc]
cur=['pre']
import re
src=open(E.HERE+'/ds.py') # noqa
# init function addresses = call targets in main between 0x1df0e.. (recover from code)
m=open(E.HERE+'/mem_clean.bin','rb').read(0x70000)
calls=[(0,t) for t in [0x2359c,0x22030,0x2109c,0x1eea0,0x20dd0,0x1f13c,0x1e390,0x1fe00,0x21af4,0x23270,0x25020,0x25540,0x2427c,0x249d0,0x21350,0x24c90,0x25b60]]
def mk(t):
    def f(*a): cur[0]=hex(t); print('== init',hex(t),flush=True)
    return f
for i,t in calls: E.mu.hook_add(UC_HOOK_CODE,mk(t),begin=t,end=t)
def lg(kind,reg):
    def f(*a):
        p=E.ireg(reg)
        try: nm=E.cstr(p)
        except: nm='?'
        print('  %s %s  (from %x)'%(kind,nm,rd32(E.ireg('ESP'))),flush=True)
    return f
E.mu.hook_add(UC_HOOK_CODE,lg('bitmap','EAX'),begin=0x49ee4,end=0x49ee4)
E.mu.hook_add(UC_HOOK_CODE,lg('bump','EAX'),begin=0x4a208,end=0x4a208)
E.mu.hook_add(UC_HOOK_CODE,lg('scene3ds','EDX'),begin=0x2bf23,end=0x2bf23)
E.mu.hook_add(UC_HOOK_CODE,lambda *a:E.mu.emu_stop(),begin=0x1d56a,end=0x1d56a)
E.mu.reg_write(E.R('ESP'),0x3f0000)
E.run(0x2bbf8,6000000000)
