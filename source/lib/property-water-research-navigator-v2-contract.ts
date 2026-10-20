import {
  navigatorRecordRoleLabels,
  requiredServiceBoundary,
  requiredSourceUniverseNote,
} from "@/lib/property-water-research-navigator-v2-copy";

export const propertyWaterResearchNavigatorV2SchemaCanonicalSha256 = Object.freeze({
  snapshotRequest: "de93f1cc163132471440742fc37f6d161f700251533d1521b8e78da0a6ab45bd",
  snapshotResponse: "9f2da7a90b3d6140e17a91946ddb6e2c20459eaa76d307bc0797615b0ee8acae",
});

export const researchTaskStatuses = [
  "completed_automatically",
  "records_found_to_review",
  "manual_search_needed",
  "seller_question_needed",
  "professional_help_may_be_needed",
  "source_temporarily_unavailable",
  "not_relevant_for_this_property",
] as const;

export type ResearchTaskStatus = (typeof researchTaskStatuses)[number];
export type GwdbCoverageState = "covered_with_records" | "covered_no_record" | "outside_current_coverage" | "source_temporarily_unavailable";
export type ResearchRecordKind = "submitted_drillers_report" | "plugging_report" | "gwdb_well" | "surface_water";
export type ResearchRecordRole = keyof typeof navigatorRecordRoleLabels;
export type ProfessionalType = "Well professional" | "Accredited water laboratory" | "Surveyor" | "Title company or Texas attorney" | "Groundwater district" | "Utility";

export type SourceBandSummary = {
  closest: number;
  nearby: number;
  area: number;
  broader_area: number;
  total: number;
  cards_shown: number;
};

export type ResearchIdentifier = { label: string; value: string };
export type RecordDetail = { label: string; value: string };

export type ResearchFinding = {
  finding_id: string;
  source_id: string;
  heading: string;
  status: ResearchTaskStatus;
  what_we_found: string;
  why_it_matters: string;
  what_to_do_next: string;
  what_it_does_not_prove: string;
};

export type ResearchRecordLead = {
  record_kind: ResearchRecordKind;
  record_id: string;
  source_id: string;
  heading: string;
  identifier_label: string;
  identifier_value: string;
  distance_band: string;
  rounded_distance: string | null;
  official_url: string;
  source_date: string;
  record_role: ResearchRecordRole;
  role_label: (typeof navigatorRecordRoleLabels)[ResearchRecordRole];
  details: RecordDetail[];
  broader_area: boolean;
};

export type ResearchTask = {
  task_id: string;
  priority: number;
  source_id: string;
  source_name: string;
  why_it_matters: string;
  applies_when: string;
  automatic_search_summary: string;
  what_was_found: string;
  identifiers: ResearchIdentifier[];
  official_url: string;
  manual_steps: string[];
  fields_to_compare: string[];
  supports_possible_match: string[];
  rejects_possible_match: string[];
  what_it_cannot_prove: string;
  remaining_answer_source: string;
  status: ResearchTaskStatus;
  trec_61_0_topic: string;
};

export type PropertyWaterResearchNavigatorV2Response = {
  schema_version: "v2";
  lookup_id: string;
  property: {
    address_label: string;
    county: string;
    state: "Texas";
    data_checked_through: string;
  };
  quick_summary: {
    overview: string;
    source_universe_note: typeof requiredSourceUniverseNote;
    drilling_reports: SourceBandSummary;
    plugging_reports: SourceBandSummary;
    groundwater_database: {
      within_1_mile: number;
      within_3_miles: number;
      within_5_miles: number;
      cards_shown: number;
      search_radius_miles: 0 | 1 | 3 | 5;
      coverage_state: GwdbCoverageState;
    };
    surface_water_records: SourceBandSummary;
    manual_steps_remain: boolean;
  };
  findings: ResearchFinding[];
  record_leads: ResearchRecordLead[];
  research_tasks: ResearchTask[];
  seller_questions: Array<{ question_id: string; question: string; why_ask: string; answer_source: "seller" }>;
  professional_questions: Array<{ professional_type: ProfessionalType; when_to_use: string; question: string }>;
  official_sources: Array<{
    source_id: string;
    source_name: string;
    official_url: string;
    data_checked_through: string | null;
    how_to_search: string;
  }>;
  important_limits: string[];
  service_option: {
    heading: string;
    boundary: string;
    cta_label: "Have Texas Water Sources complete the research";
    cta_url: "/contact#research";
    public_records_free: true;
    creates_case: false;
    customer_delivery_allowed: false;
    payment_execution_allowed: false;
  };
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exact(value: JsonRecord, keys: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${label} contains unexpected or missing fields`);
  }
}

function text(value: unknown, label: string, minimum = 1, maximum = 900): string {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum || value !== value.trim()) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

function integer(value: unknown, label: string, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new Error(`${label} is invalid`);
  }
  return value as number;
}

function sourceBandSummary(value: unknown, label: string): SourceBandSummary {
  if (!isRecord(value)) throw new Error(`${label} is invalid`);
  exact(value, ["closest", "nearby", "area", "broader_area", "total", "cards_shown"], label);
  const parsed = {
    closest: integer(value.closest, `${label} closest`),
    nearby: integer(value.nearby, `${label} nearby`),
    area: integer(value.area, `${label} area`),
    broader_area: integer(value.broader_area, `${label} broader area`),
    total: integer(value.total, `${label} total`),
    cards_shown: integer(value.cards_shown, `${label} cards shown`, 0, 100),
  };
  if (parsed.total !== parsed.closest + parsed.nearby + parsed.area + parsed.broader_area) {
    throw new Error(`${label} total does not match its distance tiers`);
  }
  if (parsed.cards_shown > parsed.total) throw new Error(`${label} card count exceeds its source total`);
  return parsed;
}

function date(value: unknown, label: string): string {
  const result = text(value, label, 10, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) {
    throw new Error(`${label} is invalid`);
  }
  return result;
}

function url(value: unknown, label: string): string {
  const result = text(value, label, 8, 500);
  let parsed: URL;
  try {
    parsed = new URL(result);
  } catch {
    throw new Error(`${label} is invalid`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error(`${label} is invalid`);
  return result;
}

function stringArray(value: unknown, label: string, minimum: number, maximum: number): string[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) throw new Error(`${label} is invalid`);
  return value.map((item, index) => text(item, `${label}[${index}]`, 1, 600));
}

function status(value: unknown, label: string): ResearchTaskStatus {
  if (typeof value !== "string" || !(researchTaskStatuses as readonly string[]).includes(value)) {
    throw new Error(`${label} is invalid`);
  }
  return value as ResearchTaskStatus;
}

const forbiddenFields = new Set([
  "latitude", "longitude", "coordinate", "coordinates", "extent", "exact_distance", "exact_distance_miles",
  "provider_payload", "internal_path", "owner", "owner_name", "holder", "holder_name", "driller",
  "mailing_address", "phone", "email", "raw_comments", "raw_fields_json", "case_id", "manifest", "source_row_sha256",
]);

function rejectForbiddenFields(value: unknown, path = "$"): void {
  if (Array.isArray(value)) {
    value.forEach((child, index) => rejectForbiddenFields(child, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (forbiddenFields.has(normalized) || normalized.startsWith("exact_distance")) {
      throw new Error(`Private or unapproved field rejected at ${path}.${key}`);
    }
    rejectForbiddenFields(child, `${path}.${key}`);
  }
}

function identifier(value: unknown, label: string): ResearchIdentifier {
  if (!isRecord(value)) throw new Error(`${label} is invalid`);
  exact(value, ["label", "value"], label);
  const parsedLabel = text(value.label, `${label}.label`, 1, 80);
  const allowed = new Set(["Confirmed address", "County", "Tracking number", "State Well Number", "WR_ID", "District name", "Parcel/account ID", "Legal description"]);
  if (!allowed.has(parsedLabel)) throw new Error(`${label}.label is not approved`);
  return { label: parsedLabel, value: text(value.value, `${label}.value`, 1, 240) };
}

function detail(value: unknown, label: string): RecordDetail {
  if (!isRecord(value)) throw new Error(`${label} is invalid`);
  exact(value, ["label", "value"], label);
  return { label: text(value.label, `${label}.label`, 1, 100), value: text(value.value, `${label}.value`, 1, 300) };
}

function finding(value: unknown, index: number): ResearchFinding {
  if (!isRecord(value)) throw new Error(`Finding ${index} is invalid`);
  exact(value, ["finding_id", "source_id", "heading", "status", "what_we_found", "why_it_matters", "what_to_do_next", "what_it_does_not_prove"], `Finding ${index}`);
  return {
    finding_id: text(value.finding_id, `Finding ${index} ID`, 3, 80),
    source_id: text(value.source_id, `Finding ${index} source`, 3, 80),
    heading: text(value.heading, `Finding ${index} heading`, 1, 140),
    status: status(value.status, `Finding ${index} status`),
    what_we_found: text(value.what_we_found, `Finding ${index} result`),
    why_it_matters: text(value.why_it_matters, `Finding ${index} reason`),
    what_to_do_next: text(value.what_to_do_next, `Finding ${index} action`),
    what_it_does_not_prove: text(value.what_it_does_not_prove, `Finding ${index} limit`),
  };
}

function recordLead(value: unknown, index: number): ResearchRecordLead {
  if (!isRecord(value)) throw new Error(`Record ${index} is invalid`);
  exact(value, ["record_kind", "record_id", "source_id", "heading", "identifier_label", "identifier_value", "distance_band", "rounded_distance", "official_url", "source_date", "record_role", "role_label", "details", "broader_area"], `Record ${index}`);
  const kinds = ["submitted_drillers_report", "plugging_report", "gwdb_well", "surface_water"] as const;
  if (typeof value.record_kind !== "string" || !(kinds as readonly string[]).includes(value.record_kind)) throw new Error(`Record ${index} kind is invalid`);
  if (!Array.isArray(value.details) || value.details.length > 12) throw new Error(`Record ${index} details are invalid`);
  if (typeof value.broader_area !== "boolean") throw new Error(`Record ${index} area flag is invalid`);
  const kind = value.record_kind as ResearchRecordLead["record_kind"];
  const allowedDetailLabels: Record<ResearchRecordLead["record_kind"], Set<string>> = {
    submitted_drillers_report: new Set(["Report type", "Use or drilling type", "Borehole depth", "County"]),
    plugging_report: new Set(["Report type", "Use or drilling type", "Borehole depth", "County"]),
    gwdb_well: new Set(["County", "Aquifer", "Well use", "Well type", "Recorded well depth", "Drilling year", "Texas Water Development Board record status", "Water-level measurements", "Water-level date range", "Latest recorded depth below land surface", "Water-quality sample records", "Water-quality date range", "Other record types"]),
    surface_water: new Set(["Right or type number", "Mapped point type", "Mapped point count"]),
  };
  const parsedDetails = value.details.map((item, detailIndex) => detail(item, `Record ${index} detail ${detailIndex}`));
  if (parsedDetails.some((item) => !allowedDetailLabels[kind].has(item.label))) throw new Error(`Record ${index} detail label is not approved`);
  const identifierByKind = { submitted_drillers_report: "Tracking number", plugging_report: "Tracking number", gwdb_well: "State Well Number", surface_water: "WR_ID" } as const;
  if (value.identifier_label !== identifierByKind[kind]) throw new Error(`Record ${index} identifier label is invalid`);
  const distanceBands = ["Closest: 0–250 feet", "Nearby: over 250 feet–0.25 mile", "Area: over 0.25–0.5 mile", "Broader area: over 0.5–1 mile", "Within 1 mile", "Over 1–3 miles", "Over 3–5 miles"];
  if (typeof value.distance_band !== "string" || !distanceBands.includes(value.distance_band)) throw new Error(`Record ${index} distance band is invalid`);
  const roleByKind: Record<ResearchRecordKind, ResearchRecordRole> = {
    submitted_drillers_report: "possible_property_record",
    plugging_report: "historical_plugging_record",
    gwdb_well: "nearby_area_context",
    surface_water: "mapped_surface_water_lead",
  };
  const expectedRole = roleByKind[kind];
  if (value.record_role !== expectedRole) throw new Error(`Record ${index} role is invalid`);
  if (value.role_label !== navigatorRecordRoleLabels[expectedRole]) throw new Error(`Record ${index} role label is invalid`);
  return {
    record_kind: kind,
    record_id: text(value.record_id, `Record ${index} ID`, 3, 120),
    source_id: text(value.source_id, `Record ${index} source`, 3, 80),
    heading: text(value.heading, `Record ${index} heading`, 1, 160),
    identifier_label: text(value.identifier_label, `Record ${index} identifier label`, 1, 80),
    identifier_value: text(value.identifier_value, `Record ${index} identifier`, 1, 120),
    distance_band: text(value.distance_band, `Record ${index} distance band`, 1, 80),
    rounded_distance: value.rounded_distance === null ? null : text(value.rounded_distance, `Record ${index} distance`, 1, 80),
    official_url: url(value.official_url, `Record ${index} URL`),
    source_date: date(value.source_date, `Record ${index} source date`),
    record_role: expectedRole,
    role_label: navigatorRecordRoleLabels[expectedRole],
    details: parsedDetails,
    broader_area: value.broader_area,
  };
}

function task(value: unknown, index: number): ResearchTask {
  if (!isRecord(value)) throw new Error(`Task ${index} is invalid`);
  exact(value, ["task_id", "priority", "source_id", "source_name", "why_it_matters", "applies_when", "automatic_search_summary", "what_was_found", "identifiers", "official_url", "manual_steps", "fields_to_compare", "supports_possible_match", "rejects_possible_match", "what_it_cannot_prove", "remaining_answer_source", "status", "trec_61_0_topic"], `Task ${index}`);
  if (!Array.isArray(value.identifiers) || value.identifiers.length > 60) throw new Error(`Task ${index} identifiers are invalid`);
  return {
    task_id: text(value.task_id, `Task ${index} ID`, 3, 80),
    priority: integer(value.priority, `Task ${index} priority`, 1, 20),
    source_id: text(value.source_id, `Task ${index} source ID`, 3, 80),
    source_name: text(value.source_name, `Task ${index} source name`, 1, 160),
    why_it_matters: text(value.why_it_matters, `Task ${index} reason`, 1, 600),
    applies_when: text(value.applies_when, `Task ${index} applicability`, 1, 500),
    automatic_search_summary: text(value.automatic_search_summary, `Task ${index} automatic search`, 1, 600),
    what_was_found: text(value.what_was_found, `Task ${index} result`),
    identifiers: value.identifiers.map((item, identifierIndex) => identifier(item, `Task ${index} identifier ${identifierIndex}`)),
    official_url: url(value.official_url, `Task ${index} URL`),
    manual_steps: stringArray(value.manual_steps, `Task ${index} steps`, 1, 10),
    fields_to_compare: stringArray(value.fields_to_compare, `Task ${index} fields`, 1, 12),
    supports_possible_match: stringArray(value.supports_possible_match, `Task ${index} support rules`, 1, 10),
    rejects_possible_match: stringArray(value.rejects_possible_match, `Task ${index} rejection rules`, 1, 10),
    what_it_cannot_prove: text(value.what_it_cannot_prove, `Task ${index} limit`, 1, 600),
    remaining_answer_source: text(value.remaining_answer_source, `Task ${index} answer source`, 1, 240),
    status: status(value.status, `Task ${index} status`),
    trec_61_0_topic: text(value.trec_61_0_topic, `Task ${index} topic`, 1, 180),
  };
}

export function validatePropertyWaterResearchNavigatorV2Response(value: unknown): PropertyWaterResearchNavigatorV2Response {
  rejectForbiddenFields(value);
  if (!isRecord(value)) throw new Error("V2 report is not an object");
  exact(value, ["schema_version", "lookup_id", "property", "quick_summary", "findings", "record_leads", "research_tasks", "seller_questions", "professional_questions", "official_sources", "important_limits", "service_option"], "V2 report");
  if (value.schema_version !== "v2") throw new Error("V2 report version is invalid");
  const lookupId = text(value.lookup_id, "lookup_id", 31, 31);
  if (!/^lookup_[0-9a-f]{24}$/.test(lookupId)) throw new Error("lookup_id is invalid");

  if (!isRecord(value.property)) throw new Error("Property is invalid");
  exact(value.property, ["address_label", "county", "state", "data_checked_through"], "Property");
  if (value.property.state !== "Texas") throw new Error("Property state is invalid");
  const property = {
    address_label: text(value.property.address_label, "Property address", 5, 240),
    county: text(value.property.county, "Property county", 2, 80),
    state: "Texas" as const,
    data_checked_through: date(value.property.data_checked_through, "Data checked through"),
  };

  if (!isRecord(value.quick_summary)) throw new Error("Quick summary is invalid");
  exact(value.quick_summary, ["overview", "source_universe_note", "drilling_reports", "plugging_reports", "groundwater_database", "surface_water_records", "manual_steps_remain"], "Quick summary");
  if (typeof value.quick_summary.manual_steps_remain !== "boolean") throw new Error("Manual-step flag is invalid");
  if (value.quick_summary.source_universe_note !== requiredSourceUniverseNote) throw new Error("Source-universe note is invalid");
  const drilling_reports = sourceBandSummary(value.quick_summary.drilling_reports, "Drilling report summary");
  const plugging_reports = sourceBandSummary(value.quick_summary.plugging_reports, "Plugging report summary");
  const surface_water_records = sourceBandSummary(value.quick_summary.surface_water_records, "Surface-water summary");
  if (!isRecord(value.quick_summary.groundwater_database)) throw new Error("Groundwater Database summary is invalid");
  exact(value.quick_summary.groundwater_database, ["within_1_mile", "within_3_miles", "within_5_miles", "cards_shown", "search_radius_miles", "coverage_state"], "Groundwater Database summary");
  const coverageStates = ["covered_with_records", "covered_no_record", "outside_current_coverage", "source_temporarily_unavailable"] as const;
  if (typeof value.quick_summary.groundwater_database.coverage_state !== "string" || !(coverageStates as readonly string[]).includes(value.quick_summary.groundwater_database.coverage_state)) throw new Error("Groundwater coverage state is invalid");
  if (![0, 1, 3, 5].includes(value.quick_summary.groundwater_database.search_radius_miles as number)) throw new Error("Groundwater search radius is invalid");
  const groundwater_database = {
    within_1_mile: integer(value.quick_summary.groundwater_database.within_1_mile, "One-mile count"),
    within_3_miles: integer(value.quick_summary.groundwater_database.within_3_miles, "Three-mile count"),
    within_5_miles: integer(value.quick_summary.groundwater_database.within_5_miles, "Five-mile count"),
    cards_shown: integer(value.quick_summary.groundwater_database.cards_shown, "Groundwater cards shown", 0, 5),
    search_radius_miles: value.quick_summary.groundwater_database.search_radius_miles as 0 | 1 | 3 | 5,
    coverage_state: value.quick_summary.groundwater_database.coverage_state as GwdbCoverageState,
  };
  if (!(groundwater_database.within_1_mile <= groundwater_database.within_3_miles && groundwater_database.within_3_miles <= groundwater_database.within_5_miles)) {
    throw new Error("Groundwater counts are not cumulative");
  }
  const quick_summary = {
    overview: text(value.quick_summary.overview, "Overview", 1, 600),
    source_universe_note: requiredSourceUniverseNote as typeof requiredSourceUniverseNote,
    drilling_reports,
    plugging_reports,
    groundwater_database,
    surface_water_records,
    manual_steps_remain: value.quick_summary.manual_steps_remain,
  };

  if (!Array.isArray(value.findings) || value.findings.length !== 5) throw new Error("Finding inventory is invalid");
  if (!Array.isArray(value.record_leads) || value.record_leads.length > 120) throw new Error("Record inventory is invalid");
  if (!Array.isArray(value.research_tasks) || value.research_tasks.length < 7 || value.research_tasks.length > 14) throw new Error("Task inventory is invalid");
  const findings = value.findings.map(finding);
  const record_leads = value.record_leads.map(recordLead);
  const research_tasks = value.research_tasks.map(task);
  const renderedCardCounts: Record<ResearchRecordKind, number> = {
    submitted_drillers_report: record_leads.filter((row) => row.record_kind === "submitted_drillers_report").length,
    plugging_report: record_leads.filter((row) => row.record_kind === "plugging_report").length,
    gwdb_well: record_leads.filter((row) => row.record_kind === "gwdb_well").length,
    surface_water: record_leads.filter((row) => row.record_kind === "surface_water").length,
  };
  if (
    renderedCardCounts.submitted_drillers_report !== quick_summary.drilling_reports.cards_shown ||
    renderedCardCounts.plugging_report !== quick_summary.plugging_reports.cards_shown ||
    renderedCardCounts.gwdb_well !== quick_summary.groundwater_database.cards_shown ||
    renderedCardCounts.surface_water !== quick_summary.surface_water_records.cards_shown
  ) throw new Error("Source summary card counts do not match the record inventory");

  if (!Array.isArray(value.seller_questions) || value.seller_questions.length < 2 || value.seller_questions.length > 12) throw new Error("Seller questions are invalid");
  const seller_questions = value.seller_questions.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Seller question ${index} is invalid`);
    exact(item, ["question_id", "question", "why_ask", "answer_source"], `Seller question ${index}`);
    if (item.answer_source !== "seller") throw new Error(`Seller question ${index} answer source is invalid`);
    return { question_id: text(item.question_id, `Seller question ${index} ID`, 3, 80), question: text(item.question, `Seller question ${index}`), why_ask: text(item.why_ask, `Seller question ${index} reason`, 1, 500), answer_source: "seller" as const };
  });

  if (!Array.isArray(value.professional_questions) || value.professional_questions.length > 6) throw new Error("Professional questions are invalid");
  const professionalTypes = ["Well professional", "Accredited water laboratory", "Surveyor", "Title company or Texas attorney", "Groundwater district", "Utility"] as const;
  const professional_questions = value.professional_questions.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Professional question ${index} is invalid`);
    exact(item, ["professional_type", "when_to_use", "question"], `Professional question ${index}`);
    if (typeof item.professional_type !== "string" || !(professionalTypes as readonly string[]).includes(item.professional_type)) throw new Error(`Professional question ${index} type is invalid`);
    return { professional_type: item.professional_type as ProfessionalType, when_to_use: text(item.when_to_use, `Professional question ${index} timing`, 1, 500), question: text(item.question, `Professional question ${index}`, 1, 500) };
  });
  if (new Set(professional_questions.map((item) => item.professional_type)).size !== professional_questions.length) throw new Error("Professional question types must be unique");

  if (!Array.isArray(value.official_sources) || value.official_sources.length < 6 || value.official_sources.length > 14) throw new Error("Official sources are invalid");
  const official_sources = value.official_sources.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Official source ${index} is invalid`);
    exact(item, ["source_id", "source_name", "official_url", "data_checked_through", "how_to_search"], `Official source ${index}`);
    return {
      source_id: text(item.source_id, `Official source ${index} ID`, 3, 80),
      source_name: text(item.source_name, `Official source ${index} name`, 1, 180),
      official_url: url(item.official_url, `Official source ${index} URL`),
      data_checked_through: item.data_checked_through === null ? null : date(item.data_checked_through, `Official source ${index} date`),
      how_to_search: text(item.how_to_search, `Official source ${index} instructions`, 1, 500),
    };
  });

  const important_limits = stringArray(value.important_limits, "Important limits", 4, 10);
  if (!isRecord(value.service_option)) throw new Error("Service option is invalid");
  exact(value.service_option, ["heading", "boundary", "cta_label", "cta_url", "public_records_free", "creates_case", "customer_delivery_allowed", "payment_execution_allowed"], "Service option");
  if (
    value.service_option.cta_label !== "Have Texas Water Sources complete the research" ||
    value.service_option.cta_url !== "/contact#research" ||
    value.service_option.boundary !== requiredServiceBoundary ||
    value.service_option.public_records_free !== true || value.service_option.creates_case !== false ||
    value.service_option.customer_delivery_allowed !== false || value.service_option.payment_execution_allowed !== false
  ) throw new Error("Service option posture is invalid");
  const service_option = {
    heading: text(value.service_option.heading, "Service heading", 1, 120),
    boundary: text(value.service_option.boundary, "Service boundary", 1, 600),
    cta_label: "Have Texas Water Sources complete the research" as const,
    cta_url: "/contact#research" as const,
    public_records_free: true as const,
    creates_case: false as const,
    customer_delivery_allowed: false as const,
    payment_execution_allowed: false as const,
  };
  return { schema_version: "v2", lookup_id: lookupId, property, quick_summary, findings, record_leads, research_tasks, seller_questions, professional_questions, official_sources, important_limits, service_option };
}
