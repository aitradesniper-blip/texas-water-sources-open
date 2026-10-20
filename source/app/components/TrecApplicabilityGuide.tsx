import {
  ArticleJsonLd,
  Breadcrumbs,
  EditorialMeta,
  OfficialSources,
  RelatedResearch,
  ResearchLimitations,
} from "@/app/components/Editorial";
import { PageShell } from "@/app/components/SiteChrome";
import {
  applicabilityChecklist,
  applicabilityScenarios,
  applicabilitySteps,
  misunderstoodQuestions,
  trecApplicabilityEditorial,
  trecContractComparisons,
  trecExemptionConditions,
} from "@/lib/trec-applicability";

export function TrecApplicabilityGuide() {
  return <PageShell><article className="applicability-page">
    <header className="applicability-hero"><div className="wrap">
      <Breadcrumbs items={[
        { name: "Home", path: "/" },
        { name: "TREC Form 61-0 Research Guide", path: "/trec-61-guide" },
        { name: "Who Must Complete TREC Form 61-0?", path: "/trec-61-guide/who-must-complete-form-61-0" },
      ]} />
      <p className="eyebrow">TREC Form 61-0 applicability guide</p>
      <h1>Who Must Complete TREC Form 61-0?</h1>
      <p className="applicability-lede">Separate four questions that are often confused: TREC&apos;s mandatory-form rule for license holders, a seller&apos;s delivery terms in the actual contract, the contract&apos;s five-condition exemption, and any transaction-specific question that needs broker or legal review.</p>
    </div></header>

    <div className="applicability-content wrap">
      <section className="applicability-direct" aria-labelledby="direct-answer">
        <p className="eyebrow">Start here</p>
        <h2 id="direct-answer">The direct answer</h2>
        <p><strong>Form 61-0 is a TREC-adopted form effective July 1, 2026, but that does not mean every Texas seller in every kind of sale must complete it.</strong> TREC&apos;s “mandatory use” framework primarily governs license holders using Commission-approved forms, subject to Rule §537.11 exceptions.</p>
        <p>In five current TREC contracts reviewed for this guide, the Seller&apos;s Water Disclosure paragraph records one of three paths: the buyer already received Form 61-0, the seller will deliver it within the filled-in contract period, or the seller claims the paragraph&apos;s complete five-condition exemption. The actual contract, transaction type, party roles, selected paragraph option, and seller-known facts must be reviewed together.</p>
        <p>Questions about a particular transaction&apos;s applicability, deadline, or legal effect belong with the responsible broker or a Texas attorney. This guide identifies the decision points; it does not choose an answer, declare an exemption, or interpret an executed contract.</p>
      </section>

      <EditorialMeta content={trecApplicabilityEditorial} />

      <section className="applicability-section" aria-labelledby="mandatory-use">
        <p className="eyebrow">Four authorities, four different jobs</p>
        <h2 id="mandatory-use">Why “mandatory use” does not answer the entire question</h2>
        <div className="applicability-authority-grid">
          <article><span>§537.1</span><h3>Defines mandatory use</h3><p>TREC defines the term from the license-holder perspective: use of a contract form is required by a license holder unless a §537.11(a) exception applies.</p></article>
          <article><span>§537.11</span><h3>Regulates license-holder form use</h3><p>The rule directs a license holder to use the appropriate mandatory TREC form and lists exceptions. It also restricts legal advice and opinions about legal effect.</p></article>
          <article><span>§537.68</span><h3>Adopts Form 61-0</h3><p>TREC adopts Form 61-0 for mandatory use to provide information about groundwater and surface-water rights. That classification must still be read with §537.1 and §537.11.</p></article>
          <article><span>Actual contract</span><h3>States the parties&apos; transaction terms</h3><p>The selected contract may contain a Seller&apos;s Water Disclosure paragraph with delivery choices, a filled-in period, buyer-right language, and a complete exemption.</p></article>
        </div>
        <div className="applicability-boundary"><strong>Keep the questions separate.</strong><p>TREC regulates license holders&apos; form use. Parties agree to contract terms. Form 61-0 asks about seller knowledge. A broker or Texas attorney addresses transaction-specific contract and legal interpretation.</p></div>
      </section>

      <section className="applicability-section" aria-labelledby="contract-comparison">
        <p className="eyebrow">Current final forms</p>
        <h2 id="contract-comparison">Current TREC contract comparison</h2>
        <p className="section-intro">Each row was checked against the current final contract effective July 1, 2026. Paragraph numbers and treatment differ, so the executed contract must be read directly.</p>
        <div className="applicability-table-wrap" role="region" aria-label="Scrollable current TREC contract comparison" tabIndex={0}>
          <table className="applicability-table">
            <caption>Seller&apos;s Water Disclosure treatment in six current TREC contracts</caption>
            <thead><tr><th>Contract</th><th>Current form</th><th>Transaction type</th><th>Seller&apos;s Water Disclosure paragraph present</th><th>Paragraph reference</th><th>Form 61-0 delivery or exemption path</th><th>Official source</th></tr></thead>
            <tbody>{trecContractComparisons.map((contract) => <tr key={contract.form}>
              <th scope="row">{contract.contract}</th><td>{contract.form}</td><td>{contract.transactionType}</td><td>{contract.disclosurePresent}</td><td>{contract.paragraph}</td><td>{contract.path}</td><td><a href={contract.officialUrl} target="_blank" rel="noreferrer">Final Form {contract.form} PDF <span aria-hidden="true">↗</span></a></td>
            </tr>)}</tbody>
          </table>
        </div>
        <aside className="applicability-condo-note"><h3>Residential condominium treatment is separate</h3><p>The current final Residential Condominium Contract (Resale), Form 30-18, does not contain the Seller&apos;s Water Disclosure paragraph found in the other five contracts. TREC&apos;s Broker-Lawyer Committee reported that the proposed paragraph was removed from the condominium form before final adoption. The final contract controls; its treatment should not be extended from another form, and the omission does not resolve every other disclosure or transaction issue.</p><a href="https://www.trec.texas.gov/article/broker-lawyer-committee-reviews-contract-form-updates-april-meeting" target="_blank" rel="noreferrer">Read TREC&apos;s revision explanation <span aria-hidden="true">↗</span></a></aside>
      </section>

      <section className="applicability-section" aria-labelledby="five-conditions">
        <p className="eyebrow">A complete, conjunctive test</p>
        <h2 id="five-conditions">The five conditions must all be satisfied</h2>
        <p className="section-intro">The exemption in each covered contract joins five conditions with “and.” Review each condition as written in the actual contract. A favorable fact on one condition does not establish the other four or decide whether a selection is truthful or legally sufficient.</p>
        <div className="applicability-condition-grid">{trecExemptionConditions.map((condition) => <article key={condition.label}>
          <span>{condition.label}</span><h3>{condition.topic}</h3>
          <dl><div><dt>It does not establish</dt><dd>{condition.doesNotEstablish}</dd></div><div><dt>Public-source boundary</dt><dd>{condition.sourceBoundary}</dd></div><div><dt>Evidence or review to consider</dt><dd>{condition.followUp}</dd></div></dl>
        </article>)}</div>
      </section>

      <section className="applicability-section applicability-flow-section" aria-labelledby="screening-map">
        <p className="eyebrow">Static research sequence</p>
        <h2 id="screening-map">Applicability screening map</h2>
        <p className="section-intro">Use this sequence to organize the record. It does not output a transaction conclusion.</p>
        <ol className="applicability-flow">{applicabilitySteps.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
      </section>

      <section className="applicability-section" aria-labelledby="completes-signs">
        <p className="eyebrow">Roles shown by the final form</p>
        <h2 id="completes-signs">Who completes, signs, and acknowledges Form 61-0</h2>
        <div className="applicability-role-grid">
          <article><h3>The seller supplies the knowledge</h3><p>Form 61-0 states that the disclosure concerns the seller&apos;s knowledge as of the date signed. Its questions ask whether the seller is aware of the listed water matters. Public records may inform research, but they do not become the seller&apos;s knowledge or choose an answer.</p></article>
          <article><h3>Seller signature lines</h3><p>The current final form provides two Seller/Date signature lines. It also includes Buyer and Seller initials used to identify the form pages. If the transaction involves additional sellers or signing-capacity questions, review the actual execution requirements with the responsible broker, title professional, or Texas attorney.</p></article>
          <article><h3>Buyer signature lines</h3><p>The final form provides two Buyer/Date signature lines. Those labels do not state that the buyer independently verified or agreed with every seller statement. The covered contracts separately use receipt and delivery language; transaction-specific effect requires review of the executed documents.</p></article>
          <article><h3>License-holder boundary</h3><p>A broker or sales agent may organize factual information within the rules but should not invent or choose the seller&apos;s selections, give legal advice, or determine title or legal effect. Unusual or interpretive matters require the appropriate professional.</p></article>
        </div>
      </section>

      <section className="applicability-section" aria-labelledby="delivery-timing">
        <p className="eyebrow">Read the filled-in contract</p>
        <h2 id="delivery-timing">Delivery timing and buyer rights</h2>
        <p className="section-intro">The five covered final contracts were inspected separately. Each uses the following three-part structure, but the contract name and paragraph reference differ.</p>
        <div className="applicability-delivery-grid">
          <article><span>Path 1</span><h3>Already delivered</h3><p>The contract option records that the buyer has already received Form 61-0.</p></article>
          <article><span>Path 2</span><h3>Later delivery</h3><p>The contract provides a blank number of days after the effective date for seller delivery. Each inspected covered contract states a pre-closing termination-and-refund consequence if the form is not received, and a review period ending seven days after receipt or before closing, whichever occurs first, after delivery.</p></article>
          <article><span>Path 3</span><h3>Complete exemption</h3><p>The contract option states that Form 61-0 is not required because all five listed conditions are satisfied.</p></article>
        </div>
        <div className="applicability-boundary"><strong>No deadline is calculated here.</strong><p>The executed contract, contract effective date, filled-in delivery period, actual receipt date, selections, and transaction facts control any deadline or buyer-right analysis. This guide does not tell a party whether to deliver, sign, terminate, enforce, or waive a right.</p></div>
      </section>

      <section className="applicability-section" aria-labelledby="common-scenarios">
        <p className="eyebrow">Factual patterns, not outcomes</p>
        <h2 id="common-scenarios">Common scenarios</h2>
        <p className="section-intro">Use these scenarios to identify evidence and unresolved questions. They do not declare that Form 61-0 applies, that an exemption exists, or that a party complied.</p>
        <div className="applicability-table-wrap" role="region" aria-label="Scrollable Form 61-0 scenario matrix" tabIndex={0}>
          <table className="applicability-table scenario-table"><caption>Research issues for common transaction and water scenarios</caption><thead><tr><th>Scenario</th><th>Relevant Form 61-0 issue</th><th>Evidence or document to review</th><th>What cannot be concluded automatically</th></tr></thead><tbody>{applicabilityScenarios.map((scenario) => <tr key={scenario.scenario}><th scope="row">{scenario.scenario}</th><td>{scenario.issue}</td><td>{scenario.evidence}</td><td>{scenario.boundary}</td></tr>)}</tbody></table>
        </div>
      </section>

      <section className="applicability-section" aria-labelledby="rule-exceptions">
        <p className="eyebrow">Form-use exceptions are not universal exemptions</p>
        <h2 id="rule-exceptions">Rule §537.11 and nonstandard transactions</h2>
        <p>When a license holder negotiates a transaction covered by an appropriate TREC mandatory form, §537.11(a) directs use of that form. The current rule lists possible exceptions for:</p>
        <ul className="applicability-exception-list">
          <li><strong>A license holder acting solely as principal, not as agent.</strong><span>Confirm the participant&apos;s actual role rather than inferring it from ownership or licensing alone.</span></li>
          <li><strong>A federal agency that requires a different form.</strong><span>Preserve the agency requirement and the actual document used.</span></li>
          <li><strong>A property-owner-prepared form.</strong><span>Record who prepared the form and whether the property owner required it.</span></li>
          <li><strong>An attorney-prepared form required by the property owner.</strong><span>Review the document and requirement; do not treat attorney preparation as an answer to every separate issue.</span></li>
          <li><strong>A transaction for which TREC has not adopted an appropriate mandatory form.</strong><span>The rule specifies qualifying attorney or trade-association forms, or a voluntary Broker-Lawyer Committee form approved by TREC.</span></li>
        </ul>
        <p className="applicability-rule-note">A §537.11 form-use exception does not automatically resolve a separate disclosure, contract, statutory, title, deadline, or legal-effect question. The rule also bars license holders from giving legal advice or opinions about title or legal effect.</p>
      </section>

      <section className="applicability-section" aria-labelledby="form-comparison">
        <p className="eyebrow">Identify the disclosure by form number</p>
        <h2 id="form-comparison">Form 61-0 is not Form 55-1</h2>
        <div className="form-comparison-grid">
          <article><span>Form 61-0</span><h3>Groundwater and surface-water disclosure</h3><p>Seller&apos;s Disclosure about Groundwater and Surface Water Rights addresses seller knowledge involving groundwater districts, wells, shared or off-property supply, groundwater-right transactions, surface-water authorizations, and ponds, lakes, or tanks.</p><a href="https://www.trec.texas.gov/forms/water-notice-sellers-disclosure-about-groundwater-and-surface-water-rights" target="_blank" rel="noreferrer">Official Form 61-0 page <span aria-hidden="true">↗</span></a></article>
          <article><span>Form 55-1</span><h3>Property-condition disclosure</h3><p>Seller&apos;s Disclosure Notice addresses a separate Texas property-condition disclosure framework. Its authority, applicability, exemptions, delivery rules, and deadlines may differ.</p><a href="https://www.trec.texas.gov/forms/sellers-disclosure-notice" target="_blank" rel="noreferrer">Official Form 55-1 page <span aria-hidden="true">↗</span></a></article>
        </div>
        <p className="applicability-rule-note">A reference to “seller disclosure” should identify the form. Completing one form does not automatically replace the other.</p>
      </section>

      <section className="applicability-section" aria-labelledby="misunderstood-questions">
        <p className="eyebrow">Frequently misunderstood questions</p>
        <h2 id="misunderstood-questions">Frequently misunderstood questions</h2>
        <div className="applicability-question-list">{misunderstoodQuestions.map((item) => <article key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div>
      </section>

      <section className="applicability-section applicability-checklist" id="applicability-research-checklist" aria-labelledby="checklist-heading">
        <p className="eyebrow">Printable research record</p>
        <h2 id="checklist-heading">Applicability research checklist</h2>
        <p className="section-intro">Print this checklist to preserve the transaction documents, selected contract path, evidence, and open questions. It does not select a contract option or a Form 61-0 answer.</p>
        <div className="applicability-checklist-identifiers"><span>Property or transaction reference</span><i /><span>Date reviewed</span><i /></div>
        <ul>{applicabilityChecklist.map((item) => <li key={item}><span className="check-box" aria-hidden="true" /><div><strong>{item}</strong><i /><i /></div></li>)}</ul>
        <div className="applicability-boundary"><strong>Preserve the unresolved record.</strong><p>Keep final-form copies, official links, selections, dates, seller-known facts, public-record candidates, and questions for the responsible broker or Texas attorney.</p></div>
      </section>

      <ResearchLimitations content={trecApplicabilityEditorial} />
      <OfficialSources content={trecApplicabilityEditorial} />
      <RelatedResearch content={trecApplicabilityEditorial} />
      <p className="applicability-method-note">Research compiled by Texas Water Sources through official-source review, source comparison, editorial drafting, and substantive claim checks against the cited sources before publication. This independent guide is not affiliated with or endorsed by TREC.</p>
    </div>
    <ArticleJsonLd content={trecApplicabilityEditorial} />
  </article></PageShell>;
}
