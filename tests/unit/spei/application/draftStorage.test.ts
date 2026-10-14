import { describe, expect, it } from "vitest";
import {
  clearDraft,
  DRAFT_STORAGE_KEY,
  loadDraft,
  saveDraft,
} from "../../../../src/spei/application/draftStorage";
import type { SpeiTransferData } from "../../../../src/spei/domain/SpeiTransferData";

const DATA: SpeiTransferData = {
  beneficiaryName: "José Peña Muñoz",
  bankName: "BBVA México",
  destination: { type: "clabe", value: "012180001234567899" },
  concept: "Renta octubre",
  amount: "1500.00",
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
  it("saves and loads the same transfer data", () => {
    const storage = new InMemoryStorage();

    saveDraft(DATA, storage);

    expect(loadDraft(storage)).toEqual(DATA);
  });

  it("returns null when there is no draft", () => {
    expect(loadDraft(new InMemoryStorage())).toBeNull();
  });

  it("returns null when the draft is corrupted", () => {
    const storage = new InMemoryStorage();
    storage.setItem(DRAFT_STORAGE_KEY, "{not json");

    expect(loadDraft(storage)).toBeNull();
  });

  it("returns null when the draft contains invalid data", () => {
    const storage = new InMemoryStorage();
    storage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ ...DATA, destination: { type: "clabe", value: "123" } }),
    );

    expect(loadDraft(storage)).toBeNull();
  });

  it("returns null when storage throws", () => {
    const storage = new ThrowingStorage();

    expect(() => saveDraft(DATA, storage)).not.toThrow();
    expect(loadDraft(storage)).toBeNull();
    expect(() => clearDraft(storage)).not.toThrow();
  });

  it("clears the draft", () => {
    const storage = new InMemoryStorage();
    saveDraft(DATA, storage);

    clearDraft(storage);

    expect(loadDraft(storage)).toBeNull();
  });
});
