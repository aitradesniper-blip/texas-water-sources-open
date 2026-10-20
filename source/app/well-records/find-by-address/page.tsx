import type { Metadata } from "next";
import { SupportingGuidePage } from "@/app/components/SupportingGuidePage";
import { validateFreePropertyWaterApiOrigin } from "@/lib/free-property-water-production-config";
import { createPageMetadata } from "@/lib/seo";
import { getSupportingGuide } from "@/lib/supporting-guides";
import WellReportAddressLookup from "./WellReportAddressLookup";
import "./well-report-lookup.css";

const guide = getSupportingGuide("find-well-by-address");

export const metadata: Metadata = createPageMetadata({
  title: guide.content.title,
  description: guide.content.description,
  path: guide.path,
});

export default function Page() {
  const apiBaseUrl = validateFreePropertyWaterApiOrigin(
    process.env.NEXT_PUBLIC_TWS_FREE_LOOKUP_API_URL,
  );
  return <SupportingGuidePage guide={guide} leadContent={<WellReportAddressLookup apiBaseUrl={apiBaseUrl} />} />;
}
