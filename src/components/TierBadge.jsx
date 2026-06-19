import { TIER_LABELS } from "../utils/tier.js";

function TierBadge({ tier }) {
  const label = TIER_LABELS[tier] || "Solo";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 11px",
        borderRadius: 999,
        background: "var(--accent)",
        border: "none",
        color: "var(--accent-text)",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export default TierBadge;
