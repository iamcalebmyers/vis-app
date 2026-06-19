import { useState } from "react";

const BTN_PRIMARY = {
  width: "100%", height: 44, borderRadius: 8, background: "var(--accent)",
  border: "none", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700,
  color: "#fff", cursor: "pointer", transition: "opacity 0.15s",
};
const BTN_SECONDARY = {
  width: "100%", height: 40, borderRadius: 8, background: "var(--border-soft)",
  border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13,
  fontWeight: 600, color: "var(--text)", cursor: "pointer", transition: "background 0.15s",
};

function SendToClientModal({ onExportPDF, reportType, onClose }) {
  const [status, setStatus] = useState("idle"); // idle | exporting | done | error

  const label =
    reportType === "market" ? "Market Report"
    : reportType === "investor" ? "Investor Report"
    : "Property Report";

  async function handleDownload() {
    setStatus("exporting");
    try {
      await onExportPDF();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  function handleMailto() {
    const subject = encodeURIComponent(`Your ${label}`);
    const body = encodeURIComponent(
      `Hi,\n\nPlease find your ${label} attached.\n\nLet me know if you have any questions.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  return (
    <div
      className="glass-scrim"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-overlay" style={{ width: 400, maxWidth: "100%", overflow: "hidden" }}>

        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "var(--white)" }}>
            Send to client
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Download the PDF then attach it to an email or text.
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {status === "idle" && (
            <button style={BTN_PRIMARY} onClick={handleDownload}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Download PDF
            </button>
          )}

          {status === "exporting" && (
            <div style={{ ...BTN_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7, cursor: "default" }}>
              Generating PDF…
            </div>
          )}

          {status === "done" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)", borderRadius: 8 }}>
                <span style={{ fontSize: 16 }}>✓</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                  PDF saved to your device
                </span>
              </div>
              <button style={BTN_SECONDARY} onClick={handleMailto}
                onMouseEnter={e => e.currentTarget.style.background = "var(--card)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--border-soft)"}>
                Open email app
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#dc2626", padding: "4px 0" }}>
                PDF generation failed — try again.
              </div>
              <button style={BTN_PRIMARY} onClick={handleDownload}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Retry
              </button>
            </>
          )}
        </div>

        <div style={{ padding: "0 24px 20px" }}>
          <button style={{ ...BTN_SECONDARY, opacity: 0.8 }} onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background = "var(--card)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--border-soft)"}>
            {status === "done" ? "Done" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendToClientModal;
