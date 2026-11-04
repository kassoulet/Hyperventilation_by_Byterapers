#!/usr/bin/env python3
"""Builds the figures of the write-ups into figures/.  usage: python3 tools/make_figures.py PORT_FRAMES_DIR
PORT_FRAMES_DIR: PNGs rendered by `node tools/shot.mjs DIR 2.5 7.5 ... 182.5`. Needs matplotlib, numpy, pillow; the golden frames come from re/golden."""
import sys,os,glob,json
import numpy as np
from PIL import Image
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection,Line3DCollection
H=os.path.dirname(os.path.abspath(__file__))+'/..';OUT=H+'/figures/';os.makedirs(OUT,exist_ok=True)
PORT=sys.argv[1]
plt.rcParams.update({'figure.dpi':110,'savefig.dpi':130,'font.size':9,'axes.grid':False})
def load(p):return np.array(Image.open(p).convert('RGB'))
frames=sorted(glob.glob(PORT+'/t*.png'));T=[float(os.path.basename(f)[1:-4]) for f in frames]
err={t:float(np.abs(load(f).astype(int)-load(H+'/re/golden/'+os.path.basename(f)).astype(int)).mean()) for t,f in zip(T,frames)}
# ---- 1. error per frame, coloured by scene
SC=[(0,30.1,'space','#4c78a8'),(30.1,44.3,'lava tunnel','#f58518'),(44.3,51.1,'room','#54a24b'),(51.1,58.2,'portrait','#b279a2'),(58.2,72.55,'blob','#e45756'),(72.55,100.7,'hallu / piikit','#72b7b2'),(100.7,114.9,'metaballs','#eeca3b'),(114.9,128.6,'photos','#ff9da6'),(128.6,143.8,'swirls','#9d755d'),(143.8,157.8,'balls','#bab0ac'),(157.8,171.9,'tv','#6f4e7c'),(171.9,190,'flesh','#2f4b7c')]
fig,ax=plt.subplots(figsize=(10,3.2))
for t in T:
    col=[c for a,b,n,c in SC if a<=t<b][0];ax.bar(t,err[t],width=4,color=col)
for a,b,n,c in SC:ax.text((a+min(b,189))/2,max(err.values())+1.2,n,ha='center',fontsize=7,rotation=0)
ax.axhline(np.mean(list(err.values())),color='k',ls='--',lw=0.8);ax.text(1,np.mean(list(err.values()))+0.4,'mean %.1f / 255'%np.mean(list(err.values())),fontsize=8)
ax.set_xlabel('time (s)');ax.set_ylabel('mean |port - reference| (0..255)');ax.set_xlim(0,190);ax.set_ylim(0,max(err.values())+4)
fig.tight_layout();fig.savefig(OUT+'error_per_frame.png');plt.close(fig)
# ---- 2. port vs reference contact sheets
def sheet(times,name,cols=2):
    rows=(len(times)+cols-1)//cols
    fig,axs=plt.subplots(rows,cols*2,figsize=(cols*2*3.2,rows*2.55))
    axs=np.atleast_2d(axs)
    for i,t in enumerate(times):
        r,c=i//cols,(i%cols)*2;f=PORT+'/t%07.2f.png'%t
        for k,(img,lab) in enumerate(((load(f),'port'),(load(H+'/re/golden/t%07.2f.png'%t),'reference'))):
            a=axs[r,c+k];a.imshow(img[20:220]);a.set_xticks([]);a.set_yticks([]);a.set_title('%.1f s - %s%s'%(t,lab,('  (err %.0f)'%err[t]) if k==0 else ''),fontsize=8)
    for a in axs.ravel():
        if not a.has_data():a.axis('off')
    fig.tight_layout();fig.savefig(OUT+name);plt.close(fig)
sheet([2.5,22.5,47.5,62.5,82.5,107.5],'compare_scenes_1.png');sheet([122.5,137.5,147.5,157.5,172.5,177.5],'compare_scenes_2.png')
# ---- 3. space scene in 3D: the cavern sphere follows the camera
M=json.load(open(H+'/web/assets/meshes.json'))
def draw_mesh(ax,m,color,alpha=0.35,edge='#444',lw=0.3,sub=1):
    V=np.array(m['v']).reshape(-1,3);F=np.array(m['f']).reshape(-1,3)[::sub]
    pc=Poly3DCollection(V[F],facecolor=color,edgecolor=edge,linewidths=lw,alpha=alpha);ax.add_collection3d(pc);return V
def axes_equal(ax,pts):
    mn,mx=pts.min(0),pts.max(0);c=(mn+mx)/2;r=(mx-mn).max()/2
    ax.set_xlim(c[0]-r,c[0]+r);ax.set_ylim(c[1]-r,c[1]+r);ax.set_zlim(c[2]-r,c[2]+r)
sp=M['space2'];fig=plt.figure(figsize=(11,5.2))
for k,(elev,azim,title) in enumerate(((22,-60,'the 3DS scene as exported'),(22,-60,'what the original draws'))):
    ax=fig.add_subplot(1,2,k+1,projection='3d');allp=[]
    cam=np.array(sp['cams']['Camera01']);cp=np.load(H+'/tools/figdata/space_cam_pos.npy')
    for m in sp['meshes']:
        if m['name']=='fd':continue
        V=np.array(m['v']).reshape(-1,3)
        if m['name']=='lock' and k==1:
            V=V+(cp-np.array([-150.7,0.1,5000]));
            m=dict(m,v=V.ravel().tolist())
        col={'lock':'#4c78a8','putki':'#f58518','taso':'#54a24b'}.get(m['name'],'#e45756' if m['name'].startswith('kaari') else '#999999')
        a=0.10 if m['name']=='lock' else 0.5
        allp.append(draw_mesh(ax,m,col,alpha=a,lw=0.25 if m['name']=='lock' else 0.4))
    ax.plot(cam[:,1],cam[:,2],cam[:,3],color='k',lw=1.2,label='Camera01 path');ax.scatter([cp[0]],[cp[1]],[cp[2]],color='k',s=25)
    if k==1:
        P=np.load(H+'/tools/figdata/space_scan_points.npy');ax.scatter(P[:,0],P[:,1],P[:,2],s=1.2,color='#d62728',label='points seen by the original\'s rasteriser (2.5 s)')
        allp.append(P)
    ax.set_title(title,fontsize=9);ax.view_init(elev,azim);axes_equal(ax,np.vstack(allp+[cam[:,1:]]));ax.set_xlabel('x');ax.set_ylabel('y');ax.set_zlabel('z (tunnel axis)');ax.legend(loc='upper left',fontsize=7)
fig.suptitle('Space scene: the cavern sphere is centred on the camera, not at its file position (WRITEUP-asm.md section 36)',fontsize=10)
fig.tight_layout();fig.savefig(OUT+'space_3d.png');plt.close(fig)
# ---- 4. the 3DS scenes, wireframes
fig=plt.figure(figsize=(12,7.5))
for i,(n,t,el,az) in enumerate((('0room3','room (44-51 s)',30,-50),('hallu','hallu (72-94 s)',20,-70),('piikit2','piikit (83-100 s)',20,-60),('tvfin','tv (158-172 s)',25,-40),('ball2','balls (144-158 s)',20,-60),('morph2','flesh tube (172-186 s)',20,-60))):
    ax=fig.add_subplot(2,3,i+1,projection='3d');allp=[]
    for m in M[n]['meshes']:
        allp.append(draw_mesh(ax,m,'#72b7b2',alpha=0.55,lw=0.15,sub=2 if n=='hallu' else 1))
    c=np.array(M[n]['cams'].get('Camera01',[]))
    if len(c):ax.plot(c[:,1],c[:,2],c[:,3],color='#d62728',lw=1)
    P=np.vstack(allp+([c[:,1:]] if len(c) else []))
    q=np.percentile(P,[2,98],axis=0);ax.set_xlim(q[0,0],q[1,0]);ax.set_ylim(q[0,1],q[1,1]);ax.set_zlim(q[0,2],q[1,2])
    ax.set_title(t,fontsize=9);ax.view_init(el,az);ax.set_xticks([]);ax.set_yticks([]);ax.set_zticks([])
fig.suptitle('The 3DS scenes (meshes at one frame; red = Camera01 path)',fontsize=10);fig.tight_layout();fig.savefig(OUT+'scenes_3d.png');plt.close(fig)
# ---- 5. beat blur timeline
B=json.load(open(H+'/web/assets/blur.json'));fig,ax=plt.subplots(figsize=(10,2.6))
ax.vlines([b[0] for b in B],0,[b[1] for b in B],color='#4c78a8',lw=1.5);ax.set_xlabel('time (s)');ax.set_ylabel('blur radius (px)');ax.set_title('Beat blur of the flip routine (0x43d00), radius per call - WRITEUP-asm.md section 37',fontsize=9)
fig.tight_layout();fig.savefig(OUT+'blur_timeline.png');plt.close(fig)
# ---- 6. lens flare layout (ghosts along the line through the screen centre)
G=[[35,10,53,20,3.1],[18,22,53,16,1.9],[52,2,10,24,1.3],[12,50,10,12,0.7],[3,24,27,14,0.34],[33,24,47,32,-0.2],[20,50,10,16,-0.35],[50,3,26,20,-0.9],[5,21,40,28,-1.5],[35,11,20,48,-2.3]]
fig,ax=plt.subplots(figsize=(6.4,4.2));ax.set_xlim(0,320);ax.set_ylim(200,0);ax.set_aspect('equal');ax.add_patch(plt.Rectangle((0,0),320,200,fc='#111'))
sx,sy=60,50;dx,dy=159.5-sx,99.5-sy
ax.plot([sx,159.5+2.3*dx*-1],[sy,99.5+2.3*dy*-1],color='#555',lw=0.5)
for r,g,b,s,p in G:
    x,y=159.5-p*dx,99.5-p*dy;col=np.array([r,g,b])/60;ax.add_patch(plt.Circle((x,y),s/2,fc=np.clip(col,0,1),ec='none',alpha=0.85))
ax.add_patch(plt.Circle((sx,sy),9,fc='#fff3b0',ec='none'));ax.text(sx+12,sy-8,'light (glow sprite)',color='w',fontsize=7);ax.plot([159.5],[99.5],'+',color='w');ax.text(163,96,'screen centre',color='w',fontsize=7)
ax.set_title('Lens-flare ghosts: position 159.5 - p_k * (159.5 - x_light), table 0x106b08 (WRITEUP-asm.md section 24)',fontsize=8);ax.axis('off')
fig.tight_layout();fig.savefig(OUT+'lens_flare.png');plt.close(fig)
# ---- 7. open-track first-key tangent
K=[(0,840),(400,-431),(800,-1100)];O={7:815.13,28:740.59,63:616.8,98:494.09,133:373.08,168:254.36,203:138.54,273:-82,343:-283.68,413:-461.64}
def herm(f,t0):
    t=f/400;h1=2*t**3-3*t**2+1;h2=-2*t**3+3*t**2;h3=t**3-2*t**2+t;h4=t**3-t**2
    d1=0.5*((K[2][1]-K[1][1])+(K[1][1]-K[0][1]));return h1*K[0][1]+h2*K[1][1]+h3*t0+h4*d1
d1=0.5*((K[2][1]-K[1][1])+(K[1][1]-K[0][1]));bb=K[1][1]-K[0][1];new=1.5*bb-0.5*d1
f=np.linspace(0,400,200);fig,ax=plt.subplots(figsize=(6.4,3.4))
ax.plot(f,[herm(x,bb) for x in f],color='#999',label='plain difference (old)');ax.plot(f,[herm(x,new) for x in f],color='#4c78a8',label='1.5*(P1-P0) - 0.5*tin(1) (new)');ax.plot(list(O),list(O.values()),'o',color='#d62728',label='engine matrix (reference)')
ax.set_xlabel('3DS frame');ax.set_ylabel('camera y');ax.legend(fontsize=7);ax.set_title('Space camera, first segment of the TCB track (WRITEUP-asm.md section 36)',fontsize=8);fig.tight_layout();fig.savefig(OUT+'camera_tangent.png');plt.close(fig)
# ---- 8. the ray-traced photos underlay
fig,axs=plt.subplots(1,5,figsize=(13,2.8))
for a,(img,t) in zip(axs,((H+'/tools/figdata/hole_tex0.png','texture holemap0'),(H+'/tools/figdata/hole_tex1.png','texture holemap1'),(H+'/tools/figdata/hole_layer1.png','layer 1 (grid 0x122998)'),(H+'/tools/figdata/hole_layer2.png','layer 2 (grid 0x124ae8)'),(None,'composite, port 122.5 s'))):
    a.imshow(load(img) if img else load(PORT+'/t0122.50.png')[20:220]);a.set_title(t,fontsize=8);a.axis('off')
fig.suptitle('Photos-scene underlay: ray-traced two-layer effect (callback 0x20bc4), WRITEUP-asm.md sections 27-28',fontsize=9);fig.tight_layout();fig.savefig(OUT+'hole_effect.png');plt.close(fig)
print('figures written to',OUT,sorted(os.listdir(OUT)))
