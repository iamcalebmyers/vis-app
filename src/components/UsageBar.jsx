import { usagePct, USAGE_LABELS } from "../utils/tier.js";

function UsageBar({ userRow }) {
  if (!userRow?.usage_limit) return null;

  const pct = usagePct(userRow.usage_current, userRow.usage_limit);
  const label = USAGE_LABELS[userRow.tier] || "Standard";
  const color = pct >= 100 ? "#dc2626" : pct >= 80 ? "#f59e0b" : "var(--accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 90 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: pct >= 80 ? color : "var(--muted)" }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

export default UsageBar;
