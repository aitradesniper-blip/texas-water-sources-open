export type WorksheetFieldType = "short-text" | "date" | "multiline" | "select";

export type WorksheetPrintPage = 1 | 2;

export type WorksheetWritingSpace = "compact" | "standard" | "large";

export interface WorksheetOption {
  value: string;
  label: string;
}

export interface WorksheetFieldDefinition {
  id: string;
  label: string;
  help?: string;
  type: WorksheetFieldType;
  options?: readonly WorksheetOption[];
  maxLength: number;
  printPage: WorksheetPrintPage;
  writingSpace: WorksheetWritingSpace;
  fullWidth?: boolean;
}

export interface WorksheetSectionDefinition {
  id: string;
  title: string;
  description?: string;
  printPage: WorksheetPrintPage;
  fields: readonly WorksheetFieldDefinition[];
}

export interface WorksheetDefinition {
  id: string;
  storageVersion: number;
  storageKey: string;
  title: string;
  subtitle: string;
  privacyNotice: string;
  officialFormNotice: string;
  sections: readonly WorksheetSectionDefinition[];
  boundaryStatement: string;
  limitations: readonly string[];
  footerLabel: string;
  completedPrintMode: string;
  blankPrintMode: string;
}

export type WorksheetValues = Record<string, string>;

export type WorksheetSaveStatus =
  | "No saved draft"
  | "Unsaved changes"
  | "Saved in this browser"
  | "Saved draft restored"
  | "Saved-draft removal uncertain";

export interface WorksheetClearOutcome {
  status: WorksheetSaveStatus;
  announcement: string;
  warning: string;
}

export interface StoredWorksheetDraft {
  version: number;
  worksheetId: string;
  savedAt: string;
  values: WorksheetValues;
}

export type ParsedWorksheetDraft =
  | { ok: true; draft: StoredWorksheetDraft }
  | { ok: false; reason: "malformed" | "unsupported" };

export function worksheetFields(definition: WorksheetDefinition) {
  return definition.sections.flatMap((section) => section.fields);
}

export function createEmptyWorksheetValues(definition: WorksheetDefinition): WorksheetValues {
  return Object.fromEntries(worksheetFields(definition).map((field) => [field.id, ""]));
}

export function mergeWorksheetValues(
  definition: WorksheetDefinition,
  current: WorksheetValues,
  updates: WorksheetValues,
): WorksheetValues {
  const next = createEmptyWorksheetValues(definition);
  for (const field of worksheetFields(definition)) next[field.id] = current[field.id]?.slice(0, field.maxLength) ?? "";
  for (const field of worksheetFields(definition)) {
    const value = updates[field.id];
    if (typeof value !== "string") continue;
    const boundedValue = value.slice(0, field.maxLength);
    if (field.type === "select" && boundedValue !== "" && !(field.options ?? []).some((option) => option.value === boundedValue)) continue;
    next[field.id] = boundedValue;
  }
  return next;
}

export function worksheetCompletedPrintValue(field: WorksheetFieldDefinition, value: string) {
  if (field.type !== "select") return value;
  return (field.options ?? []).find((option) => option.value === value)?.label ?? "";
}

export function createWorksheetClearOutcome(removalSucceeded: boolean): WorksheetClearOutcome {
  if (removalSucceeded) {
    return {
      status: "No saved draft",
      announcement: "Form cleared. No saved draft remains in this browser.",
      warning: "",
    };
  }
  return {
    status: "Saved-draft removal uncertain",
    announcement: "Form cleared, but the browser-saved draft could not be removed. It may return after reload.",
    warning: "The visible form was cleared, but the browser-saved draft could not be removed. The old draft may return after you reload this page.",
  };
}

export function parseWorksheetDraft(raw: string, definition: WorksheetDefinition): ParsedWorksheetDraft {
  let candidate: unknown;
  try {
    candidate = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return { ok: false, reason: "malformed" };
  }

  const record = candidate as Record<string, unknown>;
  if (record.version !== definition.storageVersion || record.worksheetId !== definition.id) {
    return { ok: false, reason: "unsupported" };
  }
  if (typeof record.savedAt !== "string" || !record.values || typeof record.values !== "object" || Array.isArray(record.values)) {
    return { ok: false, reason: "malformed" };
  }

  const storedValues = record.values as Record<string, unknown>;
  const values = createEmptyWorksheetValues(definition);
  for (const field of worksheetFields(definition)) {
    const value = storedValues[field.id];
    if (typeof value !== "string") continue;
    if (field.type === "select" && value !== "" && !(field.options ?? []).some((option) => option.value === value)) {
      return { ok: false, reason: "malformed" };
    }
    values[field.id] = value.slice(0, field.maxLength);
  }

  return {
    ok: true,
    draft: {
      version: definition.storageVersion,
      worksheetId: definition.id,
      savedAt: record.savedAt,
      values,
    },
  };
}
