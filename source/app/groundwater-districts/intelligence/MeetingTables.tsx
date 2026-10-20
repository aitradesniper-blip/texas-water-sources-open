import { readable, type MeetingDisplay, type MeetingTable } from "@/lib/meeting-intelligence";
import { MeetingEvidence } from "./MeetingEvidence";

function cell(value: unknown): string {
  if(value===null)return "Not stated";
  if(typeof value==="number")return value.toLocaleString("en-US",{maximumFractionDigits:12});
  if(typeof value==="string")return value;
  return JSON.stringify(value);
}
export function MeetingTables({meeting,tables}:{meeting:MeetingDisplay;tables:MeetingTable[]}) {
  return <section aria-labelledby="tables-heading"><h2 id="tables-heading">Structured tables and transcriptions</h2><p>Signs, units, nulls and ordered rows are retained. Notes distinguish printed source tables from structured transcriptions of prose or lists. Source evidence applies to each whole table; row links do not assert a more precise page location.</p>
    {tables.length>5 ? <details className="mi-source"><summary>Table navigation · {tables.length} transcriptions</summary><nav className="mi-matter-index" aria-label="Packet tables">{tables.map(t=><a key={t.id} href={`#${t.id}`}>{t.name} · physical {t.citations.map(c=>c.page).join(', ')}</a>)}</nav></details> : null}
    {tables.map(t=><section className="mi-source mi-table-section" id={t.id} key={t.id}><h3>{t.name}</h3><p className="mi-stage">{readable(t.stage)}</p>{t.notes?<p>{t.notes}</p>:null}
      {t.dateContext?<p>{t.dateContext.date || 'No single table date supplied'} · {readable(t.dateContext.date_role)}. {t.dateContext.date_note}</p>:null}
      <a href={`#${t.id}`}>Link to this table</a>
      {t.grouping?<details><summary>Supplied reporting groups</summary><p>{t.grouping}</p></details>:null}
      <div className="mi-table-scroll" tabIndex={0} role="region" aria-label={`${t.name} — scroll horizontally`}><table><caption>{t.name} · {t.rows.length} rows</caption><thead><tr><th scope="col">Row link</th>{t.columns.map((c,i)=><th scope="col" title={c} key={i}>{readable(c)}</th>)}</tr></thead><tbody>{t.rows.map((row,i)=><tr id={t.rowIds[i]} key={t.rowIds[i]}><th scope="row"><a href={`#${t.rowIds[i]}`} aria-label={`Link to row ${i+1}: ${cell(row[0])}`}>{i+1}</a></th>{row.map((v,j)=><td key={j}>{cell(v)}</td>)}</tr>)}</tbody></table></div>
      <p className="mi-label">Table-level evidence for all rows below.</p><MeetingEvidence meeting={meeting} citations={t.citations}/>
      {t.rowEvidence?.length?<details><summary>Supplied row-specific evidence</summary>{t.rowEvidence.map(e=><div key={e.row_index}><a href={`#${t.rowIds[e.row_index]}`}>Row {e.row_index+1}</a><MeetingEvidence meeting={meeting} citations={e.citations}/></div>)}</details>:null}
    </section>)}
  </section>;
}
