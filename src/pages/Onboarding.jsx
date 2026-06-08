import { useState } from "react";
import { supabase } from "../utils/supabase.js";

const TIERS = [
  {
    id: "solo",
    label: "Solo",
    price: "$19",
    priceId: import.meta.env.VITE_STRIPE_PRICE_SOLO,
    features: ["AI chat with web search", "Property & market reports", "Loan calculator", "5 saved reports", "PDF export"],
  },
  {
    id: "investor",
    label: "Investor",
    price: "$49",
    priceId: import.meta.env.VITE_STRIPE_PRICE_INVESTOR,
    features: ["Everything in Solo", "Rental yield & rent comp cards", "ARV / deal analysis", "Cash-on-cash & cap rate calculators", "Multi-property comparison", "25 saved reports"],
  },
  {
    id: "agent",
    label: "Agent",
    price: "$99",
    priceId: import.meta.env.VITE_STRIPE_PRICE_AGENT,
    features: ["Everything in Investor", "Custom AI name & logo", "Your own subdomain (handle.vis.realestate)", "White-labeled reports", "AI training (text + docs)", "Send to Client button", "Unlimited saved reports"],
  },
  {
    id: "brokerage",
    label: "Brokerage",
    price: "$249",
    priceId: import.meta.env.VITE_STRIPE_PRICE_BROKERAGE,
    features: ["Everything in Agent", "Brokerage subdomain", "Team-level AI training baseline", "Agent management dashboard", "Consolidated billing", "Priority AI speed"],
  },
];

const CARD = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "20px",
  cursor: "pointer",
  transition: "border-color 0.15s ease",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

function TierCard({ tier, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(tier.id)}
      style={{
        ...CARD,
        borderColor: selected ? "var(--accent)" : "var(--border)",
        background: selected ? "rgba(var(--accent-rgb, 249,115,22), 0.06)" : "var(--card)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--white)" }}>{tier.label}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--accent)", marginTop: 2 }}>
            {tier.price}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--muted)" }}>/mo</span>
          </div>
        </div>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          border: selected ? "none" : "2px solid var(--border)",
          background: selected ? "var(--accent)" : "transparent",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
        </div>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
        {tier.features.map(f => (
          <li key={f} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "flex-start" }}>
            <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HandleStep({ user, tier, onDone }) {
  const [handle, setHandle] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function checkAndClaim() {
    const cleaned = handle.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleaned) return;
    setChecking(true);
    setError(null);

    const { data } = await supabase.from("handle_registry").select("handle").eq("handle", cleaned).maybeSingle();
    if (data) {
      setError("That handle is already taken. Try another.");
      setChecking(false);
      return;
    }
    setChecking(false);
    setLoading(true);

    try {
      // Provision subdomain via Vercel API (server-side)
      await fetch("/api/claim-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: cleaned, userId: user.id, tier }),
      });
      onDone(cleaned);
    } catch (err) {
      setError("Failed to claim handle. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const cleaned = handle.toLowerCase().replace(/[^a-z0-9-]/g, "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--white)", marginBottom: 6 }}>Claim your subdomain</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          This is the URL your clients will use. Choose carefully — it cannot be changed later.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 0, background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <input
          value={handle}
          onChange={e => { setHandle(e.target.value); setError(null); }}
          placeholder="yourname"
          style={{ flex: 1, padding: "10px 14px", background: "transparent", border: "none", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text)", outline: "none" }}
        />
        <span style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)", borderLeft: "1px solid var(--border)", whiteSpace: "nowrap" }}>
          .vis.realestate
        </span>
      </div>

      {cleaned && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>
          Preview: <span style={{ color: "var(--accent)" }}>{cleaned}.vis.realestate</span>
        </div>
      )}

      {error && (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "8px 12px" }}>
          {error}
        </div>
      )}

      <button
        onClick={checkAndClaim}
        disabled={!cleaned || checking || loading}
        style={{ height: 42, borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, cursor: !cleaned || checking || loading ? "not-allowed" : "pointer", opacity: !cleaned || checking || loading ? 0.6 : 1 }}
      >
        {checking ? "Checking…" : loading ? "Claiming…" : "Claim handle"}
      </button>
    </div>
  );
}

function Onboarding({ user, onComplete }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleContinue() {
    if (!selectedTier) return;
    setLoading(true);
    setError(null);

    const tier = TIERS.find(t => t.id === selectedTier);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: tier.priceId, userId: user.id, email: user.email, tier: tier.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 720 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 36 }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 15 }}>V</span>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 24, color: "var(--white)", letterSpacing: "-0.02em" }}>
            vis<span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-faint)", fontWeight: 400, marginLeft: 2 }}>.realestate</span>
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 22, color: "var(--white)", marginBottom: 8 }}>Choose your plan</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)" }}>Select the plan that fits your needs. You can upgrade anytime.</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 24 }}>
          {TIERS.map(tier => (
            <TierCard key={tier.id} tier={tier} selected={selectedTier === tier.id} onSelect={setSelectedTier} />
          ))}
        </div>

        {error && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "8px 12px", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedTier || loading}
          style={{ width: "100%", height: 46, borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, cursor: !selectedTier || loading ? "not-allowed" : "pointer", opacity: !selectedTier || loading ? 0.6 : 1, transition: "opacity 0.15s ease" }}
        >
          {loading ? "Redirecting to checkout…" : "Continue to payment"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>
          Secured by Stripe · Cancel anytime
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
export { HandleStep };
