import { isDestinationType } from "../domain/transferDestination";
import {
  emptyTransferFormValues,
  TRANSFER_FORM_FIELDS,
  type TransferFormValues,
} from "./validateTransferForm";

// v2 stores raw form values (saved while typing, possibly invalid). v1 drafts are ignored.
export const DRAFT_STORAGE_KEY = "spei-share:draft:v2";

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStorage(): DraftStorage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function saveFormDraft(values: TransferFormValues, storage = browserStorage()): void {
  try {
    storage?.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Storage may be full or blocked (private mode): remembering the draft is best effort.
  }
}

export function loadFormDraft(storage = browserStorage()): TransferFormValues | null {
  try {
    const stored = storage?.getItem(DRAFT_STORAGE_KEY);
    return stored ? toFormValues(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function clearFormDraft(storage = browserStorage()): void {
  try {
    storage?.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is not accessible.
  }
}

function toFormValues(payload: unknown): TransferFormValues | null {
  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as Record<string, unknown>;
  if (!isDestinationType(record.destinationType)) return null;

  const values = emptyTransferFormValues();
  values.destinationType = record.destinationType;
  for (const field of TRANSFER_FORM_FIELDS) {
    const value = record[field];
    if (typeof value === "string") values[field] = value;
  }

  return values;
}
