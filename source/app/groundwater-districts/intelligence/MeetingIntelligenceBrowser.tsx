"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { emptyMeetingFilters, filterMeetings, meetingPath, officialPage, readable, matchingMatters, documentDateLabel, type MeetingCard, type MeetingFilters } from "@/lib/meeting-intelligence";
import { filterBrowseRecords, type MeetingBrowseCard, type MeetingBrowseIndex } from "@/lib/meeting-browse";

type ExactResult = { scope:string; records:MeetingCard[] };
const exactCache = new Map<string,Promise<MeetingCard[]>>();
const dataRoot = "/data/water-watch/v1/meetings";
const pageSize = 20;
const needsExactSearch = (filters:MeetingFilters) => Boolean(filters.q.trim() || filters.from || filters.to);

function exactScope(filters:MeetingFilters,browse:MeetingBrowseIndex):string{
  return filters.district ? `${dataRoot}/by-district/${filters.district}.${browse.content_version.slice(0,12)}.json` : `${dataRoot}/index.json`;
}

async function loadExact(scope:string,browse:MeetingBrowseIndex):Promise<MeetingCard[]>{
  let pending=exactCache.get(scope);
  if(!pending){
    pending=(async()=>{
      const response=await fetch(scope);
      if(!response.ok)throw Error(`Search data unavailable (HTTP ${response.status})`);
      const value=await response.json();
      if(!Array.isArray(value.records)||value.record_count!==value.records.length)throw Error("Incomplete meeting search data");
      const district=scope.includes("/by-district/")?scope.split("/by-district/")[1].split(".")[0]:null;
      if(district&&(value.profile!=="exact_district_search_partition"||value.content_version!==browse.content_version||value.district_id!==district))throw Error("District search data version mismatch");
      const expected=browse.records.filter(m=>!district||m.districtId===district);
      if(value.records.length!==expected.length||value.records.some((m:MeetingCard,i:number)=>m.key!==expected[i].key||m.content_version.slice(0,12)!==expected[i].version))throw Error("Meeting search data version mismatch");
      return value.records as MeetingCard[];
    })().catch(error=>{exactCache.delete(scope);throw error});
    exactCache.set(scope,pending);
  }
  return pending;
}

export default function MeetingIntelligenceBrowser({ browse }: { browse: MeetingBrowseIndex }) {
  const [filters, setFilters] = useState<MeetingFilters>(emptyMeetingFilters);
  const [visibleCount,setVisibleCount] = useState(pageSize);
  const [exact,setExact] = useState<ExactResult|null>(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const [retry,setRetry] = useState(0);

  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      setFilters(Object.fromEntries(Object.keys(emptyMeetingFilters).map(k => [k, p.get(k) || ""])) as MeetingFilters);
      setVisibleCount(pageSize);
    };
    read(); window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  const deep=needsExactSearch(filters);
  const invalidDistrict=Boolean(filters.district&&!browse.records.some(m=>m.districtId===filters.district));
  const scope=deep&&!invalidDistrict?exactScope(filters,browse):"";
  useEffect(()=>{
    if(!scope)return;
    let cancelled=false;
    setLoading(true);setError(null);
    loadExact(scope,browse).then(records=>{
      if(!cancelled){setExact({scope,records});setLoading(false);}
    }).catch(reason=>{
      if(!cancelled){setExact(null);setError(reason instanceof Error?reason.message:"Search data unavailable");setLoading(false);}
    });
    return ()=>{cancelled=true};
  },[scope,browse,retry]);

  const districts=useMemo(()=>Object.entries(browse.districts).sort((a,b)=>a[1].localeCompare(b[1])),[browse]);
  const topics=useMemo(()=>[...new Set(browse.records.flatMap(m=>m.topics))].sort(),[browse]);
  const stages=useMemo(()=>[...new Set(browse.records.flatMap(m=>m.stages))].sort(),[browse]);
  const documentTypes=useMemo(()=>[...new Set(browse.records.map(m=>m.documentType))].sort(),[browse]);
  const ready=!deep||invalidDistrict||exact?.scope===scope;
  const results:(MeetingBrowseCard|MeetingCard)[]=useMemo(()=>{
    if(invalidDistrict)return [];
    if(!deep)return filterBrowseRecords(browse.records,filters);
    return exact?.scope===scope?filterMeetings(exact.records,filters):[];
  },[browse,filters,deep,exact,scope,invalidDistrict]);
  const shown=results.slice(0,visibleCount);
  const dates=browse.records.flatMap(m=>m.date?[m.date]:[]).sort();
  const unresolved=invalidDistrict?0:deep
    ? ready?filterMeetings(exact!.records,{...filters,from:"",to:"",dates:"unresolved"}).length:0
    : filterBrowseRecords(browse.records,{...filters,q:"",from:"",to:"",dates:"unresolved"}).length;

  function update(next:MeetingFilters){
    setFilters(next);setVisibleCount(pageSize);
    const p=new URLSearchParams({view:"meetings"});
    Object.entries(next).forEach(([k,v])=>{if(v)p.set(k,v)});
    window.history.pushState(null,"",`${window.location.pathname}?${p}#latest-activity`);
  }
  function retrySearch(){exactCache.delete(scope);setRetry(n=>n+1)}

  return <section className="mi-browser" aria-labelledby="meeting-intelligence-heading">
    <header className="mi-intro"><p className="eyebrow">Texas Water Watch</p><h2 id="meeting-intelligence-heading">Meeting intelligence</h2>
      <p>Browse source-linked summaries. Text and bounded-date searches load exact item-level search data only when requested.</p>
      <div className="mi-stats"><strong>{browse.record_count} source documents</strong><strong>{districts.length} issuing districts</strong><strong>{browse.records.reduce((n,m)=>n+(m.pages||0),0)} physical PDF pages</strong><strong>{browse.records.filter(m=>m.sourceMediaType==="text/html").length} native web documents</strong><span>Established source / scheduled dates: {dates[0]} – {dates.at(-1)}</span><span>{browse.records.filter(m=>m.date===null&&m.dateRole!=="multi_meeting_compilation").length} unresolved document dates · {browse.records.filter(m=>m.dateRole==="multi_meeting_compilation").length} multi-meeting compilation · {browse.records.filter(m=>m.date===null).length} without a single document date</span></div>
      <p className="mi-boundary">Historical records with incomplete district coverage. Recorded decisions do not establish current permit status or that conditions were fulfilled.</p>
      <p className="mi-links"><Link href="/groundwater-districts/intelligence/entities">Entities and timelines →</Link><Link href="/groundwater-districts/data">Data access and downloads</Link></p>
    </header>
    <div className="mi-filters" role="search" aria-label="Search meeting intelligence">
      <label className="mi-search">Search meeting intelligence<input type="search" value={filters.q} placeholder="Organization, person, permit, well, aquifer, project, quantity or decision" onChange={e=>update({...filters,q:e.target.value})}/></label>
      <label>Meeting district<select value={filters.district} onChange={e=>update({...filters,district:e.target.value})}><option value="">All meeting districts</option>{districts.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
      <label>Source / scheduled date from<input type="date" value={filters.from} onChange={e=>update({...filters,dates:filters.dates==="items"?"items":"",from:e.target.value})}/></label>
      <label>Source / scheduled date through<input type="date" value={filters.to} onChange={e=>update({...filters,dates:filters.dates==="items"?"items":"",to:e.target.value})}/></label>
      <label>Date availability<select value={filters.dates} onChange={e=>update({...filters,dates:e.target.value,from:"",to:""})}><option value="">All documents</option><option value="items">Supported item / section dates</option><option value="unresolved">Unresolved document dates only</option><option value="compilation">Multi-meeting compilations only</option><option value="no-single-date">All without a single document date</option></select></label>
      <label>Document type<select value={filters.document} onChange={e=>update({...filters,document:e.target.value})}><option value="">All document types</option>{documentTypes.map(t=><option key={t} value={t}>{t}</option>)}</select></label>
      <label>Topic<select value={filters.topic} onChange={e=>update({...filters,topic:e.target.value})}><option value="">All topics</option>{topics.map(t=><option key={t} value={t}>{readable(t)}</option>)}</select></label>
      <label>Recorded stage or action<select value={filters.stage} onChange={e=>update({...filters,stage:e.target.value})}><option value="">All stages and actions</option>{stages.map(t=><option key={t} value={t}>{readable(t)}</option>)}</select></label>
      <button type="button" className="button secondary" onClick={()=>update(emptyMeetingFilters)}>Clear meeting filters</button>
    </div>
    <div className="mi-results-heading"><p role="status">{loading&&deep&&!ready?"Loading exact source search…":error&&deep&&!ready?"Exact source search unavailable":<><strong>{results.length}</strong> meeting documents match · {shown.length} shown</>}</p><p>Filters are saved in the URL for sharing. All-district text or bounded-date searches download the full index on demand.</p></div>
    {error&&deep&&!ready?<p role="alert">{error}. Results are unavailable for this scope; no zero-result claim is made. <button type="button" className="button secondary" onClick={retrySearch}>Retry exact search</button></p>:null}
    {(filters.from||filters.to)&&ready&&unresolved?<p className="mi-warning">The date range excludes {unresolved} matching document{unresolved===1?"":"s"} with unresolved dates. <button type="button" className="button secondary" onClick={()=>update({...filters,dates:"unresolved",from:"",to:""})}>Show unresolved dates</button></p>:null}
    {filters.dates==="unresolved"?<p>Whole-document dates remain unresolved. Supported section dates are shown separately within each record.</p>:null}
    <p className="mi-label">For compilations, a date range matches an explicitly dated item or section. Text, topic and stage filters must match that same item; unrepresented months are not filled in.</p>
    {filters.from&&filters.to&&filters.from>filters.to?<p role="alert">Choose an end date on or after the start date.</p>:null}
    {ready&&!results.length?<p className="gcd-no-results">No meetings match these filters. Try a shorter name or clear the date range.</p>:null}
    <div className="mi-cards">{shown.map(m=>{
      const matches="matters" in m?matchingMatters(m,filters.q,filters):[];
      const sourcePage="sourcePage" in m?m.sourcePage:m.citations[0]?.page;
      const districtName="district" in m?m.district:browse.districts[m.districtId];
      return <article className="mi-card" key={m.key}>
        <div className="mi-card-top"><span>{m.date?<>{m.dateRole==="scheduled_date"?"Scheduled":"Source date"} <time dateTime={m.date}>{m.date}</time></>:documentDateLabel(m.date,m.dateRole)}</span><span>{m.partial?"Partial source readability":m.pages===null?"Native web document":`${m.pages} source pages`}</span></div>
        <h3><Link href={meetingPath(m.key)}>{districtName}</Link></h3>
        <p className="mi-label">{m.documentType} · Source-linked research summary</p><p>{m.summary}</p>
        {matches.length?<div className="mi-matches"><strong>{m.dateRole==="multi_meeting_compilation"&&(filters.from||filters.to)?"Matching dated items in this compilation":"Matching matters"}</strong><ul>{matches.slice(0,8).map(item=><li key={item.id}><a href={`${meetingPath(m.key)}#${item.id}`}>{item.dateContext?.date?`${item.dateContext.date} · `:""}{readable(item.label)}</a></li>)}</ul>{matches.length>8?<p>{matches.length-8} more matching items are linked from the detail page.</p>:null}</div>:filters.q&&ready?<p>Match in meeting context; individual matters may concern other subjects.</p>:null}
        <div className="mi-topics">{m.topics.slice(0,4).map(t=><span key={t}>{readable(t)}</span>)}</div>
        {m.dateNote?<p className="mi-warning">{m.dateNote}</p>:null}
        {m.partial?<p className="mi-warning">Tiny raster spans on pages {m.partialPages.join(", ")} remain illegible.</p>:null}
        <div className="mi-links"><Link href={meetingPath(m.key)}>Read meeting details →</Link><a href={m.pages===null?m.sourceUrl:officialPage(m.sourceUrl,sourcePage||1)} target="_blank" rel="noreferrer">{m.pages===null?"Official web source":`Official PDF · p. ${sourcePage||1}`}</a></div>
      </article>;
    })}</div>
    {ready&&results.length>shown.length?<button type="button" className="button secondary" onClick={()=>setVisibleCount(n=>n+pageSize)}>Show 20 more meetings ({results.length-shown.length} remaining)</button>:null}
  </section>;
}
