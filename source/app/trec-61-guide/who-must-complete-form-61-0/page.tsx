import { TrecApplicabilityGuide } from "@/app/components/TrecApplicabilityGuide";
import {
  trecApplicabilityEditorial,
  trecApplicabilityMetadataTitle,
  trecApplicabilityPath,
} from "@/lib/trec-applicability";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: trecApplicabilityMetadataTitle,
  description: trecApplicabilityEditorial.description,
  path: trecApplicabilityPath,
});

export default function TrecApplicabilityPage() {
  return <TrecApplicabilityGuide />;
}
