import { SourceCategoryLanding, createSourceCategoryMetadata } from "@/app/components/SourceCategoryLanding";

export const metadata = createSourceCategoryMetadata("well-reports");

export default function WellReportSourcesPage() {
  return <SourceCategoryLanding slug="well-reports" />;
}
