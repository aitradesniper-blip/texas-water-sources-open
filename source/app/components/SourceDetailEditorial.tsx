import Link from "next/link";
import { RelatedResearch } from "@/app/components/Editorial";
import type { PublicSourceRecord } from "@/lib/source-catalog";
import type { SourceEditorialEnhancement } from "@/lib/source-editorial";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function SourceDetailEditorial({ source, enhancement }: { source: PublicSourceRecord; enhancement: SourceEditorialEnhancement }) {
  return <div className="source-detail-editorial">
    <section className="source-enhancement-section" aria-labelledby="source-use-when-heading">
      <p className="eyebrow">Task fit</p><h2 id="source-use-when-heading">Use this source when</h2>
      <ul>{enhancement.use_when.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>

    <section className="source-enhancement-section source-search-example" aria-labelledby="source-search-example-heading">
      <p className="eyebrow">Research example</p><h2 id="source-search-example-heading">Search example</h2>
      <p>{enhancement.realistic_search_example}</p>
    </section>

    <div className="source-enhancement-grid">
      <section className="source-enhancement-section" aria-labelledby="source-missed-results-heading">
        <p className="eyebrow">Troubleshooting</p><h2 id="source-missed-results-heading">Common reasons results are missed</h2>
        <ul>{enhancement.common_missed_result_reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      </section>
      <section className="source-enhancement-section" aria-labelledby="source-identifiers-heading">
        <p className="eyebrow">Research trail</p><h2 id="source-identifiers-heading">Identifiers to preserve</h2>
        <ul>{enhancement.identifiers_to_preserve.map((identifier) => <li key={identifier}>{identifier}</li>)}</ul>
      </section>
    </div>

    <section className="source-change-history" aria-labelledby="source-change-history-heading">
      <div><p className="eyebrow">Source maintenance</p><h2 id="source-change-history-heading">Source verification and change history</h2></div>
      <ol>{enhancement.change_history.map((entry) => <li key={`${entry.date}-${entry.summary}`}><time dateTime={entry.date}>{formatDate(entry.date)}</time><span>{entry.summary}</span></li>)}</ol>
      <p>The current source record was last verified <time dateTime={source.last_verified_date}>{formatDate(source.last_verified_date)}</time>. <Link href="/about/corrections">Read the correction and changed-source policy.</Link></p>
    </section>

    <RelatedResearch content={enhancement} />
  </div>;
}
