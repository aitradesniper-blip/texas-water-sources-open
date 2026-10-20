"use client";

import { InteractiveWorksheet } from "@/app/components/worksheets/InteractiveWorksheet";
import type { WorksheetDefinition } from "@/app/components/worksheets/worksheet-types";
import type { WorksheetValues } from "@/app/components/worksheets/worksheet-types";
import { SurfaceCandidatePrintDocument } from "./SurfaceCandidatePrintDocument";

const matchStatusOptions = [
  { value: "likely-candidate", label: "Likely candidate" },
  { value: "candidate-only", label: "Candidate only" },
  { value: "conflicting-evidence", label: "Conflicting evidence" },
  { value: "no-public-result", label: "No public result" },
  { value: "unresolved", label: "Unresolved" },
] as const;

export const surfaceCandidateWorksheetDefinition: WorksheetDefinition = {
  id: "surface-water-candidate",
  storageVersion: 1,
  storageKey: "texas-water-sources:worksheet:surface-water-candidate:v1",
  title: "Surface-Water Candidate Worksheet",
  subtitle: "Document one candidate authorization, the sources checked, property evidence compared, and questions that remain unresolved.",
  privacyNotice: "Information entered here remains in this browser and is not submitted to Texas Water Sources. Saving is optional. Use Clear form to remove the saved draft from this browser.",
  officialFormNotice: "This is not an official TCEQ form or official TREC form, a permit application, a title opinion, or a legal document.",
  boundaryStatement: "This worksheet documents a search and comparison. It does not establish ownership, transfer, title, appurtenance, validity, priority, exemption, permitting, compliance, or the legal effect of an authorization or transaction.",
  limitations: [
    "All fields are optional. A blank field preserves an open research question; it does not prove that no record or issue exists.",
    "Keep viewer observations, authorization documents, property evidence, and professional-review questions separate.",
  ],
  footerLabel: "Texas Water Sources · Surface-Water Candidate Worksheet",
  completedPrintMode: "surface-water-candidate",
  blankPrintMode: "surface-water-candidate-blank",
  sections: [
    {
      id: "property-search-reference",
      title: "1. Property and search reference",
      description: "Use a private working label and the search context needed to reproduce this research. Do not enter sensitive personal information.",
      printPage: 1,
      fields: [
        { id: "property-research-label", label: "Property or research label", help: "A private label for this research file; it is not submitted to Texas Water Sources.", type: "short-text", maxLength: 240, printPage: 1, writingSpace: "compact" },
        { id: "county", label: "County", help: "Record the county used to orient the search.", type: "short-text", maxLength: 120, printPage: 1, writingSpace: "compact" },
        { id: "viewer-search-date", label: "Viewer search date", help: "Date the viewer, layers, and linked records were checked.", type: "date", maxLength: 10, printPage: 1, writingSpace: "compact" },
        { id: "researcher-file-reference", label: "Researcher or file reference", help: "Optional internal reference for organizing this worksheet.", type: "short-text", maxLength: 240, printPage: 1, writingSpace: "compact" },
      ],
    },
    {
      id: "authorization-identification",
      title: "2. Authorization identification",
      description: "Transcribe identifiers and displayed attributes without converting them into an ownership or transfer conclusion.",
      printPage: 1,
      fields: [
        { id: "authorization-identifier", label: "Authorization identifier", help: "Record the number and type exactly as displayed.", type: "short-text", maxLength: 240, printPage: 1, writingSpace: "compact" },
        { id: "permit-certificate", label: "Permit or certificate", help: "Keep separate permits, certificates, amendments, and adjudication records distinct.", type: "short-text", maxLength: 240, printPage: 1, writingSpace: "compact" },
        { id: "recorded-holder", label: "Recorded holder as displayed", help: "Preserve the displayed label and name; this is not a current title conclusion.", type: "multiline", maxLength: 2000, printPage: 1, writingSpace: "standard", fullWidth: true },
        { id: "basin", label: "Basin", help: "Record the basin named by the official record.", type: "short-text", maxLength: 240, printPage: 1, writingSpace: "compact" },
        { id: "authorized-reported-purpose", label: "Authorized or reported purpose", help: "Identify the source and keep authorization terms separate from reported use.", type: "multiline", maxLength: 2000, printPage: 1, writingSpace: "standard", fullWidth: true },
        { id: "match-status", label: "Match status", help: "Choose a bounded research status that preserves uncertainty.", type: "select", options: matchStatusOptions, maxLength: 24, printPage: 1, writingSpace: "compact" },
      ],
    },
    {
      id: "mapped-document-evidence",
      title: "3. Mapped and document evidence",
      description: "Record where each observation came from and retain the access date. User-entered links print as text, not executable links.",
      printPage: 2,
      fields: [
        { id: "diversion-impoundment-location", label: "Diversion or impoundment location", help: "Record the displayed point, layer, description, and location uncertainty.", type: "multiline", maxLength: 4000, printPage: 2, writingSpace: "standard", fullWidth: true },
        { id: "place-of-use-information", label: "Place-of-use information", help: "Keep document language, viewer display, and unresolved limits separate.", type: "multiline", maxLength: 4000, printPage: 2, writingSpace: "standard", fullWidth: true },
        { id: "documents-opened", label: "Documents opened", help: "Record titles, dates, instrument types, and documents reviewed.", type: "multiline", maxLength: 4000, printPage: 2, writingSpace: "standard", fullWidth: true },
        { id: "official-source-links-access-dates", label: "Official source links and access dates", help: "Enter source URLs and dates as plain research text.", type: "multiline", maxLength: 4000, printPage: 2, writingSpace: "standard", fullWidth: true },
      ],
    },
    {
      id: "property-comparison-unresolved",
      title: "4. Property comparison and unresolved questions",
      description: "Separate supporting evidence, conflicts, missing items, and questions for qualified professional review.",
      printPage: 2,
      fields: [
        { id: "property-evidence-compared", label: "Property evidence compared", help: "Note legal descriptions, deeds, title materials, surveys, and seller information checked.", type: "multiline", maxLength: 4000, printPage: 2, writingSpace: "standard", fullWidth: true },
        { id: "agreements-conflicts-mismatches", label: "Agreements, conflicts, or mismatches", help: "Record both supporting comparisons and details that do not align.", type: "multiline", maxLength: 4000, printPage: 2, writingSpace: "standard", fullWidth: true },
        { id: "missing-evidence", label: "Missing evidence", help: "List documents, facts, or source checks that remain unavailable.", type: "multiline", maxLength: 4000, printPage: 2, writingSpace: "standard", fullWidth: true },
        { id: "professional-review-questions", label: "Professional-review questions", help: "State ownership, transfer, reservation, validity, scope, interpretation, filing, or agency follow-up questions without answering them here.", type: "multiline", maxLength: 4000, printPage: 2, writingSpace: "large", fullWidth: true },
      ],
    },
  ],
};

export function SurfaceCandidateWorksheet({
  externalSaveRequest,
  onExternalSaveResult,
}: {
  externalSaveRequest?: { id: number; values: WorksheetValues } | null;
  onExternalSaveResult?: (requestId: number, saved: boolean) => void;
} = {}) {
  return <InteractiveWorksheet
    definition={surfaceCandidateWorksheetDefinition}
    renderPrintDocument={(values) => <SurfaceCandidatePrintDocument definition={surfaceCandidateWorksheetDefinition} values={values} />}
    externalSaveRequest={externalSaveRequest}
    onExternalSaveResult={onExternalSaveResult}
  />;
}
