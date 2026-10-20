import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const EXPECTED = Object.freeze({
  legacyPackageSha256: "c3fb2d17eb729d5a0b972eedb36dc3366cddeb42d882c439f72d9eb879c0c1d7",
  authoritySetSha256: "4d737c05e732d9fbe9e1c2ffeb6bdfe8cf309704de54bdc4d85aa2562f8c0a57",
  operatorRecordSha256: "7ecb5e6fd229c4d0112ff39493739ff613f970180ba1f6e18db2b3fb29f8897d",
  v2ContractSha256: "097cb4824812cfd4b865960125f103151182ed8e36c7467770a2440ce395d06a",
  schemaSha256: "c4edba8cdb63a0f3ecd721e511c2f40efe3cddc531ab78f1be4dceb3c1b00105",
  authorizationScopeSha256: "b41180a3bc101c579467b0555acd840e32847a7900e11121f76880668c30bc8c",
  admissionAuthoritySetSha256: "4d737c05e732d9fbe9e1c2ffeb6bdfe8cf309704de54bdc4d85aa2562f8c0a57",
  combinedSetSha256: "180f6626dcb313ac16c7877092c64b4a5ad51775ee3a4ed841cfb8a9bb6de62b",
  newIdSetSha256: "24a8684466c66f7d8824f97a7f5b0255c957cfe83c5199d9f5555cbace48d2cd",
  legacyRecords: 137,
  newRecords: 45,
  coastalBendRecords: 29,
  wv2004eRecords: 16,
  totalRecords: 182,
  districts: 11,
  factTypes: 10,
  capacity: 512,
  byteCeiling: 2_000_000,
});

const PRODUCER = Object.freeze({
  repository: "aitradesniper-blip/texas-gcd-meeting-records",
  merged_commit: "7b8f4fd56df980a89bbed59208dbdf9daddb5d0a",
  merged_tree: "5bbc2e79945ad77e20e906861cae5a7bfa76ab91",
  district_payload_sha256: "376def4cc7ed02f91ce9b2818ca985dde7402b192d310be6363624c76c180a97",
  document_payload_sha256: "74275ce37616b34d560f640ba4fb90fd60da4d7e2881e736a886ef643c55409c",
  manifest_sha256: "e525652d0abbdbf54edfb814a887a21ebdb063a38c6a1ff641120e0d47f26538",
  snapshot_package_sha256: "21acedf5d41f5ac9cbaebcd8469b0a7a5f140e36f6fe8dbffcb72c08a462cf7e",
  successor_validation_sha256: "1261549ba5a5eaeed30c00744917db0bcc35d73fe65336547652a352e20c29ef",
});

const sealedRejectCandidateHashes = new Set([
  "338d811b78316a9ee3e61995437c178e1aee6b1ec1443d9afdfbf9c9dc8f5186",
  "9ed68f7e5ee3fa0a1aac658606660c1643ac665b7f41fc20d929b92d4285f8a5",
  "e2b6ef3f1341baf424d21dd5fe5e52587b186b95a215336ced6ad243f7f4884b",
  "bdaf0300cfbb903b4e6dae2f497c1ee8a8c7981cbda9e7f572cb6a8e3954025e",
  "ee7a4d3078422738f015479d703ac5b94fa4f987e14d95b228e59eb496394ae0",
]);

function readArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error(`Invalid argument near ${key ?? "end of command"}`);
    values[key.slice(2)] = value;
  }
  for (const key of ["v1-package", "authority-set", "operator-record", "v2-contract", "output-dir"]) {
    if (!values[key]) throw new Error(`Missing --${key}`);
  }
  return values;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function canonicalBuffer(value) {
  return Buffer.from(JSON.stringify(stableValue(value)), "utf8");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseJsonLines(value, label) {
  return value.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`${label} line ${index + 1} is not valid JSON: ${error.message}`);
    }
  });
}

function exactKeys(value, expected, label) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  assert(actual.length === wanted.length && actual.every((key, index) => key === wanted[index]), `${label} has an unexpected field`);
}

function validateRecord(record, index, schema, legacyIds, authorizedNewIds) {
  const recordSchema = schema.properties.records.items;
  exactKeys(record, recordSchema.required, `record ${index}`);
  const id = record.public_record_id;
  assert(typeof id === "string" && /^gcd-intelligence-(?:v1-[0-9]{4}|v2-[a-z2-7]{26})$/.test(id), `record ${index} has an invalid public ID`);
  assert(legacyIds.has(id) || authorizedNewIds.has(id), `record ${index} has an unauthorized public ID`);
  assert(recordSchema.properties.district_id.enum.includes(record.district_id), `record ${index} has an unauthorized district`);
  assert(recordSchema.properties.product_export_fact_type.enum.includes(record.product_export_fact_type), `record ${index} has an unknown fact type`);
  assert(recordSchema.properties.evidence_method.enum.includes(record.evidence_method), `record ${index} has an unknown evidence method`);
  assert(typeof record.district_name === "string" && record.district_name.length >= 20 && record.district_name.length <= 100, `record ${index} has an invalid district name`);
  assert(typeof record.display_value === "string" && record.display_value.length >= 1 && record.display_value.length <= 240, `record ${index} has an invalid display value`);
  assert(Number.isInteger(record.source_page) && record.source_page >= 1, `record ${index} has an invalid source page`);
  assert(typeof record.official_source_url === "string" && record.official_source_url.startsWith("https://"), `record ${index} has a non-HTTPS source URL`);
  const parsedSource = new URL(record.official_source_url);
  assert(!parsedSource.username && !parsedSource.password, `record ${index} has an unsafe source URL`);
  assert(typeof record.source_context_caveat === "boolean", `record ${index} has an invalid source-context flag`);
  assert(typeof record.source_context_caveat_label === "string" && record.source_context_caveat_label.length >= 20 && record.source_context_caveat_label.length <= 120, `record ${index} has an invalid source-context label`);
  assert(typeof record.evidence_label === "string" && record.evidence_label.length >= 20 && record.evidence_label.length <= 120, `record ${index} has an invalid evidence label`);
  assert(typeof record.what_it_may_indicate === "string" && record.what_it_may_indicate.length >= 20 && record.what_it_may_indicate.length <= 200, `record ${index} has an invalid interpretation`);
  assert(typeof record.what_it_does_not_prove === "string" && record.what_it_does_not_prove.length >= 100 && record.what_it_does_not_prove.length <= 300, `record ${index} has an invalid limitation`);
  assert(record.property_scope === "district_level_not_property_specific", `record ${index} has an invalid property scope`);
  assert(typeof record.attribution_text === "string" && record.attribution_text.length >= 30 && record.attribution_text.length <= 220, `record ${index} has invalid attribution`);
  assert(record.units === null || (typeof record.units === "string" && record.units.length <= 40), `record ${index} has invalid units`);
  assert(record.parsed_numeric_value === null || typeof record.parsed_numeric_value === "number", `record ${index} has an invalid numeric value`);
  if (record.evidence_method === "ocr") {
    assert(/\bOCR\b/i.test(record.evidence_label) && !/native[- ]text/i.test(record.evidence_label), `record ${index} has an OCR/native-text label mismatch`);
  }
  if (record.evidence_method === "native_text") {
    assert(/native[- ]text/i.test(record.evidence_label) && !/\bOCR\b/i.test(record.evidence_label), `record ${index} has a native-text/OCR label mismatch`);
  }
}

const args = readArguments(process.argv.slice(2));
const [legacyBytes, authorityBytes, operatorBytes, contractBytes] = await Promise.all([
  readFile(args["v1-package"]),
  readFile(args["authority-set"]),
  readFile(args["operator-record"]),
  readFile(args["v2-contract"]),
]);

assert(sha256(legacyBytes) === EXPECTED.legacyPackageSha256, "legacy V1 package hash mismatch");
assert(sha256(authorityBytes) === EXPECTED.authoritySetSha256, "45-record authority-set hash mismatch");
assert(sha256(operatorBytes) === EXPECTED.operatorRecordSha256, "operator record hash mismatch");
assert(sha256(contractBytes) === EXPECTED.v2ContractSha256, "V2 contract hash mismatch");

const legacy = JSON.parse(legacyBytes);
const authorityRows = parseJsonLines(authorityBytes.toString("utf8"), "authority set");
const operator = JSON.parse(operatorBytes);
const contract = JSON.parse(contractBytes);
const schema = contract.schema;
const schemaBytes = canonicalBuffer(schema);

assert(sha256(schemaBytes) === EXPECTED.schemaSha256, "authorized V2 schema hash mismatch");
assert(operator.operator_authorization_recorded === true, "operator authorization is not recorded");
assert(operator.authorization_scope_sha256 === EXPECTED.authorizationScopeSha256, "operator authorization scope mismatch");
assert(operator.exact_authorized_scope.combined_admissions.authorized === EXPECTED.newRecords, "operator admission count mismatch");
assert(operator.exact_authorized_scope.v2_contract.authorized === true, "V2 contract is not operator-authorized");
assert(legacy.schema_version === "1.0.0" && legacy.dataset_id === "gcd-wave2-priority1-intelligence-v1", "legacy package identity mismatch");
assert(legacy.record_count === EXPECTED.legacyRecords && legacy.records.length === EXPECTED.legacyRecords, "legacy record count mismatch");

const authorityCounts = new Map();
const authorizedNewIds = new Set();
for (const [index, row] of authorityRows.entries()) {
  assert(row.authority_state === "OPERATOR_AUTHORIZED_FOR_GOVERNED_PUBLIC_ADMISSION", `authority row ${index} is not authorized`);
  assert(row.authorization_scope_sha256 === EXPECTED.authorizationScopeSha256, `authority row ${index} scope mismatch`);
  assert(row.candidate_content_changed === false && row.public_record_id_changed === false && row.semantic_decision_changed === false, `authority row ${index} changed frozen content`);
  assert(row.public_record_id === row.proposed_record.public_record_id, `authority row ${index} public ID mismatch`);
  assert(sha256(canonicalBuffer(row.proposed_record)) === row.proposed_record_sha256, `authority row ${index} proposed-record hash mismatch`);
  assert(!sealedRejectCandidateHashes.has(row.original_candidate_content_sha256), `authority row ${index} admits a sealed reject`);
  assert(!authorizedNewIds.has(row.public_record_id), `duplicate authorized public ID ${row.public_record_id}`);
  authorizedNewIds.add(row.public_record_id);
  authorityCounts.set(row.candidate_set, (authorityCounts.get(row.candidate_set) ?? 0) + 1);
}

assert(authorityRows.length === EXPECTED.newRecords && authorizedNewIds.size === EXPECTED.newRecords, "authorized new-record population mismatch");
assert(authorityCounts.get("WV2_005H_COASTAL_BEND") === EXPECTED.coastalBendRecords, "Coastal Bend authority count mismatch");
assert(authorityCounts.get("WV2_004E_FROZEN_R1_CORRECTED_PUBLIC_PROJECTION") === EXPECTED.wv2004eRecords, "WV2-004E authority count mismatch");

const newIds = [...authorizedNewIds].sort();
assert(sha256(canonicalBuffer(newIds)) === EXPECTED.newIdSetSha256, "authorized new-ID set hash mismatch");
const combinedDigestRows = authorityRows.map((row) => ({
  candidate_set: row.candidate_set === "WV2_004E_FROZEN_R1_CORRECTED_PUBLIC_PROJECTION" ? "WV2_004E_FROZEN" : row.candidate_set,
  admission_candidate_id: row.admission_candidate_id,
  proposed_public_record_id: row.public_record_id,
  proposed_record_sha256: row.proposed_record_sha256,
})).sort((left, right) => left.candidate_set.localeCompare(right.candidate_set) || left.admission_candidate_id.localeCompare(right.admission_candidate_id));
assert(sha256(canonicalBuffer(combinedDigestRows)) === EXPECTED.combinedSetSha256, "combined 45-record set hash mismatch");

const legacyIds = new Set(legacy.records.map((record) => record.public_record_id));
assert(legacyIds.size === EXPECTED.legacyRecords, "legacy public IDs are not unique");
assert(newIds.every((id) => !legacyIds.has(id)), "new public ID collides with a legacy public ID");

const newRecords = authorityRows.map((row) => row.proposed_record).sort((left, right) => left.public_record_id.localeCompare(right.public_record_id));
const records = [...legacy.records, ...newRecords];
const packageValue = {
  schema_version: "2.0.0",
  dataset_id: "gcd-wave2-priority1-intelligence-v2",
  scope: legacy.scope,
  disclaimer: legacy.disclaimer,
  record_count: records.length,
  records,
};

exactKeys(packageValue, schema.required, "V2 package");
assert(packageValue.record_count === EXPECTED.totalRecords && packageValue.record_count <= EXPECTED.capacity, "V2 record count is outside the authorized contract");
records.forEach((record, index) => validateRecord(record, index, schema, legacyIds, authorizedNewIds));
assert(new Set(records.map((record) => record.public_record_id)).size === EXPECTED.totalRecords, "V2 public IDs are not unique");
assert(new Set(records.map((record) => record.district_id)).size === EXPECTED.districts, "V2 district count mismatch");
assert(new Set(records.map((record) => record.product_export_fact_type)).size === EXPECTED.factTypes, "V2 fact taxonomy mismatch");

const recordsById = new Map(records.map((record) => [record.public_record_id, record]));
for (const legacyRecord of legacy.records) {
  assert(sha256(canonicalBuffer(recordsById.get(legacyRecord.public_record_id))) === sha256(canonicalBuffer(legacyRecord)), `legacy record ${legacyRecord.public_record_id} changed`);
}

const packageBytes = canonicalBuffer(packageValue);
assert(packageBytes.length <= EXPECTED.byteCeiling, "V2 package exceeds the authorized byte ceiling");
const thresholdRecords = newRecords.filter((record) => /Rule 3\.11\(c\).*1,(?:200|800) acre-feet/.test(record.display_value));
assert(thresholdRecords.length > 0 && thresholdRecords.every((record) => record.product_export_fact_type === "authorized_requested_recommended_or_limit_quantity" && /threshold/i.test(record.what_it_may_indicate) && /does not report actual pumping or a granted permit quantity/i.test(record.what_it_does_not_prove)), "Rule 3.11(c) semantic guard failed");
const dfcRecords = newRecords.filter((record) => record.product_export_fact_type === "desired_future_condition_drawdown");
assert(dfcRecords.length === 2 && dfcRecords.every((record) => /Draft DFC/.test(record.display_value) && !/observed|achieved/i.test(record.what_it_may_indicate)), "DFC semantic guard failed");
const coastalLitigation = newRecords.filter((record) => record.district_id === "coastal_bend_gcd" && record.product_export_fact_type === "litigation_reference");
assert(coastalLitigation.length > 0 && coastalLitigation.every((record) => record.display_value === "A litigation or legal matter is referenced in the official meeting record."), "Coastal Bend litigation projection is not bounded");

const provenance = {
  schema_version: "gcd-water-watch-v2-provenance-v1",
  producer: PRODUCER,
  producer_split_state: {
    district_status_authority_mode: "predecessor_task_c_frozen",
    district_status_reconciled_to_successor_documents: false,
    monitoring_status_inference_performed: false,
    source_status_inference_performed: false,
    consumer_current_state_reconciliation_required: true,
  },
  authority: {
    authorization_scope_sha256: EXPECTED.authorizationScopeSha256,
    operator_authorization_record_sha256: EXPECTED.operatorRecordSha256,
    admission_authority_set_sha256: EXPECTED.admissionAuthoritySetSha256,
    combined_45_set_sha256: EXPECTED.combinedSetSha256,
    new_45_id_set_sha256: EXPECTED.newIdSetSha256,
    v2_schema_sha256: EXPECTED.schemaSha256,
    governing_operator_packet_sha256: "769744109728e55d4d783752127e3ff1ae6fc43e2e99d847124feb70befb65e8",
  },
  legacy_v1: {
    package_sha256: EXPECTED.legacyPackageSha256,
    records_preserved: EXPECTED.legacyRecords,
  },
  current_package: {
    package_sha256: sha256(packageBytes),
    package_size_bytes: packageBytes.length,
    record_count: EXPECTED.totalRecords,
    district_count: EXPECTED.districts,
    fact_type_count: EXPECTED.factTypes,
  },
  authorized_new_public_ids: newIds,
};

const validation = {
  schema_version: "gcd-water-watch-v2-validation-v1",
  valid: true,
  dataset_id: packageValue.dataset_id,
  records_valid: `${records.length}/${EXPECTED.totalRecords}`,
  legacy_records_preserved: `${legacy.records.length}/${EXPECTED.legacyRecords}`,
  authorized_new_records: `${newRecords.length}/${EXPECTED.newRecords}`,
  district_count: new Set(records.map((record) => record.district_id)).size,
  fact_type_count: new Set(records.map((record) => record.product_export_fact_type)).size,
  coastal_bend_records: newRecords.filter((record) => record.district_id === "coastal_bend_gcd").length,
  wv2_004e_records: newRecords.filter((record) => record.district_id !== "coastal_bend_gcd").length,
  duplicate_public_ids: 0,
  sealed_coastal_bend_rejects_present: 0,
  collapsed_duplicate_occurrences_present: 0,
  relational_candidates_present: 0,
  fact_taxonomy_changes: 0,
  package_size_bytes: packageBytes.length,
  package_capacity: EXPECTED.capacity,
  package_byte_ceiling: EXPECTED.byteCeiling,
  package_sha256: sha256(packageBytes),
  schema_sha256: sha256(schemaBytes),
  semantic_guards: {
    rule_3_11_c_threshold_records: thresholdRecords.length,
    desired_future_condition_records: dfcRecords.length,
    bounded_coastal_bend_litigation_records: coastalLitigation.length,
    ocr_records_with_corrected_label: newRecords.filter((record) => record.evidence_method === "ocr").length,
  },
  protected_operations: {
    government_source_requests: 0,
    document_fetches: 0,
    ocr_calls: 0,
    provider_model_calls: 0,
    semantic_decisions: 0,
  },
};

const provenanceBytes = canonicalBuffer(provenance);
const validationBytes = canonicalBuffer(validation);
const members = [
  ["gcd_district_intelligence_schema_v2.json", schemaBytes],
  ["gcd_district_intelligence_v2.json", packageBytes],
  ["provenance.json", provenanceBytes],
  ["validation_receipt.json", validationBytes],
];
const manifest = {
  manifest_id: "gcd-wave2-priority1-intelligence-public-package-v2",
  schema_version: "2.0.0",
  scope: packageValue.scope,
  record_count: EXPECTED.totalRecords,
  district_count: EXPECTED.districts,
  fact_type_count: EXPECTED.factTypes,
  members: members.map(([memberPath, bytes]) => ({ path: memberPath, sha256: sha256(bytes), size_bytes: bytes.length })),
};

await mkdir(args["output-dir"], { recursive: true });
await Promise.all([
  ...members.map(([memberPath, bytes]) => writeFile(path.join(args["output-dir"], memberPath), bytes)),
  writeFile(path.join(args["output-dir"], "manifest.json"), canonicalBuffer(manifest)),
]);

console.log(JSON.stringify({
  result: "WV2_006B_WATER_WATCH_V2_PACKAGE_BUILT",
  records: records.length,
  districts: new Set(records.map((record) => record.district_id)).size,
  legacy_records_preserved: legacy.records.length,
  authorized_new_records: newRecords.length,
  package_size_bytes: packageBytes.length,
  package_sha256: sha256(packageBytes),
  schema_sha256: sha256(schemaBytes),
}, null, 2));
