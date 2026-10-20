export type GcdDirectoryDocumentRole = {
  role: string;
  label: string;
  count: number;
};

export type GcdDirectoryDistrict = {
  district_id: string;
  district_slug: string;
  district_name: string;
  public_release_state: "public_released" | "not_public_released";
  coverage_label: string;
  coverage_note: string;
  document_count: number;
  document_roles: GcdDirectoryDocumentRole[];
  verified_meeting_date_count: number;
  current_version_document_count: number;
  has_reviewed_water_watch: boolean;
  site_detail_path: string | null;
  official_website_url: string | null;
  official_archive_urls: string[];
  last_checked_date: string | null;
  last_successful_source_observation_date: string | null;
};

export type GcdStatewideDirectoryPackage = {
  schema_version: "gcd-statewide-directory-v1";
  release: {
    directory_entry_count: 98;
    public_released_district_count: 80;
    district_identity_only_count: 18;
    districts_with_document_records: 11;
    public_document_record_count: 1763;
    public_event_record_count: 0;
    reviewed_water_watch_district_count: 3;
    reviewed_water_watch_record_count: 137;
    source_cutoff_date: string;
    approved_release_date: string;
  };
  directory_limitations: string[];
  districts: GcdDirectoryDistrict[];
};

export type GcdDirectoryDistrictV2 = GcdDirectoryDistrict & {
  reviewed_water_watch_record_count: number;
  successor_document_release_caveat: string | null;
};

export type GcdStatewideDirectoryV2Package = {
  schema_version: "gcd-statewide-directory-v2";
  release: {
    directory_entry_count: 98;
    public_released_district_count: 80;
    district_identity_only_count: 18;
    districts_with_document_records: 12;
    source_metadata_only_district_count: 68;
    public_document_record_count: 1934;
    public_event_record_count: 0;
    reviewed_water_watch_district_count: 11;
    reviewed_water_watch_record_count: 182;
    source_cutoff_date: string;
    approved_release_date: string;
  };
  directory_limitations: string[];
  provenance: {
    producer: {
      repository: string;
      merged_commit: string;
      merged_tree: string;
      snapshot_package_sha256: string;
    };
    successor_inputs: {
      district_payload_sha256: string;
      document_payload_sha256: string;
      manifest_sha256: string;
      successor_validation_sha256: string;
    };
    split_state: {
      district_status_authority_mode: string;
      district_status_reconciled_to_successor_documents: boolean;
      monitoring_status_inference_performed: boolean;
      source_status_inference_performed: boolean;
      consumer_current_state_reconciliation_required: boolean;
    };
    water_watch: {
      package_sha256: string;
      authorization_scope_sha256: string;
      admission_authority_set_sha256: string;
      v2_schema_sha256: string;
    };
  };
  districts: GcdDirectoryDistrictV2[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid statewide GCD directory package: ${message}`);
}

export function validateGcdStatewideDirectoryPackage(value: unknown): GcdStatewideDirectoryPackage {
  assert(isRecord(value), "package must be an object");
  assert(value.schema_version === "gcd-statewide-directory-v1", "schema version mismatch");
  assert(isRecord(value.release), "release summary is missing");
  assert(value.release.directory_entry_count === 98, "directory entry count must be 98");
  assert(value.release.public_released_district_count === 80, "public-released district count must be 80");
  assert(value.release.district_identity_only_count === 18, "identity-only count must be 18");
  assert(value.release.districts_with_document_records === 11, "document-bearing district count must be 11");
  assert(value.release.public_document_record_count === 1763, "document record count must be 1,763");
  assert(value.release.public_event_record_count === 0, "event record count must remain zero");
  assert(value.release.reviewed_water_watch_district_count === 3, "Water Watch district count must be 3");
  assert(value.release.reviewed_water_watch_record_count === 137, "Water Watch record count must be 137");
  assert(Array.isArray(value.directory_limitations) && value.directory_limitations.length >= 3, "directory limitations are missing");
  assert(Array.isArray(value.districts) && value.districts.length === 98, "district array must contain 98 entries");

  const districtIds = new Set<string>();
  const districtSlugs = new Set<string>();
  let publicReleasedCount = 0;
  let documentDistrictCount = 0;
  let documentCount = 0;
  let waterWatchDistrictCount = 0;

  for (const district of value.districts) {
    assert(isRecord(district), "district row must be an object");
    assert(typeof district.district_id === "string" && district.district_id.length > 0, "district ID is missing");
    assert(typeof district.district_slug === "string" && /^[a-z0-9-]+$/.test(district.district_slug), `invalid slug for ${district.district_id}`);
    assert(typeof district.district_name === "string" && district.district_name.length > 0, `name is missing for ${district.district_id}`);
    assert(!districtIds.has(district.district_id), `duplicate district ID ${district.district_id}`);
    assert(!districtSlugs.has(district.district_slug), `duplicate district slug ${district.district_slug}`);
    districtIds.add(district.district_id);
    districtSlugs.add(district.district_slug);

    assert(district.public_release_state === "public_released" || district.public_release_state === "not_public_released", `invalid release state for ${district.district_id}`);
    if (district.public_release_state === "public_released") publicReleasedCount += 1;
    assert(typeof district.coverage_label === "string" && district.coverage_label.length > 0, `coverage label is missing for ${district.district_id}`);
    assert(typeof district.coverage_note === "string" && district.coverage_note.length > 0, `coverage note is missing for ${district.district_id}`);
    const districtDocumentCount = district.document_count;
    assert(typeof districtDocumentCount === "number" && Number.isInteger(districtDocumentCount) && districtDocumentCount >= 0, `invalid document count for ${district.district_id}`);
    if (districtDocumentCount > 0) documentDistrictCount += 1;
    documentCount += districtDocumentCount;
    assert(Array.isArray(district.document_roles), `document roles are missing for ${district.district_id}`);
    const roleCount = district.document_roles.reduce((sum, role) => {
      assert(isRecord(role) && typeof role.role === "string" && typeof role.label === "string", `invalid document role for ${district.district_id}`);
      const roleCountValue = role.count;
      assert(typeof roleCountValue === "number" && Number.isInteger(roleCountValue) && roleCountValue > 0, `invalid document role count for ${district.district_id}`);
      return sum + roleCountValue;
    }, 0);
    assert(roleCount === districtDocumentCount, `document role total mismatch for ${district.district_id}`);
    const verifiedMeetingDateCount = district.verified_meeting_date_count;
    const currentVersionDocumentCount = district.current_version_document_count;
    assert(typeof verifiedMeetingDateCount === "number" && Number.isInteger(verifiedMeetingDateCount) && verifiedMeetingDateCount >= 0, `invalid verified-date count for ${district.district_id}`);
    assert(typeof currentVersionDocumentCount === "number" && Number.isInteger(currentVersionDocumentCount) && currentVersionDocumentCount >= 0, `invalid current-version count for ${district.district_id}`);
    assert(typeof district.has_reviewed_water_watch === "boolean", `invalid Water Watch flag for ${district.district_id}`);
    if (district.has_reviewed_water_watch) waterWatchDistrictCount += 1;
    assert(district.site_detail_path === null || district.site_detail_path === `/groundwater-districts/${district.district_slug}`, `invalid detail path for ${district.district_id}`);
    assert(district.official_website_url === null || isHttpsUrl(district.official_website_url), `invalid official website for ${district.district_id}`);
    assert(Array.isArray(district.official_archive_urls) && district.official_archive_urls.every(isHttpsUrl), `invalid official archive URL for ${district.district_id}`);
  }

  assert(publicReleasedCount === 80, "district rows do not reproduce the 80-district public release");
  assert(documentDistrictCount === 11, "district rows do not reproduce the 11 document-bearing districts");
  assert(documentCount === 1763, "district aggregates do not reproduce 1,763 document records");
  assert(waterWatchDistrictCount === 3, "district rows do not keep Water Watch at 3 districts");

  return value as GcdStatewideDirectoryPackage;
}

const V2_PINS = {
  producerRepository: "aitradesniper-blip/texas-gcd-meeting-records",
  producerCommit: "7b8f4fd56df980a89bbed59208dbdf9daddb5d0a",
  producerTree: "5bbc2e79945ad77e20e906861cae5a7bfa76ab91",
  districtPayloadSha256: "376def4cc7ed02f91ce9b2818ca985dde7402b192d310be6363624c76c180a97",
  documentPayloadSha256: "74275ce37616b34d560f640ba4fb90fd60da4d7e2881e736a886ef643c55409c",
  manifestSha256: "e525652d0abbdbf54edfb814a887a21ebdb063a38c6a1ff641120e0d47f26538",
  snapshotSha256: "21acedf5d41f5ac9cbaebcd8469b0a7a5f140e36f6fe8dbffcb72c08a462cf7e",
  validationSha256: "1261549ba5a5eaeed30c00744917db0bcc35d73fe65336547652a352e20c29ef",
  waterWatchPackageSha256: "9092a8a153a9768f64d94b57c1be13117889d0acecefab057a08bb2eb1e9d904",
  authorizationScopeSha256: "b41180a3bc101c579467b0555acd840e32847a7900e11121f76880668c30bc8c",
  admissionAuthoritySetSha256: "4d737c05e732d9fbe9e1c2ffeb6bdfe8cf309704de54bdc4d85aa2562f8c0a57",
  schemaSha256: "c4edba8cdb63a0f3ecd721e511c2f40efe3cddc531ab78f1be4dceb3c1b00105",
} as const;

export function validateGcdStatewideDirectoryV2Package(
  value: unknown,
  legacyValue: unknown,
): GcdStatewideDirectoryV2Package {
  assert(isRecord(value), "V2 package must be an object");
  assert(value.schema_version === "gcd-statewide-directory-v2", "V2 schema version mismatch");
  assert(isRecord(value.release), "V2 release summary is missing");
  assert(value.release.directory_entry_count === 98, "V2 directory entry count must be 98");
  assert(value.release.public_released_district_count === 80, "V2 public-released district count must be 80");
  assert(value.release.district_identity_only_count === 18, "V2 identity-only count must be 18");
  assert(value.release.districts_with_document_records === 12, "V2 document-bearing count must be 12");
  assert(value.release.source_metadata_only_district_count === 68, "V2 source-metadata-only count must be 68");
  assert(value.release.public_document_record_count === 1934, "V2 document record count must be 1,934");
  assert(value.release.public_event_record_count === 0, "V2 event record count must remain zero");
  assert(value.release.reviewed_water_watch_district_count === 11, "V2 Water Watch district count must be 11");
  assert(value.release.reviewed_water_watch_record_count === 182, "V2 Water Watch record count must be 182");
  assert(Array.isArray(value.directory_limitations) && value.directory_limitations.length >= 5, "V2 directory limitations are missing");
  assert(Array.isArray(value.districts) && value.districts.length === 98, "V2 district array must contain 98 entries");
  assert(isRecord(value.provenance), "V2 provenance is missing");
  assert(isRecord(value.provenance.producer) && isRecord(value.provenance.successor_inputs) && isRecord(value.provenance.split_state) && isRecord(value.provenance.water_watch), "V2 provenance is incomplete");
  const producer = value.provenance.producer;
  const successor = value.provenance.successor_inputs;
  const splitState = value.provenance.split_state;
  const waterWatch = value.provenance.water_watch;
  assert(producer.repository === V2_PINS.producerRepository && producer.merged_commit === V2_PINS.producerCommit && producer.merged_tree === V2_PINS.producerTree && producer.snapshot_package_sha256 === V2_PINS.snapshotSha256, "V2 producer identity is invalid");
  assert(successor.district_payload_sha256 === V2_PINS.districtPayloadSha256 && successor.document_payload_sha256 === V2_PINS.documentPayloadSha256 && successor.manifest_sha256 === V2_PINS.manifestSha256 && successor.successor_validation_sha256 === V2_PINS.validationSha256, "V2 successor payload identity is invalid");
  assert(splitState.district_status_authority_mode === "predecessor_task_c_frozen" && splitState.district_status_reconciled_to_successor_documents === false && splitState.monitoring_status_inference_performed === false && splitState.source_status_inference_performed === false && splitState.consumer_current_state_reconciliation_required === true, "V2 split-state semantics are invalid");
  assert(waterWatch.package_sha256 === V2_PINS.waterWatchPackageSha256 && waterWatch.authorization_scope_sha256 === V2_PINS.authorizationScopeSha256 && waterWatch.admission_authority_set_sha256 === V2_PINS.admissionAuthoritySetSha256 && waterWatch.v2_schema_sha256 === V2_PINS.schemaSha256, "V2 Water Watch authority binding is invalid");

  const legacy = validateGcdStatewideDirectoryPackage(legacyValue);
  const legacyById = new Map(legacy.districts.map((district) => [district.district_id, district]));
  const districtIds = new Set<string>();
  const districtSlugs = new Set<string>();
  let publicReleasedCount = 0;
  let documentDistrictCount = 0;
  let sourceMetadataOnlyCount = 0;
  let documentCount = 0;
  let waterWatchDistrictCount = 0;
  let waterWatchRecordCount = 0;

  for (const district of value.districts) {
    assert(isRecord(district), "V2 district row must be an object");
    assert(typeof district.district_id === "string" && district.district_id.length > 0, "V2 district ID is missing");
    assert(typeof district.district_slug === "string" && /^[a-z0-9-]+$/.test(district.district_slug), `invalid V2 slug for ${district.district_id}`);
    assert(typeof district.district_name === "string" && district.district_name.length > 0, `V2 name is missing for ${district.district_id}`);
    assert(!districtIds.has(district.district_id) && !districtSlugs.has(district.district_slug), `duplicate V2 district identity ${district.district_id}`);
    districtIds.add(district.district_id);
    districtSlugs.add(district.district_slug);
    const legacyDistrict = legacyById.get(district.district_id);
    assert(Boolean(legacyDistrict), `V2 district ${district.district_id} is outside the frozen directory`);
    assert(legacyDistrict?.district_slug === district.district_slug && legacyDistrict?.district_name === district.district_name && legacyDistrict?.public_release_state === district.public_release_state, `V2 changed frozen identity/status for ${district.district_id}`);

    assert(district.public_release_state === "public_released" || district.public_release_state === "not_public_released", `invalid V2 release state for ${district.district_id}`);
    if (district.public_release_state === "public_released") publicReleasedCount += 1;
    assert(typeof district.coverage_label === "string" && district.coverage_label.length > 0, `V2 coverage label is missing for ${district.district_id}`);
    assert(typeof district.coverage_note === "string" && district.coverage_note.length > 0, `V2 coverage note is missing for ${district.district_id}`);
    assert(Number.isInteger(district.document_count) && (district.document_count as number) >= 0, `invalid V2 document count for ${district.district_id}`);
    const rowDocumentCount = district.document_count as number;
    if (rowDocumentCount > 0) documentDistrictCount += 1;
    if (district.public_release_state === "public_released" && rowDocumentCount === 0) sourceMetadataOnlyCount += 1;
    documentCount += rowDocumentCount;
    assert(Array.isArray(district.document_roles), `V2 document roles are missing for ${district.district_id}`);
    const roleCount = district.document_roles.reduce((sum, role) => {
      assert(isRecord(role) && typeof role.role === "string" && typeof role.label === "string" && Number.isInteger(role.count) && (role.count as number) > 0, `invalid V2 document role for ${district.district_id}`);
      return sum + (role.count as number);
    }, 0);
    assert(roleCount === rowDocumentCount, `V2 document role total mismatch for ${district.district_id}`);
    assert(Number.isInteger(district.verified_meeting_date_count) && (district.verified_meeting_date_count as number) >= 0, `invalid V2 verified-date count for ${district.district_id}`);
    assert(Number.isInteger(district.current_version_document_count) && (district.current_version_document_count as number) >= 0, `invalid V2 current-version count for ${district.district_id}`);
    assert(typeof district.has_reviewed_water_watch === "boolean", `invalid V2 Water Watch flag for ${district.district_id}`);
    assert(Number.isInteger(district.reviewed_water_watch_record_count) && (district.reviewed_water_watch_record_count as number) >= 0, `invalid V2 Water Watch count for ${district.district_id}`);
    assert(district.has_reviewed_water_watch === ((district.reviewed_water_watch_record_count as number) > 0), `V2 Water Watch flag/count mismatch for ${district.district_id}`);
    if (district.has_reviewed_water_watch) waterWatchDistrictCount += 1;
    waterWatchRecordCount += district.reviewed_water_watch_record_count as number;
    assert(district.site_detail_path === null || district.site_detail_path === `/groundwater-districts/${district.district_slug}`, `invalid V2 detail path for ${district.district_id}`);
    assert(district.official_website_url === null || isHttpsUrl(district.official_website_url), `invalid V2 official website for ${district.district_id}`);
    assert(Array.isArray(district.official_archive_urls) && district.official_archive_urls.every(isHttpsUrl), `invalid V2 official archive URL for ${district.district_id}`);
    assert(district.successor_document_release_caveat === null || (typeof district.successor_document_release_caveat === "string" && district.successor_document_release_caveat.length > 0), `invalid V2 successor caveat for ${district.district_id}`);
  }

  assert(publicReleasedCount === 80, "V2 district rows do not reproduce the 80-district public release");
  assert(districtIds.size - publicReleasedCount === 18, "V2 district rows do not reproduce 18 identity-only districts");
  assert(documentDistrictCount === 12, "V2 district rows do not reproduce 12 document-bearing districts");
  assert(sourceMetadataOnlyCount === 68, "V2 district rows do not reproduce 68 source-metadata-only districts");
  assert(documentCount === 1934, "V2 district rows do not reproduce 1,934 document records");
  assert(waterWatchDistrictCount === 11 && waterWatchRecordCount === 182, "V2 district rows do not reproduce Water Watch coverage");

  const coastalBend = value.districts.find((district) => isRecord(district) && district.district_id === "coastal_bend_gcd");
  assert(isRecord(coastalBend) && coastalBend.document_count === 171 && coastalBend.reviewed_water_watch_record_count === 29 && coastalBend.has_reviewed_water_watch === true, "Coastal Bend V2 counts are invalid");
  assert(coastalBend.last_checked_date === null && coastalBend.last_successful_source_observation_date === null, "Coastal Bend V2 invents source freshness");
  assert(typeof coastalBend.successor_document_release_caveat === "string" && /not established/i.test(coastalBend.successor_document_release_caveat), "Coastal Bend V2 split-state caveat is missing");

  return value as GcdStatewideDirectoryV2Package;
}
