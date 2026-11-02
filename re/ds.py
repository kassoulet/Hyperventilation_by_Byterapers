#!/usr/bin/env python3
"""ds.py ADDR [N] - disassemble N insns at linear ADDR of mem.bin (linear == file offset)."""
import sys,os
from capstone import *
H=os.path.dirname(os.path.abspath(__file__))
img=open(H+'/mem_clean.bin','rb').read(0x300000) if False else None
def load():
    global img
    if img is None: img=open(H+'/mem_clean.bin','rb').read()
    return img
def dis(a,n=40,out=print):
    load(); md=Cs(CS_ARCH_X86,CS_MODE_32); cnt=0
    while cnt<n:
        ins=list(md.disasm(img[a:a+16],a,1))
        if not ins: out('%x  db %02x'%(a,img[a])); a+=1; cnt+=1; continue
        i=ins[0]; out('%x  %-22s %s %s'%(i.address,i.bytes.hex(),i.mnemonic,i.op_str)); a+=i.size; cnt+=1
if __name__=='__main__': dis(int(sys.argv[1],16),int(sys.argv[2]) if len(sys.argv)>2 else 40)
