import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import { adaptBatch02, batch02Definitions, batch02Profile, batch02Search } from './meeting-batch02.mjs';
import { buildEntityMentions, resolveResearchLeads, mentionDefinitions } from './meeting-mentions.mjs';
import { documentDateCounts } from '../lib/meeting-date-context.mjs';
import { buildMatter, matterSchema } from './meeting-matters.mjs';
import {applyWatch01Update} from './meeting-watch01-update.mjs';
import {applyInfill01Update} from './meeting-infill01-update.mjs';
import {buildDistrictCoverage} from './coverage-status.mjs';

const read = p => JSON.parse(readFileSync(p, 'utf8'));
const write = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const base = process.env.TWS_DATA_BASE_URL || 'https://texaswatersources.com';
if (!/^https:\/\/[^/]+$|^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base)) throw Error('Invalid data base URL');
const url = p => base + p;
const root = 'public/data/water-watch/v1';
mkdirSync(root + '/meetings', { recursive: true });
const ajv = new Ajv2020({ strict: false, allErrors: true });
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat('uri', /^https?:\/\//);
const inputSchema = read('data/meeting-intelligence/input.schema.json');
const validateInput = ajv.compile(inputSchema);
const schema = structuredClone(inputSchema);
schema.$id = url('/data/water-watch/v1/schema.json');
schema.properties.schema_version = { const: '1.0.0' };
schema.properties.record_state = { const: 'release_candidate' };
const string = { type: 'string' }, nullable = { type: ['string', 'null'] };
Object.assign(schema.properties, {
  id: string, canonical_url: string, json_url: string, content_version: string, document_type: { const: 'meeting_record' }, record_format:{const:'r3'},
  publisher: { const: 'Texas Water Sources' }, collection_role: { const: 'source_linked_research_not_official_registry' },
  dates: { type: 'object', properties: { source_date: string, source_date_basis: string, routing_date: nullable, extraction_date: nullable, last_source_check: nullable, publication_date: nullable,document_label:string,date_role:{enum:['recorded_meeting_date','scheduled_date','document_date']},date_note:nullable }, required: ['source_date','source_date_basis','routing_date','extraction_date','last_source_check','publication_date','document_label','date_role','date_note'], additionalProperties: false },
  provenance: { type: 'object', properties: { source_schema: string, source_record_state: string, human_reviewed: { const: false }, original_public_release_authorized: { const: false }, review_scope: string }, required: ['source_schema','source_record_state','human_reviewed','original_public_release_authorized','review_scope'], additionalProperties: false },
  partial_pages: { type: 'array', items: { type: 'integer', minimum: 1 } }, correction_notes: { type: 'array', items: string },
});
schema.required.push('id','canonical_url','json_url','content_version','document_type','record_format','publisher','collection_role','dates','provenance','partial_pages','correction_notes');
for (const def of ['meeting','entity','agenda','episode','observation','action','relationship','unresolved','summary']) {
  const d = schema.$defs[def];
  Object.assign(d.properties, { original_id: string, citation_url: string, json_pointer: string });
  d.required.push('original_id','citation_url','json_pointer');
}
for (const e of schema.$defs.evidence.oneOf) {
  Object.assign(e.properties, { source_url: string, claim_url: string, object_id: string, json_pointer: string });
  e.required.push('source_url','claim_url','object_id','json_pointer');
}
delete schema.$defs.summary.properties.public_release_authorized;
delete schema.$defs.summary.properties.human_reviewed;
schema.$defs.summary.required = schema.$defs.summary.required.filter(k => !['public_release_authorized','human_reviewed'].includes(k));
const { $defs:legacyDefs,$id:publicSchemaId,$schema:dialect,...legacyProfile }=schema;
const envelope=Object.fromEntries(['schema_version','record_state','id','canonical_url','json_url','content_version','publisher','collection_role','dates','partial_pages','correction_notes'].map(k=>[k,schema.properties[k]]));
const publicSchema={$schema:dialect,$id:publicSchemaId,title:'Texas Water Watch public research record profiles (v1)',description:'record_format selects R3, the non-null-date batch02 compatibility profile, or shared source_bounded nullable-date profile. Actual batch identity is provenance.reported.batch. Shared identity, date, discovery and evidence links; original content shapes remain distinct. Definitions also describe entity_mentions and research_leads endpoints.',oneOf:[{$ref:'#/$defs/r3_record'},{$ref:'#/$defs/batch02_record'},{$ref:'#/$defs/source_bounded_record'}],$defs:{...legacyDefs,...batch02Definitions,...mentionDefinitions,r3_record:legacyProfile,batch02_record:batch02Profile(envelope),source_bounded_record:batch02Profile(envelope,true)}};
write(root + '/schema.json', publicSchema);
const validate = ajv.compile(publicSchema);
const groups = { entities: 'entity_local_id', agenda_items: 'agenda_item_id', episodes: 'episode_id', observations: 'observation_id', procedural_actions: 'procedural_action_id', relationships: 'relationship_id', unresolved: 'unresolved_id' };
const referenceKeys = new Set([...Object.values(groups), 'subject_entity_id','object_entity_id','object_ref','episode_id','entity_ids','agenda_item_ids','observation_ids','procedural_action_ids']);
const entries = read('data/meeting-intelligence/release-input.json');
const legacyRecords = entries.map(entry => {
  if (!validateInput(entry.record)) throw Error(JSON.stringify(validateInput.errors));
  const r = structuredClone(entry.record);
  const id = /^MIC1-012-UNSEEN-\d{3}$/.test(r.meeting.meeting_id) ? r.meeting.meeting_id.toLowerCase() : r.meeting.district_id + '-' + r.meeting.source_document_id.slice(7,23);
  r.document_type = 'meeting_record';
  const canonical = url('/groundwater-districts/intelligence/meetings/' + id);
  const ids = new Map(Object.entries(groups).flatMap(([g,k]) => r[g].map(o => [o[k], id + ':' + o[k]])));
  function scope(v, key = '') {
    if (Array.isArray(v)) return v.map(x => scope(x, key));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k,x]) => [k, scope(x,k)]));
    if (referenceKeys.has(key) && typeof v === 'string') {
      if (!ids.has(v)) throw Error('Unknown object reference: ' + v);
      return ids.get(v);
    }
    return v;
  }
  for (const [g,k] of Object.entries(groups)) r[g] = r[g].map(o => ({ ...scope(o), original_id: o[k] }));
  function evidence(o, pointer, objectId) {
    o.citation_url = canonical + '#' + objectId;
    o.json_pointer = pointer;
    o.evidence = o.evidence.map(e => {
      if (e.source_document_id !== r.meeting.source_document_id || e.page > r.meeting.page_count) throw Error('Source citation mismatch');
      return { ...e, source_url: r.meeting.source_url, claim_url: o.citation_url, object_id: objectId, json_pointer: pointer };
    });
  }
  for (const [g,k] of Object.entries(groups)) r[g].forEach((o,i) => evidence(o, '/' + g + '/' + i, o[k]));
  r.meeting.original_id = r.meeting.meeting_id;
  evidence(r.meeting, '/meeting', 'source-heading');
  r.meeting_summary.original_id = r.meeting.meeting_id + ':summary';
  evidence(r.meeting_summary, '/meeting_summary', 'meeting-summary');
  r.meeting.source_completeness.evidence = r.meeting.source_completeness.evidence.map(e => ({ ...e, source_url: r.meeting.source_url, claim_url: canonical + '#source-heading', object_id: 'source-heading', json_pointer: '/meeting/source_completeness' }));
  r.provenance = { source_schema: r.schema_version, source_record_state: r.record_state, human_reviewed: false, original_public_release_authorized: false, review_scope: 'R3 automated source-bounded extraction; selected source-page QA by coding agent. No documented independent human review.' };
  delete r.meeting_summary.human_reviewed; delete r.meeting_summary.public_release_authorized;
  Object.assign(r, { schema_version: '1.0.0', record_format:'r3', record_state: 'release_candidate', id, canonical_url: canonical, json_url: url('/data/water-watch/v1/meetings/' + id + '.json'), publisher: 'Texas Water Sources', collection_role: 'source_linked_research_not_official_registry', dates: { source_date: r.meeting.meeting_date, source_date_basis: entry.date_basis, routing_date: entry.routing_date, extraction_date: null, last_source_check: null, publication_date: null,document_label:'Meeting record',date_role:'recorded_meeting_date',date_note:entry.routing_date!==r.meeting.meeting_date?'Routing date differs; source-stated meeting date retained.':null }, partial_pages: entry.partial_pages, correction_notes: [] });
  if (entry.routing_date !== r.meeting.meeting_date) r.correction_notes.push('Routing date differs from source-stated date; source date retained for filtering.');
  if (id.endsWith('005')) r.correction_notes.push('Address-only entity labels and address spans explicitly omitted; permit quantities and decisions retained. Nine quantity observations with empty entity arrays now link the explicit applicant and permit identified by their existing evidence on pages 1–2 and completed source-page QA; numeric values unchanged.');
  if (id.endsWith('005')) r.correction_notes.push('Source-completeness citation corrected to physical page 4: external historic-use packet and district-office hard-copy notice. Existing page-4 image checked; external packet not fetched. Separate page-1 meeting/group-approval evidence retained.');
  if (id.endsWith('021')) r.correction_notes.push('Adopted 289,000,000 gallons/year remains separate from inconsistent attached calculations. No implied fulfillment of conditions. Tiny raster spans on pages 14, 15 and 19 remain unreadable.');
  if (id.endsWith('015')) r.correction_notes.push('RC6447 repeated allocation is not multiplied across drilling entries.');
  r.content_version = hash(r);
  if (!validate(r)) throw Error(JSON.stringify(validate.errors));
  write(root + '/meetings/' + id + '.json', r);
  return r;
});
const batches=read('data/meeting-intelligence/batches.json');
// This named pilot supplies no candidate leads. Never silently ignore future ones.
for(const b of batches.filter(b=>b.pilot_id&&!['north-plains-blf-source-chain-01','north-plains-blf-watch-01','two-district-2026-minutes-infill-01'].includes(b.pilot_id)))if(read('data/meeting-intelligence/'+b.leads).leads.length)throw Error('Named-pilot candidate leads require an explicit lead-envelope adapter');
const nativeMaps=batches.flatMap(b=>b.native_maps?read('data/meeting-intelligence/'+b.native_maps):[]).map(m=>({...m,map_url:url('/data/water-watch/v1/native-locations/'+m.record_id+'.json')}));
mkdirSync(root+'/native-locations',{recursive:true});
for(const m of nativeMaps)write(root+'/native-locations/'+m.record_id+'.json',m);
write(root+'/native-locations/index.json',{schema_version:'1.0.0',profile:'retained_native_locations',map_count:nativeMaps.length,block_count:nativeMaps.reduce((n,m)=>n+m.blocks.length,0),maps:nativeMaps.map(({record_id,source_sha256,source_url,original_map_sha256,map_path,map_url,blocks})=>({record_id,source_sha256,source_url,original_map_sha256,map_path,map_url,block_count:blocks.length}))});
const batchRecords=batches.flatMap(batch=>read('data/meeting-intelligence/'+batch.input).map(raw=>{
  if((batch.pilot_id?raw.provenance.pilot_id!==batch.pilot_id:raw.provenance.batch!==batch.batch)||raw.schema_version!==batch.format)throw Error('Registered input provenance mismatch');
  return adaptBatch02(raw,{url,hash,nativeMaps});
}));
const records=[...legacyRecords,...batchRecords].sort((a,b)=>(b.dates.source_date||'').localeCompare(a.dates.source_date||'')||a.id.localeCompare(b.id));
if (new Set(records.map(r=>r.id)).size !== records.length) throw Error('Duplicate record identities; source revisions require distinct keys');
if(new Set(records.map(r=>r.meeting.district_id+':'+r.meeting.source_document_id)).size!==records.length) throw Error('Duplicate full source identity');
const validateBatch=ajv.compile({$ref:publicSchemaId+'#/$defs/batch02_record'}),validateNullable=ajv.compile({$ref:publicSchemaId+'#/$defs/source_bounded_record'});
for(const r of batchRecords){const check=r.record_format==='source_bounded'?validateNullable:validateBatch;if(!check(r))throw Error(r.id+' '+JSON.stringify([...new Map(check.errors.map(e=>[e.schemaPath+' '+e.keyword, e])).values()].slice(0,40)));write(root+'/meetings/'+r.id+'.json',r);}
writeFileSync(root + '/meetings.jsonl', records.map(r => JSON.stringify(r)).join('\n') + '\n');
// Search only semantic public content: never IDs, paths, hashes or execution fields.
const excluded = /(?:^id$|_id$|_ids$|_ref$|_url$|_sha256$|json_pointer|original_id|source_document_id|^evidence$|row_navigation)/;
function words(v) {
  if (Array.isArray(v)) return v.map(words).join(' ');
  if (v && typeof v === 'object') return Object.entries(v).filter(([k]) => !excluded.test(k)).map(([k,x]) => k.replaceAll('_',' ') + ' ' + words(x)).join(' ');
  return v == null ? '' : String(v);
}
const searchWords = v => [...new Set(words(v).toLowerCase().split(/\s+/))].join(' ');
const search = records.map(r => {
  if(r.record_format!=='r3') return batch02Search(r,searchWords);
  const matters = r.episodes.map(e => {
    const objects = [...r.observations, ...r.procedural_actions, ...r.unresolved].filter(o => o.episode_id === e.episode_id);
    const entities = r.entities.filter(o => e.entity_ids.includes(o.entity_local_id));
    return { id: e.episode_id, label: r.agenda_items.filter(a => e.agenda_item_ids.includes(a.agenda_item_id)).map(a => a.title).join(' / ') || e.episode_type.replaceAll('_',' '), searchText: searchWords([e,objects,entities]) };
  });
  return { key:r.id, id:r.meeting.meeting_id, districtId:r.meeting.district_id, district:r.meeting.district_name, date:r.meeting.meeting_date, routingDate:r.dates.routing_date, pages:r.meeting.page_count, summary:r.meeting_summary.model_summary, topics:r.meeting_summary.key_signal_categories, stages:[...new Set([...r.observations.map(o=>o.observation_type),...r.procedural_actions.map(o=>o.action_type)])].sort(), sourceUrl:r.meeting.source_url, citations:r.meeting_summary.evidence.map(e=>({page:e.page})), partial:r.partial_pages.length>0, partialPages:r.partial_pages, canonical_url:r.canonical_url,json_url:r.json_url,content_version:r.content_version,searchText:searchWords([r.meeting_summary,r.entities,r.agenda_items,r.observations,r.procedural_actions,r.relationships,r.unresolved]), matters };
});
search.forEach((card,i)=>Object.assign(card,{recordFormat:records[i].record_format,documentType:records[i].dates.document_label,dateRole:records[i].dates.date_role,dateNote:records[i].dates.date_note}));
for(const [file,profile,value] of [['entity-mentions','entity_mentions',buildEntityMentions(records)],['research-leads','research_leads',resolveResearchLeads(batches.filter(b=>!b.pilot_id||['north-plains-blf-source-chain-01','north-plains-blf-watch-01','two-district-2026-minutes-infill-01'].includes(b.pilot_id)).map(b=>read('data/meeting-intelligence/'+b.leads)),records)]]){
  const check=ajv.compile({$ref:publicSchemaId+'#/$defs/'+profile});if(!check(value))throw Error(JSON.stringify(check.errors));write(root+'/'+file+'.json',value);
}
write(root + '/meetings/index.json', { schema_version:'1.0.0', record_count:records.length, records:search });
// Navigation data is deliberately separate from the exact item-level search index.
// The latter remains available at its established URL for explicit deep searches.
const meetingContentVersion=hash(records.map(r=>[r.id,r.content_version]));
const browseDistricts=Object.fromEntries([...new Map(search.map(m=>[m.districtId,m.district]))].sort(([a],[b])=>a.localeCompare(b)));
const browseRecords=search.map(m=>({
  key:m.key,districtId:m.districtId,date:m.date,pages:m.pages,
  summary:m.summary,topics:m.topics,stages:m.stages,sourceUrl:m.sourceUrl,
  sourcePage:m.citations.find(c=>typeof c.page==='number')?.page||null,
  ...(m.sourceMediaType?{sourceMediaType:m.sourceMediaType}:{}),
  partial:m.partial,partialPages:m.partialPages,version:m.content_version.slice(0,12),
  documentType:m.documentType,dateRole:m.dateRole,dateNote:m.dateNote,
}));
const partitionManifest={schema_version:'1.0.0',profile:'exact_district_search_partitions',content_version:meetingContentVersion,
  scope_note:'Each district file contains the exact entries from the full meeting search index for that issuing district. These are search aids, not new source records.',
  full_index_url:url('/data/water-watch/v1/meetings/index.json'),districts:{}};
mkdirSync(root+'/meetings/by-district',{recursive:true});
for(const districtId of [...new Set(search.map(m=>m.districtId))].sort()){
  if(!/^[a-z0-9_]+$/.test(districtId))throw Error('Unsafe district partition ID');
  const subset=search.filter(m=>m.districtId===districtId);
  const pathname=`/data/water-watch/v1/meetings/by-district/${districtId}.${meetingContentVersion.slice(0,12)}.json`;
  const value={schema_version:'1.0.0',profile:'exact_district_search_partition',content_version:meetingContentVersion,district_id:districtId,record_count:subset.length,records:subset};
  write('public'+pathname,value);
  partitionManifest.districts[districtId]={url:url(pathname),record_count:subset.length};
}
write(root+'/meetings/partitions.json',partitionManifest);
write(root+'/meetings/browse.json',{
  schema_version:'1.0.0',profile:'meeting_browse_navigation',content_version:meetingContentVersion,
  coverage_note:'Compact navigation summaries and facets only. Open a source record or an exact search partition for item-level evidence and same-item matching.',
  record_count:browseRecords.length,districts:browseDistricts,records:browseRecords,
});
const directory = read('public/data/gcd-statewide-directory/v2/gcd_statewide_directory_v2.json');
const facts = read('public/data/gcd-district-intelligence/v2/gcd_district_intelligence_v2.json').records;
const events = readFileSync('data/gcd-public-events/v1/gcd_public_event_feed_v1.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
const range = dates => { const d=dates.filter(Boolean).sort(); return {from:d[0]||null,through:d.at(-1)||null}; };
const districts = directory.districts.map(d => {
  const ms = records.filter(r=>r.meeting.district_id===d.district_id), es=events.filter(e=>e.district_id===d.district_id);
  return { district_id:d.district_id,district_name:d.district_name,human_url:url(d.site_detail_path || '/groundwater-districts#district-'+d.district_slug),official_website_url:d.official_website_url,official_archive_urls:d.official_archive_urls,meeting_ids:ms.map(r=>r.id),layers:{meetings:{count:ms.length,date_range:range(ms.map(r=>r.meeting.meeting_date)),...documentDateCounts(ms),unresolved_date_count:documentDateCounts(ms).without_single_document_date,unresolved_date_count_note:'Legacy alias for without_single_document_date; includes compilations. Use unresolved_document_dates for ambiguity only.',coverage:ms.length?'partial_collection':'no_records_in_collection'},facts:{count:facts.filter(f=>f.district_id===d.district_id).length,date_range:null,date_basis:'See official_source_url in fact feed; dates not normalized here'},board_actions:{count:es.length,date_range:range(es.map(e=>e.meeting_date))},documents:{count:d.document_count,verified_meeting_date_count:d.verified_meeting_date_count,last_source_observation:d.last_successful_source_observation_date}},coverage_note:['duval_county_gcd','wes_tex_gcd'].includes(d.district_id)?'Represented by a historical management-plan submission packet. Newer/current meeting coverage remains unresolved; this does not establish current permits, rules or plan validity.':'Counts describe this collection only. Historical depth and recency vary; representation is not complete or current meeting history.' };
});
if (records.some(r=>!districts.some(d=>d.district_id===r.meeting.district_id))) throw Error('Meeting district absent from directory');
write(root+'/districts.json',{schema_version:'1.0.0',district_count:districts.length,districts});
// These approved feeds had no public URL in the existing site. Copy unchanged bytes,
// retaining their existing names and versions, rather than reformatting their contracts.
mkdirSync('public/data/gcd-public-events/v1',{recursive:true});
copyFileSync('data/gcd-public-events/v1/gcd_public_event_feed_v1.jsonl','public/data/gcd-public-events/v1/gcd_public_event_feed_v1.jsonl');
const links={districts:url('/data/water-watch/v1/districts.json'),meetings:url('/data/water-watch/v1/meetings/index.json'),bulk:url('/data/water-watch/v1/meetings.jsonl'),schema:url('/data/water-watch/v1/schema.json'),data_access:url('/groundwater-districts/data'),facts:url('/data/gcd-district-intelligence/v2/gcd_district_intelligence_v2.json'),board_actions:url('/data/gcd-public-events/v1/gcd_public_event_feed_v1.jsonl'),statewide_directory:url('/data/gcd-statewide-directory/v2/gcd_statewide_directory_v2.json'),source_navigation:url('/data/texas-water-sources/v1/catalog.json')};
links.meeting_browse=url('/data/water-watch/v1/meetings/browse.json');
links.meeting_partitions=url('/data/water-watch/v1/meetings/partitions.json');
const matters=batches.filter(b=>b.matter).map(b=>buildMatter(read('data/meeting-intelligence/'+b.matter),records,read('data/meeting-intelligence/'+b.input),{url,hash}));
for(const b of batches.filter(b=>b.matter_update)){const proposal=read('data/meeting-intelligence/'+b.matter_update),i=matters.findIndex(m=>m.matter_id===proposal.matter_id);if(i<0)throw Error('Missing update matter');matters[i]=b.pilot_id==='two-district-2026-minutes-infill-01'?applyInfill01Update(matters[i],proposal,records,{hash}):applyWatch01Update(matters[i],proposal,records,{hash});}
mkdirSync(root+'/matters',{recursive:true});
const validateMatter=ajv.compile(matterSchema);
for(const m of matters){if(!validateMatter(m))throw Error(JSON.stringify(validateMatter.errors));write(root+'/matters/'+m.matter_id+'.json',m);}
for(const b of batches.filter(b=>b.matter&&b.pilot_id==='ntgcd-aqua-resort-longitudinal-20260924')) {
  const p='data/meeting-intelligence/'+b.projection_notes,n=read(p),m=matters.find(m=>m.pilot_id===b.pilot_id);
  n.field_projection_notes=[...m.annotations,{record_id:'pilot-ntgcd-aqua-resort-6ce018e10a30',field:'dates.document_label / dates.date_role',projected_document_label:'Minutes',projected_date_role:'recorded_meeting_date',meeting_date:'2026-02-12',approved_date:'2026-04-08',reason:'Explicit named-pilot correction for capitalized Minutes; raw document_type and corrected handwritten approval-date qualification unchanged. No earlier record relabeled.'},{record_id:'pilot-ntgcd-aqua-resort-3644a7501499',item_id:'pilot-ntgcd-aqua-resort-3644a7501499-filing-certification',field:'date_context',raw_section_date:'2026-09-16',projected_date:'2026-09-11',date_role:'filing_date',physical_page:3,reason:'Raw section_date remains scheduled document context. Clerk stamp is September 11 at 11:20 am; posting deadline is not filing/signature time.'}];
  write(p,n);
}
write(root+'/matters/schema.json',matterSchema);
write(root+'/matters/index.json',{schema_version:'1.0.0',matter_count:matters.length,matters:matters.map(m=>({matter_id:m.matter_id,release_status:m.release_status,release_record:m.release_record,title:m.title,district_id:m.district_id,canonical_url:m.canonical_url,json_url:m.json_url,source_record_ids:m.source_record_ids,fact_links:m.fact_links,search_text:[m.title,...m.fact_links.map(f=>f.fact_id),...m.connections.map(c=>c.statement),...m.source_refs.filter(ref=>ref.json_pointer.startsWith('/water_objects/')).map(ref=>JSON.stringify(records.find(r=>r.id===ref.record_id).water_objects.find(o=>o.id===ref.item_id)))].join(' ')}))});
links.matters=url('/data/water-watch/v1/matters/index.json');
links.matter_schema=url('/data/water-watch/v1/matters/schema.json');
links.document_coverage = links.statewide_directory;
links.entity_mentions=url('/data/water-watch/v1/entity-mentions.json');
links.research_leads=url('/data/water-watch/v1/research-leads.json');
links.native_locations=url('/data/water-watch/v1/native-locations/index.json');
links.entities_view=url('/groundwater-districts/intelligence/entities');
const currentReleaseRecord='https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/41';
const snapshotReleaseRecord='https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/39';
const statusSource=read('data/meeting-intelligence/coverage-status-source.json');
const infillAcceptance=read('data/meeting-intelligence/pilots/two-district-infill01/acceptance.json');
if(statusSource.schema_version!=='1.0.0'||!Array.isArray(statusSource.scoped_checks)||!Array.isArray(statusSource.fact_context))throw Error('Invalid coverage status source snapshot');
if(statusSource.published_collection?.release_record!==snapshotReleaseRecord)throw Error('Coverage status release evidence disagrees with catalog');
const northPlainsMatter=matters.find(m=>m.matter_id==='north-plains-blf-enforcement');
const reportingRevision=northPlainsMatter?.derived_answer_revisions?.find(r=>r.target_id==='reporting');
const juneReportingEvent=northPlainsMatter?.events?.find(e=>e.id==='north-plains-watch01-4181603978d4-event-2025-methods');
const reportingEvidence=northPlainsMatter?.source_refs?.find(r=>r.id==='north-plains-watch01-4181603978d4-ref-blf-methods');
if(!reportingRevision||!juneReportingEvent||!reportingEvidence||juneReportingEvent.event_date!=='2026-06-16')throw Error('Missing published North Plains reporting revision evidence');
const reportingChange={matter_id:northPlainsMatter.matter_id,conclusion_id:reportingRevision.target_id,revision_id:reportingRevision.id,
  prior_answer:reportingRevision.prior_answer,revised_answer:reportingRevision.revised_answer,reason:reportingRevision.reason,
  historical_event_date:juneReportingEvent.event_date,historical_event_role:juneReportingEvent.date_role,
  conclusion_url:northPlainsMatter.canonical_url+'#'+reportingRevision.target_id,
  revision_url:northPlainsMatter.canonical_url+'#'+reportingRevision.id,
  event_url:northPlainsMatter.canonical_url+'#event-'+juneReportingEvent.id,
  source_evidence_url:reportingEvidence.human_url,source_record_id:reportingEvidence.record_id,source_item_id:reportingEvidence.item_id};
const coverageStatus={schema_version:'1.0.0',snapshot_captured_at:statusSource.snapshot_captured_at,scope_note:statusSource.scope_note,
  candidate_state:'release_artifact',published_snapshot:{release_record:snapshotReleaseRecord,source_documents:141,physical_pdf_pages:1143,candidate_research_leads:85,promotion_time:statusSource.published_collection.promoted_at},
  reading_acceptance_overlay:{pilot_id:infillAcceptance.pilot_id,accepted_at:infillAcceptance.accepted_at,accepted_source_count:infillAcceptance.outcomes.length,other_north_plains_deferred_count:infillAcceptance.deferred_remaining.length,publication_performed:infillAcceptance.publication_performed,acceptance_archive_sha256:infillAcceptance.archive.sha256,release_record:currentReleaseRecord,publication_basis:'PR #41 release artifact; actual public verification and reconciliation are recorded separately after promotion.',meaning:'Separately receipted acceptance of three retained sources; three other North Plains sources remain deferred. The six-source backlog in the frozen check snapshot is historical. No new official-source check.'},
  collection_content_version:meetingContentVersion,snapshot_input_sha256:createHash('sha256').update(readFileSync('data/meeting-intelligence/coverage-status-source.json')).digest('hex'),
  collection:{source_documents:records.length,represented_directory_identities:new Set(records.map(r=>r.meeting.district_id)).size,directory_identities:districts.length,physical_pdf_pages:records.reduce((n,r)=>n+(r.meeting.source_media_type==='text/html'?0:r.meeting.page_count),0),pdf_sources:records.filter(r=>r.meeting.source_media_type!=='text/html').length,native_sources:records.filter(r=>r.meeting.source_media_type==='text/html').length,facts:facts.length,board_actions:events.length,candidate_research_leads:read(root+'/research-leads.json').leads.length,longitudinal_matters:matters.length,district_detail_url:url('/data/water-watch/v1/districts.json'),meaning:'PR #41 release collection inventory. One or more represented source documents per directory identity; neither complete historical coverage nor current activity monitoring.'},
  districts:buildDistrictCoverage(districts,browseRecords,statusSource.scoped_checks,matters,url).map(d=>({...d,reading_release_overlay:d.district_id==='north_plains_gcd'?{pilot_id:infillAcceptance.pilot_id,accepted_at:infillAcceptance.accepted_at,accepted_sources:3,remaining_deferred_sources:infillAcceptance.deferred_remaining.length,release_record:currentReleaseRecord,basis:'Separate acceptance receipts and PR #41 release artifact; no new source check. Historical watch backlog above remains frozen.'}:null})),
  scoped_checks:statusSource.scoped_checks,
  pending_and_deferred_reading:{scope:'Only the two manually checked matter profiles below; not a statewide backlog count.',profiles:statusSource.scoped_checks.map(s=>({matter_id:s.matter_id,...s.reading_state_now}))},
  published_research_changes:{collection_release_record:currentReleaseRecord,publication_evidence_release_record:snapshotReleaseRecord,current_release_timing_basis:'Actual PR #41 promotion and verification are recorded in the separate release receipt after they occur.',publication_time:statusSource.published_collection.promoted_at,publication_time_role:statusSource.published_collection.promoted_at_role,public_verification_at:statusSource.published_collection.verified_at,publication_evidence:{deployment_id:statusSource.published_collection.deployment_id,worker_version:statusSource.published_collection.worker_version,release_report_sha256:statusSource.published_collection.release_report_sha256,publication_receipt_sha256:statusSource.published_collection.publication_receipt_sha256},meaning:'A research publication changes the website collection; it is not a new government event or source check.',matters:matters.map(m=>({matter_id:m.matter_id,release_record:m.release_record,canonical_url:m.canonical_url,json_url:m.json_url})),reporting_change_example:reportingChange},
  fact_context:statusSource.fact_context};
write(root+'/coverage-status.json',coverageStatus);
links.coverage_status=url('/data/water-watch/v1/coverage-status.json');
links.coverage_view=url('/groundwater-districts/intelligence/coverage');
for(const value of Object.values(links).filter(x=>/\.(json|jsonl)$/.test(x))) if(!existsSync('public'+new URL(value).pathname)) throw Error('Missing linked download '+value);
write(root+'/index.json',{
  schema_version:'1.0.0',content_version:meetingContentVersion,publisher:'Texas Water Sources',name:'Texas Water Watch district knowledge',description:'Source-linked meeting research, reviewed facts, board actions and statewide source coverage; distinct layers, not an official registry.',
  release_status:'published_research_collection',publication_note:'PR #41 releases three accepted 2026 North Plains readings and a historical matter update. PR #39 is the prior data baseline; PR #40 is presentation history. Actual promotion and verification are recorded separately. Publication is not a new official-source check.',release_record:currentReleaseRecord,hosting_history:['https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/34'],presentation_history:['https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/37','https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/40'],
  published_baseline:{meeting_records:141,meeting_districts:98,source_pages:1143,candidate_research_leads:85,longitudinal_matters:2,unresolved_document_dates:4,multi_meeting_compilations:1,release_record:snapshotReleaseRecord},
  earlier_releases:[{meeting_records:140,meeting_districts:98,source_pages:1050,candidate_research_leads:83,longitudinal_matters:2,unresolved_document_dates:4,multi_meeting_compilations:1,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/38'},{meeting_records:130,meeting_districts:98,source_pages:966,candidate_research_leads:80,longitudinal_matters:1,unresolved_document_dates:4,multi_meeting_compilations:1,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/36'},{meeting_records:128,meeting_districts:98,source_pages:947,candidate_research_leads:80,longitudinal_matters:1,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/35'},{meeting_records:123,meeting_districts:98,source_pages:895,candidate_research_leads:80,unresolved_document_dates:4,multi_meeting_compilations:1,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/33'},{meeting_records:121,meeting_districts:96,source_pages:641,candidate_research_leads:72,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/32'},{meeting_records:117,meeting_districts:92,source_pages:638,candidate_research_leads:67,unresolved_document_dates:3,multi_meeting_compilations:1,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/31'},{meeting_records:99,meeting_districts:74,source_pages:529,candidate_research_leads:55,unresolved_document_dates:3,multi_meeting_compilations:1,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/30'},{meeting_records:85,meeting_districts:60,source_pages:478,candidate_research_leads:45,unresolved_document_dates:3,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/29'},{meeting_records:65,meeting_districts:40,source_pages:355,candidate_research_leads:33,unresolved_document_dates:2,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/28'},{meeting_records:45,meeting_districts:20,source_pages:298,release_record:'https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/27'}],
  supported_record_profiles:['r3','batch02','source_bounded'],native_evidence_profile:'NATIVE_BLOCK_REFERENCE is an additive native branch: no page/page_basis. Resolve native_locator.map_url through links.native_locations; earlier PDF-only clients need this branch. Supporting text is whitespace-normalized retained-source text, not raw HTML. Source maps may differ from later live pages.',coverage:{longitudinal_matters:matters.length,meeting_records:records.length,meeting_districts:new Set(records.map(r=>r.meeting.district_id)).size,source_pages:records.reduce((n,r)=>n+(r.meeting.source_media_type==='text/html'?0:r.meeting.page_count),0),source_pages_basis:'Physical PDF pages only; native blocks are not pages.',pdf_source_documents:records.filter(r=>r.meeting.source_media_type!=='text/html').length,native_source_documents:records.filter(r=>r.meeting.source_media_type==='text/html').length,directory_districts:districts.length,districts_without_meeting_documents:districts.filter(d=>!d.meeting_ids.length).length,candidate_research_leads:read(root+'/research-leads.json').leads.length,facts:facts.length,board_actions:events.length,meeting_dates:range(records.map(r=>r.meeting.meeting_date)),...documentDateCounts(records)},
  limitations:['At least one full-document Meeting Intelligence source is represented for all 98 identities in the current district directory. Historical depth and recency vary by district.','Recorded decisions do not establish current permit status or fulfillment of conditions.','Zero records is a collection coverage gap, not evidence of no activity.','No documented independent human review of the meeting extraction.','The website bundles district-level document counts, roles and archive URLs; the individual successor document feed is not bundled. An older local feed is not a substitute.','A compilation has no single document date. Bounded searches require a supported matching item/section, not continuous earliest-to-latest overlap.'],links,usage_terms:url('/terms'),dataset_reuse_license:null
});
console.log(`Exported ${records.length} meetings, ${districts.length} district identities; JSON schema validation passed.`);
