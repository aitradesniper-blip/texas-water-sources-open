// Explicit compatibility additions for the registered source chain. No extraction.
const s={type:'string'}, n={type:['string','null']}, a=items=>({type:'array',items});
const obj=(properties,required=Object.keys(properties))=>({type:'object',properties,required,additionalProperties:false});
const strings=a(s), evidence=a({$ref:'#/$defs/batch02_evidence'});
export function extendNorthPlainsDefinitions(d) {
  d.batch02_relationship.properties.caution=n;
  Object.assign(d.batch02_water_object.properties,{
    ...Object.fromEntries('address class_as_printed date_role holder_as_printed origin procedural_role reported_status'.split(' ').map(k=>[k,s])),gpu_ids:strings,flag:n,district_case_number:n,
    location:{oneOf:[s,obj({quarter:s,section_block_survey:s,ns_offset:s,ew_offset:s,unit:n})]},
  });
  Object.assign(d.batch02_episode.properties,{
    condition:s,deadline:s,model_period:s,stage_qualification:s,time:s,time_zone:n,well_id:n,
    reporting_year:{type:['integer','null']},day_week_duplicate:{type:'boolean'},posted_dockets:strings,
    motion:obj({mover:n,seconder:n,vote:s}),
  });
  Object.assign(d.batch02_quantity.properties,{column:s,condition:s,direction:s,row_index:{type:'integer',minimum:0},not_blf:{type:'boolean'}});
  Object.assign(d.batch02_table.properties,{
    grouping:a(obj({date:s,panel_count:{type:'integer'},case_count:{type:'integer'}})),
    row_evidence:a(obj({row_index:{type:'integer',minimum:0},evidence})),
  });
}
export function extendNorthPlainsProfile(profile) {
  Object.assign(profile.properties,{issuer:s,source_publisher:s});
  Object.assign(profile.properties.meeting.properties,{district_role:s,document_status:s});
  profile.properties.dates.properties.date_role.enum.push('order_filed_date','map_printed_date','scheduled_argument');
  const p=profile.properties.provenance.properties.reported;
  Object.assign(p.properties,{source_final_url:s,acquisition_metadata:obj({retention:s,original_url:s,request_url:s,final_url:s,acquired_at:s,last_source_check_at:s,receipt_path:s,retained_first_seen:s,acquisition_time_basis:s,observation_count:{type:'integer'},metadata_sha256:s},['retention','original_url','request_url','final_url','acquired_at','last_source_check_at'])});
  const original=p.properties.native_review;
  p.properties.native_review={oneOf:[original,obj({map_path:s,map_sha256:s,blocks_expected:{type:'integer'},blocks_read:{type:'integer'},coverage:a(obj({block_id:s,reviewed:{type:'boolean'},role:s,method:s})),missing_dependencies:strings})]};
  // The original nested review object is retained; the alternate requirements
  // are restricted to this registered pilot, never inferred for older sources.
  profile.allOf[0].then.properties.provenance.properties.reported={oneOf:[
    {required:['native_locations','native_review','missing_dependencies'],not:{required:['page_review']}},
    {required:['pilot_id','native_review'],properties:{pilot_id:{const:'north-plains-blf-source-chain-01'}},not:{required:['page_review']}},
  ]};
}
