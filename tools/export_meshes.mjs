// usage: node tools/export_meshes.mjs > web/assets/meshes.json
// Dumps the 3DS scenes as plain JSON for the 3D viewer and the write-up figures: world-space meshes at a representative frame, camera paths, lights.
import {parse3DS} from '../web/js/s3ds.js';import {Scene3D} from '../web/js/engine.js';import fs from 'fs';
const here=new URL('..',import.meta.url).pathname;
const FILES={space2:600,'0room3':250,hallu:300,piikit2:300,tvfin:300,ball2:300,morph:300,morph2:300,dmoykk2:300};
const r1=x=>Math.round(x*10)/10,out={};
for(const [n,f] of Object.entries(FILES)){
  const b=fs.readFileSync(here+'web/assets/3ds/'+n+'.3ds');const sc=parse3DS(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));const S=new Scene3D(sc);S.pose(f);
  const meshes=[];for(const m of S.meshes){if(m.hidden)continue;meshes.push({name:m.node.name,v:Array.from(m.wv,r1),f:Array.from(m.obj.faces),mat:m.faceMat.length?m.faceMat[0]:null});}
  const cams={};for(const cn of Object.keys(sc.cams)){const path=[];for(let k=0;k<=1600;k+=20){S.pose(k);const c=S.camera(cn,k);if(c)path.push([k,...c.pos.map(r1)]);}cams[cn]=path;}
  const lights=S.lightsAt(f,0).map(l=>({p:l.pos.map(r1),c:l.col.map(Math.round)}));
  out[n]={frame:f,meshes,cams,lights};
}
console.log(JSON.stringify(out));
