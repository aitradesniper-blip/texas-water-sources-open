// A plain HTTP consumer: no filesystem dataset access, credentials or model calls.
import { filterMeetingRecords as filterMeetings, matchingItems as matchingMatters } from '../lib/meeting-search.mjs';
import {checkNativeEvidence} from './meeting-native-evidence.mjs';
const [entry = 'http://127.0.0.1:3000/data/water-watch/v1/index.json', query = 'Aqua Texas', ...options] = process.argv.slice(2);
const option=name=>options.find(s=>s.startsWith(name+'='))?.slice(name.length+1)||'';
const filters={q:query,from:option('--from'),to:option('--to'),dates:option('--dates')};
const origin = new URL(entry).origin;
const fetched=[];
async function get(url) {
  const resolved = new URL(url); resolved.host = new URL(origin).host; resolved.protocol = new URL(origin).protocol;
  const response = await fetch(resolved);
  if (!response.ok || !response.headers.get('content-type')?.includes('json')) throw Error(`Not JSON: ${resolved} (${response.status})`);
  const body=await response.text();
  fetched.push({url:resolved.href,body_bytes:Buffer.byteLength(body)});
  return JSON.parse(body);
}
const catalog = await get(entry);
if(query==='--matter') {
  if(!catalog.links.matters)throw Error('Catalog has no matter collection');
  const index=await get(catalog.links.matters), wanted=options[0];
  const entry=index.matters.find(m=>m.matter_id===wanted);
  if(!entry)throw Error('Matter not found: '+wanted);
  const matter=await get(entry.json_url);
  if(matter.matter_id!==wanted||matter.profile!=='source_linked_matter'||matter.source_refs.some(r=>!r.resolved))throw Error('Invalid matter projection');
  console.log(JSON.stringify({lookup:'catalog_discovered_matter',global_mention_index_fetched:fetched.some(r=>new URL(r.url).pathname===new URL(catalog.links.entity_mentions).pathname),fetched,total_body_bytes:fetched.reduce((n,r)=>n+r.body_bytes,0),matter},null,2));
} else if (query === '--coverage-gap') {
  const coverage=await get(catalog.links.districts);
  const district = coverage.districts.find(d=>d.layers.meetings.count===0);
  console.log(JSON.stringify(district?{district:district.district_name,coverage:'no_records_in_collection',meaning:district.coverage_note}:{district:null,coverage:'no_uncovered_directory_identities',meaning:`At least one full-document Meeting Intelligence source is represented for all ${coverage.districts.length} identities in the current district directory. Historical depth and recency vary by district; this is not complete or current meeting history.`},null,2));
} else {
  const [index,mentionIndex,leadIndex] = await Promise.all([get(catalog.links.meetings),get(catalog.links.entity_mentions),get(catalog.links.research_leads)]);
  const normalize=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const matches=s=>normalize(query).split(/\s+/).every(t=>normalize(s).includes(t));
  const mentions=mentionIndex.occurrences.filter(o=>matches(o.as_stated));
  const hits=filterMeetings(index.records,filters);
  const output=[];
  const nativeResolutions=[],mapCache=new Map();
  const mapIndex=catalog.links.native_locations?await get(catalog.links.native_locations):{maps:[]};
  async function resolveNative(value,path) {
    if(Array.isArray(value)){for(let i=0;i<value.length;i++)await resolveNative(value[i],path+'/'+i);return;}
    if(!value||typeof value!=='object')return;
    // Date references carry locations but the enclosing item carries source identity.
    if(value.native_locator&&value.source_document_id){
      const listed=mapIndex.maps.find(m=>m.map_url===value.native_locator.map_url);
      if(!listed)throw Error('Native map not advertised by catalog');
      if(!mapCache.has(listed.map_url))mapCache.set(listed.map_url,await get(listed.map_url));
      const map=mapCache.get(listed.map_url);
      if(map.original_map_sha256!==listed.original_map_sha256||map.source_sha256!==listed.source_sha256)throw Error('Native map index identity mismatch');
      const block=checkNativeEvidence(value,map);
      nativeResolutions.push({path,record_id:map.record_id,source_document_id:value.source_document_id,source_url:value.source_url,block_id:block.block_id,map_url:map.map_url,original_map_sha256:map.original_map_sha256,supporting_text:value.native_locator.supporting_text,normalized_block_text:block.text,claim_url:value.claim_url,json_pointer:value.json_pointer,resolved:true});
    }
    for(const [key,v] of Object.entries(value))await resolveNative(v,path+'/'+key);
  }
  for(const hit of hits) {
    const r=await get(hit.json_url);
    await resolveNative(r,'records/'+r.id);
    let items;
    if(r.record_format==='r3') {
      const matchingEntities=r.entities.filter(e=>matches(e.name_as_stated)).map(e=>e.entity_local_id);
      items=[...r.observations,...r.procedural_actions].filter(o=>o.entity_ids.some(id=>matchingEntities.includes(id)) || matches(JSON.stringify(o.value || o.motion_summary || '')));
    } else if(['batch02','source_bounded'].includes(r.record_format)) {
      items=[...r.entities,...r.water_objects,...r.episodes,...r.quantities,...r.relationships,...r.unresolved,...r.unavailable_references].filter(o=>matches(JSON.stringify([Object.fromEntries(Object.entries(o).filter(([k])=>!['id','evidence','json_pointer','citation_url'].includes(k))),...(o.evidence||[]).flatMap(e=>e.native_locator?[e.native_locator.supporting_text]:[])])));
      items.push(...r.tables.flatMap(t=>t.rows.flatMap((cells,i)=>matches(JSON.stringify([t.name,t.columns,cells]))?[{table_id:t.id,table_name:t.name,columns:t.columns,cells,stage:t.stage,notes:t.notes,...t.row_navigation[i],evidence:t.evidence}]:[])));
    } else throw Error('Unsupported record_format '+r.record_format);
    const matchingItems=matchingMatters(hit,query,filters);
    if((hit.dateRole==='multi_meeting_compilation'||filters.dates==='items')&&(filters.from||filters.to))items=items.filter(o=>matchingItems.some(m=>m.id===o.id));
    output.push({record_id:r.id,record_format:r.record_format,district:r.meeting.district_name,dates:r.dates,matching_items:matchingItems,...(r.meeting.date_candidates?{contextual_dates:r.meeting.date_candidates}:{}),record_url:r.canonical_url,items,limitations:r.record_format==='r3'?r.meeting.source_completeness:{read_completeness:r.provenance.reported.read_completeness,page_review:r.provenance.reported.page_review,native_review:r.provenance.reported.native_review,missing_dependencies:r.provenance.reported.missing_dependencies,dependency_note:r.provenance.reported.dependency_note,readability_limits:r.provenance.reported.readability_limits,acquired_at:r.provenance.reported.acquired_at,acquisition_metadata_basis:r.provenance.reported.acquisition_metadata_basis,unresolved:r.unresolved,unavailable_references:r.unavailable_references},partial_pages:r.partial_pages});
  }
  const leads=leadIndex.leads.filter(l=>matches([l.label,...l.occurrences.flatMap(o=>[o.statement||'',...(o.names_or_identifiers||[])])].join(' ')));
  const matchingMentions=mentions.filter(m=>(!filters.from||m.date&&m.date>=filters.from)&&(!filters.to||m.date&&m.date<=filters.to));
  await resolveNative(matchingMentions,'mentions');await resolveNative(leads,'candidate_research_leads');
  console.log(JSON.stringify({query,filters,coverage:catalog.coverage,identity_policy:mentionIndex.identity_policy,mentions:matchingMentions,records:output,candidate_research_leads:leads,native_evidence_resolutions:nativeResolutions},null,2));
}
