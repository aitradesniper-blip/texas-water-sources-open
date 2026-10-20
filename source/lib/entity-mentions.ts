import type {SourceCitation,DateContext} from "./meeting-intelligence";
export type Mention = {
  id:string; lookup_group_id:string; record_id:string; record_format:string; local_item_id:string; json_pointer:string;
  as_stated:string; type:string; document_type:string; issuing_district_id:string; issuing_district_name:string;
  source_issuer?:string;source_publisher?:string;district_role?:string;
  identifier:{type:string;issuer_district_id:string;value_as_stated:string}|null;
  date:string|null;date_role:string;date_note:string;stated_role:string;stage:string|null;
  date_candidates:DateContext["date_candidates"];
  referenced_dates?:DateContext["referenced_dates"];
  record_url:string;record_json_url:string;object_url:string;evidence_scope:string;
  evidence:(SourceCitation & {source_document_id:string})[];values:Record<string,unknown>|null;linkage_basis:string;
};
export type LookupGroup = {id:string;label:string;labels:string[];type:string;normalized_lookup:string;issuer_district_id:string|null;identity_merged:false;grouping_basis:string;occurrence_ids:string[];record_count:number;earliest_in_collection:string|null};
export type MentionIndex = {schema_version:string;group_count:number;occurrence_count:number;identity_policy:string;groups:LookupGroup[];occurrences:Mention[]};
export type LeadResolution = {status:"resolved";record_url:string;json_url:string}|{status:"unresolved";reason:string};
export type ResearchLead = {
  id:string;label:string;reason_to_investigate?:string;caution?:string;next_verification?:string;why_investigate?:string;identity_uncertainty?:string;
  provenance:{batch?:string;pilot_id?:string;source_schema:string};
  prior_corpus_matching_performed?:boolean;
  occurrences:{record_id:string;district_id:string;meeting_date:string|null;source_date?:string|null;date_note?:string|null;statement?:string;supported_section_date?:string;names_or_identifiers:string[];names_or_identifiers_status?:'not_supplied';resolution:LeadResolution;evidence:SourceCitation[]}[];
  prior_corpus_candidates:{record_id:string;district_id:string;meeting_date:string|null;resolution:LeadResolution;candidate_entities:{name_as_stated:string;resolution:{status:"resolved";object_url:string;json_pointer:string}|{status:"unresolved";reason:string}}[]}[];
};
export const normalizeLookup=(s:string)=>s.toLocaleLowerCase("en-US").replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
export const localDataLink=(url:string)=>{const u=new URL(url);return u.pathname+u.search+u.hash;};
