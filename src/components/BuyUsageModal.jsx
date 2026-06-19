import { useState } from "react";
import { createTopupSession } from "../utils/claudeApi.js";
import { hasFeature, usageRemaining, PER_REPORT_USD } from "../utils/tier.js";

// All tiers can buy $10/$25; $50/$100 are Agent and up.
const OPTIONS = [
  { amount: 10, minTier: "solo" },
  { amount: 25, minTier: "solo" },
  { amount: 50, minTier: "agent" },
  { amount: 100, minTier: "agent" },
];

export default function BuyUsageModal({ user, userRow, onClose, reason }) {
  const [loading, setLoading] = useState(null); // the amount being processed
  const [error, setError] = useState(null);

  const tier = userRow?.tier || "solo";
  const remaining = usageRemaining(userRow);
  const visible = OPTIONS.filter((o) => hasFeature(tier, o.minTier));

  async function buy(amount) {
    if (loading) return;
    if (!user?.id || !user?.email) { setError("Please sign in again to buy usage."); return; }
    setLoading(amount);
    setError(null);
    try {
      const url = await createTopupSession({ amount, userId: user.id, email: user.email });
      window.location.href = url; // off to Stripe Checkout
    } catch (e) {
      setError(e.message || "Could not start checkout.");
      setLoading(null);
    }
  }

  return (
    <div className="glass-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-overlay" style={{ padding: "28px 30px", width: "100%", maxWidth: 460 }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", fontSize: 20, color: "var(--muted)", cursor: "pointer", lineHeight: 1 }}>×</button>

        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 19, color: "var(--white)", marginBottom: 6 }}>
          {reason === "empty" ? "You're out of usage" : "Buy more usage"}
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", lineHeight: 1.55, marginBottom: 18 }}>
          {reason === "empty"
            ? "Add usage to keep running reports and analyses. Credit never expires."
            : "Top up your account. Credit never expires and rolls over month to month."}
          {remaining != null && (
            <span style={{ display: "block", marginTop: 6, color: "var(--muted-soft)" }}>
              Remaining now: <strong style={{ color: "var(--white)" }}>~{remaining.reports} reports</strong>
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: error ? 12 : 4 }}>
          {visible.map((o) => {
            const reports = Math.round(o.amount / PER_REPORT_USD);
            const busy = loading === o.amount;
            return (
              <button key={o.amount} type="button" onClick={() => buy(o.amount)} disabled={!!loading}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
                  padding: "14px 16px", borderRadius: 10, cursor: loading ? "default" : "pointer",
                  background: "var(--border-soft)", border: "1px solid var(--border)", textAlign: "left",
                  opacity: loading && !busy ? 0.5 : 1, transition: "border-color 0.15s ease",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--white)" }}>
                  ${o.amount}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>
                  {busy ? "Redirecting…" : `≈ ${reports} reports`}
                </span>
              </button>
            );
          })}
        </div>

        {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626", marginBottom: 6 }}>{error}</div>}

        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)", marginTop: 8, textAlign: "center" }}>
          Secure checkout via Stripe · One-time charge · Non-refundable
        </div>
      </div>
    </div>
  );
}
