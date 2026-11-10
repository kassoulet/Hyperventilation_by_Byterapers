// main.js - player: canvas 320x240 shown 4:3 (square pixels in VESA 320x240), music via libopenmpt (chiptune3), pause + seek anywhere.
import {Demo} from './demo.js';
import {SCENES} from './scenes.js';
const TEST=new URLSearchParams(location.search).has('test');window.demoTest=TEST;
const $=id=>document.getElementById(id);
const d=new Demo();window.demo=d;
const cvs=$('c'),ctx=cvs.getContext('2d');
let dur=189.5,playing=false,tBase=0,wall0=0,cp=null,ac=null,audioReady=null,started=false,muted=false,lastDraw=-1;
const now=()=>performance.now()/1000;
const cur=()=>playing?Math.min(dur,tBase+(now()-wall0)):tBase;
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function draw(t){if(t===lastDraw)return;lastDraw=t;d.renderAt(t);ctx.drawImage(d.cv,0,0);}
async function initAudio(){
  const {ChiptuneJsPlayer}=await import('../vendor/chiptune3.js');
  ac=new AudioContext();cp=new ChiptuneJsPlayer({context:ac,repeatCount:0,interpolationFilter:8});
  cp.gain.connect(ac.destination);   // chiptune3 only routes to the speakers itself when it creates its own context
  await new Promise(r=>cp.onInitialized(r));
  const buf=await (await fetch('assets/music/hypermmx.xm')).arrayBuffer();
  cp.onProgress(m=>{if(playing&&Math.abs(m.pos-cur())>0.25){tBase=m.pos;wall0=now();}});   // keep visuals locked to the module clock
  cp.onEnded(()=>{playing=false;tBase=dur;sync();});
  cp.play(buf);audioReady=true;
}
// CRT option: scanline overlay, one band per canvas row (240), period = k whole device px (no moire); off by default, display only.
const SRC=240,crt=$('crt'),cc=$('crtc'),stage=$('stage');let crtOn=false;
try{crtOn=localStorage.getItem('crt')==='1';}catch(e){}
function layout(){
  const dpr=devicePixelRatio,fs=!!document.fullscreenElement,W=innerWidth,H=innerHeight;
  const availH=(fs?Math.min(H,W*3/4):Math.min(H-170,W*.96*3/4))*dpr,k=Math.floor(availH/SRC);
  const ok=k>=2;cc.disabled=!ok;cc.parentNode.title=ok?'Scanlines (C)':'Window too small for CRT scanlines';
  const on=crtOn&&ok;stage.classList.toggle('crt',on);
  for(const e of [cvs,stage])e.style.width=e.style.height='';
  if(!on){crt.style.display='none';return;}
  const h=k*SRC/dpr,w=h*4/3;
  if(fs){cvs.style.width=w+'px';cvs.style.height=h+'px';}else{stage.style.width=w+'px';stage.style.height=h+'px';}
  const p=k/dpr+'px';
  Object.assign(crt.style,{display:'block',left:cvs.offsetLeft+'px',top:cvs.offsetTop+'px',width:w+'px',height:h+'px',
    background:`radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.12)),linear-gradient(transparent 40%,rgba(0,0,0,.33)) 0 0/100% ${p}`});
}
function setCrt(v){crtOn=v;cc.checked=v;try{localStorage.setItem('crt',v?'1':'0');}catch(e){}layout();}
cc.checked=crtOn;cc.onchange=()=>setCrt(cc.checked);
addEventListener('resize',layout);document.addEventListener('fullscreenchange',layout);
matchMedia('(resolution:'+devicePixelRatio+'dppx)').addEventListener('change',layout,{once:true});
layout();
function sync(){$('pp').textContent=playing?'Pause':'Play';}
async function play(){
  if(!started){started=true;$('go').remove();await initAudio().catch(e=>console.error(e));tBase=0;}
  else if(cp){cp.unpause();}
  if(tBase>=dur-0.05){seek(0);}
  playing=true;wall0=now();ac&&ac.resume();sync();
}
function pause(){if(!playing)return;tBase=cur();playing=false;cp&&cp.pause();sync();}
function seek(t){t=Math.max(0,Math.min(dur-0.01,t));tBase=t;wall0=now();cp&&cp.setPos(t);draw(t);}
function toggle(){playing?pause():play();}
$('pp').onclick=toggle;$('go').onclick=()=>play();
$('b10').onclick=()=>seek(cur()-10);$('f10').onclick=()=>seek(cur()+10);
$('fs').onclick=()=>{document.fullscreenElement?document.exitFullscreen():$('stage').requestFullscreen();};
const sk=$('seek');let drag=false;sk.oninput=()=>{drag=true;seek(sk.value/10);};sk.onchange=()=>{drag=false;};
cvs.ondblclick=()=>$('fs').click();
addEventListener('keydown',e=>{const k=e.key;const big=e.shiftKey?10:5;
  if(k===' '){e.preventDefault();toggle();}else if(k==='ArrowLeft'){seek(cur()-big);}else if(k==='ArrowRight'){seek(cur()+big);}
  else if(k==='ArrowUp'||k==='ArrowDown'){const t=cur();const i=SCENES.findIndex(s=>t>=s.t0&&t<s.t1);const j=Math.max(0,Math.min(SCENES.length-1,i+(k==='ArrowUp'?-1:1)));seek(SCENES[j].t0+0.01);}
  else if(k==='Home')seek(0);else if(k==='End')seek(dur-1);else if(k==='f'||k==='F')$('fs').click();
  else if((k==='c'||k==='C')&&!cc.disabled)setCrt(!crtOn);
  else if(k==='m'||k==='M'){muted=!muted;cp&&cp.setVol(muted?0:1);}});
function loop(){const t=cur();if(!drag)sk.value=Math.round(t*10);$('tm').textContent=fmt(t)+' / '+fmt(dur);if(playing)draw(t);requestAnimationFrame(loop);}
await d.load(p=>{$('go').textContent='Loading '+Math.round(p*100)+'%';});
dur=d.xm.length;sk.max=Math.round(dur*10);window.demoReady=true;
if(TEST){$('go').remove();}else{$('go').textContent='Click or press Space to start (sound on)';}
draw(0);loop();
