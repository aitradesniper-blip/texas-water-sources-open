import Image from "next/image";
import { SITE_DISCLAIMER } from "@/lib/source-catalog";

const nav = [
  ["Official sources", "/sources"],
  ["TREC 61-0 Guide", "/trec-61-guide"],
  ["Well records", "/well-records"],
  ["Groundwater districts", "/groundwater-districts"],
  ["Surface-water rights", "/surface-water-rights"],
  ["Methodology", "/methodology"],
];

function Brand({ footer = false }: { footer?: boolean }) {
  // eslint-disable-next-line @next/next/no-html-link-for-pages -- The static host requires document navigation.
  return <a className={`brand${footer ? " footer-brand" : ""}`} href="/"><Image className="brand-logo" src="/texas-water-logo.png" alt="" width={56} height={56} aria-hidden="true" unoptimized/><span>Texas Water Sources<small>Independent source navigation</small></span></a>;
}

export function Header() {
  // Exported pages use document navigation: the static host returns HTML for
  // Next's full-route RSC requests. A new document also closes the mobile menu.
  return <header className="site-header"><div className="wrap nav-wrap"><Brand/><nav className="desktop-nav" aria-label="Primary navigation">{nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a className="nav-cta" href="/property-water-report">Free Property Report</a></nav><details className="mobile-nav"><summary>Menu</summary><div><a className="mobile-report-link" href="/property-water-report">Free Property Report</a>{nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href="/contact">Contact</a><a href="/feedback">Feedback</a><a href="/about">About</a></div></details></div></header>;
}

export function Footer() {
  // eslint-disable-next-line @next/next/no-html-link-for-pages -- Static hosting requires document navigation instead of unsupported Flight transitions.
  return <footer className="site-footer"><div className="wrap footer-grid"><div><Brand footer/><p>Official-source pathways and guided research for Texas water questions. Clear sources, visible uncertainty, better professional handoffs.</p></div><div><h3>Research</h3><a href="/property-water-report">Free Property Report</a><a href="/sources">Official sources</a><a href="/trec-61-guide">TREC 61-0 guide</a><a href="/well-records">Well records</a><a href="/groundwater-districts">Groundwater districts</a><a href="/groundwater-districts/intelligence">Texas Water Watch</a><a href="/groundwater-districts/data">Data access</a><a href="/surface-water-rights">Surface-water rights</a></div><div><h3>Project</h3><a href="https://github.com/aitradesniper-blip/texas-water-sources-open">Open-source code on GitHub</a><a href="/contact">Contact</a><a href="/feedback">Feedback</a><a href="/about">About</a><a href="/about/editorial-standards">Editorial standards</a><a href="/methodology">Methodology</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/disclaimer">Independent-service disclaimer</a></div><div className="footer-note"><h3>Always verify</h3><p>Official records can be incomplete, historical, approximate, or updated after you view them. Consult the relevant agency, district, title professional, surveyor, engineer, or attorney when the transaction requires it.</p></div></div><div className="wrap footer-disclaimer"><p>{SITE_DISCLAIMER}</p></div><div className="wrap footer-bottom"><span>© 2026 Texas Water Sources</span><span>Independent service · Not affiliated with TREC</span></div></footer>;
}

export function ResourceHero({ eyebrow, title, lede, source }: { eyebrow: string; title: string; lede: string; source: string }) {
  return <section className="resource-hero"><div className="wrap"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{lede}</p><div className="source-chip">Primary official source: <strong>{source}</strong></div></div></section>;
}

export function PageShell({ children }: { children: React.ReactNode; prefetchNavigation?: boolean }) {
  // Keep the optional prefetch prop compatible with existing page callers.
  // Header and footer document links no longer prefetch client-router payloads.
  return <div className="site-shell"><Header/><main>{children}</main><Footer/></div>;
}
