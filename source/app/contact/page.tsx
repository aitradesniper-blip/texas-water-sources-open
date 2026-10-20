import { CopyEmailButton } from "@/app/components/CopyEmailButton";
import { PageShell } from "@/app/components/SiteChrome";
import { createPageMetadata } from "@/lib/seo";

const researchEmail = "research@texaswatersources.com";
const infoEmail = "info@texaswatersources.com";

export const metadata = createPageMetadata({
  title: "Contact Texas Water Sources",
  description: "Contact Texas Water Sources about property-water research, general questions, or feedback.",
  path: "/contact",
});

function ContactCard({ id, heading, email, children }: { id: string; heading: string; email: string; children: React.ReactNode }) {
  return (
    <section id={id} className="contact-card" aria-labelledby={`${id}-heading`}>
      <p className="eyebrow">{id === "research" ? "Research inquiries" : "General questions and feedback"}</p>
      <h2 id={`${id}-heading`}>{heading}</h2>
      <p>{children}</p>
      <span className="contact-email">{email}</span>
      <div className="contact-actions">
        <CopyEmailButton email={email} />
        <a className="text-link" href={`mailto:${email}`}>Open email app</a>
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <PageShell>
      <div className="prose-page contact-page wrap">
        <p className="eyebrow">Contact</p>
        <h1>Choose the contact route that fits your question.</h1>
        <p className="lead">The email addresses remain visible and can be copied even when no email app is configured on this device.</p>
        <div className="contact-grid">
          <ContactCard id="research" heading="Ask about completing the remaining research" email={researchEmail}>
            Use this address to ask about document comparison, possible record matches, official-source follow-up, and an organized research packet. Sending an email does not create a customer case or payment obligation.
          </ContactCard>
          <ContactCard id="general" heading="Send a general question or site comment" email={infoEmail}>
            Use this address for general questions, corrections, accessibility concerns, or feedback about Texas Water Sources.
          </ContactCard>
        </div>
        <aside className="contact-privacy-note"><strong>Protect property information.</strong><p>Do not include a property address, lookup identifier, coordinates, seller answers, account credentials, or payment information unless a later, clearly described service requires it.</p></aside>
      </div>
    </PageShell>
  );
}
