export const GCD_PUBLIC_EVENT_DISTRICT_IDS = ["coastal_bend_gcd"] as const;

export type GcdPublicEventDistrictId = (typeof GCD_PUBLIC_EVENT_DISTRICT_IDS)[number];

export type GcdPublicBoardAction = {
  public_event_id: string;
  district_id: GcdPublicEventDistrictId;
  meeting_date: string;
  source_page: number;
  official_source_url: string;
  event_action_summary: string;
  event_outcome_summary: string | null;
  source_context_caveat: string;
  what_it_may_indicate: string;
  what_it_does_not_prove: string;
};

export type GcdPublicEventPackage = {
  schema_version: "gcd-public-event-consumer-v1";
  record_count: 60;
  district_count: 1;
  records: GcdPublicBoardAction[];
};

export type GcdPublicEventArtifactInput = {
  feedText: string;
  feedSha256: string;
  manifest: unknown;
  manifestSha256: string;
  producerValidation: unknown;
  producerValidationSha256: string;
  publicEventSchema: unknown;
  publicEventSchemaSha256: string;
  consumerProvenance: unknown;
  consumerValidation: unknown;
};

export const GCD_PUBLIC_EVENT_EXPECTED = {
  producerRepository: "aitradesniper-blip/texas-gcd-meeting-records",
  producerMergedCommit: "8b26c484d8908b20e38ccbe9b28580a33b20d7fb",
  producerMergedTree: "d686d16614f6554368f0bca7ebb941a7f4351b44",
  feedSha256: "406d1066b74aea2f5ee24ffa33e8dd10355102886962c04dc05e52b49070483c",
  releaseDecisionsSha256: "3e9393c654e59be154c89e07d1ee701f4943a5aea55686c356cc858be4cf0ba5",
  manifestSha256: "f83e7e40f087aa3c23524a90476a535148f39520ed140fac4ff012476ecb178a",
  validationSha256: "fcc62b3d64bced7b0b37f8415e4b5e55cf35f519e7dade3f1b5548999b6515cd",
  packageSha256: "b98b869e8d6e6d4db8abc42540c43f991e2d78556b528a9f9ddf60d13bb4acd2",
  sourceBindingProofSha256: "84e1770136f475464f5458752013afcb1b47dfb16aa84613e0e828ccf62b916e",
  schemaSha256: "d27b5739686c1faaf176df96fae1c18f3330db35ed11085bb7f0c3d12c15ffa7",
  operatorScopeSha256: "52ebd1bef47de2754f9e63b31c11a9bd5572a67e930f4507d0758da6b13c2b69",
  reviewedCandidateSetSha256: "94b58027cabe7789502088a1c6f5cd010e51fa37f51656c0161626d5ad29e4ad",
  records: 60,
  districts: 1,
  districtId: "coastal_bend_gcd",
  outcomes: 56,
  nullOutcomes: 4,
} as const;

export const GCD_PUBLIC_EVENT_NULL_OUTCOME_IDS = [
  "gcd-public-event-candidate-v1-0903288677db894b42a5994eb5920851a1e0acb2e64eb34f4b97d72bf406c963",
  "gcd-public-event-candidate-v1-1fe440032fbafe119cd36e13b66a004e9efc56ba45039826db45ee554fa8bd61",
  "gcd-public-event-candidate-v1-48e232987ba0eb52d5a20b642b1c8b5e8b90ddf6e8f0458e39eb1bce377be912",
  "gcd-public-event-candidate-v1-88df9fc10eea05b9b575c1318fb9e04a36f3f212f139c4db5ae467006d1ee0ad",
] as const;

const sourceEventKeys = [
  "actor_information_omitted",
  "district_id",
  "event_action_summary",
  "event_outcome_summary",
  "meeting_date",
  "model_review_state",
  "official_source_url",
  "public_document_id",
  "public_event_id",
  "release_decision_id",
  "schema_version",
  "source_context_caveat",
  "source_page",
  "what_it_does_not_prove",
  "what_it_may_indicate",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid GCD public-event package: ${message}`);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  assert(actual.length === wanted.length && actual.every((key, index) => key === wanted[index]), `${label} has an unexpected field`);
}

function requiredText(value: unknown, label: string): string {
  assert(typeof value === "string" && value.trim().length > 0, `${label} is missing`);
  return value;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateHttpsUrl(value: unknown, label: string): string {
  const sourceUrl = requiredText(value, label);
  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    throw new Error(`Invalid GCD public-event package: ${label} is invalid`);
  }
  assert(parsed.protocol === "https:" && !parsed.username && !parsed.password, `${label} must be a credential-free HTTPS URL`);
  return sourceUrl;
}

function parseSourceEvent(value: unknown, index: number): GcdPublicBoardAction {
  assert(isRecord(value), `event ${index} must be an object`);
  exactKeys(value, sourceEventKeys, `event ${index}`);
  const publicEventId = requiredText(value.public_event_id, `event ${index} ID`);
  assert(/^gcd-public-event-candidate-v1-[0-9a-f]{64}$/.test(publicEventId), `event ${index} ID is invalid`);
  assert(value.district_id === GCD_PUBLIC_EVENT_EXPECTED.districtId, `event ${index} district is invalid`);
  const meetingDate = requiredText(value.meeting_date, `event ${index} meeting date`);
  assert(isIsoDate(meetingDate), `event ${index} meeting date is invalid`);
  assert(Number.isInteger(value.source_page) && (value.source_page as number) > 0, `event ${index} source page is invalid`);
  const action = requiredText(value.event_action_summary, `event ${index} action summary`);
  assert(action.startsWith("A motion was made to "), `event ${index} action summary identity is invalid`);
  assert(value.event_outcome_summary === null || (typeof value.event_outcome_summary === "string" && value.event_outcome_summary.trim().length > 0), `event ${index} outcome summary is invalid`);
  assert(value.actor_information_omitted === true, `event ${index} actor omission is invalid`);
  assert(value.model_review_state === "MODEL_REVIEW_PASS", `event ${index} model review state is invalid`);
  assert(typeof value.public_document_id === "string" && /^gcd-doc-v1-[a-z2-7]{26}$/.test(value.public_document_id), `event ${index} document ID is invalid`);
  assert(typeof value.release_decision_id === "string" && /^gcd-public-event-release-decision-v1-[0-9a-f]{64}$/.test(value.release_decision_id), `event ${index} release decision is invalid`);
  assert(value.schema_version === "gcd-public-event-feed-v1", `event ${index} schema version is invalid`);
  return {
    public_event_id: publicEventId,
    district_id: GCD_PUBLIC_EVENT_EXPECTED.districtId,
    meeting_date: meetingDate,
    source_page: value.source_page as number,
    official_source_url: validateHttpsUrl(value.official_source_url, `event ${index} source URL`),
    event_action_summary: action,
    event_outcome_summary: value.event_outcome_summary as string | null,
    source_context_caveat: requiredText(value.source_context_caveat, `event ${index} source caveat`),
    what_it_may_indicate: requiredText(value.what_it_may_indicate, `event ${index} indication`),
    what_it_does_not_prove: requiredText(value.what_it_does_not_prove, `event ${index} limitation`),
  };
}

function validateAuthorityArtifacts(input: GcdPublicEventArtifactInput) {
  const expected = GCD_PUBLIC_EVENT_EXPECTED;
  assert(input.feedSha256 === expected.feedSha256, "event feed hash mismatch");
  assert(input.manifestSha256 === expected.manifestSha256, "producer manifest hash mismatch");
  assert(input.producerValidationSha256 === expected.validationSha256, "producer validation hash mismatch");
  assert(input.publicEventSchemaSha256 === expected.schemaSha256, "producer schema hash mismatch");
  assert(isRecord(input.manifest), "producer manifest is missing");
  assert(input.manifest.event_payload_sha256 === expected.feedSha256, "manifest feed binding mismatch");
  assert(input.manifest.release_decisions_sha256 === expected.releaseDecisionsSha256, "manifest decision binding mismatch");
  assert(input.manifest.event_schema_sha256 === expected.schemaSha256, "manifest schema binding mismatch");
  assert(input.manifest.source_binding_proof_sha256 === expected.sourceBindingProofSha256, "manifest source-binding mismatch");
  assert(input.manifest.operator_authorization_scope_sha256 === expected.operatorScopeSha256, "manifest operator-scope mismatch");
  assert(input.manifest.reviewed_candidate_set_sha256 === expected.reviewedCandidateSetSha256, "manifest candidate-set mismatch");
  assert(input.manifest.event_record_count === expected.records && input.manifest.event_district_count === expected.districts, "manifest event counts mismatch");
  assert(Array.isArray(input.manifest.event_district_ids) && input.manifest.event_district_ids.length === 1 && input.manifest.event_district_ids[0] === expected.districtId, "manifest district mismatch");
  assert(isRecord(input.producerValidation) && input.producerValidation.all_controls_passed === true, "producer validation did not pass");
  assert(input.producerValidation.event_payload_sha256 === expected.feedSha256 && input.producerValidation.manifest_sha256 === expected.manifestSha256, "producer validation binding mismatch");
  assert(input.producerValidation.public_event_rows === expected.records && input.producerValidation.actor_leakage === 0 && input.producerValidation.raw_motion_text_records === 0 && input.producerValidation.human_review_claims === 0, "producer validation safety mismatch");
  assert(isRecord(input.publicEventSchema) && input.publicEventSchema.additionalProperties === false, "producer schema is not fail closed");
  assert(isRecord(input.consumerProvenance) && isRecord(input.consumerProvenance.producer) && isRecord(input.consumerProvenance.release) && isRecord(input.consumerProvenance.consumer), "consumer provenance is incomplete");
  exactKeys(input.consumerProvenance, ["schema_version", "producer", "release", "consumer"], "consumer provenance");
  exactKeys(input.consumerProvenance.producer, ["repository", "merged_commit", "merged_tree"], "consumer producer provenance");
  exactKeys(input.consumerProvenance.release, ["event_feed_sha256", "release_decisions_sha256", "manifest_sha256", "validation_sha256", "package_sha256", "source_binding_proof_sha256", "public_event_schema_sha256", "operator_authorization_scope_sha256", "reviewed_candidate_set_sha256"], "consumer release provenance");
  exactKeys(input.consumerProvenance.consumer, ["event_record_count", "event_district_count", "event_district_ids", "action_summary_count", "outcome_summary_count", "null_outcome_count", "public_projection_excludes"], "consumer projection provenance");
  assert(input.consumerProvenance.schema_version === "gcd-public-event-consumer-provenance-v1", "consumer provenance schema mismatch");
  assert(input.consumerProvenance.producer.repository === expected.producerRepository && input.consumerProvenance.producer.merged_commit === expected.producerMergedCommit && input.consumerProvenance.producer.merged_tree === expected.producerMergedTree, "consumer producer identity mismatch");
  const release = input.consumerProvenance.release;
  assert(release.event_feed_sha256 === expected.feedSha256 && release.release_decisions_sha256 === expected.releaseDecisionsSha256 && release.manifest_sha256 === expected.manifestSha256 && release.validation_sha256 === expected.validationSha256 && release.package_sha256 === expected.packageSha256 && release.source_binding_proof_sha256 === expected.sourceBindingProofSha256 && release.public_event_schema_sha256 === expected.schemaSha256 && release.operator_authorization_scope_sha256 === expected.operatorScopeSha256 && release.reviewed_candidate_set_sha256 === expected.reviewedCandidateSetSha256, "consumer release provenance mismatch");
  const consumer = input.consumerProvenance.consumer;
  assert(consumer.event_record_count === expected.records && consumer.event_district_count === expected.districts && Array.isArray(consumer.event_district_ids) && consumer.event_district_ids.length === 1 && consumer.event_district_ids[0] === expected.districtId && consumer.action_summary_count === expected.records && consumer.outcome_summary_count === expected.outcomes && consumer.null_outcome_count === expected.nullOutcomes, "consumer projection counts mismatch");
  assert(Array.isArray(consumer.public_projection_excludes) && JSON.stringify([...consumer.public_projection_excludes].sort()) === JSON.stringify(["actor_information_omitted", "model_review_state", "public_document_id", "release_decision_id"].sort()), "consumer projection exclusion mismatch");
  assert(isRecord(input.consumerValidation), "consumer validation receipt is missing");
  exactKeys(input.consumerValidation, ["schema_version", "valid", "event_records", "unique_event_ids", "event_districts", "event_district_ids", "action_summaries", "outcome_summaries", "null_outcomes", "actor_leakage", "raw_motion_records", "human_review_claims", "existing_fact_record_changes"], "consumer validation receipt");
  assert(input.consumerValidation.schema_version === "gcd-public-event-consumer-validation-v1" && input.consumerValidation.valid === true && input.consumerValidation.event_records === expected.records && input.consumerValidation.unique_event_ids === expected.records && input.consumerValidation.event_districts === expected.districts && Array.isArray(input.consumerValidation.event_district_ids) && input.consumerValidation.event_district_ids.length === 1 && input.consumerValidation.event_district_ids[0] === expected.districtId && input.consumerValidation.action_summaries === expected.records && input.consumerValidation.outcome_summaries === expected.outcomes && input.consumerValidation.null_outcomes === expected.nullOutcomes && input.consumerValidation.actor_leakage === 0 && input.consumerValidation.raw_motion_records === 0 && input.consumerValidation.human_review_claims === 0 && input.consumerValidation.existing_fact_record_changes === 0, "consumer validation receipt mismatch");
}

export function validateGcdPublicEventPackage(input: GcdPublicEventArtifactInput): GcdPublicEventPackage {
  validateAuthorityArtifacts(input);
  assert(!input.feedText.includes("\r"), "event feed line endings changed");
  const lines = input.feedText.endsWith("\n") ? input.feedText.slice(0, -1).split("\n") : input.feedText.split("\n");
  assert(lines.length === GCD_PUBLIC_EVENT_EXPECTED.records && lines.every(Boolean), "event feed row count mismatch");
  const records = lines.map((line, index) => {
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      throw new Error(`Invalid GCD public-event package: event ${index} is not valid JSON`);
    }
    return parseSourceEvent(value, index);
  });
  assert(new Set(records.map((record) => record.public_event_id)).size === GCD_PUBLIC_EVENT_EXPECTED.records, "public event IDs are not unique");
  assert(new Set(records.map((record) => record.district_id)).size === GCD_PUBLIC_EVENT_EXPECTED.districts, "event district count mismatch");
  const nullOutcomeIds = records.filter((record) => record.event_outcome_summary === null).map((record) => record.public_event_id).sort();
  assert(records.filter((record) => record.event_outcome_summary !== null).length === GCD_PUBLIC_EVENT_EXPECTED.outcomes, "event outcome count mismatch");
  assert(nullOutcomeIds.length === GCD_PUBLIC_EVENT_EXPECTED.nullOutcomes, "null outcome count mismatch");
  assert(JSON.stringify(nullOutcomeIds) === JSON.stringify([...GCD_PUBLIC_EVENT_NULL_OUTCOME_IDS].sort()), "null outcome identity mismatch");
  return {
    schema_version: "gcd-public-event-consumer-v1",
    record_count: GCD_PUBLIC_EVENT_EXPECTED.records,
    district_count: GCD_PUBLIC_EVENT_EXPECTED.districts,
    records,
  };
}

export function formatGcdPublicEventDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
