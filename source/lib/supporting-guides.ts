import type { EditorialContent, EditorialRelatedGuide } from "@/lib/editorial-content";
import {
  approvedSources,
  tceqDistrictSource,
  tceqWaterRightsDataSource,
  tceqWaterRightsSource,
  tceqWaterRightsUserGuideSource,
  texasWaterSourcesAuthor,
  trecForm61Source,
  twdbDistrictSource,
  twdbWellReportInstructionsSource,
} from "@/lib/editorial-content";
import { absoluteUrl } from "@/lib/seo";

export const supportingGuideIds = [
  "trec-water-wells",
  "trec-groundwater-district",
  "shared-off-property-wells",
  "find-well-by-address",
  "pre-2003-well-records",
  "water-rights-viewer",
] as const;

export type SupportingGuideId = (typeof supportingGuideIds)[number];

interface GuideStep {
  title: string;
  body: string;
}

interface GuideRecord {
  title: string;
  body: string;
}

interface GuideExample {
  title: string;
  situation: string;
  actions: string[];
  outcome: string;
}

export interface SupportingGuide {
  id: SupportingGuideId;
  path: string;
  hubPath: string;
  hubTitle: string;
  eyebrow: string;
  h1: string;
  lede: string;
  task: string;
  researchApproach: string;
  content: EditorialContent;
  overviewHeading: string;
  overview: string[];
  preparationHeading: string;
  preparation: string[];
  workflowHeading: string;
  steps: GuideStep[];
  recordHeading: string;
  records: GuideRecord[];
  example: GuideExample;
  finalHeading: string;
  finalNotes: string[];
}

const publicationDate = "2026-07-18";
const researchApproach = "Official-source review, source comparison, editorial drafting, and substantive claim checks against the cited sources before publication.";

const methodologyLink: EditorialRelatedGuide = {
  title: "Research methodology",
  path: "/methodology",
  description: "See how candidate records, source limits, unresolved questions, and professional-review needs are documented.",
};

const disclaimerLink: EditorialRelatedGuide = {
  title: "Independent-service disclaimer",
  path: "/disclaimer",
  description: "Review the source, property-association, legal, and professional boundaries that apply to these workflows.",
};

const trecAssistantLink: EditorialRelatedGuide = {
  title: "TREC Form 61-0 research assistant",
  path: "/trec-61-guide#research-assistant",
  description: "Record seller-known information, sources checked, candidate records, and unresolved questions without selecting an answer.",
};

const trecApplicabilityLink: EditorialRelatedGuide = {
  title: "Who must complete TREC Form 61-0?",
  path: "/trec-61-guide/who-must-complete-form-61-0",
  description: "Compare mandatory form use, the actual contract, delivery paths, the five-condition exemption, and professional-review boundaries.",
};

function editorialContent({
  title,
  description,
  path,
  primaryQuestion,
  officialSources,
  relatedSourceIds,
  relatedGuides,
  limitations,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  primaryQuestion: string;
  officialSources: EditorialContent["official_sources"];
  relatedSourceIds: EditorialContent["related_source_ids"];
  relatedGuides: EditorialContent["related_guides"];
  limitations: string[];
  dateModified?: string;
}): EditorialContent {
  return {
    title,
    description,
    canonical: absoluteUrl(path),
    author: texasWaterSourcesAuthor,
    date_published: publicationDate,
    date_modified: dateModified ?? publicationDate,
    primary_question: primaryQuestion,
    official_sources: officialSources,
    related_source_ids: relatedSourceIds,
    related_guides: relatedGuides,
    limitations,
  };
}

const trecWaterWellsPath = "/trec-61-guide/water-wells";
const trecDistrictPath = "/trec-61-guide/groundwater-district";
const sharedWellsPath = "/trec-61-guide/shared-and-off-property-wells";
const findByAddressPath = "/well-records/find-by-address";
const pre2003Path = "/well-records/pre-2003-records";
const viewerPath = "/surface-water-rights/water-rights-viewer";

export const supportingGuides: Record<SupportingGuideId, SupportingGuide> = {
  "trec-water-wells": {
    id: "trec-water-wells",
    path: trecWaterWellsPath,
    hubPath: "/trec-61-guide",
    hubTitle: "TREC Form 61-0 research guide",
    eyebrow: "TREC 61-0 supporting guide",
    h1: "Researching Water Wells for TREC Form 61-0",
    lede: "Separate what the seller knows from what a public-record search suggests, preserve the evidence, and carry unresolved well questions into the TREC research assistant without choosing a disclosure answer.",
    task: "Organize seller-known well information and public well-record research as two separate evidence tracks before reviewing Form 61-0.",
    researchApproach,
    content: editorialContent({
      title: "Researching Water Wells for TREC Form 61-0",
      description: "Separate seller knowledge from Texas well-record research, document candidate reports, and carry unresolved questions into the TREC Form 61-0 workflow.",
      path: trecWaterWellsPath,
      primaryQuestion: "How can a seller document well knowledge and public-record research without letting a candidate record choose a Form 61-0 answer?",
      officialSources: [
        trecForm61Source,
        twdbWellReportInstructionsSource,
        ...approvedSources(["twdb_submitted_drillers_reports", "twdb_groundwater_database", "twdb_plugging_reports"]),
      ],
      relatedSourceIds: ["twdb_submitted_drillers_reports", "twdb_groundwater_database", "twdb_plugging_reports"],
      relatedGuides: [
        trecAssistantLink,
        trecApplicabilityLink,
        { title: "Groundwater-district questions on Form 61-0", path: trecDistrictPath, description: "Document a possible district and boundary uncertainty as a separate research issue." },
        { title: "Shared and off-property wells", path: sharedWellsPath, description: "Research private arrangements, beneficiaries, operation, and agreement evidence that a well report may not show." },
        { title: "Texas well-record research hub", path: "/well-records", description: "Choose an official well-record system, compare a possible report, and troubleshoot a failed search." },
        methodologyLink,
      ],
      limitations: [
        "This page does not select, validate, or complete a Form 61-0 answer for a seller.",
        "A report, mapped point, historical owner, tracking number, or nearby result is not proof that a well belongs to the property.",
        "A well record does not establish current operation, ownership, yield, water quality, or compliance.",
        "No public record found does not prove that no well exists or that the seller has no relevant knowledge or documents.",
      ],
    }),
    overviewHeading: "Keep seller knowledge and record research separate",
    overview: [
      "The Form 61-0 review begins with the seller’s own knowledge, documents, and transaction history. A public search is a second track that may locate a report or raise a question, but it does not replace what the seller knows or decide how the seller should respond.",
      "Write down the source of each statement. Label a seller recollection as seller-known information; label a state report as a candidate public record until identifiers, location evidence, and property documents support a stronger connection.",
    ],
    preparationHeading: "Information to collect before searching",
    preparation: [
      "The seller’s description of each known well, its use, approximate location, and whether it is operating.",
      "Approximate drilling date, historical owner, driller, depth, county, address, legal description, and any tracking or state well number.",
      "Closing files, invoices, maintenance records, plugging records, surveys, photographs, and agreements that may describe the well.",
      "A separate note for facts the seller does not know and questions that require a district, title, survey, engineering, or legal review.",
    ],
    workflowHeading: "A seller-knowledge and records workflow",
    steps: [
      { title: "Record the seller’s account first", body: "Before opening a database, note what the seller knows, how the seller knows it, and which details are uncertain. Do not revise that account merely because a map shows a nearby point." },
      { title: "Choose the likely report system", body: "Use the TWDB locating instructions to route a 2003-or-later search toward Submitted Drillers Reports and an older search toward the historical report pathway. Check both pathways when the date is uncertain or near the crossover years." },
      { title: "Search with the strongest identifiers", body: "Begin with a known tracking number or state well number. Otherwise use the address or map for orientation, then test owner-at-drilling, driller, county, date range, and partial text searches." },
      { title: "Compare instead of assuming", body: "Compare report date, historical owner, driller, depth, proposed use, address or legal description, mapped location, and physical or survey evidence. Record every mismatch as well as every agreement." },
      { title: "Assign a research status", body: "Use a bounded label such as likely record match, candidate record, no public record found, or conflicting records. Preserve the report and the search date without turning the status into a property conclusion." },
      { title: "Return to the assistant", body: "Enter the seller-known information, sources searched, records saved, and unresolved questions in the TREC research assistant. The seller remains responsible for reviewing the form and selecting any response." },
    ],
    recordHeading: "Evidence to preserve",
    records: [
      { title: "Seller-known record", body: "Keep the seller’s statement, supporting documents, date recorded, and any uncertainty together. Do not overwrite it with database language." },
      { title: "Public-record candidate", body: "Save the report, direct official-source link, search date, identifiers, search method, and the comparison fields that support or weaken the possible match." },
      { title: "Unresolved question", body: "State the missing fact precisely—for example, whether a mapped report corresponds to the surveyed well location—so the next reviewer knows what evidence is still needed." },
    ],
    example: {
      title: "The invented Cedar Ridge Tract",
      situation: "In this fictional example, a seller remembers a garden well and has an old service invoice, but the invoice has no state identifier. A public search returns a report under a former owner with a similar drilling period; the mapped point is only approximate.",
      actions: [
        "Record the garden-well recollection and invoice as seller-known evidence.",
        "Save the report as a candidate and note the former-owner and date similarities.",
        "Compare the report description with the survey, physical well location, and other property records.",
        "Carry the mismatch and location question into the assistant instead of treating the report as the answer.",
      ],
      outcome: "The defensible result is a documented candidate plus an unresolved location question. Nothing in the example selects a Form 61-0 response.",
    },
    finalHeading: "Before returning to Form 61-0",
    finalNotes: [
      "Confirm that seller-known statements and public-record candidates remain visibly separate.",
      "Preserve direct official links, report identifiers, the search date, and comparison notes.",
      "Flag ownership, agreement, survey, jurisdiction, compliance, and legal-effect questions for the appropriate professional.",
      "Use the assistant to organize the record; do not use the assistant or this page to choose the seller’s answer.",
    ],
  },
  "trec-groundwater-district": {
    id: "trec-groundwater-district",
    path: trecDistrictPath,
    hubPath: "/trec-61-guide",
    hubTitle: "TREC Form 61-0 research guide",
    eyebrow: "TREC 61-0 supporting guide",
    h1: "Researching a Groundwater District for TREC Form 61-0",
    lede: "Use official district sources to identify a candidate groundwater conservation district, document boundary uncertainty, and carry the result into the TREC workflow without deciding jurisdiction from an address point.",
    task: "Create a repeatable, source-linked district research note that distinguishes map orientation from a verified boundary conclusion.",
    researchApproach,
    content: editorialContent({
      title: "Researching a Groundwater District for TREC Form 61-0",
      description: "Identify a possible Texas groundwater conservation district, document boundary uncertainty, and organize the result for TREC Form 61-0 research.",
      path: trecDistrictPath,
      primaryQuestion: "How can a seller research a possible groundwater conservation district for Form 61-0 without deciding jurisdiction from an address alone?",
      officialSources: [
        trecForm61Source,
        tceqDistrictSource,
        twdbDistrictSource,
        ...approvedSources(["tceq_groundwater_conservation_district_boundaries", "coastal_bend_groundwater_conservation_district"]),
      ],
      relatedSourceIds: ["tceq_groundwater_conservation_district_boundaries", "coastal_bend_groundwater_conservation_district"],
      relatedGuides: [
        trecAssistantLink,
        trecApplicabilityLink,
        { title: "Texas groundwater-district research hub", path: "/groundwater-districts", description: "Follow the full boundary-verification, district-contact, current-rules, and documentation workflow." },
        { title: "Water wells on Form 61-0", path: trecWaterWellsPath, description: "Keep seller-known well information separate from candidate public records." },
        { title: "Shared and off-property wells", path: sharedWellsPath, description: "Document private well arrangements that a district boundary layer cannot show." },
        methodologyLink,
      ],
      limitations: [
        "A mailing address, geocoded point, statewide layer, or nearby boundary is not a controlling jurisdiction determination.",
        "A candidate district name does not establish which current rules, exemptions, registration duties, or permit requirements apply to a particular well or use.",
        "No district shown in one public source does not prove that no district or other groundwater requirement applies.",
        "This page does not determine jurisdiction or select a Form 61-0 response.",
      ],
    }),
    overviewHeading: "Treat the map as orientation, not the decision",
    overview: [
      "A property address can help orient a statewide district layer, but address points and district boundaries come from different records and may not align with the parcel or surveyed tract. The first map result is therefore a candidate district, not a final jurisdiction statement.",
      "The useful Form 61-0 research record shows which official source was viewed, when it was viewed, how close the location appeared to a boundary, what the district said when contacted, and which current rules or forms were checked.",
    ],
    preparationHeading: "Information to collect before the map",
    preparation: [
      "Property address plus the legal description, appraisal identifier, survey, or parcel material available for orientation.",
      "Known well locations and uses, including whether any well may be shared or located beyond the tract.",
      "Names from prior district correspondence, registration, permit, meter, or plugging records.",
      "The question that needs verification: district identity, boundary location, current rule, registration, permit, exemption, or another issue.",
    ],
    workflowHeading: "A boundary-aware district workflow",
    steps: [
      { title: "Orient the location", body: "Use the official TCEQ district map or approved boundary source to find a possible district. Record the viewed source and date rather than copying a map feature into the research file." },
      { title: "Compare stronger property evidence", body: "Compare the candidate boundary with the legal description, survey, appraisal materials, and known well location. An address point alone is not the controlling property boundary." },
      { title: "Escalate boundary uncertainty", body: "If the tract, well, or point appears near a boundary—or the sources conflict—mark the district as unresolved. Preserve screenshots only for private research when allowed; retain direct official links and notes for the public-source record." },
      { title: "Open the district’s own information", body: "Use the statewide source to reach current official district contact information, management plans, rules, forms, notices, and records. Confirm that the site belongs to the candidate district." },
      { title: "Ask a bounded verification question", body: "When needed, give the district the best available legal or survey description and ask how it verifies coverage. Separately ask where current registration, permitting, exemption, spacing, production, metering, reporting, or plugging materials are published." },
      { title: "Record the result without deciding the form", body: "Enter the candidate district, boundary confidence, sources checked, district response, current materials reviewed, and open issues in the TREC assistant. Do not convert the research note into the seller’s disclosure answer." },
    ],
    recordHeading: "What a useful district note contains",
    records: [
      { title: "Candidate and confidence", body: "Name the possible district and use a plain-language confidence level supported by the sources viewed, property evidence compared, and proximity to a boundary." },
      { title: "Verification trail", body: "Record source URLs, view dates, district contact pathway, the question asked, the response received, and the date of that response." },
      { title: "Current-rule questions", body: "List the management plan, rules, forms, and records checked. Keep registration, permit, exemption, and compliance questions unresolved until supported by the proper official source or professional review." },
    ],
    example: {
      title: "The invented North Pasture Tract",
      situation: "In this fictional example, the address point appears inside one district, while the mapped tract line is close to that district’s boundary. No survey-based jurisdiction determination is in the seller’s file.",
      actions: [
        "Save the district name as a candidate and mark boundary confidence as low.",
        "Compare the legal description and survey with the official boundary source.",
        "Use the official contact pathway to ask how the district verifies the tract and well location.",
        "Record the response, current rules checked, and any remaining question in the assistant.",
      ],
      outcome: "The research result remains boundary uncertain until adequate official and property evidence support a conclusion. The address point does not decide jurisdiction.",
    },
    finalHeading: "Before recording the district result",
    finalNotes: [
      "Name every official source and view date used for the candidate district.",
      "State whether the property or well appears near a boundary and what evidence was compared.",
      "Record district confirmation separately from rule, permit, registration, exemption, or compliance questions.",
      "Carry open issues into the assistant instead of supplying a missing fact or Form 61-0 answer.",
    ],
  },
  "shared-off-property-wells": {
    id: "shared-off-property-wells",
    path: sharedWellsPath,
    hubPath: "/trec-61-guide",
    hubTitle: "TREC Form 61-0 research guide",
    eyebrow: "TREC 61-0 supporting guide",
    h1: "Researching Shared and Off-Property Wells",
    lede: "Document who owns, operates, uses, pays for, and can access a well arrangement while keeping public map clues separate from seller confirmation and private agreements.",
    task: "Build an evidence list for a well that may serve more than one tract or may sit outside the property, without inferring the private arrangement from a public map.",
    researchApproach,
    content: editorialContent({
      title: "Researching Shared and Off-Property Wells",
      description: "Organize agreements, beneficiaries, operation, access, payment, and seller confirmation for shared or off-property wells without relying on public maps as proof.",
      path: sharedWellsPath,
      primaryQuestion: "What evidence should a seller gather when a well may be shared or located off the property, and what can public records not establish?",
      officialSources: [trecForm61Source, twdbWellReportInstructionsSource, ...approvedSources(["twdb_submitted_drillers_reports", "tceq_groundwater_conservation_district_boundaries"])],
      relatedSourceIds: ["twdb_submitted_drillers_reports", "tceq_groundwater_conservation_district_boundaries"],
      relatedGuides: [
        trecAssistantLink,
        trecApplicabilityLink,
        { title: "Water wells on Form 61-0", path: trecWaterWellsPath, description: "Separate seller knowledge from candidate well reports before reviewing the disclosure." },
        { title: "Groundwater-district questions on Form 61-0", path: trecDistrictPath, description: "Document a candidate district and current-rule questions for the well location." },
        { title: "Texas well-record research hub", path: "/well-records", description: "Locate and compare possible well reports without treating a mapped point as a parcel association." },
        methodologyLink,
        disclaimerLink,
      ],
      limitations: [
        "Public maps and well reports rarely establish the complete private agreement, current beneficiaries, access rights, payment duties, maintenance duties, or operating arrangement.",
        "A mapped well outside or near a tract does not prove that it supplies the property; a mapped point inside does not prove ownership or exclusive use.",
        "This page does not interpret a deed, easement, lease, reservation, covenant, service agreement, or title exception.",
        "This page does not select a Form 61-0 answer or establish current operation, compliance, water quality, or yield.",
      ],
    }),
    overviewHeading: "Private arrangements require private evidence",
    overview: [
      "A shared-well or off-property-well question has at least two parts: the physical source of water and the legal or practical arrangement that allows delivery and use. A state report may help identify a candidate well, but it usually does not identify every current beneficiary, operator, access right, cost allocation, or maintenance duty.",
      "Start with the seller’s account and transaction documents. Use public records to locate possible well identifiers and district context, then return to deeds, agreements, title materials, surveys, bills, and direct confirmation for the arrangement itself.",
    ],
    preparationHeading: "Questions for the seller and file",
    preparation: [
      "Where is the well physically located, who is believed to own it, and who operates the pump or controls access?",
      "Which tracts or users receive water, for what uses, and through which lines, tanks, meters, or pressure systems?",
      "Who pays electricity, maintenance, testing, repairs, replacement, district fees, or other charges?",
      "Which deeds, easements, agreements, leases, reservations, title exceptions, surveys, invoices, or correspondence describe the arrangement?",
    ],
    workflowHeading: "A shared-well evidence workflow",
    steps: [
      { title: "Write the seller’s description", body: "Record the well location, operator, known users, delivery path, payment practice, maintenance practice, and source of the seller’s knowledge. Flag every answer based only on assumption or custom." },
      { title: "Inventory private documents", body: "Review available deeds, title materials, surveys, easements, agreements, leases, reservations, invoices, and correspondence for well location, access, beneficiaries, duration, cost allocation, repair duties, and termination terms." },
      { title: "Search for a candidate well record", body: "Use official well-report pathways to locate possible identifiers and historical report details. Preserve the candidate, but do not treat a report or map point as proof of the private arrangement." },
      { title: "Check district context separately", body: "Identify a possible groundwater conservation district for the well location and locate current official rules or contact pathways. District context does not answer ownership or agreement questions." },
      { title: "Compare the accounts", body: "Create a table of seller statements, documents, public records, physical observations, and conflicts. Ask whether each claimed beneficiary, operator, access route, and payment duty has supporting evidence." },
      { title: "Confirm and escalate", body: "Ask the seller to confirm the final factual account. Send title, easement, enforceability, transfer, or interpretation questions to the appropriate title or legal professional before relying on the arrangement." },
    ],
    recordHeading: "Facts to document separately",
    records: [
      { title: "Physical system", body: "Well location, pipes, storage, meters, electrical service, access route, observed condition, and any survey or inspection evidence." },
      { title: "People and responsibilities", body: "Claimed owner, operator, beneficiaries, payment practice, maintenance practice, decision-making, emergency access, and seller confirmation." },
      { title: "Documented rights and open questions", body: "Relevant instruments and title references, plus any unresolved question about ownership, access, enforceability, transfer, cost, or continuing service." },
    ],
    example: {
      title: "The invented Two-Tract Farm arrangement",
      situation: "In this fictional example, the seller says a well on a neighboring tract supplies both tracts. The seller pays part of the electric bill, but the file contains only an old invoice and a survey showing a line near the boundary; no shared-well agreement has been located.",
      actions: [
        "Record the seller’s account, bill-sharing practice, and known delivery route.",
        "Search title and closing materials for an easement, agreement, reservation, or exception.",
        "Use a public well search only to identify a candidate report and identifiers.",
        "Flag access, continuing service, payment duty, and transfer questions for title or legal review.",
      ],
      outcome: "The map and invoice may support further research, but they do not establish a transferable right to receive water. The arrangement remains unresolved until adequate evidence is found and interpreted.",
    },
    finalHeading: "Before relying on the arrangement",
    finalNotes: [
      "Confirm the claimed well location, operator, beneficiaries, delivery route, and payment practice with the seller.",
      "Preserve the specific documents and public records reviewed, including identifiers and dates.",
      "Do not use the absence of a public agreement or map feature to conclude that no arrangement exists.",
      "Carry unresolved title, access, transfer, service, maintenance, and disclosure questions into the professional handoff and TREC assistant.",
    ],
  },
  "find-well-by-address": {
    id: "find-well-by-address",
    path: findByAddressPath,
    hubPath: "/well-records",
    hubTitle: "Texas well-record research hub",
    eyebrow: "Well-record supporting guide",
    h1: "Texas Water Well Report Lookup by Address",
    lede: "Search possible Submitted Drillers Reports and plugging records near a Texas address, then verify each candidate using the official report.",
    task: "Search the existing public-record service for possible modern well-report and plugging-report records, then use the static workflow below to verify candidates or recover from a no-result search.",
    researchApproach,
    content: editorialContent({
      title: "Texas Water Well Report Lookup by Address",
      description: "Search possible Submitted Drillers Reports and plugging records near a Texas address, then verify each candidate using the official report.",
      path: findByAddressPath,
      dateModified: "2026-07-22",
      primaryQuestion: "How can I search for a Texas well report when an address is my only strong starting clue?",
      officialSources: [twdbWellReportInstructionsSource, ...approvedSources(["twdb_submitted_drillers_reports", "twdb_groundwater_database", "twdb_plugging_reports"])],
      relatedSourceIds: ["twdb_submitted_drillers_reports", "twdb_groundwater_database", "twdb_plugging_reports"],
      relatedGuides: [
        { title: "Texas well-record research hub", path: "/well-records", description: "Compare official systems, read reports, test possible matches, and use the complete no-result flow." },
        { title: "Pre-2003 Texas well records", path: pre2003Path, description: "Use the historical grid-and-report path when an older well is likely or an address search fails." },
        trecAssistantLink,
        { title: "Water wells on Form 61-0", path: trecWaterWellsPath, description: "Keep address-search candidates separate from seller-known well information." },
        methodologyLink,
      ],
      limitations: [
        "An address match, map point, coordinate, historical owner, or nearby report is not proof that a well belongs to the property.",
        "A missing plotted result does not prove that no well exists or no report was filed.",
        "Well-report addresses and mapped locations may be approximate, historical, incomplete, or entered differently from the current property address.",
        "A report does not establish current operation, ownership, yield, water quality, or compliance.",
      ],
    }),
    overviewHeading: "An address is a starting clue",
    overview: [
      "The current street address may not appear on a historical report, and a map point may not be placed at the well. Use the address to orient the official map, then test each candidate with report identifiers and independent property evidence.",
      "A good search log records the exact address variant, system, filters, map area, view date, candidate tracking numbers, and why each result was kept or rejected. That log makes the fallback search repeatable.",
    ],
    preparationHeading: "Build an address-search packet",
    preparation: [
      "Current street address plus postal, county-road, route, directional, and prior-address variants found in the file.",
      "County, legal description, appraisal identifier, subdivision or survey name, and nearby roads or landmarks for orientation.",
      "Approximate drilling date, owner at drilling, driller, depth, proposed use, and any tracking or state well number.",
      "Survey, appraisal map, closing documents, photographs, invoices, and physical well location evidence for candidate comparison.",
    ],
    workflowHeading: "Address search and fallback sequence",
    steps: [
      { title: "Choose the likely time-based system", body: "Use Submitted Drillers Reports as the first pathway for a likely 2003-or-later well. Add the historical report path for an older well, an uncertain drilling date, or a possible 2003–2005 crossover record." },
      { title: "Search and orient the map", body: "Enter the best current address in the official viewer and zoom out enough to understand the surrounding roads and candidate points. Do not assume the nearest point is the property’s well." },
      { title: "Open and preserve candidate identifiers", body: "For each plausible result, record the tracking number, state well number if shown, report date, historical owner, driller, depth, proposed use, address or legal-description text, and direct report link." },
      { title: "Test the candidate", body: "Compare the report with the property’s legal description, historical ownership, survey, known well location, drilling period, driller, depth, and physical evidence. Record conflicts, not just similarities." },
      { title: "Broaden the search methodically", body: "Try address variants and a wider map area. Then use county plus partial owner, partial driller, or a reasonable date range. Less text can recover a report whose spelling or formatting differs." },
      { title: "Move to the historical path", body: "If the well may predate 2003 or nothing plots, use the historical grid-based report workflow and inspect scans. For uncertain crossover years, search both the historical and submitted-report systems." },
    ],
    recordHeading: "Candidate comparison fields",
    records: [
      { title: "Report identity", body: "Tracking number, state well number, report date, official URL, system searched, and search date." },
      { title: "Descriptive match", body: "Historical owner, driller, county, depth, proposed use, address text, legal description, and any report sketch or location description." },
      { title: "Property evidence", body: "Surveyed or observed well location, property documents, historical ownership, photographs, invoices, and the mismatches or uncertainties that remain." },
    ],
    example: {
      title: "The invented County Road Tract",
      situation: "In this fictional example, the current address produces no mapped well. The seller’s file shows an older route-style address, a former owner’s surname, and an estimated drilling period rather than an exact year.",
      actions: [
        "Search the current address, then the older route format, and record both attempts.",
        "Search by county, partial former-owner name, and a wider date range with minimal text.",
        "Check the historical report path because the drilling period is uncertain.",
        "Compare every candidate with the legal description, survey, and physical location before assigning a status.",
      ],
      outcome: "A report found through the former-owner search remains a candidate until the descriptive and property evidence align. The original no-result did not prove that no record or well existed.",
    },
    finalHeading: "Document the address-search result",
    finalNotes: [
      "List every address variant, system, filter, date range, and map area searched.",
      "Save identifiers and direct official links for plausible candidates, including reasons for and against the match.",
      "Use a bounded status such as candidate record, likely match, no public record found, or conflicting records.",
      "Keep present operation, ownership, water quality, yield, compliance, and parcel association as separate questions.",
    ],
  },
  "pre-2003-well-records": {
    id: "pre-2003-well-records",
    path: pre2003Path,
    hubPath: "/well-records",
    hubTitle: "Texas well-record research hub",
    eyebrow: "Well-record supporting guide",
    h1: "How to Find Texas Well Records from Before 2003",
    lede: "Use the historical grid-and-report pathway, compare scanned location clues carefully, and search both systems when the drilling date may fall in the 2003–2005 crossover period.",
    task: "Locate and evaluate an older Texas well report when modern address and map searches are incomplete or the well likely predates the submitted-report system.",
    researchApproach,
    content: editorialContent({
      title: "How to Find Texas Well Records from Before 2003",
      description: "Use Texas historical well-report grids and scans, compare location clues, and account for 2003–2005 crossover uncertainty without claiming parcel association.",
      path: pre2003Path,
      primaryQuestion: "How can I search historical Texas well reports and test a possible pre-2003 record when modern addresses or map points are unreliable?",
      officialSources: [twdbWellReportInstructionsSource, ...approvedSources(["twdb_groundwater_database", "twdb_submitted_drillers_reports"])],
      relatedSourceIds: ["twdb_groundwater_database", "twdb_submitted_drillers_reports"],
      relatedGuides: [
        { title: "Texas well-record research hub", path: "/well-records", description: "Use the complete system-selection, report-reading, candidate-comparison, and no-result workflow." },
        { title: "Find a well record by address", path: findByAddressPath, description: "Start with a modern address, then use the fallback sequence when no reliable point appears." },
        { title: "Water wells on Form 61-0", path: trecWaterWellsPath, description: "Keep historical report candidates separate from the seller’s own knowledge." },
        trecAssistantLink,
        methodologyLink,
      ],
      limitations: [
        "Historical grid placement, handwritten descriptions, coordinates, owner names, and scanned reports may be approximate, incomplete, hard to read, or associated with older geography.",
        "A scan found in the correct grid does not prove that the report belongs to the property.",
        "No report found in the historical pathway does not prove that no well exists or that no report was filed.",
        "An older report does not establish present operation, ownership, yield, water quality, compliance, or the current physical location of the well.",
      ],
    }),
    overviewHeading: "Why older reports need a different path",
    overview: [
      "The TWDB locating instructions route many wells drilled before 2003 to an older report collection that is searched through geographic grids and scanned documents rather than a modern address-first record. The current address may never appear in the scan.",
      "Build the search around the owner at drilling, approximate date, county, legal or survey description, nearby roads, driller, depth, and physical location evidence. Treat grid placement as a way to find candidates, not as parcel proof.",
    ],
    preparationHeading: "Historical clues to gather",
    preparation: [
      "Approximate drilling year or range, including evidence that the well predates 2003.",
      "Owner at drilling and later historical owners, with spelling variants and initials.",
      "County, survey or abstract information, legal description, older road or route names, and nearby landmarks.",
      "Driller, depth, proposed use, well-log copies, invoices, photographs, survey evidence, and known physical location.",
    ],
    workflowHeading: "Historical grid-and-report workflow",
    steps: [
      { title: "Confirm the likely time period", body: "Use seller records, construction history, prior ownership, invoices, and physical evidence to estimate when the well was drilled. Keep the range broad when the date is uncertain." },
      { title: "Open the official historical pathway", body: "Follow the TWDB locating instructions to the historical TCEQ Water Well Report Viewer. Orient by county and the best available legal, survey, road, or landmark information." },
      { title: "Select and inspect nearby grids", body: "Open the relevant geographic grid and adjacent grids when the tract is near an edge. Review the available report links or scans; do not assume every report in the grid relates to the tract." },
      { title: "Compare the report’s own clues", body: "Record owner, drilling date, driller, depth, proposed use, location description, sketch, state well number, and any legible identifiers. Compare them with independent property and physical evidence." },
      { title: "Search both systems for crossover years", body: "If the likely drilling period includes 2003 through 2005, or the date remains uncertain, also search Submitted Drillers Reports. A crossover-era paper report may appear in a different pathway than expected." },
      { title: "Log no-result conditions", body: "Record counties, grids, adjacent areas, owner variants, date ranges, and systems checked. A well can be unplotted, mislocated, filed under an older name, or absent from the public result set." },
    ],
    recordHeading: "How to test a historical candidate",
    records: [
      { title: "Time and people", body: "Compare drilling date, owner at drilling, later ownership history, and driller. Similar names alone are weak evidence without location and date support." },
      { title: "Place description", body: "Compare county, survey or abstract language, roads, landmarks, sketch, grid, legal description, and known well location. Note uncertainty caused by older naming or approximate placement." },
      { title: "Well characteristics", body: "Compare depth, construction, proposed use, and other reported features with physical, service, survey, or inspection evidence, while remembering that current condition may have changed." },
    ],
    example: {
      title: "The invented Old Orchard Tract",
      situation: "In this fictional example, the seller believes the well was drilled in the late 1990s. The current address did not yet exist, but the file includes a former owner’s surname, an old farm-road reference, and a rough depth estimate.",
      actions: [
        "Use the county and old road reference to identify the likely historical grid and adjacent grid.",
        "Inspect scans for the former owner and drilling-period clues, preserving all identifiers from possible reports.",
        "Compare location descriptions, depth, and driller with the survey and observed well.",
        "Search Submitted Drillers Reports too if the time evidence expands into the crossover years.",
      ],
      outcome: "A scan with the same surname and similar depth is still only a candidate until its location and other evidence align. A grid hit is not a parcel association.",
    },
    finalHeading: "Close the historical search carefully",
    finalNotes: [
      "Preserve the system, grid, adjacent grids, search date, scans, identifiers, and comparison notes.",
      "Record illegible fields, conflicting names, uncertain geography, and missing scans as unresolved issues.",
      "Search both historical and submitted-report pathways when the drilling date is unknown or near the crossover years.",
      "Do not turn a historical candidate—or a no-result search—into a conclusion about current well status or property association.",
    ],
  },
  "water-rights-viewer": {
    id: "water-rights-viewer",
    path: viewerPath,
    hubPath: "/surface-water-rights",
    hubTitle: "Surface-water-rights research hub",
    eyebrow: "Surface-water supporting guide",
    h1: "Search the TCEQ Water Rights Viewer by Texas Address",
    lede: "Start with a Texas address, identify nearby mapped water-right record IDs, open the official TCEQ viewer, and preserve the details that still require comparison.",
    task: "Use the existing public-record service to identify nearby mapped surface-water leads, then preserve each WR_ID and continue the comparison in the official TCEQ Water Rights Viewer.",
    researchApproach,
    content: editorialContent({
      title: "Search the TCEQ Water Rights Viewer by Texas Address",
      description: "Use a Texas address to identify nearby mapped water-right record IDs, open the official TCEQ Water Rights Viewer, and preserve details for comparison.",
      path: viewerPath,
      dateModified: "2026-07-22",
      primaryQuestion: "How can I operate the TCEQ Water Rights Viewer and preserve a useful candidate record without treating the map as a property-right conclusion?",
      officialSources: [tceqWaterRightsSource, tceqWaterRightsUserGuideSource, tceqWaterRightsDataSource],
      relatedSourceIds: ["txgio_stratmap_land_parcels"],
      relatedGuides: [
        { title: "Surface-water-rights research hub", path: "/surface-water-rights", description: "Continue from the viewer candidate to document, property-evidence, and professional-review comparison." },
        trecAssistantLink,
        { title: "TREC Form 61-0 research guide", path: "/trec-61-guide", description: "Organize surface-water candidate records and unresolved questions without choosing a disclosure response." },
        methodologyLink,
        disclaimerLink,
      ],
      limitations: [
        "A mapped point, place-of-use shape, authorization record, document, or recorded holder field is not proof that a water right belongs to or transfers with a property.",
        "Viewer geography and boundaries are informational and may be approximate; they are not a legal, engineering, or survey determination.",
        "A no-result search does not prove that no authorization, historical record, contractual interest, or other relevant water issue exists.",
        "This page does not determine title, ownership, validity, transferability, compliance, priority, available quantity, or the legal effect of an authorization or document.",
      ],
    }),
    overviewHeading: "Use the viewer to create a candidate, not a conclusion",
    overview: [
      "The TCEQ Water Rights Viewer can display authorization locations and related information, including linked records and documents. Its map is a research interface: it helps locate and identify a possible authorization, but it does not establish that the right belongs to the tract being researched.",
      "The durable output is a candidate worksheet containing the search date, authorization number, permit or certificate information, recorded holder as displayed, basin, purpose, diversion or impoundment location, place-of-use details, documents opened, and questions for comparison.",
    ],
    preparationHeading: "Prepare the viewer search",
    preparation: [
      "Property address for orientation plus county, legal description, survey, appraisal materials, deed history, and known surface-water features.",
      "Any authorization, permit, certificate, account, diversion, reservoir, or basin identifiers already present in the seller or title file.",
      "Seller information about diversion, impoundment, irrigation, storage, water use, transfers, reservations, or prior correspondence.",
      "A blank candidate record so map observations remain separate from deed, title, survey, and seller evidence.",
    ],
    workflowHeading: "Operational Water Rights Viewer workflow",
    steps: [
      { title: "Open the official viewer and orient", body: "Start from the official TCEQ Water Rights Viewer page and open the viewer. Use the address or known location to orient the map, then compare roads, streams, reservoirs, and property materials without treating a base layer as a surveyed boundary." },
      { title: "Set useful layers and scale", body: "Follow the official user guide to display relevant authorization, point-of-diversion, place-of-use, or related layers. Zoom and pan beyond the tract because a candidate diversion or authorization feature may not sit on the property." },
      { title: "Open each plausible feature", body: "Use the viewer’s identify or selection tools to open a candidate. Record the authorization identifier, permit or certificate information, basin, purpose, recorded holder as displayed, location details, and the layer that produced the result." },
      { title: "Open related records and documents", body: "Follow available links or related-record tools to the authorization record, documents, and water-use information. Record which documents opened, their official URLs, and any missing or inaccessible item." },
      { title: "Preserve map observations accurately", body: "Describe the displayed point, diversion or impoundment location, and place-of-use information as map observations. Do not rewrite a recorded holder field as current title ownership." },
      { title: "Return to property evidence", body: "Compare the candidate with the legal description, deed history, title materials, survey, seller information, and relevant documents. Mark the result as candidate, likely match, conflicting, no public result, or interpretation unresolved." },
    ],
    recordHeading: "Viewer details worth preserving",
    records: [
      { title: "Authorization identity", body: "Authorization number, permit or certificate information, account or record identifier, basin, purpose, status as displayed, and search date." },
      { title: "Mapped information", body: "Point of diversion, diversion or impoundment location, place-of-use information, layer name, map scale, and a note that displayed geography may be approximate." },
      { title: "Record trail", body: "Recorded holder exactly as displayed, linked documents opened, water-use records viewed, direct official URLs, property evidence compared, conflicts, and professional-review questions." },
    ],
    example: {
      title: "The invented Reservoir-Edge Tract",
      situation: "In this fictional example, the viewer shows a diversion point near a reservoir and a place-of-use feature that appears close to the tract. The recorded holder name resembles an older name in the deed chain, but no authorization number appears in the current title material.",
      actions: [
        "Record the displayed authorization details, layer, search date, recorded holder wording, and approximate map relationship.",
        "Open the linked authorization documents and water-use information available through the official pathways.",
        "Compare the candidate with the legal description, deed history, title materials, survey, and seller information.",
        "Send title, transfer, validity, and legal-effect questions to the appropriate attorney or title professional.",
      ],
      outcome: "The viewer result remains a candidate authorization. Similar names and nearby map features do not establish current ownership or transfer with the tract.",
    },
    finalHeading: "Finish with a property-evidence comparison",
    finalNotes: [
      "Preserve identifiers, recorded holder wording, map observations, documents, official URLs, and the viewer search date.",
      "Compare the authorization record with the legal description, deed chain, title materials, survey, and seller information.",
      "Label missing records, conflicts, unclear documents, title questions, and transfer questions as unresolved.",
      "Use the candidate for a professional handoff or TREC research note; do not present it as proof that the right belongs to or transfers with the property.",
    ],
  },
};

export function getSupportingGuide(id: SupportingGuideId) {
  return supportingGuides[id];
}

export const supportingGuidePaths = supportingGuideIds.map((id) => supportingGuides[id].path);
