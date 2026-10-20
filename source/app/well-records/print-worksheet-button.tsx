"use client";

export function PrintWorksheetButton() {
  function printWorksheet() {
    document.body.dataset.printView = "well-comparison";
    const cleanup = () => {
      delete document.body.dataset.printView;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return <button className="button primary print-worksheet-button" type="button" onClick={printWorksheet}>Print the comparison worksheet</button>;
}
