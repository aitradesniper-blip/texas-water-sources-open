"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { usePropertyWaterSnapshotLookup } from "@/app/components/usePropertyWaterSnapshotLookup";
import type { WorksheetValues } from "@/app/components/worksheets/worksheet-types";
import { SurfaceCandidateWorksheet } from "@/app/surface-water-rights/surface-candidate-worksheet";
import { trackWaterRightsCompanionEvent } from "@/lib/analytics-events";
import type {
  PropertyWaterResearchNavigatorV2Response,
  ResearchRecordLead,
} from "@/lib/property-water-research-navigator-v2-contract";

type Props = { apiBaseUrl: string };
type SurfaceLeadGroup = { wrId: string; records: ResearchRecordLead[] };
type WorksheetSaveRequest = { id: number; values: WorksheetValues };

const officialViewerUrl = "https://www.tceq.texas.gov/gis/water-rights-viewer";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function detailValues(records: ResearchRecordLead[], label: string) {
  return unique(records.flatMap((record) => record.details.filter((detail) => detail.label === label).map((detail) => detail.value)));
}

function surfaceLeadGroups(report: PropertyWaterResearchNavigatorV2Response): SurfaceLeadGroup[] {
  const groups = new Map<string, ResearchRecordLead[]>();
  for (const record of report.record_leads) {
    if (record.record_kind !== "surface_water") continue;
    const records = groups.get(record.identifier_value) ?? [];
    records.push(record);
    groups.set(record.identifier_value, records);
  }
  return [...groups].map(([wrId, records]) => ({ wrId, records }));
}

function FieldRow({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null;
  return <div><dt>{label}</dt><dd>{values.join(" · ")}</dd></div>;
}

function LeadCard({ group, onSave }: { group: SurfaceLeadGroup; onSave: (values: WorksheetValues, subject: string) => void }) {
  const rightTypes = detailValues(group.records, "Right or type number");
  const pointTypes = detailValues(group.records, "Mapped point type");
  const pointCounts = detailValues(group.records, "Mapped point count");
  const distanceBands = unique(group.records.map((record) => record.distance_band));
  const roundedDistances = unique(group.records.map((record) => record.rounded_distance));
  const sourceDates = unique(group.records.map((record) => record.source_date));
  const roleLabels = unique(group.records.map((record) => record.role_label));
  const officialUrls = unique(group.records.map((record) => record.official_url));
  const mappedNotes = [
    pointTypes.length ? `Mapped point type: ${pointTypes.join("; ")}` : "",
    pointCounts.length ? `Mapped point count: ${pointCounts.join("; ")}` : "",
    distanceBands.length ? `Distance band: ${distanceBands.join("; ")}` : "",
    roundedDistances.length ? `Approximate distance: ${roundedDistances.join("; ")}` : "",
    "Mapped locations are research context, not survey-grade property boundaries.",
  ].filter(Boolean).join("\n");

  return <article className="water-rights-lead" data-wr-id-group={group.wrId}>
    <div className="water-rights-lead-topline"><span>Mapped water-right lead</span><span>{group.records.length} mapped {group.records.length === 1 ? "record" : "records"}</span></div>
    <h4><span>WR_ID</span>{group.wrId}</h4>
    <dl>
      <FieldRow label="Right or type number" values={rightTypes} />
      <FieldRow label="Mapped point type or types" values={pointTypes} />
      <FieldRow label="Mapped point count" values={pointCounts} />
      <FieldRow label="Distance band" values={distanceBands} />
      <FieldRow label="Approximate distance" values={roundedDistances} />
      <FieldRow label="Source checked through" values={sourceDates.map(formatDate)} />
      <FieldRow label="Record role" values={roleLabels} />
    </dl>
    <p className="water-rights-lead-limit">A nearby mapped point is a research lead. Its location does not establish property association, ownership, transfer, validity, priority, or permitted use.</p>
    <div className="water-rights-lead-actions">
      {officialUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" onClick={() => trackWaterRightsCompanionEvent("official_water_rights_viewer_opened")}>Open the official TCEQ viewer <span aria-hidden="true">↗</span></a>)}
      <button type="button" onClick={() => onSave({
        "authorization-identifier": group.wrId,
        "permit-certificate": rightTypes.join("; "),
        "viewer-search-date": new Date().toISOString().slice(0, 10),
        "diversion-impoundment-location": mappedNotes,
        "official-source-links-access-dates": officialUrls.map((url) => `${url} · source checked ${sourceDates.join(", ")}`).join("\n"),
      }, "Mapped lead")}>Add this lead to the worksheet</button>
    </div>
  </article>;
}

function NextActions() {
  return <section className="water-rights-next" aria-labelledby="water-rights-next-heading">
    <div>
      <p className="eyebrow">Continue in the official record</p>
      <h3 id="water-rights-next-heading">Compare the lead before drawing a property conclusion</h3>
      <p>Compare the official authorization and linked documents with the deed, complete legal description, plat, survey, title materials, and seller documents. Preserve agreement, conflict, and missing evidence separately.</p>
    </div>
    <div className="button-row">
      <a className="button primary" href={officialViewerUrl} target="_blank" rel="noreferrer" onClick={() => trackWaterRightsCompanionEvent("official_water_rights_viewer_opened")}>Open official TCEQ Water Rights Viewer</a>
      <Link className="button quiet" href="/surface-water-rights">Open the complete surface-water-rights research guide</Link>
      <Link className="button quiet" href="/property-water-report" onClick={() => trackWaterRightsCompanionEvent("full_report_cta_clicked")}>Run the complete property-water report</Link>
    </div>
  </section>;
}

export default function WaterRightsViewerCompanion({ apiBaseUrl }: Props) {
  const [address, setAddress] = useState("");
  const [county, setCounty] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [manualWrId, setManualWrId] = useState("");
  const [worksheetSaveRequest, setWorksheetSaveRequest] = useState<WorksheetSaveRequest | null>(null);
  const [worksheetSaveSubject, setWorksheetSaveSubject] = useState("");
  const [worksheetStatus, setWorksheetStatus] = useState("");
  const requestId = useRef(0);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const lookup = usePropertyWaterSnapshotLookup({
    apiBaseUrl,
    copy: {
      unavailable: "The surface-water companion is not connected right now.",
      requestFailed: "The surface-water lookup could not be completed. Please try again.",
      checkingSources: "Checking the managed surface-water snapshot...",
      completed: "Mapped surface-water record leads are ready to review.",
    },
    onLookupStarted: () => trackWaterRightsCompanionEvent("water_rights_lookup_started"),
    onCandidatesLoaded: () => trackWaterRightsCompanionEvent("water_rights_lookup_candidates_loaded"),
    onLookupCompleted: () => trackWaterRightsCompanionEvent("water_rights_lookup_completed"),
  });
  const groups = useMemo(() => lookup.report ? surfaceLeadGroups(lookup.report) : [], [lookup.report]);

  useEffect(() => {
    if (lookup.phase === "snapshot") resultsHeadingRef.current?.focus();
  }, [lookup.phase]);

  function queueWorksheetSave(values: WorksheetValues, subject: string) {
    requestId.current += 1;
    setWorksheetSaveSubject(subject);
    setWorksheetStatus("Saving to the browser-local worksheet...");
    setWorksheetSaveRequest({ id: requestId.current, values });
  }

  const handleWorksheetSaveResult = useCallback((completedRequestId: number, saved: boolean) => {
    if (completedRequestId !== requestId.current) return;
    setWorksheetStatus(saved
      ? `${worksheetSaveSubject} saved in the browser-local worksheet. Texas Water Sources did not validate the identifier or the mapped lead.`
      : `${worksheetSaveSubject} was added to the visible worksheet, but browser storage is unavailable. It has not been validated.`);
  }, [worksheetSaveSubject]);

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

  function saveManualWrId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = manualWrId.trim();
    if (!value) return;
    queueWorksheetSave({ "authorization-identifier": value }, "WR_ID as entered");
  }

  const surfaceTask = lookup.report?.research_tasks.find((task) => /surface.*water|water.*right/i.test(task.source_id));
  const sourceUnavailable = surfaceTask?.status === "source_temporarily_unavailable";
  const surfaceSummary = lookup.report?.quick_summary.surface_water_records;

  return <section className="water-rights-companion" aria-labelledby="water-rights-companion-heading" aria-busy={lookup.busy}>
    <div className="wrap water-rights-companion-inner">
      {lookup.phase !== "snapshot" ? <header className="water-rights-companion-heading">
        <div><p className="eyebrow">Address companion</p><h2 id="water-rights-companion-heading">Find mapped surface-water record leads</h2></div>
        <p>This companion checks the existing managed snapshot, then sends you to the official TCEQ Water Rights Viewer for the authoritative map and record pathway.</p>
      </header> : null}

      {!lookup.apiAvailable ? <div className="water-rights-unavailable" role="status" aria-live="polite">
        <strong>The surface-water companion is not connected right now.</strong>
        <p>The official viewer, manual WR_ID workflow, browser-local worksheet, and operational guide remain available.</p>
      </div> : <>
        {lookup.phase !== "snapshot" ? <form className="water-rights-address-form" onSubmit={submitAddress} aria-describedby="water-rights-lookup-status">
          <div className="water-rights-address-fields">
            <label><span>Texas property address</span><input name="water-rights-address" autoComplete="street-address" minLength={5} maxLength={200} required value={address} onChange={(event) => setAddress(event.target.value)} disabled={lookup.busy} /></label>
            <label><span>County hint (optional)</span><input name="water-rights-county" autoComplete="address-level2" minLength={2} maxLength={80} value={county} onChange={(event) => setCounty(event.target.value)} disabled={lookup.busy} /></label>
          </div>
          <label className="water-rights-acknowledgment"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} disabled={lookup.busy} /><span>I understand the address is an orientation point, not a surveyed boundary, and that a nearby mapped record does not establish ownership or transfer.</span></label>
          <button className="button primary" type="submit" disabled={lookup.busy || !acknowledged}>{lookup.busy && lookup.phase === "address" ? "Searching possible addresses..." : "Search mapped water-right leads"}</button>
        </form> : null}

        <p id="water-rights-lookup-status" className={`water-rights-status ${lookup.messageTone === "error" ? "is-error" : ""}`} role={lookup.messageTone === "error" ? "alert" : "status"} aria-live={lookup.messageTone === "error" ? "assertive" : "polite"}>{lookup.message}</p>

        {lookup.phase === "candidates" && lookup.candidates.length > 0 ? <section className="water-rights-candidates" aria-labelledby="water-rights-candidates-heading">
          <h3 id="water-rights-candidates-heading">Confirm the research location</h3>
          <fieldset><legend>Possible addresses</legend>{lookup.candidates.map((candidate) => <label key={candidate.candidate_id} className={selectedId === candidate.candidate_id ? "selected" : ""}><input type="radio" name="water-rights-candidate" value={candidate.candidate_id} checked={selectedId === candidate.candidate_id} onChange={(event) => setSelectedId(event.target.value)} disabled={lookup.busy} /><span><strong>{candidate.address_label}</strong><small>{candidate.county}</small></span></label>)}</fieldset>
          <button className="button primary" type="button" onClick={() => lookup.confirmCandidate(selectedId)} disabled={lookup.busy || !selectedId}>{lookup.busy ? "Checking surface-water records..." : "Confirm address and review mapped leads"}</button>
        </section> : null}

        {lookup.phase === "snapshot" && lookup.report ? <article className="water-rights-results" aria-labelledby="water-rights-results-heading">
          <header><div><p className="eyebrow">Surface-water companion result</p><h2 id="water-rights-results-heading" ref={resultsHeadingRef} tabIndex={-1}>{lookup.report.property.address_label}</h2><p>{lookup.report.property.county}, Texas · Sources checked through <time dateTime={lookup.report.property.data_checked_through}>{formatDate(lookup.report.property.data_checked_through)}</time></p></div><button className="button quiet" type="button" onClick={startOver}>Search another address</button></header>
          <div className="water-rights-boundary"><strong>Treat every point as a lead.</strong><p>A map point does not prove that a right belongs to the property or establish current ownership, validity, priority, transferability, or permitted use. Mapped locations are not survey-grade property boundaries.</p></div>
          <section className="water-rights-source" aria-labelledby="water-rights-source-heading">
            <div className="water-rights-source-heading"><div><p className="eyebrow">Mapped leads only</p><h3 id="water-rights-source-heading">Surface-water WR_ID groups</h3></div>{surfaceSummary ? <p><strong>{surfaceSummary.total}</strong> mapped source {surfaceSummary.total === 1 ? "record" : "records"} · <strong>{groups.length}</strong> WR_ID {groups.length === 1 ? "group" : "groups"}</p> : null}</div>
            <p className="water-rights-source-summary">Repeated mapped records can share a WR_ID. Grouping helps preserve point types without converting the group into a property-right conclusion.</p>
            {sourceUnavailable ? <div className="water-rights-source-state" role="status"><strong>The surface-water source was temporarily unavailable.</strong><p>{surfaceTask?.what_was_found} Use the official viewer and preserve the unavailable status rather than reporting that no right exists.</p></div>
              : groups.length === 0 ? <div className="water-rights-source-state" role="status"><strong>No mapped surface-water record leads were returned for this research location.</strong><p>A no-result response does not prove that no right, authorization, filing, exemption, or historical record exists. Continue in the official viewer and document the search.</p></div>
                : <div className="water-rights-lead-grid">{groups.map((group) => <LeadCard key={group.wrId} group={group} onSave={queueWorksheetSave} />)}</div>}
          </section>
        </article> : null}
      </>}

      <section className="water-rights-manual" aria-labelledby="water-rights-manual-heading">
        <div><p className="eyebrow">Already have a WR_ID?</p><h3 id="water-rights-manual-heading">Preserve it without claiming validation</h3><p>Enter the identifier exactly as shown in your source, save it in the browser-local worksheet, then search that exact ID in the official viewer. This field is not sent to analytics.</p></div>
        <form onSubmit={saveManualWrId}><label htmlFor="manual-wr-id">WR_ID as displayed</label><input id="manual-wr-id" value={manualWrId} onChange={(event) => setManualWrId(event.target.value)} maxLength={120} aria-describedby="manual-wr-id-help" /><p id="manual-wr-id-help">Saving records the text locally; it does not check whether the identifier is valid or connected to a property.</p><button className="button quiet" type="submit" disabled={!manualWrId.trim()}>Save WR_ID in this browser</button></form>
      </section>

      <div className="water-rights-worksheet-status" role="status" aria-live="polite"><strong>{worksheetStatus}</strong>{worksheetStatus ? <a href="#surface-water-candidate-heading">Review the browser-local worksheet</a> : null}</div>

      <NextActions />

      <section className="water-rights-worksheet-shell" aria-labelledby="water-rights-preserve-heading">
        <header><p className="eyebrow">Companion worksheet</p><h2 id="water-rights-preserve-heading">Preserve what the official record still needs to establish</h2><p>Use the existing surface-water worksheet to retain the WR_ID, authorization or type number, mapped point type, basin, purpose, recorded holder exactly as displayed and dated, linked documents, place-of-use information, diversion information, and unresolved comparison questions.</p></header>
        <SurfaceCandidateWorksheet externalSaveRequest={worksheetSaveRequest} onExternalSaveResult={handleWorksheetSaveResult} />
      </section>
    </div>
  </section>;
}
