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
}];
export const briefings = validateBriefings(verifiedBriefings);
