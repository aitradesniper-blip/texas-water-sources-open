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
import { surfaceWaterRightsEditorial } from "@/lib/editorial-content";
import { createPageMetadata } from "@/lib/seo";
import { SurfaceCandidateWorksheet } from "./surface-candidate-worksheet";

export const metadata = createPageMetadata({
  title: surfaceWaterRightsEditorial.title,
  description: surfaceWaterRightsEditorial.description,
  path: "/surface-water-rights",
});

const viewerUrl = "https://www.tceq.texas.gov/gis/water-rights-viewer";
const viewerGuideUrl = "https://www.tceq.texas.gov/downloads/gis/docs/water-rights-viewer-userguide-exb.pdf";
const waterRightsDataUrl = "https://www.tceq.texas.gov/permitting/water_rights/wr-permitting/wrwud";
const waterCodeUrl = "https://statutes.capitol.texas.gov/docs/WA/htm/WA.11.htm";

const identifierFields = [
  ["Authorization number", "Record the water-right or authorization identifier exactly as displayed. Preserve prefixes, punctuation, and the viewer search date."],
  ["Permit or certificate", "Record the document type and number shown in the viewer or linked instrument. Do not combine distinct permits, certificates, amendments, or adjudication records."],
  ["Point of diversion", "Describe the displayed diversion or impoundment point and the layer used. Treat the mapped position as approximate research evidence, not a surveyed property location."],
  ["Place of use", "Record the place-of-use description or display separately from the diversion point. Note whether the source is the viewer, an authorization document, or another official record."],
  ["Authorized purpose", "Transcribe the purpose as shown and retain the document or record date. An authorized purpose does not establish current use on the researched property."],
  ["Basin", "Record the basin named by the official record. Use it to organize the search, not as proof that a nearby authorization applies to the property."],
  ["Recorded holder", "Preserve the holder or owner name exactly as displayed, together with the source and access date. Do not restate the field as current title ownership."],
  ["Linked documents", "Open the water-right instrument, adjudication determination, amendments, or other linked records that appear relevant. Save each document title and date separately."],
  ["Water-use records", "Where records are available, note the reporting year, purpose, and value as displayed. Keep self-reported use data separate from authorization terms and current property facts."],
] as const;

const comparisonSources = [
  ["Legal description", "Compare the authorization and place-of-use language with the property’s complete legal description. A shared survey, abstract, tract, or geographic reference is a lead, not a final match."],
  ["Deed history", "Review conveyances, reservations, exceptions, assignments, and related recorded instruments across the relevant chain. A name appearing in both sources does not establish transfer."],
  ["Title materials", "Compare commitments, exceptions, schedules, abstracts, and supporting instruments for the specific transaction. Preserve missing documents and interpretation questions."],
  ["Survey", "Use the current survey and any reliable historical survey to compare property limits, water features, diversion locations, and described places of use without treating the viewer as survey-grade."],
  ["Seller information", "Record seller-known history, documents, use, infrastructure, and unresolved questions separately from what the public viewer displays. The seller—not this guide—supplies disclosure answers."],
] as const;

export default function SurfaceWaterRightsGuide() {
  return <PageShell><article className="surface-hub-page">
    <section className="resource-hero surface-hero"><div className="wrap">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Texas surface-water rights", path: "/surface-water-rights" }]} />
      <p className="eyebrow">Surface-water record research workflow</p>
      <h1>Texas Surface-Water Rights Research Guide</h1>
      <p>Research a possible Texas surface-water authorization, preserve its official identifiers and documents, and compare those records with property evidence without treating a mapped point, place of use, or recorded holder as proof of ownership or transfer.</p>
      <div className="source-chip">Primary official source: <strong>Texas Commission on Environmental Quality</strong></div>
    </div></section>

    <div className="wrap surface-editorial">
      <p className="editorial-question"><strong>Primary question</strong><span>{surfaceWaterRightsEditorial.primary_question}</span></p>
      <section className="hub-tool-callout" aria-labelledby="surface-viewer-tool-heading">
        <div><p className="eyebrow">Focused viewer companion</p><h2 id="surface-viewer-tool-heading">Start with mapped surface-water leads.</h2></div>
        <div><p>Use an address to identify nearby WR_ID groups, then continue in the official TCEQ viewer and preserve unresolved property comparisons.</p><Link className="button primary" href="/surface-water-rights/water-rights-viewer">Open the TCEQ Water Rights Viewer companion</Link></div>
      </section>
      <EditorialMeta content={surfaceWaterRightsEditorial} />

      <section className="surface-section" aria-labelledby="viewer-contains">
        <div className="surface-section-heading"><p className="eyebrow">Understand the source</p><h2 id="viewer-contains">What the Water Rights Viewer contains</h2><p>TCEQ describes the viewer as an interactive map for water-right authorizations and related information. It can lead to authorized water-right points, water-right documents, adjudication determinations, recorded owner or holder information, recent water-use records, and environmental-flow standards.</p></div>
        <div className="surface-overview-grid">
          <article><span>Map</span><h3>Authorization locations</h3><p>The All Water Rights layer can show points associated with an authorization. At a statewide scale, some layers may not draw until the map is zoomed closer.</p></article>
          <article><span>Record</span><h3>Documents and related tables</h3><p>A candidate pop-up can link to the water-right document and related holder or owner and water-use records. More than one feature or related record may be present.</p></article>
          <article><span>Context</span><h3>Planning and environmental layers</h3><p>Other layers can supply basin, environmental-flow, watermaster, planning-area, or district context. They do not turn a candidate authorization into a property conclusion.</p></article>
        </div>
        <aside className="surface-source-note"><strong>Use the official viewer and instructions</strong><p>The TCEQ landing page states the product is informational, is not an on-the-ground survey, and may not be suitable for legal, engineering, or surveying purposes.</p><div><a href={viewerUrl} target="_blank" rel="noreferrer">Open the TCEQ Water Rights Viewer page <span aria-hidden="true">↗</span></a><a href={viewerGuideUrl} target="_blank" rel="noreferrer">Read the official viewer user guide <span aria-hidden="true">↗</span></a></div></aside>
      </section>

      <section className="surface-section" aria-labelledby="search-property">
        <div className="surface-section-heading"><p className="eyebrow">Orient the map</p><h2 id="search-property">How to search around a property</h2><p>An address or place search can move the map to a general area. Keep the property’s county, legal description, survey or abstract references, water features, and known authorization identifiers beside the viewer so the point is never mistaken for the property boundary.</p></div>
        <ol className="surface-steps">
          <li><strong>1. Record the property evidence first.</strong><span>Write down the address, county, legal description, survey or abstract, appraisal identifier, water features, and any known water-right number before opening the map.</span></li>
          <li><strong>2. Open the official viewer.</strong><span>Use the <a href={viewerUrl} target="_blank" rel="noreferrer">TCEQ Water Rights Viewer page</a>, note the search date, and read the current access-and-use constraints.</span></li>
          <li><strong>3. Search the place, then inspect the layers.</strong><span>Use the address or place only to orient the map. Confirm that the water-right layer is visible at the current scale and distinguish it from environmental-flow or administrative layers.</span></li>
          <li><strong>4. Review nearby points as candidates.</strong><span>Click a point, use the pop-up arrows when features overlap, and record every displayed authorization identifier before deciding which record deserves document review.</span></li>
          <li><strong>5. Preserve the search outcome.</strong><span>Record the viewer, layers, general area, date, candidate identifiers, and unresolved location questions. Do not publish or mirror the map or its underlying record data.</span></li>
        </ol>
      </section>

      <section className="surface-section" aria-labelledby="open-candidate">
        <div className="surface-section-heading"><p className="eyebrow">Move from point to record</p><h2 id="open-candidate">How to open a candidate authorization</h2><p>The point is a routing device. The authorization identifier, document, related records, and property evidence carry the comparison.</p></div>
        <div className="surface-candidate-flow" role="list" aria-label="Steps for opening a candidate surface-water authorization">
          <article role="listitem"><span>01</span><h3>Open the correct pop-up</h3><p>When multiple features occupy the same location, use the pop-up arrows until the water-right record of interest is shown.</p></article>
          <article role="listitem"><span>02</span><h3>Capture the identifier and type</h3><p>Record the water-right number or authorization identifier and the displayed type before following any document link.</p></article>
          <article role="listitem"><span>03</span><h3>Open the linked instrument</h3><p>Review the water-right document and adjudication determination when linked. Note amendments, dates, purposes, points, and places of use without interpreting legal effect.</p></article>
          <article role="listitem"><span>04</span><h3>Inspect related records</h3><p>Review all displayed holder or owner and water-use records, not only the preview. Keep each name and reporting year tied to its source.</p></article>
          <article role="listitem"><span>05</span><h3>Search by identifier when known</h3><p>The viewer user guide describes an identifier query that returns the water-right number, type, location, and document link. Use it to reproduce the candidate search.</p></article>
        </div>
      </section>

      <section className="surface-section" aria-labelledby="record-identifiers">
        <div className="surface-section-heading"><p className="eyebrow">Build a candidate record</p><h2 id="record-identifiers">Identifiers to record</h2><p>Transcribe each field from the source where it appears. Do not fill a blank from memory or merge a map label, data row, and legal document into one unsupported statement.</p></div>
        <div className="surface-identifier-grid">{identifierFields.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className="surface-warning"><strong>A recorded holder field is not a current title opinion.</strong><p>TCEQ may display holder or owner information associated with a water-right record. Preserve the label, name, source, and access date as shown. Current ownership and transfer still require the relevant deeds, assignments, reservations, probate or entity records, title materials, and professional review.</p></div>
        <p className="surface-data-note">For broader official record pathways, review <a href={waterRightsDataUrl} target="_blank" rel="noreferrer">TCEQ Water Rights and Water Use Data</a>. TCEQ describes those files as covering active and inactive surface-water rights and water-use information; the page states that non-watermaster water-use data is self-reported each year.</p>
      </section>

      <section className="surface-section surface-transfer-limit" aria-labelledby="mapped-point-transfer">
        <div className="surface-section-heading"><p className="eyebrow">Keep map and title questions separate</p><h2 id="mapped-point-transfer">Why a mapped point does not prove transfer with the property</h2><p>A diversion or impoundment point represents a mapped authorization location, not the complete legal relationship between an authorization and a parcel. The place of use may differ from the diversion point, property boundaries are approximate in the viewer, and the documents may contain terms that cannot be resolved from the map.</p></div>
        <div className="surface-transfer-grid"><div><h3>The viewer can support</h3><ul><li>Locating a candidate authorization</li><li>Preserving identifiers and displayed attributes</li><li>Opening linked water-right documents</li><li>Finding related holder and water-use records</li><li>Organizing a repeatable search date and pathway</li></ul></div><div><h3>The viewer cannot decide</h3><ul><li>Whether the right belongs to the researched property</li><li>Whether it was reserved, severed, assigned, or conveyed</li><li>Whether a recorded holder is the current title owner</li><li>Whether the right transfers in the transaction</li><li>The legal effect, validity, priority, or compliance status of a document</li></ul></div></div>
        <p className="surface-law-note">Use the official <a href={waterCodeUrl} target="_blank" rel="noreferrer">Texas Water Code, Chapter 11</a> as the statutory source already linked by Texas Water Sources. Do not convert statutory text into a property-specific conclusion without an attorney’s review of the facts and documents.</p>
      </section>

      <section className="surface-section" aria-labelledby="compare-candidate">
        <div className="surface-section-heading"><p className="eyebrow">Test the candidate</p><h2 id="compare-candidate">How to compare a candidate with property evidence</h2><p>A useful comparison looks for agreement, conflict, and missing evidence across several independent sources. One shared name, point, basin, purpose, or water feature is not enough.</p></div>
        <div className="surface-comparison-grid">{comparisonSources.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className="surface-warning"><strong>Use a status that preserves uncertainty.</strong><p>Record the outcome as a likely candidate, candidate only, conflicting evidence, no result, or unresolved. A likely candidate still is not a title, transfer, or legal conclusion.</p></div>
      </section>

      <section className="surface-section" aria-labelledby="no-result">
        <div className="surface-section-heading"><p className="eyebrow">Troubleshoot before stopping</p><h2 id="no-result">What to do when no result appears</h2><p>A blank search or map does not prove that no authorization, exemption, filing, historical record, or surface-water issue exists. Document the negative result and change one part of the search at a time.</p></div>
        <ol className="surface-no-result-list">
          <li><strong>Confirm layer visibility and scale.</strong><span>Check that the correct water-right layer is on and visible at the current zoom. Statewide views may not draw individual locations.</span></li>
          <li><strong>Recheck the location evidence.</strong><span>Try the place, county, basin, legal-description context, and nearby water feature without treating an address point as the parcel or diversion location.</span></li>
          <li><strong>Use a known identifier.</strong><span>If a deed, title file, seller document, or prior record supplies an authorization number, use the viewer’s identifier query and preserve the exact query.</span></li>
          <li><strong>Check active and inactive data pathways.</strong><span>Use the official TCEQ water-right and water-use page to identify other record pathways. Do not download or republish bulk data for this site.</span></li>
          <li><strong>Record the unresolved outcome.</strong><span>Save the sources, search date, layers, queries, documents checked, and next professional question rather than changing the result to “no right.”</span></li>
        </ol>
      </section>

      <section className="surface-section" aria-labelledby="professional-review">
        <div className="surface-section-heading"><p className="eyebrow">Prepare a focused handoff</p><h2 id="professional-review">What to send to an attorney or title professional</h2><p>Send a compact evidence packet that lets the professional reproduce the search and identify the unresolved legal question. Do not ask the map to answer the transaction.</p></div>
        <div className="surface-handoff-grid">
          <article><h3>Property packet</h3><ul><li>Complete legal description and county</li><li>Relevant deed history and reservations</li><li>Current title materials and supporting instruments</li><li>Survey and known water features</li><li>Seller-supplied documents and history</li></ul></article>
          <article><h3>Candidate packet</h3><ul><li>Viewer search date and pathway</li><li>Authorization identifier and displayed type</li><li>Recorded holder as displayed and dated</li><li>Linked documents and water-use records opened</li><li>Point, place-of-use, purpose, basin, and conflicts</li></ul></article>
          <article><h3>Questions to state</h3><ul><li>Does the candidate match the property evidence?</li><li>What instrument controls ownership or transfer?</li><li>Do reservations, assignments, amendments, or probate records matter?</li><li>What facts or documents are still missing?</li><li>What, if anything, requires agency follow-up?</li></ul></article>
        </div>
        <Link className="button primary surface-trec-link" href="/trec-61-guide">Carry the candidate into the TREC research guide</Link>
      </section>

      <SurfaceCandidateWorksheet />

      <ResearchLimitations content={surfaceWaterRightsEditorial} />
      <OfficialSources content={surfaceWaterRightsEditorial} />
      <RelatedResearch content={surfaceWaterRightsEditorial} />
      <p className="surface-method-note">This guide follows the <Link href="/methodology">Texas Water Sources research methodology</Link> and the <Link href="/disclaimer">independent-service disclaimer</Link>. Official records remain authoritative, and unresolved property, title, or document questions remain unresolved.</p>
    </div>
    <ArticleJsonLd content={surfaceWaterRightsEditorial} />
  </article></PageShell>;
}
