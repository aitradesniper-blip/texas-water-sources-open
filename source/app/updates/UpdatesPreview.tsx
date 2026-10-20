/* eslint-disable @next/next/no-html-link-for-pages -- Static hosting requires native document navigation. */
import { briefings } from "@/lib/updates-content";
import { briefingDate, briefingPath } from "@/lib/updates";
import { UpdatesLink } from "./UpdatesActions";
import "./updates.css";

export function UpdatesPreview() {
  const latest = briefings[0];
  return <section className="section wrap updates-preview" aria-labelledby="home-updates-heading"><div className="section-heading"><div><p className="eyebrow">Texas water updates</p><h2 id="home-updates-heading" className="display-small">What changed, who it matters to, what to check next.</h2></div><a className="text-link" href="/updates">Browse district briefings</a></div><article><p className="updates-date"><time dateTime={latest.publishedAt}>{briefingDate(latest.publishedAt)}</time> · Selected official records</p><h3><UpdatesLink kind="briefing" href={briefingPath(latest.slug)}>{latest.title}</UpdatesLink></h3><p>{latest.summary}</p><p className="updates-place">{[...new Set(latest.items.map(item => item.place))].join(" · ")}</p><UpdatesLink kind="briefing" href={briefingPath(latest.slug)}>Read the source-linked briefing</UpdatesLink></article></section>;
}
