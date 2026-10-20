import type { EditorialContent, EditorialOfficialSource, EditorialRelatedGuide } from "@/lib/editorial-content";
import {
  PUBLIC_SOURCE_IDS,
  type PublicSourceId,
  getPublicSource,
  publicSources,
} from "@/lib/source-catalog";
import { absoluteUrl } from "@/lib/seo";

const SOURCE_CATEGORY_PUBLICATION_DATE = "2026-07-16";

export const SOURCE_CATEGORY_SLUGS = [
  "well-reports",
  "groundwater-districts",
  "groundwater-observations",
  "property-orientation",
  "surface-water-rights",
  "trec-61-0",
] as const;

export type SourceCategorySlug = (typeof SOURCE_CATEGORY_SLUGS)[number];

export interface SourceCategoryDefinition {
  slug: SourceCategorySlug;
  published: boolean;
  title: string;
  description: string;
  eyebrow: string;
  introduction: string;
  primary_question: string;
  source_ids: PublicSourceId[];
  helpful_questions: string[];
  cannot_answer: string[];
  recommended_order: string[];
  common_search_failures: string[];
  related_guides: EditorialRelatedGuide[];
  limitations: string[];
}

const methodologyLink: EditorialRelatedGuide = {
  title: "Texas Water Sources research methodology",
  path: "/methodology",
  description: "See how source records, candidate matches, comparison evidence, and unresolved questions are kept separate.",
};

const disclaimerLink: EditorialRelatedGuide = {
  title: "Independent-service disclaimer",
  path: "/disclaimer",
  description: "Review the limits of independent source navigation, public records, maps, and professional conclusions.",
};

const trecLink: EditorialRelatedGuide = {
  title: "TREC Form 61-0 research guide and assistant",
  path: "/trec-61-guide",
  description: "Carry saved sources and unresolved questions into the independent Form 61-0 research workflow without selecting an answer.",
};

const categoryDefinitions: Record<SourceCategorySlug, SourceCategoryDefinition> = {
  "well-reports": {
    slug: "well-reports",
    published: true,
    title: "Official Texas Well-Report Sources",
    description: "Compare the approved TWDB pathways for groundwater records, submitted driller reports, and plugging reports before testing a possible well-record match.",
    eyebrow: "Source family · well reports",
    introduction: "These approved TWDB pathways cover different record purposes. Use the report date, identifier, search context, and official source notes together; no single result establishes that a well belongs to a parcel or remains in operation.",
    primary_question: "Which approved official source should I use to locate and compare a possible Texas water-well record?",
    source_ids: ["twdb_groundwater_database", "twdb_submitted_drillers_reports", "twdb_plugging_reports"],
    helpful_questions: [
      "Is an agency well identifier or groundwater observation available?",
      "Was a submitted driller report filed for the candidate well?",
      "Is there a submitted plugging record that should be compared with the well-report trail?",
    ],
    cannot_answer: [
      "Whether a candidate record belongs to the property under review.",
      "Whether a reported well presently exists, operates, produces a particular yield, or meets current requirements.",
      "Current ownership, title, permit standing, water quality, or future availability.",
    ],
    recommended_order: [
      "Start with the well-record guide to choose a system from the approximate drilling period and identifiers you already know.",
      "Check the Submitted Drillers Reports pathway for a filed report and preserve its tracking number and report date.",
      "Use the Groundwater Database when a state well number or groundwater-observation context may help compare records.",
      "Check Plugging Reports separately when the research question includes possible plugging activity.",
      "Compare every candidate with property documents, physical or survey evidence, and unresolved seller information before drawing a conclusion.",
    ],
    common_search_failures: [
      "Using only a current owner name when the report may show the owner at the time of drilling.",
      "Searching one system even though the approximate drilling period points to another record pathway.",
      "Treating a missing map point as proof that no report or well exists.",
      "Discarding a possible record before checking alternate identifiers, date ranges, spellings, or county context.",
    ],
    related_guides: [
      { title: "How to find Texas water well records", path: "/well-records", description: "Choose a source, search with and without an address, compare candidate reports, and troubleshoot no-result searches." },
      trecLink,
      methodologyLink,
    ],
    limitations: [
      "The approved catalog is a bounded source directory, not a complete registry or live record-search service.",
      "A report, map point, identifier, historical owner, or nearby location is candidate evidence rather than proof of parcel association.",
      "The absence of a result in these pathways does not prove that no well exists or that no report was filed.",
    ],
  },
  "groundwater-districts": {
    slug: "groundwater-districts",
    published: true,
    title: "Official Texas Groundwater-District Sources",
    description: "Use the approved TCEQ boundary pathway and Coastal Bend Groundwater Conservation District record pathway to identify, verify, and document a candidate district.",
    eyebrow: "Source family · groundwater districts",
    introduction: "District research usually moves from statewide boundary orientation to the appropriate district's current rules, plans, forms, notices, contacts, and records. A mapped boundary remains routing evidence until the responsible authority addresses an uncertain location.",
    primary_question: "How should I move from a possible groundwater conservation district boundary to current district information without deciding jurisdiction from a map?",
    source_ids: ["tceq_groundwater_conservation_district_boundaries", "coastal_bend_groundwater_conservation_district"],
    helpful_questions: [
      "Which district boundary should be treated as a candidate for further verification?",
      "Where can current district rules, forms, meeting materials, notices, and contact pathways be reviewed?",
      "Which source and review date should be preserved when a district question remains unresolved?",
    ],
    cannot_answer: [
      "A legally controlling or survey-grade jurisdiction boundary.",
      "Whether a particular well is exempt, registered, permitted, compliant, or entitled to produce groundwater.",
      "Ownership, title, or the legal effect of district rules on a transaction.",
    ],
    recommended_order: [
      "Use the TCEQ boundary source as statewide orientation and record the candidate district and layer context.",
      "If the location is near a boundary or the source is unclear, keep the result unresolved rather than assigning jurisdiction.",
      "Open the relevant official district pathway to review current rules, plans, forms, notices, contacts, and available records.",
      "Verify uncertain boundary or rule questions with the district or responsible agency and record the date checked.",
    ],
    common_search_failures: [
      "Treating a mailing address or geocoded point as a controlling boundary determination.",
      "Using a statewide layer without checking its description, fields, update context, or limitations.",
      "Relying on an older copy of district rules or a third-party summary instead of the current official pathway.",
      "Assuming that no district shown in one source means no groundwater requirement applies.",
    ],
    related_guides: [
      { title: "How to find a Texas groundwater conservation district", path: "/groundwater-districts", description: "Follow the property-oriented boundary and current-rules verification workflow." },
      trecLink,
      methodologyLink,
      disclaimerLink,
    ],
    limitations: [
      "The boundary source is informational routing context and is not a legal, title, engineering, or surveying determination.",
      "The current catalog includes one individual district pathway and does not claim comprehensive district-record coverage.",
      "District boundaries, rules, forms, and procedures can change after the displayed review date.",
    ],
  },
  "groundwater-observations": {
    slug: "groundwater-observations",
    published: true,
    title: "Official Texas Groundwater Observation Sources",
    description: "Compare approved TWDB groundwater-record and recorder-well pathways while preserving measurement dates, station context, and property-level limitations.",
    eyebrow: "Source family · groundwater observations",
    introduction: "Groundwater observations describe agency records at identified wells, stations, regions, and dates. They can add context to research, but they do not predict conditions at an unmonitored property or establish the performance of a private well.",
    primary_question: "Which approved TWDB source can provide dated groundwater observations or regional condition context?",
    source_ids: ["twdb_groundwater_database", "twdb_water_conditions"],
    helpful_questions: [
      "Is a TWDB well identifier or dated groundwater observation available?",
      "What recent measurement and station context is displayed for a participating recorder well?",
      "Which agency date and source notes should be preserved before comparing observations?",
    ],
    cannot_answer: [
      "Groundwater conditions at a specific property or an unmonitored well.",
      "Future water availability, private-well yield, water quality, or property suitability.",
      "Ownership, title, permit standing, or a complete history of every groundwater observation.",
    ],
    recommended_order: [
      "Use the Groundwater Database when you have a well identifier, county, or record-specific observation question.",
      "Use Groundwater Conditions for recent participating recorder-well and regional context.",
      "Preserve the well or station identifier, measurement date, source notes, and the date you viewed the record.",
      "Keep property-level conclusions separate from regional or monitored-well observations.",
    ],
    common_search_failures: [
      "Comparing measurements without first checking their dates, stations, or record context.",
      "Assuming a recorder well represents a nearby private well or entire property.",
      "Searching without a usable well identifier, county, region, or station context.",
      "Treating a current display as a complete historical archive.",
    ],
    related_guides: [
      { title: "How to find Texas water well records", path: "/well-records", description: "Learn how identifiers, dates, construction records, and mapped locations should be compared." },
      methodologyLink,
      disclaimerLink,
    ],
    limitations: [
      "Measurements apply to the agency record, well, station, and date displayed—not automatically to another well or property.",
      "The directory does not mirror measurements or provide a live conditions lookup.",
      "Regional context cannot establish future availability, well performance, suitability, ownership, or compliance.",
    ],
  },
  "property-orientation": {
    slug: "property-orientation",
    published: true,
    title: "Official Texas Property-Orientation Sources",
    description: "Use the approved TxGIO address-point and land-parcel source pathways for bounded orientation without publishing rows, coordinates, owner data, or property conclusions.",
    eyebrow: "Source family · property orientation",
    introduction: "Address points and parcel layers may help orient later research, but their public source pages do not establish legal situs, occupancy, ownership, title, or a survey-grade boundary. This directory publishes source navigation only, not feature rows or maps.",
    primary_question: "How can official address-point and parcel source pathways support orientation without becoming property evidence?",
    source_ids: ["txgio_stratmap_address_points", "txgio_stratmap_land_parcels"],
    helpful_questions: [
      "Which official TxGIO source family describes address-point or parcel orientation data?",
      "What source description, coverage context, update information, and limitations should be reviewed?",
      "Which property identifiers should be obtained from an authoritative appraisal, deed, title, or survey source instead?",
    ],
    cannot_answer: [
      "Occupancy, ownership, legal situs, mailing status, value, or legal-description facts.",
      "A legally controlling or survey-grade property boundary.",
      "Authorization to publish address text, parcel identifiers, features, coordinates, maps, or owner data.",
    ],
    recommended_order: [
      "Begin with the property identifiers already available from deed, title, appraisal, or survey materials.",
      "Open the relevant TxGIO source page and review its source description, coverage, update context, and limitations.",
      "Use the source family only to orient later official-record research; do not treat a feature or nearby record as property association.",
      "Resolve legal-description, boundary, title, or situs questions through the appropriate authoritative record or professional review.",
    ],
    common_search_failures: [
      "Treating an address point as proof of occupancy, legal situs, service, or mailing status.",
      "Treating a parcel layer as a deed, survey, title record, or ownership source.",
      "Using a third-party map without checking the official dataset description and limitations.",
      "Expecting this bounded directory to expose feature rows, coordinates, identifiers, or live lookup behavior.",
    ],
    related_guides: [
      trecLink,
      methodologyLink,
      disclaimerLink,
    ],
    limitations: [
      "No address, parcel, coordinate, owner, or feature row is published through this category page.",
      "Orientation layers do not replace deeds, title materials, appraisal records, surveys, or controlling official determinations.",
      "A nearby point, feature, or record is not proof of property association.",
    ],
  },
  "surface-water-rights": {
    slug: "surface-water-rights",
    published: false,
    title: "Official Texas Surface-Water-Rights Sources",
    description: "Deferred until the approved catalog contains a relevant official source record.",
    eyebrow: "Deferred source family",
    introduction: "",
    primary_question: "",
    source_ids: [],
    helpful_questions: [],
    cannot_answer: [],
    recommended_order: [],
    common_search_failures: [],
    related_guides: [],
    limitations: [],
  },
  "trec-61-0": {
    slug: "trec-61-0",
    published: false,
    title: "Official TREC Form 61-0 Sources",
    description: "Deferred until the approved catalog contains a relevant official source record.",
    eyebrow: "Deferred source family",
    introduction: "",
    primary_question: "",
    source_ids: [],
    helpful_questions: [],
    cannot_answer: [],
    recommended_order: [],
    common_search_failures: [],
    related_guides: [],
    limitations: [],
  },
};

export const publishedSourceCategories = SOURCE_CATEGORY_SLUGS
  .map((slug) => categoryDefinitions[slug])
  .filter((category) => category.published);

export function getSourceCategory(slug: SourceCategorySlug) {
  return categoryDefinitions[slug];
}

export function getPublishedSourceCategory(slug: SourceCategorySlug) {
  const category = getSourceCategory(slug);
  return category.published && category.source_ids.length ? category : undefined;
}

function officialSources(sourceIds: PublicSourceId[]): EditorialOfficialSource[] {
  return sourceIds.map((sourceId) => {
    const source = getPublicSource(sourceId);
    if (!source) throw new Error(`Missing approved category source: ${sourceId}`);
    return {
      title: source.title,
      agency: source.agency,
      url: source.official_url,
      reviewed_on: source.last_verified_date,
      attribution: source.attribution_text,
    };
  });
}

export function createSourceCategoryEditorial(category: SourceCategoryDefinition): EditorialContent {
  if (!category.published || !category.source_ids.length) throw new Error(`Source category is not publishable: ${category.slug}`);
  const sources = officialSources(category.source_ids);
  return {
    title: category.title,
    description: category.description,
    canonical: absoluteUrl(`/sources/${category.slug}`),
    author: {
      name: "Texas Water Sources",
      path: "/about/authors/texas-water-sources",
      description: "Texas Water Sources publishes independent, source-linked guidance for researching Texas property-water records.",
    },
    date_published: SOURCE_CATEGORY_PUBLICATION_DATE,
    date_modified: SOURCE_CATEGORY_PUBLICATION_DATE,
    primary_question: category.primary_question,
    official_sources: sources,
    related_source_ids: category.source_ids,
    related_guides: [
      { title: "Official Texas water-record source directory", path: "/sources", description: "Search and filter all eight currently approved public source pathways." },
      ...category.related_guides,
    ],
    limitations: category.limitations,
  };
}

export interface SourceChangeHistoryEntry {
  date: string;
  summary: string;
}

export interface SourceEditorialEnhancement {
  use_when: string[];
  realistic_search_example: string;
  common_missed_result_reasons: string[];
  identifiers_to_preserve: string[];
  related_source_ids: PublicSourceId[];
  related_guides: EditorialRelatedGuide[];
  change_history: SourceChangeHistoryEntry[];
}

export const sourceEditorialEnhancements = {
  txgio_stratmap_address_points: {
    use_when: ["You need the official TxGIO address-point source description and limitations before deciding whether that source family can orient later research.", "You need a source-navigation pathway without publishing address text, feature rows, or coordinates."],
    realistic_search_example: "A current street description is incomplete. Open the official StratMap page, locate the Address Points source description, review its coverage and limitations, and preserve the official page link. Continue with authoritative property records rather than treating an address point as property identity.",
    common_missed_result_reasons: ["The current address differs from historical or official property records.", "An address point is expected to provide ownership, legal situs, occupancy, or boundary evidence that it does not establish.", "The source description or stated limitations were not reviewed before using a third-party display."],
    identifiers_to_preserve: ["Official dataset or source-family name", "Official source URL", "Source-description or update context", "Date the official source page was checked"],
    related_source_ids: ["txgio_stratmap_land_parcels"],
    related_guides: [{ title: "Property-orientation source family", path: "/sources/property-orientation", description: "Compare the bounded address-point and parcel source pathways and their limits." }, trecLink, methodologyLink],
    change_history: [{ date: "2026-07-14", summary: "Official source page, policy pathway, and public-data boundary reviewed." }],
  },
  coastal_bend_groundwater_conservation_district: {
    use_when: ["You need the district's official route to current rules, forms, notices, meeting materials, contacts, or public-record procedures.", "A candidate Coastal Bend Groundwater Conservation District question needs to be checked with the district rather than inferred from a statewide map."],
    realistic_search_example: "A candidate district result raises a well-registration question. Open the official district website, locate the current rules or forms area, preserve the document title and date, and keep any property-specific interpretation unresolved for district or professional review.",
    common_missed_result_reasons: ["Searching a general web result instead of the district's current navigation or records pathway.", "Looking for one keyword without checking rules, forms, meeting materials, notices, and public-information procedures.", "Assuming an older downloaded document remains current without comparing the official page."],
    identifiers_to_preserve: ["District document or page title", "Rule, form, notice, or meeting date when displayed", "Official URL", "Date viewed", "Open district question"],
    related_source_ids: ["tceq_groundwater_conservation_district_boundaries"],
    related_guides: [{ title: "Groundwater-district source family", path: "/sources/groundwater-districts", description: "Move from statewide boundary orientation to the relevant district's current official records." }, { title: "Groundwater-district research workflow", path: "/groundwater-districts", description: "Document a candidate district, boundary confidence, current rules checked, and unresolved issues." }, trecLink, methodologyLink],
    change_history: [{ date: "2026-07-14", summary: "Official district link and source-navigation scope reviewed." }],
  },
  tceq_groundwater_conservation_district_boundaries: {
    use_when: ["You need statewide informational boundary context to identify a candidate groundwater conservation district.", "You need the official layer description, fields, spatial reference, or update context before recording a boundary lead."],
    realistic_search_example: "A location appears close to a district edge. Open the official TCEQ layer page, review the layer description and update context, record the candidate district and boundary uncertainty, and verify the question with the agency or district rather than deciding jurisdiction from the point.",
    common_missed_result_reasons: ["A mailing address or geocoded point is treated as a controlling jurisdiction determination.", "The layer description, fields, update metadata, or spatial limitations are skipped.", "A nearby boundary is read as survey-grade precision or current regulatory applicability."],
    identifiers_to_preserve: ["Candidate district name", "Official layer title and URL", "Layer or update metadata when displayed", "Boundary-confidence note", "Date viewed"],
    related_source_ids: ["coastal_bend_groundwater_conservation_district"],
    related_guides: [{ title: "Groundwater-district source family", path: "/sources/groundwater-districts", description: "Use the boundary layer for orientation, then continue to the appropriate official district pathway." }, { title: "Groundwater-district research workflow", path: "/groundwater-districts", description: "Learn what to do near a boundary and how to verify with a district." }, disclaimerLink],
    change_history: [{ date: "2026-07-16", summary: "Official layer and TCEQ policy links reviewed; no geometry rows are published." }],
  },
  twdb_groundwater_database: {
    use_when: ["You have a county, state well number, or other available TWDB search criterion and need agency well identifiers or dated groundwater observations.", "You need record-specific observation context to compare with a possible well-report trail."],
    realistic_search_example: "A saved document includes a possible state well number. Search the official TWDB groundwater report pathway with that identifier, preserve the agency well number and observation dates, and compare the result with other records without treating the identifier as parcel proof.",
    common_missed_result_reasons: ["Searching only by a current address when the agency record is organized by well identifier or county context.", "Dropping leading characters or punctuation from an identifier without preserving the displayed value.", "Comparing observations without checking their measurement dates or source notes."],
    identifiers_to_preserve: ["State well number or agency identifier", "Measurement or record date", "County or search criterion used", "Official result URL or saved source reference", "Date viewed"],
    related_source_ids: ["twdb_submitted_drillers_reports", "twdb_water_conditions"],
    related_guides: [{ title: "Well-report source family", path: "/sources/well-reports", description: "Compare groundwater records with submitted driller and plugging-report pathways." }, { title: "Groundwater-observation source family", path: "/sources/groundwater-observations", description: "Keep record-specific observations separate from regional recorder-well context." }, { title: "How to find Texas water well records", path: "/well-records", description: "Test identifiers, dates, location evidence, and unresolved candidate matches." }, methodologyLink],
    change_history: [{ date: "2026-07-14", summary: "Official source page and source-record publication boundary reviewed." }],
  },
  txgio_stratmap_land_parcels: {
    use_when: ["You need the official TxGIO parcel source description, coverage notes, and limitations for bounded orientation.", "You need to distinguish map orientation from deed, title, appraisal, legal-description, or survey evidence."],
    realistic_search_example: "A water-record candidate needs general parcel orientation. Open the official Land Parcels source page, review its description and limitations, and preserve the source link. Compare legal description or boundary questions with controlling property records instead of treating the parcel layer as title evidence.",
    common_missed_result_reasons: ["A parcel display is expected to provide legal-description, title, ownership, or survey facts.", "Coverage and update notes are not checked before comparing a feature with current records.", "A third-party parcel map is used without retaining the official dataset context."],
    identifiers_to_preserve: ["Official dataset or source-family name", "Official source URL", "Coverage or update context", "Date the official source page was checked"],
    related_source_ids: ["txgio_stratmap_address_points"],
    related_guides: [{ title: "Property-orientation source family", path: "/sources/property-orientation", description: "Compare parcel and address-point orientation sources without publishing feature data." }, trecLink, disclaimerLink],
    change_history: [{ date: "2026-07-14", summary: "Official source page, policy pathway, and public-data boundary reviewed." }],
  },
  twdb_water_conditions: {
    use_when: ["You need recent dated groundwater-condition context for a participating TWDB recorder well or region.", "You need to preserve measurement date and station context before comparing a groundwater observation."],
    realistic_search_example: "A research note needs regional groundwater context. Open the official Groundwater Conditions page, select the relevant region or recorder well when available, and preserve the station and measurement date. Do not apply that observation to an unmonitored private well.",
    common_missed_result_reasons: ["The displayed measurement date or recorder-well context is overlooked.", "A monitored well is assumed to represent a nearby private well or whole property.", "The current conditions display is treated as a complete historical archive."],
    identifiers_to_preserve: ["Recorder-well or station identifier", "Region when displayed", "Measurement date", "Source notes", "Date viewed"],
    related_source_ids: ["twdb_groundwater_database"],
    related_guides: [{ title: "Groundwater-observation source family", path: "/sources/groundwater-observations", description: "Compare record-specific and regional observation pathways with their date and location limits." }, { title: "How to find Texas water well records", path: "/well-records", description: "Separate well-report evidence from observation and present-condition questions." }, methodologyLink],
    change_history: [{ date: "2026-07-14", summary: "Official conditions page and dated-measurement publication boundary reviewed." }],
  },
  twdb_submitted_drillers_reports: {
    use_when: ["You need a submitted driller report identifier, report date, or agency-provided construction and location context.", "The approximate drilling period and known identifiers point to the submitted-report pathway."],
    realistic_search_example: "You know the county, an approximate drilling period, and a historical owner or driller. Open the TWDB groundwater-data pathway, choose Submitted Drillers Reports, search with the narrowest reliable identifiers, and preserve the tracking number and report date for comparison.",
    common_missed_result_reasons: ["Only the current owner is searched even though the report may show the owner at drilling.", "Too many text fields are required at once, excluding records with spelling or formatting differences.", "The wrong report system is used for the approximate drilling period.", "A missing map point is treated as proof that no report exists."],
    identifiers_to_preserve: ["Tracking or report number", "Report or drilling date", "Historical owner and driller as displayed", "County and location description", "Official result URL or saved record reference"],
    related_source_ids: ["twdb_groundwater_database", "twdb_plugging_reports"],
    related_guides: [{ title: "Well-report source family", path: "/sources/well-reports", description: "Choose among approved groundwater, driller-report, and plugging-report pathways." }, { title: "How to find Texas water well records", path: "/well-records", description: "Search by address, map, tracking number, owner, driller, county, and date range." }, trecLink, methodologyLink],
    change_history: [{ date: "2026-07-14", summary: "Official TWDB source pathway and report-date boundary reviewed." }],
  },
  twdb_plugging_reports: {
    use_when: ["You need a submitted plugging report identifier, reported date, or agency-provided location context.", "A possible well-record trail should be checked separately for submitted plugging activity."],
    realistic_search_example: "A candidate well report has a known identifier and county. Open the TWDB groundwater-data pathway, navigate to Plugging Reports, compare the identifier and reported date, and preserve any location context without treating it as present physical proof.",
    common_missed_result_reasons: ["Plugging reports are not searched separately from submitted driller reports.", "Identifier, date, or county variations are not tested.", "A reported location is assumed to establish current physical conditions or parcel attribution.", "No-result output is treated as a complete history of plugging activity."],
    identifiers_to_preserve: ["Plugging-report or tracking number", "Reported date", "County and location context as displayed", "Related well identifier when shown", "Official result URL or saved record reference"],
    related_source_ids: ["twdb_submitted_drillers_reports", "twdb_groundwater_database"],
    related_guides: [{ title: "Well-report source family", path: "/sources/well-reports", description: "Use plugging reports as one distinct part of the approved well-record source sequence." }, { title: "How to find Texas water well records", path: "/well-records", description: "Compare candidate reports and record unresolved present-condition questions." }, disclaimerLink],
    change_history: [{ date: "2026-07-14", summary: "Official TWDB source pathway and report-date boundary reviewed." }],
  },
} satisfies Record<PublicSourceId, SourceEditorialEnhancement>;

const enhancementIds = Object.keys(sourceEditorialEnhancements).sort();
const approvedIds = [...PUBLIC_SOURCE_IDS].sort();
if (enhancementIds.length !== approvedIds.length || enhancementIds.some((id, index) => id !== approvedIds[index])) {
  throw new Error("Source editorial enhancement IDs must exactly match the approved source allowlist");
}

for (const category of publishedSourceCategories) {
  if (!category.source_ids.length || category.source_ids.some((sourceId) => !publicSources.some((source) => source.source_id === sourceId))) {
    throw new Error(`Published source category must contain approved sources: ${category.slug}`);
  }
}

export function getSourceEditorialEnhancement(sourceId: PublicSourceId) {
  return sourceEditorialEnhancements[sourceId];
}
