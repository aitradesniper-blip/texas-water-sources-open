import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const EXPECTED = Object.freeze({
  legacyDirectorySha256: "52a1dfc12bdfc30afd03110ff8afa583ad7d22863c4e9378ac83a7417425bf55",
  successorDistrictSha256: "376def4cc7ed02f91ce9b2818ca985dde7402b192d310be6363624c76c180a97",
  successorDocumentSha256: "74275ce37616b34d560f640ba4fb90fd60da4d7e2881e736a886ef643c55409c",
  successorManifestSha256: "e525652d0abbdbf54edfb814a887a21ebdb063a38c6a1ff641120e0d47f26538",
  successorValidationSha256: "1261549ba5a5eaeed30c00744917db0bcc35d73fe65336547652a352e20c29ef",
  waterWatchPackageSha256: "9092a8a153a9768f64d94b57c1be13117889d0acecefab057a08bb2eb1e9d904",
  directoryEntries: 98,
  publicReleasedDistricts: 80,
  identityOnlyDistricts: 18,
  documentBearingDistricts: 12,
  sourceMetadataOnlyDistricts: 68,
  publicDocuments: 1934,
  publicEvents: 0,
  waterWatchDistricts: 11,
  waterWatchRecords: 182,
  coastalBendDocuments: 171,
  coastalBendWaterWatchRecords: 29,
});

const PRODUCER = Object.freeze({
  repository: "aitradesniper-blip/texas-gcd-meeting-records",
  merged_commit: "7b8f4fd56df980a89bbed59208dbdf9daddb5d0a",
  merged_tree: "5bbc2e79945ad77e20e906861cae5a7bfa76ab91",
  snapshot_package_sha256: "21acedf5d41f5ac9cbaebcd8469b0a7a5f140e36f6fe8dbffcb72c08a462cf7e",
});

const AUTHORITY = Object.freeze({
  authorization_scope_sha256: "b41180a3bc101c579467b0555acd840e32847a7900e11121f76880668c30bc8c",
  admission_authority_set_sha256: "4d737c05e732d9fbe9e1c2ffeb6bdfe8cf309704de54bdc4d85aa2562f8c0a57",
  v2_schema_sha256: "c4edba8cdb63a0f3ecd721e511c2f40efe3cddc531ab78f1be4dceb3c1b00105",
});

const roleLabels = Object.freeze({
  agenda: "Agendas",
  amended_agenda: "Amended agendas",
  approved_minutes: "Approved minutes",
  board_packet: "Board packets",
  presentation: "Presentations",
  public_hearing_notice: "Public-hearing notices",
  staff_report: "Staff reports",
});

function readArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error(`Invalid argument near ${key ?? "end of command"}`);
    values[key.slice(2)] = value;
  }
  for (const key of ["v1-directory", "successor-districts", "successor-documents", "successor-manifest", "successor-validation", "water-watch-package", "output-dir"]) {
    if (!values[key]) throw new Error(`Missing --${key}`);
  }
  return values;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
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

function parseJsonLines(bytes, label) {
  return bytes.toString("utf8").split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`${label} line ${index + 1} is not valid JSON: ${error.message}`);
    }
  });
}

function isHttpsUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

const args = readArguments(process.argv.slice(2));
const [legacyBytes, districtBytes, documentBytes, manifestBytes, validationBytes, waterWatchBytes] = await Promise.all([
  readFile(args["v1-directory"]),
  readFile(args["successor-districts"]),
  readFile(args["successor-documents"]),
  readFile(args["successor-manifest"]),
  readFile(args["successor-validation"]),
  readFile(args["water-watch-package"]),
]);

assert(sha256(legacyBytes) === EXPECTED.legacyDirectorySha256, "legacy directory hash mismatch");
assert(sha256(districtBytes) === EXPECTED.successorDistrictSha256, "successor district payload hash mismatch");
assert(sha256(documentBytes) === EXPECTED.successorDocumentSha256, "successor document payload hash mismatch");
assert(sha256(manifestBytes) === EXPECTED.successorManifestSha256, "successor manifest hash mismatch");
assert(sha256(validationBytes) === EXPECTED.successorValidationSha256, "successor validation hash mismatch");
assert(sha256(waterWatchBytes) === EXPECTED.waterWatchPackageSha256, "Water Watch V2 package hash mismatch");

const legacy = JSON.parse(legacyBytes);
const successorDistricts = parseJsonLines(districtBytes, "successor district payload");
const successorDocuments = parseJsonLines(documentBytes, "successor document payload");
const successorManifest = JSON.parse(manifestBytes);
const successorValidation = JSON.parse(validationBytes);
const waterWatch = JSON.parse(waterWatchBytes);

assert(legacy.schema_version === "gcd-statewide-directory-v1" && legacy.districts.length === EXPECTED.directoryEntries, "legacy directory identity mismatch");
assert(successorDistricts.length === EXPECTED.publicReleasedDistricts, "successor district count mismatch");
assert(successorDocuments.length === EXPECTED.publicDocuments, "successor document count mismatch");
assert(successorManifest.district_payload_sha256 === EXPECTED.successorDistrictSha256 && successorManifest.document_payload_sha256 === EXPECTED.successorDocumentSha256, "successor manifest payload binding mismatch");
assert(successorManifest.document_record_count === EXPECTED.publicDocuments && successorManifest.event_record_count === EXPECTED.publicEvents, "successor manifest population mismatch");
assert(successorValidation.all_controls_passed === true && successorValidation.consumer_current_state_reconciliation_required === true, "successor validation state mismatch");
assert(successorValidation.consumer_authority_rule.successor_document_feed_authoritative_for_released_document_availability === true, "successor document authority is missing");
assert(successorValidation.consumer_authority_rule.released_successor_documents_must_not_be_interpreted_as_active_or_current_monitoring === true, "successor monitoring guard is missing");
assert(waterWatch.schema_version === "2.0.0" && waterWatch.dataset_id === "gcd-wave2-priority1-intelligence-v2" && waterWatch.records.length === EXPECTED.waterWatchRecords, "Water Watch V2 identity mismatch");

const releasedIds = new Set(successorDistricts.map((district) => district.district_id));
assert(releasedIds.size === EXPECTED.publicReleasedDistricts, "successor district IDs are not unique");
const legacyReleasedIds = new Set(legacy.districts.filter((district) => district.public_release_state === "public_released").map((district) => district.district_id));
assert(legacyReleasedIds.size === EXPECTED.publicReleasedDistricts && [...releasedIds].every((id) => legacyReleasedIds.has(id)), "successor district identity set differs from the frozen predecessor release");

const documentsByDistrict = new Map();
const documentIds = new Set();
for (const document of successorDocuments) {
  assert(releasedIds.has(document.district_id), `document ${document.public_document_id} has an unreleased district`);
  assert(!documentIds.has(document.public_document_id), `duplicate document ID ${document.public_document_id}`);
  documentIds.add(document.public_document_id);
  assert(document.release?.state === "public_eligible", `document ${document.public_document_id} is not public eligible`);
  assert(isHttpsUrl(document.official_url), `document ${document.public_document_id} does not have a safe HTTPS source`);
  assert(Object.hasOwn(roleLabels, document.document_role), `document ${document.public_document_id} has an unknown role`);
  const aggregate = documentsByDistrict.get(document.district_id) ?? { count: 0, current: 0, verified: 0, roles: new Map() };
  aggregate.count += 1;
  if (document.is_current_version) aggregate.current += 1;
  if (document.meeting_date_authority_state === "verified_exact") aggregate.verified += 1;
  aggregate.roles.set(document.document_role, (aggregate.roles.get(document.document_role) ?? 0) + 1);
  documentsByDistrict.set(document.district_id, aggregate);
}

const waterWatchCounts = new Map();
for (const record of waterWatch.records) waterWatchCounts.set(record.district_id, (waterWatchCounts.get(record.district_id) ?? 0) + 1);
assert(waterWatchCounts.size === EXPECTED.waterWatchDistricts, "Water Watch district count mismatch");

const districts = legacy.districts.map((legacyDistrict) => {
  const aggregate = documentsByDistrict.get(legacyDistrict.district_id) ?? { count: 0, current: 0, verified: 0, roles: new Map() };
  const reviewedWaterWatchRecordCount = waterWatchCounts.get(legacyDistrict.district_id) ?? 0;
  const hasDocuments = aggregate.count > 0;
  const isCoastalBend = legacyDistrict.district_id === "coastal_bend_gcd";
  if (legacyDistrict.public_release_state === "not_public_released") assert(!hasDocuments, `${legacyDistrict.district_id} is identity-only but has successor documents`);
  return {
    ...legacyDistrict,
    coverage_label: hasDocuments ? "Published document records" : legacyDistrict.coverage_label,
    coverage_note: hasDocuments
      ? `${aggregate.count.toLocaleString("en-US")} approved public document metadata ${aggregate.count === 1 ? "entry is" : "entries are"} available in this release. A document listing is navigation metadata; it does not establish that a meeting occurred, concluded, or produced an action.`
      : legacyDistrict.coverage_note,
    document_count: aggregate.count,
    document_roles: [...aggregate.roles.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([role, count]) => ({ role, label: roleLabels[role], count })),
    verified_meeting_date_count: aggregate.verified,
    current_version_document_count: aggregate.current,
    has_reviewed_water_watch: reviewedWaterWatchRecordCount > 0,
    reviewed_water_watch_record_count: reviewedWaterWatchRecordCount,
    successor_document_release_caveat: isCoastalBend
      ? "171 approved public meeting-record metadata entries are available. Current source monitoring and source freshness are not established by this release."
      : null,
  };
});

const countWhere = (predicate) => districts.filter(predicate).length;
const documentTotal = districts.reduce((sum, district) => sum + district.document_count, 0);
const waterWatchTotal = districts.reduce((sum, district) => sum + district.reviewed_water_watch_record_count, 0);
assert(countWhere(() => true) === EXPECTED.directoryEntries, "directory entry count mismatch");
assert(countWhere((district) => district.public_release_state === "public_released") === EXPECTED.publicReleasedDistricts, "public-released count mismatch");
assert(countWhere((district) => district.public_release_state === "not_public_released") === EXPECTED.identityOnlyDistricts, "identity-only count mismatch");
assert(countWhere((district) => district.document_count > 0) === EXPECTED.documentBearingDistricts, "document-bearing count mismatch");
assert(countWhere((district) => district.public_release_state === "public_released" && district.document_count === 0) === EXPECTED.sourceMetadataOnlyDistricts, "source-metadata-only count mismatch");
assert(documentTotal === EXPECTED.publicDocuments, "public document total mismatch");
assert(countWhere((district) => district.has_reviewed_water_watch) === EXPECTED.waterWatchDistricts, "Water Watch district total mismatch");
assert(waterWatchTotal === EXPECTED.waterWatchRecords, "Water Watch record total mismatch");

const coastalBend = districts.find((district) => district.district_id === "coastal_bend_gcd");
assert(coastalBend.document_count === EXPECTED.coastalBendDocuments, "Coastal Bend document count mismatch");
assert(coastalBend.reviewed_water_watch_record_count === EXPECTED.coastalBendWaterWatchRecords, "Coastal Bend Water Watch count mismatch");
assert(coastalBend.last_checked_date === null && coastalBend.last_successful_source_observation_date === null, "Coastal Bend freshness was inferred");

const packageValue = {
  schema_version: "gcd-statewide-directory-v2",
  release: {
    directory_entry_count: EXPECTED.directoryEntries,
    public_released_district_count: EXPECTED.publicReleasedDistricts,
    district_identity_only_count: EXPECTED.identityOnlyDistricts,
    districts_with_document_records: EXPECTED.documentBearingDistricts,
    source_metadata_only_district_count: EXPECTED.sourceMetadataOnlyDistricts,
    public_document_record_count: EXPECTED.publicDocuments,
    public_event_record_count: EXPECTED.publicEvents,
    reviewed_water_watch_district_count: EXPECTED.waterWatchDistricts,
    reviewed_water_watch_record_count: EXPECTED.waterWatchRecords,
    source_cutoff_date: legacy.release.source_cutoff_date,
    approved_release_date: "2026-09-13",
  },
  directory_limitations: [
    ...legacy.directory_limitations,
    "The successor document feed establishes released document availability, not active monitoring, a current production crawl, source freshness, or evidence that a listed meeting occurred or produced an action.",
  ],
  provenance: {
    producer: PRODUCER,
    successor_inputs: {
      district_payload_sha256: EXPECTED.successorDistrictSha256,
      document_payload_sha256: EXPECTED.successorDocumentSha256,
      manifest_sha256: EXPECTED.successorManifestSha256,
      successor_validation_sha256: EXPECTED.successorValidationSha256,
    },
    split_state: {
      district_status_authority_mode: "predecessor_task_c_frozen",
      district_status_reconciled_to_successor_documents: false,
      monitoring_status_inference_performed: false,
      source_status_inference_performed: false,
      consumer_current_state_reconciliation_required: true,
    },
    water_watch: {
      package_sha256: EXPECTED.waterWatchPackageSha256,
      ...AUTHORITY,
    },
  },
  districts,
};

const packageBytes = canonicalBuffer(packageValue);
const receipt = {
  schema_version: "gcd-statewide-directory-v2-validation-v1",
  valid: true,
  package_sha256: sha256(packageBytes),
  counts: {
    all_districts: EXPECTED.directoryEntries,
    public_released_districts: EXPECTED.publicReleasedDistricts,
    directory_identity_only: EXPECTED.identityOnlyDistricts,
    published_document_records: EXPECTED.documentBearingDistricts,
    official_source_metadata_only: EXPECTED.sourceMetadataOnlyDistricts,
    public_documents: EXPECTED.publicDocuments,
    public_events: EXPECTED.publicEvents,
    reviewed_water_watch_districts: EXPECTED.waterWatchDistricts,
    reviewed_water_watch_records: EXPECTED.waterWatchRecords,
  },
  coastal_bend: {
    public_document_records: coastalBend.document_count,
    reviewed_water_watch_records: coastalBend.reviewed_water_watch_record_count,
    monitoring_status_inferred: false,
    source_freshness_inferred: false,
    split_state_caveat_present: Boolean(coastalBend.successor_document_release_caveat),
  },
};

await mkdir(args["output-dir"], { recursive: true });
await Promise.all([
  writeFile(path.join(args["output-dir"], "gcd_statewide_directory_v2.json"), packageBytes),
  writeFile(path.join(args["output-dir"], "validation_receipt.json"), canonicalBuffer(receipt)),
]);

console.log(JSON.stringify({
  result: "WV2_006B_STATEWIDE_DIRECTORY_V2_RECONCILED",
  package_sha256: sha256(packageBytes),
  package_size_bytes: packageBytes.length,
  ...receipt.counts,
  coastal_bend: receipt.coastal_bend,
}, null, 2));
