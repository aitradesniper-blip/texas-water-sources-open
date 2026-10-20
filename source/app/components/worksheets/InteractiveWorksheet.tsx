"use client";

import { useEffect, useRef } from "react";
import { useBrowserLocalWorksheet } from "./useBrowserLocalWorksheet";
import type { ReactNode } from "react";
import type { WorksheetDefinition, WorksheetFieldDefinition, WorksheetValues } from "./worksheet-types";

function fieldDomId(definition: WorksheetDefinition, field: WorksheetFieldDefinition) {
  return `worksheet-${definition.id}-${field.id}`;
}

export function InteractiveWorksheet({
  definition,
  renderPrintDocument,
  externalSaveRequest,
  onExternalSaveResult,
}: {
  definition: WorksheetDefinition;
  renderPrintDocument: (values: WorksheetValues) => ReactNode;
  externalSaveRequest?: { id: number; values: WorksheetValues } | null;
  onExternalSaveResult?: (requestId: number, saved: boolean) => void;
}) {
  const worksheet = useBrowserLocalWorksheet(definition);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const handledExternalSaveId = useRef(0);

  useEffect(() => {
    if (!externalSaveRequest || externalSaveRequest.id <= handledExternalSaveId.current) return;
    handledExternalSaveId.current = externalSaveRequest.id;
    const saved = worksheet.mergeAndSaveValues(externalSaveRequest.values);
    onExternalSaveResult?.(externalSaveRequest.id, saved);
  }, [externalSaveRequest, onExternalSaveResult, worksheet]);

  function printWorksheet(mode: string) {
    document.body.dataset.printView = mode;
    let cleaned = false;
    const media = window.matchMedia("print");
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      delete document.body.dataset.printView;
      window.removeEventListener("afterprint", cleanup);
      media.removeEventListener?.("change", handleMediaChange);
    };
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (!event.matches) cleanup();
    };
    window.addEventListener("afterprint", cleanup, { once: true });
    media.addEventListener?.("change", handleMediaChange);
    try {
      window.print();
    } finally {
      window.setTimeout(cleanup, 0);
    }
  }

  function clearForm() {
    if (worksheet.clearWorksheet()) headingRef.current?.focus();
  }

  return <section className="surface-worksheet interactive-worksheet" aria-labelledby={`${definition.id}-heading`}>
    <header className="interactive-worksheet-header">
      <div>
        <p className="eyebrow">Browser-local research workspace</p>
        <h2 id={`${definition.id}-heading`} ref={headingRef} tabIndex={-1}>{definition.title}</h2>
        <p>{definition.subtitle}</p>
      </div>
      <p className="worksheet-official-notice"><strong>Texas Water Sources research worksheet</strong>{definition.officialFormNotice}</p>
    </header>

    <div className="worksheet-privacy-notice"><strong>Your information stays on this device</strong><p>{definition.privacyNotice}</p></div>

    <div className="worksheet-toolbar" aria-label="Worksheet actions">
      <button className="button primary" type="button" onClick={() => printWorksheet(definition.completedPrintMode)}>Print completed worksheet</button>
      <button className="button quiet" type="button" onClick={() => printWorksheet(definition.blankPrintMode)}>Print blank worksheet</button>
      <button className="button quiet" type="button" onClick={worksheet.saveDraft}>Save draft in this browser</button>
      <button className="worksheet-clear-button" type="button" onClick={clearForm}>Clear form</button>
    </div>
    <p className="worksheet-print-settings-notice">Recommended print settings: Letter (8.5 × 11 in), 100% scale, and browser headers and footers turned off. Printer defaults may override the intended paper size.</p>
    <div className="worksheet-storage-status" aria-live="polite" aria-atomic="true">
      <strong>{worksheet.status}</strong>
      <span className="sr-only">{worksheet.announcement}</span>
    </div>
    {worksheet.storageWarning && <p className="worksheet-storage-warning" role="status">{worksheet.storageWarning}</p>}

    {definition.sections.map((section) => <fieldset className="worksheet-section" key={section.id}>
        <legend>{section.title}</legend>
        {section.description && <p className="worksheet-section-description">{section.description}</p>}
        <div className="worksheet-field-grid">
          {section.fields.map((field) => {
            const id = fieldDomId(definition, field);
            const helpId = field.help ? `${id}-help` : undefined;
            const value = worksheet.values[field.id] ?? "";
            return <div className={`worksheet-field ${field.fullWidth ? "worksheet-field--full" : ""}`} key={field.id}>
              <div className="worksheet-screen-field">
                <label htmlFor={id}>{field.label}</label>
                {field.help && <p id={helpId}>{field.help}</p>}
                {field.type === "multiline"
                  ? <textarea id={id} rows={field.writingSpace === "large" ? 6 : 4} maxLength={field.maxLength} aria-describedby={helpId} value={value} onChange={(event) => worksheet.updateValue(field.id, event.target.value)} />
                  : field.type === "select"
                    ? <select id={id} aria-describedby={helpId} value={value} onChange={(event) => worksheet.updateValue(field.id, event.target.value)}>
                        <option value="">Select a research status</option>
                        {field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                      </select>
                    : <input id={id} type={field.type === "date" ? "date" : "text"} maxLength={field.type === "date" ? undefined : field.maxLength} aria-describedby={helpId} value={value} onChange={(event) => worksheet.updateValue(field.id, event.target.value)} />}
              </div>
            </div>;
          })}
        </div>
      </fieldset>)}

    <div className="worksheet-boundary">
      <strong>Candidate boundary</strong><p>{definition.boundaryStatement}</p>
    </div>
    <ul className="worksheet-limitations">{definition.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
    {renderPrintDocument(worksheet.values)}
  </section>;
}
