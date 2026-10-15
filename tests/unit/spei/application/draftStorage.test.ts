import { describe, expect, it } from "vitest";
import {
  clearFormDraft,
  DRAFT_STORAGE_KEY,
  loadFormDraft,
  saveFormDraft,
} from "../../../../src/spei/application/draftStorage";
import {
  emptyTransferFormValues,
  type TransferFormValues,
} from "../../../../src/spei/application/validateTransferForm";

const VALUES: TransferFormValues = {
  ...emptyTransferFormValues(),
  destinationType: "card",
  beneficiaryName: "José Peña Muñoz",
  card: "4111 1111",
  concept: "Renta octubre",
};

class InMemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }
}

class ThrowingStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  getItem(): string | null {
    throw new Error("Storage blocked");
  }

  setItem(): void {
    throw new Error("Storage blocked");
  }

  removeItem(): void {
    throw new Error("Storage blocked");
  }
}

describe("draftStorage", () => {
  it("saves and loads raw form values", () => {
    const storage = new InMemoryStorage();

    saveFormDraft(VALUES, storage);

    expect(loadFormDraft(storage)).toEqual(VALUES);
  });

  it("returns null when there is no draft", () => {
    expect(loadFormDraft(new InMemoryStorage())).toBeNull();
  });

  it("returns null when the draft is corrupted", () => {
    const storage = new InMemoryStorage();
    storage.setItem(DRAFT_STORAGE_KEY, "{not json");

    expect(loadFormDraft(storage)).toBeNull();
  });

  it("returns null when the draft has an unknown destination type", () => {
    const storage = new InMemoryStorage();
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...VALUES, destinationType: "paypal" }));

    expect(loadFormDraft(storage)).toBeNull();
  });

  it("returns null when storage throws", () => {
    const storage = new ThrowingStorage();

    expect(() => saveFormDraft(VALUES, storage)).not.toThrow();
    expect(loadFormDraft(storage)).toBeNull();
    expect(() => clearFormDraft(storage)).not.toThrow();
  });

  it("clears the draft", () => {
    const storage = new InMemoryStorage();
    saveFormDraft(VALUES, storage);

    clearFormDraft(storage);

    expect(loadFormDraft(storage)).toBeNull();
  });
});
