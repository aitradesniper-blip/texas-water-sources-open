import {createHash} from 'node:crypto';
import {resolveChainReference} from './meeting-source-chain.mjs';

const priorBindings={
  'infill01-january-metering':{kind:'new_historical_event',related_prior_ids:['feb26-reports','reporting']},
  'infill01-2026-01-28-compliance':{kind:'new_historical_event',related_prior_ids:['aug25-compliance']},
  'infill01-2026-03-24-compliance':{kind:'new_historical_event',related_prior_ids:['aug25-compliance']},
  'infill01-2026-04-14-compliance':{kind:'new_historical_event',related_prior_ids:['aug25-compliance']},
  'infill01-march-other-subjects':{kind:'exclusion_annotation',related_prior_ids:[]},
  'infill01-april-reporting-years':{kind:'answer_qualification',target_id:'reporting',related_prior_ids:['reporting']},
  'infill01-2026-01-28-litigation':{kind:'reference_only_annotation',related_prior_ids:['claims-authority']},
  'infill01-2026-03-24-litigation':{kind:'reference_only_annotation',related_prior_ids:['claims-authority']},
  'infill01-2026-04-14-litigation':{kind:'reference_only_annotation',related_prior_ids:['claims-authority']},
};

export function applyInfill01Update(base,proposal,records,{hash}) {
  const baselineBytes=JSON.stringify(base,null,2)+'\n';
  if(base.matter_id!=='north-plains-blf-enforcement'||proposal.matter_id!==base.matter_id||
    createHash('sha256').update(baselineBytes).digest('hex')!==proposal.baseline_descriptor.local_sha256)throw Error('Infill 01 matter baseline mismatch');
  if(base.source_refs.length!==77||proposal.references.length!==18||proposal.proposed_changes.length!==9)throw Error('Infill 01 update inventory mismatch');
  const m=structuredClone(base),ids=new Set([...m.events,...m.conclusions,...m.missing_instruments].map(x=>x.id));
  for(const [id,b] of Object.entries(priorBindings))for(const target of b.related_prior_ids)if(!ids.has(target))throw Error(`Missing prior-object binding ${id}: ${target}`);
  const newRefs=proposal.references.map(ref=>resolveChainReference({...ref,reference_id:ref.ref_id,record_role:'accepted_historical_infill'},records));
  if(new Set([...m.source_refs,...newRefs].map(r=>r.id)).size!==95)throw Error('Duplicate or missing matter reference');
  m.source_refs.push(...newRefs);
  const known=new Set(m.source_refs.map(r=>r.id));
  for(const member of proposal.source_membership_proposals){
    const r=records.find(x=>x.id===member.record_id);
    if(!r||r.meeting.source_document_id!=='sha256:'+member.source_sha256||m.source_record_ids.includes(r.id))throw Error('Infill source membership mismatch');
    m.source_record_ids.push(r.id);m.new_source_record_ids.push(r.id);
    m.source_documents.push({record_id:r.id,record_role:'accepted_historical_infill',issuer:r.issuer,document_label:r.dates.document_label,date_role:r.dates.date_role,source_date:r.dates.source_date,meeting_date:r.meeting.meeting_date,approved_date:r.meeting.approved_date,source_document_id:r.meeting.source_document_id,pages:r.meeting.page_count,media_type:r.meeting.source_media_type,human_url:r.canonical_url,json_url:r.json_url});
  }
  m.infill01_bindings=[];
  for(const c of proposal.proposed_changes){
    const b=priorBindings[c.proposal_id];if(!b||c.new_reference_ids.some(id=>!known.has(id)))throw Error('Unresolved infill proposal '+c.proposal_id);
    m.infill01_bindings.push({proposal_id:c.proposal_id,kind:b.kind,target_id:b.target_id||null,related_prior_ids:b.related_prior_ids,new_reference_ids:c.new_reference_ids,raw_prior_object_id:c.prior_object_id,prior_binding_status:'resolved_against_published_matter'});
    if(b.kind==='new_historical_event')m.events.push({id:c.proposal_id,date:c.event_date,event_date:c.event_date,date_role:c.role,track:c.role,title:c.role.replaceAll('_',' '),statement:c.statement,qualification:c.limitation||null,source_refs:c.new_reference_ids,refs:c.new_reference_ids});
    else if(b.kind==='exclusion_annotation')m.update_annotations.push({id:c.proposal_id,target_id:null,target_collection:'scope_exclusion',classification:'other_parties_not_blf',value:c.statement,source_refs:c.new_reference_ids});
    else if(b.kind==='reference_only_annotation')m.update_annotations.push({id:c.proposal_id,target_id:null,target_collection:'district_litigation_reference',classification:'reference_only_no_court_disposition',value:c.statement,source_refs:c.new_reference_ids});
    else {
      const target=m.conclusions.find(x=>x.id===b.target_id),prior=target.answer;
      if(!prior.includes('June 16')||!prior.includes('late 2023'))throw Error('Reporting answer has changed since proposal comparison');
      const revised=prior+' January 28 board minutes record no action on a BLF AgSense meter-failure reporting request; its reporting year is unspecified. March and April minutes list the separate BLF late-2023 reporting item unresolved at those meetings. April districtwide 2025 receipt counts do not close the BLF 2023 issue or establish acceptance of an alternative metering method.';
      const integrationRefs=['infill01-ref-001','infill01-ref-002','infill01-ref-005','infill01-ref-006'];
      if(integrationRefs.some(id=>!known.has(id)))throw Error('Missing reporting clause evidence');
      m.infill01_bindings.at(-1).additional_integration_reference_ids=integrationRefs;
      m.infill01_bindings.at(-1).integration_basis='January no-action and March reporting clauses added by the public integration; these references were not supplied by the raw April proposal.';
      target.answer=revised;target.source_refs=[...new Set([...target.source_refs,...c.new_reference_ids,...integrationRefs])];
      m.derived_answer_revisions.push({id:c.proposal_id,target_id:target.id,json_pointer:'/conclusions/3/answer',prior_answer:prior,revised_answer:revised,prior_source_refs:base.conclusions.find(x=>x.id===target.id).source_refs,source_refs:target.source_refs,reason:'Historical January no-action and April 2025 districtwide context; 2023 BLF and metering sufficiency remain separate.'});
    }
  }
  m.events.sort((a,b)=>a.event_date.localeCompare(b.event_date));
  m.published_baseline={release_record:base.release_record,file_sha256:proposal.baseline_descriptor.local_sha256,content_version:base.content_version};
  m.release_record='https://github.com/aitradesniper-blip/Texas-Water-Sources/pull/41';
  m.release_status='published_research_collection';
  m.publication_basis='PR #41 release artifact. Actual promotion and public verification are recorded separately; this is not a new source check.';
  m.infill01_update_provenance={pilot_id:proposal.pilot_id,source_format:'batch02-source-bounded-1.0',acceptance:'separately receipted local reading',publication_performed:false,scope:'Historical January/March/April readings; later July/August evidence and the original 77 references remain. No new official-source check.',prior_matter_sha256:proposal.baseline_descriptor.local_sha256};
  m.content_version=hash(m);return m;
}
