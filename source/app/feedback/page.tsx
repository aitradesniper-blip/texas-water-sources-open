import { PageShell } from "@/app/components/SiteChrome";
import { validateFeedbackFormEndpoint } from "@/lib/feedback-form-config";
import { createPageMetadata } from "@/lib/seo";
import { FeedbackForm } from "./FeedbackForm";

export const metadata = createPageMetadata({
  title: "Property Report Feedback",
  description: "Share limited, optional feedback about the free Texas Property Water Report without submitting property or report data.",
  path: "/feedback",
});

export default function FeedbackPage() {
  const endpoint = validateFeedbackFormEndpoint(process.env.NEXT_PUBLIC_TWS_FEEDBACK_FORM_ENDPOINT, {
    required: process.env.NODE_ENV === "production",
  });
  return (
    <PageShell>
      <div className="prose-page feedback-page wrap">
        <p className="eyebrow">Optional feedback</p>
        <h1>Tell us what helped and what was missing.</h1>
        <p className="lead">Your feedback helps improve wording, source links, and the usefulness of the free report. Do not submit property-specific or sensitive information.</p>
        <FeedbackForm endpoint={endpoint} />
      </div>
    </PageShell>
  );
}
