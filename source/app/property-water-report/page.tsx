import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { validateFreePropertyWaterApiOrigin } from "@/lib/free-property-water-production-config";
import { PageShell } from "../components/SiteChrome";
import FreePropertyWaterLookup from "./FreePropertyWaterLookup";
import { ShareToolButton } from "./ShareToolButton";
import "./free-lookup.css";

export const metadata = createPageMetadata({
  title: "Free Texas Property Water Report | Texas Water Sources",
  description: "Enter a Texas address to organize nearby well records, groundwater-district context, surface-water records, official links, and remaining property-water research steps.",
  path: "/property-water-report",
  imagePath: null,
  absoluteTitle: true,
});

export default function Page() {
  const apiBaseUrl = validateFreePropertyWaterApiOrigin(
    process.env.NEXT_PUBLIC_TWS_FREE_LOOKUP_API_URL,
  );
  return (
    <PageShell>
      <main className="free-lookup-page">
        <header className="free-lookup-hero">
          <div className="wrap">
            <p className="eyebrow">Free Texas property-water research</p>
            <h1>Free Texas Property Water Report</h1>
            <p>
              Enter a Texas property address. We will organize useful public records, show the strongest leads,
              and explain exactly what to search, compare, save, and ask next.
            </p>
            <ShareToolButton />
          </div>
        </header>
        <FreePropertyWaterLookup apiBaseUrl={apiBaseUrl} />
        <section className="free-lookup-follow-up" aria-labelledby="free-lookup-follow-up-heading">
          <div><p className="eyebrow">Focused follow-up</p><h2 id="free-lookup-follow-up-heading">Continue one part of the research.</h2><p>The complete report remains the broad starting point. Use a focused guide when one record family needs closer review.</p></div>
          <nav aria-label="Focused property-water research links">
            <Link href="/trec-61-guide">Open the independent TREC Form 61-0 research guide</Link>
            <Link href="/well-records/find-by-address">Search Texas well reports by address</Link>
            <Link href="/surface-water-rights/water-rights-viewer">Open the TCEQ Water Rights Viewer companion</Link>
            <Link href="/sources">Browse the approved official-source directory</Link>
          </nav>
        </section>
      </main>
    </PageShell>
  );
}
