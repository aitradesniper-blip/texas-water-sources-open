// Additive native branch; PDF evidence continues to require physical pages.
const s={type:'string'};
export const nativeLocatorSchema={type:'object',additionalProperties:false,required:['map_path','block_id','supporting_text','map_url'],properties:{map_path:s,block_id:s,supporting_text:{type:'string',minLength:1},map_url:s}};
export const nativeEvidenceProperties={source_document_id:s,source_url:s,native_locator:nativeLocatorSchema,evidence_method:{const:'NATIVE_BLOCK_REFERENCE'},claim_url:s,object_id:s,json_pointer:s};
export const nativeEvidenceSchema={type:'object',additionalProperties:false,required:Object.keys(nativeEvidenceProperties),properties:nativeEvidenceProperties};
export function checkNativeEvidence(e,map) {
  const l=e.native_locator;
  if(!map||!l||'page' in e||'page_basis' in e||e.source_document_id!=='sha256:'+map.source_sha256||e.source_url!==map.source_url||l.map_path!==map.map_path||(l.map_url&&l.map_url!==map.map_url))throw Error('Native source/map binding mismatch');
  const block=map.blocks.find(b=>b.block_id===l.block_id);
  if(!block||!l.supporting_text||!block.text.includes(l.supporting_text))throw Error('Native block/supporting text mismatch');
  return block;
}
export function projectNativeEvidence(e,map,links) {
  checkNativeEvidence(e,map);
  if(Object.keys(e).some(k=>!['source_document_id','source_url','native_locator'].includes(k))||Object.keys(e.native_locator).some(k=>!['map_path','block_id','supporting_text'].includes(k)))throw Error('Unexpected input native evidence field');
  return {...e,native_locator:{...e.native_locator,map_url:map.map_url},evidence_method:'NATIVE_BLOCK_REFERENCE',...links};
}
