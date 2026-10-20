"use client";

import { useEffect, useState } from "react";
import { dataStatusPresentation, fetchPublicDataStatus, validatePublicDataStatus } from "@/lib/data-currentness.js";

type PublicStatus = ReturnType<typeof validatePublicDataStatus>;

export default function DataCurrentnessStatus({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [status, setStatus] = useState<PublicStatus | null>(null);
  const [unavailable, setUnavailable] = useState(!apiBaseUrl);

  useEffect(() => {
    if (!apiBaseUrl) return;
    const controller = new AbortController();
    setUnavailable(false);
    fetchPublicDataStatus(apiBaseUrl, fetch, controller.signal)
      .then(setStatus)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setUnavailable(true);
      });
    return () => controller.abort();
  }, [apiBaseUrl]);

  if (unavailable) return <aside className="navigator-data-status status-unavailable" data-data-status="unavailable"><div><p className="eyebrow">Managed data currentness</p><h3>Status endpoint not available yet</h3></div><p>The property report remains available. Verify live official sources before relying on completeness or a no-record result.</p></aside>;
  if (!status) return <aside className="navigator-data-status status-loading" data-data-status="loading"><div><p className="eyebrow">Managed data currentness</p><h3>Checking source dates…</h3></div><p>This status check never blocks the report.</p></aside>;

  const presentation = dataStatusPresentation(status.overall_status);
  return <aside className={`navigator-data-status status-${presentation.tone}`} data-data-status={status.overall_status}>
    <div><p className="eyebrow">Managed data currentness</p><h3>{presentation.label}</h3><p>Generated <time dateTime={status.generated_at}>{new Date(status.generated_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</time></p></div>
    <ul>{status.sources.map((source) => <li key={source.source_id}>
      <strong>{source.source_name}</strong>
      <span>{source.currentness_basis === "verification" ? "Reference dated " : "Data snapshot "}<time dateTime={source.data_checked_through}>{source.data_checked_through}</time>
        {source.currentness_basis === "verification" && <> · {source.last_verified_at ? <>Verified <time dateTime={source.last_verified_at}>{source.last_verified_at.slice(0, 10)}</time></> : "Verification required"}</>}
        {" · "}{source.currentness}{source.operator_action_required ? " · operator review required" : ""}
      </span>
    </li>)}</ul>
  </aside>;
}
