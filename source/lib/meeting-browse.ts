import type { MeetingFilters } from './meeting-intelligence';

export type MeetingBrowseCard = {
  key:string; districtId:string; date:string|null; pages:number|null;
  summary:string; topics:string[]; stages:string[]; sourceUrl:string; sourcePage:number|null;
  sourceMediaType?:string; partial:boolean; partialPages:number[]; version:string;
  documentType:string; dateRole:string; dateNote:string|null;
};
export type MeetingBrowseIndex = {
  schema_version:string; profile:'meeting_browse_navigation'; content_version:string;
  coverage_note:string; record_count:number; districts:Record<string,string>; records:MeetingBrowseCard[];
};

// Exact item/text and bounded-date searches always use the existing full search
// entries. This path is only for facets that the compact navigation cards contain.
export function filterBrowseRecords(records:MeetingBrowseCard[],filters:MeetingFilters):MeetingBrowseCard[]{
  if(filters.q.trim()||filters.from||filters.to)throw Error('Detailed search data required');
  return records.filter(m=>(!filters.district||m.districtId===filters.district)
    &&(filters.dates==='unresolved'?m.date===null&&m.dateRole!=='multi_meeting_compilation':filters.dates==='compilation'?m.dateRole==='multi_meeting_compilation':filters.dates==='no-single-date'?m.date===null:true)
    &&(!filters.topic||m.topics.includes(filters.topic))&&(!filters.stage||m.stages.includes(filters.stage))
    &&(!filters.document||m.documentType===filters.document));
}
