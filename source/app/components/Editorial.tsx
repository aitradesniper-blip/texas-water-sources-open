import Link from "next/link";
import { StructuredData } from "@/app/components/StructuredData";
import type { EditorialContent, EditorialOfficialSource } from "@/lib/editorial-content";
import { getPublicSource } from "@/lib/source-catalog";
import { absoluteUrl, createBreadcrumbList, SITE_NAME } from "@/lib/seo";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function SourceReviewDate({ sources }: { sources: EditorialOfficialSource[] }) {
  if (!sources.length) {
    return <span>No external source-review date applies; this page documents site policy.</span>;
  }
  const latest = [...sources].map((source) => source.reviewed_on).sort().at(-1)!;
  return <span>Official sources checked through <time dateTime={latest}>{formatDate(latest)}</time>.</span>;
}

export function EditorialMeta({ content }: { content: EditorialContent }) {
  return <section className="editorial-meta" aria-labelledby="editorial-meta-heading">
    <div className="editorial-meta-heading"><p className="eyebrow">Editorial record</p><h2 id="editorial-meta-heading">Publisher and source record</h2></div>
    <dl>
      <div><dt>Published by</dt><dd><Link href={content.author.path}>{content.author.name}</Link><span>{content.author.description}</span></dd></div>
      {content.reviewed_by ? <div><dt>Reviewed by</dt><dd>{content.reviewed_by}</dd></div> : null}
      {content.date_published ? <div><dt>First published</dt><dd><time dateTime={content.date_published}>{formatDate(content.date_published)}</time></dd></div> : null}
      <div><dt>Last substantively updated</dt><dd><time dateTime={content.date_modified}>{formatDate(content.date_modified)}</time></dd></div>
      <div><dt>Official sources checked</dt><dd><SourceReviewDate sources={content.official_sources} /></dd></div>
      <div><dt>Corrections and source changes</dt><dd><Link href="/about/corrections">Read the correction policy</Link></dd></div>
    </dl>
  </section>;
}

export function OfficialSources({ content }: { content: EditorialContent }) {
  return <section className="editorial-section official-sources" aria-labelledby="official-sources-heading">
    <p className="eyebrow">Source record</p><h2 id="official-sources-heading">Official sources checked</h2>
    {content.official_sources.length ? <div className="editorial-card-grid">{content.official_sources.map((source) => <article key={`${source.title}-${source.url}`}>
      <p>{source.agency}</p><h3><a href={source.url} target="_blank" rel="noreferrer">{source.title} <span aria-hidden="true">↗</span></a></h3>
      <span>{source.attribution}</span><small>Reviewed <time dateTime={source.reviewed_on}>{formatDate(source.reviewed_on)}</time></small>
    </article>)}</div> : <div className="editorial-empty-note"><strong>No external factual source claim is made on this policy page.</strong><p>This page documents Texas Water Sources editorial practice. Its substantive review date remains visible above.</p></div>}
  </section>;
}

export function RelatedResearch({ content }: { content: Pick<EditorialContent, "related_source_ids" | "related_guides"> }) {
  const sources = content.related_source_ids.map((sourceId) => getPublicSource(sourceId)).filter((source) => source !== undefined);
  return <section className="editorial-section related-research" aria-labelledby="related-research-heading">
    <p className="eyebrow">Continue the research</p><h2 id="related-research-heading">Related research</h2>
    <div className="related-research-grid">
      {content.related_guides.map((guide) => <Link href={guide.path} key={guide.path}><strong>{guide.title}</strong><span>{guide.description}</span><small>Read this guide →</small></Link>)}
      {sources.map((source) => <Link href={`/sources/${source.source_id}`} key={source.source_id}><strong>{source.title}</strong><span>{source.short_description}</span><small>Review the source record →</small></Link>)}
    </div>
  </section>;
}

export function ResearchLimitations({ content }: { content: EditorialContent }) {
  return <section className="editorial-section research-limitations" aria-labelledby="research-limitations-heading">
    <p className="eyebrow">Research boundary</p><h2 id="research-limitations-heading">What this page cannot establish</h2>
    <ul>{content.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
  </section>;
}

export function Breadcrumbs({ items, prefetch = true }: { items: Array<{ name: string; path: string }>; prefetch?: boolean }) {
  const jsonLd = { "@context": "https://schema.org", ...createBreadcrumbList(items) };
  return <>
    <nav className="breadcrumb editorial-breadcrumb" aria-label="Breadcrumb">{items.map((item, index) => <span key={item.path}>
      {index < items.length - 1 ? <Link prefetch={prefetch} href={item.path}>{item.name}</Link> : <span aria-current="page">{item.name}</span>}
      {index < items.length - 1 ? <i aria-hidden="true">/</i> : null}
    </span>)}</nav>
    <StructuredData data={jsonLd} />
  </>;
}

export function ArticleJsonLd({ content }: { content: EditorialContent }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.description,
    url: content.canonical,
    mainEntityOfPage: content.canonical,
    author: { "@type": "Organization", name: content.author.name, url: absoluteUrl(content.author.path) },
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    dateModified: content.date_modified,
    ...(content.date_published ? { datePublished: content.date_published } : {}),
  };
  return <StructuredData data={jsonLd} />;
}
