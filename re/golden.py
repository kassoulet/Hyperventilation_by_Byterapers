#!/usr/bin/env python3
"""golden.py OUTDIR T0 T1 STEP_SEC [K]: run the original from the start with virtual clock, save every STEP-th second frame as PNG (name tNNNN.NN.png).
 (frames are rendered at K ticks/frame, default 7 = 10 fps)"""
import sys,os,time
from harness import *
from PIL import Image
out=sys.argv[1]; t0=float(sys.argv[2]); t1=float(sys.argv[3]); step=float(sys.argv[4]); k=int(sys.argv[5]) if len(sys.argv)>5 else 7
os.makedirs(out,exist_ok=True)
ck=os.environ.get('CKPT'); g=Golden(os.environ.get('RESUME')); g.k=k; g.stop_at=int(t1*70)+1
nxt=[t0]; T=time.time()
def cb(g,i):
    t=g.ticks/70.0
    if ck and int(t)%10==0 and not os.path.exists('%s/ck%04d.bin'%(ck,int(t))): os.makedirs(ck,exist_ok=True); g.checkpoint('%s/ck%04d.bin'%(ck,int(t)))
    if t>=nxt[0]:
        Image.fromarray(g.frame_rgb()).save('%s/t%07.2f.png'%(out,t)); nxt[0]+=step; print('%.2f %.0fs'%(t,time.time()-T),flush=True)
g.on_frame=cb; g.run()
