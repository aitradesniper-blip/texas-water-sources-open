"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { MeetingBrowseIndex } from "@/lib/meeting-browse";
import MeetingIntelligenceBrowser from "./MeetingIntelligenceBrowser";
import MatterDiscovery from "./MatterDiscovery";
import matterIndex from "@/public/data/water-watch/v1/matters/index.json";
import {
  DISTRICT_INTELLIGENCE_SUMMARIES,
  formatGcdSourceDate,
  GCD_WATER_WATCH_ACTIVITY_GROUPS,
  GCD_WATER_WATCH_ACTIVITY_LABELS,
  getGcdSourceDate,
  getGcdWaterWatchActivityGroup,
  type GcdIntelligenceRecord,
} from "@/lib/gcd-intelligence";
import type { GcdPublicBoardAction } from "@/lib/gcd-public-events";
import {
  trackWaterWatchEngagement,
  trackWaterWatchEvent,
  trackWaterWatchPageView,
} from "@/lib/analytics-events";

type Props = {
  records: GcdIntelligenceRecord[];
  events: GcdPublicBoardAction[];
  meetingBrowse: MeetingBrowseIndex;
  factContext: {fact_id:string;context:string;official_source_url:string;physical_page:number}[];
};

type IntelligenceView = "facts" | "events" | "meetings";
type InitialSearchWindow = Window & { __twsInitialLocationSearch?: string };

const COASTAL_BEND_DISTRICT_NAME = "Coastal Bend Groundwater Conservation District";
const NULL_OUTCOME_LABEL = "Outcome not specified in this reviewed event record";

const factLabels: Record<string, string> = {
  applicant_name: "Applicant or permit activity",
  authorized_requested_recommended_or_limit_quantity: "Authorization, request, recommendation, or limit quantity",
  compliance_violation: "Compliance violation",
  desired_future_condition_drawdown: "Desired future condition drawdown",
  enforcement_action: "Enforcement action",
  litigation_reference: "Litigation reference",
  pumping_or_production_quantity: "Pumping or production quantity",
  regional_aquifer_drawdown_reference: "Regional aquifer drawdown",
  water_level_observation: "Water-level observation",
  well_identifier: "Well identifier",
};

const evidenceLabels: Record<string, string> = {
  native_text: "Native text",
  ocr: "Machine OCR",
  visual_review: "Visual review supported",
};

const districtPaths = new Map(DISTRICT_INTELLIGENCE_SUMMARIES.map((district) => [
  district.district_id,
  district.site_detail_path ?? `/groundwater-districts#district-${district.district_slug}`,
]));

function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function IntelligenceBrowser({ records, events, meetingBrowse, factContext }: Props) {
  const [view, setView] = useState<IntelligenceView>("facts");
  const [district, setDistrict] = useState("all");
  const [activity, setActivity] = useState("all");
  const [evidence, setEvidence] = useState("all");
  const [caveat, setCaveat] = useState("all");
  const initialQueryApplied = useRef(false);
  const factDistricts = useMemo(() => Array.from(new Map(records.map((record) => [record.district_id, record.district_name])).entries())
    .sort(([, leftName], [, rightName]) => leftName.localeCompare(rightName)), [records]);
  const eventDistricts = useMemo(() => Array.from(new Map(events.map((event) => [event.district_id, COASTAL_BEND_DISTRICT_NAME])).entries()), [events]);
  const activeDistricts = view === "events" ? eventDistricts : factDistricts;
  const orderedRecords = useMemo(() => [...records].sort((left, right) => {
    const leftDate = getGcdSourceDate(left.official_source_url) ?? "";
    const rightDate = getGcdSourceDate(right.official_source_url) ?? "";
    return rightDate.localeCompare(leftDate);
  }), [records]);
  const orderedEvents = useMemo(() => [...events].sort((left, right) => right.meeting_date.localeCompare(left.meeting_date)), [events]);
  const filteredFacts = useMemo(() => orderedRecords.filter((record) => (
    (district === "all" || record.district_id === district)
    && (activity === "all" || getGcdWaterWatchActivityGroup(record.product_export_fact_type) === activity)
    && (evidence === "all" || record.evidence_method === evidence)
    && (caveat === "all" || (caveat === "yes") === record.source_context_caveat)
  )), [orderedRecords, district, activity, evidence, caveat]);
  const filteredEvents = useMemo(() => orderedEvents.filter((event) => district === "all" || event.district_id === district), [orderedEvents, district]);

  useEffect(() => {
    trackWaterWatchPageView();
    if (initialQueryApplied.current) return;
    initialQueryApplied.current = true;
    const pageWindow = window as InitialSearchWindow;
    const query = window.location.search || pageWindow.__twsInitialLocationSearch || "";
    const params = new URLSearchParams(query);
    const requestedView = params.get("view") === "meetings" && meetingBrowse.record_count ? "meetings" : params.get("view") === "events" ? "events" : "facts";
    const requestedDistrict = params.get("district");
    setView(requestedView);
    const availableDistricts = requestedView === "events" ? eventDistricts : factDistricts;
    if (requestedDistrict && availableDistricts.some(([id]) => id === requestedDistrict)) setDistrict(requestedDistrict);
    if (requestedView === "meetings") window.history.replaceState(null, "", window.location.pathname + query + window.location.hash);
    delete pageWindow.__twsInitialLocationSearch;
  }, [eventDistricts, factDistricts, meetingBrowse.record_count]);

  useEffect(() => {
    const onPop = () => {
      const v = new URLSearchParams(window.location.search).get("view");
      setView(v === "meetings" && meetingBrowse.record_count ? "meetings" : v === "events" ? "events" : "facts");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [meetingBrowse.record_count]);

  function updateView(nextView: IntelligenceView) {
    setView(nextView);
    const params = new URLSearchParams(window.location.search);
    params.set("view", nextView);
    window.history.pushState(null, "", `${window.location.pathname}?${params}#latest-activity`);
    const availableDistricts = nextView === "events" ? eventDistricts : factDistricts;
    if (district !== "all" && !availableDistricts.some(([id]) => id === district)) setDistrict("all");
    trackWaterWatchEngagement();
    trackWaterWatchEvent("water_watch_layer_changed");
  }

  function updateDistrict(nextDistrict: string) {
    setDistrict(nextDistrict);
    trackWaterWatchEngagement();
    trackWaterWatchEvent("water_watch_district_filter_used");
  }

  function updateActivity(nextActivity: string) {
    setActivity(nextActivity);
    trackWaterWatchEngagement();
    trackWaterWatchEvent("water_watch_activity_filter_used");
  }

  const activeCount = view === "events" ? filteredEvents.length : filteredFacts.length;

  return <div className="gcd-browser">
    <section className="gcd-layer-panel" aria-labelledby="gcd-layer-heading">
      <div><p className="eyebrow">Choose an evidence layer</p><h2 id="gcd-layer-heading">{meetingBrowse.record_count ? "Choose a Water Watch view" : "Facts and board actions remain separate"}</h2><p>{meetingBrowse.record_count ? "Reviewed facts, reviewed board actions and source-linked meeting intelligence have separate counts and review states." : "Reviewed facts retain the existing ten-type taxonomy. Board actions are distinct meeting-record summaries and are not added to the fact count."}</p></div>
      <div className="gcd-layer-switch" role="group" aria-label="Water Watch evidence layer">
        <button type="button" aria-pressed={view === "facts"} onClick={() => updateView("facts")}><span>Facts</span><strong>{records.length}</strong></button>
        <button type="button" aria-pressed={view === "events"} onClick={() => updateView("events")}><span>Board actions</span><strong>{events.length}</strong></button>
        {meetingBrowse.record_count ? <button type="button" aria-pressed={view === "meetings"} onClick={() => updateView("meetings")}><span>Meeting intelligence</span><strong>{meetingBrowse.record_count}</strong></button> : null}
      </div>
    </section>

    <MatterDiscovery/>
    {view === "meetings" ? <MeetingIntelligenceBrowser browse={meetingBrowse} /> : null}
    <section className="gcd-filter-panel" aria-labelledby="gcd-filter-heading" hidden={view === "meetings"}>
      <div><p className="eyebrow">Latest activity</p><h2 id="gcd-filter-heading">{view === "events" ? "Browse reviewed board actions" : "Browse reviewed district facts"}</h2><p>{view === "events" ? "This release contains board-action summaries for Coastal Bend only. Open the official source for the full meeting-record context." : "Start with a district or plain-language activity group. Day-specific source dates are drawn only from clearly dated official filenames."}</p></div>
      <div className="gcd-filter-controls">
        <div className={`gcd-filters ${view === "events" ? "single" : ""}`}>
          <label><span>District</span><select value={district} onChange={(event) => updateDistrict(event.target.value)}><option value="all">{view === "events" ? "All board-action districts" : "All districts covered"}</option>{activeDistricts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
          {view === "facts" ? <label><span>Activity</span><select value={activity} onChange={(event) => updateActivity(event.target.value)}><option value="all">All activity</option>{GCD_WATER_WATCH_ACTIVITY_GROUPS.map((group) => <option key={group} value={group}>{GCD_WATER_WATCH_ACTIVITY_LABELS[group]}</option>)}</select></label> : null}
        </div>
        {view === "facts" ? <details className="gcd-review-filters"><summary>Show review-detail filters</summary><div className="gcd-filters">
          <label><span>Evidence method</span><select value={evidence} onChange={(event) => { setEvidence(event.target.value); trackWaterWatchEngagement(); }}><option value="all">All evidence methods</option><option value="native_text">Native text</option><option value="ocr">Machine OCR</option><option value="visual_review">Visual review supported</option></select></label>
          <label><span>Source-context caveat</span><select value={caveat} onChange={(event) => { setCaveat(event.target.value); trackWaterWatchEngagement(); }}><option value="all">All records</option><option value="yes">Caveat recorded</option><option value="no">No caveat recorded</option></select></label>
        </div></details> : null}
      </div>
      <p className="gcd-filter-count" aria-live="polite"><strong>{activeCount}</strong> {view === "events" ? `board ${activeCount === 1 ? "action" : "actions"}` : `reviewed ${activeCount === 1 ? "fact" : "facts"}`} shown</p>
    </section>

    <div className="gcd-record-grid" hidden={view !== "facts"}>
      {filteredFacts.map((record) => {
        const remapped = record.attribution_text.startsWith("Reviewed related semantics");
        const sourceDate = getGcdSourceDate(record.official_source_url);
        const districtPath = districtPaths.get(record.district_id);
        const activityGroup = getGcdWaterWatchActivityGroup(record.product_export_fact_type);
        const matter= matterIndex.matters.find(m=>m.fact_links.some(f=>f.fact_id===record.public_record_id));
        const context= matter?.fact_links.find(f=>f.fact_id===record.public_record_id);
        const sourceContext=factContext.find(c=>c.fact_id===record.public_record_id);
        return <article className="gcd-record-card" id={record.public_record_id} key={record.public_record_id} data-evidence={record.evidence_method} data-source-context-caveat={record.source_context_caveat ? "true" : "false"} data-semantics={remapped ? "remapped" : "original"} data-activity={activityGroup}>
          <p className="gcd-record-category">{GCD_WATER_WATCH_ACTIVITY_LABELS[activityGroup]}</p>
          <h3>{factLabels[record.product_export_fact_type]}</h3>
          <p className="gcd-record-value">{record.display_value}</p>
          {matter&&context?<aside className="mi-warning" data-matter-fact={record.public_record_id}><p>{context.interpretation}</p><Link href={new URL(matter.canonical_url).pathname+'#'+context.event_id}>Source-linked matter chronology</Link><p>{context.basis}</p></aside>:null}
          {sourceContext ? <aside className="mi-warning" data-source-context={record.public_record_id}><strong>Verified source context</strong><p>{sourceContext.context}</p><a href={`${sourceContext.official_source_url}#page=${sourceContext.physical_page}`}>Official minutes · physical page {sourceContext.physical_page}</a></aside> : null}
          <div className="gcd-record-context">
            <p>{districtPath ? <Link href={districtPath}>{record.district_name}</Link> : record.district_name}</p>
            <p>{sourceDate ? <>Date in official filename <time dateTime={sourceDate}>{formatGcdSourceDate(sourceDate)}</time> · </> : "Official source · "}Page {record.source_page}</p>
          </div>
          <div className="gcd-record-interpretation"><span>Reviewed interpretation</span><p>{record.what_it_may_indicate}</p></div>
          <div className="gcd-record-badges"><span className={remapped ? "remapped" : "original"}>{remapped ? "Related semantics" : "Original semantics"}</span><span>{evidenceLabels[record.evidence_method]}</span>{record.source_context_caveat ? <span className="caveat">Context check needed</span> : null}</div>
          {record.source_context_caveat ? <p className="gcd-record-caveat">{record.source_context_caveat_label}</p> : null}
          <p className="gcd-record-boundary">District-level lead · not property evidence</p>
          <a href={record.official_source_url} target="_blank" rel="noreferrer" onClick={() => {
            trackWaterWatchEngagement();
            trackWaterWatchEvent("water_watch_official_source_opened");
          }}>Open the official district record <span aria-hidden="true">↗</span></a>
        </article>;
      })}
    </div>

    <div className="gcd-event-grid" hidden={view !== "events"}>
      {filteredEvents.map((event) => <article className="gcd-event-card" key={event.public_event_id} data-outcome={event.event_outcome_summary === null ? "unspecified" : "stated"}>
        <p className="gcd-record-category">Board action</p>
        <h3>Meeting record dated <time dateTime={event.meeting_date}>{formatEventDate(event.meeting_date)}</time></h3>
        <p className="gcd-event-action">{event.event_action_summary}</p>
        <div className="gcd-record-context"><p>{COASTAL_BEND_DISTRICT_NAME}</p><p>Official source · Page {event.source_page}</p></div>
        <div className="gcd-event-detail outcome"><span>Outcome</span><p className={event.event_outcome_summary === null ? "gcd-event-outcome-unspecified" : "gcd-event-outcome"}>{event.event_outcome_summary ?? NULL_OUTCOME_LABEL}</p></div>
        <div className="gcd-event-detail"><span>Source-context caveat</span><p className="gcd-event-source-caveat">{event.source_context_caveat}</p></div>
        <div className="gcd-event-detail"><span>What it may indicate</span><p className="gcd-event-may-indicate">{event.what_it_may_indicate}</p></div>
        <div className="gcd-event-detail boundary"><span>What it does not prove</span><p className="gcd-event-does-not-prove">{event.what_it_does_not_prove}</p></div>
        <a href={event.official_source_url} target="_blank" rel="noreferrer" onClick={() => {
          trackWaterWatchEngagement();
          trackWaterWatchEvent("water_watch_official_source_opened");
        }}>Open the official district record at page {event.source_page} <span aria-hidden="true">↗</span></a>
      </article>)}
    </div>

    {view === "facts" && !filteredFacts.length ? <p className="gcd-no-results">No reviewed facts match all selected filters. Clear one or more filters to broaden the view.</p> : null}
    {view === "events" && !filteredEvents.length ? <p className="gcd-no-results">No board actions match the selected district. This release contains board actions for Coastal Bend only.</p> : null}
  </div>;
}
