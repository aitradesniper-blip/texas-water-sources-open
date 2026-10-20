import { officialPage, readable, locationLabel, retainedMapPath, type SourceCitation, type Citation, type Detail, type MeetingDisplay } from "@/lib/meeting-intelligence";

// Escaped text only; retained original markup is never executed or embedded.
export function SourceEvidence({evidence}:{evidence:SourceCitation[]}) {
  return <>{evidence.map((e,i)=>e.native_locator?<div className="mi-native-evidence" key={i}>
    <p className="mi-label">Native block {e.native_locator.block_id} · whitespace-normalized retained-source text</p>
    <blockquote>{e.native_locator.supporting_text}</blockquote>
    <div className="mi-links"><a href={e.source_url} target="_blank" rel="noreferrer">Official web source</a><a href={retainedMapPath(e.native_locator.map_url)}>Retained location map · {e.native_locator.block_id}</a></div>
  </div>:<a key={i} href={officialPage(e.source_url,e.page)} target="_blank" rel="noreferrer">Official PDF · p. {e.page}</a>)}</>;
}

export function MeetingEvidence({ meeting, citations }: { meeting: MeetingDisplay; citations: Citation[] }) {
  if (!citations.length) return null;
  return <details className="mi-evidence"><summary>Source evidence · {Array.from(new Set(citations.map(locationLabel))).join(", ")}</summary>
    {citations.map((c, i) => c.method==='NATIVE_BLOCK_REFERENCE'?<SourceEvidence key={i} evidence={[{native_locator:c.native_locator,source_url:meeting.sourceUrl}]}/>:<div key={i}><p className="mi-label">{c.omitted ? "Source excerpt / description with an explicit omission" : c.method === "NATIVE_TEXT" ? "Extracted native-text quotation" : c.method === "PDF_PAGE_REFERENCE" ? "PDF page reference · no quotation or image-method claim" : "Visual-source description · not a quotation"}</p>
      {c.method === "NATIVE_TEXT" && !c.omitted ? <blockquote>{c.text}</blockquote> : <p>{c.text}</p>}
      <div className="mi-links"><a href={officialPage(meeting.sourceUrl, c.page)} target="_blank" rel="noreferrer">Official PDF · page {c.page}</a></div></div>)}
  </details>;
}

export function MeetingDetailItem({ meeting, item, headingLevel = 4 }: { meeting: MeetingDisplay; item: Detail; headingLevel?: 3 | 4 }) {
  const Heading=headingLevel === 3 ? "h3" : "h4";
  return <article className="mi-item" id={item.id}><Heading>{item.label}</Heading><a href={`#${item.id}`} className="mi-label">Link to this item</a>
    <dl className="mi-fields">{item.fields.length ? item.fields.map((f, i) => <div key={i}><dt>{f.label}</dt><dd>{f.text}</dd></div>) : <div><dt>Display limitation</dt><dd>See source evidence and related observations.</dd></div>}</dl>
    <p className="mi-label">Statement basis: {readable(item.state).toLowerCase()}</p><MeetingEvidence meeting={meeting} citations={item.citations} />
  </article>;
}
