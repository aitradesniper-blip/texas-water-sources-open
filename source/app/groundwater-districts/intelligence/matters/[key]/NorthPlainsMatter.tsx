import Link from 'next/link';
import {PageShell} from '@/app/components/SiteChrome';
import matter from '@/public/data/water-watch/v1/matters/north-plains-blf-enforcement.json';
import {RevealMeetingTarget} from '../../RevealMeetingTarget';
import '../../meeting-intelligence.css';
import '../../intelligence.css';
import '../matter.css';

const local=(url:string)=>{const u=new URL(url);return u.pathname+u.hash;};
// Display-only correction of typographic encoding artifacts; JSON/raw text stays exact.
const text=(s:string)=>s.replaceAll('â€™','’').replaceAll('â€“','–').replaceAll('_',' ');
function Evidence({refs}:{refs:string[]}) {
  return <div className="matter-evidence">{refs.map(id=>{
    const r=matter.source_refs.find(r=>r.id===id)!;
    return <details key={id}><summary>{text(r.item_label)} · {r.source_date} · {r.physical_pages.length?`physical pp. ${r.physical_pages.join(', ')}`:'native calendar block'}</summary>
      <p>{r.issuer} · {r.document_label} · {text(r.date_role)}</p>
      <p><Link href={local(r.human_url)}>Open exact source-record item</Link> · <a href={local(r.record_json_url)}>Record JSON</a></p>
      {r.evidence.map((e,i)=>'native_locator' in e&&e.native_locator?<div key={i}><p><a href={e.source_url}>Official calendar</a> · <a href={local(e.native_locator.map_url)}>Retained map · {e.native_locator.block_id}</a></p><blockquote>{e.native_locator.supporting_text}</blockquote></div>:<p key={i}><a href={e.source_url.split('#')[0]+'#page='+('page' in e?e.page:'')}>Official PDF physical p. {'page' in e?e.page:''}</a></p>)}
      <p><code>{r.json_pointer}</code> · {r.id}</p><p className="mi-label">{r.source_document_id}</p>
    </details>;
  })}</div>;
}
export default function NorthPlainsMatter() {
  return <PageShell><article className="wrap mi-detail matter-detail"><RevealMeetingTarget/>
    <nav><Link href="/groundwater-districts/intelligence#longitudinal-matters">← Water Watch matters</Link></nav>
    <header><p className="eyebrow">North Plains GCD · Source-linked research matter</p><h1>BLF: assessments, litigation and compliance</h1>
      <h2>What did the supplied orders decide?</h2>
      <p className="mi-summary">The court granted the District’s cross-motion on BLF’s claims in November 2024, with a separate conditional procedure for the ultra vires claim. In May 2025 it denied summary judgment on the District’s counterclaims and dismissed without prejudice for lack of jurisdiction. These are different dispositions with different scopes.</p>
      <Evidence refs={['ref-010','ref-011','ref-012','ref-013']}/>
      <p className="mi-boundary">Latest evidenced in these supplied sources. No later appellate or state-court outcome, current compliance status, collected amount or aggregate liability is established. The March 2026 calendar is scheduling evidence only.</p>
    </header>
    <nav className="mi-matter-index" aria-label="Matter navigation"><a href="#answers">Answers and limits</a><a href="#chronology">{matter.events.length} dated entries</a><a href="#connections">Connections</a><a href="#missing">Missing instruments</a><a href="#sources">{matter.source_record_ids.length} source records</a><a href="#references">{matter.source_refs.length} references</a></nav>
    <section id="answers"><h2>What the combined records establish</h2>{matter.conclusions.map(c=><article className="mi-source" key={c.id} id={c.id}><h3>{c.question}</h3><p>{text(c.answer)}</p><Evidence refs={c.source_refs}/></article>)}</section>
    <section id="chronology"><h2>Keep the procedural tracks separate</h2><p>Administrative assessments, court proceedings, production years, HA-5814 / GPU 8287 plugging and late reporting retain their own scope. A recurring row is not a new assessment.</p>
      {matter.events.map(e=><article className="mi-source" key={e.id} id={'event-'+e.id}><p className="eyebrow">{e.event_date} · {text(e.date_role)} · {text(e.track)}</p><h3>{text(e.title)}</h3><p>{text(e.statement)}</p>{e.qualification?<p className="mi-warning">{text(e.qualification)}</p>:null}<a href={'#event-'+e.id}>Link to this entry</a><Evidence refs={e.refs}/></article>)}
    </section>
    <section id="update-notes"><h2>What the historical readings change</h2><p>January, March and April 2026 minutes add earlier context. January records no action on the metering item; April reports districtwide 2025 receipt totals, which do not settle BLF&apos;s separate late-2023 reporting or the sufficiency of submitted methods. The June 16 record fills another earlier gap; July and August remain later evidence. The contract supplies a case locator, not a court docket or outcome.</p>{matter.update_annotations.map(a=><article className="mi-source" id={a.id} key={a.id}><h3>{text(a.classification)}</h3><p>{typeof a.value==='string'?text(a.value):Object.entries(a.value).map(([k,v])=>`${text(k)}: ${v}`).join(' Â· ')}</p><Evidence refs={a.source_refs}/></article>)}{matter.derived_answer_revisions.map(r=><details className="mi-source" id={r.id} key={r.id}><summary>Reporting answer revision Â· prior and revised</summary><p>Prior: {text(r.prior_answer)}</p><p>Revised: {text(r.revised_answer)}</p><p>{r.reason}</p><Evidence refs={r.source_refs}/></details>)}</section>
    <section id="connections"><h2>What connects these sources?</h2>{matter.connections.map(c=><article className="mi-source" key={c.id}><h3>{text(c.id)}</h3><p className="mi-stage">{text(c.status)}</p><p>{text(c.statement)}</p>{'not_established' in c?<p>{c.not_established}</p>:null}<Evidence refs={c.source_refs}/></article>)}</section>
    <section id="missing"><h2>What remains unknown?</h2>{matter.missing_instruments.map(m=><article className="mi-source" key={m.id}><h3>{text(m.instrument)}</h3><p>{text(m.research_consequence)}</p><Evidence refs={m.source_refs}/></article>)}</section>
    <section id="sources"><h2>Complete sources and unchanged context</h2><p>The original source chain contains nine PDFs / 84 physical pages, one native calendar / 91 mapped blocks and four unchanged accepted context records. Watch 01 adds one complete June minutes PDF / 93 physical pages. Three complete January, March and April minutes PDFs add 34 physical pages. The calendar’s repeated day/week representations are not counted twice.</p>{matter.source_documents.map(s=><p key={s.record_id}><Link href={local(s.human_url)}>{s.source_date} · {s.document_label}</Link> · {s.issuer} · {text(s.record_role)} · {s.pages===null?'native document':`${s.pages} physical pages`} · <a href={local(s.json_url)}>JSON</a></p>)}</section>
    <details className="mi-source" id="references"><summary>All {matter.source_refs.length} resolved source references</summary><Evidence refs={matter.source_refs.map(r=>r.id)}/></details>
    <section className="mi-source"><h2>Data and scope</h2><p><a href={local(matter.json_url)}>Matter JSON</a> · <a href="/data/water-watch/v1/matters/schema.json">Matter field guide</a> · <a href="/data/water-watch/v1/index.json">Catalog</a></p>{matter.limitations.map(l=><p key={l}>{l}</p>)}</section>
  </article></PageShell>;
}
