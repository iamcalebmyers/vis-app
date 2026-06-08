import { TIER_LABELS } from "../utils/tier.js";

function TierBadge({ tier }) {
  const label = TIER_LABELS[tier] || "Solo";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: 20,
        background: "var(--card)",
        border: "1px solid var(--border)",
        color: "var(--muted-soft)",
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
