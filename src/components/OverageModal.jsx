function OverageModal({ onConfirm, onCancel, overageRate }) {
  return (
    <div className="glass-scrim">
      <div className="glass-overlay" style={{ padding: 28, maxWidth: 400, width: "100%" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "var(--white)", marginBottom: 10 }}>
          Usage limit reached
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
          You've used all your included AI queries for this billing period.
          {overageRate ? ` Each additional query is billed at $${overageRate}.` : ""} Continue or upgrade your plan for a higher limit.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel}
            style={{ flex: 1, height: 38, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, height: 38, borderRadius: 8, background: "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
            Continue anyway
          </button>
        </div>
      </div>
    </div>
  );
}

export default OverageModal;
