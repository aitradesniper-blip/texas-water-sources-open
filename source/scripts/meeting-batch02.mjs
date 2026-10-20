// Shared source-bounded adapter. "batch02" is a compatibility format, not a batch.
import {mentionDate,dateContextProperties,isCompilation,compilationSections,tableRowDate} from '../lib/meeting-date-context.mjs';
import {nativeEvidenceSchema,projectNativeEvidence} from './meeting-native-evidence.mjs';
import {isResortPilot, projectPilotAnnotations} from './meeting-pilot.mjs';
import {isNorthPlains,northPlainsRole} from '../lib/north-plains-context.mjs';
import {extendNorthPlainsDefinitions,extendNorthPlainsProfile} from './meeting-north-plains.mjs';
import {isWatch01,extendWatchDefinitions,extendWatchProfile,watchItemDate} from './meeting-watch01.mjs';
import {isInfill01,extendInfillDefinitions,extendInfillProfile,projectInfillComparisons} from './meeting-infill01.mjs';
const string = { type: 'string' }, nullable = { type: ['string', 'null'] };
const strings = { type: 'array', items: string };
const array = items => ({ type: 'array', items });
const object = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const namedStrings = names => Object.fromEntries(names.split(' ').map(k => [k, string]));
const evidence = array({ $ref: '#/$defs/batch02_evidence' });
const linkFields = { id: string, json_pointer: string, citation_url: string, evidence };
const nullableNumber = {type:['number','null']};
const dateCandidate = object({date:string,context:string,page:{type:'integer',minimum:1}});
const updatePilotId = 'ntgcd-source-update-20260925';
// Explicit public date projection from the supplied date notes/section evidence.
// These alternatives are NOT resolved event dates or replacements for null.
export const unresolvedDateCandidates = {
  'batch03-coastal_bend_gcd-17ec378b6fe8': [
    {date:'2025-11-21',context:'Meeting heading',page:1},
    {date:'2025-11-11',context:'Permit-hearing paragraph; conflicts with heading',page:1},
  ],
  'batch03-hickory_uwcd_1-c3b93937db56': [
    {date:'2026-06-11',context:'DFC-hearing heading',page:1},
    {date:'2026-06-10',context:'DFC-hearing body',page:1},
  ],
};

export const batch02Definitions = {
  json_cell: { anyOf: [{ type: ['string','number','boolean','null'] }, array({ $ref:'#/$defs/json_cell' }), { type:'object', additionalProperties:{ $ref:'#/$defs/json_cell' } }] },
  batch02_evidence: object({source_document_id:string,page:{type:'integer',minimum:1},page_basis:string,source_url:string,evidence_method:{const:'PDF_PAGE_REFERENCE'},claim_url:string,object_id:string,json_pointer:string}),
  batch02_entity: object({...linkFields,name:string,type:string,roles:strings,identity_scope:string}),
  batch02_water_object: object({...linkFields,...namedStrings('type label applicant application_type aquifer block caption ccn classification compliance_context context court date_reference decision filed_date grid holder_as_named latitude_dms longitude_dms organization_as_named owner parcel parties party permit_application property purpose relationship request request_type role section short_name status_at_meeting type_as_printed use well_class'), aquifers:strings,construction_dates:strings,parcel_ids:strings,latitude:{type:'number'},longitude:{type:'number'},wells:array(object({local_label:string,latitude:{type:'number'},longitude:{type:'number'}}))},['id','json_pointer','citation_url','evidence','type','label']),
  batch02_episode: object({...linkFields,...namedStrings('topic stage statement status_at_meeting verbatim_decision section_date date_status'),actors:strings,gpu_ids:strings,well_ids:strings,permit_ids:strings,section_dates:strings},['id','json_pointer','citation_url','evidence','topic','stage','statement']),
  batch02_quantity: object({...linkFields,...namedStrings('subject role time_basis_note interpretation model unit_note value_type equivalence_group comparator section_date allocation_scope aggregation_warning source_text'),datum:nullable,value:{$ref:'#/$defs/json_cell'},unit:nullable,time_basis:nullable,approximate:{type:'boolean'},observed:{type:'boolean'},uncertainty_plus_minus:{type:'number'}},['id','json_pointer','citation_url','evidence','subject','role','value','unit','time_basis']),
  batch02_table: object({...linkFields,name:string,columns:strings,rows:array(array({$ref:'#/$defs/json_cell'})),stage:string,notes:nullable,row_navigation:array(object({id:string,json_pointer:string,citation_url:string,evidence_scope:{const:'table_level'},table_id:string}))}),
  batch02_relationship: object({...linkFields,subject:string,predicate:string,object:string,identity_scope:string,caution:string},['id','json_pointer','citation_url','evidence','subject','predicate','object','identity_scope']),
  batch02_unresolved: object({...linkFields,statement:string}),
  batch02_unavailable: object({...linkFields,description:string}),
};
Object.assign(batch02Definitions.batch02_water_object.properties, {
  ...namedStrings('applicant_as_named party_as_named project stage well_identifiers_as_printed allocation_scope trial_case trial_court appeal_case appeal_court water_source presenter_requested state_plug_report'),
  holder_as_named:nullable,identifier:nullable,well_identifier:nullable,
  well_identifiers_as_printed:{anyOf:[nullable,strings]},
  quantity:nullableNumber,water_level_value:nullableNumber,allocation:nullableNumber,capacity:nullableNumber,
  well_count:{type:'integer',minimum:0},permit_ids:{type:['array','null'],items:string},well_ids:{type:['array','null'],items:string},
  ...namedStrings('identifier_note condition identity_scope application_id report_date status subject location_as_printed as_of location_or_transfer'),
  party_as_named:nullable,request_type:nullable,requested_use:nullable,well_id:nullable,subject_identity:nullable,
  grandfathered:{type:'boolean'},agenda_application_number:{type:'integer',minimum:1},printed_entry_number:{type:'integer',minimum:1},production_report_calendar_year:{type:'integer'},
});
Object.assign(batch02Definitions.batch02_episode.properties,namedStrings('end_date termination_condition'));
batch02Definitions.batch02_episode.properties.date_context=object(dateContextProperties,['date','date_role','date_note','date_candidates']);
const dateContext=object(dateContextProperties,['date','date_role','date_note','date_candidates']);
for(const group of ['entity','water_object','quantity','relationship','unresolved','unavailable'])batch02Definitions['batch02_'+group].properties.date_context=dateContext;
batch02Definitions.batch02_table.properties.row_navigation.items.properties.date_context=dateContext;
Object.assign(batch02Definitions.batch02_quantity.properties,{...namedStrings('decision printed_unit period_start_as_printed as_of period_status'),qualifier:nullable});
batch02Definitions.batch02_evidence={oneOf:[batch02Definitions.batch02_evidence,nativeEvidenceSchema]};
batch02Definitions.batch02_entity.properties.context=string;
Object.assign(batch02Definitions.batch02_entity.properties,{
  entity_type:string,aliases:strings,
});
Object.assign(batch02Definitions.batch02_water_object.properties,{aquifer:nullable,location_as_printed:nullable});
// Batch 08 preserves table-cell provenance and multiple role-qualified section dates.
batch02Definitions.batch02_episode.properties.source_text_qualification=string;
Object.assign(batch02Definitions.batch02_quantity.properties,{
  section_date:nullable,
  section_dates:array(object({date:string,role:string,pages:array({type:'integer',minimum:1})})),
  table_id:string,table_row:{type:'integer',minimum:1},table_column:string,
});
Object.assign(batch02Definitions.batch02_table.properties,{section_date:string,date_context:dateContext});
batch02Definitions.batch02_water_object.properties.context=nullable;
batch02Definitions.batch02_water_object.properties.well_ids={type:['array','null'],items:nullable};
batch02Definitions.batch02_quantity.properties.model={type:['string','boolean']};
Object.assign(batch02Definitions.batch02_water_object.properties,{
  name:string,object_type:string,location:string,capacity_unit:nullable,
  coordinate_labels:{$ref:'#/$defs/json_cell'},permit_number:string,project_id:string,
  system_id:string,purpose_of_use:string,applicant_id:string,
});
Object.assign(batch02Definitions.batch02_episode.properties,{
  title:string,section_date_role:string,entity_ids:strings,water_object_ids:strings,
  motion_by:string,seconded_by:string,vote:{$ref:'#/$defs/json_cell'},
  approval_date:string,report_period_end:string,report_periods:{$ref:'#/$defs/json_cell'},
});
Object.assign(batch02Definitions.batch02_quantity.properties,{
  qualification:string,comparison:string,
});
Object.assign(batch02Definitions.batch02_table.properties,{representation:string});
Object.assign(batch02Definitions.batch02_table.properties.row_navigation.items.properties,{
  original_id:string,evidence,
});
Object.assign(batch02Definitions.batch02_relationship.properties,{
  subject_id:string,object_id:string,status:string,
});
Object.assign(batch02Definitions.batch02_unresolved.properties,{
  question:string,qualification:string,
});
Object.assign(batch02Definitions.batch02_unavailable.properties,{
  title:string,availability:string,qualification:string,
});

export function batch02Profile(envelope, nullableDates = false) {
  const dates = structuredClone(envelope.dates);
  if(nullableDates) {
    dates.properties.source_date=nullable;
    dates.properties.date_role.enum.push('unresolved_document_date','multi_meeting_compilation');
    dates.properties.source_date_candidates=array(dateCandidate);
    dates.required.push('source_date_candidates');
  }
  dates.properties.sections=array(object({...dateContextProperties,pages:array({type:'integer',minimum:1}),item_ids:strings},['date','date_role','date_note','date_candidates','pages','item_ids']));
  const meeting=object({meeting_id:string,district_id:string,district_name:string,meeting_date:nullableDates?nullable:string,approved_date:nullable,date_note:nullable,source_document_id:string,source_url:string,page_count:{type:['integer','null'],minimum:1},evidence,citation_url:string,json_pointer:string});
  Object.assign(meeting.properties, {source_media_type:{enum:['application/pdf','text/html']},signature_date:nullable,signature_date_evidence:evidence,signature_dates:array(object({date:string,pages:array({type:'integer',minimum:1}),meaning:string,evidence}))});
  meeting.allOf=[{if:{required:['source_media_type'],properties:{source_media_type:{const:'text/html'}}},then:{properties:{page_count:{type:'null'},evidence:{items:nativeEvidenceSchema}}},else:{properties:{page_count:{type:'integer',minimum:1},evidence:{items:batch02Definitions.batch02_evidence.oneOf[0]}}}}];
  meeting.properties.date_candidates=array(object({date:nullable,role:string,qualification:string,evidence}));
  const profile=object({
    ...envelope, dates, record_format:{const:nullableDates?'source_bounded':'batch02'}, document_type:string, meeting,
    meeting_summary:string,meeting_summary_evidence:evidence,
    entities:array({$ref:'#/$defs/batch02_entity'}),water_objects:array({$ref:'#/$defs/batch02_water_object'}),episodes:array({$ref:'#/$defs/batch02_episode'}),quantities:array({$ref:'#/$defs/batch02_quantity'}),tables:array({$ref:'#/$defs/batch02_table'}),relationships:array({$ref:'#/$defs/batch02_relationship'}),unresolved:array({$ref:'#/$defs/batch02_unresolved'}),unavailable_references:array({$ref:'#/$defs/batch02_unavailable'}),
    provenance:object({source_schema:{const:'batch02-source-bounded-1.0'},source_record_state:string,human_reviewed:{type:'null'},original_public_release_authorized:{type:'null'},review_scope:string,reported:object({batch:string,priority:{type:'integer'},sha256:string,scope:string,extraction_date:string,read_completeness:string,page_review:array(object({page:{type:'integer',minimum:1},reviewed:{type:'boolean'},content:string,method:string}))})}),
  });
  const reported=profile.properties.provenance.properties.reported;
  reported.required=reported.required.filter(k=>k!=='page_review');
  reported.required=reported.required.filter(k=>!['batch','priority'].includes(k));
  Object.assign(reported.properties,{pilot_id:string,queue_review_id:string,source_bytes:{type:'integer',minimum:1},source_acquired_at:nullable,acquisition_time_note:string,source_checked_at:string,source_check_basis:string,source_check_note:string,reader_type:string,human_reviewed:{type:'boolean'},limitations:strings});
  reported.properties.page_review.items.properties.printed_page={type:['integer','null'],minimum:1};
  reported.oneOf=[{required:['batch','priority'],not:{required:['pilot_id']}},{required:['pilot_id','source_bytes','source_acquired_at','source_checked_at','source_check_basis'],not:{anyOf:[{required:['batch']},{required:['priority']}]}}];
  Object.assign(reported.properties,{source_package_sha256:string,acquired_at:string,acquisition_metadata_basis:string,independent_human_review:{type:'boolean'},readability_limits:string,native_locations:string,native_review:array(object({block_id:string,reviewed:{type:'boolean'},content:string,method:string})),dependency_note:string,native_profile_note:string,missing_dependencies:array({oneOf:[object({url:string,status:{type:'integer'},checked_at:string,qualification:string,observation_basis:string}),object({files:strings,source_markup_basis:string,status:string,evidence_note:string})]})});
  profile.allOf=[{if:{properties:{meeting:{required:['source_media_type'],properties:{source_media_type:{const:'text/html'}}}}},then:{properties:{provenance:{properties:{reported:{required:['native_locations','native_review','missing_dependencies'],not:{required:['page_review']}}}}}},else:{properties:{provenance:{properties:{reported:{required:['page_review']}}}}}}];
  extendNorthPlainsProfile(profile);
  extendWatchProfile(profile);
  extendInfillProfile(profile);
  return profile;
}

export function batch02DocumentRole(r) {
  if(northPlainsRole(r))return northPlainsRole(r);
  if(isInfill01(r))return {document_label:'Minutes',date_role:'recorded_meeting_date',date_note:r.meeting.date_note||null};
  const type=r.document_type;
  if(isResortPilot(r)&&r.id==='pilot-ntgcd-aqua-resort-6ce018e10a30')return {document_label:'Minutes',date_role:'recorded_meeting_date',date_note:r.meeting.date_note||null};
  if(type==='historical_management_plan_submission_packet_with_notices_adoption_resolution_reports_and_appended_rules')return {document_label:'Historical management-plan submission packet with district notices, adoption resolution, reports and appended rules',date_role:'recorded_meeting_date',date_note:r.meeting.date_note};
  if(type==='native_hearing_scheduling_notice')return {document_label:'Hearing-scheduling notice',date_role:'unresolved_document_date',date_note:r.meeting.date_note};
  if(type.startsWith('scheduled_board_agenda_packet'))return {document_label:'Scheduled agenda packet with draft prior minutes and attachments',date_role:'scheduled_date',date_note:r.meeting.date_note||null};
  if(isCompilation(r))return {document_label:'Multi-meeting compilation · unsigned signature lines',date_role:'multi_meeting_compilation',date_note:r.meeting.date_note||null};
  if(type.startsWith('approved_')&&type.includes('minutes')&&type.includes('draft_budget_attachment'))return {document_label:'Approved minutes with a draft budget attachment',date_role:'recorded_meeting_date',date_note:r.meeting.date_note||null};
  if(type==='agenda_form_with_recorded_motions')return {document_label:'Agenda-form record with recorded outcomes',date_role:'recorded_meeting_date',date_note:r.meeting.date_note||null};
  const label=type.includes('draft') ? 'Draft minutes' : type.includes('unsigned') ? 'Unsigned minutes' : type.includes('minutes') ? (type.includes('with') ? 'Minutes and attachments' : 'Minutes') : type.includes('notice') && !type.includes('agenda') ? 'Hearing notice' : type.includes('agenda') ? 'Agenda and supporting material' : 'Hearing packet';
  return { document_label:label,date_role:r.meeting.meeting_date===null?'unresolved_document_date':type.includes('minutes')?'recorded_meeting_date':'scheduled_date',date_note:r.meeting.date_note || null };
}

export function adaptBatch02(raw, {url,hash,nativeMaps=[]}) {
  if(raw.schema_version!=='batch02-source-bounded-1.0') throw Error('Wrong input format for Batch 02 adapter');
  const r=structuredClone(raw), canonical=url('/groundwater-districts/intelligence/meetings/'+r.id);
  const resortPilot=isResortPilot(raw),namedPilot=typeof raw.provenance?.pilot_id==='string';
  const updatePilot=raw.provenance?.pilot_id===updatePilotId;
  const northPlains=isNorthPlains(raw);
  const watch=isWatch01(raw);
  const infill=isInfill01(raw);
  if(infill)r.source_publisher=raw.publisher;
  if(infill)r.relationships.forEach(o=>{o.subject=o.subject_id;o.object=o.object_id;o.identity_scope='source_local_relationship_not_merged_identity';});
  if(infill)r.quantities.forEach(o=>{o.subject=o.allocation_scope;});
  if(watch){r.source_publisher=raw.publisher;r.relationships.forEach(o=>{o.subject=o.subject_id;o.object=o.object_id;o.identity_scope='source_local_relationship_not_merged_identity';});}
  if(northPlains) {
    r.source_publisher=raw.publisher;
    if(r.provenance.acquisition_metadata)delete r.provenance.acquisition_metadata.metadata_local_path;
    r.meeting.date_candidates?.forEach(c=>{if(!('qualification' in c))c.qualification='Scheduled calendar context only; no completed argument established.';});
  }
  if(resortPilot)projectPilotAnnotations(r);
  if(updatePilot) {
    r.entities.forEach(e=>{e.type=e.entity_type;e.identity_scope='source_local';});
    r.water_objects.forEach(o=>{o.type=o.object_type;o.label=o.name;});
    r.episodes.forEach(o=>{o.topic=o.title;});
    r.relationships.forEach(o=>{o.subject=o.subject_id;o.object=o.object_id;o.identity_scope=o.status;});
    r.unresolved.forEach(o=>{o.statement=o.question;});
    r.unavailable_references.forEach(o=>{o.description=o.title;});
    r.meeting.date_candidates?.forEach(c=>{c.qualification=`Source-stated ${c.role.replaceAll('_',' ')}; retained separately from other date roles.`;});
  }
  const sourceId=r.meeting.source_document_id;
  function refs(evidence,pointer,id) {
    return (northPlains?evidence.flat():evidence).map(e=>{
      if(r.meeting.source_media_type==='text/html')return projectNativeEvidence(e,nativeMaps.find(m=>m.record_id===r.id),{claim_url:canonical+'#'+id,object_id:id,json_pointer:pointer});
      if(e.source_document_id!==sourceId || !Number.isInteger(e.page) || e.page<1 || e.page>r.meeting.page_count) throw Error('Invalid Batch 02 page reference');
      if(e.evidence_method || e.quote || e.page_image_sha256) throw Error('Unexpected fabricated/unsupported Batch 02 evidence metadata');
      return {...e,evidence_method:'PDF_PAGE_REFERENCE',claim_url:canonical+'#'+id,object_id:id,json_pointer:pointer};
    });
  }
  function annotate(o,pointer,id=o.id) {o.citation_url=canonical+'#'+id;o.json_pointer=pointer;o.evidence=refs(o.evidence,pointer,id);}
  for(const group of ['entities','water_objects','episodes','quantities','tables','relationships','unresolved','unavailable_references']) r[group].forEach((o,i)=>annotate(o,`/${group}/${i}`));
  if(watch||infill)for(const group of ['figures','date_contexts'])r[group].forEach((o,i)=>annotate(o,`/${group}/${i}`));
  r.tables.forEach((t,i)=>{
    if((northPlains||watch||infill)&&t.row_evidence)t.row_evidence=t.row_evidence.map(e=>({...e,evidence:refs(e.evidence,`/tables/${i}/row_evidence/${e.row_index}`,watch?t.row_ids[e.row_index]:t.id+'-row-'+(e.row_index+1))}));
    const sourceRows=t.rows;
    t.rows=sourceRows.map(row=>Array.isArray(row)?row:row.values);
    t.row_navigation=sourceRows.map((sourceRow,j)=>{
      const row=Array.isArray(sourceRow)?sourceRow:sourceRow.values;
      if(row.length!==t.columns.length) throw Error('Batch 02 table width mismatch');
      const id=watch?t.row_ids[j]:Array.isArray(sourceRow)?t.id+'-row-'+(j+1):sourceRow.id;
      return {id,json_pointer:`/tables/${i}/rows/${j}`,citation_url:canonical+'#'+id,evidence_scope:'table_level',table_id:t.id,...(!Array.isArray(sourceRow)?{original_id:id,evidence:refs(sourceRow.evidence,`/tables/${i}/row_navigation/${j}`,id)}:{})};
    });
  });
  annotate(r.meeting,'/meeting','source-heading');
  if(r.meeting.signature_date_evidence)r.meeting.signature_date_evidence=refs(r.meeting.signature_date_evidence,'/meeting/signature_date','source-heading');
  r.meeting.signature_dates?.forEach((s,i)=>{s.evidence=refs(s.evidence,`/meeting/signature_dates/${i}`,'source-heading');});
  r.meeting.date_candidates?.forEach((c,i)=>{c.evidence=refs(c.evidence,`/meeting/date_candidates/${i}`,'source-heading');});
  r.meeting_summary_evidence=refs(r.meeting_summary_evidence,'/meeting_summary','meeting-summary');
  if(namedPilot&&!r.provenance.scope)r.provenance.scope=r.provenance.read_completeness;
  r.provenance={source_schema:r.schema_version,source_record_state:r.record_state,human_reviewed:null,original_public_release_authorized:null,review_scope:'Source-bounded extraction; reading descriptions retained as reported provenance, not independently assigned page methods or human review.',reported:r.provenance};
  Object.assign(r,{schema_version:'1.0.0',record_format:'batch02',record_state:'release_candidate',canonical_url:canonical,json_url:url('/data/water-watch/v1/meetings/'+r.id+'.json'),publisher:'Texas Water Sources',collection_role:'source_linked_research_not_official_registry',
    dates:{source_date:r.meeting.meeting_date,source_date_basis:r.meeting.date_note || 'Selected date reported by supplied source-bounded extraction',routing_date:null,extraction_date:r.provenance.reported.extraction_date,last_source_check:null,publication_date:null,...batch02DocumentRole(r)},partial_pages:[],correction_notes:['Original extraction unchanged. Archive-relative PDF filename excluded; supported content retained. Page references are not quotations or image-method evidence.']});
  if(r.meeting.meeting_date===null) {
    if(!r.meeting.date_note)throw Error('Unresolved document date requires context');
    r.record_format='source_bounded';
    r.dates.source_date_candidates=structuredClone(unresolvedDateCandidates[r.id]||[]);
    if(northPlainsRole(r))r.dates.source_date=r.meeting.date_candidates.find(c=>c.role===r.dates.date_role)?.date||null;
  }
  if(isCompilation(r)) {
    r.dates.sections=compilationSections(r);
    r.tables.forEach(t=>t.row_navigation.forEach((n,i)=>{n.date_context=tableRowDate(r,t,t.rows[i]);}));
  }
  // Only new items receive this derived role projection; earlier record bytes stay stable.
  if(r.provenance.reported.batch==='04')r.episodes.forEach(o=>{if(o.section_date||o.section_dates)o.date_context=mentionDate(r,o);});
  if(r.provenance.reported.batch==='05')for(const group of ['episodes','quantities','entities','water_objects','relationships','unresolved','unavailable_references'])r[group].forEach(o=>{o.date_context=mentionDate(r,o);});
  if(['06','07','08'].includes(r.provenance.reported.batch)) {
    for(const group of ['episodes','quantities','entities','water_objects','relationships','unresolved','unavailable_references'])r[group].forEach(o=>{o.date_context=mentionDate(r,o);});
    r.tables.forEach(t=>t.row_navigation.forEach((n,i)=>{n.date_context=tableRowDate(r,t,t.rows[i]);}));
  }
  if(r.provenance.reported.batch==='08')r.tables.forEach(t=>{t.date_context=mentionDate(r,t);});
  if(namedPilot) {
    for(const group of ['episodes','quantities','entities','water_objects','relationships','unresolved','unavailable_references'])r[group].forEach(o=>{o.date_context=mentionDate(r,o);});
    r.tables.forEach(t=>{t.date_context=mentionDate(r,t);t.row_navigation.forEach((n,i)=>{n.date_context=tableRowDate(r,t,t.rows[i]);});});
    r.dates.last_source_check=r.provenance.reported.source_checked_at;
  }
  if(watch){
    for(const group of ['episodes','quantities','entities','water_objects','relationships','unresolved','unavailable_references'])r[group].forEach(o=>{o.date_context=watchItemDate(r,o);});
    r.tables.forEach(t=>{t.date_context=watchItemDate(r,t);t.row_navigation.forEach(n=>{n.date_context=watchItemDate(r,t);});});
    r.correction_notes.push('Watch 01 complete historical reading. Original acceptance/publication flags describe extraction-time state; local acceptance is separately receipted. Unknown acquisition/check times remain null. Relationship endpoint aliases and supplied row identifiers are retained; attachments do not inherit the meeting date.');
  }
  if(resortPilot) {
    r.correction_notes.push('Named pilot, not a numbered batch. Source-check time carried from acquisition; no new official-source check. Cross-document context annotations relocated to the linked matter with field-level notes; September filing date projected as September 11, distinct from scheduled September 16.');
  }
  if(updatePilot)r.correction_notes.push('Named district-source update pilot, not a numbered batch. Accepted reading, prepared import and publication remain separate states; no Resort matter event or source membership is added. Source-check time is carried from the collector observation, not this import.');
  if(infill){
    projectInfillComparisons(r,url);
    r.correction_notes.push('Named district minutes infill pilot. Retained extraction unchanged; accepted reading and proposed website import do not advance public publication or source-check time. March/April comparisons are explicitly linked to both documents in source_comparison_annotations.');
  }
  if(northPlains)r.correction_notes.push('Source-chain pilot: issuer and source publisher retained separately from the website publisher. Null district meeting dates remain null; dated court orders, map and calendar use explicit document roles. Calendar table evidence lists are flattened one level without changing supporting text; row evidence and grouping retained. Source checks are copied acquisition observations, not this import.');
  if(r.provenance.reported.batch==='07')r.correction_notes=['Original extraction unchanged. Archive-relative original filename omitted; source identity, URL and reported provenance retained. Native block text is whitespace-normalized retained-source text, not raw HTML or a PDF page.'];
  r.content_version=hash(r);
  return r;
}

export function batch02Search(r, searchWords) {
  const dated=isCompilation(r)||['06','07','08'].includes(r.provenance.reported.batch)||Boolean(r.provenance.reported.pilot_id);
  const matter=(o,label)=>({id:o.id,label,searchText:searchWords(r.provenance.reported.batch==='07'?[o,(o.evidence||[]).flatMap(e=>e.native_locator?[e.native_locator.supporting_text]:[])]:o),...(dated?{dateContext:mentionDate(r,o),topic:o.topic||null,stage:o.stage||o.role||null}:{})});
  const matters=[...r.episodes.map(o=>matter(o,o.topic)),...r.water_objects.map(o=>matter(o,o.label)),...r.quantities.map(o=>matter(o,`${o.subject} · ${o.role}`)),...r.entities.map(o=>matter(o,o.name)),...r.relationships.map(o=>matter(o,`${o.subject} · ${o.predicate}`)),...r.unresolved.map(o=>matter(o,'Unresolved issue')),...(r.figures||[]).map(o=>matter(o,o.title)),...(r.date_contexts||[]).map(o=>matter(o,o.date_role||o.role||'Date context')),
    ...r.tables.flatMap(t=>[matter(t,t.name),...t.rows.map((row,i)=>({id:t.row_navigation[i].id,label:`${t.name} · ${row.slice(0,2).join(' · ')} (row ${i+1})`,searchText:searchWords([t.name,t.columns,row]),...(dated?{dateContext:tableRowDate(r,t,row),topic:null,stage:t.stage}:{})}))])];
  return {key:r.id,id:r.meeting.meeting_id,districtId:r.meeting.district_id,district:r.meeting.district_name,date:r.meeting.meeting_date,routingDate:null,pages:r.meeting.page_count,summary:r.meeting_summary,topics:[...new Set(r.episodes.map(e=>e.topic))],stages:[...new Set([...r.episodes,...r.water_objects,...r.quantities,...r.tables].map(o=>o.stage||o.role).filter(Boolean))].sort(),sourceUrl:r.meeting.source_url,citations:r.meeting_summary_evidence.map(e=>e.native_locator?{native_locator:e.native_locator}:{page:e.page}),...(r.meeting.source_media_type?{sourceMediaType:r.meeting.source_media_type}:{}),partial:false,partialPages:[],canonical_url:r.canonical_url,json_url:r.json_url,content_version:r.content_version,recordFormat:r.record_format,documentType:r.dates.document_label,dateRole:r.dates.date_role,dateNote:r.meeting.date_note,
    searchText:searchWords([r.meeting.district_name,r.meeting_summary,r.entities,r.water_objects,r.episodes,r.quantities,r.tables,r.relationships,r.unresolved,r.unavailable_references,...(r.figures||[]),...(r.date_contexts||[])]),matters,...(isNorthPlains(r)?{date:r.dates.source_date,issuer:r.issuer,districtRole:r.meeting.district_role}: {})};
}
extendNorthPlainsDefinitions(batch02Definitions);
extendWatchDefinitions(batch02Definitions);
extendInfillDefinitions(batch02Definitions);
