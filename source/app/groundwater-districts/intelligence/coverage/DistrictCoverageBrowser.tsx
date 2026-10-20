"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import status from "@/public/data/water-watch/v1/coverage-status.json";

const districts = [...status.districts].sort((a,b)=>a.district_name.localeCompare(b.district_name));
const roleLabels: Record<string,string> = {
  recorded_minutes:"Recorded minutes",scheduled_agenda_or_notice:"Scheduled agenda or hearing notice",
  historical_packet:"Historical submission packet",other_recorded_district_record:"Other recorded meeting record",
  unresolved_or_compilation:"Unresolved date or multi-meeting compilation",other_nonmeeting_or_context:"Court, map or other source context",
};
const local = (url:string) => new URL(url).pathname;

export default function DistrictCoverageBrowser() {
  const [selected,setSelected]=useState("");
  const [invalid,setInvalid]=useState(false);
  useEffect(()=>{
    const initialWindow=window as Window & {__twsInitialLocationSearch?:string};
    const initialQuery=window.location.search||initialWindow.__twsInitialLocationSearch||"";
    delete initialWindow.__twsInitialLocationSearch;
    if(initialQuery)window.history.replaceState(null,"",window.location.pathname+initialQuery+window.location.hash);
    const readSelection=()=>{
      const id=new URLSearchParams(window.location.search).get("district");
      setSelected(id&&districts.some(d=>d.district_id===id)?id:"");
      setInvalid(Boolean(id&&!districts.some(d=>d.district_id===id)));
    };
    readSelection();window.addEventListener("popstate",readSelection);
    return ()=>window.removeEventListener("popstate",readSelection);
  },[]);
  const district=districts.find(d=>d.district_id===selected);
  return <section className="mi-source" id="district-coverage"><h2>Choose a district</h2>
    <p>See the source roles and dates actually represented here. The selector does not download detailed statewide search or entity mentions.</p>
    <label className="coverage-selector">District <select aria-label="District coverage" value={selected} onChange={event=>{
      const id=event.target.value;setSelected(id);setInvalid(false);
      const params=new URLSearchParams(window.location.search);if(id)params.set("district",id);else params.delete("district");
      window.history.pushState(null,"",window.location.pathname+(params.size?`?${params}`:"")+"#district-coverage");
    }}><option value="">Select a district</option>{districts.map(d=><option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}</select></label>
    {invalid?<p role="status">Unknown district selection. Choose an identity from the current directory; no coverage claim was inferred from the URL.</p>:null}
    {!district?<p>Select a district to inspect this collection’s evidence and any published manual check history.</p>:<div aria-live="polite">
      <h3>{district.district_name}</h3>
      <p><strong>{district.source_count} complete source {district.source_count===1?"document":"documents"}</strong> in this collection ({district.media.pdf} PDF, {district.media.native} native). Separately: {district.layers.facts} Facts and {district.layers.board_actions} Board Actions. These layers count different objects, not unique government events.</p>
      <ul>{Object.entries(district.source_roles).filter(([,count])=>count>0).map(([role,count])=><li key={role}>{roleLabels[role]||role}: {count}</li>)}</ul>
      <p>Dates across source roles: {district.dated_source_extremes.earliest||"unknown"} to {district.dated_source_extremes.latest||"unknown"} among dated documents. These are two observed extremes, <strong>not continuous coverage</strong>. {district.without_single_document_date} lack a single document date ({district.unresolved_document_dates} unresolved, {district.multi_meeting_compilations} compilation).</p>
      <p>Latest recorded district minutes in this collection: {district.latest_recorded_minutes?<Link href={local(district.latest_recorded_minutes.human_url)}>{district.latest_recorded_minutes.date} · {district.latest_recorded_minutes.document_type}</Link>:"Not established by a minutes source in this collection."}</p>
      <p>Latest scheduled agenda or hearing notice in this collection: {district.latest_scheduled_agenda_or_notice?<><Link href={local(district.latest_scheduled_agenda_or_notice.human_url)}>{district.latest_scheduled_agenda_or_notice.date} · {district.latest_scheduled_agenda_or_notice.document_type}</Link>. Scheduling does not establish a completed meeting or decision.</>:"Not established by a dated scheduled source in this collection."}</p>
      {district.historical_packet_records.length?<p>Historical packet context: {district.historical_packet_records.map((r,i)=><span key={r.record_id}>{i?", ":""}<Link href={local(r.human_url)}>{r.date||"date unresolved"} packet</Link></span>)}. A packet’s cited hearing/adoption date does not make it recent minutes or establish current plan status.</p>:null}
      {district.published_watch_history?<>{district.published_watch_history.map(check=><div className="mi-source" key={check.matter_id}>
        <h4>Published manual check: <Link href={`/groundwater-districts/intelligence/matters/${check.matter_id}`}>{check.matter_id}</Link></h4>
        <p><strong>{check.latest_attempt.status_label}</strong> · latest attempt <time dateTime={check.latest_attempt.finished_at}>{check.latest_attempt.finished_at}</time>. Reported status: <code>{check.latest_attempt.reported_status}</code>. Acquisition outcome ({check.latest_attempt.acquisition_outcome_basis_kind === "derived_from_run_evidence" ? "derived from retained run evidence" : "reported"}): <code>{check.latest_attempt.acquisition_outcome}</code>. {check.latest_attempt.acquisition_basis}</p>
        <p>Last successful comparable scoped check: {check.last_successful_comparison_at?<time dateTime={check.last_successful_comparison_at}>{check.last_successful_comparison_at}</time>:"Unknown / not supplied by retained receipt"}. {check.scope}</p>
        <p>At that run, response/content-version comparisons: {check.observed_content_at_run.unchanged} unchanged, {check.observed_content_at_run.new_to_local_comparison} new to local comparison, {check.observed_content_at_run.revised_at_known_url} revised at a known URL, {check.observed_content_at_run.failed_requests} terminal request failures. These are not a deduplicated document inventory. {check.interpretation}</p>
        <p>Reading state at snapshot capture: {check.reading_state.accepted_and_published} accepted and published; {check.reading_state.unread_deferred_background} separately deferred unread background sources; {check.reading_state.other_pending} other pending. Missing instruments remain distinct from this queue.</p>
        <p>Research publication: <a href={check.publication_context.release_record}>{check.publication_context.note}</a></p>
        <details><summary>Official routes in this bounded check</summary><ul>{check.official_surfaces.map(url=><li key={url}><a href={url}>{url}</a></li>)}</ul></details>
      </div>)}</>:<p><strong>No source-watch history published for this district.</strong> Unread backlog and check outcome are unknown here; this does not mean no district activity or that no source was ever checked.</p>}
      {district.matters.length?<p>Published matter: {district.matters.map((m,i)=><span key={m.matter_id}>{i?", ":""}<Link href={local(m.canonical_url)}>{m.matter_id}</Link></span>)}</p>:null}
      {district.reading_release_overlay?<p><strong>Later reading/release overlay:</strong> {district.reading_release_overlay.accepted_sources} of the historical deferred sources were separately accepted at {district.reading_release_overlay.accepted_at} and included in <a href={district.reading_release_overlay.release_record}>PR #41</a>; {district.reading_release_overlay.remaining_deferred_sources} other sources remain deferred. The watch results and six-source snapshot backlog above retain their original basis; no new check is implied.</p>:null}
      <details><summary>All {district.source_count} included source records</summary><ul>{district.records.map(r=><li key={r.record_id}><Link href={local(r.human_url)}>{r.date||"Date unresolved"} · {r.document_type}</Link> <small>({r.date_role}, {r.media_type})</small></li>)}</ul></details>
    </div>}
  </section>;
}
