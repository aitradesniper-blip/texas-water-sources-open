import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { focusedResearchToolDestinationsByTool, noDataAnalyticsEvents } from "@/lib/analytics-events";

export const GA4_MEASUREMENT_ID = "G-PKDYE1WE4V";

const analyticsPrivacyGuard = `
(function () {
  var noDataEventNames = new Set(${JSON.stringify(noDataAnalyticsEvents)});
  var focusedToolDestinationsByTool = ${JSON.stringify(focusedResearchToolDestinationsByTool)};
  window.__twsInitialLocationSearch = window.location.search;
  if (window.location.search) {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.hash
    );
  }

  function sanitizedUrl(value) {
    if (!value) return "";
    try {
      var url = new URL(value, window.location.origin);
      return url.origin + url.pathname;
    } catch (error) {
      return "";
    }
  }

  var dataLayer = window.dataLayer = window.dataLayer || [];
  var push = dataLayer.push.bind(dataLayer);

  dataLayer.push = function () {
    for (var index = 0; index < arguments.length; index += 1) {
      var command = arguments[index];
      if (!command || typeof command.length !== "number") continue;

      var isConfig = command[0] === "config";
      var isPageView = command[0] === "event" && command[1] === "page_view";
      var isNoDataEvent = command[0] === "event" && noDataEventNames.has(command[1]);
      var isFocusedToolEvent = command[0] === "event" && command[1] === "focused_tool_card_clicked";
      if (!isConfig && !isPageView && !isNoDataEvent) continue;

      var fields = command[2];
      if (!fields || typeof fields !== "object") fields = {};
      var permittedFields = isNoDataEvent ? {} : fields;
      if (
        isFocusedToolEvent &&
        typeof fields.tool === "string" &&
        focusedToolDestinationsByTool[fields.tool] === fields.destination
      ) {
        permittedFields = { tool: fields.tool, destination: fields.destination };
      }
      command[2] = Object.assign({}, permittedFields, {
        page_location: sanitizedUrl(window.location.href),
        page_referrer: sanitizedUrl(document.referrer),
      });
    }

    return push.apply(dataLayer, arguments);
  };
})();`;

export function SiteAnalytics() {
  return (
    <>
      <Script id="ga4-privacy-guard" strategy="beforeInteractive">
        {analyticsPrivacyGuard}
      </Script>
      <GoogleAnalytics gaId={GA4_MEASUREMENT_ID} />
    </>
  );
}
