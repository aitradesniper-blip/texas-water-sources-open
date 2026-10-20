import type { MetadataRoute } from "next";
import { publicSources } from "@/lib/source-catalog";
import { absoluteUrl } from "@/lib/seo";
import { publishedSourceCategories } from "@/lib/source-editorial";
import { supportingGuidePaths } from "@/lib/supporting-guides";
import { trecApplicabilityPath } from "@/lib/trec-applicability";
import { legacyGroundwaterDistrictPages } from "@/lib/groundwater-district-pages";

import { loadMeetingIndex } from "@/lib/meeting-intelligence.server";
import { meetingPath } from "@/lib/meeting-intelligence";
import { districtBriefPath, districtBriefSlugs } from "@/lib/district-briefs.server";
import matters from "@/public/data/water-watch/v1/matters/index.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/well-records/repair-assistance-before-work","/groundwater-districts/intelligence/entities", "/groundwater-districts/intelligence/coverage", "/groundwater-districts/data", ...loadMeetingIndex().map(m => meetingPath(m.key)), "", "/about", "/about/authors/texas-water-sources", "/about/corrections", "/about/editorial-standards", "/contact", "/disclaimer", "/feedback", "/groundwater-districts", "/groundwater-districts/intelligence", "/methodology", "/privacy", "/property-water-report", "/sources", "/surface-water-rights", "/terms", "/trec-61-guide", trecApplicabilityPath, "/well-records", ...supportingGuidePaths, ...legacyGroundwaterDistrictPages.map((district) => `/groundwater-districts/${district.slug}`)];
  return [
    ...districtBriefSlugs.map((slug) => ({ url: absoluteUrl(districtBriefPath(slug)) })),
    ...matters.matters.map(m=>({url:m.canonical_url})),
    ...routes.map((route) => ({ url: absoluteUrl(route || "/"), changeFrequency: route === "/sources" ? "monthly" as const : "yearly" as const })),
    ...publishedSourceCategories.map((category) => ({ url: absoluteUrl(`/sources/${category.slug}`), changeFrequency: "monthly" as const })),
    ...publicSources.map((source) => ({ url: absoluteUrl(`/sources/${source.source_id}`), lastModified: source.last_verified_date, changeFrequency: "monthly" as const })),
  ];
}
