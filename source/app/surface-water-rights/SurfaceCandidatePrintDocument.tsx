import { worksheetCompletedPrintValue, worksheetFields } from "@/app/components/worksheets/worksheet-types";
import type { WorksheetDefinition, WorksheetFieldDefinition, WorksheetValues } from "@/app/components/worksheets/worksheet-types";

type PrintVariant = "blank" | "completed";

const pageOneFieldIds = [
  "property-research-label",
  "county",
  "viewer-search-date",
  "researcher-file-reference",
  "authorization-identifier",
  "permit-certificate",
  "recorded-holder",
  "basin",
  "authorized-reported-purpose",
  "match-status",
] as const;

const pageTwoFieldIds = [
  "diversion-impoundment-location",
  "place-of-use-information",
  "documents-opened",
  "official-source-links-access-dates",
  "property-evidence-compared",
  "agreements-conflicts-mismatches",
  "missing-evidence",
  "professional-review-questions",
] as const;

const answerSizeByField: Record<string, string> = {
  "recorded-holder": "recorded-holder",
  "authorized-reported-purpose": "reported-purpose",
  "match-status": "match-status",
  "diversion-impoundment-location": "evidence",
  "place-of-use-information": "evidence",
  "documents-opened": "evidence",
  "official-source-links-access-dates": "evidence",
  "property-evidence-compared": "evidence",
  "agreements-conflicts-mismatches": "evidence",
  "missing-evidence": "missing-evidence",
  "professional-review-questions": "professional-review",
};

function fieldMap(definition: WorksheetDefinition) {
  return new Map(worksheetFields(definition).map((field) => [field.id, field]));
}

function SurfacePrintField({ field, value, variant }: { field: WorksheetFieldDefinition; value: string; variant: PrintVariant }) {
  const answerSize = answerSizeByField[field.id] ?? "short";
  const completedValue = worksheetCompletedPrintValue(field, value);

  return <div className={`surface-print-field surface-print-field--${answerSize}`} data-print-field={field.id}>
    <div className="surface-print-field-heading">
      <strong>{field.label}</strong>
      {field.help && <span>{field.help}</span>}
    </div>
    {variant === "blank" && field.type === "select"
      ? <div className="surface-print-answer surface-print-answer--options" aria-label={`${field.label} blank choices`}>
          {(field.options ?? []).map((option) => <span key={option.value}><i aria-hidden="true" />{option.label}</span>)}
        </div>
      : variant === "blank"
        ? <div className="surface-print-answer surface-print-answer--writing" aria-hidden="true" />
        : <div className="surface-print-answer surface-print-answer--value" data-field-value={field.id}>
            {completedValue || <span className="surface-print-empty" aria-label="Blank field" />}
          </div>}
  </div>;
}

function PrintSection({
  title,
  description,
  fields,
  values,
  variant,
  className = "",
}: {
  title: string;
  description: string;
  fields: readonly WorksheetFieldDefinition[];
  values: WorksheetValues;
  variant: PrintVariant;
  className?: string;
}) {
  return <section className={`surface-print-section ${className}`}>
    <h3>{title}</h3>
    <p>{description}</p>
    <div className="surface-print-fields">
      {fields.map((field) => <SurfacePrintField field={field} value={values[field.id] ?? ""} variant={variant} key={field.id} />)}
    </div>
  </section>;
}

function CandidateBoundary({ statement }: { statement: string }) {
  return <aside className="surface-print-boundary"><strong>Candidate boundary</strong><p>{statement}</p></aside>;
}

function WorksheetLimitations({ limitations }: { limitations: readonly string[] }) {
  return <aside className="surface-print-limitations"><strong>Worksheet limitations</strong><ul>{limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></aside>;
}

function PrintFooter({ variant, pageNumber }: { variant: PrintVariant; pageNumber: 1 | 2 }) {
  return <footer className="surface-print-footer">
    <span>Texas Water Sources · Surface-Water Candidate Worksheet</span>
    <span>{variant === "blank" ? `Page ${pageNumber} of 2` : "Completed copy"}</span>
  </footer>;
}

function SurfaceCandidateDocument({ definition, values, variant }: { definition: WorksheetDefinition; values: WorksheetValues; variant: PrintVariant }) {
  const fields = fieldMap(definition);
  const getFields = (ids: readonly string[]) => ids.map((id) => {
    const field = fields.get(id);
    if (!field) throw new Error(`Missing surface-water worksheet field: ${id}`);
    return field;
  });
  const sectionOne = definition.sections[0];
  const sectionTwo = definition.sections[1];
  const sectionThree = definition.sections[2];
  const sectionFour = definition.sections[3];

  return <div className={`surface-candidate-print-document surface-candidate-print-document--${variant}`} data-print-document={variant}>
    <article className={`surface-print-sheet surface-print-sheet--${variant} surface-print-sheet--page-1`} data-print-sheet="1">
      <header className="surface-print-document-header">
        <p>Texas Water Sources research worksheet</p>
        <h2>{definition.title}</h2>
        <span>{definition.subtitle}</span>
        <strong>{definition.officialFormNotice}</strong>
      </header>
      <div className="surface-print-sheet-body surface-print-sheet-body--page-1">
        <PrintSection title={sectionOne.title} description={sectionOne.description ?? ""} fields={getFields(pageOneFieldIds.slice(0, 4))} values={values} variant={variant} className="surface-print-section--reference" />
        <PrintSection title={sectionTwo.title} description={sectionTwo.description ?? ""} fields={getFields(pageOneFieldIds.slice(4))} values={values} variant={variant} className="surface-print-section--authorization" />
        <CandidateBoundary statement={definition.boundaryStatement} />
      </div>
      <PrintFooter variant={variant} pageNumber={1} />
    </article>

    <article className={`surface-print-sheet surface-print-sheet--${variant} surface-print-sheet--page-2`} data-print-sheet="2">
      <header className="surface-print-continuation-header">
        <p>Texas Water Sources research worksheet</p>
        <h2>{definition.title} — continued</h2>
      </header>
      <div className="surface-print-sheet-body surface-print-sheet-body--page-2">
        <PrintSection title={sectionThree.title} description={sectionThree.description ?? ""} fields={getFields(pageTwoFieldIds.slice(0, 4))} values={values} variant={variant} className="surface-print-section--evidence" />
        <PrintSection title={sectionFour.title} description={sectionFour.description ?? ""} fields={getFields(pageTwoFieldIds.slice(4))} values={values} variant={variant} className="surface-print-section--comparison" />
        <CandidateBoundary statement={definition.boundaryStatement} />
        <WorksheetLimitations limitations={definition.limitations} />
      </div>
      <PrintFooter variant={variant} pageNumber={2} />
    </article>
  </div>;
}

export function SurfaceCandidatePrintDocument({ definition, values }: { definition: WorksheetDefinition; values: WorksheetValues }) {
  return <div className="surface-candidate-print-documents" aria-hidden="true">
    <SurfaceCandidateDocument definition={definition} values={values} variant="completed" />
    <SurfaceCandidateDocument definition={definition} values={values} variant="blank" />
  </div>;
}
