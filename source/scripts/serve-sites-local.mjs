// Local verification harness for the exact generated Worker; not a production server.
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {Readable} from 'node:stream';
import worker from '../dist/server/index.js';
const root=resolve('dist/client'),port=Number(process.env.PORT||3012);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jsonl':'application/x-ndjson; charset=utf-8','.svg':'image/svg+xml'};
const env={ASSETS:{async fetch(request){
 const path=resolve(root,'.'+decodeURIComponent(new URL(request.url).pathname));
 if(!path.startsWith(root+sep))return new Response('Not found',{status:404});
 const info=await stat(path).catch(()=>null);if(!info?.isFile())return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:Readable.toWeb(createReadStream(path,{highWaterMark:65536})),{headers:{'Content-Type':types[extname(path)]||'application/octet-stream','Content-Length':String(info.size)}});
}}};
createServer(async(req,res)=>{
 try {
  const response=await worker.fetch(new Request(`http://127.0.0.1:${port}${req.url}`,{method:req.method,headers:req.headers}),env);
  res.writeHead(response.status,Object.fromEntries(response.headers));
  if(response.body){const stream=Readable.fromWeb(response.body);res.on('close',()=>stream.destroy());stream.on('error',e=>res.destroy(e));stream.pipe(res);}else res.end();
 }catch(error){if(!res.headersSent)res.writeHead(503);res.end('Local Worker unavailable');console.error(error);}
}).listen(port,'127.0.0.1',()=>console.log(`Packaged Sites Worker with local ASSETS: http://127.0.0.1:${port}`));
