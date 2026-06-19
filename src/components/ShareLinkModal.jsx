import { useState } from "react";

function ShareLinkModal({ url, onClose }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="glass-scrim"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-overlay" style={{ width: 440, maxWidth: "100%", overflow: "hidden" }}>

        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "var(--white)" }}>
            Share report
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Anyone with this link can view the report.
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {url}
            </div>
            <button
              onClick={handleCopy}
              style={{ flexShrink: 0, height: 30, padding: "0 14px", borderRadius: 6, background: copied ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)", lineHeight: 1.6 }}>
            The link opens a read-only view of this report — no login required.
          </div>
        </div>

        <div style={{ padding: "0 24px 20px" }}>
          <button
            onClick={onClose}
            style={{ width: "100%", height: 40, borderRadius: 8, background: "var(--border-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--card)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--border-soft)"}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareLinkModal;
