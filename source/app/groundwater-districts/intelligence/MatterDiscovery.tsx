"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import index from "@/public/data/water-watch/v1/matters/index.json";
export default function MatterDiscovery() {
  const [query,setQuery]=useState("");
  useEffect(()=>{setQuery(new URLSearchParams(window.location.search).get("q")||"");},[]);
  const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const hits=index.matters.filter(m=>terms.every(t=>m.search_text.toLowerCase().includes(t)));
  return <section className="mi-source" aria-labelledby="longitudinal-matters"><h2 id="longitudinal-matters">Source-linked matters</h2><p>Follow requests, board actions and unresolved questions across supplied documents. These are evidence-scoped research chronologies, separate from candidate identity leads.</p><label>Find a matter by name, fact ID or supported identifier <input value={query} onChange={e=>setQuery(e.target.value)} type="search" /></label><p>{hits.length} of {index.matter_count} matters</p>{hits.map(m=><p key={m.matter_id}><Link href={new URL(m.canonical_url).pathname}>{m.title}</Link> · {m.source_record_ids.length} sources</p>)}</section>;
}
