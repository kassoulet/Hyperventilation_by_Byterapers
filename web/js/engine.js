// engine.js - small software 3D engine: z-buffered perspective-correct triangle filler (texture / environment / bump / additive),
// 3DS scene instances with keyframed cameras and objects. Everything is a pure function of the time handed in (no hidden state), so
// any frame can be rendered after a seek.
import {evalVec,evalRot,evalScalar} from './s3ds.js';

export const W=320,H=240,VY=20,VH=200;           // 320x240 mode, 320x200 viewport centred (20 px bars)
export const rad=Math.PI/180;
// ---------------------------------------------------------------- textures
export class Tex{constructor(w,h,rgba){this.w=w;this.h=h;this.d=rgba;this.wm=w-1;this.hm=h-1;}}   // rgba: Uint32Array (ABGR little endian)
export async function loadTex(url){
  const img=new Image();img.src=url;await img.decode();
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const id=x.getImageData(0,0,c.width,c.height);return new Tex(c.width,c.height,new Uint32Array(id.data.buffer.slice(0)));
}
// ---------------------------------------------------------------- framebuffer + rasteriser
export class Raster{
  constructor(){this.fb=new Uint32Array(W*H);this.zb=new Float32Array(W*H);this.clear(0);}
  clear(c){this.fb.fill(0xff000000|c);this.zb.fill(0);}
  clearZ(){this.zb.fill(0);}
  // v: Float32Array stride 12: sx sy iz uw vw r g b ex ey (env coords) , tex, env, bump, mode
  // mode bits: 1 texture, 2 environment (added), 4 bump-perturbed env, 8 no z-write/test additive, 16 alpha-blend (alpha in m.alpha)
  tri(a,b,c,m){
    // sort by y
    let t;if(a[1]>b[1]){t=a;a=b;b=t;}if(b[1]>c[1]){t=b;b=c;c=t;}if(a[1]>b[1]){t=a;a=b;b=t;}
    const y0=Math.max(VY,Math.ceil(a[1]-0.5)),y1=Math.min(VY+VH-1,Math.ceil(c[1]-0.5)-1);if(y0>y1)return;
    const ABy=b[1]-a[1],ACy=c[1]-a[1],BCy=c[1]-b[1];
    const area=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(area===0)return;
    const tex=m.tex,env=m.env,bump=m.bump,mode=m.mode,fb=this.fb,zb=this.zb,ia=1/area;
    // plane gradients for attributes (per-pixel linear in screen space)
    const N=10;const g=this._g||(this._g=new Float32Array(N*3)),g0=this._g0||(this._g0=new Float32Array(N));
    for(let k=0;k<N;k++){const ka=k+2;const da=b[ka]-a[ka],db=c[ka]-a[ka];
      g[k*3]=(da*(c[1]-a[1])-db*(b[1]-a[1]))*ia;                 // d/dx
      g[k*3+1]=(db*(b[0]-a[0])-da*(c[0]-a[0]))*ia;               // d/dy
      g0[k]=a[ka];}
    const add=(mode&8)!==0,alp=(mode&16)!==0,A=m.alpha===undefined?1:m.alpha;
    const tw=tex?tex.w:0,th=tex?tex.h:0,twm=tw-1,thm=th-1,td=tex?tex.d:null;
    const ew=env?env.w:0,eh=env?env.h:0,ewm=ew-1,ehm=eh-1,ed=env?env.d:null;
    const bw=bump?bump.w:0,bh=bump?bump.h:0,bwm=bw-1,bhm=bh-1,bd=bump?bump.d:null;
    const fr=m.r===undefined?1:m.r,fg=m.g===undefined?1:m.g,fbl=m.b===undefined?1:m.b,envk=m.envk===undefined?1:m.envk,bk=m.bumpk===undefined?0.02:m.bumpk;
    for(let y=y0;y<=y1;y++){
      const py=y+0.5;
      // x extents
      let xa,xb;
      const tc=(py-a[1])/ACy*(c[0]-a[0])+a[0];
      if(py<b[1]){xb=ABy>0?a[0]+(py-a[1])/ABy*(b[0]-a[0]):b[0];}else{xb=BCy>0?b[0]+(py-b[1])/BCy*(c[0]-b[0]):b[0];}
      xa=tc;if(xa>xb){const q=xa;xa=xb;xb=q;}
      let x0=Math.max(0,Math.ceil(xa-0.5)),x1=Math.min(W-1,Math.ceil(xb-0.5)-1);if(x0>x1)continue;
      const dx0=x0+0.5-a[0],dy=py-a[1];
      let iz=g0[0]+g[0]*dx0+g[1]*dy,uw=g0[1]+g[3]*dx0+g[4]*dy,vw=g0[2]+g[6]*dx0+g[7]*dy;
      let r=g0[3]+g[9]*dx0+g[10]*dy,gg=g0[4]+g[12]*dx0+g[13]*dy,bb=g0[5]+g[15]*dx0+g[16]*dy;
      let eu=g0[6]+g[18]*dx0+g[19]*dy,ev=g0[7]+g[21]*dx0+g[22]*dy;
      const diz=g[0],duw=g[3],dvw=g[6],dr=g[9],dg=g[12],db=g[15],deu=g[18],dev=g[21];
      let o=y*W+x0;
      for(let x=x0;x<=x1;x++,o++,iz+=diz,uw+=duw,vw+=dvw,r+=dr,gg+=dg,bb+=db,eu+=deu,ev+=dev){
        if(!add&&iz<=zb[o])continue;
        let R,G,B;
        if(mode&1){const w=1/iz;let u=uw*w,v=vw*w;u-=Math.floor(u);v-=Math.floor(v);
          const px=td[((v*th)|0)*tw+((u*tw)|0)];R=(px&255)*fr;G=((px>>8)&255)*fg;B=((px>>16)&255)*fbl;}
        else if(mode&2){R=G=B=0;}else{R=255*fr;G=255*fg;B=255*fbl;}
        // the original's shade LUT (0x149a18) is [row*256+colour] = floor(colour*row/64), row = integer part of the interpolated light (0..62): 63 light levels per channel
        R=((R|0)*((r>0?r*64:0)|0))>>6;G=((G|0)*((gg>0?gg*64:0)|0))>>6;B=((B|0)*((bb>0?bb*64:0)|0))>>6;
        if(mode&6){
          let u=eu,v=ev;
          if(mode&4){const w=1/iz;let s=uw*w,t2=vw*w;s-=Math.floor(s);t2-=Math.floor(t2);
            const bx=(s*bw)|0,by=(t2*bh)|0;const hl=bd[by*bw+((bx-1)&bwm)]&255,hr=bd[by*bw+((bx+1)&bwm)]&255,hu=bd[((by-1)&bhm)*bw+bx]&255,hd=bd[((by+1)&bhm)*bw+bx]&255;
            u+=Math.max(-128,Math.min(127,hl-hr))/ew;v+=Math.max(-128,Math.min(127,hu-hd))/eh;}
          const ex=((u<0?0:u>0.999?0.999:u)*ew)|0,ey=((v<0?0:v>0.999?0.999:v)*eh)|0;const px=ed[ey*ew+ex];
          if(mode&1){R=(R+(px&255)*envk*r)*0.5;G=(G+((px>>8)&255)*envk*gg)*0.5;B=(B+((px>>16)&255)*envk*bb)*0.5;}else{R+=(px&255)*envk*r;G+=((px>>8)&255)*envk*gg;B+=((px>>16)&255)*envk*bb;}}   // tex+env mappers (0x5ec1c, 0x5f5b6) average the two colours
        if(R>255)R=255;if(G>255)G=255;if(B>255)B=255;
        if(add){const p=fb[o];let rr=(p&255)+R,g2=((p>>8)&255)+G,b2=((p>>16)&255)+B;fb[o]=0xff000000|((b2>255?255:b2)<<16)|((g2>255?255:g2)<<8)|(rr>255?255:rr);}
        else if(alp){const p=fb[o];const rr=(p&255)*(1-A)+R*A,g2=((p>>8)&255)*(1-A)+G*A,b2=((p>>16)&255)*(1-A)+B*A;fb[o]=0xff000000|(b2<<16)|(g2<<8)|rr;zb[o]=iz;}
        else{fb[o]=0xff000000|(B<<16)|(G<<8)|R;zb[o]=iz;}
      }
    }
  }
  // additive/alpha sprite, centred, size in pixels, z-tested against zb (iz=1/depth)
  sprite(tex,cx,cy,sw,sh,k,iz,mode,col){
    const x0=Math.max(0,Math.floor(cx-sw/2)),x1=Math.min(W-1,Math.ceil(cx+sw/2)),y0=Math.max(VY,Math.floor(cy-sh/2)),y1=Math.min(VY+VH-1,Math.ceil(cy+sh/2));
    const fb=this.fb,zb=this.zb,d=tex.d,tw=tex.w,th=tex.h;const cr=col?col[0]:1,cg=col?col[1]:1,cb=col?col[2]:1;
    for(let y=y0;y<=y1;y++){const v=((y+0.5-(cy-sh/2))/sh);if(v<0||v>=1)continue;const ty=(v*th)|0;
      for(let x=x0;x<=x1;x++){const u=((x+0.5-(cx-sw/2))/sw);if(u<0||u>=1)continue;const o=y*W+x;if(iz!==undefined&&iz<zb[o])continue;
        const px=d[ty*tw+((u*tw)|0)];const p=fb[o];
        const R=(px&255)*k*cr,G=((px>>8)&255)*k*cg,B=((px>>16)&255)*k*cb;
        let rr=(p&255)+R,gg=((p>>8)&255)+G,bb=((p>>16)&255)+B;
        fb[o]=0xff000000|((bb>255?255:bb)<<16)|((gg>255?255:gg)<<8)|(rr>255?255:rr);}}
  }
}
// ---------------------------------------------------------------- vector helpers
export const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm=(a)=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
function qrot(q,v){const [x,y,z,w]=q;const tx=2*(y*v[2]-z*v[1]),ty=2*(z*v[0]-x*v[2]),tz=2*(x*v[1]-y*v[0]);return [v[0]+w*tx+(y*tz-z*ty),v[1]+w*ty+(z*tx-x*tz),v[2]+w*tz+(x*ty-y*tx)];}
// ---------------------------------------------------------------- camera
export class Camera{
  constructor(pos,target,roll,fov){this.pos=pos;this.f=norm(sub(target,pos));
    const up=Math.abs(this.f[2])>0.999?[0,1,0]:[0,0,1];let r=norm(cross(this.f,up));let u=cross(r,this.f);
    roll=-roll;const c=Math.cos(roll*rad),s=Math.sin(roll*rad);this.r=[r[0]*c+u[0]*s,r[1]*c+u[1]*s,r[2]*c+u[2]*s];this.u=[u[0]*c-r[0]*s,u[1]*c-r[1]*s,u[2]*c-r[2]*s];
    // the engine treats the 3DS FOV as the *vertical* field of the 320x200 viewport (measured: tan(vfov/2)=1.065 for FOV 94.29, horizontal = 1.6x)
    this.focal=(W/2)/(Math.tan(fov*rad/2)*0.9882*1.6);this.pfocal=160/Math.tan(fov*rad/2);}   // pfocal: the camera matrix 0x149914 as the particle projector 0x32f10 uses it (x' = xv/tan(fov/2), screen = 159.5 + 160*x'/z)
  toView(p){const d=sub(p,this.pos);return [dot(d,this.r),dot(d,this.u),dot(d,this.f)];}
  dirToView(n){return [dot(n,this.r),dot(n,this.u),dot(n,this.f)];}
}
// ---------------------------------------------------------------- 3DS scene instance
export class Scene3D{
  constructor(sc){
    this.sc=sc;this.meshes=[];
    for(const n of sc.nodes){
      if(n.type!==0xB002)continue;const o=sc.byName[n.name];if(!o||!o.verts||!o.faces)continue;
      const M=o.xform||[1,0,0,0,1,0,0,0,1,0,0,0],org=[M[9],M[10],M[11]],bx=[M[0],M[1],M[2]],by=[M[3],M[4],M[5]],bz=[M[6],M[7],M[8]];
      const nv=o.verts.length/3,loc=new Float32Array(nv*3);
      for(let i=0;i<nv;i++){const d=[o.verts[i*3]-org[0]-n.pivot[0]*0,o.verts[i*3+1]-org[1],o.verts[i*3+2]-org[2]];
        loc[i*3]=dot(d,bx)-n.pivot[0];loc[i*3+1]=dot(d,by)-n.pivot[1];loc[i*3+2]=dot(d,bz)-n.pivot[2];}
      // smooth vertex normals (position-welded face-normal average)
      const nf=o.faces.length/3,nrm=new Float32Array(nv*3);
      for(let i=0;i<nf;i++){const a=o.faces[i*3],b=o.faces[i*3+1],c=o.faces[i*3+2];
        const e1=[loc[b*3]-loc[a*3],loc[b*3+1]-loc[a*3+1],loc[b*3+2]-loc[a*3+2]],e2=[loc[c*3]-loc[a*3],loc[c*3+1]-loc[a*3+1],loc[c*3+2]-loc[a*3+2]];
        const fn=cross(e1,e2);for(const v of [a,b,c]){nrm[v*3]+=fn[0];nrm[v*3+1]+=fn[1];nrm[v*3+2]+=fn[2];}}
      const faceMat=new Array(nf).fill(null);for(const mm of o.mat)for(const f of mm.faces)faceMat[f]=mm.name;
      this.meshes.push({node:n,obj:o,loc,nrm,loc0:loc.slice(),nrm0:nrm.slice(),nv,nf,faceMat,wv:new Float32Array(nv*3),wn:new Float32Array(nv*3)});
    }
  }
  nodeXform(n,f){
    const p=evalVec(n.pos,f,3,[0,0,0]),q=evalRot(n.rot,f),s=evalVec(n.scl,f,3,[1,1,1]);return {p,q,s};
  }
  // world-space geometry at 3DS frame f
  pose(f){
    if(!this._mt){this._mt=true;this.byName={};for(const m of this.meshes)this.byName[m.node.name]=m;
      for(const m of this.meshes)if(m.node.morph){m.morphKeys=m.node.morph;for(const k of m.node.morph)if(k.name!==m.node.name&&this.byName[k.name])this.byName[k.name].hidden=true;}}   // the other targets are never drawn
    for(const m of this.meshes){
      if(m.morphKeys){const K=m.morphKeys;let i=0;while(i<K.length-2&&f>=K[i+1].f)i++;                                          // 3DS morph track: blend the two neighbouring targets
        const a=this.byName[K[i].name]||m,b=this.byName[K[Math.min(i+1,K.length-1)].name]||m,t=K.length>1?Math.min(1,Math.max(0,(f-K[i].f)/Math.max(1,K[i+1].f-K[i].f))):0;
        if(a.nv===m.nv&&b.nv===m.nv){for(let j=0;j<m.nv*3;j++){m.loc[j]=a.loc0[j]+(b.loc0[j]-a.loc0[j])*t;m.nrm[j]=a.nrm0[j]+(b.nrm0[j]-a.nrm0[j])*t;}}}
      const {p,q,s}=this.nodeXform(m.node,f);
      for(let i=0;i<m.nv;i++){const v=qrot(q,[m.loc[i*3]*s[0],m.loc[i*3+1]*s[1],m.loc[i*3+2]*s[2]]);m.wv[i*3]=v[0]+p[0];m.wv[i*3+1]=v[1]+p[1];m.wv[i*3+2]=v[2]+p[2];
        const n=qrot(q,[m.nrm[i*3],m.nrm[i*3+1],m.nrm[i*3+2]]);m.wn[i*3]=n[0];m.wn[i*3+1]=n[1];m.wn[i*3+2]=n[2];}
    }
  }
  camera(name,f){
    const sc=this.sc;let cn=null,tn=null;
    for(const n of sc.nodes){if(n.name!==name)continue;if(n.type===0xB003)cn=n;else if(n.type===0xB004)tn=n;}
    const c=sc.cams[name];if(!cn||!c)return null;
    const pos=evalVec(cn.pos,f,3,c.pos),tgt=tn?evalVec(tn.pos,f,3,c.target):c.target;
    const roll=evalScalar(cn.roll,f,c.roll||0);
    let fov=cn.fov&&cn.fov.length?evalScalar(cn.fov,f,60):2*Math.atan(36/(2*(c.lens||50)))/rad;
    return new Camera(pos,tgt,roll,fov);
  }
  // point lights of the file at 3DS frame f / music time t, as the original's per-vertex lighter (0x463ec) sees them: world position, colour 0..255,
  // squared inner/outer range, multiplier. The 'flash' lights' ranges are animated by the original's scene code (a chase: range = base*max(0,cos)); that animation was
  // sampled from the original (tools/bake_lights.py, assets/lightanim.json) and is replayed here. A light with outer range 0 never contributes (d2 > 0 always true).
  lightsAt(f,t){
    if(!this._rank){this._rank={};const seen={};for(const n of this.sc.nodes){if(n.type!==0xB005)continue;const l=this.sc.lights[n.name];if(!l)continue;
      const c=l.color.map(Math.round).join(',');const r=seen[c]=(seen[c]||0);seen[c]++;this._rank[n.name]=c+'#'+r;}}
    const out=[];
    for(const n of this.sc.nodes){if(n.type!==0xB005)continue;const l=this.sc.lights[n.name];if(!l||l.off)continue;
      let inner=l.inner,outer=l.outer;const a=this.anim&&this.anim[this._rank[n.name]];
      if(a&&t!==undefined){const g=a.find(s=>t>=s.t0&&t<=s.t0+(s.out.length-1)*s.dt)||(t<a[0].t0?a[0]:a[a.length-1]);
        const x=Math.min(g.out.length-1,Math.max(0,(t-g.t0)/g.dt)),i=Math.min(g.out.length-2,x|0),w=x-i;
        if(g.out.length>1){inner=g.in[i]+(g.in[i+1]-g.in[i])*w;outer=g.out[i]+(g.out[i+1]-g.out[i])*w;}else{inner=g.in[0];outer=g.out[0];}}
      if(!(outer>0))continue;
      out.push({pos:evalVec(n.pos,f,3,l.pos),col:l.color,in2:inner*inner,out2:outer*outer,mult:l.mult});}
    return out;}
  lightPos(name,f){const sc=this.sc;for(const n of sc.nodes)if(n.type===0xB005&&n.name===name){const l=sc.lights[name];return evalVec(n.pos,f,3,l?l.pos:[0,0,0]);}return null;}
}
// ---------------------------------------------------------------- mesh rendering
const NEAR=4;
const tmp=[0,1,2].map(()=>new Float32Array(12));
function clipTri(P,out){ // P: 3 arrays (cam-space attributes stride 12: x y z u v r g b nx ny nz) ; returns polys as lists
  const inside=P.map(p=>p[2]>=NEAR);const n=inside.filter(Boolean).length;
  if(n===3){out.push(P);return;}if(n===0)return;
  const poly=[];
  for(let i=0;i<3;i++){const a=P[i],b=P[(i+1)%3],ia=inside[i],ib=inside[(i+1)%3];
    if(ia)poly.push(a);
    if(ia!==ib){const t=(NEAR-a[2])/(b[2]-a[2]);const c=new Float32Array(12);for(let k=0;k<12;k++)c[k]=a[k]+(b[k]-a[k])*t;c[2]=NEAR;poly.push(c);}}
  for(let i=1;i+1<poly.length;i++)out.push([poly[0],poly[i],poly[i+1]]);
}
export const lightsDefault=[{dir:norm([0.4,-0.6,0.7]),col:[1,1,1]}];
// render all meshes of a Scene3D with camera cam; matFor(name)->material {tex,env,bump,mode,r,g,b,envk,...}
export function drawScene(R,S,cam,matFor,opts){
  const o=opts||{};const amb=S.sc.ambient,lights=o.lights||S.lightsAt(o.frame||0,o.t),fogK=o.fogK||0,cull=o.cull===undefined?true:o.cull;
  const fz=cam.focal;const out=[];
  for(const m of S.meshes){
    if(m.hidden)continue;if(o.skip&&o.skip(m.node.name))continue;
    const nv=m.nv,CV=new Array(nv);
    for(let i=0;i<nv;i++){
      const w=[m.wv[i*3],m.wv[i*3+1],m.wv[i*3+2]];const v=cam.toView(w);const nn=cam.dirToView([m.wn[i*3],m.wn[i*3+1],m.wn[i*3+2]]);const nl=Math.hypot(nn[0],nn[1],nn[2])||1;
      const a=new Float32Array(12);a[0]=v[0];a[1]=v[1];a[2]=v[2];
      if(m.obj.uv){a[3]=m.obj.uv[i*2];a[4]=1-m.obj.uv[i*2+1];}
      a[8]=nn[0]/nl;a[9]=nn[1]/nl;a[10]=nn[2]/nl;
      // lighting: the original's per-vertex model (0x463ec/0x4672b), see WRITEUP-asm.md snippet 7
      const wn=norm([m.wn[i*3],m.wn[i*3+1],m.wn[i*3+2]]);
      let lr=amb[0]+2,lg=amb[1]+2,lb=amb[2]+2;
      for(const L of lights){const dx=L.pos[0]-w[0],dy=L.pos[1]-w[1],dz=L.pos[2]-w[2];const dot=dx*wn[0]+dy*wn[1]+dz*wn[2];if(!(dot>0))continue;
        const d2=dx*dx+dy*dy+dz*dz;if(d2>L.out2)continue;
        let sm=1;if(d2>L.in2){const t=(L.out2-d2)/(L.out2-L.in2);sm=(3-2*t)*t*t;}      // smoothstep fall-off between inner and outer range
        const k=sm*L.mult*dot/Math.sqrt(d2);lr+=k*L.col[0];lg+=k*L.col[1];lb+=k*L.col[2];}
      lr=Math.min(lr,250);lg=Math.min(lg,250);lb=Math.min(lb,250);
      if(fogK>0){const fd=Math.min(1,Math.max(0,1-v[2]*fogK));lr*=fd;lg*=fd;lb*=fd;}   // depth fade (flag 0x1499e8, factor 0x1499ec)
      lr/=256;lg/=256;lb/=256;
      if(o.unlit)lr=lg=lb=1;                                                           // morph2: the original never calls the lighter (no lights seen in the whole scene)                                                          // shade LUT 0x149a18: lit = colour*light/256
      a[5]=lr;a[6]=lg;a[7]=lb;CV[i]=a;
    }
    const f=m.obj.faces;
    for(let i=0;i<m.nf;i++){
      const mat=matFor(m.faceMat[i],m);if(!mat)continue;
      const P=[CV[f[i*3]],CV[f[i*3+1]],CV[f[i*3+2]]];
      out.length=0;clipTri(P,out);
      for(const T of out){
        const ul=mat.unlit||o.unlit;
        const s=T.map(p=>{const q=new Float32Array(12);const iz=1/p[2];q[0]=W/2+fz*p[0]*iz;q[1]=VY+VH/2-fz*p[1]*iz;q[2]=iz;q[3]=p[3]*iz;q[4]=p[4]*iz;q[5]=ul?1:p[5];q[6]=ul?1:p[6];q[7]=ul?1:p[7];q[8]=p[8]*0.5+0.5;q[9]=0.5-p[9]*0.5;return q;});
        const area=(s[1][0]-s[0][0])*(s[2][1]-s[0][1])-(s[2][0]-s[0][0])*(s[1][1]-s[0][1]);
        if(cull&&!mat.twoside&&area>0)continue;
        if(!cull||mat.twoside){}
        // swap to keep consistent winding for the filler (it handles any orientation)
        R.tri(s[0],s[1],s[2],mat);
      }
    }
  }
}
