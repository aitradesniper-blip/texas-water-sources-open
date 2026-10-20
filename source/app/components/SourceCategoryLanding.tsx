import Link from "next/link";
import { PageShell } from "@/app/components/SiteChrome";
import { Breadcrumbs, EditorialMeta, OfficialSources, RelatedResearch, ResearchLimitations } from "@/app/components/Editorial";
import { StructuredData } from "@/app/components/StructuredData";
import { getPublicSource } from "@/lib/source-catalog";
import {
  createSourceCategoryEditorial,
  getPublishedSourceCategory,
  type SourceCategorySlug,
} from "@/lib/source-editorial";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function createSourceCategoryMetadata(slug: SourceCategorySlug) {
  const category = getPublishedSourceCategory(slug);
  if (!category) throw new Error(`Source category is not published: ${slug}`);
  return createPageMetadata({ title: category.title, description: category.description, path: `/sources/${category.slug}` });
}

export function SourceCategoryLanding({ slug }: { slug: SourceCategorySlug }) {
  const category = getPublishedSourceCategory(slug);
  if (!category) throw new Error(`Source category is not published: ${slug}`);
  const content = createSourceCategoryEditorial(category);
  const sources = category.source_ids.map((sourceId) => {
    const source = getPublicSource(sourceId);
    if (!source) throw new Error(`Missing source for category page: ${sourceId}`);
    return source;
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description,
    url: content.canonical,
    datePublished: content.date_published,
    dateModified: content.date_modified,
    author: { "@type": "Organization", name: content.author.name, url: absoluteUrl(content.author.path) },
    isPartOf: { "@type": "WebSite", name: "Texas Water Sources", url: absoluteUrl("/") },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: sources.length,
      itemListElement: sources.map((source, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: source.title,
        url: absoluteUrl(`/sources/${source.source_id}`),
      })),
    },
  };

  return <PageShell>
    <article className="source-category-page">
      <section className="source-category-hero"><div className="wrap">
        <Breadcrumbs items={[
          { name: "Home", path: "/" },
          { name: "Official sources", path: "/sources" },
          { name: category.title, path: `/sources/${category.slug}` },
        ]} />
        <p className="eyebrow">{category.eyebrow}</p>
        <h1>{category.title}</h1>
        <p>{category.introduction}</p>
        <div className="source-category-review"><strong>{sources.length} approved source{sources.length === 1 ? "" : "s"}</strong><span>Last substantively reviewed <time dateTime={content.date_modified}>{formatDate(content.date_modified)}</time></span></div>
      </div></section>

      <div className="source-category-content wrap">
        <p className="editorial-question"><strong>Primary research question</strong>{category.primary_question}</p>
        <EditorialMeta content={content} />

        <section className="source-category-section" aria-labelledby="category-sources-heading">
          <div className="source-category-heading"><p className="eyebrow">Current approved catalog</p><h2 id="category-sources-heading">Sources in this family</h2><p>These records are selected from the existing eight-source catalog. Category membership does not expand the catalog or imply complete statewide coverage.</p></div>
          <div className="source-category-source-grid">{sources.map((source, index) => <article key={source.source_id}>
            <span>{String(index + 1).padStart(2, "0")} · {source.source_category}</span>
            <h3><Link href={`/sources/${source.source_id}`}>{source.title}</Link></h3>
            <p>{source.short_description}</p>
            <dl><div><dt>May help answer</dt><dd>{source.what_it_can_help_find[0]}</dd></div><div><dt>Cannot establish</dt><dd>{source.what_it_cannot_confirm[0]}</dd></div></dl>
            <small>Source verified <time dateTime={source.last_verified_date}>{formatDate(source.last_verified_date)}</time></small>
          </article>)}</div>
        </section>

        <section className="source-category-section source-category-question-grid" aria-labelledby="category-questions-heading">
          <div><p className="eyebrow">Useful research questions</p><h2 id="category-questions-heading">What this source family may help answer</h2><ul>{category.helpful_questions.map((question) => <li key={question}>{question}</li>)}</ul></div>
          <div><p className="eyebrow">Keep the boundary visible</p><h2>What it cannot answer</h2><ul>{category.cannot_answer.map((answer) => <li key={answer}>{answer}</li>)}</ul></div>
        </section>

        <section className="source-category-section" aria-labelledby="category-order-heading">
          <div className="source-category-heading"><p className="eyebrow">Recommended sequence</p><h2 id="category-order-heading">Use the sources in a deliberate order</h2><p>Record the source, identifiers, dates, saved records, and unresolved questions at each step.</p></div>
          <ol className="source-category-order">{category.recommended_order.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
        </section>

        <section className="source-category-section source-category-failures" aria-labelledby="category-failures-heading">
          <p className="eyebrow">Troubleshooting</p><h2 id="category-failures-heading">Common search failures</h2>
          <ul>{category.common_search_failures.map((failure) => <li key={failure}>{failure}</li>)}</ul>
        </section>

        <OfficialSources content={content} />
        <ResearchLimitations content={content} />
        <RelatedResearch content={content} />
      </div>
    </article>
    <StructuredData data={jsonLd} />
  </PageShell>;
}
