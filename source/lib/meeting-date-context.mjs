import {isWatch01,watchItemDate} from './north-plains-watch-context.mjs';
// A display/mention projection, never a repair of the supplied source fields.
import {nativeLocatorSchema} from '../scripts/meeting-native-evidence.mjs';
import {isNorthPlains,northPlainsDate} from './north-plains-context.mjs';
// Explicit roles below come from the cited statements in these Batch 04 items.
const roles = {
  'batch04-brush_country_gcd-8fdf8c5bf0e4-episodes-004': ['referenced_report_topic_dates', 'Dates of topics listed for a report; no results or completed events inferred.'],
  'batch04-central_texas_gcd-9f587d71343a-episodes-009': ['scheduled_event_dates', 'Later meeting/hearing dates; the October hearing is tentative, not a completed event.'],
  'batch04-fayette_county_gcd-abbe65333a9d-episodes-001': ['reported_sequence', 'July 29 complaint followed by July 30 staff visit, as reported in these minutes; not conflicting alternatives.'],
  'batch04-fayette_county_gcd-abbe65333a9d-episodes-004': ['scheduled_monitoring_dates', 'Planned August monitoring, not evidence of completion or measurements.'],
  'batch04-headwaters_gcd-049c1f85e16f-episodes-002': ['scheduled_consideration_date', 'The board scheduled later budget consideration; adoption on September 9 is not established.'],
  'batch04-refugio_gcd-59e5265946bd-episodes-008': ['scheduled_hearing_date', 'Hearing scheduled by this meeting; no later hearing occurrence or final rule adoption established.'],
  'batch04-texana_gcd-7d810669ce0c-episodes-011': ['scheduled_hearing_date', 'Hearing scheduled by this meeting; no later hearing occurrence or final rule adoption established.'],
  'batch04-uvalde_county_uwcd-e16c0d5ed4e0-episodes-001': ['referenced_minutes_date', 'Printed 2016 date of prior minutes referenced by the 2026 agenda; not a newly established 2016 action or a corrected year.'],
  'batch04-victoria_county_gcd-5fc84bfd43bf-episodes-004': ['reported_sequence', 'April 10 authorization, April 22 notice to proceed, May 19 report delivery: a reported sequence, not conflicting alternatives or independently checked original instruments.'],
  'batch04-victoria_county_gcd-5fc84bfd43bf-episodes-006': ['scheduled_presentation_date', 'Request for a later presentation; attendance or completion is not established.'],
  'batch04-victoria_county_gcd-5fc84bfd43bf-episodes-007': ['referenced_correspondence_date', 'Date of the reported McCabe message, distinct from this meeting and its suspension decision.'],
  'batch04-victoria_county_gcd-5fc84bfd43bf-episodes-010': ['reported_consultation_date', 'Reported consultation preceding the proposal; not a rule-adoption date.'],
  'batch04-victoria_county_gcd-5fc84bfd43bf-episodes-011': ['scheduled_hearing_date', 'Hearing scheduled by this meeting; no later hearing occurrence or final rule adoption established.'],
};

export const isCompilation = r => r.dates?.date_role === 'multi_meeting_compilation' || r.document_type?.startsWith('multi_meeting_');

export function documentDateCounts(records) {
  const missing=records.filter(r=>r.meeting.meeting_date===null&&!r.dates?.source_date);
  return {without_single_document_date:missing.length,unresolved_document_dates:missing.filter(r=>!isCompilation(r)).length,multi_meeting_compilations:missing.filter(isCompilation).length};
}

// Use only supplied page-to-section bindings. A span between dates is never a
// synthetic meeting, and a conflict on one page does not contaminate other pages.
export function compilationSections(r) {
  if(!isCompilation(r))return [];
  const sections=new Map();
  for(const c of r.meeting.date_candidates||[]) {
    if(c.role!=='section_meeting_date'&&!c.role.startsWith('conflicting_section_'))continue;
    for(const e of c.evidence) {
      const conflict=c.role.startsWith('conflicting_section_'), key=conflict?'conflict-'+e.page:c.date;
      if(!sections.has(key))sections.set(key,{date:conflict?null:c.date,date_role:conflict?'unresolved_section_date':'explicit_section_date',date_note:conflict?'Conflicting heading and narrative dates in this section only.':'Supported meeting section; not a whole-document date.',date_candidates:[],pages:[],item_ids:[]});
      const section=sections.get(key);
      if(!section.pages.includes(e.page))section.pages.push(e.page);
      if(conflict)section.date_candidates.push({date:c.date,context:c.role+': '+c.qualification,page:e.page});
    }
  }
  for(const section of sections.values())section.item_ids=(r.episodes||[]).filter(o=>o.evidence?.length&&o.evidence.every(e=>section.pages.includes(e.page))).map(o=>o.id);
  return [...sections.values()].sort((a,b)=>a.pages[0]-b.pages[0]);
}

function compilationPageContext(r,pages) {
  const sections=compilationSections(r).filter(s=>s.pages.some(p=>pages.includes(p)));
  if(sections.length===1) {
    const {date,date_role,date_note,date_candidates}=sections[0];
    return {date,date_role,date_note:date_note+' Located by the supplied physical-page section context.',date_candidates};
  }
  return {date:null,date_role:'multi_meeting_compilation',date_note:'No single date for this item: its supplied evidence spans multiple or unbound sections. Dates below locate only those cited sections.',date_candidates:[],referenced_dates:sections.flatMap(s=>s.date?s.pages.filter(p=>pages.includes(p)).map(page=>({date:s.date,role:'cited_section_date',qualification:'Source-local appearance on this cited section page; not every meeting in the compilation.',page})):s.date_candidates.map(c=>({date:c.date,role:'conflicting_section_candidate',qualification:c.context,page:c.page})))};
}

export function tableRowDate(r,t,row) {
  if(isNorthPlains(r)&&r.document_type==='court_calendar')return {...northPlainsDate(r,t),date:row[t.columns.indexOf('Date')],date_role:'scheduled_argument',date_note:'Scheduled row date, not a completed argument or disposition. Day/week duplicates are represented once.'};
  if(r.provenance?.reported?.batch==='06') {
    const col=name=>row[t.columns.indexOf(name)];
    if(t.columns.includes('District Number')) {
      const date=/^\d+$/.test(String(col('District Number')))?sourceDate(col('Date')):null;
      return packetDate(date,date?'application_row_date':'application_report_group',`Administratively complete register; printed row date is not approval. ${t.notes}`,t.evidence[0].page);
    }
    if(t.columns.includes('District #')) {
      const tested=Number(col('Number of Flow Tests'))>0;
      return {...packetDate(tested?sourceDate(col('Latest Test Date')):null,tested?'latest_reported_test_date':'no_demonstrated_test',tested?'Latest reported test date only; the historical maximum need not have been measured then. Printed status is not an independent compliance finding.':'Zero tests and Not equipped: printed dates/status do not establish a completed test or a zero flow measurement.',t.evidence[0].page),referenced_dates:['First Test Date','Latest Test Date'].map(k=>({date:sourceDate(col(k)),role:tested?k.toLowerCase().replaceAll(' ','_'):'printed_date_without_demonstrated_test',qualification:k+' as printed; retain count, values and status together.',page:t.evidence[0].page}))};
    }
    if(t.name.startsWith('Bill Payment'))return packetDate(sourceDate(col('Date')),'reported_transaction_date','Transaction date in the August bill list, not a September approval.',t.evidence[0].page);
  }
  if(!isCompilation(r))return mentionDate(r,t);
  const pageIndex=t.columns.findIndex(c=>c==='Physical page');
  const page=row[pageIndex];
  if(Number.isInteger(page)) {
    const context=compilationPageContext(r,[page]);
    return {...context,date_note:context.date_note+' Derived from the row’s printed/transcribed Physical page context; evidence remains table-level.'};
  }
  return mentionDate(r,t);
}

// Narrow packet projection: source text and page bindings, never a date range
// spanning unrelated attachments. Only Batch 06 receives these added contexts.
function sourceDate(value) {
  if(typeof value!=='string')return null;
  if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value;
  const us=value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(us)return `${us[3]}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`;
  const named=value.match(/^(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/);
  return named?`${named[3]}-${String(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(named[2])+1).padStart(2,'0')}-${named[1].padStart(2,'0')}`:null;
}
function packetDate(date,role,note) {return {date,date_role:role,date_note:note,date_candidates:[]};}
function packetContext(r,o) {
  if(r.id!=='batch06-high_plains_uwcd_1-27e0e6be9353')return null;
  const pages=[...new Set((o.evidence||[]).map(e=>e.page))],page=pages[0];
  const references=(r.meeting.date_candidates||[]).filter(c=>c.evidence.some(e=>pages.includes(e.page))).map(c=>({date:c.date,role:c.role,qualification:c.qualification,page:c.evidence.find(e=>pages.includes(e.page)).page}));
  if(pages.length&&pages.every(p=>p>=4&&p<=7))return packetDate('2026-08-11','draft_prior_meeting_date','August 11 DRAFT prior minutes, located by supplied physical pages 4–7; not September decisions or approved minutes.');
  if(pages.length&&pages.every(p=>p>=23&&p<=25)) {
    const noTest=o.qualifier==='Not equipped'||/; 0 tests;/.test(o.context||'')||(o.subject&&r.quantities.some(q=>q.subject===o.subject&&q.role==='reported_flow_test_count'&&q.value===0));
    const historical=o.role==='highest_recorded_flow';
    const reference=o.role==='reported_permit_reference_rate';
    const date=sourceDate(o.section_date||o.as_of);
    return {...packetDate(noTest||historical||reference?null:date,noTest?'no_demonstrated_test':historical?'historical_maximum_date_unspecified':reference?'permit_reference_date_unspecified':'reported_flow_context',noTest?'No demonstrated measurement: Not equipped; dates/status do not prove a completed test.':historical?'Highest recorded flow: its measurement date is not supplied. The referenced date is the latest test, not necessarily the maximum.':reference?'Permit reference rate, not a flow measurement or a dated approval.':'Flow report context only. Latest and first dates, test count, permit reference, highest/latest values and printed status retain separate meanings.'),...(date?{referenced_dates:[{date,role:noTest?'printed_date_without_demonstrated_test':'latest_reported_test_date',qualification:'Printed latest-test date; read with test count and qualifications. Not necessarily historical-maximum date or final enforcement finding.',page}]}:{})};
  }
  if(o.report_date) return {...packetDate(sourceDate(o.as_of),'application_row_date','Printed application row date; administratively complete listing, not an approval. July Bailey/Cochran exceptions remain in the draft minutes.'),referenced_dates:[{date:sourceDate(o.report_date),role:'report_date',qualification:'Register report date, not application approval.',page}]};
  if(pages.length&&pages.every(p=>p<=3))return packetDate(r.meeting.meeting_date,'scheduled_date','Main September 8 scheduled agenda; no completed event or approval established.');
  const explicit=sourceDate(o.section_date||o.as_of);
  const role=/proposed|scheduled/.test(o.stage||o.role||'')?'proposed_or_scheduled_context_date':/historical/.test(o.stage||o.role||'')?'historical_attachment_date':'reported_attachment_date';
  const qualifiers=[o.date_status,o.time_basis,o.period_status,o.context,o.notes].filter(Boolean).join(' ');
  return {...packetDate(explicit,explicit?role:'packet_attachment_context',`Attachment context only; not a September meeting outcome. ${qualifiers||'No single item event date supplied; use cited report/section and its qualifications.'}`),...(references.length||o.section_dates?.length?{referenced_dates:[...references,...(o.section_dates||[]).map(date=>({date,role:'historical_or_referenced_date',qualification:o.date_status||'Dates of this attachment only.',page}))]}:{})};
}

export function mentionDate(r, o, explicitDate = null) {
  if(isWatch01(r))return watchItemDate(r,o);
  if(isNorthPlains(r))return northPlainsDate(r,o);
  if(o.id==='pilot-ntgcd-aqua-resort-3644a7501499-filing-certification')return {date:'2026-09-11',date_role:'filing_date',date_note:'Clerk filing stamp September 11, 11:20 am, physical page 3. Raw section_date is scheduled hearing context, not the filing or signature date.',date_candidates:[],referenced_dates:[{date:'2026-09-16',role:'scheduled_hearing_date',qualification:'Scheduled document context; no outcome established.',page:3}]};
  if(r.provenance?.reported?.pilot_id==='ntgcd-source-update-20260925') {
    const explicit=sourceDate(o.section_date);
    const referenced=[];
    if(sourceDate(o.approval_date))referenced.push({date:sourceDate(o.approval_date),role:'approval_date',qualification:'Source-stated approval date for this item; distinct from the recorded meeting date.',page:o.evidence[0].page});
    if(sourceDate(o.report_period_end))referenced.push({date:sourceDate(o.report_period_end),role:'report_period_end',qualification:'End of the source-stated reporting period; not an approval date.',page:o.evidence[0].page});
    return {date:explicit||r.meeting.meeting_date,date_role:explicit?(o.section_date_role||'explicit_section_date'):'recorded_meeting_date',date_note:explicit?'Source-stated item date and role; later minutes approval remains separate.':'Recorded meeting context; later minutes approval remains separate.',date_candidates:[],...(referenced.length?{referenced_dates:referenced}:{})};
  }
  if(r.provenance?.reported?.batch==='08') {
    const pages=[...new Set((o.evidence||[]).map(e=>e.page))];
    const references=(r.meeting.date_candidates||[]).flatMap(c=>c.evidence.filter(e=>pages.includes(e.page)).map(e=>({date:c.date,role:c.role,qualification:c.qualification,page:e.page})));
    for(const c of o.section_dates||[])for(const page of (typeof c==='string'?pages:c.pages))references.push({date:typeof c==='string'?c:c.date,role:typeof c==='string'?'historical_rule_set_context':c.role,qualification:o.date_status||'Supplied role-qualified section date; not a whole-packet event date.',page});
    const explicit=sourceDate(o.section_date);
    const stage=o.stage||o.role||'';
    const matching=references.find(c=>c.date===explicit);
    const role=/historical_rule/.test(stage)?'historical_rule_date':/model/.test(stage)?'historical_model_report_date':/projected|forecast/.test(stage)?'planning_report_date':matching?.role||(/historical|reference/.test(stage)?'historical_context_date':'supplied_section_context_date');
    return {...packetDate(explicit,explicit?role:'historical_packet_item_date_unspecified',
      `Historical submission packet: ${explicit?'the supplied section date qualifies this item only':'no single supported item date; the primary adoption date is not inherited'}. Models, planning values and historical rules are not pumping approvals or evidence of current validity. ${[o.date_status,o.period_status,o.time_basis,o.notes].filter(Boolean).join(' ')}`),
      ...(references.length?{referenced_dates:references}:{})};
  }
  if(r.provenance?.reported?.batch==='06') {const packet=packetContext(r,o);if(packet)return packet;}
  const context = {date:r.meeting.meeting_date||null,date_role:r.dates.date_role,date_note:`Document context only: ${r.dates.source_date_basis}`,date_candidates:r.dates.source_date_candidates||[]};
  if(r.provenance?.reported?.batch==='07') {
    const location=e=>e.native_locator?{native_locator:e.native_locator}:{page:e.page};
    if(r.meeting.district_id==='live_oak_uwcd') {
      const cited=o.evidence?.find(e=>e.native_locator?.block_id==='b031');
      return {...context,date_note:'Hearing date not stated. May 11 is prospective scheduling-meeting context, not a held hearing, completed scheduling or DFC adoption.',...(cited?{referenced_dates:[{date:'2026-05-11',role:'prospective_scheduling_meeting_reference',qualification:'Meeting at which a hearing was to be scheduled; hearing date unresolved, not conflicting.',...location(cited)}]}:{})};
    }
    if(o.id.endsWith('-cd-reported-transfer'))return {date:null,date_role:'reported_event_date_unspecified',date_note:'Agenda reports earlier CD movement; transaction date and amount absent. Possible ratification is a separate scheduled item.',date_candidates:[]};
    if(o.stage==='filed')return {date:o.section_date,date_role:'filing_date',date_note:'Filing stamp, not meeting date or approval.',date_candidates:[]};
    if(o.stage==='certified_notice')return {date:null,date_role:'signature_date_unspecified',date_note:'Certification continuation; signature has no separately established date.',date_candidates:[]};
    const references=(r.meeting.date_candidates||[]).filter(c=>c.evidence.some(e=>o.evidence?.some(x=>e.native_locator?x.native_locator?.block_id===e.native_locator.block_id:x.page===e.page))).map(c=>({date:c.date,role:c.role,qualification:c.qualification,...location(c.evidence[0])}));
    return {...context,...(references.length?{referenced_dates:references}:{})};
  }
  // Saratoga's dates have different roles; neither the heading nor filing resolves
  // its altered narrative day. Preserve the nested page references in the record.
  if(!r.meeting.meeting_date && !isCompilation(r) && r.meeting.date_candidates?.some(c=>c.role==='narrative_meeting_date' && /handwritten alteration/i.test(c.qualification))) return {...context,
    date_note:'Whole-document date unresolved. The narrative day has a handwritten alteration; heading and filing dates are contextual only, not resolved meeting or approval dates.',
    referenced_dates:r.meeting.date_candidates.map(c=>({date:c.date,role:c.role,qualification:c.qualification,page:c.evidence[0].page}))};
  const projection=roles[o.id];
  if(projection) return {...context,date_note:`Document context only. ${projection[1]}`,
    referenced_dates:(o.section_dates||[o.section_date]).map(date=>({date,role:projection[0],qualification:projection[1],page:o.evidence[0].page}))};
  const conflict=Boolean(o.date_status && /conflict|unresolved/i.test(o.date_status));
  if(conflict) return {date:null,date_role:'unresolved_section_date',date_note:o.date_status,
    date_candidates:o.section_dates?.map(date=>({date,context:o.date_status,page:o.evidence[0].page}))||r.dates.source_date_candidates||[]};
  if(o.section_dates?.length) return {...context,referenced_dates:o.section_dates.map(date=>({date,role:'referenced_context_date',qualification:o.date_status||'Role not independently resolved; see the source statement.',page:o.evidence[0].page}))};
  // A dated historical attachment or scheduled event is not an actual meeting
  // on that date. The current document remains the date of the referencing act.
  if(o.section_date && (/^scheduled|historical_study/i.test(o.date_status||'') || r.meeting.date_candidates?.some(c=>c.date===o.section_date&&c.role==='attached_study_date')))return {...context,referenced_dates:[{date:o.section_date,role:/^scheduled/.test(o.date_status||'')?'scheduled_event_date':'historical_study_date',qualification:o.date_status||'Historical attachment context, not a meeting or current observation.',page:o.evidence[0].page}]};
  if(o.section_date) return {date:o.section_date,date_role:'explicit_section_date',date_note:isCompilation(r)?'Supported date of this section; the compilation has no single meeting date.':'Supported date of this section only; not a resolution of the whole-document date.',date_candidates:[]};
  if(isCompilation(r))return compilationPageContext(r,[...new Set((o.evidence||[]).map(e=>e.page))]);
  if(explicitDate && /^\d{4}-\d{2}-\d{2}$/.test(explicitDate))return {date:explicitDate,date_role:'explicit_item_date',date_note:'Explicit dated field on this item.',date_candidates:[]};
  return r.meeting.date_candidates?.length ? {...context,referenced_dates:r.meeting.date_candidates.map(c=>({date:c.date,role:c.role,qualification:c.qualification,page:c.evidence[0].page}))} : context;
}

export const dateContextProperties = {
  date:{type:['string','null']},date_role:{type:'string'},date_note:{type:'string'},
  date_candidates:{type:'array',items:{type:'object',additionalProperties:false,required:['date','context','page'],properties:{date:{type:'string'},context:{type:'string'},page:{type:'integer',minimum:1}}}},
  referenced_dates:{type:'array',items:{type:'object',additionalProperties:false,required:['date','role','qualification','page'],properties:{date:{type:['string','null']},role:{type:'string'},qualification:{type:'string'},page:{type:'integer',minimum:1}}}},
};
for(const key of ['date_candidates','referenced_dates']) {
  const pdf=dateContextProperties[key].items;
  const native=structuredClone(pdf);
  native.required=native.required.filter(k=>k!=='page').concat('native_locator');
  delete native.properties.page;
  native.properties.native_locator=nativeLocatorSchema;
  dateContextProperties[key].items={oneOf:[pdf,native]};
}
