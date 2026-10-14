import { describe, expect, it } from "vitest";
import {
  loadThemePreference,
  resolveInitialTheme,
  saveThemePreference,
  THEME_STORAGE_KEY,
} from "../../../src/dom/theme";

class InMemoryStorage implements Pick<Storage, "getItem" | "setItem"> {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

class ThrowingStorage implements Pick<Storage, "getItem" | "setItem"> {
  getItem(): string | null {
    throw new Error("Storage blocked");
  }

  setItem(): void {
    throw new Error("Storage blocked");
  }
}

describe("theme", () => {
  it("uses the stored theme when valid", () => {
    expect(resolveInitialTheme("light", true)).toBe("light");
    expect(resolveInitialTheme("dark", false)).toBe("dark");
  });

  it("follows the system preference when nothing is stored", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme(null, false)).toBe("light");
  });

  it("ignores invalid stored values", () => {
    expect(resolveInitialTheme("sepia", true)).toBe("dark");
  });

  it("saves and loads the theme preference", () => {
    const storage = new InMemoryStorage();

    saveThemePreference("dark", storage);

    expect(storage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(loadThemePreference(storage)).toBe("dark");
  });

  it("does not throw when storage is not accessible", () => {
    const storage = new ThrowingStorage();

    expect(() => saveThemePreference("dark", storage)).not.toThrow();
    expect(loadThemePreference(storage)).toBeNull();
  });
});
