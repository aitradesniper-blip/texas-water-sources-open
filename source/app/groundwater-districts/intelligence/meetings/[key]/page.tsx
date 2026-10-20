import Link from "next/link";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import { StructuredData } from "@/app/components/StructuredData";
import { notFound } from "next/navigation";
import { PageShell } from "@/app/components/SiteChrome";
import { loadMeetingIntelligence, loadPublicMeeting } from "@/lib/meeting-intelligence.server";
import { meetingPath, officialPage, readable, documentDateLabel } from "@/lib/meeting-intelligence";
import { MeetingDetailItem, MeetingEvidence } from "../../MeetingEvidence";
import { RevealMeetingTarget } from "../../RevealMeetingTarget";
import { MeetingTables } from "../../MeetingTables";
import matterIndex from "@/public/data/water-watch/v1/matters/index.json";
import "../../intelligence.css";
import "../../meeting-intelligence.css";

export function generateStaticParams() {
  return loadMeetingIntelligence().map(m => ({ key: m.key }));
}
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const m = loadMeetingIntelligence().find(m => m.key === key);
  return { ...createPageMetadata({ title: m ? `${m.district} · ${documentDateLabel(m.date,m.dateRole)} · ${m.documentType}` : "Meeting unavailable", description: m?.summary || "Source-linked meeting research", path: meetingPath(key) }), alternates: { canonical: absoluteUrl(meetingPath(key)), types: { "application/json": absoluteUrl(`/data/water-watch/v1/meetings/${key}.json`) } } };
}
export default async function MeetingPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const meetings = loadMeetingIntelligence();
  const m = meetings.find(m => m.key === key);
  if (!m) notFound();
  const historicalPacket = m.documentType.startsWith("Historical management-plan submission packet");
  const watch = key === "north-plains-watch01-4181603978d4";
  const packet = watch || historicalPacket || m.documentType.startsWith("Scheduled agenda packet");
  const record = loadPublicMeeting(key);
  const comparisons = (record as unknown as { source_comparison_annotations?: { original_text: string; source_items: { record_id: string; item_id: string; human_url: string; physical_pages: number[] }[] }[] }).source_comparison_annotations || [];
  const nonMeeting = ["order_filed_date","map_printed_date","scheduled_argument"].includes(m.dateRole);
  const related = meetings.filter(other => other.districtId === m.districtId && other.key !== m.key).sort((a, b) => (a.date||"9999").localeCompare(b.date||"9999"));
  return <PageShell><article className="wrap mi-detail"><RevealMeetingTarget/>
    <nav aria-label="Meeting breadcrumb"><Link href={`/groundwater-districts/intelligence?view=meetings&district=${m.districtId}#latest-activity`}>← Meeting intelligence · {m.district}</Link></nav>
    <header><p className="eyebrow">Meeting intelligence · {m.documentType}</p><h1>{nonMeeting ? String(record.issuer) : m.district}</h1>{nonMeeting?<p>Research subject: {m.district}. {String(record.meeting.district_role)}</p>:null}<p className="mi-date">{m.date ? <>{m.dateRole === "scheduled_date" ? "Scheduled date" : nonMeeting ? readable(m.dateRole) : "Source meeting date"} <time dateTime={m.date}>{m.date}</time></> : documentDateLabel(m.date,m.dateRole)}</p>
      {m.dateRole === "scheduled_date" ? <p className="mi-warning">This notice or agenda does not establish that the scheduled event occurred or that proposed actions were approved.</p> : null}
      {m.dateNote ? <p className="mi-warning">Date context: {m.dateNote}</p> : null}
      {historicalPacket ? <p className="mi-warning">The primary date identifies the recorded district hearing/adoption event used for routing. Historical reports, planning tables and appended rules retain their own dates and qualifications. Modeled and planning quantities are not pumping approvals. Current validity and newer meeting coverage remain unresolved.</p> : null}
      <p className="mi-boundary">Source-linked research summary. Verify important details against the official source record.</p>
      <h2 id="meeting-summary">{nonMeeting?"Source summary":"Meeting summary"}</h2><p className="mi-summary">{m.summary}</p><MeetingEvidence meeting={m} citations={m.citations} />
      {m.documentType.includes("Draft") || m.documentType.includes("Unsigned") ? <p className="mi-warning">This copy is {m.documentType.toLowerCase()}. Reported actions do not establish that these minutes were formally approved.</p> : null}
    </header>
    {matterIndex.matters.filter(matter=>matter.source_record_ids.includes(key)).map(matter=><aside className="mi-source" key={matter.matter_id}><h2>Follow this source in a matter chronology</h2><Link href={new URL(matter.canonical_url).pathname}>{matter.title}</Link><p>Only explicitly linked source items form this chronology; unrelated business in this complete source remains separate. Connections and their limitations are qualified there.</p></aside>)}
    <section className="mi-source" aria-labelledby="source-heading"><h2 id="source-heading">Source and dates</h2>
      <dl className="mi-fields"><div><dt>{nonMeeting?readable(m.dateRole):"Meeting date · source stated"}</dt><dd>{documentDateLabel(m.date,m.dateRole)}</dd></div><div><dt>Document approval date</dt><dd>{m.approvedDate || m.contextDates.find(c=>c.role==="minutes approval")?.qualification || "Unknown / not stated"}</dd></div><div><dt>Routing metadata date</dt><dd>{m.routingDate || "Unknown"}</dd></div><div><dt>Extraction date</dt><dd>{m.extractionDate || "Unknown / not supplied as a dated field"}</dd></div><div><dt>Last official source check</dt><dd>{m.lastSourceCheck || "Unknown / no new source check performed"}</dd></div><div><dt>Source document</dt><dd>{m.pages===null?"Native HTML/HTM document · pages not applicable":`${m.pages} physical PDF pages`} · {m.id}</dd></div></dl>
      {m.routingDate && m.routingDate !== m.date ? <p className="mi-warning">Source date discrepancy: routing date {m.routingDate} differs from the source-stated meeting date {m.date}. Filters use the source-stated date.</p> : null}
      {m.sections?.length ? <section aria-labelledby="compilation-sections"><h3 id="compilation-sections">Meeting sections in this compilation</h3><p>One source document. Dates locate individual sections; the page-3 conflict does not change the other sections. Pages 5–6 form one section.</p><ul>{m.sections.map(s=><li key={s.pages.join('-')}><a href={`#${s.item_ids[0]||'source-heading'}`}>{s.date||'Section date unresolved'} · physical {s.pages.length===1?'page':'pages'} {s.pages.join(', ')}</a>{s.date_candidates.length?` — ${s.date_candidates.map(c=>c.date+' ('+readable(c.context.split(':')[0].replace('conflicting_section_',''))+')').join('; ')}`:null}</li>)}</ul></section> : null}
      {m.contextDates.length ? <details className="mi-warning"><summary>Source date roles and qualifications{m.dateRole==='unresolved_document_date'?' · whole-document date unresolved':''}</summary>{m.contextDates.map((c,i)=><div key={i} id={c.id}><p><strong>{c.date || "Exact date not stated"} · {c.role}</strong> — {c.qualification}</p><MeetingEvidence meeting={m} citations={c.citations}/></div>)}<p>Posting, filing, signature, approval, study and referenced dates retain their own roles. They do not automatically conflict with the meeting date.</p></details> : null}
      <div className="mi-links"><a href={m.pages===null?m.sourceUrl:officialPage(m.sourceUrl, 1)} target="_blank" rel="noreferrer">{m.pages===null?"Open official web source":"Open official PDF · page 1"}</a><a href={`/data/water-watch/v1/meetings/${m.key}.json`}>Download JSON</a><Link href="/groundwater-districts/data">Data access and field guide</Link></div>
      <p>{m.pages===null?"Native block IDs belong to the retained location map, not the official website. Supporting text is whitespace-normalized; a later changed live page may differ.":"PDF page fragments are navigation hints; some viewers may open at the beginning."}</p><p className="mi-label">Source identity: <code>{m.sourceId}</code></p>
      <h3>Source completeness</h3><p>{m.limitation}</p>{m.sourceDisclosures?.length?<dl className="mi-fields">{m.sourceDisclosures.map((d,i)=><div key={i}><dt>{d.label}</dt><dd>{d.text}</dd></div>)}</dl>:null}{m.partial ? <p className="mi-warning">Partial extraction: tiny raster spans on pages {m.partialPages.join(", ")} remain illegible. Other supported content remains usable.</p> : null}
      <MeetingEvidence meeting={m} citations={m.completenessCitations}/>
      <p><Link href="/groundwater-districts/intelligence/entities">Explore Entities and timelines</Link> · Dated mentions, without assumed identity merges.</p>
    </section>
    {comparisons.length ? <section className="mi-source"><h2>Cross-document comparisons</h2><p>These reading annotations compare separate source documents. Each linked item retains its own printed value, date and physical-page evidence.</p><ul>{comparisons.map((comparison,i)=><li key={i}><p>{comparison.original_text}</p><ul>{comparison.source_items.map(item=><li key={`${i}-${item.record_id}-${item.item_id}`}><a href={new URL(item.human_url).pathname+new URL(item.human_url).hash}>{item.record_id} · source item · physical page {item.physical_pages.join(", ")}</a></li>)}</ul></li>)}</ul></section> : null}
    {watch ? <nav className="mi-source mi-matter-index" aria-label="Packet navigation"><h2>Navigate the complete June source</h2><a href="#matters-heading">Minutes and attachments</a><a href="#tables-heading">36 tables</a><a href="#quantity-details">Typed quantities</a><a href="#figure-details">38 figure descriptions</a><p>Contracts, reporting periods and demonstration results retain their own dates and attribution. Costs and field quantities are not BLF liability or production.</p></nav> : null}
    {packet && !watch ? <nav className="mi-source mi-matter-index" aria-label="Packet navigation"><h2>Navigate this packet</h2><a href="#matters-heading">{historicalPacket?"Adoption evidence, historical reports and rules":"Prior minutes and scheduled matters"}</a><a href="#tables-heading">{historicalPacket?"Historical and planning tables":"Application registers, flow tests and reports"}</a><a href="#quantity-details">Typed quantities</a><p>{historicalPacket?"Each attachment keeps its own context; the primary adoption date does not date the full packet. Historical depth and recency vary by district.":"August 11 draft minutes retain their own dates. September 8 is the scheduled packet date. Application completeness and reported tests do not establish approval."}</p></nav> : null}
    {m.agendas.length ? <details className="mi-source"><summary>Source agenda</summary>{m.agendas.map(o => <MeetingDetailItem key={o.id} meeting={m} item={o} headingLevel={3} />)}</details> : null}
    <section aria-labelledby="matters-heading"><h2 id="matters-heading">Matters, observations and decisions</h2><p>Requests, recommendations and approvals retain their recorded labels. A passed motion is a procedural result; conditions are requirements, not proof of fulfillment. Repeated quantities are not added together.</p>
      <nav className="mi-matter-index" aria-label="Meeting matters">{m.matters.map(matter => <a key={matter.id} href={`#${matter.id}`}>{matter.label}</a>)}</nav>
      {m.matters.map(matter => <section className="mi-matter" id={matter.id} key={matter.id}><h3>{matter.label}</h3><p className="mi-label">{readable(matter.state).toLowerCase()}</p>
        {matter.fields.length ? <><a href={`#${matter.id}`}>Link to this item</a><dl className="mi-fields">{matter.fields.map((f,i)=><div key={i}><dt>{f.label}</dt><dd>{f.text}</dd></div>)}</dl></> : null}
        {matter.observations.map(o => <MeetingDetailItem key={o.id} meeting={m} item={o} />)}
        {matter.actions.length ? <><h4 className="mi-subhead">Procedural actions · motion and outcome</h4>{matter.actions.map(o => <MeetingDetailItem key={o.id} meeting={m} item={o} />)}</> : m.recordFormat === "r3" ? <p>No separate procedural action recorded for this matter.</p> : null}
        {matter.unresolved.map(o => <MeetingDetailItem key={o.id} meeting={m} item={o} />)}
        <MeetingEvidence meeting={m} citations={matter.citations} />
      </section>)}
    </section>
    {packet && m.tables.length ? <MeetingTables meeting={m} tables={m.tables}/> : null}
    <details id="quantity-details" open={packet?undefined:true}><summary>Quantities, roles and time bases · {m.quantities.length} values</summary>
    {m.quantities.length ? <section className="mi-source"><h2>Quantities, roles and time bases</h2><p>Requested, recommended, historic, modeled and approved values retain their separate roles. A null time basis does not remove a time dimension already present in the unit.</p>{m.quantities.map(o=><MeetingDetailItem key={o.id} meeting={m} item={o} headingLevel={3}/>)}</section> : null}
    </details>
    {!packet && m.tables.length ? <MeetingTables meeting={m} tables={m.tables}/> : null}
    {m.waterObjects.length ? <section className="mi-source"><h2>Wells, permits and water-domain objects</h2>{m.waterObjects.map(o=><MeetingDetailItem key={o.id} meeting={m} item={o} headingLevel={3}/>)}</section> : null}
    <section className="mi-source"><h2>Unresolved questions</h2>{m.unresolved.length ? m.unresolved.map(o => <div key={o.id} id={m.matters.some(matter => matter.unresolved.some(u => u.id === o.id)) ? undefined : o.id}><p>{o.fields[0]?.text}</p><MeetingEvidence meeting={m} citations={o.citations} /></div>) : <p>No additional unresolved questions recorded. This does not establish completeness.</p>}</section>
    <details className="mi-source"><summary>Named entities and meeting-local relationships</summary><p>Names remain as stated in each source. Similar names across meetings are not merged. Candidate relationships remain hypotheses.</p>
      {m.entities.map(o => <MeetingDetailItem key={o.id} meeting={m} item={o} headingLevel={3} />)}{m.relationships.map(o => <MeetingDetailItem key={o.id} meeting={m} item={o} headingLevel={3} />)}
    </details>
    {m.figures?.length ? <details className="mi-source" id="figure-details"><summary>Source figure descriptions Â· {m.figures.length}</summary><p>Qualitative descriptions, not extracted numeric series. Follow the supplied physical-page evidence.</p>{m.figures.map(o=><MeetingDetailItem key={o.id} meeting={m} item={o} headingLevel={3}/>)}</details> : null}
    {m.unavailable.length ? <section className="mi-source"><h2>Unavailable referenced material</h2>{m.unavailable.map(o=><MeetingDetailItem key={o.id} meeting={m} item={o} headingLevel={3}/>)}</section> : null}
    {related.length ? <nav className="mi-source" aria-label="Other meetings from this district"><h2>Other available documents · known dates first</h2><p>District context only; these records are not automatically linked to the same people or matter.</p>{related.map(other => <p key={other.key}><Link href={meetingPath(other.key)}>{documentDateLabel(other.date,other.dateRole)} · {other.district}</Link></p>)}</nav> : null}
    <StructuredData data={{ "@context":"https://schema.org", "@type":"CreativeWork", name:`${m.district} · ${documentDateLabel(m.date,m.dateRole)}`, description:m.summary, url:record.canonical_url, publisher:{"@type":"Organization",name:"Texas Water Sources"}, isPartOf:{"@type":"Dataset",name:"Texas Water Watch meeting intelligence",url:absoluteUrl("/groundwater-districts/data")}, citation:{"@type":"CreativeWork",url:m.sourceUrl,publisher:{"@type":"Organization",name:record.source_publisher || m.district}} }} />
  </article></PageShell>;
}
