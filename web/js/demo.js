// demo.js - the whole demo as a pure function of time:  renderAt(t)  (t = seconds of music, 0..~190)
import {parse3DS} from './s3ds.js';
import {W,H,VY,VH,Raster,Scene3D,loadTex,drawScene,Camera,norm,rad} from './engine.js';
import {SCENES,autoMats} from './scenes.js';
const XL=0;
const FD=0.19;   // sprite fades start ~2 frames after the script event (measured: 122.136 event, first alpha step at 122.33)
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
    this.fog=await (await fetch(base+'fog.json')).json();   // [t,flag,k] per original frame: depth-fade state of the original's lighter
    const names=new Set(['glow','lens','particle']);
    for(const s of this.script.sprites)if(s.img)names.add(s.img.replace(/\.png$/i,''));
    for(const S of SCENES)for(const n of (S.tex||[]))names.add(n);
    const files=['space2','0room3','morph','morph2','meta1','dmoykk2','tvfin','ball2','piikit2','hallu'];
    let done=0,total=names.size+files.length;
    await Promise.all([...names].map(async n=>{try{this.tex[n]=await loadTex(base+'img/'+n+'.png');}catch(e){console.log('missing texture',n);}done++;progress&&progress(done/total);}));
    await Promise.all(files.map(async n=>{const b=await (await fetch(base+'3ds/'+n+'.3ds')).arrayBuffer();const sc=parse3DS(b);this.sc3[n]={sc,S:new Scene3D(sc)};this.sc3[n].S.anim=this.lanim[n];done++;progress&&progress(done/total);}));
    for(const S of SCENES)if(S.init)S.init(this);
  }
  // sprite state at time t from the script events (start/stop/fades)
  spritesAt(t){
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
    for(const id in st){const s=st[id];if(s.t1!==null&&t>=s.t1+FD)continue;if(sp[id])out.push({id:+id,spr:sp[id],nx:sp[+id+1]||sp[id],s});}
    return out;
  }
  flashAt(t){ // flash_color events: colour, duration in ticks (70 Hz)
    let best=null;for(const e of this.script.events){if(e.t+0.26>t)break;if(e.type===3&&e.fn===0x222c4&&(e.a===7||e.a===6))best=e;}
    if(!best)return null;let t0=best.t;const sc=this.currentScene(t);if(sc&&sc.t0>=t0&&sc.t0-t0<0.2)t0=sc.t0;else t0+=0.26;   // the original starts the fade at the first frame after the event (the scene's reset tick)
    const dur=best.c/70;if(best.a===6)return {col:best.b,a:Math.min(1,Math.max(0,(t-t0)/Math.max(dur,0.05)))};   // 6 = fade TO the colour (and it stays), 7 = flash from it
    const a=1-(t-t0)/Math.max(dur,0.05);return a>0?{col:best.b,a}:null;
  }
  fogAt(t){const a=this.fog;let lo=0,hi=a.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(a[m][0]<=t)lo=m;else hi=m-1;}const r=a[lo];return r[1]?r[2]:0;}
  mats(n){return this._m[n]||(this._m[n]=autoMats(this,this.sc3[n].sc));}
  currentScene(t){for(const S of SCENES)if(t>=S.t0&&t<S.t1)return S;return null;}
  renderAt(t){
    this.t=t;const R=this.R;R.clear(0);
    const S=this.currentScene(t);
    if(S)S.render(this,R,t-S.t0,t);
    // 2D layers
    this.drawSprites(t);
    const f=this.flashAt(t);if(f){const c=f.col,fr=(c>>16)&255,fg=(c>>8)&255,fb=c&255;// colour order in the script is 0xRRGGBB
      const fbp=R.fb;for(let y=VY;y<VY+VH;y++)for(let x=0;x<W;x++){const o=y*W+x,p=fbp[o];const a=f.a;fbp[o]=0xff000000|((((p>>16)&255)*(1-a)+fb*a)<<16)|((((p>>8)&255)*(1-a)+fg*a)<<8)|(((p&255)*(1-a)+fr*a)|0);}}
    this.u32.set(R.fb);this.ctx.putImageData(this.img,0,0);
  }
  fadeOf(id,t){const o=this.spritesAt(t).find(x=>x.id===id);if(!o)return 0;let a=o.nx.alpha;const s=o.s;
    if(s.fin)a*=Math.min(1,Math.max(0,(t-s.fin[0]-FD)/(Math.max(s.fin[1],1)/70)));if(s.fout)a*=1-Math.min(1,Math.max(0,(t-s.fout[0]-FD)/(Math.max(s.fout[1],1)/70)));return a;}
  drawSprites(t){
    const R=this.R;
    for(const {spr,nx,s} of this.spritesAt(t)){
      const tex=this.tex[spr.img&&spr.img.replace(/\.png$/i,'')];if(!tex)continue;
      if(spr.img==='purple.png')continue;   // drawn by the portrait scene, which applies this sprite's fade (fadeOf)
      let a=nx.alpha;   // photo alpha as in the sprite table (0.4-0.55 plateau measured against the original; kind 1 = abba41-2, the full-opacity photo of the 114.7 s lyric scene)
      if(s.fin){const k=(t-s.fin[0]-FD)/(Math.max(s.fin[1],1)/70);a*=Math.min(1,Math.max(0,k));}
      if(s.fout){const k=(t-s.fout[0]-FD)/(Math.max(s.fout[1],1)/70);a*=1-Math.min(1,Math.max(0,k));}
      if(a<=0)continue;
      const sub=(nx.flags&8)!==0,add=nx.kind===2&&!sub&&!(tex.w>=320&&tex.h>=200);   // the image/position columns of the table are one record behind kind/alpha/v4 (checked against the emulator: event 21 draws itused.png with record 21's v4=4), hence nx; v4 (script 'flags') picks the blitter: 12 = subtractive 0x53ff8, 4 = grey additive 0x53ecc, 0 = palette additive 0x53d6c; full-viewport images (purple.png, the portrait) are alpha-blended, strips/kid are additive: measured against the original
      // placement: images 320x200 fill the viewport; small strips are centred or placed at (x,y) when given
      let x0=0,y0=0;const w=tex.w,h=tex.h;
      if(w>=320&&h>=200){x0=0;y0=VY;}
      else{ // 0x22145: a coordinate of -1 / -2 means left|top / right|bottom edge of the 320x200 viewport (centre = w/2 or 320-w/2, 200-h/2)
        x0=spr.x>=0?Math.round(spr.x-w/2):spr.x===-1?XL:320-w;y0=VY+(spr.y>=0?Math.round(spr.y-h/2):spr.y===-1?0:200-h);}
      const fb=R.fb,d=tex.d;
      for(let y=0;y<h;y++){const yy=y0+y;if(yy<VY||yy>=VY+VH)continue;
        for(let x=0;x<w;x++){const xx=x0+x;if(xx<0||xx>=W)continue;const px=d[y*w+x],o=yy*W+xx,p=fb[o];
          if(sub){const rr=Math.max(0,(p&255)-(px&255)*a),gg=Math.max(0,((p>>8)&255)-((px>>8)&255)*a),bb=Math.max(0,((p>>16)&255)-((px>>16)&255)*a);fb[o]=0xff000000|(bb<<16)|(gg<<8)|rr;}
          else if(add){const rr=Math.min(255,(p&255)+(px&255)*a),gg=Math.min(255,((p>>8)&255)+((px>>8)&255)*a),bb=Math.min(255,((p>>16)&255)+((px>>16)&255)*a);fb[o]=0xff000000|(bb<<16)|(gg<<8)|rr;}
          else{const rr=(p&255)*(1-a)+(px&255)*a,gg=((p>>8)&255)*(1-a)+((px>>8)&255)*a,bb=((p>>16)&255)*(1-a)+((px>>16)&255)*a;fb[o]=0xff000000|(bb<<16)|(gg<<8)|rr;}}}
    }
  }
  dataURL(){return this.cv.toDataURL('image/png');}
}
