/* eslint-disable @next/next/no-html-link-for-pages -- Static hosting requires document navigation instead of unsupported Flight transitions. */
import { Footer, Header } from "./components/SiteChrome";
import { FocusedResearchTools } from "./components/FocusedResearchTools";
import { StructuredData } from "./components/StructuredData";
import { publicSources } from "@/lib/source-catalog";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

const title = "Texas Water Sources: Texas Water Record Research";
const description = "Enter a Texas address to organize nearby well records, groundwater-district context, surface-water records, official links, and remaining property-water research steps.";

export const metadata = createPageMetadata({ title, description, path: "/" });

const paths = [
  ["01", "Find the official source", "Search a bounded catalog of agency and district pathways before interpreting a record."],
  ["02", "Use the TREC 61-0 guide", "Work through one topic at a time without having the site choose a disclosure response."],
  ["03", "Preserve the research trail", "Keep source links, observations, uncertainty, and professional follow-ups together."],
];

export default function Home() {
  const featured = publicSources.slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        name: "Texas Water Sources",
        url: absoluteUrl("/"),
        description,
        publisher: { "@id": `${absoluteUrl("/")}#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}#organization`,
        name: "Texas Water Sources",
        url: absoluteUrl("/"),
        logo: absoluteUrl("/texas-water-logo.png"),
        description: "An independent research and source-navigation service for official Texas water records.",
      },
    ],
  };
  return <div className="site-shell"><Header/><main>
    <section className="hero wrap home-product-hero">
      <div className="hero-copy"><p className="eyebrow">Free Texas property-water research</p><h1>Research a Texas property&apos;s <em>water records.</em></h1><p className="hero-lede">Enter a Texas address to organize nearby well reports, groundwater-district context, surface-water records, official links, and the research steps that remain.</p><div className="button-row homepage-actions"><a className="button primary" href="/property-water-report">Run a free property-water report</a><a className="button quiet" href="/trec-61-guide">Use the TREC Form 61-0 guide</a><a className="text-link" href="/sources">Search official water sources →</a></div><p className="microcopy">No account required · Address not saved · Official-source links</p></div>
      <div className="hero-card source-preview-card"><div className="hero-card-top"><span>Source directory</span><span className="status-pill">Verified 2026-07-14</span></div><p className="property-kicker">Eight approved source pathways</p><h2>Know where to look next.</h2>{featured.slice(0, 3).map((source, index) => <div className={`research-line ${index === 0 ? "active" : ""}`} key={source.source_id}><span>{index + 1}</span><div><strong>{source.title}</strong><small>{source.source_category}</small></div></div>)}<div className="source-ribbon"><span className="source-mark">TX</span><span><strong>Source-linked, not auto-decided</strong><small>Every entry carries limitations and an official link.</small></span></div></div>
    </section>
    <section className="trust-strip"><div className="wrap trust-grid"><div><span className="mini-label">Built for</span><strong>Texas water and property research</strong></div><div><span className="mini-label">Designed around</span><strong>Official source pathways and visible caveats</strong></div><div><span className="mini-label">Independent by design</span><strong>Not affiliated with TREC or any agency</strong></div></div></section>
    <section className="section wrap home-report-explainer"><div className="section-heading"><div><p className="eyebrow">An organized starting point</p><h2 className="display-small">One address. Several separate public-record systems. One organized starting point.</h2></div><a className="button primary" href="/property-water-report">Run the free property-water report</a></div><div className="platform-grid"><article><span>01</span><h3>Identify the mapped groundwater district</h3><p>See district context while keeping map boundaries separate from survey or legal conclusions.</p></article><article><span>02</span><h3>Find nearby well and surface-water records</h3><p>Review source-separated leads, distances, identifiers, and official links without treating a nearby record as a property fact.</p></article><article><span>03</span><h3>Open official records and complete the remaining checks</h3><p>Follow an address-specific research plan for comparisons, seller questions, and appropriate professional follow-up.</p></article></div></section>
    <FocusedResearchTools />
    <section className="section wrap intro-grid"><div><p className="eyebrow">Help before a repair</p><h2 className="display-small">Check assistance before work starts.</h2></div><div className="large-copy"><p>Well owners in Bastrop, Lee, Milam and Burleson counties: compare district approval steps, who pays initially, and the official forms before agreeing to work.</p><p><a className="text-link" href="/well-records/repair-assistance-before-work">Read the well repair assistance guide</a></p><p>Other counties: <a href="/groundwater-districts">find your district</a> and ask what help is available. Programs and funding vary.</p></div></section>
    <section className="section wrap intro-grid"><div><p className="eyebrow">A clearer first pass</p><h2 className="display-small">Water records rarely live in one place.</h2></div><div className="large-copy"><p>A well report, groundwater observation, district boundary, local rule, and surface-water-right record answer different questions. Texas Water Sources helps keep those sources and questions separate.</p><p>The directory does not mirror official databases or claim comprehensive coverage. It shows where a bounded set of official records lives, what each pathway may help find, and what still requires verification.</p></div></section>
    <section className="section tint-section"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">Source platform</p><h2 className="display-small">Authority first. Interpretation second.</h2></div><a className="text-link" href="/sources">Search all eight sources →</a></div><div className="platform-grid"><article><span>01</span><h3>Record types stay separate</h3><p>Well reports, observations, conditions, district records, and routing layers keep their own roles.</p></article><article><span>02</span><h3>Source dates stay visible</h3><p>Each entry shows its verification date and explains the basis for record dates.</p></article><article><span>03</span><h3>Limitations stay explicit</h3><p>Every source states what it can help find and what it cannot confirm.</p></article><article><span>04</span><h3>Official links stay intact</h3><p>Search steps lead back to the authoritative agency or district surface; no record database is mirrored.</p></article></div></div></section>
    <section className="section wrap"><div className="section-heading"><div><p className="eyebrow">Featured official sources</p><h2 className="display-small">Begin with a record family.</h2></div></div><div className="home-source-grid">{featured.map((source) => <article key={source.source_id}><p>{source.source_category}</p><h3><a href={`/sources/${source.source_id}`}>{source.title}</a></h3><span>{source.short_description}</span></article>)}</div></section>
    <section className="section wrap resource-section"><div className="section-heading"><div><p className="eyebrow">Guided research</p><h2 className="display-small">From uncertainty to an organized handoff.</h2></div><a className="text-link" href="/trec-61-guide">Open the 61-0 guide →</a></div><div className="feature-grid">{paths.map(([number, title, body]) => <article className="feature-card" key={number}><span className="feature-number">{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="section wrap boundary-callout"><div className="boundary-icon">i</div><div><p className="eyebrow">An important boundary</p><h2>This is source navigation and research support, not a title opinion, legal advice, or completed disclosure.</h2><p>Water records and map layers can identify useful leads. They do not, by themselves, establish whether a water right is owned by, reserved from, appurtenant to, or transferable with a property.</p></div><a className="button quiet" href="/disclaimer">Read the independent-service disclaimer</a></section>
    <section className="cta-band"><div className="wrap"><div><p className="eyebrow light">Start with the authority</p><h2>Find the next official source.</h2></div><a className="button sand" href="/sources">Search the directory →</a></div></section>
    <StructuredData data={jsonLd} />
  </main><Footer/></div>;
}
