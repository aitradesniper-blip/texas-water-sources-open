"use client";

import { trackWellRecordsRouterEvent } from "@/lib/analytics-events";

export function WellRecordsIntentRouter({ siteOrigin = "" }: { siteOrigin?: "" | "https://texaswatersources.com" }) {
  return <section className="well-intent-router" aria-labelledby="well-intent-router-heading">
    <header className="well-intent-router-header">
      <div><p className="eyebrow">Choose a research path</p><h2 id="well-intent-router-heading">Find the Texas well record you need</h2></div>
      <p>Start with the task you need to complete, then verify candidate records in the appropriate official system and against independent property evidence.</p>
    </header>
    <div className="well-intent-router-grid">
      <a
        className="well-intent-router-card well-intent-router-card-primary"
        href={`${siteOrigin}/well-records/find-by-address`}
        onClick={() => trackWellRecordsRouterEvent("well_records_address_lookup_click")}
      >
        <span>Property-address search</span>
        <h3>Search by property address</h3>
        <p>Start with a Texas address to look for possible nearby Submitted Drillers Reports and plugging records. Nearby records are candidates; proximity and address matching do not establish parcel ownership or legal association.</p>
        <strong>Search Texas well reports by address <span aria-hidden="true">→</span></strong>
      </a>
      <a className="well-intent-router-card" href="#which-system">
        <span>Official-source routing</span>
        <h3>Choose the right official record system</h3>
        <p>Use the drilling date and identifier type to choose among Submitted Drillers Reports, historical well reports, TWDB Groundwater Database records, Texas well logs, or plugging reports.</p>
        <strong>Compare the official record systems <span aria-hidden="true">↓</span></strong>
      </a>
      <a
        className="well-intent-router-card well-intent-router-card-secondary"
        href={`${siteOrigin}/property-water-report`}
        onClick={() => trackWellRecordsRouterEvent("well_records_property_report_click")}
      >
        <span>Broader research</span>
        <h3>Research the full property-water picture</h3>
        <p>Need more than one well record? Use the free Property Water Report to organize broader district, groundwater, surface-water, and property-specific public-record research without treating it as proof of ownership or legal association.</p>
        <strong>Run the complete property-water report <span aria-hidden="true">→</span></strong>
      </a>
    </div>
  </section>;
}
