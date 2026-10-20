import { readFileSync } from "node:fs";
import { cache } from "react";
import { projectMeeting, type MeetingCard } from "./meeting-intelligence";
import searchIndex from "@/public/data/water-watch/v1/meetings/index.json";

export const loadMeetingIndex = (): MeetingCard[] => searchIndex.records;
export const loadPublicMeeting = cache((key: string) => {
  if (!searchIndex.records.some(m => m.key === key)) throw new Error("Unknown meeting key");
  return JSON.parse(readFileSync(`public/data/water-watch/v1/meetings/${key}.json`, "utf8"));
});
export const loadMeetingIntelligence = cache(() => searchIndex.records.map(card => {
  const r = loadPublicMeeting(card.key);
  return projectMeeting(r, { request_id: r.meeting.meeting_id, district_id:r.meeting.district_id, source_sha256:r.meeting.source_document_id.slice(7), physical_pages:r.meeting.page_count, candidate_source_date:r.meeting.meeting_date, frozen_routing_date:r.dates.routing_date, official_source_url:r.meeting.source_url }, r.partial_pages);
}));
