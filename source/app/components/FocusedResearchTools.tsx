"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Static hosting requires document navigation instead of unsupported Flight transitions. */
import {
  trackFocusedResearchToolCardClick,
  type FocusedResearchToolDestination,
  type FocusedResearchToolId,
} from "@/lib/analytics-events";

const officialTrecFormPdf = "https://www.trec.texas.gov/sites/default/files/pdf-forms/61-0.pdf";

const tools: ReadonlyArray<{
  tool: FocusedResearchToolId;
  destination: FocusedResearchToolDestination;
  label: string;
  title: string;
  description: string;
  action: string;
}> = [
  {
    tool: "trec_form_61_0",
    destination: "/trec-61-guide",
    label: "Disclosure research",
    title: "Official TREC Form 61-0 and research guide",
    description: "Open the current form pathway and organize seller-known facts, official records, and unresolved questions without having the site choose an answer.",
    action: "Open the TREC Form 61-0 research guide",
  },
  {
    tool: "well_report_address_lookup",
    destination: "/well-records/find-by-address",
    label: "Well-report leads",
    title: "Texas Water Well Report Lookup by Address",
    description: "Check for nearby managed well-report leads, then compare each candidate with the official TWDB report and property evidence.",
    action: "Search Texas well reports by address",
  },
  {
    tool: "water_rights_viewer_companion",
    destination: "/surface-water-rights/water-rights-viewer",
    label: "Surface-water leads",
    title: "TCEQ Water Rights Viewer Companion",
    description: "Identify nearby mapped WR_ID leads, continue in the official TCEQ viewer, and preserve the questions that still require comparison.",
    action: "Open the TCEQ Water Rights Viewer companion",
  },
];

export function FocusedResearchTools() {
  return <section className="section wrap home-focused-tools" aria-labelledby="focused-research-tools-heading">
    <div className="focused-tools-heading">
      <div><p className="eyebrow">Focused research tools</p><h2 id="focused-research-tools-heading" className="display-small">Choose a narrower starting point.</h2></div>
      <p>These independent tools organize specific research tasks. TREC, TWDB, TCEQ, and other official sources remain authoritative.</p>
    </div>
    <div className="focused-tool-grid">
      {tools.map((card, index) => <a
        className="focused-tool-card"
        href={card.destination}
        key={card.tool}
        onClick={() => trackFocusedResearchToolCardClick(card.tool, card.destination)}
      >
        <span className="focused-tool-number">0{index + 1}</span>
        <span className="focused-tool-label">{card.label}</span>
        <h3>{card.title}</h3>
        <p>{card.description}</p>
        <strong>{card.action} <span aria-hidden="true">→</span></strong>
      </a>)}
    </div>
    <p className="focused-tools-source-links"><a href={officialTrecFormPdf} target="_blank" rel="noreferrer">Download official TREC Form 61-0 <span aria-hidden="true">↗</span></a><a href="/sources">Browse the approved official-source directory</a></p>
  </section>;
}
