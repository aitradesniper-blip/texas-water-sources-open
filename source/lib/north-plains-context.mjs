export const northPlainsPilot = 'north-plains-blf-source-chain-01';
export const isNorthPlains = r => (r.provenance?.reported || r.provenance)?.pilot_id === northPlainsPilot;
export function northPlainsRole(r) {
  if(!isNorthPlains(r)) return null;
  const roles={court_order:['Court order','order_filed_date'],location_map:['Location map','map_printed_date'],court_calendar:['Court calendar','scheduled_argument']};
  const role=roles[r.document_type];
  return role?{document_label:role[0],date_role:role[1],date_note:r.meeting.date_note}:null;
}
export function northPlainsDate(r,o) {
  const role=northPlainsRole(r), c=r.meeting.date_candidates?.find(c=>c.role===role?.date_role);
  const multiDateCalendar=r.document_type==='court_calendar'&&Array.isArray(o.rows);
  const date=multiDateCalendar?null:o.section_date || r.meeting.meeting_date || c?.date || null;
  const e=o.evidence?.[0], location=e?.native_locator?{native_locator:e.native_locator}:{page:e?.page};
  const refs=(o.section_dates||[]).map(date=>({date,role:'attributed_referenced_date',qualification:o.date_status||'Date described in this item, not a conflicting document date or independent instrument.',...location}));
  if(o.deadline)refs.push({date:o.deadline,role:'deadline',qualification:'Source-stated deadline; fulfillment is not established.',...location});
  return {date,date_role:multiDateCalendar?'calendar_schedule_multiple_dates':o.section_date?(o.stage==='scheduled_argument'?'scheduled_argument':'supplied_item_context_date'):(role?.date_role||'recorded_meeting_date'),date_note:[multiDateCalendar?'Use each scheduled row date; this table spans multiple days.':'Document/item context only, not proof that referenced events occurred on this date.',r.meeting.date_note,o.date_status,o.stage_qualification,o.model_period].filter(Boolean).join(' '),date_candidates:[],...(refs.length?{referenced_dates:refs}:{})};
}
