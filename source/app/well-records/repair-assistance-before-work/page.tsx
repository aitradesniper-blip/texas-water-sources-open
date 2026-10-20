/* eslint-disable @next/next/no-html-link-for-pages -- The static Worker requires document navigation. */
import { PageShell } from "@/app/components/SiteChrome";
import { StructuredData } from "@/app/components/StructuredData";
import { createPageMetadata, absoluteUrl } from "@/lib/seo";
import "./repair-assistance.css";

const path = "/well-records/repair-assistance-before-work";
const title = "Texas Well Repair Assistance: Check Before Work Starts";
const description = "Well repair help in Bastrop, Lee, Milam or Burleson County? Check approval, payment rules and official forms before work starts.";
export const metadata = createPageMetadata({ title, description, path });

export default function RepairAssistanceGuide() {
  return <PageShell><article className="repair-guide wrap">
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/well-records">Well records</a> / Repair assistance</nav>
    <header><p className="eyebrow">Before authorizing work</p><h1>Before paying for a well repair, check the assistance rules</h1><p className="repair-lede">For well owners in Bastrop, Lee, Milam and Burleson counties.</p><p>Published by Texas Water Sources. Sources checked <time dateTime="2026-10-20">October 20, 2026 UTC</time> (October 19 in Texas). This is a dated source check, not a live funding guarantee.</p></header>
    <p>If you hope to use groundwater-district assistance, contact the district before authorizing corrective work. Lost Pines describes reimbursement after approved work; Post Oak Savannah pays its approved contractor. Neither program is a general repair warranty. Diagnostic expenses can work differently, so ask about those before spending, too.</p>
    <div className="repair-compare"><table><caption>Start with your district and confirm payment before work</caption><thead><tr><th scope="col">Counties</th><th scope="col">District</th><th scope="col">Published payment pathway</th></tr></thead><tbody><tr><th scope="row">Bastrop, Lee</th><td><a href="#lost-pines">Lost Pines</a></td><td>Approval, work, owner payment, invoice, reimbursement</td></tr><tr><th scope="row">Milam, Burleson</th><td><a href="#post-oak">Post Oak Savannah</a></td><td>Pre-approval and signed work order; district pays approved contractor after completion</td></tr></tbody></table></div>
    <section id="lost-pines"><h2>Bastrop and Lee counties: Lost Pines</h2>
      <p>Lost Pines’ <a href="https://lostpineswater.org/223/Groundwater-Mitigation-Program">Groundwater Mitigation Program</a> tells owners to obtain approval before repairs or new drilling. Its published sequence is approval, work, owner payment, final invoice, then reimbursement.</p>
      <p>The <a href="https://lostpineswater.org/DocumentCenter/View/364">rules revised February 25, 2026</a> list eligible formations as Sparta, Queen City, Calvert Bluff, Hooper, Simsboro and Carrizo. Among other requirements, the well must be an exempt domestic/livestock well, installed before January 1, 2024, registered, and available for district monitoring. The district must link the decline to groundwater production, rather than drought or precipitation changes. See physical PDF pages 5–6.</p>
      <p>Start with the Grant Request Form in Appendix B, physical PDF page 17. An unregistered well needs Form 300, available through <a href="https://lostpineswater.org/101/Forms-Documents">district forms</a>. Coordinate the assessment and estimate with staff and your licensed contractor.</p>
      <p>Ask specifically about diagnostic charges: owners initially pay, and the rules say those costs are not covered if the well fails to qualify (physical PDF page 8). The signed mitigation agreement identifies covered work and costs. Sales tax, warranties, well houses and most above-ground costs are excluded (physical PDF pages 10–11).</p>
      <p>Contact: <a href="tel:+15123605088">512-360-5088</a> or <a href="mailto:lpgcd@lostpineswater.org">lpgcd@lostpineswater.org</a>.</p>
    </section>
    <section id="post-oak"><h2>Milam and Burleson counties: Post Oak Savannah</h2>
      <p>The <a href="https://www.posgcd.org/groundwater-well-assistance-program-gwap">Groundwater Well Assistance Program</a> supports qualifying wells affected by regional groundwater production. Eligible well types include registered exempt domestic/livestock wells and permitted non-exempt wells producing less than 50 gallons per minute. Monitoring access and owner consent are required.</p>
      <p>The <a href="https://www.posgcd.org/files/8b4d063fe/GWAP-Amended5-11-211.pdf">linked policies, amended May 11, 2021</a>, exclude Trinity, Yegua-Jackson, river-alluvial and terraced formations. Problems attributed to equipment age, neglect or the well’s own pumping effects do not qualify. See physical PDF page 6.</p>
      <p>Use the Well Assistance Request Form in Appendix A, physical PDF page 9. Requests require district pre-approval, an approved contractor and a signed work order before work. The district releases committed funds to the contractor after completion, rather than describing an owner-pay-first reimbursement process. For emergencies, the policy permits district verbal approval to an approved contractor; it does not authorize owners to start independently and assume payment (physical PDF page 7).</p>
      <p>The website’s “Application for Assistance” link currently opens a <a href="https://www.posgcd.org/files/af5b7fbc4/GWAP-Letter-Of-Agreement.pdf">monitoring agreement</a>. Ask staff which documents they need.</p>
      <p>Contact Gregory Perry, Water Resources Specialist: <a href="tel:+15124559900">512-455-9900</a> or <a href="mailto:gperry@posgcd.org">gperry@posgcd.org</a>.</p>
    </section>
    <section><h2>Before agreeing to work</h2><ol>
      <li>Find your registration number and <a href="/well-records">well report</a>, if available. Ask staff how to proceed if records are missing.</li>
      <li>Ask: “What must you approve before diagnostics or repairs? Who pays initially? Which costs would remain mine?”</li>
      <li>Request the approved scope, contractor requirements and payment process in writing. Keep estimates and invoices.</li>
      <li>Outside these counties? <a href="/groundwater-districts">Find your groundwater district</a> and ask whether it offers assistance. These programs are not statewide.</li>
    </ol></section>
    <aside className="repair-caution" aria-labelledby="source-caution"><h2 id="source-caution">Source differences to confirm</h2><p>Lost Pines’ webpage lists fewer formations than its revised rules. Post Oak’s policies and <a href="https://www.posgcd.org/files/79a16c745/2022-12-30%2BDrillers%2BGuidance%2BDocument.pdf">driller guidance</a> give different new-well design cutoff dates: January 1, 2022 versus January 1, 2023. Have staff confirm the requirements for your well.</p><p>If work has already happened, ask staff to review your specific dates and circumstances. Lost Pines’ rules include a narrow historical provision; this guide does not decide whether it applies.</p></aside>
    <p><strong>This guide does not establish eligibility, available funding, reimbursement or the cause of a particular well problem.</strong> District review and the complete program terms control. A nearby permit does not prove that a particular well will fail.</p>
    <p><a href="/well-records">Find and compare official well records</a> · <a href="/about/corrections">Report a source change or correction</a></p>
    <StructuredData data={{ "@context": "https://schema.org", "@type": "Article", headline: title, description, url: absoluteUrl(path), datePublished: "2026-10-20", dateModified: "2026-10-20", author: { "@type": "Organization", name: "Texas Water Sources", url: absoluteUrl("/about") } }} />
  </article></PageShell>;
}
