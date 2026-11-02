#!/usr/bin/env python3
"""callers.py ADDR: list call/jmp rel32 sites targeting ADDR in code (mem_clean.bin)."""
import sys,struct
m=open(__file__.rsplit('/',1)[0]+'/mem_clean.bin','rb').read(0x70000)
t=int(sys.argv[1],16)
for i in range(0x1b000,0x6fff0):
    if m[i] in(0xe8,0xe9):
        rel=struct.unpack_from('<i',m,i+1)[0]
        if i+5+rel==t: print(hex(i),'call' if m[i]==0xe8 else 'jmp')
