"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createWorksheetClearOutcome,
  createEmptyWorksheetValues,
  mergeWorksheetValues,
  parseWorksheetDraft,
  worksheetFields,
  type StoredWorksheetDraft,
  type WorksheetDefinition,
  type WorksheetSaveStatus,
  type WorksheetValues,
} from "./worksheet-types";

function valuesMatch(a: WorksheetValues, b: WorksheetValues, fieldIds: readonly string[]) {
  return fieldIds.every((fieldId) => a[fieldId] === b[fieldId]);
}

export function useBrowserLocalWorksheet(definition: WorksheetDefinition) {
  const emptyValues = useMemo(() => createEmptyWorksheetValues(definition), [definition]);
  const fieldIds = useMemo(() => worksheetFields(definition).map((field) => field.id), [definition]);
  const fieldMaxLengths = useMemo(
    () => new Map(worksheetFields(definition).map((field) => [field.id, field.maxLength])),
    [definition],
  );
  const [values, setValues] = useState<WorksheetValues>(emptyValues);
  const [savedValues, setSavedValues] = useState<WorksheetValues | null>(null);
  const [status, setStatus] = useState<WorksheetSaveStatus>("No saved draft");
  const [announcement, setAnnouncement] = useState("No saved draft");
  const [storageWarning, setStorageWarning] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(definition.storageKey);
      if (!raw) return;
      const parsed = parseWorksheetDraft(raw, definition);
      if (!parsed.ok) {
        setStorageWarning("A saved browser draft could not be read. The worksheet remains available, and no saved values were loaded.");
        setAnnouncement("Saved browser draft could not be read.");
        return;
      }
      setValues(parsed.draft.values);
      setSavedValues(parsed.draft.values);
      setStatus("Saved draft restored");
      setAnnouncement("Saved draft restored from this browser.");
    } catch {
      setStorageWarning("Browser storage is unavailable. You can still complete and print the worksheet without saving.");
      setAnnouncement("Browser storage is unavailable.");
    }
  }, [definition]);

  const updateValue = useCallback((fieldId: string, nextValue: string) => {
    const maxLength = fieldMaxLengths.get(fieldId);
    if (maxLength === undefined) return;
    const boundedValue = nextValue.slice(0, maxLength);
    setValues((current) => {
      const next = { ...current, [fieldId]: boundedValue };
      const nextStatus = savedValues && valuesMatch(next, savedValues, fieldIds)
        ? "Saved in this browser"
        : fieldIds.some((id) => next[id] !== "") || savedValues
          ? "Unsaved changes"
          : "No saved draft";
      setStatus(nextStatus);
      setAnnouncement(nextStatus);
      return next;
    });
  }, [fieldIds, fieldMaxLengths, savedValues]);

  const saveDraft = useCallback(() => {
    const draft: StoredWorksheetDraft = {
      version: definition.storageVersion,
      worksheetId: definition.id,
      savedAt: new Date().toISOString(),
      values: Object.fromEntries(fieldIds.map((fieldId) => [fieldId, values[fieldId] ?? ""])),
    };
    try {
      localStorage.setItem(definition.storageKey, JSON.stringify(draft));
      setSavedValues({ ...draft.values });
      setStatus("Saved in this browser");
      setAnnouncement("Saved in this browser.");
      setStorageWarning("");
    } catch {
      setStorageWarning("This browser could not save the draft. Your current entries remain available on this page for printing.");
      setAnnouncement("The draft could not be saved in this browser.");
    }
  }, [definition, fieldIds, values]);

  const mergeAndSaveValues = useCallback((updates: WorksheetValues) => {
    const next = mergeWorksheetValues(definition, values, updates);
    setValues(next);
    const draft: StoredWorksheetDraft = {
      version: definition.storageVersion,
      worksheetId: definition.id,
      savedAt: new Date().toISOString(),
      values: Object.fromEntries(fieldIds.map((fieldId) => [fieldId, next[fieldId] ?? ""])),
    };
    try {
      localStorage.setItem(definition.storageKey, JSON.stringify(draft));
      setSavedValues({ ...draft.values });
      setStatus("Saved in this browser");
      setAnnouncement("Values added and saved in this browser.");
      setStorageWarning("");
      return true;
    } catch {
      setStatus("Unsaved changes");
      setStorageWarning("The values were added to the worksheet, but this browser could not save the draft. The current entries remain available for printing.");
      setAnnouncement("Values were added, but the draft could not be saved in this browser.");
      return false;
    }
  }, [definition, fieldIds, values]);

  const clearWorksheet = useCallback(() => {
    if (!window.confirm("Clear every worksheet field and remove the saved draft from this browser?")) return false;
    let removalSucceeded = false;
    try {
      localStorage.removeItem(definition.storageKey);
      removalSucceeded = true;
    } catch {
      // The confirmed clear still applies to visible values, but the old draft may remain in browser storage.
    }
    const outcome = createWorksheetClearOutcome(removalSucceeded);
    setValues({ ...emptyValues });
    setSavedValues(null);
    setStatus(outcome.status);
    setAnnouncement(outcome.announcement);
    setStorageWarning(outcome.warning);
    return true;
  }, [definition.storageKey, emptyValues]);

  return {
    values,
    status,
    announcement,
    storageWarning,
    updateValue,
    saveDraft,
    mergeAndSaveValues,
    clearWorksheet,
  };
}
