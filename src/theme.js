const STORAGE_KEY = "vis-theme";
export const THEMES = ["system", "charcoal", "black", "light"];

export function getSystemTheme() {
  if (typeof window === "undefined") return "charcoal";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "charcoal" : "light";
}

export function getDefaultTheme(tier) {
  if (tier === "brokerage") return "black";
  if (tier === "investor" || tier === "agent") return "charcoal";
  return "system"; // solo follows OS
}

export function resolveTheme(stored) {
  if (stored === "system") return getSystemTheme();
  if (THEMES.includes(stored)) return stored;
  return getSystemTheme();
}

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored)) return stored;
    const tier = localStorage.getItem("vis-tier") || "solo";
    return getDefaultTheme(tier);
  } catch {
    return "system";
  }
}

export function applyTheme(themeOrSetting = getStoredTheme()) {
  const theme = resolveTheme(themeOrSetting);
  const root = document.documentElement;
  if (theme === "light") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme;
  }
}

export function setTheme(setting) {
  if (!THEMES.includes(setting)) return;
  try { localStorage.setItem(STORAGE_KEY, setting); } catch {}
  applyTheme(setting);
}

export function watchSystemTheme() {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  function handler() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || stored === "system") applyTheme("system");
  }
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
