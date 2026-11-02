// usage: node tools/perf.mjs  -> ms per frame for several times (headless Chrome)
import {spawn} from 'child_process';import fs from 'fs';import http from 'http';import path from 'path';import {fileURLToPath} from 'url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'../web');
const srv=http.createServer((q,r)=>{let p=path.join(root,q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}const m={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};r.writeHead(200,{'content-type':m[path.extname(p)]||'application/octet-stream'});r.end(d);});}).listen(0);
const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=9335','about:blank'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,2000));
const tabs=await (await fetch('http://localhost:9335/json')).json();const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id])pend[d.id](d)};
const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
await send('Page.navigate',{url:`http://localhost:${srv.address().port}/index.html?test=1`});
for(let i=0;i<300;i++){const r=await send('Runtime.evaluate',{expression:'window.demoReady===true',returnByValue:true});if(r.result.result.value)break;await new Promise(r=>setTimeout(r,200));}
const r=await send('Runtime.evaluate',{expression:`(()=>{const o=[];for(const t of [5,20,35,47,62,75,90,105,135,150,165,178]){const a=performance.now();for(let i=0;i<5;i++)window.demo.renderAt(t+i*0.1);o.push(t+':'+((performance.now()-a)/5).toFixed(1)+'ms');}return o.join(' ');})()`,returnByValue:true});
console.log(r.result.result.value);ch.kill();srv.close();process.exit(0);
