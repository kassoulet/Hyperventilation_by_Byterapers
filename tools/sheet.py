#!/usr/bin/env python3
"""sheet.py DIR OUT.png T0 T1 STEP [COLS] [SCALE]: contact sheet of frames t*.png (nearest to each step) with timestamps."""
import sys,glob,os
from PIL import Image,ImageDraw
d,out,t0,t1,step=sys.argv[1],sys.argv[2],float(sys.argv[3]),float(sys.argv[4]),float(sys.argv[5])
cols=int(sys.argv[6]) if len(sys.argv)>6 else 6; sc=float(sys.argv[7]) if len(sys.argv)>7 else 0.5
fs=sorted(glob.glob(d+'/t*.png')); ts=[float(os.path.basename(f)[1:-4]) for f in fs]
sel=[];t=t0
while t<=t1:
    i=min(range(len(ts)),key=lambda k:abs(ts[k]-t)); sel.append((ts[i],fs[i])); t+=step
w,h=int(320*sc),int(240*sc); rows=(len(sel)+cols-1)//cols
sh=Image.new('RGB',(cols*w,rows*h))
for n,(t,f) in enumerate(sel):
    im=Image.open(f).convert('RGB').resize((w,h)); ImageDraw.Draw(im).text((2,2),'%.1f'%t,fill=(255,255,0)); sh.paste(im,((n%cols)*w,(n//cols)*h))
sh.save(out)
