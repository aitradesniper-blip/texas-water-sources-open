import Link from "next/link";
import {
  ArticleJsonLd,
  Breadcrumbs,
  EditorialMeta,
  OfficialSources,
  RelatedResearch,
  ResearchLimitations,
} from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { StructuredData } from "@/app/components/StructuredData";
import StatewideDistrictDirectory from "@/app/groundwater-districts/StatewideDistrictDirectory";
import { groundwaterDistrictsEditorial } from "@/lib/editorial-content";
import { validateGcdStatewideDirectoryV2Package } from "@/lib/gcd-statewide-directory";
import { loadGcdPublicEventPackage } from "@/lib/gcd-public-events.server";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import rawLegacyStatewideDirectory from "@/public/data/gcd-statewide-directory/v1/gcd_statewide_directory_v1.json";
import rawStatewideDirectory from "@/public/data/gcd-statewide-directory/v2/gcd_statewide_directory_v2.json";
import { PrintDistrictChecklistButton } from "./print-checklist-button";
import { loadMeetingIndex } from "@/lib/meeting-intelligence.server";

export const metadata = createPageMetadata({
  title: groundwaterDistrictsEditorial.title,
  description: groundwaterDistrictsEditorial.description,
  path: "/groundwater-districts",
});

const tceqDistrictUrl = "https://www.tceq.texas.gov/groundwater/groundwater-planning-assessment/districts.html";
const twdbDistrictUrl = "https://www.twdb.texas.gov/groundwater/conservation_districts/";
const statewideDirectory = validateGcdStatewideDirectoryV2Package(rawStatewideDirectory, rawLegacyStatewideDirectory);
const publicEvents = loadGcdPublicEventPackage();
const eventCountsByDistrict = Object.fromEntries(
  [...Map.groupBy(publicEvents.records, (event) => event.district_id)].map(([districtId, events]) => [districtId, events.length]),
);

const directoryJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Texas Groundwater Conservation District Directory",
  description: "A statewide release directory of 98 Texas groundwater-district identities with clearly separated source metadata, document listings, and reviewed Texas Water Watch coverage.",
  url: absoluteUrl("/groundwater-districts"),
  isPartOf: { "@type": "WebSite", name: "Texas Water Sources", url: absoluteUrl("/") },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: statewideDirectory.release.directory_entry_count,
    itemListElement: statewideDirectory.districts.map((district, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: district.district_name,
      url: absoluteUrl(`/groundwater-districts#district-${district.district_slug}`),
    })),
  },
};

const organizationTypes = [
  {
    label: "GCD",
    title: "Groundwater conservation district",
    text: "A locally governed district for managing groundwater supplies within its confirmed boundaries. Its enabling law, management plan, and current rules define the questions that need official verification.",
  },
  {
    label: "GMA",
    title: "Groundwater management area",
    text: "A regional joint-planning area used by districts for groundwater planning. A GMA is not a substitute for identifying the groundwater conservation district, if any, that may apply to the location.",
  },
  {
    label: "Service",
    title: "Utility or service district",
    text: "An entity that supplies water or provides another public service may have a different purpose and boundary. Its name, bill, or service area does not by itself identify the applicable groundwater regulator.",
  },
] as const;

const ruleTopics = [
  ["Registration", "Whether a well or owner must be registered, when registration occurs, and which district form or record applies."],
  ["Permitting", "Whether a proposed activity requires an application, permit, amendment, transfer, or other district action."],
  ["Exempt wells", "How the district currently defines and documents an exemption, including any continuing registration, reporting, or other duties."],
  ["Spacing", "Current location or spacing standards and the evidence the district uses when reviewing a well site."],
  ["Production", "Production limits, operating conditions, or other quantity-related requirements stated in current district materials."],
  ["Metering", "Whether a meter is required, which specifications apply, and how readings must be retained or supplied."],
  ["Reporting", "Which production, use, ownership, status, or other reports are required and when they are due."],
  ["Plugging", "District procedures or records relevant to abandoned, deteriorated, or plugged wells, alongside other applicable official requirements."],
] as const;

const checklistFields = [
  ["Source viewed", "Official map, layer, district page, plan, rules, or record pathway"],
  ["Date viewed", "Record the access date for every source used"],
  ["Candidate district", "Name exactly as shown; leave unresolved if sources conflict"],
  ["Boundary confidence", "Inside, outside, near boundary, conflicting sources, or unresolved"],
  ["District contacted", "Date and official contact pathway used, if verification was requested"],
  ["Current rules reviewed", "Rule edition, effective date, management plan, forms, and notices checked"],
  ["Registration or permit questions", "Well status, claimed exemption, filing, transfer, meter, reporting, or other questions"],
  ["Open issues", "Missing property evidence, conflicting boundaries, unanswered district questions, or professional-review flags"],
] as const;

export default function GroundwaterDistrictGuide() {
  return <PageShell><article className="district-hub-page">
    <section className="resource-hero district-hero"><div className="wrap">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Texas groundwater districts", path: "/groundwater-districts" }]} />
      <p className="eyebrow">Statewide directory and property-oriented research</p>
      <h1>How to Find a Texas Groundwater Conservation District</h1>
      <p>Browse the statewide district release, then use an address to orient property research and verify official boundaries, district identity, and current rules without turning a map point into a jurisdiction conclusion.</p>
      <div className="source-chip">Primary official sources: <strong>TCEQ and Texas Water Development Board</strong></div>
      <dl className="gcd-directory-release-stats" aria-label="Statewide groundwater district directory release summary">
        <div><dt>Directory entries</dt><dd>{statewideDirectory.release.directory_entry_count}</dd></div>
        <div><dt>Districts in the public metadata release</dt><dd>{statewideDirectory.release.public_released_district_count}</dd></div>
        <div><dt>Official document records</dt><dd>{statewideDirectory.release.public_document_record_count.toLocaleString("en-US")}</dd></div>
        <div><dt>Districts with reviewed Water Watch records</dt><dd>{statewideDirectory.release.reviewed_water_watch_district_count}</dd></div>
        <div><dt>Reviewed board actions</dt><dd>{publicEvents.record_count}</dd></div>
      </dl>
    </div></section>

    <div className="wrap district-editorial">
      <section className="gcd-directory-overview" aria-labelledby="directory-coverage-heading">
        <div className="gcd-directory-overview-heading"><p className="eyebrow">Understand the coverage</p><h2 id="directory-coverage-heading">One statewide directory, distinct evidence levels</h2><p>The approved public meeting/document metadata release includes district-level records for 80 of the 98 entries. Within those 80, 12 districts have individual document listings totaling 1,934 records. Texas Water Watch separately includes 182 reviewed facts across 11 districts and 60 reviewed board actions from one district.</p></div>
        <div className="gcd-directory-levels">
          <article><span>Identity</span><h3>98 directory entries</h3><p>Each row preserves an approved district identity and frozen slug for this release. It does not claim that 98 is a current legal count of active districts.</p></article>
          <article><span>Source and documents</span><h3>80 released district records</h3><p>Approved public source and coverage metadata exist for 80 entries; 12 include individual document records. Coverage differs by district.</p></article>
          <article><span>Reviewed intelligence</span><h3>11 fact districts · 1 board-action district</h3><p>The fact layer contains 182 records across 11 districts. The separate Board actions layer contains 60 Coastal Bend records. Directory or document coverage is not reviewed intelligence.</p></article>
        </div>
        <aside className="gcd-directory-release-note"><strong>Release boundary</strong><p>Source cutoff: August 1, 2026. This reconciled consumer release was approved September 13, 2026. Document listings help locate official records; they do not establish that a meeting occurred, concluded, or produced an action, and they do not determine district jurisdiction for a property.</p></aside>
      </section>

      <StatewideDistrictDirectory districts={statewideDirectory.districts} eventCountsByDistrict={eventCountsByDistrict} meetingCountsByDistrict={Object.fromEntries([...Map.groupBy(loadMeetingIndex(), m => m.districtId)].map(([id, meetings]) => [id, meetings.length]))} />

      <section className="hub-tool-callout" aria-labelledby="district-intelligence-callout-heading"><div><p className="eyebrow">Texas Water Watch</p><h2 id="district-intelligence-callout-heading">Browse reviewed groundwater-district activity</h2></div><div><p>The Facts layer can surface production history, permit or limit activity, well identifiers, compliance and enforcement, litigation, DFC planning, and water-level intelligence across 11 districts. A separate Board actions layer contains 60 reviewed Coastal Bend meeting-record summaries.</p><p><strong>District-level intelligence is not proof that a record concerns a specific property.</strong></p><div className="button-row"><Link className="button primary" href="/groundwater-districts/intelligence">Open Texas Water Watch</Link><Link className="button quiet" href="/property-water-report">Research a property</Link></div></div></section>

      <p className="editorial-question"><strong>Primary question</strong><span>{groundwaterDistrictsEditorial.primary_question}</span></p>
      <EditorialMeta content={groundwaterDistrictsEditorial} />

      <section className="district-section" aria-labelledby="organization-differences">
        <div className="district-section-heading"><p className="eyebrow">Start with the organization</p><h2 id="organization-differences">GCD versus GMA versus utility or service district</h2><p>Similar names can describe different entities, planning functions, and boundaries. Identify what kind of organization a source names before using it in the property research record.</p></div>
        <div className="district-type-grid">{organizationTypes.map((item) => <article key={item.label}><span>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        <aside className="district-source-note"><strong>Official statewide orientation</strong><p>TCEQ publishes a groundwater-conservation-district page with a current map, viewer, GIS pathway, and district contact list. TWDB separately publishes district information, management plans, and groundwater-management-area resources.</p><div><a href={tceqDistrictUrl} target="_blank" rel="noreferrer">Open the TCEQ district page <span aria-hidden="true">↗</span></a><a href={twdbDistrictUrl} target="_blank" rel="noreferrer">Open the TWDB district page <span aria-hidden="true">↗</span></a></div></aside>
      </section>

      <section className="district-section" aria-labelledby="address-workflow">
        <div className="district-section-heading"><p className="eyebrow">Orient, compare, verify</p><h2 id="address-workflow">How to identify a possible GCD from an address</h2><p>A street address can move an official map to the general area. Complete the workflow with legal-description, survey, county, and district evidence rather than treating the geocoded point as the answer.</p></div>
        <ol className="district-steps">
          <li><strong>1. Gather property identifiers.</strong><span>Keep the street address, county, legal description, survey or abstract references, appraisal identifier, and any reliable boundary materials together. The address is an orientation aid.</span></li>
          <li><strong>2. Open the official district source.</strong><span>Use the <Link href="/sources/tceq_groundwater_conservation_district_boundaries">approved TCEQ boundary source record</Link> to reach the official layer and record its title, displayed update information, and access date.</span></li>
          <li><strong>3. Record the candidate district.</strong><span>Write the district name exactly as displayed and note whether the property location appears inside, outside, or close to a boundary. Preserve uncertainty instead of rounding the point into a result.</span></li>
          <li><strong>4. Compare controlling property evidence.</strong><span>Compare the mapped orientation with the county, legal description, current survey, district boundary descriptions, and other official property evidence available for the question.</span></li>
          <li><strong>5. Verify uncertainty with the district.</strong><span>Use the district’s official site or TCEQ contact list to locate the current contact pathway. Supply the identifiers the district requests and record the response without enlarging it into a title or legal conclusion.</span></li>
        </ol>
        <div className="district-warning"><strong>Why an address point is not a controlling boundary determination</strong><p>A geocoded address can fall at a road, driveway, structure, parcel center, or approximate location. District layers can also be informational rather than survey-grade. Neither the point nor a nearby polygon proves which side of a legal boundary contains the relevant property or well.</p></div>
      </section>

      <section className="district-section" aria-labelledby="boundary-verification">
        <div className="district-section-heading"><p className="eyebrow">Keep close calls unresolved</p><h2 id="boundary-verification">What to do near a district boundary</h2><p>A close map result needs more evidence, not greater zoom alone. Preserve the location question and ask the official district to address the identifiers it uses.</p></div>
        <div className="district-boundary-grid">
          <article><h3>Compare sources</h3><ul><li>Record the official layer, map, or viewer and its date.</li><li>Compare county, legal-description, survey, and appraisal information.</li><li>Look for boundary descriptions in official district or legislative materials.</li><li>Record disagreements between a point, parcel depiction, and district layer.</li></ul></article>
          <article><h3>How to verify with the district</h3><ul><li>Locate the official district website through TCEQ or TWDB.</li><li>Use the published district contact pathway; do not rely on an unverified directory.</li><li>Ask what property identifiers and current boundary material the district uses.</li><li>Record the date, source, response, remaining uncertainty, and next question.</li></ul></article>
        </div>
        <p className="district-boundary-note"><strong>Stop condition:</strong> If official sources conflict or the district cannot resolve the location from the available identifiers, record boundary confidence as unresolved and identify the property or professional evidence still needed.</p>
      </section>

      <section className="district-section" aria-labelledby="district-rules">
        <div className="district-section-heading"><p className="eyebrow">Read the current local materials</p><h2 id="district-rules">What district rules may cover</h2><p>Groundwater conservation districts are locally governed, and the applicable topics, definitions, exemptions, forms, and procedures must be checked in the candidate district’s current official materials.</p></div>
        <div className="district-rules-grid">{ruleTopics.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className="district-warning"><strong>Do not transfer a rule from one district to another.</strong><p>The <Link href="/sources/coastal_bend_groundwater_conservation_district">Coastal Bend GCD source page</Link> demonstrates how an approved district-specific route can lead to official rules, forms, notices, meetings, and public-record navigation. It is not a statewide rule source or proof that Coastal Bend GCD applies to another property.</p></div>
      </section>

      <section className="district-section" aria-labelledby="district-materials">
        <div className="district-section-heading"><p className="eyebrow">Find the record behind the result</p><h2 id="district-materials">How to locate district plans, contacts, and records</h2><p>Use current official pathways and record what was actually available. A district name without its plan, rules, forms, or response is only the beginning of the research.</p></div>
        <div className="district-material-grid">
          <article><span>Management plan</span><h3>Locate the district management plan</h3><p>Start with the <a href={twdbDistrictUrl} target="_blank" rel="noreferrer">TWDB conservation-district page</a>, which routes to individual district information and management plans. Then compare the plan shown by TWDB with the district’s current official publications.</p></article>
          <article><span>Official contact</span><h3>Locate district contact information</h3><p>Use the current TCEQ district contact list or the official district website reached through an agency source. Record the page and access date because staff, addresses, and procedures can change.</p></article>
          <article><span>District records</span><h3>Locate district records</h3><p>Review the official site for rules, forms, permits or registration pathways, meeting materials, notices, and public-information instructions. If a record is not posted, follow the district’s current official public-record process.</p></article>
        </div>
      </section>

      <section className="district-section district-no-result" aria-labelledby="no-district-shown">
        <div className="district-section-heading"><p className="eyebrow">Interpret absence narrowly</p><h2 id="no-district-shown">What “no district shown” does and does not mean</h2><p>It means only that the source, layers, location method, and date you recorded did not display a district for the searched point or area. It does not prove that no groundwater conservation district applies, that a boundary has not changed, or that no groundwater regulation, registration, permit, reporting, spacing, plugging, or other requirement exists.</p></div>
        <ol className="district-no-result-list"><li><strong>Confirm the source and layer.</strong><span>Make sure the current official district layer—not a GMA, utility, service area, or unrelated boundary—was selected.</span></li><li><strong>Check the location evidence.</strong><span>Compare the address point with the county, legal description, survey, and the location of the well or proposed activity.</span></li><li><strong>Record the negative result.</strong><span>Save the source name, access date, area checked, layer status, and wording used. Do not rewrite it as “no regulation.”</span></li><li><strong>Escalate uncertainty.</strong><span>Use TCEQ, TWDB, the possible district, and an appropriate Texas professional when the boundary or regulatory question remains material.</span></li></ol>
      </section>

      <section className="district-section" aria-labelledby="assistant-record">
        <div className="district-section-heading"><p className="eyebrow">Carry the evidence forward</p><h2 id="assistant-record">How to record the result in the TREC research assistant</h2><p>The assistant organizes known information and unresolved research. It does not select a Form 61-0 answer or convert a candidate district into a jurisdiction determination.</p></div>
        <div className="district-assistant-grid"><div><h3>Record</h3><ul><li>Candidate district name</li><li>Official source and date viewed</li><li>Property identifiers used</li><li>Boundary confidence</li><li>Rules, plan, forms, and district records reviewed</li></ul></div><div><h3>Keep unresolved</h3><ul><li>Near-boundary or conflicting-source results</li><li>Unverified exemption, registration, or permit status</li><li>Missing legal-description or survey evidence</li><li>Unanswered district questions</li><li>Professional-review flags</li></ul></div></div>
        <Link className="button primary district-assistant-link" href="/trec-61-guide">Open the TREC Form 61-0 research guide</Link>
      </section>

      <section className="district-checklist" aria-labelledby="district-checklist-heading">
        <header><div><p className="eyebrow">Printable evidence record</p><h2 id="district-checklist-heading">District-Verification Checklist</h2><p>Use one checklist for each property research question. Leave blanks and conflicts visible rather than converting them into assumptions.</p></div><PrintDistrictChecklistButton /></header>
        <div className="district-checklist-property"><span>Property or research label</span><i></i><span>County</span><i></i></div>
        <dl>{checklistFields.map(([field, prompt]) => <div key={field}><dt>{field}</dt><dd><span>{prompt}</span><i></i><i></i></dd></div>)}</dl>
        <div className="district-checklist-note"><strong>Verification boundary</strong><p>This checklist documents sources, candidate routing, and unresolved questions. It does not determine jurisdiction, exemption, permitting, compliance, ownership, or the legal effect of district rules.</p></div>
      </section>

      <ResearchLimitations content={groundwaterDistrictsEditorial} />
      <OfficialSources content={groundwaterDistrictsEditorial} />
      <RelatedResearch content={groundwaterDistrictsEditorial} />
      <p className="district-method-note">This guide follows the <Link href="/methodology">Texas Water Sources research methodology</Link> and the <Link href="/disclaimer">independent-service disclaimer</Link>. Official agency and district records remain authoritative, and unresolved jurisdiction or property questions remain unresolved.</p>
    </div>
    <ArticleJsonLd content={groundwaterDistrictsEditorial} />
    <StructuredData data={directoryJsonLd} />
  </article></PageShell>;
}
