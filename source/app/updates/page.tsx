/* eslint-disable @next/next/no-html-link-for-pages -- Static hosting requires native document navigation. */
import { PageShell } from "@/app/components/SiteChrome";
import { StructuredData } from "@/app/components/StructuredData";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";
import { briefings } from "@/lib/updates-content";
import { briefingDate, updatesFeedPath } from "@/lib/updates";
import { UpdatesList } from "./UpdatesList";
import { UpdatesLink } from "./UpdatesActions";
import "./updates.css";

export const metadata = createPageMetadata({ title: "Texas Water Updates: District Briefings and Next Steps", description: "Short, dated Texas water-district briefings: who is affected, proposal or decision status, what to check next, primary evidence and unknowns.", path: "/updates" });

export default function UpdatesPage() {
  return <PageShell><div className="wrap updates-page"><header className="updates-hero"><nav aria-label="Breadcrumb"><a href="/">Home</a> / Updates</nav><p className="eyebrow">Selected records, practical next steps</p><h1>Texas water updates</h1><p className="updates-lede">See what changed in selected district records, who it matters to and what to check next. Open the original evidence before acting.</p><p>These are dated briefings, not a continuous statewide feed. Proposals, decisions and actual pumping remain separate. Source checks and unknowns are stated in each briefing.</p><p className="updates-date">Latest briefing published <time dateTime={briefings[0].publishedAt}>{briefingDate(briefings[0].publishedAt)}</time>.</p></header><div className="updates-follow"><div><h2>Follow without signing up</h2><p>Add the RSS feed to your reader. Briefings are published when ready; there is no fixed publication schedule.</p></div><UpdatesLink href={updatesFeedPath} kind="feed">Follow via RSS</UpdatesLink></div><UpdatesList briefings={briefings} /><aside className="updates-boundary"><h2>Keep the evidence in scope</h2><p>A nearby permit or request does not establish a particular well’s risk, property association, available water, water quality or legal rights. Missing coverage does not mean no activity occurred.</p><p><a href="/groundwater-districts">Find your groundwater district</a> · <a href="/well-records">Research well records</a> · <a href="/about/corrections">Corrections and source changes</a></p></aside><StructuredData data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Texas Water Sources updates", url: absoluteUrl("/updates"), description: "Selected, dated district briefings with primary evidence and visible unknowns." }} /></div></PageShell>;
}
