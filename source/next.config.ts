import type { NextConfig } from "next";
import { validateFreePropertyWaterApiOrigin } from "./lib/free-property-water-production-config";
import { validateFeedbackFormEndpoint } from "./lib/feedback-form-config";

validateFreePropertyWaterApiOrigin(process.env.NEXT_PUBLIC_TWS_FREE_LOOKUP_API_URL);
validateFeedbackFormEndpoint(process.env.NEXT_PUBLIC_TWS_FEEDBACK_FORM_ENDPOINT, {
  required: process.env.NODE_ENV === "production",
});

const nextConfig: NextConfig = {
  output: "export",
  experimental: { cpus: 2 },
};

export default nextConfig;
