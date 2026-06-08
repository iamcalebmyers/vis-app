import { useState } from "react";
import { useAgent } from "../utils/AgentContext.jsx";

const FIELDS = [
  { key: "agentName", label: "Agent name", placeholder: "Your full name" },
  { key: "brokerage", label: "Brokerage", placeholder: "Brokerage name" },
  { key: "license", label: "License #", placeholder: "License number" },
  { key: "phone", label: "Phone", placeholder: "(555) 000-0000" },
  { key: "email", label: "Email", placeholder: "you@example.com" },
];

const INPUT = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  color: "var(--text)",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: 4,
  padding: "4px 6px",
  outline: "none",
  transition: "border-color 0.15s ease, background 0.15s ease",
};

function AgentContactBlock() {
  const { isAgentDomain, aiName } = useAgent();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState({
    agentName: "",
    brokerage: "",
    license: "",
    phone: "",
    email: "",
  });

  const hasAny = Object.values(fields).some(v => v.trim());

  function set(key, val) {
    setFields(prev => ({ ...prev, [key]: val }));
  }

  if (!open) {
    return (
      <div style={{ marginTop: 20, marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
          Add agent info to report
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, padding: "16px 20px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Agent info
        </div>
        <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>
          Hide
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {label}
            </label>
            <input
              value={fields[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              style={INPUT}
              onFocus={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--card)"; }}
              onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
            />
          </div>
        ))}
      </div>
      {hasAny && (
        <div style={{ marginTop: 12, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)" }}>
          This info will appear on your exported report.
        </div>
      )}
    </div>
  );
}

export default AgentContactBlock;
