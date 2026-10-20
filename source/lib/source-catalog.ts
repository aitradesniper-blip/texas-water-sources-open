import catalogJson from "@/public/data/texas-water-sources/v1/catalog.json";

export const SITE_DISCLAIMER =
  "TexasWaterSources.com is an independent research and source-navigation service. Neither this website nor the information as presented is endorsed by the State of Texas, the Texas Water Development Board, TxGIO, or any groundwater conservation district. Official agency and district records remain the authoritative sources.";

export const PUBLIC_SOURCE_IDS = [
  "twdb_groundwater_database",
  "twdb_submitted_drillers_reports",
  "twdb_plugging_reports",
  "twdb_water_conditions",
  "txgio_stratmap_land_parcels",
  "txgio_stratmap_address_points",
  "tceq_groundwater_conservation_district_boundaries",
  "coastal_bend_groundwater_conservation_district",
] as const;

export type PublicSourceId = (typeof PUBLIC_SOURCE_IDS)[number];

export interface PublicSourceRecord {
  agency: string;
  agency_level: string;
  attribution_text: string;
  counties: string[];
  districts: string[];
  geographic_scope: string[];
  keywords: string[];
  last_verified_date: string;
  official_source_label: string;
  official_url: string;
  required_disclaimer_text: string;
  search_steps: string[];
  search_url: string;
  short_description: string;
  sort_priority: number;
  source_category: string;
  source_date_basis: string;
  source_id: PublicSourceId;
  terms_url: string;
  title: string;
  trec_sections: string[];
  what_it_can_help_find: string[];
  what_it_cannot_confirm: string[];
}

export function comparePublicSources(a: PublicSourceRecord, b: PublicSourceRecord) {
  return (
    a.source_category.localeCompare(b.source_category) ||
    a.sort_priority - b.sort_priority ||
    a.title.localeCompare(b.title)
  );
}

interface PublicSourceCatalog {
  api_version: "v1";
  publication_status: "ready";
  sources: PublicSourceRecord[];
}

const catalogKeys = ["api_version", "publication_status", "sources"];
const sourceKeys = [
  "agency",
  "agency_level",
  "attribution_text",
  "counties",
  "districts",
  "geographic_scope",
  "keywords",
  "last_verified_date",
  "official_source_label",
  "official_url",
  "required_disclaimer_text",
  "search_steps",
  "search_url",
  "short_description",
  "sort_priority",
  "source_category",
  "source_date_basis",
  "source_id",
  "terms_url",
  "title",
  "trec_sections",
  "what_it_can_help_find",
  "what_it_cannot_confirm",
];
const arrayKeys = [
  "counties",
  "districts",
  "geographic_scope",
  "keywords",
  "search_steps",
  "trec_sections",
  "what_it_can_help_find",
  "what_it_cannot_confirm",
] as const;
const stringKeys = sourceKeys.filter(
  (key) => key !== "sort_priority" && !arrayKeys.includes(key as (typeof arrayKeys)[number]),
);
const localPathPattern = /[a-z]:\\|file:\/\/|\\Users\\|\/(?:home|Users|managed_data|Downloads)\//i;
const approvedOfficialUrlReuse: Record<string, { sourceIds: PublicSourceId[]; reason: string }> = {
  "https://www.twdb.texas.gov/groundwater/data/index.asp": {
    sourceIds: ["twdb_submitted_drillers_reports", "twdb_plugging_reports"],
    reason: "TWDB uses one groundwater-data landing page for two distinct report families.",
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertExactKeys(value: Record<string, unknown>, expected: string[], label: string) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function assertHttps(value: string, label: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} is not a valid URL`);
  }
  if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS`);
}

export function validatePublicSourceCatalog(input: unknown): PublicSourceCatalog {
  if (!isObject(input)) throw new Error("Catalog must be an object");
  assertExactKeys(input, catalogKeys, "Catalog");
  if (input.api_version !== "v1" || input.publication_status !== "ready") {
    throw new Error("Catalog is not the approved v1 publication");
  }
  if (!Array.isArray(input.sources) || input.sources.length !== PUBLIC_SOURCE_IDS.length) {
    throw new Error("Catalog must contain exactly eight approved sources");
  }

  const records = input.sources.map((candidate, index) => {
    if (!isObject(candidate)) throw new Error(`Source ${index} must be an object`);
    assertExactKeys(candidate, sourceKeys, `Source ${index}`);
    for (const key of stringKeys) {
      if (typeof candidate[key] !== "string" || !(candidate[key] as string).trim()) {
        throw new Error(`Source ${index}.${key} must be a non-empty string`);
      }
    }
    for (const key of arrayKeys) {
      if (!Array.isArray(candidate[key]) || !(candidate[key] as unknown[]).every((item) => typeof item === "string")) {
        throw new Error(`Source ${index}.${key} must be a string array`);
      }
    }
    if (!Number.isInteger(candidate.sort_priority)) {
      throw new Error(`Source ${index}.sort_priority must be an integer`);
    }
    if (!PUBLIC_SOURCE_IDS.includes(candidate.source_id as PublicSourceId)) {
      throw new Error(`Source ${index} has an unapproved source_id`);
    }
    for (const key of ["official_url", "search_url", "terms_url"] as const) {
      assertHttps(candidate[key] as string, `Source ${index}.${key}`);
    }
    if (candidate.required_disclaimer_text !== SITE_DISCLAIMER) {
      throw new Error(`Source ${index} has an altered required disclaimer`);
    }
    const serialized = JSON.stringify(candidate);
    if (localPathPattern.test(serialized)) throw new Error(`Source ${index} contains a local path`);
    return candidate as unknown as PublicSourceRecord;
  });

  const ids = records.map((record) => record.source_id);
  if (new Set(ids).size !== PUBLIC_SOURCE_IDS.length || PUBLIC_SOURCE_IDS.some((id) => !ids.includes(id))) {
    throw new Error("Catalog source IDs do not match the approved set");
  }
  for (let index = 1; index < records.length; index += 1) {
    if (comparePublicSources(records[index - 1], records[index]) > 0) {
      throw new Error("Catalog sources must use category, priority, and title order");
    }
  }

  const urls = new Map<string, PublicSourceId[]>();
  for (const record of records) {
    const normalized = new URL(record.official_url).href;
    urls.set(normalized, [...(urls.get(normalized) ?? []), record.source_id]);
  }
  for (const [url, sourceIds] of urls) {
    if (sourceIds.length < 2) continue;
    const exception = approvedOfficialUrlReuse[url];
    if (!exception || !exception.reason || [...sourceIds].sort().join() !== [...exception.sourceIds].sort().join()) {
      throw new Error(`Duplicate official URL lacks an explicit approved justification: ${url}`);
    }
  }

  return { api_version: "v1", publication_status: "ready", sources: records };
}

export const publicSourceCatalog = validatePublicSourceCatalog(catalogJson);
export const publicSources = [...publicSourceCatalog.sources];
export const sourceCategories = [...new Set(publicSources.map((source) => source.source_category))].sort();
export const sourceCounties = [...new Set(publicSources.flatMap((source) => source.counties))].sort();
export const sourceDistricts = [...new Set(publicSources.flatMap((source) => source.districts))].sort();
export const sourceTrecSections = [...new Set(publicSources.flatMap((source) => source.trec_sections))].sort();

export function getPublicSource(sourceId: string) {
  return publicSources.find((source) => source.source_id === sourceId);
}

export interface SourceFilters {
  keyword: string;
  sourceCategory: string;
  county: string;
  district: string;
  trecSection: string;
}

export function filterPublicSources(records: PublicSourceRecord[], filters: SourceFilters) {
  const keyword = filters.keyword.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const searchable = [
      record.title,
      record.agency,
      record.source_category,
      record.short_description,
      ...record.what_it_can_help_find,
      ...record.what_it_cannot_confirm,
      ...record.keywords,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return (
      (!keyword || searchable.includes(keyword)) &&
      (!filters.sourceCategory || record.source_category === filters.sourceCategory) &&
      (!filters.county || record.counties.includes(filters.county)) &&
      (!filters.district || record.districts.includes(filters.district)) &&
      (!filters.trecSection || record.trec_sections.includes(filters.trecSection))
    );
  });
}
