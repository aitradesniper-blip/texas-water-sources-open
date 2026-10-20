import Link from "next/link";
import {
  Breadcrumbs,
  EditorialMeta,
  OfficialSources,
  RelatedResearch,
  ResearchLimitations,
} from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { correctionsEditorial } from "@/lib/editorial-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: correctionsEditorial.title,
  description: correctionsEditorial.description,
  path: "/about/corrections",
});

export default function CorrectionsPage() {
  return <PageShell><article className="prose-page editorial-page wrap">
    <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }, { name: "Corrections", path: "/about/corrections" }]} />
    <header><p className="eyebrow">Corrections and source changes</p><h1>Corrections and source-change policy</h1><p className="lead">Factual corrections and changed official links should be evaluated against the current authority, without erasing uncertainty or overstating what the source can establish.</p><p className="editorial-question"><strong>Primary question</strong>{correctionsEditorial.primary_question}</p></header>
    <EditorialMeta content={correctionsEditorial} />

    <div className="contact-gap" role="note"><strong>Send a correction or broken-link report.</strong><p>Use the limited <Link href="/feedback">feedback form</Link> or the visible contact options on the <Link href="/contact">contact page</Link>. Do not include a property address, lookup identifier, seller answer, coordinates, credentials, or payment information.</p></div>

    <h2>What should be evaluated</h2>
    <p>A correction review can address an inaccurate factual statement, a broken or redirected official link, changed official source navigation, an outdated limitation, or a mismatch between visible content and structured data. A disagreement that requires legal or title interpretation is preserved as unresolved rather than decided by the site.</p>

    <h2>How a potential correction is checked</h2>
    <ol className="number-list correction-steps"><li><strong>Reopen the official source.</strong><span>Confirm the current page, responsible authority, and access date.</span></li><li><strong>Compare the affected statement.</strong><span>Identify whether the issue is factual, editorial, technical, or interpretive.</span></li><li><strong>Preserve the boundary.</strong><span>Do not convert an uncertain candidate record into a confirmed property fact while correcting adjacent text.</span></li><li><strong>Make the narrow correction.</strong><span>Update the claim, link, limitation, metadata, or structured data that is actually affected.</span></li><li><strong>Document material changes.</strong><span>Update the substantive review date and retain an appropriate revision note or source-review record.</span></li></ol>

    <h2>Broken or changed official sources</h2>
    <p>A broken link is checked for an official replacement, redirect, changed agency page or search path, or source retirement. The site does not substitute an unofficial mirror merely to keep a link working. If no current official replacement is verified, the gap remains visible.</p>

    <h2>Privacy boundary</h2>
    <p>Do not send private client communications, credentials, precise nonpublic location data, title documents, or other sensitive property material through an unverified channel. The current site remains a public, static, account-free research resource.</p>

    <OfficialSources content={correctionsEditorial} />
    <ResearchLimitations content={correctionsEditorial} />
    <RelatedResearch content={correctionsEditorial} />
  </article></PageShell>;
}
