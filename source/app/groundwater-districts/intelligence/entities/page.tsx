import Link from "next/link";
import { PageShell } from "@/app/components/SiteChrome";
import { createPageMetadata } from "@/lib/seo";
import { type ResearchLead } from "@/lib/entity-mentions";
import ResearchLeads from "./ResearchLeads";
import EntityBrowser from "./EntityBrowser";
import leadData from "@/public/data/water-watch/v1/research-leads.json";
import "../meeting-intelligence.css";

const leads=leadData.leads as ResearchLead[];
export const metadata=createPageMetadata({title:"Entities and timelines · Texas Water Watch",description:"Find source-linked people, organizations, permits, wells and dated mentions across the cumulative Texas Water Watch collection.",path:"/groundwater-districts/intelligence/entities"});

export default function EntitiesPage(){return <PageShell><article className="wrap mi-detail mi-entities">
  <nav><Link href="/groundwater-districts/intelligence?view=meetings#latest-activity">← Meeting intelligence</Link></nav>
  <header><p className="eyebrow">Texas Water Watch</p><h1>Entities and timelines</h1>
    <p className="mi-summary">Follow named organizations, people, permits and wells through the records in this collection.</p>
    <p>These are dated mentions and recorded actions. A notice is not an approval, a public comment is not a court finding, and similar names do not establish identity. Separate systems and uncertain matches stay separate.</p>
    <div className="mi-links"><a href="/data/water-watch/v1/entity-mentions.json">Download entity mentions</a><a href="/data/water-watch/v1/research-leads.json">Download candidate research leads</a><Link href="/groundwater-districts/data">Data access and field guide</Link></div>
  </header>
  <EntityBrowser/>
  <ResearchLeads leads={leads}/>
  </article></PageShell>;}
