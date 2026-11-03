// usage: node tools/shot.mjs OUTDIR t1 t2 t3 ...   (renders the port at those times in headless Chrome and writes t<time>.png, 320x240)
// serves ../web via a tiny static server, drives window.demo.renderAt(t) through CDP.
import {spawn} from 'child_process';import fs from 'fs';import http from 'http';import path from 'path';import {fileURLToPath} from 'url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.join(here,'../web');
const out='/tmp/dbgout';
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.3ds':'application/octet-stream','.xm':'application/octet-stream','.css':'text/css'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':mime[path.extname(p)]||'application/octet-stream'});r.end(d);});}).listen(0);
const port=srv.address().port;
const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=9334','--window-size=800,700','about:blank'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,2000));
const tabs=await (await fetch('http://localhost:9334/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id])pend[d.id](d)};
const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
await send('Page.enable');await send('Runtime.enable');
ws.addEventListener('message',m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.consoleAPICalled')console.log('[page]',d.params.args.map(a=>a.value).join(' '));if(d.method==='Runtime.exceptionThrown')console.log('[exception]',JSON.stringify(d.params.exceptionDetails).slice(0,600));});
await send('Page.navigate',{url:`http://localhost:${port}/index.html?test=1`});
for(let i=0;i<300;i++){const r=await send('Runtime.evaluate',{expression:'window.demoReady===true',returnByValue:true});if(r.result.result.value)break;await new Promise(r=>setTimeout(r,200));}
const r=await send('Runtime.evaluate',{expression:process.argv[3],returnByValue:true});console.log(JSON.stringify(r.result.result.value||r.result));ch.kill();srv.close();process.exit(0);