// Shallow collection/status projection. No source retrieval or collector writes.
const knownStatuses = {
  completed_checked_scope: 'Completed for the selected routes (reported)',
  partial: 'Partial recorded attempt',
  failed: 'Failed recorded attempt',
};

export function summarizeCheckHistory(attempts) {
  const ordered = [...attempts].sort((a, b) => (a.finished_at || '').localeCompare(b.finished_at || ''));
  const latest = ordered.at(-1) || null;
  const successfulTimes = ordered.flatMap(a => a.last_successful_comparison_at ? [a.last_successful_comparison_at] : []);
  return {
    latest_attempt: latest ? {
      run_id: latest.run_id,
      finished_at: latest.finished_at,
      reported_status: latest.status ?? null,
      status_label: knownStatuses[latest.status] || 'Outcome unavailable or unclassified',
      acquisition_outcome: latest.acquisition_outcome || 'unknown',
      acquisition_outcome_basis_kind: latest.acquisition_outcome_basis_kind || 'unavailable',
      acquisition_basis: latest.acquisition_basis || null,
    } : null,
    last_successful_comparison_at: successfulTimes.sort().at(-1) || null,
  };
}

export function sourceRole(record) {
  if (/^Historical management-plan submission packet/i.test(record.documentType)) return 'historical_packet';
  if (record.dateRole === 'scheduled_date' && /agenda|notice|scheduled/i.test(record.documentType)) return 'scheduled_agenda_or_notice';
  if (record.dateRole === 'recorded_meeting_date' && /minutes/i.test(record.documentType)) return 'recorded_minutes';
  if (record.dateRole === 'recorded_meeting_date') return 'other_recorded_district_record';
  if (record.dateRole === 'unresolved_document_date' || record.dateRole === 'multi_meeting_compilation') return 'unresolved_or_compilation';
  return 'other_nonmeeting_or_context';
}

export function buildDistrictCoverage(districts, browseRecords, checks, matters, url) {
  const byDistrict = new Map();
  for (const record of browseRecords) {
    if (!byDistrict.has(record.districtId)) byDistrict.set(record.districtId, []);
    byDistrict.get(record.districtId).push(record);
  }
  const latest = entries => [...entries].filter(r => r.date).sort((a,b) => b.date.localeCompare(a.date) || a.key.localeCompare(b.key))[0] || null;
  const reference = record => record ? {record_id:record.key,date:record.date,document_type:record.documentType,date_role:record.dateRole,human_url:url(`/groundwater-districts/intelligence/meetings/${record.key}`)} : null;
  return districts.map(d => {
    const records = byDistrict.get(d.district_id) || [];
    const roleCounts = {recorded_minutes:0,scheduled_agenda_or_notice:0,historical_packet:0,other_recorded_district_record:0,unresolved_or_compilation:0,other_nonmeeting_or_context:0};
    const dateRoles = {};
    for (const record of records) {
      roleCounts[sourceRole(record)]++;
      dateRoles[record.dateRole || 'unknown'] = (dateRoles[record.dateRole || 'unknown'] || 0) + 1;
    }
    const checkHistory = checks.filter(c => c.district_id === d.district_id);
    const dates = records.map(r => r.date).filter(Boolean).sort();
    return {
      district_id:d.district_id,district_name:d.district_name,source_count:records.length,
      media:{pdf:records.filter(r=>r.pages!==null).length,native:records.filter(r=>r.pages===null).length},
      source_roles:roleCounts,date_roles:dateRoles,
      dated_source_extremes:{earliest:dates[0] || null,latest:dates.at(-1) || null,basis:'Observed single-document dates across different roles; no continuous coverage interval is implied.'},
      without_single_document_date:d.layers.meetings.without_single_document_date,
      unresolved_document_dates:d.layers.meetings.unresolved_document_dates,
      multi_meeting_compilations:d.layers.meetings.multi_meeting_compilations,
      latest_recorded_minutes:reference(latest(records.filter(r=>sourceRole(r)==='recorded_minutes'))),
      latest_scheduled_agenda_or_notice:reference(latest(records.filter(r=>sourceRole(r)==='scheduled_agenda_or_notice'))),
      historical_packet_records:records.filter(r=>sourceRole(r)==='historical_packet').map(reference),
      layers:{facts:d.layers.facts.count,board_actions:d.layers.board_actions.count},
      published_watch_history:checkHistory.length?checkHistory.map(c=>({matter_id:c.matter_id,...summarizeCheckHistory([c]),scope:c.scope,official_surfaces:c.official_surfaces,observed_content_at_run:c.observed_content_at_run,interpretation:c.interpretation,reading_state:c.reading_state_now,publication_context:c.publication_context})):null,
      watch_history_state:checkHistory.length?'published_scoped_history':'no_published_source_watch_history',
      unread_backlog_count:checkHistory.length?checkHistory.reduce((sum,c)=>sum+c.reading_state_now.unread_deferred_background+c.reading_state_now.other_pending,0):null,
      matters:matters.filter(m=>m.district_id===d.district_id).map(m=>({matter_id:m.matter_id,canonical_url:m.canonical_url,json_url:m.json_url})),
      records:records.map(r=>({record_id:r.key,document_type:r.documentType,source_role:sourceRole(r),date:r.date,date_role:r.dateRole,media_type:r.pages===null?'text/html':'application/pdf',human_url:url(`/groundwater-districts/intelligence/meetings/${r.key}`)})),
    };
  });
}
