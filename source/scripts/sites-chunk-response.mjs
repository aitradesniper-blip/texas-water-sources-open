// Embedded in the deployed Worker. Never buffer the complete logical download.
export async function chunkResponse(request, env, entry, cors) {
  const headers = new Headers({...cors, 'Content-Type':entry.mime,
    'Content-Length':String(entry.bytes), ETag:`"sha256-${entry.sha256}"`,
    'Cache-Control':'public, max-age=0, must-revalidate'});
  if(request.headers.get('If-None-Match')?.split(',').some(v=>v.trim().replace(/^W\//,'')===headers.get('ETag')||v.trim()==='*')) {
    headers.delete('Content-Length'); return new Response(null,{status:304,headers});
  }
  if(request.method==='HEAD')return new Response(null,{headers});
  const internal=(chunk,method)=>new Request(new URL(chunk.path,request.url),{method});
  const unavailable=error=>{console.error('Water Watch chunk unavailable',entry.pathname,String(error));return new Response('Current data download unavailable',{status:503,headers:{...cors,'Cache-Control':'no-store'}});};
  // Detect a missing/non-200 chunk before committing the public 200 headers.
  // Immutable build assets cannot legitimately change after this preflight.
  let response;
  try {
    for(const chunk of entry.chunks) {
      const head=await env.ASSETS.fetch(internal(chunk,'HEAD'));
      if(head.status!==200 || (head.headers.has('Content-Length')&&Number(head.headers.get('Content-Length'))!==chunk.bytes))throw Error('Missing or wrong-size chunk');
    }
    response=await env.ASSETS.fetch(internal(entry.chunks[0],'GET'));
    if(response.status!==200||!response.body)throw Error('First chunk fetch failed');
  } catch(error){return unavailable(error);}
  let index=0, reader=response.body.getReader(), seen=0, cancelled=false;
  const stream=new ReadableStream({
    async pull(controller) {
      try {
        const next=await reader.read();
        if(cancelled)return;
        if(!next.done){seen+=next.value.byteLength;if(seen>entry.chunks[index].bytes)throw Error('Oversized chunk');controller.enqueue(next.value);return;}
        reader.releaseLock();
        if(seen!==entry.chunks[index].bytes)throw Error('Truncated chunk');
        index++;seen=0;
        if(index===entry.chunks.length){controller.close();return;}
        const res=await env.ASSETS.fetch(internal(entry.chunks[index],'GET'));
        if(res.status!==200||!res.body)throw Error('Later chunk fetch failed');
        if(cancelled){await res.body.cancel();return;}
        reader=res.body.getReader();
        // No enqueue on the boundary: the next pull reads the next chunk.
        return this.pull(controller);
      } catch(error){console.error('Water Watch stream aborted',entry.pathname,String(error));controller.error(error);try{await reader.cancel(error);}catch{ /* Already released. */ }}
    },
    async cancel(reason){cancelled=true;try{await reader.cancel(reason);}catch{ /* Already released. */ }}
  },{highWaterMark:0});
  return new Response(stream,{headers});
}
