import { createPageMetadata } from "@/lib/seo";
import { PageShell } from "../components/SiteChrome";

export const metadata = createPageMetadata({
  title: "Texas Water Sources Privacy Notice",
  description: "Learn how Texas Water Sources handles free lookup addresses, optional feedback, and browser-local guided research.",
  path: "/privacy",
});

export default function Page() {
  return (
    <PageShell>
      <section className="prose-page legal-page wrap">
        <p className="eyebrow">Privacy</p>
        <h1>Purpose-limited lookup. Local-first research tools.</h1>
        <p className="lead">
          No account is required. The free property-water lookup, optional feedback form, and guided research assistant handle data in different, clearly described ways.
        </p>

        <h2>Free property-water lookup</h2>
        <p>
          An address entered on the property-water-report page is sent to the configured lookup service solely to
          perform the requested address search and property-water screening. The service is designed not to retain
          addresses or coordinates, and the page does not put the address, selected candidate, or lookup result in
          browser storage, cookies, or URL query strings.
        </p>
        <p>
          No account is required, no seller response is selected or stored, and the free lookup does not create a
          customer case or reviewed report.
        </p>

        <h2>Optional feedback submission</h2>
        <p>
          Feedback is optional. Formspree processes only the fields a visitor deliberately submits through the feedback form: whether the report was useful, a feedback category, a feedback message, the required privacy acknowledgement, the spam-prevention field, and an optional reply email when one is supplied.
        </p>
        <p>
          Texas Water Sources uses those fields to understand whether the report was useful, investigate confusing wording or broken official links, consider missing-source and feature requests, correct inaccurate site information, and reply when an email address was provided. No property address, legal description, seller answer, coordinate, candidate identifier, lookup identifier, uploaded document, payment information, account credential, or report result is requested or added automatically.
        </p>
        <p>
          Received feedback is kept only as long as reasonably needed to review the submission, respond when requested, make or document a correction, and protect the form from abuse. Formspree may retain a submitted copy under its service settings and terms. To request deletion or correction of submitted feedback, email <a href="mailto:info@texaswatersources.com">info@texaswatersources.com</a> and describe the submission without sending property or sensitive information.
        </p>
        <p>
          A feedback submission does not create a payment, customer case, reviewed-report workflow, seller response, or report-delivery obligation.
        </p>

        <h2>Guided assistant information</h2>
        <p>
          Property labels, county names, answers, and notes entered in the separate guided assistant are stored in
          browser local storage so you can continue later. Do not enter Social Security numbers, financial account
          data, access credentials, private client communications, or other sensitive information.
        </p>

        <h2>Clearing browser-local research</h2>
        <p>
          Use “Clear saved research” in the assistant or clear this site’s browser data. Printing or saving a PDF
          creates a separate copy that you control.
        </p>

        <h2>External official-source links</h2>
        <p>
          Official-source links lead to third-party government websites with their own privacy practices. Texas
          Water Sources is independent and is not endorsed by the State of Texas or any Texas state agency.
        </p>

        <h2>Future services</h2>
        <p>If a future service stores information remotely, this notice will be updated before that feature is offered.</p>
        <p className="updated">Last updated: July 21, 2026</p>
      </section>
    </PageShell>
  );
}
