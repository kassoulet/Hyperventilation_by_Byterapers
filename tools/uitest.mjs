// UI test (headless Chrome, CDP): play advances, pause holds, seek jumps, seek back/forth gives identical pixels, Right key with slider focused. Exit code 1 on failure.
import {spawn} from 'child_process';import fs from 'fs';import http from 'http';import path from 'path';import {fileURLToPath} from 'url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'../web');
const srv=http.createServer((q,r)=>{let p=path.join(root,q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}const m={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};r.writeHead(200,{'content-type':m[path.extname(p)]||'application/octet-stream'});r.end(d);});}).listen(0);
const PORT=9300+Math.floor(Math.random()*500);
const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--autoplay-policy=no-user-gesture-required','--remote-debugging-port='+PORT,'about:blank'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,2000));
const tabs=await (await fetch('http://localhost:'+PORT+'/json')).json();const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id])pend[d.id](d);if(d.method==='Runtime.exceptionThrown')console.log('EXC',JSON.stringify(d.params.exceptionDetails).slice(0,300));};
const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true})).result.result.value;
await send('Runtime.enable');await send('Page.navigate',{url:`http://localhost:${srv.address().port}/index.html`});
for(let i=0;i<300&&!(await ev('window.demoReady===true'));i++)await new Promise(r=>setTimeout(r,200));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0;const ok=(c,m)=>{console.log(c?'ok  ':'FAIL',m);if(!c)bad++;};
const cur=()=>ev('+document.getElementById("seek").value/10');
const click=id=>ev(`document.getElementById("${id}").click()`);
const seek=async s=>{await ev(`(()=>{const e=document.getElementById("seek");e.value=${s*10};e.dispatchEvent(new Event("input"));})()`);await wait(400);};
const hash=()=>ev(`(()=>{const c=document.querySelector("canvas"),d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i++)h=(h*31+d[i])|0;return h;})()`);
try{
await click('pp');await wait(3000);const a=await cur();ok(a>2&&a<4.5,'play advances: '+a);
await click('pp');const p0=await cur();await wait(1500);ok(await cur()===p0,'pause holds: '+p0);
await seek(100);ok(Math.abs(await cur()-100)<0.5,'seek to 100 s: '+await cur());
await seek(30);const h1=await hash();await seek(150);await seek(30);ok(h1===await hash(),'seek back/forth: identical pixels');
await ev('document.getElementById("seek").focus()');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await wait(400);
ok(Math.abs(await cur()-35)<1,'Right with slider focused = +5 s: '+await cur());
await click('pp');const q=await cur();await wait(2000);ok(await cur()>q+1,'play from seek');
}catch(e){console.log('FAIL',e);bad++;}
ch.kill();srv.close();process.exit(bad?1:0);
