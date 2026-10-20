export const wellLookupAnalyticsEvents = [
  "well_lookup_started",
  "well_lookup_candidates_loaded",
  "well_lookup_completed",
  "official_well_report_opened",
  "full_report_cta_clicked",
] as const;

export type WellLookupAnalyticsEvent = (typeof wellLookupAnalyticsEvents)[number];

export const waterRightsCompanionAnalyticsEvents = [
  "water_rights_lookup_started",
  "water_rights_lookup_candidates_loaded",
  "water_rights_lookup_completed",
  "official_water_rights_viewer_opened",
  "full_report_cta_clicked",
] as const;

export type WaterRightsCompanionAnalyticsEvent = (typeof waterRightsCompanionAnalyticsEvents)[number];

export const focusedResearchToolDestinationsByTool = {
  trec_form_61_0: "/trec-61-guide",
  well_report_address_lookup: "/well-records/find-by-address",
  water_rights_viewer_companion: "/surface-water-rights/water-rights-viewer",
} as const;

export type FocusedResearchToolId = keyof typeof focusedResearchToolDestinationsByTool;
export type FocusedResearchToolDestination = (typeof focusedResearchToolDestinationsByTool)[FocusedResearchToolId];

export const researchToolDiscoveryAnalyticsEvents = ["focused_tool_card_clicked"] as const;
export type ResearchToolDiscoveryAnalyticsEvent = (typeof researchToolDiscoveryAnalyticsEvents)[number];

export const wellRecordsRouterAnalyticsEvents = [
  "well_records_address_lookup_click",
  "well_records_property_report_click",
] as const;

export type WellRecordsRouterAnalyticsEvent = (typeof wellRecordsRouterAnalyticsEvents)[number];

export const propertyWaterReportAnalyticsEvents = [
  "property_water_report_started",
  "property_water_report_completed",
] as const;

export type PropertyWaterReportAnalyticsEvent = (typeof propertyWaterReportAnalyticsEvents)[number];

export const feedbackAnalyticsEvents = ["feedback_submitted"] as const;
export type FeedbackAnalyticsEvent = (typeof feedbackAnalyticsEvents)[number];

export const waterWatchAnalyticsEvents = [
  "water_watch_page_view",
  "water_watch_engaged",
  "water_watch_district_filter_used",
  "water_watch_activity_filter_used",
  "water_watch_layer_changed",
  "water_watch_official_source_opened",
  "water_watch_property_report_clicked",
  "district_water_watch_clicked",
] as const;

export type WaterWatchAnalyticsEvent = (typeof waterWatchAnalyticsEvents)[number];

export const gcdDirectoryAnalyticsEvents = [
  "gcd_directory_page_view",
  "gcd_directory_engaged",
  "gcd_directory_search_used",
  "gcd_directory_filter_used",
  "gcd_directory_official_source_opened",
  "gcd_directory_detail_opened",
  "gcd_directory_water_watch_opened",
] as const;

export type GcdDirectoryAnalyticsEvent = (typeof gcdDirectoryAnalyticsEvents)[number];

export const updatesAnalyticsEvents = ["updates_briefing_opened", "updates_source_opened", "updates_feed_opened"] as const;
export type UpdatesAnalyticsEvent = (typeof updatesAnalyticsEvents)[number];

export const noDataAnalyticsEvents = [
  ...updatesAnalyticsEvents,
  ...wellLookupAnalyticsEvents,
  ...waterRightsCompanionAnalyticsEvents,
  ...researchToolDiscoveryAnalyticsEvents,
  ...wellRecordsRouterAnalyticsEvents,
  ...propertyWaterReportAnalyticsEvents,
  ...feedbackAnalyticsEvents,
  ...waterWatchAnalyticsEvents,
  ...gcdDirectoryAnalyticsEvents,
] as const;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
};

type NoDataAnalyticsEvent =
  | UpdatesAnalyticsEvent
  | WellLookupAnalyticsEvent
  | WaterRightsCompanionAnalyticsEvent
  | ResearchToolDiscoveryAnalyticsEvent
  | WellRecordsRouterAnalyticsEvent
  | PropertyWaterReportAnalyticsEvent
  | FeedbackAnalyticsEvent
  | WaterWatchAnalyticsEvent
  | GcdDirectoryAnalyticsEvent;

function trackNoDataEvent(eventName: NoDataAnalyticsEvent, fields?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer ??= [];
  analyticsWindow.dataLayer.push(fields ? ["event", eventName, fields] : ["event", eventName]);
}

export function trackWellLookupEvent(eventName: WellLookupAnalyticsEvent): void {
  trackNoDataEvent(eventName);
}

export function trackWaterRightsCompanionEvent(eventName: WaterRightsCompanionAnalyticsEvent): void {
  trackNoDataEvent(eventName);
}

export function trackFocusedResearchToolCardClick(
  tool: FocusedResearchToolId,
  destination: FocusedResearchToolDestination,
): void {
  if (focusedResearchToolDestinationsByTool[tool] !== destination) return;
  trackNoDataEvent("focused_tool_card_clicked", { tool, destination });
}

export function trackWellRecordsRouterEvent(eventName: WellRecordsRouterAnalyticsEvent): void {
  trackNoDataEvent(eventName);
}

export function trackPropertyWaterReportEvent(eventName: PropertyWaterReportAnalyticsEvent): void {
  trackNoDataEvent(eventName);
}

export function trackFeedbackEvent(eventName: FeedbackAnalyticsEvent): void {
  trackNoDataEvent(eventName);
}

export function trackWaterWatchEvent(eventName: WaterWatchAnalyticsEvent): void {
  trackNoDataEvent(eventName);
}

export function trackGcdDirectoryEvent(eventName: GcdDirectoryAnalyticsEvent): void {
  trackNoDataEvent(eventName);
}

let waterWatchPageViewRecorded = false;
let waterWatchEngagementRecorded = false;
let gcdDirectoryPageViewRecorded = false;
let gcdDirectoryEngagementRecorded = false;

export function trackWaterWatchPageView(): void {
  if (waterWatchPageViewRecorded) return;
  waterWatchPageViewRecorded = true;
  trackWaterWatchEvent("water_watch_page_view");
}

export function trackWaterWatchEngagement(): void {
  if (waterWatchEngagementRecorded) return;
  waterWatchEngagementRecorded = true;
  trackWaterWatchEvent("water_watch_engaged");
}

export function trackGcdDirectoryPageView(): void {
  if (gcdDirectoryPageViewRecorded) return;
  gcdDirectoryPageViewRecorded = true;
  trackGcdDirectoryEvent("gcd_directory_page_view");
}

export function trackGcdDirectoryEngagement(): void {
  if (gcdDirectoryEngagementRecorded) return;
  gcdDirectoryEngagementRecorded = true;
  trackGcdDirectoryEvent("gcd_directory_engaged");
}

export function trackUpdatesEvent(eventName: UpdatesAnalyticsEvent): void {
  trackNoDataEvent(eventName);
}
