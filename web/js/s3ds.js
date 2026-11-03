// s3ds.js - 3D Studio (.3DS) loader + keyframer evaluation (TCB position, quaternion rotation), as used by HYPERVENTILATION's scenes.
// Vertices are stored in world space in the file; every mesh node is re-expressed relative to its pivot so that the node
// transform  M(f) = T(pos(f)) * R(rot(f)) * S(scl(f)) * T(-pivot)  gives world positions (identical to lib3ds).
export function parse3DS(buf){
  const dv=new DataView(buf), u8=new Uint8Array(buf);
  const sc={objects:[],materials:{},nodes:[],cams:{},lights:{},seg:[0,100],ambient:[0,0,0]};
  let curObj=null, curMat=null, curNode=null, curCol=null;
  const cstr=(o)=>{let e=o;while(u8[e])e++;return [String.fromCharCode(...u8.subarray(o,e)),e+1];};
  const f32=(o)=>dv.getFloat32(o,true);
  function walk(o,end,fn){while(o+6<=end){const id=dv.getUint16(o,true),ln=dv.getUint32(o+2,true);if(ln<6)break;fn(id,o+6,o+ln);o+=ln;}}
  function track(b,kind){
    const n=dv.getUint32(b+10,true);let q=b+14;const keys=[];
    for(let i=0;i<n;i++){
      const frame=dv.getUint32(q,true),fl=dv.getUint16(q+4,true);q+=6;
      const k={f:frame,t:0,c:0,b:0,ei:0,eo:0};
      if(fl&1){k.t=f32(q);q+=4;} if(fl&2){k.c=f32(q);q+=4;} if(fl&4){k.b=f32(q);q+=4;} if(fl&8){k.ei=f32(q);q+=4;} if(fl&16){k.eo=f32(q);q+=4;}
      if(kind==='pos'||kind==='scl'){k.v=[f32(q),f32(q+4),f32(q+8)];q+=12;}
      else if(kind==='rot'){k.v=[f32(q),f32(q+4),f32(q+8),f32(q+12)];q+=16;}
      else {k.v=[f32(q)];q+=4;}
      keys.push(k);
    }
    keys.flags=dv.getUint16(b,true);   // track flags: &3 = 0 once, 2 repeat (loop), 3 loop (with the last key equal to the first)
    return keys;
  }
  function chunk(id,b,e){
    switch(id){
      case 0x4D4D: case 0x3D3D: case 0xB000: walk(b,e,chunk); break;
      case 0xAFFF: curMat={name:'',diffuse:[200,200,200],map:null,refl:null,bump:null,shin:0,twoside:false,shading:2}; walk(b,e,chunk); sc.materials[curMat.name]=curMat; break;
      case 0xA000: curMat.name=cstr(b)[0]; break;
      case 0xA020: curCol='diffuse'; walk(b,e,chunk); break;
      case 0x0011: if(curCol==='diffuse'&&curMat) curMat.diffuse=[u8[b],u8[b+1],u8[b+2]]; break;
      case 0xA040: walk(b,e,(i,bb)=>{if(i===0x30)curMat.shin=dv.getUint16(bb,true);}); break;
      case 0xA200: walk(b,e,(i,bb)=>{if(i===0xA300)curMat.map=cstr(bb)[0];}); break;
      case 0xA220: walk(b,e,(i,bb)=>{if(i===0xA300)curMat.refl=cstr(bb)[0];}); break;
      case 0xA230: walk(b,e,(i,bb)=>{if(i===0xA300)curMat.bump=cstr(bb)[0];}); break;
      case 0xA081: curMat.twoside=true; break;
      case 0xA100: curMat.shading=dv.getUint16(b,true); break;   // 1 flat, 2 gouraud, 3 phong/metal: the original draws shading-1 materials unlit (face flag 0x03 bit 1 clear)
      case 0x4000: {const [n,p]=cstr(b);curObj={name:n,verts:null,faces:null,uv:null,mat:[],xform:null,hidden:false,kind:'mesh'};sc.objects.push(curObj);walk(p,e,chunk);break;}
      case 0x4100: walk(b,e,chunk); break;
      case 0x4110: {const n=dv.getUint16(b,true);const a=new Float32Array(n*3);for(let i=0;i<n*3;i++)a[i]=f32(b+2+i*4);curObj.verts=a;break;}
      case 0x4120: {const n=dv.getUint16(b,true);const a=new Uint16Array(n*3);for(let i=0;i<n;i++){a[i*3]=dv.getUint16(b+2+i*8,true);a[i*3+1]=dv.getUint16(b+4+i*8,true);a[i*3+2]=dv.getUint16(b+6+i*8,true);}curObj.faces=a;walk(b+2+n*8,e,chunk);break;}
      case 0x4130: {const [n,p]=cstr(b);const c=dv.getUint16(p,true);const fl=[];for(let i=0;i<c;i++)fl.push(dv.getUint16(p+2+i*2,true));curObj.mat.push({name:n,faces:fl});break;}
      case 0x4140: {const n=dv.getUint16(b,true);const a=new Float32Array(n*2);for(let i=0;i<n*2;i++)a[i]=f32(b+2+i*4);curObj.uv=a;break;}
      case 0x4160: {const m=new Float32Array(12);for(let i=0;i<12;i++)m[i]=f32(b+i*4);curObj.xform=m;break;}
      // light: the original (0x463ec) uses colour (0..255), inner/outer range (squared), multiplier; a light without range chunks is inert (outer range 0)
      case 0x4600: {curObj.kind='light';curObj.pos=[f32(b),f32(b+4),f32(b+8)];curObj.color=[255,255,255];curObj.inner=0;curObj.outer=0;curObj.mult=1;curObj.off=false;
        walk(b+12,e,(i,bb)=>{if(i===0x0010)curObj.color=[f32(bb)*255,f32(bb+4)*255,f32(bb+8)*255];else if(i===0x0011)curObj.color=[u8[bb],u8[bb+1],u8[bb+2]];
          else if(i===0x4659)curObj.inner=f32(bb);else if(i===0x465A)curObj.outer=f32(bb);else if(i===0x465B)curObj.mult=f32(bb);else if(i===0x4620)curObj.off=true;});sc.lights[curObj.name]=curObj;break;}
      case 0x2100: walk(b,e,(i,bb)=>{if(i===0x0010)sc.ambient=[f32(bb)*255,f32(bb+4)*255,f32(bb+8)*255];else if(i===0x0011)sc.ambient=[u8[bb],u8[bb+1],u8[bb+2]];}); break;
      case 0x4700: {curObj.kind='camera';curObj.pos=[f32(b),f32(b+4),f32(b+8)];curObj.target=[f32(b+12),f32(b+16),f32(b+20)];curObj.roll=f32(b+24);curObj.lens=f32(b+28);sc.cams[curObj.name]=curObj;break;}
      case 0xB008: sc.seg=[dv.getUint32(b,true),dv.getUint32(b+4,true)]; break;
      case 0xB002: case 0xB003: case 0xB004: case 0xB005: case 0xB006: case 0xB007:
        curNode={type:id,name:'',id:-1,parent:-1,pivot:[0,0,0],pos:null,rot:null,scl:null,fov:null,roll:null,flags:0};sc.nodes.push(curNode);walk(b,e,chunk);break;
      case 0xB010: {const [n,p]=cstr(b);curNode.name=n;curNode.flags=dv.getUint16(p,true);curNode.parent=dv.getInt16(p+4,true);break;}
      case 0xB030: curNode.id=dv.getUint16(b,true); break;
      case 0xB013: curNode.pivot=[f32(b),f32(b+4),f32(b+8)]; break;
      case 0xB020: curNode.pos=track(b,'pos'); break;
      case 0xB021: curNode.rot=track(b,'rot'); break;
      case 0xB022: curNode.scl=track(b,'scl'); break;
      case 0xB023: curNode.fov=track(b,'fov'); break;
      case 0xB024: curNode.roll=track(b,'roll'); break;
      case 0xB026: {const n=dv.getUint32(b+10,true);let q=b+14;const keys=[];      // morph track: frame -> name of the target object
        for(let i=0;i<n;i++){const frame=dv.getUint32(q,true),fl=dv.getUint16(q+4,true);q+=6;for(let k=0;k<5;k++)if(fl&(1<<k))q+=4;const [nm,e2]=cstr(q);q=e2;keys.push({f:frame,name:nm});}
        curNode.morph=keys;break;}
    }
  }
  walk(0,buf.byteLength,chunk);
  // accumulate relative rotation keys into absolute quaternions
  for(const n of sc.nodes) if(n.rot){let q=[0,0,0,1];for(const k of n.rot){const [a,x,y,z]=k.v;const l=Math.hypot(x,y,z)||1;const s=Math.sin(a/2);const r=[-x/l*s,-y/l*s,-z/l*s,Math.cos(a/2)];q=qmul(q,r);k.q=q.slice();}}  // 3DS angle-axis is the inverse of the usual convention (hence the sign flip)
  sc.byName={};for(const o of sc.objects)sc.byName[o.name]=o;
  return sc;
}
export const qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
function slerp(a,b,t){let d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];let s=1;if(d<0){d=-d;s=-1;}
  let k0,k1;if(d>0.9995){k0=1-t;k1=t*s;}else{const th=Math.acos(d),sn=Math.sin(th);k0=Math.sin((1-t)*th)/sn;k1=Math.sin(t*th)/sn*s;}
  const r=[a[0]*k0+b[0]*k1,a[1]*k0+b[1]*k1,a[2]*k0+b[2]*k1,a[3]*k0+b[3]*k1];const l=Math.hypot(...r)||1;return r.map(x=>x/l);}
// Kochanek-Bartels (TCB) Hermite interpolation of a vector track
const isLoop=(keys)=>(keys.flags&3)===3&&keys.length>=3;
const wrapT=(keys,f)=>{const L=keys[keys.length-1].f+1;return isLoop(keys)&&f>=0?f%L:f;};
function tcbTan(keys,i,dim){
  const n=keys.length,p=keys[i],pv=keys[Math.max(i-1,0)].v,nv=keys[Math.min(i+1,n-1)].v,v=p.v;
  const t=p.t,c=p.c,b=p.b;const tin=[],tout=[],loop=isLoop(keys);
  for(let d=0;d<dim;d++){
    const a=v[d]-pv[d],bb=nv[d]-v[d];
    if(loop&&(i===0||i===n-1)){const P=keys[n-2].v[d],N=keys[1].v[d],V=keys[0].v[d],A=V-P,B=N-V;   // looped track: the first/last key use their wrapped neighbours (0x38fc0 wraps the time)
      tout[d]=tin[d]=0.5*((1-t)*(1+b)*(1+c)*A+(1-t)*(1-b)*(1-c)*B);}
    else if(i===0){tin[d]=tout[d]=bb;}else if(i===n-1){tin[d]=tout[d]=a;}
    else{tout[d]=0.5*((1-t)*(1+b)*(1+c)*a+(1-t)*(1-b)*(1-c)*bb);tin[d]=0.5*((1-t)*(1+b)*(1-c)*a+(1-t)*(1-b)*(1+c)*bb);}
  }
  return [tin,tout];
}
export function evalVec(keys,f,dim,def){
  if(!keys||!keys.length)return def;const n=keys.length;f=wrapT(keys,f);
  if(n===1||f<=keys[0].f)return keys[0].v;
  if(f>=keys[n-1].f)return keys[n-1].v;
  let i=0;while(i<n-2&&f>=keys[i+1].f)i++;
  const k0=keys[i],k1=keys[i+1];const t=(f-k0.f)/(k1.f-k0.f);
  const t2=t*t,t3=t2*t;const h1=2*t3-3*t2+1,h2=-2*t3+3*t2,h3=t3-2*t2+t,h4=t3-t2;
  const d0=tcbTan(keys,i,dim)[1],d1=tcbTan(keys,i+1,dim)[0];
  // tangents are per-segment-normalised by 2*seg length in lib3ds; keep unscaled (keys are roughly equispaced in these scenes)
  const r=[];for(let d=0;d<dim;d++)r[d]=h1*k0.v[d]+h2*k1.v[d]+h3*d0[d]+h4*d1[d];return r;
}
export function evalRot(keys,f){
  if(!keys||!keys.length)return [0,0,0,1];const n=keys.length;f=wrapT(keys,f);
  if(n===1||f<=keys[0].f)return keys[0].q;if(f>=keys[n-1].f)return keys[n-1].q;
  let i=0;while(i<n-2&&f>=keys[i+1].f)i++;const k0=keys[i],k1=keys[i+1];
  return slerp(k0.q,k1.q,(f-k0.f)/(k1.f-k0.f));
}
export function evalScalar(keys,f,def){const v=evalVec(keys,f,1,null);return v?v[0]:def;}
