import { validateBriefings, type Briefing } from "./updates";

// Only verified, original editorial briefings belong here. No raw source documents.
// The publication guard deliberately prevents an empty section from being built.
const verifiedBriefings: Briefing[] = [{
  slug: "2026-10-20-texas-water-decisions",
  title: "Texas water decisions: Trinity rules, Burnet next steps and October deadlines",
  summary: "What changed, who it matters to, and what to check before the next decision. Selected groundwater-district records, with adopted rules, a contested case and pending decisions kept distinct.",
  publishedAt: "2026-10-20T05:03:01Z",
  checkedOn: "2026-10-20",
  checkNote: "This edition’s source checks span late October 19 into early October 20, Central time.",
  items: [
    {
      id: "barton-springs-edwards-trinity-rules",
      place: "Barton Springs–Edwards district",
      title: "New Trinity permitting framework is adopted, not merely proposed",
      mattersTo: "Anyone planning a new nonexempt Trinity well or seeking more production inside the Barton Springs–Edwards Aquifer Conservation District.",
      changed: "The board adopted amendments October 16, effective that day. The resolution distinguishes qualifying historical production from new conditional permits. Conditional Trinity production has initial annual acreage-based ceilings of 10,000 gallons per acre in the Middle and Lower Trinity zones and 5,000 in the Upper Trinity. The calculation uses contiguous controlled acreage and accounts for production under other permits and exempt wells tied to that acreage and zone. These are ceilings, not an entitlement. New nonexempt Upper Trinity wells are limited to domestic or livestock use.",
      status: "Adopted and effective October 16, 2026.",
      nextAction: "Before relying on older rules, confirm your management zone, application status and qualifying acreage with the district. Trinity permit holders must notify the district within 30 days after a reduction in contiguous controlled acreage and apply for an amendment if the reduction causes an overage. Qualifying historical production refers to approval before October 16 or applications administratively complete before that date, not all existing wells.",
      sourceDate: "October 16, 2026 adoption and effective date.",
      sources: [
        { title: "District notice of Resolution and Order No. 101626", url: "https://bseacd.org/2026/10/notice-of-resolution-and-order-no-101626/" },
        { title: "Signed resolution: adoption and effective date", url: "https://bseacd.org/uploads/Resolution-101626-1.pdf#page=9", locator: "Physical PDF page 9" },
        { title: "Resolution: conditional Trinity production and acreage rules", url: "https://bseacd.org/uploads/Resolution-101626-1.pdf#page=3", locator: "Physical PDF pages 3–4" },
        { title: "Resolution: notice and amendment after reduced controlled acreage", url: "https://bseacd.org/uploads/Resolution-101626-1.pdf#page=4", locator: "Physical PDF page 4" },
        { title: "District governing documents", url: "https://bseacd.org/governingdocuments/" },
      ],
      unknowns: ["The nine-page resolution refers to rule attachments that are not included in that PDF. The governing-documents page still linked the August 2025 compilation when checked; do not treat that older compilation as the complete current rulebook.", "The resolution does not determine eligibility, an allocation or effects for a particular well."],
    },
    {
      id: "burnet-asphalt-contested-case",
      place: "Burnet County · Central Texas GCD",
      title: "Quarry groundwater case becomes contested; pumping permit not decided",
      mattersTo: "Well owners following Asphalt Inc.’s application OP-26081401 and people tracking the case’s hearing process.",
      changed: "At the October 14 preliminary hearing, the presiding officer found Save Burnet Water Alliance’s request qualified and declared the application contested. Asphalt’s counsel requested State Office of Administrative Hearings (SOAH) proceedings, and the Board passed a motion accepting the referral request. The district did not approve or deny the requested pumping at that hearing.",
      status: "Contested case; Board approved the referral request October 14.",
      nextAction: "Follow the official application page for formal notices of time and place. The October 7 filing deadline and October 14 hearing are past events, not new opportunities. A public comment is not the same as party status. The October 20 regular board agenda does not name a resumed Asphalt hearing or permit decision; do not treat it as this case’s next hearing date.",
      sourceDate: "October 14, 2026 preliminary hearing.",
      sources: [
        { title: "Official district-linked hearing recording: contested-case determination", url: "https://www.youtube.com/watch?v=QUZF8A2up-c&t=1944s", locator: "32:24–33:08" },
        { title: "Official district-linked hearing recording: referral vote", url: "https://www.youtube.com/watch?v=QUZF8A2up-c&t=2138s", locator: "35:38–35:55" },
        { title: "District’s Asphalt Inc. application and notices page", url: "https://centraltexasgcd.org/asphalt-inc-permit-application/" },
        { title: "October 20 regular board agenda", url: "https://bunny-wp-pullzone-r1n9s3hmuv.b-cdn.net/wp-content/uploads/2026/10/Meeting-Notice-Agenda-10-20-26.pdf" },
      ],
      unknowns: ["The remaining timely requesters’ party-status questions are to be considered in the SOAH process. No new hearing date or SOAH docket number was verified.", "The referral vote does not establish that contracting, payment or docket assignment is complete, nor does it establish a permit outcome or effects on neighboring wells."],
    },
    {
      id: "kimble-south-llano-comments",
      place: "Kimble County · South Llano River State Park",
      title: "October 23 comment deadline for the park’s water request",
      mattersTo: "Kimble County well owners and readers following South Llano River State Park’s proposed public-water-supply production.",
      changed: "Texas Parks & Wildlife Department requests 8 acre-feet a year combined across two wells, not 8 acre-feet per well. The newly posted board agenda identifies the park and schedules possible permit action after the public hearing. This is a proposed authorization, not evidence that the permit has been granted or that this amount is being pumped.",
      status: "Pending permit request.",
      nextAction: "The notice gives close of business Friday, October 23, 2026 for written comments. Email kimblecountygcd@gmail.com or follow the notice’s hand-delivery/mail instructions. The hearing is Monday, October 26 at 6 p.m. Central time, at the district office, 731 Main Street, Suite B, Junction. Confirm current instructions with the district and ask for the underlying applications before making claims about effects.",
      sourceDate: "October 23, 2026 comment deadline; October 26, 2026 at 6 p.m. Central hearing.",
      sources: [
        { title: "Posted TPWD hearing notice and comment instructions", url: "https://kimblecountygcd.org/wp-content/uploads/2026/10/10.26.2026-posted-notice-tpwd.pdf#page=1", locator: "Physical PDF page 1" },
        { title: "October 26 posted agenda: park hearing and possible permit action", url: "https://kimblecountygcd.org/wp-content/uploads/2026/10/10.26.2026_posted-agenda-1.pdf#page=1", locator: "Physical PDF page 1, hearing item 2 and regular item 7" },
      ],
      unknowns: ["The notices do not establish existing pumping, the change from current use, effects on neighboring wells or river flow, the aquifer or whether the wells are new.", "Confirm the closing hour and whether your chosen delivery method meets the notice’s requirements with the district. One notice refers to two applications while the agenda uses the singular; the full applications are needed to resolve that wording."],
    },
    {
      id: "south-plains-aquifer-goals",
      place: "South Plains · Groundwater Management Area 2",
      title: "October 20 consideration of long-term aquifer decline goals",
      mattersTo: "People planning irrigated farming or future community water supplies in the South Plains who need to understand regional supply assumptions.",
      changed: "Groundwater Management Area 2 is scheduled to consider final desired future conditions and its explanatory report. The published proposal is a GMA-wide average drawdown of 23 feet from 2020 to 2080 for the Ogallala and Edwards-Trinity (High Plains) aquifers, and 22 feet for the Dockum. These are regional planning goals, not a prediction for an individual well or permission to pump a particular amount. The draft explains that TWDB uses adopted conditions to model available groundwater.",
      status: "Proposed conditions; adoption scheduled for consideration. No October 20 outcome claimed.",
      nextAction: "The agenda lists October 20, 2026 at 10 a.m. Central time, at Post Community Center, 129 West Main Street, Post. The formal spring comment period ended June 29; the October agenda separately includes public comment. Watch for the adopted resolution and final report before treating the proposal as a decision. If reading after the meeting, check the district for its outcome.",
      sourceDate: "October 20, 2026 at 10 a.m. Central scheduled meeting.",
      sources: [
        { title: "GMA 2 October agenda: desired future conditions and explanatory report", url: "https://gma2.hpwd.org/files/archives/2026/GMA2AgendaOct2026.pdf#page=1", locator: "Physical PDF page 1, items 4.3–4.7" },
        { title: "Draft 1 explanatory report", url: "https://gma2.hpwd.org/files/archives/2026/ExplanatoryReport.pdf#page=14", locator: "Printed pages 6 and 13; linked physical PDF page 14" },
        { title: "Notice of proposed desired future conditions", url: "https://gma2.hpwd.org/files/archives/2026/NoticeOfProposedDFCS.pdf" },
      ],
      unknowns: ["No adopted October 20 resolution, final report or meeting outcome is claimed in this edition. The explanatory report cited here is Draft 1.", "Regional average goals do not establish local well performance, individual pumping rights or effects at a particular property."],
    },
  ],
},
{
  "slug": "blanco-county-fees-november-2026",
  "title": "Blanco County well fees: what changes November 1, and who may qualify for a waiver",
  "summary": "The adopted fee schedule adds export rows and changes water-screening panels. An older well is not automatically subject to a new registration charge, and a separate permit-fee waiver has an April 2027 completeness deadline.",
  "publishedAt": "2026-10-20T06:31:07Z",
  "checkedOn": "2026-10-20",
  "items": [
    {
      "id": "blanco-fees-and-existing-wells",
      "place": "Blanco County",
      "title": "Will I owe a new fee for my existing well, and what will testing or a permit application cost?",
      "mattersTo": "Blanco-Pedernales Groundwater Conservation District well owners, permit applicants, groundwater exporters and residents choosing water-quality screening.",
      "changed": "The board adopted a revised FY 2026–2027 fee schedule October 15, effective November 1, 2026. It adds separate export-permit and exported-volume rows and replaces the earlier screening menu with combined panels. The schedule alone does not impose a new registration fee on every existing well.",
      "status": "Adopted October 15; the revised schedule takes effect November 1, 2026. A separate signed June 23 resolution establishes a conditional operating-permit application fee waiver for qualifying older nonexempt wells.",
      "nextAction": "Check the well’s drilling date, registration and permit status with the district before paying or filing. For a qualifying older nonexempt well, seek administrative completeness by April 16, 2027. Before taking a water sample, confirm the panel, collection instructions and applicable fee; ask which schedule governs an application already pending on November 1.",
      "details": [
        {
          "heading": "Export and application fees",
          "paragraphs": [
            "The revised schedule lists a $3,000 export-permit application fee and a separate $0.206 per 1,000 gallons exported, assessed monthly on actual exported volume. These are new rows in this schedule; this comparison does not establish that all export charging begins for the first time on November 1.",
            "The $500 registration row and $3,000 nonexempt well-permit row apply to wells drilled after February 11, 2002. The $3,000 permit-amendment application fee applies only to amendments requesting increased authorized annual production. These amounts were also in the prior schedule."
          ]
        },
        {
          "heading": "Choose the screening panel before collecting a sample",
          "paragraphs": [
            "The revised well-water menu lists coliform/E. coli-only screening at $30 in-county or $60 out-of-county. The combined well-water panel costs $50 or $100 respectively and includes bacteria, salinity and the listed chemistry measurements: pH, alkalinity, hardness, copper, nitrate, nitrite, iron measures and total dissolved solids.",
            "The revised treated-water panel costs $50 in-county or $100 out-of-county. Its listed measurements include pH, alkalinity, copper, total iron, chlorine measures, hardness, total dissolved solids and coliform/E. coli.",
            "The prior schedule offered separate chemistry and salinity tests and an all-three well-water package at $60 in-county or $100 out-of-county. Its treated-water panel listed different measurements, so the treated-water prices are not a like-for-like comparison. Screening is not a guarantee of water safety or a substitute for advice about a specific result."
          ]
        },
        {
          "heading": "Existing-well registration and the permit-fee waiver are separate",
          "paragraphs": [
            "District Rules 3.2 and 3.3 distinguish wells drilled on or before February 11, 2002 from wells drilled afterward. Registration for the older group is without charge; a new well must be registered before drilling and is subject to the applicable registration fee.",
            "Signed Resolution No. 20260623-2 separately waives the operating-permit application fee for a nonexempt well drilled on or before February 11, 2002 if its application is administratively complete on or before April 16, 2027. Submission alone is insufficient: the resolution requires the necessary documentation and preliminary review requirements to be satisfied.",
            "The waiver does not waive fees for new wells drilled after February 11, 2002, and it is not permanent. The resolution says an older well application not administratively complete by close of business April 16, 2027 is subject to the standard operating-permit application fee."
          ]
        }
      ],
      "sourceDate": "October 15, 2026 adoption; November 1, 2026 effective date; April 16, 2027 waiver deadline.",
      "sources": [
        {
          "title": "Revised FY 2026–2027 fee schedule",
          "url": "https://www.blancogroundwatertx.gov/files/5f7ccce29/Fee%2BSchedule%2BFY27-REVISED%2B20261015.pdf",
          "locator": "PDF pages 1–2: fees, screening panels, adoption and effective date"
        },
        {
          "title": "Prior FY 2026–2027 fee schedule",
          "url": "https://www.blancogroundwatertx.gov/files/c8908e66e/Fee%2BSchedule%2BFY27-ADOPTED%2B20260916.pdf",
          "locator": "PDF pages 1–2: comparison rows and earlier screening menu"
        },
        {
          "title": "District rules: well registration",
          "url": "https://www.blancogroundwatertx.gov/rules",
          "locator": "Rules 3.2 and 3.3"
        },
        {
          "title": "Signed operating-permit application fee-waiver resolution",
          "url": "https://www.blancogroundwatertx.gov/files/95d9e5ae7/SIGNED%2BRESOLUTION%2BNO.%2B20260623-2%2BESTABLISHING%2BA%2BWAIVER%2BOF%2BOPERATING%2BPERMIT%2BAPPLICATION%2BFEES.pdf",
          "locator": "Resolution No. 20260623-2, sections 1–3 and 5, PDF pages 1–3"
        }
      ],
      "unknowns": [
        "The revised schedule does not explain which fee applies to an application pending across November 1. Confirm the transition with district staff.",
        "These sources do not establish an individual well’s drilling date, exemption, permit status or eligibility for the waiver. They do not establish that a particular screening panel is sufficient for a specific household."
      ]
    }
  ]
},
{
  "slug": "northern-trinity-october-27-rule-hearing",
  "title": "Tarrant County well proposals: four paperwork changes to review before the October 27 hearing",
  "summary": "Northern Trinity proposes a lower hydrogeologic-report threshold, subdivision sequencing, a conditional utility audit requirement and driller information changes. The hearing is October 27 at 2 p.m.; these are proposed rules, not adopted requirements.",
  "publishedAt": "2026-10-20T06:31:08Z",
  "checkedOn": "2026-10-20",
  "items": [
    {
      "id": "northern-trinity-proposed-paperwork",
      "place": "Tarrant County / Northern Trinity district",
      "title": "Could a planned well, larger pumping request or subdivision need more paperwork before approval?",
      "mattersTo": "Water suppliers planning more groundwater production, groundwater-dependent subdivision developers, drillers and permit applicants in the Northern Trinity Groundwater Conservation District. Neighbors and other interested people may also comment.",
      "changed": "The October 27 rulemaking hearing concerns proposed changes to well and permit applications, hydrogeologic reports and other rules. Four selected changes below could affect project planning; none is described here as an adopted requirement.",
      "status": "Proposed, not adopted at the October 20 source check. The notice allows adoption at the end of the hearing or later, including changes based on comments without another notice.",
      "nextAction": "Review the redline sections relevant to your project and present verbal or written comments at the public hearing October 27, 2026, at 2 p.m. Central, at the district office, 1100 Circle Drive, Fort Worth, TX 76119. Call 817-249-2062 for hearing information; the notice asks for accommodation requests at least 24 hours in advance. Afterward, check for the adopted wording and effective date before relying on the proposal.",
      "details": [
        {
          "heading": "1. A lower threshold for a hydrogeologic report",
          "paragraphs": [
            "Proposed Rule 5.10 would lower the annual production threshold from 50,000,000 to 9,124,416 gallons for covered permit applications, including requests to increase production to that level. The redline also changes related aggregation language for multiple wells under common ownership or operation within one-quarter mile. This does not mean every private well would need a study; application type, exemptions, production and the multiwell provisions matter."
          ]
        },
        {
          "heading": "2. Subdivision plat approval before most well applications",
          "paragraphs": [
            "Proposed Rule 3.11 would generally prevent the district from accepting, reviewing or approving well registration or permit applications for a subdivision requiring groundwater availability certification until the plat is approved. It provides an exception for wells specifically needed to complete that certification study. Developers should check the sequence with the platting authority and district before planning the well application."
          ]
        },
        {
          "heading": "3. A water-loss audit for a defined utility expansion request",
          "paragraphs": [
            "Proposed Rule 5.3(a)(14) would require the most recently required water-loss audit when the applicant is a retail public utility already legally required to submit an annual audit to the Texas Water Development Board and seeks increased authorized annual groundwater production for an existing system through an operating permit or amendment. All of those conditions matter; this is not a general audit requirement for every well owner."
          ]
        },
        {
          "heading": "4. Identify the driller, or state that one has not been chosen",
          "paragraphs": [
            "The proposed application provisions call for the expected driller’s name and Texas license number, or a statement that the driller is not yet determined. Proposed Rule 3.12 covers new-well registration, changes of driller and the later-selection process; Rule 5.3(a)(11) adds driller information to permit applications. When an application is approved without a driller identified, the applicant would notify the district once one is selected, and the driller must sign and complete the applicable application information before drilling."
          ]
        },
        {
          "heading": "The hearing covers more than these four changes",
          "paragraphs": [
            "The notice also lists spacing, dewatering, metering, well systems, repeated production above permitted amounts and other enforcement and conforming amendments. Read the complete redline for your situation. A pumping request, permit approval and actual pumping remain different things; this proposal does not establish that a nearby well will fail."
          ]
        }
      ],
      "sourceDate": "October 27, 2026, 2 p.m. public rulemaking hearing.",
      "sources": [
        {
          "title": "Official October 27 rulemaking hearing notice",
          "url": "https://ntgcd.com/wp-content/uploads/2026/10/Notice-of-Public-Hearing-10-27-26.pdf",
          "locator": "PDF page 1: time, location, comment process and potential adoption"
        },
        {
          "title": "Proposed rules redline: subdivision and driller provisions",
          "url": "https://ntgcd.com/wp-content/uploads/2026/10/NTGCD-Rules-REDLINE.pdf#page=33",
          "locator": "Rules 3.11 and 3.12, printed pages 28–30 (PDF pages 33–35)"
        },
        {
          "title": "Proposed rules redline: permit application information and audit",
          "url": "https://ntgcd.com/wp-content/uploads/2026/10/NTGCD-Rules-REDLINE.pdf#page=41",
          "locator": "Rule 5.3(a)(11) and (14), printed pages 36–37 (PDF pages 41–42)"
        },
        {
          "title": "Proposed rules redline: hydrogeologic reports",
          "url": "https://ntgcd.com/wp-content/uploads/2026/10/NTGCD-Rules-REDLINE.pdf#page=49",
          "locator": "Rule 5.10, printed pages 44–45 (PDF pages 49–50)"
        },
        {
          "title": "Current rules amended November 19, 2025",
          "url": "https://ntgcd.com/wp-content/uploads/2025/11/NTGCD-Rules-Amended-November-19-2025-web.pdf",
          "locator": "Rule 5.10, printed pages 38–39 (PDF pages 43–44): existing 50-million-gallon threshold"
        }
      ],
      "unknowns": [
        "The sources checked do not establish final adopted wording, an effective date or a hearing outcome. The board may change the proposal after comments.",
        "These are selected changes, not a complete analysis of every proposed amendment or a determination of how the district would classify a particular project. No claim is made that the proposed activities are already prohibited."
      ]
    }
  ]
}];
export const briefings = validateBriefings(verifiedBriefings);
