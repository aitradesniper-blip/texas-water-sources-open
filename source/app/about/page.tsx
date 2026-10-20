import {
  Breadcrumbs,
  EditorialMeta,
  OfficialSources,
  RelatedResearch,
  ResearchLimitations,
} from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { aboutEditorial } from "@/lib/editorial-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: aboutEditorial.title,
  description: aboutEditorial.description,
  path: "/about",
});

export default function AboutPage() {
  return <PageShell><article className="prose-page editorial-page wrap">
    <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
    <header><p className="eyebrow">About Texas Water Sources</p><h1>About Texas Water Sources</h1><p className="lead">Texas Water Sources is an independent research service for people working through property water questions. It organizes official-source pathways and unresolved evidence without turning a record or map result into a property conclusion.</p><p className="editorial-question"><strong>Primary question</strong>{aboutEditorial.primary_question}</p></header>
    <EditorialMeta content={aboutEditorial} />

    <h2>Independent purpose</h2>
    <p>Texas Water Sources publishes independent guidance for people researching Texas property-water records. The publisher identity does not claim a professional license, government role, or transaction-specific authority.</p>

    <h2>Official-source research</h2>
    <p>The project starts with primary official sources and the bounded approved source catalog. Source attribution and the date of the latest substantive source check remain visible. An access or review date records when a source was checked; it does not guarantee that an external system will remain unchanged.</p>

    <h2>Source-linked research</h2>
    <p>Texas Water Sources identifies the official sources used for substantive research guidance, preserves direct source links and review dates, and states what each source cannot establish.</p>

    <h2>Why possible matches remain unresolved</h2>
    <p>A well report, district polygon, permit, recorded name, or nearby result can be a useful research lead. It remains a candidate until identifiers and source documents are compared with reliable property evidence. Where the public record cannot resolve the question, the gap stays visible for the relevant agency, district, title professional, surveyor, engineer, attorney, or other appropriate Texas professional.</p>

    <h2>Meaningful update dates</h2>
    <p>The last-substantively-updated date changes when a source, factual statement, limitation, or research instruction materially changes. Spelling, spacing, and other cosmetic edits do not reset the date merely to create an appearance of freshness.</p>

    <h2>Professional boundaries</h2>
    <p>The site provides source navigation and educational research guidance, not legal, title, engineering, surveying, brokerage, or regulatory conclusions. Material ambiguity remains visible for the official authority or appropriate Texas professional.</p>

    <OfficialSources content={aboutEditorial} />
    <ResearchLimitations content={aboutEditorial} />
    <RelatedResearch content={aboutEditorial} />
  </article></PageShell>;
}
