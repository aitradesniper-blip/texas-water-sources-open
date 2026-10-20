"use client";
import { useState } from "react";
import { trackUpdatesEvent } from "@/lib/analytics-events";

export function UpdatesLink({ href, kind, children, className }: { href: string; kind: "briefing" | "source" | "feed"; children: React.ReactNode; className?: string }) {
  return <a href={href} className={className} referrerPolicy={kind === "source" ? "no-referrer" : undefined} onClick={() => trackUpdatesEvent(kind === "source" ? "updates_source_opened" : kind === "feed" ? "updates_feed_opened" : "updates_briefing_opened")}>{children}</a>;
}

export function CopyBriefingLink({ url }: { url: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(url); setMessage("Briefing link copied."); }
    catch { setMessage(`Copy this link: ${url}`); }
  }
  return <div className="updates-copy"><button type="button" className="button quiet" onClick={copy}>Copy briefing link</button><span role="status">{message}</span></div>;
}
