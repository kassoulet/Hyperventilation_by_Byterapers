#!/usr/bin/env python3
"""xref.py VALUE [lo hi]: find 32-bit LE occurrences of VALUE in mem.bin code/data."""
import sys,struct
m=open(__file__.rsplit('/',1)[0]+'/mem_clean.bin','rb').read(0x110000)
v=struct.pack('<I',int(sys.argv[1],16)); j=0
while True:
    j=m.find(v,j+1)
    if j<0: break
    print(hex(j))
