import { SourceCategoryLanding, createSourceCategoryMetadata } from "@/app/components/SourceCategoryLanding";

export const metadata = createSourceCategoryMetadata("property-orientation");

export default function PropertyOrientationSourcesPage() {
  return <SourceCategoryLanding slug="property-orientation" />;
}
