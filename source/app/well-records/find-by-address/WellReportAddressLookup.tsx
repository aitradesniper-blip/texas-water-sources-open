"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { usePropertyWaterSnapshotLookup } from "@/app/components/usePropertyWaterSnapshotLookup";
import { trackWellLookupEvent } from "@/lib/analytics-events";
import type {
  PropertyWaterResearchNavigatorV2Response,
  ResearchRecordKind,
  ResearchRecordLead,
  ResearchTask,
  SourceBandSummary,
} from "@/lib/property-water-research-navigator-v2-contract";

type Props = { apiBaseUrl: string };

const recordGroups = [
  {
    kind: "submitted_drillers_report",
    heading: "Submitted Drillers Reports",
    label: "possible records to check",
    empty: "No Submitted Drillers Report candidates were returned for this research location.",
    sourceId: "twdb_submitted_drillers_reports",
  },
  {
    kind: "plugging_report",
    heading: "Plugging reports",
    label: "historical records to check",
    empty: "No plugging-report candidates were returned for this research location.",
    sourceId: "twdb_plugging_reports",
  },
] as const satisfies ReadonlyArray<{
  kind: Extract<ResearchRecordKind, "submitted_drillers_report" | "plugging_report">;
  heading: string;
  label: string;
  empty: string;
  sourceId: string;
}>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function taskForSource(report: PropertyWaterResearchNavigatorV2Response, sourceId: string): ResearchTask | undefined {
  return report.research_tasks.find((task) => task.source_id === sourceId || task.source_id.includes(sourceId));
}

function summaryForKind(
  report: PropertyWaterResearchNavigatorV2Response,
  kind: (typeof recordGroups)[number]["kind"],
): SourceBandSummary {
  return kind === "submitted_drillers_report"
    ? report.quick_summary.drilling_reports
    : report.quick_summary.plugging_reports;
}

function WellRecordCard({ record, groupLabel }: { record: ResearchRecordLead; groupLabel: string }) {
  return (
    <article className="well-lookup-record" data-record-kind={record.record_kind} data-record-role={record.record_role}>
      <div className="well-lookup-record-topline">
        <span>{groupLabel}</span>
        <span>{record.distance_band}</span>
      </div>
      <h4>{record.heading}</h4>
      <dl>
        <div><dt>{record.identifier_label}</dt><dd>{record.identifier_value}</dd></div>
        <div><dt>Record role</dt><dd>{record.role_label}</dd></div>
        {record.rounded_distance ? <div><dt>Approximate distance</dt><dd>{record.rounded_distance}</dd></div> : null}
        {record.details.map((detail) => <div key={`${record.record_id}-${detail.label}`}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}
        <div><dt>Source checked through</dt><dd><time dateTime={record.source_date}>{formatDate(record.source_date)}</time></dd></div>
      </dl>
      <p className="well-lookup-distance-limit">Distance is approximate context, not proof that the record is associated with the property.</p>
      <a
        className="well-lookup-official-link"
        href={record.official_url}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackWellLookupEvent("official_well_report_opened")}
      >
        Open the official report <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

function SourceResults({
  report,
  kind,
  heading,
  label,
  empty,
  sourceId,
}: {
  report: PropertyWaterResearchNavigatorV2Response;
} & (typeof recordGroups)[number]) {
  const records = report.record_leads.filter((record) => record.record_kind === kind);
  const summary = summaryForKind(report, kind);
  const task = taskForSource(report, sourceId);
  const unavailable = task?.status === "source_temporarily_unavailable";
  return (
    <section className="well-lookup-source" data-source-kind={kind} aria-labelledby={`well-lookup-${kind}`}>
      <div className="well-lookup-source-heading">
        <div>
          <p className="eyebrow">{label}</p>
          <h3 id={`well-lookup-${kind}`}>{heading}</h3>
        </div>
        <p><strong>{summary.total}</strong> in this source result</p>
      </div>
      <p className="well-lookup-source-summary">
        {summary.total === records.length
          ? `${records.length} record ${records.length === 1 ? "card is" : "cards are"} shown below.`
          : `${summary.total} records were reported by this source; ${records.length} record ${records.length === 1 ? "card is" : "cards are"} shown below.`}
        {" "}This count belongs only to {heading}; do not add it to another source count as a total of physical wells.
      </p>
      {unavailable ? (
        <div className="well-lookup-source-state" role="status">
          <strong>This source was temporarily unavailable.</strong>
          <p>{task.what_was_found} Preserve this source status and use the official source link in the guide below.</p>
        </div>
      ) : records.length === 0 ? (
        <div className="well-lookup-source-state" role="status">
          <strong>{empty}</strong>
          <p>A no-result response does not prove that no report or well exists. Continue with the fallback searches in the guide below.</p>
        </div>
      ) : (
        <div className="well-lookup-record-grid">
          {records.map((record) => <WellRecordCard key={record.record_id} record={record} groupLabel={label} />)}
        </div>
      )}
    </section>
  );
}

function VerificationChecklist() {
  return (
    <section className="well-lookup-verification" aria-labelledby="well-lookup-verification-heading">
      <p className="eyebrow">Verification checklist</p>
      <h3 id="well-lookup-verification-heading">Test every possible record against the official report</h3>
      <div>
        <article><h4>Compare the official report</h4><p>Open the report and preserve its tracking number, report type, date, county, driller or historical owner when shown, depth, use, and location description.</p></article>
        <article><h4>Supports a possible match</h4><p>Independent property evidence agrees with several report fields, including the legal description or surveyed or observed well location.</p></article>
        <article><h4>Reject a possible match</h4><p>The county, legal description, drilling period, historical owner, driller, depth, use, or physical location conflicts with the property evidence.</p></article>
        <article><h4>What it cannot prove</h4><p>A report or nearby point cannot prove parcel association, present ownership, current operation, yield, water quality, or compliance.</p></article>
      </div>
    </section>
  );
}

function NextActions() {
  return (
    <section className="well-lookup-next" aria-labelledby="well-lookup-next-heading">
      <div>
        <p className="eyebrow">Continue the research</p>
        <h3 id="well-lookup-next-heading">Choose the next level of review</h3>
        <p>Modern address searches may miss older or differently indexed reports. Records from before 2003, uncertain drilling dates, and crossover years need the separate historical-system path.</p>
      </div>
      <div className="button-row">
        <Link className="button primary" href="/property-water-report" onClick={() => trackWellLookupEvent("full_report_cta_clicked")}>
          Run the complete property-water report
        </Link>
        <Link className="button quiet" href="/well-records/pre-2003-records">Search pre-2003 Texas well records</Link>
        <Link className="well-lookup-source-link" href="/sources/twdb_submitted_drillers_reports">Review the official TWDB source pathway</Link>
      </div>
    </section>
  );
}

export default function WellReportAddressLookup({ apiBaseUrl }: Props) {
  const [address, setAddress] = useState("");
  const [county, setCounty] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const lookup = usePropertyWaterSnapshotLookup({
    apiBaseUrl,
    onLookupStarted: () => trackWellLookupEvent("well_lookup_started"),
    onCandidatesLoaded: () => trackWellLookupEvent("well_lookup_candidates_loaded"),
    onLookupCompleted: () => trackWellLookupEvent("well_lookup_completed"),
  });

  useEffect(() => {
    if (lookup.phase === "snapshot") resultsHeadingRef.current?.focus();
  }, [lookup.phase]);

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acknowledged) return;
    setSelectedId("");
    await lookup.findCandidates(address, county);
  }

  function startOver() {
    setAddress("");
    setCounty("");
    setAcknowledged(false);
    setSelectedId("");
    lookup.startOver();
  }

  return (
    <section className="well-report-lookup" aria-labelledby="well-report-lookup-heading" aria-busy={lookup.busy}>
      <div className="wrap well-report-lookup-inner">
        {lookup.phase !== "snapshot" ? (
          <header className="well-report-lookup-heading">
            <div>
              <p className="eyebrow">Address lookup</p>
              <h2 id="well-report-lookup-heading">Search possible well records near a Texas address</h2>
            </div>
            <p>Confirm a research location, then review only Submitted Drillers Reports and plugging records returned by the existing public-record service.</p>
          </header>
        ) : null}

        {!lookup.apiAvailable ? (
          <div className="well-lookup-unavailable" role="status" aria-live="polite">
            <strong>The well-report lookup is not connected right now.</strong>
            <p>The complete static search workflow and official source links remain available below.</p>
          </div>
        ) : (
          <>
            {lookup.phase !== "snapshot" ? (
              <form className="well-lookup-form" onSubmit={submitAddress} aria-describedby="well-lookup-status">
                <div className="well-lookup-fields">
                  <label>
                    <span>Texas property address</span>
                    <input
                      name="well-lookup-address"
                      autoComplete="street-address"
                      minLength={5}
                      maxLength={200}
                      required
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      disabled={lookup.busy}
                    />
                  </label>
                  <label>
                    <span>County hint (optional)</span>
                    <input
                      name="well-lookup-county"
                      autoComplete="address-level2"
                      minLength={2}
                      maxLength={80}
                      value={county}
                      onChange={(event) => setCounty(event.target.value)}
                      disabled={lookup.busy}
                    />
                  </label>
                </div>
                <label className="well-lookup-acknowledgment">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    disabled={lookup.busy}
                  />
                  <span>I understand this address is an orientation point, not a surveyed boundary, and that a nearby record is not confirmed property association.</span>
                </label>
                <button className="button primary" type="submit" disabled={lookup.busy || !acknowledged}>
                  {lookup.busy && lookup.phase === "address" ? "Searching possible addresses..." : "Search possible well records"}
                </button>
              </form>
            ) : null}

            <p
              id="well-lookup-status"
              className={`well-lookup-status ${lookup.messageTone === "error" ? "is-error" : ""}`}
              role={lookup.messageTone === "error" ? "alert" : "status"}
              aria-live={lookup.messageTone === "error" ? "assertive" : "polite"}
            >
              {lookup.message}
            </p>

            {lookup.phase === "candidates" && lookup.candidates.length > 0 ? (
              <section className="well-lookup-candidates" aria-labelledby="well-lookup-candidates-heading">
                <h3 id="well-lookup-candidates-heading">Confirm the research location</h3>
                <fieldset>
                  <legend>Possible addresses</legend>
                  {lookup.candidates.map((candidate) => (
                    <label key={candidate.candidate_id} className={selectedId === candidate.candidate_id ? "selected" : ""}>
                      <input
                        type="radio"
                        name="well-lookup-candidate"
                        value={candidate.candidate_id}
                        checked={selectedId === candidate.candidate_id}
                        onChange={(event) => setSelectedId(event.target.value)}
                        disabled={lookup.busy}
                      />
                      <span><strong>{candidate.address_label}</strong><small>{candidate.county}</small></span>
                    </label>
                  ))}
                </fieldset>
                <button className="button primary" type="button" onClick={() => lookup.confirmCandidate(selectedId)} disabled={lookup.busy || !selectedId}>
                  {lookup.busy ? "Checking well-report sources..." : "Confirm address and review well records"}
                </button>
              </section>
            ) : null}

            {lookup.phase === "snapshot" && lookup.report ? (
              <article className="well-lookup-results" aria-labelledby="well-lookup-results-heading">
                <header>
                  <div>
                    <p className="eyebrow">Well-report lookup result</p>
                    <h2 id="well-lookup-results-heading" ref={resultsHeadingRef} tabIndex={-1}>{lookup.report.property.address_label}</h2>
                    <p>{lookup.report.property.county}, Texas · Sources checked through <time dateTime={lookup.report.property.data_checked_through}>{formatDate(lookup.report.property.data_checked_through)}</time></p>
                  </div>
                  <button className="button quiet" type="button" onClick={startOver}>Search another address</button>
                </header>
                <p className="well-lookup-count-boundary"><strong>Keep these source results separate.</strong> Submitted Drillers Reports and plugging reports describe different record events. Their counts are not a count of physical wells.</p>
                {recordGroups.map((group) => <SourceResults key={group.kind} report={lookup.report!} {...group} />)}
                <VerificationChecklist />
                <NextActions />
              </article>
            ) : null}
          </>
        )}

        {lookup.phase !== "snapshot" ? <NextActions /> : null}
      </div>
    </section>
  );
}
