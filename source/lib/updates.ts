export type BriefingSource = { title: string; url: string; locator?: string };
export type BriefingItem = {
  id: string;
  place: string;
  title: string;
  mattersTo: string;
  changed: string;
  status: string;
  nextAction: string;
  sourceDate?: string;
  sources: BriefingSource[];
  unknowns: string[];
};
export type Briefing = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  checkedOn: string;
  checkNote?: string;
  items: BriefingItem[];
};

export const updatesOrigin = "https://texaswatersources.com";
export const updatesPath = "/updates";
export const updatesFeedPath = "/updates/feed.xml";
export const briefingPath = (slug: string) => `${updatesPath}/${slug}`;

export function validateBriefings(briefings: Briefing[]): Briefing[] {
  if (!briefings.length) throw new Error("Updates publication requires verified briefing content.");
  const slugs = new Set<string>();
  for (const briefing of briefings) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(briefing.slug) || slugs.has(briefing.slug)) throw new Error("Invalid or duplicate briefing slug.");
    slugs.add(briefing.slug);
    if (!briefing.title.trim() || !briefing.summary.trim() || !briefing.items.length) throw new Error("Incomplete briefing.");
    for (const date of [briefing.publishedAt]) {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(date) || !Number.isFinite(Date.parse(date))) throw new Error("Briefings require explicit UTC timestamps.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(briefing.checkedOn) || !Number.isFinite(Date.parse(briefing.checkedOn))) throw new Error("Briefings require a source-check calendar date.");
    const ids = new Set<string>();
    for (const item of briefing.items) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)) throw new Error("Invalid or duplicate briefing item ID.");
      ids.add(item.id);
      if ([item.place, item.title, item.mattersTo, item.changed, item.status, item.nextAction].some(value => !value.trim()) || !item.sources.length || !item.unknowns.length) throw new Error("Every update requires reader scope, status, next action, primary evidence and unknowns.");
      for (const source of item.sources) {
        const url = new URL(source.url);
        if (url.protocol !== "https:" || url.username || url.password || !source.title.trim()) throw new Error("Invalid primary-source URL.");
      }
    }
  }
  return [...briefings].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function briefingDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" } : {}),
  }).format(new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value));
}

export function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char]!));
}

export function buildUpdatesFeed(input: Briefing[]) {
  const briefings = validateBriefings(input);
  const items = briefings.map(briefing => {
    const url = updatesOrigin + briefingPath(briefing.slug);
    const description = [briefing.summary, `Sources checked ${briefingDate(briefing.checkedOn)} (Central time). ${briefing.checkNote || ""}`, ...briefing.items.map(item => [
      `${item.place}: ${item.title}`, `Who it matters to: ${item.mattersTo}`, `What changed: ${item.changed}`,
      `Status at source check: ${item.status}`, `Next date or action to check: ${item.nextAction}`,
      `Unknowns: ${item.unknowns.join(" ")}`, ...item.sources.map(source => `Primary evidence: ${source.title}${source.locator ? ` (${source.locator})` : ""} — ${source.url}`),
    ].join("\n"))].join("\n\n");
    return `<item><title>${escapeXml(briefing.title)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid><pubDate>${new Date(briefing.publishedAt).toUTCString()}</pubDate><description>${escapeXml(description)}</description>${[...new Set(briefing.items.map(item => item.place))].map(place => `<category>${escapeXml(place)}</category>`).join("")}</item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Texas Water Sources updates</title><link>${updatesOrigin}/updates</link><description>Selected, dated Texas water-district briefings with primary evidence and visible unknowns. No fixed publication schedule.</description><language>en-us</language><atom:link href="${updatesOrigin}${updatesFeedPath}" rel="self" type="application/rss+xml"/><lastBuildDate>${new Date(briefings[0].publishedAt).toUTCString()}</lastBuildDate>${items}</channel></rss>\n`;
}
