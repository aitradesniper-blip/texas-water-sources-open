"use client";
import { useState, useSyncExternalStore } from "react";
import { briefingDate, briefingPath, type Briefing } from "@/lib/updates";
import { UpdatesLink } from "./UpdatesActions";

const subscribe = () => () => {};

export function UpdatesList({ briefings }: { briefings: Briefing[] }) {
  const [place, setPlace] = useState("");
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const places = [...new Set(briefings.flatMap(briefing => briefing.items.map(item => item.place)))].sort();
  const visible = briefings.flatMap(briefing => briefing.items.filter(item => !place || item.place === place).map(item => ({ briefing, item })));
  return <section aria-labelledby="updates-list-heading"><div className="updates-list-heading"><h2 id="updates-list-heading">Scan by place</h2><div><label htmlFor="updates-place">Place or district</label><select id="updates-place" disabled={!ready} value={place} onChange={event => setPlace(event.target.value)}><option value="">All included places</option>{places.map(value => <option key={value}>{value}</option>)}</select></div></div><p role="status" className="updates-result-count">{visible.length} source-linked {visible.length === 1 ? "item" : "items"} in this selection.</p><div className="updates-card-grid">{visible.map(({ briefing, item }) => <article key={`${briefing.slug}-${item.id}`} className="updates-card"><p className="updates-place">{item.place}</p><h3><UpdatesLink href={`${briefingPath(briefing.slug)}#${item.id}`} kind="briefing">{item.title}</UpdatesLink></h3><p className="updates-status"><strong>Status at source check:</strong> {item.status}</p><p>{item.changed}</p><p><strong>Who it matters to:</strong> {item.mattersTo}</p><p className="updates-date">Published <time dateTime={briefing.publishedAt}>{briefingDate(briefing.publishedAt)}</time></p><UpdatesLink href={`${briefingPath(briefing.slug)}#${item.id}`} kind="briefing">Read the evidence and next step</UpdatesLink></article>)}</div></section>;
}
