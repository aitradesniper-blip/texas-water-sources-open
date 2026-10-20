import type { Metadata } from "next";
import { SupportingGuidePage } from "@/app/components/SupportingGuidePage";
import { createPageMetadata } from "@/lib/seo";
import { getSupportingGuide } from "@/lib/supporting-guides";

const guide = getSupportingGuide("pre-2003-well-records");

export const metadata: Metadata = createPageMetadata({
  title: guide.content.title,
  description: guide.content.description,
  path: guide.path,
});

export default function Page() {
  return <SupportingGuidePage guide={guide} />;
}
