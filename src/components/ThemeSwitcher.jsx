import { useEffect, useState } from "react";
import { getStoredTheme, setTheme } from "../theme.js";

// Cycle only the three real modes — no "system" (it resolves to charcoal and
// made the toggle land on charcoal twice).
const CYCLE = ["light", "charcoal", "black"];

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
    const stored = getStoredTheme();
    setLocal(CYCLE.includes(stored) ? stored : "light");
  }, []);

  function cycle() {
    const idx = CYCLE.indexOf(theme);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setTheme(next);
    setLocal(next);
  }

  const nextLabel = LABELS[CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length]];

  return (
    <button
      type="button"
      onClick={cycle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Theme: ${LABELS[theme]}. Click to switch to ${nextLabel}.`}
      title={`Theme: ${LABELS[theme]} · click for ${nextLabel}`}
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: hover ? "var(--border-soft)" : "var(--card)",
        border: "1px solid var(--border)",
        color: "var(--muted)",
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
