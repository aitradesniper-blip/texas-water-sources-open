// Shared by the human browser and plain-HTTP reader. Only a supported item date
// can match a compilation; record-wide text and a different section never join.
const normalize = s => s.toLocaleLowerCase('en-US').replaceAll('_',' ').replace(/(\d),(?=\d)/g,'$1');
export function matchingItems(m,q,filters={}) {
  const words=normalize(q).trim().split(/\s+/).filter(Boolean);
  const bounded=(m.dateRole==='multi_meeting_compilation'||filters.dates==='items')&&Boolean(filters.from||filters.to);
  return words.length||bounded?m.matters.filter(x=>words.every(w=>normalize([m.district,x.searchText].join(' ')).includes(w))
    &&(!bounded||(x.dateContext?.date&&(!filters.from||x.dateContext.date>=filters.from)&&(!filters.to||x.dateContext.date<=filters.to)
      &&(!filters.topic||x.topic===filters.topic)&&(!filters.stage||x.stage===filters.stage)))):[];
}
export function filterMeetingRecords(meetings,filters) {
  const words=normalize(filters.q).trim().split(/\s+/).filter(Boolean);
  return meetings.filter(m=>(!filters.district||m.districtId===filters.district)
    &&(filters.dates==='unresolved'?m.date===null&&m.dateRole!=='multi_meeting_compilation':filters.dates==='compilation'?m.dateRole==='multi_meeting_compilation':filters.dates==='no-single-date'?m.date===null:true)
    &&((m.dateRole==='multi_meeting_compilation'||filters.dates==='items')&&(filters.from||filters.to)?matchingItems(m,filters.q,filters).length>0:m.date===null?!filters.from&&!filters.to:(!filters.from||m.date>=filters.from)&&(!filters.to||m.date<=filters.to))
    &&(!filters.topic||m.topics.includes(filters.topic))&&(!filters.stage||m.stages.includes(filters.stage))
    &&(!filters.document||m.documentType===filters.document)&&words.every(w=>normalize(m.searchText).includes(w)));
}
