import type { PublicSourceId } from "@/lib/source-catalog";
import { getPublicSource } from "@/lib/source-catalog";
import { absoluteUrl } from "@/lib/seo";

export interface EditorialAuthor {
  name: string;
  path: string;
  description: string;
}

export interface EditorialOfficialSource {
  title: string;
  agency: string;
  url: string;
  reviewed_on: string;
  attribution: string;
}

export interface EditorialRelatedGuide {
  title: string;
  path: string;
  description: string;
}

export interface EditorialContent {
  title: string;
  description: string;
  canonical: string;
  author: EditorialAuthor;
  reviewed_by?: string;
  date_published?: string;
  date_modified: string;
  primary_question: string;
  official_sources: EditorialOfficialSource[];
  related_source_ids: PublicSourceId[];
  related_guides: EditorialRelatedGuide[];
  limitations: string[];
}

export const texasWaterSourcesAuthor: EditorialAuthor = {
  name: "Texas Water Sources",
  path: "/about/authors/texas-water-sources",
  description: "Texas Water Sources publishes independent, source-linked guidance for researching Texas property-water records.",
};

export function approvedSources(sourceIds: PublicSourceId[]): EditorialOfficialSource[] {
  return sourceIds.map((sourceId) => {
    const source = getPublicSource(sourceId);
    if (!source) throw new Error(`Missing approved editorial source: ${sourceId}`);
    return {
      title: source.title,
      agency: source.agency,
      url: source.official_url,
      reviewed_on: source.last_verified_date,
      attribution: source.attribution_text,
    };
  });
}

const googlePeopleFirstSource: EditorialOfficialSource = {
  title: "Creating Helpful, Reliable, People-First Content",
  agency: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
  reviewed_on: "2026-07-15",
  attribution: "Official Google Search Central guidance on clear publisher identity, sourcing, and people-first content.",
};

const googleArticleSource: EditorialOfficialSource = {
  title: "Article Structured Data",
  agency: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/article",
  reviewed_on: "2026-07-15",
  attribution: "Official Google Search Central guidance for Article author and date properties.",
};

export const trecForm61Source: EditorialOfficialSource = {
  title: "Seller's Disclosure about Groundwater and Surface Water Rights",
  agency: "Texas Real Estate Commission",
  url: "https://www.trec.texas.gov/forms/water-notice-sellers-disclosure-about-groundwater-and-surface-water-rights",
  reviewed_on: "2026-07-16",
  attribution: "Official TREC page for Form 61-0, including the form name, effective date, description, and current download.",
};

export const twdbWellReportInstructionsSource: EditorialOfficialSource = {
  title: "Locating a Water Well Report",
  agency: "Texas Water Development Board",
  url: "https://www.twdb.texas.gov/groundwater/data/locwwrep.asp",
  reviewed_on: "2026-07-16",
  attribution: "Official TWDB instructions for selecting and searching Texas well-report systems and comparing possible records.",
};

export const tceqDistrictSource: EditorialOfficialSource = {
  title: "Groundwater Conservation Districts",
  agency: "Texas Commission on Environmental Quality",
  url: "https://www.tceq.texas.gov/groundwater/groundwater-planning-assessment/districts.html",
  reviewed_on: "2026-07-16",
  attribution: "Official TCEQ district page with current map, contact, and groundwater-district information pathways.",
};

export const twdbDistrictSource: EditorialOfficialSource = {
  title: "Groundwater Conservation Districts",
  agency: "Texas Water Development Board",
  url: "https://www.twdb.texas.gov/groundwater/conservation_districts/",
  reviewed_on: "2026-07-16",
  attribution: "Official TWDB district page for groundwater management plans, district information, and district contact pathways.",
};

export const tceqWaterRightsSource: EditorialOfficialSource = {
  title: "Water Rights Viewer",
  agency: "Texas Commission on Environmental Quality",
  url: "https://www.tceq.texas.gov/gis/water-rights-viewer",
  reviewed_on: "2026-07-16",
  attribution: "Official TCEQ viewer page describing available water-right information and the limits of mapped data.",
};

export const tceqWaterRightsUserGuideSource: EditorialOfficialSource = {
  title: "Water Rights Viewer User Guide",
  agency: "Texas Commission on Environmental Quality",
  url: "https://www.tceq.texas.gov/downloads/gis/docs/water-rights-viewer-userguide-exb.pdf",
  reviewed_on: "2026-07-16",
  attribution: "Official TCEQ instructions for viewer navigation, layers, queries, related records, documents, and water-use results.",
};

export const tceqWaterRightsDataSource: EditorialOfficialSource = {
  title: "Water Rights and Water Use Data",
  agency: "Texas Commission on Environmental Quality",
  url: "https://www.tceq.texas.gov/permitting/water_rights/wr-permitting/wrwud",
  reviewed_on: "2026-07-16",
  attribution: "Official TCEQ information for active and inactive surface-water-right records, water-use data, and GIS pathways.",
};

const texasWaterCodeChapter11Source: EditorialOfficialSource = {
  title: "Texas Water Code, Chapter 11",
  agency: "Texas Legislature Online",
  url: "https://statutes.capitol.texas.gov/docs/WA/htm/WA.11.htm",
  reviewed_on: "2026-07-16",
  attribution: "Official Texas statute source for Chapter 11; statutory text should be applied only with transaction-specific legal review.",
};

const editorialLinks: EditorialRelatedGuide[] = [
  {
    title: "Research methodology",
    path: "/methodology",
    description: "See how the project separates sources, candidate matches, uncertainty, and professional-review questions.",
  },
  {
    title: "Editorial standards",
    path: "/about/editorial-standards",
    description: "Read the sourcing, attribution, update-date, limitation, and correction rules for substantive public content.",
  },
  {
    title: "Corrections and source changes",
    path: "/about/corrections",
    description: "Learn how factual corrections and changed official links are evaluated and documented.",
  },
];

export const trec61MetaDescription =
  "Open the official TREC Form 61-0, then use this independent guide to organize seller-known water facts, official record searches, saved documents, and unresolved questions.";

export const trec61Editorial: EditorialContent = {
  title: "TREC Form 61-0 Research Guide",
  description:
    "Use this independent TREC Form 61-0 guide to organize seller-known facts, official Texas water-record searches, saved records, and unresolved questions.",
  canonical: absoluteUrl("/trec-61-guide"),
  author: texasWaterSourcesAuthor,
  date_modified: "2026-07-18",
  primary_question: "How can a seller organize Form 61-0 research without turning a public-record lead into a disclosure answer or property conclusion?",
  official_sources: [trecForm61Source, twdbWellReportInstructionsSource, tceqDistrictSource, tceqWaterRightsSource],
  related_source_ids: [
    "twdb_groundwater_database",
    "twdb_submitted_drillers_reports",
    "twdb_plugging_reports",
    "tceq_groundwater_conservation_district_boundaries",
  ],
  related_guides: [
    {
      title: "Who must complete TREC Form 61-0?",
      path: "/trec-61-guide/who-must-complete-form-61-0",
      description: "Compare current TREC contracts, mandatory-use rules, the five-condition exemption, delivery paths, and transaction-specific review boundaries.",
    },
    {
      title: "Researching water wells for TREC Form 61-0",
      path: "/trec-61-guide/water-wells",
      description: "Keep seller-known well information separate from candidate public records without selecting a disclosure answer.",
    },
    {
      title: "Researching a groundwater district for TREC Form 61-0",
      path: "/trec-61-guide/groundwater-district",
      description: "Document a candidate district, boundary uncertainty, current official sources, and open jurisdiction questions.",
    },
    {
      title: "Researching shared and off-property wells",
      path: "/trec-61-guide/shared-and-off-property-wells",
      description: "Organize private agreements, beneficiaries, operation, payment, access, and seller-confirmation evidence.",
    },
    {
      title: "Official well-report source family",
      path: "/sources/well-reports",
      description: "Compare the approved groundwater, submitted-driller-report, and plugging-report pathways before preserving a candidate record.",
    },
    {
      title: "Official groundwater-district source family",
      path: "/sources/groundwater-districts",
      description: "Move from statewide boundary orientation to the appropriate district's current official information pathway.",
    },
    {
      title: "How to find Texas water well records",
      path: "/well-records",
      description: "Compare search systems, identifiers, dates, and location evidence before treating a well report as a likely match.",
    },
    {
      title: "How to find a groundwater conservation district",
      path: "/groundwater-districts",
      description: "Use official district sources, treat mapped boundaries as research evidence, and verify uncertain locations.",
    },
    {
      title: "Texas surface-water rights research guide",
      path: "/surface-water-rights",
      description: "Research possible Texas surface-water authorizations, official records, mapped leads, and property-comparison questions without treating a Viewer result as proof of ownership or transfer.",
    },
    editorialLinks[0],
    {
      title: "Independent-service disclaimer",
      path: "/disclaimer",
      description: "Review the educational, independent-service, source, and professional boundaries that apply to this guide.",
    },
  ],
  limitations: [
    "The guide organizes seller-known information and research leads; it does not select or validate a Form 61-0 response.",
    "A map point, well report, district layer, permit, recorded name, or nearby record is not proof of ownership or property association.",
    "Public records may be incomplete, historical, approximate, or changed after the displayed source-review date.",
    "The guide does not determine title, ownership, severance, reservation, transferability, compliance, or the legal effect of a document.",
  ],
};

export const wellRecordsEditorial: EditorialContent = {
  title: "Texas Water Well Records: TWDB Reports, Logs & Lookup",
  description:
    "Search TWDB Submitted Drillers Reports, historical well logs, and other official Texas well-record systems by address, owner, driller, or tracking number.",
  canonical: absoluteUrl("/well-records"),
  author: texasWaterSourcesAuthor,
  date_modified: "2026-07-16",
  primary_question: "Which official system should I search for a Texas water-well report, and how can I test a possible match without treating it as proof about a property?",
  official_sources: [
    twdbWellReportInstructionsSource,
    ...approvedSources([
      "twdb_groundwater_database",
      "twdb_submitted_drillers_reports",
      "twdb_plugging_reports",
    ]),
  ],
  related_source_ids: [
    "twdb_groundwater_database",
    "twdb_submitted_drillers_reports",
    "twdb_plugging_reports",
  ],
  related_guides: [
    {
      title: "Find a Texas well record by address",
      path: "/well-records/find-by-address",
      description: "Use an address for orientation, then follow owner, driller, county, date, map, and historical-system fallbacks.",
    },
    {
      title: "Find Texas well records from before 2003",
      path: "/well-records/pre-2003-records",
      description: "Use the historical grid-and-report path and account for crossover-year uncertainty.",
    },
    {
      title: "Official well-report source family",
      path: "/sources/well-reports",
      description: "Compare the approved TWDB source pathways and the questions each record family cannot answer.",
    },
    {
      title: "TREC Form 61-0 research guide",
      path: "/trec-61-guide",
      description: "Carry well-record candidates, saved sources, and unresolved questions into the independent disclosure-research workflow.",
    },
    {
      title: "How to find a groundwater conservation district",
      path: "/groundwater-districts",
      description: "Identify a possible district and verify rules or local records with the appropriate official source.",
    },
    editorialLinks[0],
    {
      title: "Independent-service disclaimer",
      path: "/disclaimer",
      description: "Review the educational, source, property-association, and professional boundaries that apply to this guide.",
    },
  ],
  limitations: [
    "A map point, coordinate, report, tracking number, state well number, historical owner, or nearby result is not proof that a record belongs to a parcel.",
    "A well report does not establish present existence, operation, ownership, yield, water quality, or compliance with current district or agency requirements.",
    "The absence of a result in one or more public systems does not prove that no well exists or that no report was filed.",
    "Historical reports, addresses, legal descriptions, coordinates, and scanned grid records may be incomplete, approximate, difficult to search, or changed after the displayed review date.",
  ],
};

export const groundwaterDistrictsEditorial: EditorialContent = {
  title: "How to Find a Texas Groundwater Conservation District",
  description:
    "Use official Texas sources to identify a possible groundwater conservation district, verify uncertain boundaries, and document current district rules without deciding jurisdiction from an address alone.",
  canonical: absoluteUrl("/groundwater-districts"),
  author: texasWaterSourcesAuthor,
  date_modified: "2026-07-16",
  primary_question: "How can I identify and verify a possible groundwater conservation district for a Texas property without treating an address point or map layer as a controlling jurisdiction determination?",
  official_sources: [
    tceqDistrictSource,
    twdbDistrictSource,
    ...approvedSources([
      "tceq_groundwater_conservation_district_boundaries",
      "coastal_bend_groundwater_conservation_district",
    ]),
  ],
  related_source_ids: [
    "tceq_groundwater_conservation_district_boundaries",
    "coastal_bend_groundwater_conservation_district",
  ],
  related_guides: [
    {
      title: "Official groundwater-district source family",
      path: "/sources/groundwater-districts",
      description: "Use the statewide boundary source for orientation, then continue to the relevant district's official records pathway.",
    },
    {
      title: "TREC Form 61-0 research guide",
      path: "/trec-61-guide",
      description: "Carry the candidate district, sources checked, boundary confidence, and unresolved rule questions into the independent disclosure-research workflow.",
    },
    {
      title: "How to find Texas water well records",
      path: "/well-records",
      description: "Search official well-record systems and compare candidate reports without treating a point, name, or nearby record as proof about a parcel.",
    },
    editorialLinks[0],
    {
      title: "Independent-service disclaimer",
      path: "/disclaimer",
      description: "Review the educational, independent-service, source, jurisdiction, and professional boundaries that apply to this guide.",
    },
  ],
  limitations: [
    "A mailing address, geocoded address point, district layer, nearby boundary, or map result is not a legally controlling or survey-grade jurisdiction determination.",
    "A candidate district must be checked against current official district and agency information; district boundaries, rules, forms, and procedures may change after the displayed source-review date.",
    "No district shown in one source does not prove that no groundwater conservation district or other groundwater requirement applies.",
    "This guide does not determine jurisdiction, permitting, exemption status, compliance, ownership, title, or the legal effect of district rules or property documents.",
  ],
};

export const surfaceWaterRightsEditorial: EditorialContent = {
  title: "Texas Surface-Water Rights Research Guide",
  description:
    "Research a possible Texas surface-water authorization, preserve official TCEQ viewer records, and compare property evidence without treating a mapped lead as a title conclusion.",
  canonical: absoluteUrl("/surface-water-rights"),
  author: texasWaterSourcesAuthor,
  date_modified: "2026-09-01",
  primary_question: "How can I research a possible Texas surface-water authorization, preserve the relevant official records, and compare them with property evidence without claiming ownership, transfer, or property association?",
  official_sources: [
    tceqWaterRightsSource,
    tceqWaterRightsUserGuideSource,
    tceqWaterRightsDataSource,
    texasWaterCodeChapter11Source,
  ],
  related_source_ids: [],
  related_guides: [
    {
      title: "Search the TCEQ Water Rights Viewer",
      path: "/surface-water-rights/water-rights-viewer",
      description: "Follow an operational viewer workflow and preserve a bounded candidate record for property-evidence comparison.",
    },
    {
      title: "TREC Form 61-0 research guide",
      path: "/trec-61-guide",
      description: "Carry candidate authorizations, saved documents, seller-known information, and unresolved title questions into the independent disclosure-research workflow.",
    },
    editorialLinks[0],
    {
      title: "Independent-service disclaimer",
      path: "/disclaimer",
      description: "Review the educational, map, document, property-association, and professional boundaries that apply to this guide.",
    },
    editorialLinks[1],
  ],
  limitations: [
    "A viewer point, authorization, permit, certificate, place-of-use display, recorded holder, linked document, or nearby result is not proof that a right belongs to or transfers with a property.",
    "A recorded holder or owner field must be preserved as displayed and dated; it is not a current title opinion or a substitute for deed, assignment, reservation, probate, entity, or other chain-of-title review.",
    "Viewer locations and property boundaries are informational and approximate, and TCEQ states that the product may not be suitable for legal, engineering, or surveying purposes.",
    "No result in the viewer or a data pathway does not prove that no authorization, exemption, historical record, filing, or surface-water issue exists.",
    "This guide does not determine ownership, appurtenance, transferability, validity, priority, exemption, permitting, compliance, or the legal effect of a document or transaction.",
  ],
};

export const aboutEditorial: EditorialContent = {
  title: "About Texas Water Sources",
  description:
    "Learn who is responsible for Texas Water Sources research, how official sources are reviewed, and why candidate record matches remain unresolved until verified.",
  canonical: absoluteUrl("/about"),
  author: texasWaterSourcesAuthor,
  date_modified: "2026-07-15",
  primary_question: "What does Texas Water Sources publish, and what boundaries apply to its public guidance?",
  official_sources: approvedSources([
    "twdb_groundwater_database",
    "tceq_groundwater_conservation_district_boundaries",
    "coastal_bend_groundwater_conservation_district",
  ]),
  related_source_ids: ["twdb_groundwater_database", "tceq_groundwater_conservation_district_boundaries"],
  related_guides: editorialLinks,
  limitations: [
    "The project is independent and is not affiliated with or endorsed by a Texas agency or groundwater conservation district.",
    "A source link, map point, recorded name, or nearby record is not proof that a record belongs to or transfers with a property.",
    "The project does not provide legal, title, engineering, surveying, brokerage, or regulatory conclusions.",
  ],
};

export const methodologyEditorial: EditorialContent = {
  title: "Texas Water Sources Research Methodology",
  description:
    "See the official-source, uncertainty-forward method used to separate Texas water research subjects, test candidate record matches, and preserve unresolved findings.",
  canonical: absoluteUrl("/methodology"),
  author: texasWaterSourcesAuthor,
  date_modified: "2026-07-15",
  primary_question: "How does Texas Water Sources organize public records without converting a candidate match into a property conclusion?",
  official_sources: approvedSources([
    "twdb_groundwater_database",
    "twdb_submitted_drillers_reports",
    "tceq_groundwater_conservation_district_boundaries",
    "coastal_bend_groundwater_conservation_district",
  ]),
  related_source_ids: [
    "twdb_groundwater_database",
    "twdb_submitted_drillers_reports",
    "tceq_groundwater_conservation_district_boundaries",
  ],
  related_guides: [editorialLinks[1], editorialLinks[2], {
    title: "About the project",
    path: "/about",
    description: "Learn the purpose, source standards, update dates, and professional boundaries of Texas Water Sources.",
  }],
  limitations: [
    "Public records can be incomplete, historical, approximate, mislocated, or changed after the recorded access date.",
    "The method organizes evidence and uncertainty; it does not determine ownership, appurtenance, transferability, permitting, compliance, or disclosure answers.",
    "Material ambiguity remains unresolved until the relevant official source, property evidence, or qualified Texas professional addresses it.",
  ],
};

export const editorialStandardsEditorial: EditorialContent = {
  title: "Texas Water Sources Editorial Standards",
  description:
    "Read the sourcing, attribution, update-date, limitation, and correction standards used for substantive Texas Water Sources public content.",
  canonical: absoluteUrl("/about/editorial-standards"),
  author: texasWaterSourcesAuthor,
  date_published: "2026-07-15",
  date_modified: "2026-07-15",
  primary_question: "What standards govern sourcing, attribution, update dates, limitations, and corrections?",
  official_sources: [googlePeopleFirstSource, googleArticleSource],
  related_source_ids: [],
  related_guides: [editorialLinks[0], editorialLinks[2], {
    title: "Publisher identity",
    path: texasWaterSourcesAuthor.path,
    description: "See what the Texas Water Sources publisher identity represents and what it does not claim.",
  }],
  limitations: [
    "Editorial review cannot make an incomplete public record complete or turn a nearby result into a confirmed property fact.",
    "The standards do not create a professional-client relationship or replace review by the official authority or an appropriate Texas professional.",
    "A review date records a substantive source and content check; it is not a promise that an external system will remain unchanged.",
  ],
};

export const correctionsEditorial: EditorialContent = {
  title: "Corrections and Source-Change Policy",
  description:
    "Learn how Texas Water Sources evaluates factual corrections and changed official links without publishing an unverified contact channel.",
  canonical: absoluteUrl("/about/corrections"),
  author: texasWaterSourcesAuthor,
  date_published: "2026-07-15",
  date_modified: "2026-07-15",
  primary_question: "How are factual corrections, broken official links, and changed source behavior evaluated and documented?",
  official_sources: [],
  related_source_ids: [],
  related_guides: [editorialLinks[1], editorialLinks[0]],
  limitations: [
    "No verified public correction email address or submission form is currently published.",
    "The policy does not promise that an agency, district, or external system will correct its own records.",
    "Private client material, credentials, and sensitive property documents should not be submitted through an unverified channel.",
  ],
};

export const authorEditorial: EditorialContent = {
  title: "Texas Water Sources",
  description:
    "Learn what the Texas Water Sources publisher identity represents and the boundaries applied to independent water-record guidance.",
  canonical: absoluteUrl("/about/authors/texas-water-sources"),
  author: texasWaterSourcesAuthor,
  date_published: "2026-07-15",
  date_modified: "2026-07-15",
  primary_question: "What does the Texas Water Sources publisher identity represent?",
  official_sources: [],
  related_source_ids: [],
  related_guides: [editorialLinks[0], editorialLinks[1], editorialLinks[2]],
  limitations: [
    "The byline does not claim an attorney, engineer, surveyor, broker, well-professional, or other occupational license.",
    "The byline does not imply government affiliation, endorsement, or authority to issue an official determination.",
    "The project explains research pathways and preserves uncertainty; it does not replace transaction-specific professional judgment.",
  ],
};
