import rawLegacyPackage from "@/public/data/gcd-district-intelligence/v1/gcd_district_intelligence_v1.json";
import rawPackage from "@/public/data/gcd-district-intelligence/v2/gcd_district_intelligence_v2.json";
import rawProvenance from "@/public/data/gcd-district-intelligence/v2/provenance.json";
import Link from "next/link";
import { Breadcrumbs } from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { StructuredData } from "@/app/components/StructuredData";
import { WaterWatchTrackedLink } from "@/app/groundwater-districts/WaterWatchLinks";
import { absoluteUrl } from "@/lib/seo";
import { loadGcdPublicEventPackage } from "@/lib/gcd-public-events.server";
import {
  DISTRICT_INTELLIGENCE_SUMMARIES,
  formatGcdSourceDate,
  getGcdSourceDate,
  summarizeGcdWaterWatchActivities,
  validateGcdIntelligenceV2Package,
} from "@/lib/gcd-intelligence";
import IntelligenceBrowser from "./IntelligenceBrowser";
import { loadMeetingBrowseIndex } from "@/lib/meeting-browse.server";
import coverageSource from "@/data/meeting-intelligence/coverage-status-source.json";
import { briefDate, districtBriefSlugs, loadDistrictBrief } from "@/lib/district-briefs.server";
import "./meeting-intelligence.css";

const intelligence = validateGcdIntelligenceV2Package(rawPackage, rawLegacyPackage, rawProvenance);
const publicEvents = loadGcdPublicEventPackage();
for (const district of DISTRICT_INTELLIGENCE_SUMMARIES) {
  const recordCount = intelligence.records.filter((record) => record.district_id === district.district_id).length;
  if (recordCount !== district.record_count) throw new Error(`Water Watch district summary mismatch for ${district.district_id}`);
}
const districtSummaries = [...DISTRICT_INTELLIGENCE_SUMMARIES].sort((left, right) => left.district_name.localeCompare(right.district_name));

export function MeetingRecordsContent({ path }: { path: string }) {
  const meetingBrowse = loadMeetingBrowseIndex();
  const meetingDistricts = Object.keys(meetingBrowse.districts).length;
  const title = "Texas Groundwater District Intelligence — Texas Water Watch";
  const description = "Reviewed, source-linked activity from Texas groundwater conservation district records — permits and limits, pumping and production, well identifiers, water-level observations, compliance, planning, and other district activity.";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: "Texas Water Sources",
      url: absoluteUrl("/"),
    },
  };
  const activitySummary = summarizeGcdWaterWatchActivities(intelligence.records);
  const latestSourceDate = intelligence.records
    .map((record) => getGcdSourceDate(record.official_source_url))
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return <PageShell prefetchNavigation={false}><article className="gcd-intelligence-page">
    <header className="gcd-intelligence-hero"><div className="wrap">
      <Breadcrumbs prefetch={false} items={[{ name: "Home", path: "/" }, { name: "Groundwater districts", path: "/groundwater-districts" }, { name: "Texas Water Watch", path }]} />
      <p className="eyebrow">Texas Water Watch</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="gcd-hero-actions"><a className="button primary" href="#latest-activity">Browse latest activity</a><WaterWatchTrackedLink prefetch={false} className="button secondary" href="/property-water-report" event="water_watch_property_report_clicked">Research a property</WaterWatchTrackedLink></div>
      <dl><div><dt>Reviewed facts</dt><dd>{intelligence.record_count}</dd></div><div><dt>Board actions</dt><dd>{publicEvents.record_count}</dd></div><div><dt>Fact districts covered</dt><dd>{districtSummaries.length}</dd></div><div><dt>Board-action districts</dt><dd>{publicEvents.district_count}</dd></div><div><dt>Latest source date in this release</dt><dd>{latestSourceDate ? formatGcdSourceDate(latestSourceDate) : "Not stated"}</dd></div></dl>
    </div></header>
    <div className="wrap gcd-intelligence-content">
      <section className="gcd-watch-overview" aria-labelledby="water-watch-overview-heading">
        <div><p className="eyebrow">What you can review</p><h2 id="water-watch-overview-heading">See what districts with reviewed records are documenting</h2></div>
        <div><p>Texas Water Watch keeps three evidence layers distinct: 182 reviewed facts across 11 districts, 60 reviewed board-action summaries from Coastal Bend Groundwater Conservation District, and {meetingBrowse.record_count} source-linked documents across {meetingDistricts} issuing districts. At least one full-document Meeting Intelligence source is represented for all 98 identities in the current district directory. Historical depth and recency vary by district. This is not a statewide monitor or complete meeting history.</p><p><Link href="/groundwater-districts#statewide-directory-heading">Browse the statewide groundwater district directory</Link> to compare all 98 directory identities and see which coverage level is available for each district.</p>{latestSourceDate ? <p className="gcd-date-note">The latest day-specific date supported by an official source filename in the fact collection is <time dateTime={latestSourceDate}>{formatGcdSourceDate(latestSourceDate)}</time>. Open the official record to verify its meeting and approval context.</p> : null}</div>
      </section>
      <section className="gcd-watch-briefs" aria-labelledby="district-research-briefs-heading">
        <div className="gcd-section-heading"><p className="eyebrow">Read across the records</p><h2 id="district-research-briefs-heading">District research briefs</h2><p>Two date-bounded accounts of board decisions, changes and unresolved questions. Selected minutes, not continuous coverage; corpus snapshot September 29, 2026.</p></div>
        <div className="gcd-district-grid gcd-brief-grid">{districtBriefSlugs.map((slug) => {
          const brief = loadDistrictBrief(slug)!;
          return <article key={slug}><h3><Link prefetch={false} href={brief.path}>{brief.district}</Link></h3><p><strong>Included minutes:</strong> {briefDate(brief.from)}–{briefDate(brief.through)}</p><p>{brief.opening.text}</p><Link prefetch={false} href={brief.path}>Read the 2026 brief <span aria-hidden="true">→</span></Link></article>;
        })}</div>
      </section>
      <section className="gcd-watch-districts" aria-labelledby="water-watch-districts-heading">
        <div className="gcd-section-heading"><p className="eyebrow">Current released coverage</p><h2 id="water-watch-districts-heading">Eleven districts in the released collection</h2><p>Open an available district research page or statewide directory entry for source navigation, or use the activity collection below to compare reviewed references.</p></div>
        <div className="gcd-district-grid">{districtSummaries.map((district) => {
          const districtRecords = intelligence.records.filter((record) => record.district_id === district.district_id);
          const groups = summarizeGcdWaterWatchActivities(districtRecords);
          const districtPath = district.site_detail_path ?? `/groundwater-districts#district-${district.district_slug}`;
          const boardActionCount = publicEvents.records.filter((event) => event.district_id === district.district_id).length;
          return <article key={district.district_id}><p className="gcd-district-count"><strong>{district.record_count}</strong> reviewed {district.record_count === 1 ? "fact" : "facts"}{boardActionCount ? <> · <strong>{boardActionCount}</strong> board actions</> : null}</p><h3>{district.district_name}</h3><p>{groups.map((group) => group.label).join(" · ")}</p><Link href={districtPath}>{district.site_detail_path ? "Open district research page" : "Find this district in the statewide directory"} <span aria-hidden="true">→</span></Link></article>;
        })}</div>
      </section>
      <section className="gcd-watch-categories" aria-labelledby="water-watch-categories-heading">
        <div className="gcd-section-heading"><p className="eyebrow">Available activity</p><h2 id="water-watch-categories-heading">What the released records cover</h2></div>
        <ul>{activitySummary.map((group) => <li key={group.id}><span>{group.label}</span><strong>{group.count}</strong></li>)}</ul>
      </section>
      <aside className="gcd-scope-warning"><strong>District-level intelligence — not property evidence</strong><p>{intelligence.disclaimer}</p></aside>
      <p><Link href="/groundwater-districts/intelligence/coverage">Coverage and source-check status</Link> · <Link href="/groundwater-districts/data">Data access and downloads</Link></p>
      <div id="latest-activity"><IntelligenceBrowser records={intelligence.records} events={publicEvents.records} meetingBrowse={meetingBrowse} factContext={coverageSource.fact_context} /></div>
      <noscript><section aria-label="Meeting source navigation without JavaScript"><h2>Recent meeting sources</h2><p>Browse complete records below or use <Link href="/groundwater-districts/data">Data access</Link> for the full collection.</p><ul>{meetingBrowse.records.slice(0,20).map(m=><li key={m.key}><Link href={`/groundwater-districts/intelligence/meetings/${m.key}`}>{meetingBrowse.districts[m.districtId]} · {m.date||m.documentType}</Link> · <a href={m.sourceUrl}>Official source</a></li>)}</ul></section></noscript>
      <section className="gcd-method-note"><h2>How to use this collection</h2><p>Start with the reviewed interpretation and source page, then open the linked official district record. “Original semantics retained” means the reviewed product kept the candidate’s fact type. “Reviewed related semantics” means review mapped the item to a safer related category. OCR, native-text, and visual-review labels describe extraction evidence; none is human fact confirmation or legal/source-image certification.</p></section>
    </div>
    <StructuredData data={jsonLd} />
  </article></PageShell>;
}
