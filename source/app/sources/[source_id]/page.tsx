import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/app/components/SiteChrome";
import { SourceDetailEditorial } from "@/app/components/SourceDetailEditorial";
import { StructuredData } from "@/app/components/StructuredData";
import { getPublicSource, publicSources, SITE_DISCLAIMER } from "@/lib/source-catalog";
import { getSourceEditorialEnhancement } from "@/lib/source-editorial";
import { absoluteUrl, createBreadcrumbList, createPageMetadata } from "@/lib/seo";

const sourceDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return sourceDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function generateStaticParams() {
  return publicSources.map((source) => ({ source_id: source.source_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ source_id: string }> }): Promise<Metadata> {
  const source = getPublicSource((await params).source_id);
  if (!source) return {};
  return createPageMetadata({
    title: source.title,
    description: source.short_description,
    path: `/sources/${source.source_id}`,
  });
}

export default async function SourceDetailPage({ params }: { params: Promise<{ source_id: string }> }) {
  const source = getPublicSource((await params).source_id);
  if (!source) notFound();
  const enhancement = getSourceEditorialEnhancement(source.source_id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: source.title,
        url: absoluteUrl(`/sources/${source.source_id}`),
        description: source.short_description,
        isPartOf: { "@type": "WebSite", name: "Texas Water Sources", url: absoluteUrl("/") },
        breadcrumb: { "@id": `${absoluteUrl(`/sources/${source.source_id}`)}#breadcrumb` },
        citation: source.official_url,
      },
      {
        "@id": `${absoluteUrl(`/sources/${source.source_id}`)}#breadcrumb`,
        ...createBreadcrumbList([
          { name: "Home", path: "/" },
          { name: "Official Sources", path: "/sources" },
          { name: source.title, path: `/sources/${source.source_id}` },
        ]),
      },
    ],
  };
  return <PageShell>
    <article className="source-detail wrap">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/sources">Official sources</Link><span aria-hidden="true">/</span><span aria-current="page">{source.title}</span></nav>
      <header><p className="eyebrow">{source.source_category}</p><h1>{source.title}</h1><p className="source-detail-lede">{source.short_description}</p><div className="source-detail-actions"><a className="button primary" href={source.search_url} target="_blank" rel="noreferrer">Open official source <span aria-hidden="true">↗</span></a><Link className="button quiet" href="/sources">Back to directory</Link></div></header>
      <div className="detail-grid">
        <section className="detail-panel"><h2>Source record</h2><dl className="source-definition-list"><div><dt>Agency</dt><dd>{source.agency}</dd></div><div><dt>Agency level</dt><dd>{source.agency_level}</dd></div><div><dt>Geographic scope</dt><dd>{source.geographic_scope.join("; ")}</dd></div><div><dt>Last verified</dt><dd><time dateTime={source.last_verified_date}>{formatDate(source.last_verified_date)}</time></dd></div><div><dt>Date basis</dt><dd>{source.source_date_basis}</dd></div></dl></section>
        <section className="detail-panel"><h2>Research fit</h2><div className="detail-list positive"><h3>Can help find</h3><ul>{source.what_it_can_help_find.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="detail-list caution"><h3>Cannot confirm</h3><ul>{source.what_it_cannot_confirm.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      </div>
      <section className="source-steps"><p className="eyebrow">Suggested source path</p><h2>How to search</h2><ol>{source.search_steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>
      <section className="source-tags"><div><h2>TREC research topics</h2><p>{source.trec_sections.join("; ")}</p></div><div><h2>Coverage tags</h2><p>{[...source.counties, ...source.districts].join("; ") || "Texas statewide source pathway"}</p></div></section>
      <SourceDetailEditorial source={source} enhancement={enhancement} />
      <section className="official-source-links"><h2>Official links and attribution</h2><p>{source.attribution_text}</p><a href={source.official_url} target="_blank" rel="noreferrer">{source.official_source_label} <span aria-hidden="true">↗</span></a><a href={source.terms_url} target="_blank" rel="noreferrer">Official terms or site policy <span aria-hidden="true">↗</span></a></section>
      <section className="global-disclaimer" aria-label="Independent service disclaimer"><strong>Independent source navigation</strong><p>{SITE_DISCLAIMER}</p></section>
    </article>
    <StructuredData data={jsonLd} />
  </PageShell>;
}
