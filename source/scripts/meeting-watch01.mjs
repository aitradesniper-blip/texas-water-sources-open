// Compatibility for the registered complete Watch 01 reading; raw bytes stay intact.
import {watchPilot} from '../lib/north-plains-watch-context.mjs';
export {watchPilot,isWatch01,watchItemDate} from '../lib/north-plains-watch-context.mjs';
const s={type:'string'},n={type:['string','null']},b={type:'boolean'},integer={type:'integer'};
const a=items=>({type:'array',items}),obj=(properties,required=Object.keys(properties))=>({type:'object',properties,required,additionalProperties:false});
const strings=a(s),ev=a({$ref:'#/$defs/batch02_evidence'}),links={id:s,json_pointer:s,citation_url:s,evidence:ev};
export function extendWatchDefinitions(d){
 Object.assign(d.batch02_water_object.properties,{case_number:s,class_label:s,meter_ids:strings});
 d.batch02_water_object.properties.location.oneOf.push(obj({quarter:s,section_block_survey:s,north_south:s,east_west:s,offset_unit:n}));
 Object.assign(d.batch02_episode.properties,{attribution:s,disposition:s,effective_date:s,observed_date:s,report_date:s,reporting_period:s,section_date:n,signature_dates:a(obj({party:s,date:s,basis:s}))});
 Object.assign(d.batch02_quantity.properties,{qualification:n,attribution:s,row_id:s});
 Object.assign(d.batch02_table.properties,{table_type:s,reporting_period:s,row_ids:strings});
 d.batch02_relationship.properties.qualification=n;
 d.batch02_unavailable.properties.research_consequence=s;
 // Preserve source notes without inventing quote/image evidence.
 d.batch02_evidence.oneOf[0].properties.note=s;
 d.watch_figure=obj({...links,description:s,figure_label:s,method:s,numeric_series_extracted:{const:false},title:s});
 d.watch_date=obj({...links,date:n,date_role:s,note:s});
}
export function extendWatchProfile(p){
 Object.assign(p.properties,{record_id:s,district:obj({district_id:s,name:s}),meeting_date:n,meeting_date_role:s,document_status:s,title:s,
 source:obj({source_document_id:s,sha256:s,bytes:integer,source_url:s,original_url:s,resolved_url:s,source_media_type:{const:'application/pdf'},page_count:integer,issuer:s,source_publisher:s,source_family:s,official_link_basis:s}),
 figures:a({$ref:'#/$defs/watch_figure'}),date_contexts:a({$ref:'#/$defs/watch_date'}),page_accounting:a(obj({content:s,limitation:n,physical_page:integer,printed_page:n,read_status:s,review_method:s}))});
 const reported=p.properties.provenance.properties.reported;
 Object.assign(reported.properties,{source_checked_at:n,check_run_id:s,source_package_bytes:integer,extracted_at:s,extraction_method:s,human_review:{type:'null'},acceptance_performed:b,publication_performed:b});
 const prior=reported.properties.page_review;
 reported.properties.page_review={oneOf:[prior,obj({physical_pages_reviewed:a(integer),complete_original_reviewed:{const:true},prior_originals_reviewed:{type:'array',maxItems:0}})]};
 // The additional complete-page review shape belongs only to this registered pilot.
 p.allOf.push({if:{properties:{provenance:{properties:{reported:{properties:{pilot_id:{const:watchPilot}},required:['pilot_id']}}}}},then:{properties:{provenance:{properties:{reported:{properties:{page_review:{type:'object'}},required:['page_review']}}}}}});
}
