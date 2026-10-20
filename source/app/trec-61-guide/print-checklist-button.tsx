"use client";

export function PrintChecklistButton() {
  const printChecklist = () => {
    document.body.dataset.printView = "trec-checklist";
    const cleanup = () => {
      delete document.body.dataset.printView;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  return <button className="button primary print-checklist-button" type="button" onClick={printChecklist}>Print the research checklist</button>;
}
