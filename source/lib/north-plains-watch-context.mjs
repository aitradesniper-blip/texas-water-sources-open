export const watchPilot='north-plains-blf-watch-01';
export const isWatch01=r=>(r.provenance?.reported||r.provenance)?.pilot_id===watchPilot;
export function watchItemDate(r,o){
 const first=o.evidence?.[0]?.page;
 const explicit=o.section_date??o.observed_date??o.report_date??o.date??null;
 const attachment=first>=13;
 const date=explicit||(!attachment?r.meeting.meeting_date:null);
 return {date,date_role:o.date_role||(explicit?'source_item_date':attachment?'attachment_context_date_unavailable':'recorded_meeting_date'),date_note:[o.note,o.attribution,o.reporting_period?'Reporting period: '+o.reporting_period:null,attachment?'Attachment context; not inherited from the June meeting.':null].filter(Boolean).join(' '),date_candidates:[],...((o.effective_date||o.signature_dates?.length)?{referenced_dates:[...(o.effective_date?[{date:o.effective_date,role:'contract_effective_date',qualification:'Separate from board action and execution.',page:first}]:[]),...(o.signature_dates||[]).map(x=>({date:x.date,role:'signature_date',qualification:x.party+'; '+x.basis,page:first}))]}:{})};
}
