import { useState } from "react";

const TIER_PRICES = { investor: "$49", agent: "$99", brokerage: "$249" };
const TIER_LABELS = { investor: "Investor", agent: "Agent", brokerage: "Brokerage" };

// Stripe price IDs — set these to match your Stripe dashboard
const PRICE_IDS = {
  investor:  import.meta.env.VITE_STRIPE_PRICE_INVESTOR  || "",
  agent:     import.meta.env.VITE_STRIPE_PRICE_AGENT     || "",
  brokerage: import.meta.env.VITE_STRIPE_PRICE_BROKERAGE || "",
};

const UPSELL = {
  investor: {
    headline: "More Usage",
    description: "Same reports and tools as Solo, with much more room to run — a higher monthly query limit, more headroom for heavy analysis, and a lower overage rate.",
    features: [
      "Much higher monthly query limit",
      "More usage headroom for heavy analysis",
      "Lower overage rate",
      "25 saved reports",
    ],
  },
  agent: {
    headline: "Agent Tools",
    description: "A custom AI under your own subdomain with your branding, name, and training — invisible to clients.",
    features: [
      "Custom AI name & subdomain",
      "Agent logo & brand color",
      "AI training (text + document upload)",
      "Send to Client button on every report",
      "Unlimited saved reports",
      "White-labeled reports — Vis invisible",
    ],
  },
  brokerage: {
    headline: "Brokerage Plan",
    description: "Manage your whole team under one roof with consolidated billing and brokerage-level AI training.",
    features: [
      "Team management dashboard",
      "Brokerage-level AI training (all agents inherit)",
      "Consolidated billing across agents",
      "Per-agent usage tracking",
      "Priority AI speed",
    ],
  },
};

/* ─── Upgrade modal ─── */
export function UpgradeModal({ requiredTier, user, userRow, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const upsell = UPSELL[requiredTier];
  if (!upsell) return null;

  async function startUpgrade() {
    const priceId = PRICE_IDS[requiredTier];
    if (!priceId) {
      setError("Pricing not configured. Contact support.");
      return;
    }
    if (!user?.id || !user?.email) {
      setError("Please sign in to upgrade.");
      return;
    }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.id, email: user.email, tier: requiredTier }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not start checkout.");
      window.location.href = json.url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "32px 36px", width: "100%", maxWidth: 420, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontFamily: "var(--font-sans)", fontSize: 18, color: "var(--muted)", cursor: "pointer", lineHeight: 1 }}>×</button>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: 20, padding: "4px 12px", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{TIER_LABELS[requiredTier]} · {TIER_PRICES[requiredTier]}/mo</span>
        </div>

        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 20, color: "var(--white)", marginBottom: 8, letterSpacing: "-0.01em" }}>
          {upsell.headline}
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted-soft)", lineHeight: 1.6, marginBottom: 20 }}>
          {upsell.description}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {upsell.features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--accent)", fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)" }}>{f}</span>
            </div>
          ))}
        </div>

        {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626", marginBottom: 12 }}>{error}</div>}

        <button onClick={startUpgrade} disabled={loading}
          style={{ width: "100%", height: 44, borderRadius: 9, background: "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "#fff", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s" }}>
          {loading ? "Redirecting…" : `Upgrade to ${TIER_LABELS[requiredTier]} · ${TIER_PRICES[requiredTier]}/mo`}
        </button>
        <div style={{ marginTop: 10, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
          Cancel anytime · Billed monthly
        </div>
      </div>
    </div>
  );
}

/* ─── Inline locked card (chat / feature areas) ─── */
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SubscriptionGate({ requiredTier, user, userRow, feature }) {
  const [showModal, setShowModal] = useState(false);
  const upsell = UPSELL[requiredTier];
  if (!upsell) return null;

  return (
    <>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 14px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--muted)", flexShrink: 0 }}><LockIcon /></span>
          <div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--muted-soft)" }}>{feature || upsell.headline}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>{TIER_LABELS[requiredTier]} plan</span>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ flexShrink: 0, height: 28, padding: "0 12px", borderRadius: 6, background: "var(--accent-soft)", border: "1px solid var(--accent)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: "var(--accent)", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--accent-soft)"; e.currentTarget.style.color = "var(--accent)"; }}>
          Upgrade →
        </button>
      </div>
      {showModal && <UpgradeModal requiredTier={requiredTier} user={user} userRow={userRow} onClose={() => setShowModal(false)} />}
    </>
  );
}

export default SubscriptionGate;
