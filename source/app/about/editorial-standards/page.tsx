import {
  ArticleJsonLd,
  Breadcrumbs,
  EditorialMeta,
  OfficialSources,
  RelatedResearch,
  ResearchLimitations,
} from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { editorialStandardsEditorial } from "@/lib/editorial-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: editorialStandardsEditorial.title,
  description: editorialStandardsEditorial.description,
  path: "/about/editorial-standards",
});

export default function EditorialStandardsPage() {
  return <PageShell><article className="prose-page editorial-page wrap">
    <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }, { name: "Editorial Standards", path: "/about/editorial-standards" }]} />
    <header><p className="eyebrow">Editorial standards</p><h1>Texas Water Sources editorial standards</h1><p className="lead">These standards govern substantive public guides and policy pages. They are designed to make publisher identity, sourcing, uncertainty, update dates, limitations, and corrections visible instead of implied.</p><p className="editorial-question"><strong>Primary question</strong>{editorialStandardsEditorial.primary_question}</p></header>
    <EditorialMeta content={editorialStandardsEditorial} />

    <h2>Primary official sources come first</h2>
    <p>Texas Water Sources prefers current primary pages from Texas agencies, the Texas Legislature, groundwater conservation districts, and other official authorities suited to the question. Secondary summaries may help orientation, but they do not replace the official source used for a public factual claim.</p>

    <h2>Source access dates stay with the research</h2>
    <p>Source names, direct HTTPS links, attribution, and review dates are retained. A review date records when the source and the page’s use of it were substantively checked. It does not imply that an external database or policy cannot change later.</p>

    <h2>Candidate records are not confirmed property facts</h2>
    <p>A map point, well report, district layer, permit, recorded name, or nearby record is described as a candidate until reliable identifiers and documents support a match. The site does not present proximity or a shared name as proof of ownership, property association, appurtenance, or transfer.</p>

    <h2>The site does not make legal conclusions</h2>
    <p>The site does not select disclosure answers or determine title, ownership, severance, reservation, transferability, permitting, compliance, or legal effect. Unresolved matters stay visible for the official authority or appropriate Texas professional.</p>

    <h2>Published claims remain source-bound</h2>
    <p>Substantive factual statements must be supportable by the cited official sources. Missing evidence is not filled with assumptions, and a nearby or similarly named record is not presented as a confirmed property fact.</p>

    <h2>Attribution and limitations remain visible</h2>
    <p>Substantive guidance identifies the responsible official source, preserves a direct source link and access date, and states the limits of what the source can establish. Facts, dates, credentials, reviewers, contact channels, and source coverage are not invented.</p>

    <h2>Material updates change the review date</h2>
    <p>A material update includes a new or changed official source, a corrected factual statement, a changed limitation, or a substantive research-guidance revision. These changes update the last-substantively-updated date.</p>

    <h2>Cosmetic edits do not create false freshness</h2>
    <p>Spelling, punctuation, formatting, and minor layout changes do not reset the substantive review date when the underlying research has not been reviewed again.</p>

    <h2>Corrections are evaluated and documented</h2>
    <p>Potential factual errors and broken or changed official sources are checked against the current authority. Material corrections are documented in the affected page’s review record or revision note. The correction policy also states when no verified public submission channel exists.</p>

    <OfficialSources content={editorialStandardsEditorial} />
    <ResearchLimitations content={editorialStandardsEditorial} />
    <RelatedResearch content={editorialStandardsEditorial} />
    <ArticleJsonLd content={editorialStandardsEditorial} />
  </article></PageShell>;
}
