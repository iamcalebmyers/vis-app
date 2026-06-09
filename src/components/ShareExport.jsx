import { hasFeature } from "../utils/tier.js";

function readTier() {
  try { return localStorage.getItem("vis-tier") || "solo"; } catch { return "solo"; }
}

function SecondaryButton({ children, onClick, active, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 36,
        padding: "0 14px",
        background: active ? "var(--accent-soft)" : "var(--border-soft)",
        color: active ? "var(--accent)" : "var(--text)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 7,
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "color 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => { if (!disabled && !active) { e.currentTarget.style.color = "var(--white)"; e.currentTarget.style.background = "var(--card)"; } }}
      onMouseLeave={(e) => { if (!disabled && !active) { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--border-soft)"; } }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ height: 36, padding: "0 18px", background: "var(--accent)", color: "#ffffff", border: "none", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: 1, transition: "opacity 0.15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}

function ShareExport({ onShare, onExport, onSave, onSendToClient, userRow, shareLoading, saved, saveError }) {
  const tier = userRow?.tier || readTier();
  const canShare = hasFeature(tier, "investor");
  const canSendToClient = hasFeature(tier, "agent");

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {canShare && (
            <SecondaryButton onClick={onShare} disabled={shareLoading}>
              {shareLoading ? "Generating…" : "Share link"}
            </SecondaryButton>
          )}
          <SecondaryButton onClick={onExport}>Export PDF</SecondaryButton>
          <SecondaryButton onClick={onSave} active={saved}>
            {saved ? "Saved ✓" : "Save report"}
          </SecondaryButton>
        </div>
        {canSendToClient && (
          <PrimaryButton onClick={onSendToClient}>Send to client</PrimaryButton>
        )}
      </div>
      {saveError && (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626" }}>{saveError}</div>
      )}
    </section>
  );
}

export default ShareExport;
