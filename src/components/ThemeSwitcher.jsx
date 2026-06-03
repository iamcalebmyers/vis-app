import { useEffect, useState } from "react";
import { THEMES, getStoredTheme, setTheme } from "../theme.js";

const ICONS = {
  light: "☀",
  charcoal: "◐",
  black: "●",
};

const LABELS = {
  light: "Light",
  charcoal: "Charcoal",
  black: "Black",
};

function ThemeSwitcher() {
  const [theme, setLocal] = useState("light");
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setLocal(getStoredTheme());
  }, []);

  function cycle() {
    const idx = THEMES.indexOf(theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next);
    setLocal(next);
  }

  const nextLabel = LABELS[THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]];

  return (
    <button
      type="button"
      onClick={cycle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Theme: ${LABELS[theme]}. Click to switch to ${nextLabel}.`}
      title={`Theme: ${LABELS[theme]} · click for ${nextLabel}`}
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        background: hover ? "var(--border-soft)" : "transparent",
        border: "1px solid var(--border)",
        color: "var(--muted-soft)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        fontSize: 13,
        lineHeight: 1,
        transition: "background 0.15s ease, color 0.15s ease",
        padding: 0,
      }}
    >
      {ICONS[theme]}
    </button>
  );
}

export default ThemeSwitcher;
