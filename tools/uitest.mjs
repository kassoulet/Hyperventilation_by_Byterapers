// UI smoke test: start playback, check time advances, pause holds, seek jumps (headless Chrome, CDP)
import {spawn} from 'child_process';import fs from 'fs';import http from 'http';import path from 'path';import {fileURLToPath} from 'url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'../web');
const srv=http.createServer((q,r)=>{let p=path.join(root,q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}const m={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};r.writeHead(200,{'content-type':m[path.extname(p)]||'application/octet-stream'});r.end(d);});}).listen(0);
const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--autoplay-policy=no-user-gesture-required','--remote-debugging-port=9336','about:blank'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,2000));
const tabs=await (await fetch('http://localhost:9336/json')).json();const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id])pend[d.id](d);if(d.method==='Runtime.exceptionThrown')console.log('EXC',JSON.stringify(d.params.exceptionDetails).slice(0,300));};
const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true})).result.result.value;
await send('Runtime.enable');await send('Page.navigate',{url:`http://localhost:${srv.address().port}/index.html`});
for(let i=0;i<300&&!(await ev('window.demoReady===true'));i++)await new Promise(r=>setTimeout(r,200));
const sl=()=>ev('document.getElementById("tm").textContent');
await ev('document.getElementById("pp").click()');await new Promise(r=>setTimeout(r,3000));console.log('after 3s play:',await sl());
await ev('document.getElementById("pp").click()');const a=await sl();await new Promise(r=>setTimeout(r,1500));console.log('paused holds:',a,await sl());
await ev('(()=>{const s=document.getElementById("seek");s.value=1000;s.dispatchEvent(new Event("input"));})()');await new Promise(r=>setTimeout(r,500));console.log('seek to 100s:',await sl());
await ev('document.getElementById("pp").click()');await new Promise(r=>setTimeout(r,2000));console.log('play from seek:',await sl());
ch.kill();srv.close();process.exit(0);
