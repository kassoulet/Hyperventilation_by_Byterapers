#!/usr/bin/env python3
"""boot.py: boot the unpacked HYPER.EXE (mem_clean.bin) in Unicorn up to the first iteration of the demo main loop
(0x1d56a: spin-wait on the 70 Hz tick counter) and save state.bin. ~60 s.
Host shims: sound card detection forced to 'No Sound' (card 5), keyboard flags set to choose 320x240x32, VBE/DPMI/DOS/PIT/VGA-retrace stubs."""
import emucore as E,struct,sys
from unicorn import *
from unicorn.x86_const import *
def wr32(a,v): E.mu.mem_write(a,struct.pack('<I',v))
def ret():
    esp=E.ireg('ESP'); r=struct.unpack('<I',bytes(E.mu.mem_read(esp,4)))[0]; E.w('ESP',esp+4); E.mu.reg_write(UC_X86_REG_EIP,r)
def detect():            # MIDASdetectSoundCard -> pretend a card was found: 'No Sound' device (table entry 5 at 0x10a48c)
    wr32(0x21b82c,5); wr32(0x21b828,0x10d634); E.w('EAX',1); ret()
E.mu.hook_add(UC_HOOK_CODE,lambda *a:detect(),begin=0x274c8,end=0x274c8)
def key():               # video-mode menu: flags set by the (unemulated) keyboard IRQ handler: any-key + '1'
    E.mu.mem_write(0x149810,b'\x01'); E.mu.mem_write(0x14981a,b'\x01')
E.mu.hook_add(UC_HOOK_CODE,lambda *a:key(),begin=0x1d378,end=0x1d378)
def done():
    print('MAINLOOP reached, saving state.bin'); E.save_snapshot(E.HERE+'/state.bin'); E.mu.emu_stop()
E.mu.hook_add(UC_HOOK_CODE,lambda *a:done(),begin=0x1d56a,end=0x1d56a)
E.mu.reg_write(E.R('ESP'),0x3f0000)
E.run(0x2bbf8,6000000000)
