// Session 8: action bar at the foot of a report. Buttons are stubbed.
// Session 19 wires share link / PDF export / save.
// Session 20 wires the Send to Client primary CTA.
// Tier check reads vis-tier from localStorage; full feature gating
// system lands in Session 15.

function readTier() {
  try {
    const t = localStorage.getItem("vis-tier");
    if (t === "agent" || t === "enterprise" || t === "buyer") return t;
    return "buyer";
  } catch {
    return "buyer";
  }
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 40,
        padding: "0 16px",
        background: "var(--card)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "color 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--white)";
        e.currentTarget.style.borderColor = "var(--muted)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
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
      style={{
        height: 40,
        padding: "0 20px",
        background: "var(--accent)",
        color: "#ffffff",
        border: "none",
        borderRadius: 8,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        opacity: 1,
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}

function ShareExport({ onShare, onExport, onSave, onSendToClient }) {
  const tier = readTier();
  const canSendToClient = tier === "agent" || tier === "enterprise";

  return (
    <section
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        padding: 16,
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <SecondaryButton onClick={onShare}>Share link</SecondaryButton>
        <SecondaryButton onClick={onExport}>Export PDF</SecondaryButton>
        <SecondaryButton onClick={onSave}>Save</SecondaryButton>
      </div>
      {canSendToClient && (
        <PrimaryButton onClick={onSendToClient}>Send to client</PrimaryButton>
      )}
    </section>
  );
}

export default ShareExport;
