// scenes.js - the demo's scenes, reconstructed from the original's render callbacks (see WRITEUP-effects.md).
// Each: {t0,t1 (s of music), tex:[extra textures], render(demo,R,localTime,t)}. Everything is a pure function of t.
import {drawScene,norm,W,H,VY,VH} from './engine.js';
import {holeFrame} from './holefx.js';
const TICK=70;   // the original advances 3DS keyframes with its 70 Hz timer
const hash=(n)=>{n=Math.imul(n^61,0x45d9f3b);n^=n>>>15;n=Math.imul(n,0x2c1b3c6d);n^=n>>>12;return (n>>>0)/4294967296;};
// material table from the .3DS: map -> texture, reflection map -> env, bump -> bump
export function autoMats(d,sc,over){
  const cache={};const tx=(n)=>n&&d.tex[n.replace(/\.[a-z]+$/i,'').toLowerCase()];
  return (name)=>{if(name in cache)return cache[name];const m=sc.materials[name];if(!m)return cache[name]=null;
    let mode=0;const r={tex:tx(m.map),env:tx(m.refl),bump:tx(m.bump)};
    if(r.tex)mode|=1;if(r.env)mode|=2;if(r.bump&&r.env)mode|=4;r.mode=mode;r.unlit=m.shading===1;
    if(!mode){r.r=m.diffuse[0]/255;r.g=m.diffuse[1]/255;r.b=m.diffuse[2]/255;}
    Object.assign(r,(over&&over[name])||{});return cache[name]=r;};
}
// The original's particle system (spawn 0x1e8e8, update 0x1ec24, draw 0x32f10 + blitter 0x53563): one emitter per light particle00..02, 7 particles per 7-tick frame at the light's position,
// life 200 ticks, random velocity in [-5,5)^3, size 3..8 growing 1.02^dt per frame, colour (100,40,25)+128*[-.4,.4)^3 scaled by life/200. Each frame: v += g*dt; v += (0-v)*0.01/rnd; p += v*dt + g*dt^2/2.
// A particle is drawn (additive, texel*(c>>2)>>5 per channel) only while z <= 160*size, as a square of 2*size*160/z pixels. The RNG is the C library LCG; each emitter-frame gets its own stream so the
// field is a pure function of the frame (seekable); the original draws from one global stream, so only the statistics match.
const f32=Math.fround,LCG=s=>(Math.imul(s,0x41c64e6d)+0x3039)>>>0;
let PS=null;let PS2=null;export const setPSeeds=(o,o2)=>{PS=o;PS2=o2;};   // exact RNG seed and emitter position of every emitter call of the original (72.5-93.7 s), see WRITEUP-asm.md 31
function spawnFrame(e,j,pos){const out=[];let st=PS&&PS.seed[e][j]?PS.seed[e][j]>>>0:LCG((e*7919+j*104729+12345)>>>0);if(PS&&PS.pos[e][j]){const q=PS.pos[e][j];pos=[q[0],q[2],q[1]];}const rnd=()=>{st=LCG(st);return (st>>>16)&0x7fff;};
  for(let i=0;i<7;i++){const q=()=>f32(f32(f32((rnd()%1000)*0.4000000059604645)*0.002)-0.4000000059604645);const a=q(),b=q(),c=q();
    const cl=x=>Math.max(0,Math.min(255,x|0));
    const vel=[0,0,0].map(()=>f32((rnd()%1000)*0.01-5)),r=f32((rnd()&0xffff)*1.52587890625e-5+4.1),size=f32((rnd()%1000)*0.005+3);
    out.push({p:[pos[0],pos[1],pos[2]],v:vel,inv:f32(1/r),size,life:200,col:[cl(100+a*128),cl(40+b*128),cl(25+c*128)]});}
  return out;}
function particleField(S,tick){const n=Math.floor(tick/7+1e-6),dt=f32(0.1),parts=[];
  for(let j=Math.max(0,n-29);j<=n;j++)for(let e=0;e<3;e++){const pos=S.lightPos('particle0'+e,Math.trunc(j*7*1.2));if(!pos)continue;
    parts.push(...spawnFrame(e,j,pos).map(q=>(q.j=j,q)));
    }
  // every particle spawned at frame j has been updated n-j+1 times
  const g=[0,0,-1],live=[];   // the original's y axis is up = 3DS z
  for(const q of parts){const k=n-q.j+1;let ok=true;
    for(let u=0;u<k&&ok;u++){q.life-=7;if(q.life<=0){ok=false;break;}
      for(let a=0;a<3;a++){q.v[a]=f32(q.v[a]+f32(g[a]*dt));q.v[a]=f32(q.v[a]+f32(f32(f32(0-q.v[a])*0.01)*q.inv));}
      for(let a=0;a<3;a++){q.p[a]=f32(q.p[a]+f32(q.v[a]*dt));q.p[a]=f32(q.p[a]+f32(f32(dt*dt*0.5)*g[a]));}
      q.size=f32(q.size*Math.pow(1.02,0.1));}
    if(ok)live.push(q);}
  return live;}
function drawParticles(d,R,S,cam,tick){const tex=d.tex['particle'];if(!tex)return;const fb=R.fb,td=tex.d,tw=tex.w,th=tex.h;
  for(const q of particleField(S,tick)){const v=cam.toView(q.p),z=v[2];if(z<1.5||z>514.9||q.size*160<z)continue;
    const sx=159.5+cam.pfocal*v[0]/z,sy=VY+99.5-cam.pfocal*v[1]/z,w=2*q.size*160/z,ratio=q.life/200;
    const L=[q.col[0]*ratio,q.col[1]*ratio,q.col[2]*ratio].map(x=>(x|0)>>2);
    const x0=Math.max(0,Math.floor(sx-w/2)),x1=Math.min(W-1,Math.ceil(sx+w/2)),y0=Math.max(VY,Math.floor(sy-w/2)),y1=Math.min(VY+VH-1,Math.ceil(sy+w/2));
    for(let y=y0;y<=y1;y++){const tv=(y+0.5-(sy-w/2))/w;if(tv<0||tv>=1)continue;const ty=(tv*th)|0;
      for(let x=x0;x<=x1;x++){const tu=(x+0.5-(sx-w/2))/w;if(tu<0||tu>=1)continue;const t=td[ty*tw+((tu*tw)|0)]&255,o=y*W+x,p=fb[o];
        const r=Math.min(255,(p&255)+((t*L[0])>>5)),gg=Math.min(255,((p>>8)&255)+((t*L[1])>>5)),b=Math.min(255,((p>>16)&255)+((t*L[2])>>5));fb[o]=0xff000000|(b<<16)|(gg<<8)|r;}}}}
function particles(d,R,S,cam,light,f,n,spread,life,size,col){
  const tex=d.tex['particle'];if(!tex)return;
  for(let i=0;i<n;i++){const fi=f-i*life/n*TICK;const p=S.lightPos(light,fi);if(!p)continue;
    const j=[hash(i*3+1)-.5,hash(i*3+2)-.5,hash(i*3+3)-.5];const age=i/n;
    const w=[p[0]+j[0]*spread*(1+age*3),p[1]+j[1]*spread*(1+age*3),p[2]+j[2]*spread*(1+age*3)];const v=cam.toView(w);if(v[2]<8)continue;
    const iz=1/v[2];R.sprite(tex,W/2+cam.focal*v[0]*iz,VY+VH/2-cam.focal*v[1]*iz,size*cam.focal*iz*(1-age*.5),size*cam.focal*iz*(1-age*.5),(1-age)*1.2,undefined,0,col);}
}
// The original's "tunnel" (0x23350, renderer 0x23528): a 41x26 grid of vertices every 8 pixels over the 320x200 viewport. Three attractors move on cosines of the scene tick;
// every vertex gets texture coordinates  (px,py) + sum_k str_k*(dx,dy)/(dx^2+dy^2+500)  (a 1/r lens, in texels) and a shade 63.99*prod(f_k), f_k=(r^2+5000)/15000 if < 1 (dark cores).
// Cells are drawn as textured quads with the 256x256 wrap texture through the shade LUT (row = floor(shade), lit = c*row/64). Constants dumped from the original.
const ATT=[[0.0081,0.007,500,230,671088640],[0.0123,0.0084,320,600,-335544320],[0.0092,0.0064,120,730,167772160]];   // freqX, freqY, phaseX, phaseY, strength
const GAM=new Uint8Array(256);for(let i=0;i<256;i++)GAM[i]=Math.round(255*Math.pow(i/255,1.45));   // empirical: the original's tunnel is darker/more saturated than texture*shade (histogram match: out ~ c^1.45)
// attractors of the lava/swirl tunnel: [cx,cy,strength] per attractor at scene tick t (0x23350)
const lavaAtt=(t)=>ATT.map(a=>[Math.cos((t+a[2])*a[0]*Math.PI)*150+160,Math.cos((t+a[3])*a[1]*Math.PI)*90+100,a[4]]);
// attractors of the flesh background (0x25738): 4 of them, strengths pulsing; shade capped at row 48, darkening f=(r2+500)/15000
const fleshAtt=(t)=>{const c=(t0,f,A,B)=>Math.cos((t+t0)*f*Math.PI)*A+B,K=16777216,P=Math.PI;
  const s0=Math.cos((t+0.82)*0.043)*130*K-150,s1=Math.cos(t*0.06)*100*K-120,s3=Math.cos(t*0.06)*105*K-120;
  return [[c(1300,0.0212,35,100),c(1030,0.0301,30,100),s0],[c(1299.8,0.0212,35,140),c(1029.8,0.0301,30,100),s1],[c(120,0.0492,35,180),c(710,0.0334,30,100),Math.cos((t+0.82)*0.043)*130*K-140],[c(119.8,0.0492,35,220),c(709.8,0.0334,30,100),s3]];};
function tunnel(d,R,tex,tick,att,shMax,fOff,gam,fDiv){
  att=att||lavaAtt;shMax=shMax||63.99;fOff=fOff===undefined?5500:fOff;if(gam===undefined)gam=false;
  const NX=41,NY=26,U=new Float32Array(NX*NY),Vv=new Float32Array(NX*NY),Sh=new Float32Array(NX*NY),A=att(tick);
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const px=i*8,py=j*8;let uo=0,vo=0,sh=shMax;
    for(const [cx,cy,st] of A){const dx=px-cx,dy=py-cy,r2=dx*dx+dy*dy,inv=st/(r2+500);uo+=dx*inv;vo+=dy*inv;const f=(r2+fOff)*(1/(fDiv||15000));if(f<1)sh*=f;}
    const o=j*NX+i;U[o]=px+uo/65536;Vv[o]=py+vo/65536;Sh[o]=sh;}
  const td=tex.d,fb=R.fb,G=gam?GAM:null;
  for(let j=0;j<NY-1;j++)for(let i=0;i<NX-1;i++){const o=j*NX+i;
    for(let y=0;y<8;y++){const fy=y/8;for(let x=0;x<8;x++){const fx=x/8;
      const w00=(1-fx)*(1-fy),w10=fx*(1-fy),w01=(1-fx)*fy,w11=fx*fy;
      // the original's 16.16 coordinates wrap at 256 texels in int32, so a cell interpolates along the shortest path between its corners
      const wr=(a)=>a-256*Math.round(a/256),ua=wr(U[o+1]-U[o]),ub=wr(U[o+NX]-U[o]),uc=wr(U[o+NX+1]-U[o]),va=wr(Vv[o+1]-Vv[o]),vb=wr(Vv[o+NX]-Vv[o]),vc=wr(Vv[o+NX+1]-Vv[o]);
      const u=U[o]+fx*ua+fy*ub+fx*fy*(uc-ua-ub),v=Vv[o]+fx*va+fy*vb+fx*fy*(vc-va-vb),sh=Sh[o]*w00+Sh[o+1]*w10+Sh[o+NX]*w01+Sh[o+NX+1]*w11;
      const px=td[((v|0)&255)*256+((u|0)&255)],row=sh|0;let r=px&255,g=(px>>8)&255,b=(px>>16)&255;if(G){r=G[r];g=G[g];b=G[b];}
      fb[(VY+j*8+y)*W+i*8+x]=0xff000000|((b*row>>6)<<16)|((g*row>>6)<<8)|((r*row)>>6);}}}
}
// 128.6-132.9 s: the swirl grid of 0x2522c on fil.png (two attractors, 4194303/65536 shade, f=(r^2+700)/14000) with the morph.3ds object (camera frame = scene tick) drawn over it (0x254a8)
const P1=1300,P2=1030,FX=0.0212*Math.PI,FY=0.0301*Math.PI;
const filAtt=(T)=>[[40*Math.cos((T+P1+40)*FX)+160,40*Math.cos((T+P2+40)*FY)+100,Math.fround(Math.cos((T+200)*0.02)*150*16777216-150)],
  [40*Math.cos((T+P1+20)*FX)+160,40*Math.cos((T+P2+20)*FY)+100,Math.fround(Math.cos(T*0.03)*180*16777216-140)]];
function swirl1(d,R,t){const tick=Math.floor(70*(t-128.6));tunnel(d,R,d.tex['fil'],tick,filAtt,31.99999,700,false,14000);
  const {S}=S3(d,'morph');S.pose(tick);const cam=S.camera('Camera01',tick);if(cam){cam.focal=cam.pfocal;drawScene(R,S,cam,d.mats('morph'),{frame:tick,t,cull:false,unlit:true});}}
function blit(R,tex,sc,t,zoom,ox,oy){ // full-viewport image with zoom/pan
  const fb=R.fb,d=tex.d;for(let y=0;y<VH;y++){const v=((y-100)/zoom+100+oy)/tex.h;const ty=Math.min(tex.h-1,Math.max(0,(v*tex.h)|0));
    for(let x=0;x<W;x++){const u=((x-160)/zoom+160+ox)/tex.w;const tx=Math.min(tex.w-1,Math.max(0,(u*tex.w)|0));fb[(y+VY)*W+x]=d[ty*tex.w+tx]|0xff000000;}}
}
// 5 soft balls (Wyvill polynomial) on a 17^3 grid, polygonised by marching cubes (tables lifted from the original, assets/mc.json), shaded by texture + env map.
// Ported from the original's sampler 0x24698 and mesher 0x3697c/0x377fc; ball phases are 10-bit angles that advance linearly with the 70 Hz tick.
const MB1=[1,4,-2,3,5],MB2=[1,-4,-3,4,-2],EXT=360,NG=16,HG=45,ISO=0.12;
const CORN=[[0,0,1],[1,0,1],[1,0,0],[0,0,0],[0,1,1],[1,1,1],[1,1,0],[0,1,0]],EDGE=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
function qrot(q,v){const [x,y,z,w]=q;const tx=2*(y*v[2]-z*v[1]),ty=2*(z*v[0]-x*v[2]),tz=2*(x*v[1]-y*v[0]);return [v[0]+w*tx+(y*tz-z*ty),v[1]+w*ty+(z*tx-x*tz),v[2]+w*tz+(x*ty-y*tx)];}
// Shared by both iso-surface scenes: the original's mesher (0x3697c) + vertex builder (0x377fc) on a (NG+1)^3 grid, marching-cubes tables from assets/mc.json.
// o: {EXT,NG,HG,ISO,MC,proj(P,n)->[sx,sy,iz,nx,ny] or null, uv(P)->[u,v], mat}
function isoMesh(R,g,o){
  const {EXT,NG,HG,ISO,MC,mat}=o,N=NG+1,gi=(x,y,z)=>(z*N+y)*N+x,grad=(x,y,z)=>{const c=g[gi(x,y,z)];return [g[gi(Math.min(x+1,NG),y,z)]-c,g[gi(x,Math.min(y+1,NG),z)]-c,g[gi(x,y,Math.min(z+1,NG))]-c];};
  const vtx=(x,y,z,e)=>{const [a,b]=EDGE[e],ca=CORN[a],cb=CORN[b],xa=x+ca[0],ya=y+ca[1],za=z+ca[2],xb=x+cb[0],yb=y+cb[1],zb=z+cb[2],fa=g[gi(xa,ya,za)],fb2=g[gi(xb,yb,zb)],u=(ISO-fa)/(fb2-fa);
    const P=[-EXT+(xa+(xb-xa)*u)*HG,-EXT+(ya+(yb-ya)*u)*HG,-EXT+(za+(zb-za)*u)*HG],na=grad(xa,ya,za),nb=grad(xb,yb,zb),n=[0,1,2].map(i=>na[i]+(nb[i]-na[i])*u);
    const pr=o.proj(P,n);if(!pr)return null;const iz=pr[2],uv=o.uv(P),q=new Float32Array(12);
    q[0]=pr[0];q[1]=pr[1];q[2]=iz;q[3]=uv[0]*iz;q[4]=uv[1]*iz;q[5]=q[6]=q[7]=1;q[8]=pr[3]*0.5+0.5;q[9]=0.5-pr[4]*0.5;return q;};
  for(let z=0;z<NG;z++)for(let y=0;y<NG;y++)for(let x=0;x<NG;x++){let ci=0;for(let k=0;k<8;k++)if(g[gi(x+CORN[k][0],y+CORN[k][1],z+CORN[k][2])]<ISO)ci|=1<<k;
    const T=MC[ci];for(let i=0;i<T.length;i+=3){const a=vtx(x,y,z,T[i+2]),b=vtx(x,y,z,T[i+1]),c=vtx(x,y,z,T[i]);if(!a||!b||!c)continue;R.tri(a,b,c,mat);}}
}
// Wyvill soft-object field of the balls bp (centres) on the grid: 1-4/9(r/R)^6+17/9(r/R)^4-22/9(r/R)^2, zero beyond 0.999R^2 (0x2494c, 0x23d0b)
function ballField(bp,EXT,NG,HG,Rb){
  const N=NG+1,g=new Float32Array(N*N*N),R2=Rb*Rb,ba=4/(9*R2**3),bb=17/(9*R2*R2),bc=22/(9*R2);
  for(let z=0;z<N;z++)for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0;const X=-EXT+x*HG,Y=-EXT+y*HG,Z=-EXT+z*HG;
    for(const b of bp){const r2=Math.max(1e-5,(X-b[0])**2+(Y-b[1])**2+(Z-b[2])**2);if(r2<R2*0.999)v+=1-ba*r2**3+bb*r2*r2-bc*r2;}g[(z*N+y)*N+x]=v;}
  return g;
}
const rowAt=(d,t)=>{const rows=d.xm.rows;let lo=0,hi=rows.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(rows[m][2]<=t)lo=m;else hi=m-1;}return rows[lo];};
function metaballs(d,R,t,lt){
  const bg=d.tex['metanain'],fb=R.fb;fb.fill(0xff000000);for(let y=0;y<200;y++)for(let x=150;x<W;x++)fb[(y+VY)*W+x]=bg.d[y*bg.w+x]|0xff000000;
  const rw=rowAt(d,t),f=(rw[0]*64+rw[1]-0x740)*10,tk=Math.floor(lt*70),md=x=>((x%1024)+1024)%1024;
  const E=EXT*0.4,bp=[];
  for(let i=0;i<5;i++){const A=md(MB1[i]*tk),B=md(MB2[i]*tk),C=md(MB2[i]*tk),k=Math.PI/512;
    bp.push([E*Math.sin(((A+B+C)&1023)*k),E*Math.cos(((A+C)&1023)*k),E*Math.sin(((B-(C>>1))&1023)*k)]);}
  const g=ballField(bp,EXT,NG,HG,EXT*0.55);
  const S=d.sc3['meta1'].S,cam=S.camera('Camera01',f),nd=S.sc.nodes.find(n=>n.name==='meta');if(!cam)return;const {p}=S.nodeXform(nd,f),fz=197.583;
  isoMesh(R,g,{EXT,NG,HG,ISO,MC:d.mc,mat:{tex:d.tex['isomap'],env:d.tex['envi2'],mode:3,envk:1,r:1,g:1,b:1},
    proj(P,n){const w=[P[0]+p[0],P[2]+p[2]*0+p[1],P[1]+p[2]];const wv=cam.toView([P[0]+p[0],P[2]+p[1],P[1]+p[2]]),vn=cam.dirToView([n[0],n[2],n[1]]),l=Math.hypot(vn[0],vn[1],vn[2])||1;if(wv[2]<1)return null;
      return [W/2-0.5+fz*wv[0]/wv[2],VY+VH/2-0.5-fz*wv[1]/wv[2],1/wv[2],vn[0]/l,vn[1]/l];},
    uv:P=>[4*(1+Math.atan2(P[2],P[0])/Math.PI),4*(1+Math.atan2(P[2],P[1])/Math.PI)]});
}
// ---- two-layer swirl scene (132.74-136.71 s; init 0x21b44, render 0x21f28, grid 0x21c24, cell filler 0x34db4, blend 0x351ef) - verified pixel-exact against the emulator
// 41x26 grid of 8 px cells. Per vertex (x,y = cell offsets from the screen centre + 0.5, t = scene tick): ang=atan2(x,y), D=1.5cos(2ang+.04t)+sin(3ang+.1t)+2.5, rotation by .02t.
// Layer 1 texel coords 5*(x c-y s)*D, 5*(x s+y c)*D (mulju00a); layer 2 (mulju00b) 6cos(.03t+3ang)*r and 3*(4r sin(.3r+.07t)+.01 t D) with r=|(x,y)| (the original's table sqrt);
// shade = clamp(1..63, (.2(sin(.03t+.1x)+1)+.2(cos(.07t+.2y)+1)) * (20(5-D)+40)). All in 16.16 fixed point <<8 (int32 wrap); the filler interpolates them per 8x8 cell in integers.
// Pixel = T1[row][texel1] + T2[row][texel2], T[r][i] = per-channel (palette*r)>>7 (the two layers are halved so that they can be added).
const I32=(v)=>v|0;
function swirlGrids(t){
  const NX=41,NY=26,g1=new Int32Array(NX*NY*2),g2=new Int32Array(NX*NY*2),sh=new Int32Array(NX*NY),A=0.02*t,sn=Math.sin(A),cs=Math.cos(A);
  for(let row=0;row<NY;row++)for(let col=0;col<NX;col++){const x=col-20+0.5,y=row-13+0.5,k=row*NX+col,ang=Math.atan2(x,y),D=1.5*Math.cos(2*ang+0.04*t)+Math.sin(3*ang+0.1*t)+2.5;
    const Xp=(x*cs-y*sn)*D,Yp=(x*sn+y*cs)*D,r=Math.sqrt(x*x+y*y);
    g1[k*2]=I32(Math.round(Xp*327680)*256);g1[k*2+1]=I32(Math.round(Yp*327680)*256);
    g2[k*2]=I32(Math.round(Math.cos(0.03*t+3*ang)*2*r*196608)*256);g2[k*2+1]=I32(Math.round((Math.sin(0.3*r+0.07*t)*4*r+t*D*0.01)*196608)*256);
    const sh1=65536*20*(5-D),t124=(Math.cos(0.07*t+0.2*y)+1)*0.2+(Math.sin(0.03*t+0.1*x)+1)*0.2;
    sh[k]=I32(Math.round(Math.min(Math.max(t124*(sh1+65536*40),65536),63*65536))*256);}
  return {g1,g2,sh};
}
// render both layers of the grid into 8-bit surfaces exactly as 0x34db4 does, then blend through the row tables
const palOf=(ti,tc)=>{const P=new Int32Array(256*3);for(let i=0;i<ti.d.length;i++){const k=ti.d[i]&255;P[k*3]=tc.d[i]&255;P[k*3+1]=(tc.d[i]>>8)&255;P[k*3+2]=(tc.d[i]>>16)&255;}return P;};
function swirl2(d,R,t){
  const T=Math.floor(t*70),G=swirlGrids(T),{g1,g2,sh}=G,NX=41,tx1=d.tex['mulju00aidx'],tx2=d.tex['mulju00bidx'],p1=d.tex['mulju00a'],p2=d.tex['mulju00b'];
  if(!tx1||!tx2)return;
  const P1=d.swp1||(d.swp1=palOf(tx1,p1)),P2=d.swp2||(d.swp2=palOf(tx2,p2));
  const fb=R.fb,i1=tx1.d,i2=tx2.d;
  for(let j=0;j<25;j++)for(let i=0;i<40;i++){
    const a=(j*NX+i)*2,b=a+2,c=a+NX*2,e=c+2,s0=j*NX+i;
    const dLu1=I32(g1[c]-g1[a])>>3,dLv1=I32(g1[c+1]-g1[a+1])>>3,dRu1=I32(g1[e]-g1[b])>>3,dRv1=I32(g1[e+1]-g1[b+1])>>3;
    const dLu2=I32(g2[c]-g2[a])>>3,dLv2=I32(g2[c+1]-g2[a+1])>>3,dRu2=I32(g2[e]-g2[b])>>3,dRv2=I32(g2[e+1]-g2[b+1])>>3;
    const dLs=I32(sh[s0+NX]-sh[s0])>>3,dRs=I32(sh[s0+NX+1]-sh[s0+1])>>3;
    let Lu1=g1[a],Lv1=g1[a+1],Ru1=g1[b],Rv1=g1[b+1],Lu2=g2[a],Lv2=g2[a+1],Ru2=g2[b],Rv2=g2[b+1],Ls=sh[s0],Rs=sh[s0+1];
    for(let k=0;k<8;k++){
      Lu1=I32(Lu1+dLu1);Lv1=I32(Lv1+dLv1);Ru1=I32(Ru1+dRu1);Rv1=I32(Rv1+dRv1);Lu2=I32(Lu2+dLu2);Lv2=I32(Lv2+dLv2);Ru2=I32(Ru2+dRu2);Rv2=I32(Rv2+dRv2);Ls=I32(Ls+dLs);Rs=I32(Rs+dRs);
      const su1=I32(Ru1-Lu1)>>19,sv1=I32(Rv1-Lv1)>>19,su2=I32(Ru2-Lu2)>>19,sv2=I32(Rv2-Lv2)>>19,ss=I32(Rs-Ls)>>19;
      let cu1=Lu1>>>16,cv1=Lv1>>>16,cu2=Lu2>>>16,cv2=Lv2>>>16,cs=Ls>>>16;
      let o=(VY+j*8+k)*W+i*8;
      for(let x=0;x<8;x++,o++){
        const ta=i1[(((cv1>>8)&255)<<8)|((cu1>>8)&255)]&255,tb=i2[(((cv2>>8)&255)<<8)|((cu2>>8)&255)]&255,row=(cs>>8)&255;
        const r=((P1[ta*3]*row)>>7)+((P2[tb*3]*row)>>7),g=((P1[ta*3+1]*row)>>7)+((P2[tb*3+1]*row)>>7),bl=((P1[ta*3+2]*row)>>7)+((P2[tb*3+2]*row)>>7);
        fb[o]=0xff000000|((bl&255)<<16)|((g&255)<<8)|(r&255);
        cu1+=su1;cv1+=sv1;cu2+=su2;cv2+=sv2;cs+=ss;}
    }}
}
// ---- halftone swirl scene (136.9-139.8 s; init 0x25c9c, render 0x25d80): two 41x26 layers (mefis / forcemao, filled by the same cell filler 0x34db4 as the swirl) are
// mixed per 8x8 block through a circular mask (table at [0x137df0], 32 growing discs + their inverses); the block's disc index is 63*L/(a^2+b^2+L) with (a,b) the pixel's offset from a moving centre.
// The demo runs the x87 in single precision with chop rounding (every + - * / sqrt result is truncated to 24 bits; sin/cos are not) - c() reproduces it (about 92% of the vertices bit-exact, the rest differ by < 1e-4 texel).
const _f32=new Float32Array(1),_i32=new Int32Array(_f32.buffer);
function c(v){_f32[0]=v;const f=_f32[0];if(Math.abs(f)>Math.abs(v)){_i32[0]--;return _f32[0];}return f;}
function forceGrids(t){
  const NX=41,NY=26,g1=new Int32Array(NX*NY*2),g2=new Int32Array(NX*NY*2),T=k=>c(t*k),sin=Math.sin,cos=Math.cos;
  for(let row=0;row<NY;row++)for(let col=0;col<NX;col++){
    const x=col-20,y=row-13,k=(row*NX+col)*2,r=c(Math.sqrt(x*x+y*y)),P=c(r*r);
    const S1=c(c(sin(c(P*0.00034))*2)+10),Cc=c(cos(c(P*0.0013))+5),A1=c(x*S1),B1=c(Cc*y);
    const sn=c(sin(c(c(r*0.3)+T(0.116)))*0.5),th=c(c(sin(c(c(r*0.7)+T(0.022)))*0.6)+sn),ct=cos(th),st=sin(th);
    g1[k]=c(c(c(ct*A1)-c(st*B1))-c(cos(T(0.006))*256))*65536*256|0;g1[k+1]=c(c(c(ct*A1)-c(ct*B1))-c(sin(T(0.007))*256))*65536*256|0;
    const Sx=c(sin(c(c(r*x)*0.001))+6),Cy=c(c(cos(c(c(r*y)*0.002))*2)+14),A2=c(x*Sx),B2=c(Cy*y);
    const ph=c(c(sin(c(c(r*0.3)+T(0.003)))*0.3)+c(c(sin(c(c(r*0.3)+T(0.004)))*0.64)+T(0.07))),c2=cos(-ph),s2=sin(-ph);
    g2[k]=c(c(c(c2*A2)-c(s2*B2))+c(sin(T(0.003))*256))*65536*256|0;g2[k+1]=c(c(c(s2*A2)+c(c2*B2))+c(sin(T(0.005))*256))*65536*256|0;}
  return {g1,g2};
}
// cell filler 0x34db4 into an 8-bit 320x200 surface (same integer pipeline as the swirl scene)
function fillLayer(g,idx,out){
  const NX=41;
  for(let j=0;j<25;j++)for(let i=0;i<40;i++){
    const a=(j*NX+i)*2,b=a+2,cc=a+NX*2,e=cc+2,dLu=I32(g[cc]-g[a])>>3,dLv=I32(g[cc+1]-g[a+1])>>3,dRu=I32(g[e]-g[b])>>3,dRv=I32(g[e+1]-g[b+1])>>3;
    let Lu=g[a],Lv=g[a+1],Ru=g[b],Rv=g[b+1];
    for(let k=0;k<8;k++){
      Lu=I32(Lu+dLu);Lv=I32(Lv+dLv);Ru=I32(Ru+dRu);Rv=I32(Rv+dRv);
      const su=I32(Ru-Lu)>>19,sv=I32(Rv-Lv)>>19;let cu=Lu>>>16,cv=Lv>>>16,o=(j*8+k)*320+i*8;
      for(let x=0;x<8;x++,o++){out[o]=idx[(((cv>>8)&255)<<8)|((cu>>8)&255)]&255;cu+=su;cv+=sv;}
    }}
}
// The ray-traced two-layer effect (callback 0x20bc4): grids from holefx.js (the original's code), cell filler 0x34db4 into two layers, compositor 0x351ef:
// per pixel (c1*s>>7)+(c2*s>>7) per channel, s = shade (top byte of a 32-bit value interpolated bilinearly inside each 8x8 cell).
function fillRGB(g,tex,out){
  const NX=41,td=tex.d;
  for(let j=0;j<25;j++)for(let i=0;i<40;i++){
    const a=(j*NX+i)*2,b=a+2,cc=a+NX*2,e=cc+2,dLu=I32(g[cc]-g[a])>>3,dLv=I32(g[cc+1]-g[a+1])>>3,dRu=I32(g[e]-g[b])>>3,dRv=I32(g[e+1]-g[b+1])>>3;
    let Lu=g[a],Lv=g[a+1],Ru=g[b],Rv=g[b+1];
    for(let k=0;k<8;k++){
      Lu=I32(Lu+dLu);Lv=I32(Lv+dLv);Ru=I32(Ru+dRu);Rv=I32(Rv+dRv);
      const su=I32(Ru-Lu)>>19,sv=I32(Rv-Lv)>>19;let cu=Lu>>>16,cv=Lv>>>16,o=(j*8+k)*320+i*8;
      for(let x=0;x<8;x++,o++){out[o]=td[(((cv>>8)&255)<<8)|((cu>>8)&255)];cu+=su;cv+=sv;}
    }}
}
let _hl1=null,_hl2=null;
function holeScene(d,R,t){
  const t1=d.tex['holemap0'],t2=d.tex['holemap1'];if(!t1||!t2)return;
  const n=Math.max(1,Math.min(137,Math.ceil((t-114.9)*10-1e-6)));   // one call of the callback per 7-tick frame, the first at 115.0 s
  const {g0,g1,sh}=holeFrame(n);
  if(!_hl1){_hl1=new Uint32Array(64000);_hl2=new Uint32Array(64000);}
  fillRGB(g0,t1,_hl1);fillRGB(g1,t2,_hl2);
  const fb=R.fb;
  for(let j=0;j<25;j++)for(let i=0;i<40;i++){
    const a=j*41+i,TL=sh[a],TR=sh[a+1],BL=sh[a+41],BR=sh[a+42];
    let L=TL,Rt=TR;const dL=I32(BL-TL)>>3,dR=I32(BR-TR)>>3;
    for(let k=0;k<8;k++){
      Rt=I32(Rt+dR);L=I32(L+dL);const step=I32(Rt-L)>>19;let cur=L>>>16,o=(j*8+k)*320+i*8;
      for(let x=0;x<8;x++,o++){const s=(cur>>8)&255,p=_hl1[o],q=_hl2[o];cur+=step;
        const r=((p&255)*s>>7)+((q&255)*s>>7),g=(((p>>8)&255)*s>>7)+(((q>>8)&255)*s>>7),b=(((p>>16)&255)*s>>7)+(((q>>16)&255)*s>>7);
        fb[(VY+j*8+k)*W+i*8+x]=0xff000000|(b<<16)|(g<<8)|r;}
    }}
}
let _fmask=null;
function force(d,R,t){
  const T=Math.floor(t*70+1e-6),tx1=d.tex['mefisidx'],tx2=d.tex['forcemaoidx'];
  if(!tx1||!tx2)return;
  const P1=d.fp1||(d.fp1=palOf(tx1,d.tex['mefis'])),P2=d.fp2||(d.fp2=palOf(tx2,d.tex['forcemao']));
  if(!_fmask){_fmask=new Uint8Array(4096);
    for(let e=0;e<32;e++){const rad=c(c(c((32-e)*0.03125)*8)*0.68);
      for(let y=0;y<8;y++)for(let x=0;x<8;x++){const inside=Math.sqrt((4-(y+.5))**2+(4-(x+.5))**2)<rad?1:0;_fmask[e*64+y*8+x]=inside;_fmask[2048+e*64+y*8+x]=1-inside;}}}
  if(!d.fA){d.fA=new Uint8Array(64000);d.fB=new Uint8Array(64000);}
  const G=forceGrids(T);fillLayer(G.g1,tx1.d,d.fA);fillLayer(G.g2,tx2.d,d.fB);
  const L=c(c(Math.cos(c(c(T*0.034)+3.0159289474462017))*15000)+17000),fb=R.fb;
  for(let j=0;j<25;j++)for(let i=0;i<40;i++){
    const a=c(c(Math.cos(c(T*0.11))*100)+c(i*8-160)),b=c(c(Math.sin(c(T*0.093))*90)+c(j*8-100)),F=c(L/c(c(c(a*a)+c(b*b))+L)),m=(c(F*63)&63)*64;
    for(let y=0;y<8;y++)for(let x=0;x<8;x++){
      const o=(j*8+y)*320+i*8+x,sel=_fmask[m+y*8+x],P=sel?P2:P1,k=(sel?d.fB:d.fA)[o]*3;
      fb[(VY+j*8+y)*W+i*8+x]=0xff000000|(P[k+2]<<16)|(P[k+1]<<8)|P[k];}}
}
// ---- iso-surface scene #2 (172-185.8 s): callbacks 0x23814 (init), 0x239bc (render), 0x23ac0 (sampler); textures metamap0 / metaenv0 / bump.png
// 10 balls rise/fall along y by a per-frame speed and re-enter at +-1000 with a new random (x,z) (rand() = Watcom LCG, srand(time()) in the original -> the sequence below is just one valid one).
const ISB_SPEED=[40,-20,-40,134,40,-35,50,57,-90,68];
const lcg=(s)=>{const st={s:s>>>0};st.next=()=>{st.s=(Math.imul(st.s,0x41c64e6d)+0x3039)>>>0;return (st.s>>>16)&0x7fff;};return st;};
// assets/isoballs.json = the reference run's initial (x,z) and re-entry (x,z) per wrap, logged from the emulator at 0x23ac0 (the original draws them from the C rand() shared with other
// consumers, seeded by time()); beyond the logged range the Watcom LCG takes over.
function isoBalls(d,n){
  const D=d.isoballs,r=lcg(D.seed),B=D.init.map(([x,z])=>[x,0,z]),W2=new Map(D.wraps.map(w=>[w[0]*10+w[1],w]));
  for(let k=0;k<n;k++)for(let i=0;i<10;i++){const b=B[i];b[1]+=ISB_SPEED[i];let wrap=false;
    if(b[1]>=1000){b[1]=-1000;wrap=true;}else if(!(b[1]>-1000)){b[1]=1000;wrap=true;}
    if(wrap){const w=W2.get(k*10+i);if(w){b[0]=w[2];b[2]=w[3];}else{b[0]=r.next()%400;b[2]=r.next()%400;}}}
  return B;
}
// Spark particles of the same scene (emitter 0x23d48, update 0x2406c, draw 0x32f10 -> additive tinted 16x16 sprite blit 0x53563):
// per frame 49 new particles (trunc(dt*7), dt = 7 ticks) at the origin with v = U(-250,250)^3, colour (100,40,25)+128*U(-0.1,0.1), size 30+0.005*U(0,1000), life 250 ticks;
// per frame update (dt=0.1 s, life -= 7): v += g*dt (g=(0,-1,0)); pos += v*dt + g*dt^2/2; size *= 1.02^dt; fade = life/250. Blit: dst += min(255, texel*(tint>>2)/32) per channel, texel 0 transparent,
// drawn only if the particle is nearer than the scene depth at its centre (z test 0x2b6a8). Random values come from a per-frame LCG (the original's rand() is time-seeded).
function isoParticles(d,R,n,cam){
  const tex=d.tex['particle'];if(!tex)return;const {Fv,rt,up,fz}=cam,fb=R.fb,zb=R.zb,pd=tex.d,tw=tex.w,th=tex.h;
  for(let f=Math.max(1,n-35);f<=n;f++){const age=n-f+1,life=250-7*age;if(life<=0)continue;
    const r=lcg(PS2&&PS2[f]?PS2[f]:(Math.imul(f,0x9e3779b1)^0x5bd1e995)>>>0),ratio=life/250;
    for(let k=0;k<49;k++){
      const cr=r.next()%1000*0.0002-0.1,cg=r.next()%1000*0.0002-0.1,cb=r.next()%1000*0.0002-0.1;
      const v=[r.next()%1000*0.5-250,r.next()%1000*0.5-250,r.next()%1000*0.5-250];let sz=r.next()%1000*0.005+30;
      const p=[0,0,0],dtt=0.1;
      for(let u=0;u<age;u++){v[1]-=dtt;p[0]+=v[0]*dtt;p[1]+=v[1]*dtt;p[2]+=v[2]*dtt;p[1]-=0.5*dtt*dtt;sz*=Math.pow(1.02,dtt);}   // v += g dt, then pos += v dt + g dt^2/2
      const q=[p[0],p[1],p[2]+1000],z=dt3(q,Fv);if(z<1.5||z>5000||sz*160<z)continue;
      const inv=160/z,sx=159.5+fz*dt3(q,rt)/z,sy=99.5-fz*dt3(q,up)/z,w=2*sz*inv;
      const ix=Math.round(sx),iy=Math.round(sy);if(ix<0||ix>319||iy<0||iy>199)continue;if(!(1/z>zb[(iy+VY)*W+ix]))continue;
      const tr=Math.round((100+128*cr)*ratio)>>2,tg=Math.round((40+128*cg)*ratio)>>2,tb=Math.round((25+128*cb)*ratio)>>2;
      const x0=sx-w/2,x1=sx+w/2,y0=sy-w/2,y1=sy+w/2;
      for(let y=Math.max(0,Math.ceil(y0));y<Math.min(200,Math.ceil(y1));y++){const ty=Math.min(th-1,((y-y0)*th/w)|0);
        for(let x=Math.max(0,Math.ceil(x0));x<Math.min(320,Math.ceil(x1));x++){const tx=Math.min(tw-1,((x-x0)*tw/w)|0),t=pd[ty*tw+tx]&255;if(!t)continue;
          const o=(y+VY)*W+x,c=fb[o];
          fb[o]=0xff000000|(Math.min(255,((c>>16)&255)+Math.min(255,(t*tb)>>5))<<16)|(Math.min(255,((c>>8)&255)+Math.min(255,(t*tg)>>5))<<8)|Math.min(255,(c&255)+Math.min(255,(t*tr)>>5));}}
    }}
}
const dt3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function isoScene2(d,R,lt){
  const fb=R.fb;fb.fill(0xff000000);
  const n=Math.floor(lt*10),B=isoBalls(d,n);                // one sampler call per rendered frame: the reference run renders every 7 ticks
  const EXT2=800,NG2=16,HG2=100,g=ballField(B,EXT2,NG2,HG2,EXT2*0.55);
  // camera (0x239bc/0x23814): at (0,0,-1000), look-at (2,2,0), FOV 78 -> focal 160/tan(39 deg) = 197.58; projection fitted on the original's projected vertices (centre 159.5,99.5)
  const Fv=norm([2,2,1000]),rt=norm([Fv[2],0,-Fv[0]]),up=[Fv[1]*rt[2]-Fv[2]*rt[1],Fv[2]*rt[0]-Fv[0]*rt[2],Fv[0]*rt[1]-Fv[1]*rt[0]],fz=160/Math.tan(39*Math.PI/180);
  const dt=dt3;
  isoMesh(R,g,{EXT:EXT2,NG:NG2,HG:HG2,ISO,MC:d.mc,mat:{tex:d.tex['metamap0'],env:d.tex['metaenv0'],bump:d.tex['bumpidx'],mode:7,envk:1,bumpk:1,r:1,g:1,b:1},
    proj(P,nn){const q=[P[0],P[1],P[2]+1000],z=dt(q,Fv);if(z<1)return null;const l=Math.hypot(nn[0],nn[1],nn[2])||1,nv=[dt(nn,rt)/l,dt(nn,up)/l];
      return [W/2-0.5+fz*dt(q,rt)/z,VY+VH/2-0.5-fz*dt(q,up)/z,1/z,nv[0],nv[1]];},
    uv:P=>[4*(1+Math.atan2(P[2],P[0])/Math.PI),4+0.005*P[1]]});
  isoParticles(d,R,n-2,{Fv,rt,up,fz});       // flag [obj+0x184]&1: v = 4 + 4*y/800 (0x37a1e)
}
const S3=(d,n)=>d.sc3[n];
export const SCENES=[
 {name:'space',t0:0,t1:30.1,tex:['orionmos','laatta','doom'],
  render(d,R,lt,t){const {S,sc}=S3(d,'space2');const f=Math.max(0,t*TICK-7);S.pose(f);const cam=S.camera('Camera01',f);if(!cam)return;
    drawScene(R,S,cam,d.mats('space2'),{frame:f,t,fogK:d.fogAt(t),cull:false,skip:n=>n==='fd'});}},
 {name:'lava tunnel',t0:30.1,t1:44.3,tex:['forcemao','forcemap'],
  render(d,R,lt,t){tunnel(d,R,d.tex['forcemap'],Math.max(0,lt*TICK-7));}},
 {name:'room',t0:44.3,t1:51.1,tex:['seina','plate','lattia','0floor','0reuna','pylvas','seina2','rako','6','hissi'],
  render(d,R,lt,t){const {S}=S3(d,'0room3');const f=Math.trunc(1.2*lt*TICK);S.pose(f);const cam=S.camera('Camera01',f);if(!cam)return;drawScene(R,S,cam,d.mats('0room3'),{frame:f,t,fogK:d.fogAt(t)});}},
 {name:'portrait',t0:51.1,t1:58.2,tex:['purple'],
  render(d,R,lt,t){blit(R,d.tex['purple'],0,t,1.0+lt*0.02,0,0);const f=d.fadeOf(39,t);if(f<1)for(let y=VY;y<VY+VH;y++)for(let x=0;x<W;x++){const o=y*W+x,p=R.fb[o];R.fb[o]=0xff000000|((((p>>16)&255)*f)<<16)|((((p>>8)&255)*f)<<8)|(((p&255)*f)|0);}}},
 {name:'blob',t0:58.2,t1:72.55,tex:['keltanai','moykymap','moykyenv'],
  render(d,R,lt,t){blit(R,d.tex['keltanai'],0,t,1,0,0);const {S}=S3(d,'dmoykk2');const f=Math.trunc(1.2*(100+Math.max(0,lt*TICK-7)));S.pose(f);
    const cam=S.camera('Camera01',f)||S.camera(Object.keys(S.sc.cams)[0],f);if(cam)drawScene(R,S,cam,d.mats('dmoykk2'),{frame:f,t,fogK:d.fogAt(t),cull:false});}},
 {name:'hallu',t0:72.55,t1:83.1,tex:['ruoho','0ikkuna','marmori2','envgreen'],render(d,R,lt,t){this.draw(d,R,t,70*(lt+0.05));},   /* the original's scene tick restarts at 72.4 but its first frame appears at ~72.55 */
  draw(d,R,t,tick){const {S}=S3(d,'hallu');const f=Math.trunc(tick*1.2);   // the callback 0x1e7d8 sets frame = trunc(1.2*scene tick)
   S.pose(f);const cam=S.camera('Camera01',f);if(!cam)return;cam.focal=cam.pfocal;
    drawScene(R,S,cam,d.mats('hallu'),{frame:f,t,fogK:d.fogAt(t)});drawParticles(d,R,S,cam,tick);}},
 {name:'piikit',t0:83.1,t1:86.6,tex:['kuvio','ruoho','envgreen'],render(d,R,lt,t){this.draw(d,R,t,70*lt);},
  draw(d,R,t,tick,camName){const {S}=S3(d,'piikit2');const f=tick;   // 93.7-100.7 s uses Camera03 (camera positions match the original exactly)
    camName=camName||'Camera01';   // callback 0x1f45c: frame = scene tick (no 1.2 factor)
    S.pose(f);const cam=S.camera(camName,f);if(!cam)return;cam.focal=cam.pfocal;drawScene(R,S,cam,d.mats('piikit2'),{frame:f,t,fogK:d.fogAt(t)});}},
 {name:'hallu2',t0:86.6,t1:93.7,render(d,R,lt,t){SCENES[5].draw(d,R,t,987+70*lt);}},
 {name:'piikit2',t0:93.7,t1:100.7,render(d,R,lt,t){SCENES[6].draw(d,R,t,742+70*lt,'Camera03');}},
 {name:'metaballs',t0:100.7,t1:114.9,tex:['envi2','isomap','metanain'],
  render(d,R,lt,t){metaballs(d,R,t,lt-0.1);}},
 {name:'photos',t0:114.9,t1:128.6,tex:['holemap0','holemap1'],render(d,R,lt,t){holeScene(d,R,t);}},
 {name:'swirl',t0:128.6,t1:143.8,tex:['holemap0','holemap1','mulju00a','mulju00b','mulju00aidx','mulju00bidx','mefisidx','forcemaoidx','mefis','forcemap','forcemao','metamap0','fil','doom','envplane'],
  // four sub-scenes (the original's scene tick restarts at 128.6, 132.9, 136.9 and 140.0 s); textures chosen by colour (the original recolours them with palettes; sub-scene 2's hue is approximate)
  render(d,R,lt,t){if(t<132.9){swirl1(d,R,t);return;}if(t>=132.9&&t<136.9){swirl2(d,R,t-132.9-0.1);return;}if(t>=136.9&&t<139.8){force(d,R,t-136.9-0.1);return;}const SUB=[[128.6,'mulju00a'],[132.9,'mulju00a'],[136.9,'forcemao'],[140.0,'holemap1']];let k=0;while(k<3&&t>=SUB[k+1][0])k++;
    tunnel(d,R,d.tex[SUB[k][1]],Math.max(0,(t-SUB[k][0])*TICK-7));}},
 {name:'balls',t0:143.8,t1:157.8,tex:['raita','ball','ballmid','mefisidx','forcemaoidx','mefis','forcemao'],
  render(d,R,lt,t){if(t>=147.55&&t<150.25){force(d,R,t-147.3-0.1);return;}   // 147.3-150.2 s: the callback 0x25d80 (the halftone swirl of 136.9-139.8) takes over, its tick restarting at 147.3 s
   blit(R,d.tex['raita'],0,t,1.15,0,0);const {S}=S3(d,'ball2');const f=Math.max(0,Math.trunc(12.5*(d.songRow(t-0.1)-2495)));   // 0x24f08: camera frame = trunc((song row - row at scene start) * 12.5)
   S.pose(f);const cam=S.camera('Camera01',f);if(cam)drawScene(R,S,cam,d.mats('ball2'),{frame:f,t,fogK:d.fogAt(t),cull:false});}},
 {name:'tv',t0:157.8,t1:171.9,tex:['envplane','0ikkuna'],
  render(d,R,lt,t){const {S}=S3(d,'tvfin');const f=Math.max(0,(lt-0.1)*TICK);   // camera frame = scene tick (tick 322 at 162.5 s: exact camera match)
   S.pose(f);const cam=S.camera('Camera01',f);if(cam)drawScene(R,S,cam,d.mats('tvfin'),{frame:f,t,fogK:d.fogAt(t),cull:false});particles(d,R,S,cam||null,'particle03',f,0,1,1,1);}},
 {name:'flesh',t0:172.0,t1:185.8,tex:['metamap0','metaenv0','bumpidx'],
  render(d,R,lt,t){isoScene2(d,R,lt);}},
 {name:'end',t0:185.8,t1:300,render(d,R,lt,t){R.clear(0xffffff);}},
];
