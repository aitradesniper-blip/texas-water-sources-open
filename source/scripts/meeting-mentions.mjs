import {nativeEvidenceProperties,nativeEvidenceSchema} from './meeting-native-evidence.mjs';
import { createHash } from 'node:crypto';
import {mentionDate,dateContextProperties,tableRowDate} from '../lib/meeting-date-context.mjs';
import {resolveChainReference} from './meeting-source-chain.mjs';
import {isNorthPlains} from '../lib/north-plains-context.mjs';
export {mentionDate} from '../lib/meeting-date-context.mjs';

// Normalization is only a lookup key. No company suffix stripping, alias merging,
// fuzzy identity matching, or inference from other matters in the same meeting.
export const normalizeMention = s => s.toLocaleLowerCase('en-US').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
const digest = s => createHash('sha256').update(s).digest('hex').slice(0,20);
const identifierType = type => /well|permit|application|GPU|litigation|water_supply_system|district_number_reference|^(case|investigation)_identifier$/i.test(type) ? type : null;
const s={type:'string'}, nullable={type:['string','null']}, arr=items=>({type:'array',items});
const obj=(properties,required=Object.keys(properties))=>({type:'object',required,properties,additionalProperties:false});
const leadEvidence=arr({oneOf:[obj({source_document_id:s,page:{type:'integer',minimum:1},source_url:s,page_basis:s},['source_document_id','page','source_url']),nativeEvidenceSchema]});
const unresolved=obj({status:{const:'unresolved'},reason:s});
const recordResolution={oneOf:[obj({status:{const:'resolved'},record_url:s,json_url:s}),unresolved]};
const itemResolution={oneOf:[obj({status:{const:'resolved'},object_url:s,json_pointer:s}),unresolved]};
const candidateLead=obj({
  id:s,label:s,kind:s,status:{const:'possible_linkage_only'},identity_merged:{const:false},
  provenance:obj({batch:s,source_schema:s}),
  reason_to_investigate:s,next_verification:s,caution:s,why_investigate:s,identity_uncertainty:s,
  prior_corpus_matching_performed:{type:'boolean'},
  occurrences:arr(obj({record_id:s,district_id:s,meeting_date:nullable,source_date:nullable,date_note:nullable,statement:s,supported_section_date:nullable,names_or_identifiers:arr(s),names_or_identifiers_status:{const:'not_supplied'},evidence:leadEvidence,resolution:recordResolution},['record_id','district_id','meeting_date','names_or_identifiers','evidence','resolution'])),
  prior_corpus_candidates:arr(obj({record_id:s,district_id:s,meeting_date:nullable,status:s,resolution:recordResolution,candidate_entities:arr(obj({entity_local_id:s,name_as_stated:s,evidence_references_from_prior_record:leadEvidence,resolution:itemResolution}))})),
},['id','label','kind','status','identity_merged','provenance','occurrences','prior_corpus_candidates']);
const leadSource=obj({batch:s,schema_version:s,identity_policy:s,prior_corpus_discovery:obj({record_count_inspected:{type:'integer',minimum:0},mode:s}),prior_corpus_matching_performed:{type:'boolean'},prior_corpus_note:s,within_batch_note:s},['batch','identity_policy']);
Object.assign(candidateLead.properties,{original_id:s,original_status:s,source_refs:arr(s),reference_mappings:arr(obj({original_reference_id:s,record_id:s,item_id:s,json_pointer:s,object_url:s}))});
candidateLead.properties.provenance={oneOf:[candidateLead.properties.provenance,obj({pilot_id:s,source_schema:s})]};
const pilotLeadSource=obj({schema_version:s,provenance:obj({pilot_id:s,extraction_date:s}),status:s});
export const mentionDefinitions={
  mention: {type:'object',required:['id','lookup_group_id','record_id','record_format','local_item_id','json_pointer','as_stated','type','document_type','issuing_district_id','issuing_district_name','identifier','date','date_role','date_note','stated_role','stage','record_url','record_json_url','object_url','evidence_scope','evidence','values','linkage_basis'],additionalProperties:false,properties:{...Object.fromEntries('id lookup_group_id record_id record_format local_item_id json_pointer as_stated type document_type issuing_district_id issuing_district_name date_role date_note stated_role record_url record_json_url object_url linkage_basis'.split(' ').map(k=>[k,s])),date:nullable,stage:nullable,identifier:{anyOf:[{type:'null'},{type:'object',required:['type','issuer_district_id','value_as_stated'],properties:{type:s,issuer_district_id:s,value_as_stated:s},additionalProperties:false}]},evidence_scope:{enum:['item','table_level']},evidence:arr({type:'object',required:['source_document_id','page','source_url','record_evidence_pointer'],properties:{source_document_id:s,page:{type:'integer',minimum:1},source_url:s,record_evidence_pointer:s},additionalProperties:false}),values:{$ref:'#/$defs/json_cell'}}},
  lookup_group:{type:'object',required:['id','label','labels','type','normalized_lookup','issuer_district_id','identity_merged','grouping_basis','occurrence_ids','record_count','earliest_in_collection'],additionalProperties:false,properties:{...Object.fromEntries('id label type normalized_lookup grouping_basis'.split(' ').map(k=>[k,s])),labels:arr(s),issuer_district_id:nullable,identity_merged:{const:false},occurrence_ids:arr(s),record_count:{type:'integer',minimum:1},earliest_in_collection:nullable}},
  entity_mentions:{type:'object',required:['schema_version','profile','identity_policy','group_count','occurrence_count','groups','occurrences'],properties:{schema_version:{const:'1.0.0'},profile:{const:'source_linked_mentions'},identity_policy:s,group_count:{type:'integer'},occurrence_count:{type:'integer'},groups:arr({$ref:'#/$defs/lookup_group'}),occurrences:arr({$ref:'#/$defs/mention'})},additionalProperties:false},
  research_leads:obj({schema_version:{const:'1.0.0'},batch:{const:'cumulative'},profile:{const:'candidate_research_leads'},source_schema:{const:'batch02-source-bounded-1.0'},identity_policy:s,sources:arr({oneOf:[leadSource,pilotLeadSource,obj({schema_version:s,pilot_id:{const:'north-plains-blf-watch-01'},qualification:s}),obj({pilot_id:{const:'two-district-2026-minutes-infill-01'},status:s})]}),leads:arr(candidateLead)})
};
mentionDefinitions.mention.properties.date_candidates=dateContextProperties.date_candidates;
Object.assign(mentionDefinitions.mention.properties,{source_issuer:s,source_publisher:s,district_role:s});
mentionDefinitions.mention.properties.evidence.items={oneOf:[mentionDefinitions.mention.properties.evidence.items,obj({...nativeEvidenceProperties,record_evidence_pointer:s})]};
mentionDefinitions.mention.required.push('date_candidates');
mentionDefinitions.mention.properties.referenced_dates=dateContextProperties.referenced_dates;

export function buildEntityMentions(records) {
  const occurrences=[];
  function add(r,o,{name,type,role,stage=null,localId=o.id,values=null,evidence=o.evidence,pointer=o.json_pointer,objectUrl=o.citation_url,scope='item',explicitDate=null,identifierAllowed=true,dateContext=null}) {
    if(typeof name!=='string'||!name.trim()||name.includes('[address omitted]'))return;
    const identifier=identifierAllowed&&!(isNorthPlains(r)&&r.document_type.startsWith('court_'))?identifierType(type):null;
    const groupKey=[type,identifier?r.meeting.district_id:'',normalizeMention(name),...(!identifierAllowed?[r.id,localId]:[])].join('|');
    const groupId='lookup-'+digest(groupKey);
    const id='mention-'+digest([r.id,pointer,type,name].join('|'));
    if(occurrences.some(x=>x.id===id)) return;
    occurrences.push({id,lookup_group_id:groupId,record_id:r.id,record_format:r.record_format,local_item_id:localId,json_pointer:pointer,
      as_stated:name,type,document_type:r.dates.document_label,issuing_district_id:r.meeting.district_id,issuing_district_name:r.meeting.district_name,
      ...(isNorthPlains(r)?{source_issuer:r.issuer,source_publisher:r.source_publisher,district_role:r.meeting.district_role}:{}),
      identifier:identifier?{type:identifier,issuer_district_id:r.meeting.district_id,value_as_stated:name}:null,
      ...(dateContext||mentionDate(r,o,explicitDate)),
      stated_role:typeof role==='string'?role:'Structured source-local context; see linked item.',stage,record_url:r.canonical_url,record_json_url:r.json_url,object_url:objectUrl,evidence_scope:scope,
      evidence:evidence.map(e=>({...e.native_locator?e:{source_document_id:e.source_document_id,page:e.page,source_url:e.source_url},record_evidence_pointer:scope==='table_level'?o.json_pointer+'/evidence':pointer+'/evidence'})),values:values===null?null:Object.fromEntries(Object.entries(values).filter(([,v])=>v!==undefined)),
      linkage_basis:'Source-local occurrence; lookup normalization does not establish identity.'});
  }
  for(const r of records) {
    if(r.record_format==='r3') {
      const entities=new Map(r.entities.map(e=>[e.entity_local_id,e]));
      for(const e of r.entities)add(r,e,{name:e.name_as_stated,type:e.entity_type,role:e.roles.join('; '),localId:e.entity_local_id});
      // Only explicit source-local associations. Do not inherit an episode's
      // complete list of entities into every observation/action in that episode.
      for(const o of [...r.observations,...r.procedural_actions])for(const ref of o.entity_ids) {
        const e=entities.get(ref);if(!e)throw Error('Missing R3 mention entity');
        add(r,o,{name:e.name_as_stated,type:e.entity_type,role:e.roles.join('; '),stage:o.observation_type||o.action_type,localId:o.observation_id||o.procedural_action_id,values:o.value||{motion_summary:o.motion_summary,result:o.result,vote:o.vote},explicitDate:typeof o.value?.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(o.value.date)?o.value.date:null});
      }
      // Source objects with a standalone durable identifier can be found even
      // when the supplied entity association is empty (e.g. RC6447).
      for(const o of r.observations) for(const field of ['production_permit','well_number','permit_number'])if(typeof o.value?.[field]==='string')
        add(r,o,{name:o.value[field],type:field.includes('well')?'well_identifier':'permit_identifier',role:o.observation_type,stage:o.observation_type,localId:o.observation_id,values:o.value});
    } else {
      const batch07=r.provenance.reported.batch==='07';
      const updatePilot=r.provenance.reported.pilot_id==='ntgcd-source-update-20260925';
      const localNames=new Map([...r.entities.map(e=>[e.id,{name:e.name,type:e.type}]),...r.water_objects.map(o=>[o.id,{name:o.label,type:o.type}])]);
      for(const e of r.entities)add(r,e,{name:e.name,type:e.type,role:e.roles.join('; ')});
      for(const o of r.water_objects)add(r,o,{name:o.label,type:o.type,role:o.role||o.context||o.request||o.relationship||'Named water-domain object',stage:o.stage||o.decision||o.status_at_meeting||(r.provenance.reported.batch==='06'?o.status:null)||null,identifierAllowed:['06','07'].includes(r.provenance.reported.batch)?false:!o.agenda_application_number,values:Object.fromEntries(Object.entries(o).filter(([k])=>!['id','json_pointer','citation_url','evidence'].includes(k))),explicitDate:o.filed_date||o.date_reference||null});
      for(const o of r.episodes) {
        const values=Object.fromEntries(Object.entries(o).filter(([k])=>!['id','json_pointer','citation_url','evidence'].includes(k)));
        for(const actor of o.actors||[])add(r,o,{name:batch07?localNames.get(actor)?.name:actor,type:batch07?localNames.get(actor)?.type||'named_party':'named_party',role:'Explicitly named episode actor',stage:o.stage,values});
        if(updatePilot)for(const ref of [...(o.entity_ids||[]),...(o.water_object_ids||[])]){const named=localNames.get(ref);if(named)add(r,o,{name:named.name,type:named.type,role:'Explicit source-local episode association',stage:o.stage,values});}
        for(const name of o.permit_ids||[])add(r,o,{name,type:'permit_identifier',role:'Explicit episode permit reference',stage:o.stage,values});
      }
      if(batch07)for(const o of r.water_objects)if(o.well_identifier)add(r,o,{name:o.well_identifier,type:'well_identifier',role:'Explicit source well identifier; not a permit number',stage:o.stage||null});
      // Explicit relationship endpoints only, never every participant in a meeting.
      const named=new Map([...r.entities.map(e=>[e.name,e.type]),...r.water_objects.map(o=>[o.label,o.type])]);
      if(batch07)for(const o of r.relationships)for(const field of ['subject','object']){const e=localNames.get(o[field]);if(e)add(r,o,{name:e.name,type:e.type,role:o.predicate,identifierAllowed:false,values:{subject:o.subject,predicate:o.predicate,object:o.object,identity_scope:o.identity_scope,...(o.caution?{caution:o.caution}:{})}});}
      if(updatePilot)for(const o of r.relationships)for(const field of ['subject_id','object_id']){const e=localNames.get(o[field]);if(e)add(r,o,{name:e.name,type:e.type,role:o.predicate,identifierAllowed:false,values:{subject_id:o.subject_id,predicate:o.predicate,object_id:o.object_id,status:o.status}});}
      for(const o of r.relationships)for(const field of ['subject','object'])if(named.has(o[field]))add(r,o,{name:o[field],type:named.get(o[field]),role:o.predicate,identifierAllowed:r.provenance.reported.batch!=='06',values:{subject:o.subject,predicate:o.predicate,object:o.object,identity_scope:o.identity_scope,...(o.caution?{caution:o.caution}:{})}});
      for(const o of r.quantities)add(r,o,{name:o.subject,type:'quantity_subject',role:o.role,stage:o.role,values:Object.fromEntries(Object.entries(o).filter(([k])=>!['id','json_pointer','citation_url','evidence'].includes(k)))});
      for(const t of r.tables)t.rows.forEach((row,i)=>{
        t.columns.forEach((column,j)=>{
          const batch06=r.provenance.reported.batch==='06';
          const key=['04','05','06'].includes(r.provenance.reported.batch)?column.toLowerCase().replaceAll(' ','_'):column;
          const type=/^(well_id|well_number)$/.test(key)?'well_identifier':/^permit_number$/.test(key)?'permit_identifier':/^(request_id|application_id)$/.test(key)?'application_identifier':/^case_id$/.test(key)?'case_identifier':/^investigation_id$/.test(key)?'investigation_identifier':/^(name_as_printed|name|applicant|permittee_as_named|party_as_printed|party_as_named|named_party|parties_as_printed|representative)$/.test(key)?'named_party':/^spring/.test(key)?'spring':/^aquifer$/.test(key)?'aquifer':/^(county|county_or_grid_method|district_or_area|area)$/.test(key)?'place':null;
          const districtNumber=batch06&&r.meeting.district_id==='high_plains_uwcd_1'&&['district_number','district_#'].includes(key)&&/^\d+$/.test(String(row[j]));
          const client=batch06&&key==='client_/_group_count_as_printed'&&/^\d+$/.test(String(row[t.columns.indexOf('District Number')]))&&typeof row[j]==='string'&&!/^\d+$/.test(row[j]);
          const rowType=districtNumber?'district_number_reference':client||(batch06&&key==='applicant_/_well')?'named_party':type||(r.provenance.reported.batch==='05'&&key==='parties_in_printed_group'?'named_party_group':null);
          if(rowType && typeof row[j]==='string')add(r,t,{name:row[j],type:rowType,role:t.name,stage:t.stage,localId:t.row_navigation[i].id,pointer:t.row_navigation[i].json_pointer,objectUrl:t.row_navigation[i].citation_url,scope:'table_level',dateContext:tableRowDate(r,t,row),values:{table_id:t.id,table_name:t.name,columns:t.columns,cells:row,notes:t.notes}});
        });
      });
    }
  }
  occurrences.sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.id.localeCompare(b.id));
  const grouped=new Map();
  for(const o of occurrences){if(!grouped.has(o.lookup_group_id))grouped.set(o.lookup_group_id,[]);grouped.get(o.lookup_group_id).push(o);}
  const groups=[...grouped].map(([id,items])=>({id,label:items[0].as_stated,labels:[...new Set(items.map(o=>o.as_stated))],type:items[0].type,normalized_lookup:normalizeMention(items[0].as_stated),issuer_district_id:items[0].identifier?.issuer_district_id||null,identity_merged:false,grouping_basis:'Exact type and minimally normalized label; identifiers additionally scoped to issuing district. Search grouping only, not a legal identity assertion.',occurrence_ids:items.map(o=>o.id),record_count:new Set(items.map(o=>o.record_id)).size,earliest_in_collection:items.find(o=>o.date)?.date||null}));
  return {schema_version:'1.0.0',profile:'source_linked_mentions',identity_policy:'Dated source-local mentions and explicit associations. No inferred application-to-approval sequence or cross-document identity merges.',group_count:groups.length,occurrence_count:occurrences.length,groups,occurrences};
}

export function resolveResearchLeads(inputs,records) {
  const byId=new Map(records.map(r=>[r.id,r]));
  function resolve(ref) {
    const r=byId.get(ref.record_id);
    if(!r)return {...ref,resolution:{status:'unresolved',reason:'Record ID absent from public corpus'}};
    if(ref.district_id!==r.meeting.district_id)throw Error('Lead district mismatch');
    const evidence=(ref.evidence||[]).map(e=>{
      if(e.source_document_id!==r.meeting.source_document_id||(r.provenance.reported?.batch==='07'&&e.source_url.split('#')[0]!==r.meeting.source_url))throw Error('Lead source mismatch');
      if(r.meeting.source_media_type==='text/html'){
        if('page' in e||'page_basis' in e||!e.native_locator||e.source_url!==r.meeting.source_url)throw Error('Lead native evidence mismatch');
        const candidates=[r.meeting,...r.entities,...r.episodes,...r.water_objects,...r.unresolved,...r.unavailable_references].flatMap(o=>o.evidence);
        const match=candidates.find(x=>x.native_locator?.map_path===e.native_locator.map_path&&x.native_locator?.block_id===e.native_locator.block_id&&x.native_locator?.supporting_text===e.native_locator.supporting_text);
        if(!match)throw Error('Unresolved native lead citation');return structuredClone(match);
      }
      if(!Number.isInteger(e.page)||e.page<1||e.page>r.meeting.page_count||e.native_locator)throw Error('Lead page mismatch');return e;
    });
    const candidates=ref.candidate_entities?.map(e=>{
      const match=r.entities.find(x=>x.entity_local_id===e.entity_local_id||x.id===e.entity_local_id);
      return {...e,resolution:match?{status:'resolved',object_url:match.citation_url,json_pointer:match.json_pointer}:{status:'unresolved',reason:'Original entity reference absent or excluded from public record'}};
    });
    return {...ref,...(ref.evidence?{evidence}:{}),...(candidates?{candidate_entities:candidates}:{}),resolution:{status:'resolved',record_url:r.canonical_url,json_url:r.json_url}};
  }
  const sources=inputs.map(input=>input.pilot_id==='north-plains-blf-watch-01'?{schema_version:input.schema_version,pilot_id:input.pilot_id,qualification:input.qualification}:Object.fromEntries(Object.entries(input).filter(([k])=>k!=='leads')));
  const leads=inputs.flatMap(input=>input.leads.map(l=>{
    if(input.pilot_id==='two-district-2026-minutes-infill-01'){
      if(l.status!=='candidate'||l.identity_merge_performed!==false)throw Error('Infill lead must remain tentative');
      const refs=l.references.map((ref,i)=>{
        const r=byId.get(ref.record_id);
        if(!r)throw Error('Infill lead record missing');
        return resolveChainReference({...ref,reference_id:`${l.id}-ref-${i+1}`,source_sha256:r.meeting.source_document_id.slice(7),record_role:'candidate_research_lead'},records);
      });
      return {id:input.pilot_id+':'+l.id,original_id:l.id,original_status:l.status,label:l.label,kind:'district_minutes_candidate',status:'possible_linkage_only',identity_merged:false,provenance:{pilot_id:input.pilot_id,source_schema:'batch02-source-bounded-1.0'},reason_to_investigate:l.statement,source_refs:refs.map(r=>r.id),reference_mappings:refs.map(r=>({original_reference_id:r.id,record_id:r.record_id,item_id:r.item_id,json_pointer:r.json_pointer,object_url:r.human_url})),occurrences:refs.map(ref=>{const r=byId.get(ref.record_id);return {record_id:r.id,district_id:r.meeting.district_id,meeting_date:r.meeting.meeting_date,source_date:r.dates.source_date,names_or_identifiers:[],names_or_identifiers_status:'not_supplied',evidence:ref.evidence.map(e=>({source_document_id:e.source_document_id,page:e.page,source_url:e.source_url})),resolution:{status:'resolved',record_url:r.canonical_url,json_url:r.json_url}};}),prior_corpus_candidates:[]};
    }
    if(input.provenance?.pilot_id==='north-plains-blf-source-chain-01'||input.pilot_id==='north-plains-blf-watch-01') {
      const pilot=input.pilot_id||input.provenance.pilot_id;
      const sourceReferences=input.pilot_id==='north-plains-blf-watch-01'?l.source_refs.map(id=>{const ref=input.source_refs.find(r=>r.id===id);if(!ref)throw Error('Missing watch lead reference');return {...ref,reference_id:ref.id,record_role:'accepted_historical_update'};}):l.references;
      if(!['candidate','candidate_identity_only'].includes(l.status))throw Error('Unexpected source-chain lead status');
      const refs=sourceReferences.map(ref=>resolveChainReference(ref,records));
      return {id:pilot+':'+l.id,original_id:l.id,original_status:l.status,label:l.statement,kind:'source_chain_candidate',status:'possible_linkage_only',identity_merged:false,provenance:{pilot_id:pilot,source_schema:input.schema_version},reason_to_investigate:l.statement,source_refs:l.source_refs,
        reference_mappings:refs.map(r=>({original_reference_id:r.id,record_id:r.record_id,item_id:r.item_id,json_pointer:r.json_pointer,object_url:r.human_url})),
        occurrences:refs.map(ref=>{const r=byId.get(ref.record_id);return {record_id:r.id,district_id:r.meeting.district_id,meeting_date:r.meeting.meeting_date,source_date:r.dates.source_date,names_or_identifiers:[],names_or_identifiers_status:'not_supplied',evidence:ref.evidence.map(e=>e.native_locator?e:{source_document_id:e.source_document_id,page:e.page,source_url:e.source_url}),resolution:{status:'resolved',record_url:r.canonical_url,json_url:r.json_url}};}),prior_corpus_candidates:[]};
    }
    if(l.identity_merged!==false||l.status!=='possible_linkage_only')throw Error('Unexpected candidate identity assertion');
    const format=input.schema_version||(input.batch==='06'?records.find(r=>r.provenance.reported?.batch==='06')?.provenance.source_schema:null);
    if(!format)throw Error('Unregistered lead compatibility format');
    return {...structuredClone(l),provenance:{batch:input.batch,source_schema:format},occurrences:l.occurrences.map(o=>resolve({...o,...(!Array.isArray(o.names_or_identifiers)?{names_or_identifiers:[],names_or_identifiers_status:'not_supplied'}:{}),meeting_date:o.meeting_date??o.source_date??null})),prior_corpus_candidates:(l.prior_corpus_candidates||[]).map(resolve)};
  }));
  if(new Set(leads.map(l=>l.id)).size!==leads.length)throw Error('Duplicate candidate lead ID');
  return {schema_version:'1.0.0',batch:'cumulative',profile:'candidate_research_leads',source_schema:'batch02-source-bounded-1.0',identity_policy:'Candidate-only leads, with original per-batch discovery limitations. Resolved links mean pointers resolve, not confirmed identity.',sources,leads};
}
