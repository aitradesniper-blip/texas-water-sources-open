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
import { trec61Editorial, trec61MetaDescription } from "@/lib/editorial-content";
import { createPageMetadata } from "@/lib/seo";
import { PrintChecklistButton } from "./print-checklist-button";
import { ResearchAssistant } from "./research-assistant";

const trec61BaseMetadata = createPageMetadata({
  title: trec61Editorial.title,
  description: trec61Editorial.description,
  path: "/trec-61-guide",
});

export const metadata = {
  ...trec61BaseMetadata,
  description: trec61MetaDescription,
};

const formPageUrl = "https://www.trec.texas.gov/forms/water-notice-sellers-disclosure-about-groundwater-and-surface-water-rights";
const formPdfUrl = "https://www.trec.texas.gov/sites/default/files/pdf-forms/61-0.pdf";
const waterRightsViewerUrl = "https://www.tceq.texas.gov/gis/water-rights-viewer";

const researchOutcomes = [
  ["Likely record match", "Several meaningful identifiers agree with the property evidence. Keep the record and the comparison notes, while avoiding a claim the source itself cannot establish."],
  ["Candidate record", "A report, permit, name, or map result may be relevant, but the available identifiers do not yet support a reliable property association."],
  ["No public record found", "The searched public system returned no useful result. Record where, how, and when you searched; do not silently convert the result into a seller answer."],
  ["Conflicting records", "Two sources disagree about a location, identifier, date, status, or responsible entity. Preserve both records and identify the conflict for follow-up."],
  ["District-boundary uncertainty", "The location appears near a boundary or the address point does not resolve coverage. Compare better property evidence and verify with the relevant district or agency."],
  ["Document found but interpretation unresolved", "A deed, reservation, lease, agreement, permit, or certificate was located, but its effect on the property remains a professional-review question."],
] as const;

const checklistItems = [
  ["Property identifiers", "Address, county, legal description, appraisal identifier, and any tract or survey references."],
  ["Seller-known information", "Known water sources, wells, shared arrangements, off-property supply, surface features, and remembered agreements."],
  ["Sources searched", "Official TREC, TWDB, TCEQ, district, and other relevant public sources, with access dates."],
  ["Records saved", "Form copy, well reports, district results, authorization records, deeds, agreements, leases, reservations, and title materials."],
  ["Open questions", "Missing records, candidate matches, conflicting identifiers, boundary uncertainty, and facts the seller does not know."],
  ["Professional-review flags", "Title language, ownership, severance, reservation, transfer, compliance, or document interpretation that remains unresolved."],
] as const;

export default function Guide() {
  return <PageShell><article className="trec-hub-page">
    <section className="assistant-intro trec-intro"><div className="wrap">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "TREC Form 61-0 Research Guide", path: "/trec-61-guide" }]} />
      <p className="eyebrow">Independent Texas water-rights disclosure research</p>
      <h1>TREC Form 61-0 Research Guide</h1>
      <p className="trec-lede">Organize seller-known information, official water-record searches, saved documents, and unresolved questions before completing the current TREC form. This guide does not choose an answer for the seller.</p>

      <nav className="trec-form-actions" aria-label="Official Form 61-0 and research guide actions">
        <div className="trec-form-action-links">
          <a className="button primary trec-form-download" href={formPdfUrl} target="_blank" rel="noreferrer">
            <span>Download official TREC Form 61-0 PDF</span>
            <small>Official TREC website · Opens a new tab ↗</small>
          </a>
          <a className="button quiet trec-form-page-link" href={formPageUrl} target="_blank" rel="noreferrer">
            <span>Open the official TREC form page</span>
            <small>Texas Real Estate Commission · Opens a new tab ↗</small>
          </a>
          <a className="trec-guide-start" href="#what-you-need">Start the independent research guide <span aria-hidden="true">↓</span></a>
        </div>
        <p>Official Texas Real Estate Commission form · TREC No. 61-0 · Effective July 1, 2026</p>
      </nav>

      <div className="trec-form-overview">
        <div><span>Official form name</span><strong>Seller&apos;s Disclosure about Groundwater and Surface Water Rights</strong></div>
        <div><span>Form and effective date</span><strong>TREC No. 61-0 · July 1, 2026</strong></div>
        <div><span>Official TREC copy</span><strong><a href={formPageUrl} target="_blank" rel="noreferrer">Open the form page ↗</a><a href={formPdfUrl} target="_blank" rel="noreferrer">Download official TREC Form 61-0 ↗</a></strong></div>
      </div>

      <section className="trec-top-section" aria-labelledby="what-form-is">
        <h2 id="what-form-is">What TREC Form 61-0 is</h2>
        <p>TREC describes Form 61-0 as a seller disclosure intended to provide prospective buyers with information about groundwater and surface-water rights associated with a property. The form asks about seller knowledge across groundwater districts, wells, shared or off-property supply, groundwater-right arrangements, surface-water rights, and ponds, lakes, or tanks.</p>
      </section>

      <div className="trec-purpose-grid">
        <section><h2>What this independent guide does</h2><ul><li>Organizes seller observations without converting them into conclusions.</li><li>Routes research to named official sources.</li><li>Keeps source links, access dates, and saved records together.</li><li>Preserves open questions for the appropriate next step.</li></ul></section>
        <section><h2>What this guide does not do</h2><ul><li>It does not fill out or answer Form 61-0 for a seller.</li><li>It does not determine ownership, title, severance, reservation, or transfer.</li><li>It does not treat a nearby record or map point as a property fact.</li><li>It does not replace the <Link href="/disclaimer">independent-service disclaimer</Link> or transaction-specific professional advice.</li></ul></section>
      </div>

      <section className="trec-prep" aria-labelledby="what-you-need">
        <div className="trec-section-heading"><p className="eyebrow">Start with what is known</p><h2 id="what-you-need">What you need before you begin</h2><p>Gather what is available; a missing item can remain an open question.</p></div>
        <div className="trec-prep-grid">
          <div><span>01</span><h3>Property identifiers</h3><p>Street address, county, legal description, appraisal identifier, survey, lot, block, or tract reference.</p></div>
          <div><span>02</span><h3>Known water source</h3><p>Seller-known information about private wells, shared wells, off-property supply, public supply, or more than one source.</p></div>
          <div><span>03</span><h3>Existing well records</h3><p>Reports, tracking numbers, district registrations or permits, driller information, maintenance records, and plugging records.</p></div>
          <div><span>04</span><h3>Property documents</h3><p>Deeds, agreements, leases, reservations, conveyances, easements, and relevant title materials.</p></div>
          <div><span>05</span><h3>Surface-water identifiers</h3><p>Permit, certified filing, certificate of adjudication, authorization, or other known TCEQ numbers.</p></div>
        </div>
      </section>

      <section className="trec-applicability-callout" aria-labelledby="before-you-begin-applicability">
        <div><p className="eyebrow">Applicability comes first</p><h2 id="before-you-begin-applicability">Before you begin: determine whether the transaction uses Form 61-0</h2></div>
        <div><p>Start with the actual transaction contract. TREC&apos;s mandatory-use classification for license holders is a different question from the contract&apos;s delivery choices and its complete five-condition exemption. The contract, party roles, selected option, and seller-known facts must be reviewed without forcing a yes-or-no legal conclusion.</p><Link className="button primary" href="/trec-61-guide/who-must-complete-form-61-0">Read the Form 61-0 applicability guide</Link></div>
      </section>

      <div className="notice"><strong>Independent research tool</strong><span>Use the current official form and instructions for the transaction. This site is not affiliated with or endorsed by TREC, TWDB, TCEQ, or any groundwater conservation district.</span></div>
    </div></section>

    <section className="trec-property-report-callout wrap" aria-labelledby="trec-property-report-heading">
      <div><p className="eyebrow">Start with the property</p><h2 id="trec-property-report-heading">Run the free property-water report first.</h2></div>
      <div><p>Enter the property address to organize available groundwater-district, well-report, groundwater-database, and surface-water record leads before working through the Form 61-0 research guide.</p><Link className="button primary" href="/property-water-report">Run the free property-water report</Link></div>
    </section>

    <div id="research-assistant"><ResearchAssistant /></div>

    <div className="trec-editorial wrap">
      <EditorialMeta content={trec61Editorial} />

      <section className="trec-content-section" id="research-map">
        <div className="trec-section-heading"><p className="eyebrow">Question-by-question routing</p><h2>Research map for each major subject</h2><p>Keep each subject tied to the source or document that can address it. One source rarely answers every water question.</p></div>
        <div className="trec-research-map">
          <article><span>01</span><h3>Groundwater district</h3><p>Start with the <Link href="/groundwater-districts">groundwater-district guide</Link> and the approved <Link href="/sources/tceq_groundwater_conservation_district_boundaries">TCEQ boundary-source record</Link>. Near a boundary, compare better property evidence and verify the result.</p></article>
          <article><span>02</span><h3>Wells</h3><p>Use the <Link href="/well-records">Texas well-record guide</Link> or <Link href="/well-records/find-by-address">search Texas well reports by address</Link>, then compare identifiers in the <Link href="/sources/twdb_submitted_drillers_reports">Submitted Drillers Reports pathway</Link>, the <Link href="/sources/twdb_groundwater_database">Groundwater Database</Link>, and any <Link href="/sources/twdb_plugging_reports">plugging report</Link>.</p></article>
          <article><span>03</span><h3>Shared and off-property wells</h3><p>Record who owns or operates the well, who benefits, which tract contains it, and any agreement or understanding. A well report alone does not establish the current arrangement.</p></article>
          <article><span>04</span><h3>Groundwater rights sold, leased, reserved, or severed</h3><p>Gather deeds, leases, reservations, conveyances, and title materials. Preserve the exact language and route unresolved effect or ownership questions to the appropriate Texas professional.</p></article>
          <article><span>05</span><h3>Surface-water rights</h3><p>Follow the <Link href="/surface-water-rights">surface-water-rights research guide</Link> or <Link href="/surface-water-rights/water-rights-viewer">open the TCEQ Water Rights Viewer companion</Link>, then save the authorization number and linked documents. A mapped point or recorded holder is a research lead, not proof that a right belongs to or transfers with the property.</p><a href={waterRightsViewerUrl} target="_blank" rel="noreferrer">Open the official TCEQ viewer page ↗</a></article>
          <article><span>06</span><h3>Ponds, lakes, and tanks</h3><p>Record what the seller knows about the feature, location, use, and related documents. The physical presence of water does not by itself establish a surface-water authorization or ownership conclusion.</p></article>
        </div>
      </section>

      <section className="trec-content-section trec-unknown" id="not-sure">
        <div><p className="eyebrow">A valid research state</p><h2>What “I&apos;m not sure” means</h2></div>
        <div><p>“I&apos;m not sure” means the available seller knowledge or research does not yet support a confident statement. It should remain visible instead of being silently changed to “No.”</p><ul><li><strong>Source question:</strong> identify the official agency, district, or record system to check next.</li><li><strong>Document question:</strong> identify the deed, report, agreement, lease, reservation, permit, or title material that may be needed.</li><li><strong>Seller-knowledge question:</strong> preserve what the seller knows and does not know without substituting a database result.</li><li><strong>Interpretation question:</strong> flag the issue for the title, legal, surveying, engineering, well, or regulatory professional appropriate to it.</li></ul></div>
      </section>

      <section className="trec-content-section" id="research-outcomes">
        <div className="trec-section-heading"><p className="eyebrow">Use precise status language</p><h2>Common public-record research outcomes</h2><p>Status labels should describe the evidence actually found, not imply a final property or disclosure conclusion.</p></div>
        <div className="trec-outcome-grid">{researchOutcomes.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="trec-content-section final-review" id="final-review">
        <div className="trec-section-heading"><p className="eyebrow">Before signing or sharing</p><h2>Final review checklist</h2></div>
        <ol>
          <li><strong>Seller answers remain seller answers.</strong><span>The assistant and public records did not choose a response on the seller&apos;s behalf.</span></li>
          <li><strong>Official sources and records are saved.</strong><span>Keep direct links, report or authorization numbers, downloads, and useful search details.</span></li>
          <li><strong>Access dates are recorded.</strong><span>Note when each source was checked because public systems and external records can change.</span></li>
          <li><strong>Unresolved matters remain visible.</strong><span>A candidate, conflict, unknown, or no-result search was not silently converted to “No.”</span></li>
          <li><strong>Professional-review flags are identified.</strong><span>Separate title, ownership, severance, transfer, compliance, boundary, or document-interpretation questions for follow-up.</span></li>
        </ol>
      </section>

      <section className="print-checklist-section" id="before-you-complete-form-61-0" aria-labelledby="print-checklist-heading">
        <div className="print-checklist-header"><div><p className="eyebrow">Printable research checklist</p><h2 id="print-checklist-heading">Before You Complete Form 61-0</h2><p>Use this page to collect the research trail. It is not the TREC form and does not supply disclosure answers.</p></div><PrintChecklistButton /></div>
        <div className="print-property-lines"><span>Property:</span><i /><span>County:</span><i /><span>Date checked:</span><i /></div>
        <ul>{checklistItems.map(([title, description]) => <li key={title}><span className="check-box" aria-hidden="true" /><div><strong>{title}</strong><p>{description}</p><div className="write-lines" aria-hidden="true"><i /><i /></div></div></li>)}</ul>
        <div className="print-checklist-note"><strong>Keep unresolved items unresolved.</strong><p>A missing or conflicting public record does not establish a “No” answer, ownership, or property association.</p></div>
      </section>

      <section className="trec-content-section" id="frequently-asked-questions">
        <div className="trec-section-heading"><p className="eyebrow">Frequently asked questions</p><h2>Frequently asked questions</h2></div>
        <div className="trec-faq-list">
          <details open><summary>Is Form 61-0 the same as the ordinary seller disclosure?</summary><p>TREC lists Form 61-0 separately as the Seller&apos;s Disclosure about Groundwater and Surface Water Rights. Use the current transaction documents and official TREC materials to determine which forms apply.</p></details>
          <details><summary>How do I fill out TREC 61-0?</summary><p>Begin with the seller&apos;s knowledge, gather property and water identifiers, search the relevant official sources, save useful records, and preserve unknown or interpretive questions. This guide organizes that research but does not provide the seller&apos;s answers.</p></details>
          <details><summary>Can a real estate license holder select the answers?</summary><p>This guide does not authorize the site or another person to choose a seller&apos;s responses. Questions about participant roles or transaction-specific obligations should go to the responsible broker or a Texas attorney.</p></details>
          <details><summary>Does a well report prove the well still operates?</summary><p>No. A report may describe historical construction or location information, but it does not by itself establish current existence, operation, ownership, water quality, yield, or compliance.</p></details>
          <details><summary>Does a nearby water right belong to the property?</summary><p>A nearby authorization point, recorded holder, or place-of-use record is not proof of ownership or property association. Compare the authorization documents with reliable property, deed, title, and survey evidence.</p></details>
          <details><summary>What happens when no public record is found?</summary><p>Record the source, search terms, date, and no-result outcome. Try other appropriate official pathways and preserve the question rather than treating the search result as a disclosure answer.</p></details>
          <details><summary>Can the research be saved and printed?</summary><p>Yes. The guided assistant stores progress in the current browser, prepares a printable research summary, and tracks unresolved questions. The separate checklist above can also be printed before starting or after gathering records.</p></details>
        </div>
      </section>

      <OfficialSources content={trec61Editorial} />
      <ResearchLimitations content={trec61Editorial} />
      <RelatedResearch content={trec61Editorial} />
      <p className="trec-method-note">For the site-wide evidence standard, see the <Link href="/methodology">Texas Water Sources research methodology</Link>. For service and professional boundaries, read the <Link href="/disclaimer">independent-service disclaimer</Link>.</p>
    </div>

    <ArticleJsonLd content={trec61Editorial} />
  </article></PageShell>;
}
