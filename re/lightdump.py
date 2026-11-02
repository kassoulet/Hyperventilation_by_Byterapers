import sys,os,struct,json
sys.path.insert(0,'/home/gautier/SynologyDrive/code/current/demoports/b-hyper/re')
from harness import *
T1=float(sys.argv[1])
g=Golden(os.environ.get("RESUME")); g.k=7; g.stop_at=int(T1*70)
rd=lambda a,n:bytes(mu.mem_read(a,n)); F=lambda a:struct.unpack('<f',rd(a,4))[0]; U=lambda a:struct.unpack('<I',rd(a,4))[0]
st={'cur':{}}; rows=[]; seen={}
def entry(uc,a,sz,_):
    ctx=E.ireg('EAX'); l=U(ctx+0x16c)
    while l:
        if l not in seen:
            seen[l]=1
        k='%d,%d,%d,%x'%(int(F(l+0xb8)),int(F(l+0xbc)),int(F(l+0xc0)),l)
        st['cur'][k]=[round(F(l+0xc8),3),round(F(l+0xcc),3),round(F(l+0xac),2),round(F(l+0xb0),2),round(F(l+0xb4),2),round(F(l+0xe0),3)]
        l=U(l+0x9c)
mu.hook_add(UC_HOOK_CODE,entry,begin=0x463ec,end=0x463ec)
def cb(gg,i):
    rows.append([round(gg.ticks/70,3),st['cur']]); st['cur']={}
g.on_frame=cb; g.run(); json.dump(rows,open(sys.argv[2],'w'))
