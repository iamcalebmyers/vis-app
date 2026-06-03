const STORAGE_KEY = "vis-theme";
const THEMES = ["light", "charcoal", "black"];
const DEFAULT_THEME = "light";

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme = getStoredTheme()) {
  const root = document.documentElement;
  if (theme === DEFAULT_THEME) {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme;
  }
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
  applyTheme(theme);
}

export { THEMES, DEFAULT_THEME };
