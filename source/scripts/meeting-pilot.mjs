// Only registered pilot annotations are projected; the retained extraction stays unchanged.
export const pilotId='ntgcd-aqua-resort-longitudinal-20260924';
export const matterId='ntgcd-aqua-resort-eagle-mountain';
export const isResortPilot=r=>(r.provenance?.reported||r.provenance)?.pilot_id===pilotId;
export function pilotAnnotations(r) {
  if(!isResortPilot(r)||r.meeting.meeting_date==='2024-03-26')return [];
  const result=[];
  for(const [group,field,suffix] of [['water_objects','context','-resort'],['tables','notes','-resort-locations']]) {
    const index=r[group].findIndex(o=>o.id===r.id+suffix);
    if(index<0)throw Error('Missing registered pilot annotation');
    const item=r[group][index];
    result.push({record_id:r.id,item_id:item.id,json_pointer:`/${group}/${index}/${field}`,original_text:item[field],
      replacement_text:group==='water_objects'?'Source-local identifiers and nulls retained. Cross-document well-label commentary is available in the source-linked Resort matter.':'Structured source transcription. Signed coordinates and direction labels retained without geocoding; cross-document island/golf-course commentary relocated to the Resort matter.',
      reason:'Cross-document reading annotation, not an assertion supported by this item’s single PDF citation.',refs:group==='water_objects'?['ref-8','ref-9','ref-10']:['ref-8','ref-22','annotation-ref-1','annotation-ref-2']});
  }
  return result;
}
export function projectPilotAnnotations(r) {
  for(const a of pilotAnnotations(r)) {
    const [,group,index,field]=a.json_pointer.split('/');r[group][Number(index)][field]=a.replacement_text;
  }
}
