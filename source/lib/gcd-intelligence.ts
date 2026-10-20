export const GCD_DISTRICT_IDS = [
  "barton_springs_edwards_aquifer_conservation_district",
  "clearwater_uwcd",
  "coastal_bend_gcd",
  "comal_trinity_gcd",
  "kinney_county_gcd",
  "middle_pecos_gcd",
  "north_plains_gcd",
  "northern_trinity_gcd",
  "reeves_county_gcd",
  "southwestern_travis_county_gcd",
  "upper_trinity_gcd",
] as const;

export const GCD_V1_DISTRICT_IDS = [
  "kinney_county_gcd",
  "northern_trinity_gcd",
  "southwestern_travis_county_gcd",
] as const;

export const GCD_FACT_TYPES = [
  "applicant_name",
  "authorized_requested_recommended_or_limit_quantity",
  "compliance_violation",
  "desired_future_condition_drawdown",
  "enforcement_action",
  "litigation_reference",
  "pumping_or_production_quantity",
  "regional_aquifer_drawdown_reference",
  "water_level_observation",
  "well_identifier",
] as const;

export const GCD_EVIDENCE_METHODS = ["native_text", "ocr", "visual_review"] as const;

export type GcdDistrictId = (typeof GCD_DISTRICT_IDS)[number];
export type GcdFactType = (typeof GCD_FACT_TYPES)[number];
export type GcdEvidenceMethod = (typeof GCD_EVIDENCE_METHODS)[number];

export const GCD_WATER_WATCH_ACTIVITY_GROUPS = [
  "permit_activity",
  "production",
  "wells",
  "water_levels",
  "compliance",
  "planning",
  "litigation",
] as const;

export type GcdWaterWatchActivityGroup = (typeof GCD_WATER_WATCH_ACTIVITY_GROUPS)[number];

export const GCD_WATER_WATCH_ACTIVITY_LABELS: Record<GcdWaterWatchActivityGroup, string> = {
  permit_activity: "Permit, authorization, or limit",
  production: "Pumping or production",
  wells: "Wells or identifiers",
  water_levels: "Water levels",
  compliance: "Compliance or enforcement",
  planning: "Planning, DFC, or management",
  litigation: "Litigation or other",
};

const waterWatchActivityByFactType: Record<GcdFactType, GcdWaterWatchActivityGroup> = {
  applicant_name: "permit_activity",
  authorized_requested_recommended_or_limit_quantity: "permit_activity",
  compliance_violation: "compliance",
  desired_future_condition_drawdown: "planning",
  enforcement_action: "compliance",
  litigation_reference: "litigation",
  pumping_or_production_quantity: "production",
  regional_aquifer_drawdown_reference: "water_levels",
  water_level_observation: "water_levels",
  well_identifier: "wells",
};

export type GcdIntelligenceRecord = {
  public_record_id: string;
  district_id: GcdDistrictId;
  district_name: string;
  intelligence_category: string;
  product_export_fact_type: GcdFactType;
  display_value: string;
  units: string | null;
  parsed_numeric_value: number | null;
  source_page: number;
  official_source_url: string;
  source_context_caveat: boolean;
  source_context_caveat_label: string;
  evidence_method: GcdEvidenceMethod;
  evidence_label: string;
  what_it_may_indicate: string;
  what_it_does_not_prove: string;
  property_scope: "district_level_not_property_specific";
  attribution_text: string;
};

export type GcdIntelligencePackage = {
  schema_version: "1.0.0";
  dataset_id: "gcd-wave2-priority1-intelligence-v1";
  scope: "district_level_meeting_intelligence_not_property_specific";
  disclaimer: string;
  record_count: number;
  records: GcdIntelligenceRecord[];
};

export type GcdIntelligenceV2Package = Omit<GcdIntelligencePackage, "schema_version" | "dataset_id"> & {
  schema_version: "2.0.0";
  dataset_id: "gcd-wave2-priority1-intelligence-v2";
};

export type GcdIntelligenceV2Provenance = {
  schema_version: "gcd-water-watch-v2-provenance-v1";
  authority: {
    authorization_scope_sha256: string;
    admission_authority_set_sha256: string;
    combined_45_set_sha256: string;
    new_45_id_set_sha256: string;
    v2_schema_sha256: string;
    governing_operator_packet_sha256: string;
  };
  legacy_v1: {
    package_sha256: string;
    records_preserved: number;
  };
  current_package: {
    package_sha256: string;
    package_size_bytes: number;
    record_count: number;
    district_count: number;
    fact_type_count: number;
  };
  authorized_new_public_ids: string[];
};

export function getGcdWaterWatchActivityGroup(factType: GcdFactType): GcdWaterWatchActivityGroup {
  return waterWatchActivityByFactType[factType];
}

export function summarizeGcdWaterWatchActivities(records: GcdIntelligenceRecord[]) {
  return GCD_WATER_WATCH_ACTIVITY_GROUPS.map((id) => ({
    id,
    label: GCD_WATER_WATCH_ACTIVITY_LABELS[id],
    count: records.filter((record) => getGcdWaterWatchActivityGroup(record.product_export_fact_type) === id).length,
  })).filter((group) => group.count > 0);
}

function validSourceDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getGcdSourceDate(officialSourceUrl: string): string | null {
  const filename = decodeURIComponent(new URL(officialSourceUrl).pathname.split("/").at(-1) ?? "");
  const compact = filename.match(/(?:^|[^0-9])((?:19|20)[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])(?:[^0-9]|$)/);
  if (compact) return validSourceDate(Number(compact[1]), Number(compact[2]), Number(compact[3]));
  const iso = filename.match(/(?:^|[^0-9])((?:19|20)[0-9]{2})-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])(?:[^0-9]|$)/);
  if (iso) return validSourceDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const namedMonths: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  const named = filename.match(/(?:^|[^A-Za-z])(January|February|March|April|May|June|July|August|September|October|November|December)-(0?[1-9]|[12][0-9]|3[01])-((?:19|20)[0-9]{2})(?:[^0-9]|$)/i);
  if (named) return validSourceDate(Number(named[3]), namedMonths[named[1].toLowerCase()], Number(named[2]));
  const short = filename.match(/(?:^|[^0-9])(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])-([0-9]{2})(?:[^0-9]|$)/);
  if (short) return validSourceDate(2000 + Number(short[3]), Number(short[1]), Number(short[2]));
  return null;
}

export function formatGcdSourceDate(sourceDate: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${sourceDate}T00:00:00Z`));
}

const packageKeys = ["schema_version", "dataset_id", "scope", "disclaimer", "record_count", "records"];
const recordKeys = [
  "public_record_id", "district_id", "district_name", "intelligence_category",
  "product_export_fact_type", "display_value", "units", "parsed_numeric_value",
  "source_page", "official_source_url", "source_context_caveat",
  "source_context_caveat_label", "evidence_method", "evidence_label",
  "what_it_may_indicate", "what_it_does_not_prove", "property_scope", "attribution_text",
];
const districtSet = new Set<string>(GCD_DISTRICT_IDS);
const v1DistrictSet = new Set<string>(GCD_V1_DISTRICT_IDS);
const factTypeSet = new Set<string>(GCD_FACT_TYPES);
const evidenceSet = new Set<string>(GCD_EVIDENCE_METHODS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function exact(value: Record<string, unknown>, expected: string[], label: string) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} has an unexpected field`);
  }
}

function text(value: unknown, label: string, max = 800): string {
  if (typeof value !== "string" || value.length < 1 || value.length > max) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

function parsePublicRecord(value: unknown, index: number, version: "v1" | "v2"): GcdIntelligenceRecord {
  if (!isRecord(value)) throw new Error(`GCD record ${index} is invalid`);
  exact(value, recordKeys, `GCD record ${index}`);
  const publicRecordId = text(value.public_record_id, `GCD record ${index} ID`, 64);
  const validId = version === "v1"
    ? /^gcd-intelligence-v1-[0-9]{4}$/.test(publicRecordId)
    : /^gcd-intelligence-(?:v1-[0-9]{4}|v2-[a-z2-7]{26})$/.test(publicRecordId);
  if (!validId) throw new Error(`GCD record ${index} ID is invalid`);
  const allowedDistricts = version === "v1" ? v1DistrictSet : districtSet;
  if (typeof value.district_id !== "string" || !allowedDistricts.has(value.district_id)) throw new Error(`GCD record ${index} district is invalid`);
  if (typeof value.product_export_fact_type !== "string" || !factTypeSet.has(value.product_export_fact_type)) throw new Error(`GCD record ${index} fact type is invalid`);
  if (typeof value.evidence_method !== "string" || !evidenceSet.has(value.evidence_method)) throw new Error(`GCD record ${index} evidence is invalid`);
  if (!Number.isInteger(value.source_page) || (value.source_page as number) < 1) throw new Error(`GCD record ${index} page is invalid`);
  if (value.units !== null && typeof value.units !== "string") throw new Error(`GCD record ${index} units are invalid`);
  if (value.parsed_numeric_value !== null && typeof value.parsed_numeric_value !== "number") throw new Error(`GCD record ${index} numeric value is invalid`);
  if (typeof value.source_context_caveat !== "boolean") throw new Error(`GCD record ${index} caveat is invalid`);
  if (value.property_scope !== "district_level_not_property_specific") throw new Error(`GCD record ${index} property scope is invalid`);
  const sourceUrl = text(value.official_source_url, `GCD record ${index} source URL`, 500);
  let parsedSource: URL;
  try { parsedSource = new URL(sourceUrl); } catch { throw new Error(`GCD record ${index} source URL is invalid`); }
  if (parsedSource.protocol !== "https:" || parsedSource.username || parsedSource.password) throw new Error(`GCD record ${index} source URL is unsafe`);
  const evidenceLabel = text(value.evidence_label, `GCD record ${index} evidence label`, 140);
  if (value.evidence_method === "ocr" && (!/\bOCR\b/i.test(evidenceLabel) || /native[- ]text/i.test(evidenceLabel))) throw new Error(`GCD record ${index} OCR label is invalid`);
  if (value.evidence_method === "native_text" && (!/native[- ]text/i.test(evidenceLabel) || /\bOCR\b/i.test(evidenceLabel))) throw new Error(`GCD record ${index} native-text label is invalid`);
  return {
    public_record_id: publicRecordId,
    district_id: value.district_id as GcdDistrictId,
    district_name: text(value.district_name, `GCD record ${index} district name`, 120),
    intelligence_category: text(value.intelligence_category, `GCD record ${index} category`, 80),
    product_export_fact_type: value.product_export_fact_type as GcdFactType,
    display_value: text(value.display_value, `GCD record ${index} display`, 240),
    units: value.units as string | null,
    parsed_numeric_value: value.parsed_numeric_value as number | null,
    source_page: value.source_page as number,
    official_source_url: sourceUrl,
    source_context_caveat: value.source_context_caveat,
    source_context_caveat_label: text(value.source_context_caveat_label, `GCD record ${index} caveat label`, 140),
    evidence_method: value.evidence_method as GcdEvidenceMethod,
    evidence_label: evidenceLabel,
    what_it_may_indicate: text(value.what_it_may_indicate, `GCD record ${index} meaning`, 240),
    what_it_does_not_prove: text(value.what_it_does_not_prove, `GCD record ${index} limit`, 400),
    property_scope: "district_level_not_property_specific",
    attribution_text: text(value.attribution_text, `GCD record ${index} attribution`, 240),
  };
}

export function validateGcdIntelligencePackage(value: unknown): GcdIntelligencePackage {
  if (!isRecord(value)) throw new Error("GCD intelligence package is invalid");
  exact(value, packageKeys, "GCD intelligence package");
  if (value.schema_version !== "1.0.0" || value.dataset_id !== "gcd-wave2-priority1-intelligence-v1" || value.scope !== "district_level_meeting_intelligence_not_property_specific" || value.record_count !== 137) {
    throw new Error("GCD intelligence package identity is invalid");
  }
  if (!Array.isArray(value.records) || value.records.length !== value.record_count) throw new Error("GCD intelligence record count is invalid");
  const records = value.records.map((record, index) => parsePublicRecord(record, index, "v1"));
  if (new Set(records.map((record) => record.public_record_id)).size !== value.record_count) throw new Error("GCD public record IDs are not unique");
  return {
    schema_version: "1.0.0",
    dataset_id: "gcd-wave2-priority1-intelligence-v1",
    scope: "district_level_meeting_intelligence_not_property_specific",
    disclaimer: text(value.disclaimer, "GCD disclaimer", 700),
    record_count: value.record_count,
    records,
  };
}

const V2_EXPECTED = {
  packageSha256: "9092a8a153a9768f64d94b57c1be13117889d0acecefab057a08bb2eb1e9d904",
  legacyPackageSha256: "c3fb2d17eb729d5a0b972eedb36dc3366cddeb42d882c439f72d9eb879c0c1d7",
  authorizationScopeSha256: "b41180a3bc101c579467b0555acd840e32847a7900e11121f76880668c30bc8c",
  admissionAuthoritySetSha256: "4d737c05e732d9fbe9e1c2ffeb6bdfe8cf309704de54bdc4d85aa2562f8c0a57",
  combinedSetSha256: "180f6626dcb313ac16c7877092c64b4a5ad51775ee3a4ed841cfb8a9bb6de62b",
  newIdSetSha256: "24a8684466c66f7d8824f97a7f5b0255c957cfe83c5199d9f5555cbace48d2cd",
  schemaSha256: "c4edba8cdb63a0f3ecd721e511c2f40efe3cddc531ab78f1be4dceb3c1b00105",
  governingOperatorPacketSha256: "769744109728e55d4d783752127e3ff1ae6fc43e2e99d847124feb70befb65e8",
  records: 182,
  districts: 11,
  factTypes: 10,
  legacyRecords: 137,
  newRecords: 45,
  capacity: 512,
  byteCeiling: 2_000_000,
} as const;

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (isRecord(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  return value;
}

function stableJson(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

export function validateGcdIntelligenceV2Package(
  value: unknown,
  legacyValue: unknown,
  provenanceValue: unknown,
): GcdIntelligenceV2Package {
  if (!isRecord(value)) throw new Error("GCD intelligence V2 package is invalid");
  exact(value, packageKeys, "GCD intelligence V2 package");
  if (value.schema_version !== "2.0.0" || value.dataset_id !== "gcd-wave2-priority1-intelligence-v2" || value.scope !== "district_level_meeting_intelligence_not_property_specific") {
    throw new Error("GCD intelligence V2 package identity is invalid");
  }
  if (value.record_count !== V2_EXPECTED.records || value.record_count > V2_EXPECTED.capacity) throw new Error("GCD intelligence V2 record count is invalid");
  if (!Array.isArray(value.records) || value.records.length !== value.record_count) throw new Error("GCD intelligence V2 records are invalid");
  const packageSize = new TextEncoder().encode(stableJson(value)).byteLength;
  if (packageSize > V2_EXPECTED.byteCeiling) throw new Error("GCD intelligence V2 package exceeds its byte ceiling");

  if (!isRecord(provenanceValue) || provenanceValue.schema_version !== "gcd-water-watch-v2-provenance-v1") throw new Error("GCD intelligence V2 provenance is invalid");
  if (!isRecord(provenanceValue.authority) || !isRecord(provenanceValue.legacy_v1) || !isRecord(provenanceValue.current_package)) throw new Error("GCD intelligence V2 provenance binding is incomplete");
  const authority = provenanceValue.authority;
  if (
    authority.authorization_scope_sha256 !== V2_EXPECTED.authorizationScopeSha256
    || authority.admission_authority_set_sha256 !== V2_EXPECTED.admissionAuthoritySetSha256
    || authority.combined_45_set_sha256 !== V2_EXPECTED.combinedSetSha256
    || authority.new_45_id_set_sha256 !== V2_EXPECTED.newIdSetSha256
    || authority.v2_schema_sha256 !== V2_EXPECTED.schemaSha256
    || authority.governing_operator_packet_sha256 !== V2_EXPECTED.governingOperatorPacketSha256
  ) throw new Error("GCD intelligence V2 authority binding is invalid");
  if (provenanceValue.legacy_v1.package_sha256 !== V2_EXPECTED.legacyPackageSha256 || provenanceValue.legacy_v1.records_preserved !== V2_EXPECTED.legacyRecords) throw new Error("GCD intelligence V1 preservation binding is invalid");
  if (
    provenanceValue.current_package.package_sha256 !== V2_EXPECTED.packageSha256
    || provenanceValue.current_package.package_size_bytes !== packageSize
    || provenanceValue.current_package.record_count !== V2_EXPECTED.records
    || provenanceValue.current_package.district_count !== V2_EXPECTED.districts
    || provenanceValue.current_package.fact_type_count !== V2_EXPECTED.factTypes
  ) throw new Error("GCD intelligence V2 package provenance is invalid");
  if (!Array.isArray(provenanceValue.authorized_new_public_ids) || provenanceValue.authorized_new_public_ids.length !== V2_EXPECTED.newRecords) throw new Error("GCD intelligence V2 authorized-ID list is invalid");

  const legacy = validateGcdIntelligencePackage(legacyValue);
  const records = value.records.map((record, index) => parsePublicRecord(record, index, "v2"));
  const ids = new Set(records.map((record) => record.public_record_id));
  if (ids.size !== V2_EXPECTED.records) throw new Error("GCD intelligence V2 public record IDs are not unique");
  const legacyById = new Map(legacy.records.map((record) => [record.public_record_id, record]));
  const currentById = new Map(records.map((record) => [record.public_record_id, record]));
  for (const [id, legacyRecord] of legacyById) {
    const currentRecord = currentById.get(id);
    if (!currentRecord || stableJson(currentRecord) !== stableJson(legacyRecord)) throw new Error(`GCD intelligence V2 changed legacy record ${id}`);
  }
  const authorizedNewIds = new Set(provenanceValue.authorized_new_public_ids);
  if (authorizedNewIds.size !== V2_EXPECTED.newRecords || [...authorizedNewIds].some((id) => typeof id !== "string" || !/^gcd-intelligence-v2-[a-z2-7]{26}$/.test(id))) throw new Error("GCD intelligence V2 authorized IDs are malformed or duplicated");
  const actualNewIds = records.filter((record) => record.public_record_id.startsWith("gcd-intelligence-v2-")).map((record) => record.public_record_id);
  if (actualNewIds.length !== V2_EXPECTED.newRecords || actualNewIds.some((id) => !authorizedNewIds.has(id))) throw new Error("GCD intelligence V2 contains an unauthorized new record");
  if (new Set(records.map((record) => record.district_id)).size !== V2_EXPECTED.districts) throw new Error("GCD intelligence V2 district count is invalid");
  if (new Set(records.map((record) => record.product_export_fact_type)).size !== V2_EXPECTED.factTypes) throw new Error("GCD intelligence V2 fact taxonomy is invalid");

  return {
    schema_version: "2.0.0",
    dataset_id: "gcd-wave2-priority1-intelligence-v2",
    scope: "district_level_meeting_intelligence_not_property_specific",
    disclaimer: text(value.disclaimer, "GCD intelligence V2 disclaimer", 700),
    record_count: value.record_count,
    records,
  };
}

export type DistrictIntelligenceSummary = {
  district_id: GcdDistrictId;
  district_name: string;
  district_slug: string;
  record_count: number;
  categories: string[];
  aliases: readonly string[];
  site_detail_path: string | null;
};

export const DISTRICT_INTELLIGENCE_SUMMARIES: readonly DistrictIntelligenceSummary[] = [
  {
    district_id: "barton_springs_edwards_aquifer_conservation_district",
    district_name: "Barton Springs/Edwards Aquifer Conservation District",
    district_slug: "barton-springs-edwards-aquifer-conservation-district",
    record_count: 3,
    categories: ["Aquifer planning and water levels", "Legal and regulatory", "Permit and limit activity"],
    aliases: ["Barton Springs/Edwards Aquifer Conservation District", "Barton Springs Edwards Aquifer Conservation District"],
    site_detail_path: "/groundwater-districts/barton-springs-edwards-aquifer-conservation-district",
  },
  {
    district_id: "clearwater_uwcd",
    district_name: "Clearwater Underground Water Conservation District",
    district_slug: "clearwater-uwcd",
    record_count: 1,
    categories: ["Applicant activity"],
    aliases: ["Clearwater Underground Water Conservation District", "Clearwater UWCD"],
    site_detail_path: null,
  },
  {
    district_id: "coastal_bend_gcd",
    district_name: "Coastal Bend Groundwater Conservation District",
    district_slug: "coastal-bend-groundwater-conservation-district",
    record_count: 29,
    categories: ["Aquifer planning and water levels", "Compliance and enforcement", "Legal and regulatory", "Permit and limit activity"],
    aliases: ["Coastal Bend Groundwater Conservation District", "Coastal Bend GCD"],
    site_detail_path: null,
  },
  {
    district_id: "comal_trinity_gcd",
    district_name: "Comal Trinity Groundwater Conservation District",
    district_slug: "comal-trinity-gcd",
    record_count: 2,
    categories: ["Aquifer planning and water levels", "Production history"],
    aliases: ["Comal Trinity Groundwater Conservation District", "Comal Trinity GCD"],
    site_detail_path: "/groundwater-districts/comal-trinity-gcd",
  },
  {
    district_id: "northern_trinity_gcd",
    district_name: "Northern Trinity Groundwater Conservation District",
    district_slug: "northern-trinity-gcd",
    record_count: 110,
    categories: ["Applicant activity", "Compliance and enforcement", "Permit and limit activity", "Production history", "Well references"],
    aliases: ["Northern Trinity Groundwater Conservation District", "Northern Trinity GCD", "NTGCD"],
    site_detail_path: "/groundwater-districts/northern-trinity-gcd",
  },
  {
    district_id: "southwestern_travis_county_gcd",
    district_name: "Southwestern Travis County Groundwater Conservation District",
    district_slug: "southwestern-travis-county-gcd",
    record_count: 26,
    categories: ["Aquifer planning and water levels", "Compliance and enforcement", "Legal and regulatory", "Permit and limit activity", "Production history", "Well references"],
    aliases: ["Southwestern Travis County Groundwater Conservation District", "Southwestern Travis County GCD", "SWTCGCD"],
    site_detail_path: "/groundwater-districts/southwestern-travis-county-gcd",
  },
  {
    district_id: "kinney_county_gcd",
    district_name: "Kinney County Groundwater Conservation District",
    district_slug: "kinney-county-gcd",
    record_count: 1,
    categories: ["Legal and regulatory"],
    aliases: ["Kinney County Groundwater Conservation District", "Kinney County GCD", "KCGCD"],
    site_detail_path: "/groundwater-districts/kinney-county-gcd",
  },
  {
    district_id: "middle_pecos_gcd",
    district_name: "Middle Pecos Groundwater Conservation District",
    district_slug: "middle-pecos-gcd",
    record_count: 5,
    categories: ["Applicant activity", "Aquifer planning and water levels", "Compliance and enforcement", "Legal and regulatory", "Production history"],
    aliases: ["Middle Pecos Groundwater Conservation District", "Middle Pecos GCD"],
    site_detail_path: null,
  },
  {
    district_id: "north_plains_gcd",
    district_name: "North Plains Groundwater Conservation District",
    district_slug: "north-plains-gcd",
    record_count: 1,
    categories: ["Compliance and enforcement"],
    aliases: ["North Plains Groundwater Conservation District", "North Plains GCD"],
    site_detail_path: "/groundwater-districts/north-plains-gcd",
  },
  {
    district_id: "reeves_county_gcd",
    district_name: "Reeves County Groundwater Conservation District",
    district_slug: "reeves-county-gcd",
    record_count: 1,
    categories: ["Permit and limit activity"],
    aliases: ["Reeves County Groundwater Conservation District", "Reeves County GCD"],
    site_detail_path: "/groundwater-districts/reeves-county-gcd",
  },
  {
    district_id: "upper_trinity_gcd",
    district_name: "Upper Trinity Groundwater Conservation District",
    district_slug: "upper-trinity-gcd",
    record_count: 3,
    categories: ["Compliance and enforcement", "Permit and limit activity", "Well references"],
    aliases: ["Upper Trinity Groundwater Conservation District", "Upper Trinity GCD"],
    site_detail_path: "/groundwater-districts/upper-trinity-gcd",
  },
] as const;

type DistrictIdentifierTask = { identifiers: Array<{ label: string; value: string }> };

export function detectDistrictIntelligence(tasks: DistrictIdentifierTask[]): DistrictIntelligenceSummary | null {
  const approvedAliases = new Map<string, DistrictIntelligenceSummary>();
  for (const district of DISTRICT_INTELLIGENCE_SUMMARIES) {
    for (const alias of district.aliases) approvedAliases.set(alias.trim().toLocaleLowerCase("en-US"), district);
  }
  for (const task of tasks) {
    for (const identifier of task.identifiers) {
      if (identifier.label !== "District name") continue;
      const match = approvedAliases.get(identifier.value.trim().toLocaleLowerCase("en-US"));
      if (match) return match;
    }
  }
  return null;
}
