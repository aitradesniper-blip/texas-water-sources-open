import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import { createPageMetadata } from "@/lib/seo";
import { briefDate, districtBriefSlugs, loadDistrictBrief, type BriefClaim } from "@/lib/district-briefs.server";
import { PrintBriefButton } from "../PrintBriefButton";
import "../../intelligence.css";
import "../briefs.css";

export const dynamicParams = false;
export function generateStaticParams() { return districtBriefSlugs.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const brief = loadDistrictBrief((await params).slug);
  if (!brief) notFound();
  return createPageMetadata({ title: brief.title, description: brief.opening.text, path: brief.path, imagePath: null });
}

function Citations({ claim }: { claim: BriefClaim }) {
  return <span className="district-brief-citations">{claim.citations.map((citation, index) => <span key={`${citation.href}-${index}`}>
    {index > 0 ? "; " : " "}<a href={citation.href} aria-label={citation.context}>{citation.label}</a>
  </span>)}</span>;
}
function ClaimParagraph({ claim, label }: { claim: BriefClaim; label?: string }) {
  return <p id={claim.id} data-claim-id={claim.id}>{label && <strong>{label}: </strong>}<span className="district-brief-claim-text">{claim.text}</span><Citations claim={claim} /></p>;
}

export default async function DistrictBriefPage({ params }: { params: Promise<{ slug: string }> }) {
  const brief = loadDistrictBrief((await params).slug);
  if (!brief) notFound();
  return <PageShell prefetchNavigation={false}><article className="gcd-intelligence-page district-brief" aria-labelledby="district-brief-title">
    <header className="gcd-intelligence-hero"><div className="wrap district-brief-width">
      <Breadcrumbs prefetch={false} items={[{ name: "Home", path: "/" }, { name: "Texas Water Watch", path: "/groundwater-districts/intelligence" }, { name: brief.district, path: brief.path }]} />
      <p className="eyebrow">2026 district research brief</p>
      <h1 id="district-brief-title">{brief.title}</h1>
      <p>Board decisions, changes across records and questions the available minutes leave open.</p>
    </div></header>
    <div className="wrap district-brief-width district-brief-body">
      <section className="district-brief-dates" aria-label="Dates and coverage">
        <dl>
          <div><dt>Included minutes</dt><dd><time dateTime={brief.from}>{briefDate(brief.from)}</time>–<time dateTime={brief.through}>{briefDate(brief.through)}</time> · {brief.recordCount} records</dd></div>
          <div><dt>Latest included minutes</dt><dd><time dateTime={brief.latestMinutes}>{briefDate(brief.latestMinutes)}</time></dd></div>
          <div><dt>Prepared</dt><dd><time dateTime={brief.preparedDate}>{briefDate(brief.preparedDate)}</time></dd></div>
          <div><dt>Corpus snapshot</dt><dd><time dateTime={brief.snapshotDate}>{briefDate(brief.snapshotDate)}</time></dd></div>
        </dl>
        <p>Selected recorded minutes; not continuous coverage or a complete 2026 history.</p>
      </section>
      <div className="district-brief-tools"><a href="#brief-sources">Sources and scope</a><PrintBriefButton /></div>
      <section className="district-brief-opening" aria-label="Overview"><ClaimParagraph claim={brief.opening} label="Recorded overview" /></section>
      <nav className="district-brief-contents" aria-label="In this brief"><h2>In this brief</h2><ol>{brief.findings.map((finding) => <li key={finding.id}><a href={`#${finding.id}`}>{finding.title}</a></li>)}</ol></nav>
      {brief.findings.map((finding) => <section className="district-brief-finding" key={finding.id} aria-labelledby={finding.id}>
        <div className="district-brief-finding-start"><h2 id={finding.id}>{finding.title}</h2><ClaimParagraph claim={finding.recorded[0]} label="Recorded" /></div>
        {finding.recorded.slice(1).map((claim) => <ClaimParagraph key={claim.id} claim={claim} label="Recorded" />)}
        <div className="district-brief-interpretation"><ClaimParagraph claim={finding.interpretation} label="Interpretation" /></div>
      </section>)}
      <section className="district-brief-questions" aria-labelledby="brief-questions"><h2 id="brief-questions">What remains unresolved</h2>
        {brief.questions.map((question) => <div key={question.id} data-claim-id={question.id} id={question.id}><p><strong>Proposed follow-up: </strong><span className="district-brief-claim-text">{question.text}</span></p><p><strong>Target: </strong><span className="district-brief-target">{question.target}</span><Citations claim={question} /></p></div>)}
      </section>
      <section className="district-brief-method" aria-labelledby="brief-method"><h2 id="brief-method">Coverage and method</h2>
        <p><strong>Archive-selection window:</strong> January 1–September 28, 2026, by meeting date. This is the retained inventory’s search window, not complete coverage or the span of included minutes.</p>
        <ClaimParagraph claim={brief.method} />
        <p>Facts are paraphrases of published structured items, not quotations or independent technical/legal findings. Comparisons cite each side at the comparison. Interpretations describe possible research uses; follow-up targets are suggestions, not predictions that documents exist.</p>
        <p>This is source-linked synthesis of the September 29, 2026 corpus snapshot, not an independent audit of original PDFs. No original pages were consulted for the briefs, and this website edition adds no official-source check. It does not establish current permit or compliance status.</p>
      </section>
      <section className="district-brief-sources" aria-labelledby="brief-sources"><h2 id="brief-sources">Sources</h2>
        <p>Date/page citations use the recorded meeting date and physical PDF pages. Each link opens its exact structured item; repeated date/page labels can point to different items on the same page.</p>
        <ul>{brief.sources.map((source) => <li key={source.recordUrl}><strong>{briefDate(source.date)}</strong> — <a href={source.recordUrl} aria-label={`${briefDate(source.date)} complete record`}>complete record</a>; <a href={source.originalUrl} aria-label={`${briefDate(source.date)} original minutes`}>original</a>; {source.pages} physical pages.</li>)}</ul>
        <p>Deeper context: <a href={brief.matter.url}>{brief.matter.title}</a>. The findings above cite underlying minutes, not the matter’s conclusions.</p>
      </section>
    </div>
  </article></PageShell>;
}
