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
import { wellRecordsEditorial } from "@/lib/editorial-content";
import { createPageMetadata } from "@/lib/seo";
import { PrintWorksheetButton } from "./print-worksheet-button";
import { WellRecordsIntentRouter } from "./WellRecordsIntentRouter";

export const metadata = createPageMetadata({
  title: wellRecordsEditorial.title,
  description: wellRecordsEditorial.description,
  path: "/well-records",
});

const twdbInstructionsUrl = "https://www.twdb.texas.gov/groundwater/data/locwwrep.asp";
const twdbGroundwaterDataUrl = "https://www.twdb.texas.gov/groundwater/data/index.asp";

const preparationItems = [
  ["Approximate drilling date", "Even an estimated year helps identify where to start. Uncertain dates and overlapping coverage may require searching more than one system."],
  ["Historical owner", "Use the name of the person or entity that owned the property when the well may have been drilled."],
  ["Driller and depth", "A drilling-company name and approximate total depth can distinguish records with similar locations or owners."],
  ["County and address", "Keep the county and current 911 address, but expect older reports to use route-and-box or descriptive addresses."],
  ["Legal description", "Retain subdivision, lot, block, survey, abstract, or other available property-description details for comparison."],
  ["Known identifiers", "Preserve any tracking number, state well number, report date, permit reference, maintenance record, or well tag exactly as shown."],
] as const;

const systemCards = [
  {
    period: "Primary route: 2003 to present",
    title: "Start with Submitted Drillers Reports",
    text: "TWDB says water-well reports drilled since 2003 are submitted electronically and stored in the Submitted Drillers Reports database. Search the map first when location is useful, then use report fields when it is not.",
    href: "/sources/twdb_submitted_drillers_reports",
    link: "Review the approved Submitted Drillers Reports source record",
  },
  {
    period: "Primary route: before 2003",
    title: "Use the historical Water Well Report Viewer",
    text: "Pre-2003 reports were submitted on paper, later scanned, and organized through the TCEQ viewer. A map grid can contain multiple report files or maps, so review the grid results rather than expecting one precise well point.",
    href: twdbInstructionsUrl,
    link: "Open TWDB's current historical-report instructions",
  },
  {
    period: "Known paper crossover: 2003–2005",
    title: "Search both pathways after no result",
    text: "TWDB notes that a paper copy from this transition period may be in the historical viewer. If the current map and Submitted Drillers Reports search do not locate it, check the older system before recording the search as unresolved.",
    href: twdbInstructionsUrl,
    link: "Read the official crossover guidance",
  },
] as const;

const comparisonFields = [
  ["Tracking number", "Submitted-report identifier"],
  ["State well number", "Groundwater Database identifier, if present"],
  ["Report date", "Date shown on the source record"],
  ["Historical owner", "Name reported when the well was drilled"],
  ["Driller", "Person or company shown on the report"],
  ["Depth", "Reported total depth and the field where it appears"],
  ["Proposed use", "Reported intended use at the time of drilling"],
  ["Address or legal-description match", "Details that agree, conflict, or remain missing"],
  ["Mapped location", "Map layer, point, grid, and any location uncertainty"],
  ["Physical or survey evidence", "Observed well, survey, maintenance record, seller information, or other comparison evidence"],
  ["Match status", "Likely match, candidate record, conflicting record, or unresolved"],
  ["Unresolved questions", "Missing identifiers, conflicts, follow-up sources, or professional-review issues"],
] as const;

export default function WellRecordsGuide() {
  return <PageShell><article className="well-hub-page">
    <section className="resource-hero well-hero"><div className="wrap">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Texas water well records", path: "/well-records" }]} />
      <p className="eyebrow">Task-oriented Texas well-record research</p>
      <h1>How to Find Texas Water Well Records</h1>
      <p>This guide routes you among TWDB records, Submitted Drillers Reports, historical Texas well logs, and other Texas water well database records. It also explains how to search well records by address or identifier without treating a map point or name as proof about a parcel.</p>
      <div className="source-chip">Primary official source: <strong>Texas Water Development Board</strong></div>
    </div></section>

    <div className="wrap well-editorial">
      <p className="editorial-question"><strong>Primary question</strong><span>{wellRecordsEditorial.primary_question}</span></p>
      <WellRecordsIntentRouter />
      <EditorialMeta content={wellRecordsEditorial} />

      <section className="well-section" aria-labelledby="before-search">
        <div className="well-section-heading"><p className="eyebrow">Prepare the search</p><h2 id="before-search">What to gather before searching</h2><p>TWDB identifies the approximate drilling year and the owner at the time of drilling as the minimum starting information. Add every reliable identifier you can find, but keep current property facts separate from historical report fields.</p></div>
        <div className="well-prep-grid">{preparationItems.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="well-section" aria-labelledby="which-system">
        <div className="well-section-heading"><p className="eyebrow">Choose a pathway</p><h2 id="which-system">Which official system to use</h2><p>The systems differ in record role and identifiers, and their coverage can overlap. The drilling period is the practical first routing clue, not proof that a report must appear in only one system.</p></div>
        <div className="well-system-grid">{systemCards.map((card) => <article key={card.period}><span>{card.period}</span><h3>{card.title}</h3><p>{card.text}</p>{card.href.startsWith("/") ? <Link href={card.href}>{card.link} →</Link> : <a href={card.href} target="_blank" rel="noreferrer">{card.link} <span aria-hidden="true">↗</span></a>}</article>)}</div>
        <aside className="well-coverage-note" aria-labelledby="coverage-overlap-heading"><h3 id="coverage-overlap-heading">Why 2001–2002 should be searched in both places</h3><p>TWDB’s locating instructions use 2003 as the practical divider between Submitted Drillers Reports and the historical TCEQ viewer. TWDB’s Groundwater Data page also states that the Submitted Driller’s Report Database contains reports submitted to TDLR from February 2001 to present. For a well drilled or reported in 2001 or 2002—or when the date is uncertain—search both systems and record the results separately.</p><a href={twdbGroundwaterDataUrl} target="_blank" rel="noreferrer">Read TWDB’s Groundwater Data coverage description <span aria-hidden="true">↗</span></a></aside>
        <div className="well-database-compare">
          <section><h3>Groundwater Database versus Submitted Drillers Reports</h3><p>The TWDB Groundwater Database is a selected statewide inventory used for groundwater and aquifer information. Its records use state well numbers and may include location, construction, water-level, or water-quality fields. Submitted Drillers Reports are construction reports hosted for TDLR and use tracking numbers. A well may appear in both systems, but neither system is a complete parcel registry.</p><Link href="/sources/twdb_groundwater_database">Review the approved Groundwater Database source record →</Link></section>
          <section><h3>Do not skip plugging reports</h3><p>A plugging report is a separate record type that can supply a reported date, identifier, and location context. It does not by itself establish present physical conditions, parcel attribution, ownership, or the completeness of historical plugging activity.</p><Link href="/sources/twdb_plugging_reports">Review the approved Plugging Reports source record →</Link></section>
        </div>
      </section>

      <section className="well-section" aria-labelledby="search-by-address">
        <div className="well-section-heading"><p className="eyebrow">Location-first search</p><h2 id="search-by-address">Search by property address, map, or tracking number</h2><p>An address can orient a map search, but the returned point still has to be tested against the report and independent property evidence.</p></div>
        <ol className="well-search-steps">
          <li><strong>Search the address.</strong><span>For a 2003–present report, enter the 911 street address in the Groundwater Data Viewer to orient the map. Treat the address result as a place to begin, not a parcel boundary.</span></li>
          <li><strong>Inspect the map layer.</strong><span>Open a nearby well point, record the displayed source and identifiers, and compare the point with the report rather than relying on distance alone.</span></li>
          <li><strong>Open the tracking number.</strong><span>For a Submitted Drillers Report point, use the linked tracking number to open the report and preserve the number exactly. A state well number is a different identifier.</span></li>
          <li><strong>When nothing plots, change the search.</strong><span>Coordinates may be entered incorrectly, so search Submitted Drillers Reports by owner, driller, county, address text, or drilling-date range. For 2003–2005, also check the historical viewer.</span></li>
        </ol>
      </section>

      <section className="well-section" aria-labelledby="without-address">
        <div className="well-section-heading"><p className="eyebrow">Field-first search</p><h2 id="without-address">Search without an exact address</h2><p>Use combinations that are broad enough to survive abbreviations, name variations, or older location descriptions. Save the query you used so a no-result outcome remains reproducible.</p></div>
        <div className="well-filter-grid">
          <article><h3>Owner</h3><p>Try the historical owner’s surname or a distinctive part of an entity name. Compare the returned report’s owner field with deed history; a name match alone is not enough.</p></article>
          <article><h3>Driller</h3><p>Use the driller or company name when known. This can narrow a county-and-date search and help distinguish otherwise similar reports.</p></article>
          <article><h3>County</h3><p>Start with the correct county, then add a date range or another reliable field. County-only searches may return many unrelated records.</p></article>
          <article><h3>Date range</h3><p>Use an estimated drilling period rather than one exact date when the year is uncertain. Expand the range once before assuming the report is absent.</p></article>
          <article className="well-less-more"><h3>Use “less is more” for text</h3><p>TWDB warns that text searching follows what was entered. A record using “Ave” may not match “Avenue,” so begin with the stable part of a street, owner, or driller name and add detail only when the result set is too broad.</p></article>
        </div>
      </section>

      <section className="well-section" aria-labelledby="test-match">
        <div className="well-section-heading"><p className="eyebrow">Compare the evidence</p><h2 id="test-match">How to test a possible match</h2><p>No single field should carry the conclusion. Compare several independent details and preserve conflicts as unresolved.</p></div>
        <div className="well-match-grid">
          <div><h3>Compare report facts</h3><ul><li>Owner at the time of drilling</li><li>Drilling and report dates</li><li>Driller or company</li><li>Reported depth and construction details</li><li>Proposed use</li><li>Address, route description, legal description, or survey references</li></ul></div>
          <div><h3>Compare property evidence</h3><ul><li>Deed or appraisal history</li><li>Current survey and legal description</li><li>Observed well location or physical evidence</li><li>Seller-known maintenance or service records</li><li>District records when a district may apply</li><li>Conflicts among identifiers, dates, and mapped locations</li></ul></div>
        </div>
        <div className="well-warning"><strong>Why coordinates or map points may be incorrect</strong><p>TWDB cautions that coordinates can be entered incorrectly and a report may not plot in the expected place. Older scanned reports may be organized within a map grid and use route-and-box, directional, subdivision, or legal-description text instead of a current address. A point or grid is therefore a research lead, not property-association evidence.</p></div>
      </section>

      <section className="well-section" aria-labelledby="read-report">
        <div className="well-section-heading"><p className="eyebrow">Read before concluding</p><h2 id="read-report">How to read a well report</h2><p>Begin with the identifiers and location description, then record construction fields exactly as reported. Keep historical statements in their original time context.</p></div>
        <dl className="well-report-fields">
          <div><dt>Report identifiers</dt><dd>Record the tracking number, state well number if present, and report date without combining or relabeling them.</dd></div>
          <div><dt>Owner and driller</dt><dd>These are names reported for the drilling event. Compare them with historical evidence; do not restate them as current ownership.</dd></div>
          <div><dt>Location</dt><dd>Transcribe the address, legal description, directions, coordinates, map grid, or other location description and note any uncertainty.</dd></div>
          <div><dt>Depth and construction</dt><dd>Identify the exact depth or construction field being used. Do not substitute a similarly named value from another part of the form.</dd></div>
          <div><dt>Proposed use</dt><dd>Record the use reported when the well was drilled. It does not establish the current use or operating condition.</dd></div>
          <div><dt>Comments and linked records</dt><dd>Review remarks for cross-references between a tracking number and state well number, then save any linked report separately.</dd></div>
        </dl>
      </section>

      <section className="well-section well-report-limits" aria-labelledby="report-limits">
        <div className="well-section-heading"><p className="eyebrow">Keep the conclusion narrow</p><h2 id="report-limits">What a well report cannot establish</h2><p>A report documents information supplied for a drilling or related record at a point in time. It does not by itself establish that the well still exists or operates, who owns it now, whether it belongs to the researched parcel, its present or future yield, current water quality, or compliance with current district and agency requirements.</p></div>
        <div className="well-warning"><strong>Record the source claim, not a larger conclusion</strong><p>Use the report to preserve reported identifiers, dates, names, location descriptions, proposed use, and construction details. Use separate current evidence and the appropriate official authority for present-condition, ownership, quality, yield, or compliance questions.</p></div>
      </section>

      <section className="well-section well-flow-section" aria-labelledby="no-result-flow">
        <div className="well-section-heading"><p className="eyebrow">Accessible decision flow</p><h2 id="no-result-flow">No-result troubleshooting flowchart</h2><p>Follow the steps in order. Each branch changes the search evidence; none converts a no-result screen into proof that no well exists.</p></div>
        <ol className="well-flowchart" aria-label="What to try after a Texas well-record search returns no result">
          <li><article><span>Start</span><h3>No useful result from an address or map search</h3><p>Save the system, query, layers, area, and search date. Confirm the county and approximate drilling period.</p></article></li>
          <li><article><span>Decision 1</span><h3>Which date route applies?</h3><p><strong>2003 or later:</strong> begin with Submitted Drillers Reports. <strong>Before 2003:</strong> begin with the historical TCEQ viewer. <strong>2001–2002 or uncertain:</strong> search both systems and record the results separately.</p></article></li>
          <li><article><span>Decision 2</span><h3>Could it fall in the 2003–2005 paper-copy crossover?</h3><p><strong>If yes:</strong> retain a separate check of the historical TCEQ viewer even after the current TWDB searches return no result. <strong>If no:</strong> continue with field and identifier changes.</p></article></li>
          <li><article><span>Try again</span><h3>Reduce text and vary the evidence</h3><p>Use a surname, street root, partial driller name, expanded date range, legal description, tracking number, or state well number. Review nearby points only as candidates.</p></article></li>
          <li><article><span>Broaden sources</span><h3>Check other official record pathways</h3><p>Review the Groundwater Database, plugging reports, and a possible groundwater conservation district. Compare physical, survey, deed-history, seller, and maintenance evidence.</p></article></li>
          <li><article><span>Record outcome</span><h3>Keep the result unresolved when the evidence does not converge</h3><p>Document searches and candidate records, identify the next source or professional question, and do not state that the absence of a result proves no well exists.</p></article></li>
        </ol>
      </section>

      <section className="well-worksheet" aria-labelledby="worksheet-heading">
        <header><div><p className="eyebrow">Printable worksheet</p><h2 id="worksheet-heading">Texas Well-Record Comparison Worksheet</h2><p>Use one worksheet for each candidate report. Preserve conflicts and blanks rather than filling them with assumptions.</p></div><PrintWorksheetButton /></header>
        <div className="worksheet-property-lines"><span>Property or research label</span><i></i><span>County</span><i></i><span>Search date</span><i></i></div>
        <dl>{comparisonFields.map(([field, prompt]) => <div key={field}><dt>{field}</dt><dd><span>{prompt}</span><i></i><i></i></dd></div>)}</dl>
        <div className="worksheet-note"><strong>Comparison boundary</strong><p>This worksheet organizes candidate evidence. It does not establish ownership, parcel association, present operation, water quality, yield, or regulatory compliance.</p></div>
      </section>

      <section className="editorial-section"><p className="eyebrow">Help before a repair</p><h2>Could your district help with repair costs?</h2><p>In Bastrop, Lee, Milam or Burleson County, check district approval and payment rules before authorizing work. Diagnostic costs and contractor requirements matter too.</p><a className="text-link" href="/well-records/repair-assistance-before-work">Check well repair assistance before work starts</a></section>
      <ResearchLimitations content={wellRecordsEditorial} />
      <OfficialSources content={wellRecordsEditorial} />
      <RelatedResearch content={wellRecordsEditorial} />
      <p className="well-method-note">This guide follows the <Link href="/methodology">Texas Water Sources research methodology</Link> and the <Link href="/disclaimer">independent-service disclaimer</Link>. Official records remain authoritative, and unresolved property or document questions remain unresolved.</p>
    </div>
    <ArticleJsonLd content={wellRecordsEditorial} />
  </article></PageShell>;
}
