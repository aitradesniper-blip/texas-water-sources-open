export const publicFreeLookupSchemaCanonicalSha256 = Object.freeze({
  candidateRequest: "fc0b27a31d4a8567b5539f5d5417471f637c500a1cfb71b64c91c4c36c358b51",
  candidateResponse: "897eddcae15fa89eaae36da21ccbb7eaab3848d58466467209421b4d68ee3aba",
  snapshotRequest: "49add4703376ffd6deae1c20188ac37503160d09329aa519566070d8340e9b37",
  snapshotResponse: "19811e5415695b09e70c252f0ecd3fdd90c6e2347a508b2ca6be7973120fb961",
});

export const freeLookupSectionOrder = [
  "groundwater_district_context",
  "submitted_drillers_report_candidates",
  "plugging_report_candidates",
  "groundwater_observation_context",
  "surface_water_right_candidates",
  "research_limitations",
] as const;

export const freeLookupStatusValues = [
  "record_context_found",
  "candidate_records_found",
  "no_candidate_in_managed_snapshot",
  "manual_review_required",
  "source_not_available",
] as const;

export type FreeLookupSectionId = (typeof freeLookupSectionOrder)[number];
export type FreeLookupSectionStatus = (typeof freeLookupStatusValues)[number];

export type FreeLookupCandidate = {
  candidate_id: string;
  address_label: string;
  county: string;
  state: "Texas";
  postal_code: string;
  match_score: number;
  address_type: string;
  confirmation_required: true;
};

export type FreeLookupCandidateResponse = {
  schema_version: "v1";
  client_request_id: string;
  candidates: FreeLookupCandidate[];
};

export type FreeLookupSection = {
  section_id: FreeLookupSectionId;
  heading: string;
  status: FreeLookupSectionStatus;
  summary: string;
  candidate_count: number | null;
  manual_review_required: boolean;
  source_ids: string[];
  limitations: string[];
};

export type FreeLookupSource = {
  source_id: string;
  official_source_name: string;
  official_url: string;
  source_access_or_snapshot_date: string;
  evidence_role: string;
  limitations: string[];
  not_endorsed_by_state: true;
};

export type FreeLookupSnapshotResponse = {
  schema_version: "v1";
  lookup_id: string;
  lookup_status: "screening_snapshot_ready" | "manual_review_required" | "partial_source_unavailable";
  property_label: string;
  county: string;
  state: "Texas";
  snapshot_date: string;
  managed_data_as_of: string;
  sections: FreeLookupSection[];
  source_links: FreeLookupSource[];
  limitations: string[];
  next_steps: string[];
  public_free_lookup_only: true;
  reviewed_report_created: false;
  seller_answers_selected: false;
  property_identity_established: false;
  exact_coordinates_included: false;
  customer_delivery_allowed: false;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireExactKeys(value: JsonRecord, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} contains unexpected or missing fields`);
  }
}

function requireString(value: unknown, label: string, minimum = 1, maximum = 800): string {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum || value !== value.trim()) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

function requireStringArray(value: unknown, label: string, minimum = 0, maximum = 12): string[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    throw new Error(`${label} is invalid`);
  }
  return value.map((item, index) => requireString(item, `${label}[${index}]`, 1, 600));
}

function requireDate(value: unknown, label: string): string {
  const result = requireString(value, label, 10, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) {
    throw new Error(`${label} is invalid`);
  }
  return result;
}

function requireHttpsUrl(value: unknown, label: string): string {
  const result = requireString(value, label, 8, 500);
  let parsed: URL;
  try {
    parsed = new URL(result);
  } catch {
    throw new Error(`${label} is invalid`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error(`${label} is invalid`);
  }
  return result;
}

function rejectCoordinateFields(value: unknown, path = "$"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectCoordinateFields(item, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    if (key !== "exact_coordinates_included" && /(?:latitude|longitude|coordinates?|extent|exact_distance)/i.test(key)) {
      throw new Error(`Coordinate field rejected at ${path}.${key}`);
    }
    rejectCoordinateFields(nested, `${path}.${key}`);
  }
}

export function validateCandidateResponse(value: unknown): FreeLookupCandidateResponse {
  if (!isRecord(value)) throw new Error("Candidate response is not an object");
  requireExactKeys(value, ["schema_version", "client_request_id", "candidates"], "Candidate response");
  if (value.schema_version !== "v1") throw new Error("Candidate response version is invalid");
  const requestId = requireString(value.client_request_id, "client_request_id", 1, 64);
  if (!/^[A-Za-z0-9_-]+$/.test(requestId)) throw new Error("client_request_id is invalid");
  if (!Array.isArray(value.candidates) || value.candidates.length > 5) {
    throw new Error("Candidate response candidates are invalid");
  }
  const candidates = value.candidates.map((item, index): FreeLookupCandidate => {
    if (!isRecord(item)) throw new Error(`Candidate ${index} is not an object`);
    requireExactKeys(
      item,
      ["candidate_id", "address_label", "county", "state", "postal_code", "match_score", "address_type", "confirmation_required"],
      `Candidate ${index}`,
    );
    const score = item.match_score;
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error(`Candidate ${index} match score is invalid`);
    }
    if (item.state !== "Texas" || item.confirmation_required !== true) {
      throw new Error(`Candidate ${index} release posture is invalid`);
    }
    const postal = requireString(item.postal_code, `Candidate ${index} postal code`, 5, 10);
    if (!/^\d{5}(?:-\d{4})?$/.test(postal)) throw new Error(`Candidate ${index} postal code is invalid`);
    return {
      candidate_id: requireString(item.candidate_id, `Candidate ${index} ID`, 1, 256),
      address_label: requireString(item.address_label, `Candidate ${index} address`, 5, 240),
      county: requireString(item.county, `Candidate ${index} county`, 2, 80),
      state: "Texas",
      postal_code: postal,
      match_score: score,
      address_type: requireString(item.address_type, `Candidate ${index} address type`, 1, 64),
      confirmation_required: true,
    };
  });
  rejectCoordinateFields(value);
  return { schema_version: "v1", client_request_id: requestId, candidates };
}

export function validateSnapshotResponse(value: unknown): FreeLookupSnapshotResponse {
  if (!isRecord(value)) throw new Error("Snapshot response is not an object");
  requireExactKeys(
    value,
    [
      "schema_version", "lookup_id", "lookup_status", "property_label", "county", "state", "snapshot_date",
      "managed_data_as_of", "sections", "source_links", "limitations", "next_steps", "public_free_lookup_only",
      "reviewed_report_created", "seller_answers_selected", "property_identity_established",
      "exact_coordinates_included", "customer_delivery_allowed",
    ],
    "Snapshot response",
  );
  if (value.schema_version !== "v1" || value.state !== "Texas") throw new Error("Snapshot response posture is invalid");
  if (
    value.public_free_lookup_only !== true || value.reviewed_report_created !== false ||
    value.seller_answers_selected !== false || value.property_identity_established !== false ||
    value.exact_coordinates_included !== false || value.customer_delivery_allowed !== false
  ) {
    throw new Error("Snapshot response release posture is invalid");
  }
  const lookupStatusValues = ["screening_snapshot_ready", "manual_review_required", "partial_source_unavailable"];
  if (typeof value.lookup_status !== "string" || !lookupStatusValues.includes(value.lookup_status)) {
    throw new Error("Snapshot response status is invalid");
  }
  if (!Array.isArray(value.sections) || value.sections.length !== freeLookupSectionOrder.length) {
    throw new Error("Snapshot section inventory is invalid");
  }
  const sections = value.sections.map((item, index): FreeLookupSection => {
    if (!isRecord(item)) throw new Error(`Section ${index} is not an object`);
    requireExactKeys(
      item,
      ["section_id", "heading", "status", "summary", "candidate_count", "manual_review_required", "source_ids", "limitations"],
      `Section ${index}`,
    );
    if (item.section_id !== freeLookupSectionOrder[index]) throw new Error("Snapshot section order is invalid");
    if (typeof item.status !== "string" || !(freeLookupStatusValues as readonly string[]).includes(item.status)) {
      throw new Error(`Section ${index} status is invalid`);
    }
    if (item.candidate_count !== null && (!Number.isInteger(item.candidate_count) || (item.candidate_count as number) < 0)) {
      throw new Error(`Section ${index} candidate count is invalid`);
    }
    if (typeof item.manual_review_required !== "boolean") throw new Error(`Section ${index} review flag is invalid`);
    const sourceIds = requireStringArray(item.source_ids, `Section ${index} source IDs`, 0, 5);
    if (new Set(sourceIds).size !== sourceIds.length || sourceIds.some((id) => !/^[a-z0-9_]{3,80}$/.test(id))) {
      throw new Error(`Section ${index} source IDs are invalid`);
    }
    return {
      section_id: item.section_id as FreeLookupSectionId,
      heading: requireString(item.heading, `Section ${index} heading`, 1, 120),
      status: item.status as FreeLookupSectionStatus,
      summary: requireString(item.summary, `Section ${index} summary`, 1, 800),
      candidate_count: item.candidate_count as number | null,
      manual_review_required: item.manual_review_required,
      source_ids: sourceIds,
      limitations: requireStringArray(item.limitations, `Section ${index} limitations`, 1, 6),
    };
  });
  if (!Array.isArray(value.source_links) || value.source_links.length < 4 || value.source_links.length > 8) {
    throw new Error("Snapshot source inventory is invalid");
  }
  const sourceLinks = value.source_links.map((item, index): FreeLookupSource => {
    if (!isRecord(item)) throw new Error(`Source ${index} is not an object`);
    requireExactKeys(
      item,
      ["source_id", "official_source_name", "official_url", "source_access_or_snapshot_date", "evidence_role", "limitations", "not_endorsed_by_state"],
      `Source ${index}`,
    );
    if (item.not_endorsed_by_state !== true) throw new Error(`Source ${index} endorsement posture is invalid`);
    const sourceId = requireString(item.source_id, `Source ${index} ID`, 3, 80);
    if (!/^[a-z0-9_]+$/.test(sourceId)) throw new Error(`Source ${index} ID is invalid`);
    return {
      source_id: sourceId,
      official_source_name: requireString(item.official_source_name, `Source ${index} name`, 1, 160),
      official_url: requireHttpsUrl(item.official_url, `Source ${index} URL`),
      source_access_or_snapshot_date: requireDate(item.source_access_or_snapshot_date, `Source ${index} date`),
      evidence_role: requireString(item.evidence_role, `Source ${index} role`, 1, 300),
      limitations: requireStringArray(item.limitations, `Source ${index} limitations`, 1, 5),
      not_endorsed_by_state: true,
    };
  });
  if (new Set(sourceLinks.map((source) => source.source_id)).size !== sourceLinks.length) {
    throw new Error("Snapshot source IDs are duplicated");
  }
  const lookupId = requireString(value.lookup_id, "lookup_id", 31, 31);
  if (!/^lookup_[0-9a-f]{24}$/.test(lookupId)) throw new Error("lookup_id is invalid");
  rejectCoordinateFields(value);
  return {
    schema_version: "v1",
    lookup_id: lookupId,
    lookup_status: value.lookup_status as FreeLookupSnapshotResponse["lookup_status"],
    property_label: requireString(value.property_label, "property_label", 5, 240),
    county: requireString(value.county, "county", 2, 80),
    state: "Texas",
    snapshot_date: requireDate(value.snapshot_date, "snapshot_date"),
    managed_data_as_of: requireDate(value.managed_data_as_of, "managed_data_as_of"),
    sections,
    source_links: sourceLinks,
    limitations: requireStringArray(value.limitations, "limitations", 5, 12),
    next_steps: requireStringArray(value.next_steps, "next_steps", 2, 5),
    public_free_lookup_only: true,
    reviewed_report_created: false,
    seller_answers_selected: false,
    property_identity_established: false,
    exact_coordinates_included: false,
    customer_delivery_allowed: false,
  };
}

export function publicErrorMessage(value: unknown): string {
  if (!isRecord(value)) return "The lookup could not be completed.";
  requireExactKeys(value, ["schema_version", "error"], "Error response");
  if (value.schema_version !== "v1" || !isRecord(value.error)) return "The lookup could not be completed.";
  requireExactKeys(value.error, ["code", "message", "trace_id", "retryable"], "Error detail");
  return requireString(value.error.message, "Error message", 1, 200);
}
