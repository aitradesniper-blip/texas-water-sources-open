import { PageShell } from "@/app/components/SiteChrome";
import { StructuredData } from "@/app/components/StructuredData";
import {
  publicSources,
  SITE_DISCLAIMER,
  sourceCategories,
  sourceCounties,
  sourceDistricts,
  sourceTrecSections,
} from "@/lib/source-catalog";
import SourceDirectory from "./SourceDirectory";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import { publishedSourceCategories } from "@/lib/source-editorial";
import Link from "next/link";

const description = "Search a bounded directory of official Texas agency and groundwater-district source pathways, with source attribution, review dates, and explicit limitations.";

export const metadata = createPageMetadata({ title: "Official Texas Water Record Sources", description, path: "/sources" });

export default function SourcesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Official Texas Water Record Sources",
    url: absoluteUrl("/sources"),
    description,
    isPartOf: { "@type": "WebSite", name: "Texas Water Sources", url: absoluteUrl("/") },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: publicSources.length,
      itemListElement: publicSources.map((source, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/sources/${source.source_id}`),
        name: source.title,
      })),
    },
  };
  return <PageShell>
    <section className="sources-hero"><div className="wrap"><p className="eyebrow">Official-source directory</p><h1>Start with the record authority.</h1><p>Search a deliberately bounded catalog of Texas agency and district source pathways. Each entry explains what the source can help find, what it cannot confirm, and where to continue on the official website.</p><div className="source-scope-note"><strong>Eight approved entries. No mirrored record database.</strong><span>Wharton County appears as a bounded coverage tag, not as a comprehensive county dataset.</span></div></div></section>
    <section className="source-family-directory wrap" aria-labelledby="source-family-heading"><div className="source-family-heading"><p className="eyebrow">Browse by research task</p><h2 id="source-family-heading">Populated source families</h2><p>These editorial landing pages organize only the records already in the approved catalog. Empty source families remain unpublished.</p></div><div className="source-family-grid">{publishedSourceCategories.map((category) => <Link href={`/sources/${category.slug}`} key={category.slug}><strong>{category.title}</strong><span>{category.description}</span><small>{category.source_ids.length} approved source{category.source_ids.length === 1 ? "" : "s"} · Review the family →</small></Link>)}</div></section>
    <SourceDirectory sources={publicSources} categories={sourceCategories} counties={sourceCounties} districts={sourceDistricts} trecSections={sourceTrecSections} />
    <section className="global-disclaimer wrap" aria-label="Independent service disclaimer"><strong>Independent source navigation</strong><p>{SITE_DISCLAIMER}</p></section>
    <StructuredData data={jsonLd} />
  </PageShell>;
}
