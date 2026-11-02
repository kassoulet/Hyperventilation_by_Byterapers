#!/usr/bin/env python3
"""cmp.py MINE_DIR GOLD_DIR OUT.png [COLS]: side-by-side (port | original) for every t*.png in MINE_DIR; prints mean abs error per channel for each."""
import sys,glob,os
import numpy as np
from PIL import Image,ImageDraw
m,g,out=sys.argv[1:4]; cols=int(sys.argv[4]) if len(sys.argv)>4 else 4
gs={float(os.path.basename(f)[1:-4]):f for f in glob.glob(g+'/t*.png')}
fs=sorted(glob.glob(m+'/t*.png')); tiles=[]; errs=[]
for f in fs:
    t=float(os.path.basename(f)[1:-4]); gt=min(gs,key=lambda x:abs(x-t))
    a=Image.open(f).convert('RGB'); b=Image.open(gs[gt]).convert('RGB')
    e=np.abs(np.asarray(a,float)-np.asarray(b,float)).mean(); errs.append(e)
    im=Image.new('RGB',(640,240)); im.paste(a,(0,0)); im.paste(b,(320,0)); ImageDraw.Draw(im).text((2,2),'%.1fs err %.1f'%(t,e),fill=(255,255,0)); tiles.append(im)
rows=(len(tiles)+cols-1)//cols; sh=Image.new('RGB',(cols*640,rows*240))
for i,im in enumerate(tiles): sh.paste(im,((i%cols)*640,(i//cols)*240))
sh.resize((sh.width//2,sh.height//2)).save(out); print('mean err %.2f /255'%(sum(errs)/len(errs)))
