import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/app/components/SiteChrome";
import {
  ArticleJsonLd,
  Breadcrumbs,
  EditorialMeta,
  OfficialSources,
  RelatedResearch,
  ResearchLimitations,
} from "@/app/components/Editorial";
import type { SupportingGuide } from "@/lib/supporting-guides";

export function SupportingGuidePage({ guide, leadContent }: { guide: SupportingGuide; leadContent?: ReactNode }) {
  return <PageShell>
    <article className="supporting-guide-page">
      <header className="supporting-guide-hero">
        <div className="wrap supporting-guide-hero-inner">
          <Breadcrumbs items={[
            { name: "Home", path: "/" },
            { name: guide.hubTitle, path: guide.hubPath },
            { name: guide.h1, path: guide.path },
          ]} />
          <p className="eyebrow">{guide.eyebrow}</p>
          <h1>{guide.h1}</h1>
          <p className="supporting-guide-lede">{guide.lede}</p>
          <div className="supporting-guide-task">
            <strong>Task this guide solves</strong>
            <p>{guide.task}</p>
            <Link href={guide.hubPath}>Return to {guide.hubTitle.toLowerCase()} →</Link>
          </div>
        </div>
      </header>

      {leadContent}

      <div className="wrap supporting-guide-content">
        <EditorialMeta content={guide.content} />

        <section className="supporting-guide-section supporting-guide-approach" aria-labelledby={`${guide.id}-approach`}>
          <p className="eyebrow">Editorial record</p>
          <h2 id={`${guide.id}-approach`}>Research approach</h2>
          <p>{guide.researchApproach}</p>
        </section>

        <section className="supporting-guide-section" aria-labelledby={`${guide.id}-overview`}>
          <p className="eyebrow">Start with the evidence</p>
          <h2 id={`${guide.id}-overview`}>{guide.overviewHeading}</h2>
          {guide.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section className="supporting-guide-section" aria-labelledby={`${guide.id}-preparation`}>
          <p className="eyebrow">Before you begin</p>
          <h2 id={`${guide.id}-preparation`}>{guide.preparationHeading}</h2>
          <ul className="supporting-guide-checklist">{guide.preparation.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="supporting-guide-section" aria-labelledby={`${guide.id}-workflow`}>
          <p className="eyebrow">Step by step</p>
          <h2 id={`${guide.id}-workflow`}>{guide.workflowHeading}</h2>
          <ol className="supporting-guide-workflow">{guide.steps.map((step, index) => <li key={step.title}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{step.title}</h3><p>{step.body}</p></div>
          </li>)}</ol>
        </section>

        <section className="supporting-guide-section" aria-labelledby={`${guide.id}-records`}>
          <p className="eyebrow">Preserve the trail</p>
          <h2 id={`${guide.id}-records`}>{guide.recordHeading}</h2>
          <div className="supporting-guide-records">{guide.records.map((record) => <article key={record.title}>
            <h3>{record.title}</h3><p>{record.body}</p>
          </article>)}</div>
        </section>

        <section className="supporting-guide-section supporting-guide-example" aria-labelledby={`${guide.id}-example`}>
          <p className="eyebrow">Hypothetical example</p>
          <h2 id={`${guide.id}-example`}>{guide.example.title}</h2>
          <p>{guide.example.situation}</p>
          <ol>{guide.example.actions.map((action) => <li key={action}>{action}</li>)}</ol>
          <p className="supporting-guide-example-outcome"><strong>Research outcome:</strong> {guide.example.outcome}</p>
        </section>

        <section className="supporting-guide-section" aria-labelledby={`${guide.id}-finish`}>
          <p className="eyebrow">Final review</p>
          <h2 id={`${guide.id}-finish`}>{guide.finalHeading}</h2>
          <ul className="supporting-guide-checklist">{guide.finalNotes.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <ResearchLimitations content={guide.content} />
        <OfficialSources content={guide.content} />
        <RelatedResearch content={guide.content} />
      </div>
      <ArticleJsonLd content={guide.content} />
    </article>
  </PageShell>;
}
