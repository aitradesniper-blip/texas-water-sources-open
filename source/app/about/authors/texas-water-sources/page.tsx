import {
  Breadcrumbs,
  EditorialMeta,
  OfficialSources,
  RelatedResearch,
  ResearchLimitations,
} from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { authorEditorial } from "@/lib/editorial-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: authorEditorial.title,
  description: authorEditorial.description,
  path: "/about/authors/texas-water-sources",
});

export default function TexasWaterSourcesAuthorPage() {
  return <PageShell><article className="prose-page editorial-page wrap">
    <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }, { name: "Texas Water Sources", path: "/about/authors/texas-water-sources" }]} />
    <header><p className="eyebrow">Publisher</p><h1>Texas Water Sources</h1><p className="lead">Texas Water Sources publishes independent, source-linked guidance for researching Texas property-water records.</p><p className="editorial-question"><strong>Primary question</strong>{authorEditorial.primary_question}</p></header>
    <EditorialMeta content={authorEditorial} />

    <h2>What Texas Water Sources publishes</h2>
    <p>The site publishes independent Texas water-record research guidance. It identifies and links primary official sources, displays source-review dates and limitations, and keeps unresolved findings visible for later verification.</p>

    <h2>Source and record boundaries</h2>
    <p>Primary official sources and the bounded approved public source catalog provide the source pathways. Direct links, source-review dates, and limitations remain visible, and candidate records are not presented as confirmed property facts.</p>

    <h2>What the publisher identity does not claim</h2>
    <p>The publisher identity does not claim a professional license, government role, or official authority. It does not authorize Texas Water Sources to issue a title opinion, select a disclosure answer, certify a property match, or provide transaction-specific professional advice.</p>

    <h2>Why uncertainty remains visible</h2>
    <p>A candidate well, district, permit, recorded name, or map location is retained as a candidate until reliable evidence supports the association. When the available public record cannot resolve the question, the authorial responsibility is to preserve the gap—not fill it with an assumption.</p>

    <OfficialSources content={authorEditorial} />
    <ResearchLimitations content={authorEditorial} />
    <RelatedResearch content={authorEditorial} />
  </article></PageShell>;
}
