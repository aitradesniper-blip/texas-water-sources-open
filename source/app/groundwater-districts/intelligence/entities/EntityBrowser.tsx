"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDataLink, normalizeLookup, type MentionIndex, type Mention } from "@/lib/entity-mentions";
import {SourceEvidence} from "../MeetingEvidence";
import { locationLabel, readable, displayValue } from "@/lib/meeting-intelligence";

function Values({mention:m}:{mention:Mention}) {
  if(!m.values)return null;
  if(Array.isArray(m.values.columns)&&Array.isArray(m.values.cells))return <><p className="mi-label">Structured row · {String(m.values.table_name)}</p><dl className="mi-fields">{m.values.columns.map((c,i)=><div key={i}><dt>{readable(String(c))}</dt><dd>{format((m.values!.cells as unknown[])[i])}</dd></div>)}</dl><p>{String(m.values.notes||"")}</p></>;
  return <dl className="mi-fields">{Object.entries(m.values).filter(([k])=>k!=="date_context").map(([k,v])=><div key={k}><dt>{readable(k)}</dt><dd>{format(v)}</dd></div>)}</dl>;
}
function format(v:unknown):string {return v===null?"Not stated":typeof v==="number"?v.toLocaleString("en-US",{maximumFractionDigits:12}):typeof v==="string"?displayValue(v):JSON.stringify(v);}

export default function EntityBrowser() {
  const [data,setData]=useState<MentionIndex|null>(null),[error,setError]=useState("");
  const [filters,setFilters]=useState({q:"",district:"",type:""});
  useEffect(()=>{
    const initialWindow=window as Window & {__twsInitialLocationSearch?:string};
    const initialQuery=window.location.search||initialWindow.__twsInitialLocationSearch||"";
    delete initialWindow.__twsInitialLocationSearch;
    if(initialQuery)window.history.replaceState(null,"",window.location.pathname+initialQuery+window.location.hash);
    const read=()=>{const p=new URLSearchParams(window.location.search);setFilters({q:p.get("q")||"",district:p.get("district")||"",type:p.get("type")||""});};
    read();window.addEventListener("popstate",read);
    const controller=new AbortController();
    fetch('/data/water-watch/v1/entity-mentions.json',{signal:controller.signal}).then(res=>{if(!res.ok)throw Error("Could not load the mention index.");return res.json();}).then(setData).catch(e=>{if(e.name!=="AbortError")setError(e.message);});
    return()=>{controller.abort();window.removeEventListener("popstate",read);};
  },[]);
  const districts=useMemo(()=>[...new Map(data?.occurrences.map(o=>[o.issuing_district_id,o.issuing_district_name])||[])].sort((a,b)=>a[1].localeCompare(b[1])),[data]);
  const types=useMemo(()=>[...new Set(data?.groups.map(g=>g.type)||[])].sort(),[data]);
  const results=useMemo(()=>{
    if(!data)return [];
    const words=normalizeLookup(filters.q).split(' ').filter(Boolean);
    const occurrences=new Map(data.occurrences.map(o=>[o.id,o]));
    return data.groups.filter(g=>(!filters.type||g.type===filters.type)&&words.every(w=>g.normalized_lookup.includes(w))).map(g=>({group:g,items:g.occurrence_ids.map(id=>occurrences.get(id)!).filter(o=>!filters.district||o.issuing_district_id===filters.district)})).filter(g=>g.items.length).sort((a,b)=>b.group.record_count-a.group.record_count||a.group.label.localeCompare(b.group.label));
  },[data,filters]);
  function update(next:typeof filters){setFilters(next);const p=new URLSearchParams();Object.entries(next).forEach(([k,v])=>{if(v)p.set(k,v);});window.history.replaceState(null,"",window.location.pathname+(p.size?'?'+p:''));}
  const shown=results.slice(0,60);
  return <section className="mi-browser" aria-labelledby="entity-search-heading"><h2 id="entity-search-heading">Find a source-linked mention</h2>
    <div className="mi-filters" role="search" aria-label="Search entities and timelines"><label className="mi-search">Name or identifier<input type="search" placeholder="Aqua Texas, BLF, The Retreat, PGCD-000838 or MWCZ-1B" value={filters.q} onChange={e=>update({...filters,q:e.target.value})}/></label><label>Issuing district<select value={filters.district} onChange={e=>update({...filters,district:e.target.value})}><option value="">All issuing districts</option>{districts.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>Mention type<select value={filters.type} onChange={e=>update({...filters,type:e.target.value})}><option value="">All mention types</option>{types.map(t=><option key={t} value={t}>{readable(t)}</option>)}</select></label><button className="button secondary" onClick={()=>update({q:"",district:"",type:""})}>Clear mention filters</button></div>
    {error?<p role="alert">{error} <a href="/data/water-watch/v1/entity-mentions.json">Open the JSON download</a>.</p>:!data?<p role="status">Loading the source-linked mention index…</p>:<p role="status">{results.length} lookup groups · {new Set(results.flatMap(g=>g.items.map(o=>o.record_id))).size} source documents. {results.length>60?'Showing the first 60 groups; narrow the search to see more.':''}</p>}
    {data && !results.length?<p>No mentions match these filters.</p>:null}
    <div className="mi-entity-groups">{shown.map(({group:g,items})=><details className="mi-source mi-entity-group" key={`${g.id}:${filters.q}`} open={Boolean(filters.q)&&results.length<=12}><summary><strong>{g.label}</strong><span>{readable(g.type)} · {new Set(items.map(o=>o.record_id)).size} source documents · {items.length} mentions</span></summary><p className="mi-boundary">Search grouping only. Matching labels do not establish the same legal entity, permit or well. {g.issuer_district_id?'This identifier group is scoped to its issuing district.':''}</p><p className="mi-label">Earliest in this collection: {g.earliest_in_collection||'No resolved date'}. No claim of first appearance elsewhere.</p>
      <ol className="mi-timeline">{items.map(m=><li key={m.id} id={m.id}><div className="mi-timeline-heading"><strong>{m.date||(m.date_role.includes('unresolved')?'Date unresolved':'No single item event date supplied')}</strong><span>{m.date_role==='explicit_section_date'?'Supported section date':m.date_role==='unresolved_section_date'?'Conflicting section date':m.date_role==='unresolved_document_date'?'Unresolved document context':m.date_role==='explicit_item_date'?'Explicit item date':m.date_role==='scheduled_date'?'Scheduled / document context date':m.date_role==='recorded_meeting_date'?'Recorded meeting context date':readable(m.date_role)} · {m.document_type}</span></div><h3>{m.source_issuer||m.issuing_district_name}</h3>{m.district_role?<p className="mi-label">Research district: {m.issuing_district_name} · {m.district_role}</p>:null}<p><strong>{m.as_stated}</strong> · {readable(m.stated_role)}</p>{m.stage?<p className="mi-stage">{readable(m.stage)}</p>:null}<p className="mi-label">{m.date_note}</p>
        {m.evidence_scope==='table_level' ? <p className="mi-label">The date above retains its stated document, report or row role; it is not necessarily a measurement day. Table time labels (as supplied): {Array.isArray(m.values?.columns) ? m.values.columns.filter(c=>/\b[12][0-9]{3}\b/.test(String(c).replaceAll('_',' '))).map(c=>readable(String(c))).join('; ') || 'No time period stated in the column labels.' : 'See the source table.'}</p> : null}
        <>{m.date_candidates.length ? <p className="mi-warning">Source-stated alternatives (not resolved dates): {m.date_candidates.map(c=>`${c.date||'Exact date not stated'} — ${c.context} (${locationLabel(c)})`).join("; ")}</p> : null}</>
        {m.referenced_dates?.length ? <p className="mi-label">Referenced dates (context only): {m.referenced_dates.map(c=>`${c.date||'Exact date not stated'} — ${readable(c.role)}: ${c.qualification} (${locationLabel(c)})`).join("; ")}</p> : null}
        <Values mention={m}/><p className="mi-label">{m.evidence_scope==='table_level'?'Table-level evidence; no more precise row-page assignment supplied.':'Evidence for this occurrence only.'}</p>
        <div className="mi-links"><a href={localDataLink(m.object_url)}>Open source-linked item →</a><a href={localDataLink(m.record_json_url)}>Record JSON</a><SourceEvidence evidence={[...new Map(m.evidence.map(e=>[e.native_locator?.block_id||e.page,e])).values()]}/></div>
      </li>)}</ol>
    </details>)}</div>
    <noscript><p>The searchable timeline needs JavaScript. The complete <a href="/data/water-watch/v1/entity-mentions.json">mention index</a>, <a href="/data/water-watch/v1/research-leads.json">candidate leads</a> and <Link href="/groundwater-districts/data">static source-document pages</Link> remain accessible without it.</p></noscript>
  </section>;
}
