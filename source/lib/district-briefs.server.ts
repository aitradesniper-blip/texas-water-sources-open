import { readFileSync } from "node:fs";
import { join } from "node:path";

// Build/server only: never import the editorial JSON into a client component.
// Keep this allowlist explicit: the accepted input also contains private provenance.
type Claim = { text: string; evidence_refs: string[] };
type EditorialBrief = {
  id: string; district_id: string; title: string; opening: Claim;
  findings: { id: string; title: string; recorded_facts: Claim[]; interpretation: Claim }[];
  unresolved_questions: (Claim & { proposed_source_target: string })[];
  method_refs: string[]; source_aliases: string[]; matter_context: string;
  latest_included_recorded_minutes_date: string;
  included_minutes_span: { from: string; through: string; record_count: number };
};
type EditorialSource = { alias: string; meeting_date: string; page_count: number; human_url: string; source_url: string };
type EditorialInput = {
  prepared_date: string;
  briefs: EditorialBrief[];
  sources: EditorialSource[];
  source_refs: { id: string; human_url: string; item_label: string }[];
  reader_edition: { citation_display_labels: Record<string, string> };
};

export const districtBriefSlugs = ["northern-trinity-2026", "north-plains-2026"] as const;
export type DistrictBriefSlug = typeof districtBriefSlugs[number];
export const districtBriefPath = (slug: string) => `/groundwater-districts/intelligence/briefs/${slug}`;

export function briefDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

const method: Record<DistrictBriefSlug, string> = {
  "northern-trinity-2026": "All four inventoried minutes were included: February 12, April 8, June 2 and July 29 (39 physical pages represented by the structured records). The synthesis covers substantive episodes, relevant permit/enforcement tables, conditions and recorded gaps, including the DCLI request/approval pairs. July’s approval block carries September 16 as the minutes-approval date; that is not a September meeting-outcome record. The retained archive inventory observed a September 16 agenda without linked September minutes. Its bounded listing cannot establish that every meeting was posted.",
  "north-plains-2026": "All seven inventoried minutes were included: January 28, February 12, March 24, April 14, June 16, July 29 and August 18 (156 physical pages represented, including June’s 93-page packet). The synthesis covers substantive episodes, relevant reporting/compliance/planning tables and structured contract and demonstration content, including the June submission, contract and demonstration items and their qualifications. No older minutes, court orders or scheduled notices are included in the seven-minute count. The bounded archive inventory does not prove complete coverage through September.",
};

export function loadDistrictBrief(slug: string) {
  if (!districtBriefSlugs.includes(slug as DistrictBriefSlug)) return undefined;
  const data: EditorialInput = JSON.parse(readFileSync(join(process.cwd(), "data/research-briefs/reader-edition-01.json"), "utf8"));
  const key = slug as DistrictBriefSlug;
  const brief = data.briefs.find((entry) => entry.id === `${key}-research-brief-01`)!;
  const refs = new Map(data.source_refs.map((ref) => [ref.id, ref]));
  function citations(ids: string[]) {
    return ids.map((id) => {
      const ref = refs.get(id)!;
      const label = data.reader_edition.citation_display_labels[id];
      return { label, href: ref.human_url, context: `${label}: ${ref.item_label}` };
    });
  }
  const claim = (value: Claim, id: string) => ({ id, text: value.text, citations: citations(value.evidence_refs) });
  return {
    slug: key,
    path: districtBriefPath(key),
    district: key === "northern-trinity-2026" ? "Northern Trinity GCD" : "North Plains GCD",
    title: brief.title,
    preparedDate: data.prepared_date,
    snapshotDate: "2026-09-29",
    from: brief.included_minutes_span.from,
    through: brief.included_minutes_span.through,
    recordCount: brief.included_minutes_span.record_count,
    latestMinutes: brief.latest_included_recorded_minutes_date,
    opening: claim(brief.opening, `${key}-opening`),
    findings: brief.findings.map((finding) => ({
      id: finding.id,
      title: finding.title,
      recorded: finding.recorded_facts.map((fact, index) => claim(fact, `${finding.id}-recorded-${index + 1}`)),
      interpretation: claim(finding.interpretation, `${finding.id}-interpretation`),
    })),
    questions: brief.unresolved_questions.map((question, index) => ({
      ...claim(question, `${key}-question-${index + 1}`), target: question.proposed_source_target,
    })),
    method: { id: `${key}-method`, text: method[key], citations: citations(brief.method_refs) },
    sources: brief.source_aliases.map((alias) => {
      const source = data.sources.find((entry) => entry.alias === alias)!;
      return { date: source.meeting_date, pages: source.page_count, recordUrl: source.human_url, originalUrl: source.source_url };
    }),
    matter: {
      url: `https://texaswatersources.com/groundwater-districts/intelligence/matters/${brief.matter_context}`,
      title: key === "northern-trinity-2026" ? "Northern Trinity GCD — Aqua Texas / The Resort at Eagle Mountain" : "North Plains / BLF: assessments, litigation and compliance",
    },
  };
}

export type DistrictBrief = NonNullable<ReturnType<typeof loadDistrictBrief>>;
export type BriefClaim = DistrictBrief["opening"];
