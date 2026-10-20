import { matchingItems, filterMeetingRecords } from "./meeting-search.mjs";
// Human formatting of the same structured public records served as JSON.
type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => v && typeof v === "object" && !Array.isArray(v) ? v as Obj : {};
const list = (v: unknown): Obj[] => Array.isArray(v) ? v.map(obj) : [];
const strings = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
export const readable = (s: string) => s.replaceAll("owner_as_listed", "owner listed in this record").replaceAll("_", " ");
// Presentation of internal enum values only; source prose and JSON stay intact.
export const displayValue = (s: string) => /^[a-z]+(?:_[a-z0-9]+)+$/.test(s) ? readable(s) : s;
export const documentDateLabel = (date: string | null, role = "") => date || (role === "multi_meeting_compilation" ? "Multi-meeting compilation — see section dates" : "Document date unresolved");
export type NativeLocator = {map_path:string;map_url:string;block_id:string;supporting_text:string};
export type EvidenceLocation = {page:number;native_locator?:never}|{native_locator:NativeLocator;page?:never};
export type SourceCitation = EvidenceLocation & {source_url:string};
export const locationLabel = (c:EvidenceLocation) => c.native_locator ? `native block ${c.native_locator.block_id}` : `physical p. ${c.page}`;
export const retainedMapPath = (url:string) => new URL(url).pathname;
export type DateContext = {date:string|null;date_role:string;date_note:string;date_candidates:({date:string;context:string}&EvidenceLocation)[];referenced_dates?:({date:string|null;role:string;qualification:string}&EvidenceLocation)[]};
export type MeetingSection = DateContext & {pages:number[];item_ids:string[]};

// Formatting only: privacy projection happens once, before the public release input.
export function displayText(v: unknown): string { return typeof v === "string" ? v : ""; }
const text = (v: unknown) => displayText(v);

export type Citation = ({page:number;native_locator?:never;method:"NATIVE_TEXT"|"VISUAL_PAGE"|"PDF_PAGE_REFERENCE"}|{native_locator:NativeLocator;page?:never;method:"NATIVE_BLOCK_REFERENCE"}) & {text:string;omitted:boolean};
export type Detail = { id: string; label: string; fields: { label: string; text: string }[]; state: string; citations: Citation[] };
const withoutEpisode = (o: Detail): Detail => ({ id: o.id, label: o.label, fields: o.fields, state: o.state, citations: o.citations });
export type Matter = Detail & { observations: Detail[]; actions: Detail[]; unresolved: Detail[] };
export type MeetingDisplay = {
  recordFormat: "r3" | "batch02" | "source_bounded"; documentType: string; dateRole: string; dateNote: string | null;
  key: string; id: string; districtId: string; district: string; date: string | null; approvedDate: string | null;
  routingDate: string | null; extractionDate: string | null; lastSourceCheck: string | null;
  sourceUrl: string; sourceId: string; pages: number|null; sourceMediaType?:string; summary: string; citations: Citation[];
  sourceDisclosures?:{label:string;text:string}[];
  limitation: string; partial: boolean; partialPages: number[]; topics: string[]; stages: string[];
  agendas: Detail[]; searchText: string;
  matters: Matter[]; entities: Detail[]; relationships: Detail[]; unresolved: Detail[];
  waterObjects: Detail[]; quantities: Detail[]; unavailable: Detail[]; tables: MeetingTable[]; completenessCitations: Citation[];
  figures?:Detail[];
  contextDates: {id?:string;date:string|null;role:string;qualification:string;citations:Citation[]}[];
  sections?:MeetingSection[];
};
export type MeetingTable = { id: string; name: string; columns: string[]; rows: unknown[][]; rowIds: string[]; notes: string; stage: string; citations: Citation[]; dateContext?: DateContext; rowEvidence?: {row_index:number;citations:Citation[]}[]; grouping?: string };

function valueFields(v: unknown, prefix = ""): Detail["fields"] {
  if (v === null) return [{ label: prefix || "Value", text: "Unknown / not stated" }];
  if (v === undefined) return [];
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return [{ label: prefix || "Value", text: typeof v === "string" ? displayValue(v) : typeof v === "number" ? v.toLocaleString("en-US", { maximumFractionDigits: 12 }) : String(v) }];
  }
  if (Array.isArray(v)) return v.flatMap((x, i) => valueFields(x, `${prefix} ${i + 1}`.trim()));
  return Object.entries(obj(v)).flatMap(([k, x]) => valueFields(x, [prefix, readable(k)].filter(Boolean).join(" · ")));
}

export function projectMeeting(raw: unknown, rawIndex: unknown, partialPages: number[] = []): MeetingDisplay {
  const r = obj(raw), m = obj(r.meeting), index = obj(rawIndex), summary = obj(r.meeting_summary);
  if (r.record_format === "batch02" || r.record_format === "source_bounded") return projectBatch02(r);
  if (r.schema_version !== "1.0.0" || r.record_state !== "release_candidate") throw new Error("Unexpected public meeting schema");
  for (const k of ["entities", "agenda_items", "episodes", "observations", "procedural_actions", "relationships", "unresolved"]) {
    if (!Array.isArray(r[k])) throw new Error(`Missing meeting array: ${k}`);
  }
  const id = text(m.meeting_id), sourceId = text(m.source_document_id), pages = Number(m.page_count);
  if (!id || index.request_id !== id || sourceId !== `sha256:${index.source_sha256}`
    || index.physical_pages !== pages || !Number.isInteger(pages) || pages < 1 || index.candidate_source_date !== m.meeting_date
    || index.district_id !== m.district_id || index.official_source_url !== m.source_url) throw new Error(`Source identity mismatch: ${id}`);
  const sourceUrl = text(index.official_source_url);
  if (!/^https?:\/\//.test(sourceUrl)) throw new Error(`Invalid official URL: ${id}`);
  const allObjects = [m, obj(m.source_completeness), summary, ...["entities", "agenda_items", "episodes", "observations", "procedural_actions", "relationships", "unresolved"].flatMap(k => list(r[k]))];
  const declarations = { entities: "entity_local_id", agenda_items: "agenda_item_id", episodes: "episode_id", observations: "observation_id", procedural_actions: "procedural_action_id", relationships: "relationship_id", unresolved: "unresolved_id" };
  const declaredIds = Object.entries(declarations).flatMap(([group, key]) => list(r[group]).map(o => String(o[key])));
  const knownIds = new Set(declaredIds);
  if (knownIds.size !== declaredIds.length || knownIds.has("undefined")) throw new Error(`Invalid local object IDs: ${id}`);
  if (partialPages.some(p => !Number.isInteger(p) || p < 1 || p > pages)) throw new Error(`Invalid partial-page limitation: ${id}`);
  const citations = (o: Obj): Citation[] => list(o.evidence).map(e => {
    if (e.source_document_id !== sourceId || !Number.isInteger(e.page) || Number(e.page) < 1 || Number(e.page) > pages) throw new Error(`Invalid citation: ${id}`);
    if (e.evidence_method !== "NATIVE_TEXT" && e.evidence_method !== "VISUAL_PAGE") throw new Error(`Unsupported evidence method: ${id}`);
    const original = e.evidence_method === "NATIVE_TEXT" ? (e.quote || e.quote_excerpt) : e.visible_source_description;
    if (typeof original !== "string" || !original || (e.evidence_method === "VISUAL_PAGE" && !/^[a-f0-9]{64}$/.test(String(e.page_image_sha256)))) throw new Error(`Incomplete evidence: ${id}`);
    return { page: Number(e.page), method: e.evidence_method, text: text(original), omitted: Boolean(e.redaction_note) };
  });
  for (const o of allObjects) {
    citations(o);
    for (const k of ["entity_ids", "agenda_item_ids", "observation_ids", "procedural_action_ids"]) for (const ref of strings(o[k])) if (!knownIds.has(ref)) throw new Error(`Unknown local reference: ${ref}`);
    for (const k of ["subject_entity_id", "object_entity_id", "object_ref", "episode_id"]) if (o[k] && !knownIds.has(String(o[k]))) throw new Error(`Unknown local reference: ${o[k]}`);
    if (o.meeting_id && o.meeting_id !== id) throw new Error(`Cross-meeting local reference: ${o.meeting_id}`);
  }
  const detail = (o: Obj, key: string, label: string, fields: Detail["fields"]): Detail => ({ id: text(o[key]), label: readable(label), fields, state: text(o.epistemic_state), citations: citations(o) });
  const entityNames = new Map(list(r.entities).map(e => [e.entity_local_id, text(e.name_as_stated)]));
  const associations = (o: Obj): Detail["fields"] => strings(o.entity_ids).length ? [{ label: "Associated entities in this record", text: strings(o.entity_ids).map(id => entityNames.get(id) || id).join("; ") }] : [];
  const observations = list(r.observations).map(o => ({ ...detail(o, "observation_id", text(o.observation_type), [...valueFields(o.value), ...associations(o)]), episode: o.episode_id }));
  const actions = list(r.procedural_actions).map(o => ({ ...detail(o, "procedural_action_id", text(o.action_type), [
    ...["motion_summary", "result", "vote", "dissent_as_stated", "motion_by_as_stated", "second_by_as_stated", "start_time", "end_time", "legal_basis"].flatMap(k => typeof o[k] === "string" ? [{ label: readable(k), text: text(o[k]) }] : []),
    ...["for", "against", "abstain", "absent"].flatMap(k => typeof obj(o.vote)[k] === "number" ? [{ label: `Vote · ${k}`, text: String(obj(o.vote)[k]) }] : []),
    ...associations(o),
  ]), episode: o.episode_id }));
  const unresolved = list(r.unresolved).map(o => ({ ...detail(o, "unresolved_id", "Unresolved", [{ label: "Question or limitation", text: text(o.description) }]), episode: o.episode_id }));
  const agenda = new Map(list(r.agenda_items).map(a => [a.agenda_item_id, text(a.title)]));
  const matters = list(r.episodes).map(e => ({ ...detail(e, "episode_id", strings(e.agenda_item_ids).map(a => agenda.get(a)).filter(Boolean).join(" / ") || text(e.episode_type), []),
    observations: observations.filter(o => o.episode === e.episode_id).map(withoutEpisode),
    actions: actions.filter(o => o.episode === e.episode_id).map(withoutEpisode),
    unresolved: unresolved.filter(o => o.episode === e.episode_id).map(withoutEpisode),
  }));
  const entities = list(r.entities).map(e => detail(e, "entity_local_id", text(e.name_as_stated), [{ label: "Type", text: readable(text(e.entity_type)) }, { label: "Source-stated roles", text: strings(e.roles).map(readable).join(", ") }]));
  const names = new Map([...entities, ...matters, ...observations, ...actions].map(e => [e.id, e.label]));
  const relationships = list(r.relationships).filter(o => names.has(String(o.subject_entity_id)) && names.has(String(o.object_entity_id || o.object_ref))).map(o => detail(o, "relationship_id", text(o.predicate), [
    { label: "Subject", text: names.get(String(o.subject_entity_id))! }, { label: "Object", text: names.get(String(o.object_entity_id || o.object_ref))! },
  ]));
  return { recordFormat:"r3", documentType:text(obj(r.dates).document_label),dateRole:text(obj(r.dates).date_role),dateNote:text(obj(r.dates).date_note)||null,
    waterObjects:[],quantities:[],unavailable:[],tables:[],contextDates:[],completenessCitations:citations(obj(m.source_completeness)),
    key: text(r.id), id, districtId: text(m.district_id), district: text(m.district_name), date: text(m.meeting_date), approvedDate: text(m.approved_date) || null,
    routingDate: text(index.frozen_routing_date) || null, extractionDate: null, lastSourceCheck: null, sourceUrl, sourceId, pages,
    summary: text(summary.model_summary), citations: citations(summary), limitation: text(obj(m.source_completeness).note),
    partial: partialPages.length > 0, partialPages, topics: strings(summary.key_signal_categories),
    stages: [...new Set([...list(r.observations).map(o => text(o.observation_type)), ...list(r.procedural_actions).map(o => text(o.action_type))])].sort(),
    agendas: list(r.agenda_items).map(a => detail(a, "agenda_item_id", text(a.title), [{label: "Agenda", text: text(a.label)}])), searchText: "",
    matters, entities, relationships, unresolved: unresolved.map(withoutEpisode),
  };
}

export type MeetingFilters = { q: string; district: string; from: string; to: string; topic: string; stage: string; document: string; dates: string };
export const emptyMeetingFilters: MeetingFilters = { q: "", district: "", from: "", to: "", topic: "", stage: "", document:"", dates:"" };
export type MeetingCard = Pick<MeetingDisplay, "key" | "id" | "districtId" | "district" | "date" | "routingDate" | "pages" | "sourceMediaType" | "summary" | "topics" | "stages" | "sourceUrl" | "partial" | "partialPages" | "searchText" | "documentType" | "dateRole" | "dateNote"> & { content_version:string; recordFormat:string; citations: EvidenceLocation[]; matters: {id:string;label:string;searchText:string;dateContext?:DateContext;topic?:string|null;stage?:string|null}[] };
export function matchingMatters(m: MeetingCard, q: string, filters: Partial<MeetingFilters> = {}): MeetingCard['matters'] { return matchingItems(m,q,filters); }
export function filterMeetings<T extends MeetingCard>(meetings:T[],filters:MeetingFilters):T[] { return filterMeetingRecords(meetings,filters); }
export const meetingPath = (key: string) => `/groundwater-districts/intelligence/meetings/${key}`;
export const officialPage = (url: string, page: number) => `${url.split("#")[0]}#page=${page}`;

// Batch 02 stays a distinct typed public profile. This is presentation only:
// no empty R3 content is written into its public JSON and no metadata invented.
function projectBatch02(r: Obj): MeetingDisplay {
  const m=obj(r.meeting), dates=obj(r.dates), provenance=obj(obj(r.provenance).reported);
  const localNames=new Map([...list(r.entities).map(o=>[text(o.id),text(o.name)] as const),...list(r.water_objects).map(o=>[text(o.id),text(o.label)] as const)]);
  const localLabel=(v:unknown):unknown=>provenance.batch==='07'?(Array.isArray(v)?v.map(localLabel):typeof v==='string'?localNames.get(v)||v:v):v;
  const citations=(e:unknown):Citation[]=>list(e).map(c=>{
    if(m.source_media_type==='text/html'){
      const l=obj(c.native_locator);
      if(c.evidence_method!=='NATIVE_BLOCK_REFERENCE'||c.source_document_id!==m.source_document_id||'page' in c||'page_basis' in c||!l.block_id||!l.supporting_text||!l.map_url)throw Error('Invalid native block reference');
      return {native_locator:l as NativeLocator,method:'NATIVE_BLOCK_REFERENCE',text:text(l.supporting_text),omitted:false};
    }
    if(c.evidence_method!=="PDF_PAGE_REFERENCE" || c.source_document_id!==m.source_document_id || Number(c.page)<1 || Number(c.page)>Number(m.page_count))throw Error("Invalid Batch 02 page reference");
    return {page:Number(c.page),method:"PDF_PAGE_REFERENCE",text:"Physical PDF page reference supplied with the extraction; no exact quotation or per-page image method is asserted.",omitted:false};
  });
  const detail=(o:Obj,label:string):Detail=>{
    const context=obj(o.date_context);
    const fields=Object.entries(o).filter(([k])=>!["id","json_pointer","citation_url","evidence","date_context",...(o.date_context?["section_date","section_dates"]:[])].includes(k)).flatMap(([k,v])=>valueFields(['actors','subject','object','well_ids'].includes(k)?localLabel(v):v,readable(k)));
    if(o.date_context)fields.push({label:"Date context",text:text(context.date_note)},{label:context.date_role==='explicit_section_date'?"Supported section date":"Document / item context date",text:typeof context.date==="string"?context.date:"No single item event date supplied"},...list(context.date_candidates).map(c=>({label:"Section date candidate",text:`${text(c.date)} — ${text(c.context)} (${c.native_locator ? "native block " + text(obj(c.native_locator).block_id) : "physical p. " + c.page})`})),...list(context.referenced_dates).map(c=>({label:readable(text(c.role)),text:`${text(c.date)} — ${text(c.qualification)} (${c.native_locator ? "native block " + text(obj(c.native_locator).block_id) : "physical p. " + c.page})`})));
    return {id:text(o.id),label,fields,state:text(o.stage||o.role||o.identity_scope)||"Source-linked item",citations:citations(o.evidence)};
  };
  const episodes=list(r.episodes).map(o=>({...detail(o,text(o.topic)),observations:[],actions:[],unresolved:[]}));
  return {recordFormat:r.record_format as "batch02" | "source_bounded",documentType:text(dates.document_label),dateRole:text(dates.date_role),dateNote:text(m.date_note)||null,
    key:text(r.id),id:text(m.meeting_id),districtId:text(m.district_id),district:text(m.district_name),date:typeof dates.source_date==="string"?dates.source_date:null,approvedDate:text(m.approved_date)||null,
    routingDate:null,extractionDate:text(dates.extraction_date)||null,lastSourceCheck:text(dates.last_source_check)||null,sourceUrl:text(m.source_url),sourceId:text(m.source_document_id),pages:m.page_count===null?null:Number(m.page_count),sourceMediaType:text(m.source_media_type)||"application/pdf",sourceDisclosures:[...(["issuer","source_publisher"].flatMap(k=>valueFields(r[k],readable(k)))),...valueFields(m.district_role,"District role"),...valueFields(m.document_status,"Document status"),...valueFields(obj(provenance.native_review).missing_dependencies,"Native dependencies"),...["source_acquired_at","source_checked_at","source_check_basis","acquired_at","acquisition_metadata_basis","readability_limits","dependency_note","missing_dependencies"].flatMap(k=>valueFields(provenance[k],readable(k)))],summary:text(r.meeting_summary),citations:citations(r.meeting_summary_evidence),
    limitation:provenance.pilot_id?text(provenance.read_completeness).replace('no human review claimed','no independent reviewer verification claimed'):provenance.batch==='08'?text(provenance.read_completeness).replace('no claim of human review','no independent reviewer verification is established'):text(provenance.read_completeness),partial:false,partialPages:[],topics:[...new Set(list(r.episodes).map(o=>text(o.topic)))],stages:[...new Set(list(r.episodes).map(o=>text(o.stage)))],agendas:[],searchText:"",matters:episodes,
    entities:list(r.entities).map(o=>detail(o,text(o.name))),relationships:list(r.relationships).map(o=>detail(o,`${text(localLabel(o.subject))} · ${text(o.predicate)}`)),unresolved:list(r.unresolved).map(o=>detail(o,"Unresolved issue")),
    waterObjects:list(r.water_objects).map(o=>detail(o,text(o.label))),quantities:list(r.quantities).map(o=>detail(o,`${text(o.subject)} · ${readable(text(o.role))}`)),unavailable:list(r.unavailable_references).map(o=>detail(o,"Unavailable reference")),completenessCitations:[],
    figures:list(r.figures).map(o=>detail(o,text(o.title))),
    contextDates:[...list(m.date_candidates),...list(r.date_contexts).map((c):Obj=>({...c,role:c.date_role,qualification:c.note}))].map(c=>({id:text(c.id)||undefined,date:typeof c.date==="string"?c.date:null,role:readable(text(c.role)),qualification:text(c.qualification),citations:citations(c.evidence)})),sections:(dates.sections||[]) as MeetingSection[],
    tables:list(r.tables).map(t=>({id:text(t.id),name:text(t.name),columns:strings(t.columns),rows:t.rows as unknown[][],rowIds:list(t.row_navigation).map(n=>text(n.id)),notes:text(t.notes),stage:text(t.stage),citations:citations(t.evidence),...(t.row_evidence?{rowEvidence:list(t.row_evidence).map(e=>({row_index:Number(e.row_index),citations:citations(e.evidence)}))}:{}),...(t.grouping?{grouping:JSON.stringify(t.grouping)}:{}),...(t.date_context?{dateContext:t.date_context as DateContext}:{})}))};
}
