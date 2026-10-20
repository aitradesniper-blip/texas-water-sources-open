import { createPageMetadata } from "@/lib/seo";
import { MeetingRecordsContent } from "./MeetingRecordsContent";
import "./intelligence.css";

export const metadata = createPageMetadata({
  title: "Texas Groundwater District Intelligence — Texas Water Watch",
  description: "Browse reviewed, source-linked Texas groundwater district activity covering permits, production, wells, water levels, compliance, planning, and litigation.",
  path: "/groundwater-districts/intelligence",
  imagePath: null,
});

export default function GroundwaterDistrictIntelligencePage() {
  return <MeetingRecordsContent path="/groundwater-districts/intelligence" />;
}
