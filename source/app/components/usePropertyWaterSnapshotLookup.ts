"use client";

import { useState } from "react";
import {
  FreeLookupCandidate,
  publicErrorMessage,
  validateCandidateResponse,
} from "@/lib/free-property-water-contract";
import {
  PropertyWaterResearchNavigatorV2Response,
  validatePropertyWaterResearchNavigatorV2Response,
} from "@/lib/property-water-research-navigator-v2-contract";

export type PropertyWaterLookupPhase = "address" | "candidates" | "snapshot";
export type PropertyWaterLookupMessageTone = "status" | "error";

type LookupCallbacks = {
  onLookupStarted?: () => void;
  onCandidatesLoaded?: () => void;
  onLookupCompleted?: () => void;
};

type LookupOptions = LookupCallbacks & {
  apiBaseUrl: string;
  copy?: Partial<PropertyWaterSnapshotLookupCopy>;
};

export type PropertyWaterSnapshotLookupCopy = {
  unavailable: string;
  requestFailed: string;
  checkingSources: string;
  completed: string;
};

const defaultCopy: PropertyWaterSnapshotLookupCopy = {
  unavailable: "The well-record lookup is not connected right now.",
  requestFailed: "The well-record lookup could not be completed. Please try again.",
  checkingSources: "Checking the approved well-report sources...",
  completed: "Possible well records are ready to review.",
};

class PublicLookupError extends Error {}

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

async function responseJson(response: Response, fallbackMessage: string): Promise<unknown> {
  const value = await response.json().catch(() => null);
  if (response.ok) return value;
  try {
    throw new PublicLookupError(publicErrorMessage(value));
  } catch (error) {
    if (error instanceof PublicLookupError) throw error;
    throw new PublicLookupError(fallbackMessage);
  }
}

export function usePropertyWaterSnapshotLookup({
  apiBaseUrl,
  onLookupStarted,
  onCandidatesLoaded,
  onLookupCompleted,
  copy: copyOverrides,
}: LookupOptions) {
  const apiUrl = configuredApiUrl(apiBaseUrl);
  const copy = { ...defaultCopy, ...copyOverrides };
  const [candidates, setCandidates] = useState<FreeLookupCandidate[]>([]);
  const [report, setReport] = useState<PropertyWaterResearchNavigatorV2Response | null>(null);
  const [phase, setPhase] = useState<PropertyWaterLookupPhase>("address");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<PropertyWaterLookupMessageTone>("status");

  async function post(path: string, body: Record<string, unknown>): Promise<unknown> {
    if (!apiUrl) throw new PublicLookupError(copy.unavailable);
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
      return await responseJson(response, copy.requestFailed);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new PublicLookupError("The lookup timed out. Please try again.");
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function publicMessage(error: unknown): string {
    return error instanceof PublicLookupError
      ? error.message
      : copy.requestFailed;
  }

  async function findCandidates(address: string, county: string) {
    setBusy(true);
    setMessageTone("status");
    setMessage("Looking for possible Texas addresses...");
    setCandidates([]);
    setReport(null);
    onLookupStarted?.();
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
          ? "Choose the address you want to use as the research location."
          : "No possible address was returned. Check the address, try a county hint, or use another address format.",
      );
      onCandidatesLoaded?.();
    } catch (error) {
      setMessageTone("error");
      setMessage(publicMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCandidate(candidateId: string) {
    const selected = candidates.find((candidate) => candidate.candidate_id === candidateId);
    if (!selected) {
      setMessageTone("error");
      setMessage("Select an address before continuing.");
      return;
    }
    setBusy(true);
    setMessageTone("status");
    setMessage(copy.checkingSources);
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
      setCandidates([]);
      setPhase("snapshot");
      setMessage(copy.completed);
      onLookupCompleted?.();
    } catch (error) {
      setMessageTone("error");
      setMessage(publicMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    setPhase("address");
    setCandidates([]);
    setReport(null);
    setMessage("");
    setMessageTone("status");
  }

  return {
    apiAvailable: apiUrl !== null,
    busy,
    candidates,
    confirmCandidate,
    findCandidates,
    message,
    messageTone,
    phase,
    report,
    startOver,
  };
}
