"use client";

export function PrintDistrictChecklistButton() {
  function printChecklist() {
    document.body.dataset.printView = "district-verification";
    const cleanup = () => {
      delete document.body.dataset.printView;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return <button className="button primary print-district-checklist-button" type="button" onClick={printChecklist}>Print the district-verification checklist</button>;
}
