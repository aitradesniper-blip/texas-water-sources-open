import browse from '@/public/data/water-watch/v1/meetings/browse.json';
import type { MeetingBrowseIndex } from './meeting-browse';

export function loadMeetingBrowseIndex():MeetingBrowseIndex{
  const districts:Record<string,string>=browse.districts;
  if(browse.profile!=='meeting_browse_navigation'||browse.record_count!==browse.records.length
    ||browse.records.some(record=>!districts[record.districtId]))
    throw Error('Invalid meeting browse projection');
  return browse as MeetingBrowseIndex;
}
