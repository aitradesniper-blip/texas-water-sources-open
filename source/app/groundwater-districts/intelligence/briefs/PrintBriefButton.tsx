"use client";

export function PrintBriefButton() {
  return <button type="button" className="button district-brief-print" onClick={() => window.print()}>Print / Save as PDF</button>;
}
