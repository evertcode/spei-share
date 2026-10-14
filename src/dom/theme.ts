export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "spei-share:theme";

const THEMES: readonly Theme[] = ["light", "dark"];

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function resolveInitialTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;

  return prefersDark ? "dark" : "light";
}

export function loadThemePreference(
  storage: Pick<Storage, "getItem"> | undefined = browserStorage(),
): string | null {
  try {
    return storage?.getItem(THEME_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function saveThemePreference(
  theme: Theme,
  storage: Pick<Storage, "setItem"> | undefined = browserStorage(),
): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be blocked (private mode): the theme still applies for this visit.
  }
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}
