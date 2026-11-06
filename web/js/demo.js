// demo.js - the whole demo as a pure function of time:  renderAt(t)  (t = seconds of music, 0..~190)
import {parse3DS} from './s3ds.js';
import {W,H,VY,VH,Tex,Raster,Scene3D,loadTex,drawScene,Camera,norm,rad} from './engine.js';
import {SCENES,autoMats,setPSeeds} from './scenes.js';
import {initHole} from './holefx.js';
const XL=0;const FBDEPTH=3;
const FLIPS=new Map([['lava tunnel',7],['room',7],['portrait',7],['hallu',0],['hallu2',0],['piikit',0],['piikit2',0],['space',0],['blob',7],['photos',0],['balls',7],['tv',7]]);   // scene -> lag (ticks) its clock formula assumes   // scenes whose reference frames show the 21-tick flip lag (checked on 32.5/37.5/42.5 s in the emulator; the other scenes' clocks were fitted with the constant 7-tick lag)
const KICK=[10.137,7.802,5.77,4.044,2.624,1.509,0.703,0.199,0.005];   // degrees, see Demo.kickK
const BLO=0.3;   // fitted: the beat blur seen in the reference frames is the one of the call ~0.3 s earlier (72.5 s 17 -> 14; single-frame fit)
let FD=0.19;const FDTV=0.45;   // after 157.8 s the sprite events act ~0.45 s late (fitted on 20 emulator frames 160.4-168; the earlier 0.19 was measured at 122 s)
//   // sprite fades start ~2 frames after the script event (measured: 122.136 event, first alpha step at 122.33)
const GHOSTS=[[35,10,53,20,3.1],[18,22,53,16,1.9],[52,2,10,24,1.3],[12,50,10,12,0.7],[3,24,27,14,0.34],[33,24,47,32,-0.2],[20,50,10,16,-0.35],[50,3,26,20,-0.9],[5,21,40,28,-1.5],[35,11,20,48,-2.3]];   // r,g,b multiplier, size, position along the axis (0x106b08, stride 0x14)
export class Demo{
  constructor(){this.R=new Raster();this.tex={};this.sc3={};this._m={};this.script=null;this.xm=null;this.t=0;this.cv=document.createElement('canvas');this.cv.width=W;this.cv.height=H;this.ctx=this.cv.getContext('2d');this.img=this.ctx.createImageData(W,H);this.u32=new Uint32Array(this.img.data.buffer);}
  async load(progress){
    const base='assets/';
    this.script=await (await fetch(base+'script.json')).json();
    // the original's sprite table starts one 36-byte record before 0x105dfc (script_dump.py's start): record 0 is lasit.png (photo, alpha 0.45, measured against the original), the dumped table is T[1..]
    this.script.sprites.unshift({id:-1,kind:65537,alpha:0.45,flags:0,v3:1,v4:0,img:'lasit.png',x:0,y:0});
    this.xm=await (await fetch(base+'xm_times.json')).json();
    this.isoballs=await (await fetch(base+'isoballs.json')).json();
    this.mc=await (await fetch(base+'mc.json')).json();   // marching-cubes triangle table of the original (0x109120)
    this.lanim=await (await fetch(base+'lightanim.json')).json();   // animated light ranges sampled from the original
    setPSeeds(await (await fetch(base+'pseeds.json')).json(),await (await fetch(base+'pseeds_flesh.json')).json(),await (await fetch(base+'pseeds_tv.json')).json());
    this.jit=new Map((await (await fetch(base+'jitter.json')).json()).map(r=>[r[0]*64+r[1],r]));   // per call (tick/7) and sprite slot: centre (x,y) and rand()%256 of the timed-effect updater 0x22c46-0x22dc3 (jitter rand()%range-range/2 on x and y, alpha flicker 0.9+0.2*r/256), from the emulator
    this.blur=await (await fetch(base+'blur.json')).json();   // radius of the horizontal box blur the original's flip routine applies on the beat (0x43d00), per call
    initHole(await (await fetch(base+'holefx.json')).json());
    this.lrec=await (await fetch(base+'lights.json')).json();   // the lighter's light list (colour, position, inner^2, outer^2, multiplier) per frame, from the emulator
    this.flares=await (await fetch(base+'flares.json')).json();   // lights flagged for lens flares, per call of the original's 0x31180 (see WRITEUP-asm.md 24)
    this.fog=await (await fetch(base+'fog.json')).json();   // [t,flag,k] per original frame: depth-fade state of the original's lighter
    const ft=await (await fetch(base+'fogtab.json')).json();   // the 8-bit mappers' depth tables (0x16a718/0x16e718/0x172718, 64 rows x 256), installed at the room's start: colour -> colour*(1-w)+fog*w, w=.1+.9*row/63, fog (97,43,68)
    this.fogT=[ft.r,ft.g,ft.b].map(b=>Uint8Array.from(atob(b),c=>c.charCodeAt(0)));this.fogT0=ft.t0;
    const names=new Set(['glow','lens','particle']);
    for(const s of this.script.sprites)if(s.img)names.add(s.img.replace(/\.png$/i,''));
    for(const S of SCENES)for(const n of (S.tex||[]))names.add(n);
    const files=['space2','0room3','morph','morph2','meta1','dmoykk2','tvfin','ball2','piikit2','hallu'];
    let done=0,total=names.size+files.length;
    await Promise.all([...names].map(async n=>{try{this.tex[n]=await loadTex(base+'img/'+n+'.png');}catch(e){console.log('missing texture',n);}done++;progress&&progress(done/total);}));
    await Promise.all(files.map(async n=>{const b=await (await fetch(base+'3ds/'+n+'.3ds')).arrayBuffer();const sc=parse3DS(b);this.sc3[n]={sc,S:new Scene3D(sc)};this.sc3[n].S.anim=this.lanim[n];this.sc3[n].S.lrec=this.lrec;if(n==='0room3')this.sc3[n].S.planarUV=true;done++;progress&&progress(done/total);}));
    for(const S of SCENES)if(S.init)S.init(this);
  }
  // sprite state at time t from the script events (start/stop/fades)
  songRow(t){const R=this.xm.rows;let lo=0,hi=R.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(R[m][2]<=t)lo=m;else hi=m-1;}return R[lo][0]*64+R[lo][1];}   // [0x10eb78]*64+[0x10eb80]
  spritesAt(t){
    FD=t>157.8?FDTV:0.19;
    const ev=this.script.events,sp=this.script.sprites,out=[];
    const st={};
    for(const e of ev){
      if(e.t>t-FD)break;if(e.type!==3||e.fn!==0x222c4)continue;
      const id=e.b;
      if(e.a===1)st[id]={t0:e.t,fin:null,fout:null,t1:null,dx:0};
      else if(e.a===2&&st[id])st[id].t1=e.t;
      else if(e.a===4&&st[id])st[id].fin=[e.t,e.c];
      else if(e.a===5&&st[id])st[id].fout=[e.t,e.c];
    }
    for(const id in st){const s=st[id];if(s.t1!==null&&t>=s.t1+(t>142.8&&t<157.8?0.4:FD))continue;if(sp[id])out.push({id:+id,spr:sp[id],nx:sp[+id+1]||sp[id],s});}
    return out;
  }
  flashAt(t){ // flash_color events: colour, duration in ticks (70 Hz)
    let best=null;for(const e of this.script.events){if(e.t+0.26>t)break;if(e.type===3&&e.fn===0x222c4&&(e.a===7||e.a===6))best=e;}
    if(!best)return null;let t0=best.t;const sc=this.currentScene(t);if(sc&&sc.t0>=t0&&sc.t0-t0<0.2)t0=sc.t0;else t0+=0.26;   // the original starts the fade at the first frame after the event (the scene's reset tick)
    const dur=best.c/70;
    if(window.demoTest&&sc&&sc.name==='flesh'&&best.a===6){   // fader 0x22a7f: timer += 7 per call from the call two after the event's, alpha = trunc(255*timer/dur), blend (src*(255-a)>>8)+(col*a>>8) (table 0x15a218); the grab shows the 21-tick ring call
      const T=Math.round(t*70),tr=21*Math.floor(T/21),st=12040+7*(Math.ceil((best.t*70-12040)/7)+1),q=Math.min(255,Math.max(0,Math.trunc(255*Math.fround((tr-st)/best.c))));return {col:best.b,a:q/255,q};}
    if(best.a===6)return {col:best.b,a:Math.min(1,Math.max(0,(t-t0)/Math.max(dur,0.05)))};   // 6 = fade TO the colour (and it stays), 7 = flash from it
    const a=1-(t-t0)/Math.max(dur,0.05);return a>0?{col:best.b,a}:null;
  }
  // beat zoom: on each blur burst (blur.json, 9 calls of 7 ticks) the engine's camera FOV is cut by KICK[i] degrees at call i after the burst's first, decaying quadratically (measured from the engine matrix 0x149914 in the emulator,
  // 100.8-114.9 s: row norm 1.4864, 1.4229, ... 1.2349 for the 78 degree metaball camera). Returns the focal-length factor tan(fov/2)/tan((fov-kick)/2).
  kickK(t,fov){const B=this.blur;let lo=0,hi=B.length;while(lo<hi){const m=(lo+hi)>>1;if(B[m][0]<=t-0.05)lo=m+1;else hi=m;}let k=lo-1;if(k<0)return 1;
    while(k>0&&B[k][0]-B[k-1][0]<0.15)k--;const i=Math.round((t-B[k][0])*10)-1;if(i<0||i>=KICK.length)return 1;const r=Math.PI/360;return Math.tan(fov*r)/Math.tan((fov-KICK[i])*r);}
  fogAt(t){const a=this.fog;let lo=0,hi=a.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(a[m][0]<=t)lo=m;else hi=m-1;}const r=a[lo];return r[1]?r[2]:0;}
  mats(n){return this._m[n]||(this._m[n]=autoMats(this,this.sc3[n].sc));}
  currentScene(t){for(const S of SCENES)if(t>=S.t0&&t<S.t1)return S;return null;}
  // The reference frames are grabbed from the original's screen buffer, which the flip routine only refreshes on every 3rd main-loop iteration (ticks multiple of 21,
  // measured in the emulator at 37.5/42.5 s: the buffers at the boundaries 2954..2975 are identical, the content is the render made at tick 2961 = 21*floor(2975/21)).
  // All scene clocks of the port already assume the shown frame was rendered 7 ticks before the boundary, hence the correction. Only in test mode (?test=1, the golden grabs) and only for the scenes in FLIPS.
  renderAt(t,depth=0,raw=false){
    // the tv faces of the original show the previous rendered frame (7 ticks earlier, 320x200 viewport of the other buffer; see 0x42f04): render it first (depth-limited, it is mostly dark by then)
    this.fbTex=null;const Sv=this.currentScene(t);
    if(Sv&&Sv.name==='tv'&&depth<FBDEPTH){const T=Math.round(t*70);this.renderAt(window.demoTest?t+(21*Math.floor(T/21)-T+7)/70-0.1:t-0.1,depth+1,true);{const L=new Uint32Array(W*VH);L.set(this.R.fb.subarray(VY*W+64,(VY+VH)*W));this.fbTex=new Tex(W,VH,L);}}   // the mapper reads the other buffer 64 pixels further (texture base = buffer + 0x100 bytes, checked texel by texel in the emulator)
    const t0=t;
    const S0=window.demoTest&&!raw&&this.currentScene(t);const base=S0&&(FLIPS.get(S0.name)??(S0.name==='swirl'&&t<132.9?7:undefined));if(base!==undefined){const T=Math.round(t*70);t+=(21*Math.floor(T/21)-T+base)/70;}
    this.call=window.demoTest?3*Math.floor(Math.round(t0*10)/3):Math.round(t0*10);   // call of the original whose output is shown (test mode: the 21-tick buffer ring)
    this.t=t;this.blurT=undefined;const R=this.R;R.clear(0);R.cam=null;R.fogT=null;
    const S=this.currentScene(t);
    if(S)S.render(this,R,t-S.t0,t);
    // 2D layers
    this.drawFlares(t);
    if(!(S&&S.under&&t<147.55))this.drawSprites(t);
    this.applyBlur(t);
    const f=this.flashAt(t);if(f){const c=f.col,fr=(c>>16)&255,fg=(c>>8)&255,fb=c&255;// colour order in the script is 0xRRGGBB
      const fbp=R.fb;if(f.q!==undefined){const q=f.q,iq=255-q;for(let y=VY;y<VY+VH;y++)for(let x=0;x<W;x++){const o=y*W+x,p=fbp[o];fbp[o]=0xff000000|((((p>>16)&255)*iq>>8)+(fb*q>>8))<<16|((((p>>8)&255)*iq>>8)+(fg*q>>8))<<8|(((p&255)*iq>>8)+(fr*q>>8));}}else for(let y=VY;y<VY+VH;y++)for(let x=0;x<W;x++){const o=y*W+x,p=fbp[o];const a=f.a;fbp[o]=0xff000000|((((p>>16)&255)*(1-a)+fb*a)<<16)|((((p>>8)&255)*(1-a)+fg*a)<<8)|(((p&255)*(1-a)+fr*a)|0);}}
    this.u32.set(R.fb);this.ctx.putImageData(this.img,0,0);
  }
  fadeOf(id,t){FD=t>157.8?FDTV:0.19;const o=this.spritesAt(t).find(x=>x.id===id);if(!o)return 0;let a=o.nx.alpha;const s=o.s;
    if(s.fin)a*=Math.min(1,Math.max(0,(t-s.fin[0]-FD)/(Math.max(s.fin[1],1)/70)));if(s.fout)a*=1-Math.min(1,Math.max(0,(t-s.fout[0]-FD)/(Math.max(s.fout[1],1)/70)));return a;}
  // Lens flares (0x31180): per flagged light a glow sprite (additive, colour*alpha) and, when the engine flag 8 is set and the glow is big enough, ten flat-coloured hexagons along the line through the screen centre.
  drawFlares(t){
    const R=this.R,cam=R.cam,F=this.flares;if(!cam||!F)return;
    let lo=0,hi=F.length;while(lo<hi){const m=(lo+hi)>>1;if(F[m][0]<t-1e-4)lo=m+1;else hi=m;}
    const rec=F[lo];if(!rec||rec[0]-t>=0.1)return;
    const [,eng,f4,fog,fk,Ls,tests]=rec,used=new Set(),glow=this.tex['glow'],lens=this.tex['lens'];
    const blit=(tex,cx,cy,w,c,flat)=>{const td=tex.d,tw=tex.w,th=tex.h,x0=Math.max(0,Math.floor(cx-w/2)),x1=Math.min(W-1,Math.ceil(cx+w/2)),y0=Math.max(VY,Math.floor(cy-w/2)),y1=Math.min(VY+VH-1,Math.ceil(cy+w/2));
      const L=flat?c:c.map(x=>x>>2);
      for(let y=y0;y<=y1;y++){const tv=(y+0.5-(cy-w/2))/w;if(tv<0||tv>=1)continue;const ty=(tv*th)|0;
        for(let x=x0;x<=x1;x++){const tu=(x+0.5-(cx-w/2))/w;if(tu<0||tu>=1)continue;const tp=td[ty*tw+((tu*tw)|0)],o=y*W+x,p=R.fb[o];let a,b,g;
          if(flat){if(!(tp&0xffffff))continue;a=L[0];g=L[1];b=L[2];}else{const q=tp&255;a=(q*L[0])>>5;g=(q*L[1])>>5;b=(q*L[2])>>5;}
          R.fb[o]=0xff000000|(Math.min(255,((p>>16)&255)+b)<<16)|(Math.min(255,((p>>8)&255)+g)<<8)|Math.min(255,(p&255)+a);}}};
    for(const [e8,d8,e0,f0,cr,cg,cb,X,Y,Z] of Ls){
      const v=cam.toView([X,Z,Y]),zv=v[2];if(zv<1.5)continue;
      const sx=159.5+cam.pfocal*v[0]/zv,sy=99.5-cam.pfocal*v[1]/zv;if(sx<0||sx>=320||sy<0||sy>=200)continue;
      // 0x2b6a8: the light shows only where the original's depth buffer holds something farther; the frustum test and this result are sampled from the original (its geometry differs slightly from the port's)
      const ti=tests.findIndex((q,i)=>!used.has(i)&&Math.abs(q[0]-zv)<0.005*zv);if(ti<0)continue;used.add(ti);if(!tests[ti][1])continue;
      let a=f0;
      if(f4&4)a*=1-((zv-1.5)*0.9/(1251.5028-1.5)+0.1);else if(fog)a*=0.5+(1-zv*fk)*0.5;
      const w=2*d8*160/zv;if(w>512)continue;
      if(e8&1)blit(glow,sx,VY+sy,w,[cr,cg,cb].map(c=>Math.trunc(c*a)),false);
      const sz=w*e0*a,dx=159.5-sx,dy=99.5-sy,dd=(dx*dx+dy*dy)/(2*160*160);
      if(!(eng&8)||!(sz>10))continue;
      const q=(1-dd)*(sz<20?(sz-10)/10:1);
      for(const [r,g,b,sw,pos] of GHOSTS)blit(lens,159.5-pos*dx,VY+99.5-pos*dy,sw,[Math.trunc(cr/255*q*r),Math.trunc(cg/255*q*g),Math.trunc(cb/255*q*b)],true);}
  }
  // 0x43d00 / 0x49bcd: horizontal box blur of every row of the 320x200 viewport, window [x-r, x+r] clipped at the borders and normalised by its size, per channel (truncated); the radius is random per call
  applyBlur(t){t=this.blurT!==undefined?this.blurT:t-BLO;
    const B=this.blur;if(!B)return;let lo=0,hi=B.length;while(lo<hi){const m=(lo+hi)>>1;if(B[m][0]<t-1e-4)lo=m+1;else hi=m;}
    const rec=B[lo];if(!rec||rec[0]-t>=0.1||rec[1]<=0)return;const r=rec[1],fb=this.R.fb,tmp=new Uint32Array(W);
    for(let y=0;y<VH;y++){const o=(VY+y)*W;
      for(let x=0;x<W;x++){const a=Math.max(0,x-r),b=Math.min(W-1,x+r),n=b-a+1;let sr=0,sg=0,sb=0;for(let k=a;k<=b;k++){const p=fb[o+k];sr+=p&255;sg+=(p>>8)&255;sb+=(p>>16)&255;}
        const w=Math.fround(1/n);tmp[x]=0xff000000|((Math.trunc(sb*w)&255)<<16)|((Math.trunc(sg*w)&255)<<8)|(Math.trunc(sr*w)&255);}
      for(let x=0;x<W;x++)fb[o+x]=tmp[x];}
  }
  drawSprites(t,sa=1){
    const R=this.R;
    for(const {id,spr,nx,s} of this.spritesAt(t)){
      const tex=this.tex[spr.img&&spr.img.replace(/\.png$/i,'')];if(!tex)continue;
      if(spr.img==='purple.png')continue;   // drawn by the portrait scene, which applies this sprite's fade (fadeOf)
      let a=nx.alpha;   // photo alpha as in the sprite table (0.4-0.55 plateau measured against the original; kind 1 = abba41-2, the full-opacity photo of the 114.7 s lyric scene)
      if(s.fin){const k=(t-s.fin[0]-FD)/(Math.max(s.fin[1],1)/70);a*=Math.min(1,Math.max(0,k));}
      if(s.fout){const k=(t-s.fout[0]-FD)/(Math.max(s.fout[1],1)/70);a*=1-Math.min(1,Math.max(0,k));}
      a*=sa;if(a<=0)continue;
      const sub=(nx.flags&8)!==0,add=nx.kind===2&&!sub&&(nx.flags===4||!(tex.w>=320&&tex.h>=200));   // the image/position columns of the table are one record behind kind/alpha/v4 (checked against the emulator: event 21 draws itused.png with record 21's v4=4), hence nx; v4 (script 'flags') picks the blitter: 12 = subtractive 0x53ff8, 4 = grey additive 0x53ecc, 0 = palette additive 0x53d6c; full-viewport images (purple.png, the portrait) are alpha-blended, strips/kid are additive: measured against the original
      // placement: images 320x200 fill the viewport; small strips are centred or placed at (x,y) when given
      let x0=0,y0=0;const w=tex.w,h=tex.h;
      if(w>=320&&h>=200){const k=spr.kind===2&&nx.flags===0?1:0;x0=k;y0=VY+k;}   // the colour-keyed (texel 0 skipped) blitter starts one pixel in, like the jittered strips (skenenp2.png over the lava tunnel: 37.5 s 7.0 -> 1.3, 42.5 s 7.1 -> 1.4)
      else{ // 0x22145: a coordinate of -1 / -2 means left|top / right|bottom edge of the 320x200 viewport (centre = w/2 or 320-w/2, 200-h/2)
        x0=spr.x>=0?Math.round(spr.x-w/2):spr.x===-1?XL:320-w;y0=VY+(spr.y>=0?Math.round(spr.y-h/2):spr.y===-1?0:200-h);
        const j=this.jit.get(this.call*64+id);if(j){x0=Math.floor(j[2]-w/2)+1;y0=VY+Math.floor(j[3]-h/2)+1;if(j[4]>=0)a*=0.9+0.2*j[4]/256;}}
      const fb=R.fb,d=tex.d;
      for(let y=0;y<h;y++){const yy=y0+y;if(yy<VY||yy>=VY+VH)continue;
        for(let x=0;x<w;x++){const xx=x0+x;if(xx<0||xx>=W)continue;const px=d[y*w+x],o=yy*W+xx,p=fb[o];
          if(sub){const rr=Math.max(0,(p&255)-(px&255)*a),gg=Math.max(0,((p>>8)&255)-((px>>8)&255)*a),bb=Math.max(0,((p>>16)&255)-((px>>16)&255)*a);fb[o]=0xff000000|(bb<<16)|(gg<<8)|rr;}
          else if(add){const rr=Math.min(255,(p&255)+(px&255)*a),gg=Math.min(255,((p>>8)&255)+((px>>8)&255)*a),bb=Math.min(255,((p>>16)&255)+((px>>16)&255)*a);fb[o]=0xff000000|(bb<<16)|(gg<<8)|rr;}
          else if(spr.kind===2&&nx.flags===0&&!(px&0xffffff)){}   // texel 0 is skipped by the blitter (skenenp2.png over the lava tunnel)
          else{const rr=(p&255)*(1-a)+(px&255)*a,gg=((p>>8)&255)*(1-a)+((px>>8)&255)*a,bb=((p>>16)&255)*(1-a)+((px>>16)&255)*a;fb[o]=0xff000000|(bb<<16)|(gg<<8)|rr;}}}
    }
  }
  dataURL(){return this.cv.toDataURL('image/png');}
}
