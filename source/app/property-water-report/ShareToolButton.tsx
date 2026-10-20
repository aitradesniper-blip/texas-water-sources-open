"use client";

import { useState } from "react";

const shareUrl = "https://texaswatersources.com/property-water-report";

export function ShareToolButton() {
  const [status, setStatus] = useState("");

  async function shareTool() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Free Texas Property Water Report",
          text: "Organize public Texas property-water records and remaining research steps.",
          url: shareUrl,
        });
        setStatus("Share options opened.");
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setStatus("Tool link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus(`Copy unavailable. Use this link: ${shareUrl}`);
    }
  }

  return <span className="share-tool-control"><button type="button" className="button sand" onClick={shareTool}>Share this tool</button><span role="status" aria-live="polite">{status}</span></span>;
}
