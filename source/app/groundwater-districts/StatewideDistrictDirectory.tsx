"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GcdDirectoryDistrictV2 } from "@/lib/gcd-statewide-directory";
import {
  trackGcdDirectoryEngagement,
  trackGcdDirectoryEvent,
  trackGcdDirectoryPageView,
} from "@/lib/analytics-events";

type DirectoryScope = "all" | "documents" | "source-metadata-only" | "identity-only" | "water-watch";

const scopeLabels: Record<DirectoryScope, string> = {
  all: "All districts",
  documents: "Published document records",
  "source-metadata-only": "Official source metadata only",
  "identity-only": "Directory identity only",
  "water-watch": "Reviewed Texas Water Watch",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function matchesScope(district: GcdDirectoryDistrictV2, scope: DirectoryScope) {
  if (scope === "documents") return district.document_count > 0;
  if (scope === "source-metadata-only") return district.public_release_state === "public_released" && district.document_count === 0;
  if (scope === "identity-only") return district.public_release_state === "not_public_released";
  if (scope === "water-watch") return district.has_reviewed_water_watch;
  return true;
}

export default function StatewideDistrictDirectory({
  districts,
  eventCountsByDistrict,
  meetingCountsByDistrict = {},
}: {
  districts: GcdDirectoryDistrictV2[];
  eventCountsByDistrict: Record<string, number>;
  meetingCountsByDistrict?: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<DirectoryScope>("all");
  const searchEventRecorded = useRef(false);

  useEffect(() => {
    trackGcdDirectoryPageView();
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en-US");
    return districts.filter((district) =>
      matchesScope(district, scope)
      && (!normalizedQuery || district.district_name.toLocaleLowerCase("en-US").includes(normalizedQuery)),
    );
  }, [districts, query, scope]);

  function recordEngagement() {
    trackGcdDirectoryEngagement();
  }

  function handleQuery(value: string) {
    setQuery(value);
    recordEngagement();
    if (value.trim() && !searchEventRecorded.current) {
      searchEventRecorded.current = true;
      trackGcdDirectoryEvent("gcd_directory_search_used");
    }
  }

  function handleScope(value: DirectoryScope) {
    setScope(value);
    recordEngagement();
    trackGcdDirectoryEvent("gcd_directory_filter_used");
  }

  function recordLink(event: "gcd_directory_official_source_opened" | "gcd_directory_detail_opened" | "gcd_directory_water_watch_opened") {
    recordEngagement();
    trackGcdDirectoryEvent(event);
  }

  return <section className="gcd-statewide-directory" aria-labelledby="statewide-directory-heading">
    <header className="gcd-directory-heading">
      <div><p className="eyebrow">Statewide release browser</p><h2 id="statewide-directory-heading">Find a Texas groundwater district entry</h2></div>
      <p>Search all 98 directory identities in this release. Coverage labels distinguish identity-only entries, approved source metadata, published document records, and the separate reviewed Texas Water Watch collection.</p>
    </header>

    <div className="gcd-directory-controls" role="search" aria-label="Search and filter the statewide groundwater district directory">
      <label>Search district names
        <input
          type="search"
          value={query}
          onChange={(event) => handleQuery(event.target.value)}
          placeholder="Example: Trinity or Edwards"
        />
      </label>
      <label>Coverage in this release
        <select value={scope} onChange={(event) => handleScope(event.target.value as DirectoryScope)}>
          {(Object.keys(scopeLabels) as DirectoryScope[]).map((value) => <option key={value} value={value}>{scopeLabels[value]}</option>)}
        </select>
      </label>
      <button
        className="button quiet"
        type="button"
        disabled={!query && scope === "all"}
        onClick={() => {
          setQuery("");
          setScope("all");
          recordEngagement();
        }}
      >Clear filters</button>
    </div>

    <div className="gcd-directory-result-summary" aria-live="polite">
      <strong>{results.length} district {results.length === 1 ? "entry" : "entries"}</strong>
      <span>{scopeLabels[scope]}{query.trim() ? ` matching “${query.trim()}”` : ""}</span>
    </div>

    {results.length ? <div className="gcd-directory-grid">{results.map((district) => {
      const officialSourceUrl = district.official_archive_urls[0] ?? district.official_website_url;
      const boardActionCount = eventCountsByDistrict[district.district_id] ?? 0;
      return <article id={`district-${district.district_slug}`} className="gcd-directory-card" key={district.district_id}>
        <div className="gcd-directory-card-top">
          <span className={`gcd-coverage-badge ${district.document_count ? "has-documents" : "directory-only"}`}>{district.coverage_label}</span>
          {district.has_reviewed_water_watch ? <span className="gcd-coverage-badge water-watch">Reviewed Water Watch · {district.reviewed_water_watch_record_count} facts</span> : null}
          {boardActionCount ? <span className="gcd-coverage-badge board-actions">Board actions · {boardActionCount}</span> : null}
        </div>
        <h3>{district.district_name}</h3>
        {district.document_count > 0 ? <>
          <p className="gcd-directory-count"><strong>{district.document_count.toLocaleString("en-US")}</strong> approved public document {district.document_count === 1 ? "record" : "records"}</p>
          <p className="gcd-directory-roles">{district.document_roles.map((role) => `${role.label} ${role.count.toLocaleString("en-US")}`).join(" · ")}</p>
          <dl className="gcd-directory-facts"><div><dt>Current-version records</dt><dd>{district.current_version_document_count.toLocaleString("en-US")}</dd></div><div><dt>Verified meeting dates</dt><dd>{district.verified_meeting_date_count.toLocaleString("en-US")}</dd></div></dl>
        </> : <p className="gcd-directory-count"><strong>Coverage level</strong>{district.coverage_note}</p>}
        {district.last_successful_source_observation_date ? <p className="gcd-directory-date">Official source last successfully checked <time dateTime={district.last_successful_source_observation_date}>{formatDate(district.last_successful_source_observation_date)}</time></p> : district.last_checked_date ? <p className="gcd-directory-date">Official source checked <time dateTime={district.last_checked_date}>{formatDate(district.last_checked_date)}</time></p> : null}
        {district.successor_document_release_caveat ? <p className="gcd-directory-caveat"><strong>Release note:</strong> {district.successor_document_release_caveat}</p> : null}
        <div className="gcd-directory-card-links">
          {district.site_detail_path ? <Link href={district.site_detail_path} onClick={() => recordLink("gcd_directory_detail_opened")}>Open district research page</Link> : null}
          {officialSourceUrl ? <a href={officialSourceUrl} target="_blank" rel="noreferrer" onClick={() => recordLink("gcd_directory_official_source_opened")}>Open official district source <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a> : <span>Approved official navigation is not included for this identity-only entry.</span>}
          {district.has_reviewed_water_watch ? <Link href={`/groundwater-districts/intelligence?district=${district.district_id}#latest-activity`} onClick={() => recordLink("gcd_directory_water_watch_opened")}>Browse reviewed district activity</Link> : null}
          {boardActionCount ? <Link href={`/groundwater-districts/intelligence?district=${district.district_id}&view=events#latest-activity`} onClick={() => recordLink("gcd_directory_water_watch_opened")}>Browse district board actions</Link> : null}
          {meetingCountsByDistrict[district.district_id] ? <Link href={`/groundwater-districts/intelligence?view=meetings&district=${district.district_id}#latest-activity`}>Meeting intelligence · {meetingCountsByDistrict[district.district_id]} documents</Link> : null}
        </div>
      </article>;
    })}</div> : <div className="gcd-directory-empty"><h3>No directory entries match.</h3><p>Try a shorter district-name search or clear the coverage filter.</p><button className="button primary" type="button" onClick={() => { setQuery(""); setScope("all"); }}>Show all districts</button></div>}
  </section>;
}
