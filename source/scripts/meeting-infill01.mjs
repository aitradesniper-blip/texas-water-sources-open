export const infillPilot = 'two-district-2026-minutes-infill-01';
export const isInfill01 = r => (r.provenance?.reported || r.provenance)?.pilot_id === infillPilot;

const s={type:'string'}, n={type:['string','null']}, a=items=>({type:'array',items});
const obj=(properties,required=Object.keys(properties))=>({type:'object',properties,required,additionalProperties:false});
const evidence=a({$ref:'#/$defs/batch02_evidence'});

export function extendInfillDefinitions(d) {
  Object.assign(d.batch02_water_object.properties,{context:{$ref:'#/$defs/json_cell'},reporting_year:{type:['integer','null']},case_identifier_as_printed:s});
  Object.assign(d.batch02_quantity.properties,{direction_as_printed:s,source_value:{$ref:'#/$defs/json_cell'}});
  const motion=d.batch02_episode.properties.motion;
  motion.properties.outcome=s;motion.required=motion.required.filter(k=>k!=='vote');
  d.batch02_table.properties.reporting_period=n;
  d.watch_figure={oneOf:[
    structuredClone(d.watch_figure),
    obj({id:s,json_pointer:s,citation_url:s,evidence,title:s,description:s,qualification:n,map_release_date:s,data_valid_at:s,source_attribution:s,readability_limit:s},['id','json_pointer','citation_url','evidence','title','description']),
  ]};
  d.watch_date={oneOf:[
    structuredClone(d.watch_date),
    obj({id:s,json_pointer:s,citation_url:s,evidence,date:n,role:s,qualification:n}),
  ]};
}

export function extendInfillProfile(p) {
  const reported=p.properties.provenance.properties.reported;
  Object.assign(reported.properties,{queue_review_id:{type:['string','null']},existing_queue_review_id:{type:'null'},existing_deferred_entry_hash:s,archive_listing_observed_at:s,human_review:{type:['boolean','null']}});
  reported.properties.page_review.oneOf.push(obj({physical_pages_reviewed:a({type:'integer',minimum:1})}));
  p.properties.page_accounting={oneOf:[
    structuredClone(p.properties.page_accounting),
    a(obj({page:{type:'integer',minimum:1},review_method:s,status:s,contents:s,readability_note:n})),
  ]};
  p.properties.source_comparison_annotations=a(obj({
    original_text:s,classification:s,affected_fields:a(s),
    source_items:a(obj({record_id:s,item_id:s,json_pointer:s,human_url:s,physical_pages:a({type:'integer',minimum:1})})),
  }));
}

// Raw source-local fields contain a few comparisons made by the reader across
// March and April. Move the interpretive clause into an explicitly two-source
// annotation; keep each source's printed value, row order and physical pages.
export function projectInfillComparisons(r,url) {
  if(!isInfill01(r))return;
  const march='district2026-north_plains_gcd-a0b25891a58b';
  const april='district2026-north_plains_gcd-37004c221ede';
  const item=(record_id,tableIndex,page)=>{const item_id=record_id+(tableIndex===4||tableIndex===6?'-gpus-chart':'-reporting2025');return {record_id,item_id,json_pointer:`/tables/${tableIndex}`,human_url:url(`/groundwater-districts/intelligence/meetings/${record_id}#${item_id}`),physical_pages:[page]};};
  // Source item IDs are checked by the importer test against the adapted tables.
  const comparisons={
    chart:{classification:'cross_document_chart_comparison',source_items:[item(march,4,4),item(april,6,6)]},
    reports:{classification:'cross_document_reporting_comparison',source_items:[item(march,9,7),item(april,9,7)]},
  };
  const grouped=new Map();
  for(const group of ['quantities','tables','figures','unresolved'])for(const [i,o] of (r[group]||[]).entries())for(const field of ['qualification','notes','statement']){
    const value=o[field];if(typeof value!=='string')continue;
    const kind=/March source chart|April source labels|March 2025 label here is 143|March 2025 is printed as 78/.test(value)?'chart':/Counts differ from March|March source reports 2942/.test(value)?'reports':null;
    if(!kind)continue;
    const pointer=`/${group}/${i}/${field}`;
    if(!grouped.has(value))grouped.set(value,{original_text:value,...comparisons[kind],affected_fields:[]});
    grouped.get(value).affected_fields.push(pointer);
    o[field]=kind==='chart'?(r.id===march?'March source prints 143 for March 2025. See cross-document comparison annotation.':'April source prints 78 for March 2025. See cross-document comparison annotation.'):'April districtwide 2025 report only; earlier reporting and BLF 2023 status are qualified in the cross-document annotation.';
  }
  r.source_comparison_annotations=[...grouped.values()];
}
