"""cbtrace.py: log, once per 0.25 s of virtual time, the engine's render callback ([0x10ebb8]) and pre-render callback pointer, until the end."""
import sys
from harness import *
g=Golden(); g.k=7; g.stop_at=70*195
last=[None]
def cb(g,i):
    r=(rd32(0x10ebb8),rd32(0x10ebb4),rd32(0x10eb74),rd32(0x10ebe0))
    if r!=last[0]:
        print('%7.2f cb=%x pre=%x flag74=%x'%(g.ticks/70,r[0],r[1],r[2]),flush=True); last[0]=r
g.on_frame=cb; g.run()
