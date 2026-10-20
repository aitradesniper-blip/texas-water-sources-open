import type { EditorialContent, EditorialOfficialSource } from "@/lib/editorial-content";
import { texasWaterSourcesAuthor } from "@/lib/editorial-content";
import { absoluteUrl } from "@/lib/seo";

export const trecApplicabilityPath = "/trec-61-guide/who-must-complete-form-61-0";
export const trecApplicabilityMetadataTitle = "Who Must Complete TREC Form 61-0? Texas Applicability Guide";

const reviewedOn = "2026-07-18";

function officialSource(
  title: string,
  url: string,
  attribution: string,
): EditorialOfficialSource {
  return {
    title,
    agency: "Texas Real Estate Commission",
    url,
    reviewed_on: reviewedOn,
    attribution,
  };
}

export interface TrecContractComparison {
  contract: string;
  form: string;
  transactionType: string;
  disclosurePresent: string;
  paragraph: string;
  path: string;
  officialUrl: string;
}

export interface TrecExemptionCondition {
  label: string;
  topic: string;
  doesNotEstablish: string;
  sourceBoundary: string;
  followUp: string;
}

export interface ApplicabilityStep {
  title: string;
  body: string;
}

export interface ApplicabilityScenario {
  scenario: string;
  issue: string;
  evidence: string;
  boundary: string;
}

export interface MisunderstoodQuestion {
  question: string;
  answer: string;
}

export const trecApplicabilitySources = [
  officialSource(
    "Seller's Disclosure about Groundwater and Surface Water Rights — Form 61-0",
    "https://www.trec.texas.gov/forms/water-notice-sellers-disclosure-about-groundwater-and-surface-water-rights",
    "Official Form 61-0 page; current form effective July 1, 2026. Supports the official title, form number, effective date, purpose, and current final download.",
  ),
  officialSource(
    "Form 61-0 — current final PDF",
    "https://www.trec.texas.gov/sites/default/files/pdf-forms/61-0.pdf",
    "TREC No. 61-0, final PDF dated May 4, 2026 and effective July 1, 2026. Supports the seller-knowledge questions, initials, and Seller/Date and Buyer/Date signature lines.",
  ),
  officialSource(
    "TREC Rules — Chapter 537",
    "https://www.trec.texas.gov/node/634",
    "Current TREC rules. Provisions reviewed: §§537.1, 537.11, 537.20, 537.28, 537.30, 537.31, 537.32, 537.37, 537.62, and 537.68; supports mandatory-use definitions, exceptions, contract adoption, Form 55-1 voluntary use, and Form 61-0 mandatory use.",
  ),
  officialSource(
    "Unimproved Property Contract — Form 9-18",
    "https://www.trec.texas.gov/sites/default/files/pdf-forms/9-18.pdf",
    "Current final Form 9-18, effective July 1, 2026. Paragraph 7F supports the Seller's Water Disclosure choices, delivery language, buyer-right language, and five-condition exemption.",
  ),
  officialSource(
    "One to Four Family Residential Contract (Resale) — Form 20-19",
    "https://www.trec.texas.gov/sites/default/files/pdf-forms/20-19.pdf",
    "Current final Form 20-19, effective July 1, 2026. Paragraph 7I supports the Seller's Water Disclosure choices, delivery language, buyer-right language, and five-condition exemption.",
  ),
  officialSource(
    "New Home Contract (Incomplete Construction) — Form 23-20",
    "https://www.trec.texas.gov/sites/default/files/pdf-forms/23-20.pdf",
    "Current final Form 23-20, effective July 1, 2026. Paragraph 7K supports the Seller's Water Disclosure choices, delivery language, buyer-right language, and five-condition exemption.",
  ),
  officialSource(
    "New Home Contract (Completed Construction) — Form 24-20",
    "https://www.trec.texas.gov/sites/default/files/pdf-forms/24-20.pdf",
    "Current final Form 24-20, effective July 1, 2026. Paragraph 7J supports the Seller's Water Disclosure choices, delivery language, buyer-right language, and five-condition exemption.",
  ),
  officialSource(
    "Farm and Ranch Contract — Form 25-17",
    "https://www.trec.texas.gov/sites/default/files/pdf-forms/25-17_2.pdf",
    "Current final Form 25-17, effective July 1, 2026. Paragraph 7K supports the Seller's Water Disclosure choices, delivery language, buyer-right language, and five-condition exemption.",
  ),
  officialSource(
    "Residential Condominium Contract (Resale) — Form 30-18",
    "https://www.trec.texas.gov/sites/default/files/pdf-forms/30-18.pdf",
    "Current final Form 30-18, effective July 1, 2026. Supports the separate condominium comparison and confirms that the final form does not contain a Seller's Water Disclosure paragraph.",
  ),
  officialSource(
    "Broker-Lawyer Committee Reviews Contract Form Updates at April Meeting",
    "https://www.trec.texas.gov/article/broker-lawyer-committee-reviews-contract-form-updates-april-meeting",
    "Official TREC revision-history explanation dated April 30, 2026. Supports the reported removal of the proposed water-disclosure paragraph from Form 30-18; the final contract remains controlling.",
  ),
  officialSource(
    "Seller's Disclosure Notice — Form 55-1",
    "https://www.trec.texas.gov/sites/default/files/pdf-forms/55-1.pdf",
    "Current final Form 55-1, effective May 28, 2026. Supports the comparison with the separate Texas property-condition seller-disclosure framework.",
  ),
  officialSource(
    "Does a license holder have to use TREC's contract forms?",
    "https://www.trec.texas.gov/does-license-holder-have-use-trecs-contract-forms-does-trec-ever-discipline-license-holder-who-fails",
    "Official TREC mandatory-form FAQ. Supports the license-holder focus of adopted contract forms and directs readers to Rule §537.11(a) exceptions.",
  ),
] satisfies EditorialOfficialSource[];

export const trecContractComparisons: TrecContractComparison[] = [
  {
    contract: "Unimproved Property Contract",
    form: "9-18",
    transactionType: "Unimproved property intended for one-to-four-family residential use",
    disclosurePresent: "Yes",
    paragraph: "7F",
    path: "Prior delivery, delivery within the filled-in number of days, or the complete five-condition exemption",
    officialUrl: "https://www.trec.texas.gov/sites/default/files/pdf-forms/9-18.pdf",
  },
  {
    contract: "One to Four Family Residential Contract (Resale)",
    form: "20-19",
    transactionType: "Resale of one-to-four-family residential property",
    disclosurePresent: "Yes",
    paragraph: "7I",
    path: "Prior delivery, delivery within the filled-in number of days, or the complete five-condition exemption",
    officialUrl: "https://www.trec.texas.gov/sites/default/files/pdf-forms/20-19.pdf",
  },
  {
    contract: "New Home Contract (Incomplete Construction)",
    form: "23-20",
    transactionType: "New home with incomplete construction",
    disclosurePresent: "Yes",
    paragraph: "7K",
    path: "Prior delivery, delivery within the filled-in number of days, or the complete five-condition exemption",
    officialUrl: "https://www.trec.texas.gov/sites/default/files/pdf-forms/23-20.pdf",
  },
  {
    contract: "New Home Contract (Completed Construction)",
    form: "24-20",
    transactionType: "New home with completed construction",
    disclosurePresent: "Yes",
    paragraph: "7J",
    path: "Prior delivery, delivery within the filled-in number of days, or the complete five-condition exemption",
    officialUrl: "https://www.trec.texas.gov/sites/default/files/pdf-forms/24-20.pdf",
  },
  {
    contract: "Farm and Ranch Contract",
    form: "25-17",
    transactionType: "Farm and ranch property",
    disclosurePresent: "Yes",
    paragraph: "7K",
    path: "Prior delivery, delivery within the filled-in number of days, or the complete five-condition exemption",
    officialUrl: "https://www.trec.texas.gov/sites/default/files/pdf-forms/25-17_2.pdf",
  },
  {
    contract: "Residential Condominium Contract (Resale)",
    form: "30-18",
    transactionType: "Resale of a residential condominium unit",
    disclosurePresent: "No — not in the current final form",
    paragraph: "Not present",
    path: "No Seller's Water Disclosure path appears in final Form 30-18; review the actual transaction documents and any other applicable duties",
    officialUrl: "https://www.trec.texas.gov/sites/default/files/pdf-forms/30-18.pdf",
  },
];

export const trecExemptionConditions: TrecExemptionCondition[] = [
  {
    label: "A. Water wells",
    topic: "Whether the seller is aware of any water well on the property, operating or not.",
    doesNotEstablish: "The condition does not establish present operation, ownership, compliance, yield, or water quality.",
    sourceBoundary: "A public search may miss a well and cannot replace what the seller actually knows.",
    followUp: "Review seller records, surveys, well reports, physical evidence, and district records; route unresolved legal or compliance questions appropriately.",
  },
  {
    label: "B. Pond, lake, or water tank",
    topic: "Whether the seller is aware of a pond, lake, or water tank on the property, including a feature that is dry when reviewed.",
    doesNotEstablish: "The feature alone does not establish a surface-water right, authorization, ownership, or regulatory status.",
    sourceBoundary: "Aerial or public-map results cannot substitute for the seller's knowledge of the property feature.",
    followUp: "Review seller information, surveys, site evidence, and relevant water-right documents; obtain professional review when legal effect is uncertain.",
  },
  {
    label: "C. Surface-water authorization",
    topic: "Whether the seller is aware of a TCEQ certificate of adjudication, certified filing, or permit for surface water associated with the property.",
    doesNotEstablish: "A viewer point or recorded holder does not prove that an authorization belongs to or transfers with the property.",
    sourceBoundary: "A no-result search does not establish seller knowledge or the absence of an authorization.",
    followUp: "Compare TCEQ documents with the legal description, deed history, title materials, and survey; send title or legal-effect questions to an appropriate professional.",
  },
  {
    label: "D. Groundwater-right transaction",
    topic: "Whether the seller is aware that groundwater rights have been severed, sold, or leased, in whole or in part.",
    doesNotEstablish: "A recorded document title or database reference does not determine ownership, scope, validity, or current legal effect.",
    sourceBoundary: "Public indexes can identify candidate documents but cannot supply the seller's knowledge or interpret a chain of title.",
    followUp: "Review deeds, reservations, conveyances, leases, title materials, and closing files with a title professional or Texas attorney when interpretation is needed.",
  },
  {
    label: "E. Water supplied only by a named provider type",
    topic: "Whether the property receives water only from the municipality, utility or special district, water-supply corporation, or private water-supply company described in the contract.",
    doesNotEstablish: "A utility bill alone may not resolve whether another well, shared supply, pond, tank, or water right exists or is known to the seller.",
    sourceBoundary: "Provider and map records cannot replace seller knowledge about every water source or feature serving the property.",
    followUp: "Review seller information, utility records, surveys, well evidence, agreements, and transaction documents; ask the responsible broker or Texas attorney about contract interpretation.",
  },
];

export const applicabilitySteps: ApplicabilityStep[] = [
  { title: "Identify the actual contract or transaction document", body: "Record its full name, form number, version, effective date, and whether it is a final TREC form or another authorized document." },
  { title: "Locate the Seller's Water Disclosure paragraph", body: "Check the actual document. Do not import a paragraph number or delivery term from a different contract." },
  { title: "Identify the contract path under review", body: "Record whether the paragraph states prior delivery, provides a filled-in period for later delivery, or includes the complete contract exemption." },
  { title: "Review all five conditions separately", body: "If the exemption is being considered, preserve evidence and uncertainty for every condition. One favorable fact does not resolve the others." },
  { title: "Separate seller knowledge from record research", body: "Label seller-known facts, public-record candidates, no-result searches, and conflicting evidence as distinct research items." },
  { title: "Escalate unresolved interpretation", body: "Send contract, deadline, title, ownership, or legal-effect questions to the responsible broker, title professional, surveyor, or Texas attorney as appropriate." },
];

export const applicabilityScenarios: ApplicabilityScenario[] = [
  { scenario: "City water with no other known water feature or right", issue: "All five exemption conditions still require separate review.", evidence: "Actual contract, seller knowledge, utility records, survey, and property files.", boundary: "City service alone does not establish the complete exemption." },
  { scenario: "City water plus an inactive or abandoned well", issue: "The well condition includes a well whether operating or not.", evidence: "Seller account, survey, physical evidence, reports, and plugging records.", boundary: "Inactive or abandoned status does not erase seller awareness or decide the contract selection." },
  { scenario: "Private well on the property", issue: "Seller-known well facts and the applicable contract paragraph.", evidence: "Form 61-0, well reports, district materials, survey, and maintenance records.", boundary: "A well record does not decide title, operation, compliance, or the seller's response." },
  { scenario: "Off-property or shared private well", issue: "Well knowledge plus the private supply arrangement.", evidence: "Agreements, easements, invoices, seller information, survey, and operator records.", boundary: "Public maps rarely establish private beneficiaries, access, payment, or operating terms." },
  { scenario: "Dry pond or water tank", issue: "The contract condition concerns awareness of the feature, not whether it contains water today.", evidence: "Seller information, survey, site evidence, and relevant authorization documents.", boundary: "Current dryness does not automatically remove the feature from review." },
  { scenario: "Known severed, sold, reserved, or leased groundwater rights", issue: "The groundwater-right condition and any Form 61-0 seller-knowledge questions.", evidence: "Deeds, reservations, conveyances, leases, title materials, and closing files.", boundary: "This guide cannot interpret scope, ownership, validity, or legal effect." },
  { scenario: "Known surface-water authorization", issue: "The authorization condition and property association.", evidence: "TCEQ permit or certificate, legal description, deed history, title materials, and survey.", boundary: "A mapped point or recorded holder does not prove transfer with the property." },
  { scenario: "Residential condominium resale", issue: "Final Form 30-18 lacks the Seller's Water Disclosure paragraph found in the five compared contracts.", evidence: "Final Form 30-18, executed contract, condominium documents, and other applicable disclosure materials.", boundary: "The missing paragraph does not resolve every other transaction-specific disclosure issue." },
  { scenario: "New home sold by a builder", issue: "Choose the actual completed- or incomplete-construction contract before locating its paragraph.", evidence: "Final Form 23-20 or 24-20, construction status, and executed transaction documents.", boundary: "Builder status alone does not decide delivery, exemption, or other duties." },
  { scenario: "Farm and ranch property", issue: "Form 25-17 Paragraph 7K if that current form governs the transaction.", evidence: "Executed contract, seller knowledge, wells, surface features, water-right and title documents.", boundary: "The property label alone does not decide any Form 61-0 selection." },
  { scenario: "Owner-prepared or attorney-required contract", issue: "A possible Rule §537.11 form-use exception and the terms of the actual contract.", evidence: "Who prepared and required the form, the document itself, and transaction roles.", boundary: "A rule exception does not automatically resolve separate disclosure or legal duties." },
  { scenario: "Federal-agency-required contract", issue: "A possible Rule §537.11 exception when the federal agency requires a different form.", evidence: "Agency requirement, actual contract, and transaction file.", boundary: "The exception does not answer every separate contractual, statutory, title, or disclosure question." },
  { scenario: "License holder acting solely as principal", issue: "A possible Rule §537.11 exception based on role.", evidence: "Transaction roles, representation records, and actual documents.", boundary: "Principal status should not be inferred and does not resolve separate seller obligations." },
  { scenario: "Transaction with no license holder", issue: "TREC's license-holder mandatory-use rule may not be the only authority relevant to the parties.", evidence: "Actual contract, party roles, and any applicable statutory or legal materials.", boundary: "Absence of a license holder does not establish that no disclosure or contract issue exists." },
  { scenario: "Public-record search returning no result", issue: "Seller knowledge and each contract condition remain separate from the search result.", evidence: "Search source, terms, date, alternative systems, seller files, and physical evidence.", boundary: "No result does not prove no well, feature, right, document, or seller knowledge exists." },
  { scenario: "Conflicting seller statements and public records", issue: "The conflict must remain visible during contract and form review.", evidence: "Seller account, source copies, dates, identifiers, survey, title materials, and follow-up notes.", boundary: "Neither source automatically overrides the other or supplies a legal conclusion." },
];

export const misunderstoodQuestions: MisunderstoodQuestion[] = [
  { question: "Does every Texas seller complete Form 61-0?", answer: "No universal statement follows from TREC's mandatory-use classification. Review the actual contract, transaction type, party roles, paragraph choices, seller-known facts, and any Rule §537.11 issue." },
  { question: "Does city water automatically create the exemption?", answer: "No. The covered contracts state five conditions that all must be satisfied. Water supplied only by a listed provider type is one condition, not the entire exemption." },
  { question: "Does an unused well count?", answer: "The well condition addresses seller awareness of any water well on the property, whether operating or not. Transaction-specific application belongs with the responsible broker or Texas attorney." },
  { question: "Does a dry pond or tank matter?", answer: "The condition addresses seller awareness of the feature. Present dryness does not itself decide the contract selection or the feature's legal or regulatory status." },
  { question: "Does a no-result well search establish the exemption?", answer: "No. A search result cannot replace seller knowledge, establish the absence of a well, or satisfy the other four conditions." },
  { question: "Is a condominium seller automatically covered by the same paragraph?", answer: "The current final Form 30-18 does not contain the Seller's Water Disclosure paragraph found in the five other compared contracts. The actual condominium transaction documents and any other applicable duties still require review." },
  { question: "Can a broker or sales agent answer the form for the seller?", answer: "Form 61-0 asks for the seller's knowledge. A license holder should not invent or choose seller answers, and Rule §537.11 restricts legal advice and legal-effect opinions." },
  { question: "Is Form 61-0 the same as Form 55-1?", answer: "No. Form 61-0 addresses groundwater and surface-water matters; Form 55-1 is a separate property-condition Seller's Disclosure Notice." },
  { question: "What happens when the form is delivered after the effective date?", answer: "The covered contracts state buyer-right language tied to delivery and receipt. The executed contract, its effective date, the actual receipt date, and transaction facts control; this page does not calculate or advise on a deadline." },
  { question: "Does a buyer's signature mean the buyer verified the seller's answers?", answer: "The final form provides Buyer/Date signature lines but does not label them as buyer verification of each seller statement. Ask the responsible broker or Texas attorney about the effect of a signature in a particular transaction." },
  { question: "What if an attorney-prepared contract is being used?", answer: "Rule §537.11 includes a possible exception for an attorney-prepared form required by the property owner. Review who prepared and required the document, its actual terms, and any separate duties." },
  { question: "What if the parties disagree about whether the form applies?", answer: "Preserve the executed documents, selections, dates, and disputed facts. Contract applicability and legal-effect disputes require transaction-specific review by the responsible broker or Texas attorney." },
];

export const applicabilityChecklist = [
  "Transaction type",
  "Actual contract name and form number",
  "Contract version and effective date",
  "Seller's Water Disclosure paragraph reference",
  "Delivery option selected in the contract",
  "Condition A — seller awareness of any water well",
  "Condition B — seller awareness of a pond, lake, or water tank",
  "Condition C — seller awareness of a named surface-water authorization",
  "Condition D — seller awareness of groundwater rights severed, sold, or leased",
  "Condition E — water received only from a contract-identified provider type",
  "Seller-known facts documented separately from public-record research",
  "Form 61-0 delivery date",
  "Buyer receipt date",
  "Unresolved broker or attorney questions",
  "Official sources checked with review dates",
  "Documents and final-form copies preserved",
] as const;

export const trecApplicabilityEditorial: EditorialContent = {
  title: "Who Must Complete TREC Form 61-0?",
  description: "Learn when Texas TREC Form 61-0 appears in current contracts, how the five-condition exemption works, who completes the form, and which transaction-specific questions require professional review.",
  canonical: absoluteUrl(trecApplicabilityPath),
  author: texasWaterSourcesAuthor,
  date_published: "2026-07-18",
  date_modified: "2026-07-18",
  primary_question: "Who must complete, deliver, sign, or acknowledge TREC Form 61-0 under the actual transaction documents?",
  official_sources: trecApplicabilitySources,
  related_source_ids: [],
  related_guides: [
    { title: "TREC Form 61-0 research guide", path: "/trec-61-guide", description: "Organize seller-known water facts, official-source research, saved records, and unresolved questions without selecting an answer." },
    { title: "Researching water wells for Form 61-0", path: "/trec-61-guide/water-wells", description: "Keep seller knowledge separate from candidate public well records." },
    { title: "Researching a groundwater district for Form 61-0", path: "/trec-61-guide/groundwater-district", description: "Document district evidence and boundary uncertainty without deciding jurisdiction from an address." },
    { title: "Researching shared and off-property wells", path: "/trec-61-guide/shared-and-off-property-wells", description: "Organize private agreements, beneficiaries, operation, access, and seller confirmation." },
    { title: "Texas well-record research hub", path: "/well-records", description: "Choose an official system and compare possible well records without treating them as parcel proof." },
    { title: "Texas groundwater-district research hub", path: "/groundwater-districts", description: "Use a repeatable boundary-verification workflow with current official district sources." },
    { title: "TCEQ Water Rights Viewer guide", path: "/surface-water-rights", description: "Document a candidate authorization without treating a point or recorded holder as proof of ownership." },
    { title: "Research methodology", path: "/methodology", description: "Review the site's official-source, candidate-match, uncertainty, and professional-review standards." },
    { title: "Independent-service disclaimer", path: "/disclaimer", description: "Review the educational, transaction, title, legal, and professional boundaries for this guide." },
    { title: "Editorial standards", path: "/about/editorial-standards", description: "Read the source, attribution, update-date, limitation, and correction standards." },
    { title: "Corrections and source changes", path: "/about/corrections", description: "Learn how factual corrections and changed official links are evaluated and documented." },
  ],
  limitations: [
    "This page does not determine whether Form 61-0 legally applies to a particular transaction.",
    "This page does not interpret an executed contract or establish whether an exemption is truthful or legally sufficient.",
    "This page does not determine seller knowledge or select a seller response.",
    "This page does not calculate a delivery, receipt, review, or termination deadline.",
    "This page does not advise a party to deliver, sign, terminate, enforce, or waive rights.",
    "This page does not determine title, ownership, severance, transferability, jurisdiction, or compliance.",
    "A public-record result or no-result search does not establish seller knowledge or property association.",
    "The final executed contract, effective date, receipt date, selections, roles, and transaction facts control transaction-specific analysis.",
    "This page does not replace the responsible broker, title professional, surveyor, or Texas attorney.",
  ],
};
