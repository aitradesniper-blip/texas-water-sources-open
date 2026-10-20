import { cp, mkdir, readFile, rename, rm, writeFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "out");
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "server"), { recursive: true });
await cp(output, resolve(dist, "client"), { recursive: true });
// Sites serves matching static assets before invoking this handler. Keep the
// public /data URLs routed through it so MIME/CORS headers apply consistently.
await rename(resolve(dist, "client/data"), resolve(dist, "client/_tws-data"));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const chunkMax=4*1024*1024, limit=25*1024*1024;
const contentVersion=JSON.parse(await readFile(resolve(root,'public/data/water-watch/v1/index.json'),'utf8')).content_version;
const manifest={version:1,chunk_max_bytes:chunkMax,endpoints:[]};
for(const name of ['entity-mentions.json','meetings.jsonl','meetings/index.json']) {
  const source='public/data/water-watch/v1/'+name;
  const raw=await readFile(resolve(root,source));
  const bytes=name.endsWith('.jsonl')?raw:Buffer.from(JSON.stringify(JSON.parse(raw.toString('utf8')))+'\n');
  const digest=hash(bytes), chunks=[];
  for(let offset=0;offset<bytes.length;offset+=chunkMax) {
    const part=bytes.subarray(offset,offset+chunkMax);
    const path=`/_tws-chunks/water-watch/${contentVersion}/${digest}/${String(chunks.length).padStart(3,'0')}.part`;
    const destination=resolve(dist,'client'+path);await mkdir(dirname(destination),{recursive:true});await writeFile(destination,part);
    chunks.push({path,bytes:part.length,sha256:hash(part)});
  }
  manifest.endpoints.push({pathname:'/data/water-watch/v1/'+name,content_version:contentVersion,source,mime:name.endsWith('.jsonl')?'application/x-ndjson; charset=utf-8':'application/json; charset=utf-8',bytes:bytes.length,sha256:digest,chunks});
  await rm(resolve(dist,'client/_tws-data/water-watch/v1/'+name));
}
await writeFile(resolve(dist,'chunk-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const chunkRuntime=(await readFile(resolve(root,'scripts/sites-chunk-response.mjs'),'utf8')).replace('export async function','async function');

const worker = `${chunkRuntime}\nconst chunkManifest = ${JSON.stringify(manifest)};\nconst worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/_tws-chunks/')) return new Response('Not found', {status:404});
    const publicData = url.pathname.startsWith("/data/") && /\\.jsonl?$/.test(url.pathname);
    const dataHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    };
    if (request.method === "OPTIONS" && publicData) {
      return new Response(null, { status: 204, headers: dataHeaders });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const canonicalOrigin = "https://texaswatersources.com";
    if (
      url.hostname === "www.texaswatersources.com" ||
      (url.hostname === "texaswatersources.com" && url.protocol !== "https:")
    ) {
      return Response.redirect(canonicalOrigin + url.pathname + url.search, 308);
    }

    const supersededMeetingRecordPaths = new Set([
      "/groundwater-districts/meeting-records",
      "/groundwater-districts/meeting-records/",
      "/groundwater-districts/meeting-records.html",
    ]);
    if (supersededMeetingRecordPaths.has(url.pathname)) {
      return Response.redirect(canonicalOrigin + "/groundwater-districts/intelligence" + url.search, 308);
    }

    if (!env?.ASSETS?.fetch) return new Response("Static assets unavailable", { status: 503 });
    const entry = chunkManifest.endpoints.find(e=>e.pathname===url.pathname);
    if (entry) return chunkResponse(request,env,entry,dataHeaders);
    const hasExtension = /\\.[A-Za-z0-9]+$/.test(url.pathname);
    const pathname = url.pathname.startsWith("/data/") ? "/_tws-data/" + url.pathname.slice(6) : url.pathname === "/" ? "/index.html" : hasExtension ? url.pathname : url.pathname + ".html";
    const assetUrl = new URL(pathname, url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (!publicData) return response;
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(dataHeaders)) headers.set(name, value);
    if (response.ok) {
      headers.set("Content-Type", url.pathname.endsWith(".jsonl") ? "application/x-ndjson; charset=utf-8" : "application/json; charset=utf-8");
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
export default worker;
`;

await writeFile(resolve(dist, "server", "index.js"), worker, { encoding: "utf8" });
const assets=[];
async function scan(directory){for(const name of await readdir(directory)){const path=resolve(directory,name),info=await stat(path);if(info.isDirectory())await scan(path);else assets.push({path:path.slice(dist.length+1).replaceAll('\\','/'),bytes:info.size});}}
await scan(resolve(dist,'client'));assets.sort((a,b)=>b.bytes-a.bytes);
await writeFile(resolve(dist,'static-size-report.json'),JSON.stringify({limit_bytes:limit,largest:assets[0],over_8MB:assets.filter(a=>a.bytes>8000000)},null,2)+'\n');
if(assets.some(a=>a.bytes>limit))throw Error('Sites static asset limit exceeded: '+JSON.stringify(assets.filter(a=>a.bytes>limit)));
console.log('Chunked '+manifest.endpoints.length+' stable data endpoints; largest static asset '+assets[0].path+' ('+assets[0].bytes+' bytes).');
