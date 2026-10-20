import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { StructuredData } from "@/app/components/StructuredData";
import { WaterWatchTrackedLink } from "@/app/groundwater-districts/WaterWatchLinks";
import rawLegacyIntelligencePackage from "@/public/data/gcd-district-intelligence/v1/gcd_district_intelligence_v1.json";
import rawIntelligencePackage from "@/public/data/gcd-district-intelligence/v2/gcd_district_intelligence_v2.json";
import rawIntelligenceProvenance from "@/public/data/gcd-district-intelligence/v2/provenance.json";
import {
  getLegacyGroundwaterDistrictPage,
  legacyGroundwaterDistrictPages,
} from "@/lib/groundwater-district-pages";
import {
  summarizeGcdWaterWatchActivities,
  validateGcdIntelligenceV2Package,
} from "@/lib/gcd-intelligence";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import "../intelligence/intelligence.css";
import { loadMeetingIndex } from "@/lib/meeting-intelligence.server";

const tceqDistrictUrl = "https://www.tceq.texas.gov/groundwater/groundwater-planning-assessment/districts.html";
const twdbDistrictUrl = "https://www.twdb.texas.gov/groundwater/conservation_districts/";
const intelligence = validateGcdIntelligenceV2Package(rawIntelligencePackage, rawLegacyIntelligencePackage, rawIntelligenceProvenance);

export function generateStaticParams() {
  return legacyGroundwaterDistrictPages.map((district) => ({ district_slug: district.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ district_slug: string }> }): Promise<Metadata> {
  const district = getLegacyGroundwaterDistrictPage((await params).district_slug);
  if (!district) return {};
  return createPageMetadata({
    title: `${district.shortName} Records | Texas Water Sources`,
    description: `Find official source pathways for ${district.name} records, maps, plans, rules, forms, meetings, and current district verification.`,
    path: `/groundwater-districts/${district.slug}`,
    absoluteTitle: true,
  });
}

export default async function GroundwaterDistrictSourcePage({ params }: { params: Promise<{ district_slug: string }> }) {
  const district = getLegacyGroundwaterDistrictPage((await params).district_slug);
  if (!district) notFound();
  const path = `/groundwater-districts/${district.slug}`;
  const description = `A source-navigation starting point for researching ${district.name} records while keeping district identity, mapped boundaries, property evidence, and current rules separate.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${district.shortName} Records and Official Sources`,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@type": "WebSite", name: "Texas Water Sources", url: absoluteUrl("/") },
  };
  const waterWatchRecords = district.waterWatchId
    ? intelligence.records.filter((record) => record.district_id === district.waterWatchId)
    : [];
  const waterWatchActivities = summarizeGcdWaterWatchActivities(waterWatchRecords);
  const previewMeetings = loadMeetingIndex().filter(m => m.districtId === district.waterWatchId || m.districtId.replaceAll("_", "-") === district.slug);

  return <PageShell><article className="district-source-route">
    <section className="resource-hero district-hero"><div className="wrap">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Groundwater districts", path: "/groundwater-districts" }, { name: district.name, path }]} />
      <p className="eyebrow">District-specific source navigation</p>
      <h1>{district.name} Records and Official Sources</h1>
      <p>{description}</p>
      <div className="source-chip">Research boundary: <strong>verify current information with official sources</strong></div>
    </div></section>

    <div className="wrap district-editorial">
      <section className="district-water-watch" aria-labelledby="district-water-watch-heading">
        <p className="eyebrow">Texas Water Watch</p>
        <h2 id="district-water-watch-heading">{waterWatchRecords.length ? "Reviewed district activity is available" : "Current collection status"}</h2>
        {waterWatchRecords.length ? <>
          <p><strong>{waterWatchRecords.length} reviewed {waterWatchRecords.length === 1 ? "record" : "records"}</strong> from official meeting materials are included in the current released Texas Water Watch collection for {district.name}. These are district-level research leads, not property evidence or a complete district history.</p>
          <ul aria-label="Available activity categories">{waterWatchActivities.map((activity) => <li key={activity.id}>{activity.label}: {activity.count}</li>)}</ul>
          <WaterWatchTrackedLink href={`/groundwater-districts/intelligence?district=${district.waterWatchId}#latest-activity`} event="district_water_watch_clicked">Browse reviewed {district.shortName} activity</WaterWatchTrackedLink>
        </> : <>
          <p>No reviewed meeting-record intelligence for {district.name} is included in the current released collection. This does not mean the district has no meetings, records, or recent activity.</p>
          <WaterWatchTrackedLink href="/groundwater-districts/intelligence" event="district_water_watch_clicked">See districts covered in the current Texas Water Watch release</WaterWatchTrackedLink>
        </>}
      </section>
      <section className="district-section" aria-labelledby="district-source-start">
        {previewMeetings.length ? <p><Link href={`/groundwater-districts/intelligence?view=meetings&district=${previewMeetings[0].districtId}#latest-activity`}>Meeting intelligence · {previewMeetings.length} meeting documents</Link> · source-linked research summaries.</p> : null}
        <div className="district-section-heading"><p className="eyebrow">Start with the authority</p><h2 id="district-source-start">Where to verify the district and its current records</h2><p>Use the official statewide sources to confirm the current district identity, boundary resources, contact pathway, management-plan materials, and official website before relying on a local rule, form, notice, or meeting record.</p></div>
        <div className="district-material-grid">
          <article><span>Statewide orientation</span><h3>TCEQ groundwater-district resources</h3><p>Use the current TCEQ district page for statewide orientation, published map and viewer pathways, and current district contact routing.</p><a href={tceqDistrictUrl} target="_blank" rel="noreferrer">Open the official TCEQ district page <span aria-hidden="true">↗</span></a></article>
          <article><span>Plans and district information</span><h3>TWDB conservation-district resources</h3><p>Use the current TWDB district resources to locate district information, management plans, and related groundwater-planning pathways.</p><a href={twdbDistrictUrl} target="_blank" rel="noreferrer">Open the official TWDB district page <span aria-hidden="true">↗</span></a></article>
          <article><span>Current local records</span><h3>The district’s official website</h3><p>Reach the district’s current official site through an agency pathway, then check its rules, forms, plans, notices, meeting materials, and public-information instructions as separate record types.</p><Link href="/sources/groundwater-districts">Review the approved district source family</Link></article>
        </div>
      </section>

      <section className="district-section" aria-labelledby="district-record-checklist">
        <div className="district-section-heading"><p className="eyebrow">Preserve the research trail</p><h2 id="district-record-checklist">What to record during the search</h2><p>Keep the district name, official page, document title, effective or meeting date, access date, and unresolved property question together. Do not combine a boundary layer, rule, permit record, or meeting reference into one unsupported property conclusion.</p></div>
        <div className="district-rules-grid"><article><h3>Boundary source</h3><p>Record the map or layer viewed, its displayed date, and whether the available property evidence leaves the location inside, outside, near a boundary, conflicting, or unresolved.</p></article><article><h3>Current materials</h3><p>Record each plan, rule, form, notice, agenda, minute, or contact page separately with the date shown by the official source.</p></article><article><h3>Open questions</h3><p>Preserve uncertainty about jurisdiction, registration, permitting, exemptions, spacing, production, metering, reporting, plugging, or compliance for official or professional follow-up.</p></article></div>
        <div className="district-warning"><strong>This page does not determine that a property is in the district.</strong><p>It does not establish jurisdiction, permit or exemption status, well ownership, compliance, current water availability, or the legal effect of a district record. Verify material questions with current official sources and the appropriate Texas professional.</p></div>
      </section>

      <section className="district-section" aria-labelledby="district-next-research">
        <div className="district-section-heading"><p className="eyebrow">Continue carefully</p><h2 id="district-next-research">Related Texas Water Sources research</h2></div>
        <div className="related-research-grid"><Link href="/groundwater-districts"><strong>Groundwater-district research guide</strong><span>Follow the complete boundary, source, contact, and current-rule verification workflow.</span><small>Read the guide →</small></Link><Link href="/property-water-report"><strong>Free property-water report</strong><span>Use an address to organize mapped source leads while keeping the location separate from a surveyed boundary.</span><small>Start the report →</small></Link><Link href="/trec-61-guide/groundwater-district"><strong>TREC Form 61-0 district research</strong><span>Carry a candidate district and unresolved boundary questions into the independent research workflow.</span><small>Read the supporting guide →</small></Link></div>
      </section>
    </div>
    <StructuredData data={jsonLd} />
  </article></PageShell>;
}
