import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const EXPECTED = {
  directoryEntries: 98,
  publicReleasedDistricts: 80,
  publicDocuments: 1763,
  publicEvents: 0,
  waterWatchDistricts: 3,
  waterWatchRecords: 137,
};

const roleLabels = {
  agenda: "Agendas",
  amended_agenda: "Amended agendas",
  approved_minutes: "Approved minutes",
  board_packet: "Board packets",
  presentation: "Presentations",
  public_hearing_notice: "Public-hearing notices",
  staff_report: "Staff reports",
};

function readArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error(`Invalid argument near ${key ?? "end of command"}`);
    values[key.slice(2)] = value;
  }
  for (const key of ["matrix", "district-feed", "document-feed", "water-watch", "site-routes", "output"]) {
    if (!values[key]) throw new Error(`Missing --${key}`);
  }
  return values;
}

function parseJsonLines(value, label) {
  const lines = value.split(/\r?\n/).filter(Boolean);
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`${label} line ${index + 1} is not valid JSON: ${error.message}`);
    }
  });
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}

function dateOnly(value) {
  return typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : null;
}

function coverageNote({ publicReleaseState, documentCount }) {
  if (publicReleaseState !== "public_released") {
    return "This release includes the district identity only. It makes no claim about the district's meetings, activity, or available official records.";
  }
  if (documentCount === 0) {
    return "Approved district and official-source metadata are published, but this release includes no individual document records for the district. That coverage limit does not characterize the district's meetings or activity.";
  }
  return "Official document listings are navigation metadata. They do not establish that a meeting occurred, concluded, or produced an action.";
}

function publicCoverageLabel({ publicReleaseState, documentCount }) {
  if (publicReleaseState !== "public_released") return "Directory identity only";
  if (documentCount === 0) return "Official source metadata published";
  return "Published document records";
}

const args = readArguments(process.argv.slice(2));
const [matrixText, districtFeedText, documentFeedText, waterWatchText, siteRoutesText] = await Promise.all([
  readFile(args.matrix, "utf8"),
  readFile(args["district-feed"], "utf8"),
  readFile(args["document-feed"], "utf8"),
  readFile(args["water-watch"], "utf8"),
  readFile(args["site-routes"], "utf8"),
]);

const matrix = JSON.parse(matrixText);
const releasedDistricts = parseJsonLines(districtFeedText, "district feed");
const documents = parseJsonLines(documentFeedText, "document feed");
const waterWatch = JSON.parse(waterWatchText);
const siteDetailSlugs = new Set(
  [...siteRoutesText.matchAll(/\{\s*slug:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]),
);

assertEqual(matrix.rows.length, EXPECTED.directoryEntries, "directory identity count");
assertEqual(
  matrix.rows.filter((row) => row.public_release_state === "public_released").length,
  EXPECTED.publicReleasedDistricts,
  "public-released district count",
);
assertEqual(releasedDistricts.length, EXPECTED.publicReleasedDistricts, "public district feed count");
assertEqual(documents.length, EXPECTED.publicDocuments, "public document feed count");
assertEqual(waterWatch.record_count, EXPECTED.waterWatchRecords, "Water Watch record count");

const matrixById = new Map(matrix.rows.map((row) => [row.district_id, row]));
const releasedById = new Map(releasedDistricts.map((row) => [row.district_id, row]));
const waterWatchDistrictIds = new Set(waterWatch.records.map((record) => record.district_id));
assertEqual(waterWatchDistrictIds.size, EXPECTED.waterWatchDistricts, "Water Watch district count");

for (const district of releasedDistricts) {
  const matrixDistrict = matrixById.get(district.district_id);
  if (!matrixDistrict || matrixDistrict.public_release_state !== "public_released") {
    throw new Error(`Released district ${district.district_id} is not public-released in the 98-row matrix`);
  }
  if (matrixDistrict.district_slug !== district.district_slug || matrixDistrict.district_name !== district.district_name) {
    throw new Error(`Identity mismatch for ${district.district_id}`);
  }
}

const documentAggregates = new Map();
for (const document of documents) {
  if (!releasedById.has(document.district_id)) throw new Error(`Document references unreleased district ${document.district_id}`);
  const aggregate = documentAggregates.get(document.district_id) ?? {
    count: 0,
    currentVersionCount: 0,
    verifiedMeetingDateCount: 0,
    roles: new Map(),
  };
  aggregate.count += 1;
  if (document.is_current_version === true) aggregate.currentVersionCount += 1;
  if (document.meeting_date_authority_state === "verified_exact" && document.meeting_date) {
    aggregate.verifiedMeetingDateCount += 1;
  }
  aggregate.roles.set(document.document_role, (aggregate.roles.get(document.document_role) ?? 0) + 1);
  documentAggregates.set(document.district_id, aggregate);
}

const districts = [...matrix.rows]
  .sort((left, right) => left.district_name.localeCompare(right.district_name, "en-US"))
  .map((matrixDistrict) => {
    const released = releasedById.get(matrixDistrict.district_id);
    const aggregate = documentAggregates.get(matrixDistrict.district_id) ?? {
      count: 0,
      currentVersionCount: 0,
      verifiedMeetingDateCount: 0,
      roles: new Map(),
    };
    const publicReleaseState = matrixDistrict.public_release_state;
    return {
      district_id: matrixDistrict.district_id,
      district_slug: matrixDistrict.district_slug,
      district_name: matrixDistrict.district_name,
      public_release_state: publicReleaseState,
      coverage_label: publicCoverageLabel({ publicReleaseState, documentCount: aggregate.count }),
      coverage_note: coverageNote({ publicReleaseState, documentCount: aggregate.count }),
      document_count: aggregate.count,
      document_roles: [...aggregate.roles]
        .map(([role, count]) => ({ role, label: roleLabels[role] ?? role.replaceAll("_", " "), count }))
        .sort((left, right) => left.label.localeCompare(right.label, "en-US")),
      verified_meeting_date_count: aggregate.verifiedMeetingDateCount,
      current_version_document_count: aggregate.currentVersionCount,
      has_reviewed_water_watch: waterWatchDistrictIds.has(matrixDistrict.district_id),
      site_detail_path: siteDetailSlugs.has(matrixDistrict.district_slug)
        ? `/groundwater-districts/${matrixDistrict.district_slug}`
        : null,
      official_website_url: released?.official_website_url ?? null,
      official_archive_urls: released?.official_archive_urls ?? [],
      last_checked_date: dateOnly(released?.last_checked_at),
      last_successful_source_observation_date: dateOnly(released?.last_successful_source_observation_at),
    };
  });

assertEqual(districts.filter((district) => district.document_count > 0).length, 11, "districts with document records");
assertEqual(districts.reduce((sum, district) => sum + district.document_count, 0), EXPECTED.publicDocuments, "aggregated document count");
assertEqual(districts.filter((district) => district.has_reviewed_water_watch).length, EXPECTED.waterWatchDistricts, "directory Water Watch count");

const packageValue = {
  schema_version: "gcd-statewide-directory-v1",
  release: {
    directory_entry_count: EXPECTED.directoryEntries,
    public_released_district_count: EXPECTED.publicReleasedDistricts,
    district_identity_only_count: EXPECTED.directoryEntries - EXPECTED.publicReleasedDistricts,
    districts_with_document_records: 11,
    public_document_record_count: EXPECTED.publicDocuments,
    public_event_record_count: EXPECTED.publicEvents,
    reviewed_water_watch_district_count: EXPECTED.waterWatchDistricts,
    reviewed_water_watch_record_count: EXPECTED.waterWatchRecords,
    source_cutoff_date: "2026-08-01",
    approved_release_date: "2026-08-02",
  },
  directory_limitations: [
    "Directory identity, source metadata, document listings, and reviewed Texas Water Watch intelligence are separate coverage levels.",
    "An official document listing does not establish that a meeting occurred, concluded, or produced an action.",
    "A district entry or source link does not determine whether the district has jurisdiction over a property.",
    "The absence of released document metadata does not characterize a district's meetings, available official records, or activity.",
  ],
  districts,
};

await mkdir(path.dirname(args.output), { recursive: true });
await writeFile(args.output, `${JSON.stringify(packageValue, null, 2)}\n`, "utf8");
console.log(JSON.stringify(packageValue.release, null, 2));
