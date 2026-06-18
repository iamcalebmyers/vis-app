import { useState } from "react";
import { hasFeature } from "../utils/tier.js";
import { UpgradeModal } from "./SubscriptionGate.jsx";

function readTier() {
  try { return localStorage.getItem("vis-tier") || "solo"; } catch { return "solo"; }
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SecondaryButton({ children, onClick, active, disabled, locked }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        height: 36, padding: "0 14px", display: "flex", alignItems: "center",
        background: locked ? "var(--border-soft)" : active ? "var(--accent-soft)" : (hov ? "var(--card)" : "var(--border-soft)"),
        color: locked ? "var(--muted)" : active ? "var(--accent)" : (hov ? "var(--white)" : "var(--text)"),
        border: `1px solid ${locked ? "var(--border)" : active ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
        cursor: (disabled || locked) ? "pointer" : "pointer",
        opacity: disabled ? 0.6 : 1, transition: "color 0.15s ease, background 0.15s ease",
      }}>
      {locked && <LockIcon />}
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, locked }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        height: 36, padding: "0 18px", display: "flex", alignItems: "center",
        background: locked ? "var(--border-soft)" : (hov ? "rgba(218,107,58,0.85)" : "var(--accent)"),
        color: locked ? "var(--muted)" : "#fff",
        border: locked ? "1px solid var(--border)" : "none",
        borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
        cursor: "pointer", transition: "background 0.15s ease",
      }}>
      {locked && <LockIcon />}
      {children}
    </button>
  );
}

function ShareExport({ onShare, onExport, onSave, onSendToClient, userRow, user, shareLoading, saved, saveError }) {
  const tier = userRow?.tier || readTier();
  const canSendToClient = hasFeature(tier, "agent");

  const [upgradeModal, setUpgradeModal] = useState(null); // "investor" | "agent" | null

  return (
    <>
      <section style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <SecondaryButton onClick={onShare} disabled={shareLoading}>
              {shareLoading ? "Generating…" : "Share link"}
            </SecondaryButton>
            <SecondaryButton onClick={onExport}>Export PDF</SecondaryButton>
            <SecondaryButton onClick={onSave} active={saved}>
              {saved ? "Saved ✓" : "Save report"}
            </SecondaryButton>
          </div>
          {canSendToClient ? (
            <PrimaryButton onClick={onSendToClient}>Send to client</PrimaryButton>
          ) : (
            <PrimaryButton locked onClick={() => setUpgradeModal("agent")}>Send to client</PrimaryButton>
          )}
        </div>
        {saveError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 12px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted-soft)" }}>{saveError}</span>
            <button onClick={() => setUpgradeModal("investor")}
              style={{ flexShrink: 0, height: 26, padding: "0 10px", borderRadius: 6, background: "var(--accent-soft)", border: "1px solid var(--accent)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: "var(--accent)", cursor: "pointer" }}>
              Upgrade →
            </button>
          </div>
        )}
      </section>

      {upgradeModal && (
        <UpgradeModal
          requiredTier={upgradeModal}
          user={user}
          userRow={userRow}
          onClose={() => setUpgradeModal(null)}
        />
      )}
    </>
  );
}

export default ShareExport;
