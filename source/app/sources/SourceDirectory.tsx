"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  filterPublicSources,
  type PublicSourceRecord,
  type SourceFilters,
} from "@/lib/source-catalog";

const emptyFilters: SourceFilters = {
  keyword: "",
  sourceCategory: "",
  county: "",
  district: "",
  trecSection: "",
};

interface DirectoryProps {
  sources: PublicSourceRecord[];
  categories: string[];
  counties: string[];
  districts: string[];
  trecSections: string[];
}

export default function SourceDirectory({ sources, categories, counties, districts, trecSections }: DirectoryProps) {
  const [filters, setFilters] = useState<SourceFilters>(emptyFilters);

  useEffect(() => {
    const pageWindow = window as Window & { __twsInitialLocationSearch?: string };
    const query = new URLSearchParams(pageWindow.__twsInitialLocationSearch ?? window.location.search);
    delete pageWindow.__twsInitialLocationSearch;
    setFilters({
      keyword: query.get("keyword") ?? "",
      sourceCategory: query.get("source_category") ?? "",
      county: query.get("county") ?? "",
      district: query.get("district") ?? "",
      trecSection: query.get("trec_section") ?? "",
    });
  }, []);

  const results = filterPublicSources(sources, filters);
  const update = (key: keyof SourceFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const hasFilters = Object.values(filters).some(Boolean);

  return <section className="source-directory wrap" aria-labelledby="source-results-heading">
    <div className="source-controls" role="search" aria-label="Filter official sources">
      <label className="filter-field filter-keyword">Search sources
        <input value={filters.keyword} onChange={(event) => update("keyword", event.target.value)} placeholder="Agency, record, topic, or limitation" />
      </label>
      <label className="filter-field">Category
        <select value={filters.sourceCategory} onChange={(event) => update("sourceCategory", event.target.value)}><option value="">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select>
      </label>
      <label className="filter-field">County
        <select value={filters.county} onChange={(event) => update("county", event.target.value)}><option value="">All counties</option>{counties.map((value) => <option key={value}>{value}</option>)}</select>
      </label>
      <label className="filter-field">District
        <select value={filters.district} onChange={(event) => update("district", event.target.value)}><option value="">All districts</option>{districts.map((value) => <option key={value}>{value}</option>)}</select>
      </label>
      <label className="filter-field">TREC topic
        <select value={filters.trecSection} onChange={(event) => update("trecSection", event.target.value)}><option value="">All topics</option>{trecSections.map((value) => <option key={value}>{value}</option>)}</select>
      </label>
      <button className="button quiet filter-clear" type="button" disabled={!hasFilters} onClick={() => setFilters(emptyFilters)}>Clear all</button>
    </div>
    <div className="source-results-heading">
      <div><p className="eyebrow">Catalog results</p><h2 id="source-results-heading">{results.length} official source{results.length === 1 ? "" : "s"}</h2></div>
      <p>Directory entries link to official agency and district records. They do not republish the underlying data.</p>
    </div>
    {results.length ? <div className="source-grid">{results.map((source) => <article className="source-card" key={source.source_id}>
      <div className="source-card-top"><span>{source.source_category}</span><span>Verified {source.last_verified_date}</span></div>
      <h3><Link href={`/sources/${source.source_id}`}>{source.title}</Link></h3>
      <p className="source-agency">{source.agency}</p>
      <p className="source-label">Official source: {source.official_source_label}</p>
      <p>{source.short_description}</p>
      <div className="source-card-facts"><p><strong>Can help find</strong>{source.what_it_can_help_find[0]}</p><p><strong>Key limitation</strong>{source.what_it_cannot_confirm[0]}</p></div>
      <div className="source-card-links"><Link href={`/sources/${source.source_id}`}>View source details</Link><a href={source.search_url} target="_blank" rel="noreferrer">Open official source <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>
    </article>)}</div> : <div className="source-empty"><h3>No sources match these filters.</h3><p>Clear one or more filters, or search with a broader agency or record term.</p><button className="button primary" type="button" onClick={() => setFilters(emptyFilters)}>Clear all filters</button></div>}
  </section>;
}
