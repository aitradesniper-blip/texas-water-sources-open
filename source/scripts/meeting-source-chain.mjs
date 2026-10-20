import {atPointer} from './meeting-matters.mjs';
export function resolveChainReference(ref,records) {
  const r=records.find(r=>r.id===ref.record_id),item=r&&atPointer(r,ref.json_pointer);
  const typedKeys=['id','procedural_action_id','observation_id','episode_id','entity_local_id','relationship_id','unresolved_id'];
  if(!item||!typedKeys.some(k=>item[k]===ref.item_id)||r.meeting.source_document_id!=='sha256:'+ref.source_sha256)throw Error('Source-chain item/identity mismatch '+ref.reference_id);
  const evidence=ref.evidence.map(e=>{
    const match=item.evidence.find(x=>x.source_document_id===e.source_document_id&&(e.native_locator?
      x.native_locator?.map_path===e.native_locator.map_path&&x.native_locator?.block_id===e.native_locator.block_id&&x.native_locator?.supporting_text===e.native_locator.supporting_text:x.page===e.page));
    if(!match)throw Error('Source-chain evidence mismatch '+ref.reference_id);
    return structuredClone(match);
  });
  return {id:ref.reference_id,record_id:r.id,record_role:ref.record_role,item_id:ref.item_id,json_pointer:ref.json_pointer,source_document_id:r.meeting.source_document_id,physical_pages:[...new Set(evidence.filter(e=>Number.isInteger(e.page)).map(e=>e.page))].sort((a,b)=>a-b),evidence,resolved:true,item_label:item.topic||item.label||item.subject||item.name||item.action_type||item.observation_type||'Source qualification',source_date:r.dates.source_date,document_label:r.dates.document_label,date_role:r.dates.date_role,issuer:r.issuer||r.meeting.district_name,human_url:item.citation_url,record_json_url:r.json_url,source_url:r.meeting.source_url};
}
export function buildSourceChainMatter(raw,records,{url,hash}) {
  const source_refs=raw.references.map(ref=>resolveChainReference(ref,records)),known=new Set(source_refs.map(r=>r.id));
  if(known.size!==65)throw Error('Expected 65 unique supplied source-chain references');
  for(const o of [...raw.events,...raw.connections,...raw.conclusions,...raw.missing_instruments])for(const id of o.source_refs)if(!known.has(id))throw Error('Unknown source-chain reference '+id);
  const source_record_ids=[...raw.new_source_record_ids,...raw.unchanged_context_record_ids];
  const m={schema_version:'1.0.0',profile:'source_linked_matter',matter_kind:'source_chain',matter_id:raw.candidate_id,pilot_id:raw.pilot_id,title:'North Plains / BLF: assessments, litigation and compliance',district_id:'north_plains_gcd',release_status:'published_research_collection',release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/38',
    research_input:{schema_version:raw.schema_version,public_api_contract:raw.public_api_contract,pilot_id:raw.pilot_id,state:raw.state},scope_note:raw.scope_note,
    canonical_url:url('/groundwater-districts/intelligence/matters/'+raw.candidate_id),json_url:url('/data/water-watch/v1/matters/'+raw.candidate_id+'.json'),
    source_record_ids,new_source_record_ids:raw.new_source_record_ids,unchanged_context_record_ids:raw.unchanged_context_record_ids,
    events:raw.events.map(e=>({...e,event_date:e.date,title:e.track.replaceAll('_',' '),refs:e.source_refs})),
    connections:raw.connections,conclusions:raw.conclusions,missing_instruments:raw.missing_instruments,source_refs,
    fact_links:[],
    source_documents:source_record_ids.map(id=>{const r=records.find(r=>r.id===id);return {record_id:id,record_role:raw.new_source_record_ids.includes(id)?'new_complete_reading':'unchanged_accepted_context',issuer:r.issuer||r.meeting.district_name,document_label:r.dates.document_label,date_role:r.dates.date_role,source_date:r.dates.source_date,meeting_date:r.meeting.meeting_date,approved_date:r.meeting.approved_date,source_document_id:r.meeting.source_document_id,pages:r.meeting.page_count,media_type:r.meeting.source_media_type||'application/pdf',human_url:r.canonical_url,json_url:r.json_url};}),
    limitations:['Evidence-scoped research, not a current case outcome, aggregate liability calculation or compliance determination.','Court dispositions, assessments, production years, plugging and reporting are separate unless cited instruments connect them.','Three candidate connections remain tentative. Missing instruments were not reacquired.','Source-check times are retained acquisition observations; this import adds no source freshness.'],
  };
  m.content_version=hash(m);return m;
}
