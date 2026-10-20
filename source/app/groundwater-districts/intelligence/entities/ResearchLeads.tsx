"use client";

import Link from "next/link";
import { useState } from "react";
import { localDataLink, normalizeLookup, type ResearchLead, type LeadResolution } from "@/lib/entity-mentions";
import {SourceEvidence} from "../MeetingEvidence";

function RecordReference({resolution,label}:{resolution:LeadResolution;label:string}) {
  return resolution.status === "resolved" ? <Link href={localDataLink(resolution.record_url)}>{label}</Link> : <span>{label} — Unresolved reference: {resolution.reason}</span>;
}

export default function ResearchLeads({leads}:{leads:ResearchLead[]}) {
  const [query,setQuery]=useState("");
  const words=normalizeLookup(query).split(' ').filter(Boolean);
  const shown=leads.filter(l=>words.every(w=>normalizeLookup([l.label,l.reason_to_investigate,l.why_investigate,...l.occurrences.flatMap(o=>[o.statement,...o.names_or_identifiers])].filter(Boolean).join(' ')).includes(w)));
  return <section className="mi-source"><h2>Candidate research leads</h2>
    <p>{leads.length} supplied leads suggest further investigation. Resolved links are navigation, not independent corroboration or confirmed identity. Each lead retains its original matching limitations.</p>
    <label className="mi-search">Search candidate research leads<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Lead label, source statement or supplied identifier"/></label>
    <p role="status">{shown.length} candidate leads shown</p>
    {shown.map(l=><details key={l.id} id={l.id} className="mi-lead"><summary>{l.label}</summary>
      <p className="mi-stage">Possible linkage only</p><p>{l.reason_to_investigate||l.why_investigate}</p><p>{l.caution||l.identity_uncertainty}</p>
      {l.prior_corpus_matching_performed===false?<p>No prior-corpus matching was performed for this lead.</p>:null}
      {l.next_verification?<p><strong>Next verification:</strong> {l.next_verification}</p>:null}
      <p><a href={`?q=${encodeURIComponent(l.occurrences[0]?.names_or_identifiers[0]||l.label)}`}>Find these mentions</a></p>
      <ul>{l.occurrences.map((o,i)=><li key={`${o.record_id}:${i}`}>
        <RecordReference resolution={o.resolution} label={`${(o.district_id==='live_oak_uwcd'?null:o.supported_section_date)||o.meeting_date||'No single document date'} · ${o.district_id.replaceAll('_',' ')}`}/>{o.names_or_identifiers.length?` — ${o.names_or_identifiers.join('; ')}`:null}
        {o.names_or_identifiers_status==='not_supplied'?<p className="mi-label">Names were not supplied as separate search labels; see the original statement below.</p>:null}
        <p>{o.statement}</p>{o.date_note?<p>{o.date_note}</p>:null}{o.supported_section_date?<p>{o.district_id==='live_oak_uwcd'?"Prospective scheduling-meeting reference":"Supported section date"}: {o.supported_section_date}. This does not supply a single whole-document date or establish a held hearing.</p>:null}
        <div className="mi-links"><SourceEvidence evidence={o.evidence}/></div>
      </li>)}</ul>
      {l.prior_corpus_candidates.length?<><h3>Prior-corpus candidates</h3><p>Earlier extraction-index matches only; no independent corroboration.</p><ul>{l.prior_corpus_candidates.map(o=><li key={o.record_id}>
        <RecordReference resolution={o.resolution} label={`${o.meeting_date||'Document date unresolved'} · ${o.district_id.replaceAll('_',' ')}`}/><ul>{o.candidate_entities.map((e,i)=><li key={i}>{e.resolution.status==='resolved'?<a href={localDataLink(e.resolution.object_url)}>{e.name_as_stated}</a>:<span>{e.name_as_stated} — Unresolved reference: {e.resolution.reason}</span>}</li>)}</ul>
      </li>)}</ul></>:null}
    </details>)}
  </section>;
}
