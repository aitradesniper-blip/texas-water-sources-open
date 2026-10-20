import { WellRecordsIntentRouter } from "@/app/well-records/WellRecordsIntentRouter";
export default function Demo(){return <main className="wrap" style={{paddingBlock:40,maxWidth:1000}}>
<p className="eyebrow">MIT-licensed frontend starter</p><h1>Find the right Texas well-record pathway</h1>
<p>This local example reuses the live site's research router. It sends no lookup requests and loads no analytics service. Address searches below open the live service. Nearby records remain research leads.</p>
<WellRecordsIntentRouter siteOrigin="https://texaswatersources.com" />
<section id="which-system" style={{paddingBlock:30}}><h2>Compare the official record systems</h2>
<p>Start with the approximate drilling year, county, historical owner and any tracking or state well number. An uncertain date can require more than one search.</p>
<ul><li><a href="https://www.twdb.texas.gov/groundwater/data/locwwrep.asp">TWDB instructions for finding water-well reports</a>: electronic reports, historical paper reports and transition-period searches.</li><li><a href="https://www.twdb.texas.gov/groundwater/data/index.asp">TWDB groundwater data</a>: selected groundwater inventory, water-level and construction records.</li></ul>
<p>A report location does not establish ownership, parcel association, current yield or water quality. Keep conflicting identifiers and missing results unresolved.</p></section>
<section><h2>Before paying for a repair</h2><p>In Bastrop, Lee, Milam or Burleson County, check district pre-approval, contractor rules and who pays initially before work starts.</p><a href="https://texaswatersources.com/well-records/repair-assistance-before-work">Read the source-linked repair assistance guide</a></section>
<p style={{marginTop:40}}><a href="https://github.com/aitradesniper-blip/texas-water-sources-open">Project source</a> · <a href="https://texaswatersources.com/well-records">Complete well-record guide</a></p>
</main>}
