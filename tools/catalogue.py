#!/usr/bin/env python3
"""catalogue.py -> prints a markdown catalogue of the .3DS files (objects, vertex/face counts, materials/maps, cameras, keyframe range)."""
import sys,os,glob
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from parse3ds import parse
import struct
H=os.path.dirname(os.path.abspath(__file__))+'/../web/assets/3ds/'
for f in sorted(glob.glob(H+'*.3ds')):
    r,d=parse(f); i=d.find(b'\x08\xb0'); 
    ms=[o for o in r['objects'] if o['kind']=='mesh']; V=sum(o['verts'] for o in ms); F=sum(o['faces'] for o in ms)
    print('### %s  (%d bytes)\n- meshes: %d, vertices %d, triangles %d; lights: %d; cameras: %s'%(os.path.basename(f),len(d),len(ms),V,F,sum(o['kind']=='light' for o in r['objects']),', '.join(r['cams']) or '-'))
    print('- materials: '+'; '.join('%s -> %s'%(m['name'],'/'.join(m['maps']) or 'flat colour') for m in r['materials']))
    big=sorted(ms,key=lambda o:-o['faces'])[:6]
    print('- largest meshes: '+', '.join('%s (%dv/%df)'%(o['name'],o['verts'],o['faces']) for o in big)+'\n')
