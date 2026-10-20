import { SourceCategoryLanding, createSourceCategoryMetadata } from "@/app/components/SourceCategoryLanding";

export const metadata = createSourceCategoryMetadata("groundwater-observations");

export default function GroundwaterObservationSourcesPage() {
  return <SourceCategoryLanding slug="groundwater-observations" />;
}
