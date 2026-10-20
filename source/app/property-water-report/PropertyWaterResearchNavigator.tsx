"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  PropertyWaterResearchNavigatorV2Response,
  ResearchRecordKind,
  ResearchRecordLead,
  SourceBandSummary,
} from "@/lib/property-water-research-navigator-v2-contract";
import {
  findingLabels,
  navigatorPrintLabels,
  navigatorRecordRoleLabels,
  navigatorSourceHeadings,
  navigatorStatusLabels,
} from "@/lib/property-water-research-navigator-v2-copy";
import { detectDistrictIntelligence } from "@/lib/gcd-intelligence";
import DataCurrentnessStatus from "./DataCurrentnessStatus";

type Props = {
  report: PropertyWaterResearchNavigatorV2Response;
  apiBaseUrl: string;
  onStartOver: () => void;
};

type PrintMode = "checklist" | "appendix";

const sourceKinds: ResearchRecordKind[] = [
  "submitted_drillers_report",
  "plugging_report",
  "gwdb_well",
  "surface_water",
];

const distanceBandOrder = [
  "Closest: 0–250 feet",
  "Nearby: over 250 feet–0.25 mile",
  "Area: over 0.25–0.5 mile",
  "Broader area: over 0.5–1 mile",
  "Within 1 mile",
  "Over 1–3 miles",
  "Over 3–5 miles",
];

function Status({ value }: { value: keyof typeof navigatorStatusLabels }) {
  return <span className={`navigator-status status-${value}`}>{navigatorStatusLabels[value]}</span>;
}

function RecordCard({ record }: { record: ResearchRecordLead }) {
  const officialLinkLabel = record.record_kind === "surface_water"
    ? "Open the official surface-water viewer"
    : record.record_kind === "gwdb_well"
      ? "Open the official groundwater search"
      : "Open the official report";
  return (
    <article
      className="navigator-record-card"
      data-record-id={record.record_id}
      data-record-kind={record.record_kind}
      data-record-role={record.record_role}
      data-broader-area={record.broader_area ? "true" : "false"}
    >
      <div className="navigator-card-topline">
        <span>{record.distance_band}</span>
        {record.rounded_distance ? <span>{record.rounded_distance}</span> : null}
      </div>
      <h4>{record.heading}</h4>
      <p className="navigator-record-status">{navigatorRecordRoleLabels[record.record_role]}</p>
      <p className="navigator-identifier">
        <span>{record.identifier_label}</span>
        <strong>{record.identifier_value}</strong>
      </p>
      {record.details.length ? (
        <dl className="navigator-detail-list">
          {record.details.map((item) => (
            <div key={`${record.record_id}-${item.label}`}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="navigator-source-date">Data checked through <time dateTime={record.source_date}>{record.source_date}</time></p>
      <a className="navigator-official-link" href={record.official_url} target="_blank" rel="noreferrer">
        {officialLinkLabel}
      </a>
    </article>
  );
}

function RecordsByDistance({ records }: { records: ResearchRecordLead[] }) {
  return (
    <>
      {distanceBandOrder.map((distanceBand) => {
        const rows = records.filter((record) => record.distance_band === distanceBand);
        if (!rows.length) return null;
        return (
          <section className="navigator-distance-tier" data-distance-tier={distanceBand} key={distanceBand}>
            <h5>{distanceBand}</h5>
            <div className="navigator-record-grid">
              {rows.map((record) => <RecordCard key={record.record_id} record={record} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}

function SourceCountCard({ heading, summary }: { heading: string; summary: SourceBandSummary }) {
  return (
    <div>
      <dt>{heading}</dt>
      <dd>{summary.total} total</dd>
      <dd className="navigator-summary-detail">{summary.closest} closest · {summary.nearby} nearby · {summary.area} area · {summary.broader_area} broader area · {summary.cards_shown} cards shown</dd>
    </div>
  );
}

function broaderSummary(
  kind: ResearchRecordKind,
  records: ResearchRecordLead[],
  report: PropertyWaterResearchNavigatorV2Response,
) {
  if (kind === "gwdb_well") {
    const shown = report.quick_summary.groundwater_database.cards_shown;
    return `${records.length} of the ${shown} displayed Groundwater Database cards are grouped as broader area context.`;
  }
  const summary = kind === "submitted_drillers_report"
    ? report.quick_summary.drilling_reports
    : kind === "plugging_report"
      ? report.quick_summary.plugging_reports
      : report.quick_summary.surface_water_records;
  if (kind === "submitted_drillers_report" && summary.broader_area >= 10 && summary.cards_shown === summary.total && records.length === summary.broader_area) {
    const soilBorings = records.filter((record) => record.details.some((detail) => detail.label === "Use or drilling type" && detail.value === "Environmental Soil Boring")).length;
    if (soilBorings > records.length / 2) {
      return `${summary.broader_area} broader-area drilling reports. Most are labeled Environmental Soil Boring. These are not evidence of a private water well at the property. Open individual tracking numbers only when you need to document or reject the possible records.`;
    }
  }
  const sourceName = kind === "submitted_drillers_report"
    ? "drilling reports"
    : kind === "plugging_report"
      ? "plugging reports"
      : "surface-water records";
  if (!summary.broader_area) return `No broader-area ${sourceName} were returned by this source.`;
  return `${summary.broader_area} broader-area ${sourceName}. Open the individual public records only when you need the identifiers and official details.`;
}

export default function PropertyWaterResearchNavigator({ report, apiBaseUrl, onStartOver }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const groundwaterSummary = report.quick_summary.groundwater_database;
  const districtIntelligence = detectDistrictIntelligence(report.research_tasks);

  function printReport(mode: PrintMode) {
    const details = Array.from(document.querySelectorAll<HTMLDetailsElement>("[data-navigator-details]"));
    const priorOpen = details.map((item) => item.open);
    const priorView = document.body.dataset.printView;
    const priorMode = document.body.dataset.printMode;
    details.forEach((item) => {
      item.open = mode === "appendix"
        ? item.dataset.navigatorDetails === "records"
        : item.dataset.navigatorDetails === "task";
    });
    document.body.dataset.printView = "property-water-research-navigator";
    document.body.dataset.printMode = mode;
    const restore = () => {
      details.forEach((item, index) => { item.open = priorOpen[index]; });
      if (priorView === undefined) delete document.body.dataset.printView;
      else document.body.dataset.printView = priorView;
      if (priorMode === undefined) delete document.body.dataset.printMode;
      else document.body.dataset.printMode = priorMode;
    };
    window.addEventListener("afterprint", restore, { once: true });
    window.print();
  }

  return (
    <article className="research-navigator" aria-labelledby="navigator-report-heading">
      <header className="navigator-report-header">
        <div>
          <p className="eyebrow">Free property-water research report</p>
          <p className="navigator-print-mode-title navigator-checklist-print-title">Research checklist</p>
          <p className="navigator-print-mode-title navigator-appendix-print-title">Full record appendix</p>
          <h2 id="navigator-report-heading" ref={headingRef} tabIndex={-1}>{report.property.address_label}</h2>
          <p>{report.property.county}, Texas · Data checked through <time dateTime={report.property.data_checked_through}>{report.property.data_checked_through}</time></p>
        </div>
        <div className="navigator-header-actions no-print">
          <button className="button primary" type="button" data-print-choice="checklist" onClick={() => printReport("checklist")}>{navigatorPrintLabels.checklist}</button>
          <button className="button quiet" type="button" data-print-choice="appendix" onClick={() => printReport("appendix")}>{navigatorPrintLabels.appendix}</button>
          <button className="button quiet" type="button" onClick={onStartOver}>Start another report</button>
        </div>
      </header>

      <section className="navigator-summary" aria-labelledby="navigator-summary-heading">
        <div>
          <p className="eyebrow">Property research summary</p>
          <h3 id="navigator-summary-heading">The strongest leads and what remains</h3>
          <p>{report.quick_summary.overview}</p>
          <p className="navigator-source-universe-note">{report.quick_summary.source_universe_note}</p>
        </div>
        <dl className="navigator-summary-facts">
          <SourceCountCard heading="Submitted Drillers Reports" summary={report.quick_summary.drilling_reports} />
          <SourceCountCard heading="Plugging reports" summary={report.quick_summary.plugging_reports} />
          <div>
            <dt>Groundwater Database wells</dt>
            <dd>{groundwaterSummary.cards_shown} cards shown</dd>
            <dd className="navigator-summary-detail">{groundwaterSummary.within_1_mile} within 1 mile · {groundwaterSummary.within_3_miles} within 3 miles · {groundwaterSummary.within_5_miles} within 5 miles</dd>
          </div>
          <SourceCountCard heading="Surface-water records" summary={report.quick_summary.surface_water_records} />
          <div className="navigator-summary-wide"><dt>Manual steps remain</dt><dd>{report.quick_summary.manual_steps_remain ? "Yes" : "No"}</dd></div>
        </dl>
      </section>

      <DataCurrentnessStatus apiBaseUrl={apiBaseUrl} />

      {districtIntelligence ? <section className="navigator-district-intelligence" data-district-intelligence={districtIntelligence.district_id} aria-labelledby="navigator-district-intelligence-heading">
        <div><p className="eyebrow">District meeting-record intelligence available</p><h3 id="navigator-district-intelligence-heading">{districtIntelligence.district_name}</h3><p><strong>{districtIntelligence.record_count} district-level records</strong> are available across {districtIntelligence.categories.join(", ").toLocaleLowerCase("en-US")}.</p></div>
        <div><strong>District-level intelligence — not evidence that these records concern this property.</strong><p>The panel appears only because an existing report task returned an exact approved district alias. It does not property-match any meeting record.</p><Link className="button primary" href="/groundwater-districts/meeting-records">Browse district meeting records</Link></div>
      </section> : null}

      <section className="navigator-section navigator-checklist-only" aria-labelledby="navigator-findings-heading">
        <p className="eyebrow">What Texas Water Sources found</p>
        <h3 id="navigator-findings-heading">Start with these five findings</h3>
        <div className="navigator-findings-grid">
          {report.findings.map((finding) => (
            <article className="navigator-finding-card" key={finding.finding_id}>
              <Status value={finding.status} />
              <h4>{finding.heading}</h4>
              <dl>
                <div><dt>{findingLabels.what_we_found}</dt><dd>{finding.what_we_found}</dd></div>
                <div><dt>{findingLabels.why_it_matters}</dt><dd>{finding.why_it_matters}</dd></div>
                <div><dt>{findingLabels.what_to_do_next}</dt><dd>{finding.what_to_do_next}</dd></div>
                <div><dt>{findingLabels.what_it_does_not_prove}</dt><dd>{finding.what_it_does_not_prove}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="navigator-section navigator-record-section" aria-labelledby="navigator-records-heading">
        <p className="eyebrow">Records to check</p>
        <h3 id="navigator-records-heading">Records grouped by public source and distance</h3>
        <p>Use each source on its own terms. Compare identifiers and official documents before connecting a record with the property.</p>
        <div className="navigator-source-record-groups">
          {sourceKinds.map((kind) => {
            const records = report.record_leads.filter((record) => record.record_kind === kind);
            const closer = records.filter((record) => !record.broader_area);
            const broader = records.filter((record) => record.broader_area);
            return (
              <section className="navigator-source-record-group" data-source-group={kind} key={kind}>
                <h4>{navigatorSourceHeadings[kind]}</h4>
                {closer.length ? <RecordsByDistance records={closer} /> : <p className="navigator-no-close-records">No closest, nearby, or area record cards were returned by this source.</p>}
                <p className="navigator-broader-summary"><strong>Broader-area summary:</strong> {broaderSummary(kind, broader, report)}</p>
                {broader.length ? (
                  <details className="navigator-broader-records" data-navigator-details="records">
                    <summary>Open individual broader-area records ({broader.length})</summary>
                    <RecordsByDistance records={broader} />
                  </details>
                ) : null}
              </section>
            );
          })}
        </div>
      </section>

      <section className="navigator-section navigator-checklist-only" aria-labelledby="navigator-tasks-heading">
        <p className="eyebrow">Step-by-step research checklist</p>
        <h3 id="navigator-tasks-heading">Finish these checks in priority order</h3>
        <div className="navigator-task-list">
          {report.research_tasks.map((task) => (
            <details key={task.task_id} className="navigator-task" data-navigator-details="task">
              <summary>
                <span className="navigator-priority">{task.priority}</span>
                <span><strong>{task.source_name}</strong><Status value={task.status} /></span>
              </summary>
              <div className="navigator-task-body">
                <p><strong>Why this matters:</strong> {task.why_it_matters}</p>
                <p><strong>What we searched:</strong> {task.automatic_search_summary}</p>
                <p><strong>What we found:</strong> {task.what_was_found}</p>
                <div>
                  <h4>Search values</h4>
                  <dl className="navigator-identifiers">
                    {task.identifiers.map((identifier, index) => (
                      <div key={`${task.task_id}-${identifier.label}-${index}`}><dt>{identifier.label}</dt><dd>{identifier.value}</dd></div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h4>Exact steps</h4>
                  <ol>{task.manual_steps.map((step) => <li key={step}>{step}</li>)}</ol>
                </div>
                <div className="navigator-compare-grid">
                  <div><h4>Compare these fields</h4><ul>{task.fields_to_compare.map((field) => <li key={field}>{field}</li>)}</ul></div>
                  <div><h4>What supports a possible match</h4><ul>{task.supports_possible_match.map((rule) => <li key={rule}>{rule}</li>)}</ul></div>
                  <div><h4>What rejects a possible match</h4><ul>{task.rejects_possible_match.map((rule) => <li key={rule}>{rule}</li>)}</ul></div>
                </div>
                <div className="navigator-task-closing">
                  <p><strong>What this source cannot prove:</strong> {task.what_it_cannot_prove}</p>
                  <p><strong>Who can answer what remains:</strong> {task.remaining_answer_source}</p>
                  <p><strong>Texas Real Estate Commission Form 61-0 topic:</strong> {task.trec_61_0_topic}</p>
                  <a className="navigator-official-link" href={task.official_url} target="_blank" rel="noreferrer">See how to check this record</a>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="navigator-section navigator-question-section navigator-checklist-only" aria-labelledby="navigator-seller-heading">
        <p className="eyebrow">Questions to ask the seller</p>
        <h3 id="navigator-seller-heading">Ask for facts and documents</h3>
        <div className="navigator-question-grid">
          {report.seller_questions.map((item) => (
            <article key={item.question_id}><h4>{item.question}</h4><p>{item.why_ask}</p></article>
          ))}
        </div>
      </section>

      {report.professional_questions.length ? (
        <section className="navigator-section navigator-question-section navigator-checklist-only" aria-labelledby="navigator-professional-heading">
          <p className="eyebrow">When professional help may be useful</p>
          <h3 id="navigator-professional-heading">Use the right person for the open question</h3>
          <div className="navigator-question-grid">
            {report.professional_questions.map((item) => (
              <article key={`${item.professional_type}-${item.question}`}><h4>{item.professional_type}</h4><p>{item.when_to_use}</p><strong>{item.question}</strong></article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="navigator-section navigator-sources navigator-checklist-only" aria-labelledby="navigator-sources-heading">
        <p className="eyebrow">Official sources</p>
        <h3 id="navigator-sources-heading">Open the public records yourself</h3>
        <div className="navigator-source-grid">
          {report.official_sources.map((source) => (
            <article key={source.source_id}>
              <h4><a href={source.official_url} target="_blank" rel="noreferrer">{source.source_name}</a></h4>
              <p>{source.how_to_search}</p>
              {source.data_checked_through ? <small>Data checked through <time dateTime={source.data_checked_through}>{source.data_checked_through}</time></small> : <small>Open the source for its current information.</small>}
            </article>
          ))}
        </div>
        <p className="lookup-nonendorsement">
          Texas Water Sources is independent. This report is not endorsed by the State of Texas or any Texas state agency.
        </p>
      </section>

      <section className="navigator-section navigator-limits navigator-checklist-only" aria-labelledby="navigator-limits-heading">
        <p className="eyebrow">Important limits</p>
        <h3 id="navigator-limits-heading">What this report does not decide</h3>
        <ul>{report.important_limits.map((limit) => <li key={limit}>{limit}</li>)}</ul>
      </section>

      <section className="navigator-service navigator-checklist-only" aria-labelledby="navigator-service-heading">
        <div>
          <p className="eyebrow">Optional research service</p>
          <h3 id="navigator-service-heading">{report.service_option.heading}</h3>
          <p>{report.service_option.boundary}</p>
        </div>
        <Link className="button primary no-print" href={report.service_option.cta_url}>{report.service_option.cta_label}</Link>
      </section>

      <section className="navigator-feedback navigator-checklist-only no-print" aria-labelledby="navigator-feedback-heading">
        <div><p className="eyebrow">Optional feedback</p><h3 id="navigator-feedback-heading">Was this report useful?</h3><p>Share limited feedback about the tool without sending this property address, lookup identifier, coordinates, or report results.</p></div>
        <div className="navigator-feedback-actions">
          <Link className="button quiet" href="/feedback">Yes</Link>
          <Link className="button quiet" href="/feedback">Partly</Link>
          <Link className="button quiet" href="/feedback">Not yet</Link>
          <Link className="text-link" href="/feedback">Tell us what was missing</Link>
          <Link className="text-link" href="/feedback">Report a broken official link</Link>
        </div>
      </section>
    </article>
  );
}
