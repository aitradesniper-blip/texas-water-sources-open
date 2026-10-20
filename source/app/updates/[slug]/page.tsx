/* eslint-disable @next/next/no-html-link-for-pages -- Static hosting requires native document navigation. */
import { notFound } from "next/navigation";
import { PageShell } from "@/app/components/SiteChrome";
import { StructuredData } from "@/app/components/StructuredData";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";
import { briefings } from "@/lib/updates-content";
import { briefingDate, briefingPath, updatesFeedPath } from "@/lib/updates";
import { CopyBriefingLink, UpdatesLink } from "../UpdatesActions";
import "../updates.css";

export function generateStaticParams() { return briefings.map(briefing => ({ slug: briefing.slug })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const briefing = briefings.find(value => value.slug === slug);
  if (!briefing) return {};
  return createPageMetadata({ title: briefing.title, description: briefing.summary, path: briefingPath(slug) });
}

export default async function BriefingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const briefing = briefings.find(value => value.slug === slug);
  if (!briefing) notFound();
  const url = absoluteUrl(briefingPath(slug));
  return <PageShell><article className="wrap updates-page updates-article"><header className="updates-hero"><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/updates">Updates</a> / Briefing</nav><p className="eyebrow">Texas Water Sources briefing</p><h1>{briefing.title}</h1><p className="updates-lede">{briefing.summary}</p><p className="updates-date">Published <time dateTime={briefing.publishedAt}>{briefingDate(briefing.publishedAt, true)}</time>. Sources checked <time dateTime={briefing.checkedOn}>{briefingDate(briefing.checkedOn)}</time> (Central time). {briefing.checkNote}</p><p>Each status describes the cited record at that source check. Dates in the sources may have passed since publication; check the district for subsequent action.</p><CopyBriefingLink url={url} /></header><nav className="updates-jump" aria-label="Places in this briefing">{briefing.items.map(item => <a key={item.id} href={`#${item.id}`}>{item.place}</a>)}</nav>{briefing.items.map(item => <section key={item.id} id={item.id} className="updates-item"><p className="updates-place">{item.place}</p><h2>{item.title}</h2><dl><div><dt>Who it matters to</dt><dd>{item.mattersTo}</dd></div><div><dt>What changed</dt><dd>{item.changed}</dd></div><div><dt>Status at source check</dt><dd>{item.status}</dd></div><div><dt>Next date or action to check</dt><dd>{item.nextAction}</dd></div></dl>{item.sourceDate ? <p className="updates-date">Date stated in the source: {item.sourceDate}</p> : null}<h3>Primary evidence</h3><ul className="updates-sources">{item.sources.map(source => <li key={source.url}><UpdatesLink href={source.url} kind="source">{source.title}</UpdatesLink>{source.locator ? <span> — {source.locator}</span> : null}</li>)}</ul><div className="updates-unknowns"><h3>What remains unknown</h3><ul>{item.unknowns.map(unknown => <li key={unknown}>{unknown}</li>)}</ul></div></section>)}<aside className="updates-boundary"><h2>Continue the research</h2><p><a href="/updates">All district briefings</a> · <UpdatesLink kind="feed" href={updatesFeedPath}>Follow via RSS</UpdatesLink> · <a href="/groundwater-districts">Find your district</a> · <a href="/about/corrections">Report a correction</a> · <a href="/well-records/repair-assistance-before-work">Check repair assistance before work</a></p><p>These selected records are not complete statewide coverage or a determination about a particular property, well or water right.</p></aside><StructuredData data={{ "@context": "https://schema.org", "@type": "Article", headline: briefing.title, description: briefing.summary, url, datePublished: briefing.publishedAt, dateModified: briefing.publishedAt, author: { "@type": "Organization", name: "Texas Water Sources", url: absoluteUrl("/about") }, publisher: { "@type": "Organization", name: "Texas Water Sources", url: absoluteUrl("/") }, citation: briefing.items.flatMap(item => item.sources.map(source => source.url)) }} /></article></PageShell>;
}
