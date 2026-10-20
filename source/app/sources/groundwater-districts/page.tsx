import { SourceCategoryLanding, createSourceCategoryMetadata } from "@/app/components/SourceCategoryLanding";

export const metadata = createSourceCategoryMetadata("groundwater-districts");

export default function GroundwaterDistrictSourcesPage() {
  return <SourceCategoryLanding slug="groundwater-districts" />;
}
