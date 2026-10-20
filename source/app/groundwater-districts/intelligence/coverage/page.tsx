import Link from "next/link";
import { PageShell } from "@/app/components/SiteChrome";
import { createPageMetadata } from "@/lib/seo";
import status from "@/public/data/water-watch/v1/coverage-status.json";
import DistrictCoverageBrowser from "./DistrictCoverageBrowser";
import "../meeting-intelligence.css";
import "./coverage.css";

export const metadata = createPageMetadata({
  title: "Water Watch coverage and source-check status",
  description: "See what Texas Water Watch has collected, which official sources were checked manually, what remains unread and what research was published.",
  path: "/groundwater-districts/intelligence/coverage",
});

export default function CoverageStatusPage() {
  const c = status.collection;
  return <PageShell><article className="wrap mi-detail">
    <nav><Link href="/groundwater-districts/intelligence">← Texas Water Watch</Link></nav>
    <header><p className="eyebrow">Texas Water Watch</p><h1>Coverage and source-check status</h1><p className="mi-summary">What is collected, what was checked, what remains unread, and what changed in the published research.</p><p>Frozen operational snapshot captured <time dateTime={status.snapshot_captured_at}>{status.snapshot_captured_at}</time>. This is not a government event date, source check or publication time.</p><p>The current collection release is <a href={status.published_research_changes.collection_release_record}>PR #41</a>. The frozen check snapshot describes the earlier {status.published_snapshot.source_documents}-document PR #39 collection. Three additional North Plains readings were separately accepted at {status.reading_acceptance_overlay.accepted_at}; three other North Plains sources remain deferred. This reading overlay does not imply another source check. Actual PR #41 promotion and verification are recorded in its separate release receipt.</p></header>
    <section className="mi-source"><h2>Collection coverage</h2>
      <p><strong>{c.source_documents} source documents</strong> across <strong>{c.represented_directory_identities} of {c.directory_identities}</strong> identities in the current district directory: {c.pdf_sources} PDFs covering {c.physical_pdf_pages} physical pages and {c.native_sources} native documents. This is representation in a research collection, not a complete or current history of every district.</p>
      <p>Other evidence layers remain separate: {c.facts} Facts, {c.board_actions} Board Actions, {c.candidate_research_leads} tentative research leads and {c.longitudinal_matters} source-linked matters. Counts from different layers cannot be added to estimate government events.</p>
      <p><a href="/data/water-watch/v1/districts.json">District-by-district document counts and links</a> · <Link href="/groundwater-districts#statewide-directory-heading">Browse the district directory</Link></p>
    </section>
    <DistrictCoverageBrowser />
    <section className="mi-source"><h2>Published research changes</h2>
      <p>The collection release is <a href={status.published_research_changes.collection_release_record}>PR #41</a>. The North Plains matter retains the June update and adds historical January, March and April evidence; the Resort matter retains its own earlier research release. Website publication is not a government-source check or a new event.</p>
      <ul>{status.published_research_changes.matters.map(m=><li key={m.matter_id}><Link href={`/groundwater-districts/intelligence/matters/${m.matter_id}`}>{m.matter_id}</Link> · <a href={m.release_record}>research release</a></li>)}</ul>
      <p>PR #39 Worker promotion: <time dateTime={status.published_research_changes.publication_time}>{status.published_research_changes.publication_time}</time> ({status.published_research_changes.publication_time_role}); public verification: <time dateTime={status.published_research_changes.public_verification_at}>{status.published_research_changes.public_verification_at}</time>. These are publication evidence, not district event or source-check dates.</p>
      <h3>Earlier June reporting-answer revision (PR #39)</h3>
      <p>The earlier answer found no unconditional reporting resolution. Minutes for the historical <time dateTime={status.published_research_changes.reporting_change_example.historical_event_date}>{status.published_research_changes.reporting_change_example.historical_event_date}</time> meeting add that alternative 2025 metering methods were described as submitted, with no later motion recorded there. Submission is not acceptance, and the separate late-2023 reporting issue was not closed by this evidence.</p>
      <p>{status.published_research_changes.reporting_change_example.reason} <Link href={new URL(status.published_research_changes.reporting_change_example.conclusion_url).pathname+"#reporting"}>Revised conclusion</Link> · <Link href={new URL(status.published_research_changes.reporting_change_example.revision_url).pathname+"#"+status.published_research_changes.reporting_change_example.revision_id}>Exact prior/revised answers</Link> · <Link href={new URL(status.published_research_changes.reporting_change_example.event_url).pathname+new URL(status.published_research_changes.reporting_change_example.event_url).hash}>June event</Link> · <Link href={new URL(status.published_research_changes.reporting_change_example.source_evidence_url).pathname+new URL(status.published_research_changes.reporting_change_example.source_evidence_url).hash}>June source item</Link>.</p>
      <p>The separate Northern Trinity <a href={status.scoped_checks[0].publication_context.release_record}>district-data release</a> added two complete readings without changing the Resort matter or establishing a September outcome.</p>
    </section>
    <section className="mi-source"><h2>One source-context correction beside a legacy Fact</h2>
      <p>The <Link href="/groundwater-districts/intelligence?view=facts#gcd-intelligence-v1-0138">305.6 acre-feet Fact</Link> keeps its original value and broad classification. The retained <a href={`${status.fact_context[0].official_source_url}#page=${status.fact_context[0].physical_page}`}>Southwestern Travis minutes, physical page 5</a>, describe the figure as <strong>approximately 305.6 acre-feet of reported production for FY2026 to date</strong>; no action was taken on that report item.</p>
    </section>
    <p><a href="/data/water-watch/v1/coverage-status.json">Download this small coverage/status snapshot (JSON)</a> · <Link href="/groundwater-districts/data">All data downloads</Link></p>
  </article></PageShell>;
}
