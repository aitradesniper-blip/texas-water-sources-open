"use client";

import { useState } from "react";

export function CopyEmailButton({ email }: { email: string }) {
  const [status, setStatus] = useState("");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("Copied email address.");
    } catch {
      setStatus(`Copy unavailable. Select the visible address: ${email}`);
    }
  }

  return (
    <span className="copy-email-control">
      <button type="button" className="button quiet" onClick={copyEmail}>Copy email address</button>
      <span className="copy-email-status" role="status" aria-live="polite">{status}</span>
    </span>
  );
}
