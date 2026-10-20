import {
  ArticleJsonLd,
  Breadcrumbs,
  EditorialMeta,
  OfficialSources,
  RelatedResearch,
  ResearchLimitations,
} from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { methodologyEditorial } from "@/lib/editorial-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: methodologyEditorial.title,
  description: methodologyEditorial.description,
  path: "/methodology",
});

export default function MethodologyPage() {
  return <PageShell><article className="prose-page editorial-page wrap">
    <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Methodology", path: "/methodology" }]} />
    <header><p className="eyebrow">Methodology</p><h1>Texas Water Sources research methodology</h1><p className="lead">The method keeps researchers close to official Texas records while preserving the limits of those records, the uncertainty of possible matches, and the decisions that still require authoritative or professional review.</p><p className="editorial-question"><strong>Primary question</strong>{methodologyEditorial.primary_question}</p></header>
    <EditorialMeta content={methodologyEditorial} />

    <h2>1. Separate the research subjects</h2>
    <p>Water source, well construction, groundwater-district coverage, surface-water authorization, title, ownership, and disclosure are related subjects, but they are not interchangeable conclusions. The method keeps each subject attached to the source capable of addressing it.</p>

    <h2>2. Prefer primary official sources</h2>
    <p>Guides route users to official agency, legislative, and district sources. The source name, direct link, attribution, and review date belong in the research trail. The public catalog remains deliberately bounded and is not represented as comprehensive statewide local coverage.</p>

    <h2>3. Treat matches as hypotheses</h2>
    <p>A nearby well, map point, district layer, recorded name, permit, or water-right record is a candidate. Testing a candidate requires comparing multiple identifiers and source documents with a legal description, survey, title material, seller information, or other reliable property evidence. Proximity alone does not establish association or ownership.</p>

    <h2>4. Preserve unresolved outcomes</h2>
    <p>“Not found,” “not searched,” “candidate match,” “near a boundary,” and “conflicting records” are useful outcomes. They are not silently converted to “No,” and the guided assistant does not select a Form 61-0 answer.</p>

    <h2>5. Preserve the source trail</h2>
    <p>Substantive guidance identifies the relevant official sources, retains direct links and review dates, and keeps source limitations visible. A summary does not replace the underlying agency or district record.</p>

    <h2>6. Use substantive update dates honestly</h2>
    <p>The displayed update date changes after a meaningful source, factual statement, limitation, or research-instruction change. Cosmetic edits do not reset it. When an official page changes, the current source is reopened and the source trail records the new access or review date.</p>

    <h2>7. Escalate the remaining decision</h2>
    <p>Material ambiguity moves to the official authority or the Texas professional appropriate to the issue. The current release does not determine ownership, issue a title opinion, decide compliance, or choose a disclosure response.</p>

    <OfficialSources content={methodologyEditorial} />
    <ResearchLimitations content={methodologyEditorial} />
    <RelatedResearch content={methodologyEditorial} />
    <ArticleJsonLd content={methodologyEditorial} />
  </article></PageShell>;
}
