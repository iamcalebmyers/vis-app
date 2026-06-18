import { usageRemaining, TIER_INCLUDED_USD } from "../utils/tier.js";

// Compact usage meter in the nav: shows ~reports remaining and opens the
// Buy Usage modal on click. "Remaining" = included bucket left + prepaid balance.
function UsageBar({ userRow, onBuyUsage }) {
  if (!userRow?.tier) return null;

  const remaining = usageRemaining(userRow);
  if (!remaining) return null;

  const includedTotal = TIER_INCLUDED_USD[userRow.tier] || 0;
  const usedAll = remaining.dollars <= 0;
  // Bar reflects how much of the monthly included bucket is left (prepaid balance shown as full).
  const includedLeft = Math.max(includedTotal - (userRow.included_used || 0), 0);
  const pctLeft = includedTotal > 0 ? Math.round((includedLeft / includedTotal) * 100) : 100;
  const color = usedAll ? "#dc2626" : remaining.reports <= 5 ? "#f59e0b" : "var(--accent)";

  return (
    <button
      type="button"
      onClick={onBuyUsage}
      title="Buy more usage"
      style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 96, background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Usage
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color }}>
          {usedAll ? "Add +" : `~${remaining.reports}`}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${usedAll ? 100 : pctLeft}%`, background: color, borderRadius: 2, transition: "width 0.3s ease" }} />
      </div>
    </button>
  );
}

export default UsageBar;
