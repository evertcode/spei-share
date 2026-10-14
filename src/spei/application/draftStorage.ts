import type { SpeiTransferData } from "../domain/SpeiTransferData";
import { parseTransferData } from "./parseTransferData";

export const DRAFT_STORAGE_KEY = "spei-share:draft:v1";

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStorage(): DraftStorage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function saveDraft(data: SpeiTransferData, storage = browserStorage()): void {
  try {
    storage?.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be full or blocked (private mode): remembering the draft is best effort.
  }
}

export function loadDraft(storage = browserStorage()): SpeiTransferData | null {
  try {
    const stored = storage?.getItem(DRAFT_STORAGE_KEY);
    return stored ? parseTransferData(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function clearDraft(storage = browserStorage()): void {
  try {
    storage?.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is not accessible.
  }
}
