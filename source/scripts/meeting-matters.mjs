import {pilotAnnotations} from './meeting-pilot.mjs';
import {buildSourceChainMatter} from './meeting-source-chain.mjs';

export function atPointer(record,pointer) {
  return pointer.split('/').slice(1).reduce((v,k)=>v?.[k.replaceAll('~1','/').replaceAll('~0','~')],record);
}

export function buildMatter(raw,records,inputs,{url,hash}) {
  if(raw.pilot_id==='north-plains-blf-source-chain-01')return buildSourceChainMatter(raw,records,{url,hash});
  const m=structuredClone(raw),byId=new Map(records.map(r=>[r.id,r]));
  delete m.public_api_contract;
  m.schema_version='1.0.0';m.profile='source_linked_matter';m.release_status='published_research_collection';
  m.release_record='https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/35';
  m.research_input={public_api_contract:raw.public_api_contract,pilot_id:raw.pilot_id,source_format:'batch02-source-bounded-1.0',reference_convention:raw.reference_convention};
  m.reference_convention='ref-N resolves through source_refs to the exact public-adapted record item and physical-page evidence. Field-level annotations identify relocated cross-document commentary; raw research inputs remain unchanged.';
  m.canonical_url=url('/groundwater-districts/intelligence/matters/'+m.matter_id);
  m.json_url=url('/data/water-watch/v1/matters/'+m.matter_id+'.json');
  const resolve=ref=>{
    const r=byId.get(ref.record_id),item=r&&atPointer(r,ref.json_pointer);
    if(!item||item.id!==ref.item_id||r.meeting.source_document_id!==ref.source_document_id)throw Error('Matter reference mismatch '+ref.id);
    const pages=[...new Set(item.evidence.map(e=>e.page))].sort((a,b)=>a-b);
    if(JSON.stringify(pages)!==JSON.stringify(ref.physical_pages))throw Error('Matter pages mismatch '+ref.id);
    return {...ref,resolved:true,item_label:item.topic||item.label||item.subject||item.name||'Source qualification',source_date:r.meeting.meeting_date,human_url:item.citation_url,record_json_url:r.json_url,source_url:r.meeting.source_url,evidence:item.evidence};
  };
  m.source_refs=m.source_refs.map(resolve);
  // Additional bindings qualify relocated annotations without rewriting the 40 research references.
  m.annotation_source_refs=[
    ['annotation-ref-1','pilot-ntgcd-aqua-resort-6ce018e10a30','/episodes/6','-resort-sites'],
    ['annotation-ref-2','pilot-ntgcd-aqua-resort-c89ef649d5bd','/episodes/9','-resort-recommendation'],
  ].map(([id,record_id,json_pointer,suffix])=>{
    const r=byId.get(record_id),o=atPointer(r,json_pointer);
    return resolve({id,record_id,item_id:record_id+suffix,json_pointer,source_document_id:r.meeting.source_document_id,physical_pages:[...new Set(o.evidence.map(e=>e.page))].sort((a,b)=>a-b)});
  });
  const refs=new Map([...m.source_refs,...m.annotation_source_refs].map(r=>[r.id,r]));
  const item=id=>{const ref=refs.get(id);if(!ref)throw Error('Unknown matter ref '+id);return atPointer(byId.get(ref.record_id),ref.json_pointer);};
  function check(value) {
    if(Array.isArray(value)){value.forEach(check);return;}
    if(!value||typeof value!=='object')return;
    for(const [k,v] of Object.entries(value)) {
      if(k==='ref')item(v);
      else if(k==='refs'||k==='official_source_refs')v.forEach(item);
      else check(v);
    }
  }
  check(m);
  m.headline_quantities=m.quantity_roles.map(q=>{
    const ids=q.refs||[q.ref],values=ids.map(item);
    const first=values[0];
    if(values.some(v=>JSON.stringify([v.value,v.unit,v.time_basis])!==JSON.stringify([first.value,first.unit,first.time_basis])))throw Error('Repeated quantity differs; do not collapse');
    return {role:q.role,value:first.value,unit:first.unit,time_basis:first.time_basis,source_role:first.role,refs:ids,aggregation:'Repeated appearances are not summed.'};
  });
  m.technical_items=['ref-25','ref-26','ref-27','ref-39','ref-24','ref-40'].map(ref=>{
    const o=item(ref);return {ref,topic:o.topic||o.subject||'Source qualification',statement:o.statement||o.description||o.interpretation||null,...('value' in o?{value:o.value,unit:o.unit,time_basis:o.time_basis,model:o.model??null,observed:o.observed??null}:{} )};
  });
  m.annotations=inputs.flatMap(pilotAnnotations);
  check(m.annotations);
  m.source_documents=m.source_record_ids.map(id=>{const r=byId.get(id);if(!r)throw Error('Missing matter source');return {record_id:id,document_label:r.dates.document_label,date_role:r.dates.date_role,meeting_date:r.meeting.meeting_date,approved_date:r.meeting.approved_date,source_document_id:r.meeting.source_document_id,pages:r.meeting.page_count,human_url:r.canonical_url,json_url:r.json_url,source_acquired_at:r.provenance.reported.source_acquired_at,source_checked_at:r.provenance.reported.source_checked_at,source_check_basis:r.provenance.reported.source_check_basis};});
  m.fact_links=m.baseline_comparison.map(c=>({fact_id:c.fact_id,event_id:c.fact_id==='gcd-intelligence-v1-0015'?'event-4':'event-2',interpretation:'Requested additional annual production. See source-linked matter chronology for the board actions.',basis:'Context from the new source reading; original discovery payload and broad classification unchanged.',refs:c.official_source_refs}));
  m.content_version=hash(m);
  return m;
}

export const matterSchema={
  $schema:'https://json-schema.org/draft/2020-12/schema',title:'Water Watch source-linked matter v1',type:'object',
  required:['schema_version','profile','matter_id','source_record_ids','events','connections','source_refs','fact_links'],
  allOf:[{if:{required:['matter_kind'],properties:{matter_kind:{const:'source_chain'}}},then:{required:['conclusions','missing_instruments','research_input','new_source_record_ids','unchanged_context_record_ids']},else:{required:['quantity_roles','headline_quantities','latest_evidenced_state','unresolved','baseline_comparison','annotations']}}],
  properties:{schema_version:{const:'1.0.0'},profile:{const:'source_linked_matter'},matter_id:{type:'string'},source_record_ids:{type:'array',items:{type:'string'}},events:{type:'array',items:{type:'object',required:['id','event_date','date_role','title','statement','refs']}},source_refs:{type:'array',items:{type:'object',required:['id','record_id','item_id','json_pointer','source_document_id','physical_pages','evidence','human_url','record_json_url','resolved'],properties:{resolved:{const:true},physical_pages:{type:'array',items:{type:'integer',minimum:1}}}}},
  },
  description:'Additive referential view, separate from source records and candidate leads. Source references resolve exact public items, including older typed IDs. physical_pages is empty for native sources; their evidence uses native_locator with the retained map URL, block ID and exact supporting text, never invented PDF pages or official fragments. source_chain matters retain scoped conclusions and missing instruments; the earlier quantity-led matter retains its own headlines and annotations. Events preserve dates and procedural roles, not present legal status. Research inputs remain unchanged. No global entity index is needed.'
};
