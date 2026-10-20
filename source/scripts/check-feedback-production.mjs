import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateFeedbackFormEndpoint } from "../lib/feedback-form-config.ts";

export const FEEDBACK_FORM_FIELDS = [
  "_gotcha",
  "category",
  "message",
  "privacy_acknowledgement",
  "reply_email",
  "usefulness",
];

const NONPRODUCTION_FORM_ID_MARKERS = [
  "test",
  "fixture",
  "example",
  "placeholder",
];

export function validateProductionFeedbackEndpoint(rawValue) {
  const endpoint = validateFeedbackFormEndpoint(rawValue, { required: true });
  const formId = new URL(endpoint).pathname.slice("/f/".length).toLowerCase();
  if (NONPRODUCTION_FORM_ID_MARKERS.some((marker) => formId.includes(marker))) {
    throw new Error("NEXT_PUBLIC_TWS_FEEDBACK_FORM_ENDPOINT contains an obvious nonproduction form ID.");
  }
  return endpoint;
}

function extractFeedbackFieldNames(html) {
  return [...html.matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([^"]+)"/g)]
    .map((match) => match[1]);
}

export async function checkFeedbackProduction({ artifactRoot, configuredEndpoint } = {}) {
  const root = resolve(
    artifactRoot ?? resolve(dirname(fileURLToPath(import.meta.url)), "../dist/client"),
  );
  const endpoint = validateProductionFeedbackEndpoint(configuredEndpoint);
  const feedbackPath = resolve(root, "feedback.html");

  let feedbackHtml;
  try {
    feedbackHtml = await readFile(feedbackPath, "utf8");
  } catch (error) {
    throw new Error(`Generated feedback HTML is missing: ${feedbackPath}`, { cause: error });
  }

  if (!feedbackHtml.includes(endpoint)) {
    throw new Error("Generated feedback page does not contain the configured production Formspree endpoint.");
  }
  if (!/class="[^"]*\bfeedback-form\b[^"]*"/.test(feedbackHtml)) {
    throw new Error("Generated feedback page does not contain the feedback form.");
  }

  const fieldNames = [...new Set(extractFeedbackFieldNames(feedbackHtml))].sort();
  if (JSON.stringify(fieldNames) !== JSON.stringify(FEEDBACK_FORM_FIELDS)) {
    throw new Error(
      `Generated feedback form fields must exactly match the approved privacy-safe set: ${FEEDBACK_FORM_FIELDS.join(", ")}.`,
    );
  }

  return { artifactRoot: root, endpoint, feedbackPath, fieldNames };
}

const invokedAsScript = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (invokedAsScript) {
  try {
    const result = await checkFeedbackProduction({
      configuredEndpoint: process.env.NEXT_PUBLIC_TWS_FEEDBACK_FORM_ENDPOINT,
    });
    console.log(
      `PASS Feedback production connection: ${result.endpoint} (${result.fieldNames.length} approved fields)`,
    );
  } catch (error) {
    console.error(`FAIL Feedback production connection: ${error.message}`);
    process.exitCode = 1;
  }
}
