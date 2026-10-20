import { createPageMetadata } from "@/lib/seo";
import {PageShell} from "../components/SiteChrome";

export const metadata = createPageMetadata({
  title: "Texas Water Sources Terms of Use",
  description: "Read the terms for using Texas Water Sources as an independent educational research aid, including limits on ownership, disclosure, and record conclusions.",
  path: "/terms",
});

export default function Page(){return <PageShell><section className="prose-page legal-page wrap"><p className="eyebrow">Terms of use</p><h1>Use the service as a research aid.</h1><p className="lead">The service provides general educational and organizational support, not legal, title, engineering, surveying, brokerage, or other professional advice.</p><h2>No ownership or disclosure determination</h2><p>The service does not determine whether a person owns a water right, whether a right transfers with property, whether a database record matches a tract, or which answer a seller should select on TREC Form 61-0.</p><h2>No warranty of completeness</h2><p>Public records may be incomplete, historical, approximate, mislocated, or updated after access. Check current official sources and obtain appropriate professional review.</p><h2>Permitted use</h2><p>You may use the public guides and summaries for lawful property research. You may not misrepresent Texas Water Sources as a government service or use it to avoid required professional judgment.</p><h2>Availability</h2><p>The service and links may change or be unavailable. Features may be corrected, limited, or discontinued.</p><p className="updated">Last updated: July 14, 2026</p></section></PageShell>}
