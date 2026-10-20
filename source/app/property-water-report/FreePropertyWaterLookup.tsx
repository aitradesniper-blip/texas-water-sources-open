"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  FreeLookupCandidate,
  publicErrorMessage,
  validateCandidateResponse,
} from "@/lib/free-property-water-contract";
import {
  PropertyWaterResearchNavigatorV2Response,
  validatePropertyWaterResearchNavigatorV2Response,
} from "@/lib/property-water-research-navigator-v2-contract";
import PropertyWaterResearchNavigator from "./PropertyWaterResearchNavigator";
import { trackPropertyWaterReportEvent } from "@/lib/analytics-events";

type Props = { apiBaseUrl: string };
type Phase = "address" | "candidates" | "snapshot";

function configuredApiUrl(value: string): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const localHttp = parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname);
    if (parsed.protocol !== "https:" && !localHttp) return null;
    if (parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function responseJson(response: Response): Promise<unknown> {
  const value = await response.json().catch(() => null);
  if (!response.ok) {
    try {
      throw new Error(publicErrorMessage(value));
    } catch (error) {
      if (error instanceof Error && error.message !== "The lookup could not be completed.") throw error;
      throw new Error("The lookup could not be completed.");
    }
  }
  return value;
}

export default function FreePropertyWaterLookup({ apiBaseUrl }: Props) {
  const apiUrl = configuredApiUrl(apiBaseUrl);
  const [address, setAddress] = useState("");
  const [county, setCounty] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [candidates, setCandidates] = useState<FreeLookupCandidate[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [report, setReport] = useState<PropertyWaterResearchNavigatorV2Response | null>(null);
  const [phase, setPhase] = useState<Phase>("address");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function post(path: string, body: Record<string, unknown>): Promise<unknown> {
    if (!apiUrl) throw new Error("The free report is not connected right now.");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(`${apiUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "no-store",
        signal: controller.signal,
      });
      return await responseJson(response);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("The lookup timed out. Please try again.");
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function findCandidates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acknowledged) {
      setMessage("Please confirm that you understand the location and public-record limits before continuing.");
      return;
    }
    setBusy(true);
    setMessage("Looking for possible Texas addresses...");
    setCandidates([]);
    setSelectedId("");
    setReport(null);
    trackPropertyWaterReportEvent("property_water_report_started");
    try {
      const clientRequestId = `site_${crypto.randomUUID().replaceAll("-", "")}`;
      const value = await post("/v1/free-property-water/candidates", {
        schema_version: "v1",
        client_request_id: clientRequestId,
        address_text: address.trim(),
        ...(county.trim() ? { county_hint: county.trim() } : {}),
        state: "Texas",
      });
      const response = validateCandidateResponse(value);
      setCandidates(response.candidates);
      setPhase("candidates");
      setMessage(
        response.candidates.length
          ? "Choose the address you want to research."
          : "We could not find a possible address. Check the address and try again.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The lookup could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function buildReport() {
    const selected = candidates.find((candidate) => candidate.candidate_id === selectedId);
    if (!selected) {
      setMessage("Select an address before continuing.");
      return;
    }
    setBusy(true);
    setMessage("Organizing the public records and next steps...");
    try {
      const clientRequestId = `site_${crypto.randomUUID().replaceAll("-", "")}`;
      const value = await post("/v2/free-property-water/snapshot", {
        schema_version: "v2",
        client_request_id: clientRequestId,
        candidate_id: selected.candidate_id,
        confirmed_address_label: selected.address_label,
        confirmation: "user_confirmed_research_location",
      });
      const result = validatePropertyWaterResearchNavigatorV2Response(value);
      setReport(result);
      setPhase("snapshot");
      setAddress("");
      setCounty("");
      setCandidates([]);
      setSelectedId("");
      setMessage("Your free property-water research report is ready.");
      trackPropertyWaterReportEvent("property_water_report_completed");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The lookup could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    setPhase("address");
    setReport(null);
    setCandidates([]);
    setSelectedId("");
    setMessage("");
  }

  return (
    <div className="wrap free-lookup-workspace" aria-busy={busy}>
      {phase !== "snapshot" ? (
        <section className="free-lookup-intro" aria-labelledby="lookup-heading">
          <div>
            <p className="eyebrow">Free public-record research</p>
            <h2 id="lookup-heading">Start with the Texas property address</h2>
            <p>
              We will organize useful public records, show possible records to check, and give you a clear list of
              steps for the property-specific research that remains.
            </p>
          </div>
          <div className="lookup-boundary-grid" aria-label="Service boundaries">
            <article>
              <strong>Free public records</strong>
              <span>See the safe public-record details, official links, and exact identifiers we found.</span>
            </article>
            <article>
              <strong>Optional research service</strong>
              <span>Pay only if you want us to complete the remaining searches, compare documents, and organize the evidence.</span>
            </article>
          </div>
        </section>
      ) : null}

      {!apiUrl ? (
        <section className="lookup-unavailable" role="status" aria-live="polite">
          <p className="eyebrow">Report unavailable</p>
          <h2>The free report is not connected right now</h2>
          <p>Please use the research guides below while the lookup service is unavailable.</p>
          <div className="button-row">
            <Link className="button primary" href="/trec-61-guide">Use the Texas Real Estate Commission Form 61-0 guide</Link>
            <Link className="button quiet" href="/methodology">Read the methodology</Link>
          </div>
        </section>
      ) : (
        <>
          {phase !== "snapshot" ? (
            <form className="lookup-form" onSubmit={findCandidates} aria-describedby="lookup-status">
              <div className="lookup-fields">
                <label>
                  <span>Texas property address</span>
                  <input
                    name="property-address"
                    autoComplete="street-address"
                    inputMode="text"
                    minLength={5}
                    maxLength={200}
                    required
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    disabled={busy}
                  />
                </label>
                <label>
                  <span>County (optional)</span>
                  <input
                    name="county-hint"
                    autoComplete="address-level2"
                    minLength={2}
                    maxLength={80}
                    value={county}
                    onChange={(event) => setCounty(event.target.value)}
                    disabled={busy}
                  />
                </label>
              </div>
              <label className="lookup-acknowledgment">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  disabled={busy}
                />
                <span>
                  I understand the selected location is not a surveyed property boundary. This report organizes
                  public records and does not choose answers for the seller.
                </span>
              </label>
              <div className="lookup-form-actions">
                <button className="button primary" type="submit" disabled={busy || !acknowledged}>
                  {busy && phase === "address" ? "Finding addresses..." : "Find possible addresses"}
                </button>
                <Link className="lookup-privacy-link" href="/privacy">How this lookup handles your address</Link>
              </div>
            </form>
          ) : null}

          <p id="lookup-status" className="lookup-status" role="status" aria-live="polite">{message}</p>

          {phase === "candidates" && candidates.length > 0 ? (
            <section className="lookup-candidates" aria-labelledby="candidate-heading">
              <p className="eyebrow">Confirm the address</p>
              <h2 id="candidate-heading">Choose the address you want to research</h2>
              <fieldset>
                <legend>Possible addresses</legend>
                {candidates.map((candidate) => (
                  <label key={candidate.candidate_id} className={selectedId === candidate.candidate_id ? "selected" : ""}>
                    <input
                      type="radio"
                      name="address-candidate"
                      value={candidate.candidate_id}
                      checked={selectedId === candidate.candidate_id}
                      onChange={(event) => setSelectedId(event.target.value)}
                      disabled={busy}
                    />
                    <span>
                      <strong>{candidate.address_label}</strong>
                      <small>{candidate.county}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <button className="button primary" type="button" onClick={buildReport} disabled={busy || !selectedId}>
                {busy ? "Building your report..." : "Confirm address and build my free report"}
              </button>
            </section>
          ) : null}

          {phase === "snapshot" && report ? (
            <PropertyWaterResearchNavigator report={report} apiBaseUrl={apiBaseUrl} onStartOver={startOver} />
          ) : null}
        </>
      )}
    </div>
  );
}
