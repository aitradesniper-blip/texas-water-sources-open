"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CopyEmailButton } from "@/app/components/CopyEmailButton";
import { trackFeedbackEvent } from "@/lib/analytics-events";

const infoEmail = "info@texaswatersources.com";
const allowedFields = new Set(["usefulness", "category", "message", "privacy_acknowledgement", "reply_email", "_gotcha"]);

type Errors = Partial<Record<"usefulness" | "category" | "message" | "privacy", string>>;

export function FeedbackForm({ endpoint }: { endpoint: string }) {
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failure, setFailure] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(errors).length) errorSummaryRef.current?.focus();
  }, [errors]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Errors = {};
    if (!data.get("usefulness")) nextErrors.usefulness = "Choose how useful the report was.";
    if (!data.get("category")) nextErrors.category = "Choose a feedback category.";
    if (!String(data.get("message") ?? "").trim()) nextErrors.message = "Describe what was useful or what was missing.";
    if (data.get("privacy_acknowledgement") !== "acknowledged") nextErrors.privacy = "Confirm the privacy acknowledgement.";
    setErrors(nextErrors);
    setFailure("");
    if (Object.keys(nextErrors).length) return;

    for (const key of data.keys()) {
      if (!allowedFields.has(key)) {
        setFailure("The feedback form contains an unexpected field. Nothing was submitted.");
        return;
      }
    }
    if (!endpoint) {
      setFailure("Feedback submission is temporarily unavailable.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      if (!response.ok) throw new Error("submission failed");
      form.reset();
      setSubmitted(true);
      trackFeedbackEvent("feedback_submitted");
    } catch {
      setFailure("We could not send your feedback. You can copy the address below and send it from any email service.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return <section className="feedback-success" role="status" aria-live="polite"><p className="eyebrow">Feedback received</p><h2>Thank you for helping improve the report.</h2><p>Your optional feedback was submitted without automatically including a property address or report result.</p><Link className="button primary" href="/property-water-report">Return to the free property report</Link></section>;
  }

  return (
    <form className="feedback-form" onSubmit={submit} noValidate aria-busy={busy}>
      {Object.keys(errors).length ? (
        <div className="feedback-failure feedback-error-summary" role="alert" aria-live="assertive" tabIndex={-1} ref={errorSummaryRef}>
          <strong>Check the required fields.</strong>
          <p>Choose an answer and category, enter feedback, and confirm the privacy acknowledgement.</p>
        </div>
      ) : null}

      <fieldset aria-invalid={Boolean(errors.usefulness)} aria-describedby={errors.usefulness ? "usefulness-error" : undefined}>
        <legend>Was the report useful?</legend>
          <div className="feedback-choice-row">
            {[{ value: "yes", label: "Yes" }, { value: "partly", label: "Partly" }, { value: "not_yet", label: "Not yet" }].map((option) => (
            <label key={option.value}>
              {/* Required on each option so assistive technology receives the shared group error. */}
              {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
              <input type="radio" name="usefulness" value={option.value} required aria-invalid={Boolean(errors.usefulness)} aria-describedby={errors.usefulness ? "usefulness-error" : undefined} />
              <span>{option.label}</span>
            </label>
            ))}
        </div>
        {errors.usefulness ? <p className="field-error" id="usefulness-error">{errors.usefulness}</p> : null}
      </fieldset>

      <label className="feedback-field">
        <span>Feedback category</span>
        <select name="category" required aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "category-error" : undefined} defaultValue="">
          <option value="" disabled>Choose one</option>
          <option value="useful_result">Useful result</option>
          <option value="confusing_wording">Confusing wording</option>
          <option value="missing_source">Missing source</option>
          <option value="broken_official_link">Broken official link</option>
          <option value="incorrect_information">Incorrect information</option>
          <option value="feature_request">Feature request</option>
          <option value="other">Other</option>
        </select>
        {errors.category ? <span className="field-error" id="category-error">{errors.category}</span> : null}
      </label>

      <label className="feedback-field">
        <span>Feedback message</span>
        <textarea name="message" rows={7} minLength={5} maxLength={2000} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "feedback-message-help feedback-message-error" : "feedback-message-help"} />
        <small id="feedback-message-help">Describe the tool or source issue without entering a property address, coordinates, seller answers, lookup identifiers, credentials, or payment information.</small>
        {errors.message ? <span className="field-error" id="feedback-message-error">{errors.message}</span> : null}
      </label>

      <label className="feedback-field">
        <span>Reply email <small>(optional)</small></span>
        <input name="reply_email" type="email" autoComplete="email" maxLength={254} />
      </label>

      <label className="feedback-privacy-check">
        <input type="checkbox" name="privacy_acknowledgement" value="acknowledged" required aria-invalid={Boolean(errors.privacy)} aria-describedby={errors.privacy ? "privacy-error" : undefined} />
        <span>I understand feedback is optional, Formspree processes the fields I submit, and no property address or report result is added automatically.</span>
      </label>
      {errors.privacy ? <p className="field-error" id="privacy-error">{errors.privacy}</p> : null}

      <label className="feedback-honeypot" aria-hidden="true">Leave this field empty<input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" /></label>

      <div className="feedback-submit-row">
        <button className="button primary" type="submit" disabled={busy}>{busy ? "Sending feedback…" : "Submit feedback"}</button>
        <p>Read the <Link href="/privacy">privacy notice</Link> before submitting.</p>
      </div>

      {failure ? <div className="feedback-failure" role="alert"><strong>Feedback was not sent.</strong><p>{failure}</p><span className="contact-email">{infoEmail}</span><CopyEmailButton email={infoEmail} /></div> : null}
    </form>
  );
}
