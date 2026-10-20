import {atPointer} from './meeting-matters.mjs';
import {resolveChainReference} from './meeting-source-chain.mjs';
import {createHash} from 'node:crypto';

export function applyWatch01Update(base,proposal,records,{hash}) {
 const bytes=JSON.stringify(base,null,2)+'\n';
 if(base.matter_id!==proposal.matter_id||base.content_version!==proposal.baseline.content_version||createHash('sha256').update(bytes).digest('hex')!==proposal.baseline.file_sha256)throw Error('Watch update baseline mismatch');
 const bindings=new Map(proposal.comparison_bindings.map(b=>[b.id,b]));
 for(const b of bindings.values())if(JSON.stringify(atPointer(base,b.json_pointer))!==JSON.stringify(b.original_value))throw Error('Changed comparison binding '+b.id);
 const m=structuredClone(base),refs=proposal.source_refs.map(ref=>resolveChainReference({...ref,reference_id:ref.id,record_role:'accepted_historical_update'},records));
 if(refs.length!==12||new Set([...m.source_refs,...refs].map(r=>r.id)).size!==77)throw Error('Watch update reference inventory mismatch');
 m.source_refs.push(...refs);
 m.update_annotations=[];m.derived_answer_revisions=[];
 const known=new Set(m.source_refs.map(r=>r.id));
 for(const c of proposal.proposed_changes){
  if(c.new_source_refs.some(id=>!known.has(id))||c.comparison_bindings.some(id=>!bindings.has(id)))throw Error('Unresolved update binding '+c.id);
  const value=structuredClone(c.proposed_value), source_refs=[...new Set([...c.comparison_bindings.flatMap(id=>bindings.get(id).source_reference_ids),...c.new_source_refs])];
  if(c.operation==='append_source_member'){
   if(m.source_record_ids.includes(value))throw Error('Duplicate update source');
   const r=records.find(r=>r.id===value);if(!r)throw Error('Missing update source');
   m.source_record_ids.push(value);m.new_source_record_ids.push(value);
   m.source_documents.push({record_id:r.id,record_role:'accepted_historical_update',issuer:r.issuer,document_label:r.dates.document_label,date_role:r.dates.date_role,source_date:r.dates.source_date,meeting_date:r.meeting.meeting_date,approved_date:r.meeting.approved_date,source_document_id:r.meeting.source_document_id,pages:r.meeting.page_count,media_type:r.meeting.source_media_type,human_url:r.canonical_url,json_url:r.json_url});
  }else if(c.operation==='append_event')m.events.push({...value,event_date:value.date,title:value.track.replaceAll('_',' '),qualification:null,source_refs,refs:source_refs});
  else if(c.operation==='append_connection')m.connections.push({...value,source_refs});
  else {
   const target=m[c.target.collection]?.find(x=>x.id===c.target.id);if(!target)throw Error('Missing update target '+c.id);
   if(c.operation==='replace_derived_answer_after_acceptance'){
    m.derived_answer_revisions.push({id:c.id,target_id:target.id,json_pointer:c.target.json_pointer,prior_answer:target.answer,revised_answer:value,prior_source_refs:[...target.source_refs],source_refs,reason:c.reason});
    target.answer=value;target.source_refs=[...new Set([...target.source_refs,...source_refs])];
   }else if(['append_evidence_annotation','append_locator_to_missing_instrument','append_scope_note_to_missing_instrument'].includes(c.operation))m.update_annotations.push({id:c.id,target_id:target.id,target_collection:c.target.collection,classification:c.classification,value,source_refs});
   else throw Error('Unsupported update operation '+c.operation);
  }
 }
 // IDs and old objects stay intact; render chronology by date without renumbering.
 m.events.sort((a,b)=>a.event_date.localeCompare(b.event_date));
 // The base builder above must retain its exact PR #38 identity until the
 // proposal comparison completes. Release metadata applies only to the result.
 m.release_status='published_research_collection';m.release_record='https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/39';
 m.published_baseline={release_record:base.release_record,content_version:base.content_version,file_sha256:proposal.baseline.file_sha256};
 m.update_provenance={pilot_id:proposal.pilot_id,source_format:'batch02-source-bounded-1.0',acceptance:'separately receipted local reading',publication_performed:true,publication_basis:'PR #39 release artifact; live promotion and verification recorded separately',scope:'Historical June addition; later July/August evidence and original references preserved. No new source check.',proposal_schema:proposal.schema_version};
 m.content_version=hash(m);return m;
}
